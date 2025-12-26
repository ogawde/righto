"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createRightsEntry(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const campaignId = formData.get("campaign_id") as string
  if (!campaignId) {
    throw new Error("Campaign ID is required")
  }

  const influencerHandle = formData.get("influencer_handle") as string
  if (!influencerHandle?.trim()) {
    throw new Error("Influencer handle is required")
  }

  const instagramUrl = formData.get("instagram_url") as string
  if (!instagramUrl?.trim()) {
    throw new Error("Instagram URL is required")
  }

  const contentType = formData.get("content_type") as string
  if (!["REEL", "POST", "STORY"].includes(contentType)) {
    throw new Error("Invalid content type")
  }

  const usageType = formData.get("usage_type") as string
  if (!["BRANDED_CONTENT_AD", "REPURPOSE", "WHITELIST"].includes(usageType)) {
    throw new Error("Invalid usage type")
  }

  const rightsStartDate = formData.get("rights_start_date") as string
  if (!rightsStartDate) {
    throw new Error("Rights start date is required")
  }

  const rightsEndDate = formData.get("rights_end_date") as string
  if (!rightsEndDate) {
    throw new Error("Rights end date is required")
  }

  const startDate = new Date(rightsStartDate)
  const endDate = new Date(rightsEndDate)
  if (endDate < startDate) {
    throw new Error("End date cannot be before start date")
  }

  const { error } = await supabase.from("rights_entries").insert({
    campaign_id: campaignId,
    influencer_handle: influencerHandle.trim(),
    instagram_url: instagramUrl.trim(),
    content_type: contentType,
    usage_type: usageType,
    rights_start_date: rightsStartDate,
    rights_end_date: rightsEndDate,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/campaigns/${campaignId}`, "page")
  return { success: true }
}
