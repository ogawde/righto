import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const lastAttemptByIp = new Map<string, number>()
const DEMO_LOGIN_COOLDOWN_MS = 5000

function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown"
  }

  return request.headers.get("x-real-ip") ?? "unknown"
}

export async function POST(request: Request) {
  const isDemoEnabled = process.env.DEMO_LOGIN_ENABLED === "true"

  if (!isDemoEnabled) {
    return NextResponse.json(
      { error: "Demo login is currently disabled." },
      { status: 403 }
    )
  }

  const demoEmail = process.env.DEMO_USER_EMAIL
  const demoPassword = process.env.DEMO_USER_PASSWORD

  if (!demoEmail || !demoPassword) {
    return NextResponse.json(
      { error: "Demo login is not configured on this deployment." },
      { status: 500 }
    )
  }

  const ip = getRequestIp(request)
  const now = Date.now()
  const lastAttempt = lastAttemptByIp.get(ip) ?? 0

  if (now - lastAttempt < DEMO_LOGIN_COOLDOWN_MS) {
    return NextResponse.json(
      { error: "Please wait a few seconds and try demo login again." },
      { status: 429 }
    )
  }

  lastAttemptByIp.set(ip, now)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  })

  if (error) {
    return NextResponse.json(
      { error: "Demo login is temporarily unavailable. Please try again shortly." },
      { status: 401 }
    )
  }

  return NextResponse.json({ ok: true })
}
