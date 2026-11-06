-- Extend listing_tier check to include Enterprise Ultimate ($249/mo).
alter table public.venues drop constraint if exists venues_listing_tier_check;

alter table public.venues
  add constraint venues_listing_tier_check
  check (listing_tier in ('free', 'managed', 'vip', 'enterprise'));

comment on column public.venues.listing_tier is
  'Commercial listing tier: free/basic ($49/mo) | managed/vip Managed VIP Elite ($149/mo) | enterprise Ultimate ($249/mo).';
