import Link from "next/link";
import { suburbCanonicalPath } from "@/lib/local-seo-shared";
import type { CityId, Venue } from "@/types";

export function SuburbSeoBlock({
  city,
  cityLabel,
  suburbLabel,
  suburbSlug,
  venues,
  activeNowCount,
  related,
}: {
  city: CityId;
  cityLabel: string;
  suburbLabel: string;
  suburbSlug: string;
  venues: Venue[];
  activeNowCount: number;
  related: Array<{ suburb: string; suburbSlug: string; venueCount: number }>;
}) {
  const vipCount = venues.filter(
    (venue) => venue.isManaged || venue.customHighlights?.tier === "vip",
  ).length;

  return (
    <section
      className="suburb-seo-block mt-12 border-t border-neutral-900 pt-10"
      aria-labelledby="suburb-seo-heading"
    >
      <h2
        id="suburb-seo-heading"
        className="text-2xl font-semibold tracking-tight text-neutral-100"
      >
        {suburbLabel} nightlife &amp; wellness venues — live roster guide
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-400">
        Looking for the best places open now in {suburbLabel}, {cityLabel}? Hey
        Bro lists {venues.length} verified venue
        {venues.length === 1 ? "" : "s"} with street-level addresses, 1-tap Google
        Maps transit links, and direct WhatsApp / WeChat contact where VIP
        messaging is enabled. Roster cards highlight ACTIVE NOW companions first
        so you can shortlist before you call.
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-400">
        Tonight&apos;s snapshot for {suburbLabel}: {activeNowCount} ACTIVE NOW
        roster {activeNowCount === 1 ? "slot" : "slots"}
        {vipCount > 0
          ? ` and ${vipCount} Managed VIP / Elite listing${vipCount === 1 ? "" : "s"}`
          : ""}
        . Listings are refreshed from the Hey Bro directory daily — always confirm
        hours and availability with the venue before you travel.
      </p>

      {related.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Nearby {cityLabel} suburbs
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.suburbSlug}>
                <Link
                  href={suburbCanonicalPath(city, item.suburbSlug)}
                  className="text-sm text-rose-200/90 underline-offset-4 hover:underline"
                >
                  {item.suburbSlug === "cbd" ? "CBD" : item.suburb}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-6 text-xs leading-6 text-neutral-600">
        Adults 18+ only. Hey Bro is a directory service — we do not operate the
        venues listed on this page. Canonical local guide:{" "}
        <Link
          href={suburbCanonicalPath(city, suburbSlug)}
          className="underline-offset-2 hover:underline"
        >
          heybro-au.com/{city}/{suburbSlug}
        </Link>
        .
      </p>
    </section>
  );
}
