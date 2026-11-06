import { HomeFeed } from "@/components/heybro/HomeFeed";
import {
  getSeedDirectoryVenues,
  melbourneVenues,
  MELBOURNE_VERIFIED_VENUES,
  seedVenues,
} from "@/lib/data";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function safeSeedVenues() {
  try {
    const seeded = getSeedDirectoryVenues();
    if (Array.isArray(seeded) && seeded.length > 0) return seeded;
  } catch {
    // fall through
  }
  if (Array.isArray(MELBOURNE_VERIFIED_VENUES) && MELBOURNE_VERIFIED_VENUES.length) {
    return MELBOURNE_VERIFIED_VENUES;
  }
  // Last resort: empty array still allows HomeFeed's own seed fallback.
  return [];
}

/**
 * Home feed uses Melbourne seed listings (Sydney feed data remains in lib/feed).
 * Locale / seed loading is guarded so a bad cache or empty params cannot 500.
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

    const seed = safeSeedVenues();
    // Touch exports so bundlers keep both melbourne + seed aliases live.
    void melbourneVenues;
    void seedVenues;

    return <HomeFeed venues={seed} source="seed" />;
  } catch (error) {
    console.error("[HomePage] recoverable render failure", error);
    return <HomeFeed venues={safeSeedVenues()} source="seed" />;
  }
}
