# Développement local

## Prérequis

- Node 24.20.0, fixé par `.nvmrc`
- Docker Desktop, pour la base Supabase locale (voir [0014](decisions/0014-docker-developpement-local.md))
- Un fichier `.env` copié depuis `.env.example`

## Démarrer

1. Lancer Docker Desktop et attendre qu'il soit prêt.
2. `npx supabase start` : base, API et Studio en local.
3. `npm run dev` : serveur Astro. Cette commande ne démarre pas Supabase.

Adresses :

- Site : http://localhost:4321/fr/festivals/ (et `/en/festivals/`)
- API Supabase : http://127.0.0.1:54321
- Supabase Studio : http://127.0.0.1:54323

Les données sont les festivals fictifs de `supabase/seed.sql`, avec des
dates relatives au jour même. Sans Supabase démarré, la liste échoue
volontairement : `selectAll` lève une erreur plutôt que d'afficher une
liste vide.

## Arrêter

- Ctrl+C dans le terminal d'Astro
- `npx supabase stop`

## Windows : ports refusés au démarrage de Supabase

**Symptôme** : `npx supabase start` échoue avec `ports are not available`
et `An attempt was made to access a socket in a way forbidden by its
access permissions`, par exemple sur le port 54322.

**Cause** : le moteur WSL2 de Docker s'appuie sur Hyper-V, qui réserve des
plages de ports dynamiques. Les ports de Supabase (54320 à 54329, voir
`supabase/config.toml`) peuvent tomber dedans.

**Diagnostic**, dans PowerShell en administrateur :

    netsh interface ipv4 show excludedportrange protocol=tcp

Le problème est confirmé si une plage englobe les ports de Supabase.

**Correctif**, une seule fois, permanent :

    net stop winnat
    netsh int ipv4 add excludedportrange protocol=tcp startport=54320 numberofports=10
    net start winnat

La plage `54320 54329 *` apparaît alors comme exclusion administrée, et
Windows ne la réserve plus pour Hyper-V. Si Docker Desktop se comporte
mal ensuite, le redémarrer.
