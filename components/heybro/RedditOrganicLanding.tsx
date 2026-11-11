import { Lock, MapPin, ShieldCheck, Sparkles, Table2 } from "lucide-react";
import {
  getMelbourneOnboardingVenues,
  getSeedDirectoryVenues,
  resolveActiveRosterCount,
  resolveVenueBadgeStatus,
} from "@/lib/data";
import type { Venue } from "@/types";

const SAFETY_BADGES = [
  {
    id: "verified",
    label: "Verified Elite",
    detail: "Managed VIP listings with confirmed course ladders",
  },
  {
    id: "discreet",
    label: "Discreet Entry",
    detail: "Private arrivals · no lobby exposure",
  },
  {
    id: "safety",
    label: "Safety First",
    detail: "18+ gated · cash & EFTPOS · screened messaging",
  },
  {
    id: "cbd",
    label: "CBD-First Sort",
    detail: "King St · Flinders · Southbank pinned above sprawl",
  },
] as const;

function badgeLabel(status: string): string {
  if (status === "verified_elite") return "Verified Elite";
  if (status === "managed_vip") return "Managed VIP";
  if (status === "enterprise") return "Enterprise";
  return "Basic";
}

function pricingRows(venues: Venue[]) {
  return venues
    .filter((venue) => Array.isArray(venue.pricing) && venue.pricing.length >= 3)
    .slice(0, 5)
    .map((venue) => {
      const byDuration = (needle: RegExp) =>
        venue.pricing?.find((row) => needle.test(row.duration))?.price || "—";
      return {
        id: venue.id,
        name: venue.name,
        suburb: venue.suburb,
        badge: badgeLabel(resolveVenueBadgeStatus(venue)),
        active: resolveActiveRosterCount(venue),
        m30: byDuration(/30/),
        m45: byDuration(/45/),
        m60: byDuration(/60/),
      };
    });
}

/**
 * Day 7 — Reddit organic top fold: CBD-first structure, transparent course
 * pricing, and verified safety / discretion badges above the directory.
 */
export function RedditOrganicLanding() {
  const melbourne = getMelbourneOnboardingVenues();
  const catalog = getSeedDirectoryVenues();
  const cbdVenues = catalog.filter((venue) => venue.isCbd);
  const eliteCount = catalog.filter((venue) => {
    const badge = resolveVenueBadgeStatus(venue);
    return (
      badge === "verified_elite" ||
      badge === "managed_vip" ||
      badge === "enterprise"
    );
  }).length;
  const table = pricingRows(
    melbourne.filter((venue) => venue.isCbd).length
      ? melbourne.filter((venue) => venue.isCbd)
      : melbourne,
  );

  return (
    <section
      className="reddit-organic-landing mb-6 overflow-hidden rounded-[22px] border border-rose-500/35 bg-slate-950/90 shadow-[0_0_40px_rgba(244,63,94,0.12)]"
      aria-label="Reddit organic landing — CBD directory trust fold"
    >
      <div className="border-b border-rose-500/20 bg-gradient-to-r from-rose-950/50 via-slate-950 to-slate-950 px-5 py-5 sm:px-8 sm:py-6">
        <div className="eyebrow text-rose-200/90">
          <span className="eyebrow-dot" />
          Reddit community traffic · CBD-first Australia
        </div>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.35rem)] font-semibold leading-tight text-slate-50">
          Transparent rates. Verified houses. Discreet booking.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          Built for Reddit threads: CBD venues pin first, course ladders stay
          public (30 / 45 / 60 mins), and safety badges stay above the fold —
          so you know who is verified before you call.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-rose-100/90">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-950/40 px-2.5 py-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {cbdVenues.length} CBD listings pinned
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-950/40 px-2.5 py-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {eliteCount} Verified / Managed VIP
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-950/40 px-2.5 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Melbourne onboarding ready
          </span>
        </div>
      </div>

      <div className="grid gap-5 px-5 py-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-rose-200/80">
            <Table2 className="h-3.5 w-3.5" />
            Transparent course pricing (AUD)
          </div>
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/80">
            <table className="min-w-full text-left text-sm text-neutral-200">
              <thead className="border-b border-neutral-800 text-[11px] uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Venue</th>
                  <th className="px-3 py-2.5 font-semibold">Badge</th>
                  <th className="px-3 py-2.5 font-semibold">30m</th>
                  <th className="px-3 py-2.5 font-semibold">45m</th>
                  <th className="px-3 py-2.5 font-semibold">60m</th>
                  <th className="px-3 py-2.5 font-semibold">Active</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-neutral-900/80 last:border-0"
                  >
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-100">{row.name}</div>
                      <div className="text-[11px] text-neutral-500">
                        {row.suburb}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-rose-200/90">{row.badge}</td>
                    <td className="px-3 py-2.5 tabular-nums">{row.m30}</td>
                    <td className="px-3 py-2.5 tabular-nums">{row.m45}</td>
                    <td className="px-3 py-2.5 tabular-nums">{row.m60}</td>
                    <td className="px-3 py-2.5 tabular-nums">{row.active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-rose-200/80">
            <Lock className="h-3.5 w-3.5" />
            Verified safety &amp; discretion
          </div>
          <ul className="grid gap-2.5">
            {SAFETY_BADGES.map((badge) => (
              <li
                key={badge.id}
                className="rounded-xl border border-neutral-800 bg-neutral-950/70 px-3.5 py-3"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <ShieldCheck className="h-4 w-4 text-rose-300" />
                  {badge.label}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                  {badge.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
