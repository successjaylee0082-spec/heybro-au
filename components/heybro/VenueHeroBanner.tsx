"use client";

import { Star, ShieldCheck, Sparkles } from "lucide-react";
import { ManagedBadge } from "@/components/heybro/ManagedBadge";
import { Button } from "@/components/ui/button";
import { Bookmark, Phone } from "lucide-react";
import type { VenueVisibility } from "@/lib/venue-highlights";
import { VIP_PLAN_LABEL } from "@/lib/venue-template";

/**
 * Clean OP-style detail hero — dark luxury gradient, rose neon edge,
 * venue name, verified stars, and high-impact hook (no stock lingerie banners).
 */
export function VenueHeroBanner({
  name,
  suburb,
  city,
  category,
  address,
  visibility,
  tagline,
  saved,
  onToggleSave,
  saveLabel,
  phoneHref,
}: {
  name: string;
  suburb: string;
  city: string;
  category: string;
  address: string;
  visibility: VenueVisibility;
  tagline?: string | null;
  saved: boolean;
  onToggleSave: () => void;
  saveLabel: string;
  phoneHref?: string;
}) {
  const tier =
    visibility.tier || (visibility.isManaged ? "managed" : "free");
  const isPremium = tier !== "free";
  const hook = visibility.hook;
  const headline = hook?.title || tagline || `${name} · discreet luxury booking`;
  const subtitle =
    hook?.subtitle ||
    `${category} · ${suburb}, ${city} · confirm tonight's lineup before you call`;

  return (
    <header
      className={
        isPremium
          ? "venue-hero-banner template-hero is-premium"
          : "venue-hero-banner template-hero is-standard"
      }
      data-slot="hero"
    >
      <div className="venue-hero-banner-glow" aria-hidden />
      <div className="venue-hero-banner-inner">
        <div className="venue-hero-kicker">
          {isPremium ? (
            <ManagedBadge
              variant={
                visibility.managedBadge || (tier === "vip" ? "vip" : "pro")
              }
              size="sm"
              showPlan
            />
          ) : (
            <span className="free-listing-chip">Free listing</span>
          )}
          <span className="venue-hero-stars" aria-label="Verified 5 star rating">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="h-3.5 w-3.5"
                fill="currentColor"
                aria-hidden
              />
            ))}
            <em>5.0 Verified</em>
          </span>
          <span className="venue-hero-meta-chip">
            <ShieldCheck className="h-3.5 w-3.5" />
            {category} · {suburb}
          </span>
        </div>

        <h1 className="venue-hero-name">{name}</h1>

        <p className="venue-hero-hook">
          <Sparkles className="h-4 w-4" aria-hidden />
          <span>{headline}</span>
        </p>
        <p className="venue-hero-subtitle">{subtitle}</p>
        <p className="venue-hero-address">
          {city} · {address}
          {isPremium ? ` · ${visibility.planLabel || VIP_PLAN_LABEL}` : null}
        </p>

        <div className="venue-detail-header-actions venue-hero-actions">
          <Button
            type="button"
            variant={saved ? "default" : "secondary"}
            onClick={onToggleSave}
          >
            <Bookmark
              className="h-4 w-4"
              fill={saved ? "currentColor" : "none"}
            />
            {saveLabel}
          </Button>
          {phoneHref ? (
            <a href={phoneHref} className="venue-primary-cta">
              <Phone className="h-4 w-4" />
              Call Now
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
