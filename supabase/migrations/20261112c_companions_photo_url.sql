-- Allow venue owners to set a custom portrait URL (or data-URL) per companion slot.

alter table public.companions
  add column if not exists photo_url text;

comment on column public.companions.photo_url is
  'Optional custom portrait. https URL, /images/... path, or small data:image upload. Null keeps the seed slot image.';
