import Link from "next/link"
import { redirect } from "next/navigation"
import { LayoutDashboard, FolderOpen, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  return (
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
        <div className="flex items-center gap-3">
          <div
            className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium"
            aria-hidden
          >
            {initials || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{fullName}</p>
          </div>
        </div>
        <form action={signOut} className="mt-3">
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
            <LogOut className="size-4" />
            Log Out
          </Button>
        </form>
      </div>
    </aside>
  )
}
