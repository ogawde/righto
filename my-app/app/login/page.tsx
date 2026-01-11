"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const isDemoLoginEnabled = process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED === "true"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsLoading(false)

    if (signInError) {
      const message =
        signInError.message === "Invalid login credentials"
          ? "Invalid email or password."
          : signInError.message === "Email not confirmed"
            ? "Please confirm your email before signing in."
            : signInError.message
      setError(message)
      return
    }

    router.push("/dashboard")
  }

  async function handleDemoLogin() {
    setError(null)
    setIsDemoLoading(true)

    try {
      const response = await fetch("/api/auth/demo-login", { method: "POST" })
      const payload = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        setError(payload.error ?? "Could not sign in with demo account.")
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Could not sign in with demo account. Please try again.")
    } finally {
      setIsDemoLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign In"}
            </Button>
            {isDemoLoginEnabled && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isDemoLoading || isLoading}
                onClick={handleDemoLogin}
              >
                {isDemoLoading ? "Signing in to demo…" : "Try Demo"}
              </Button>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
