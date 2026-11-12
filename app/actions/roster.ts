"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  companionAgeFloor,
  fetchCompanionsForVenue,
  type CompanionRow,
} from "@/lib/companions";
import { getSeedDirectoryVenues } from "@/lib/data";
import { createAdminSupabaseClient } from "@/lib/supabase";
import {
  assertVenuePin,
  getVenuePin,
  venuePinCookieName,
} from "@/lib/venue-pins";
import { isBlockedCompanionName } from "@/lib/companion-profile";

export type RosterActionResult =
  | { ok: true; message?: string; companions?: CompanionRow[] }
  | { ok: false; error: string };

const BLOCKED_NAMES = new Set(["chanel", "sophie"]);

function scrubName(name: unknown): string | null {
  const raw = String(name || "").trim();
  if (!raw) return null;
  const key = raw.toLowerCase();
  if (BLOCKED_NAMES.has(key) || isBlockedCompanionName(raw)) {
    return null;
  }
  // English stage names only.
  if (!/^[A-Za-z][A-Za-z .'-]{1,31}$/.test(raw)) return null;
  return raw;
}

function parseTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((tag) => String(tag || "").trim())
      .filter((tag) => /^[A-Za-z0-9][A-Za-z0-9 /+-]{0,24}$/.test(tag))
      .slice(0, 4);
  }
  return String(input || "")
    .split(/[,|]/)
    .map((tag) => tag.trim())
    .filter((tag) => /^[A-Za-z0-9][A-Za-z0-9 /+-]{0,24}$/.test(tag))
    .slice(0, 4);
}

async function requireVenueOwner(venueId: string): Promise<boolean> {
  if (!getVenuePin(venueId)) return false;
  const jar = await cookies();
  const saved = jar.get(venuePinCookieName(venueId))?.value;
  return assertVenuePin(venueId, saved);
}

function revalidateVenuePaths(venueId: string) {
  revalidatePath(`/en/venue/${venueId}`);
  revalidatePath(`/zh/venue/${venueId}`);
  revalidatePath(`/en/manage/${venueId}`);
  revalidatePath(`/zh/manage/${venueId}`);
}

