# 0031 — Google Search Console, troisième source de mesure

Date : 2026-11-17
Statut : proposée

## Contexte

L'ADR 0028 mesure l'audience avec Cloudflare Web Analytics. Le relevé du
2026-11-17 montre trois limites pour établir une base de départ :

- Web Analytics ne voit que les navigateurs sans bloqueur, et ne compte que
  les visites, pas la découverte du site ;
- l'analytique du domaine (côté serveur) compte les robots : Curl, GoogleBot,
  serpstatbot, et une large part « Unknown/Others » que l'offre gratuite ne
  permet pas d'exclure ;
- au-delà de 7 jours, les valeurs des deux sources sont agrégées (FAQ Web
  Analytics citée dans l'ADR 0028) et ne sont plus exploitables à faible
  volume.

Le même jour, une recherche « ofests » sur Google renvoie la liste et des
fiches : le site est indexé, donc déjà diffusé par la recherche, sans
promotion active.

Le Product Goal porte sur le fait de *trouver* un festival. Aucune des deux
sources Cloudflare ne dit si O-Fests est trouvé dans Google, ni sur quelles
requêtes.

## Options

- **A. Ajouter Google Search Console** — impressions, clics, position et
  requêtes, par page, pays et appareil ; aucun script sur le site.
- **B. Web Analytics seul** — pas de fournisseur de plus, mais la découverte
  reste invisible.

## Décision

Option A, décidée par le PO le 2026-11-17. Propriété de domaine `ofests.com`,
vérifiée par un enregistrement DNS TXT chez Cloudflare.

Répartition des rôles entre les sources :

| Source | Mesure | Limite principale |
| --- | --- | --- |
| Search Console | Découverte : O-Fests apparaît-il dans Google, sur quelles requêtes | Recherche Google seulement ; données disponibles avec quelques jours de retard |
| Web Analytics | Visites humaines | Sous-estimée (bloqueurs, opposition) |
| Analytique du domaine | Plafond, robots compris | Surestimée ; robots non nommés inséparables |

## Conséquences

- Aucun script, cookie ni stockage ajouté sur ofests.com : l'exemption de
  consentement établie par l'ADR 0028 n'est pas touchée.
- **À vérifier dans la PR** : si la politique de confidentialité (ADR 0029)
  doit mentionner Search Console. Hypothèse : non, aucun traitement n'ayant
  lieu sur ofests.com, mais elle n'est pas vérifiée.
- La collecte d'une propriété commence à son ajout, d'après l'aide Search
  Console : chaque jour d'attente est un jour sans historique. Ajout à faire
  avant le relevé de la base de départ.
- Conservation limitée à 16 mois chez Google : les relevés utiles sont figés
  dans le dépôt, pas laissés dans l'interface.
- Le sitemap (`@astrojs/sitemap`) est soumis dans Search Console.
- La valeur de l'enregistrement TXT est publique par nature (DNS) ; elle n'est
  pas recopiée dans le dépôt pour autant.
- Un service Google de plus dans l'outillage du projet, sous le compte du PO.
