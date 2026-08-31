# 0008 — Reprise dans un dépôt neuf

Date : 2026-08-31
Statut : acceptée

## Contexte

Le projet initial de 2019 tournait sur WordPress en headless, avec une base
MariaDB contenant 12 fiches publiées.

## Options

- **Migrer l'existant** — conserve l'historique du dépôt, impose un modèle de
  données obsolète et une stack abandonnée.
- **Repartir d'un dépôt neuf** — perd l'historique, libère les choix.

## Décision

Dépôt neuf. Les données exploitables ont été extraites du dump avant abandon.

## Conséquences

- L'ancien dépôt `ofests2019` reste archivé et privé.
- Aucune dette technique héritée de WordPress.
- Le travail de 2019 n'apparaît pas dans l'historique git du nouveau dépôt.