export async function verifyVenuePinAction(
  venueId: string,
  pin: string,
): Promise<RosterActionResult> {
  const id = String(venueId || "").trim();
  if (!id) return { ok: false, error: "Missing venue id." };
  if (!assertVenuePin(id, String(pin || "").trim())) {
    return { ok: false, error: "Incorrect PIN." };
  }
  const jar = await cookies();
  jar.set(venuePinCookieName(id), String(pin).trim(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return { ok: true, message: "PIN accepted." };
}

export async function logoutVenuePinAction(
  venueId: string,
): Promise<RosterActionResult> {
  const jar = await cookies();
  jar.delete(venuePinCookieName(venueId));
  return { ok: true, message: "Signed out." };
}

export async function listCompanionsAction(
  venueId: string,
): Promise<RosterActionResult> {
  const id = String(venueId || "").trim();
  if (!(await requireVenueOwner(id))) {
    return { ok: false, error: "Unauthorized." };
  }
  const companions = await fetchCompanionsForVenue(id);
  return { ok: true, companions };
}

/** Seed companions from local ladies when the table is empty for this venue. */
export async function ensureCompanionsSeededAction(
  venueId: string,
): Promise<RosterActionResult> {
  const id = String(venueId || "").trim();
  if (!(await requireVenueOwner(id))) {
    return { ok: false, error: "Unauthorized." };
  }
  const existing = await fetchCompanionsForVenue(id);
  if (existing.length > 0) {
    return { ok: true, companions: existing, message: "Roster already loaded." };
  }

  const client = createAdminSupabaseClient();
  if (!client) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const seed = getSeedDirectoryVenues().find((venue) => venue.id === id);
  const ladies = seed?.ladies || [];
  if (!ladies.length) {
    return { ok: true, companions: [], message: "No seed ladies to import." };
  }

  const rows = ladies.map((lady, index) => ({
    venue_id: id,
    slot_index: index,
    name: scrubName(lady.name) || `Companion ${index + 1}`,
    age: companionAgeFloor(lady.age),
    height: lady.heightCm || 165,
    cup: lady.cup || "C",
    nationality: lady.ethnicity || "European",
    tags: lady.styles || ["GFE"],
    is_active: lady.status === "Available Now",
    updated_at: new Date().toISOString(),
  }));

  const { error } = await client.from("companions").insert(rows);
  if (error) return { ok: false, error: error.message };

  const companions = await fetchCompanionsForVenue(id);
  revalidateVenuePaths(id);
  return { ok: true, companions, message: "Seed roster imported." };
}

export async function toggleActiveStatus(
  companionId: string,
  venueId: string,
  isActive: boolean,
): Promise<RosterActionResult> {
  const id = String(venueId || "").trim();
  if (!(await requireVenueOwner(id))) {
    return { ok: false, error: "Unauthorized." };
  }
  const client = createAdminSupabaseClient();
  if (!client) return { ok: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("companions")
    .update({
      is_active: Boolean(isActive),
      updated_at: new Date().toISOString(),
    })
    .eq("id", companionId)
    .eq("venue_id", id);

  if (error) return { ok: false, error: error.message };

  revalidateVenuePaths(id);
  const companions = await fetchCompanionsForVenue(id);
  return {
    ok: true,
    companions,
    message: isActive ? "Marked Working Today." : "Marked Off Duty.",
  };
}

export async function updateCompanion(input: {
  id: string;
  venueId: string;
  name: string;
  age: number;
  nationality?: string;
  cup?: string;
  height?: number;
  tags?: string | string[];
}): Promise<RosterActionResult> {
  const venueId = String(input.venueId || "").trim();
  if (!(await requireVenueOwner(venueId))) {
    return { ok: false, error: "Unauthorized." };
  }

  const name = scrubName(input.name);
  if (!name) {
    return {
      ok: false,
      error: "Name is blocked or invalid. Chanel and Sophie are not allowed.",
    };
  }
  const age = Math.max(20, Number(input.age) || 20);
  if (age < 20) return { ok: false, error: "Age must be 20 or older." };

  const client = createAdminSupabaseClient();
  if (!client) return { ok: false, error: "Supabase is not configured." };

  const { error } = await client
    .from("companions")
    .update({
      name,
      age,
      nationality: String(input.nationality || "European").trim() || "European",
      cup: String(input.cup || "C")
        .trim()
        .toUpperCase()
        .slice(0, 4),
      height: Math.max(150, Math.min(190, Number(input.height) || 165)),
      tags: parseTags(input.tags),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .eq("venue_id", venueId);

  if (error) return { ok: false, error: error.message };

  revalidateVenuePaths(venueId);
  const companions = await fetchCompanionsForVenue(venueId);
  return { ok: true, companions, message: "Companion saved." };
}

export async function addCompanion(input: {
  venueId: string;
  name?: string;
  age?: number;
  nationality?: string;
  cup?: string;
  height?: number;
  tags?: string | string[];
  isActive?: boolean;
}): Promise<RosterActionResult> {
  const venueId = String(input.venueId || "").trim();
  if (!(await requireVenueOwner(venueId))) {
    return { ok: false, error: "Unauthorized." };
  }

  const name = scrubName(input.name || "Nova");
  if (!name) {
    return {
      ok: false,
      error: "Name is blocked or invalid. Chanel and Sophie are not allowed.",
    };
  }
  const age = Math.max(20, Number(input.age) || 22);

  const client = createAdminSupabaseClient();
  if (!client) return { ok: false, error: "Supabase is not configured." };

  const existing = await fetchCompanionsForVenue(venueId);
  const used = new Set(
    existing.map((row) => Number(row.slot_index)).filter(Number.isFinite),
  );
  let nextSlot = 0;
  while (used.has(nextSlot)) nextSlot += 1;

  const seedCount =
    getSeedDirectoryVenues().find((venue) => venue.id === venueId)?.ladies
      ?.length || 8;
  if (nextSlot >= Math.max(seedCount, 8)) {
    return {
      ok: false,
      error: `Roster is full for this venue (max ${Math.max(seedCount, 8)} slots).`,
    };
  }

  const { error } = await client.from("companions").insert({
    venue_id: venueId,
    slot_index: nextSlot,
    name,
    age,
    nationality: String(input.nationality || "European").trim() || "European",
    cup: String(input.cup || "C")
      .trim()
      .toUpperCase()
      .slice(0, 4),
    height: Math.max(150, Math.min(190, Number(input.height) || 165)),
    tags: parseTags(input.tags || ["GFE", "Elegant"]),
    is_active: input.isActive !== false,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };

  revalidateVenuePaths(venueId);
  const companions = await fetchCompanionsForVenue(venueId);
  return { ok: true, companions, message: "Staff added." };
}
