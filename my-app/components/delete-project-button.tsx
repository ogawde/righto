"use client"

import { useRouter } from "next/navigation"
import { deleteProject } from "@/app/actions/projects"
import { DeleteConfirmButton } from "@/components/delete-confirm-button"

type DeleteProjectButtonProps = {
  projectId: string
  projectName: string
  redirectTo?: string
  className?: string
}

export function DeleteProjectButton({
  projectId,
  projectName,
  redirectTo = "/projects",
  className,
}: DeleteProjectButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    await deleteProject(projectId)
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <DeleteConfirmButton
      itemLabel={projectName}
      title="Delete brand?"
      description={`Are you sure you want to delete "${projectName}"? This will also remove all campaigns and rights entries under it.`}
      onConfirm={handleDelete}
      className={className}
    />
  )
}
