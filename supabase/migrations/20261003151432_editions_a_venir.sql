-- #3 — Éditions à venir et publication des éditions sans date (ADR 0016)

-- Pas de publication sans dates pour une édition de l'année en cours ou passée.
-- Une édition sans date publiée est donc toujours, au moment de sa publication,
-- l'annonce d'une année future.
create function public.require_dates_to_publish()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published'
     and new.start_date is null
     and new.year <= extract(year from current_date) then
    raise exception 'L''édition % (%) ne peut pas être publiée sans dates : son année n''est pas future (ADR 0016)',
      new.id, new.year;
  end if;
  return new;
end;
$$;

-- Se déclenche aussi si l'on retire les dates d'une édition publiée
-- ou si l'on change son année
create trigger editions_require_dates
  before insert or update of status, start_date, year on public.editions
  for each row execute function public.require_dates_to_publish();

-- Éditions à venir (ADR 0004, 0016)
-- À venir : date de fin (à défaut, de début) aujourd'hui ou plus tard,
-- ou aucune date et une année qui n'est pas passée.
-- Tri : date de début croissante, éditions sans date en dernier, par année.
-- security_invoker : la vue applique la RLS de celui qui la lit.
-- Sans cette option, elle contournerait la RLS de editions.
create view public.upcoming_editions
with (security_invoker = true)
as
select e.*
from public.editions e
where coalesce(e.end_date, e.start_date) >= current_date
   or (e.start_date is null and e.year >= extract(year from current_date))
order by e.start_date asc nulls last, e.year asc, e.id asc;

revoke all on public.upcoming_editions from anon, authenticated;
grant select on public.upcoming_editions to anon, authenticated;
