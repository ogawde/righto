import { notFound } from "next/navigation"
import Link from "next/link"
import { Megaphone } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { NewCampaignModal } from "@/components/new-campaign-modal"
import { DeleteProjectButton } from "@/components/delete-project-button"
import { DeleteCampaignButton } from "@/components/delete-campaign-button"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: projectId } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single()

  if (!project) {
    notFound()
  }

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("project_id", projectId)

  const campaignList = campaigns ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name ?? "Brand"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {project.name ?? "Untitled Brand"}
        </h1>
        <div className="flex items-center gap-2">
          <DeleteProjectButton
            projectId={projectId}
            projectName={project.name ?? "Untitled Brand"}
          />
          <NewCampaignModal projectId={projectId} />
        </div>
      </div>

      <div className="rounded-lg border">
        {campaignList.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Megaphone className="size-12 text-muted-foreground" />
            <p className="text-muted-foreground">No campaigns yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaignList.map((campaign) => (
              <Card
                key={campaign.id}
                className="transition-colors hover:bg-muted/50"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Megaphone className="size-4 text-muted-foreground" />
                      <CardTitle className="text-base">
                        <Link
                          href={`/campaigns/${campaign.id}`}
                          className="hover:underline"
                        >
                          {campaign.name ?? "Untitled Campaign"}
                        </Link>
                      </CardTitle>
                    </div>
                    <DeleteCampaignButton
                      campaignId={campaign.id}
                      campaignName={campaign.name ?? "Untitled Campaign"}
                      redirectTo={`/projects/${projectId}`}
                    />
                  </div>
                  <CardDescription>
                    {campaign.description ?? "—"}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
