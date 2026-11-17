-- Remove fictional Sydney demo venues and refresh street-level coords/addresses.
-- Safe to re-run: deletes are slug-scoped; updates target known Sydney slugs.

begin;

-- Companions.venue_id stores the venue slug.
delete from public.companions
where venue_id in (
  'harbour-glow-lounge',
  'surry-neon-room',
  'cross-stage-club'
);

-- Optional venue_staff rows keyed by venues.id uuid.
do $$
begin
  if to_regclass('public.venue_staff') is not null then
    delete from public.venue_staff vs
    using public.venues v
    where vs.venue_id = v.id
      and v.slug in (
        'harbour-glow-lounge',
        'surry-neon-room',
        'cross-stage-club'
      );
  end if;
end $$;

delete from public.venues
where slug in (
  'harbour-glow-lounge',
  'surry-neon-room',
  'cross-stage-club'
);

-- Street-level address + coordinate corrections.
update public.venues set
  address = '12 Hargraves Pl, Wetherill Park NSW 2164',
  suburb = 'Wetherill Park',
  lat = -33.84309,
  lng = 150.8972,
  updated_at = now()
where slug in ('cleopatras-gentlemans-club', 'sydney-asian-brothels');

-- Maggie's Girls is Potts Point (not Wetherill Park).
update public.venues set
  address = '20-22 Kellett St, Potts Point NSW 2011',
  suburb = 'Potts Point',
  lat = -33.87441,
  lng = 151.22351,
  updated_at = now()
where slug = 'maggies-girls-sydney';

update public.venues set
  address = '50 Kellett St, Potts Point NSW 2011',
  suburb = 'Potts Point',
  lat = -33.87535,
  lng = 151.22415,
  updated_at = now()
where slug = 'my-girls-sydney';

update public.venues set
  address = '377 Riley St, Surry Hills NSW 2010',
  suburb = 'Surry Hills',
  lat = -33.88737,
  lng = 151.21218,
  updated_at = now()
where slug = 'a-touch-more-class-formerly-a-touch-of-class';

update public.venues set
  address = '310 Cleveland St, Surry Hills NSW 2010',
  suburb = 'Surry Hills',
  lat = -33.89193,
  lng = 151.21559,
  updated_at = now()
where slug = 'ginza-club';

update public.venues set
  address = '99 Albion St, Surry Hills NSW 2010',
  suburb = 'Surry Hills',
  lat = -33.88257,
  lng = 151.21061,
  updated_at = now()
where slug = 'tiffanys';

update public.venues set
  address = '130 Botany Rd, Alexandria NSW 2015',
  suburb = 'Alexandria',
  lat = -33.89973,
  lng = 151.20035,
  updated_at = now()
where slug = 'dream-girl-130';

update public.venues set
  address = '2/42 Buffalo Road, Gladesville NSW 2111',
  suburb = 'Gladesville',
  lat = -33.81966,
  lng = 151.12451,
  updated_at = now()
where slug = 'the-nightshade';

update public.venues set
  address = '12 Norfolk Rd, Greenacre NSW 2190',
  suburb = 'Greenacre',
  lat = -33.89544,
  lng = 151.06657,
  updated_at = now()
where slug = 'pink-house';

update public.venues set
  address = '1/181 McCredie Road, Smithfield NSW 2164',
  suburb = 'Smithfield',
  lat = -33.84905,
  lng = 150.95288,
  updated_at = now()
where slug = 'sweet-babe-181';

update public.venues set
  address = '80 Erskine St, Sydney NSW 2000',
  suburb = 'Sydney',
  lat = -33.8669,
  lng = 151.2022,
  updated_at = now()
where slug = 'jk80-gentlemen-club';

update public.venues set
  address = 'Level 1, 69 Liverpool St, Haymarket NSW 2000 (corner of Liverpool St and Kent St)',
  suburb = 'Haymarket',
  lat = -33.8765,
  lng = 151.20554,
  updated_at = now()
where slug = 'sydney-empress-69';

commit;
