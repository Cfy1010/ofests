-- #3 — Tests des règles RLS (pgTAP)
-- Lancer : npx supabase test db
-- Tout se passe dans une transaction annulée à la fin : la base n'est pas modifiée.
-- Effet de bord : le trigger différé « pas de publication sans source »
-- ne se déclenche jamais ici, ce qui permet un jeu de données minimal.
begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

-- Jeu de données, inséré en tant que postgres (qui ignore la RLS)
insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.local'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.local');

insert into public.genres (slug) values ('black-metal');

insert into public.festivals (id, name, slug, main_genre, status, submitted_by) values
  ('11111111-1111-1111-1111-111111111111', 'Fest publié', 'fest-publie',
   'black-metal', 'published', null),
  ('22222222-2222-2222-2222-222222222222', 'Fest en attente', 'fest-en-attente',
   'black-metal', 'pending', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

insert into public.editions (id, festival_id, year, country_code, status, submitted_by) values
  -- publiée, festival publié : visible de tous
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   2027, 'FR', 'published', null),
  -- publiée, mais festival en attente : invisible pour anon (choix 4)
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222',
   2027, 'BE', 'published', null),
  -- en attente, soumise par A
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222',
   2028, 'BE', 'pending', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

insert into public.sources (festival_id, edition_id, url, kind, submitted_by) values
  ('11111111-1111-1111-1111-111111111111', null,
   'https://fest-publie.example', 'official', null),
  (null, '33333333-3333-3333-3333-333333333333',
   'https://fest-publie.example/2027', 'official', null),
  ('22222222-2222-2222-2222-222222222222', null,
   'https://fest-en-attente.example', 'official', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Visiteur anonyme
set local role anon;

select is((select count(*)::int from public.genres), 1,
  'anon lit les genres');
select is((select count(*)::int from public.festivals), 1,
  'anon ne voit que les festivals publiés');
select is((select count(*)::int from public.editions), 1,
  'anon ne voit pas une édition publiée dont le festival est en attente');
select is((select count(*)::int from public.sources), 2,
  'anon ne voit que les sources des fiches visibles');
select throws_ok(
  $$insert into public.festivals (name, slug, main_genre)
    values ('Intrus', 'intrus', 'black-metal')$$,
  '42501', null, 'anon ne peut rien créer');

-- Utilisateur A
reset role;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

select is((select count(*)::int from public.festivals), 2,
  'A voit les festivals publiés et ses fiches en attente');
select is((select count(*)::int from public.editions), 3,
  'A voit les éditions de festivals visibles, dont les siennes');
select lives_ok(
  $$insert into public.festivals (name, slug, main_genre)
    values ('Nouveau fest', 'nouveau-fest', 'black-metal')$$,
  'A crée un festival en attente, à son nom par défaut');
select throws_ok(
  $$insert into public.festivals (name, slug, main_genre, status)
    values ('Direct', 'direct', 'black-metal', 'published')$$,
  '42501', null, 'A ne peut pas créer une fiche publiée');
select throws_ok(
  $$insert into public.festivals (name, slug, main_genre, submitted_by)
    values ('Usurpé', 'usurpe', 'black-metal', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')$$,
  '42501', null, 'A ne peut pas créer au nom de B');
select lives_ok(
  $$insert into public.sources (festival_id, url, kind)
    values ('22222222-2222-2222-2222-222222222222',
            'https://fest-en-attente.example/billets', 'ticketing')$$,
  'A ajoute une source à sa fiche en attente');
select throws_ok(
  $$insert into public.sources (festival_id, url, kind)
    values ('11111111-1111-1111-1111-111111111111', 'https://spam.example', 'other')$$,
  '42501', null, 'A ne peut pas ajouter de source à une fiche publiée');
select throws_ok(
  $$update public.festivals set name = 'Renommé'$$,
  '42501', null, 'A ne peut rien modifier');
select throws_ok(
  $$delete from public.festivals$$,
  '42501', null, 'A ne peut rien supprimer');

-- Utilisateur B
reset role;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

select is((select count(*)::int from public.festivals), 1,
  'B ne voit pas les fiches en attente de A');
select throws_ok(
  $$insert into public.editions (festival_id, year, country_code)
    values ('22222222-2222-2222-2222-222222222222', 2029, 'BE')$$,
  '42501', null, 'B ne peut pas accrocher une édition à la fiche en attente de A');

select * from finish();
rollback;
