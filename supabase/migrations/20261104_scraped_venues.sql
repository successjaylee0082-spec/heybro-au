-- Scraped venue inventory + optional staff media references.
-- Apply with the private Supabase SQL editor / CLI before pnpm scrape:seed --apply.

create extension if not exists "pgcrypto";

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'brothels',
  city text not null,
  suburb text,
  address text,
  state text,
  postcode text,
  phone text,
  website text,
  hours text,
  services text[] not null default '{}',
  description text,
  cover_image_url text,
  lat double precision,
  lng double precision,
  source_url text,
  source_name text,
  source_id text,
  is_fictional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venue_staff (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  name text,
  image_url text not null,
  source_url text,
  sort_order integer not null default 0,
  dedupe_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists venues_city_category_idx on public.venues (city, category);
create index if not exists venue_staff_venue_id_idx on public.venue_staff (venue_id);

alter table public.venues enable row level security;
alter table public.venue_staff enable row level security;

-- Public read of non-fictional published inventory (optional; tighten before production).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'venues' and policyname = 'venues_public_read'
  ) then
    create policy venues_public_read on public.venues
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'venue_staff' and policyname = 'venue_staff_public_read'
  ) then
    create policy venue_staff_public_read on public.venue_staff
      for select
      using (true);
  end if;
end $$;
