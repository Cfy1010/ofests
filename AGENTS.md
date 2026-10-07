# O-Fests

Annuaire des festivals metal en Europe. Site public, bilingue,
alimenté par des contributions modérées.

## Stack
- Astro (pages statiques, SEO prioritaire) + îlots React
- Tailwind 4, JavaScript (pas de TypeScript)
- Supabase : Postgres, auth par lien magique, storage images
- MapLibre + tuiles OpenStreetMap (pas de Google Maps)
- Déploiement Cloudflare Pages

## Périmètre
- Europe uniquement
- Bilingue fr/en, routes /fr/ et /en/, hreflang obligatoire
- `x-default` pointe vers l'anglais, pour les visiteurs européens ni
  francophones ni anglophones
- Chaque page porte un lien vers la même page dans l'autre langue, libellé
  dans la langue cible (layout `src/layouts/Base.astro`)
- Libellés d'interface dans des fichiers JSON, jamais en dur dans le JSX :
  `src/i18n/fr.json` et `en.json`, lus par `useTranslations(locale)`
  (`src/i18n/index.js`). Un libellé manquant fait échouer le build

## Données
- Noms de tables et de colonnes en anglais, snake_case
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
  rejected), un `submitted_by` (uuid, FK vers auth.users) sur lequel
  s'appuie la RLS, et un `revised_at`
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
  production

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
- Le rouge sang uniquement en grand texte (≥ 24px, ou ≥ 19px en gras 700+),
  jamais en texte courant : 3,2:1 sur encre
- Le rouge braise pour tout élément cliquable en petit corps, uniquement sur
  fond encre : 3,3:1 sur crème
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
