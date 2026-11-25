-- #46 — Infos pratiques d'une édition : prix, camping, accessibilité (ADR 0033)
-- Portées par l'édition (ADR 0013), avec une source pour toute la section :
-- une ligne de la table sources, rattachée à la même édition.
-- Aucune table ni vue créée : pas de revoke. Sur editions, la lecture est
-- accordée colonne par colonne (ADR 0025) : on accorde les nouvelles colonnes,
-- sans toucher aux droits existants (dont l'insertion par authenticated).

-- Cible de la clé étrangère composée ci-dessous : (id, edition_id) est
-- unique puisque id l'est déjà.
alter table public.sources
  add constraint sources_id_edition_unique unique (id, edition_id);

alter table public.editions
  -- Prix : non précisé (par défaut), gratuit, ou « à partir de » : plus bas
  -- plein tarif, hors réductions et frais, dans une devise ISO 4217
  add column price_kind text not null default 'unspecified'
    check (price_kind in ('unspecified', 'free', 'from')),
  add column price_amount numeric(8, 2) check (price_amount > 0),
  add column price_currency text check (price_currency ~ '^[A-Z]{3}$'),
  -- « no » seulement si la source le dit (vérifié à la modération)
  add column camping text not null default 'unspecified'
    check (camping in ('unspecified', 'yes', 'no')),
  add column accessibility text not null default 'unspecified'
    check (accessibility in ('unspecified', 'yes', 'no')),
  add column practical_source_id uuid,
  -- Montant et devise ensemble, et seulement pour « à partir de »
  add constraint price_from_complete check (
    (price_kind = 'from') = (price_amount is not null)
    and (price_amount is null) = (price_currency is null)
  ),
  -- La source de la section est une source de cette édition. Supprimer une
  -- source encore utilisée est refusé ; supprimer l'édition reste possible.
  add constraint practical_source_same_edition
    foreign key (practical_source_id, id) references public.sources (id, edition_id),
  -- Une valeur renseignée exige la source. Tout « non précisé » : la source
  -- reste facultative (édition pas encore vérifiée).
  add constraint practical_value_requires_source check (
    practical_source_id is not null
    or (price_kind = 'unspecified' and camping = 'unspecified' and accessibility = 'unspecified')
  );

-- Lecture publique des nouvelles colonnes (ADR 0025)
grant select (
  price_kind, price_amount, price_currency, camping, accessibility,
  practical_source_id
) on public.editions to anon, authenticated;
