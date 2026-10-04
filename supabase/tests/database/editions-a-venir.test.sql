-- #3 — Tests : éditions à venir et publication sans date (ADR 0016)
begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

-- black-metal : inséré par la migration genres_hierarchie (#18)

-- Huit festivals publiés : un par cas à tester (une seule édition par an et par festival)
insert into public.festivals (id, name, slug, main_genre, status)
select ('f0000000-0000-0000-0000-00000000000' || n)::uuid, 'Fest ' || n, 'f' || n,
       'black-metal', 'published'
from generate_series(1, 8) n;

insert into public.editions (id, festival_id, year, start_date, end_date, country_code, status) values
  -- passée : exclue
  ('e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001',
   extract(year from current_date - 40), current_date - 40, current_date - 38, 'FR', 'published'),
  -- en cours : incluse
  ('e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002',
   extract(year from current_date - 1), current_date - 1, current_date + 1, 'FR', 'published'),
  -- un seul jour, aujourd'hui, sans date de fin : incluse
  ('e0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003',
   extract(year from current_date), current_date, null, 'FR', 'published'),
  -- bientôt : incluse
  ('e0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000004',
   extract(year from current_date + 10), current_date + 10, current_date + 12, 'FR', 'published'),
  -- plus tard, en attente : incluse pour postgres, invisible pour anon
  ('e0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000005',
   extract(year from current_date + 100), current_date + 100, null, 'FR', 'pending'),
  -- sans date, année future : incluse, en dernier
  ('e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000006',
   extract(year from current_date) + 1, null, null, 'FR', 'published'),
  -- sans date, année passée (en attente, donc autorisée) : exclue
  ('e0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000007',
   extract(year from current_date) - 1, null, null, 'FR', 'pending');

-- Tri et filtrage (en tant que postgres, qui ignore la RLS)
select results_eq(
  $$select id from public.upcoming_editions$$,
  $$values ('e0000000-0000-0000-0000-000000000002'::uuid),
           ('e0000000-0000-0000-0000-000000000003'::uuid),
           ('e0000000-0000-0000-0000-000000000004'::uuid),
           ('e0000000-0000-0000-0000-000000000005'::uuid),
           ('e0000000-0000-0000-0000-000000000006'::uuid)$$,
  'À venir : en cours, puis par date de début, sans date en dernier ; passées exclues');

-- La vue applique la RLS du lecteur
set local role anon;
select is((select count(*)::int from public.upcoming_editions), 4,
  'anon ne voit dans la vue que les éditions publiées');
reset role;

-- Règle de publication
select throws_ok(
  $$insert into public.editions (festival_id, year, country_code, status)
    values ('f0000000-0000-0000-0000-000000000008', extract(year from current_date), 'FR', 'published')$$,
  'P0001', null, 'Une édition de l''année en cours sans dates ne peut pas être publiée');
select throws_ok(
  $$insert into public.editions (festival_id, year, country_code, status)
    values ('f0000000-0000-0000-0000-000000000008', extract(year from current_date) - 1, 'FR', 'published')$$,
  'P0001', null, 'Une édition passée sans dates ne peut pas être publiée');
select lives_ok(
  $$insert into public.editions (festival_id, year, country_code, status)
    values ('f0000000-0000-0000-0000-000000000008', extract(year from current_date) + 1, 'FR', 'published')$$,
  'Une édition d''une année future peut être publiée sans dates');
select throws_ok(
  $$update public.editions set start_date = null, end_date = null
    where id = 'e0000000-0000-0000-0000-000000000002'$$,
  'P0001', null, 'On ne peut pas retirer les dates d''une édition publiée de l''année en cours');

select * from finish();
rollback;
