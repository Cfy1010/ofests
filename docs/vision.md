# Vision

## Vision

Un festivalier metal choisit son prochain festival européen sur O-Fests,
petits open airs compris, parce que les fiches y sont vérifiées et donnent
ce qui décide d'un déplacement.

## Le problème

Trouver un festival de metal en Europe oblige à recouper des pages Facebook,
des forums, des annuaires généralistes et le site de chaque festival. Deux
manques reviennent (détail dans le README) :

- **le genre est déduit, pas vérifié** : un festival hors sujet dans une
  liste metal suffit à discréditer la liste ;
- **l'information qui décide d'un déplacement est dispersée et inégale** :
  prix réel, camping, accessibilité, statut de l'organisateur.

Les petits open airs associatifs, absents des bases automatiques, en sont les
premières victimes.

## Pour qui

- **Le festivalier metal** qui prépare sa saison et compare des options
  concrètes. C'est la cible du produit.
- **Le contributeur** qui connaît un festival absent et veut l'y voir
  figurer. Il alimente le catalogue ; il n'est pas une cible à part égale
  (voir « La contribution »).

## Ce qui distingue O-Fests

D'après la REA fonctionnelle du 2026-10-18, trois axes restent libres :

1. **Un genre vérifié à la main qui gouverne les filtres.** Les concurrents
   filtrent par déduction.
2. **Des infos pratiques structurées, datées et sourcées, à l'échelle
   européenne.** Aucun des concurrents étudiés (REA du 2026-10-18) ne date
   ni ne source un prix, ni ne structure camping et accessibilité. *Pas
   encore construit* (#46).
3. **Une couverture homogène des petits festivals** : une fiche de petit
   open air tenue avec le même soin qu'une fiche de gros festival.

La contribution et la source obligatoire ne sont plus des différenciateurs :
les trois concurrents principaux acceptent des propositions.

## Principes

- Europe uniquement (ADR 0002).
- Un genre principal validé à la main gouverne les filtres ; les sous-genres
  restent des tags (ADR 0003, 0017).
- L'affiliation ne modifie jamais l'affichage (ADR 0006).
- Chaque fiche cite ses sources et sa date de révision (ADR 0007).
- Ce qui n'est pas publié reste privé (ADR 0015).
- Bilingue fr/en, mobile, thèmes clair et sombre (Definition of Done).

## La contribution

La contribution est **un moyen** d'alimenter le catalogue, pas un pilier du
produit. Le cœur reste la fiche vérifiée et modérée. Aujourd'hui, le
catalogue est alimenté par des lots vérifiés par le PO
(`supabase/production/`) ; la contribution des visiteurs (#39, #8, #9)
viendra s'y ajouter.

## Ce qu'O-Fests ne cherche pas à être

- Exhaustif, ni mondial.
- Un moteur de recommandation algorithmique.
- Une application de festival : horaires de passage, alertes, avis, photos,
  playlist, météo et hébergement sont écartés (REA, décision F).

## Comment on saura que ça marche

Trois sources (ADR 0028, 0031). La base de départ a été relevée le
2026-11-25 : [relevé](mesure/2026-11-25-base-audience.md).

- **Découverte** : O-Fests apparaît-il dans Google, et sur quelles requêtes
  (Search Console) ;
- **Visites** : fourchette entre Web Analytics (borne basse) et l'analytique
  du domaine sans robots nommés (borne haute) ;
- **Couverture** : des festivals absents des catalogues internationaux
  (test de couverture élargi, ADR 0032, #81).

**Cadence** : un relevé, selon la même méthode, avant et après chaque
livraison qui vise à changer le comportement des visiteurs, à la clôture de
chaque Product Goal, et au moins tous les trois mois. Indicateur suivi en
plus : les visites dont la page d'arrivée est une fiche festival (Web
Analytics).
