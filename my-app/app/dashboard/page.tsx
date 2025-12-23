import { redirect } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle,
  AlertCircle,
  Folder,
} from "lucide-react"
import { NewProjectModal } from "@/components/new-project-modal"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import Onboarding from "./onboarding"

async function signOut() {
  "use server"
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
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

  if (!workspace) {
    return (
      <div className="relative p-6">
        <form action={signOut} className="absolute right-6 top-6">
          <Button type="submit" variant="ghost" size="sm">
            Sign Out
          </Button>
        </form>
        <Onboarding />
      </div>
    )
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspace.id)

  const projectList = projects ?? []

  return (
    <div className="relative p-6">
      <form action={signOut} className="absolute right-6 top-6">
        <Button type="submit" variant="ghost" size="sm">
          Sign Out
        </Button>
      </form>

      <div className="flex flex-col gap-8 pt-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Rights
              </CardTitle>
              <CheckCircle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Expiring in 30 Days
              </CardTitle>
              <AlertCircle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Expiring in 7 Days
              </CardTitle>
              <AlertCircle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>


        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projects</h2>
          <NewProjectModal />
        </div>


        <div className="rounded-lg border">
          {projectList.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Folder className="size-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                No projects yet. Create your first one.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {projectList.map((project) => (
                <Card key={project.id} className="transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Folder className="size-4 text-muted-foreground" />
                      <CardTitle className="text-base">
                        {project.name ?? "Untitled Project"}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {project.client_brand_name ?? "—"}
                    </CardDescription>
                    <Button asChild variant="outline" size="sm" className="mt-2 w-fit">
                      <Link href={"/projects/" + project.id}>View</Link>
                    </Button>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
