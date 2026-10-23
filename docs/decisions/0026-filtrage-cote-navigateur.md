# 0026 — Filtrage côté navigateur de la liste à venir

Date : 2026-10-22
Statut : acceptée, complétée le 2026-10-23 pour #52 et #53

## Contexte

L'epic #6 ajoute des filtres (pays, période, genre) à la liste des festivals
à venir. La liste est générée au build et rebâtie chaque jour (ADR 0018,
0020). Il faut décider où le filtrage s'exécute. La #51 (pays) ouvre
l'epic ; les règles ci-dessous valent pour #52 et #53.

## Options

- **A. Filtrage dans le navigateur, sur la liste statique** : aucune requête,
  réponse immédiate, pages et URL inchangées.
- **B. Pages statiques par filtre** (`/fr/festivals/pays/FR/`) : indexables,
  mais le nombre de pages explose avec plusieurs pays, périodes et genres
  combinés, sans besoin SEO identifié.
- **C. Requête Supabase depuis le navigateur** : liste toujours fraîche, mais
  expose la base au navigateur et contredit le tout-statique (ADR 0018).

## Décision

Option A.

- La liste complète reste dans le HTML. Sans JavaScript, elle s'affiche en
  entier et les contrôles de filtre restent masqués (comme le sélecteur de
  thème, ADR 0021).
- Un îlot React filtre la liste et lit puis écrit l'état dans l'URL :
  `?country=FR,BE`, codes neutres en langue (ISO 3166-1 alpha-2). Les
  changements passent par `history.replaceState` : le bouton Retour ne se
  remplit pas d'un cran par case cochée.
- La logique de filtrage est une fonction pure, `src/lib/filters.js`, testée
  par `npm test`.
- ET entre les filtres, OU à l'intérieur d'un filtre. Une sélection vide ne
  filtre pas. Les codes inconnus ou sans édition à venir sont ignorés en
  silence.
- Le filtre ne s'applique qu'à la liste à venir ; « Prochaine édition non
  annoncée » reste entière.
- Les liens `canonical` et `hreflang` sont générés au build et pointent vers
  la page non filtrée. Seul le lien du sélecteur de langue reprend la query,
  mise à jour côté client.
- Le nombre de résultats est annoncé aux lecteurs d'écran (`aria-live`)
  uniquement lors d'un changement de filtre, jamais au montage.

### Filtre par période (#52)

- URL : `?from=2027-06&to=2027-08` (AAAA-MM), combinable avec `country`
  (`?country=FR,BE&from=2027-06`). Chaque borne est facultative.
- Liste des mois : tous les mois, en continu, du mois du build (UTC, comme
  les dates des éditions) jusqu'au dernier mois couvert par une édition à
  venir. Pour une édition sans date, ce dernier mois est décembre de son
  année. Un mois sans édition reste proposé : le filtre conduit alors à
  l'état « aucun résultat » et à son bouton de réinitialisation.
- Recoupement : une édition datée est retenue si mois(début) ≤ `to` et
  mois(fin, à défaut début) ≥ `from` ; une édition du 30 juin au 2 juillet
  sort donc pour juin seul comme pour juillet seul. Une édition sans date
  est retenue si année(`from`) ≤ année ≤ année(`to`). Une borne absente ne
  limite pas. ET avec le filtre pays.
- Plage invalide : impossible dans l'interface (dans « À », les mois
  antérieurs à « De » sont désactivés ; si « De » passe après « À », « À »
  prend la valeur de « De »). Dans une URL saisie à la main avec début >
  fin, les deux bornes sont inversées en silence. Une valeur au mauvais
  format ou absente de la liste est ignorée en silence.

### Filtre par genre (#53)

- URL : `?genre=extreme,doom-metal`, slugs de la base (immuables, ADR 0017),
  combinable avec `country`, `from` et `to`. À la lecture, un slug inconnu
  ou absent des options est ignoré en silence ; un genre dont la tendance
  est aussi présente est retiré (redondant).
- Règle d'inclusion. Soit S les slugs cochés ; S vide ne filtre pas. Un
  festival est retenu si son genre principal est dans S, ou est un genre
  dont la tendance parente est dans S, ou est une tendance parente d'un
  genre de S (un festival « Extrême » sort pour « Black metal »), ou vaut
  `all-styles`. Seul le genre principal compte, jamais les sous-genres
  (ADR 0003). ET avec les autres filtres : un festival `all-styles` reste
  filtré par pays et par période.
- Pas de case « Toutes tendances » : ces festivals sont toujours retenus,
  une phrase sous les cases le dit.
- Options : seulement ce qui est utilisé par une édition à venir. Une
  tendance est proposée si elle-même ou l'un de ses genres est utilisé, un
  genre s'il est utilisé. Tendances puis genres, triés dans la langue de la
  page. Une tendance cochée inclut ses genres : ils s'affichent cochés et
  désactivés.
- Archivés (ADR 0017) : exclus des options. Un festival classé dans un
  genre archivé reste retenu si sa tendance est cochée. Conséquence : un
  festival classé dans un genre dont la **tendance** est archivée ne sort
  plus dès qu'un filtre de genre est actif, puisque ni le genre ni sa
  tendance ne sont proposés ; il reste dans la liste non filtrée.
- Données : les libellés d'une tendance dont seuls des genres sont utilisés
  ne figurent pas dans la vue `upcoming_editions`. Le build lit donc aussi
  la table `genres` (`fetchGenres()`, colonnes explicites, pagination de
  `selectAll` avec tri par `slug`). Pour chaque ligne, les slugs qui la
  retiennent sont précalculés au build (`genreKeys()`), ce qui garde
  `filterEditions()` pur.

## Conséquences

- La liste est présente deux fois : dans le HTML et dans les props de
  l'îlot. Acceptable au volume actuel ; à réévaluer si le catalogue atteint
  quelques centaines d'éditions.
- Le HTML servi est non filtré : un lien `?country=FR` affiche brièvement la
  liste complète avant l'hydratation. Accepté en l'état.
- Une page filtrée n'est pas indexée comme telle : le SEO repose sur la page
  non filtrée et sur les fiches (ADR 0023).
- Les libellés des pays et le tri alphabétique sont calculés au build, dans
  la langue de la page, avec la version de Node fixée par `.nvmrc`.
