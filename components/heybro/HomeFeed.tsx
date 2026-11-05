"use client";

import {
  ArrowRight,
  Building2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CategoryChips } from "@/components/CategoryChips";
import { Hero } from "@/components/hero";
import { CommunityDiscovery } from "@/components/heybro/CommunityDiscovery";
import { VenueList } from "@/components/VenueList";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { Button } from "@/components/ui/button";
import { useUserLocation } from "@/hooks/useUserLocation";
import { cities } from "@/lib/cities";
import { filterVenues } from "@/lib/feed";
import { VENUE_SORT_OPTIONS, type VenueSortMode } from "@/lib/geo";
import type { Venue } from "@/types";

export function HomeFeed({
  venues: directoryVenues,
  source,
  error,
}: {
  venues: Venue[];
  source: "supabase" | "unavailable";
  error?: string;
}) {
  const { locale, t } = useCopy();
  const { city, setCity, category, setCategory, query, sort, setSort } =
    useNavigation();
  const { origin } = useUserLocation(sort === "cbd-distance");
  const venues =
    source === "supabase"
      ? filterVenues({
          venues: directoryVenues,
          city,
          category,
          query,
          sort,
          origin: sort === "cbd-distance" ? origin : null,
        })
      : [];
  const live = source === "supabase";
  const cbdCount = venues.filter((venue) => venue.isCbd).length;

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
          <Sparkles /> {live ? "Live inventory" : "Directory offline"}
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
            {live
              ? locale === "zh"
                ? `CBD优先排序 · ${cbdCount} 个CBD场所置顶。`
                : `Sorted CBD-first · ${cbdCount} CBD venue${cbdCount === 1 ? "" : "s"} pinned.`
              : null}
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

      {!live ? (
        <div className="empty-state">
          <Sparkles className="h-8 w-8" />
          <h3>
            {locale === "zh" ? "目录暂时不可用" : "Directory unavailable"}
          </h3>
          <p>
            {locale === "zh"
              ? "请配置 Supabase 环境变量后重新加载 venues 表数据。"
              : "Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to load venues from Supabase."}
          </p>
          {error ? (
            <p className="text-sm opacity-70" style={{ marginTop: 8 }}>
              {error}
            </p>
          ) : null}
        </div>
      ) : venues.length === 0 ? (
        <div className="empty-state">
          <Sparkles className="h-8 w-8" />
          <h3>{t("emptyTitle")}</h3>
          <p>{t("emptyBody")}</p>
          <Button type="button" onClick={() => setCategory("all")}>
            Reset category
          </Button>
        </div>
      ) : (
        <VenueList venues={venues} />
      )}

      <div className="result-notice">
        {live
          ? `Showing ${venues.length} listing${venues.length === 1 ? "" : "s"} · ${
              sort === "cbd-distance"
                ? origin
                  ? "CBD first, then distance from you"
                  : "CBD first, then distance from city centre"
                : VENUE_SORT_OPTIONS.find((item) => item.id === sort)?.label
            }`
          : "Live venue data is not connected"}
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
