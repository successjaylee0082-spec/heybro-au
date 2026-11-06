/**
 * Day 1 data facade — single source of truth helpers for pricing,
 * Melbourne CBD-first ranking hints, and masked staff portrait pools.
 */

import {
  formatPricingRateLine,
  parseVenueContent,
  resolveVenuePricing,
  syncContentPricing,
  type VenuePriceRow,
} from "@/lib/venue-content";
import {
  isTrustedStaffPortrait,
  portraitForEthnicity,
  STAFF_PORTRAIT_FALLBACKS,
} from "@/lib/staff-image-map";
import {
  buildVenueOperationalProfile,
  type VenueAmenityChip,
  type VenueOperationalProfile,
  type VenuePaymentChip,
} from "@/lib/venue-profiles";
import type { CategoryId, CityId, Venue } from "@/types";

export type { VenuePriceRow };
export {
  formatPricingRateLine,
  resolveVenuePricing,
  syncContentPricing,
  parseVenueContent,
};

/** English-only payment chips for Melbourne verified houses. */
const MELBOURNE_PAYMENTS: Array<
  VenuePaymentChip | "WeChat Pay" | "Alipay"
> = ["Cash OK", "EFTPOS", "WeChat Pay", "Alipay"];

const SEED_COORDS: Record<string, { lat: number; lng: number }> = {
  "melb-1": { lat: -37.8006, lng: 144.964 },
  "melb-2": { lat: -37.8195, lng: 144.9568 },
  "melb-3": { lat: -37.8325, lng: 144.9605 },
  "melb-4": { lat: -37.8045, lng: 144.992 },
  "melb-5": { lat: -37.8865, lng: 145.0245 },
};

const SEED_IMAGES = [
  "/images/directory/04.jpg",
  "/images/directory/10.jpg",
  "/images/directory/11.jpg",
  "/images/directory/12.jpg",
  "/images/directory/05.jpg",
];

export type SeedVenueRecord = {
  id: string;
  name: string;
  city: string;
  citySlug: string;
  category: "brothels" | "escorts-massage" | string;
  address: string;
  suburb: string;
  isCbd: boolean;
  phone: string;
  website: string;
  description: string;
  pricing: Array<{ duration: string; price: number }>;
  tier: "managed_vip" | "standard" | string;
  isVerified: boolean;
  tags: string[];
};

/**
 * Verified Melbourne directory seed — English-only copy for local EN/ZH patrons.
 * Sydney feed rows in lib/feed.ts are intentionally untouched.
 */
export const melbourneVenues: SeedVenueRecord[] = [
  {
    id: "melb-1",
    name: "Manhattan Terrace",
    city: "Melbourne",
    citySlug: "melbourne",
    category: "brothels",
    address: "554-556 Swanston St, Carlton VIC 3053",
    suburb: "Carlton",
    isCbd: true,
    phone: "0478 575 305",
    website: "https://www.manhattanterrace.com.au",
    description:
      "World-class luxury brothel and 24/7 escort agency located conveniently near the Melbourne CBD, offering premier in-call and out-call experiences.",
    pricing: [
      { duration: "30m", price: 160 },
      { duration: "45m", price: 200 },
      { duration: "60m", price: 250 },
    ],
    tier: "managed_vip",
    isVerified: true,
    tags: ["CBD First", "Cash OK", "EFTPOS", "24/7 Available"],
  },
  {
    id: "melb-2",
    name: "Top Of The Town",
    city: "Melbourne",
    citySlug: "melbourne",
    category: "brothels",
    address: "516-518 Flinders St, Melbourne VIC 3000",
    suburb: "Melbourne CBD",
    isCbd: true,
    phone: "(03) 9614 1414",
    website: "https://www.518flinders.com.au",
    description:
      "Premier adult entertainment venue situated near Crown Casino featuring an extensive selection of gorgeous companions and high-end discrete service.",
    pricing: [
      { duration: "30m", price: 170 },
      { duration: "45m", price: 210 },
      { duration: "60m", price: 260 },
    ],
    tier: "managed_vip",
    isVerified: true,
    tags: ["CBD First", "WeChat Pay", "Discrete Entrance", "Premium VIP"],
  },
  {
    id: "melb-3",
    name: "Gotham City House of Sin",
    city: "Melbourne",
    citySlug: "melbourne",
    category: "brothels",
    address: "70-74 Clarke St, South Melbourne VIC 3205",
    suburb: "South Melbourne",
    isCbd: true,
    phone: "(03) 9699 9269",
    website: "https://gotham-city.com.au",
    description:
      "Multi-million dollar luxury bordello complex in South Melbourne, renowned for opulence, stunning companions, and top-tier service.",
    pricing: [
      { duration: "30m", price: 180 },
      { duration: "45m", price: 220 },
      { duration: "60m", price: 280 },
    ],
    tier: "standard",
    isVerified: true,
    tags: ["EFTPOS", "Private Shower", "Luxury Complex"],
  },
  {
    id: "melb-4",
    name: "Club Collingwood (Le Boudoir)",
    city: "Melbourne",
    citySlug: "melbourne",
    category: "brothels",
    address: "81 Rokeby St, Collingwood VIC 3066",
    suburb: "Collingwood",
    isCbd: false,
    phone: "(03) 9415 8055",
    website: "https://www.clubcollingwood.au",
    description:
      "First-class adult entertainment venue only 5 minutes from the CBD, proudly female-operated since 1997 with a focus on privacy and respect.",
    pricing: [
      { duration: "30m", price: 150 },
      { duration: "45m", price: 200 },
      { duration: "60m", price: 240 },
    ],
    tier: "standard",
    isVerified: true,
    tags: ["Cash OK", "Female Operated", "Discreet"],
  },
  {
    id: "melb-5",
    name: "Bambra Studio",
    city: "Melbourne",
    citySlug: "melbourne",
    category: "brothels",
    address: "977 Glen Huntly Rd, Caulfield VIC 3162",
    suburb: "Caulfield",
    isCbd: false,
    phone: "(03) 9563 6221",
    website: "https://www.bambrabrothelmelbourne.com.au",
    description:
      "Six-star gentlemen club featuring elegant marble interiors, a sophisticated atmosphere, and refined companion services.",
    pricing: [
      { duration: "30m", price: 160 },
      { duration: "45m", price: 200 },
      { duration: "60m", price: 250 },
    ],
    tier: "standard",
    isVerified: true,
    tags: ["EFTPOS", "VIP Lounge", "Six-Star"],
  },
];

