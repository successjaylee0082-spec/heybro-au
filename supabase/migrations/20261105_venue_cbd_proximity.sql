-- CBD-first / proximity ranking support.
-- Runtime ranking primarily uses lat/lng against city CBD benchmarks in lib/geo.ts.
-- Optional is_cbd flag lets operators force CBD priority when coords are incomplete.

alter table public.venues
  add column if not exists is_cbd boolean not null default false;

create index if not exists venues_city_cbd_idx
  on public.venues (city, is_cbd desc);

create index if not exists venues_city_geo_idx
  on public.venues (city, lat, lng)
  where lat is not null and lng is not null;

comment on column public.venues.is_cbd is
  'True when the venue sits in the city CBD core. Used for CBD-first listing priority.';

-- Seed Sydney / Melbourne CBD suburb matches when lat/lng already exist near centre.
update public.venues
set is_cbd = true
where is_cbd = false
  and (
    lower(coalesce(suburb, '')) ~ '(cbd|circular quay|haymarket|chinatown|the rocks|barangaroo|wynyard)'
    or (
      lower(coalesce(city, '')) in ('sydney', 'melbourne')
      and lat is not null
      and lng is not null
      and (
        (lower(city) = 'sydney' and abs(lat - -33.8688) < 0.012 and abs(lng - 151.2093) < 0.012)
        or (lower(city) = 'melbourne' and abs(lat - -37.8136) < 0.012 and abs(lng - 144.9631) < 0.012)
      )
    )
  );
