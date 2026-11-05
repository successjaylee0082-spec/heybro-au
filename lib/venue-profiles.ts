/**
 * Per-venue operational profiles — AUD course rates, payment rails, and
 * amenities shaped like Australian brothel / wellness directory listings
 * (brothels.com.au style 30 / 45 / 60 ladders). Deterministic by venue id.
 */

import type { CategoryId, CityId, Venue } from "@/types";
import type { VenuePriceRow } from "@/lib/venue-content";

export type VenuePaymentChip =
  | "Cash OK"
  | "EFTPOS"
  | "WeChat Pay 微信"
  | "Alipay 支付宝"
  | "UnionPay 云闪付";

export type VenueAmenityChip =
  | "Private Shower"
  | "Discreet Entrance"
  | "Discreet Parking"
  | "Air Conditioned"
  | "Flat Screen TV"
  | "Spa / Jacuzzi"
  | "Theme Rooms"
  | "Meet and Greet Room"
  | "Essentials Provided"
  | "Open 24 Hours"
  | "Individual Waiting Rooms";

export type VenueServiceChip =
  | "Oral"
  | "GFE"
  | "Passionate Kissing"
  | "Body to Body"
  | "Massage"
  | "Nuru"
  | "Greek"
  | "Duo";

export type VenueOperationalProfile = {
  tierLabel: "Standard" | "Premium" | "Diamond" | "VIP Suite";
  pricing: VenuePriceRow[];
  payments: VenuePaymentChip[];
  amenities: VenueAmenityChip[];
  services: VenueServiceChip[];
  /** Short AU-directory style rate line for hooks / badges. */
  rateLine: string;
};

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick<T>(pool: readonly T[], seed: number, offset = 0): T {
  return pool[(seed + offset) % pool.length];
}

function pickMany<T>(
  pool: readonly T[],
  seed: number,
  count: number,
  offset = 0,
): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  for (let step = 0; out.length < count && step < pool.length * 2; step += 1) {
    const index = (seed + offset + step * 3) % pool.length;
    if (used.has(index)) continue;
    used.add(index);
    out.push(pool[index]);
  }
  return out;
}

/** AUD ladders observed across Sydney/Melbourne directory rate cards. */
const RATE_BANDS: Array<{
  label: VenueOperationalProfile["tierLabel"];
  m30: number;
  m45: number;
  m60: number;
}> = [
  { label: "Standard", m30: 120, m45: 160, m60: 200 },
  { label: "Standard", m30: 140, m45: 180, m60: 220 },
  { label: "Premium", m30: 150, m45: 200, m60: 250 },
  { label: "Premium", m30: 160, m45: 210, m60: 260 },
  { label: "Premium", m30: 170, m45: 220, m60: 270 },
  { label: "Diamond", m30: 180, m45: 230, m60: 280 },
  { label: "Diamond", m30: 200, m45: 250, m60: 300 },
  { label: "VIP Suite", m30: 220, m45: 280, m60: 350 },
  { label: "VIP Suite", m30: 210, m45: 245, m60: 290 },
];

const CBD_BUMP = 20;
const MELBOURNE_BUMP = 10;

const PAYMENT_POOLS: VenuePaymentChip[][] = [
  ["Cash OK", "EFTPOS"],
  ["Cash OK", "EFTPOS", "WeChat Pay 微信"],
  ["Cash OK", "EFTPOS", "Alipay 支付宝"],
  ["Cash OK", "EFTPOS", "WeChat Pay 微信", "Alipay 支付宝"],
  ["Cash OK", "EFTPOS", "WeChat Pay 微信", "UnionPay 云闪付"],
  ["EFTPOS", "WeChat Pay 微信", "Alipay 支付宝"],
  ["Cash OK", "WeChat Pay 微信", "Alipay 支付宝"],
];

const AMENITY_POOL: VenueAmenityChip[] = [
  "Private Shower",
  "Discreet Entrance",
  "Discreet Parking",
  "Air Conditioned",
  "Flat Screen TV",
  "Spa / Jacuzzi",
  "Theme Rooms",
  "Meet and Greet Room",
  "Essentials Provided",
  "Open 24 Hours",
  "Individual Waiting Rooms",
];

const SERVICE_POOL: VenueServiceChip[] = [
  "Oral",
  "GFE",
  "Passionate Kissing",
  "Body to Body",
  "Massage",
  "Nuru",
  "Greek",
  "Duo",
];

function money(aud: number): string {
  return `$${aud}`;
}

function courseRows(
  m30: number,
  m45: number,
  m60: number,
  tier: VenueOperationalProfile["tierLabel"],
): VenuePriceRow[] {
  return [
    {
      label: `30 mins · ${tier}`,
      duration: "30 min",
      price: money(m30),
    },
    {
      label: `45 mins · ${tier}`,
      duration: "45 min",
      price: money(m45),
    },
    {
      label: `60 mins · ${tier}`,
      duration: "60 min",
      price: money(m60),
    },
  ];
}

