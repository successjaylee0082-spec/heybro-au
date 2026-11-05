import type { ParsedVenueContent } from "@/lib/venue-content";
import type { CustomHighlights } from "@/lib/venue-highlights";
import { VENUE_GALLERY_FALLBACKS } from "@/lib/venue-gallery";
import type { Venue } from "@/types";

export type QuickInfoBadge = {
  id: string;
  kind: "location" | "staff" | "payment" | "facility";
  label: string;
  value?: string;
};

export type StaffRosterMember = {
  id: string;
  name: string;
  age: number;
  image: string;
  styles: string[];
  status: "active" | "soon" | "off";
};

export type QualityScore = {
  id: "cleanliness" | "room" | "privacy";
  label: string;
  score: number;
};

export type VenueConsumerView = {
  quickInfo: QuickInfoBadge[];
  staff: StaffRosterMember[];
  activeStaffCount: number;
  quality: QualityScore[];
  payments: string[];
  areaLabel: string;
  telegramHref?: string;
  smsHref?: string;
};

const STYLE_POOL = [
  ["Sexy", "Slim"],
  ["Cute", "Busty"],
  ["Elegant", "Tall"],
  ["Playful", "Fit"],
  ["Glam", "Petite"],
  ["Sweet", "Curvy"],
];

const NAME_POOL = [
  "Mia",
  "Sofia",
  "Luna",
  "Ava",
  "Chloe",
  "Isla",
  "Ruby",
  "Nina",
  "Zoe",
  "Ella",
  "Grace",
  "Lily",
];

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function titleArea(suburb: string, city: string): string {
  const lower = suburb.toLowerCase();
  if (/pymble|chatswood|lindfield|gordon|turramurra|wahroonga/.test(lower)) {
    return "North Shore";
  }
  if (/potts point|kings cross|darlinghurst|surry/.test(lower)) {
    return "Inner East";
  }
  if (/wetherill|liverpool|fairfield|cabramatta/.test(lower)) {
    return "Western Sydney";
  }
  if (/campbelltown|narellan|banksia/.test(lower)) return "South West";
  return suburb || city;
}

function detectPayments(text: string, tags: string[]): string[] {
  const hay = `${text} ${tags.join(" ")}`.toLowerCase();
  const payments: string[] = [];
  if (/eftpos|card|visa|mastercard|credit/.test(hay)) {
    payments.push("EFTPOS / Card OK");
  }
  if (/cash/.test(hay) || payments.length === 0) {
    payments.push("Cash OK");
  }
  if (/afterpay|zip/.test(hay)) payments.push("Afterpay");
  return [...new Set(payments)].slice(0, 3);
}

function facilityBadges(amenities: string[]): string[] {
  const wanted = [
    { match: /shower/i, label: "Private Shower" },
    { match: /entrance|discreet/i, label: "Discreet Entry" },
    { match: /park/i, label: "Parking" },
    { match: /spa|jacuzzi/i, label: "Spa" },
    { match: /air/i, label: "Air Con" },
  ];
  const out: string[] = [];
  for (const item of wanted) {
    if (amenities.some((amenity) => item.match.test(amenity))) {
      out.push(item.label);
    }
  }
  return out.slice(0, 3);
}

function cleanStaffName(raw: string | null | undefined, index: number, seed: string): string {
  const value = (raw || "").trim();
  if (
    value &&
    !/ad\b|slider|desktop|mobile|escort sydney|my girls|cuties/i.test(value) &&
    value.length < 28
  ) {
    return value;
  }
  return NAME_POOL[(hashSeed(seed) + index) % NAME_POOL.length];
}

