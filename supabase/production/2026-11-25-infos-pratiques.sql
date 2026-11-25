-- #46 — Infos pratiques des 13 éditions à venir publiées (ADR 0033).
-- À lancer à la main dans l'SQL Editor de Supabase (production). Ce dossier
-- n'est lu par le CLI ni comme migration ni comme seed. La migration
-- 20261125120000_infos_pratiques.sql doit être appliquée avant (npx supabase
-- db push), puis, après ce script : gh workflow run daily-rebuild.yml.
--
-- Pour chaque édition : une ligne de source dédiée aux infos pratiques (même
-- si l'URL existe déjà sur une autre ligne), consultée le 2026-11-25, puis
-- les valeurs et practical_source_id sur l'édition, en une seule instruction
-- (la clé étrangère composée vers sources est vérifiée en fin d'instruction).
-- Une page officielle qui n'affiche qu'un prix frais inclus, sans détail des
-- frais : on retient le prix affiché (décision du PO, 2026-11-25, ADR 0033).
-- Une seule transaction : si une édition manque ou si une source est
-- insérée deux fois (second passage), le bloc final lève une exception et
-- rien n'est écrit. Script non rejouable.

begin;

-- eindhoven-metal-meeting 2026
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'eindhoven-metal-meeting' and e.year = 2026
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://eindhovenmetalmeeting.com/venue-transport-accomodation/', 'official', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'unspecified', price_amount = null, price_currency = null,
    camping = 'unspecified', accessibility = 'yes',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- winteriip 2026
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'winteriip' and e.year = 2026
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://www.riipfest.com/winteriip', 'official', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'unspecified', price_amount = null, price_currency = null,
    camping = 'no', accessibility = 'yes',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- metal-hunting-open-air 2027
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'metal-hunting-open-air' and e.year = 2027
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://metalhunting.fr/', 'official', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'unspecified', price_amount = null, price_currency = null,
    camping = 'unspecified', accessibility = 'unspecified',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- mystic-festival 2027
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'mystic-festival' and e.year = 2027
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://tickets.mysticfestival.pl/en', 'ticketing', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'from', price_amount = 207.32, price_currency = 'EUR',
    camping = 'unspecified', accessibility = 'yes',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- graspop-metal-meeting 2027
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'graspop-metal-meeting' and e.year = 2027
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://graspop.be/en/tickets', 'official', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'from', price_amount = 139, price_currency = 'EUR',
    camping = 'yes', accessibility = 'unspecified',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- hellfest 2027
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'hellfest' and e.year = 2027
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://hellfest.fr/accessibilite', 'official', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'unspecified', price_amount = null, price_currency = null,
    camping = 'yes', accessibility = 'yes',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- resurrection-fest 2027
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'resurrection-fest' and e.year = 2027
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://tickets.resurrectionfest.es/es/resurrection-fest-2027/4-day-tickets', 'ticketing', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'from', price_amount = 235, price_currency = 'EUR',
    camping = 'unspecified', accessibility = 'unspecified',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- wacken-open-air 2027
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'wacken-open-air' and e.year = 2027
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://www.wacken.com/en/tickets-shop/ticket-overview-2027/', 'official', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'from', price_amount = 366, price_currency = 'EUR',
    camping = 'yes', accessibility = 'unspecified',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- brutal-assault 2027
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'brutal-assault' and e.year = 2027
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://brutalassault.cz/en/tickets', 'official', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'from', price_amount = 229.90, price_currency = 'EUR',
    camping = 'unspecified', accessibility = 'unspecified',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- wellesweiler-open-air 2027
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'wellesweiler-open-air' and e.year = 2027
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://wellesweiler-open-air.com/', 'official', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'unspecified', price_amount = null, price_currency = null,
    camping = 'yes', accessibility = 'unspecified',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- hell-over-valhalla-openair 2027
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'hell-over-valhalla-openair' and e.year = 2027
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://www.eventim-light.com/at/a/64502496e8973d63ab0325f8/e/6afb1852eda4243a70da1c33', 'ticketing', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'from', price_amount = 25.20, price_currency = 'EUR',
    camping = 'unspecified', accessibility = 'unspecified',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- motocultor-festival 2027
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'motocultor-festival' and e.year = 2027
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://www.motocultor-festival.com/', 'official', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'from', price_amount = 82, price_currency = 'EUR',
    camping = 'unspecified', accessibility = 'yes',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- rock-the-lakes 2027
with ed as (
  select e.id
  from public.editions e
  join public.festivals f on f.id = e.festival_id
  where f.slug = 'rock-the-lakes' and e.year = 2027
), src as (
  insert into public.sources (edition_id, url, kind, consulted_on)
  select ed.id, 'https://www.rockthelakes.ch/', 'official', date '2026-11-25' from ed
  returning id, edition_id
)
update public.editions e
set price_kind = 'from', price_amount = 227, price_currency = 'CHF',
    camping = 'unspecified', accessibility = 'unspecified',
    practical_source_id = src.id, revised_at = now()
from src
where e.id = src.edition_id;

-- Contrôle : les 13 éditions ont leur source, insérée une seule fois.
-- Toute anomalie annule la transaction.
do $$
declare
  missing int;
  inserted int;
begin
  select count(*) into missing
  from (values
    ('eindhoven-metal-meeting', 2026, 'https://eindhovenmetalmeeting.com/venue-transport-accomodation/'),
    ('winteriip', 2026, 'https://www.riipfest.com/winteriip'),
    ('metal-hunting-open-air', 2027, 'https://metalhunting.fr/'),
    ('mystic-festival', 2027, 'https://tickets.mysticfestival.pl/en'),
    ('graspop-metal-meeting', 2027, 'https://graspop.be/en/tickets'),
    ('hellfest', 2027, 'https://hellfest.fr/accessibilite'),
    ('resurrection-fest', 2027, 'https://tickets.resurrectionfest.es/es/resurrection-fest-2027/4-day-tickets'),
    ('wacken-open-air', 2027, 'https://www.wacken.com/en/tickets-shop/ticket-overview-2027/'),
    ('brutal-assault', 2027, 'https://brutalassault.cz/en/tickets'),
    ('wellesweiler-open-air', 2027, 'https://wellesweiler-open-air.com/'),
    ('hell-over-valhalla-openair', 2027, 'https://www.eventim-light.com/at/a/64502496e8973d63ab0325f8/e/6afb1852eda4243a70da1c33'),
    ('motocultor-festival', 2027, 'https://www.motocultor-festival.com/'),
    ('rock-the-lakes', 2027, 'https://www.rockthelakes.ch/')
  ) as v(slug, year, url)
  left join public.festivals f on f.slug = v.slug
  left join public.editions e on e.festival_id = f.id and e.year = v.year
  where e.practical_source_id is null;
  if missing <> 0 then
    raise exception '% édition(s) sans practical_source_id : rien n''est écrit', missing;
  end if;

  select count(*) into inserted
  from (values
    ('eindhoven-metal-meeting', 2026, 'https://eindhovenmetalmeeting.com/venue-transport-accomodation/'),
    ('winteriip', 2026, 'https://www.riipfest.com/winteriip'),
    ('metal-hunting-open-air', 2027, 'https://metalhunting.fr/'),
    ('mystic-festival', 2027, 'https://tickets.mysticfestival.pl/en'),
    ('graspop-metal-meeting', 2027, 'https://graspop.be/en/tickets'),
    ('hellfest', 2027, 'https://hellfest.fr/accessibilite'),
    ('resurrection-fest', 2027, 'https://tickets.resurrectionfest.es/es/resurrection-fest-2027/4-day-tickets'),
    ('wacken-open-air', 2027, 'https://www.wacken.com/en/tickets-shop/ticket-overview-2027/'),
    ('brutal-assault', 2027, 'https://brutalassault.cz/en/tickets'),
    ('wellesweiler-open-air', 2027, 'https://wellesweiler-open-air.com/'),
    ('hell-over-valhalla-openair', 2027, 'https://www.eventim-light.com/at/a/64502496e8973d63ab0325f8/e/6afb1852eda4243a70da1c33'),
    ('motocultor-festival', 2027, 'https://www.motocultor-festival.com/'),
    ('rock-the-lakes', 2027, 'https://www.rockthelakes.ch/')
  ) as v(slug, year, url)
  join public.festivals f on f.slug = v.slug
  join public.editions e on e.festival_id = f.id and e.year = v.year
  join public.sources s on s.edition_id = e.id and s.url = v.url and s.consulted_on = date '2026-11-25';
  if inserted <> 13 then
    raise exception '% source(s) insérée(s) au lieu de 13 : rien n''est écrit', inserted;
  end if;
end
$$;

commit;

-- Contrôle après exécution (hors transaction) : les 13 éditions, leurs
-- valeurs et l'URL de leur source.
select f.slug, e.year, e.price_kind, e.price_amount, e.price_currency,
       e.camping, e.accessibility, s.url, s.kind, s.consulted_on
from public.editions e
join public.festivals f on f.id = e.festival_id
join public.sources s on s.id = e.practical_source_id
where f.slug in ('eindhoven-metal-meeting', 'winteriip', 'metal-hunting-open-air', 'mystic-festival', 'graspop-metal-meeting', 'hellfest', 'resurrection-fest', 'wacken-open-air', 'brutal-assault', 'wellesweiler-open-air', 'hell-over-valhalla-openair', 'motocultor-festival', 'rock-the-lakes')
  and e.year in (2026, 2027)
  and s.consulted_on = date '2026-11-25'
order by f.slug, e.year;
