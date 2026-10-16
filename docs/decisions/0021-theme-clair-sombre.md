# 0021 — Thème : sombre par défaut, clair ou système par choix explicite

Date : 2026-10-13
Statut : acceptée — révisée par l'ADR 0024 (forme du sélecteur seulement)

## Contexte

Le site n'avait qu'un thème sombre, couleurs codées en dur dans les
composants. L'issue #25 demande de pouvoir lire O-Fests en clair, selon son
appareil ou son choix (en plein soleil comme le soir), sans ajouter de
couleur à la palette de l'identité (`AGENTS.md`). Plus le thème arrive tard,
plus il y a de pages à reprendre.

## Options

- **Suivre l'appareil par défaut** (`prefers-color-scheme`) : l'usage
  courant, mais un appareil réglé en clair ne verrait jamais l'identité
  sombre sans le demander.
- **Sombre par défaut, clair et système par choix explicite** : l'identité
  d'abord, au prix d'un premier affichage sombre sur un appareil réglé en
  clair.

## Décision

- Sombre par défaut : l'identité metal, c'est le noir. Le clair n'apparaît
  que par choix explicite du visiteur.
- Sélecteur à trois états, Clair / Sombre / Système (Light / Dark / System),
  dans l'en-tête à côté du lien de langue : boutons radio natifs dans un
  `fieldset`, sans ARIA ajouté. « Sombre » est coché dans le HTML statique.
- Le choix est mémorisé sur l'appareil (`localStorage`, clé `ofests-theme`,
  valeurs `light`, `dark` ou `system`). Sans valeur, ou valeur invalide :
  sombre. Système fait suivre `prefers-color-scheme`.
- Un script en tête de page applique le choix avant le premier affichage
  (attribut `data-theme` sur `<html>`). C'est une copie écrite à la main des
  fonctions testées de `src/lib/theme.js`. Lecture et écriture du stockage
  sont protégées : stockage bloqué ou navigation privée, la page reste
  sombre et fonctionne.
- Sans JavaScript : sombre, et le sélecteur, inopérant, est masqué.
- `color-scheme` suit le thème : `dark` par défaut, `light` en clair,
  `light dark` en système.
- Les composants n'emploient que six couleurs sémantiques ; la palette ne
  génère plus de classes Tailwind.
- La Definition of Done ajoute « vérifié dans les deux thèmes ».

## Répartition des couleurs et contrastes

Ratios WCAG calculés sur les valeurs d'`AGENTS.md`. Pas de test
automatique : toute nouvelle couleur sémantique recalcule ses ratios ici.

| Variable  | Rôle                        | Sombre                   | Clair                    |
| --------- | --------------------------- | ------------------------ | ------------------------ |
| `page`    | fond                        | encre                    | crème                    |
| `body`    | texte courant               | crème, 15,6:1            | encre, 15,6:1            |
| `muted`   | texte atténué               | crème 80 % (#C0B9AB), 10,1:1 | encre 80 % (#383635), 9,5:1 |
| `line`    | séparateurs (décoratifs)    | crème 20 %, 1,6:1        | encre 20 %, 1,6:1        |
| `link`    | liens, contrôles, focus     | rouge braise, 4,7:1      | rouge sang, 4,9:1        |
| `heading` | grands titres (≥ 24px)      | rouge sang, 3,2:1        | rouge sang, 4,9:1        |

- En sombre, le rouge sang reste réservé au grand texte (3:1 exigé) ; en
  clair, il passe le seuil du texte courant (4,5:1) et sert aussi aux liens.
- Le rouge braise n'a que 3,3:1 sur crème : jamais en clair.
- Les séparateurs restent à 20 % : décoratifs, ils ne portent aucune
  information et WCAG n'exige pas de ratio.

## Conséquences

- Compromis assumé : un appareil réglé en clair voit d'abord le site en
  sombre, jusqu'à ce que le visiteur choisisse Clair ou Système.
- Le script de tête et `src/lib/theme.js` doivent rester identiques : la
  copie à la main est signalée par un commentaire des deux côtés.
- Les valeurs du thème clair figurent deux fois dans `src/styles/global.css`
  (`data-theme="light"` et Système sous `prefers-color-scheme: light`), à
  garder identiques.
- Pas de `theme-color` (barre du navigateur mobile) ni de synchronisation
  entre onglets pour l'instant.
- Toute nouvelle page ou composant est vérifié dans les deux thèmes
  (Definition of Done).
