# Parcours de contribution — spec

## Contexte

Comment un visiteur propose un nouveau festival ou une nouvelle édition,
depuis la découverte qu'il peut contribuer jusqu'à la publication après
modération. S'appuie sur les décisions déjà actées dans AGENTS.md (compte
demandé après remplissage, auth par lien magique, brouillon conservé,
fiches pending visibles publiquement, sécurité par RLS uniquement).

## Périmètre

**Dans ce parcours :**
- Proposer un nouveau festival
- Proposer une nouvelle édition d'un festival déjà publié
- Page « mes contributions »
- Mécanisme de modération : états, transitions, ce que voit le
  contributeur — pas l'écran de modération lui-même

**Hors périmètre (explicitement reporté) :**
- Signalement d'erreur sur une fiche publiée : bouton simple créant un
  signalement, sans mécanisme de révision — à construire plus tard si le
  volume le justifie
- Interface d'admin de modération : pour le lancement, modération
  manuelle dans Supabase Studio ; une interface minimale viendra dans une
  session dédiée
- Notifications email automatiques : pour le lancement, la page « mes
  contributions » est la seule boucle de retour ; les premiers
  contributeurs sont prévenus à la main

## Points d'entrée

1. **État vide de recherche** — quand une recherche ne donne aucun
   résultat, l'état vide propose d'ajouter le festival manquant. C'est le
   meilleur point d'entrée : le visiteur a déjà une intention et constate
   le manque.
2. **Fiche festival publiée** — bouton « proposer une édition » sur une
   fiche déjà publiée. C'est le seul point d'entrée pour ce cas : le
   visiteur voit depuis la fiche quelles éditions existent déjà et
   propose ce qui manque.

Un ou plusieurs points d'entrée génériques supplémentaires (nav, accueil)
restent une question ouverte (voir plus bas).

## Détection de doublon

Dans les deux cas, un message factuel avec lien — jamais de blocage
silencieux ni de bascule automatique vers un autre formulaire, le
formulaire ne présume pas de l'intention du visiteur :

- **Nouveau festival** — si le nom saisi correspond à un festival déjà
  référencé : « Hellfest est déjà référencé » + lien vers sa fiche.
- **Nouvelle édition** — si une édition existe déjà pour cette année sur
  ce festival (`pending` ou `published`) : « L'édition 2027 du Hellfest
  est déjà proposée/publiée » + lien vers cette édition.

## Flux « nouveau festival »

Formulaire en 3 étapes (essentiel / détails / confirmation). Une seule
soumission crée à la fois la ligne `festivals` (status `pending`) et la
ligne `editions` de la première édition (status `pending`).

Ce regroupement est délibéré : séparer les deux forcerait le
contributeur vers un second formulaire alors qu'il a déjà les dates en
tête, et sa fiche festival serait encore `pending` — donc inaccessible
pour y revenir proposer l'édition séparément.

La répartition exacte des champs entre les 3 étapes n'est pas encore
tranchée (voir questions ouvertes).

## Flux « nouvelle édition »

Formulaire séparé et plus léger (dates, affiche, billetterie), accessible
uniquement depuis la fiche d'un festival déjà publié. Crée une ligne
`editions` (status `pending`) rattachée au festival existant.

Le nombre d'étapes réel de ce formulaire (3 comme le flux complet, ou
allégé) est une question ouverte.

## Authentification et brouillon

- Compte demandé **après** remplissage du formulaire, juste avant la
  soumission finale.
- Le brouillon est conservé en **localStorage** jusqu'à validation de
  l'authentification — jamais écrit en base tant que le visiteur n'est
  pas authentifié.
- Écriture en base uniquement après authentification réussie : c'est ce
  qui permet à la RLS de vérifier `auth.uid()` sans aucun contrôle
  applicatif.
