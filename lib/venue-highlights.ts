import {
  resolveVenuePricing,
  type ParsedVenueContent,
} from "@/lib/venue-content";

export type VenueListingTier = "free" | "managed" | "vip";

export type HighlightTone = "emerald" | "rose" | "amber" | "violet";

export type HighlightKind = "price" | "event" | "service" | "promo" | "custom";

export type VenueHighlightBadge = {
  kind: HighlightKind;
  label: string;
  value?: string;
  tone?: HighlightTone;
};

export type VenuePromoBanner = {
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

/** High-engagement OP-style hook shown near the top of every template. */
export type VenueHookBanner = {
  title: string;
  subtitle?: string;
};

export type ManagedBadgeVariant = "pro" | "vip";

export type OperationalHighlightProfile = {
  tierLabel?: string;
  rateLine?: string;
  pricing?: Array<{ label?: string; duration?: string; price?: string }>;
  payments?: string[];
  amenities?: string[];
  services?: string[];
};

export type CustomHighlights = {
  badges?: VenueHighlightBadge[];
  promo?: VenuePromoBanner | null;
  hook?: VenueHookBanner | null;
  managedBadge?: ManagedBadgeVariant;
  /** Explicit listing tier. When omitted, derived from is_managed + managedBadge. */
  tier?: VenueListingTier | null;
  /** Public WeChat ID for sticky CTA / QR dialog. */
  wechat?: string | null;
  /** Optional WhatsApp number override (E.164 or AU local). */
  whatsapp?: string | null;
  telegram?: string | null;
  /** Optional SQL / admin-seeded AU directory operational profile. */
  operational?: OperationalHighlightProfile | null;
};

export type VenueVisibility = {
  isManaged: boolean;
  managedBadge?: ManagedBadgeVariant;
  tier?: VenueListingTier;
  badges: VenueHighlightBadge[];
  promo?: VenuePromoBanner;
  hook?: VenueHookBanner;
  planLabel?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function cleanText(value: unknown, max = 80): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  return text.slice(0, max);
}

function parseTone(value: unknown): HighlightTone | undefined {
  if (value === "emerald" || value === "rose" || value === "amber" || value === "violet") {
    return value;
  }
  return undefined;
}

function parseKind(value: unknown): HighlightKind {
  if (
    value === "price" ||
    value === "event" ||
    value === "service" ||
    value === "promo" ||
    value === "custom"
  ) {
    return value;
  }
  return "custom";
}

function parseTier(value: unknown): VenueListingTier | undefined {
  if (value === "free" || value === "managed" || value === "vip") return value;
  return undefined;
}

export function parseCustomHighlights(raw: unknown): CustomHighlights {
  const record = asRecord(raw) ?? {};
  const badgesRaw = Array.isArray(record.badges) ? record.badges : [];
  const badges: VenueHighlightBadge[] = [];

  for (const item of badgesRaw) {
    const row = asRecord(item);
    if (!row) continue;
    const label = cleanText(row.label, 48);
    if (!label) continue;
    badges.push({
      kind: parseKind(row.kind),
      label,
      value: cleanText(row.value, 48),
      tone: parseTone(row.tone),
    });
    if (badges.length >= 8) break;
  }

  const promoRecord = asRecord(record.promo);
  const promoTitle = promoRecord ? cleanText(promoRecord.title, 90) : undefined;
  const promo: VenuePromoBanner | undefined = promoTitle
    ? {
        title: promoTitle,
        body: cleanText(promoRecord?.body, 180),
        ctaLabel: cleanText(promoRecord?.ctaLabel, 32),
        ctaHref: cleanText(promoRecord?.ctaHref, 240),
      }
    : undefined;

  const hookRecord = asRecord(record.hook);
  const hookTitle = hookRecord
    ? cleanText(hookRecord.title, 140)
    : cleanText(record.hookTitle, 140);
  const hook: VenueHookBanner | undefined = hookTitle
    ? {
        title: hookTitle,
        subtitle:
          cleanText(hookRecord?.subtitle, 160) ||
          cleanText(record.hookSubtitle, 160),
      }
    : undefined;

  const managedBadge =
    record.managedBadge === "vip" || record.managedBadge === "pro"
      ? record.managedBadge
      : undefined;

  const operationalRecord = asRecord(record.operational);
  let operational: OperationalHighlightProfile | null = null;
  if (operationalRecord) {
    const pricingRaw = Array.isArray(operationalRecord.pricing)
      ? operationalRecord.pricing
      : [];
    const pricing = pricingRaw
      .map((item) => {
        const row = asRecord(item);
        if (!row) return null;
        const label = cleanText(row.label, 64);
        const duration = cleanText(row.duration, 24);
        const price = cleanText(row.price, 16);
        if (!duration || !price) return null;
        return { label: label || duration, duration, price };
      })
      .filter(Boolean) as OperationalHighlightProfile["pricing"];
    operational = {
      tierLabel: cleanText(operationalRecord.tierLabel, 32),
      rateLine: cleanText(operationalRecord.rateLine, 80),
      pricing,
      payments: Array.isArray(operationalRecord.payments)
        ? operationalRecord.payments
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 6)
        : undefined,
      amenities: Array.isArray(operationalRecord.amenities)
        ? operationalRecord.amenities
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 8)
        : undefined,
      services: Array.isArray(operationalRecord.services)
        ? operationalRecord.services
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 8)
        : undefined,
    };
  }

  return {
    badges,
    promo: promo ?? null,
    hook: hook ?? null,
    managedBadge,
    tier: parseTier(record.tier) ?? null,
    wechat: cleanText(record.wechat, 64) || null,
    whatsapp: cleanText(record.whatsapp, 32) || null,
    telegram: cleanText(record.telegram, 64) || null,
    operational,
  };
}

export function deriveHighlightsFromContent(
  content: ParsedVenueContent,
): VenueHighlightBadge[] {
  const badges: VenueHighlightBadge[] = [];

  const cheapest = resolveVenuePricing(content)[0];
  if (cheapest) {
    badges.push({
      kind: "price",
      label: "From",
      value: `${cheapest.price}/${cheapest.duration.replace(/\s+/g, "")}`,
      tone: "emerald",
    });
  }

  for (const service of content.services.slice(0, 3)) {
    badges.push({
      kind: "service",
      label: service,
      tone: "rose",
    });
  }

  const eventAmenity = content.amenities.find((item) =>
    /theme|event|spa|jacuzzi|24/i.test(item),
  );
  if (eventAmenity) {
    badges.push({
      kind: "event",
      label: eventAmenity,
      tone: "amber",
    });
  }

  return badges.slice(0, 6);
}

export function resolveVenueVisibility(options: {
  isManaged?: boolean | null;
  customHighlights?: unknown;
  content?: ParsedVenueContent;
}): VenueVisibility {
  const parsed = parseCustomHighlights(options.customHighlights);
  const isManaged = Boolean(options.isManaged) || parsed.tier === "managed" || parsed.tier === "vip";
  const configuredBadges = parsed.badges ?? [];
  const derived =
    configuredBadges.length > 0
      ? configuredBadges
      : options.content
        ? deriveHighlightsFromContent(options.content)
        : [];

  return {
    isManaged,
    managedBadge: isManaged
      ? parsed.managedBadge || (parsed.tier === "vip" ? "vip" : "pro")
      : undefined,
    tier: parsed.tier || undefined,
    badges: derived,
    promo: parsed.promo || undefined,
    hook: parsed.hook || undefined,
  };
}
