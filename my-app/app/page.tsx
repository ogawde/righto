import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6">
      <h1 className="text-3xl font-bold">RightsTrack</h1>
      <p className="text-muted-foreground text-center">
        Manage your influencer rights and campaigns in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Sign Up
        </Link>
      </div>
    </div>
  )
}
