# 0013 — Modèle de données : statut, lieu, dates et sources

Date : 2026-10-02
Statut : acceptée

## Contexte

Le refinement de #3 (schéma `festivals` / `editions`) laisse quatre
questions que les décisions précédentes ne tranchent pas : où porter le
statut de modération (0005), où porter le lieu (0011), comment traiter une
édition annoncée sans dates (0004), et à quelle granularité appliquer la
règle de sourçage (0007).

## Options et décisions

### Statut de modération

- **Sur le festival seulement** — une nouvelle édition d'un festival publié
  ne peut pas être modérée seule.
- **Sur l'édition seulement** — un festival proposé n'a pas d'état propre.
- **Sur les deux.**

Décision : sur les deux tables. Une proposition de festival (#8) crée un
festival et sa première édition en `pending`. Une nouvelle édition d'un
festival publié est modérée seule.

### Lieu

- **Sur le festival** — une seule adresse, fausse dès qu'il déménage.
- **Sur l'édition.**

Décision : sur l'édition. Le filtre par pays (#6) lit le pays de l'édition
à venir.

### Édition sans dates

- **Dates obligatoires** — perd les éditions annoncées avant leurs dates.
- **Dates facultatives.**

Décision : dates facultatives. Règle de tri, conforme à 0004 : « par date
de début croissante, les éditions sans date en dernier ».

### Granularité des sources

- **Par champ** — chaque information pointe vers sa source. Fidèle à la
  lettre de 0007, mais lourd en base, en saisie et en modération.
- **Par fiche** — une liste de sources attachée au festival ou à l'édition.

Décision : par fiche. Une fiche sans source ne peut pas passer en
`published`. La vérification que chaque information est couverte par l'une
des sources listées se fait à la modération (#9).

## Conséquences

- Les critères d'acceptation de #3 reposent sur ces quatre choix.
- 0007 reste valable : sa règle « une information non sourçable n'est pas
  publiée » s'applique par le modérateur, pas par la base.
- #9 devra inclure cette vérification dans ses critères.
- On ne sait pas quelle source justifie quel champ. Si une erreur est
  signalée, le modérateur remonte la liste des sources de la fiche.
