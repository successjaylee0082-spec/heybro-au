-- Visibility emphasis widgets for managed venue profiles.
alter table public.venues
  add column if not exists is_managed boolean not null default false,
  add column if not exists custom_highlights jsonb not null default '{}'::jsonb;

create index if not exists venues_is_managed_idx
  on public.venues (is_managed)
  where is_managed = true;

comment on column public.venues.is_managed is
  'Agency / PRO managed listing — unlocks VIP styling and highlight widgets.';
comment on column public.venues.custom_highlights is
  'JSONB visibility widgets: { badges[], promo{}, managedBadge }.';
