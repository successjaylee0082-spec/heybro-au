import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Public URL used by the browser and server venue reads. */
export function getSupabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    undefined
  );
}

/**
 * Public anon / publishable key — preferred for all venue roster reads.
 * Never require the service-role key for public companion fetches.
 */
export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    undefined
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/**
 * Public Supabase client for directory / companions reads.
 * Uses NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY only.
 */
export function createPublicSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
        }),
    },
  });
}

/**
 * Shared client for venue pages and public directory reads.
 * Prefers the public anon key so roster fetches never need a service role.
 */
export function createSupabaseClient(): SupabaseClient | null {
  return createPublicSupabaseClient();
}

/**
 * Server-only admin client (service role). Used by authenticated admin routes.
 * Never import this into client components.
 */
export function createAdminSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    getSupabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
