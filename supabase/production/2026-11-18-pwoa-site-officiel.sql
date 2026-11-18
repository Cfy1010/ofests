-- #89 — Lot 3, correctif : site officiel du Pyrenean Warriors Open Air.
-- À lancer à la main dans l'SQL Editor de Supabase (production). Ce dossier
-- n'est lu par le CLI ni comme migration ni comme seed.
--
-- Site officiel du festival trouvé (page de l'organisateur) : il remplace la
-- billetterie comme website et l'annuaire comme source, conformément à la
-- règle de choix des sources d'AGENTS.md (ADR 0007).
-- Une seule transaction. Rejouable sans effet sur la source : le second
-- passage ne trouve plus l'ancienne URL et ne la modifie pas.

begin;

update public.festivals
set website = 'http://leshordesmetalliques.com/pwoa/'
where slug = 'pyrenean-warriors-open-air';

update public.sources
set url = 'http://leshordesmetalliques.com/pwoa/',
    kind = 'official',
    consulted_on = date '2026-11-18'
where festival_id = (select id from public.festivals where slug = 'pyrenean-warriors-open-air')
  and url = 'https://www.festivalenfrance.com/festival/pyrenean-warrior-open-air';

commit;
