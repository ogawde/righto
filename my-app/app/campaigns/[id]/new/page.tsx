"use client"

import { use, useState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createRightsEntry } from "@/app/actions/rights-entries"

function SubmitButton({
  disabled,
}: {
  disabled?: boolean
}) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? "Saving…" : "Add Rights Entry"}
    </Button>
  )
}

const CONTENT_TYPES = [
  { value: "REEL", label: "Reel" },
  { value: "POST", label: "Post" },
  { value: "STORY", label: "Story" },
] as const

const USAGE_TYPES = [
  { value: "BRANDED_CONTENT_AD", label: "Branded Content Ad" },
  { value: "REPURPOSE", label: "Repurpose" },
  { value: "WHITELIST", label: "Whitelist" },
] as const

export default function AddRightsEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: campaignId } = use(params)
  const router = useRouter()
  const [contentType, setContentType] = useState<string>("")
  const [usageType, setUsageType] = useState<string>("")
  const [influencerHandle, setInfluencerHandle] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  const SYSTEM_PATHS = ["p", "reel", "stories", "tv"]

  function extractUsernameFromUrl(url: string): string | null {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^\/\?]+)/
    )
    if (!match) return null
    const segment = match[1].toLowerCase()
    if (SYSTEM_PATHS.includes(segment)) return null
    return segment
  }

  async function handleSubmit(formData: FormData) {
    formData.set("content_type", contentType)
    formData.set("usage_type", usageType)
    formData.set("influencer_handle", influencerHandle)
    formData.set("rights_start_date", startDate)
    formData.set("rights_end_date", endDate)
    const result = await createRightsEntry(formData)
    if (result?.success) {
      router.push("/campaigns/" + campaignId)
    }
  }

  function handleInstagramUrlChange(value: string) {
    if (value.includes("/reel/")) {
      setContentType("REEL")
    } else if (value.includes("/p/")) {
      setContentType("POST")
    } else if (value.includes("/stories/")) {
      setContentType("STORY")
    }
    const username = extractUsernameFromUrl(value)
    if (username) {
      setInfluencerHandle((prev) =>
        prev ? prev : username.startsWith("@") ? username : "@" + username
      )
    }
  }

  function handleInfluencerHandleBlur() {
    const value = influencerHandle.trim()
    if (value && !value.startsWith("@")) {
      setInfluencerHandle("@" + value)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6">
      <Card className="w-full max-w-[500px]">
        <CardHeader>
          <CardTitle>Add Rights Entry</CardTitle>
          <CardDescription>
            Add a new rights entry for this campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <input type="hidden" name="campaign_id" value={campaignId} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="influencer_handle">Influencer Handle</Label>
              <Input
                id="influencer_handle"
                name="influencer_handle"
                type="text"
                placeholder="@username"
                value={influencerHandle}
                onChange={(e) => setInfluencerHandle(e.target.value)}
                onBlur={handleInfluencerHandleBlur}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                name="instagram_url"
                type="url"
                placeholder="https://www.instagram.com/..."
                required
                onChange={(e) => handleInstagramUrlChange(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="content_type">Content Type</Label>
              <Select
                value={contentType}
                onValueChange={setContentType}
              >
                <SelectTrigger id="content_type" className="w-full">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="usage_type">Usage Type</Label>
              <Select value={usageType} onValueChange={setUsageType}>
                <SelectTrigger id="usage_type" className="w-full">
                  <SelectValue placeholder="Select usage type" />
                </SelectTrigger>
                <SelectContent>
                  {USAGE_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rights_start_date">Rights Start Date</Label>
              <Input
                id="rights_start_date"
                name="rights_start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rights_end_date">Rights End Date</Label>
              <Input
                id="rights_end_date"
                name="rights_end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
              />
            </div>

            <div className="flex gap-2">
              <SubmitButton
                disabled={
                  !contentType ||
                  !usageType ||
                  !influencerHandle ||
                  !startDate ||
                  !endDate ||
                  Boolean(startDate && endDate && endDate < startDate)
                }
              />
              <Button type="button" variant="outline" asChild>
                <Link href={"/campaigns/" + campaignId}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
