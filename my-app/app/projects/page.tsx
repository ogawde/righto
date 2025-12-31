import { redirect } from "next/navigation"
import Link from "next/link"
import { Folder } from "lucide-react"
import { NewProjectModal } from "@/components/new-project-modal"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function ProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", user.id)
    .single()

  if (!workspace) {
    redirect("/dashboard")
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspace.id)

  const projectList = projects ?? []

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
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
              <Card
                key={project.id}
                className="transition-colors hover:bg-muted/50"
              >
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
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-2 w-fit"
                  >
                    <Link href={"/projects/" + project.id}>View</Link>
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
