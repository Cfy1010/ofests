# 0016 — Éditions à venir et éditions sans date

Date : 2026-10-03
Statut : acceptée

## Contexte

L'ADR 0004 impose de séparer les éditions à venir des éditions passées, sans
fixer la frontière. Le schéma autorise une édition sans date (ADR 0013). Une
règle naïve afficherait comme « à venir » une édition qui a peut-être déjà eu
lieu. Aucune règle de calcul ne peut le savoir sans dates.

## Options

- **Mois prévu facultatif** — réduit l'ambiguïté sans la supprimer, au prix
  d'une colonne de plus.
- **Sans date = à venir seulement si l'année est strictement future** — crée
  des faux négatifs : une annonce de l'année en cours bascule dans le passé, et
  chaque 1er janvier, toutes les éditions sans date de la nouvelle année aussi.
- **Pas de publication sans dates pour l'année en cours ou une année passée** —
  la base ne contient aucune ambiguïté au moment de publier.

## Décision

- Une édition est à venir tant que sa date de fin (à défaut, sa date de début)
  n'est pas passée. Une édition en cours reste à venir.
- Une édition sans date est à venir si son année n'est pas passée. Elle arrive
  en fin de liste.
- Une édition de l'année en cours ou d'une année passée ne peut pas être
  publiée sans dates (trigger `editions_require_dates`).
- La règle est portée par la vue `upcoming_editions`, avec `security_invoker` :
  la RLS du lecteur s'applique.
- Règle affichable (ADR 0004) : « Éditions en cours et à venir, de la plus
  proche à la plus lointaine. Dates non annoncées en fin de liste. »
- Le mois prévu est reporté à une issue dédiée.

## Conséquences

- Une annonce de l'année en cours sans dates précises reste en attente jusqu'à
  ce que ses dates soient connues.
- Une édition passée ne peut être publiée qu'avec ses dates, y compris pour
  l'historique.
- Dans l'interface, une édition sans date s'affiche « Dates non annoncées ».
- Le front doit redemander le tri explicitement : SQL ne garantit pas l'ordre
  d'une vue à celui qui l'interroge.
- Ajouter le mois prévu assouplira le trigger : ce sera une modification, pas
  un simple ajout.
- Cas résiduel : une édition publiée sans date pour une année future, et
  toujours sans date quand cette année arrive. Il se détecte avec cette
  requête, à lancer dans Studio :

```sql
select f.name, e.year, e.id
from public.editions e
join public.festivals f on f.id = e.festival_id
where e.status = 'published'
  and e.start_date is null
  and e.year <= extract(year from current_date)
order by e.year, f.name;
```
