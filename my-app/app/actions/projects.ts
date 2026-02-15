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

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  if (!projectId) {
    throw new Error("Brand ID is required")
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!workspace) {
    throw new Error("Workspace not found")
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("workspace_id", workspace.id)
    .single()

  if (!project) {
    throw new Error("Brand not found")
  }

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id")
    .eq("project_id", projectId)

  const campaignIds = (campaigns ?? []).map((campaign) => campaign.id)

  if (campaignIds.length) {
    const { error: rightsDeleteError } = await supabase
      .from("rights_entries")
      .delete()
      .in("campaign_id", campaignIds)

    if (rightsDeleteError) {
      throw new Error(rightsDeleteError.message)
    }
  }

  const { error: campaignsDeleteError } = await supabase
    .from("campaigns")
    .delete()
    .eq("project_id", projectId)

  if (campaignsDeleteError) {
    throw new Error(campaignsDeleteError.message)
  }

  const { error: projectDeleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("workspace_id", workspace.id)

  if (projectDeleteError) {
    throw new Error(projectDeleteError.message)
  }

  revalidatePath("/dashboard")
  revalidatePath("/projects")
  revalidatePath("/campaigns")

  return { success: true }
}
