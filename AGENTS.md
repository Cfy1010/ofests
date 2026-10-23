# O-Fests

Annuaire des festivals metal en Europe. Site public, bilingue,
alimenté par des contributions modérées.

## Stack
- Astro (pages statiques, SEO prioritaire) + îlots React
- Tailwind 4, JavaScript (pas de TypeScript)
- `typescript` et `@astrojs/check` en devDependencies pour la seule
  vérification : `npx astro check` contrôle les types des fichiers `.astro`
  (annotations JSDoc côté `.js`). Aucun code TypeScript dans le dépôt
- Supabase : Postgres, auth par lien magique, storage images
- MapLibre + tuiles OpenStreetMap (pas de Google Maps)
- Déploiement Cloudflare Workers, ressources statiques seules, bâti par
  Workers Builds (ADR 0020). Configuration dans `wrangler.jsonc` : `dist/`
  servi tel quel, sans script `main`. `wrangler` en devDependency ;
  `npx wrangler deploy --dry-run` valide la configuration sans déployer
- Rebuild quotidien à 03:17 UTC (`.github/workflows/daily-rebuild.yml`,
  ADR 0018, 0020) : POST au deploy hook du Worker, qui rebâtit `main`.
  URL du hook en secret GitHub `CF_DEPLOY_HOOK_URL`, jamais dans le dépôt.
  Lancement manuel : `gh workflow run daily-rebuild.yml`
- Node 24.20.0, fixé par `.nvmrc`, que Workers Builds lit au build. Ne pas
  définir `NODE_VERSION` dans les variables de build du Worker : la
  version est fixée par `.nvmrc` seul. La version
  compte : les dates sont formatées par `Intl`, et Node 22 et 24 n'espacent
  pas les plages de la même façon
- Tests : `npm test` (`node --test`, sans dépendance) pour les fonctions
  pures de `src/lib/`, dans des fichiers `*.test.js` ; `npx supabase test db`
  pour la base (pgTAP)
- `npm run build` lance `npm test` avant `astro build` : un test en échec
  bloque le déploiement, et Cloudflare garde la version en ligne

## Périmètre
- Europe uniquement
- Bilingue fr/en, routes /fr/ et /en/, hreflang obligatoire
- `x-default` pointe vers l'anglais, pour les visiteurs européens ni
  francophones ni anglophones
