#!/usr/bin/env node
/**
 * Delete Sydney demo venues and upsert street-level coords/addresses in Supabase.
 *
 * Usage:
 *   node scripts/cleanup-sydney-directory.mjs --dry-run
 *   node scripts/cleanup-sydney-directory.mjs --apply
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_URL / SERVICE_ROLE).
 */
import { createClient } from "@supabase/supabase-js";

const DEMO_SLUGS = [
  "harbour-glow-lounge",
  "surry-neon-room",
  "cross-stage-club",
];

const UPDATES = [
  {
    slug: "cleopatras-gentlemans-club",
    suburb: "Wetherill Park",
    address: "12 Hargraves Pl, Wetherill Park NSW 2164",
    lat: -33.84309,
    lng: 150.8972,
  },
  {
    slug: "sydney-asian-brothels",
    suburb: "Wetherill Park",
    address: "12 Hargraves Pl, Wetherill Park NSW 2164",
    lat: -33.84309,
    lng: 150.8972,
    note: "Shares Cleopatra premises (same phone / network listing).",
  },
  {
    slug: "maggies-girls-sydney",
    suburb: "Potts Point",
    address: "20-22 Kellett St, Potts Point NSW 2011",
    lat: -33.87441,
    lng: 151.22351,
  },
  {
    slug: "my-girls-sydney",
    suburb: "Potts Point",
    address: "50 Kellett St, Potts Point NSW 2011",
    lat: -33.87535,
    lng: 151.22415,
  },
  {
    slug: "a-touch-more-class-formerly-a-touch-of-class",
    suburb: "Surry Hills",
    address: "377 Riley St, Surry Hills NSW 2010",
    lat: -33.88737,
    lng: 151.21218,
  },
  {
    slug: "ginza-club",
    suburb: "Surry Hills",
    address: "310 Cleveland St, Surry Hills NSW 2010",
    lat: -33.89193,
    lng: 151.21559,
  },
  {
    slug: "tiffanys",
    suburb: "Surry Hills",
    address: "99 Albion St, Surry Hills NSW 2010",
    lat: -33.88257,
    lng: 151.21061,
  },
  {
    slug: "dream-girl-130",
    suburb: "Alexandria",
    address: "130 Botany Rd, Alexandria NSW 2015",
    lat: -33.89973,
    lng: 151.20035,
  },
  {
    slug: "the-nightshade",
    suburb: "Gladesville",
    address: "2/42 Buffalo Road, Gladesville NSW 2111",
    lat: -33.81966,
    lng: 151.12451,
  },
  {
    slug: "pink-house",
    suburb: "Greenacre",
    address: "12 Norfolk Rd, Greenacre NSW 2190",
    lat: -33.89544,
    lng: 151.06657,
  },
  {
    slug: "sweet-babe-181",
    suburb: "Smithfield",
    address: "1/181 McCredie Road, Smithfield NSW 2164",
    lat: -33.84905,
    lng: 150.95288,
  },
  {
    slug: "jk80-gentlemen-club",
    suburb: "Sydney",
    address: "80 Erskine St, Sydney NSW 2000",
    lat: -33.8669,
    lng: 151.2022,
  },
  {
    slug: "sydney-empress-69",
    suburb: "Haymarket",
    address:
      "Level 1, 69 Liverpool St, Haymarket NSW 2000 (corner of Liverpool St and Kent St)",
    lat: -33.8765,
    lng: 151.20554,
  },
];

const apply = process.argv.includes("--apply");
const dryRun = !apply || process.argv.includes("--dry-run");

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  "";

console.log(
  `[cleanup-sydney] mode=${dryRun ? "dry-run" : "apply"} demos=${DEMO_SLUGS.length} updates=${UPDATES.length}`,
);

if (dryRun) {
  console.log("Would delete:", DEMO_SLUGS.join(", "));
  for (const row of UPDATES) {
    console.log(
      `Would update ${row.slug} -> ${row.address} (${row.lat},${row.lng})${row.note ? ` // ${row.note}` : ""}`,
    );
  }
  process.exit(0);
}

if (!url || !key) {
  console.error("Missing Supabase URL / service role key — aborting apply.");
  process.exit(1);
}

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: doomed, error: doomedErr } = await client
  .from("venues")
  .select("id, slug")
  .in("slug", DEMO_SLUGS);

if (doomedErr) {
  console.error("Failed listing demo venues:", doomedErr.message);
  process.exit(1);
}

for (const row of doomed || []) {
  await client.from("venue_staff").delete().eq("venue_id", row.id);
  await client.from("companions").delete().in("venue_id", [row.id, row.slug]);
}

const { error: delErr } = await client
  .from("venues")
  .delete()
  .in("slug", DEMO_SLUGS);

if (delErr) {
  console.error("Failed deleting demos:", delErr.message);
  process.exit(1);
}
console.log(`Deleted ${doomed?.length || 0} demo venue row(s).`);

for (const row of UPDATES) {
  const { error } = await client
    .from("venues")
    .update({
      suburb: row.suburb,
      address: row.address,
      lat: row.lat,
      lng: row.lng,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", row.slug);
  if (error) {
    console.error(`Failed updating ${row.slug}:`, error.message);
    process.exit(1);
  }
  console.log(`Updated ${row.slug}`);
}

console.log("[cleanup-sydney] done");
