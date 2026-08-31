# 0003 — Genres : modèle mixte

Date : 2026-08-31
Statut : acceptée

## Contexte

Un annuaire doit décider ce qui fait qu'un festival appartient à un genre.
L'observation d'un annuaire généraliste montre le coût du mauvais choix : en
filtrant sur un tag présent chez au moins un artiste du line-up, sans seuil, des
festivals de trance et de techno remontent dans une liste heavy metal, en
contradiction avec le genre affiché sur leurs propres fiches.

## Options

- **Booléen validé à la main** — un modérateur tranche. Précis, ne passe à
  l'échelle que par la contribution.
- **Genre dominant avec seuil** — automatisable, mais suppose des données de
  line-up complètes, que le projet n'a pas.
- **Mixte** — un genre principal validé à la main fait foi, les sous-genres
  restent des tags secondaires.

## Décision

Modèle mixte. Le genre principal gouverne les filtres. Les sous-genres sont
descriptifs et non filtrants.

## Conséquences

- Un tag secondaire ne fait jamais entrer un festival dans un résultat de
  filtre.
- Le rappel sera plus faible que celui d'un moteur automatique. Sur une scène
  où le public connaît le sujet, la précision vaut plus que le volume : un seul
  résultat hors sujet discrédite toute la liste.
- La validation du genre principal fait partie du travail de modération.
