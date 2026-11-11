import { RedditOrganicLanding } from "@/components/heybro/RedditOrganicLanding";
import Link from "next/link";

/**
 * Day 7 — Reddit organic landing (top fold).
 * Localized directory continues at `/en` (next.config also redirects `/` → `/en`).
 * This module keeps the CBD / pricing / safety fold versioned at `app/page.tsx`.
 */
export default function RootPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-background px-4 py-6 text-foreground sm:px-6">
      <RedditOrganicLanding />
      <div className="mt-4 flex flex-col gap-3 rounded-[18px] border border-neutral-800 bg-neutral-950/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-sm text-neutral-300">
          Continue into the CBD-first Sydney &amp; Melbourne directory with live
          companion lineups and direct booking CTAs.
        </p>
        <Link
          href="/en"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-rose-500/60 bg-rose-950/50 px-4 text-sm font-semibold text-rose-100 touch-manipulation"
        >
          Open directory
        </Link>
      </div>
    </main>
  );
}
