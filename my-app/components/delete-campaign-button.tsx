"use client"

import { useRouter } from "next/navigation"
import { deleteCampaign } from "@/app/actions/campaigns"
import { DeleteConfirmButton } from "@/components/delete-confirm-button"

type DeleteCampaignButtonProps = {
  campaignId: string
  campaignName: string
  redirectTo?: string
  className?: string
}

export function DeleteCampaignButton({
  campaignId,
  campaignName,
  redirectTo = "/projects",
  className,
}: DeleteCampaignButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    const result = await deleteCampaign(campaignId)
    if (redirectTo) {
      router.push(redirectTo)
    } else if (result?.projectId) {
      router.push(`/projects/${result.projectId}`)
    }
    router.refresh()
  }

  return (
    <DeleteConfirmButton
      itemLabel={campaignName}
      title="Delete campaign?"
      description={`Are you sure you want to delete "${campaignName}"? This will also remove its rights entries.`}
      onConfirm={handleDelete}
      className={className}
    />
  )
}
