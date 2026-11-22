# 0032. Critère du Product Goal élargi aux infos pratiques

Date : 2026-11-17
Statut : acceptée, révise l'ADR 0010

## Contexte

Le Product Goal (README) : « Permettre à un festivalier metal de trouver un
festival européen qui l'intéresse, y compris ceux qu'aucun annuaire
automatique ne référence. »

Son critère d'atteinte, précisé par l'ADR 0010, est presque rempli : le site
est en ligne, le filtre par pays et par période est livré (#51, #52), des
festivals absents de FestT et de FEST sont au catalogue. Reste le test de
couverture élargi exigé par l'ADR 0010.

L'intention, elle, n'est pas remplie. Le README promet « les informations
pratiques qui décident d'un déplacement », et le schéma n'a aucun champ pour
elles (REA fonctionnelle du 2026-10-18, #46). La REA en fait l'axe libre le
plus net face aux concurrents.

Déclarer le goal atteint sur ce critère mesurerait ce qui est livré, pas le
besoin servi.

## Options

- **A. Élargir le critère une fois** aux infos pratiques.
- **B. Clôturer le goal** après le test de couverture, puis en formuler un
  nouveau, qui porterait vraisemblablement sur les infos pratiques :
  découpage artificiel d'une même intention.
- **C. Reformuler le goal entier** : aucune donnée d'usage ne remet
  l'intention en cause ; la base d'audience n'est pas encore relevée.

## Décision

Option A, décidée par le PO le 2026-11-17. Nouveau critère d'atteinte :

> Le site est en ligne ; un visiteur filtre le catalogue par pays et par
> période et y trouve des festivals absents de FestT et FEST (test de
> couverture élargi, ADR 0010) ; chaque édition à venir affiche prix, camping
> et accessibilité, renseignés ou marqués « non précisé », avec source et
> date.

L'élargissement est unique : le prochain changement de ce Product Goal sera
sa clôture (atteint ou abandonné).

## Conséquences

- L'intention du Product Goal est inchangée ; seul le critère change.
- Le test de couverture de l'ADR 0010 reste une condition.
- #46 et son ADR (modèle de données des infos pratiques) entrent dans le
  goal. #47 (signaler une erreur) n'y entre pas : il sert la qualité, pas
  l'intention « trouver ».
- Un jalon GitHub porte le goal en cours ; c'est le seul jalon ouvert
  (convention dans `docs/roadmap.md`).
- Aucun indicateur d'audience dans le critère tant que la base de départ
  n'est pas relevée (ADR 0028, 0031) ; à reconsidérer au goal suivant.
- Le README reprend le nouveau critère.
