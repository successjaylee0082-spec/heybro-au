/** Live roster row from public.companions (images stay in app seed slots). */
export type CompanionRow = {
  id: string;
  venue_id: string;
  slot_index: number;
  name: string;
  age: number;
  height: number | null;
  cup: string | null;
  nationality: string | null;
  tags: string[] | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type VenueRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  suburb: string | null;
  address: string | null;
  state: string | null;
  postcode: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  services: string[] | null;
  description: string | null;
  cover_image_url: string | null;
  lat: number | null;
  lng: number | null;
  source_url: string | null;
  source_name: string | null;
  source_id: string | null;
  is_fictional: boolean | null;
  is_managed?: boolean | null;
  listing_tier?: "free" | "managed" | "vip" | "enterprise" | null;
  custom_highlights?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};
