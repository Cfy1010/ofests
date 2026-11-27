-- #146 — Lot décembre 2026, suite et fin : Bloodstock Winter Gathering et De
-- Mortem et Diabolum, avec leur édition 2026 et ses infos pratiques
-- (ADR 0033).
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
-- Données relevées et sources consultées le 2026-11-27, sur le site officiel
-- de Bloodstock et la boutique officielle de De Mortem et Diabolum. Aucun
-- annuaire.
-- Metal Forces II est écarté : aucune page Eventim consultée et aucune
-- annonce trouvée chez un organisateur.
-- Bloodstock : la page /pages/bloodstock-winter-gathering redirige vers See
-- Tickets, qui refuse les accès automatisés (403). La source est l'actualité
-- de bloodstock.uk.com du 2026-02-12 (date, salle, prix).
-- Genre principal (ADR 0017), à valider par le PO en relecture de la PR avant
-- exécution : « extreme » pour Bloodstock Winter Gathering, « black-metal »
-- pour De Mortem et Diabolum. Aucun sous-genre.
-- Lieu : nom du site repris des sources officielles, qui ne donnent pas de
-- code postal. Ville géocodée une fois avec Nominatim le 2026-11-27
-- (ADR 0011), seuls noms, codes ISO 3166-2 et coordonnées du centre de la
-- ville sont stockés. © les contributeurs d'OpenStreetMap. Pour Berlin,
-- Nominatim ne renvoie ni county ni région.
--
-- Infos pratiques : une seule source par édition (ADR 0033) ; ce qu'elle ne
-- dit pas reste « non précisé ».
-- Bloodstock : 55 GBP hors frais de réservation. L'actualité ne dit rien du
-- camping ni de l'accessibilité.
-- De Mortem : billet à la journée à 59 EUR (le pass des deux jours est à
-- 105 EUR). La page ne dit rien du camping ni de l'accessibilité.

begin;

-- Avant toute écriture : aucun des deux festivals ne doit exister, quel que
-- soit son statut.
do $$
begin
  if exists (
    select 1 from public.festivals
    where slug in ('bloodstock-winter-gathering', 'de-mortem-et-diabolum')
  ) then
    raise exception 'Un festival du lot existe déjà : rien n''est écrit';
  end if;
end
$$;

insert into public.festivals (name, slug, website, main_genre, status) values
  ('Bloodstock Winter Gathering', 'bloodstock-winter-gathering', 'https://bloodstock.uk.com/',      'extreme',     'published'),
  ('De Mortem et Diabolum',       'de-mortem-et-diabolum',       'https://demortemetdiabolum.de/',  'black-metal', 'published');

insert into public.editions
  (festival_id, year, start_date, end_date, venue_name, city, county, region, postcode, country_code,
   subdivision_codes, latitude, longitude, status)
select f.id, v.year, v.start_date, v.end_date, v.venue_name, v.city, v.county, v.region, v.postcode, v.country_code,
       v.subdivision_codes, v.latitude, v.longitude, 'published'
from (values
  ('bloodstock-winter-gathering', 2026, date '2026-12-05', date '2026-12-05', 'KK''s Steelmill', 'Wolverhampton', 'West Midlands', 'England', null::text, 'GB',
     array['GB-ENG', 'GB-WLV'], 52.5847651::double precision, -2.1275670::double precision),
  ('de-mortem-et-diabolum',       2026, date '2026-12-04', date '2026-12-05', 'Orwohaus',        'Berlin',        null,            null,      null,       'DE',
     array['DE-BE'],            52.5173885::double precision, 13.3951309::double precision)
) as v (slug, year, start_date, end_date, venue_name, city, county, region, postcode, country_code,
        subdivision_codes, latitude, longitude)
join public.festivals f on f.slug = v.slug;

