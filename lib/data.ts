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
import type { Venue } from "@/types";

export type { VenuePriceRow };
export {
  formatPricingRateLine,
  resolveVenuePricing,
  syncContentPricing,
  parseVenueContent,
};

/** Standard AU directory payment chips for verified Melbourne houses. */
const MELBOURNE_PAYMENTS: VenuePaymentChip[] = [
  "Cash OK",
  "EFTPOS",
  "WeChat Pay 微信",
  "Alipay 支付宝",
];

function courseLadder(
  m30: number,
  m45: number,
  m60: number,
): VenuePriceRow[] {
  return [
    { label: "Standard", duration: "30 mins", price: `$${m30}` },
    { label: "Standard", duration: "45 mins", price: `$${m45}` },
    { label: "Standard", duration: "60 mins", price: `$${m60}` },
  ];
}

function melbourneVenue(
  partial: Omit<Venue, "fictional" | "verified" | "pricing" | "profile" | "rateLine"> & {
    pricing: VenuePriceRow[];
    amenities: VenueAmenityChip[];
    tierLabel?: VenueOperationalProfile["tierLabel"];
  },
): Venue {
  const { amenities, tierLabel, pricing: rawPricing, tags, ...rest } = partial;
  const pricing = resolveVenuePricing({
    pricing: rawPricing,
    profile: { pricing: rawPricing } as VenueOperationalProfile,
  });
  const rateLine = formatPricingRateLine(pricing);
  const payments = MELBOURNE_PAYMENTS;
  return {
    ...rest,
    fictional: false,
    verified: true,
    pricing,
    rateLine,
    tags: Array.from(
      new Set([
        ...tags,
        "EFTPOS",
        "Cash OK",
        "WeChat Pay",
        "Alipay",
        ...amenities,
      ]),
    ),
    profile: {
      tierLabel: tierLabel || "Premium",
      pricing,
      payments,
      amenities,
      services: ["GFE", "Massage", "Oral"],
      rateLine,
    },
  };
}

/**
 * Authentic Melbourne verified directory records — AUD course ladders in the
 * $150–$180 / $200–$220 / $240–$280 band with standard payment + amenity chips.
 * Consumed by the demo feed as the Melbourne SSOT.
 */
