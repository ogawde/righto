"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type SidebarBrandToggleProps = {
  className?: string
}

export function SidebarBrandToggle({ className }: SidebarBrandToggleProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
    >
      RT
    </button>
  )
}
