"use client"

import { useFormStatus } from "react-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createWorkspace } from "@/app/actions/workspace"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create Workspace"}
    </Button>
  )
}

export default function Onboarding() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle>Create your Workspace</CardTitle>
          <CardDescription>
            Give your workspace a name to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              await createWorkspace(formData)
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="My Workspace"
                required
              />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
