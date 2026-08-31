# 0005 — Contribution : compte demandé après le formulaire

Date : 2026-08-31
Statut : acceptée

## Contexte

Le catalogue repose sur des propositions de visiteurs. Le moment où l'on exige
un compte détermine le taux d'abandon.

## Options

- **Compte avant le formulaire** — filtre le spam en amont, mais fait
  abandonner ceux qui viennent rendre service.
- **Compte après le formulaire** — l'effort est déjà consenti au moment de la
  demande.
- **Aucun compte** — modération ingérable.

## Décision

Le compte est demandé une fois le formulaire rempli. Le brouillon est conservé
pendant l'inscription.

## Conséquences

- Statuts `pending` / `published` / `rejected`.
- Les fiches en attente sont visibles publiquement avec leur statut affiché :
  le contributeur voit que sa proposition existe.
- La persistance du brouillon est une exigence, pas une option.
- Modération via Supabase Studio au lancement, interface dédiée plus tard.
