"use client";

import Image from "next/image";
import {
  ArrowRight,
  Building2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CategoryChips } from "@/components/CategoryChips";
import { CommunityDiscovery } from "@/components/heybro/CommunityDiscovery";
import { HeyBroCard } from "@/components/HeyBroCard";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { Button } from "@/components/ui/button";
import { categories, cities } from "@/lib/cities";
import { filterVenues } from "@/lib/feed";
import { HERO_HOOK_BADGES, HERO_NIGHTLIFE_IMAGE } from "@/lib/hero-assets";
import type { CategoryId, CityId, Venue } from "@/types";

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
  const { city, setCity, category, setCategory, query, setQuery } =
    useNavigation();
  const venues =
    source === "supabase"
      ? filterVenues({ venues: directoryVenues, city, category, query })
      : [];
  const live = source === "supabase";

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

      <section className="hero hero-nightlife" aria-label="Hey Bro adult directory hero">
        <div className="hero-photo">
          <Image
            src={HERO_NIGHTLIFE_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="hero-shade" aria-hidden />
        <div className="hero-content">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            {t("heroEyebrow")}
          </div>
          <h1>
            {t("heroTitleBefore")}{" "}
            <span>{t("heroTitleAccent")}</span>
          </h1>
          <p className="hero-description">{t("heroDescription")}</p>

          <div className="hero-hook-badges" aria-label="Quick trust badges">
            {HERO_HOOK_BADGES.map((badge) => (
              <span key={badge.id} className="hero-hook-badge">
                {locale === "zh" ? badge.labelZh : badge.label}
              </span>
            ))}
          </div>

          <form
            className="search-bar"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <label className="search-input">
              <Search className="h-4 w-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchPlaceholder")}
              />
            </label>
            <label className="search-select">
              <MapPin className="h-3.5 w-3.5" />
              <select
                value={city}
                onChange={(event) => setCity(event.target.value as CityId)}
                aria-label="City"
              >
                {cities.map((item) => (
                  <option key={item.id} value={item.id}>
                    {locale === "zh" ? item.labelZh : item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="search-select category-select">
              <Sparkles className="h-3.5 w-3.5" />
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as CategoryId | "all")
                }
                aria-label="Category"
              >
                <option value="all">{locale === "zh" ? "全部" : "All"}</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {locale === "zh" ? item.labelZh : item.label}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" className="search-submit">
              {t("explore")}
            </Button>
          </form>
        </div>
        <div className="hero-location">
          <span>
            <MapPin className="h-3.5 w-3.5" />
          </span>
          AFTER DARK · AU
        </div>
      </section>

      <div className="trust-strip">
        <span>
          <ShieldCheck /> 18+ gated
        </span>
        <span>
          <MapPin /> City filters
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
          <p>{t("resultsHint")}</p>
        </div>
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
        <div className="venue-list">
          {venues.map((venue) => (
            <HeyBroCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}

      <div className="result-notice">
        {live
          ? `Showing ${venues.length} listing${venues.length === 1 ? "" : "s"}`
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
