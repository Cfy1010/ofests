-- #143 — Édition 2027 du Sylak Open Air et ses infos pratiques (ADR 0033).
-- À lancer à la main dans l'SQL Editor de Supabase (production), puis :
-- gh workflow run daily-rebuild.yml. Ce dossier n'est lu par le CLI ni comme
-- migration ni comme seed.
--
-- Une ligne de source pour l'édition (billetterie) et une ligne dédiée aux
-- infos pratiques, avec sa propre date de consultation.
-- Une seule transaction : si l'édition existe déjà, le premier bloc lève une
-- exception ; si l'édition ou une source manque à la fin (festival absent,
-- par exemple), le bloc final en lève une. Dans les deux cas, rien n'est
-- écrit. Script non rejouable.

begin;

-- Avant toute écriture : l'édition ne doit pas exister, quel que soit son
-- statut. Ce contrôle précède les insertions : après elles, il ne pourrait
-- plus distinguer une édition préexistante.
do $$
begin
  if exists (
    select 1
    from public.editions e
    join public.festivals f on f.id = e.festival_id
    where f.slug = 'sylak-open-air' and e.year = 2027
  ) then
    raise exception 'L''édition 2027 de sylak-open-air existe déjà : rien n''est écrit';
  end if;
end
$$;

insert into public.editions
  (festival_id, year, start_date, end_date, venue_name, city, county, region,
   postcode, country_code, status)
select f.id, 2027, date '2027-07-30', date '2027-08-01', 'Stade Régis Perrin',
       'Saint-Maurice-de-Gourdans', 'Ain', 'Auvergne-Rhône-Alpes',
       '01800', 'FR', 'published'
from public.festivals f
where f.slug = 'sylak-open-air';

-- Source de l'édition
insert into public.sources (edition_id, url, kind, consulted_on)
select e.id, 'https://billetterie.seetickets.fr/sylak-open-air-2027-pass-3-jours-festival-stade-regis-perrin-saint-maurice-de-gourdans-du-30-juillet-au-01-aout-2027-css5-sylak-pg101-ri12011555.html', 'ticketing', date '2026-11-26'
from public.editions e
join public.festivals f on f.id = e.festival_id
where f.slug = 'sylak-open-air' and e.year = 2027;

-- Infos pratiques et leur source dédiée, en une seule instruction (la clé
-- étrangère composée vers sources est vérifiée en fin d'instruction)
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'sylak-open-air' and e.year = 2027
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://www.sylakopenair.com/infospratiques', 'official', date '2026-11-26' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'unspecified', price_amount = null, price_currency = null,
    camping = 'yes', accessibility = 'yes',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- Contrôle final : l'édition est là, avec ses deux sources, et ses infos
-- pratiques pointent vers la source dédiée. Toute anomalie annule la
-- transaction.
do $$
declare
  edition_id_2027 uuid;
begin
  select e.id into edition_id_2027
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'sylak-open-air' and e.year = 2027;
  if edition_id_2027 is null then
    raise exception 'Édition 2027 de sylak-open-air absente (festival introuvable ?) : rien n''est écrit';
  end if;

  if not exists (
    select 1 from public.sources s
    where s.edition_id = edition_id_2027
      and s.url = 'https://billetterie.seetickets.fr/sylak-open-air-2027-pass-3-jours-festival-stade-regis-perrin-saint-maurice-de-gourdans-du-30-juillet-au-01-aout-2027-css5-sylak-pg101-ri12011555.html'
      and s.kind = 'ticketing'
      and s.consulted_on = date '2026-11-26'
  ) then
    raise exception 'Source de l''édition absente : rien n''est écrit';
  end if;

  if not exists (
    select 1
    from public.editions e
    join public.sources s on s.id = e.practical_source_id
    where e.id = edition_id_2027
      and s.url = 'https://www.sylakopenair.com/infospratiques'
      and s.kind = 'official'
      and s.consulted_on = date '2026-11-26'
  ) then
    raise exception 'Source des infos pratiques absente : rien n''est écrit';
  end if;
end
$$;

commit;

-- Contrôle après exécution (hors transaction). Attendu : 2 lignes, une par
-- source, avec practical = true pour la seule source « official ».
select f.slug, e.year, e.status, e.start_date, e.end_date, e.venue_name,
       e.city, e.county, e.region, e.postcode, e.country_code,
       e.price_kind, e.price_amount, e.price_currency,
       e.camping, e.accessibility,
       s.url, s.kind, s.consulted_on,
       s.id is not distinct from e.practical_source_id as practical
from public.editions e
join public.festivals f on f.id = e.festival_id
left join public.sources s on s.edition_id = e.id
where f.slug = 'sylak-open-air' and e.year = 2027
order by s.kind;
