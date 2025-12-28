import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createAdminClient } from "@/lib/supabase/admin"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]
  const in30Days = new Date(today)
  in30Days.setDate(in30Days.getDate() + 30)
  const in30DaysStr = in30Days.toISOString().split("T")[0]

  const { data: entries, error: fetchError } = await supabase
    .from("rights_entries")
    .select(
      `
      id,
      influencer_handle,
      instagram_url,
      rights_end_date,
      alert_30_sent,
      alert_7_sent,
      alert_expired_sent,
      campaigns!inner (
        name,
        projects!inner (
          workspaces!inner (
            owner_id
          )
        )
      )
    `
    )
    .lte("rights_end_date", in30DaysStr)

  if (fetchError) {
    console.error("Failed to fetch rights entries:", fetchError)
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    )
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "RightsTrack <onboarding@resend.dev>"
  let sentCount = 0

  for (const entry of entries ?? []) {
    const raw = entry.campaigns as unknown
    const campaignData = Array.isArray(raw) ? raw[0] : raw
    const projects = campaignData?.projects
    const projectsData = Array.isArray(projects) ? projects[0] : projects
    const workspaces = projectsData?.workspaces
    const workspacesData = Array.isArray(workspaces) ? workspaces[0] : workspaces
    const ownerId = workspacesData?.owner_id as string | undefined
    if (!ownerId) continue

    const { data: user } = await supabase.auth.admin.getUserById(ownerId)
    const email = user?.user?.email
    if (!email) continue

    const endDate = new Date(entry.rights_end_date)
    endDate.setHours(0, 0, 0, 0)
    const daysUntilExpiry = Math.floor(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    const handle = entry.influencer_handle ?? "Unknown"
    const instagramUrl = entry.instagram_url ?? ""
    const campaignName = (campaignData?.name as string) ?? "Unknown Campaign"

    let alertType: "30_days" | "7_days" | "expired" | null = null
    let flagColumn: "alert_30_sent" | "alert_7_sent" | "alert_expired_sent" | null =
      null

    if (daysUntilExpiry === 30 && !entry.alert_30_sent) {
      alertType = "30_days"
      flagColumn = "alert_30_sent"
    } else if (daysUntilExpiry === 7 && !entry.alert_7_sent) {
      alertType = "7_days"
      flagColumn = "alert_7_sent"
    } else if (daysUntilExpiry <= 0 && !entry.alert_expired_sent) {
      alertType = "expired"
      flagColumn = "alert_expired_sent"
    }

    if (!alertType || !flagColumn) continue

    const subject =
      alertType === "expired"
        ? `⚠️ Rights Expired: @${handle}`
        : `⚠️ Rights Expiring: @${handle}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #dc2626;">${subject}</h2>
  <p><strong>Campaign:</strong> ${campaignName}</p>
  <p><strong>Influencer:</strong> @${handle}</p>
  <p><strong>Instagram URL:</strong> <a href="${instagramUrl}">${instagramUrl}</a></p>
  <p><strong>Rights end date:</strong> ${entry.rights_end_date}</p>
  <p style="margin-top: 24px; color: #666; font-size: 14px;">
    ${alertType === "expired" ? "This rights entry has expired." : `This rights entry expires in ${alertType === "30_days" ? "30" : "7"} days.`}
  </p>
</body>
</html>
    `

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject,
      html,
    })

    if (sendError) {
      console.error("Failed to send email:", sendError)
      continue
    }

    await supabase
      .from("rights_entries")
      .update({ [flagColumn]: true })
      .eq("id", entry.id)

    await supabase.from("alert_logs").insert({
      rights_entry_id: entry.id,
      alert_type: alertType,
      recipient_email: email,
    })

    sentCount++
  }

  return NextResponse.json({ success: true, emailsSent: sentCount })
}
