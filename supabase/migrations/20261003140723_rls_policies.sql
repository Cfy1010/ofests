-- #3 — Règles RLS
-- Lecture : tout ce qui est publié est public ; un contributeur voit aussi
-- ses propres fiches en attente.
-- Écriture : rien pour anon ; un utilisateur connecté crée en 'pending', à son nom.
-- Ni update ni delete : la modération passera par un rôle dédié (hors #3).

-- Privilèges : on retire tout, puis on accorde le strict nécessaire.
-- La RLS filtre les lignes ; les privilèges filtrent les opérations
-- (TRUNCATE, par exemple, ignore la RLS).
revoke all on public.genres, public.festivals, public.editions, public.sources
  from anon, authenticated;
grant select on public.genres, public.festivals, public.editions, public.sources
  to anon, authenticated;
grant insert on public.festivals, public.editions, public.sources
  to authenticated;

-- Genres : liste contrôlée, lecture seule pour tous
create policy genres_select on public.genres
  for select to anon, authenticated
  using (true);

-- Festivals
create policy festivals_select on public.festivals
  for select to anon, authenticated
  using (status = 'published' or submitted_by = (select auth.uid()));

create policy festivals_insert on public.festivals
  for insert to authenticated
  with check (status = 'pending' and submitted_by = (select auth.uid()));

-- Éditions : visibles seulement si leur festival l'est
-- (la sous-requête respecte la RLS de festivals)
create policy editions_select on public.editions
  for select to anon, authenticated
  using (
    (status = 'published' or submitted_by = (select auth.uid()))
    and exists (select 1 from public.festivals f where f.id = editions.festival_id)
  );

create policy editions_insert on public.editions
  for insert to authenticated
  with check (
    status = 'pending'
    and submitted_by = (select auth.uid())
    and exists (select 1 from public.festivals f where f.id = editions.festival_id)
  );

-- Sources : visibles si leur fiche l'est ; ajout seulement sur ses propres
-- fiches en attente (pas d'ajout non modéré sur une fiche publiée)
create policy sources_select on public.sources
  for select to anon, authenticated
  using (
    exists (select 1 from public.festivals f where f.id = sources.festival_id)
    or exists (select 1 from public.editions e where e.id = sources.edition_id)
  );

create policy sources_insert on public.sources
  for insert to authenticated
  with check (
    submitted_by = (select auth.uid())
    and (
      exists (select 1 from public.festivals f
              where f.id = sources.festival_id
                and f.status = 'pending'
                and f.submitted_by = (select auth.uid()))
      or exists (select 1 from public.editions e
                 where e.id = sources.edition_id
                   and e.status = 'pending'
                   and e.submitted_by = (select auth.uid()))
    )
  );