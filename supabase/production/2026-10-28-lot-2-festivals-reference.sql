-- #45 — Lot 2 : festivals de référence.
-- À lancer à la main dans l'SQL Editor de Supabase (production). Ce dossier
-- n'est lu par le CLI ni comme migration ni comme seed.
--
-- Une seule transaction : « pas de publication sans source » (ADR 0007) est
-- vérifiée en fin de transaction, après l'insertion des sources. Si une
-- règle échoue, rien n'est écrit. Script non rejouable : un second passage
-- échoue sur l'unicité des slugs, sans rien écrire.
-- submitted_by reste à sa valeur par défaut (auth.uid(), null dans l'éditeur).
--
-- Données relevées et sources consultées le 2026-10-28, sur les sites
-- officiels. Aucune donnée reprise de FestT ni de FEST.
-- Genre principal : « all-styles » (toutes tendances) pour les cinq (ADR 0017).
-- Lieu : ville géocodée une fois avec Nominatim le 2026-10-28 (ADR 0011),
-- seuls noms, codes postaux, codes ISO 3166-2 et coordonnées du centre de la
-- commune sont stockés. © les contributeurs d'OpenStreetMap. Nom du site
-- (venue_name) renseigné pour Graspop et Motocultor, laissé vide pour Wacken
-- et Rock The Lakes. Code postal de Dessel laissé vide : Nominatim n'en
-- renvoie pas.
-- Sylak Open Air : aucune édition, prochaine édition non annoncée. Le lieu
-- étant porté par l'édition (ADR 0013), sa commune n'est pas stockée.

begin;

insert into public.festivals (name, slug, website, main_genre, status) values
  ('Wacken Open Air',       'wacken-open-air',       'https://www.wacken.com/',             'all-styles', 'published'),
  ('Graspop Metal Meeting', 'graspop-metal-meeting', 'https://www.graspop.be/en/',          'all-styles', 'published'),
  ('Sylak Open Air',        'sylak-open-air',        'https://www.sylakopenair.com',        'all-styles', 'published'),
  ('Motocultor Festival',   'motocultor-festival',   'https://www.motocultor-festival.com/', 'all-styles', 'published'),
  ('Rock The Lakes',        'rock-the-lakes',        'https://www.rockthelakes.ch/',        'all-styles', 'published');

insert into public.editions
  (festival_id, year, start_date, end_date, venue_name, city, county, region, postcode, country_code,
   subdivision_codes, latitude, longitude, status)
select f.id, v.year, v.start_date, v.end_date, v.venue_name, v.city, v.county, v.region, v.postcode, v.country_code,
       v.subdivision_codes, v.latitude, v.longitude, 'published'
from (values
  ('wacken-open-air',       2027, date '2027-07-28', date '2027-07-31', null,                      'Wacken',           'Kreis Steinburg',            'Schleswig-Holstein',   '25596', 'DE',
     array['DE-SH'],           54.0198564::double precision,  9.3765998::double precision),
  ('graspop-metal-meeting', 2027, date '2027-06-17', date '2027-06-20', 'Festival Park Stenehei',  'Dessel',           'Turnhout',                   'Antwerp',              null,    'BE',
     array['BE-VLG', 'BE-VAN'], 51.2390765::double precision,  5.1128221::double precision),
  ('motocultor-festival',   2027, date '2027-08-19', date '2027-08-22', 'Site de Kerampuilh',      'Carhaix-Plouguer', 'Finistère',                  'Brittany',             '29270', 'FR',
     array['FR-BRE', 'FR-29'], 48.2764997::double precision, -3.5711477::double precision),
  ('rock-the-lakes',        2027, date '2027-08-20', date '2027-08-22', null,                      'Cudrefin',         'District de la Broye-Vully', 'Vaud',                 '1588',  'CH',
     array['CH-VD'],           46.9560359::double precision,  7.0183078::double precision)
) as v (slug, year, start_date, end_date, venue_name, city, county, region, postcode, country_code,
        subdivision_codes, latitude, longitude)
join public.festivals f on f.slug = v.slug;

-- Sources des festivals
insert into public.sources (festival_id, url, kind, consulted_on)
select f.id, v.url, v.kind, date '2026-10-28'
from (values
  ('wacken-open-air',       'https://www.wacken.com/',              'official'),
  ('graspop-metal-meeting', 'https://www.graspop.be/en/',           'official'),
  ('sylak-open-air',        'https://www.sylakopenair.com',         'official'),
  ('motocultor-festival',   'https://www.motocultor-festival.com/', 'official'),
  ('rock-the-lakes',        'https://www.rockthelakes.ch/',         'official')
) as v (slug, url, kind)
join public.festivals f on f.slug = v.slug;

-- Sources des éditions. Motocultor : la même page source le festival et
-- l'édition, d'où deux lignes (une source n'a qu'un parent).
insert into public.sources (edition_id, url, kind, consulted_on)
select e.id, v.url, v.kind, date '2026-10-28'
from (values
  ('wacken-open-air',       2027, 'https://www.wacken.com/en/tickets-shop/ticket-overview-2027/', 'official'),
  ('graspop-metal-meeting', 2027, 'https://www.graspop.be/en/info/festival-essentials',           'official'),
  ('motocultor-festival',   2027, 'https://www.motocultor-festival.com/',                         'official'),
  ('rock-the-lakes',        2027, 'https://www.rockthelakes.ch/de/home-2027/',                    'official')
) as v (slug, year, url, kind)
join public.festivals f on f.slug = v.slug
join public.editions e on e.festival_id = f.id and e.year = v.year;

commit;
