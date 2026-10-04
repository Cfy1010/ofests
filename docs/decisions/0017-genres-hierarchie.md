# 0017 — Genres : hiérarchie tendances / genres

Date : 2026-10-04
Statut : acceptée — révise l'ADR 0003

## Contexte

L'ADR 0003 fixe le modèle mixte (un genre principal filtrant, des sous-genres
descriptifs) sans arrêter la liste. Or aucun festival ne peut être créé sans
genre principal.

L'échantillon du benchmark (7 festivals, `docs/benchmark/fest.md`) montre trois
profils : des festivals à genre spécifique, des festivals centrés sur une
tendance et ses sous-genres, et des festivals multi-genres. Ces derniers ne
sont pas réservés aux gros festivals : 5 des 7 festivals de l'échantillon,
petits pour la plupart, sont multi-genres. Un genre unique imposé ne permet
pas de les classer honnêtement.

## Options

- **Liste plate de tendances** — simple, mais un festival 100 % black metal
  ne peut pas être filtré comme tel, et deux styles distincts au public commun
  (thrash et death) ne peuvent pas cohabiter sans multiplier les combinaisons.
- **Genre principal facultatif** — les festivals multi-genres deviennent
  introuvables par genre, et la contrainte `main_genre not null` tombe.
- **Plusieurs genres principaux** — revient sur l'ADR 0003, et ne couvre pas
  les festivals qui programment bien plus de deux genres.
- **Hiérarchie à deux niveaux** — tendances et genres, le genre principal
  pouvant désigner l'un ou l'autre.

## Décision

Hiérarchie à deux niveaux dans `genres`, plus les sous-genres en tags :

- **Tendance** (niveau 1, `parent_slug` vide) : regroupement propre à
  O-Fests, sur le critère du public commun, observé par la co-programmation
  des festivals. Filtrer sur une tendance inclut ses genres.
- **Genre** (niveau 2) : noms repris de Rate Your Music, par défaut le premier
  niveau de sa branche metal. Un sous-genre RYM est promu genre quand il a un
  public distinct (nu metal, rap metal, funk metal). Le périmètre inclut aussi
  hard rock, glam metal, grunge, hardcore et punk rock.
- **Sous-genre** : tag libre dans `festivals.subgenres`, non filtrant
  (ADR 0003, inchangé).
- **`all-styles`** (« Toutes tendances ») : valeur de niveau 1, sans genre
  enfant, pour les festivals multi-genres.
- Une tendance peut n'avoir aucun genre enfant (Grunge).

Le genre principal d'un festival est une tendance, un genre ou `all-styles`.

Règle de classement :

1. Si le site officiel présente le festival sous un seul genre ou une seule
   tendance, ce classement s'applique.
2. Si la présentation est absente, vague ou couvre plusieurs tendances, on
   prend l'affiche de la dernière édition : un genre qui réunit plus de la
   moitié des groupes, à défaut une tendance qui en réunit plus de la moitié.
3. Sans majorité, ou sans affiche connue : `all-styles`.
4. Le modérateur tranche en dernier ressort.

Gestion de la liste :

- La liste initiale (10 tendances, `all-styles`, 31 genres) est insérée par
  la migration `genres_hierarchie`. Ensuite, la table fait foi.
- Libellés fr/en stockés en base (`label_fr`, `label_en`).
- Deux niveaux exactement et slug immuable, garantis par le trigger
  `genres_hierarchy`.
- Un genre ou une tendance utilisés ne peuvent pas être supprimés (clés
  étrangères) : on les archive (`archived`).
- Seul le modérateur écrit dans `genres` : `anon` et `authenticated` n'ont que
  la lecture (migration `rls_policies`).
- Pas d'alignement sur les genres MusicBrainz pour l'instant.

## Conséquences

- L'ADR 0003 reste valable sur le principe : un seul genre principal fait foi
  pour les filtres, les tags ne filtrent jamais. Seule la structure change.
- La modération choisit un niveau (genre ou tendance) et doit parfois compter
  une affiche.
- Déplacer un genre d'une tendance à une autre se fait en changeant son
  `parent_slug` : les placements discutables (Symphonic, Industrial, Djent,
  Groove) restent révisables à faible coût.
- Les genres archivés restent lisibles (policy `genres_select`), pour que les
  festivals qui les utilisent gardent leur libellé. Le front les exclut des
  filtres et du formulaire de proposition.
- Dans l'échantillon, `all-styles` est la classe dominante. Leur traitement
  dans les filtres (#6) devient structurant.
- Aligner les slugs sur MusicBrainz demandera une colonne de correspondance.
- Limite : le critère de public commun repose sur la co-programmation
  observée sur quelques festivals, pas sur une mesure d'audience.

Classement de l'échantillon (sources secondaires, octobre 2026) :

| Festival | Classement | Étape |
|---|---|---|
| Metal Hunting Open Air | Extrême | 2 |
| Bambi Metal Fest | Death Metal | 2 (affiche 2023) |
| Mauges Pit Fest | Toutes tendances | 2 |
| Wellesweiler Open Air | Toutes tendances | 3 |
| RIIP Fest | Toutes tendances (provisoire) | 3 |
| Liège Metal Fest | Toutes tendances | 2 |
| Rock The Lakes | Toutes tendances | 2 |
