import Link from "next/link"
import { LayoutDashboard, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-muted/40">
        <div className="border-b p-4">
          <span className="font-bold">RightsTrack</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          <Button asChild variant="ghost" className="w-full justify-start gap-2">
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start gap-2">
            <Link href="/projects">
              <FolderOpen className="size-4" />
              Projects
            </Link>
          </Button>
        </nav>
        <div className="border-t p-4">
          <div className="text-sm text-muted-foreground">User Profile</div>
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
