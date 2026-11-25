# 0033. Infos pratiques : prix, camping, accessibilité par édition

Date : 2026-11-25
Statut : acceptée

## Contexte

Le critère du Product Goal (ADR 0032) demande que chaque édition à venir
affiche prix, camping et accessibilité, « renseignés ou marqués « non
précisé », avec source et date ». Le schéma n'a aucun champ pour elles
(#46). Il faut choisir où les porter, sous quelle forme, et comment les
sourcer alors que les sources sont rattachées à la fiche entière
(ADR 0013).

## Options

### Où porter les champs

- **Sur le festival** : faux dès qu'un tarif ou un camping change d'une
  année à l'autre.
- **Sur l'édition**, comme le lieu et les dates (ADR 0013).

### Forme du prix

- **Gratuité et montant séparés** : deux champs à garder cohérents.
- **Un seul champ** à trois valeurs : non précisé, gratuit, « à partir de »
  avec montant et devise.
- **Fourchette ou grille de tarifs** : lourde à saisir et à tenir à jour,
  sans gain pour décider d'un déplacement.

### Source de la section

- **Aucune source propre** : la section s'appuie sur la liste des sources
  de l'édition (ADR 0013). On ne sait pas quelle page justifie les infos ni
  quand elle a été consultée.
- **Une source par champ** : fidèle à 0007, mais trois liens pour trois
  lignes.
- **Une source pour toute la section**, désignée parmi les sources de
  l'édition.

## Décision

Champs sur l'édition, un seul champ de prix, une source pour la section
(refinement du 2026-11-25).

- **Prix** (`price_kind`) : `unspecified` (par défaut), `free`, ou `from`
  avec `price_amount` (strictement positif) et `price_currency` (code
  ISO 4217). « À partir de » est le plus bas plein tarif : hors réductions
  (étudiant, groupe, prévente limitée) et hors frais de service. Quand la
  page officielle n'affiche qu'un prix frais inclus, sans détail des frais, on
  retient le prix affiché (décision du PO, 2026-11-25).
- **Camping** (`camping`) et **accessibilité** (`accessibility`) :
  `unspecified` (par défaut), `yes`, `no`. « Non » seulement si la source le
  dit ; une source muette laisse « non précisé ».
- **Accessibilité, sens de « oui »** : la source décrit un dispositif
  d'accès pour les personnes à mobilité réduite ou en situation de handicap
  (plateforme, accès adapté, accompagnement, billetterie dédiée…).
- **Source** (`practical_source_id`) : une ligne de `sources` de la même
  édition, garantie par une clé étrangère composée
  `(practical_source_id, id)` vers `sources (id, edition_id)`. La saisie
  crée une ligne de source dédiée aux infos pratiques, avec sa propre date
  de consultation, même si la même URL source déjà autre chose.
- **Contraintes en base** : montant et devise ensemble, et seulement pour
  `from` ; une valeur renseignée exige la source. Tout « non précisé », la
  source reste facultative : une édition pas encore vérifiée reste
  publiable.
- **Affichage** (fiche, ADR 0023) : pour une édition à venir seulement,
  section « Infos pratiques » avec les trois lignes, valeur ou « Non
  précisé », puis la source et sa date de consultation. Cette ligne de
  source n'est pas répétée dans la liste « Sources » ; une autre ligne de
  même URL y reste. Une édition passée présentée n'a pas de section : sa
  source d'infos pratiques reste alors dans la liste.
- **Lecture publique** : `grant select` des six colonnes (ADR 0025).
  `upcoming_editions` est inchangée : la fiche lit `editions` et ne prend
  de la vue que les identifiants.

Tests pgTAP : `supabase/tests/database/infos-pratiques.test.sql`.

## Conséquences

- Le critère de l'ADR 0032 se vérifie à la saisie, pas en base : une
  édition à venir publiée sans `practical_source_id` affiche trois « Non
  précisé » sans source. La liste de travail se tire d'une requête (voir la
  PR de #46).
- Supprimer une source utilisée par la section est refusé ; supprimer
  l'édition reste possible.
- Le modérateur vérifie que la source dit bien ce qui est saisi, comme pour
  le reste de la fiche (ADR 0013).
- Hors périmètre : filtre, texte libre, hébergement, saisie par les
  contributeurs (#8), JSON-LD `offers`.
