# 0029 — Politique de confidentialité minimale, responsable nommé par variable de build

Date : 2026-11-02
Statut : acceptée

## Contexte

L'ADR 0027 retient l'option C : éditeur anonyme sur les mentions légales,
responsable du traitement nommé dans la politique de confidentialité. Il
reporte cette politique à #39, « avant toute création de compte », et conclut
que « tant que #39 n'est pas livrée, aucune donnée personnelle n'est
collectée ».

Cette conséquence n'est plus vraie. Deux traitements existent déjà :

- la mesure d'audience (#62, ADR 0028) : Cloudflare reçoit l'adresse IP et le
  navigateur des visiteurs, en sous-traitant ;
- les échanges avec les organisateurs (#45) : adresses e-mail conservées 3 ans
  après le dernier message.

L'hébergeur traite en outre des données techniques de connexion. Le RGPD
(art. 13.1 a) impose d'identifier le responsable du traitement dès qu'il y a
collecte (#72).

## Options

- **A. Attendre #39**, comme prévu par l'ADR 0027. Laisse deux traitements
  sans responsable identifié ni information des personnes.
- **B. Politique minimale maintenant**, qui couvre les traitements existants,
  complétée par #39 pour les comptes et les propositions.
- **C. Écrire le nom du responsable dans le dépôt.** Le dépôt est public : le
  nom y serait publié de façon durable, y compris dans l'historique, même
  retiré ensuite.

## Décision

Option B, avec le nom du responsable hors du dépôt.

- Une page « Politique de confidentialité », en fr et en en, à
  `/{locale}/privacy/`, liée depuis le pied de page de chaque page et depuis
  les mentions légales.
- Le nom du responsable vient de la variable de build
  `PUBLIC_DATA_CONTROLLER_NAME` (variable du Worker, comme
  `PUBLIC_CF_BEACON_TOKEN`). Elle est vide en local, avec un texte de
  remplacement. Le nom n'est écrit nulle part dans le dépôt, ni dans le code,
  ni dans les libellés, ni dans la documentation.
- Pour chaque traitement (données techniques de l'hébergeur, mesure
  d'audience, échanges avec les organisateurs) : finalité, base légale,
  données, durée de conservation, destinataires, transferts hors UE. Les
  droits (accès, rectification, effacement, limitation, opposition) et la
  réclamation auprès de la CNIL y figurent.
- Base légale des trois traitements : l'intérêt légitime (art. 6.1 f). Le
  bouton d'opposition à la mesure d'audience reste sur les mentions légales
  (ADR 0028) ; la politique y renvoie.
- La page porte `<meta name="robots" content="noindex">` et est exclue du
  sitemap : c'est une page d'information du visiteur, pas une page à référencer.
- Les mentions légales gardent l'éditeur anonyme (LCEN art. 1-1, II) et
  renvoient vers la politique.

## Conséquences

- **Révision de l'ADR 0027.** La conséquence « aucune donnée personnelle avant
  #39 » est remplacée par : des données personnelles sont traitées dès #62 et
  #45, et la politique les décrit. #39 complétera la page pour les comptes et
  les propositions. Le reste de l'ADR 0027 (option C, hébergeur publié,
  condition de l'anonymat) est inchangé.
- Le nom du responsable est publié dans le HTML construit : c'est voulu (art.
  13.1 a), mais il n'est lisible que sur le site, pas dans le dépôt. Si la
  variable est absente au build, la page affiche le texte de remplacement : à
  vérifier avant chaque mise en ligne, car elle n'identifie alors personne.
- Un nouveau traitement de données personnelles s'ajoute à la page dans la
  même PR que la fonctionnalité.
- Les durées de l'hébergeur et de Cloudflare ne sont pas maîtrisées par
  O-Fests (voir le risque accepté de l'ADR 0028) ; la page le dit.
- Le texte est à faire relire par un juriste si possible (ADR 0027).
