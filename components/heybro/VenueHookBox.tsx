"use client";

import { Flame, Heart, Sparkles } from "lucide-react";
import type { VenueVisibility } from "@/lib/venue-highlights";
import { VIP_PLAN_LABEL } from "@/lib/venue-template";

/**
 * Standardized OP-style promotional headline / Canva banner.
 * High-engagement marketing hook near the top of every venue template.
 */
export function VenueHookBox({
  visibility,
}: {
  visibility: VenueVisibility;
}) {
  const hook = visibility.hook;
  if (!hook?.title) return null;

  const tier = visibility.tier || (visibility.isManaged ? "managed" : "free");
  const isPremium = tier !== "free";

  return (
    <section
      className={
        isPremium
          ? "venue-hook-box op-hook-banner is-premium"
          : "venue-hook-box op-hook-banner is-standard"
      }
      data-slot="hook"
      aria-label="Promotional hook banner"
    >
      <div className="venue-hook-kicker">
        {isPremium ? (
          <>
            <Flame className="h-3.5 w-3.5" />
            OP Hook Banner · {visibility.planLabel || VIP_PLAN_LABEL}
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            Listing Hook
          </>
        )}
      </div>
      <h2 className="venue-hook-title">
        <Heart className="venue-hook-heart" aria-hidden />
        {hook.title}
      </h2>
      {hook.subtitle ? <p className="venue-hook-subtitle">{hook.subtitle}</p> : null}
    </section>
  );
}
