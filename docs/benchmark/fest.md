# Benchmark — FEST (festapp.io)

Relevé les 2026-09-30 et 2026-10-01. Sources : navigation directe sur festapp.io (home, page genre metal, pages organisateurs et tarifs), conditions d'utilisation du site (PDF, version en ligne au 01/10/2026), article de Billboard Canada, test de recherche manuel sur 7 festivals.

Cette fiche suit la structure de `festt.md`. Elle ne repose pas sur la lecture de fiches festival détaillées : les constats sur la profondeur des fiches restent à faire.

## Identité

| | |
|---|---|
| Éditeur déclaré | Les Technologies FEST inc., 13 T rue Roche Bonnet, 63400 Chamalières (France) |
| Droit applicable | droit français, tribunaux de Clermont-Ferrand |
| Contact | help@festapp.io |
| Copyright affiché | 2022-2026, all rights reserved |
| Supports | site web, applications iOS et Android |
| Périmètre affiché | « festivals worldwide » |
| Périmètre réel | monde, tous genres ; 1er pays = France (262 festivals), puis États-Unis (234), Canada (110) |
| Modèle éco | freemium pour organisateurs (FEST Backstage) : plan Gratuit, Pro et Premium ; Pro affiché à 250 $/mois ou 3 000 $/an (page EN), 2 200 € par an sur la page FR pour un plan payant ; catalogue public en vitrine |
| Langues | site en anglais ; compte Instagram `festapp_fr` |
| Communauté | serveur Discord, newsletter |
| API publique | aucune trouvée au 01/10/2026 (llms.txt, pied de page, recherche web) ; seul un plugin web d'affichage pour organisateurs est proposé |

Non vérifiés : immatriculation de l'éditeur, hébergement, chiffre d'affaires, effectif. Le suffixe « inc. » associé à une adresse française n'est pas interprété ici.

## Proposition de valeur

Deux produits sous une marque :

- **Pour les organisateurs** : monter une application mobile de festival (affiche, horaires, carte, billetterie, notifications) depuis un CMS, FEST Backstage. Plus de 70 festivals clients affichés, surtout généralistes (Rototom, Mutek, NXNE…).
- **Modèle freemium** : le plan Gratuit inclut l'application, la liste d'artistes, les horaires et des notifications limitées, avec un seul compte organisateur. Les plans payants ajoutent plan interactif, statistiques, notifications programmées, bannières et comptes supplémentaires. Le plan gratuit n'est pas réservé aux indépendants ; le blog de FEST le présente comme adapté aux petits festivals.
- **Pour les festivaliers** : catalogue mondial avec dates, affiches, horaires de passage et billetterie, suivi de ses artistes favoris. Intégrations Spotify et Apple Music citées dans les conditions d'utilisation.

## Volumétrie

| Source | Valeur |
|---|---|
| Home, badge genre metal, 30/09 | 241 festivals |
| Home, badge genre metal, 01/10 | 243 festivals |
| Home, badge rock | 667 festivals |

Les chiffres bougent d'un jour à l'autre, ce qui indique une base vivante. Comme chez FestT, aucune page n'indique si l'on compte des festivals ou des éditions, passés ou à venir.

## Taxonomie et filtres

La liste Metal contient Cabaret Vert, Fusion Festival et Kunstrasen Bonn, qui ne sont pas des festivals metal. Même symptôme que FestT : le genre du festival semble déduit des artistes, sans curation. Mécanisme exact non vérifié.

## Contribution

C'est la différence majeure avec FestT, qui a une base fermée. FEST a un **modèle contributif formalisé** :

- La **FEST Crew** : bénévoles qui saisissent line-ups et horaires via un tableau de bord dédié.
- Chaque contribution validée rapporte des **FEST Points**, donnant accès à des réductions et avantages partenaires. Une validation existe donc côté FEST.
- Les contributeurs **cèdent à FEST, de façon irrévocable et gratuite, tous leurs droits** sur ce qu'ils soumettent.
- Le contenu posté par les organisateurs leur appartient. FEST déclare **ne pas vérifier** les informations des organisateurs.

