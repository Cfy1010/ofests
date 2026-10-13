-- #4 — Premières fiches de production, pour vérifier la liste à venir en ligne.
-- À lancer à la main dans l'SQL Editor de Supabase (production). Ce dossier
-- n'est lu par le CLI ni comme migration ni comme seed.
--
-- Une seule transaction : « pas de publication sans source » (ADR 0007) est
-- vérifiée en fin de transaction, après l'insertion des sources. Si une
-- règle échoue, rien n'est écrit. Script non rejouable : un second passage
-- échoue sur l'unicité des slugs, sans rien écrire.
-- submitted_by reste à sa valeur par défaut (auth.uid(), null dans l'éditeur).

begin;

insert into public.festivals (name, slug, website, main_genre, status) values
  ('Hellfest',                'hellfest',                'https://hellfest.fr',       'all-styles', 'published'),
  ('Brutal Assault',          'brutal-assault',          'https://brutalassault.cz',  'extreme',    'published'),
  -- Site officiel non confirmé
  ('Eindhoven Metal Meeting', 'eindhoven-metal-meeting', null,                        'extreme',    'published');

insert into public.editions
  (festival_id, year, start_date, end_date, venue_name, city, country_code, status)
select f.id, v.year, v.start_date, v.end_date, v.venue_name, v.city, v.country_code, 'published'
from (values
  ('hellfest',                2027, date '2027-06-17', date '2027-06-20', null,              'Clisson',   'FR'),
  ('brutal-assault',          2027, date '2027-08-04', date '2027-08-07', 'Josefov Fortress', 'Jaroměř',   'CZ'),
  ('eindhoven-metal-meeting', 2026, date '2026-12-11', date '2026-12-12', 'Effenaar',         'Eindhoven', 'NL')
) as v (slug, year, start_date, end_date, venue_name, city, country_code)
join public.festivals f on f.slug = v.slug;

-- Sources des festivals
insert into public.sources (festival_id, url, kind, consulted_on)
select f.id, v.url, v.kind, date '2026-10-13'
from (values
  ('hellfest',                'https://hellfest.fr/',                                                       'official'),
  ('brutal-assault',          'https://brutalassault.cz/en',                                                'official'),
  ('eindhoven-metal-meeting', 'https://www.festivalinfo.nl/festival/35648/Eindhoven-Metal-Meeting/2026/', 'directory')
) as v (slug, url, kind)
join public.festivals f on f.slug = v.slug;

-- Sources des éditions
insert into public.sources (edition_id, url, kind, consulted_on)
select e.id, v.url, v.kind, date '2026-10-13'
from (values
  ('hellfest',                2027, 'https://hellfest.fr/',                                                       'official'),
  ('brutal-assault',          2027, 'https://goout.net/en/brutal-assault-2027/ezspysi/',                          'ticketing'),
  ('eindhoven-metal-meeting', 2026, 'https://www.festivalinfo.nl/festival/35648/Eindhoven-Metal-Meeting/2026/', 'directory'),
  ('eindhoven-metal-meeting', 2026, 'https://www.effenaar.nl/agenda',                                           'other')
) as v (slug, year, url, kind)
join public.festivals f on f.slug = v.slug
join public.editions e on e.festival_id = f.id and e.year = v.year;

commit;
