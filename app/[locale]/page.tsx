import { HomeFeed } from "@/components/heybro/HomeFeed";
import { RedditOrganicLanding } from "@/components/heybro/RedditOrganicLanding";
import {
  getSeedDirectoryVenues,
  MELBOURNE_VERIFIED_VENUES,
  sydneyVenues,
  venues,
} from "@/lib/data";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function safeCatalog() {
  try {
    const seeded = getSeedDirectoryVenues();
    if (Array.isArray(seeded) && seeded.length > 0) return seeded;
  } catch {
    // fall through
  }
  return [
    ...(Array.isArray(sydneyVenues) ? sydneyVenues : []),
    ...(Array.isArray(MELBOURNE_VERIFIED_VENUES)
      ? MELBOURNE_VERIFIED_VENUES
      : []),
    ...(Array.isArray(venues) ? venues : []),
  ];
}

/**
 * Home feed renders the unified Sydney + Melbourne catalog from lib/data.
 * Day 7 Reddit fold sits above the directory for CBD / pricing / safety trust.
 */
export default async function HomePage({
  params,
}: {
  params?: Promise<{ locale?: string }> | { locale?: string };
}) {
  try {
    const resolved =
      params && typeof (params as Promise<unknown>).then === "function"
        ? await (params as Promise<{ locale?: string }>)
        : ((params as { locale?: string } | undefined) ?? {});
    const locale =
      typeof resolved?.locale === "string" && resolved.locale.trim()
        ? resolved.locale.trim()
        : "en";

    if (!isLocale(locale)) notFound();

    const catalog = safeCatalog() || [];
    return (
      <div className="home-page-shell space-y-4">
        <RedditOrganicLanding />
        <HomeFeed venues={catalog} source="seed" />
      </div>
    );
  } catch (error) {
    console.error("[HomePage] recoverable render failure", error);
    return (
      <div className="home-page-shell space-y-4">
        <RedditOrganicLanding />
        <HomeFeed venues={safeCatalog() || []} source="seed" />
      </div>
    );
  }
}
