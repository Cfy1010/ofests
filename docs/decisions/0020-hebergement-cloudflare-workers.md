# 0020 — Hébergement : Cloudflare Workers au lieu de Cloudflare Pages

Date : 2026-10-13
Statut : acceptée — révise l'ADR 0018

## Contexte

L'ADR 0018 prévoit un site statique rebâti chaque nuit par le deploy hook de
Cloudflare Pages. Aucun projet Cloudflare n'existe encore. Pages reste
supporté, mais la documentation Cloudflare recommande Workers pour les
nouveaux projets (bannière de developers.cloudflare.com/pages/, consultée
le 2026-10-13).

## Options

- **Cloudflare Pages** : prévu par l'ADR 0018, mais plus le choix recommandé
  pour un nouveau projet.
- **Cloudflare Workers, ressources statiques + Workers Builds** : la voie
  recommandée, qui couvre nos besoins (voir Conséquences).

## Décision

Cloudflare Workers, en ressources statiques seules, bâti par Workers Builds
depuis le dépôt GitHub. `wrangler.jsonc` à la racine : `dist/` servi tel
quel, sans script `main`.

## Conséquences

- L'option A de l'ADR 0018 (statique + rebuild quotidien) est inchangée :
  seul l'hébergeur change. Le workflow `daily-rebuild.yml` appelle le deploy
  hook du Worker au lieu de celui de Pages.
- Workers couvre nos besoins :
  - `public/_redirects` est lu par les ressources statiques, en 302 par
    défaut ;
  - `.nvmrc` est lu par Workers Builds ;
  - les deploy hooks existent depuis avril 2026 : POST sans
    authentification, une branche par hook. L'URL reste en secret GitHub
    (`CF_DEPLOY_HOOK_URL`).
- Quota : 3 000 minutes de build par mois sur le plan gratuit, au lieu des
  500 builds de Pages (relevé le 2026-10-13).
- Les variables `PUBLIC_SUPABASE_*` sont définies dans « Build variables and
  secrets » du Worker : elles servent au build, pas à l'exécution.
- `wrangler` entre en devDependency.
