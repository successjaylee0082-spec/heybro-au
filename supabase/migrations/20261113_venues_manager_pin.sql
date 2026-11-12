-- Unique per-venue manager PINs for /manage/[venueId] owner access.
-- Master admin fallback PIN "8899" is enforced in application code (not stored per row).
-- Apply in Supabase SQL editor / CLI. Public clients must not select manager_pin.

alter table public.venues
  add column if not exists manager_pin text;

comment on column public.venues.manager_pin is
  'Unique 4-digit venue owner PIN for /manage. Never expose via public API selects. Master admin PIN 8899 is app-only.';

-- Seed known directory slugs with unique PINs (8899 intentionally excluded).
  update public.venues set manager_pin = '5128' where slug = '57-burwood-brothel' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '3508' where slug = 'a-touch-more-class-formerly-a-touch-of-class' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '2069' where slug = 'adelaide-laneway-massage' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '7895' where slug = 'casablanca-gentlemans-club' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '0428' where slug = 'cleopatras-gentlemans-club' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '2331' where slug = 'coast-tide-retail' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '6302' where slug = 'cross-stage-club' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8413' where slug = 'cuties-escorts' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '3557' where slug = 'dream-girl-130' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '0423' where slug = 'five-star-moon' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '9644' where slug = 'fortitude-pulse' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '2876' where slug = 'ginza-club' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '2240' where slug = 'harbour-glow-lounge' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '2540' where slug = 'jk80-gentlemen-club' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '5682' where slug = 'liaisons' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '6372' where slug = 'maggies-girls-sydney' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8014' where slug = 'melb-1' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8015' where slug = 'melb-2' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8016' where slug = 'melb-3' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8017' where slug = 'melb-4' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8018' where slug = 'melb-5' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '2404' where slug = 'mistiques' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '1981' where slug = 'my-girls-sydney' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '3509' where slug = 'perth-ember-room' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '2099' where slug = 'pink-house' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '7388' where slug = 'surry-neon-room' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '1174' where slug = 'sweet-babe-181' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '1589' where slug = 'sydney-asian-brothels' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '1684' where slug = 'sydney-empress-69' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '0077' where slug = 'the-nightshade' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '4724' where slug = 'tiffanys' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8989' where slug = 'wives-only' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');

-- Any remaining venues without a usable PIN get a unique random 4-digit code.
do $$
declare
  rec record;
  candidate text;
  attempts int;
begin
  for rec in
    select id
    from public.venues
    where manager_pin is null
       or btrim(manager_pin) = ''
       or manager_pin = '8899'
  loop
    attempts := 0;
    loop
      attempts := attempts + 1;
      candidate := lpad((floor(random() * 10000))::int::text, 4, '0');
      exit when candidate <> '8899'
        and candidate !~ '^([0-9])\1{3}$'
        and candidate not in ('0000', '1111', '1234')
        and not exists (
          select 1 from public.venues v where v.manager_pin = candidate
        );
      if attempts > 5000 then
        raise exception 'Unable to allocate unique manager_pin for venue %', rec.id;
      end if;
    end loop;

    update public.venues
      set manager_pin = candidate,
          updated_at = now()
      where id = rec.id;
  end loop;
end $$;

-- Harden: prevent anon/authenticated from reading manager_pin via SELECT *.
do $$
begin
  begin
    revoke select (manager_pin) on public.venues from anon;
  exception when undefined_object then null;
  end;
  begin
    revoke select (manager_pin) on public.venues from authenticated;
  exception when undefined_object then null;
  end;
end $$;

-- Distribution map (slug -> manager_pin) applied above for seed inventory:
--   57-burwood-brothel=5128  (57 Burwood Brothel)
--   a-touch-more-class-formerly-a-touch-of-class=3508  (A Touch More Class (formerly A Touch of Class))
--   adelaide-laneway-massage=2069  (Laneway Recovery Studio)
--   casablanca-gentlemans-club=7895  (Casablanca Gentleman's Club)
--   cleopatras-gentlemans-club=0428  (Cleopatra's Gentleman's Club)
--   coast-tide-retail=2331  (Coast Tide Supply)
--   cross-stage-club=6302  (Cross Stage Club)
--   cuties-escorts=8413  (Cuties Escorts)
--   dream-girl-130=3557  (Dream Girl 130)
--   five-star-moon=0423  (Five Star Moon)
--   fortitude-pulse=9644  (Fortitude Pulse)
--   ginza-club=2876  (Ginza Club)
--   harbour-glow-lounge=2240  (Harbour Glow Lounge)
--   jk80-gentlemen-club=2540  (JK80 Gentlemen Club)
--   liaisons=5682  (Liaisons)
--   maggies-girls-sydney=6372  (Maggie's Girls Sydney)
--   melb-1=8014  (Manhattan Terrace)
--   melb-2=8015  (Top Of The Town)
--   melb-3=8016  (Gotham City House of Sin)
--   melb-4=8017  (Club Collingwood (Le Boudoir))
--   melb-5=8018  (Bambra Studio)
--   mistiques=2404  (Mistiques)
--   my-girls-sydney=1981  (My Girls Sydney)
--   perth-ember-room=3509  (Perth Ember Room)
--   pink-house=2099  (Pink House)
--   surry-neon-room=7388  (Surry Neon Room)
--   sweet-babe-181=1174  (Sweet Babe 181)
--   sydney-asian-brothels=1589  (Sydney Asian Brothels)
--   sydney-empress-69=1684  (Sydney Empress 69)
--   the-nightshade=0077  (The Nightshade)
--   tiffanys=4724  (Tiffany's)
--   wives-only=8989  (Wives Only)
