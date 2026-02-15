"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function createCampaign(formData: FormData) {

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  if (!name?.trim()) {
    throw new Error("Campaign name is required")
  }

  const projectId = formData.get("projectId") as string
  if (!projectId) {
    throw new Error("Brand ID is required")
  }

  const { data: createdCampaign, error } = await supabase
    .from("campaigns")
    .insert({
      project_id: projectId,
      name: name.trim(),
    })
    .select("id")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/projects/${projectId}`, "page")
  redirect(`/campaigns/${createdCampaign.id}`)
}

export async function deleteCampaign(campaignId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  if (!campaignId) {
    throw new Error("Campaign ID is required")
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!workspace) {
    throw new Error("Workspace not found")
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, project_id, projects!inner(workspace_id)")
    .eq("id", campaignId)
    .eq("projects.workspace_id", workspace.id)
    .single()

  if (!campaign) {
    throw new Error("Campaign not found")
  }

  const { error: rightsDeleteError } = await supabase
    .from("rights_entries")
    .delete()
    .eq("campaign_id", campaignId)

  if (rightsDeleteError) {
    throw new Error(rightsDeleteError.message)
  }

  const { error: campaignDeleteError } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", campaignId)

  if (campaignDeleteError) {
    throw new Error(campaignDeleteError.message)
  }

  revalidatePath(`/projects/${campaign.project_id}`)
  revalidatePath(`/campaigns/${campaignId}`)
  revalidatePath("/projects")
  revalidatePath("/campaigns")

  return { success: true, projectId: campaign.project_id }
}
