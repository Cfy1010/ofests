# 0019 — Tri : une édition sans date se place à la fin de son année

Date : 2026-10-07
Statut : acceptée — révise les ADR 0013 et 0016

## Contexte

L'ADR 0016 place les éditions sans date en fin de liste. Avec plusieurs
années à l'affiche, une édition 2027 annoncée sans dates se retrouve après
toutes les éditions 2028 datées : le visiteur qui prépare 2027 ne la voit
pas là où il la cherche. Le refinement de #4 a retenu un autre ordre.

## Options

- **Sans date en fin de liste** (ADR 0016) — une seule règle, mais l'édition
  s'éloigne de l'année à laquelle elle appartient.
- **Sans date à la fin de son année** — l'édition reste à côté des éditions
  de la même année, au prix d'une règle un peu plus longue à énoncer.

## Décision

- Tri de la liste à venir : année, puis date de début croissante, puis nom
  du festival. Dans une même année, les éditions sans date viennent après
  les éditions datées.
- Règle affichable (ADR 0004), qui remplace celle de l'ADR 0016 : « Éditions
  en cours et à venir, de la plus proche à la plus lointaine. Sans dates
  annoncées : à la fin de leur année. »

## Conséquences

- Le reste de l'ADR 0016 est inchangé : définition d'« à venir », trigger
  `editions_require_dates`, vue `upcoming_editions` et `security_invoker`.
- L'ADR 0004 n'est pas révisé. La date de début d'une édition tombe toujours
  dans son année (contrainte `start_matches_year`) : pour les éditions
  datées, trier par année puis par date revient à trier par date. L'année ne
  sert qu'à situer une édition qui n'a pas encore de date, et aucun libellé
  d'année ne regroupe la liste.
- La phrase de tri de l'ADR 0013 (« les éditions sans date en dernier ») se
  lit désormais « en dernier dans leur année ».
- L'ordre interne de la vue `upcoming_editions` (sans date en fin de liste)
  n'est pas modifié et ne correspond plus à l'ordre affiché. C'est sans
  effet : le front retrie explicitement (ADR 0016). Le test pgTAP de la vue
  continue de vérifier son ordre interne.
- Le tri par nom demande le nom du festival, absent de la vue : il se fait
  côté front, après la jointure.