- Mécanisme précis (lien magique cliqué vs code à saisir dans l'onglet
  d'origine) : à trancher à l'implémentation, les deux reposent sur le
  même mécanisme Supabase.
- Compromis acceptés : le brouillon est perdu si l'onglet est fermé
  avant validation ; un changement d'appareil pendant la validation perd
  aussi le brouillon (sauf si l'implémentation retient l'option code plutôt
  que lien).

## États et visibilité

| Statut | Visibilité publique | Visibilité pour l'auteur |
|---|---|---|
| `pending` | Oui, marquée « non vérifiée » | Oui |
| `published` | Oui, normale | Oui |
| `rejected` | Non — disparaît de l'affichage public | Oui, dans « mes contributions », avec son statut |

Le rejet doit rester visible pour son auteur : sinon il ne comprend pas
ce qui s'est passé et reprécise/repropose inutilement.

Le motif de rejet affiché au contributeur est une question ouverte,
dépendante de la question des notifications (reportée).

## Page « mes contributions »

Nouvelle page, accessible uniquement authentifié : liste les
festivals et éditions soumis par le contributeur avec leur statut
courant (`pending` / `published` / `rejected`). C'est la seule boucle de
retour pour le lancement — pas d'email.

## Modération (mécanisme, pas l'écran)

- Pour le lancement, la modération est manuelle dans Supabase Studio :
  changement du `status` directement en base.
- Aucune notification automatique au changement de statut — reporté,
  compromis assumé (boucle de retour cassée pour l'instant, prévenance
  manuelle des premiers contributeurs).
- Une interface d'admin dédiée dans le site est explicitement hors
  périmètre de ce parcours.

## Sécurité

RLS Postgres uniquement, pas de contrôle applicatif. Implique une
colonne `submitted_by` (uuid, FK vers `auth.users`) sur `festivals` et
`editions`, absente du modèle de données actuel décrit dans AGENTS.md.

Esquisse des policies nécessaires (à détailler à l'implémentation) :

- **INSERT** sur `festivals`/`editions` : réservé aux utilisateurs
  authentifiés ; le `status` est forcé à `pending` par la policy (ou un
  default + contrainte), jamais laissé au client.
- **SELECT** : public voit `published` et `pending` sans restriction ;
  `rejected` visible uniquement quand `auth.uid() = submitted_by`.
- **UPDATE**/changement de `status` : aucune policy côté client — la
  modération manuelle via Supabase Studio agit avec le rôle service, qui
  contourne la RLS.

## Stockage image (affiche)

L'upload de l'affiche a lieu après authentification, au même moment que
l'écriture en base (même contrainte RLS/policy que pour les tables).
Obligatoire ou optionnel pour la soumission : question ouverte.

## Questions ouvertes

1. Répartition exacte des champs par étape — **partiellement tranchée**
   (héritage 2019) : étape 1 = nom, ville, pays, dates (correspond aux
   colonnes non nullables du schéma). Étape 2 = adresse, genres, affiche,
   site, Facebook, description. Étape 3 = confirmation. Reste à valider
   le détail de l'étape 2.
2. Nombre d'étapes réel pour le flux « nouvelle édition » — 3 comme le
   flux complet, ou allégé vu le peu de champs.
3. Affiche : upload obligatoire ou optionnel pour valider une
   soumission ?
4. Genres : **tranchée** — liste contrôlée en sélection multiple, plafond
   à 5 genres, source `Genres_metal.json`. La saisie libre produirait des
   doublons de casse et d'orthographe. Reprend le choix de 2019.
5. Coordonnées du festival : pin déposé sur une carte MapLibre, ou
   adresse saisie puis géocodée ?
6. Point d'entrée générique : **tranchée** — bouton « Ajouter » permanent
   dans la barre du haut, à côté de la recherche, en plus de l'état vide
   de recherche.
7. Motif de rejet affiché au contributeur — à trancher une fois la
   question des notifications rouverte.
8. Mécanisme précis lien magique vs code OTP — à trancher à
   l'implémentation.
9. Publication d'un nouveau festival : publier le festival publie-t-il
   automatiquement sa première édition, ou faut-il valider les deux
   séparément ? Risque de festival publié sans dates si on oublie l'un
   des deux en modération manuelle.
10. L'édition est-elle obligatoire pour soumettre un nouveau festival ?
    Un contributeur peut connaître un festival sans savoir quand aura
    lieu la prochaine édition.
11. Affiche et brouillon : le fichier est choisi pendant le remplissage
    mais uploadé après authentification. Le localStorage ne peut pas
    stocker une image, donc le fichier est perdu si le visiteur doit
    revenir sur l'onglet. Compromis à assumer ou à contourner.
12. Adresse précise du lieu : absente du schéma actuel (seulement ville et
    coordonnées). Le formulaire de 2019 la collectait. Utile pour un
    annuaire consulté avant un déplacement — à ajouter ou à assumer.
