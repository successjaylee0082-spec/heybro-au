-- Owner roster manager writes go through the service-role server action.
-- Keep public read open; do not grant anon INSERT/UPDATE/DELETE.

comment on column public.companions.is_active is
  'Working Today toggle — true shows ACTIVE NOW on the public venue roster.';
