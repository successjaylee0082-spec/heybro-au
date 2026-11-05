-- Extend custom_highlights JSONB contract for Canva-style venue templates.
-- Shape: {
--   tier: 'free' | 'managed' | 'vip',
--   managedBadge: 'pro' | 'vip',
--   hook: { title, subtitle? },
--   badges: [{ kind, label, value?, tone? }],
--   promo: { title, body?, ctaLabel?, ctaHref? }
-- }
comment on column public.venues.custom_highlights is
  'JSONB Canva-template widgets: { tier, managedBadge, hook, badges[], promo{} }. VIP/managed unlocks neon chrome ($40/mo).';
comment on column public.venues.is_managed is
  'Agency / PRO / VIP managed listing ($40/mo) — unlocks neon border, elite badges, custom hook box.';
