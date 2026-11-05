"use client";

import Image from "next/image";
import { MapPin, Search, Sparkles } from "lucide-react";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { Button } from "@/components/ui/button";
import { categories, cities } from "@/lib/cities";
import { HERO_HOOK_BADGES, HERO_NIGHTLIFE_IMAGE } from "@/lib/hero-assets";
import { VENUE_SORT_OPTIONS, type VenueSortMode } from "@/lib/geo";
import type { CategoryId, CityId } from "@/types";

/**
 * Landing hero — striking female silhouette on a clean dark studio backdrop.
 * No neon party venues or cluttered club plates.
 */
export function Hero() {
  const { locale, t } = useCopy();
  const { city, setCity, category, setCategory, query, setQuery, sort, setSort } =
    useNavigation();

  return (
    <section
      className="hero hero-nightlife relative isolate min-h-[560px] overflow-hidden rounded-[22px] border border-rose-500/30 bg-slate-950 shadow-[0_0_48px_rgba(244,63,94,0.1),inset_0_0_80px_rgba(0,0,0,0.7)] md:min-h-[620px]"
      aria-label="Hey Bro adult directory hero"
    >
      {/* Clean dark studio base */}
      <div className="absolute inset-0 bg-slate-950" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_30%,rgba(244,63,94,0.18),transparent_46%),radial-gradient(ellipse_at_20%_80%,rgba(148,163,184,0.08),transparent_42%)]"
        aria-hidden
      />

      {/* Female silhouette / glamour subject — studio only */}
      <div className="hero-photo absolute inset-0">
        <Image
          src={HERO_NIGHTLIFE_IMAGE}
          alt=""
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-[85%_center] opacity-90 contrast-[1.04] saturate-[1.02] md:object-[88%_center]"
        />
      </div>

      {/* Deep dark luxury overlay — keep left readable, silhouette visible on right */}
      <div
        className="hero-shade pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-900/55 to-slate-950"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent md:w-[62%]"
        aria-hidden
      />

      <div className="hero-content relative z-10 max-w-[820px] px-6 pb-9 pt-12 sm:px-10 sm:pt-14 md:px-11">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          {t("heroEyebrow")}
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.4rem,5vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-slate-50">
          {t("heroTitleBefore")}{" "}
          <span className="bg-gradient-to-r from-rose-300 via-rose-400 to-pink-400 bg-clip-text text-transparent">
            {t("heroTitleAccent")}
          </span>
        </h1>
        <p className="hero-description mt-3 max-w-[540px] text-[13px] leading-relaxed text-slate-300">
          {t("heroDescription")}
        </p>

        <div
          className="hero-hook-badges mt-5 flex flex-wrap gap-2.5"
          aria-label="Quick trust badges"
        >
          {HERO_HOOK_BADGES.map((badge) => (
            <span
              key={badge.id}
              className="hero-hook-badge inline-flex items-center rounded-full border border-rose-500/45 bg-slate-950/75 px-3.5 py-2 text-[11px] font-bold tracking-wide text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.2)] backdrop-blur-md"
            >
              {locale === "zh" ? badge.labelZh : badge.label}
            </span>
          ))}
        </div>

        <form
          className="search-bar mt-6"
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
          <label className="search-select sort-select">
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
          <Button type="submit" className="search-submit">
            {t("explore")}
          </Button>
        </form>
      </div>

      <div className="hero-location absolute bottom-4 right-4 z-10 hidden items-center gap-2 rounded-full border border-rose-500/25 bg-slate-950/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-100/90 backdrop-blur-md sm:flex">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-rose-400" />
          AU · CN
        </span>
        <span className="h-3 w-px bg-rose-500/35" aria-hidden />
        <span>CBD FIRST · PROXIMITY</span>
      </div>
    </section>
  );
}
