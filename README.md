# O-Fests

Annuaire des festivals de metal en Europe. Bilingue, gratuit, alimenté par des
contributions modérées.

**Statut : en construction.** Le site n'est pas encore en ligne. Ce dépôt contient le
squelette technique et les décisions produit.

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
présentes surtout sur les gros festivals, parce qu'elles se recueillent au lieu de se
calculer.

Corollaire : les petits open airs associatifs, absents des bases automatiques, ne sont
référencés nulle part.

## Le parti pris

Le metal, et rien d'autre. Des fiches vérifiées, les festivals que les bases automatiques ne voient
pas, et les informations pratiques qui décident d'un déplacement.

Ce n'est pas la revendication d'un vide. Des annuaires généralistes couvrent le metal
parmi d'autres familles de genres, avec plus de volume et un meilleur référencement.
O-Fests fait le choix inverse : une couverture plus étroite, tenue de façon homogène
quelle que soit la taille du festival.

**Ce que le projet ne cherche pas à être :** exhaustif, mondial, ni un moteur de
recommandation algorithmique.

## Pour qui

- Le festivalier metal qui prépare sa saison et compare des options concrètes
- Le contributeur qui connaît un festival absent des annuaires et veut l'y voir figurer

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

| Brique | Choix |
|---|---|
| Front | Astro + React + Tailwind |
| Données et auth | Supabase (Postgres, lien magique, RLS) |
| Cartographie | MapLibre + OpenStreetMap |
| Hébergement | Cloudflare Pages |
| Domaine | ofests.com |

Pas de TypeScript, pas de Docker. Contraintes et conventions techniques dans
[`AGENTS.md`](AGENTS.md).

## Modèle de données

Deux tables principales :

- `festivals` — identité stable d'un festival, indépendante de l'année
- `editions` — données annuelles : dates, lieu, line-up, tarifs, contributeur

## Structure du dépôt

```
docs/
  decisions/     journal de décisions produit, daté
  benchmark/     veille concurrentielle
  superpowers/   spécifications issues des sessions de cadrage
```

Le backlog sera tenu en issues GitHub, avec critères d'acceptation.
