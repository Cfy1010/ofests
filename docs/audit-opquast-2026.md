# Audit Opquast 2026 — tri des règles applicables

Référentiel : Opquast, Qualité numérique, version 5.0 (2025), 245 règles. Les intitulés des règles sont repris d'Opquast sous licence Creative Commons BY-SA ; ce document est diffusé sous la même licence.
Tri fait le 2026-11-19 sur l'état du dépôt (`main`) : site statique, pages liste, fiche, mentions légales et confidentialité, en fr et en en ; filtre de la liste (cases et listes déroulantes) ; sélecteur de thème ; visionneuse du visuel. Pas de compte, de recherche, de vente, de newsletter, de média ni de PDF.

**Statut : brouillon, à verser par PR.** Ce document trie l'applicabilité ; il ne dit pas si une règle est respectée. L'audit se fait ensuite à l'écran, règle par règle, sur les règles applicables.

Légende :
- **A** : applicable, à auditer.
- **NA** : non applicable aujourd'hui, avec la raison. Les raisons « deviendra applicable avec #8 » se réactivent avec la contribution.
- **Piste** : écart repéré en relisant le code le 2026-11-19, « confirmé dans le code » ou « à vérifier en ligne ». L'audit à l'écran tranche.
- **Indice favorable** : élément du code qui va dans le sens du respect de la règle ; l'audit confirme.



## Synthèse

- Règles applicables : **122**
- Règles non applicables aujourd'hui : **123**
- Pistes d'écart : **14** confirmées dans le code, **8** à vérifier en ligne ou dépendantes
- Indices favorables relevés : **10**

## Écarts constatés à l'audit

Audit à l'écran du 2026-11-20 (passes 1 et 2), après les constats en ligne du 2026-11-19 (commentaire de #104).

