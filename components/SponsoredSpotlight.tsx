"use client";

import { BUSINESS_WHATSAPP_HREF } from "@/lib/booking-links";

export type SuburbSponsor = {
  name: string;
  tagline: string;
  badgeText?: string;
  whatsapp?: string;
  phone?: string;
  websiteUrl?: string;
};

type SponsorProps = {
  suburbName: string;
  sponsor?: SuburbSponsor;
};

const CLAIM_HREF = `${BUSINESS_WHATSAPP_HREF}`;

export default function SponsoredSpotlight({
  suburbName,
  sponsor,
}: SponsorProps) {
  // Unsold suburb — FOMO placeholder for venue owners.
  if (!sponsor) {
    return (
      <div className="mb-6 rounded-xl border border-amber-500/40 bg-gradient-to-r from-zinc-900 via-amber-950/20 to-zinc-900 p-4 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-block rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              ★ {suburbName} Exclusive Spotlight Available
            </span>
            <h3 className="mt-1 text-base font-bold text-white">
              Feature Your Venue Here — #1 Top Placement
            </h3>
            <p className="text-xs text-zinc-400">
              Only 1 exclusive sponsor per suburb. Direct WhatsApp &amp; phone
              leads with 0% commission.
            </p>
          </div>
          <a
            href={CLAIM_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-amber-500 px-4 py-2.5 text-center text-xs font-extrabold text-black transition hover:bg-amber-400"
          >
            Claim This Spot ($199/mo)
          </a>
        </div>
      </div>
    );
  }

  // Paid sponsor contract — live VIP banner.
  return (
    <div className="mb-6 rounded-xl border-2 border-amber-500 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-5 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-500 px-2 py-0.5 text-[11px] font-black uppercase text-black">
              SPONSORED VIP
            </span>
            <span className="text-xs font-medium text-amber-400">
              {sponsor.badgeText || `Top Pick in ${suburbName}`}
            </span>
          </div>
          <h3 className="mt-1.5 text-xl font-extrabold text-white">
            {sponsor.name}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-300">{sponsor.tagline}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={CLAIM_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-black transition hover:bg-emerald-400"
          >
            WhatsApp Direct
          </a>
          {sponsor.phone ? (
            <a
              href={`tel:${sponsor.phone}`}
              className="rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-black transition hover:bg-zinc-200"
            >
              Call Now
            </a>
          ) : null}
          {sponsor.websiteUrl ? (
            <a
              href={sponsor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-amber-500/60 px-4 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-amber-500/10"
            >
              Website
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
