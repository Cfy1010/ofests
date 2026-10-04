-- #18 — Genres : hiérarchie tendances / genres, libellés, archivage (ADR 0017)

-- Table vide à ce stade : les colonnes not null s'ajoutent sans défaut.
-- parent_slug sans clause on delete : une tendance qui a des genres
-- ne peut pas être supprimée (même règle que festivals.main_genre).
alter table public.genres
  add column parent_slug text references public.genres (slug),
  add column label_fr    text not null check (btrim(label_fr) <> ''),
  add column label_en    text not null check (btrim(label_en) <> ''),
  add column archived    boolean not null default false,
  add constraint genres_parent_not_self check (parent_slug <> slug);

-- Deux niveaux exactement : un genre a pour parent une tendance,
-- une tendance n'a pas de parent. « all-styles » n'a pas d'enfant.
-- Le slug est immuable : il sert d'identifiant stable (URL, filtres).
create function public.genres_enforce_hierarchy()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.slug <> old.slug then
    raise exception 'Le slug d''un genre est immuable : % (ADR 0017)', old.slug;
  end if;

  if new.parent_slug is not null then
    if new.parent_slug = 'all-styles' then
      raise exception '« all-styles » ne peut pas avoir de genre enfant (ADR 0017)';
    end if;
    if exists (select 1 from public.genres
               where slug = new.parent_slug and parent_slug is not null) then
      raise exception 'Le parent de % doit être une tendance (ADR 0017)', new.slug;
    end if;
    if exists (select 1 from public.genres where parent_slug = new.slug) then
      raise exception '% a des genres enfants et ne peut pas devenir un genre (ADR 0017)', new.slug;
    end if;
  end if;

  return new;
end;
$$;

create trigger genres_hierarchy
  before insert or update on public.genres
  for each row execute function public.genres_enforce_hierarchy();

-- Tendances (niveau 1)
insert into public.genres (slug, label_fr, label_en) values
  ('heavy-classic',           'Heavy & classique',        'Heavy & Classic'),
  ('extreme',                 'Extrême',                  'Extreme'),
  ('doom-stoner',             'Doom & stoner',            'Doom & Stoner'),
  ('folk-pagan',              'Folk & pagan',             'Folk & Pagan'),
  ('alternative-nu',          'Alternatif & néo',         'Alternative & Nu'),
  ('metalcore-djent',         'Metalcore & djent',        'Metalcore & Djent'),
  ('gothic-symphonic',        'Gothique & symphonique',   'Gothic & Symphonic'),
  ('progressive-avant-garde', 'Progressif & avant-garde', 'Progressive & Avant-Garde'),
  ('hardcore-punk',           'Hardcore & punk',          'Hardcore & Punk'),
  ('grunge',                  'Grunge',                   'Grunge'),
  ('all-styles',              'Toutes tendances',         'All Styles');

-- Genres (niveau 2), noms repris de Rate Your Music
insert into public.genres (slug, parent_slug, label_fr, label_en) values
  ('heavy-metal',        'heavy-classic',           'Heavy metal',          'Heavy Metal'),
  ('power-metal',        'heavy-classic',           'Power metal',          'Power Metal'),
  ('neoclassical-metal', 'heavy-classic',           'Metal néoclassique',   'Neoclassical Metal'),
  ('hard-rock',          'heavy-classic',           'Hard rock',            'Hard Rock'),
  ('glam-metal',         'heavy-classic',           'Glam metal',           'Glam Metal'),
  ('thrash-metal',       'extreme',                 'Thrash metal',         'Thrash Metal'),
  ('death-metal',        'extreme',                 'Death metal',          'Death Metal'),
  ('black-metal',        'extreme',                 'Black metal',          'Black Metal'),
  ('grindcore',          'extreme',                 'Grindcore',            'Grindcore'),
  ('groove-metal',       'extreme',                 'Groove metal',         'Groove Metal'),
  ('doom-metal',         'doom-stoner',             'Doom metal',           'Doom Metal'),
  ('stoner-metal',       'doom-stoner',             'Stoner metal',         'Stoner Metal'),
  ('sludge-metal',       'doom-stoner',             'Sludge metal',         'Sludge Metal'),
  ('drone-metal',        'doom-stoner',             'Drone metal',          'Drone Metal'),
  ('southern-metal',     'doom-stoner',             'Southern metal',       'Southern Metal'),
  ('folk-metal',         'folk-pagan',              'Folk metal',           'Folk Metal'),
  ('viking-metal',       'folk-pagan',              'Viking metal',         'Viking Metal'),
  ('alternative-metal',  'alternative-nu',          'Metal alternatif',     'Alternative Metal'),
  ('nu-metal',           'alternative-nu',          'Néo-metal',            'Nu Metal'),
  ('rap-metal',          'alternative-nu',          'Rap metal',            'Rap Metal'),
  ('funk-metal',         'alternative-nu',          'Fusion',               'Funk Metal'),
  ('industrial-metal',   'alternative-nu',          'Metal industriel',     'Industrial Metal'),
  ('metalcore',          'metalcore-djent',         'Metalcore',            'Metalcore'),
  ('djent',              'metalcore-djent',         'Djent',                'Djent'),
  ('gothic-metal',       'gothic-symphonic',        'Metal gothique',       'Gothic Metal'),
  ('symphonic-metal',    'gothic-symphonic',        'Metal symphonique',    'Symphonic Metal'),
  ('progressive-metal',  'progressive-avant-garde', 'Metal progressif',     'Progressive Metal'),
  ('avant-garde-metal',  'progressive-avant-garde', 'Metal avant-gardiste', 'Avant-Garde Metal'),
  ('post-metal',         'progressive-avant-garde', 'Post-metal',           'Post-Metal'),
  ('hardcore',           'hardcore-punk',           'Hardcore',             'Hardcore'),
  ('punk-rock',          'hardcore-punk',           'Punk rock',            'Punk Rock');
