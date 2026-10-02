# 0012 — JSON-LD des sites officiels : piste fermée

- **Statut** : acceptée
- **Date** : 2026-10-02
- **Issue** : [#11](https://github.com/Cfy1010/ofests/issues/11)

## Contexte

Le spike sources ([0009](0009-sources-de-donnees.md)) a montré que la date
de la prochaine édition et l'affiche ne sont fiables dans aucune source
ouverte. Restait une piste : les sites officiels, seuls à publier ces
informations de première main, les exposent-ils en données structurées
(`Event`, `MusicEvent`) lisibles automatiquement par l'import (#7) ?

## Spike

Timebox de 2 h, le 2026-10-02. Huit festivals : quatre gros (Hellfest,
Wacken Open Air, Graspop Metal Meeting, Brutal Assault), un moyen
(Motocultor), trois petits (Sylak Open Air, Riipfest, Mauges Pit Fest).
Jusqu'à trois URL par festival (accueil, billetterie, programmation),
lues avec `curl`, et test des résultats enrichis de Google sur une page
par festival au plus.

Résultats :

- **`Event` ou `MusicEvent` sur un site officiel : 0 sur 8.**
- Les quatre plus gros n'exposent aucun JSON-LD. Les autres n'exposent que
  des blocs de structure de site générés par leur outil (Yoast, Wix) :
  `WebSite`, `WebPage`, `Organization`, `BreadcrumbList`.
- Billetteries : une sur quatre testées expose des données (Fever, pour
  Motocultor), en `Product` et non en `Event`. Nom, lieu, coordonnées et
  prix sont structurés ; dates et affiche sont en texte libre ; la commune
  est fausse (Brest au lieu de Carhaix-Plouguer).
- Les dates de la prochaine édition n'apparaissent qu'en texte libre.

## Décision

1. La piste JSON-LD des sites officiels est fermée. L'import (#7) ne
   prévoit pas de lecteur JSON-LD et repose sur MusicBrainz et Wikidata,
   comme le prévoit 0009.
2. Les billetteries ne sont pas retenues comme source. Piste à réévaluer
   à l'ouverture des ventes 2027, sans issue pour l'instant.
3. En sens inverse, O-Fests publie lui-même des données `Event` sur la
   fiche d'une édition : critère d'acceptation ajouté à
   [#5](https://github.com/Cfy1010/ofests/issues/5).

## Justification du point 3

Vérifié le 2026-10-02 dans la documentation Google Search Central
(« Event structured data », mise à jour le 2026-09-08) :

- les données `Event` sont toujours exploitées, sans avertissement de
  retrait ;
- seules les pages consacrées à un seul événement sont prises en charge,
  ce qui correspond à la fiche d'édition et non à la liste (#4) ;
- l'expérience événements n'est disponible que dans certaines régions,
  dont le Royaume-Uni et l'Allemagne, mais **pas la France, la Belgique ni
  la République tchèque**.

Le gain est donc limité pour les recherches en français depuis la France,
mais le coût est faible : le bloc se génère à partir des données de la
fiche. Les festivals n'exposant pas ces données eux-mêmes, O-Fests peut en
être la source structurée là où le service existe.

## Conséquences

- #7 ne comporte pas de lecteur JSON-LD.
- La contribution et la curation restent le socle du catalogue (0009
  confirmée).
- #5 gagne un critère : bloc JSON-LD `Event` valide sur la fiche d'édition.

## Limites

- Huit sites, une seule date de test.
- Test des billetteries faible : pour 4 festivals sur 8, la vente 2027
  était close, épuisée ou inaccessible.
- Test de Google passé sur 3 pages seulement ; ailleurs, `curl` ne voit pas
  le JSON-LD injecté en JavaScript.
- Google ne garantit pas l'affichage des résultats enrichis, même avec un
  balisage valide.

## Options écartées

- **Extraire dates et affiche du texte libre** (titre HTML, descriptions de
  billetterie) : découpage propre à chaque site, fragile au moindre
  changement de rédaction.
- **Ouvrir dès maintenant une issue sur les billetteries** : une seule
  plateforme exploitable sur quatre, avec une erreur de lieu ; prématuré
  avant l'ouverture des ventes 2027.
