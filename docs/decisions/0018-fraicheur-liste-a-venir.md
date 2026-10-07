# 0018 — Liste à venir : statique + rebuild quotidien

Date : 2026-10-07
Statut : acceptée

## Contexte

L'issue #4 livre la liste des éditions à venir, à partir de la vue
`upcoming_editions` (ADR 0016). `AGENTS.md` impose des pages statiques, avec
le SEO comme priorité. Or une liste « à venir » générée au build se périme :
une édition terminée reste affichée, et une fiche publiée n'apparaît qu'au
déploiement suivant.

## Options

- **A. Statique + rebuild planifié** : SEO maximal, coût nul, jusqu'à 24 h
  de retard.
- **B. Rendu serveur (adaptateur Cloudflare)** : toujours exact, mais une
  requête Supabase par visite et une dérogation au tout-statique.
- **C. Statique + îlot React rafraîchi côté navigateur** : SEO et données
  fraîches, mais deux chemins de rendu à maintenir et un risque de saut
  visuel au chargement.

## Décision

Option A. Un workflow GitHub Actions planifié (cron, de nuit) envoie chaque
jour une requête POST au deploy hook Cloudflare Pages.

## Conséquences

- La liste peut avoir jusqu'à environ 24 h de retard, jugé acceptable pour
  un annuaire de festivals. L'heure de démarrage d'un workflow planifié
  n'est pas garantie à la minute.
- Environ 30 builds par mois, sur les 500 du plan gratuit de Cloudflare
  Pages (quota relevé le 2026-10-07).
- Le deploy hook ne demande aucune authentification : son URL est stockée en
  secret GitHub (`CF_DEPLOY_HOOK_URL`). En cas de fuite, supprimer le hook
  et en générer un nouveau.
- Le dépôt étant public, GitHub désactive les workflows planifiés après
  60 jours sans activité. À surveiller si le projet est mis en pause.
- Évolution possible : déclencher aussi un rebuild à la publication d'une
  fiche (issue à créer).
