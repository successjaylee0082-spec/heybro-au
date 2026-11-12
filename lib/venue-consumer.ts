import {
  buildSmsHref,
  buildTelHref,
  buildWhatsAppHref,
  resolveWeChatContact,
  type WeChatContact,
} from "@/lib/booking-links";
import {
  normalizeCompanionAge,
  normalizeCompanionCup,
  normalizeCompanionEthnicity,
  normalizeCompanionHeight,
  normalizeCompanionStyles,
  forceSafeAge,
  safeDisplayedAge,
  isBlockedCompanionName,
  sanitizeCompanionForDisplay,
  sanitizeCompanionList,
  sanitizeCompanionName,
} from "@/lib/companion-profile";
import type { ParsedVenueContent } from "@/lib/venue-content";
import type { CustomHighlights } from "@/lib/venue-highlights";
import { nextMaskedStaffPortrait } from "@/lib/data";
import { isTrustedStaffPortrait } from "@/lib/staff-image-map";
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
  whatsappHref?: string;
  smsHref?: string;
  phoneHref?: string;
  wechat: WeChatContact;
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

function detectLanguages(text: string, tags: string[], suburb: string): string[] {
  const hay = `${text} ${tags.join(" ")} ${suburb}`.toLowerCase();
  const languages = ["English Speaking"];
  if (
    /mandarin|cantonese|chinese|中文|普通话|广东话|华人|haymarket|chinatown|hurstville|burwood|eastwood|box hill|cabramatta/.test(
      hay,
    )
  ) {
    languages.push("Mandarin / Cantonese 💬");
  }
  return [...new Set(languages)];
}

function facilityBadges(amenities: string[]): string[] {
  const wanted = [
    { match: /entrance|discreet entrance/i, label: "100% Discreet Entrance" },
    { match: /shower|ensuite|essentials/i, label: "Private Ensuite Shower" },
    { match: /park/i, label: "Discreet Parking" },
    { match: /spa|jacuzzi/i, label: "Spa / Jacuzzi" },
    { match: /air/i, label: "Air Conditioned" },
    { match: /24/i, label: "Open 24 Hours" },
    { match: /theme/i, label: "Theme Rooms" },
  ];
  const out: string[] = [];
  for (const item of wanted) {
    if (amenities.some((amenity) => item.match.test(amenity))) {
      out.push(item.label);
    }
  }
  // Do not invent amenities that the venue profile did not declare.
  return out.slice(0, 4);
}

function mapLadyStatus(
  status?: string,
): StaffRosterMember["status"] {
  const token = String(status || "")
    .trim()
    .toLowerCase();
  if (token.includes("available")) return "active";
  if (token.includes("shift") || token.includes("soon")) return "soon";
  if (token.includes("off")) return "off";
  return "active";
}

