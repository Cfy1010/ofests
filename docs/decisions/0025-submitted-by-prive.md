# 0025 — `submitted_by` privé : privilèges de lecture par colonne

Date : 2026-10-16
Statut : acceptée

## Contexte

L'issue #15 : depuis la migration RLS de #3, `submitted_by` (festivals,
editions, sources, et la vue `upcoming_editions`, définie en `select e.*`)
est lisible sur les fiches publiées, par un visiteur anonyme comme par tout
utilisateur connecté. La colonne contient l'identifiant interne du
contributeur (uuid `auth.users`) : elle permet de relier entre elles toutes
les contributions d'une même personne. À corriger avant d'ouvrir les
contributions au public.

La colonne doit rester en place : la RLS s'appuie sur elle pour montrer à
un contributeur ses propres fiches en attente (ADR 0015).

## Options

- **Privilèges par colonne** : `anon` et `authenticated` perdent la lecture
  de table et reçoivent la lecture de chaque colonne, sauf `submitted_by`.
  Aucun changement de modèle ; la RLS lit toujours la colonne.
- **Vue publique** : le site lit des vues sans `submitted_by`, les tables
  ne sont plus lisibles. Double chaque table d'une vue, avec ses droits et
  sa RLS (`security_invoker`) à maintenir, et les jointures PostgREST sont
  à refaire sur les vues.
- **Table séparée** : `submitted_by` sort des tables publiques vers une
  table privée. Toutes les règles RLS et les valeurs par défaut sont à
  refaire, et chaque création écrit dans deux tables.

## Décision

Privilèges par colonne, avec repli sur une table séparée si la RLS l'avait
exigé (piste retenue au refinement de #15).

- Sur festivals, editions et sources : `revoke select` de table pour `anon`
  et `authenticated`, puis `grant select (…)` sur toutes les colonnes sauf
  `submitted_by`. Les droits d'insertion ne changent pas.
- `upcoming_editions` est recréée avec une liste de colonnes explicite,
  sans `submitted_by`, toujours en `security_invoker = true`.
- Les règles RLS qui lisent `submitted_by` sur leur propre table
  fonctionnent : Postgres n'y vérifie pas les privilèges de colonne. Les
  sous-requêtes d'une règle, elles, sont soumises aux privilèges du
  lecteur : `sources_insert`, qui lisait `submitted_by` dans festivals et
  editions, échouait. Elle est réécrite sans le lire (option retenue par le
  PO plutôt que le repli) : une source s'ajoute à une fiche en attente
  visible. La RLS de lecture ne montrant une fiche en attente qu'à son
  auteur (ADR 0015), c'est équivalent à « en attente et à moi ».

Tests pgTAP : `supabase/tests/database/submitted-by.test.sql`.

## Conséquences

- `select *` est interdit aux rôles publics sur festivals, editions et
  sources : le site lit toujours des colonnes explicites.
- Toute nouvelle colonne doit être accordée explicitement (`grant select
  (colonne)`). Oubliée, elle reste illisible pour le public ; si le site la
  lit, le build échoue. Jamais de fuite silencieuse.
- Contrainte pour #8 : une écriture qui renvoie la ligne créée ne renvoie
  jamais `submitted_by` (`returning submitted_by` est refusé ; avec
  PostgREST, `Prefer: return=representation` doit lister ses colonnes).
- `sources_insert` dépend de la règle de lecture des fiches en attente :
  toute règle qui élargira cette visibilité (modération) devra revoir
  `sources_insert`.
- L'auteur lui-même ne lit plus `submitted_by` : il n'en a pas besoin, la
  RLS filtre déjà ses fiches.
