# 0023 — Fiche par festival

Date : 2026-10-14
Statut : acceptée

## Contexte

L'issue #5 ajoute une page de détail. Le modèle sépare le festival, identité
stable, de ses éditions annuelles, qui portent dates et lieu (ADR 0013). Il
faut choisir ce qu'une page représente, son URL, et quelle édition elle
montre quand il n'y en a pas d'à venir.

## Options

- **Une page par édition** (`/festivals/{slug}/2027/`) — une page par
  événement, mais l'URL change chaque année et la page d'un festival entre
  deux éditions n'existe pas.
- **Une page par festival, qui présente une édition** — URL stable, la fiche
  survit à son édition.

## Décision

- Une page statique par festival publié, à URL stable :
  `/fr/festivals/{slug}/`, `/en/festivals/{slug}/`, sous la liste
  `/{locale}/festivals/`. Tous les festivals publiés ont une fiche, avec ou
  sans édition.
- Édition présentée : la prochaine édition à venir (vue `upcoming_editions`,
  ADR 0016), dans l'ordre de la liste (ADR 0019) ; à défaut, la dernière
  édition passée, titrée « Dernière édition », avec la mention « Prochaine
  édition non annoncée » ; à défaut, aucune.
- Sources listées : celles du festival et de l'édition présentée (y compris
  une édition passée présentée), une ligne par URL, avec la consultation la
  plus récente. Date de dernière révision : la plus récente entre le
  festival et l'édition présentée (ADR 0007).
- Données structurées (ADR 0012) : un bloc JSON-LD `MusicEvent` seulement
  pour une édition à venir qui a une date de début. Champs : `name` (nom et
  année), `url` de la fiche, `startDate`, `endDate` si elle existe,
  `eventAttendanceMode` (hors ligne), `location` (`Place`, nom du lieu s'il
  existe, `PostalAddress` avec les seuls champs connus). Ni `eventStatus`
  (statut non vérifié), ni `performer` ni `offers` (ni affiche ni
  billetterie dans le schéma).

## Conséquences

- Les fiches sont générées au build : un festival publié apparaît au rebuild
  quotidien suivant (ADR 0018).
- Lecture en quatre requêtes par langue, quel que soit le nombre de
  festivals ; « à venir » reste défini par la seule vue `upcoming_editions`,
  le front n'en lit que les identifiants.
- Une fiche sans édition à venir datée ne publie aucun `Event`.
- Hors périmètre : historique complet des éditions, carte du lieu, page 404
  personnalisée, image de partage.
