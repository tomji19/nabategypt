-- Optional: backfill Arabic product names if your DB was seeded before name_ar existed.
-- Run in Supabase → SQL Editor.

UPDATE public.products SET name_ar = v.name_ar
FROM (VALUES
  ('irishflower', 'زهرة أيرلندية'),
  ('bluechalksticks', 'أعواد الطباشير الزرقاء'),
  ('coppersedum', 'سيدوم نحاسي'),
  ('gollumjade', 'يشب غولوم'),
  ('haworthiafasciata', 'هاورثيا فاسياتا'),
  ('sedum', 'سيدوم'),
  ('auroraborealis', 'أورورا بورياليس'),
  ('pencilcactus', 'صبار القلم'),
  ('spooncactus', 'صبار الملعقة'),
  ('kalanchoemarmorata', 'كلانشو مرمري'),
  ('kleidostylis', 'كلايدوستيليس'),
  ('lawyerstongue', 'لسان المحامي'),
  ('paddleplant', 'نبتة المجداف'),
  ('thaiplant', 'النبتة التايلاندية'),
  ('handingpothos', 'بثوس معلّق'),
  ('bamboo', 'خيزران'),
  ('snakeplant', 'نبتة الثعبان'),
  ('dracaenadragon', 'دراسينا التنين'),
  ('lemoncypress', 'سرو ليموني'),
  ('sansevieria', 'سانسيفيريا'),
  ('schefflera', 'شفليرة'),
  ('rosemary', 'إكليل الجبل'),
  ('basil', 'ريحان'),
  ('williamsplant', 'نبتة ويليام'),
  ('sanguinaria', 'سانغويناريا'),
  ('pansy', 'بنفسج الزينة'),
  ('marjoram', 'مردقوش'),
  ('periwinkle', 'ونكا'),
  ('mint', 'نعناع'),
  ('rose', 'وردة')
) AS v(slug, name_ar)
WHERE products.slug = v.slug;
