import {
  buildVenueOperationalProfile,
  type VenueOperationalProfile,
} from "@/lib/venue-profiles";
import type { CategoryId, CityId } from "@/types";

export type VenuePriceRow = {
  label: string;
  duration: string;
  price: string;
};

export type ParsedVenueContent = {
  overview: string;
  pricing: VenuePriceRow[];
  services: string[];
  amenities: string[];
  payments: string[];
  profile: VenueOperationalProfile;
};

const AMENITY_HINTS = [
  "parking",
  "entrance",
  "shower",
  "air condition",
  "air-conditioned",
  "air conditioned",
  "flat screen",
  "tv",
  "jacuzzi",
  "spa",
  "theme room",
  "waiting room",
  "meet and greet",
  "essentials",
  "renovated",
  "private shower",
  "discreet",
  "open 24",
];

const SERVICE_HINTS = [
  "lesbian",
  "bdsm",
  "greek",
  "oral",
  "kissing",
  "costume",
  "uniform",
  "massage",
  "body slide",
  "spanish",
  "fantasy",
  "out-call",
  "incall",
  "in-call",
  "escort",
];

const KNOWN_AMENITIES = [
  "Discreet Parking",
  "Discreet Entrance",
  "Meet and Greet Room",
  "Jacuzzi and Spa",
  "Theme Rooms",
  "Essentials Provided",
  "Open 24 Hours",
  "Private Shower",
  "Air Conditioned",
  "Flat Screen TV",
  "Individual Waiting Rooms",
];

/** Legacy scrape fallback — prefer buildVenueOperationalProfile ladders. */
const DEFAULT_PRICING: VenuePriceRow[] = [
  { label: "30 mins · Standard", duration: "30 min", price: "$150" },
  { label: "45 mins · Standard", duration: "45 min", price: "$200" },
  { label: "60 mins · Standard", duration: "60 min", price: "$250" },
];

const DEFAULT_SERVICES = [
  "Oral",
  "GFE",
  "Passionate Kissing",
  "Body to Body",
  "Massage",
];

