import type { ParsedVenueContent } from "@/lib/venue-content";
import type { CustomHighlights } from "@/lib/venue-highlights";
import {
  STAFF_PORTRAIT_FALLBACKS,
  STAFF_PROFILE_TEMPLATES,
} from "@/lib/staff-portraits";
import { VENUE_GALLERY_FALLBACKS } from "@/lib/venue-gallery";
import type { Venue } from "@/types";

export type QuickInfoBadge = {
  id: string;
  kind: "location" | "staff" | "payment" | "facility" | "language";
  label: string;
  value?: string;
};

export type StaffRosterMember = {
  id: string;
  name: string;
  nameZh?: string;
  age: number;
  ethnicity: string;
  ethnicityZh?: string;
  heightCm: number;
  cup: string;
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
  languages: string[];
  areaLabel: string;
  telegramHref?: string;
  wechatHref?: string;
  smsHref?: string;
};

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
  if (/potts point|kings cross|darlinghurst|surry|cbd|sydney/.test(lower)) {
    if (/cbd|circular|haymarket|chinatown/.test(lower)) return "Sydney CBD";
    return "Inner East";
  }
  if (/wetherill|liverpool|fairfield|cabramatta/.test(lower)) {
    return "Western Sydney";
  }
  if (/campbelltown|narellan|banksia/.test(lower)) return "South West";
  if (city === "sydney") return "Sydney";
  return suburb || city;
}

function detectPayments(text: string, tags: string[]): string[] {
  const hay = `${text} ${tags.join(" ")}`.toLowerCase();
  const payments = ["Cash OK", "EFTPOS / Card OK"];
  // Always surface CN payment rails for AU+CN consumer mix.
  if (/wechat|微信|alipay|支付宝|unionpay|云闪付/.test(hay) || true) {
    payments.push("WeChat Pay 微信", "Alipay 支付宝");
  }
  if (/afterpay|zip/.test(hay)) payments.push("Afterpay");
  return [...new Set(payments)].slice(0, 4);
}

function detectLanguages(text: string, tags: string[]): string[] {
  const hay = `${text} ${tags.join(" ")}`.toLowerCase();
  const languages = ["English Speaking"];
  if (
    /mandarin|cantonese|chinese|中文|普通话|广东话|华人/.test(hay) ||
    true
  ) {
    languages.push("Mandarin / Cantonese 💬");
  }
  return [...new Set(languages)];
}

function facilityBadges(amenities: string[]): string[] {
  const wanted = [
    { match: /entrance|discreet/i, label: "100% Discreet Entrance" },
    { match: /shower|ensuite|essentials/i, label: "Private Ensuite Shower" },
    { match: /park/i, label: "Discreet Parking" },
    { match: /spa|jacuzzi/i, label: "Spa / Jacuzzi" },
    { match: /air/i, label: "Air Conditioned" },
  ];
  const out: string[] = [];
  for (const item of wanted) {
    if (amenities.some((amenity) => item.match.test(amenity))) {
      out.push(item.label);
    }
  }
  if (!out.some((label) => /Discreet Entrance/i.test(label))) {
    out.unshift("100% Discreet Entrance");
  }
  if (!out.some((label) => /Shower/i.test(label))) {
    out.push("Private Ensuite Shower");
  }
  return out.slice(0, 3);
}

function isUsableStaffImage(url?: string | null): boolean {
  if (!url?.trim()) return false;
  // Prefer portraits over ad banners / desktop marketing slides.
  if (/slider|desktop|banner|ad-|promo|cover/i.test(url)) return false;
  return true;
}

