"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProject } from "@/app/actions/projects"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Create Project"}
    </Button>
  )
}

export function NewProjectModal() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const result = await createProject(formData)
    if (result?.success) {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>
        <form
          action={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="My Project"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="client_brand_name">Client Brand Name</Label>
            <Input
              id="client_brand_name"
              name="client_brand_name"
              type="text"
              placeholder="Acme Inc."
            />
          </div>
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}
