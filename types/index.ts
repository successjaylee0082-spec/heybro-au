export type Locale = "en" | "zh";

export type CityId =
  | "sydney"
  | "melbourne"
  | "brisbane"
  | "perth"
  | "gold-coast"
  | "adelaide";

export type CategoryId =
  | "brothels"
  | "escorts-massage"
  | "strip-clubs"
  | "adult-retail"
  | "nightlife-events";

export interface Venue {
  id: string;
  name: string;
  nameZh?: string;
  city: CityId;
  suburb: string;
  suburbZh?: string;
  category: CategoryId;
  description: string;
  descriptionZh?: string;
  image: string;
  tags: string[];
  tagsZh?: string[];
  phone?: string;
  address: string;
  lat?: number;
  lng?: number;
  /** True when venue sits inside the city CBD core. */
  isCbd?: boolean;
  /** Straight-line km from the city CBD benchmark. */
  distanceFromCbdKm?: number | null;
  /** Display badge e.g. "Surry Hills • 1.2km from CBD". */
  distanceBadge?: string;
  verified?: boolean;
  fictional: boolean;
  hours?: string;
  website?: string;
  isManaged?: boolean;
  managedBadge?: "pro" | "vip";
  customHighlights?: {
    badges?: Array<{
      kind: "price" | "event" | "service" | "promo" | "custom";
      label: string;
      value?: string;
      tone?: "emerald" | "rose" | "amber" | "violet";
    }>;
    promo?: {
      title: string;
      body?: string;
      ctaLabel?: string;
      ctaHref?: string;
    } | null;
    hook?: {
      title: string;
      subtitle?: string;
    } | null;
    managedBadge?: "pro" | "vip";
    tier?: "free" | "managed" | "vip" | null;
    wechat?: string | null;
    whatsapp?: string | null;
    telegram?: string | null;
  };
}

export interface CityMeta {
  id: CityId;
  label: string;
  labelZh: string;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  labelZh: string;
}
