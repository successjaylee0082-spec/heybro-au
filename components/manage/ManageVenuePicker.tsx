"use client";

import Link from "next/link";
import { Building2, KeyRound } from "lucide-react";

export type ManageVenueOption = {
  id: string;
  name: string;
  city?: string | null;
  suburb?: string | null;
};

export function ManageVenuePicker({
  locale,
  venues,
}: {
  locale: string;
  venues: ManageVenueOption[];
}) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-300/80">
          Venue Owner Desk
        </p>
        <h1
          className="mt-2 text-4xl text-neutral-50"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {locale === "zh" ? "选择场所管理出勤" : "Choose a venue to manage"}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-neutral-400">
          {locale === "zh"
            ? "打开场所后输入 4 位 PIN，即可更新今晚出勤与照片。"
            : "Open a venue, enter its 4-digit PIN, then update tonight’s roster and photos."}
        </p>
      </div>

      {!venues.length ? (
        <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-950/70 p-8 text-center text-neutral-400">
          No managed venues are configured yet.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {venues.map((venue) => (
            <li key={venue.id}>
              <Link
                href={`/${locale}/manage/${encodeURIComponent(venue.id)}`}
                className="group flex h-full flex-col rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 transition hover:border-rose-400/50 hover:bg-neutral-900/90"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 text-rose-300">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    <KeyRound className="h-3 w-3" />
                    PIN
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-neutral-50 group-hover:text-rose-100">
                  {venue.name}
                </h2>
                <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
                  {[venue.suburb, venue.city].filter(Boolean).join(" · ") ||
                    venue.id}
                </p>
                <p className="mt-4 text-sm text-rose-300/90">
                  {locale === "zh" ? "打开管理台 →" : "Open roster manager →"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