- Liste des festivals à venir : `/fr/festivals/` et `/en/festivals/`
  (`src/pages/{fr,en}/festivals/index.astro`, composant
  `src/components/UpcomingList.astro`). Le nom de chaque festival mène à sa
  fiche. Filtre par pays (#51, ADR 0026) : îlot React
  `src/components/UpcomingFilter.jsx`, fonctions pures de `src/lib/filters.js`.
  État dans l'URL (`?country=FR,BE`, codes ISO, `replaceState`), liste
  complète sans JavaScript, canonical et hreflang sans query, seul le lien de
  langue (`data-language-link`) reprend la query. Filtre par période (#52) :
  deux `<select>` « De » et « À » (mois + année), `?from=2027-06&to=2027-08`,
  combinable avec `country` ; `availableMonths()`, `parsePeriodParam()` et
  `filterEditions()` dans `src/lib/filters.js`. Sous la liste, la section
  « Prochaine édition non annoncée »
  (`src/components/UnannouncedList.astro`, #40) donne les festivals publiés
  sans édition à venir : nom lié à la fiche et pays de leur dernière édition
  (nom seul s'ils n'en ont aucune), par ordre alphabétique. Elle vient de
  `selectFestivalsWithoutUpcoming()` (`src/lib/festivals.js`) sur les fiches
  de `fetchFestivalSheets()`, et n'est pas rendue quand elle est vide
- Fiche festival (ADR 0023) : `/{locale}/festivals/{slug}/`
  (`src/pages/{fr,en}/festivals/[slug].astro`, composant
  `src/components/FestivalSheet.astro`, logique dans `src/lib/festivals.js`).
  Une page par festival publié, avec ou sans édition. Édition présentée :
  la prochaine à venir (vue `upcoming_editions`), à défaut la dernière
  passée (« Dernière édition »), à défaut aucune. Sources du festival et de
  l'édition présentée, une ligne par URL ; date de dernière révision ;
  JSON-LD `MusicEvent` seulement pour une édition à venir datée. Chemin
  d'une fiche : `festivalPath(slug)`, source unique
- `/` redirige vers `/en/festivals/` en 302 (`public/_redirects`, lu par
  Cloudflare Workers seulement : en local, `/` renvoie une 404). Il n'y a pas
  de page d'accueil
- `defaultLocale` reste `"fr"` dans `astro.config.mjs` alors que la
  redirection et `x-default` visent l'anglais : le français est la langue de
  rédaction du site, l'anglais la langue servie à un visiteur dont on ne
  connaît pas la langue. Ce réglage n'a pas d'effet visible, les deux
  langues étant préfixées et Astro ne redirigeant rien
- Chaque page porte un lien vers la même page dans l'autre langue, libellé
  dans la langue cible (layout `src/layouts/Base.astro`)
- Libellés d'interface dans des fichiers JSON, jamais en dur dans le JSX :
  `src/i18n/fr.json` et `en.json`, lus par `useTranslations(locale)`
  (`src/i18n/index.js`). Un libellé manquant fait échouer le build.
  Paramètres : `t("festival.revisedOn", { date })` remplace `{date}`
  (`src/i18n/interpolate.js`) ; un paramètre sans valeur fait échouer le build

## Données
- Noms de tables et de colonnes en anglais, snake_case
- Droits explicites : en production, l'exposition automatique des nouvelles
  tables est désactivée. Toute migration qui crée une table ou une vue fait
  `revoke all … from anon, authenticated` puis des `grant` explicites
  (exemple : `20261003151432_editions_a_venir.sql`). Sans cela, elle marche
  en local et échoue en production
- `submitted_by` n'est lisible ni par `anon` ni par `authenticated`
  (ADR 0025) : sur festivals, editions et sources, la lecture est accordée
  colonne par colonne, sans elle. `select *` y est refusé aux rôles publics.
  Toute nouvelle colonne lue par le site doit recevoir son `grant select
  (colonne)`, sinon le build échoue. `upcoming_editions` liste ses colonnes
  explicitement, sans `submitted_by`
- Table `festivals` : identité stable (name, slug, website, main_genre,
  subgenres, wikidata_id, musicbrainz_id)
- Table `genres` : liste contrôlée à deux niveaux, tendances et genres
  (ADR 0003, 0017). Le genre principal d'un festival est une tendance, un
  genre ou `all-styles` ; filtrer sur une tendance inclut ses genres. Les
  sous-genres sont des tags non filtrants. Libellés fr/en en base, slug
  immuable, archivage au lieu de suppression, écriture réservée au
  modérateur
- Table `editions` : une ligne par année d'un festival (year obligatoire,
  dates facultatives, lieu et champs géographiques ; affiche et billetterie
  à venir). Le lieu est porté par l'édition (ADR 0013)
- Table `sources` : sources d'une fiche, festival ou édition (URL, type,
  date de consultation). Pas de publication sans source (ADR 0007, 0013)
- `festivals` et `editions` portent un `status` (pending / published /
  rejected), un `submitted_by` (uuid, FK vers auth.users, privé) sur
  lequel s'appuie la RLS, et un `revised_at`
- Éditions à venir : vue `upcoming_editions`, qui applique la RLS du lecteur.
  Pas de publication sans dates pour une édition de l'année en cours ou
  passée (ADR 0016)
- Amorçage depuis Wikidata (CC0), importé directement en published,
  avec Wikidata enregistrée comme source
- Lecture au build par `src/lib/supabase.js`, avec la clé publishable
  (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, modèle dans
  `.env.example`). Variables absentes : le build échoue. Pas de clés
  `anon` / `service_role`, que Supabase déprécie ; la clé secrète
  (`sb_secret_…`) n'entre jamais dans le dépôt ni dans le build
- Jeu de données local : `supabase/seed.sql`, festivals fictifs et dates
  relatives à la date du jour, chargé par `supabase db reset`. Jamais en
  production. Les tests pgTAP ne dépendent pas du seed : ils vident
  festivals, editions et sources (`truncate … cascade`) dans leur
  transaction, annulée à la fin

## Contribution
- Compte obligatoire, demandé APRÈS remplissage du formulaire
- Ni modification ni suppression par les utilisateurs ; une source ne
  s'ajoute qu'à ses propres fiches en attente (ADR 0015)
- Auth par lien magique ; conserver le brouillon avant l'envoi du mail
- Formulaire en 3 étapes : essentiel / détails / confirmation
- Les fiches en attente ne sont visibles que de leur auteur : le public ne lit que les fiches publiées (ADR 0015)
- Sécurité par RLS Postgres, pas de contrôle applicatif

## Identité
- Titrage Anton, texte Inter, auto-hébergées (pas de CDN Google)
- Encre #0B0B0D, crème #EDE4D3, rouge sang #C1121F, rouge braise #E63946
- Deux thèmes (ADR 0021). Sombre par défaut, sans JavaScript ou sans choix
  mémorisé : fond encre, texte crème. Clair par choix explicite : fond
  crème, texte encre. Un sélecteur Clair / Sombre / Système dans l'en-tête,
  compact : icône du thème actif, menu `<details>` (ADR 0024,
  `src/components/ThemeSwitcher.astro`) ; Système suit l'appareil
  (`prefers-color-scheme`). Choix mémorisé en `localStorage`
  (`ofests-theme`), appliqué avant le premier affichage par un script de
  tête dans `src/layouts/Base.astro`, copie de `src/lib/theme.js`
- Répartition des rouges par thème :
  - sombre : rouge sang uniquement en grand texte (≥ 24px, ou ≥ 19px en gras
    700+), 3,2:1 sur encre ; rouge braise pour les liens et contrôles en
    petit corps, 4,7:1 sur encre
  - clair : rouge sang pour les titres ET les liens, 4,9:1 sur crème ; jamais
    de rouge braise, 3,3:1 sur crème
- Couleurs uniquement par les variables sémantiques de
  `src/styles/global.css` : `page`, `body`, `muted`, `line`, `link`,
  `heading` (`bg-page`, `text-muted`…). La palette n'y génère aucune classe :
  pas de `bg-ink` ni `text-blood` dans les composants
- Logo (ADR 0022) : « O-FESTS » en capitales Anton, texte en tracés ; la
  marque s'écrit `O-Fests` partout ailleurs. `src/assets/brand/logo-ofests.svg`
  (lettres en `currentColor`) est importé comme composant SVG Astro et
  intégré en ligne dans l'en-tête (`src/components/Logo.astro`), lettres en
  `text-body`. `public/brand/logo-ofests-sombre.svg` et
  `logo-ofests-clair.svg` sont des fichiers autonomes aux couleurs fixes. Le
  tiret signature est en rouge sang, fixé dans les fichiers, dans les deux
  thèmes. Le logo mène à l'accueil de la langue courante : `HOME_PATH` de
  `src/lib/home.js` (aujourd'hui la liste `/{locale}/festivals/`, jamais `/`)
- Favicon : monogramme « O-F », `public/favicon.svg`, `favicon.ico` (16, 32,
  48 px) et `apple-touch-icon.png` (180 px, tuile pleine) générés depuis lui
  par un outil ponctuel, sans dépendance ajoutée
- Metal dans l'enveloppe, sobriété dans la donnée

## Domaine et marque
- Domaine : ofests.com, enregistré chez Cloudflare Registrar (renouvellement
  automatique actif)
- Cloudflare ne vend pas les .eu ; le .eu reste libre si besoin un jour
- Recherche d'antériorité faite le 28/08/2026 : INPI (data.inpi.fr) et
  TMview. Aucune marque européenne. Une seule marque française proche,
  « Touk Ô Fest » (FR5101270, classe 41, déposée en 2024) — jugée
  suffisamment distincte, et « fest » est un terme générique du secteur.
- Aucun dépôt de marque effectué à ce stade. À reconsidérer si le site
  prend de l'ampleur (env. 190 € pour une classe, 10 ans).

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
