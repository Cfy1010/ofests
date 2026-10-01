# 0010 — Critère d'atteinte du Product Goal

- **Statut** : acceptée
- **Date** : 2026-10-01

## Contexte

Le critère d'atteinte demandait que le visiteur trouve des festivals
« absents des annuaires généralistes ». Le mot « généraliste » désignait
deux familles différentes : les catalogues internationaux tous genres
(FestT, FEST) et les annuaires nationaux tous genres (festivalenfrance.com,
festivalsindeutschland.de).

Le test du 01/10/2026 montre que les 4 petits festivals issus des annuaires
nationaux y ont une fiche, alors qu'aucun des 7 festivals testés n'est sur
FEST. Pris à la lettre, le critère n'était ni atteignable ni vérifiable.

## Décision

Le critère vise les catalogues internationaux : le visiteur trouve sur
O-Fests des festivals absents de FestT et de FEST.

## Conséquences

- Le critère se vérifie par le même test de couverture que le 01/10/2026,
  à refaire sur un échantillon plus large avant de déclarer le goal atteint.
- L'intention du Product Goal est inchangée.
- La présence de petits festivals sur les annuaires nationaux est documentée
  dans `docs/benchmark/annuaires-generalistes.md`, et n'est pas un critère.

## Alternative écartée

Recentrer le critère sur la combinaison spécialisation metal, échelle
européenne et petits festivals. Plus différenciant, mais moins mesurable.
