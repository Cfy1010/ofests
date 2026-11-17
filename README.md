# O-Fests

Annuaire des festivals de metal en Europe. Bilingue, gratuit, alimenté par des
contributions modérées.

**Statut : en ligne, en construction.** Le site publie une liste des festivals à venir
et une fiche par festival, filtrées par pays, période et genre. Ce dépôt contient le site,
la base et les décisions produit. Vision : [`docs/vision.md`](docs/vision.md) ;
trajectoire : [`docs/roadmap.md`](docs/roadmap.md).

## Vision

Un festivalier metal choisit son prochain festival européen sur O-Fests, petits open airs
compris, parce que les fiches y sont vérifiées et donnent ce qui décide d'un déplacement.
La contribution des visiteurs est un moyen d'alimenter le catalogue, pas un pilier du
produit. Détail dans [`docs/vision.md`](docs/vision.md).

---

## Le problème

Trouver un festival de metal en Europe, c'est aujourd'hui recouper des pages Facebook,
des forums, des annuaires généralistes et le site de chaque festival. Deux manques
reviennent.

**Le genre est déduit, pas vérifié.** Un annuaire généraliste indexe des line-ups depuis
des bases musicales globales et rattache un festival à un genre dès qu'un artiste y est
tagué. Un festival de trance peut ainsi apparaître dans une liste heavy metal. Le public
visé repère l'erreur immédiatement, et une erreur visible entame la confiance dans le
reste de la liste.

**L'information qui décide d'un déplacement est dispersée et inégale.** Le prix réel du
pass et du camping, les douches, ce qu'on peut apporter, l'accessibilité, le statut de
l'organisateur. Ces informations existent parfois, mais rangées au mauvais endroit et
présentes de façon inégale d'un festival à l'autre, parce qu'elles se recueillent
au lieu de se calculer.

Corollaire : les petits open airs associatifs, absents des bases automatiques,
sont référencés de façon rare et dispersée : un annuaire national ici, une page
Facebook là, rarement dans les catalogues internationaux (aucun des 7 testés
sur FEST le 01/10/2026, voir [`docs/benchmark/`](docs/benchmark/)).

## Le parti pris

Le metal, et rien d'autre. Des fiches vérifiées, les festivals que les bases automatiques ne voient
pas, et les informations pratiques qui décident d'un déplacement.

Ce n'est pas la revendication d'un vide. Des annuaires généralistes couvrent le metal
parmi d'autres familles de genres, avec plus de volume et un meilleur référencement.
O-Fests fait le choix inverse : une couverture plus étroite, tenue de façon homogène
quelle que soit la taille du festival.

**Ce que le projet ne cherche pas à être :** exhaustif, mondial, ni un moteur de
recommandation algorithmique.

### Product Goal

Permettre à un festivalier metal de trouver un festival européen qui l'intéresse, y compris ceux qu'aucun annuaire automatique ne référence.

Critère d'atteinte (ADR [0032](docs/decisions/0032-critere-product-goal-elargi.md), qui révise
[0010](docs/decisions/0010-critere-product-goal.md)). Le site est en ligne ; un visiteur filtre le
catalogue par pays et par période et y trouve des festivals absents de FestT et FEST (test de
couverture élargi) ; chaque édition à venir affiche prix, camping et accessibilité, renseignés
ou marqués « non précisé », avec source et date.

## Pour qui

- Le festivalier metal qui prépare sa saison et compare des options concrètes
- Le contributeur qui connaît un festival absent des annuaires et veut l'y voir figurer :
  un moyen d'alimenter le catalogue, pas une cible à part égale

## Trois décisions qui définissent le produit

### Le périmètre est européen, pas mondial

Une couverture homogène sur un périmètre restreint est atteignable en solo. Une
couverture mondiale ne l'est pas, et reproduirait le défaut reproché aux généralistes :
des fiches soignées pour les gros festivals, des gabarits vides pour les autres.

### Un genre principal validé à la main gouverne les filtres

Les sous-genres restent des tags secondaires, non filtrants. Filtrer sur un tag
secondaire maximise le rappel au prix de la précision. Sur une scène où le public connaît
le sujet, la précision vaut plus que le volume : un seul résultat manifestement hors
sujet discrédite toute la liste.

### L'affiliation ne modifiera jamais l'affichage

Si des liens d'affiliation billetterie sont ajoutés un jour, ils ne modifieront ni
l'ordre des résultats, ni la présence d'une entrée au catalogue, ni le soin apporté à une
fiche. Un modèle assis sur le billet vendu pousse vers les gros événements à panier moyen
élevé, et rend invisibles les festivals qui vendent au guichet ou via une billetterie
associative. C'est précisément la population que ce projet veut couvrir.

Les autres décisions — nommage, temporalité, parcours de contribution, traçabilité des
fiches, reprise dans un dépôt neuf — sont dans le
**[journal de décisions](docs/decisions/)**, une par fichier, avec les options écartées.

## Stack

| Brique          | Choix                                  |
| --------------- | -------------------------------------- |
| Front           | Astro + React + Tailwind               |
| Données et auth | Supabase (Postgres, lien magique, RLS) |
| Cartographie    | MapLibre + OpenStreetMap               |
| Hébergement     | Cloudflare Workers (statique)          |
| Domaine         | ofests.com                             |

Pas de TypeScript. Docker sert uniquement à la base locale de développement,
jamais au déploiement (voir [0014](docs/decisions/0014-docker-developpement-local.md)). Contraintes et conventions techniques dans
[`AGENTS.md`](AGENTS.md). Démarrage et dépannage du poste local dans
[`docs/developpement-local.md`](docs/developpement-local.md).

## Modèle de données

Les tables principales sont :

- `festivals` — identité stable d'un festival, indépendante de l'année
- `editions` — données annuelles : dates, lieu, contributeur

D'autres tables les complètent : `sources` (sources d'une fiche) et `genres` (liste contrôlée).

## Structure du dépôt

```
docs/
  vision.md             vision, cibles, principes, non-objectifs
  roadmap.md            Product Goal en cours et horizons, sans dates
  definition-of-done.md critères qu'un item doit remplir pour être terminé
  decisions/            journal de décisions produit, daté
  benchmark/            veille concurrentielle
  superpowers/          spécifications issues des sessions de cadrage
```

Le backlog est tenu en issues GitHub. Les critères d'acceptation sont rédigés
au refinement, avant qu'une issue soit prise en charge.
