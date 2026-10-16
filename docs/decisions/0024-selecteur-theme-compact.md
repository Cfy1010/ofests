# 0024 — Sélecteur de thème compact

Date : 2026-10-16
Statut : acceptée — révise l'ADR 0021 (forme du sélecteur seulement)

## Contexte

L'issue #35 : l'en-tête mobile passait sur deux lignes à cause des trois
boutons du sélecteur de thème. La #31 a traité le symptôme (espacement). Or
le thème se choisit une fois et reste mémorisé : il n'a pas besoin de
trois boutons visibles sur chaque page.

## Options

- **Garder les trois boutons visibles** : aucun changement, mais l'en-tête
  reste sur deux lignes sur mobile.
- **Compact sur mobile seulement** : deux présentations à maintenir et à
  vérifier, dans deux thèmes et deux langues.
- **Compact partout** : une seule présentation, sur mobile et sur desktop.

## Décision

Compact partout, par décision du PO.

- Un `<details>` / `<summary>` natif entoure les boutons radio, conservés
  tels quels (même `fieldset`, même logique, sans ARIA ajouté : `<details>`
  annonce déjà l'état ouvert ou fermé).
- Le `<summary>` affiche l'icône du thème actif : soleil (clair), lune
  (sombre), cercle à moitié plein (système). Le nom accessible est complet,
  « Thème : Clair » (« Theme: Light »), en texte masqué. Une seule icône est
  visible, par le CSS, selon `data-theme` ; lune sans `data-theme`,
  cohérente avec « Sombre » coché dans le HTML statique.
- Zone cliquable d'au moins 44 × 44 px.
- Le panneau s'ouvre sous le bouton, aligné à droite, au-dessus du contenu.
  Il reste ouvert quand on change de choix, pour ne pas casser la navigation
  aux flèches entre les radios.
- Fermeture par Échap (le focus revient au bouton), par un clic en dehors
  ou quand le focus quitte le menu, Tab ou Maj+Tab vers un élément
  extérieur (dans les deux cas le focus ne bouge pas).
- Sans JavaScript, le sélecteur reste masqué (ADR 0021).

## Conséquences

- Révise l'ADR 0021 sur la forme du sélecteur uniquement. Le reste de 0021
  est inchangé : sombre par défaut, trois états, mémorisation, script de
  tête, couleurs sémantiques.
- Changer de thème coûte un clic de plus : acceptable pour un choix fait une
  fois.
- L'en-tête tient sur une ligne jusqu'à 320 px ; `flex-wrap` reste en
  sécurité pour les très petites largeurs ou le zoom.
- Le script de `ThemeSwitcher.astro` ne gère que la fermeture (Échap, clic
  extérieur, sortie du focus) ; l'ouverture est native. Sans JavaScript, le
  sélecteur reste masqué.
