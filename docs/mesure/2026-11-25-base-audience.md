# Base d'audience — relevé du 2026-11-25

Premier relevé (#80), selon la méthode de la vision (« Comment on saura que
ça marche ») et des ADR 0028 et 0031. Le relevé suivant reprend exactement
les mêmes sources, filtres et durée de fenêtre.

## Fenêtre

Du 2026-11-18 00:00 au 2026-11-24 23:59 (UTC+1), soit 7 jours. Relevé figé
le 2026-11-25 (exports conservés hors du dépôt).

## Résultats

| Mesure | Source | Valeur |
| --- | --- | --- |
| Visites, borne basse | Cloudflare Web Analytics | 16 visites, 31 pages vues |
| Visites, borne haute | Analytique du domaine | 403 visites |
| Découverte | Search Console | 112 impressions, 1 clic, CTR 0,9 %, position moyenne ≈ 21,9 |
| Arrivées sur une fiche festival | Cloudflare Web Analytics | 7 visites sur 16 |
| Requêtes d'infos pratiques | Search Console | 0 impression (aucune requête visible) |

Requêtes Search Console : presque toutes portent sur le nom d'un festival
(Resurrection Fest, Rock The Lakes, Motocultor, Graspop, Mystic Festival),
avec ou sans année. Une seule requête générique (« festival metal
belgique », 1 impression). 83 des 112 impressions sont rattachées à une
requête visible ; le reste correspond à des requêtes masquées par Google.

## Méthode

**Borne basse — Cloudflare Web Analytics** (RUM, script de tête, ADR 0028)

- Vues « Visits » et « Page views ».
- Filtres : site `ofests.com`, « Exclude bots » = Yes.

**Arrivées sur une fiche festival — Cloudflare Web Analytics** (ajouté le
2026-11-25, même fenêtre)

- Vue « Visits », filtres de la borne basse plus « Path contains
  `/festivals/` ».
- Total des visites de l'onglet « All » (pas celui de l'onglet « Path », qui
  ne somme que les 5 premières pages), moins les visites arrivées sur les
  listes `/fr/festivals/` et `/en/festivals/`.
- Une visite compte la page d'arrivée : c'est une page vue dont le référent
  n'est pas `ofests.com`.

**Borne haute — analytique du domaine** (logs Cloudflare, côté serveur)

- Domaine ofests.com, Analytics, onglet Requests, métrique « Total visits ».
- Filtre : Browser is not in Curl, BingBot, ChromeHeadless, GoogleBot,
  AppleBot, BaiduBot, DuckDuckGoBot, FacebookBot, LinkedInBot, MsnBot,
  PingdomBot, TwitterBot, YandexBot, YahooBot, PhantomJS, Bot.
- Règle (décision du PO, 2026-11-25) : liste fixe, soit tous les robots et
  navigateurs sans interface du catalogue « Browser » de Cloudflare à cette
  date. Elle est reprise telle quelle aux relevés suivants, quels que soient
  les robots de la fenêtre. « Unknown/Others » et les navigateurs intégrés
  aux applis (Facebook, Instagram, etc.) sont conservés.
- L'onglet « Visitors » et la page « Overview » du domaine ne servent pas :
  ils reposent sur les mêmes logs, robots compris.

**Découverte — Google Search Console** (ADR 0031)

- Propriété de domaine `ofests.com`, sitemap `sitemap-index.xml` soumis le
  2026-11-17 (état « Opération effectuée »).
- Performances, Résultats de recherche, type « Web », du 2026-11-18 au
  2026-11-24, export Excel.
- Position moyenne : non fournie en total par l'export ; calculée comme la
  moyenne des positions quotidiennes pondérée par les impressions.

**Requêtes d'infos pratiques — Google Search Console** (ajouté le 2026-11-25 pour
l'hypothèse de #46, même export, même fenêtre)

- Onglet « Requêtes » de l'export : somme des impressions des requêtes contenant
  (sans tenir compte de la casse) camping, prix, price, ticket ou billet ; une requête
  comptée une seule fois. Liste fixe, reprise telle quelle aux relevés suivants.
- Ne couvre que les requêtes visibles (83 impressions sur 112 dans cette fenêtre).

**Opposition du PO** : bouton « Ne pas mesurer mes visites » activé dès le
début sur chaque appareil et navigateur du PO ; il empêche le chargement du
script (vérifié dans `src/layouts/Base.astro`).

## Limites

- **Borne basse sous-estimée** : visiteurs ayant fait opposition, bloqueurs
  de traqueurs, navigation privée du PO (l'opposition ne s'y applique pas).
- **Borne haute surestimée** : « Unknown/Others » contient des robots non
  nommés que l'offre gratuite ne permet pas d'exclure. L'écart entre les
  deux bornes est large ; la borne haute sert de plafond, pas d'estimation.
- **Agrégation** : au-delà de 7 jours, les valeurs Cloudflare sont agrégées
  et inexploitables à ce volume (ADR 0031) ; d'où la fenêtre de 7 jours.
- **Search Console** : données en heure du Pacifique (fenêtre décalée de
  quelques heures par rapport aux sources Cloudflare) ; dernier jour encore
  provisoire le jour de l'export (le total affiché a changé entre deux
  consultations le 2026-11-25) ; requêtes rares masquées par Google.
- **Volume très faible** : à ce niveau, quelques visites suffisent à faire
  varier fortement les chiffres d'un relevé à l'autre.
