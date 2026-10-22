# 0026 — Filtrage côté navigateur de la liste à venir

Date : 2026-10-22
Statut : acceptée

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
