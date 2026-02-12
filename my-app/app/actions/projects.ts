"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!workspace) {
    throw new Error("Workspace not found")
  }

  const name = formData.get("name") as string
  if (!name?.trim()) {
    throw new Error("Brand name is required")
  }

  const { data: createdProject, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspace.id,
      name: name.trim(),
    })
    .select("id")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard")
  revalidatePath("/projects")
  redirect(`/projects/${createdProject.id}`)
}
