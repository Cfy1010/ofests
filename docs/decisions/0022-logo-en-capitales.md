# 0022 — Logo en capitales

Date : 2026-10-14
Statut : acceptée — précise l'ADR 0001

## Contexte

L'ADR 0001 fixe la graphie `O-Fests` pour tout texte lu, logo compris. Le
logo dessiné pour l'issue #24 est un mot-symbole en capitales Anton,
« O-FESTS », validé le 2026-10-14.

## Options

- **Logo en `O-Fests`** — conforme à la lettre de l'ADR 0001, mais Anton,
  condensée et haute, prend toute sa force en capitales.
- **Logo en capitales, texte en `O-Fests`** — le logo est un dessin, pas du
  texte : la graphie lue ne change pas.

## Décision

- La marque s'écrit `O-Fests` dans tout texte lu (titres, balise title, nom
  accessible du logo, contenu éditorial), comme le fixe l'ADR 0001.
- Seul le logo la stylise en capitales Anton : « O-FESTS », texte converti en
  tracés.
- Le tiret, recentré, épaissi et en rouge sang, est la signature de la
  marque : il garde son rouge dans les deux thèmes. Le favicon en dérive :
  monogramme « O-F », lettres crème sur tuile encre.

## Conséquences

- Le nom accessible du logo reste en `O-Fests` (« O-Fests, accueil » /
  « O-Fests, home ») : un lecteur d'écran ne lit pas « O-FESTS » lettre à
  lettre.
- Fichiers : `src/assets/brand/logo-ofests.svg` (lettres en `currentColor`,
  intégré en ligne dans l'en-tête) ; `public/brand/logo-ofests-sombre.svg` et
  `logo-ofests-clair.svg`, fichiers autonomes aux couleurs fixes.
