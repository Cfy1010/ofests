begin;
select plan(7);

select is((select count(*)::int from public.genres where parent_slug is null), 11,
  '11 entrées de niveau 1 (10 tendances + all-styles)');
select is((select count(*)::int from public.genres where parent_slug is not null), 31,
  '31 genres de niveau 2');

select throws_ok(
  $$insert into public.genres (slug, parent_slug, label_fr, label_en)
    values ('melodic-death-metal', 'death-metal', 'Death mélodique', 'Melodic Death Metal')$$,
  'P0001', null, 'Pas de troisième niveau');

select throws_ok(
  $$insert into public.genres (slug, parent_slug, label_fr, label_en)
    values ('test-genre', 'all-styles', 'Test', 'Test')$$,
  'P0001', null, 'all-styles n''a pas d''enfant');

select throws_ok(
  $$update public.genres set slug = 'death' where slug = 'death-metal'$$,
  'P0001', null, 'Le slug est immuable');

select throws_ok(
  $$update public.genres set parent_slug = 'heavy-classic' where slug = 'extreme'$$,
  'P0001', null, 'Une tendance avec des genres ne devient pas un genre');

select throws_ok(
  $$delete from public.genres where slug = 'extreme'$$,
  '23503', null, 'Une tendance avec des genres ne se supprime pas');

select * from finish();
rollback;
