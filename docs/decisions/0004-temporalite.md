# 0004 — Temporalité : tri sur la date, jamais sur l'année

Date : 2026-08-31
Statut : acceptée

## Contexte

Le modèle sépare `festivals` et `editions`, et une édition porte une année. La
pente naturelle est d'afficher « éditions 2026 ». Un annuaire généraliste
observé le fait, et le résultat est illisible : un bloc « Festivals 2026 »
mélange dates écoulées et à venir sans ordre apparent, la seule date future
arrivant en quatrième position.

## Options

- **Regroupement par année** — simple à implémenter, mais une année n'est pas
  un état : « 2026 » ne dit pas si l'événement a eu lieu.
- **Tri sur la date, séparation à-venir / passé.**

## Décision

Tri par date croissante. L'édition à venir en premier, les éditions passées en
section repliée. Les compteurs comptent l'à-venir.

## Conséquences

- Toute liste doit pouvoir énoncer sa règle de tri en une phrase affichable.
- L'historique reste consultable, il n'est pas supprimé.
- Aucun libellé d'année ne sert d'axe temporel dans l'interface.