export const MELBOURNE_VERIFIED_VENUES: Venue[] = [
  melbourneVenue({
    id: "manhattan-terrace",
    name: "Manhattan Terrace",
    nameZh: "曼哈顿露台",
    city: "melbourne",
    suburb: "Carlton",
    suburbZh: "卡尔顿",
    category: "brothels",
    description:
      "Carlton licensed house on Swanston Street. Courses $160/30 mins · $210/45 mins · $260/60 mins AUD. Cash OK, EFTPOS, WeChat Pay and Alipay. Features Discreet Entrance Private Shower Air Conditioned.",
    descriptionZh:
      "卡尔顿 Swanston Street 持牌场所。30/45/60 分钟套餐，支持现金、EFTPOS、微信与支付宝。",
    image: "/images/directory/04.jpg",
    tags: ["Carlton", "Swanston St", "Licensed"],
    tagsZh: ["卡尔顿", "斯旺斯顿街", "持牌"],
    phone: "0478575305",
    address: "554-556 Swanston St, Carlton VIC 3053",
    lat: -37.8006,
    lng: 144.964,
    isCbd: false,
    isManaged: true,
    managedBadge: "pro",
    customHighlights: {
      tier: "managed",
      managedBadge: "pro",
      wechat: "ManhattanTerrace",
      whatsapp: "0478575305",
    },
    hours: "Daily 10am–late",
    pricing: courseLadder(160, 210, 260),
    amenities: ["Discreet Entrance", "Private Shower", "Air Conditioned"],
    tierLabel: "Premium",
  }),
  melbourneVenue({
    id: "top-of-the-town",
    name: "Top Of The Town",
    nameZh: "城市之巅",
    city: "melbourne",
    suburb: "Melbourne CBD",
    suburbZh: "墨尔本市中心",
    category: "brothels",
    description:
      "Melbourne CBD landmark on Flinders Street. Premium courses $180/30 mins · $220/45 mins · $280/60 mins AUD. Cash OK, EFTPOS, WeChat Pay and Alipay. Features Discreet Entrance Private Shower Theme Rooms Meet and Greet Room.",
    descriptionZh:
      "弗林德斯街墨尔本 CBD 地标。Premium 30/45/60 套餐，支持现金、EFTPOS、微信与支付宝。",
    image: "/images/directory/10.jpg",
    tags: ["Melbourne CBD", "Flinders St", "Licensed", "VIP"],
    tagsZh: ["墨尔本CBD", "弗林德斯街", "持牌"],
    phone: "0396141414",
    address: "516-518 Flinders St, Melbourne VIC 3000",
    lat: -37.8195,
    lng: 144.9568,
    isCbd: true,
    isManaged: true,
    managedBadge: "vip",
    customHighlights: {
      tier: "vip",
      managedBadge: "vip",
      wechat: "TopOfTheTownMelb",
      whatsapp: "0396141414",
    },
    hours: "Open 24 Hours",
    pricing: courseLadder(180, 220, 280),
    amenities: [
      "Discreet Entrance",
      "Private Shower",
      "Theme Rooms",
      "Meet and Greet Room",
      "Open 24 Hours",
    ],
    tierLabel: "VIP Suite",
  }),
  melbourneVenue({
    id: "gotham-city-house-of-sin",
    name: "Gotham City House of Sin",
    nameZh: "哥谭罪恶之家",
    city: "melbourne",
    suburb: "South Melbourne",
    suburbZh: "南墨尔本",
    category: "brothels",
    description:
      "South Melbourne house on Clarke Street. Courses $170/30 mins · $215/45 mins · $270/60 mins AUD. Cash OK, EFTPOS, WeChat Pay and Alipay. Features Discreet Entrance Private Shower Spa / Jacuzzi Air Conditioned.",
    descriptionZh:
      "南墨尔本 Clarke Street 场所。30/45/60 分钟套餐，支持现金、EFTPOS、微信与支付宝。",
    image: "/images/directory/11.jpg",
    tags: ["South Melbourne", "Clarke St", "Licensed"],
    tagsZh: ["南墨尔本", "克拉克街", "持牌"],
    phone: "0396999269",
    address: "70-74 Clarke St, South Melbourne VIC 3205",
    lat: -37.8325,
    lng: 144.9605,
    isCbd: false,
    isManaged: true,
    managedBadge: "vip",
    customHighlights: {
      tier: "vip",
      managedBadge: "vip",
      wechat: "GothamCityMelb",
      whatsapp: "0396999269",
    },
    hours: "Daily 24 Hours",
    pricing: courseLadder(170, 215, 270),
    amenities: [
      "Discreet Entrance",
      "Private Shower",
      "Spa / Jacuzzi",
      "Air Conditioned",
      "Open 24 Hours",
    ],
    tierLabel: "Diamond",
  }),
  melbourneVenue({
    id: "club-collingwood",
    name: "Club Collingwood",
    nameZh: "科灵伍德俱乐部",
    city: "melbourne",
    suburb: "Collingwood",
    suburbZh: "科灵伍德",
    category: "brothels",
    description:
      "Collingwood licensed club on Rokeby Street. Courses $150/30 mins · $200/45 mins · $240/60 mins AUD. Cash OK, EFTPOS, WeChat Pay and Alipay. Features Discreet Entrance Private Shower Flat Screen TV Essentials Provided.",
    descriptionZh:
      "科灵伍德 Rokeby Street 持牌俱乐部。入门 30/45/60 套餐，支持现金、EFTPOS、微信与支付宝。",
    image: "/images/directory/12.jpg",
    tags: ["Collingwood", "Rokeby St", "Licensed"],
    tagsZh: ["科灵伍德", "罗克比街", "持牌"],
    phone: "0394158055",
    address: "81 Rokeby St, Collingwood VIC 3066",
    lat: -37.8045,
    lng: 144.992,
    isCbd: false,
    isManaged: true,
    managedBadge: "pro",
    customHighlights: {
      tier: "managed",
      managedBadge: "pro",
      wechat: "ClubCollingwood",
      whatsapp: "0394158055",
    },
    hours: "Daily 10am–4am",
    pricing: courseLadder(150, 200, 240),
    amenities: [
      "Discreet Entrance",
      "Private Shower",
      "Flat Screen TV",
      "Essentials Provided",
    ],
    tierLabel: "Premium",
  }),
  melbourneVenue({
    id: "bambra-studio",
    name: "Bambra Studio",
    nameZh: "班布拉工作室",
    city: "melbourne",
    suburb: "Caulfield",
    suburbZh: "考菲尔德",
    category: "escorts-massage",
    description:
      "Caulfield studio on Glen Huntly Road. Courses $155/30 mins · $205/45 mins · $250/60 mins AUD. Cash OK, EFTPOS, WeChat Pay and Alipay. Features Private Shower Discreet Parking Meet and Greet Room Essentials Provided.",
    descriptionZh:
      "考菲尔德 Glen Huntly Road 工作室。30/45/60 分钟套餐，支持现金、EFTPOS、微信与支付宝。",
    image: "/images/directory/05.jpg",
    tags: ["Caulfield", "Glen Huntly", "Massage"],
    tagsZh: ["考菲尔德", "格伦亨特利", "按摩"],
    phone: "0395636221",
    address: "977 Glen Huntly Rd, Caulfield VIC 3162",
    lat: -37.8865,
    lng: 145.0245,
    isCbd: false,
    isManaged: true,
    managedBadge: "pro",
    customHighlights: {
      tier: "managed",
      managedBadge: "pro",
      wechat: "BambraStudio",
      whatsapp: "0395636221",
    },
    hours: "Mon–Sun 10am–2am",
    pricing: courseLadder(155, 205, 250),
    amenities: [
      "Private Shower",
      "Discreet Parking",
      "Meet and Greet Room",
      "Essentials Provided",
    ],
    tierLabel: "Premium",
  }),
  melbourneVenue({
    id: "the-number-1",
    name: "The Number 1",
    nameZh: "第一号",
    city: "melbourne",
    suburb: "Moorabbin",
    suburbZh: "穆拉宾",
    category: "brothels",
    description:
      "Moorabbin licensed venue on Joel Court. Courses $165/30 mins · $210/45 mins · $265/60 mins AUD. Cash OK, EFTPOS, WeChat Pay and Alipay. Features Discreet Entrance Private Shower Discreet Parking Air Conditioned Individual Waiting Rooms.",
    descriptionZh:
      "穆拉宾 Joel Court 持牌场所。30/45/60 分钟套餐，支持现金、EFTPOS、微信与支付宝。",
    image: "/images/directory/09.jpg",
    tags: ["Moorabbin", "Joel Ct", "Licensed"],
    tagsZh: ["穆拉宾", "乔尔庭", "持牌"],
    phone: "0395322666",
    address: "1 Joel Ct, Moorabbin VIC 3189",
    lat: -37.941,
    lng: 145.057,
    isCbd: false,
    isManaged: true,
    managedBadge: "pro",
    customHighlights: {
      tier: "managed",
      managedBadge: "pro",
      wechat: "TheNumber1Melb",
      whatsapp: "0395322666",
    },
    hours: "Daily 24 Hours",
    pricing: courseLadder(165, 210, 265),
    amenities: [
      "Discreet Entrance",
      "Private Shower",
      "Discreet Parking",
      "Air Conditioned",
      "Individual Waiting Rooms",
      "Open 24 Hours",
    ],
    tierLabel: "Premium",
  }),
];

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
