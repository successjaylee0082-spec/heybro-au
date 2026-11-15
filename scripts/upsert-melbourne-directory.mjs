#!/usr/bin/env node
/**
 * Upsert the 15 verified Melbourne seed venues + manager_pin into live Supabase.
 *
 * Requires:
 *   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY)
 *
 * Usage: node scripts/upsert-melbourne-directory.mjs
 */
import { createClient } from "@supabase/supabase-js";

// Keep pin map + venue rows inline so this script stays runnable with plain node.
const PIN_MAP = {
  "melb-2": "8015",
  "melb-3": "8016",
  "melb-4": "8017",
  "melb-5": "8018",
  "melb-6": "8019",
  "melb-7": "8020",
  "melb-8": "8021",
  "melb-9": "8022",
  "melb-10": "4510",
  "melb-11": "4511",
  "melb-12": "4512",
  "melb-13": "4513",
  "melb-14": "4514",
  "melb-15": "4515",
  "melb-16": "4516",
};

const COORDS = {
  "melb-2": { lat: -37.8136, lng: 144.9631 },
  "melb-3": { lat: -37.8325, lng: 144.9605 },
  "melb-4": { lat: -37.8045, lng: 144.992 },
  "melb-5": { lat: -37.8865, lng: 145.0245 },
  "melb-6": { lat: -37.7302, lng: 144.9718 },
  "melb-7": { lat: -37.8677, lng: 144.9809 },
  "melb-8": { lat: -37.8325, lng: 144.9605 },
  "melb-9": { lat: -37.7942, lng: 144.9285 },
  "melb-10": { lat: -37.9871, lng: 145.2148 },
  "melb-11": { lat: -37.8325, lng: 144.9605 },
  "melb-12": { lat: -37.7991, lng: 144.9464 },
  "melb-13": { lat: -37.8325, lng: 144.9605 },
  "melb-14": { lat: -37.8084, lng: 144.8772 },
  "melb-15": { lat: -38.0164, lng: 145.2701 },
  "melb-16": { lat: -37.7834, lng: 144.9842 },
};

