-- #15 — Tests : submitted_by n'est lisible ni du public ni des autres
-- contributeurs (ADR 0025)
-- Lancer : npx supabase test db
-- Tout se passe dans une transaction annulée à la fin : la base n'est pas modifiée.
begin;
create extension if not exists pgtap with schema extensions;
select plan(25);
-- Monde clos : le test part de tables vides, seed ou pas (annulé au rollback)
truncate public.festivals cascade;

-- Jeu de données, inséré en tant que postgres (qui ignore la RLS)
insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.local'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.local');

-- black-metal : inséré par la migration genres_hierarchie (#18)

-- Une fiche publiée soumise par A : c'est elle qui exposait submitted_by
insert into public.festivals (id, name, slug, main_genre, status, submitted_by) values
  ('11111111-1111-1111-1111-111111111111', 'Fest publié', 'fest-publie',
   'black-metal', 'published', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-2222-2222-2222-222222222222', 'Fest en attente', 'fest-en-attente',
   'black-metal', 'pending', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Édition publiée sans dates, année future : à venir (ADR 0016)
insert into public.editions (id, festival_id, year, country_code, status, submitted_by) values
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   extract(year from current_date) + 1, 'FR', 'published', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222',
   extract(year from current_date) + 1, 'BE', 'pending', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

insert into public.sources (festival_id, edition_id, url, kind, submitted_by) values
  ('11111111-1111-1111-1111-111111111111', null,
   'https://fest-publie.example', 'official', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  (null, '33333333-3333-3333-3333-333333333333',
   'https://fest-publie.example/2027', 'official', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-2222-2222-2222-222222222222', null,
   'https://fest-en-attente.example', 'official', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Visiteur anonyme : submitted_by refusé partout, même sur une fiche publiée
set local role anon;

select throws_ok($$select submitted_by from public.festivals$$,
  '42501', null, 'anon ne lit pas festivals.submitted_by');
select throws_ok($$select submitted_by from public.editions$$,
  '42501', null, 'anon ne lit pas editions.submitted_by');
select throws_ok($$select submitted_by from public.sources$$,
  '42501', null, 'anon ne lit pas sources.submitted_by');
-- La vue n'a plus la colonne : 42703 (colonne inexistante)
select throws_ok($$select submitted_by from public.upcoming_editions$$,
  '42703', null, 'anon ne lit pas upcoming_editions.submitted_by');
select throws_ok($$select * from public.festivals$$,
  '42501', null, 'anon ne peut pas faire select * (il embarquerait submitted_by)');

-- Colonnes lues par le site (src/lib/festivals.js, src/lib/upcoming.js),
-- clés étrangères des jointures PostgREST comprises
select results_eq(
  $$select id, name, slug, website, subgenres, revised_at, main_genre
    from public.festivals$$,
  $$select id, name, slug, website, subgenres, revised_at, main_genre
    from public.festivals where slug = 'fest-publie'$$,
  'anon lit les colonnes du site sur les festivals publiés');
select is(
  (select count(*)::int from (
    select id, festival_id, year, start_date, end_date, venue_name, city,
           postcode, region, country_code, revised_at
    from public.editions) e),
  1, 'anon lit les colonnes du site sur les éditions publiées');
select is(
  (select count(*)::int from (
    select id, festival_id, edition_id, url, kind, consulted_on
    from public.sources) s),
  2, 'anon lit les colonnes du site sur les sources des fiches publiées');
select is(
  (select count(*)::int from (
    select id, festival_id, year, start_date, end_date, city, country_code
    from public.upcoming_editions) u),
  1, 'anon lit les colonnes du site dans upcoming_editions');

-- Utilisateur B : pas plus que anon
reset role;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

select throws_ok($$select submitted_by from public.festivals$$,
  '42501', null, 'B ne lit pas festivals.submitted_by');
select throws_ok($$select submitted_by from public.editions$$,
  '42501', null, 'B ne lit pas editions.submitted_by');
select throws_ok($$select submitted_by from public.sources$$,
  '42501', null, 'B ne lit pas sources.submitted_by');
-- La vue n'a plus la colonne : 42703 (colonne inexistante)
select throws_ok($$select submitted_by from public.upcoming_editions$$,
  '42703', null, 'B ne lit pas upcoming_editions.submitted_by');

-- sources_insert ne lit plus submitted_by : c'est la RLS de lecture qui
-- cache à B les fiches en attente de A
select throws_ok(
  $$insert into public.sources (festival_id, url, kind)
    values ('22222222-2222-2222-2222-222222222222', 'https://spam.example', 'other')$$,
  '42501', null, 'B ne peut pas ajouter de source au festival en attente de A');
select throws_ok(
  $$insert into public.sources (edition_id, url, kind)
    values ('55555555-5555-5555-5555-555555555555', 'https://spam.example', 'other')$$,
  '42501', null, 'B ne peut pas ajouter de source à l''édition en attente de A');

-- Utilisateur A, auteur : retrouve ses fiches en attente, crée à son nom
reset role;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

select results_eq(
  $$select slug from public.festivals where status = 'pending'$$,
  $$values ('fest-en-attente')$$,
  'A retrouve son festival en attente');
select results_eq(
  $$select id from public.editions where status = 'pending'$$,
  $$values ('55555555-5555-5555-5555-555555555555'::uuid)$$,
  'A retrouve son édition en attente');
select results_eq(
  $$select url from public.sources where festival_id = '22222222-2222-2222-2222-222222222222'$$,
  $$values ('https://fest-en-attente.example')$$,
  'A retrouve les sources de sa fiche en attente');

select lives_ok(
  $$insert into public.festivals (id, name, slug, main_genre)
    values ('66666666-6666-6666-6666-666666666666', 'Nouveau fest', 'nouveau-fest', 'black-metal')$$,
  'A crée un festival en attente');
select lives_ok(
  $$insert into public.editions (id, festival_id, year, country_code)
    values ('77777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666666', 2030, 'DE')$$,
  'A accroche une édition à son festival en attente');
select lives_ok(
  $$insert into public.sources (edition_id, url, kind)
    values ('77777777-7777-7777-7777-777777777777', 'https://nouveau-fest.example/2030', 'official')$$,
  'A ajoute une source à son édition en attente');

-- Contrainte pour #8 : une écriture qui renvoie la ligne créée ne renvoie
-- jamais submitted_by
select lives_ok(
  $$insert into public.festivals (name, slug, main_genre)
    values ('Avec retour', 'avec-retour', 'black-metal') returning id$$,
  'A crée un festival et récupère son id');
select throws_ok(
  $$insert into public.festivals (name, slug, main_genre)
    values ('Retour interdit', 'retour-interdit', 'black-metal') returning submitted_by$$,
  '42501', null, 'Une écriture ne renvoie jamais submitted_by');

-- submitted_by a pris sa valeur par défaut (lu en tant que postgres)
reset role;

select is(
  (select submitted_by from public.festivals where slug = 'nouveau-fest'),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'submitted_by du festival créé vaut auth.uid() par défaut');
select is(
  (select submitted_by from public.sources where url = 'https://nouveau-fest.example/2030'),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'submitted_by de la source créée vaut auth.uid() par défaut');

select * from finish();
rollback;
