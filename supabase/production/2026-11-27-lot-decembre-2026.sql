-- #146 — Lot décembre 2026, premier lot : Walhalla – Festival der Helden et
-- Knock Out Festival, avec leur édition 2026 et ses infos pratiques
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
-- Données relevées et sources consultées le 2026-11-27, sur les sites et la
-- billetterie officiels. Aucun annuaire.
-- Genre principal (ADR 0017), à valider par le PO en relecture de la PR avant
-- exécution : « all-styles » pour Walhalla, « heavy-classic » pour Knock Out.
-- Aucun sous-genre.
-- Lieu : nom du site et code postal repris des sites officiels. Ville
-- géocodée une fois avec Nominatim le 2026-11-27 (ADR 0011), seuls noms,
-- codes ISO 3166-2 et coordonnées du centre de la commune sont stockés.
-- © les contributeurs d'OpenStreetMap. Nominatim ne renvoie pas de county
-- pour Karlsruhe.
--
-- Infos pratiques : une seule source par édition (ADR 0033) ; ce qu'elle ne
-- dit pas reste « non précisé ».
-- Walhalla : billetterie (billet à 76,80 EUR et billet camping). Elle ne dit
-- rien de l'accessibilité.
-- Knock Out : FAQ (place debout en prévente à 89,90 EUR, pas de camping).
-- Elle ne dit rien de l'accessibilité.

begin;

-- Avant toute écriture : aucun des deux festivals ne doit exister, quel que
-- soit son statut.
do $$
begin
  if exists (
    select 1 from public.festivals
    where slug in ('walhalla-festival-der-helden', 'knock-out-festival')
  ) then
    raise exception 'Un festival du lot existe déjà : rien n''est écrit';
  end if;
end
$$;

insert into public.festivals (name, slug, website, main_genre, status) values
  ('Walhalla – Festival der Helden', 'walhalla-festival-der-helden', 'https://walhalla-festival.de/',      'all-styles',    'published'),
  ('Knock Out Festival',             'knock-out-festival',           'https://www.knockout-festival.de/', 'heavy-classic', 'published');

insert into public.editions
  (festival_id, year, start_date, end_date, venue_name, city, county, region, postcode, country_code,
   subdivision_codes, latitude, longitude, status)
select f.id, v.year, v.start_date, v.end_date, v.venue_name, v.city, v.county, v.region, v.postcode, v.country_code,
       v.subdivision_codes, v.latitude, v.longitude, 'published'
from (values
  ('walhalla-festival-der-helden', 2026, date '2026-12-12', date '2026-12-12', 'Holstenhallen',    'Neumünster', 'Neumünster', 'Schleswig-Holstein', '24537', 'DE',
     array['DE-SH'], 54.0757442::double precision, 9.9815377::double precision),
  ('knock-out-festival',           2026, date '2026-12-12', date '2026-12-12', 'Schwarzwaldhalle', 'Karlsruhe',  null,         'Baden-Württemberg',  '76137', 'DE',
     array['DE-BW'], 49.0068705::double precision, 8.4034195::double precision)
) as v (slug, year, start_date, end_date, venue_name, city, county, region, postcode, country_code,
        subdivision_codes, latitude, longitude)
join public.festivals f on f.slug = v.slug;

-- Sources des festivals
insert into public.sources (festival_id, url, kind, consulted_on)
select f.id, v.url, 'official', date '2026-11-27'
from (values
  ('walhalla-festival-der-helden', 'https://walhalla-festival.de/'),
  ('knock-out-festival',           'https://www.knockout-festival.de/')
) as v (slug, url)
join public.festivals f on f.slug = v.slug;

-- Sources des éditions : les pages d'accueil donnent la date et le lieu. La
-- même page source le festival et l'édition, d'où deux lignes (une source n'a
-- qu'un parent).
insert into public.sources (edition_id, url, kind, consulted_on)
select e.id, v.url, 'official', date '2026-11-27'
from (values
  ('walhalla-festival-der-helden', 'https://walhalla-festival.de/'),
  ('knock-out-festival',           'https://www.knockout-festival.de/')
) as v (slug, url)
join public.festivals f on f.slug = v.slug
join public.editions e on e.festival_id = f.id and e.year = 2026;

-- Infos pratiques et leur source dédiée, une instruction par édition (la clé
-- étrangère composée vers sources est vérifiée en fin d'instruction)

-- walhalla-festival-der-helden 2026
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'walhalla-festival-der-helden' and e.year = 2026
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://whf.deinetickets.de/', 'ticketing', date '2026-11-27' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'from', price_amount = 76.80, price_currency = 'EUR',
    camping = 'yes', accessibility = 'unspecified',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- knock-out-festival 2026
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'knock-out-festival' and e.year = 2026
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://www.knockout-festival.de/faq.html', 'official', date '2026-11-27' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'from', price_amount = 89.90, price_currency = 'EUR',
    camping = 'no', accessibility = 'unspecified',
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
    ('walhalla-festival-der-helden', 'https://walhalla-festival.de/',
     'https://whf.deinetickets.de/', 'ticketing'),
    ('knock-out-festival', 'https://www.knockout-festival.de/',
     'https://www.knockout-festival.de/faq.html', 'official')
  ) as v (slug, url, practical_url, practical_kind)
  join public.festivals f on f.slug = v.slug
  join public.editions e on e.festival_id = f.id and e.year = 2026
  join public.sources p on p.id = e.practical_source_id
  where p.url = v.practical_url
    and p.kind = v.practical_kind
    and p.consulted_on = date '2026-11-27'
    and exists (
      select 1 from public.sources s
      where s.festival_id = f.id and s.url = v.url
    )
    and exists (
      select 1 from public.sources s
      where s.edition_id = e.id and s.url = v.url and s.id <> p.id
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
where f.slug in ('walhalla-festival-der-helden', 'knock-out-festival')
  and e.year = 2026
order by f.slug, practical;
