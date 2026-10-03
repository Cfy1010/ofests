-- #3 — Schéma festivals / editions / sources
-- Décisions appliquées : ADR 0003 (genres), 0004 (temporalité),
-- 0005 (statuts), 0007 et 0013 (sources), 0011 (géocodage), 0013 (modèle).
-- Les règles RLS sont dans la migration suivante. La RLS est activée ici
-- pour que les tables ne soient jamais exposées sans règle.

-- Statut de modération, commun aux festivals et aux éditions (ADR 0005, 0013)
create type public.record_status as enum ('pending', 'published', 'rejected');

-- Genres principaux : liste contrôlée, seuls filtrants (ADR 0003).
-- Les libellés fr/en vivent dans les fichiers JSON de l'interface.
create table public.genres (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

-- Festival : identité stable
create table public.festivals (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (btrim(name) <> ''),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  website        text check (website ~ '^https?://'),
  main_genre     text not null references public.genres (slug),
  subgenres      text[] not null default '{}',
  wikidata_id    text unique check (wikidata_id ~ '^Q[1-9][0-9]*$'),
  musicbrainz_id uuid unique,
  status         public.record_status not null default 'pending',
  submitted_by   uuid default auth.uid() references auth.users (id) on delete set null,
  revised_at     timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

-- Édition : une ligne par année d'un festival. Le lieu est porté par
-- l'édition (ADR 0013). Dates facultatives : une édition peut être annoncée
-- avant ses dates. L'année identifie l'édition, elle ne sert pas d'axe de
-- tri (ADR 0004).
create table public.editions (
  id                uuid primary key default gen_random_uuid(),
  festival_id       uuid not null references public.festivals (id) on delete cascade,
  year              smallint not null check (year between 1950 and 2100),
  start_date        date,
  end_date          date,
  venue_name        text,
  city              text,
  county            text,
  region            text,
  postcode          text,
  country_code      text not null check (country_code ~ '^[A-Z]{2}$'),
  subdivision_codes text[] not null default '{}',  -- ISO 3166-2 (ADR 0011)
  latitude          double precision check (latitude between -90 and 90),
  longitude         double precision check (longitude between -180 and 180),
  status            public.record_status not null default 'pending',
  submitted_by      uuid default auth.uid() references auth.users (id) on delete set null,
  revised_at        timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  unique (festival_id, year),
  constraint end_requires_start  check (end_date is null or start_date is not null),
  constraint end_after_start     check (end_date is null or end_date >= start_date),
  constraint start_matches_year  check (start_date is null or extract(year from start_date) = year),
  constraint coordinates_paired  check ((latitude is null) = (longitude is null))
);

create index editions_start_date_idx on public.editions (start_date);
create index editions_country_code_idx on public.editions (country_code);

-- Sources d'une fiche : festival OU édition, jamais les deux (ADR 0007, 0013)
create table public.sources (
  id           uuid primary key default gen_random_uuid(),
  festival_id  uuid references public.festivals (id) on delete cascade,
  edition_id   uuid references public.editions (id) on delete cascade,
  url          text not null check (url ~ '^https?://'),
  kind         text not null check (kind in
                 ('official', 'ticketing', 'directory', 'wikidata', 'musicbrainz', 'press', 'social', 'other')),
  consulted_on date not null default current_date,
  submitted_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  constraint one_parent check (num_nonnulls(festival_id, edition_id) = 1)
);

create index sources_festival_id_idx on public.sources (festival_id);
create index sources_edition_id_idx on public.sources (edition_id);

-- Pas de publication sans source (ADR 0007, 0013).
-- Vérifiée en fin de transaction : un import peut insérer une fiche publiée
-- et sa source dans la même transaction.
create function public.require_source_to_publish()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' then
    if tg_table_name = 'festivals'
       and not exists (select 1 from public.sources s where s.festival_id = new.id) then
      raise exception 'Le festival % ne peut pas être publié sans source (ADR 0007)', new.id;
    end if;
    if tg_table_name = 'editions'
       and not exists (select 1 from public.sources s where s.edition_id = new.id) then
      raise exception 'L''édition % ne peut pas être publiée sans source (ADR 0007)', new.id;
    end if;
  end if;
  return null;
end;
$$;

create constraint trigger festivals_require_source
  after insert or update of status on public.festivals
  deferrable initially deferred
  for each row execute function public.require_source_to_publish();

create constraint trigger editions_require_source
  after insert or update of status on public.editions
  deferrable initially deferred
  for each row execute function public.require_source_to_publish();

-- RLS activée partout : tout est interdit tant qu'une règle n'autorise rien
alter table public.genres    enable row level security;
alter table public.festivals enable row level security;
alter table public.editions  enable row level security;
alter table public.sources   enable row level security;

