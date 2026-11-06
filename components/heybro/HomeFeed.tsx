"use client";

import {
  ArrowRight,
  Building2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";
import { CategoryChips } from "@/components/CategoryChips";
import { Hero } from "@/components/hero";
import { CommunityDiscovery } from "@/components/heybro/CommunityDiscovery";
import { VenueList } from "@/components/venue-list";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { Button } from "@/components/ui/button";
import { useUserLocation } from "@/hooks/useUserLocation";
import { cities } from "@/lib/cities";
import {
  getSeedDirectoryVenues,
  MELBOURNE_VERIFIED_VENUES,
  sydneyVenues,
  venues as unifiedVenues,
} from "@/lib/data";
import { filterVenues } from "@/lib/feed";
import { VENUE_SORT_OPTIONS, type VenueSortMode } from "@/lib/geo";
import type { Venue } from "@/types";

function normalizeToken(value: string | null | undefined): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function safeArray(list: Venue[] | null | undefined): Venue[] {
  return Array.isArray(list) ? list : [];
}

/** Primary catalog — Sydney + Melbourne from lib/data (Supabase bypassed). */
const SEED_CATALOG: Venue[] = (() => {
  try {
    const seeded = getSeedDirectoryVenues();
    if (safeArray(seeded).length) return seeded;
  } catch {
    // ignore
  }
  return [
    ...safeArray(unifiedVenues),
    ...safeArray(sydneyVenues),
    ...safeArray(MELBOURNE_VERIFIED_VENUES),
  ];
})();

export function HomeFeed({
  venues: _ignoredDirectoryVenues,
  source: _ignoredSource,
  error: _ignoredError,
}: {
  venues?: Venue[];
  source?: "supabase" | "seed" | "unavailable";
  error?: string;
} = {}) {
  const { locale, t } = useCopy();
  const { city, setCity, category, setCategory, sort, setSort } =
    useNavigation();
  const { origin } = useUserLocation(sort === "cbd-distance");

  // Instant seed-first list — never waits on Supabase / never starts empty.
  const venues = useMemo(() => {
    try {
      const selectedCity = normalizeToken(city) || "melbourne";
      const selectedCategory = normalizeToken(String(category || "all")) || "all";
      const catalog = safeArray(
        SEED_CATALOG.length > 0 ? SEED_CATALOG : unifiedVenues,
      );

      let next = filterVenues({
        venues: catalog,
        city:
          selectedCity === "melbourne" || selectedCity === "sydney"
            ? selectedCity
            : city,
        category: selectedCategory === "all" ? "all" : category,
        sort,
        origin: sort === "cbd-distance" ? origin : null,
      });

      if (next.length === 0 && selectedCity === "melbourne") {
        next = filterVenues({
          venues: safeArray(MELBOURNE_VERIFIED_VENUES),
          city: "melbourne",
          category: "all",
          sort: "cbd-distance",
        });
      }

      if (next.length === 0 && selectedCity === "sydney") {
        next = filterVenues({
          venues: safeArray(sydneyVenues),
          city: "sydney",
          category: "all",
          sort: "cbd-distance",
        });
      }

      return Array.isArray(next) ? next : catalog;
    } catch (error) {
      console.error("[HomeFeed] filter fallback", error);
      return safeArray(SEED_CATALOG);
    }
  }, [city, category, sort, origin]);

  const cbdCount = (venues || []).filter((venue) => venue.isCbd).length;
  const seedCount = safeArray(SEED_CATALOG).length;

  return (
    <div className="home-feed home-feed-nightlife">
      <div className="city-nav">
        <div className="city-links">
          <MapPin className="h-4 w-4" />
          {cities.map((item) => (
            <button
              key={item.id}
              type="button"
              className={city === item.id ? "selected" : undefined}
              onClick={() => setCity(item.id)}
            >
              {locale === "zh" ? item.labelZh : item.label}
            </button>
          ))}
        </div>
        <div className="aussie-note">
          <ShieldCheck className="h-3.5 w-3.5" />
          Adult nightlife directory
        </div>
      </div>

      <Hero />

      <div className="trust-strip">
        <span>
          <ShieldCheck /> 18+ gated
        </span>
        <span>
          <MapPin /> CBD-first sort
        </span>
        <span>
          <Sparkles /> Verified seed listings ({seedCount})
        </span>
      </div>

      <CommunityDiscovery />
      <CategoryChips />

      <div className="section-heading">
        <div>
          <div className="eyebrow">{t("results")}</div>
          <h2>
            {locale === "zh"
              ? cities.find((item) => item.id === city)?.labelZh
              : cities.find((item) => item.id === city)?.label}
          </h2>
          <p>
            {t("resultsHint")}{" "}
            {locale === "zh"
              ? `CBD优先排序 · ${cbdCount} 个CBD场所置顶。`
              : `Sorted CBD-first · ${cbdCount} CBD venue${cbdCount === 1 ? "" : "s"} pinned.`}
          </p>
        </div>
        <label className="results-sort">
          <span>{locale === "zh" ? "排序" : "Sort"}</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as VenueSortMode)}
            aria-label="Sort venues"
          >
            {VENUE_SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {locale === "zh" ? option.labelZh : option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <VenueList
        venues={venues || []}
        selectedCity={city || "melbourne"}
        selectedCategory={category || "all"}
      />

      <div className="result-notice">
        {`Showing ${(venues || []).length} listing${
          (venues || []).length === 1 ? "" : "s"
        } · ${
          sort === "cbd-distance"
            ? origin
              ? "CBD first, then distance from you"
              : "VIP first, then Melbourne CBD (King / Little Bourke / Flinders / Southbank), then proximity"
            : VENUE_SORT_OPTIONS.find((item) => item.id === sort)?.label
        }`}
      </div>

      <div className="business-banner">
        <div className="banner-icon">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h2>{t("businessTitle")}</h2>
          <p>{t("businessBody")}</p>
        </div>
        <Button type="button" variant="secondary" disabled>
          Coming soon
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
