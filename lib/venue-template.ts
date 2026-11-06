import type {
  CustomHighlights,
  VenueHighlightBadge,
  VenueHookBanner,
  VenueListingTier,
  VenueVisibility,
} from "@/lib/venue-highlights";
import {
  ENTERPRISE_MONTHLY_PRICE,
  planLabelForTier,
  VIP_MONTHLY_PRICE,
} from "@/lib/listing-tier";

export type { VenueListingTier };

export const VIP_PLAN_LABEL = `Managed VIP Elite · ${VIP_MONTHLY_PRICE}`;
export const ENTERPRISE_PLAN_LABEL = `Enterprise Ultimate · ${ENTERPRISE_MONTHLY_PRICE}`;
export const VIP_PLAN_NOTE =
  "Verified elite profile · priority placement · direct booking open";

/** Standardized Canva-style section order for every venue page. */
export const VENUE_TEMPLATE_SLOTS = [
  "hero",
  "hook",
  "quick-info",
  "highlights",
  "staff",
  "pricing",
  "gallery",
  "quality",
  "overview",
  "contact",
  "related",
] as const;

export type VenueTemplateSlot = (typeof VENUE_TEMPLATE_SLOTS)[number];

const DEFAULT_MANAGED_HOOKS: VenueHookBanner[] = [
  {
    title: "Elite Sydney Lineup · Instant 30/45/60min Booking & Verification",
    subtitle: "VERIFIED ELITE · Call / WhatsApp / WeChat booking",
  },
  {
    title: "Elite Melbourne Lineup · Instant 30/45/60min Booking & Verification",
    subtitle: "VIP roster · confirm tonight's course rates",
  },
  {
    title: "Fresh Companions On Shift · Book 30 / 45 / 60 Tonight",
    subtitle: "WeChat / WhatsApp booking · discreet entry",
  },
  {
    title: "Premier CBD Roster · Live Availability & Verified Profiles",
    subtitle: "Agency-managed profile with priority placement",
  },
];

const DEFAULT_FREE_HOOK: VenueHookBanner = {
  title: "Browse tonight's roster · Call to confirm availability",
  subtitle: "Basic listing · upgrade to Managed VIP Elite for promo hooks",
};

const DEFAULT_VIP_BADGES: VenueHighlightBadge[] = [
  {
    kind: "promo",
    label: "VIP Elite",
    value: VIP_PLAN_LABEL,
    tone: "violet",
  },
  { kind: "service", label: "Live Lineup", tone: "emerald" },
  { kind: "event", label: "Priority Placement", tone: "amber" },
];

const DEFAULT_ENTERPRISE_BADGES: VenueHighlightBadge[] = [
  {
    kind: "promo",
    label: "Ultimate",
    value: ENTERPRISE_PLAN_LABEL,
    tone: "violet",
  },
  { kind: "service", label: "Dedicated Concierge", tone: "emerald" },
  { kind: "event", label: "Top Placement", tone: "amber" },
];

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function resolveListingTier(options: {
  isManaged?: boolean | null;
  managedBadge?: "pro" | "vip";
  tier?: VenueListingTier | null;
}): VenueListingTier {
  if (
    options.tier === "free" ||
    options.tier === "managed" ||
    options.tier === "vip" ||
    options.tier === "enterprise"
  ) {
    return options.tier;
  }
  if (!options.isManaged) return "free";
  if (options.managedBadge === "vip") return "vip";
  return "managed";
}

export function defaultHookForVenue(options: {
  venueId: string;
  tier: VenueListingTier;
  custom?: VenueHookBanner | null;
  /** @deprecated Prices render from content.pricing in the hero — not hook copy. */
  rateLine?: string | null;
}): VenueHookBanner {
  void options.rateLine;
  if (options.custom?.title) {
    // Drop embedded $-ladders from custom hooks so hero rateLine stays authoritative.
    const subtitle = options.custom.subtitle
      ?.replace(
        /(?:^|\s·\s)?(?:From\s+)?\$\d+(?:\/\d+\s*(?:m|min|mins|hr|hour)s?)?(?:\s*·\s*\$\d+(?:\/\d+\s*(?:m|min|mins|hr|hour)s?))*/gi,
        "",
      )
      .replace(/\s·\s·/g, " · ")
      .replace(/^\s·\s|\s·\s$/g, "")
      .trim();
    return { title: options.custom.title, subtitle: subtitle || undefined };
  }
  if (options.tier === "free") return DEFAULT_FREE_HOOK;
  if (options.tier === "enterprise") {
    return {
      title:
        "Enterprise Ultimate Lineup · Instant 30/45/60min Booking & Verification",
      subtitle: "Dedicated concierge · top placement · multi-channel booking",
    };
  }
  const index = hashSeed(options.venueId) % DEFAULT_MANAGED_HOOKS.length;
  return DEFAULT_MANAGED_HOOKS[index];
}

export function enrichVisibilityForTemplate(options: {
  venueId: string;
  visibility: VenueVisibility;
  customHighlights?: CustomHighlights | null;
  rateLine?: string | null;
}): VenueVisibility {
  const tier = resolveListingTier({
    isManaged: options.visibility.isManaged,
    managedBadge: options.visibility.managedBadge,
    tier: options.customHighlights?.tier,
  });
  const hook = defaultHookForVenue({
    venueId: options.venueId,
    tier,
    custom: options.visibility.hook || options.customHighlights?.hook || null,
    rateLine: options.rateLine,
  });

  let badges = options.visibility.badges;
  if (tier !== "free" && badges.length < 2) {
    const defaults =
      tier === "enterprise" ? DEFAULT_ENTERPRISE_BADGES : DEFAULT_VIP_BADGES;
    badges = [...badges, ...defaults].slice(0, 6);
  }

  return {
    ...options.visibility,
    isManaged: tier !== "free",
    managedBadge:
      tier === "vip" || tier === "enterprise"
        ? "vip"
        : tier === "managed"
          ? "pro"
          : undefined,
    tier,
    hook,
    badges,
    planLabel: planLabelForTier(tier),
  };
}
