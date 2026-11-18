-- #89 — Lot 3 : Resurrection Fest, Mystic Festival, Hell over Valhalla
-- OpenAir, Pyrenean Warriors Open Air, Blasphemic Rites Open Air.
-- À lancer à la main dans l'SQL Editor de Supabase (production). Ce dossier
-- n'est lu par le CLI ni comme migration ni comme seed.
--
-- Une seule transaction : « pas de publication sans source » (ADR 0007) est
-- vérifiée en fin de transaction, après l'insertion des sources. Si une
-- règle échoue, rien n'est écrit. Script non rejouable : un second passage
-- échoue sur l'unicité des slugs, sans rien écrire.
-- submitted_by reste à sa valeur par défaut (auth.uid(), null dans l'éditeur).
--
-- Données relevées et sources consultées le 2026-11-18. Aucune donnée reprise
-- de FestT ni de FEST.
-- Genre principal : « all-styles » (toutes tendances) pour Resurrection Fest
-- et Mystic Festival, « extreme » pour Hell over Valhalla et Blasphemic
-- Rites, « heavy-classic » pour Pyrenean Warriors (ADR 0017).
-- Lieu : ville géocodée une fois avec Nominatim le 2026-11-18 (ADR 0011),
-- seuls noms, codes ISO 3166-2 et coordonnées du centre de la commune sont
-- stockés. © les contributeurs d'OpenStreetMap. Codes postaux laissés vides :
-- Nominatim n'en renvoie pas pour ces communes. Nom du site (venue_name)
-- renseigné pour Mystic seulement.
-- Hell over Valhalla, Pyrenean Warriors et Blasphemic Rites : aucune
-- édition, prochaine édition non annoncée. Le lieu étant porté par l'édition
-- (ADR 0013), leur commune n'est pas stockée.
-- Site officiel inconnu pour Hell over Valhalla et Blasphemic Rites :
-- website vide. Pour Pyrenean Warriors, website est la billetterie de
-- l'organisateur.

begin;

insert into public.festivals (name, slug, website, main_genre, status) values
  ('Resurrection Fest',                'resurrection-fest',                'https://www.resurrectionfest.es',        'all-styles',    'published'),
  ('Mystic Festival',                  'mystic-festival',                  'https://www.mysticfestival.pl',          'all-styles',    'published'),
  ('Hell over Valhalla OpenAir',       'hell-over-valhalla-openair',       null,                                     'extreme',       'published'),
  ('Pyrenean Warriors Open Air',       'pyrenean-warriors-open-air',       'https://billetterie.festik.net/pwoa/',   'heavy-classic', 'published'),
  ('Blasphemic Rites Open Air',        'blasphemic-rites-open-air',        null,                                     'extreme',       'published');

insert into public.editions
  (festival_id, year, start_date, end_date, venue_name, city, county, region, postcode, country_code,
   subdivision_codes, latitude, longitude, status)
select f.id, v.year, v.start_date, v.end_date, v.venue_name, v.city, v.county, v.region, v.postcode, v.country_code,
       v.subdivision_codes, v.latitude, v.longitude, 'published'
from (values
  ('resurrection-fest', 2027, date '2027-06-30', date '2027-07-03', null,                        'Viveiro', 'A Mariña Occidental', 'Galicia',                null, 'ES',
     array['ES-GA', 'ES-LU'], 43.6433582::double precision, -7.5957612::double precision),
  ('mystic-festival',   2027, date '2027-06-10', date '2027-06-12', 'Polsat Plus Arena (Letnica)', 'Gdańsk',  null,                  'Pomeranian Voivodeship', null, 'PL',
     array['PL-22'],          54.3706858::double precision, 18.6129831::double precision)
) as v (slug, year, start_date, end_date, venue_name, city, county, region, postcode, country_code,
        subdivision_codes, latitude, longitude)
join public.festivals f on f.slug = v.slug;

-- Sources des festivals
insert into public.sources (festival_id, url, kind, consulted_on)
select f.id, v.url, v.kind, date '2026-11-18'
from (values
  ('resurrection-fest',          'https://www.resurrectionfest.es',                                                                                          'official'),
  ('mystic-festival',            'https://www.mysticfestival.pl',                                                                                            'official'),
  ('hell-over-valhalla-openair', 'https://www.nauders.com/en/News/Events/Hell-over-Valhalla-OpenAir-2025_ev-20606',                                          'directory'),
  ('pyrenean-warriors-open-air', 'https://www.tourisme-pyreneesorientales.com/agenda/pyrenean-warriors-open-air-torreilles-fr-6274230/',                     'directory'),
  ('blasphemic-rites-open-air',  'https://eventfrog.at/en/p/festivals/other-festivals/blasphemic-rites-open-air-2026-7429435555677534585.html',              'ticketing')
) as v (slug, url, kind)
join public.festivals f on f.slug = v.slug;

-- Sources des éditions. Resurrection : la même page source le festival et
-- l'édition, d'où deux lignes (une source n'a qu'un parent). Mystic : billet
-- officiel donnant dates et lieu.
insert into public.sources (edition_id, url, kind, consulted_on)
select e.id, v.url, v.kind, date '2026-11-18'
from (values
  ('resurrection-fest', 2027, 'https://www.resurrectionfest.es', 'official'),
  ('mystic-festival',   2027, 'https://www.mysticfestival.pl/?p=197571', 'official')
) as v (slug, year, url, kind)
join public.festivals f on f.slug = v.slug
join public.editions e on e.festival_id = f.id and e.year = v.year;

commit;
