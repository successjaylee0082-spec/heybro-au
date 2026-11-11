"use client";

import { useState } from "react";
import { ChevronDown, MessagesSquare } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import { CommunityDiscovery } from "@/components/heybro/CommunityDiscovery";
import { RedditOrganicLanding } from "@/components/heybro/RedditOrganicLanding";
import { RedditLogo } from "@/components/RedditLogo";

const PANEL_ID = "reddit-community-panel";

/**
 * Reddit / community content stays collapsed until the user opts in —
 * keeps the landing page directory-first for a clean first impression.
 * Interactive expand state mounts after hydration to avoid ID mismatches.
 */
export function RedditCommunityPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section
      className="reddit-community-panel mt-8 border-t border-neutral-800/80 pt-6"
      aria-label="Community discussions"
      suppressHydrationWarning
    >
      <ClientOnly
        fallback={
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-left text-sm font-semibold text-neutral-200 touch-manipulation sm:w-auto sm:min-w-[320px]"
            disabled
            aria-expanded={false}
            suppressHydrationWarning
          >
            <span className="inline-flex items-center gap-2">
              <RedditLogo size={16} />
              <MessagesSquare
                className="h-4 w-4 text-rose-300/80"
                aria-hidden
              />
              Community Discussions &amp; Reddit Threads
            </span>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-neutral-400"
              aria-hidden
            />
          </button>
        }
      >
        <button
          type="button"
          className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-left text-sm font-semibold text-neutral-200 touch-manipulation transition hover:border-rose-500/40 hover:text-rose-100 sm:w-auto sm:min-w-[320px]"
          aria-expanded={open}
          aria-controls={PANEL_ID}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="inline-flex items-center gap-2">
            <RedditLogo size={16} />
            <MessagesSquare
              className="h-4 w-4 text-rose-300/80"
              aria-hidden
            />
            Community Discussions &amp; Reddit Threads
          </span>
          <ChevronDown
            className={
              open
                ? "h-4 w-4 shrink-0 rotate-180 text-neutral-400 transition"
                : "h-4 w-4 shrink-0 text-neutral-400 transition"
            }
            aria-hidden
          />
        </button>

        {open ? (
          <div
            id={PANEL_ID}
            className="mt-4 space-y-4"
            data-reddit-community="expanded"
          >
            <CommunityDiscovery />
            <RedditOrganicLanding />
          </div>
        ) : null}
      </ClientOnly>
    </section>
  );
}