-- Sources des festivals
insert into public.sources (festival_id, url, kind, consulted_on)
select f.id, v.url, 'official', date '2026-11-27'
from (values
  ('bloodstock-winter-gathering', 'https://bloodstock.uk.com/news/bloodstocks-winter-gathering-returns-for-2026'),
  ('de-mortem-et-diabolum',       'https://shop.demortemetdiabolum.de/')
) as v (slug, url)
join public.festivals f on f.slug = v.slug;

-- Sources des éditions (dates et lieu). Bloodstock : la même actualité source
-- le festival et l'édition, d'où deux lignes (une source n'a qu'un parent).
-- De Mortem : page du billet des deux jours.
insert into public.sources (edition_id, url, kind, consulted_on)
select e.id, v.url, v.kind, date '2026-11-27'
from (values
  ('bloodstock-winter-gathering', 'https://bloodstock.uk.com/news/bloodstocks-winter-gathering-returns-for-2026', 'official'),
  ('de-mortem-et-diabolum',       'https://shop.demortemetdiabolum.de/products/de-mortem-et-diabolum-xii-2026-e-ticket', 'ticketing')
) as v (slug, url, kind)
join public.festivals f on f.slug = v.slug
join public.editions e on e.festival_id = f.id and e.year = 2026;

-- Infos pratiques et leur source dédiée, une instruction par édition (la clé
-- étrangère composée vers sources est vérifiée en fin d'instruction)

-- bloodstock-winter-gathering 2026
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'bloodstock-winter-gathering' and e.year = 2026
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://bloodstock.uk.com/news/bloodstocks-winter-gathering-returns-for-2026', 'official', date '2026-11-27' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'from', price_amount = 55.00, price_currency = 'GBP',
    camping = 'unspecified', accessibility = 'unspecified',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- de-mortem-et-diabolum 2026
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'de-mortem-et-diabolum' and e.year = 2026
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://shop.demortemetdiabolum.de/products/de-mortem-et-diabolum-2026-vol-xii-tageskarte-freitag', 'ticketing', date '2026-11-27' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'from', price_amount = 59.00, price_currency = 'EUR',
    camping = 'unspecified', accessibility = 'unspecified',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- Contrôle final : pour chaque festival, sa source, son édition 2026, la
-- source de l'édition et la source dédiée aux infos pratiques. Toute anomalie
-- annule la transaction.
do $$
declare
  complete int;
begin
  select count(*) into complete
  from (values
    ('bloodstock-winter-gathering',
     'https://bloodstock.uk.com/news/bloodstocks-winter-gathering-returns-for-2026',
     'https://bloodstock.uk.com/news/bloodstocks-winter-gathering-returns-for-2026',
     'https://bloodstock.uk.com/news/bloodstocks-winter-gathering-returns-for-2026',
     'official'),
    ('de-mortem-et-diabolum',
     'https://shop.demortemetdiabolum.de/',
     'https://shop.demortemetdiabolum.de/products/de-mortem-et-diabolum-xii-2026-e-ticket',
     'https://shop.demortemetdiabolum.de/products/de-mortem-et-diabolum-2026-vol-xii-tageskarte-freitag',
     'ticketing')
  ) as v (slug, festival_url, edition_url, practical_url, practical_kind)
  join public.festivals f on f.slug = v.slug
  join public.editions e on e.festival_id = f.id and e.year = 2026
  join public.sources p on p.id = e.practical_source_id
  where p.url = v.practical_url
    and p.kind = v.practical_kind
    and p.consulted_on = date '2026-11-27'
    and exists (
      select 1 from public.sources s
      where s.festival_id = f.id and s.url = v.festival_url
    )
    and exists (
      select 1 from public.sources s
      where s.edition_id = e.id and s.url = v.edition_url and s.id <> p.id
    );

  if complete <> 2 then
    raise exception '% édition(s) complète(s) au lieu de 2 : rien n''est écrit', complete;
  end if;
end
$$;

commit;

-- Contrôle après exécution (hors transaction). Attendu : 4 lignes, deux
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
where f.slug in ('bloodstock-winter-gathering', 'de-mortem-et-diabolum')
  and e.year = 2026
order by f.slug, practical;
