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
      {pending ? "Saving…" : "Create Brand"}
    </Button>
  )
}

export function NewProjectModal() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await createProject(formData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          New Brand
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Brand</DialogTitle>
        </DialogHeader>
        <form
          action={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Brand Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="My Brand"
              required
            />
          </div>
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}
