-- #10 — Lot 1 bis : édition 2027 du Metal Hunting Open Air.
-- À lancer APRÈS le lot 1 (2026-10-17-lot-1-festivals-absents.sql), dans
-- l'SQL Editor de Supabase (production), seulement si les dates 2027 sont
-- confirmées par le modérateur sur la source ci-dessous.
-- Une seule transaction : si une règle échoue, rien n'est écrit.

begin;

insert into public.editions
  (festival_id, year, start_date, end_date, city, postcode, country_code, status)
select f.id, 2027, date '2027-05-14', date '2027-05-15', 'Hunting', '57480', 'FR', 'published'
from public.festivals f
where f.slug = 'metal-hunting-open-air';

insert into public.sources (edition_id, url, kind, consulted_on)
select e.id, 'https://metalhunting.fr/', 'official', date '2026-10-17'
from public.editions e
join public.festivals f on f.id = e.festival_id
where f.slug = 'metal-hunting-open-air' and e.year = 2027;

commit;
