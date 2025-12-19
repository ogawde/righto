import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/server"

async function signOut() {
  "use server"
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

async function createWorkspace(formData: FormData) {
  "use server"
  
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) redirect("/auth/login")

  const name = formData.get("name") as string
  if (!name?.trim()) return

  await supabase
    .from("workspaces")
    .insert({ name: name.trim(), owner_id: user.id })
  redirect("/dashboard")
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", user.id)
    .single()

  return (
    <div className="relative p-6">
      <form
        action={signOut}
        className="absolute right-6 top-6"
      >
        <Button type="submit" variant="ghost" size="sm">
          Sign Out
        </Button>
      </form>

      {!workspace ? (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <Card className="w-full max-w-[400px]">
            <CardHeader>
              <CardTitle>Create your Workspace</CardTitle>
              <CardDescription>
                Give your workspace a name to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createWorkspace} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="My Workspace"
                    required
                  />
                </div>
                <Button type="submit">Create Workspace</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="pt-12">
          <p>Welcome to {workspace.name}</p>
        </div>
      )}
    </div>
  )
}
