-- Listing tiers: Basic $49 / Managed VIP Elite $149 / Enterprise Ultimate $249.
alter table public.venues
  add column if not exists listing_tier text not null default 'free';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'venues_listing_tier_check'
  ) then
    alter table public.venues
      add constraint venues_listing_tier_check
      check (listing_tier in ('free', 'managed', 'vip', 'enterprise'));
  end if;
end $$;

create index if not exists venues_listing_tier_idx
  on public.venues (listing_tier);

comment on column public.venues.listing_tier is
  'Commercial listing tier: free/basic ($49/mo) | managed/vip Managed VIP Elite ($149/mo) | enterprise Ultimate ($249/mo).';

-- Keep JSON highlights aligned for managed inventory.
update public.venues
set
  listing_tier = case
    when coalesce(custom_highlights->>'tier', '') = 'vip' then 'vip'
    when is_managed = true then 'managed'
    else 'free'
  end,
  custom_highlights = coalesce(custom_highlights, '{}'::jsonb) || jsonb_build_object(
    'tier',
    case
      when coalesce(custom_highlights->>'tier', '') = 'vip' then 'vip'
      when is_managed = true then 'managed'
      else 'free'
    end
  )
where true;