const VENUES = [
  {
    slug: "melb-2",
    name: "Top Of The Town",
    suburb: "Melbourne CBD",
    address: "516-518 Flinders St, Melbourne VIC 3000",
    phone: "(03) 9614 1414",
    website: "https://www.518flinders.com.au",
    description:
      "Elite Melbourne Lineup · Instant 30/45/60min Booking & Verification. Premier Flinders Street venue near Crown with discreet high-end service.",
    is_managed: true,
    listing_tier: "vip",
  },
  {
    slug: "melb-3",
    name: "Gotham City House of Sin",
    suburb: "South Melbourne",
    address: "70-74 Clarke St, South Melbourne VIC 3205",
    phone: "(03) 9699 9269",
    website: "https://gotham-city.com.au",
    description:
      "South Melbourne luxury house with opulent suites, verified companions, and polished service for English and Mandarin-speaking patrons.",
  },
  {
    slug: "melb-4",
    name: "Club Collingwood (Le Boudoir)",
    suburb: "Collingwood",
    address: "81 Rokeby St, Collingwood VIC 3066",
    phone: "(03) 9415 8055",
    website: "https://www.clubcollingwood.au",
    description:
      "Female-operated Collingwood house five minutes from the CBD — discreet entry, respectful service, and verified companions for Melbourne patrons.",
  },
  {
    slug: "melb-5",
    name: "Bambra Studio",
    suburb: "Caulfield",
    address: "977 Glen Huntly Rd, Caulfield VIC 3162",
    phone: "(03) 9563 6221",
    website: "https://www.bambrabrothelmelbourne.com.au",
    description:
      "Caulfield six-star gentlemen club with marble suites, a refined lounge atmosphere, and polished companion booking for Melbourne visitors.",
  },
  {
    slug: "melb-6",
    name: "26 Hocking Babes",
    suburb: "Coburg North",
    address: "26 Hocking St, Coburg North VIC 3058",
    phone: "0408 306 072",
    description:
      "Verified Melbourne nightlife listing in Coburg North. 18+ adults only · call to confirm tonight's roster and booking.",
  },
  {
    slug: "melb-7",
    name: "California Club",
    suburb: "St Kilda",
    address: "30 St Kilda Road, St Kilda VIC 3182",
    phone: "(03) 9529 4727",
    description:
      "Verified Melbourne nightlife listing in St Kilda. 18+ adults only · call to confirm tonight's roster and booking.",
  },
  {
    slug: "melb-8",
    name: "The Boardroom",
    suburb: "South Melbourne",
    address: "53 Market Street, South Melbourne VIC 3205",
    phone: "(03) 9699 1711",
    description:
      "Verified Melbourne nightlife listing in South Melbourne. 18+ adults only · call to confirm tonight's roster and booking.",
  },
  {
    slug: "melb-9",
    name: "Club 122",
    suburb: "Kensington",
    address: "122 Dynon Road, Kensington VIC 3031",
    phone: "(03) 9376 2666",
    description:
      "Verified Melbourne nightlife listing in Kensington. 18+ adults only · call to confirm tonight's roster and booking.",
  },
  {
    slug: "melb-10",
    name: "The Black Opal",
    suburb: "Dandenong",
    address: "12 Dandenong St, Dandenong VIC 3175",
    phone: "(03) 9792 3008",
    description:
      "Verified Melbourne nightlife listing in Dandenong. 18+ adults only · call to confirm tonight's roster and booking.",
  },
  {
    slug: "melb-11",
    name: "43 Club",
    suburb: "South Melbourne",
    address: "43 Tope Street, South Melbourne VIC 3205",
    phone: "(03) 9191 9306",
    description:
      "Verified Melbourne nightlife listing in South Melbourne. 18+ adults only · call to confirm tonight's roster and booking.",
  },
  {
    slug: "melb-12",
    name: "Far Eastern Relaxation",
    suburb: "North Melbourne",
    address: "77 Racecourse Road, North Melbourne VIC 3051",
    phone: "(03) 9326 8388",
    description:
      "Verified Melbourne nightlife listing in North Melbourne. 18+ adults only · call to confirm tonight's roster and booking.",
  },
  {
    slug: "melb-13",
    name: "The Harem Palace",
    suburb: "South Melbourne",
    address: "55 Park Street, South Melbourne VIC 3206",
    phone: "(03) 9699 1047",
    description:
      "Verified Melbourne nightlife listing in South Melbourne. 18+ adults only · call to confirm tonight's roster and booking.",
  },
  {
    slug: "melb-14",
    name: "Honey Angels",
    suburb: "West Footscray",
    address: "482 Geelong Road, West Footscray VIC 3012",
    phone: "0426 688 887",
    description:
      "Verified Melbourne nightlife listing in West Footscray. 18+ adults only · call to confirm tonight's roster and booking.",
  },
  {
    slug: "melb-15",
    name: "Club Hallam",
    suburb: "Hallam",
    address: "7 Rimfire Drive, Hallam VIC 3803",
    phone: "(03) 9702 4744",
    description:
      "Verified Melbourne nightlife listing in Hallam. 18+ adults only · call to confirm tonight's roster and booking.",
  },
  {
    slug: "melb-16",
    name: "Scarlet Lady",
    suburb: "Fitzroy North",
    address: "4 Dummett Crescent, Fitzroy North VIC 3068",
    phone: "(03) 9489 2240",
    description:
      "Verified Melbourne nightlife listing in Fitzroy North. 18+ adults only · call to confirm tonight's roster and booking.",
  },
];

function getClient() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    "";
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SECRET_KEY).",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureManagerPinColumn(client) {
  // Best-effort: PostgREST cannot ALTER TABLE. Probe by selecting the column.
  const { error } = await client
    .from("venues")
    .select("manager_pin")
    .limit(1);
  if (error && /manager_pin/i.test(error.message)) {
    throw new Error(
      "venues.manager_pin is missing. Apply supabase/migrations/20261113_venues_manager_pin.sql in the Supabase SQL editor first.",
    );
  }
}

async function main() {
  const client = getClient();
  await ensureManagerPinColumn(client);

  const rows = VENUES.map((venue) => {
    const coords = COORDS[venue.slug] || {};
    return {
      slug: venue.slug,
      name: venue.name,
      category: "brothels",
      city: "melbourne",
      suburb: venue.suburb,
      address: venue.address,
      state: "VIC",
      phone: venue.phone,
      website: venue.website || null,
      description: venue.description,
      lat: coords.lat ?? null,
      lng: coords.lng ?? null,
      is_fictional: false,
      is_managed: Boolean(venue.is_managed),
      listing_tier: venue.listing_tier || "free",
      manager_pin: PIN_MAP[venue.slug],
      updated_at: new Date().toISOString(),
    };
  });

  const { data, error } = await client
    .from("venues")
    .upsert(rows, { onConflict: "slug" })
    .select("slug, name, manager_pin");

  if (error) {
    console.error("Upsert failed:", error.message);
    process.exit(1);
  }

  console.log(`Upserted ${data?.length || 0} Melbourne venues:`);
  for (const row of data || []) {
    console.log(`  ${row.slug}\t${row.manager_pin}\t${row.name}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
