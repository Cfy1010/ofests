-- #96 — Sources sans annuaire ni page datée de tiers.
-- À lancer à la main dans l'SQL Editor de Supabase (production). Ce dossier
-- n'est lu par le CLI ni comme migration ni comme seed.
--
-- Règle de choix des sources d'AGENTS.md (#96) : plus d'annuaire de
-- festivals, d'agenda d'office de tourisme ni de page d'événement de tiers.
-- Sources consultées le 2026-11-19.
-- Une seule transaction : « pas de publication sans source » (ADR 0007) est
-- vérifiée en fin de transaction. Si une règle échoue, ou si la requête de
-- contrôle finale trouve un reste, rien n'est écrit. Les corrections ciblent
-- l'ancienne URL : un second passage ne trouve plus rien à modifier.
-- Pyrenean Warriors Open Air n'est pas concerné : le correctif #89
-- (2026-11-18-pwoa-site-officiel.sql) a déjà mis son site officiel.
--
-- Eindhoven Metal Meeting : les dates 2026 figurent sur l'affiche de la page
-- d'accueil du site officiel, qui sert de source au festival et à l'édition
-- (une source n'a qu'un parent, d'où deux lignes). L'agenda de l'Effenaar
-- est supprimé.
-- Hell over Valhalla OpenAir : source du festival = compte Instagram officiel
-- (type social), dont le lien en bio mène à la billetterie officielle sur
-- Eventim Light. Édition 2027 (« 666-Edition ») ajoutée en corrigeant les
-- sources, d'après cette billetterie : 2027-08-14, Musik-Pavillon Pfunds,
-- Stuben 598, 6542 Pfunds. Aucune image : pas d'accord écrit pour l'instant.
-- Lieu : commune géocodée une fois avec Nominatim le 2026-11-19 (ADR 0011),
-- seuls noms, code ISO 3166-2 et coordonnées du centre de la commune sont
-- stockés. © les contributeurs d'OpenStreetMap.

begin;

-- Eindhoven Metal Meeting
update public.festivals
set website = 'https://eindhovenmetalmeeting.com'
where slug = 'eindhoven-metal-meeting';

update public.sources
set url = 'https://eindhovenmetalmeeting.com', kind = 'official', consulted_on = date '2026-11-19'
where festival_id = (select id from public.festivals where slug = 'eindhoven-metal-meeting')
  and url = 'https://www.festivalinfo.nl/festival/35648/Eindhoven-Metal-Meeting/2026/';

update public.sources
set url = 'https://eindhovenmetalmeeting.com', kind = 'official', consulted_on = date '2026-11-19'
where edition_id = (select e.id from public.editions e join public.festivals f on f.id = e.festival_id
                    where f.slug = 'eindhoven-metal-meeting' and e.year = 2026)
  and url = 'https://www.festivalinfo.nl/festival/35648/Eindhoven-Metal-Meeting/2026/';

delete from public.sources
where edition_id = (select e.id from public.editions e join public.festivals f on f.id = e.festival_id
                    where f.slug = 'eindhoven-metal-meeting' and e.year = 2026)
  and url = 'https://www.effenaar.nl/agenda';

-- Blasphemic Rites Open Air
update public.festivals
set website = 'https://blasphemic-rites.at'
where slug = 'blasphemic-rites-open-air';

update public.sources
set url = 'https://blasphemic-rites.at', kind = 'official', consulted_on = date '2026-11-19'
where festival_id = (select id from public.festivals where slug = 'blasphemic-rites-open-air')
  and url = 'https://eventfrog.at/en/p/festivals/other-festivals/blasphemic-rites-open-air-2026-7429435555677534585.html';

-- Hell over Valhalla OpenAir : source du festival, puis édition 2027
update public.sources
set url = 'https://www.instagram.com/hell_over_valhalla/', kind = 'social', consulted_on = date '2026-11-19'
where festival_id = (select id from public.festivals where slug = 'hell-over-valhalla-openair')
  and url = 'https://www.nauders.com/en/News/Events/Hell-over-Valhalla-OpenAir-2025_ev-20606';

insert into public.editions
  (festival_id, year, start_date, end_date, venue_name, city, county, region, postcode, country_code,
   subdivision_codes, latitude, longitude, status)
select f.id, 2027, date '2027-08-14', date '2027-08-14', 'Musik-Pavillon Pfunds', 'Pfunds',
       'Bezirk Landeck', 'Tyrol', '6542', 'AT',
       array['AT-7'], 46.9675345::double precision, 10.5361885::double precision, 'published'
from public.festivals f
where f.slug = 'hell-over-valhalla-openair';

insert into public.sources (edition_id, url, kind, consulted_on)
select e.id, 'https://www.eventim-light.com/at/a/64502496e8973d63ab0325f8/e/6afb1852eda4243a70da1c33',
       'ticketing', date '2026-11-19'
from public.editions e
join public.festivals f on f.id = e.festival_id
where f.slug = 'hell-over-valhalla-openair' and e.year = 2027;

-- Metal Hunting Open Air 2026
update public.sources
set url = 'https://metalhunting.fr/', kind = 'official', consulted_on = date '2026-11-19'
where edition_id = (select e.id from public.editions e join public.festivals f on f.id = e.festival_id
                    where f.slug = 'metal-hunting-open-air' and e.year = 2026)
  and url = 'https://www.festivalenfrance.com/festival/metal-hunting-open-air';

-- Riipfest 2026 (l'édition reste published)
update public.sources
set url = 'https://www.riipfest.com/', kind = 'official', consulted_on = date '2026-11-19'
where edition_id = (select e.id from public.editions e join public.festivals f on f.id = e.festival_id
                    where f.slug = 'riipfest' and e.year = 2026)
  and url = 'https://www.festivalenfrance.com/festival/riip-fest';

-- Contrôle : aucune source d'annuaire ni d'URL interdite ne doit rester.
-- En cas de reste, l'exception annule toute la transaction.
do $$
declare
  reste text;
begin
  select string_agg(kind || ' ' || url, E'\n') into reste
  from public.sources
  where kind = 'directory'
     or url ilike '%nauders.com%'
     or url ilike '%festivalinfo.nl%'
     or url ilike '%festivalenfrance.com%'
     or url ilike '%eventfrog%'
     or url ilike '%effenaar.nl/agenda%';
  if reste is not null then
    raise exception E'Sources interdites restantes :\n%', reste;
  end if;
end
$$;

commit;