| N° | Page | Constat | Issue |
|---|---|---|---|
| 25, 199, 206, 210, 211, 212 | toutes | Aucun en-tête de sécurité dans la réponse (constat du 2026-11-19) | #110 |
| 228 | toutes | Content-Type sans charset (HTML et JS) ; visible en ouvrant un fichier JS brut : « » affichés Â« Â» | #110 |
| 223 | toutes | Pas de page 404 personnalisée (constat du 2026-11-19) | #106 |
| 225 | page d'erreur | Page d'erreur du navigateur (404 sans contenu) : aucune navigation du site, retour possible seulement par Précédent ; même correction que 223 | #106 |
| 135 | `/` | Redirige toujours vers `/en/festivals/` malgré Accept-Language fr (constat du 2026-11-19) | #107 |
| 99 | liste fr et en (accueil) | Aucun texte visible ne dit la nature du site (annuaire des festivals metal en Europe) : le h1 est « Festivals à venir », la phrase n'existe que dans la meta description | #109 |
| 2 | toutes (pied de page, mentions légales) | Aucune information sur les droits de copie et de réutilisation des contenus | #116 |
| 107 | toutes | Un seul moyen de contact (contact@ofests.com) | #114 |
| 108 | mentions légales, pied de page | Aucun délai de réponse indiqué pour les demandes d'information (seulement pour les droits RGPD, dans la confidentialité) | #114 |
| 156 | fiches, mentions légales, confidentialité | Aucune indication d'emplacement (pas de fil d'Ariane, pas de menu avec élément actif) | #112 |
| 171 | toutes | Aucune page de plan du site ni lien vers elle (le sitemap XML ne compte pas) | #113 |
| 168 | toutes | Aucun moteur de recherche (le filtre n'est pas une recherche par mot-clé) | #117 |
| 190 | toutes | Pile de polices Tailwind par défaut terminée par des polices d'emoji ; correction décidée : sans-serif déplacé en fin de liste | #111 |
| 195 | toutes | Aucun style dédié à l'impression (ni @media print, ni classe print:) | #115 |
| 196 | toutes | À l'impression, pied de page et lien « Voir le visuel en grand » s'impriment ; la fiche déborde sur une 2ᵉ page pour la seule date de révision et le pied de page | #115 |
| 218 | toutes | www.ofests.com sans enregistrement DNS : « Ce site est inaccessible » (DNS_PROBE_POSSIBLE) | #108 |
| 1 | toutes | Aucun moyen de connaître les nouveaux festivals ajoutés (ni rubrique nouveautés, ni flux RSS, ni compte de réseau social) | #114 |
| 183 | toutes ; fiches | Sans styles : sélecteur de thème affichant « Thème : Clair », « Thème : Sombre » et « Thème : Système » à la fois (contradictoire) ; pied de page « Mentions légalesPolitique de confidentialitécontact@ofests.com » collé ; sur les fiches, salle et ville collées (« EffenaarEindhoven, Pays-Bas ») | #111 |

### Décisions en attente

- 135 (À ARBITRER) : A dérogation, B Worker sur `/`, C page de choix de langue, D règle de redirection Cloudflare.
- 214 : dérogation recommandée (Cloudflare ne permet pas de figer la version de son script, voir sa FAQ Web Analytics).
- 228 : traitement proposé avec les en-têtes de sécurité (`public/_headers`), dérogation si Cloudflare ne le prend pas en compte.
- 230 : scripts inline du thème et de l'audience classés hors règle (la fiche ne vise que les fichiers JavaScript).
- Tris discutables restants : 7, 46, 105-106, 147-150.

### Conformes à l'audit

197, 207, 213, 226, 227 (2026-11-19) ; 2026-11-20 : 98, 101, 102, 103, 114, 151, 160, 161, 162, 163, 164, 165, 166, 167, 185, 200, 216, 222, 229, 230, 234, 235, 236, 245, 14.

À confirmer (conformes attendues d'après le code, résultat non relevé) : 3, 15, 104, 130, 153, 154, 155, 158, 180, 193, 194, 198, 209, 219, 220, 221, 232, 233, 237, 238, 239.

### Non audité (spike arrêté le 2026-11-20 à la durée maximale)

- Passe 3, liste et filtre : 4, 69, 70, 71, 72, 77, 78, 93, 94, 139, 181, 182, 184, 186.
- Passe 4, fiche : 5, 6, 7, 116, 117, 118, 119, 129, 131, 132, 133, 134, 136, 137, 138, 140, 141, 142, 144, 146, 152, 159, 187, 188, 189, 191, 192, 231.
- Passe 5, pages légales et e-mail : 16, 29, 110, 111, 217.
- En-têtes de sécurité à revérifier sur la page liste (relevés sur une fiche seulement).

## Contenus (1–14)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 1 | Il est possible de connaître les nouveaux contenus ou services. | A |  |
| 2 | Les informations relatives aux droits de copie et de réutilisation sont disponibles depuis toutes les pages. | A | Piste : confirmé dans le code : aucune information sur les droits de copie et de réutilisation dans le pied de page ni les mentions légales |
| 3 | Le code source de chaque page contient une métadonnée qui en décrit le contenu. | A | Indice favorable : `<meta name="description">` sur chaque page |
| 4 | Les dates sont présentées dans des formats explicites. | A | Indice favorable : dates en toutes lettres via `formatDateRange` (ex. « 11–12 décembre 2026 ») |
| 5 | La première occurrence d'une abréviation ou d'un acronyme dans le corps de chaque page donne accès à sa signification. | A |  |
| 6 | La date de publication des contenus qui le nécessitent est indiquée. | A |  |
| 7 | Un lexique ou un glossaire adapté au public visé explique le vocabulaire sectoriel ou technique. | A |  |
| 8 | Les contenus publicitaires ou sponsorisés sont identifiés comme tels. | NA | aucun contenu publicitaire ou sponsorisé |
| 9 | Les conditions de modération des espaces publics sont indiquées. | NA | pas d'espace public de contribution (deviendra applicable avec #8) |
| 10 | Les contenus ou fichiers destinés à des espaces publics peuvent être vérifiés avant leur envoi définitif. | NA | pas d'espace public de contribution (deviendra applicable avec #8) |
| 11 | Les espaces publics proposent au moins un moyen de signaler les abus. | NA | pas d'espace public de contribution (deviendra applicable avec #8) |
| 12 | Chaque graphique est accompagné de ses données numériques. | NA | aucun graphique |
| 13 | La page des résultats de recherche indique le nombre de résultats, le nombre de pages de résultats, et le nombre de résultats par page. | NA | pas de moteur de recherche |
| 14 | Les contenus ne détournent pas de caractères pour simuler une mise en forme visuelle. | A |  |

## Données personnelles (15–29)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 15 | La politique de confidentialité et de respect de la vie privée est disponible depuis toutes les pages. | A |  |
| 16 | La procédure d'accès et de rectification des données personnelles est décrite. | A |  |
| 17 | La création de compte est possible sans recours à un système d'identification tiers. | NA | pas de compte utilisateur (deviendra applicable avec la contribution, #8) |
| 18 | La création d'un compte est soumise à un processus de confirmation. | NA | pas de compte utilisateur (deviendra applicable avec la contribution, #8) |
| 19 | Un mécanisme de prévention des usurpations de compte ou d'identité est proposé. | NA | pas de compte utilisateur (deviendra applicable avec la contribution, #8) |
| 20 | Les comptes ou abonnements ouverts en ligne peuvent être fermés par le même moyen. | NA | pas de compte utilisateur (deviendra applicable avec la contribution, #8) |
| 21 | Si un espace personnel ou abonné est proposé, il est possible de sauvegarder les contenus personnels. | NA | pas de compte utilisateur (deviendra applicable avec la contribution, #8) |
| 22 | La connexion à tous les services proposés est possible avec les mêmes identifiants. | NA | pas de compte utilisateur (deviendra applicable avec la contribution, #8) |
| 23 | Il est possible de se déconnecter des espaces privés. | NA | pas de compte utilisateur (deviendra applicable avec la contribution, #8) |
| 24 | Les alias mail contenant le signe + sont acceptés. | NA | pas de compte utilisateur (deviendra applicable avec la contribution, #8) |
| 25 | Les en-têtes envoyés par le serveur spécifient la politique de communication des referrers. | A | Piste : à vérifier en ligne : pas de `public/_headers`, en-têtes réels de Cloudflare non lisibles depuis cette session |
| 26 | Aucune information n’est exposée sur l’existence d’un compte utilisateur. | NA | pas de compte utilisateur (deviendra applicable avec la contribution, #8) |
| 27 | Les échanges de données sensibles sont sécurisés et signalés comme tels. | NA | aucune donnée sensible échangée |
| 28 | Les données sensibles ne sont pas transmises en clair dans les url. | NA | aucune donnée sensible échangée |
| 29 | L'objectif des cookies et les limitations inhérentes à leur refus sont expliqués. | A |  |

## E-commerce (30–68)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 30 | L'achat d'un produit ou service est possible sans création de compte. | NA | pas de vente ni de transaction |
| 31 | Le détail de chaque article est consultable depuis le panier. | NA | pas de vente ni de transaction |
| 32 | Aucun produit ni service annexe n'est ajouté au panier de commande sans que cette action soit déclenchée par l'utilisateur. | NA | pas de vente ni de transaction |
| 33 | L'inscription à des services annexes n'est pas activée par défaut. | NA | pas de vente ni de transaction |
| 34 | La disponibilité des produits est indiquée avant la validation définitive de la commande. | NA | pas de vente ni de transaction |
| 35 | Le délai de livraison estimé est indiqué avant la validation définitive de la commande. | NA | pas de vente ni de transaction |
| 36 | Les frais de livraison estimés sont indiqués avant la validation définitive de la commande. | NA | pas de vente ni de transaction |
| 37 | Les modalités de récupération d'un bien dématérialisé sont précisées avant la commande. | NA | pas de vente ni de transaction |
| 38 | La modification de la quantité de chaque article, l'ajout et la suppression d'un ou plusieurs articles restent possibles avant la validation définitive de la commande. | NA | pas de vente ni de transaction |
| 39 | La nature et les caractéristiques quantifiables des produits et services sont indiquées. | NA | pas de vente ni de transaction |
| 40 | La période et les conditions de validité des offres spéciales et promotions sont indiquées. | NA | pas de vente ni de transaction |
| 41 | Le sous-total détaillé est indiqué avant la validation définitive de la commande. | NA | pas de vente ni de transaction |
| 42 | Les conditions de financement sont indiquées. | NA | pas de vente ni de transaction |
| 43 | Les conditions de fonctionnement du service après-vente sont indiquées. | NA | pas de vente ni de transaction |
| 44 | Les conditions de débit ou d'encaissement sont indiquées. | NA | pas de vente ni de transaction |
| 45 | Les conditions de garantie sont indiquées. | NA | pas de vente ni de transaction |
| 46 | Les conditions de vente ou d’utilisation sont disponibles depuis toutes les pages. | NA | pas de conditions de vente ; pas de CGU tant qu'il n'y a pas de compte (deviendra applicable avec #8) |
| 47 | Les informations relatives à la zone de livraison des produits ou de réalisation des services sont indiquées. | NA | pas de vente ni de transaction |
| 48 | Les moyens de paiement acceptés et les procédures correspondantes sont indiqués. | NA | pas de vente ni de transaction |
| 49 | L’identité des prestataires impliqués dans les transactions est précisée. | NA | pas de vente ni de transaction |
| 50 | Les recours en cas de litige sont indiqués dans les conditions générales de vente ou d’utilisation. | NA | pas de vente ni de transaction |
| 51 | L’adresse et les conditions de retour des produits sont indiquées. | NA | pas de vente ni de transaction |
| 52 | La charge des frais de retour est indiquée avant la validation définitive de la commande. | NA | pas de vente ni de transaction |
| 53 | Le mode de dépôt et la procédure de traitement des réclamations sont indiqués. | NA | pas de vente ni de transaction |
| 54 | Les conditions de remboursement et de résiliation sont indiquées. | NA | pas de vente ni de transaction |
| 55 | Les matériels et logiciels nécessaires au fonctionnement du service sont indiqués avant la validation de la commande. | NA | pas de vente ni de transaction |
| 56 | Les prix affichés mentionnent le détail des taxes et suppléments éventuels ainsi que le montant hors taxes. | NA | pas de vente ni de transaction |
| 57 | Une adresse de livraison différente de l’adresse de facturation peut être spécifiée. | NA | pas de vente ni de transaction |
| 58 | Au moins deux moyens de paiement sont acceptés. | NA | pas de vente ni de transaction |
| 59 | Les données bancaires ne sont mémorisées qu’après consentement explicite de l'utilisateur. | NA | pas de vente ni de transaction |
| 60 | Les données bancaires mémorisées peuvent être modifiées ou supprimées. | NA | pas de vente ni de transaction |
| 61 | La référence de la transaction est affichée au client après la validation de sa commande. | NA | pas de vente ni de transaction |
| 62 | Les factures émises sont également disponibles en ligne. | NA | pas de vente ni de transaction |
| 63 | Chaque facturation fait l'objet d'un mail de confirmation. | NA | pas de vente ni de transaction |
| 64 | Les mentions d'appartenance à un ordre ou groupe professionnel, d'un label ou d'une récompense sont accompagnées d'un lien vers la source. | NA | pas de vente ni de transaction |
| 65 | Les produits indisponibles font l'objet d'une différenciation visuelle et textuelle. | NA | pas de vente ni de transaction |
| 66 | Un mail indiquant la référence de la transaction et les données de la commande est envoyé suite à la validation. | NA | pas de vente ni de transaction |
| 67 | Chaque réclamation fait l'objet d'un accusé de réception. | NA | pas de vente ni de transaction |
| 68 | La provenance des produits est indiquée. | NA | pas de vente ni de transaction |

## Formulaires (69–98)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 69 | Chaque champ de formulaire est associé dans le code source à une étiquette qui lui est propre. | A | Indice favorable : cases et listes du filtre dans des `<label>`, groupes en `<fieldset>` + `<legend>` |
| 70 | Les informations complétant l'étiquette d'un champ sont associées à celui-ci dans le code-source. | A |  |
| 71 | L'étiquette de chaque champ de formulaire indique si la saisie est obligatoire. | A |  |
| 72 | Le format de saisie des champs de formulaire qui le nécessitent est indiqué. | A |  |
| 73 | L'utilisateur est averti lorsqu'une saisie est sensible à la casse. | NA | aucun champ de saisie de texte (le filtre n'a que des cases et des listes) |
| 74 | L'étiquette de chaque champ de formulaire qui le nécessite indique les limites de nombre de caractères. | NA | aucun champ de saisie de texte (le filtre n'a que des cases et des listes) |
| 75 | La création d'un mot de passe par l'utilisateur fait l'objet d'un mécanisme de prévention des erreurs de saisie. | NA | pas de mot de passe |
| 76 | Les caractères saisis dans un champ de mot de passe peuvent être affichés en clair. | NA | pas de mot de passe |
| 77 | Chaque étiquette de formulaire est visuellement rattachée au champ qu'elle décrit. | A | Indice favorable : voir 69 |
| 78 | Les informations contextuelles se rapportant à un champ de formulaire lui sont visuellement rattachées. | A |  |
| 79 | En cas de rejet des données saisies dans un formulaire, les champs contenant les données rejetées sont indiqués à l'utilisateur. | NA | aucune saisie validée ni rejetée (le filtre s'applique sans envoi) |
| 80 | En cas de rejet des données saisies dans un formulaire, les raisons du rejet sont indiquées à l'utilisateur. | NA | aucune saisie validée ni rejetée (le filtre s'applique sans envoi) |
| 81 | En cas de rejet des données saisies dans un formulaire, toutes les données saisies peuvent être modifiées par l'utilisateur. | NA | aucune saisie validée ni rejetée (le filtre s'applique sans envoi) |
| 82 | Les messages d'erreur personnalisés sont exprimés dans la langue du formulaire. | NA | aucune saisie validée ni rejetée (le filtre s'applique sans envoi) |
| 83 | Lors de la saisie d'un formulaire réparti sur plusieurs pages, un récapitulatif global est affiché avant l'envoi définitif. | NA | aucun formulaire envoyé |
| 84 | La page affichée après l'envoi d'un formulaire permet de reprendre directement la navigation. | NA | aucun formulaire envoyé |
| 85 | La soumission d'un formulaire est suivie d'un message indiquant la réussite ou non de l'action souhaitée. | NA | aucun formulaire envoyé |
| 86 | L'utilisateur est averti au début d'un processus complexe de la nature des données et documents exigés. | NA | aucun processus complexe |
| 87 | Les processus complexes sont accompagnés de la liste de leurs étapes. | NA | aucun processus complexe |
| 88 | L'étape en cours d'un processus complexe est indiquée. | NA | aucun processus complexe |
| 89 | Chaque étape d'un processus complexe permet de revenir à l'étape précédente. | NA | aucun processus complexe |
| 90 | L'utilisateur est averti de la perte d'information en cas d'utilisation de l'historique de son navigateur dans un processus complexe. | NA | aucun processus complexe |
| 91 | La navigation dans un processus complexe ne provoque pas la perte des données précédemment soumises. | NA | aucun processus complexe |
| 92 | Le copier coller est possible dans les champs de formulaire. | NA | aucun champ de saisie de texte (le filtre n'a que des cases et des listes) |
| 93 | Les éléments d'une liste déroulante qui peuvent être regroupés le sont de manière appropriée. | A |  |
| 94 | Les listes d'options de formulaires sont présentées dans un ordre identifiable. | A |  |
| 95 | Les champs de saisie de type mail, URL, téléphone, nombre, recherche, mots de passe, heure et date sont dotés du type approprié. | NA | aucun champ de saisie de texte (le filtre n'a que des cases et des listes) |
| 96 | Les procédures d’authentification à double facteur peuvent être relancées. | NA | pas d'authentification à double facteur |
| 97 | Les champs permettant l'autocomplétion sont signalés dans le code source. | NA | aucun champ à autocomplétion |
| 98 | Les boutons désactivés ne sont pas masqués aux lecteurs d'écran. | A |  |

## Identification et contact (99–115)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 99 | La page d'accueil expose la nature des contenus et services proposés. | A |  |
| 100 | Si le site est réservé ou destiné à un public spécifique, ce public est mentionné au moins sur la page d'accueil. | NA | site ouvert à tous, sans public réservé |
| 101 | L'identité de l'auteur, de la société ou de l'organisation est indiquée. | A |  |
| 102 | Le titre de chaque page permet d'identifier le site. | A |  |
| 103 | Le titre de chaque page permet d'identifier son contenu. | A |  |
| 104 | Le code source des pages contient un appel valide à une icône de favori. | A |  |
| 105 | L'adresse complète et le numéro de téléphone des sociétés et organisations sont disponibles depuis toutes les pages. | NA | éditeur particulier anonyme (LCEN, #60) : ni société ni organisation |
| 106 | Le numéro d'immatriculation délivré aux sociétés ou organisations au terme des procédures légales d'enregistrement en vigueur dans leur pays est indiqué. | NA | éditeur particulier anonyme (LCEN, #60) : ni société ni organisation |
| 107 | Au moins deux moyens de contact sont proposés. | A | Piste : confirmé dans le code : un seul moyen de contact (contact@ofests.com) |
| 108 | Les délais de réponse aux demandes d'information sont indiqués. | A |  |
| 109 | Les horaires et tarifs de fonctionnement des services mis à la disposition des utilisateurs sont indiqués. | NA | service gratuit, sans horaires |
| 110 | Chaque demande d'information fait l'objet d'un accusé de réception. | A |  |
| 111 | Tous les mails fournissent au moins un moyen de contact. | A |  |
| 112 | Il existe au moins un moyen de contacter le service après-vente ou le support. | NA | pas de service après-vente ni de support |
| 113 | Il existe au moins un moyen de contacter le modérateur des espaces publics. | NA | pas d'espace public de contribution (deviendra applicable avec #8) |
| 114 | L'identité de la personne ou du service responsable des contenus est indiquée. | A |  |
| 115 | Si un ou plusieurs standards ou référentiels sont déclarés comme respectés, un lien est proposé vers chacun d’eux. | NA | aucun standard ni référentiel déclaré comme respecté (deviendrait applicable si on en déclare un) |

## Images et médias (116–127)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 116 | Chaque image décorative est dotée d'une alternative textuelle appropriée. | A |  |
| 117 | Chaque image-lien est dotée d'une alternative textuelle appropriée. | A |  |
| 118 | Chaque image porteuse d'information est dotée d'une alternative textuelle appropriée. | A |  |
| 119 | Les vignettes et aperçus ne sont pas des images de taille supérieure redimensionnées côté client. | A |  |
| 120 | Les objets inclus sont dotés d'une alternative textuelle appropriée. | NA | aucun objet inclus (iframe, embed) |
| 121 | Chaque contenu audio et vidéo est accompagné de sa transcription textuelle. | NA | aucun contenu audio ou vidéo |
| 122 | Les vidéos comportent des sous-titres synchronisés. | NA | aucun contenu audio ou vidéo |
| 123 | La durée des contenus vidéo ou audio est indiquée. | NA | aucun contenu audio ou vidéo |
| 124 | Les vidéos sont déclenchées par l'utilisateur. | NA | aucun contenu audio ou vidéo |
| 125 | Les sons sont déclenchés par l'utilisateur. | NA | aucun contenu audio ou vidéo |
| 126 | Les animations, sons et clignotements peuvent être mis en pause. | NA | aucune animation ni son (à confirmer à l'audit) |
| 127 | Le déroulement des animations ne bloque pas la navigation ou l'accès aux contenus. | NA | aucune animation ni son (à confirmer à l'audit) |

## Internationalisation (128–135)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 128 | L'indicatif international est disponible pour tous les numéros de téléphone. | NA | aucun numéro de téléphone publié |
| 129 | Le pays est précisé pour toutes les adresses postales. | A |  |
| 130 | Le code source de chaque page indique la langue principale du contenu. | A | Indice favorable : `<html lang>` selon la langue |
| 131 | La langue principale de la page cible d'un lien est identifiable lorsqu'elle diffère de celle de la page d'origine. | A |  |
| 132 | Chaque changement de langue est signalé. | A |  |
| 133 | Les liens d'accès aux versions traduites pointent directement vers la traduction de la page courante. | A | Indice favorable : sélecteur de langue vers la même page traduite (`getRelativeLocaleUrl`) |
| 134 | Les liens vers les versions équivalentes de la page ou du site sont rédigés dans leur langue cible. | A | Indice favorable : lien de langue avec `lang` et `hreflang` |
| 135 | Le serveur respecte l'ordre préférentiel de langues des outils de consultation. | A | Piste : confirmé dans le code : `/` redirige toujours vers `/en/festivals/` (302, `public/_redirects`) |

## Liens (136–152)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 136 | Chaque lien est doté d'un intitulé dans le code source. | A |  |
| 137 | Le libellé de chaque lien décrit sa fonction ou la nature du contenu vers lequel il pointe. | A |  |
| 138 | Les liens de même nature ont des couleurs, des formes et des comportements identiques sur toutes les pages. | A |  |
| 139 | Le soulignement est réservé aux liens. | A | Piste : confirmé dans le code : soulignement hors liens (option active du sélecteur de thème, bouton « Réinitialiser » du filtre) |
| 140 | Les liens sont visuellement différenciés du reste du contenu. | A |  |
| 141 | Le site n'applique pas le même style aux liens visités et non visités. | A | Piste : confirmé dans le code : aucun style `visited` |
| 142 | Les liens internes et externes sont différenciés. | A | Piste : confirmé dans le code : liens externes (sources, sites officiels) non différenciés |
| 143 | Les liens internes vers les contenus à accès limité sont différenciés. | NA | aucun contenu à accès limité |
| 144 | Les liens provoquant l'ouverture d'un logiciel externe ont un libellé explicite. | A |  |
| 145 | Les numéros de téléphone sont activables via le protocole approprié. | NA | aucun numéro de téléphone publié |
| 146 | L'utilisateur est averti des ouvertures de nouvelles fenêtres. | A |  |
| 147 | Le format des fichiers proposés en téléchargement est indiqué. | NA | aucun fichier proposé au téléchargement (le visuel WebP de #99 s'affiche dans le navigateur : réserve à trancher à l'audit) |
| 148 | La taille des fichiers internes proposés en téléchargement est indiquée. | NA | aucun fichier proposé au téléchargement (le visuel WebP de #99 s'affiche dans le navigateur : réserve à trancher à l'audit) |
| 149 | La langue des fichiers en téléchargement est précisée lorsqu'elle diffère de celle de la page d'origine. | NA | aucun fichier proposé au téléchargement (le visuel WebP de #99 s'affiche dans le navigateur : réserve à trancher à l'audit) |
| 150 | Le nommage des fichiers internes proposés en téléchargement permet d'en identifier le contenu et la provenance. | NA | aucun fichier proposé au téléchargement (le visuel WebP de #99 s'affiche dans le navigateur : réserve à trancher à l'audit) |
| 151 | La mise en place de liens entrants n’est ni interdite ni restreinte. | A |  |
| 152 | Tous les liens internes sont valides. | A |  |

## Navigation (153–172)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 153 | Si les contenus ou services ne sont pas réservés à un public spécifique, l'accès aux contenus est immédiat. | A |  |
| 154 | La navigation sur le site ne provoque pas l'ouverture de popups. | A |  |
| 155 | Il est possible de revenir à la page d'accueil depuis toutes les pages. | A |  |
| 156 | Chaque page affiche une information permettant de connaître son emplacement dans l'arborescence. | A | Piste : confirmé dans le code : aucun fil d'Ariane |
| 157 | Les items actifs de menu sont signalés. | NA | pas de menu de navigation (logo, langue, thème seulement) |
| 158 | Les blocs de navigation de même nature sont affichés aux mêmes emplacements sur toutes les pages. | A |  |
| 159 | Les icônes de navigation sont accompagnées d'une légende explicite. | A |  |
| 160 | Les mécanismes de fermeture de fenêtres sont visuellement rattachées à leur contenu. | A |  |
| 161 | Les mécanismes de fermetures de fenêtres sont immédiatement disponibles. | A |  |
| 162 | Les nouvelles fenêtres dimensionnées et les fenêtres modales sont dotées d'un bouton de fermeture explicite. | A |  |
| 163 | Les mécanismes de fermetures de fenêtres sont affichés aux mêmes emplacements sur toutes les pages. | A |  |
| 164 | Chaque page contient des liens d'accès rapide placés au début du code source. | A | Piste : confirmé dans le code : aucun lien d'évitement dans `Base.astro` |
| 165 | Le focus clavier n'est ni supprimé ni masqué. | A |  |
| 166 | La navigation au clavier permet d'interagir avec l’intégralité des contenus et services. | A |  |
| 167 | La navigation au clavier s'effectue dans un ordre prévisible. | A |  |
| 168 | Un moteur de recherche interne est proposé. | A | Piste : confirmé dans le code : pas de moteur de recherche (« recherche par nom » en « Plus tard » dans la roadmap) |
| 169 | Chaque page de résultats de recherche peut être atteint via une adresse Web. | NA | pas de moteur de recherche |
| 170 | Il est possible de relancer une recherche depuis sa page de résultats. | NA | pas de moteur de recherche |
| 171 | Un plan du site est disponible depuis chaque page. | A | Piste : confirmé dans le code : pas de plan du site visible (le sitemap XML ne compte pas) |
| 172 | Les limites de temps imposées à une action ou un accès sont indiquées. | NA | aucune limite de temps |

## Newsletter (173–179)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 173 | L'inscription aux newsletters est soumise à un processus de confirmation. | NA | pas de newsletter |
| 174 | Un lien de désinscription est présent dans chaque newsletter. | NA | pas de newsletter |
| 175 | La désinscription depuis une newsletter ne demande pas de confirmation par courriel. | NA | pas de newsletter |
| 176 | La désinscription aux newsletters est possible depuis le site. | NA | pas de newsletter |
| 177 | La dernière newsletter envoyée est disponible en ligne. | NA | pas de newsletter |
| 178 | Les archives de newsletters sont disponibles en ligne. | NA | pas de newsletter |
| 179 | La fréquence d'envoi des newsletters est consultable avant l'abonnement. | NA | pas de newsletter |

## Présentation (180–196)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 180 | La charte graphique est cohérente sur toutes les pages. | A |  |
| 181 | L'information n'est pas véhiculée uniquement par la couleur. | A |  |
| 182 | Les contenus sont présentés avec un contraste suffisant par rapport à leur arrière-plan. | A |  |
| 183 | Le contenu et le sens de chaque page ne sont pas altérés lorsque les styles sont désactivés. | A |  |
| 184 | Un contenu n'est pas désigné uniquement par sa forme ou par sa position à l'écran. | A |  |
| 185 | Un contenu qui doit être restitué dans un lecteur d'écran ne lui est pas dissimulé. | A |  |
| 186 | La taille des éléments cliquables est suffisante. | A | Indice favorable : cibles d'au moins 44 px (`min-h-11`) sur les contrôles |
| 187 | Les textes pouvant être mis en forme via des styles ne sont pas remplacés par des images. | A |  |
| 188 | Les contenus générés via les styles sont dotés d'une alternative appropriée. | A |  |
| 189 | Les pictogrammes typographiques sont dotés d'une alternative appropriée. | A |  |
| 190 | Une famille générique de police est indiquée comme dernier élément de substitution. | A |  |
| 191 | Les styles ne justifient pas le texte. | A |  |
| 192 | Les mises en majuscules à des fins décoratives sont effectuées à l'aide des styles. | A |  |
| 193 | Les fonctionnalités de zoom ne sont pas bloquées. | A |  |
| 194 | Le site propose un ou plusieurs mécanismes dédiés à l'adaptation aux terminaux mobiles. | A |  |
| 195 | Le site propose des styles dédiés à l'impression. | A | Piste : confirmé dans le code : aucun style d'impression |
| 196 | Le contenu de chaque page est disponible à l'impression sans blocs de navigation. | A | Piste : confirmé dans le code : aucun style d'impression |

## Sécurité (197–217)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 197 | Toutes les pages utilisent le protocole HTTPS. | A |  |
| 198 | Les certificats de sécurité sont signés et en cours de validité. | A |  |
| 199 | Les pages utilisant HTTPS ont un en-tête de transport strict. | A | Piste : à vérifier en ligne (voir 25) |
| 200 | Les pages utilisant le protocole HTTPS ne proposent pas de ressources http. | A |  |
| 201 | Les opérations relatives aux mots de passe peuvent être effectuées intégralement en ligne. | NA | pas de mot de passe |
| 202 | Les mots de passe peuvent être choisis ou changés par l'utilisateur. | NA | pas de mot de passe |
| 203 | Un dispositif sensibilise l'utilisateur sur le degré de sécurisation du mot de passe qu'il choisit. | NA | pas de mot de passe |
| 204 | Les mots de passe peuvent être réinitialisés. | NA | pas de mot de passe |
| 205 | Les mots de passe ne sont pas communiqués en clair. | NA | pas de mot de passe |
| 206 | Les en-têtes envoyés par le serveur désactivent la détection automatique du type MIME de chaque ressource. | A | Piste : à vérifier en ligne (voir 25) |
| 207 | Le serveur indique le type MIME de chaque ressource. | A |  |
| 208 | Les informations sur la sécurité des transactions sont indiquées. | NA | pas de vente ni de transaction |
| 209 | Le serveur n'envoie pas la liste des fichiers des répertoires n'ayant pas de page d'index. | A |  |
| 210 | Le serveur envoie les informations d'activation de protection cross site scripting. | A | Piste : à vérifier en ligne (voir 25) |
| 211 | Le serveur envoie les informations indiquant les domaines autorisés à intégrer ses pages dans des cadres. | A | Piste : à vérifier en ligne (voir 25) |
| 212 | Un mécanisme de sécurité restreint l'origine des contenus. | A | Piste : à vérifier en ligne (voir 25) |
| 213 | Le serveur ne communique pas d'informations sur les logiciels et langages utilisés. | A |  |
| 214 | Le contrôle d'intégrité des ressources tierces est présent et valide. | A | Piste : à vérifier en ligne : script tiers Cloudflare Web Analytics, contrôle d'intégrité |
| 215 | Les opérations sécurisées peuvent être validées par au moins deux moyens. | NA | aucune opération sécurisée (pas de compte ni de paiement) |
| 216 | L'affichage de la barre d'adresse du navigateur n'est pas bloqué. | A |  |
| 217 | Le domaine de messagerie est authentifié. | A |  |

## Serveur et performances (218–230)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 218 | L'adresse du site fonctionne avec et sans préfixe www. | A |  |
| 219 | La racine du site contient des instructions pour les robots d'indexation. | A |  |
| 220 | Le site propose un fichier sitemap indiquant les contenus à explorer. | A |  |
| 221 | Le serveur ne force pas la redirection vers la version ou l'application mobile. | A |  |
| 222 | Le serveur envoie un code HTTP 404 pour les ressources non trouvées. | A |  |
| 223 | Le serveur envoie une page d'erreur 404 personnalisée. | A | Piste : confirmé dans le code : ni `404.astro` ni `not_found_handling` dans `wrangler.jsonc` ; la page en ligne répond en erreur |
| 224 | Le serveur envoie une page d'interdiction 403 personnalisée. | NA | aucune ressource interdite servie par un site statique (à confirmer à l'audit) |
| 225 | Le menu principal de navigation figure sur les pages d'erreur personnalisées. | A | Piste : dépend de 223 |
| 226 | Le serveur transmet des contenus compressés aux clients qui les acceptent. | A |  |
| 227 | Le serveur envoie les informations permettant la mise en cache des contenus. | A |  |
| 228 | Les en-têtes envoyés par le serveur contiennent les informations relatives au jeu de caractères employé. | A |  |
| 229 | Les feuilles de style internes sont minifiées. | A |  |
| 230 | Les scripts internes sont minifiés. | A |  |

## Structure et code (231–245)

| N° | Règle | Tri | Raison ou piste |
|---|---|---|---|
| 231 | La date de publication ou de mise à jour des contenus est mise à disposition sous forme programmatique. | A | Piste : confirmé dans le code : aucune balise `<time datetime>` |
| 232 | Le code source de chaque page contient une métadonnée qui définit le jeu de caractères. | A |  |
| 233 | Le codage de caractères utilisé est UTF-8. | A |  |
| 234 | Le contenu de chaque page est organisé selon une structure de titres et sous-titres hiérarchisée. | A | Indice favorable : un `<h1>` par page, puis `<h2>`/`<h3>` |
| 235 | Les éléments visuellement présentés sous forme de liste sont balisés de façon appropriée dans le code source. | A | Indice favorable : listes balisées en `<ul>`/`<li>` |
| 236 | Chaque identifiant HTML n'est utilisé qu'une seule fois par page. | A |  |
| 237 | La copie de contenu n’est pas bloquée. | A |  |
| 238 | L'accès au menu contextuel n’est pas bloqué. | A |  |
| 239 | Aucune redirection ou rafraîchissement automatique côté client n’est imposée. | A |  |
| 240 | Le texte des documents PDF internes est sélectionnable. | NA | aucun document PDF |
| 241 | Les documents PDF internes sont dotés d'une structure de titres. | NA | aucun document PDF |
| 242 | Les cellules des tableaux de données sont reliées à leurs en-têtes. | NA | aucun tableau |
| 243 | Les titres des tableaux de données sont renseignés. | NA | aucun tableau |
| 244 | La linéarisation des tableaux utilisés pour la mise en page ne nuit pas à la compréhension des contenus. | NA | aucun tableau |
| 245 | Les tableaux de données ne sont pas simulés. | A |  |
