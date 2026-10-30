# 0028 — Mesure d'audience : Cloudflare Web Analytics, exemptée de consentement

Date : 2026-10-30
Statut : acceptée

## Contexte

L'issue #62 demande de savoir comment O-Fests est consulté : quelles fiches,
d'où viennent les visites, quelle part fr/en, mobile, quels pays. La mesure
ne doit déposer aucun cookie ni utiliser de stockage local, et rester dans
les conditions d'exemption de consentement de la CNIL.

ofests.com est inscrit à Cloudflare Web Analytics en configuration
automatique, mais le HTML servi ne contient aucun script `cloudflareinsights` :
l'injection automatique ne fonctionne pas (cause non élucidée).

## Options

- **Cloudflare Web Analytics** — gratuit, déjà chez l'hébergeur, sans cookie.
- **Un outil tiers (Plausible, Matomo…)** — mêmes garanties possibles, mais un
  fournisseur de plus, un coût ou un hébergement à tenir.
- **Aucune mesure** — écarte le besoin de l'issue : arbitrer le backlog sur des
  faits (Current Value, EBM).

## Décision

Cloudflare Web Analytics, par un script ajouté à la main.

**Contrôle des conditions d'exemption** (CNIL, « Mesurer la fréquentation de
vos sites web et de vos applications »,
<https://www.cnil.fr/fr/mesurer-la-frequentation-de-vos-sites-web-et-de-vos-applications>) :

- finalité « strictement limitée à la seule mesure de l'audience », pour le
  compte exclusif de l'éditeur : c'est la seule finalité d'O-Fests ;
- le traceur sert « uniquement à produire des données statistiques anonymes » ;
- pas de suivi global de la navigation de la personne ;
- conservation des informations collectées limitée à 25 mois ;
- engagement contractuel du fournisseur de ne pas réutiliser les données ;
- vigilance sur les transferts hors de l'Union européenne ;
- information des utilisateurs, par exemple dans la politique de
  confidentialité : section « Mesure d'audience » des mentions légales.

Constat, condition par condition (ce que les sources Cloudflare établissent,
et ce qu'elles n'établissent pas) :

| Condition | Constat |
| --- | --- |
| Finalité limitée à la mesure | O-Fests n'utilise l'outil qu'à cette fin. |
| Statistiques anonymes | Ni cookie ni stockage, pas de fingerprinting (ci-dessous). |
| Pas de suivi intersite | Découle de l'absence de cookie et de stockage côté navigateur. Aucune page Cloudflare consultée ne l'énonce expressément. |
| Conservation ≤ 25 mois | Non établie. Cloudflare ne publie pas de durée pour Web Analytics. Données brutes 7 jours, puis agrégées. Le DPA (annexe 1, B) prévoit une conservation jusqu'à l'expiration ou la fin du contrat, ou jusqu'à ce que le traitement ne soit plus nécessaire. Risque résiduel accepté (Conséquences). |
| Non-réutilisation par le fournisseur | Vérifiée dans le DPA Cloudflare (<https://www.cloudflare.com/dpa/>) : clause 3.1(a), traitement limité à « the limited and specified business purpose of providing the Services », sur instructions écrites du client ; clause 3.1(b), pas d'usage « for the purposes of marketing or advertising » ; annexe 1, B, le DPA couvre les personnes qui accèdent aux sites du client. |
| Transferts hors UE | Data Privacy Framework, clauses contractuelles types sinon (ci-dessous). |
| Information | Mentions légales, en fr et en. |

**Ce que dit Cloudflare :**

- ni cookie ni `localStorage` (« does not use any client-side state, such as
  cookies or localStorage »), et pas de fingerprinting par adresse IP, User
  Agent ou autre donnée :
  <https://www.cloudflare.com/web-analytics/> ;
- données brutes conservées 7 jours, puis agrégées à environ 10 % du volume :
  <https://developers.cloudflare.com/web-analytics/faq/> ;
- transferts vers les États-Unis couverts par le Data Privacy Framework,
  clauses contractuelles types sinon : <https://www.cloudflare.com/dpa/>.

**Opposition.** La CNIL, dans sa FAQ sur les lignes directrices cookies
(question 10,
<https://cnil.fr/questions-reponses-lignes-directrices-modificatives-et-recommandation-cookies-traceurs>),
demande, quand le traitement repose sur l'intérêt légitime, un mécanisme
d'opposition « aisément accessible », sans forme imposée. O-Fests le
propose sur la page des mentions légales : un bouton « Ne pas mesurer mes
visites », qui devient « Réactiver la mesure », avec l'état affiché.

- Le choix est mémorisé en `localStorage` (clé `ofests-audience`, valeur
  `off`) ; réactiver la mesure supprime la clé. `src/lib/audience.js`, sur le
  modèle de `theme.js`.
- Ce stockage est exempté de consentement : la CNIL cite les traceurs
  « conservant le choix exprimé par les utilisateurs sur le dépôt de
  traceurs »
  (<https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/que-dit-la-loi>).
- L'opposition prend effet à la page suivante : la visite de la page légale
  où le visiteur clique est déjà comptée. Le texte de la page le dit.
- Si le navigateur bloque le stockage, le choix ne peut pas être conservé ; la
  page l'indique au visiteur plutôt que de le taire.

**Insertion.** Un petit script de tête (`src/layouts/Base.astro`) ajoute le
beacon, seulement si le jeton `PUBLIC_CF_BEACON_TOKEN` est défini (variable de
build du Worker, absente en local) et que le visiteur ne s'est pas opposé.
Forme documentée par Cloudflare pour une insertion par script (FAQ Web
Analytics) : jeton dans l'URL, `type="module"`, sans `data-cf-beacon`. Sans
JavaScript, il n'y a pas de mesure.

## Conséquences

- Les chiffres sont sous-estimés : les bloqueurs de publicité bloquent le
  script, et les visiteurs opposés ne sont pas comptés. Ce sont des ordres de
  grandeur et des tendances, pas un décompte exact.
- Il n'y a aujourd'hui aucune CSP (ni `_headers`, ni en-tête, ni balise meta).
  Si on en adopte une, `script-src` devra contenir l'URL complète du beacon,
  query string comprise
  (`https://static.cloudflareinsights.com/beacon.min.js?token=…`, FAQ
  Cloudflare), et `connect-src` `https://cloudflareinsights.com`.
- **Risque résiduel accepté : la durée de conservation.** Cloudflare ne
  publie aucune durée pour Web Analytics, alors que la CNIL limite la
  conservation à 25 mois. Le DPA prévoit une conservation jusqu'à la fin du
  contrat ou jusqu'à ce que le traitement ne soit plus nécessaire : ce n'est
  pas un plafond chiffré. Le risque est accepté, avec un réexamen annuel :
  relire la documentation et le DPA de Cloudflare, et revoir cet ADR si une
  durée est publiée ou si les conditions changent.
- Un fournisseur ou un usage différent (publicité, recoupement) fait perdre
  l'exemption : un nouvel ADR et un recueil du consentement s'imposent.
- Les mentions légales (#60) ne disent plus « ni mesure d'audience » ; elles
  décrivent la mesure et portent le bouton d'opposition, en fr et en en.
- Vérification en production seulement : des visites et des pages vues
  apparaissent dans le tableau de bord Cloudflare, une fois
  `PUBLIC_CF_BEACON_TOKEN` définie dans le Worker.
