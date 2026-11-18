-- #89 — Lot 3, correctif : source du Pyrenean Warriors Open Air.
-- À lancer à la main dans l'SQL Editor de Supabase (production). Ce dossier
-- n'est lu par le CLI ni comme migration ni comme seed.
--
-- La page agenda de tourisme-pyreneesorientales.com redirige vers l'agenda
-- général depuis la fin de l'édition 2026 : elle ne source plus le festival.
-- Remplacée par la fiche permanente de festivalenfrance.com (ADR 0007).
-- Une seule transaction. Rejouable sans effet : le second passage ne trouve
-- plus l'ancienne URL et ne modifie rien.

begin;

update public.sources
set url = 'https://www.festivalenfrance.com/festival/pyrenean-warrior-open-air',
    kind = 'directory',
    consulted_on = date '2026-11-18'
where festival_id = (select id from public.festivals where slug = 'pyrenean-warriors-open-air')
  and url = 'https://www.tourisme-pyreneesorientales.com/agenda/pyrenean-warriors-open-air-torreilles-fr-6274230/';

commit;
