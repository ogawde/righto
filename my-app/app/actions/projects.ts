"use server"

import { revalidatePath } from "next/cache"
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
    throw new Error("Project name is required")
  }

  const clientBrandName = (formData.get("client_brand_name") as string) ?? ""

  const { error } = await supabase.from("projects").insert({
    workspace_id: workspace.id,
    name: name.trim(),
    client_brand_name: clientBrandName.trim() || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard")
  return { success: true }
}
