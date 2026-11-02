# 0030 — Stockage des affiches d'édition

Date : 2026-11-02
Statut : acceptée

## Contexte

L'issue #74 affiche sur la fiche d'un festival l'affiche officielle de
l'édition présentée (ADR 0023). Reproduire une affiche demande l'accord de
l'auteur (CPI, art. L122-4). Il faut choisir où les fichiers sont stockés,
comment ils sont liés aux éditions, comment on en remplace un, et ce que
cela implique pour un site statique (ADR 0018, 0020) dont l'éditeur est le
seul modérateur.

## Options

- **A. Fichiers dans le dépôt**, traités au build par le composant Image
  d'Astro (`src/assets/posters/`).
- **B. Supabase Storage** (bucket public), chemin en base, image
  téléchargée au build pour être optimisée par Astro.
- **C. Dossier `public/`** servi tel quel, variantes de taille préparées à la
  main.

## Décision

Option A.

- **Lien par convention de nom** : `src/assets/posters/{slug}-{année}.webp`
  (`motocultor-festival-2027.webp`). Aucune colonne, aucune migration. Une
  affiche est rattachée à une édition, jamais au festival : la fiche ne la
  montre que pour l'édition qu'elle présente (`findPoster(slug, année)`).
- **Deux contrôles** de cette convention :
  - `npm test` vérifie que chaque fichier du dossier respecte le format
    (`src/lib/posters.test.js`) ;
  - le build vérifie que chaque fichier correspond à un festival publié et à
    une de ses éditions visibles (`checkPosters()`, appelée par
    `getStaticPaths`). Le test ne lit pas la base, d'où ce second contrôle.
    Une anomalie fait échouer le build en production, donc le déploiement :
    Cloudflare garde la version en ligne. Une affiche pour une édition encore
    en attente échoue de même, pour ne pas partir avant la publication.
- **Rendu** : composant `<Image>` d'Astro, WebP en 320, 480 et 640 px de
  large (`srcset`), `width` et `height` renseignés. Fichiers au nom
  empreinté, servis par O-Fests, sans lien vers le site du festival. Texte
  alternatif « Affiche officielle de <festival> <année> », crédit « Affiche
  officielle de <festival> » ; sans affiche, la fiche est inchangée.
- **Ajout et remplacement** par une PR : le fichier est déposé ou remplacé
  sous le même nom. Le nom empreinté évite tout cache périmé ; l'ancienne
  version n'est plus servie après le build.
- **Qui et quand** : seul le modérateur ajoute une affiche, et seulement si
  l'usage est autorisé par écrit : accord reçu du festival, ou conditions
  d'utilisation publiées par le festival (espace presse, par exemple)
  couvrant cet usage. La trace est conservée hors du dépôt : l'e-mail dans la
  messagerie contact@ofests.com, ou la page, la date et la capture des
  conditions.

## Conséquences

- **Le dépôt est public et git garde l'historique.** Un retrait d'accord ôte
  l'affiche du site au build suivant, mais pas de l'historique du dépôt. Ce
  risque est accepté : les affiches sont déjà publiées par les festivals, et
  les accords reçus (Motocultor Festival et Brutal Assault, le 2026-10-30)
  sont sans conditions.
- Le dépôt grossit d'environ 300 Ko par affiche, plus les anciennes versions
  dans l'historique.
- Le rebuild quotidien (ADR 0018) ne change rien : la liste des fichiers ne
  bouge pas la nuit, et Astro met en cache les images transformées.
- Pas de formulaire d'ajout : chaque affiche passe par une PR et un build.
  C'est proportionné à un modérateur unique et à quelques affiches par an.
- Un build local contre le jeu de données du `seed.sql` échoue, puisque les
  festivals réels n'y sont pas ; en développement (`astro dev`), l'anomalie
  est seulement signalée dans la console.
- **Évolution possible : option B**, quand la contribution d'affiches
  arrivera (hors périmètre de #74). Les contributeurs déposeraient alors un
  fichier sans PR ; il faudrait une colonne en base, des politiques de
  storage, des droits explicites, et un téléchargement au build pour garder
  l'optimisation par Astro. La convention de nom resterait la clé de lien.
