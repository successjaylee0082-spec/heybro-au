/**
 * Upsert scraped Sydney brothel JSON into Supabase venues + venue_staff.
 *
 * Defaults to dry-run. Live writes require:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY)
 *   --apply --project-ref <20-char-ref>
 *
 * Usage:
 *   pnpm scrape:seed
 *   pnpm scrape:seed -- --apply --project-ref <ref>
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  ScrapedVenue,
  VenueStaffUpsertRow,
  VenueUpsertRow,
} from "../types/scraped-venue";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_INPUT = join(ROOT, "data/scraped/sydney-brothels.json");

type ScrapedFile = {
  scrapedAt: string;
  sourceListingUrl: string;
  count: number;
  venues: ScrapedVenue[];
};

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function argValue(flag: string): string | undefined {
  const prefix = `${flag}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function loadScraped(path: string): ScrapedFile {
  if (!existsSync(path)) {
    throw new Error(`Missing scraped file: ${path}. Run pnpm scrape first.`);
  }
  const parsed = JSON.parse(readFileSync(path, "utf8")) as ScrapedFile;
  if (!Array.isArray(parsed.venues)) {
    throw new Error("Invalid scraped JSON: venues[] missing");
  }
  return parsed;
}

function toVenueRows(venues: ScrapedVenue[]): VenueUpsertRow[] {
  const now = new Date().toISOString();
  return venues.map((venue) => ({
    slug: venue.slug,
    name: venue.name,
    category: venue.category,
    city: venue.city,
    suburb: venue.suburb,
    address: venue.address,
    state: venue.state,
    postcode: venue.postcode,
    phone: venue.phone,
    website: venue.website,
    hours: venue.hours,
    services: venue.services,
    description: venue.description,
    cover_image_url: venue.coverImageUrl,
    source_url: venue.sourceUrl,
    source_name: venue.source,
    source_id: venue.sourceId,
    is_fictional: false,
    updated_at: now,
  }));
}

function toStaffRows(venues: ScrapedVenue[]): VenueStaffUpsertRow[] {
  const rows: VenueStaffUpsertRow[] = [];
  for (const venue of venues) {
    venue.staff.forEach((member, index) => {
      rows.push({
        venue_slug: venue.slug,
        name: member.name,
        image_url: member.imageUrl,
        source_url: member.sourceUrl,
        sort_order: index,
      });
    });
  }
  return rows;
}

function staffDedupeKey(row: VenueStaffUpsertRow): string {
  return createHash("sha1")
    .update(`${row.venue_slug}|${row.image_url}`)
    .digest("hex");
}

function getServiceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for --apply mode",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function assertProjectRef(expected: string | undefined, url: string) {
  if (!expected) {
    throw new Error("Live seed requires --project-ref <20-character-ref>");
  }
  if (!/^[a-z0-9]{20}$/i.test(expected)) {
    throw new Error("--project-ref must be the 20-character Supabase project ref");
  }
  let host = "";
  try {
    host = new URL(url).host;
  } catch {
    throw new Error("SUPABASE_URL is not a valid URL");
  }
  if (!host.startsWith(`${expected}.`)) {
    throw new Error(
      `project-ref ${expected} does not match SUPABASE_URL host ${host}`,
    );
  }
}

async function applySeed(
  client: SupabaseClient,
  venues: VenueUpsertRow[],
  staff: VenueStaffUpsertRow[],
) {
  const { data: upserted, error: venueError } = await client
    .from("venues")
    .upsert(venues, { onConflict: "slug" })
    .select("id, slug");
  if (venueError) throw venueError;

  const slugToId = new Map<string, string>(
    (upserted || []).map((row) => [row.slug as string, row.id as string]),
  );

  const staffPayload = staff
    .map((row) => {
      const venueId = slugToId.get(row.venue_slug);
      if (!venueId) return null;
      return {
        venue_id: venueId,
        name: row.name,
        image_url: row.image_url,
        source_url: row.source_url,
        sort_order: row.sort_order,
        dedupe_key: staffDedupeKey(row),
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (staffPayload.length) {
    const { error: staffError } = await client
      .from("venue_staff")
      .upsert(staffPayload, { onConflict: "dedupe_key" });
    if (staffError) throw staffError;
  }

  return {
    venuesWritten: upserted?.length ?? 0,
    staffWritten: staffPayload.length,
  };
}

async function main() {
  const input = argValue("--input") || DEFAULT_INPUT;
  const apply = hasFlag("--apply");
  const projectRef = argValue("--project-ref");
  const scraped = loadScraped(input);
  const venueRows = toVenueRows(scraped.venues);
  const staffRows = toStaffRows(scraped.venues);

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        input,
        scrapedAt: scraped.scrapedAt,
        venueCount: venueRows.length,
        staffCount: staffRows.length,
        sample: venueRows.slice(0, 3).map((row) => ({
          slug: row.slug,
          name: row.name,
          suburb: row.suburb,
          phone: row.phone,
          services: row.services.slice(0, 4),
        })),
      },
      null,
      2,
    ),
  );

  if (!apply) {
    console.log(
      "Dry-run only. Re-run with --apply --project-ref <ref> after configuring private Supabase credentials.",
    );
    return;
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  assertProjectRef(projectRef, url);
  const client = getServiceClient();
  const result = await applySeed(client, venueRows, staffRows);
  console.log(JSON.stringify({ status: "applied", ...result }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
