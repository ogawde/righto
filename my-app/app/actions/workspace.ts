"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createWorkspace(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const workspaceName = formData.get("name") as string
  if (!workspaceName?.trim()) {
    throw new Error("Workspace name is required")
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({ name: workspaceName.trim(), owner_id: user.id })
    .select("id")
    .single()

  if (workspaceError || !workspace) {
    throw new Error(workspaceError?.message ?? "Failed to create workspace")
  }

  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
  })

  if (memberError) {
    throw new Error(memberError.message)
  }

  revalidatePath("/dashboard")
  return { success: true }
}
