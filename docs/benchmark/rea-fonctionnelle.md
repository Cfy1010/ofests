# REA fonctionnelle de la concurrence

Rétro-ingénierie fonctionnelle : on déduit des produits concurrents ce qu'ils font pour
l'utilisateur et selon quelles règles. Pas de rétro-ingénierie technique (stack, code,
API).

> Spike du 2026-10-18, timebox une séance. Pages publiques uniquement, aucun compte
> créé, aucune application installée. Sources : festt.io (page metal été 2026, fiche
> Hellfest 2026, page Contribute), festapp.io (page genre metal, fiches Hellfest et
> Cernunnos Pagan Fest), festivalenfrance.com (fiche Bridge to Hell Metal Fest, formulaires
> `proposer-ajout`, `rapide` et `complet`), fiche
> App Store de Frontstage, dépôt O-Fests (`main` au commit `7508c10`, PR #42).
>
> Règle de provenance (voir `fest.md`) : on relève des **fonctionnalités**, jamais des
> données. Rien de ce qui est observé ici n'entre dans la base d'O-Fests.

## Objet

Décider, fonction par fonction, ce qu'O-Fests fait, fait autrement ou ne fait pas.
Les benchmarks existants (`festt.md`, `fest.md`, `annuaires-generalistes.md`) portent
sur le positionnement. Ce document porte sur les fonctionnalités, en deux niveaux :
la matrice fait l'inventaire des fonctions, la section « Mécanismes » démonte les
règles de celles qu'O-Fests va construire bientôt.

**Usage.** Avant d'affiner une US d'un domaine couvert, relire la ligne de la matrice
et, s'il existe, le mécanisme correspondant ; l'issue y renvoie en une ligne. À refaire
avant de revendiquer publiquement un différenciateur.

## Légende

| Symbole | Sens |
|---|---|
| ✓ | présent, constaté le 2026-10-18 |
| ~ | présent mais partiel ou inégal |
| ✗ | absent des pages lues |
| ? | non vérifié |

Colonne **Proposition** (à arbitrer par le PO) :

- **Socle** : son absence fait fuir l'utilisateur ou entame la confiance.
- **Différenciant** : tient un axe libre d'O-Fests.
- **Plus tard** : utile, mais pas avant un prérequis.
- **Écarté** : hors du parti pris, avec la raison.

« Annuaires » désigne festivalenfrance.com et ses sites frères (une fiche lue).
« Frontstage » repose sur la seule fiche App Store : le site bloque les robots et n'a pas
été lu.

## Matrice

### Trouver un festival

| Fonction | FestT | FEST | Annuaires | Frontstage | O-Fests | Proposition |
|---|---|---|---|---|---|---|
| Liste des festivals à venir | ✓ | ✓ | ✓ | ✓ | ✓ livré (#4) | Socle — fait |
| Festivals sans édition annoncée visibles | ? | ✓ toutes éditions listées | ~ statut « Terminé » | ? | ✓ livré (#40) | Socle — fait |
| Filtre par pays | ✓ pages par pays | ~ pages par pays | ~ un pays par site, pages par région | ✓ pages par pays | ✗ backlog (#6) | Socle — #6 |
| Filtre par période | ✓ pages par mois et saison | ? | ✓ « Ce weekend » | ✓ | ✗ backlog (#6) | Socle — #6 |
| Filtre par genre | ~ sans seuil, faux positifs (`festt.md`) | ~ tags déduits | ? généraliste | ✓ | ✗ backlog (#6), données prêtes | **Différenciant** — #6, genre curé |
| Recherche par nom | ✗ sur les pages lues | ✓ (`fest.md`) | ✗ sur les pages lues | ✓ | ✗ | Plus tard — quand le catalogue dépasse une page |
| Carte des festivals | ✓ lien « Map » (non ouvert) | ✗ | ✗ | ? (cartes de site seulement) | ✗ issue dédiée | Plus tard — après #6 |
| Pages de parcours (pays, genre, mois) | ✓ massives (SEO programmatique) | ✓ | ✓ | ✓ | ✗ | Plus tard — quelques pages pays et tendance après #6, pas de volume (`festt.md`) |
| Festivals proches ou similaires | ✓ | ✗ | ✓ | ? | ✗ | Plus tard — après la carte |
| Recommandation personnalisée | ✓ FestiScore, derrière connexion | ✗ | ✗ | ✓ selon les goûts | ✗ | **Écarté** — README : pas de moteur de recommandation |

### Fiche festival

| Fonction | FestT | FEST | Annuaires | Frontstage | O-Fests | Proposition |
|---|---|---|---|---|---|---|
| Dates et lieu de l'édition | ✓ | ✓ | ✓ | ✓ | ✓ livré (#5) | Socle — fait |
| Genre principal affiché | ✓ « Main genre » et style dominant | ~ tags | ✗ | ? | ✓ livré, curé | **Différenciant** — fait |
| Lien vers le site officiel | ✓ | ✓ via billetterie | ✓ | ? | ✓ livré | Socle — fait |
| Prix des billets | ✓ « from €120 » | ✗ | ✓ grille détaillée | ? | ✗ **aucun champ en base** | **Différenciant** — promesse du README, sans issue |
| Camping, accès, accessibilité | ✗ / ~ générique / ✗ | ✗ | ✗ / ✗ / ✗ (fiche lue) | ? | ✗ **aucun champ en base** | **Différenciant** — promesse du README, sans issue |
| Line-up | ✓ par jour, répartition par genre | ~ têtes d'affiche ; vide sur la fiche du petit festival | ✓ par jour | ~ (fiche App Store) | ✗ « projet à part » (ADR 0009) | Plus tard — à cadrer après les infos pratiques |
| Affiche de l'édition | ✓ affiche entière, fond flouté ; affiches proposées par les contributeurs (« Suggest a better poster », 40 XP) ; relevé du 2026-10-23 : affiche de l'édition Philadelphie (mai 2026) sur la fiche de l'édition Denver (décembre 2026) | ✗ | ✗ | ? | ✗ | **Différenciant** si sourcée — plus tard : US « affiche sur la fiche, ajoutée par le modérateur », créée au premier accord reçu d'un organisateur. Accord et conditions (crédit, version) demandés pendant le sourcing (#45). Droits : reproduction soumise au consentement de l'auteur (CPI, art. L122-4), accord écrit conservé. Ajout du 2026-10-23, constat du PO hors relevé initial. |
| Horaires de passage | ✗ | ✓ (`fest.md`) | ✗ | ✓ alertes de set | ✗ | **Écarté** — domaine de l'appli de festival |
| Historique des éditions | ✓ liens par année | ✓ toutes éditions | ✓ édition N et N+1 | ? | ~ une édition présentée (ADR 0023) | Plus tard — faible valeur avant d'avoir des données |
| Sources citées | ✓ | ✗ | ~ auteur et relecteur nommés | ? | ✓ livré, par URL et date de consultation | **Différenciant** fragile — FestT le fait aussi |
| Date de révision | ✓ (deux dates incohérentes relevées) | ✗ | ✓ « Mis à jour le » | ? | ✓ livré | Socle — fait |
| Signaler une erreur, proposer une correction | ✓ formulaire à motifs | ✗ | ✓ relue avant publication | ? | ✗ | **Socle** — sans issue, voir ci-dessous |
| Données structurées `MusicEvent` | ? non lisible par la méthode | ? | ? | ? | ✓ livré (ADR 0012, 0023) | Socle — fait |
| Aperçu au partage (Open Graph) | ✓ | ✓ | ✓ | ? | ✗ aucune balise `og:` | **Socle** — sans issue |
| Ajouter à mon agenda (.ics) | ✗ | ✗ | ✗ | ? | ✗ | **Différenciant** — absent des trois sites lus, sans compte |
| Météo, hébergement, activités | ✓ avec affiliation | ✗ | ✗ | ~ cartes hors ligne | ✗ | **Écarté** — dérivable et générique (`festt.md`) ; affiliation encadrée par le README |
| Playlist | ✓ | ✗ | ✗ | ✗ | ✗ | **Écarté** — hors du besoin « choisir un festival » |

### Contribuer et suivre

| Fonction | FestT | FEST | Annuaires | Frontstage | O-Fests | Proposition |
|---|---|---|---|---|---|---|
| Proposer un festival manquant | ✓ « Suggest a festival » | ~ via organisateurs et FEST Crew | ✓ deux parcours, rapide avec source obligatoire | ? | ✗ backlog (#8, #39) | Socle — #8 ; la source obligatoire n'est pas propre à O-Fests |
| Modération avant publication | ? | ✓ (`fest.md`) | ✓ | ? | ✗ backlog (#9) | Socle — #9 |
| Compte utilisateur | ✓ « Create my profile » | ✓ appli | ✗ annoncé sans compte | ✓ | ✗ backlog (#39, code par e-mail) | Socle pour contribuer seulement |
| Récompense des contributeurs (XP, points) | ✓ XP | ✓ FEST Points | ✗ | ? | ✗ | **Écarté** — un crédit nominatif suffit au départ ; à revoir si la contribution ne prend pas |
| Espace ou revendication organisateur | ~ « For organisers », contact | ✓ « Je travaille pour ce festival » | ~ contact du festival | ~ page promoteurs (non lue) | ✗ | Plus tard — un lien « Vous organisez ce festival ? » vers le formulaire de #8, l'organisateur étant une source primaire |
| Suivre un festival, favoris | ✓ « Follow », avec compte | ✗ web | ✓ « Mes favoris » | ~ programme personnel | ✗ | **Écarté** pour l'instant — l'export .ics couvre le besoin sans compte |
| Alertes | ? | ✓ appli | ✗ | ✓ | ✗ | **Écarté** — demande compte, e-mails, consentement |
| Avis et notes des festivaliers | ✗ | ✓ par critères | ✓ étoiles et texte | ? | ✗ | **Écarté** — modération lourde en solo ; à reconsidérer comme « info vécue » plus tard |
| Photos des festivaliers | ✗ | ✗ | ✓ | ? | ✗ | **Écarté** — droits à l'image, modération |
| API publique | ~ lien « API » vers le contact | ✗ (`fest.md`) | ? | ? | ✗ | Plus tard — lié à la décision de licence, ouverte |
| Application mobile | ✗ | ✓ | ✗ | ✓ | ✗ | **Écarté** (`fest.md`) |

### Transverse

| Fonction | FestT | FEST | Annuaires | Frontstage | O-Fests | Proposition |
|---|---|---|---|---|---|---|
| Bilingue ou plus | ✓ FR/EN | ✓ FR/EN | ✓ FR/EN/ES | ✗ EN (appli) | ✓ livré FR/EN, hreflang | Socle — fait |
| Thème clair et sombre | ✓ | ? | ? | ? | ✓ livré (ADR 0021) | Fait |
| Périmètre déclaré | ✗ incohérent (`festt.md`) | ✗ | ~ un pays | ~ « worldwide », sans chiffre | ~ Europe et metal, nombre non affiché | Plus tard — afficher ce que compte le catalogue, à peu de frais |
| Plateformes | Web | Web + application (plateformes non relevées) | Web | Application iOS seule : absente du Play Store, site non lu (robots) — constat du PO, 2026-10-23 | Web responsive, tous téléphones | **Différenciant** discret — un site web touche iPhone et Android sans double développement |

## Mécanismes

Trois fonctions qu'O-Fests construit bientôt, démontées sur les pages publiques. Ce qui
demande une connexion pour s'afficher n'a pas été vu.

### M1 — Proposer un festival (pour #8 et #39)

**Annuaires : deux parcours sur une même page d'entrée** (`/proposer-ajout`).

| | Rapide — « Signaler un festival manquant » | Complet — « Ajouter un festival » |
|---|---|---|
| Promesse | l'équipe fait la recherche et la rédaction | le contributeur remplit la fiche |
| Champs obligatoires | nom, ville, au moins une URL source, e-mail | nom, ville, e-mail |
| Autres champs | code postal, informations complémentaires, nom du contributeur | une vingtaine : lieu, descriptions, organisateur, site et réseaux, édition (année, dates), gratuité, billetterie, détail des tarifs |
| Source | **obligatoire**, plusieurs URL possibles, justifiée par la vérification | aucun champ source |
| Compte | aucun ; e-mail pour recontacter | aucun |
| Modération | vérification annoncée | relecture avant publication annoncée |
| Droits sur le contenu | aucun texte | aucun texte |
| Anti-spam | un champ « Website » isolé en tête, probablement un piège à robots (non confirmé) | idem |

**FestT.** La contribution passe par la navigation « Contribute » et des XP. Le
formulaire n'a pas pu être lu : les liens « Suggest a festival » n'ont pas d'adresse
lisible dans la page.

**Ce que ça dit pour #39.**

- Le parcours rapide des annuaires est la même idée que ta première US : peu de champs,
  une source obligatoire, la rédaction faite par le modérateur. Ton choix est conforté.
- La différence est le compte. Les annuaires se contentent d'un e-mail ; O-Fests exige
  un compte (ADR 0005), avec un code par e-mail (#39). Pour le contributeur, l'écart
  réel est faible : dans les deux cas il donne un e-mail et le prouve, ou non. Le compte
  apporte `submitted_by`, la visibilité de ses fiches en attente (ADR 0015) et un
  crédit possible. **Point à arbitrer** : garder le compte, ou passer à un e-mail
  vérifié sans compte. Je ne recommande pas de changer sans données d'usage.
- Aucun des deux concurrents lus ne dit ce que deviennent les droits sur une
  contribution. FEST les fait céder (`fest.md`). O-Fests devra afficher sa règle sur le
  formulaire ; elle dépend de la décision de licence, encore ouverte.
- Le parcours complet ne demande aucune source. Il illustre le risque qu'O-Fests veut
  éviter : une fiche riche mais invérifiable.

### M2 — Signaler une erreur (US à créer)

| | FestT | Annuaires |
|---|---|---|
| Point d'entrée | « Report an error » sur la fiche, lien vers la page contact | « Proposer une correction », texte sans lien lisible |
| Motifs proposés | artiste manquant ; artiste qui ne devrait pas y être ; mauvais site officiel ; dates, lieu ou annulation ; autre chose | non lus |
| Vérification | « every verified fix earns you XP », donc une vérification existe | relecture annoncée avant publication |
| Compte | non indiqué | non indiqué |

**Ce que ça dit pour l'US.** Les motifs de FestT suivent leurs données. Ceux d'O-Fests
doivent suivre les siennes, dont le genre curé, qui est la promesse la plus exposée :

- dates, lieu ou annulation ;
- mauvais site officiel ;
- **genre principal contestable** ;
- **ce festival n'est pas un festival metal** ;
- autre chose.

Et, comme pour la proposition, une URL source facultative pour étayer le signalement.
Version minimale envisageable : un lien par fiche vers un formulaire simple, traité à
la main par le modérateur, sans compte.

### M3 — Structure des infos pratiques (pour l'ADR du modèle de données)

| | FestT | Annuaires (fiche) | Annuaires (formulaire complet) |
|---|---|---|---|
| Prix | une valeur « from €120 » | paliers : pass 1 jour, pass 2 jours, plein et réduit ; gratuité moins de 12 ans | texte libre « Détail des tarifs » |
| Gratuité | non vue | dans les paliers | liste à trois états : « Non précisé », « Entrée gratuite », « Entrée payante » |
| Date ou source du prix | aucune propre au prix | aucune propre au prix | aucun champ |
| Camping | aucun champ vu | aucun | aucun champ |
| Accessibilité | aucun champ vu | aucun | aucun champ |

**Ce que ça dit pour l'ADR.**

- **L'état « non précisé » est le mécanisme à reprendre.** Il distingue « on ne sait
  pas » de « non » ou de « gratuit ». C'est la même logique que tes dates facultatives
  et ta mention « prochaine édition non annoncée ».
- **Personne ne date ni ne source un prix.** Un prix change d'une édition à l'autre ;
  le porter par l'édition, avec sa source (ADR 0007, 0013), serait un vrai écart de
  qualité, à coût faible puisque la table `sources` existe.
- **Personne ne structure le camping ni l'accessibilité.** C'est l'axe libre le plus net
  de cette REA. Un champ à trois états par information (oui, non, non précisé) suffit à
  filtrer plus tard, sans prétendre à l'exhaustivité.
- **Le texte libre seul, comme chez les annuaires, ne se filtre pas et ne se traduit
  pas.** À éviter comme forme principale sur un site bilingue ; il peut rester en
  complément.

Le JSON-LD des concurrents n'a pas pu être lu : la méthode de lecture ne restitue pas
les scripts de la page. Constat non fait, pas absence.

## Décisions du 2026-10-18

Arbitrage des propositions de la matrice et des mécanismes. La colonne « Proposition »
est conservée telle quelle pour l'historique ; ce qui suit fait foi.

| | Décision | Raison |
|---|---|---|
| A | **Infos pratiques de l'édition** : prix d'appel daté et sourcé, gratuité, camping, accessibilité, chacun avec un état « non précisé ». Une US, avec son ADR dans la même PR. | Promesse du README, axe libre le plus net (M3). Le minimum structuré suffit ; ni filtre ni texte libre dans cette US. |
| B | **Signaler une erreur**, version minimale : lien par fiche vers un e-mail prérempli, motifs de M2, sans formulaire ni stockage. | Volume nul au lancement : un formulaire serait du stockage et de l'anti-spam pour rien. On passe au formulaire quand le traitement à la main devient pénible. |
| C | **Open Graph** sur toutes les pages, avec une image par défaut dérivée du logo. | Socle chez les trois concurrents ; c'est par le partage que circule la scène. |
| D | **Export .ics** par édition à venir datée. Gardé, priorité basse. | Différenciant et peu coûteux, mais aucun signal d'usage. Il ne doit rien retarder. |
| E | **Contribution** : le compte de #39 est maintenu (ADR 0005). | Avec un code par e-mail, la friction est proche d'un e-mail vérifié ; le compte apporte `submitted_by` et la visibilité des fiches en attente. À revoir avec des données d'usage. |
| F | **Écartés** : avis, photos, XP, favoris et alertes, recommandation, météo et hébergement, playlist, horaires de passage, application mobile. | Raisons dans la matrice. Pas d'issue : cette ligne en tient lieu. |
| G | **Plus tard, sans issue** : recherche par nom, pages par pays et tendance, lien organisateur, API, historique des éditions, line-up. | Une issue ouverte sans échéance est du bruit dans le backlog ; on la crée quand le prérequis est là. La carte garde son issue existante. |
| H | **Ordre révisé** : #6, sourcing lot 2 en parallèle, C, B, A, puis #38 et #39, puis D. | Le critère du Product Goal exige de filtrer par pays et période (#6) ; la contribution n'y figure pas. Le lot 2 rend le catalogue crédible. C et B sont petites et protègent la qualité avant toute diffusion. Si #39 est déjà commencée, on la termine d'abord. |

Ordre à reporter dans le tableau du projet, pas dans le texte des issues.

## Écarts relevés, par ordre de valeur proposé avant arbitrage

1. **Infos pratiques : prix, camping, accessibilité.** C'est la promesse du README
   (« les informations pratiques qui décident d'un déplacement »), et le schéma n'a
   aucun champ pour elles. FestT a le prix, les annuaires ont le prix, aucune des fiches lues
   n'a l'accessibilité. Changement de modèle de données : US plus ADR, à partir de M3.
2. **Signaler une erreur.** Une fiche « vérifiée » sans canal de correction ne peut pas
   tenir sa promesse dans la durée. FestT et les annuaires l'ont. N'entre pas en
   conflit avec l'ADR 0015 : signaler n'est pas modifier, le modérateur corrige.
   Version minimale : un lien par fiche vers un formulaire ou une adresse ; motifs en M2.
3. **Balises Open Graph.** Socle bon marché, présent chez FestT, FEST et les annuaires ;
   un lien partagé sur un forum ou un groupe doit afficher le nom et les dates du
   festival. C'est par là que circule la scène.
4. **Export .ics par édition.** Absent des trois sites lus (Frontstage non vérifié), compatible avec
   les pages statiques, sans compte. Couvre le besoin « suivre » sans en payer le coût.

Les quatre sont indépendants de #8. Les deux derniers tiennent chacun dans une petite US.

## Ce que la matrice change dans les benchmarks

**FestT n'a plus une base fermée.** Navigation « Contribute », « Suggest a festival »,
connexion et profil, XP, « Report an error », « For organisers », lien « API ». La
ligne « Contribution communautaire : base fermée chez eux, structurellement hors de leur
modèle » de `festt.md` est périmée, et trois cases de « À revérifier » s'y règlent.

**Les annuaires acceptent les propositions.** « Ajouter un festival » et « Proposer une
correction », relue avant publication. Répond à une question ouverte de
`annuaires-generalistes.md`.

**Conséquence pour le positionnement.** Les trois concurrents principaux acceptent
désormais des contributions. La contribution n'est plus un axe différenciant en soi,
seulement un moyen. La source obligatoire non plus : le parcours rapide des annuaires
l'exige déjà (M1). Restent libres, d'après cette REA :

| Axe | Ce qui le tient aujourd'hui |
|---|---|
| Genre curé qui gouverne les filtres | Données livrées, filtre à livrer (#6). Les autres filtrent par déduction. |
| Infos pratiques structurées, datées et sourcées, à l'échelle européenne | Les annuaires ont des tarifs en texte, pays par pays ; FestT n'a qu'un « à partir de ». Personne ne date ni ne source un prix, personne ne structure camping et accessibilité (M3). **Pas encore construit chez O-Fests.** |
| Couverture homogène des petits festivals | La fiche FEST du petit festival lu est vide (ni line-up, ni billetterie, ni infos pratiques). |

## Limites

- Échantillon de fiches : une FestT, deux FEST, une annuaire. Les constats de profondeur
  peuvent ne pas se généraliser.
- Frontstage qualifié par sa seule fiche App Store : pages web non lues (robots).
- Aucune fonction réservée aux comptes n'a été vue ; les applications mobiles n'ont pas
  été testées.
- La carte de FestT n'a pas pu être ouverte, ni ses formulaires de contribution.
- Formulaires des annuaires lus par extraction de texte : types de champs en partie
  déduits des libellés.
- JSON-LD des concurrents non lisible par la méthode employée.
- Constats valables au 2026-10-18.

## Repérés, hors timebox

Viberate (pages festival), Festiveo (application iOS), article « best festival apps
2026 » de festivalmates.com. Non qualifiés.

## Suites proposées

- [x] Arbitrer les propositions de la matrice (voir « Décisions du 2026-10-18 »)
- [ ] Créer les issues A, B, C, D et « Sourcing lot 2 », avec un renvoi à cette REA
- [x] Trancher le point M1 : compte maintenu (décision E)
- [ ] Rédiger l'ADR des infos pratiques à partir de M3 (dans la PR de A)
- [ ] Mettre à jour `festt.md` (contribution, organisateurs, API) et
      `annuaires-generalistes.md` (ajout et correction de fiches)
- [ ] Si l'axe « contribution » sort du positionnement : ajuster la section « Axes
      réellement libres » des benchmarks
