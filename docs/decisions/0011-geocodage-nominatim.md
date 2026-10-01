# 0011 — Géocodage : stockage des résultats Nominatim

- **Statut** : acceptée
- **Date** : 2026-10-01
- **Issue** : [#12](https://github.com/Cfy1010/ofests/issues/12)

## Contexte

Le spike sources ([0009](0009-sources-de-donnees.md)) a validé la chaîne
coordonnées MusicBrainz → géocodage inverse Nominatim. Elle fournit la ville,
le département, la région, le code postal et les codes ISO 3166-2, de quoi
alimenter tous les filtres géographiques sans saisie manuelle.

Ces données viennent d'OpenStreetMap, sous licence ODbL. Question : les
stocker fait-il de la base O-Fests une base dérivée, soumise au partage à
l'identique ?

## Décision

Géocoder une seule fois, à l'import ou à la validation d'une fiche, stocker
les champs obtenus, et afficher l'attribution OpenStreetMap. La base O-Fests
ne passe pas sous ODbL.

Appui : la [Geocoding Guideline](https://osmfoundation.org/wiki/Licence/Community_Guidelines/Geocoding_-_Guideline)
de la Fondation OSM, adoptée par son conseil le 2017-08-24. Elle pose que :

- un résultat de géocodage isolé est un extrait non substantiel, stockable
  avec d'autres données sans effet de partage à l'identique ;
- une collection de résultats reste non substantielle si elle ne contient que
  des noms, adresses ou coordonnées, et ne cherche pas à rassembler
  systématiquement tous les éléments d'un type sur une zone de la taille
  d'une ville ou plus ;
- elle devient une agrégation systématique si elle sert de base géographique
  généraliste ;
- l'application qui intègre un géocodeur doit créditer OpenStreetMap, mais la
  base géocodée n'a pas à porter d'attribution tant qu'elle n'est pas une base
  dérivée.

O-Fests entre dans ce cadre : coordonnées issues de MusicBrainz, seuls des
noms et des codes récupérés d'OSM, quelques centaines de lieux au plus, aucun
usage comme base géographique généraliste.

## Conditions de validité

La décision tient tant que ces règles sont respectées :

1. Seuls des noms, des éléments d'adresse et des codes sont stockés depuis
   Nominatim. Aucune géométrie OSM (contours, tracés).
2. Les lieux stockés sont ceux des festivals du catalogue. Pas de collecte
   systématique de lieux, pas de table de lieux généraliste.
3. L'attribution « © les contributeurs d'OpenStreetMap » est visible sur le
   site, au moins sur la carte et sur la page de crédits.
4. Le géocodage n'a pas lieu à l'affichage.
5. La politique d'usage de Nominatim (débit, User-Agent identifiant) est
   respectée. À relire avant tout import en lot.

## Conséquences

- Débloque [#3](https://github.com/Cfy1010/ofests/issues/3) : les colonnes
  géographiques peuvent être persistées. Leur emplacement (`festivals` ou
  `editions`) est à trancher dans #3, un festival pouvant changer de lieu.
- La licence des données propres à O-Fests (fiches, contributions) reste une
  décision ouverte, désormais indépendante de la question géographique.

## Limites

- Une ligne directrice de la Fondation OSM n'est pas la loi : elle indique la
  position de l'éditeur des données, un tribunal aurait le dernier mot.
- Classer les codes ISO 3166-2 parmi les « identifiants », que la ligne
  directrice assimile aux noms, est une lecture : le texte ne les cite pas.
- Si O-Fests prend de l'ampleur, la question mérite un avis juridique.

## Options écartées

- **Stocker et publier la base sous ODbL** : contraint la licence de toute la
  partie géographique sans nécessité, au vu de la ligne directrice.
- **Appeler Nominatim à l'affichage** : dépendance à un service tiers,
  latence sur chaque fiche, risque de blocage au regard de sa politique
  d'usage.
- **Saisie manuelle assistée, sans conserver la réponse** : charge humaine
  et qualité hétérogène, pour un gain juridique que la ligne directrice rend
  inutile.
