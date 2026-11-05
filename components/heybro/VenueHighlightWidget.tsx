"use client";

import { Megaphone, Sparkles } from "lucide-react";
import type { VenueVisibility } from "@/lib/venue-highlights";
import { ManagedBadge } from "@/components/heybro/ManagedBadge";
import { VIP_PLAN_NOTE } from "@/lib/venue-template";

export function VenueHighlightWidget({
  visibility,
}: {
  visibility: VenueVisibility;
}) {
  const { isManaged, managedBadge, badges, promo, tier, planLabel } = visibility;
  const listingTier = tier || (isManaged ? "managed" : "free");
  if (listingTier === "free" && badges.length === 0 && !promo) return null;

  return (
    <section
      className="venue-highlight-widget"
      data-slot="highlights"
      aria-label="Visibility highlights"
    >
      {isManaged ? (
        <div className="venue-highlight-managed-row">
          <ManagedBadge variant={managedBadge || "pro"} />
          <span className="venue-highlight-managed-note">
            {planLabel ? `${planLabel} · ` : ""}
            {VIP_PLAN_NOTE}
          </span>
        </div>
      ) : null}

      {badges.length > 0 ? (
        <div className="venue-neon-badges">
          {badges.map((badge) => (
            <span
              key={`${badge.kind}-${badge.label}-${badge.value || ""}`}
              className={`venue-neon-badge tone-${badge.tone || "emerald"} kind-${badge.kind}`}
            >
              <Sparkles className="h-3 w-3" />
              <span>
                {badge.label}
                {badge.value ? <strong> {badge.value}</strong> : null}
              </span>
            </span>
          ))}
        </div>
      ) : null}

      {promo ? (
        <div className="venue-promo-banner">
          <div className="venue-promo-icon">
            <Megaphone className="h-4 w-4" />
          </div>
          <div className="venue-promo-copy">
            <div className="venue-section-label">Promo</div>
            <h2>{promo.title}</h2>
            {promo.body ? <p>{promo.body}</p> : null}
          </div>
          {promo.ctaHref && promo.ctaLabel ? (
            <a
              href={promo.ctaHref}
              className="venue-promo-cta"
              target={promo.ctaHref.startsWith("http") ? "_blank" : undefined}
              rel={
                promo.ctaHref.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
            >
              {promo.ctaLabel}
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
