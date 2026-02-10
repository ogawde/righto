"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, FolderOpen, LayoutDashboard, Megaphone } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type SidebarCampaign = {
  id: string
  name: string
}

type SidebarProject = {
  id: string
  name: string
  campaigns: SidebarCampaign[]
}

type SidebarNavProps = {
  projects: SidebarProject[]
}

export function SidebarNav({ projects }: SidebarNavProps) {
  const pathname = usePathname()
  const [openProjects, setOpenProjects] = React.useState<Record<string, boolean>>(
    () =>
      projects.reduce<Record<string, boolean>>((acc, project) => {
        acc[project.id] = false
        return acc
      }, {})
  )

  const toggleProject = (projectId: string) => {
    setOpenProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }))
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Dashboard">
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/projects"} tooltip="Projects">
              <Link href="/projects">
                <FolderOpen />
                <span>Projects</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {projects.map((project) => {
            const hasActiveCampaign = project.campaigns.some(
              (campaign) => pathname === `/campaigns/${campaign.id}`
            )
            const isProjectPage = pathname === `/projects/${project.id}`
            const isProjectSectionActive = isProjectPage || hasActiveCampaign

            return (
              <SidebarMenuItem key={project.id}>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleProject(project.id)}
                      aria-label={
                        openProjects[project.id] ? "Collapse campaigns" : "Expand campaigns"
                      }
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        "group-data-[collapsible=icon]:hidden"
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          "size-4 transition-transform",
                          openProjects[project.id] && "rotate-90"
                        )}
                      />
                    </button>
                    <SidebarMenuButton
                      asChild
                      isActive={isProjectSectionActive}
                      tooltip={project.name}
                      className="min-w-0"
                    >
                      <Link href={`/projects/${project.id}`}>
                        <FolderOpen />
                        <span>{project.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </div>

                  <SidebarMenuSub
                    className={cn(
                      !openProjects[project.id] && "hidden",
                      "group-data-[collapsible=icon]:hidden"
                    )}
                  >
                    {project.campaigns.length === 0 ? (
                      <SidebarMenuSubItem>
                        <span className="px-2 text-xs text-muted-foreground">
                          No campaigns yet
                        </span>
                      </SidebarMenuSubItem>
                    ) : (
                      project.campaigns.map((campaign) => (
                        <SidebarMenuSubItem key={campaign.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === `/campaigns/${campaign.id}`}
                            size="md"
                          >
                            <Link href={`/campaigns/${campaign.id}`}>
                              <Megaphone />
                              <span>{campaign.name}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))
                    )}
                  </SidebarMenuSub>
                </div>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