function bandForVenue(options: {
  id: string;
  category: CategoryId;
  city: CityId;
  isCbd?: boolean;
  suburb?: string;
}) {
  const seed = hashSeed(
    `${options.id}:${options.category}:${options.suburb || ""}`,
  );
  let band = RATE_BANDS[seed % RATE_BANDS.length];

  // Escort / massage suites skew slightly higher; strip clubs use cover-style bands.
  if (options.category === "escorts-massage") {
    band = RATE_BANDS[Math.min(RATE_BANDS.length - 1, (seed % 5) + 3)];
  } else if (options.category === "strip-clubs") {
    band = RATE_BANDS[seed % 3];
  } else if (
    options.category === "nightlife-events" ||
    options.category === "adult-retail"
  ) {
    band = RATE_BANDS[seed % 4];
  }

  let bump = 0;
  if (options.isCbd || /cbd|haymarket|circular|chinatown|potts|kings cross/i.test(options.suburb || "")) {
    bump += CBD_BUMP;
  }
  if (options.city === "melbourne") bump += MELBOURNE_BUMP;
  if (options.city === "perth" || options.city === "adelaide") bump -= 10;

  return {
    label: band.label,
    m30: band.m30 + bump,
    m45: band.m45 + bump,
    m60: band.m60 + bump,
    seed,
  };
}

export function buildVenueOperationalProfile(
  venue: Pick<
    Venue,
    "id" | "category" | "city" | "suburb" | "isCbd" | "tags" | "description"
  >,
): VenueOperationalProfile {
  const band = bandForVenue({
    id: venue.id,
    category: venue.category,
    city: venue.city,
    isCbd: venue.isCbd,
    suburb: venue.suburb,
  });
  const seed = band.seed;
  const pricing = courseRows(band.m30, band.m45, band.m60, band.label);

  const payments = [
    ...pick(PAYMENT_POOLS, seed, 1),
  ] as VenuePaymentChip[];

  // CBD / Chinatown-leaning suburbs more often take CN rails.
  if (
    /haymarket|chinatown|hurstville|burwood|eastwood|box hill|boxhill|cabramatta/i.test(
      venue.suburb,
    ) &&
    !payments.includes("WeChat Pay 微信")
  ) {
    payments.push("WeChat Pay 微信");
    if (!payments.includes("Alipay 支付宝") && seed % 2 === 0) {
      payments.push("Alipay 支付宝");
    }
  }

  const amenityCount = 3 + (seed % 3); // 3–5
  const amenities = pickMany(AMENITY_POOL, seed, amenityCount, 2);
  // Always keep at least one discretion cue for brothel / massage categories.
  if (
    (venue.category === "brothels" || venue.category === "escorts-massage") &&
    !amenities.some((item) => /Discreet|Private Shower/i.test(item))
  ) {
    amenities[0] = pick(
      ["Discreet Entrance", "Private Shower", "Discreet Parking"] as const,
      seed,
      4,
    );
  }

  const serviceCount = 3 + (seed % 2); // 3–4
  let services = pickMany(SERVICE_POOL, seed, serviceCount, 5);
  if (venue.category === "escorts-massage" && !services.includes("Massage")) {
    services = ["Massage", ...services.filter((item) => item !== "Massage")].slice(
      0,
      serviceCount,
    ) as VenueServiceChip[];
  }

  // Honour explicit tags from scraped inventory when present.
  const tagHay = `${(venue.tags || []).join(" ")} ${venue.description || ""}`.toLowerCase();
  if (/wechat|微信/.test(tagHay) && !payments.includes("WeChat Pay 微信")) {
    payments.push("WeChat Pay 微信");
  }
  if (/alipay|支付宝/.test(tagHay) && !payments.includes("Alipay 支付宝")) {
    payments.push("Alipay 支付宝");
  }
  if (/eftpos|card/.test(tagHay) && !payments.includes("EFTPOS")) {
    payments.unshift("EFTPOS");
  }
  if (/cash/.test(tagHay) && !payments.includes("Cash OK")) {
    payments.unshift("Cash OK");
  }

  return {
    tierLabel: band.label,
    pricing,
    payments: [...new Set(payments)].slice(0, 4),
    amenities: [...new Set(amenities)].slice(0, 5),
    services: [...new Set(services)].slice(0, 4),
    rateLine: `${money(band.m30)}/30m · ${money(band.m45)}/45m · ${money(band.m60)}/60m`,
  };
}

/** Listing-card payment / feature chips — venue-specific, never a fixed quartet. */
export function listingServiceChips(venue: Venue): string[] {
  const profile = buildVenueOperationalProfile(venue);
  const chips: string[] = [];
  if (venue.isCbd) chips.push("CBD");
  for (const payment of profile.payments) {
    if (payment === "EFTPOS") chips.push("EFTPOS");
    else if (payment === "Cash OK") chips.push("Cash OK");
    else if (payment === "WeChat Pay 微信") chips.push("WeChat 微信");
    else if (payment === "Alipay 支付宝") chips.push("Alipay");
    else if (payment === "UnionPay 云闪付") chips.push("UnionPay");
  }
  if (profile.amenities.includes("Discreet Parking")) chips.push("Parking");
  if (profile.amenities.includes("Private Shower")) chips.push("Shower");
  if (profile.amenities.includes("Open 24 Hours")) chips.push("24 Hours");
  return chips.slice(0, 6);
}
