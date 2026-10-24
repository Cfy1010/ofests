# 0027 — Éditeur non professionnel

Date : 2026-10-24
Statut : acceptée

## Contexte

L'issue #60 ajoute les mentions légales (LCEN, art. 1-1 et 1-2 ; loi
n° 2004-575 du 21 juin 2004). Il faut décider comment l'éditeur d'O-Fests
est présenté. Le site est public, le sourcing du lot 2 (#45) contacte des
organisateurs, et la contribution (#39) collectera des données personnelles
(adresse e-mail) : le RGPD impose alors d'identifier le responsable du
traitement (art. 13.1 a).

## Options

- **A. Éditeur identifié** (LCEN art. 1-1, I) : nom, adresse, téléphone et
  directeur de la publication publiés. Transparent, mais expose l'identité
  et l'adresse personnelles d'un particulier.
- **B. Anonyme total** : aucune identité nulle part. Incompatible avec le
  RGPD, art. 13.1 a, dès la première collecte de données : l'utilisateur doit
  savoir qui traite ses données.
- **C. Hybride** : éditeur non professionnel anonyme sur les mentions légales
  (art. 1-1, II), hébergeur publié, et responsable du traitement nommé dans
  la politique de confidentialité.

## Décision

Option C.

- Les mentions légales indiquent l'hébergeur (identité, adresse, téléphone)
  et précisent que l'éditeur est un particulier non professionnel qui a
  communiqué son identité à l'hébergeur. Aucun nom ni adresse personnelle.
- Le responsable du traitement est nommé dans la politique de confidentialité,
  livrée avec #39, avant toute création de compte.
- Contact public : `contact@ofests.com`, dans le pied de page de chaque page.

## Conséquences

- La condition de l'anonymat est l'absence de contrepartie économique. Le
  premier lien affilié (ADR 0006), une publicité ou un sponsoring imposent la
  bascule en éditeur identifié (option A), dans la même PR.
- Tant que #39 n'est pas livrée, aucune donnée personnelle n'est collectée :
  l'option C reste conforme.
- Le texte des mentions est à faire relire par un juriste si possible.
