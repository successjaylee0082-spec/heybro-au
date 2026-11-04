export type ScrapedStaffMember = {
  name: string | null;
  imageUrl: string;
  sourceUrl: string;
};

export type ScrapedVenue = {
  source: "brothels.com.au";
  sourceUrl: string;
  sourceId: string | null;
  slug: string;
  name: string;
  category: "brothels";
  city: "sydney";
  suburb: string | null;
  address: string | null;
  state: "NSW";
  postcode: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  services: string[];
  description: string | null;
  coverImageUrl: string | null;
  staff: ScrapedStaffMember[];
  scrapedAt: string;
};

export type VenueUpsertRow = {
  slug: string;
  name: string;
  category: string;
  city: string;
  suburb: string | null;
  address: string | null;
  state: string;
  postcode: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  services: string[];
  description: string | null;
  cover_image_url: string | null;
  source_url: string;
  source_name: string;
  source_id: string | null;
  is_fictional: boolean;
  updated_at: string;
};

export type VenueStaffUpsertRow = {
  venue_slug: string;
  name: string | null;
  image_url: string;
  source_url: string;
  sort_order: number;
};