function titleCase(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isAmenity(value: string): boolean {
  const lower = value.toLowerCase();
  return AMENITY_HINTS.some((hint) => lower.includes(hint));
}

function isService(value: string): boolean {
  const lower = value.toLowerCase();
  return SERVICE_HINTS.some((hint) => lower.includes(hint));
}

function stripScrapedNoise(raw: string): string {
  let text = raw.replace(/\r/g, "\n").trim();
  text = text.replace(/^Description\s+/i, "");
  text = text.replace(/You may also like[\s\S]*$/i, "");
  text = text.replace(/Location\s+Write a review[\s\S]*$/i, "");
  text = text.replace(/Write a review[\s\S]*$/i, "");
  return text.trim();
}

function extractKnownAmenities(text: string): string[] {
  const found: string[] = [];
  for (const amenity of KNOWN_AMENITIES) {
    if (new RegExp(amenity.replace(/\s+/g, "\\s+"), "i").test(text)) {
      found.push(amenity);
    }
  }
  // Soft extras commonly mentioned in North Shore listings.
  if (/private shower/i.test(text)) found.push("Private Shower");
  if (/air[- ]?condition/i.test(text)) found.push("Air Conditioned");
  if (/flat[- ]?screen/i.test(text)) found.push("Flat Screen TV");
  if (/waiting rooms?/i.test(text)) found.push("Individual Waiting Rooms");
  return [...new Set(found)];
}

function extractFeaturesBlock(text: string): string {
  const match = text.match(/\bFeatures\b([\s\S]*?)(?=\bLocation\b|$)/i);
  return match?.[1]
    ?.replace(/\bLocation\b[\s\S]*$/i, "")
    .replace(/\bWrite a review\b[\s\S]*$/i, "")
    .trim() || "";
}

function extractPricing(text: string): VenuePriceRow[] {
  const rows: VenuePriceRow[] = [];
  const seen = new Set<string>();

  const labelFor = (duration: string, explicit?: string) => {
    if (explicit) return explicit;
    if (/^20\b/.test(duration)) return "Quick visit";
    if (/^30\b/.test(duration)) return "Standard";
    if (/hr|hour/i.test(duration)) return "Full hour";
    return "Session";
  };

  const push = (price: string, duration: string, label?: string) => {
    const key = `${price}|${duration}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({
      label: labelFor(duration, label),
      duration,
      price: price.startsWith("$") ? price : `$${price}`,
    });
  };

  for (const match of text.matchAll(
    /\$(\d+)\s*\/\s*(\d+)\s*(min|mins|minutes|hr|hrs|hour|hours)\b/gi,
  )) {
    const unit = /hr|hour/i.test(match[3]) ? "hr" : "min";
    push(`$${match[1]}`, `${match[2]} ${unit}`);
  }

  for (const match of text.matchAll(
    /\$(\d+)\s*(?:for|per)\s*(\d+)\s*(min|mins|minutes|hr|hrs|hour|hours)\b/gi,
  )) {
    const unit = /hr|hour/i.test(match[3]) ? "hr" : "min";
    push(`$${match[1]}`, `${match[2]} ${unit}`);
  }

  const ranging = text.match(
    /ranging from\s*\$(\d+)\s*for\s*(\d+)\s*(minutes?|mins?|hours?|hrs?)\s*to\s*(?:just\s*)?\$(\d+)\s*(?:per\s*)?(hour|hr|minutes?|mins?)?/i,
  );
  if (ranging) {
    const startUnit = /hour|hr/i.test(ranging[3]) ? "hr" : "min";
    push(`$${ranging[1]}`, `${ranging[2]} ${startUnit}`, "Quick visit");
    push(`$${ranging[4]}`, "1 hr", "Full hour");
    if (!rows.some((row) => row.duration.startsWith("30"))) {
      push("$100", "30 min", "Standard");
    }
  }

  if (rows.length === 0 && /\$\d+/.test(text) && /min|hour|hr/i.test(text)) {
    return DEFAULT_PRICING;
  }

  if (rows.length >= 2 && !rows.some((row) => /30/.test(row.duration))) {
    // Leave gap-filling to the venue operational profile instead of a fixed $100 stub.
  }

  return rows.sort((a, b) => {
    const mins = (value: string) => {
      const number = Number.parseInt(value, 10);
      if (/hr|hour/i.test(value)) return (number || 1) * 60;
      return number || 0;
    };
    return mins(a.duration) - mins(b.duration);
  });
}

function extractOfferedServices(text: string): string[] {
  const including = text.match(
    /(?:sexual services including|services including|offer(?:ing)?(?: sexual)? services including)\s+([^.]+)\./i,
  );
  const source =
    including?.[1] ||
    text.match(
      /including\s+([^.]*?(?:lesbian|oral|bdsm|greek|kissing|costume)[^.]*?)\./i,
    )?.[1];
  if (!source) return [];
  return source
    .split(/,| and |&/i)
    .flatMap((item) => item.split("/"))
    .map((item) => item.replace(/\bmore\b/gi, "").trim())
    .filter((item) => item.length > 1 && item.length < 40)
    .map(titleCase);
}

function buildOverview(text: string): string {
  let overview = text
    .replace(/\bFeatures\b[\s\S]*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  // Drop a leading contact header only when it is all-caps address / WWW / phone crumbs.
  overview = overview.replace(
    /^(?:[A-Z0-9 ,.'\-/]{8,80}\s+)?(?:WWW\.[A-Z0-9.-]+\s+)?(?:\(?\+?\d[\d\s()+.-]{7,}\)?\s+)?(?=[A-Z][a-z])/,
    "",
  );

  const sentences = overview.match(/[^.!?]+[.!?]+/g) ?? [overview];
  return sentences.slice(0, 3).join(" ").replace(/\s+/g, " ").trim();
}

export function parseVenueContent(options: {
  description?: string | null;
  tags?: string[] | null;
  venueId?: string;
  category?: CategoryId;
  city?: CityId;
  suburb?: string;
  isCbd?: boolean;
}): ParsedVenueContent {
  const raw = options.description?.trim() || "";
  const stripped = stripScrapedNoise(raw);
  const featureBlock = extractFeaturesBlock(stripped);
  const body = stripped.replace(/\bFeatures\b[\s\S]*$/i, "").trim();
  const extractedPricing = extractPricing(body);
  const offered = extractOfferedServices(body);
  const tags = (options.tags ?? []).map((tag) => tag.trim()).filter(Boolean);

  const profile = buildVenueOperationalProfile({
    id: options.venueId || "venue",
    category: options.category || "brothels",
    city: options.city || "sydney",
    suburb: options.suburb || "Sydney",
    isCbd: options.isCbd,
    tags,
    description: body,
  });

  const amenities = [
    ...extractKnownAmenities(`${body}\n${featureBlock}`),
    ...tags.filter(isAmenity),
    ...profile.amenities,
  ];
  const services = [
    ...offered.filter((item) => !isAmenity(item) || isService(item)),
    ...tags.filter(isService),
    ...profile.services,
  ];

  const needsDefaultServices = services.length === 0;

  const uniqueAmenities = [...new Set(amenities.map((item) => item.trim()))]
    .filter(Boolean)
    .slice(0, 6);
  const uniqueServices = [
    ...new Set(
      (needsDefaultServices ? [...services, ...DEFAULT_SERVICES] : services).map(
        titleCase,
      ),
    ),
  ].slice(0, 8);

  // Prefer scraped rates when we extracted a real 30/45/60 ladder; otherwise
  // use the deterministic per-venue AU directory profile (never identical defaults).
  const pricing =
    extractedPricing.length >= 2
      ? extractedPricing
      : profile.pricing.length
        ? profile.pricing
        : DEFAULT_PRICING;

  return syncContentPricing({
    overview: buildOverview(body) || "Details coming soon for this venue.",
    pricing,
    services: uniqueServices,
    amenities: uniqueAmenities,
    payments: profile.payments,
    profile,
  });
}

function durationMinutes(duration: string): number {
  const mins = Number.parseInt(duration, 10);
  if (!Number.isFinite(mins)) return 0;
  if (/hr|hour/i.test(duration)) return mins * 60;
  return mins;
}

function normalizePriceLabel(price: string): string {
  const trimmed = price.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("$") ? trimmed : `$${trimmed.replace(/^\$/, "")}`;
}

/** Canonical course ladder for hero + pricing table (single source of truth). */
export function resolveVenuePricing(
  content: Pick<ParsedVenueContent, "pricing" | "profile">,
): VenuePriceRow[] {
  const source =
    content.pricing?.length >= 2
      ? content.pricing
      : content.profile?.pricing?.length
        ? content.profile.pricing
        : DEFAULT_PRICING;

  return [...source]
    .map((row) => ({
      ...row,
      price: normalizePriceLabel(row.price),
    }))
    .filter((row) => row.price)
    .sort((a, b) => durationMinutes(a.duration) - durationMinutes(b.duration))
    .slice(0, 3);
}

/**
 * Build " $170/30m · $220/45m · $270/60m" from the live pricing array —
 * never from a separate hardcoded rateLine.
 */
export function formatPricingRateLine(pricing: VenuePriceRow[]): string {
  if (!pricing.length) return "";
  return pricing
    .map((row) => {
      const mins =
        durationMinutes(row.duration) || Number.parseInt(row.duration, 10);
      const short = mins
        ? `${mins}m`
        : row.duration.replace(/\s+/g, "");
      return `${row.price}/${short}`;
    })
    .join(" · ");
}

/** Keep profile.rateLine synchronized with content.pricing after any merge. */
export function syncContentPricing(
  content: ParsedVenueContent,
): ParsedVenueContent {
  const pricing = resolveVenuePricing(content);
  const rateLine = formatPricingRateLine(pricing);
  return {
    ...content,
    pricing,
    profile: {
      ...content.profile,
      pricing: pricing.length ? pricing : content.profile.pricing,
      rateLine: rateLine || content.profile.rateLine,
    },
  };
}
