import { NextRequest, NextResponse } from "next/server";
import {
  assertAdminKey,
  getAdminPanelKey,
  isAdminAuthenticated,
} from "@/lib/admin-auth";
import {
  createAdminSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase";
import {
  parseCustomHighlights,
  type CustomHighlights,
} from "@/lib/venue-highlights";
import { VENUE_SELECT, mapVenueRow } from "@/lib/venues";
import type { VenueRow } from "@/types/database";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function unavailable(message: string, status = 503) {
  return NextResponse.json({ error: message }, { status });
}

async function requireAdmin(request: NextRequest) {
  if (await isAdminAuthenticated()) return true;
  const header = request.headers.get("x-admin-key");
  return assertAdminKey(header);
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) return unauthorized();
  if (!isSupabaseConfigured()) return unavailable("Supabase is not configured");

  const client = createAdminSupabaseClient();
  if (!client) return unavailable("Supabase client unavailable");

  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  let query = client
    .from("venues")
    .select(VENUE_SELECT)
    .order("is_managed", { ascending: false })
    .order("name", { ascending: true })
    .limit(100);

  if (slug) query = query.eq("slug", slug);

  const { data, error } = await query;
  if (error) return unavailable(error.message, 500);

  return NextResponse.json({
    configured: Boolean(getAdminPanelKey()),
    venues: ((data as VenueRow[] | null) ?? []).map((row) => ({
      uuid: row.id,
      ...mapVenueRow(row),
      rawHighlights: parseCustomHighlights(row.custom_highlights),
    })),
  });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin(request))) return unauthorized();
  if (!isSupabaseConfigured()) return unavailable("Supabase is not configured");

  const client = createAdminSupabaseClient();
  if (!client) return unavailable("Supabase client unavailable");

  let body: {
    slug?: string;
    isManaged?: boolean;
    customHighlights?: CustomHighlights;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = body.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const highlights = parseCustomHighlights(body.customHighlights ?? {});
  const payload = {
    is_managed: Boolean(body.isManaged),
    custom_highlights: {
      badges: highlights.badges,
      promo: highlights.promo,
      managedBadge: highlights.managedBadge || (body.isManaged ? "pro" : undefined),
    },
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("venues")
    .update(payload)
    .eq("slug", slug)
    .select(VENUE_SELECT)
    .maybeSingle();

  if (error) return unavailable(error.message, 500);
  if (!data) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    venue: mapVenueRow(data as VenueRow),
    rawHighlights: parseCustomHighlights((data as VenueRow).custom_highlights),
  });
}
