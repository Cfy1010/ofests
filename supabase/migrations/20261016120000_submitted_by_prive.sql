-- #15 — submitted_by n'est plus lisible par les rôles publics (ADR 0025)
-- La colonne identifie le contributeur (uuid auth.users) : lisible, elle
-- permettait de relier toutes les contributions d'une même personne.
-- Privilèges par colonne : la lecture est accordée colonne par colonne, sur
-- toutes les colonnes sauf submitted_by. Les règles RLS qui lisent
-- submitted_by sur leur propre table continuent de fonctionner ; celles qui
-- le lisent dans une sous-requête sur une autre table, non : sources_insert
-- est réécrite plus bas (testé dans submitted-by.test.sql).
-- Conséquence : `select *` échoue pour anon et authenticated, et toute
-- nouvelle colonne devra être accordée ici, explicitement.
-- Les droits d'insertion ne changent pas (migration rls_policies).

revoke select on public.festivals, public.editions, public.sources
  from anon, authenticated;

grant select (
  id, name, slug, website, main_genre, subgenres, wikidata_id,
  musicbrainz_id, status, revised_at, created_at
) on public.festivals to anon, authenticated;

grant select (
  id, festival_id, year, start_date, end_date, venue_name, city, county,
  region, postcode, country_code, subdivision_codes, latitude, longitude,
  status, revised_at, created_at
) on public.editions to anon, authenticated;

grant select (
  id, festival_id, edition_id, url, kind, consulted_on, created_at
) on public.sources to anon, authenticated;

-- Sources : ajout seulement sur ses propres fiches en attente, comme avant.
-- Les sous-requêtes ne lisent plus f.submitted_by ni e.submitted_by : Postgres
-- y vérifie les privilèges de colonne du lecteur, qui n'a plus ce droit.
-- Équivalent : la RLS de lecture (festivals_select, editions_select) ne
-- montre une fiche en attente qu'à son auteur (ADR 0015). « En attente et
-- visible » veut donc dire « en attente et à moi ». Toute règle qui élargira
-- cette visibilité (modération) devra revoir celle-ci (ADR 0025).
drop policy sources_insert on public.sources;

create policy sources_insert on public.sources
  for insert to authenticated
  with check (
    submitted_by = (select auth.uid())
    and (
      exists (select 1 from public.festivals f
              where f.id = sources.festival_id
                and f.status = 'pending')
      or exists (select 1 from public.editions e
                 where e.id = sources.edition_id
                   and e.status = 'pending')
    )
  );

-- Vue recréée avec une liste de colonnes explicite, sans submitted_by.
-- Mêmes filtre, tri et security_invoker que la migration editions_a_venir :
-- la vue applique la RLS de celui qui la lit.
drop view public.upcoming_editions;

create view public.upcoming_editions
with (security_invoker = true)
as
select
  e.id, e.festival_id, e.year, e.start_date, e.end_date, e.venue_name,
  e.city, e.county, e.region, e.postcode, e.country_code,
  e.subdivision_codes, e.latitude, e.longitude, e.status, e.revised_at,
  e.created_at
from public.editions e
where coalesce(e.end_date, e.start_date) >= current_date
   or (e.start_date is null and e.year >= extract(year from current_date))
order by e.start_date asc nulls last, e.year asc, e.id asc;

revoke all on public.upcoming_editions from anon, authenticated;
grant select on public.upcoming_editions to anon, authenticated;