## Couverture

Sur l'échantillon du spike (ADR 0009), 8 festivals sur 11 figurent dans la liste Metal.

Test du 01/10/2026, recherche par nom dans la barre de recherche :

| Festival | Pays | Origine du candidat | Sur FEST |
|---|---|---|---|
| Metal Hunting Open Air | FR | festivalenfrance.com | non |
| Bambi Metal Fest | FR | festivalenfrance.com | non |
| Mauges Pit Fest | FR | festivalenfrance.com | non |
| Wellesweiler Open Air | DE | festivalsindeutschland.de | non |
| Riipfest | FI | échantillon du spike | non |
| Liège Metal Fest | BE | échantillon du spike | non |
| Rock The Lakes | CH | échantillon du spike | non |

**0 sur 7.** FEST référence pourtant quelques petits festivals metal (Lions Metal Festival, BetiZFest, Open Air Gränichen). Le constat est « couverture rare et inégale », pas « absence totale ».

Limites : échantillon de 7, choisi et non aléatoire ; quatre candidats déjà présents sur des annuaires généralistes ; un seul passage, sans recherche par variantes de graphie.

## Ce qu'ils font bien

- Double modèle : l'outil organisateur fait entrer des données de première main, publiées par l'organisateur lui-même. Le plan gratuit abaisse la barrière d'entrée, et chaque festival inscrit alimente le catalogue public.
- Contribution structurée et récompensée, avec validation.
- Horaires de passage, que ni FestT ni les sources ouvertes du spike ne fournissent de façon fiable.
- Présence mobile native et communauté (Discord).

## Sources qu'ils utilisent

Organisateurs et FEST Crew, d'après les conditions d'utilisation. Usage de sources externes (MusicBrainz, Wikidata, etc.) non vérifié.

## Implications pour O-Fests

**À abandonner.** L'axe « contribution communautaire » comme différenciateur pur : FEST l'a déjà, outillé et récompensé.

**À ne pas tenter.** L'application mobile et l'outillage organisateur.

**Axes réellement libres.**

| Axe | Pourquoi il tient |
|---|---|
| Précision du périmètre | Leur liste Metal contient des festivals non metal ; un genre curé reste vérifiable en dix secondes. |
| Couverture des petits festivals metal | 0 sur 7 au test ; leur modèle dépend de l'arrivée des organisateurs ou du passage d'un contributeur. |
| Statut des données contribuées | Chez FEST, le contributeur cède ses droits à une entreprise. Une base ouverte, ou au minimum créditée, est une différence concrète. **À arbitrer : aucune décision de licence n'existe encore pour O-Fests.** |
| Info vécue | Non comparée : fiches détaillées non lues. |

**Menace à ne pas sous-estimer.** Le plan gratuit pour organisateurs et la FEST Crew peuvent atteindre le terrain d'O-Fests. Contrairement à FestT, aucun biais structurel ne les éloigne des petits festivals. Le revenu vient toutefois des plans payants : rien ne garantit que les petits open airs associatifs, qui n'ont pas besoin d'une application, viennent s'inscrire. L'écart constaté aujourd'hui peut se réduire, ou durer.

**Point à garder en tête.** Les conditions d'utilisation interdisent d'accéder au service pour construire un produit similaire ou concurrent, ainsi que le scraping. Le chevauchement des faits est inévitable (nom, dates, lieu, affiche d'un même festival) et n'est pas en cause : un fait n'appartient à personne. Ce qui compte, c'est la **provenance**. Une donnée d'O-Fests doit venir d'une source autorisée (site officiel, organisateur, MusicBrainz, Wikidata, contributeur), jamais être recopiée depuis FEST, à la main ou par script. La traçabilité des fiches (ADR 0007) sert de preuve. Lecture non juridique.

## À revérifier

- Profondeur d'une fiche festival : infos pratiques, camping, prix ?
- Mécanisme d'attribution du genre d'un festival ?
- Évolution du badge Metal (241, 243…) ?
- Présence future des 7 festivals du test ?
