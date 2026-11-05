-- Operational profiles for directory accuracy (AUD course rates + amenities).
-- App derives deterministic per-venue ladders in lib/venue-profiles.ts; this
-- migration documents the JSON shape stored on custom_highlights.operational
-- and seeds a few managed demo rows so SQL + UI stay aligned.

comment on column public.venues.custom_highlights is
  'JSONB widgets + optional operational profile: { badges[], promo{}, hook{}, managedBadge, wechat, whatsapp, telegram, operational: { pricing[{label,duration,price}], payments[], amenities[], services[], rateLine } }.';

-- Example seed shape for managed Sydney CBD listings (idempotent merge).
-- Rates follow common AU directory ladders (≈ $150–$180 / $200–$220 / $240–$280).
update public.venues
set custom_highlights = coalesce(custom_highlights, '{}'::jsonb) || jsonb_build_object(
  'operational', jsonb_build_object(
    'tierLabel', 'Premium',
    'rateLine', '$160/30m · $210/45m · $260/60m',
    'pricing', jsonb_build_array(
      jsonb_build_object('label', '30 mins · Premium', 'duration', '30 min', 'price', '$160'),
      jsonb_build_object('label', '45 mins · Premium', 'duration', '45 min', 'price', '$210'),
      jsonb_build_object('label', '60 mins · Premium', 'duration', '60 min', 'price', '$260')
    ),
    'payments', jsonb_build_array('Cash OK', 'EFTPOS', 'WeChat Pay 微信', 'Alipay 支付宝'),
    'amenities', jsonb_build_array('Discreet Entrance', 'Private Shower', 'Discreet Parking', 'Air Conditioned'),
    'services', jsonb_build_array('Oral', 'GFE', 'Passionate Kissing', 'Body to Body')
  )
)
where is_managed = true
  and lower(coalesce(city, '')) in ('sydney', 'melbourne')
  and lower(coalesce(category, '')) in ('brothels', 'escorts-massage')
  and (custom_highlights -> 'operational') is null;
