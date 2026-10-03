# 0015 — Visibilité et écriture des fiches : ce qui n'est pas publié reste privé

Date : 2026-10-03
Statut : acceptée

## Contexte

L'ADR 0005 prévoyait que les fiches en attente soient visibles publiquement,
pour que le contributeur voie que sa proposition existe. L'écriture des règles
RLS de #3 a fait apparaître deux faits. Une fiche `pending` n'est pas tenue
d'avoir une source : le trigger ne l'exige qu'au passage en `published`
(ADR 0007). Et la règle « chacun voit ses propres fiches » suffit à l'objectif
de l'ADR 0005.

## Options

- **Fiches en attente publiques (ADR 0005)** — un visiteur voit qu'un festival
  a déjà été proposé, ce qui limite les doublons. Mais le catalogue public
  expose alors des informations non sourcées et non modérées, spam compris,
  potentiellement indexées par les moteurs de recherche.
- **Fiches en attente visibles de leur seul auteur** — le catalogue public ne
  contient que du contenu curé et sourcé. Le risque de doublons se traite
  ailleurs.

## Décision

- Un visiteur ne lit que les fiches `published`. Un contributeur connecté voit
  en plus ses propres fiches, quel que soit leur statut.
- Une édition n'est visible que si son festival l'est.
- Un contributeur ne peut ajouter une source qu'à ses propres fiches en attente.
- Aucune modification ni suppression par les utilisateurs : la modération passe
  par Supabase Studio (ADR 0005), puis par un rôle dédié.

## Conséquences

- Remplace la conséquence de l'ADR 0005 sur la visibilité publique des fiches
  en attente. Le reste de l'ADR 0005 est inchangé.
- Le critère d'acceptation de #3 sur la lecture anonyme est corrigé.
- Le formulaire de contribution devra limiter les doublons, par exemple en
  cherchant un nom proche avant la soumission.
- Compléter ou corriger les sources d'une fiche publiée demandera un circuit de
  modération dédié.
- Un contributeur ne peut pas corriger seul sa proposition tant qu'aucune
  interface d'édition n'existe.
