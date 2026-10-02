# 0014 — Docker pour le développement local, jamais au déploiement

Date : 2026-10-02
Statut : acceptée

## Contexte

Le README excluait Docker de la stack. Cette contrainte ne protégeait rien
de précis : Docker n'avait simplement aucune utilité jusqu'ici.

#3 (schéma Supabase avec RLS) change la donne. Le développement local de
Supabase demande le CLI Supabase et un environnement compatible Docker. Les
critères de #3 exigent un schéma qui se rejoue sur une base vide et des
règles RLS vérifiées par des tests.

## Options

- **Sans copie locale** — migrations créées en local, appliquées sur un
  projet Supabase en ligne réservé au développement. Respecte l'ancienne
  contrainte, mais chaque essai touche une vraie base, et il faut un projet
  distant de plus.
- **Docker pour le seul développement local** — une copie complète de
  Supabase sur la machine, réinitialisable à volonté, tests de RLS en local.

## Décision

Docker sert uniquement au développement local de la base, avec Docker
Desktop sur moteur WSL 2. Il n'intervient jamais dans le déploiement : le
site reste statique sur Cloudflare Pages, la base reste chez Supabase.

## Conséquences

- La ligne du README sur Docker est précisée en ce sens.
- Les migrations sont testées en local avant tout envoi vers le projet en
  ligne.
- Le critère « se rejoue sur une base vide » de #3 se vérifie par
  réinitialisation de la base locale.
- Un seul projet Supabase en ligne suffit, celui de production.
- Docker Desktop s'ajoute aux prérequis du poste de développement, à
  documenter dans `AGENTS.md`.
