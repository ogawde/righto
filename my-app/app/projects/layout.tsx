import { Sidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 h-12 shrink-0 border-b bg-background" />
        <main className="min-w-0 flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
