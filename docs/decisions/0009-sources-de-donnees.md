# 0009 — Sources de données du catalogue

- **Statut** : acceptée
- **Date** : 2026-09-03
- **Issue** : [#2](https://github.com/Cfy1010/ofests/issues/2)
- **Relevé de spike** : `releve.md`

## Contexte

O-Fests est un annuaire de festivals de metal en Europe. L'hypothèse de
départ était d'alimenter la majorité du catalogue via des API, la
contribution des visiteurs venant en complément.

Il fallait donc savoir quels champs les sources ouvertes fournissent
réellement, avec quelle fiabilité, sous quelle licence, et lesquels
resteront à saisir.

Cinq sources examinées : Wikidata, MusicBrainz, Songkick, Bandsintown,
Nominatim / OpenStreetMap. Sept festivals testés : Hellfest, Wacken Open
Air, Graspop Metal Meeting, Sylak Open Air, Motocultor, Riipfest, Liège
Metal Fest.

## Décision

### Sources retenues

**MusicBrainz** comme source principale d'enrichissement : éditions, dates,
lieux, line-up quand il existe. Données de base en CC0.

**Wikidata** comme source secondaire : site officiel, coordonnées, genre.
Le genre MusicBrainz est écarté (voir Licences).

**Nominatim** pour le géocodage inverse, sous réserve de l'arbitrage ODbL
ci-dessous.

**Songkick et Bandsintown sont écartés.** Songkick n'approuve pas les
projets étudiants, éducatifs ou de loisir et exige un accord de partenariat
payant. Bandsintown ne s'interroge que par artiste, ce qui est l'inverse du
besoin : reconstituer une programmation supposerait d'interroger tous les
groupes existants et de filtrer par lieu et date.

### Modèle de données

La séparation `festivals` / `editions` est acquise (voir [0004](0004-temporalite.md)).
Le spike tranche trois points restés ouverts.

**Le lieu appartient à l'édition, pas au festival.** Motocultor a déménagé de
Saint-Nolff à Kerboulard, Graspop a changé de site entre 1997 et 1998.
Rattacher le lieu au festival perdrait cette histoire et fausserait les
éditions passées. L'affichage cartographique utilise le lieu de l'édition à
venir, avec repli sur la dernière édition connue.

**On ne descend pas au niveau journée ni scène.** MusicBrainz le fait, avec
une profondeur qui varie d'un festival à l'autre et d'une année à l'autre
chez le même festival (Graspop 2024 contre 2025). Cette granularité sert une
base musicologique, pas un annuaire. Une table `slots` pourra être ajoutée
plus tard sans casser le modèle.

**`edition_artistes` en table de liaison distincte.** Cette donnée est absente
pour la majorité des festivals et arrive tardivement quand elle arrive. Elle
ne doit bloquer ni la création d'une fiche, ni l'affichage d'une édition.

### Identifiants

**L'identifiant faisant foi est un identifiant interne O-Fests.** QID et MBID
sont stockés comme identifiants externes optionnels et nullable, renseignés
manuellement à la création de la fiche.

Ils sont stables et permanents, ce qui les rend précieux pour recroiser les
sources dans le temps. Mais aucun n'est utilisable pour dédoublonner à
l'entrée : l'appariement par nom échoue sur les deux bases (4 festivals
trouvés sur 6 par libellé exact chez Wikidata ; recherche floue
inexploitable chez MusicBrainz, avec 11 992 résultats pour « Motocultor
Festival »), et les homonymies remontent en tête de classement dans les deux
cas.

Deux festivals testés sur sept n'ont ni QID ni MBID.

### Licences

| Source | Licence | Attribution | Partage à l'identique | Commercial |
|---|---|---|---|---|
| Wikidata | CC0 1.0 | non | non | oui |
| MusicBrainz — données de base | CC0 1.0 | non | non | oui |
| MusicBrainz — données supplémentaires | CC BY-NC-SA 3.0 | oui | oui | non |
| OpenStreetMap — données | ODbL 1.0 | oui | si base dérivée | oui |
| OpenStreetMap — tuiles | CC BY-SA 2.0 | oui | oui | tuiles osm.org non prévues pour le commercial |

**Le genre MusicBrainz est écarté.** Il dérive des tags utilisateurs, donc
classé en données supplémentaires : non commercial et partage à l'identique.
Le modèle mixte prévoit de toute façon un genre principal curé. MetaBrainz
propose une licence commerciale si le besoin apparaît.

**Attribution OSM obligatoire** : « © OpenStreetMap contributors » avec lien
vers openstreetmap.org/copyright.

**Tuiles** : les tuiles osm.org sont financées par dons et ne sont pas un
service pour tiers. Prévoir un fournisseur dédié pour MapLibre.

## Conséquences

### L'hypothèse de départ est inversée

Aucun champ n'est garanti, pas même la présence du festival dans la source.
Sur sept festivals testés, deux sont absents de MusicBrainz et un n'a qu'une
édition sur dix-sept ans.

La couverture ne suit ni la taille, ni la nationalité, ni l'ancienneté. Elle
suit la présence d'un contributeur bénévole : Wacken a quelqu'un qui saisit
les annonces à chaud, Graspop quelqu'un qui détaille scène par scène, Sylak
quelqu'un qui a tenu deux ans, Motocultor quelqu'un qui a arrêté en 2019.

**Contribution et curation d'abord, API en enrichissement.** Aucune
fonctionnalité ne peut supposer que la donnée sera là.

### Ce qui est fiable

Identifiants stables, référentiel géographique, métadonnées lentes (site
officiel, genre). La chaîne coordonnées MusicBrainz → Nominatim donne ville,
département et région, là où Wikidata renvoyait « France ».

### Ce qui est opportuniste

Dates des éditions et line-up. Présents parfois, riches quand ils le sont,
jamais garantis.

### L'import du line-up est un projet à part

Quatre modélisations coexistent dans MusicBrainz, sans règle, et un même
festival peut changer de convention d'une année à l'autre (Graspop 2024
contre 2025) :

1. relation `guest performer` sur l'édition chapeau — Sylak
2. relations `main performer` / `support act` sur l'édition — Wacken 2027, Graspop 2024
3. sous-événement par journée et par scène — Graspop 2025-2026
4. événement distinct par artiste, avec horaire — Hellfest 2022

Extraire un line-up demande de parcourir récursivement l'arbre `parts` et de
collecter les relations artiste à tous les niveaux. Ce n'est pas un mapping
de champs, c'est un parseur. Issue dédiée.

### Point bloquant à arbitrer : ODbL et Nominatim

Stocker les champs Nominatim dans la base O-Fests constitue une base
dérivée, donc réciprocité ODbL sur la partie géographique. Deux options :
stocker et assumer l'ouverture des données de lieu, ou appeler Nominatim à
la volée sans persister.

À trancher avant tout import. Ma lecture de la frontière œuvre produite /
base dérivée est celle d'un non-juriste ; c'est le point le plus discuté de
cette licence.

### Dédoublonnage à la saisie

Question ouverte, devenue importante puisque la contribution est ouverte aux
visiteurs : deux personnes créeront la même fiche. Nom normalisé plus
proximité géographique est une piste, pas une décision.

## Limites assumées

- **Sept festivals testés**, dont plusieurs parmi les plus gros d'Europe. La
  couverture des petits festivals n'est mesurée que très partiellement : deux
  testés, un présent avec line-up complet (Sylak), un absent (Riipfest).
- **Limite de débit et User-Agent** de MusicBrainz et Nominatim non vérifiés
  dans le détail, alors qu'une quinzaine d'appels ont été enchaînés.
- **Piste non explorée** : le JSON-LD `MusicEvent` sur les sites officiels
  des festivals. C'est la source la plus prometteuse pour les dates futures
  et les affiches, et elle n'a pas été regardée.
- **Setlist.fm** non testé : rétrospectif, donc sans usage pour les éditions
  à venir, mais pourrait fournir un historique de programmation.

## Note

Un line-up prospectif complet est saisissable et exploitable via l'API
MusicBrainz — Wacken 2027 y était un mois après l'annonce publique, avec une
cinquantaine de groupes. Les données de base étant en CC0, O-Fests pourra
contribuer en retour.
