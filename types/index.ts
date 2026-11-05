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
    managedBadge?: "pro" | "vip";
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