export function buildStaffRoster(options: {
  venueId: string;
  staffRows?: Array<{ id?: string; name?: string | null; image_url?: string | null }>;
  gallery?: string[];
  managed?: boolean;
  /** Official English companion lineup from lib/data.ts (preferred). */
  ladies?: Venue["ladies"];
}): StaffRosterMember[] {
  const rows = options.staffRows ?? [];
  // Gallery interiors must never leak into ethnicity-matched staff portraits.
  void options.gallery;
  const usedImages = new Set<string>();

  // Prefer verified English ladies from the venue seed catalog.
  if (Array.isArray(options.ladies) && options.ladies.length > 0) {
    const fromLadies = options.ladies.map((lady, index) => {
      const seed = `${options.venueId}:${lady.id || index}`;
      const template =
        STAFF_PROFILE_TEMPLATES[
          (hashSeed(seed) + index) % STAFF_PROFILE_TEMPLATES.length
        ];
      const image = isTrustedStaffPortrait(lady.image)
        ? lady.image
        : nextMaskedStaffPortrait({
            ethnicity: template.ethnicity,
            seed,
            offset: index,
            used: usedImages,
          });
      usedImages.add(image);
      // Sanitize from the original name first so Chanel/Sophie are detected.
      const wasBlocked = isBlockedCompanionName(lady.name);
      const safeLady = sanitizeCompanionForDisplay({
        name: lady.name,
        age: lady.age,
      });
      const displayAge = wasBlocked
        ? Math.max(22, Number(safeLady.age) || 22)
        : Math.max(21, Number(safeLady.age) || 21);
      return {
        id: lady.id || `${options.venueId}-lady-${index + 1}`,
        name: safeLady.name,
        age: forceSafeAge(normalizeCompanionAge(displayAge, seed)),
        ethnicity: normalizeCompanionEthnicity(
          lady.ethnicity ?? template.ethnicity,
          seed,
        ),
        heightCm: normalizeCompanionHeight(
          lady.heightCm ?? template.heightCm,
          seed,
        ),
        cup: normalizeCompanionCup(lady.cup ?? template.cup, seed),
        image,
        styles: normalizeCompanionStyles(lady.styles ?? template.styles, seed),
        status: mapLadyStatus(lady.status),
      };
    });
    return sanitizeCompanionList(fromLadies);
  }

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
    const age = forceSafeAge(normalizeCompanionAge(undefined, seed));
    const status: StaffRosterMember["status"] =
      index < Math.ceil(count * 0.65)
        ? "active"
        : index < count - 1
          ? "soon"
          : "off";

    // Strict rule: curated high-res masked female portraits only.
    // Scraped remote staff URLs are untrusted; unused-set prevents repeats.
    const image = isTrustedStaffPortrait(row?.image_url)
      ? (row?.image_url as string)
      : nextMaskedStaffPortrait({
          ethnicity: template.ethnicity,
          seed,
          offset: index,
          used: usedImages,
        });
    if (isTrustedStaffPortrait(row?.image_url)) usedImages.add(image);

    members.push(
      sanitizeCompanionForDisplay({
        id: row?.id || `${options.venueId}-staff-${index}`,
        name: sanitizeCompanionName(template.name),
        age,
        ethnicity: normalizeCompanionEthnicity(template.ethnicity, seed),
        heightCm: normalizeCompanionHeight(template.heightCm, seed),
        cup: normalizeCompanionCup(template.cup, seed),
        image,
        styles: normalizeCompanionStyles(template.styles, seed),
        status,
      }),
    );
  }
  return sanitizeCompanionList(members);
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
  const staff = sanitizeCompanionList(
    buildStaffRoster({
      venueId: venue.id,
      staffRows: options.staffRows,
      gallery: options.gallery,
      managed: venue.isManaged,
      ladies: venue.ladies,
    }).map((member) => ({
      ...member,
      age: (() => {
        const displayAge = Math.max(21, Number(member.age) || 21);
        return forceSafeAge(displayAge || safeDisplayedAge(member.age));
      })(),
    })),
  );
  const activeStaffCount = staff.filter((member) => member.status === "active")
    .length;
  const payments =
    content.payments?.length > 0
      ? content.payments
      : content.profile?.payments || ["Cash OK", "EFTPOS"];
  const languages = detectLanguages(
    venue.description,
    venue.tags,
    venue.suburb,
  );
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

  const extras = (venue.customHighlights || {}) as {
    telegram?: string;
    wechat?: string;
    whatsapp?: string;
  };
  const envWeChat =
    process.env.NEXT_PUBLIC_WECHAT_CONTACT_ID ||
    process.env.WECHAT_CONTACT_ID ||
    undefined;
  const wechatId = extras.wechat || envWeChat;
  const wechat = resolveWeChatContact({
    wechatId,
    // Optional public asset — dialog falls back cleanly if missing.
    qrPath: wechatId ? "/images/wechat-qr.png" : null,
  });
  const whatsappHref =
    buildWhatsAppHref(
      extras.whatsapp || venue.phone,
      `Hi, I found ${venue.name} on Hey Bro — are you available tonight?`,
    ) || undefined;

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
    wechatHref: wechat.id
      ? `weixin://dl/chat?${encodeURIComponent(wechat.id)}`
      : undefined,
    whatsappHref,
    smsHref: buildSmsHref(venue.phone),
    phoneHref: buildTelHref(venue.phone),
    wechat,
  };
}

export { STAFF_PORTRAIT_FALLBACKS, VENUE_GALLERY_FALLBACKS };
