import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

type RightsEntry = {
  id: string
  influencer_handle: string | null
  content_type: string | null
  usage_type: string | null
  link: string | null
  rights_start_date: string | null
  rights_end_date: string | null
}

function getStatus(endDate: string | null): "active" | "expiring_soon" | "expired" {
  if (!endDate) return "active"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  const in30Days = new Date(today)
  in30Days.setDate(in30Days.getDate() + 30)

  if (end < today) return "expired"
  if (end <= in30Days) return "expiring_soon"
  return "active"
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function StatusBadge({ status }: { status: "active" | "expiring_soon" | "expired" }) {
  if (status === "active") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      >
        Active
      </Badge>
    )
  }
  if (status === "expiring_soon") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400"
      >
        Expiring Soon
      </Badge>
    )
  }
  return <Badge variant="destructive">Expired</Badge>
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: campaignId } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single()

  if (!campaign) {
    notFound()
  }

  const { data: rightsEntries } = await supabase
    .from("rights_entries")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("rights_end_date", { ascending: true })

  const entries = (rightsEntries ?? []) as RightsEntry[]

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in30Days = new Date(today)
  in30Days.setDate(in30Days.getDate() + 30)

  const total = entries.length
  const active = entries.filter((e) => getStatus(e.rights_end_date) === "active").length
  const expiringSoon = entries.filter(
    (e) => getStatus(e.rights_end_date) === "expiring_soon"
  ).length
  const expired = entries.filter((e) => getStatus(e.rights_end_date) === "expired").length

  return (
    <div className="flex flex-col gap-6 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{campaign.name ?? "Campaign"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {campaign.name ?? "Untitled Campaign"}
        </h1>
        <Button asChild size="sm">
          <Link href={`/campaigns/${campaignId}/new`}>Add Rights Entry</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Card className="min-w-[140px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{total}</span>
          </CardContent>
        </Card>
        <Card className="min-w-[140px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{active}</span>
          </CardContent>
        </Card>
        <Card className="min-w-[140px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Expiring Soon (≤ 30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{expiringSoon}</span>
          </CardContent>
        </Card>
        <Card className="min-w-[140px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{expired}</span>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-muted-foreground">No rights entries yet.</p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/campaigns/${campaignId}/new`}>Add Rights Entry</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Influencer Handle</TableHead>
                <TableHead>Content Type</TableHead>
                <TableHead>Usage Type</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const status = getStatus(entry.rights_end_date)
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {entry.influencer_handle ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {entry.content_type ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.usage_type ?? "—"}</TableCell>
                    <TableCell>
                      {entry.link ? (
                        <a
                          href={entry.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate max-w-[120px] inline-block"
                        >
                          {entry.link}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(entry.rights_start_date)}</TableCell>
                    <TableCell>{formatDate(entry.rights_end_date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
