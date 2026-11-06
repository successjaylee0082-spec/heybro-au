-- Extend custom_highlights JSONB contract for Canva-style venue templates.
-- Shape: {
--   tier: 'free' | 'managed' | 'vip' | 'enterprise',
--   managedBadge: 'pro' | 'vip',
--   hook: { title, subtitle? },
--   badges: [{ kind, label, value?, tone? }],
--   promo: { title, body?, ctaLabel?, ctaHref? }
-- }
comment on column public.venues.custom_highlights is
  'JSONB Canva-template widgets: { tier, managedBadge, hook, badges[], promo{} }. Managed VIP Elite $149 / Enterprise $249 unlock neon chrome.';
comment on column public.venues.is_managed is
  'Agency / PRO / VIP / Enterprise managed listing ($149–$249/mo) — unlocks neon border, elite badges, custom hook box.';
