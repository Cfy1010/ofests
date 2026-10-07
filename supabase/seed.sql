-- Jeu de données local, chargé par `supabase db reset`. Jamais en production.
-- Festivals fictifs uniquement (domaines en .example).
-- Les dates sont relatives à current_date : le jeu reste valide dans le temps.
-- Les genres viennent de la migration genres_hierarchie.
--
-- Liste à venir attendue pour un visiteur (ADR 0016, 0019), N = année en cours :
--   1. Brume Noire Fest           en cours
--   2. Granit Open Air            dans 10 jours
--   3. Kaltfront Festival         dans 30 jours, un seul jour
--   4. Écho des Tourbières        18-20 juin N+1   } même date : tri par nom,
--   5. Fjordblast                 18-20 juin N+1   } « Écho » avant « Fjordblast »
--   6. Zénith Noir Open Air       18-20 juin N+1   } malgré l'accent
--   7. Vieux Loup Metal Days      4-5 décembre N+1
--   8. Cendres Fest               N+1 sans date, sans ville } après les datées
--   9. Étoile Polaire Metal Fest  N+1 sans date             } de N+1, par nom
--  10. Iron Meadow                9-11 juin N+2 : après les sans date de N+1
-- (2 et 3 passent en N+1 si le jeu est chargé en fin d'année.)
-- Absents : Nordwind Rites (édition passée), l'édition N-1 de Vieux Loup,
-- son édition N+2 (en attente), Marteau-Pilon Fest (en attente) et
-- Sabbat des Landes (rejeté).

-- Une seule transaction : la règle « pas de publication sans source » est
-- vérifiée au commit (ADR 0007).
begin;

insert into public.festivals (name, slug, website, main_genre, status) values
  ('Brume Noire Fest',          'brume-noire-fest',          'https://brume-noire-fest.example',          'black-metal',   'published'),
  ('Granit Open Air',           'granit-open-air',           'https://granit-open-air.example',           'heavy-metal',   'published'),
  ('Kaltfront Festival',        'kaltfront-festival',        'https://kaltfront-festival.example',        'doom-stoner',   'published'),
  ('Écho des Tourbières',       'echo-des-tourbieres',       'https://echo-des-tourbieres.example',       'folk-pagan',    'published'),
  ('Fjordblast',                'fjordblast',                'https://fjordblast.example',                'extreme',       'published'),
  ('Zénith Noir Open Air',      'zenith-noir-open-air',      'https://zenith-noir-open-air.example',      'all-styles',    'published'),
  ('Vieux Loup Metal Days',     'vieux-loup-metal-days',     'https://vieux-loup-metal-days.example',     'thrash-metal',  'published'),
  ('Cendres Fest',              'cendres-fest',              null,                                        'death-metal',   'published'),
  ('Étoile Polaire Metal Fest', 'etoile-polaire-metal-fest', 'https://etoile-polaire-metal-fest.example', 'all-styles',    'published'),
  ('Iron Meadow',               'iron-meadow',               'https://iron-meadow.example',               'heavy-classic', 'published'),
  ('Nordwind Rites',            'nordwind-rites',            'https://nordwind-rites.example',            'black-metal',   'published'),
  ('Marteau-Pilon Fest',        'marteau-pilon-fest',        null,                                        'metalcore',     'pending'),
  ('Sabbat des Landes',         'sabbat-des-landes',         null,                                        'doom-metal',    'rejected');

-- L'année se déduit de la date de début (contrainte start_matches_year) ;
-- undated_year ne sert qu'aux éditions sans date.
with y as (select extract(year from current_date)::int as now)
insert into public.editions (festival_id, year, start_date, end_date, city, country_code, status)
select f.id,
       coalesce(extract(year from v.start_date)::int, v.undated_year),
       v.start_date, v.end_date, v.city, v.country_code,
       v.status::public.record_status
from y
cross join lateral (values
  -- en cours
  ('brume-noire-fest',          current_date - 1,             current_date + 1,             null::int, 'Rennes',           'FR', 'published'),
  -- bientôt
  ('granit-open-air',           current_date + 10,            current_date + 12,            null,      'Brno',             'CZ', 'published'),
  -- un seul jour, sans date de fin
  ('kaltfront-festival',        current_date + 30,            null,                         null,      'Leipzig',          'DE', 'published'),
  -- trois éditions aux mêmes dates : départagées par le nom
  ('echo-des-tourbieres',       make_date(y.now + 1, 6, 18),  make_date(y.now + 1, 6, 20),  null,      'Liège',            'BE', 'published'),
  ('fjordblast',                make_date(y.now + 1, 6, 18),  make_date(y.now + 1, 6, 20),  null,      'Bergen',           'NO', 'published'),
  ('zenith-noir-open-air',      make_date(y.now + 1, 6, 18),  make_date(y.now + 1, 6, 20),  null,      'Clermont-Ferrand', 'FR', 'published'),
  -- un festival, trois éditions : passée, à venir, en attente
  ('vieux-loup-metal-days',     make_date(y.now - 1, 12, 5),  make_date(y.now - 1, 12, 6),  null,      'Grenoble',         'FR', 'published'),
  ('vieux-loup-metal-days',     make_date(y.now + 1, 12, 4),  make_date(y.now + 1, 12, 5),  null,      'Grenoble',         'FR', 'published'),
  ('vieux-loup-metal-days',     make_date(y.now + 2, 12, 3),  make_date(y.now + 2, 12, 4),  null,      'Grenoble',         'FR', 'pending'),
  -- sans date, année N+1 : après toutes les éditions datées de N+1
  ('cendres-fest',              null,                         null,                         y.now + 1, null,               'ES', 'published'),
  ('etoile-polaire-metal-fest', null,                         null,                         y.now + 1, 'Oulu',             'FI', 'published'),
  -- datée, année N+2 : après les éditions sans date de N+1
  ('iron-meadow',               make_date(y.now + 2, 6, 9),   make_date(y.now + 2, 6, 11),  null,      'Utrecht',          'NL', 'published'),
  -- passée : hors de la liste à venir
  ('nordwind-rites',            current_date - 40,            current_date - 38,            null,      'Gdańsk',           'PL', 'published'),
  -- festival en attente ou rejeté : invisible du public
  ('marteau-pilon-fest',        current_date + 60,            current_date + 61,            null,      'Lille',            'FR', 'pending'),
  ('sabbat-des-landes',         null,                         null,                         y.now + 1, 'Mont-de-Marsan',   'FR', 'rejected')
) as v(slug, start_date, end_date, undated_year, city, country_code, status)
join public.festivals f on f.slug = v.slug;

-- Une source par fiche publiée
insert into public.sources (festival_id, url, kind)
select f.id, 'https://' || f.slug || '.example/', 'official'
from public.festivals f
where f.status = 'published';

insert into public.sources (edition_id, url, kind)
select e.id, 'https://' || f.slug || '.example/' || e.year, 'official'
from public.editions e
join public.festivals f on f.id = e.festival_id
where e.status = 'published';

commit;
