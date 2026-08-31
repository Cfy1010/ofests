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
- Libellés d'interface dans des fichiers JSON, jamais en dur dans le JSX

## Données
- Table `festivals` : identité stable (nom, slug, ville, country_code,
  coordonnées, site, genres, wikidata_id)
- Table `editions` : une ligne par année (dates, affiche, billetterie)
- Les deux portent un `status` : pending / published / rejected
  et un `submitted_by` (uuid, FK vers auth.users) — la RLS s'appuie dessus
- Amorçage depuis Wikidata (CC0), importé directement en published

## Contribution
- Compte obligatoire, demandé APRÈS remplissage du formulaire
- Auth par lien magique ; conserver le brouillon avant l'envoi du mail
- Formulaire en 3 étapes : essentiel / détails / confirmation
- Les fiches en attente restent visibles publiquement, marquées non vérifiées
- Sécurité par RLS Postgres, pas de contrôle applicatif

## Identité
- Titrage Anton, texte Inter, auto-hébergées (pas de CDN Google)
- Encre #0B0B0D, crème #EDE4D3, rouge sang #C1121F, rouge braise #E63946
- Le rouge sang ne descend jamais sous 18px et ne sert pas au texte courant
- Le rouge braise pour tout élément cliquable en petit corps
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
