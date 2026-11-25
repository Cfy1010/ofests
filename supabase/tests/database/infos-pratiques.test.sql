-- #46 — Tests : infos pratiques d'une édition (ADR 0033)
-- Lancer : npx supabase test db
-- Tout se passe dans une transaction annulée à la fin : la base n'est pas modifiée.
begin;
create extension if not exists pgtap with schema extensions;
select plan(20);
-- Monde clos : le test part de tables vides, seed ou pas (annulé au rollback)
truncate public.festivals cascade;

-- Jeu de données, inséré en tant que postgres (qui ignore la RLS)
insert into public.festivals (id, name, slug, main_genre, status) values
  ('11111111-1111-1111-1111-111111111111', 'Fest', 'fest', 'black-metal', 'published');

-- Deux éditions en attente (la publication exige une source, hors sujet ici)
insert into public.editions (id, festival_id, year, country_code) values
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 2030, 'FR'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 2031, 'FR');

insert into public.sources (id, festival_id, edition_id, url, kind) values
  ('aaaaaaaa-0000-0000-0000-000000000001', null, '33333333-3333-3333-3333-333333333333',
   'https://fest.example/2030/infos', 'official'),
  ('aaaaaaaa-0000-0000-0000-000000000002', null, '44444444-4444-4444-4444-444444444444',
   'https://fest.example/2031/infos', 'official'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', null,
   'https://fest.example', 'official');

-- Valeurs par défaut : tout « non précisé », sans source
select results_eq(
  $$select price_kind, price_amount, price_currency, camping, accessibility, practical_source_id
    from public.editions where id = '33333333-3333-3333-3333-333333333333'$$,
  $$values ('unspecified', null::numeric, null::text, 'unspecified', 'unspecified', null::uuid)$$,
  'Par défaut : non précisé partout, sans source');

-- Valeurs hors liste
select throws_ok(
  $$update public.editions set price_kind = 'cheap' where id = '33333333-3333-3333-3333-333333333333'$$,
  '23514', null, 'price_kind hors liste refusé');
select throws_ok(
  $$update public.editions set camping = 'maybe' where id = '33333333-3333-3333-3333-333333333333'$$,
  '23514', null, 'camping hors liste refusé');
select throws_ok(
  $$update public.editions set accessibility = 'partial' where id = '33333333-3333-3333-3333-333333333333'$$,
  '23514', null, 'accessibility hors liste refusé');

-- Une valeur renseignée exige la source
select throws_ok(
  $$update public.editions set camping = 'yes' where id = '33333333-3333-3333-3333-333333333333'$$,
  '23514', null, 'camping renseigné sans source refusé');
select throws_ok(
  $$update public.editions set price_kind = 'free' where id = '33333333-3333-3333-3333-333333333333'$$,
  '23514', null, 'prix renseigné sans source refusé');
select lives_ok(
  $$update public.editions
    set camping = 'no', accessibility = 'yes',
        practical_source_id = 'aaaaaaaa-0000-0000-0000-000000000001'
    where id = '33333333-3333-3333-3333-333333333333'$$,
  'Valeurs renseignées avec une source de l''édition');
select lives_ok(
  $$update public.editions set practical_source_id = 'aaaaaaaa-0000-0000-0000-000000000002'
    where id = '44444444-4444-4444-4444-444444444444'$$,
  'Source sans valeur renseignée : tout non précisé, vérifié à la source');

-- La source appartient à la même édition
select throws_ok(
  $$update public.editions set practical_source_id = 'aaaaaaaa-0000-0000-0000-000000000002'
    where id = '33333333-3333-3333-3333-333333333333'$$,
  '23503', null, 'Source d''une autre édition refusée');
select throws_ok(
  $$update public.editions set practical_source_id = 'aaaaaaaa-0000-0000-0000-000000000003'
    where id = '33333333-3333-3333-3333-333333333333'$$,
  '23503', null, 'Source du festival refusée');
select throws_ok(
  $$delete from public.sources where id = 'aaaaaaaa-0000-0000-0000-000000000001'$$,
  '23503', null, 'Une source utilisée par la section ne peut pas être supprimée');

-- Prix
select lives_ok(
  $$update public.editions set price_kind = 'free'
    where id = '33333333-3333-3333-3333-333333333333'$$,
  'Gratuit, sans montant');
select lives_ok(
  $$update public.editions set price_kind = 'from', price_amount = 89, price_currency = 'EUR'
    where id = '33333333-3333-3333-3333-333333333333'$$,
  'À partir de, avec montant et devise');
select throws_ok(
  $$update public.editions set price_kind = 'from', price_amount = 89, price_currency = null
    where id = '33333333-3333-3333-3333-333333333333'$$,
  '23514', null, 'Montant sans devise refusé');
select throws_ok(
  $$update public.editions set price_kind = 'from', price_amount = null, price_currency = null
    where id = '33333333-3333-3333-3333-333333333333'$$,
  '23514', null, 'À partir de sans montant refusé');
select throws_ok(
  $$update public.editions set price_kind = 'free', price_amount = 89, price_currency = 'EUR'
    where id = '33333333-3333-3333-3333-333333333333'$$,
  '23514', null, 'Montant avec gratuit refusé');
select throws_ok(
  $$update public.editions set price_amount = 0
    where id = '33333333-3333-3333-3333-333333333333'$$,
  '23514', null, 'Montant nul refusé (la gratuité a sa valeur)');
select throws_ok(
  $$update public.editions set price_currency = 'eur'
    where id = '33333333-3333-3333-3333-333333333333'$$,
  '23514', null, 'Devise hors format ISO 4217 refusée');

-- Supprimer l'édition reste possible : ses sources partent avec elle
select lives_ok(
  $$delete from public.editions where id = '33333333-3333-3333-3333-333333333333'$$,
  'L''édition se supprime avec sa source d''infos pratiques');

-- Lecture publique des nouvelles colonnes (ADR 0025)
set local role anon;
select lives_ok(
  $$select price_kind, price_amount, price_currency, camping, accessibility, practical_source_id
    from public.editions$$,
  'anon lit les colonnes des infos pratiques');

select * from finish();
rollback;
