# Test de couverture élargi : FestT et FEST

Relevé du 2026-11-26 (#81). C'est le test exigé par les ADR 0010 et 0032.

## Échantillon

Les 19 festivals publiés, tels que la liste en ligne
(`https://ofests.com/fr/festivals/`) les affiche : 13 avec une édition à
venir, 6 sans prochaine édition annoncée. Les pays sont ceux de la liste, qui
n'en affiche pas pour trois festivals.

## Méthode

Relevé manuel du 2026-11-26 par la barre de recherche de chaque site, après un
test témoin. Seule exception : sur FestT, cinq des six festivals sans édition à
venir ont été vérifiés par la liste filtrée décrite plus bas.

Règle de relevé :

- « oui » : fiche trouvée, avec son URL ;
- « non » : le festival n'a pas été trouvé. Pour chaque « non » obtenu par la
  barre de recherche, le nom a été cherché, puis sa variante quand il en a
  une ;
- « non vérifié » : recherche impossible ou résultat ambigu. Ce n'est pas une
  absence.

**Variantes.** La variante est le nom sans « Open Air », « Festival » ou
« Fest ». Il n'y en a pas quand le nom n'a pas de mot retirable ou quand ce qui
reste n'est pas distinctif : une seule recherche suffit alors (décision du PO).

- Variantes utilisées : Metal Hunting, Mystic, Resurrection, Wacken,
  Wellesweiler, Hell over Valhalla, Motocultor, Blasphemic Rites, Liège Metal,
  Mauges Pit, Pyrenean Warriors, Riip, Sylak.
- Aucune variante : Eindhoven Metal Meeting, Winteriip, Graspop Metal Meeting,
  Hellfest, Brutal Assault, Rock The Lakes.

**FEST.** La barre de recherche retrouve des festivals qui n'ont sur FEST que
des éditions passées (Sylak Open Air et Eindhoven Metal Meeting). Un « non »
y est donc fiable, y compris pour un festival sans édition à venir.

**FestT, festivals sans édition à venir.** La barre de recherche ne retrouve
pas les festivals terminés : Pure Fucking Metal Festevil, témoin hors
échantillon dont la fiche existe, n'est pas retrouvé. Pour cinq festivals,
la vérification s'est faite le 2026-11-26 sur la liste des festivals de
FestT :

- filtre par dates sur l'édition 2026, à 2 jours près ;
- lieu : Europe entière ;
- festivals sans line-up inclus ;
- liste chargée en entier, lue sur le nom du festival et sur la ville ou la
  salle.

Contrôle réussi : Pure Fucking Metal Festevil (10 et 11 juillet 2026) apparaît
dans la liste ainsi filtrée.

| Festival | Période filtrée (2026) | Résultats | Sur FestT |
|---|---|---|---|
| Riipfest | 1er au 6 juillet | 179 | non |
| Mauges Pit Fest | 30 septembre au 5 octobre | 24 | non |
| Pyrenean Warriors Open Air | 10 au 14 septembre | 54 | non |
| Liège Metal Fest – Spring Break | 23 au 27 avril | 37 | non |
| Blasphemic Rites Open Air | 27 août au 1er septembre | 98 | non |

FestT n'a pas d'éditions antérieures à 2026 : la liste de juillet 2025 est
vide, les pages `hellfest-2025` et `wacken-2025` n'existent pas, la page
`hellfest-2026` existe.

**Provenance.** Seuls la présence et l'URL de la fiche sont relevés. Aucune
donnée de FestT ou de FEST n'entre dans la base ni dans `supabase/`.

## Résultats

| Festival | Pays | FestT | FEST | URL FestT | URL FEST |
|---|---|---|---|---|---|
| Eindhoven Metal Meeting | Pays-Bas | oui | oui (fiche 2024 seulement) | <https://festt.io/fr/festivals/eindhoven-metal-meeting> | <https://festapp.io/festivals/eindhoven-metal-meeting/2024> |
| Winteriip | France | non | non |  |  |
| Metal Hunting Open Air | France | non | non |  |  |
| Mystic Festival | Pologne | oui | oui (fiche 2025 seulement) | <https://festt.io/fr/festivals/mystic-festival-2027> | <https://festapp.io/festivals/mystic-festival/2025> |
| Graspop Metal Meeting | Belgique | oui | oui | <https://festt.io/fr/festivals/graspop-metal-meeting-2027> | <https://festapp.io/festivals/graspop-metal-meeting/2026> |
| Hellfest | France | oui | oui | <https://festt.io/fr/festivals/hellfest-2027> | <https://festapp.io/festivals/hellfest/2026> |
| Resurrection Fest | Espagne | oui | oui (fiche 2025 seulement) | <https://festt.io/en/festivals/resurrection-fest-2027> | <https://festapp.io/festivals/resurrection-fest/2025> |
| Wacken Open Air | Allemagne | oui | oui | <https://festt.io/fr/festivals/wacken-2027> | <https://festapp.io/festivals/wacken/2027> |
| Brutal Assault | Tchéquie | oui | oui | <https://festt.io/fr/festivals/brutal-assault-2027> | <https://festapp.io/festivals/brutal-assault/2026> |
| Wellesweiler Open Air | Allemagne | non | non |  |  |
| Hell over Valhalla OpenAir | Autriche | non | non |  |  |
| Motocultor Festival | France | oui | oui | <https://festt.io/fr/festivals/motocultor-festival-2027> | <https://festapp.io/festivals/motocultor-festival/2027> |
| Rock The Lakes | Suisse | oui | non | <https://festt.io/en/festivals/rock-the-lakes-2027> |  |
| Blasphemic Rites Open Air | non affiché | non | non |  |  |
| Liège Metal Fest – Spring Break | Belgique | non | non |  |  |
| Mauges Pit Fest | France | non | non |  |  |
| Pyrenean Warriors Open Air | non affiché | non | non |  |  |
| Riipfest | France | non | non |  |  |
| Sylak Open Air | non affiché | oui | oui (fiche 2025 seulement) | <https://festt.io/en/festivals/sylak-open-air-2027> | <https://festapp.io/festivals/sylak/2025> |

Pour Eindhoven Metal Meeting (2024), Mystic Festival, Resurrection Fest et Sylak
Open Air (2025), FEST ne garde qu'une fiche d'édition passée : ils sont comptés
présents. Rock The Lakes est sur FestT, pas sur FEST.

**Absents des deux catalogues : 9 sur 19**, dont 4 avec une édition à venir et
5 sans prochaine édition annoncée.

## Conclusion

Le seuil est d'au moins 2 festivals absents des deux catalogues. Avec 9, le
critère du test de couverture est **rempli**. Les 4 absents qui ont une édition
à venir suffisent à eux seuls.

## Limites

- Relevé à une date donnée : les deux catalogues évoluent.
- Témoins : FestT = Pure Fucking Metal Festevil (hors échantillon), non
  retrouvé par la barre, retrouvé par la liste filtrée. FEST : aucun témoin
  hors échantillon ; Sylak et Eindhoven Metal Meeting, dans l'échantillon,
  montrent que la barre de FEST retrouve des festivals qui n'y ont que des
  éditions passées.
- FestT, festivals sans édition à venir : un festival enregistré avec des
  dates décalées de plus de 2 jours, ou sous un autre nom et dans une autre
  ville, échapperait à la vérification.
- Le plan de site de FEST n'est pas retenu comme méthode, à cause de la clause
  e de ses [conditions d'utilisation](https://festapp.io/files/legal/terms-of-use_en.pdf) :
  « Do not access, search or create accounts for the Services by means other
  than our public interfaces (for example, by "scraping" or creating accounts
  in bulk); ».
- La clause c des mêmes conditions dit : « Do not access the Services to build
  a similar or competing product or service, or to copy the ideas, features,
  functions or graphics of the Services; ». Son application à un test de
  couverture n'est pas tranchée.
- Une étude de faisabilité automatisée a précédé le relevé. Le plan de site des
  festivals de FEST a été téléchargé une fois, et seuls trois témoins hors
  échantillon y ont été cherchés. Des pages de FestT consultées affichaient des
  noms de l'échantillon, et la fiche `hellfest-2026` a été ouverte. Aucun
  résultat du tableau n'en est tiré.
