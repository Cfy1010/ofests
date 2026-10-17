-- #10 — Lot 1 : festivals absents des catalogues internationaux (ADR 0010).
-- À lancer à la main dans l'SQL Editor de Supabase (production). Ce dossier
-- n'est lu par le CLI ni comme migration ni comme seed.
--
-- Une seule transaction : « pas de publication sans source » (ADR 0007) est
-- vérifiée en fin de transaction, après l'insertion des sources. Si une
-- règle échoue, rien n'est écrit. Script non rejouable : un second passage
-- échoue sur l'unicité des slugs, sans rien écrire.
-- submitted_by reste à sa valeur par défaut (auth.uid(), null dans l'éditeur).
--
-- Sources consultées le 2026-10-17. Écarté de ce lot : Rock The Lakes,
-- présent sur FestT (hors critère du Product Goal).
-- Éditions passées (2026) : publiées avec leurs dates, elles donnent une fiche
-- (ADR 0023) mais n'apparaissent pas dans la liste « à venir ».

begin;

insert into public.festivals (name, slug, website, main_genre, subgenres, status) values
  ('Metal Hunting Open Air',          'metal-hunting-open-air',        'https://metalhunting.fr/',
     'extreme',          array['Death Metal', 'Thrash Metal', 'Blackened Death Metal', 'Crossover Thrash', 'Metalcore'], 'published'),
  ('Mauges Pit Fest',                 'mauges-pit-fest',               'https://maugespitfest.fr/',
     'all-styles',       array['Stoner Metal', 'Melodic Death Metal', 'Hard Rock', 'Hardcore', 'Garage Punk'],          'published'),
  ('Wellesweiler Open Air',           'wellesweiler-open-air',         'https://wellesweiler-open-air.com/',
     'heavy-classic',    array['Heavy Metal', 'Hard Rock'],                                                             'published'),
  ('Winteriip',                       'winteriip',                     'https://www.riipfest.com/',
     'hardcore-punk',    array['Hardcore', 'Metallic Hardcore', 'Sludge Metal', 'Crossover Thrash'],                    'published'),
  ('Riipfest',                        'riipfest',                      'https://www.riipfest.com/',
     'hardcore-punk',    array['Hardcore Punk', 'Crossover Thrash', 'Progressive Metalcore', 'Post-Punk'],              'published'),
  ('Liège Metal Fest – Spring Break', 'liege-metal-fest-spring-break', null,
     'progressive-avant-garde', array['Post-Metal', 'Post-Black Metal', 'Post-Hardcore', 'Melodic Death Metal'],       'published');

insert into public.editions
  (festival_id, year, start_date, end_date, venue_name, city, postcode, country_code, status)
select f.id, v.year, v.start_date, v.end_date, v.venue_name, v.city, v.postcode, v.country_code, 'published'
from (values
  ('metal-hunting-open-air',        2026, date '2026-06-12', date '2026-06-13', null,                    'Hunting',                      '57480', 'FR'),
  ('mauges-pit-fest',               2026, date '2026-10-02', date '2026-10-03', 'Salle Thomas-Dupouet',  'Saint-Macaire-en-Mauges',      '49450', 'FR'),
  ('wellesweiler-open-air',         2027, date '2027-08-06', date '2027-08-07', 'Berthold-Günther-Platz', 'Wellesweiler',                '66539', 'DE'),
  ('winteriip',                     2026, date '2026-12-12', date '2026-12-12', 'Salle Maria-Callas',    'La Ville-aux-Dames',           null,    'FR'),
  ('riipfest',                      2026, date '2026-07-03', date '2026-07-04', 'Espace Oésia',          'Notre-Dame-d''Oé',             '37390', 'FR'),
  ('liege-metal-fest-spring-break', 2026, date '2026-04-25', date '2026-04-25', 'Maison du Peuple',      'Grâce-Hollogne',               '4460',  'BE')
) as v (slug, year, start_date, end_date, venue_name, city, postcode, country_code)
join public.festivals f on f.slug = v.slug;

-- Sources des festivals
insert into public.sources (festival_id, url, kind, consulted_on)
select f.id, v.url, v.kind, date '2026-10-17'
from (values
  ('metal-hunting-open-air',        'https://metalhunting.fr/',                 'official'),
  ('mauges-pit-fest',               'https://maugespitfest.fr/',                'official'),
  ('wellesweiler-open-air',         'https://wellesweiler-open-air.com/',       'official'),
  ('winteriip',                     'https://www.riipfest.com/',                'official'),
  ('riipfest',                      'https://www.riipfest.com/',                'official'),
  ('liege-metal-fest-spring-break', 'https://www.shootmeagain.com/agenda/37969_2026-04-25_liegemetalfestspringbreak2026_gracehollogne_maisondupeuple_raum', 'press')
) as v (slug, url, kind)
join public.festivals f on f.slug = v.slug;

-- Sources des éditions
insert into public.sources (edition_id, url, kind, consulted_on)
select e.id, v.url, v.kind, date '2026-10-17'
from (values
  ('metal-hunting-open-air',        2026, 'https://www.festivalenfrance.com/festival/metal-hunting-open-air', 'directory'),
  ('mauges-pit-fest',               2026, 'https://maugespitfest.fr/',                                        'official'),
  ('wellesweiler-open-air',         2027, 'https://wellesweiler-open-air.com/',                               'official'),
  ('winteriip',                     2026, 'https://www.riipfest.com/',                                        'official'),
  ('riipfest',                      2026, 'https://www.festivalenfrance.com/festival/riip-fest',              'directory'),
  ('liege-metal-fest-spring-break', 2026, 'https://www.shootmeagain.com/agenda/37969_2026-04-25_liegemetalfestspringbreak2026_gracehollogne_maisondupeuple_raum', 'press')
) as v (slug, year, url, kind)
join public.festivals f on f.slug = v.slug
join public.editions e on e.festival_id = f.id and e.year = v.year;

commit;
