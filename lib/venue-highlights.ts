import type { ParsedVenueContent } from "@/lib/venue-content";

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

export type ManagedBadgeVariant = "pro" | "vip";

export type CustomHighlights = {
  badges?: VenueHighlightBadge[];
  promo?: VenuePromoBanner | null;
  managedBadge?: ManagedBadgeVariant;
};

export type VenueVisibility = {
  isManaged: boolean;
  managedBadge?: ManagedBadgeVariant;
  badges: VenueHighlightBadge[];
  promo?: VenuePromoBanner;
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

  const managedBadge =
    record.managedBadge === "vip" || record.managedBadge === "pro"
      ? record.managedBadge
      : undefined;

  return {
    badges,
    promo: promo ?? null,
    managedBadge,
  };
}

export function deriveHighlightsFromContent(
  content: ParsedVenueContent,
): VenueHighlightBadge[] {
  const badges: VenueHighlightBadge[] = [];

  const cheapest = content.pricing[0];
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
  const isManaged = Boolean(options.isManaged);
  const configuredBadges = parsed.badges ?? [];
  const derived =
    configuredBadges.length > 0
      ? configuredBadges
      : options.content
        ? deriveHighlightsFromContent(options.content)
        : [];

  return {
    isManaged,
    managedBadge: isManaged ? parsed.managedBadge || "pro" : undefined,
    badges: derived,
    promo: parsed.promo || undefined,
  };
}
