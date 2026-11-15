-- Expand Melbourne verified directory manager PINs (15 venues).
-- Master admin PIN 8899 remains app-only.

  update public.venues set manager_pin = '8015' where slug = 'melb-2' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8016' where slug = 'melb-3' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8017' where slug = 'melb-4' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8018' where slug = 'melb-5' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '4511' where slug = 'melb-11' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8020' where slug = 'melb-7' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8021' where slug = 'melb-8' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '4513' where slug = 'melb-13' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8019' where slug = 'melb-6' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '8022' where slug = 'melb-9' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '4515' where slug = 'melb-15' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '4512' where slug = 'melb-12' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '4514' where slug = 'melb-14' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '4516' where slug = 'melb-16' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
  update public.venues set manager_pin = '4510' where slug = 'melb-10' and (manager_pin is null or manager_pin = '' or manager_pin = '8899');
