# 0034. Product Goal : des festivals à venir quel que soit le mois

Date : 2026-11-26
Statut : acceptée

## Contexte

Le Product Goal dont l'ADR 0032 fixe le critère est atteint le 2026-11-26.
Preuves :

- test de couverture élargi (#81,
  [relevé](../benchmark/couverture-2026-11-26.md)) ;
- infos pratiques de l'édition livrées (#46) ;
- édition 2027 de Sylak Open Air (#143) ;
- filtre vérifié en ligne le 2026-11-26 (France, avril à juin 2027 : Metal
  Hunting Open Air, absent de FestT et FEST).

Base de départ au 2026-11-26 : 14 éditions à venir publiées, aucune de
janvier à avril 2027.

| Mois | Éditions à venir publiées |
| --- | --- |
| Décembre 2026 | 2 |
| Janvier à avril 2027 | 0 |
| Mai 2027 | 1 |
| Juin 2027 | 4 |
| Juillet 2027 | 2 |
| Août 2027 | 5 |

Constat du PO : le catalogue est trop léger ; un visiteur qui cherche un
festival entre janvier et avril ne trouve rien.

## Options

- **A. Au moins 2 éditions publiées pour chaque mois de janvier à juin
  2027.**
- **B. La même chose, avec au moins 1 pour janvier et février** : écartée,
  parce qu'elle affaiblirait d'avance le critère sur les mois les plus
  difficiles.
- **C. Un volume total de festivals** : écartée, parce qu'un volume total peut
  être atteint avec des festivals d'été seulement, sans rien de janvier à
  avril.
- **D. Une fenêtre glissante de 6 mois après la date de vérification** :
  écartée, parce que le temps la remplirait sans travail.

## Décision

Option A, décidée par le PO le 2026-11-26.

Intention :

> Un festivalier metal trouve sur O-Fests des festivals européens à venir,
> quel que soit le mois.

Critère d'atteinte :

> Chaque mois de janvier à juin 2027 compte au moins 2 éditions publiées
> (date de début dans le mois).

Toute édition ajoutée affiche ses infos pratiques avec source et date
(ADR 0033).

## Conséquences

- Pas de clause sur les catalogues internationaux : elle est déjà prouvée
  sous l'ADR 0032 et n'est pas répétée.
- Risque connu : au 2026-11-26, aucun festival européen n'est annoncé pour
  janvier et février 2027. À réévaluer pendant le premier lot, sans affaiblir
  le critère d'avance.
- L'hypothèse d'audience est portée par les issues des lots (convention de
  [la roadmap](../roadmap.md)).
- Le [relevé d'audience du 2026-11-25](../mesure/2026-11-25-base-audience.md)
  sert de relevé de clôture du goal précédent et de base du nouveau.
