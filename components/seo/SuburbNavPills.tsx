import Link from "next/link";
import {
  type CitySuburbPair,
  suburbCanonicalPath,
} from "@/lib/local-seo-shared";
import type { CityId } from "@/types";

export function SuburbNavPills({
  city,
  suburbs,
  activeSlug,
  title = "Browse suburbs",
}: {
  city: CityId;
  suburbs: CitySuburbPair[];
  activeSlug?: string;
  title?: string;
}) {
  if (!suburbs.length) return null;
  const scoped = suburbs.filter((item) => item.city === city);
  if (!scoped.length) return null;

  return (
    <nav className="suburb-nav-pills" aria-label={`${city} suburb links`}>
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {title}
      </div>
      <ul className="flex flex-wrap gap-2">
        {scoped.map((item) => {
          const href = suburbCanonicalPath(item.city, item.suburbSlug);
          const active = item.suburbSlug === activeSlug;
          return (
            <li key={`${item.city}-${item.suburbSlug}`}>
              <Link
                href={href}
                className={
                  active
                    ? "inline-flex min-h-10 items-center rounded-full border border-rose-500/60 bg-rose-950/40 px-3 py-1.5 text-sm font-medium text-rose-100"
                    : "inline-flex min-h-10 items-center rounded-full border border-neutral-800 bg-neutral-950/70 px-3 py-1.5 text-sm font-medium text-neutral-300 transition hover:border-rose-500/40 hover:text-rose-100"
                }
              >
                {item.suburbSlug === "cbd" ? "CBD" : item.suburb}
                <span className="ml-2 text-[11px] text-neutral-500">
                  {item.venueCount}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