/** @deprecated Prefer `melbourneVenues` — kept for HomeFeed / venue-list imports. */
export const seedVenues = melbourneVenues;

function normalizeSeedCity(seed: SeedVenueRecord): CityId {
  const slug = (seed.citySlug || seed.city || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  if (slug === "melbourne" || seed.city.toLowerCase() === "melbourne") {
    return "melbourne";
  }
  return "melbourne";
}

function normalizeSeedCategory(value: string): CategoryId {
  const category = value.trim().toLowerCase();
  if (category === "escorts-massage" || category.includes("escort")) {
    return "escorts-massage";
  }
  return "brothels";
}

function seedPricingRows(
  pricing: SeedVenueRecord["pricing"],
): VenuePriceRow[] {
  return pricing.map((row) => {
    const mins = Number.parseInt(row.duration, 10) || 0;
    return {
      label: "Standard",
      duration: mins ? `${mins} mins` : row.duration,
      price: `$${row.price}`,
    };
  });
}

function amenitiesFromTags(tags: string[]): VenueAmenityChip[] {
  const pool: VenueAmenityChip[] = [
    "Discreet Entrance",
    "Private Shower",
    "Air Conditioned",
    "Essentials Provided",
  ];
  const matched = pool.filter((chip) =>
    tags.some((tag) => tag.toLowerCase().includes(chip.toLowerCase().split(" ")[0])),
  );
  return matched.length ? matched : ["Discreet Entrance", "Private Shower"];
}

/** Map a seed record into the directory Venue shape (city id = melbourne). */
export function seedVenueToDirectoryVenue(
  seed: SeedVenueRecord,
  index = 0,
): Venue {
  const pricing = resolveVenuePricing({
    pricing: seedPricingRows(seed.pricing),
    profile: {
      pricing: seedPricingRows(seed.pricing),
    } as VenueOperationalProfile,
  });
  const rateLine = formatPricingRateLine(pricing);
  const isVip = seed.tier === "managed_vip";
  const coords = SEED_COORDS[seed.id];
  const amenities = amenitiesFromTags(seed.tags);
  return {
    id: seed.id,
    name: seed.name,
    city: normalizeSeedCity(seed),
    suburb: seed.suburb,
    category: normalizeSeedCategory(seed.category),
    description: seed.description,
    image: SEED_IMAGES[index % SEED_IMAGES.length],
    tags: Array.from(
      new Set([
        ...seed.tags,
        "Cash OK",
        "EFTPOS",
        "WeChat Pay",
        "Alipay",
        ...amenities,
      ]),
    ),
    // English-only Melbourne listings — no ko/zh display fields.
    nameZh: undefined,
    descriptionZh: undefined,
    suburbZh: undefined,
    tagsZh: undefined,
    phone: seed.phone,
    address: seed.address,
    lat: coords?.lat,
    lng: coords?.lng,
    isCbd: seed.isCbd,
    website: seed.website,
    verified: seed.isVerified,
    fictional: false,
    hours: seed.tags.some((tag) => /24\/?7/i.test(tag))
      ? "Open 24 Hours"
      : "Daily 10am–late",
    pricing,
    rateLine,
    isManaged: true,
    managedBadge: isVip ? "vip" : "pro",
    customHighlights: {
      tier: isVip ? "vip" : "managed",
      managedBadge: isVip ? "vip" : "pro",
    },
    profile: {
      tierLabel: isVip ? "VIP Suite" : "Premium",
      pricing,
      // Cast: Melbourne uses English payment labels (no CJK suffixes).
      payments: MELBOURNE_PAYMENTS as VenuePaymentChip[],
      amenities,
      services: ["GFE", "Massage", "Oral"],
      rateLine,
    },
  };
}

/** Melbourne directory venues derived from `melbourneVenues` (SSOT for feed + fallback). */
export const MELBOURNE_VERIFIED_VENUES: Venue[] = melbourneVenues.map(
  (seed, index) => seedVenueToDirectoryVenue(seed, index),
);

/** Full seed catalog ready for HomeFeed when Supabase has no Melbourne rows. */
export function getSeedDirectoryVenues(): Venue[] {
  return attachPricingToVenues(MELBOURNE_VERIFIED_VENUES);
}

/** Minimum AUD course price from the shared pricing ladder. */
export function minimumCoursePrice(pricing: VenuePriceRow[]): string | null {
  const ladder = [...pricing].sort((a, b) => {
    const mins = (row: VenuePriceRow) => {
      const n = Number.parseInt(row.duration, 10);
      if (/hr|hour/i.test(row.duration)) return (n || 1) * 60;
      return n || 0;
    };
    return mins(a) - mins(b);
  });
  return ladder[0]?.price || null;
}

function asOperationalProfile(
  venue: Venue,
  pricing: VenuePriceRow[],
  rateLine: string,
): VenueOperationalProfile {
  const base = buildVenueOperationalProfile(venue);
  return {
    ...base,
    ...(venue.profile?.payments
      ? { payments: venue.profile.payments as VenueOperationalProfile["payments"] }
      : {}),
    ...(venue.profile?.amenities
      ? {
          amenities: venue.profile
            .amenities as VenueOperationalProfile["amenities"],
        }
      : {}),
    ...(venue.profile?.services
      ? { services: venue.profile.services as VenueOperationalProfile["services"] }
      : {}),
    pricing,
    rateLine,
  };
}

/**
 * Attach `pricing` + `rateLine` onto a venue from the same ladder the
 * detail Rates cards use — never a separate hardcoded banner string.
 */
export function withVenuePricing<T extends Venue>(venue: T): T {
  if (venue.pricing && venue.pricing.length >= 2) {
    const pricing = resolveVenuePricing({
      pricing: venue.pricing,
      profile: asOperationalProfile(venue, venue.pricing, venue.rateLine || ""),
    });
    const rateLine = formatPricingRateLine(pricing);
    return {
      ...venue,
      pricing,
      rateLine,
      profile: asOperationalProfile(venue, pricing, rateLine),
    };
  }

  const content = syncContentPricing(
    parseVenueContent({
      description: venue.description,
      tags: venue.tags,
      venueId: venue.id,
      category: venue.category,
      city: venue.city,
      suburb: venue.suburb,
      isCbd: venue.isCbd,
    }),
  );

  return {
    ...venue,
    pricing: content.pricing,
    rateLine: content.profile.rateLine,
    profile: content.profile,
  };
}

export function attachPricingToVenues<T extends Venue>(venues: T[]): T[] {
  return venues.map((venue) => withVenuePricing(venue));
}

/**
 * High-res masked female portraits with non-repetitive fallbacks.
 * Prefer ethnicity pool, then any unused curated staff path, never interiors.
 */
export function nextMaskedStaffPortrait(options: {
  ethnicity?: string | null;
  seed: string;
  offset?: number;
  used?: Set<string>;
}): string {
  const used = options.used || new Set<string>();
  const primary = portraitForEthnicity(
    options.ethnicity,
    options.seed,
    options.offset || 0,
    used,
  );
  if (isTrustedStaffPortrait(primary) && used.has(primary)) {
    return primary;
  }

  // Cross-bucket unused fallback so long rosters stay unique.
  for (let step = 0; step < STAFF_PORTRAIT_FALLBACKS.length; step += 1) {
    const candidate =
      STAFF_PORTRAIT_FALLBACKS[
        (hashSeed(options.seed) + (options.offset || 0) + step * 5) %
          STAFF_PORTRAIT_FALLBACKS.length
      ];
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }

  used.add(primary);
  return primary;
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Melbourne CBD / King · Little Bourke · Flinders · Southbank priority (0 = top). */
export function melbourneCbdPriority(
  venue: Pick<Venue, "city" | "suburb" | "address" | "tags" | "isCbd">,
): number {
  if (venue.city !== "melbourne") return 50;
  const hay = `${venue.suburb} ${venue.address} ${(venue.tags || []).join(" ")}`.toLowerCase();
  if (
    /king\s*st|little\s*bourke|flinders(\s*st|\s*street| lane)?|swanston|southbank|melbourne\s*cbd|\bcbd\b/.test(
      hay,
    )
  ) {
    return 0;
  }
  if (
    venue.isCbd ||
    /melbourne|docklands|carlton|east melbourne|south melbourne|collingwood/.test(
      hay,
    )
  ) {
    return 1;
  }
  return 2;
}
