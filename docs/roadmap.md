# Roadmap

## Conventions

- Un seul Product Goal actif à la fois : il est atteint ou abandonné avant
  le suivant (Scrum Guide 2020).
- Un jalon GitHub porte le Product Goal en cours. C'est le seul jalon
  ouvert ; les jalons fermés gardent l'historique.
- Les anomalies et la maintenance n'ont pas de jalon.
- Des horizons, pas de dates. « Maintenant » est un engagement ; au-delà, ce
  sont des pistes candidates, revues à la clôture du goal en cours.
- L'ordre détaillé des issues vit dans le tableau du projet, pas ici.
- Une issue qui vise à changer le comportement des visiteurs porte, dès son
  refinement, une section « Hypothèse » (pratique EBM de Scrum.org,
  complémentaire au Scrum Guide) : indicateur, seuil, délai ; et le critère
  d'acceptation « base relevée avant la mise en ligne ». Le résultat se lit
  au relevé suivant. Les anomalies, les retouches et les corrections de
  conformité (audit Opquast) en sont dispensées.

## Maintenant — Product Goal en cours

**Permettre à un festivalier metal de trouver un festival européen qui
l'intéresse, y compris ceux qu'aucun annuaire automatique ne référence.**

Critère d'atteinte (ADR 0032, qui révise 0010) : le site est en ligne ; un
visiteur filtre le catalogue par pays et par période et y trouve des
festivals absents de FestT et FEST (test de couverture élargi) ; chaque
édition à venir affiche prix, camping et accessibilité, renseignés ou
marqués « non précisé », avec source et date.

| Élément du critère | État |
| --- | --- |
| Site en ligne | Livré |
| Liste et fiches | Livré (#4, #5) |
| Filtres pays, période, genre | Livré (#6, #51, #52, #53, #57) |
| Festivals absents des catalogues internationaux | Lots livrés (#45) ; [test de couverture élargi](benchmark/couverture-2026-11-26.md) (#81) |
| Infos pratiques de l'édition | Livré (#46, ADR 0033) |

## En parallèle — hors Product Goal

- Signaler une erreur sur une fiche (#47)
- Anomalies et retouches : #76, #64, #16

## Ensuite — pistes candidates

- Contribution des visiteurs : SMTP de production (#38), puis proposer un
  festival (#39, #8) et modération (#9)
- Ajouter une édition à son agenda, .ics (#49)

## Plus tard — sans issue sauf mention

D'après la REA (décision G) : carte du lieu (#29), recherche par nom, pages
par pays et par tendance, lien « Vous organisez ce festival ? », API,
historique des éditions, line-up.

Import MusicBrainz/Wikidata (#7) : son sort est lié au réexamen de l'ADR 0009.

Signaux de contenu IA (search, ai-input, ai-train) dans robots.txt : à
décider avec la licence des données. Sans issue tant que la licence n'est
pas tranchée.

## Écarté

Avis, photos, récompenses des contributeurs, favoris et alertes,
recommandation, météo et hébergement, playlist, horaires de passage,
application mobile. Raisons dans la REA fonctionnelle (décision F).

## À vérifier

- #8 et #39 : découpage, pas doublon. #8 est la proposition par un visiteur
  (tranches : « mes contributions », nouvelle édition d'un festival publié) ;
  #39 est la première tranche (proposer un festival manquant).
