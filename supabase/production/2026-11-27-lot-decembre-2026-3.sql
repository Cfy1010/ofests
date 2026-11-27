-- #146 — Lot décembre 2026, extension du périmètre (décision du PO,
-- 2026-11-27) : Masters of Cassel X-Mas Festival, Lordfest, Charitable Metal
-- Fest, Wintermelodei et Desolation Metal Days, avec leur édition 2026 et ses
-- infos pratiques (ADR 0033).
-- À lancer à la main dans l'SQL Editor de Supabase (production), puis :
-- gh workflow run daily-rebuild.yml. Ce dossier n'est lu par le CLI ni comme
-- migration ni comme seed.
--
-- Une seule transaction : si l'un des festivals existe déjà, le premier bloc
-- lève une exception ; si une édition ou une source manque à la fin, le bloc
-- final en lève une ; « pas de publication sans source » (ADR 0007) est
-- vérifiée en fin de transaction. Dans tous ces cas, rien n'est écrit.
-- Script non rejouable.
-- submitted_by reste à sa valeur par défaut (auth.uid(), null dans l'éditeur).
--
-- Données relevées et sources consultées le 2026-11-27, sur les pages des
-- organisateurs, de la salle coproductrice et des billetteries officielles.
-- Aucun annuaire ni agenda.
-- Genre principal (ADR 0017), à valider par le PO en relecture de la PR avant
-- exécution : « all-styles » pour Masters of Cassel et Desolation Metal Days,
-- « gothic-symphonic » pour Lordfest, « metalcore » pour Charitable Metal
-- Fest, « black-metal » pour Wintermelodei. Aucun sous-genre.
-- Site du festival laissé vide pour Desolation Metal Days (aucun trouvé).
-- Lieu : nom du site, et code postal quand la source le donne, repris des
-- sources officielles. Ville géocodée une fois avec Nominatim le 2026-11-27
-- (ADR 0011), seuls noms, codes ISO 3166-2 et coordonnées du centre de la
-- ville sont stockés. © les contributeurs d'OpenStreetMap. County et région
-- vides quand Nominatim n'en renvoie pas.
--
-- Infos pratiques : une seule source par édition (ADR 0033) ; ce qu'elle ne
-- dit pas reste « non précisé ». Aucune des sources retenues ne parle de
-- camping ni d'accessibilité du lieu.
-- Masters of Cassel : place debout à 33,50 EUR.
-- Lordfest : la page de l'organisateur n'affiche aucun prix. Tout reste
-- « non précisé ».
-- Charitable Metal Fest : plein tarif en prévente à 26 EUR (tarifs adhérent
-- et réduit exclus).
-- Wintermelodei : billet normal à 59 EUR, hors frais de service (le tarif
-- early bird, limité et épuisé, est exclu).
-- Desolation Metal Days : billet des trois jours à 35 EUR, hors frais de
-- gestion.

begin;

-- Avant toute écriture : aucun des cinq festivals ne doit exister, quel que
-- soit son statut.
do $$
begin
  if exists (
    select 1 from public.festivals
    where slug in ('masters-of-cassel', 'lordfest', 'charitable-metal-fest',
                   'wintermelodei', 'desolation-metal-days')
  ) then
    raise exception 'Un festival du lot existe déjà : rien n''est écrit';
  end if;
end
$$;

insert into public.festivals (name, slug, website, main_genre, status) values
  ('Masters of Cassel X-Mas Festival', 'masters-of-cassel',     'https://masters-of-cassel.tickettoaster.de/',    'all-styles',       'published'),
  ('Lordfest',                         'lordfest',              'https://fkpscorpio.de/en/artists/detail/lordfest/', 'gothic-symphonic', 'published'),
  ('Charitable Metal Fest',            'charitable-metal-fest', 'https://www.bgpmusiclive.com/',                  'metalcore',        'published'),
  ('Wintermelodei',                    'wintermelodei',         'https://www.blacksilence.de/',                   'black-metal',      'published'),
  ('Desolation Metal Days',            'desolation-metal-days', null,                                             'all-styles',       'published');

insert into public.editions
  (festival_id, year, start_date, end_date, venue_name, city, county, region, postcode, country_code,
   subdivision_codes, latitude, longitude, status)
select f.id, v.year, v.start_date, v.end_date, v.venue_name, v.city, v.county, v.region, v.postcode, v.country_code,
       v.subdivision_codes, v.latitude, v.longitude, 'published'
from (values
  ('masters-of-cassel',     2026, date '2026-12-26', date '2026-12-27', 'Goldgrube',           'Kassel',              null,             'Hesse',                  '34127', 'DE',
     array['DE-HE'],           51.3157833::double precision,  9.4978479::double precision),
  ('lordfest',              2026, date '2026-12-18', date '2026-12-19', 'Große Freiheit 36',   'Hamburg',             null,             null,                     null,    'DE',
     array['DE-HH'],           53.5501721::double precision, 10.0013165::double precision),
  ('charitable-metal-fest', 2026, date '2026-12-12', date '2026-12-12', 'L''Empreinte',        'Savigny-le-Temple',   'Seine-et-Marne', 'Ile-de-France',          '77176', 'FR',
     array['FR-IDF', 'FR-77'], 48.5958681::double precision,  2.5798953::double precision),
  ('wintermelodei',         2026, date '2026-12-05', date '2026-12-05', 'Sputnikhalle',        'Münster',             null,             'North Rhine-Westphalia', '48155', 'DE',
     array['DE-NW'],           51.9625101::double precision,  7.6251879::double precision),
  ('desolation-metal-days', 2026, date '2026-12-04', date '2026-12-06', 'Sala Marearock',      'Alicante',            'l''Alacantí',    'Valencian Community',    null,    'ES',
     array['ES-VC', 'ES-A'],   38.3436365::double precision, -0.4881708::double precision)
) as v (slug, year, start_date, end_date, venue_name, city, county, region, postcode, country_code,
        subdivision_codes, latitude, longitude)
join public.festivals f on f.slug = v.slug;

-- Sources attendues, une ligne par festival : source du festival, source de
-- l'édition (dates et lieu), source des infos pratiques et leurs valeurs.
-- La table disparaît à la fin de la transaction.
create temporary table lot (
  slug           text,
  festival_url   text,
  festival_kind  text,
  edition_url    text,
  edition_kind   text,
  practical_url  text,
  practical_kind text,
  price_kind     text,
  price_amount   numeric(8, 2),
  price_currency text
) on commit drop;

insert into lot values
  ('masters-of-cassel',
   'https://masters-of-cassel.tickettoaster.de/produkte/106-tickets-xv-masters-of-cassel-2-tages-weihnachtsfestival-goldgrube-kassel-am-26-12-2026', 'ticketing',
   'https://masters-of-cassel.tickettoaster.de/produkte/106-tickets-xv-masters-of-cassel-2-tages-weihnachtsfestival-goldgrube-kassel-am-26-12-2026', 'ticketing',
   'https://masters-of-cassel.tickettoaster.de/produkte/106-tickets-xv-masters-of-cassel-2-tages-weihnachtsfestival-goldgrube-kassel-am-26-12-2026', 'ticketing',
   'from', 33.50, 'EUR'),
  ('lordfest',
   'https://fkpscorpio.de/en/artists/detail/lordfest/', 'official',
   'https://fkpscorpio.de/en/artists/detail/lordfest/', 'official',
   'https://fkpscorpio.de/en/artists/detail/lordfest/', 'official',
   'unspecified', null, null),
  ('charitable-metal-fest',
   'https://www.bgpmusiclive.com/post/12-d%C3%A9cembre-2026-nouvelle-%C3%A9dition-du-charitable-metal-fest-3', 'official',
   'https://www.lempreinte.net/evenements/charitable-metal-fest-ashen-aurore-mazed-northern-lights-wake-the-dead/', 'official',
   'https://www.lempreinte.net/evenements/charitable-metal-fest-ashen-aurore-mazed-northern-lights-wake-the-dead/', 'official',
   'from', 26.00, 'EUR'),
  ('wintermelodei',
   'https://www.blacksilence.de/event-details/wintermelodei-2026', 'official',
   'https://www.blacksilence.de/event-details/wintermelodei-2026', 'official',
   'https://www.blacksilence.de/event-details/wintermelodei-2026', 'official',
   'from', 59.00, 'EUR'),
  ('desolation-metal-days',
   'https://rockingticket.com/es/events/desolation-metal-days-alicante', 'ticketing',
   'https://rockingticket.com/es/events/desolation-metal-days-alicante', 'ticketing',
   'https://rockingticket.com/es/events/desolation-metal-days-alicante', 'ticketing',
   'from', 35.00, 'EUR');

-- Sources des festivals
insert into public.sources (festival_id, url, kind, consulted_on)
select f.id, l.festival_url, l.festival_kind, date '2026-11-27'
from lot l
join public.festivals f on f.slug = l.slug;

-- Sources des éditions. Quand la même page source plusieurs choses, une ligne
-- par usage (une source n'a qu'un parent).
insert into public.sources (edition_id, url, kind, consulted_on)
select e.id, l.edition_url, l.edition_kind, date '2026-11-27'
from lot l
join public.festivals f on f.slug = l.slug
join public.editions e on e.festival_id = f.id and e.year = 2026;

-- Infos pratiques et leur source dédiée, en une seule instruction (la clé
-- étrangère composée vers sources est vérifiée en fin d'instruction). Les
-- sources dédiées sont les lignes renvoyées par l'insertion.
with ed as (
  select e.id, l.*
  from lot l
  join public.festivals f on f.slug = l.slug
  join public.editions e on e.festival_id = f.id and e.year = 2026
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, ed.practical_url, ed.practical_kind, date '2026-11-27' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = ed.price_kind, price_amount = ed.price_amount,
    price_currency = ed.price_currency,
    camping = 'unspecified', accessibility = 'unspecified',
    practical_source_id = src.id, revised_at = now()
from src
join ed on ed.id = src.edition_id
where e.id = src.edition_id;

-- Contrôle final : pour chaque festival, sa source, son édition 2026, la
-- source de l'édition et la source dédiée aux infos pratiques. Toute anomalie
-- annule la transaction.
do $$
declare
  complete int;
begin
  select count(*) into complete
  from lot l
  join public.festivals f on f.slug = l.slug
  join public.editions e on e.festival_id = f.id and e.year = 2026
  join public.sources p on p.id = e.practical_source_id
  where p.url = l.practical_url
    and p.kind = l.practical_kind
    and p.consulted_on = date '2026-11-27'
    and e.price_kind = l.price_kind
    and e.price_amount is not distinct from l.price_amount
    and exists (
      select 1 from public.sources s
      where s.festival_id = f.id and s.url = l.festival_url
    )
    and exists (
      select 1 from public.sources s
      where s.edition_id = e.id and s.url = l.edition_url and s.id <> p.id
    );

  if complete <> 5 then
    raise exception '% édition(s) complète(s) au lieu de 5 : rien n''est écrit', complete;
  end if;
end
$$;

commit;

-- Contrôle après exécution (hors transaction). Attendu : 10 lignes, deux
-- sources d'édition par festival, avec practical = true pour la seule source
-- des infos pratiques.
select f.slug, f.main_genre, e.year, e.status, e.start_date, e.end_date,
       e.venue_name, e.city, e.county, e.region, e.postcode, e.country_code,
       e.price_kind, e.price_amount, e.price_currency,
       e.camping, e.accessibility,
       s.url, s.kind, s.consulted_on,
       s.id is not distinct from e.practical_source_id as practical
from public.editions e
join public.festivals f on f.id = e.festival_id
left join public.sources s on s.edition_id = e.id
where f.slug in ('masters-of-cassel', 'lordfest', 'charitable-metal-fest',
                 'wintermelodei', 'desolation-metal-days')
  and e.year = 2026
order by f.slug, practical;
