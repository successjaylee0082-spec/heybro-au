-- Live companion roster rows for venue detail pages.
-- Public reads use the anon key; edits happen in Supabase dashboard / admin tooling.

create table if not exists public.companions (
  id uuid primary key default gen_random_uuid(),
  venue_id text not null,
  slot_index integer not null default 0,
  name text not null,
  age integer not null default 21,
  height integer,
  cup text,
  nationality text,
  tags text[] default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists companions_venue_slot_uidx
  on public.companions (venue_id, slot_index);

create index if not exists companions_venue_id_idx
  on public.companions (venue_id);

alter table public.companions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'companions'
      and policyname = 'companions_public_read'
  ) then
    create policy companions_public_read on public.companions
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

comment on table public.companions is
  'Per-venue companion roster. venue_id matches public venue slug (e.g. melb-1). Images stay in app seed slots.';