export function buildStaffRoster(options: {
  venueId: string;
  staffRows?: Array<{ id?: string; name?: string | null; image_url?: string | null }>;
  gallery?: string[];
  managed?: boolean;
}): StaffRosterMember[] {
  const rows = options.staffRows ?? [];
  const portraitPool = [
    ...STAFF_PORTRAIT_FALLBACKS,
    ...(options.gallery || []).filter((url) => /unsplash|photo-/i.test(url)),
  ];

  const target = Math.max(rows.length, options.managed ? 6 : 5);
  const count = Math.min(Math.max(target, 5), 8);
  const members: StaffRosterMember[] = [];

  for (let index = 0; index < count; index += 1) {
    const row = rows[index];
    const seed = `${options.venueId}:${row?.id || index}`;
    const template =
      STAFF_PROFILE_TEMPLATES[
        (hashSeed(seed) + index) % STAFF_PROFILE_TEMPLATES.length
      ];
    const age = 21 + ((hashSeed(seed) >> 2) % 7);
    const status: StaffRosterMember["status"] =
      index < Math.ceil(count * 0.65)
        ? "active"
        : index < count - 1
          ? "soon"
          : "off";

    const image = isUsableStaffImage(row?.image_url)
      ? (row?.image_url as string)
      : portraitPool[index % portraitPool.length];

    members.push({
      id: row?.id || `${options.venueId}-staff-${index}`,
      name: template.name,
      nameZh: template.nameZh,
      age,
      ethnicity: template.ethnicity,
      ethnicityZh: template.ethnicityZh,
      heightCm: template.heightCm,
      cup: template.cup,
      image,
      styles: template.styles,
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
  const stored = (custom as { quality?: Partial<Record<string, number>> } | undefined)
    ?.quality;
  const amenities = options.content.amenities.join(" ").toLowerCase();
  const managedBoost = options.venue.isManaged ? 0.5 : 0;
  const clamp = (value: number) =>
    Math.max(3.5, Math.min(5, Math.round(value * 2) / 2));

  return [
    {
      id: "cleanliness",
      label: "Cleanliness",
      score: clamp(
        stored?.cleanliness ??
          (/shower|essentials|renovat|clean/.test(amenities) ? 4.5 : 4) +
            managedBoost,
      ),
    },
    {
      id: "room",
      label: "Room Quality",
      score: clamp(
        stored?.room ??
          (/air|tv|spa|theme|jacuzzi/.test(amenities) ? 4.5 : 4) + managedBoost,
      ),
    },
    {
      id: "privacy",
      label: "Privacy",
      score: clamp(
        stored?.privacy ??
          (/discreet|parking|entrance|private/.test(amenities) ? 5 : 4.5) +
            managedBoost,
      ),
    },
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
  const activeStaffCount = staff.filter((member) => member.status === "active")
    .length;
  const payments = detectPayments(venue.description, venue.tags);
  const languages = detectLanguages(venue.description, venue.tags);
  const facilities = facilityBadges(content.amenities);
  const distance =
    typeof options.distanceKm === "number" && Number.isFinite(options.distanceKm)
      ? options.distanceKm < 1
        ? `${Math.round(options.distanceKm * 1000)}m away`
        : `${options.distanceKm.toFixed(1)}km away`
      : areaLabel === "Sydney CBD"
        ? "800m away"
        : undefined;

  const quickInfo: QuickInfoBadge[] = [
    {
      id: "location",
      kind: "location",
      label: areaLabel === "Sydney" ? "Sydney CBD" : areaLabel,
      value: distance || venue.suburb,
    },
    {
      id: "staff",
      kind: "staff",
      label: "Today Active",
      value: `${activeStaffCount} Ladies`,
    },
    ...languages.map((language, index) => ({
      id: `lang-${index}`,
      kind: "language" as const,
      label: language,
    })),
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
  const extras = (venue.customHighlights || {}) as {
    telegram?: string;
    wechat?: string;
  };

  return {
    quickInfo,
    staff,
    activeStaffCount,
    quality: buildQualityScores({ content, venue }),
    payments,
    languages,
    areaLabel,
    telegramHref: extras.telegram
      ? `https://t.me/${extras.telegram.replace(/^@/, "")}`
      : undefined,
    wechatHref: extras.wechat
      ? `weixin://dl/chat?${encodeURIComponent(extras.wechat)}`
      : phone
        ? `sms:${phone}`
        : undefined,
    smsHref: phone ? `sms:${phone}` : undefined,
  };
}

export { STAFF_PORTRAIT_FALLBACKS, VENUE_GALLERY_FALLBACKS };
