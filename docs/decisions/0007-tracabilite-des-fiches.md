# 0007 — Traçabilité des fiches

Date : 2026-08-31
Statut : acceptée

## Contexte

Les fiches agrégeront des données de plusieurs origines : contributions,
sites officiels, bases publiques. Sans traçabilité, une erreur devient
impossible à corriger à la source, et rien ne distingue une information
vérifiée d'une information reprise.

## Options

- **Aucune mention de source** — plus rapide, invérifiable.
- **Sources et date de révision affichées sur chaque fiche.**

## Décision

Chaque fiche affiche ses sources et sa date de dernière révision. Une
information non sourçable n'est pas publiée.

## Conséquences

- Le modèle de données doit prévoir des champs source et date de révision.
- Une fiche ancienne est identifiable comme telle par le lecteur.
- Contrainte de saisie supplémentaire pour le contributeur et le modérateur.
