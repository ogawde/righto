import { redirect } from "next/navigation"
import { LogOut } from "lucide-react"
import { SidebarBrandToggle } from "./sidebar-brand-toggle"
import { SidebarNav } from "./sidebar-nav"
import { Button } from "@/components/ui/button"
import {
  Sidebar as AppSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"

async function signOut() {
  "use server"
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function Sidebar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const fullName =
    (user?.user_metadata?.full_name as string) ?? user?.email ?? "User"
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  if (!user) {
    redirect("/login")
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  const { data: projects } = workspace
    ? await supabase
        .from("projects")
        .select("id, name")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: true })
    : { data: [] }

  const projectIds = (projects ?? []).map((project) => project.id)

  const { data: campaigns } = projectIds.length
    ? await supabase
        .from("campaigns")
        .select("id, name, project_id")
        .in("project_id", projectIds)
        .order("created_at", { ascending: true })
    : { data: [] }

  const projectsWithCampaigns = (projects ?? []).map((project) => ({
    id: project.id,
    name: project.name ?? "Untitled Project",
    campaigns: (campaigns ?? [])
      .filter((campaign) => campaign.project_id === project.id)
      .map((campaign) => ({
        id: campaign.id,
        name: campaign.name ?? "Untitled Campaign",
      })),
  }))

  return (
    <AppSidebar collapsible="icon">
      <SidebarHeader className="h-12 justify-center border-b px-2">
        <div className="flex w-full items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <SidebarBrandToggle />
          <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            RightsTrack
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav projects={projectsWithCampaigns} />
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div
            className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium"
            aria-hidden
          >
            {initials || "?"}
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{fullName}</p>
          </div>
        </div>
        <form action={signOut} className="mt-3">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center"
          >
            <LogOut className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
          </Button>
        </form>
      </SidebarFooter>

      <SidebarRail />
    </AppSidebar>
  )
}