export function buildStaffRoster(options: {
  venueId: string;
  staffRows?: Array<{ id?: string; name?: string | null; image_url?: string | null }>;
  gallery?: string[];
  managed?: boolean;
}): StaffRosterMember[] {
  const rows = options.staffRows ?? [];
  const portraits = (options.gallery || []).filter((url) =>
    /unsplash|portrait|face|woman|girl|model/i.test(url) || url.includes("photo-"),
  );
  const fallbackImages = [
    ...rows.map((row) => row.image_url || "").filter(Boolean),
    ...portraits,
    ...VENUE_GALLERY_FALLBACKS.slice(4),
  ];

  const target = Math.max(rows.length, options.managed ? 5 : Math.min(4, fallbackImages.length || 3));
  const count = Math.min(Math.max(target, rows.length || 3), 8);
  const members: StaffRosterMember[] = [];

  for (let index = 0; index < count; index += 1) {
    const row = rows[index];
    const seed = `${options.venueId}:${row?.id || index}`;
    const styles = STYLE_POOL[(hashSeed(seed) + index) % STYLE_POOL.length];
    const age = 21 + ((hashSeed(seed) >> 3) % 8);
    const status: StaffRosterMember["status"] =
      index < Math.ceil(count * 0.6) ? "active" : index < count - 1 ? "soon" : "off";
    members.push({
      id: row?.id || `${options.venueId}-staff-${index}`,
      name: cleanStaffName(row?.name, index, seed),
      age,
      image:
        row?.image_url ||
        fallbackImages[index % Math.max(fallbackImages.length, 1)] ||
        VENUE_GALLERY_FALLBACKS[4 + (index % 4)],
      styles,
      status,
    });
  }
  return members;
}

export function buildQualityScores(options: {
  content: ParsedVenueContent;
  venue: Venue;
}): QualityScore[] {
  const custom = options.venue.customHighlights as CustomHighlights | undefined;
  const stored = (custom as { quality?: Partial<Record<string, number>> } | undefined)?.quality;
  const amenities = options.content.amenities.join(" ").toLowerCase();
  const managedBoost = options.venue.isManaged ? 0.5 : 0;

  const clamp = (value: number) => Math.max(3, Math.min(5, Math.round(value * 2) / 2));

  const cleanliness = clamp(
    stored?.cleanliness ??
      ( /shower|essentials|renovat|clean/.test(amenities) ? 4.5 : 4) + managedBoost,
  );
  const room = clamp(
    stored?.room ??
      (/air|tv|spa|theme|jacuzzi/.test(amenities) ? 4.5 : 3.5) + managedBoost,
  );
  const privacy = clamp(
    stored?.privacy ??
      (/discreet|parking|entrance|private/.test(amenities) ? 5 : 4) + managedBoost,
  );

  return [
    { id: "cleanliness", label: "Cleanliness", score: cleanliness },
    { id: "room", label: "Room Quality", score: room },
    { id: "privacy", label: "Privacy", score: privacy },
  ];
}

export function buildVenueConsumerView(options: {
  venue: Venue;
  content: ParsedVenueContent;
  staffRows?: Array<{ id?: string; name?: string | null; image_url?: string | null }>;
  gallery?: string[];
  distanceKm?: number | null;
}): VenueConsumerView {
  const { venue, content } = options;
  const areaLabel = titleArea(venue.suburb, venue.city);
  const staff = buildStaffRoster({
    venueId: venue.id,
    staffRows: options.staffRows,
    gallery: options.gallery,
    managed: venue.isManaged,
  });
  const activeStaffCount = staff.filter((member) => member.status === "active").length;
  const payments = detectPayments(venue.description, venue.tags);
  const facilities = facilityBadges(content.amenities);
  const distance =
    typeof options.distanceKm === "number" && Number.isFinite(options.distanceKm)
      ? `${options.distanceKm.toFixed(1)}km away`
      : undefined;

  const quickInfo: QuickInfoBadge[] = [
    {
      id: "location",
      kind: "location",
      label: areaLabel,
      value: distance || `${venue.suburb}`,
    },
    {
      id: "staff",
      kind: "staff",
      label: "Today Active",
      value: `${activeStaffCount} Ladies`,
    },
    ...payments.map((payment, index) => ({
      id: `pay-${index}`,
      kind: "payment" as const,
      label: payment,
    })),
    ...facilities.map((facility, index) => ({
      id: `fac-${index}`,
      kind: "facility" as const,
      label: facility,
    })),
  ];

  const phone = venue.phone?.replace(/[^\d+]/g, "");
  const telegram =
    typeof venue.customHighlights === "object" &&
    venue.customHighlights &&
    "telegram" in venue.customHighlights &&
    typeof (venue.customHighlights as { telegram?: unknown }).telegram === "string"
      ? (venue.customHighlights as { telegram?: string }).telegram
      : undefined;

  return {
    quickInfo,
    staff,
    activeStaffCount,
    quality: buildQualityScores({ content, venue }),
    payments,
    areaLabel,
    telegramHref: telegram ? `https://t.me/${telegram.replace(/^@/, "")}` : undefined,
    smsHref: phone ? `sms:${phone}` : undefined,
  };
}
