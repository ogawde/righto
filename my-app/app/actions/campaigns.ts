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
