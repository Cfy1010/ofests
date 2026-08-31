# 0001 — Nommage : O-Fests

Date : 2026-08-31
Statut : acceptée

## Contexte

Trois graphies coexistaient : `O'Fests` dans AGENTS.md, `O-Fests` dans le
README, `ofests` dans le dépôt et le domaine.

## Options

- **O'Fests** — demande un échappement dans les URL, les slugs, le JSON et
  les requêtes SQL ; ambiguë à l'oral et à la saisie (apostrophe droite ou
  typographique).
- **O-Fests** — se normalise en `ofests` sans perte.
- **OFests** — lisible mais efface la coupure entre le O et Fests.

## Décision

`O-Fests` pour tout texte lu : README, titres, balise title, logo, contenu
éditorial.
`ofests` pour tout usage machine : domaine, dépôt, slugs, identifiants.

## Conséquences

- AGENTS.md à corriger.
- JSON-LD Organization : `name` = O-Fests, `url` = ofests.com, pour que les
  deux graphies soient associées côté moteurs.