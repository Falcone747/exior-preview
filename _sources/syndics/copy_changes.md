# Changelog de la relecture sévère : copy_syndics.md et rapport offert

Date : 27/11/2026. Version précédente conservée dans `_old/` (copy_syndics_v1.md, rapport_index_v1.html, rapport_v1.pdf). Nouvelle version : `copy_syndics.md` (section 5 = texte à publier) et `rapport/index.html` + `rapport/rapport-systeme-ia-souverain-syndic.pdf` (14 pages, re-rendu, sommaire vérifié page par page).

Principes appliqués : chaque affirmation doit être vérifiable ou supprimée ; aucune formule qui pourrait être signée par un concurrent ; une idée par section ; cohérence stricte des prix (690 € TTC, 990 € HT, 2 990 € HT puis 990 € HT par mois sur 6 mois, 9 900 € HT) ; aucun mot interdit (contrôle par grep : RGPD, hébergement UE, exior.io, recette, LL Gestion, Grok, xAI, GTA, Rockstar, chatbot, OTIS : aucun dans le texte publiable) ; typographie française.

## A. Changements transversaux

| Sujet | Avant | Après |
|---|---|---|
| Typographie | Espaces simples avant `: ; ? ! »`, après `«`, dans les montants (`2 990 € HT`), apostrophes droites | Espaces insécables U+00A0 partout (`2 990 € HT`, `21 jours`, `« … »`, `n° 8841`), apostrophes typographiques ’ comme sur le site live |
| Crochets | `[À CONFIRMER]` / `[À FOURNIR]` / variantes entre crochets dans le texte à publier (risque d’affichage) | Aucun crochet dans la section 5. Les décisions en attente sont uniquement en §7 |
| Listes « titre — ligne » | Tirets cadratins dans les 16 cartes agents | Tableau « Titre \| Ligne d’état » (aucun tiret cadratin dans le texte publiable) |
| Lieu d’hébergement | Le hero disait « Le système tourne en France, chez OVHcloud », la section souveraineté proposait aussi un serveur local : contradiction | Partout : « sur votre serveur ou en France, chez OVHcloud » |
| Données et fournisseur d’IA | « ne partent pas chez un fournisseur d’IA tiers » (or OVHcloud AI Endpoints est lui-même un fournisseur) | « ne sont envoyées à aucun autre fournisseur d’IA » (page, FAQ 1, rapport p. 7) |
| Guide vs Espace EXIOR | Le guide était « inclus dans l’Espace EXIOR » (deux produits confondus) | Séparés : l’Espace EXIOR = application du cabinet (clé en main) ; le guide = espace sécurisé payant. L’encart « inclus » est supprimé |
| Prix | « 11 880 € » sans HT ; budgets du devis en tranches (3 000 €…) | « 11 880 € HT (12 × 990 €) » ; champ budget supprimé |
| Fixed counts | « 14 messages », « AG dans 34 jours », « compte 615 » dans les démos | Supprimés : les démos ne portent plus de chiffres décoratifs |
| Résidences de démo | Les Ormes, Les Tilleuls et « 12 rue Pasteur » mélangées | Une seule résidence de démo : Résidence Les Ormes |

## B. Page de vente, section par section

### Fiche faits (interne)
| Avant | Après |
|---|---|
| Mécanisme 3 : infrastructure dédiée chez OVHcloud uniquement | Serveur du cabinet ou OVHcloud ; modèles installés localement ou via AI Endpoints |
| Mécanisme 9 : « + guide sécurisé » intégré à l’Espace EXIOR | Guide = produit distinct dans un espace sécurisé séparé |
| « Lien Stripe à créer » | Lien créé : https://buy.stripe.com/14AaEW37yfrt3Nxaxn7IY0a |
| Décisions : (a) (b) (c) | Ajout (d) guide offert ou déduit ? (e) durée d’accès et mises à jour du guide ? |

### 1. Héros
| Élément | Avant | Après |
|---|---|---|
| Eyebrow | Pour les cabinets de syndic de copropriété (redite du H1) | EXIOR pour les syndics |
| H1 | inchangé (retenu après notation) | inchangé |
| Sous-titre | « installe dans votre cabinet des agents experts connectés … à vos banques » ; 3 phrases dont « Votre système tourne en France, chez OVHcloud. » | « EXIOR installe des agents experts connectés … à vos relevés bancaires. … Votre équipe valide chaque action. Le système tourne sur votre serveur ou en France, chez OVHcloud. » (« banques » surpromettait : l’accès est en lecture seule sur des relevés ; « dans votre cabinet » supprimé) |
| Sous les boutons | « Accès au guide envoyé automatiquement après le paiement. Architecture à 990 € HT et clé en main à prix fixe pour aller plus loin. » | « Lien et code d’accès affichés dès la confirmation du paiement. Architecture et clé en main à prix fixe, détaillés plus bas. » (l’envoi par e-mail n’était pas garanti ; le prix n’est plus répété) |
| Fil d’activité | « 14 messages classés », « Facture ascenseur imputée », « Convocation Résidence Les Tilleuls », « Relance devis étanchéité » | « messages du matin classés par copropriété », « facture d’ascenseur imputée », « convocation de la Résidence Les Ormes préparée », « relance du devis d’étanchéité » |
| Question / réponse | « Où en est la copropriété 12 rue Pasteur ? » / « 2 factures à valider, 1 sinistre ouvert, AG dans 34 jours. Convocation prête pour relecture. » | « Où en est la Résidence Les Ormes ? » / « Deux factures à valider, un sinistre ouvert, convocation d’AG prête pour relecture. » |

### 2. Constat
| Élément | Avant | Après |
|---|---|---|
| Sous-titre | « Tout arrive par écrit, sans ordre » | « Presque tout arrive par écrit et sans ordre » (le téléphone existe) |
| Carte 1 | « Les classer par immeuble prend la première heure de la journée. » (durée inventée) | « Avant de traiter, il faut trier. » |
| Carte 2 | « Convocation d’AG au moins 21 jours avant la réunion, notification du procès-verbal, budget voté, clôture des comptes. Chaque retard se voit en assemblée. » | « Convocation d’AG notifiée au moins 21 jours avant la réunion, deux mois pour contester une décision après la notification du procès-verbal, clôture des comptes de chaque syndicat. Le calendrier ne s’adapte pas à la charge du cabinet. » (art. 9 décret 1967 ; art. 42 loi 1965) |
| Carte 3 | « Recruter prend des mois. Les profils … sont recherchés » (affirmation de marché non sourcée) | « Les habitudes partent avec les gens. Quand un gestionnaire s’absente ou quitte le cabinet, son portefeuille perd son suivi et ses réflexes. » |

### 3. Démo
| Avant | Après |
|---|---|
| « Facture OTIS n° 8841 » (vraie marque) | « Facture n° 8841 d’Ascenseurs Dupont » (fictif) |
| « compte 615 » | supprimé (numéro de compte non vérifié) |
| Citations sans ponctuation finale cohérente | « Fuite au plafond de ma salle de bain, appartement 3B. » ; « Pourquoi mon appel de fonds a-t-il augmenté ? » (grammaire) |
| « Comparatif avec les 2 autres devis » | « les deux autres devis » |
| Sous-titre « vérifie l’historique dans votre logiciel » | « consulte l’historique » (le logiciel n’est pas toujours lisible) |
| Note de développeur « remplacer OTIS » | supprimée (déjà fait) |

### 4. Agents
| Avant | Après |
|---|---|
| Titre « Un agent pour chaque processus » + sous-titre « Ils suivent l’organisation… » (sujet pluriel sans antécédent) | « Chaque agent suit un processus du syndic … Il n’accède qu’aux données de son processus. » |
| « comptabilité des mandants » | « comptabilité des syndicats » (mot du métier côté client) |
| Direction : « chaque matin » | « à l’ouverture de la journée » |
| « Gestion courante : suivies jusqu’à la clôture » | « jusqu’à leur clôture » |

### 5. Connecteurs
| Avant | Après |
|---|---|
| Deux modes de connexion cités (API, fichiers) | Trois modes, comme dans le guide (ajout : opérateur sous contrôle de l’équipe) |
| « Logiciels courants du marché, par exemple Vilogi, ICS, Septeo ou Powimo : le mode de connexion est confirmé… » | « Vilogi, ICS, Septeo, Powimo : le mode de connexion de votre logiciel est établi dans votre dossier d’architecture. Marques citées à titre d’exemple, propriétés de leurs éditeurs respectifs. » (mention nominative, plus d’allusion à une compatibilité acquise) |

### 6. Architecture
| Avant | Après |
|---|---|
| Colonne 4 : « Logiciel de copropriété : écriture, courrier, mail envoyé ; journal » (le journal n’est pas dans le logiciel) | « Sorties : logiciel de copropriété, courrier, mail. Journal de chaque action. » |
| « Un collaborateur valide » | « Un collaborateur habilité valide » |

### 7. Espace EXIOR
| Avant | Après |
|---|---|
| « Valider, corriger ou refuser prend un clic. » (formule d’effort bannie) | « … se fait depuis la même fiche. » |
| Chat AG : « Elle est prête. L’envoi attend votre validation, 21 jours au moins avant la réunion. » (ambigu) | « Elle est prête. Elle doit être notifiée au moins 21 jours avant la réunion : l’envoi attend votre validation. » |
| Encart « Le guide … est inclus dans l’Espace EXIOR » | supprimé (voir A) ; mention « Démonstration, données fictives » ajoutée |

### 7 bis. Guide
| Avant | Après |
|---|---|
| Titre « Tout ce qu’un dirigeant de syndic doit savoir pour avoir son système IA souverain. » (« tout » invérifiable) | « Le guide pour mettre en place le système IA souverain de votre cabinet. » |
| « Après la lecture, vous savez ce qu’est un agent, un harness… » | « Vous y trouvez ce qu’est un agent, ce qu’est le harness qui l’encadre, ce que veut dire le moindre privilège et comment fonctionne un modèle ouvert, appliqués à vos AG, à vos appels de fonds et à vos sinistres. » (promesse de résultat → contenu vérifiable ; harness expliqué) |
| Microcopy « Accès envoyé automatiquement après le paiement. » | « Paiement unique. Lien et code d’accès affichés dès la confirmation du paiement. » |

### 8. Souveraineté
| Avant | Après |
|---|---|
| Titre : « … sur votre serveur ou sur une infrastructure dédiée en France. » | virgule : « … sur une infrastructure dédiée, en France. » (le « en France » ne qualifie pas le serveur du cabinet) |
| Sous-titre en fragments (« Deux options. En local, … Ou chez OVHcloud… ») | Une phrase : « Deux options : un serveur dans vos locaux, ou une infrastructure dédiée chez OVHcloud, en France, … » |
| Carte 3 : « Les fonds des copropriétés restent… » | « Les fonds des syndicats restent… » (les fonds appartiennent au syndicat) |
| « vous gérez l’électricité et la sauvegarde physique » | « Vous fournissez le matériel et son environnement (alimentation, sauvegarde physique). » |

### 9. Mise en place
| Avant | Après |
|---|---|
| Titre « Votre système est en service en quatre semaines après l’architecture » avec note de confirmation | Titre neutre retenu : « Votre système se met en place par étapes, en lecture seule d’abord. » (la durée n’est pas un engagement décidé) |
| « Nous cartographions » | « EXIOR cartographie » (voix de marque constante) |
| « Un processus ouvre quand il les remplit. » | « Un processus n’ouvre que lorsqu’il les remplit. » |

### 10. Offre
| Élément | Avant | Après |
|---|---|---|
| Titre | « Choisissez votre point de départ, jusqu’au système clé en main. » (syntaxe bancale) | « Du guide au système clé en main, choisissez votre point de départ. » |
| Sous-titre | « Chaque étape est utilisable seule. » | « Chaque offre s’achète seule. » |
| Guide, microcopy | « Accès personnel au guide en ligne, mises à jour comprises. » (engagement non décidé, et le code est partagé) | « Paiement unique, sans abonnement. » |
| Guide, puces | « … tout expliqué pour un dirigeant » ; « … à reprendre » | « … expliqués à un dirigeant » ; « Fiches processus, critères d’acceptation et checklist de décision » |
| Architecture | puce « Guide inclus » (non décidé, annule l’intérêt du guide à 690 €) | supprimée |
| Architecture, microcopy | « Le dossier vous appartient, que vous poursuiviez avec EXIOR ou non. » | « Un dossier complet, utilisable avec ou sans EXIOR. » (plus de formulation juridique de propriété) |
| Clé en main | « Tout le contenu de l’architecture et le guide » | « Le contenu de l’architecture » (guide retiré, décision en attente) |
| Clé en main, exploitation | « mises à jour réglementaires, nouveaux agents » (engagements ouverts) | « mise à jour des règles, évolution des agents » |
| Clé en main, microcopy | « Engagement de 6 mois sur l’exploitation. » | + « Frais d’infrastructure précisés dans votre devis. » (évite une surprise de facturation) |
| Note annuelle | « 9 900 € HT … au lieu de 11 880 €, payable à la mise en service » | « 9 900 € HT pour 12 mois au lieu de 11 880 € HT (12 × 990 €), à régler à la mise en service. » |

### 10 bis. Devis
| Avant | Après |
|---|---|
| Champ « Budget envisagé (Moins de 3 000 € HT / 3 000 à 10 000 € HT / Plus de 10 000 € HT / À définir) » dans l’onglet B | Supprimé, remplacé par « Échéance souhaitée » (les tranches ancraient un budget sous 3 000 € et ajoutaient des montants hors offre) |
| Logiciel : « … / Lockimmo / Autre » | « Vilogi / ICS / Septeo / Powimo / Autre » (nom non vérifié retiré) |
| Cases « Clôture » | « Clôture d’exercice » (cohérent avec la carte agent) |
| « Vos réponses servent uniquement à préparer votre devis. » | « Vos réponses servent à préparer votre devis. » (« uniquement » = engagement juridique non vérifié) |
| Confirmation « Votre demande est prête dans votre messagerie : envoyez-la… » + variante entre crochets | « Merci. Votre e-mail est prêt dans votre messagerie : envoyez-le, EXIOR vous répond par écrit avec un devis détaillé. » |

### 10 ter. Rapport
| Avant | Après |
|---|---|
| Titre « Le rapport « Système IA souverain pour syndic de copropriété », offert. » | « Le rapport offert pour comprendre le système IA souverain d’un cabinet de syndic. » |
| Sous-titre « 14 pages pour comprendre … » | « 14 pages : ce qu’un agent prépare, comment votre équipe le contrôle, où tournent vos données. » |

### 11. FAQ
| Avant | Après |
|---|---|
| 11 questions, numérotées 1-8, 10, 11, 9 | 13 questions, numérotées 1 à 13 dans l’ordre de lecture : données, contrôle, fiabilité, API, responsabilité, profil, offres, exploitation, délai, architecture, fin d’engagement, accès, guide |
| Absentes | Nouvelles : « Quelle différence entre le guide, l’architecture et le clé en main ? » ; « Que comprend l’exploitation mensuelle ? » (objections de prix et de périmètre) |
| Q3 « Où sont nos données ? … pas envoyées à un fournisseur d’IA tiers » | passée en Q1 ; « …à aucun autre fournisseur d’IA » |
| Q6 « Votre équipe utilise l’Espace EXIOR et le guide pour comprendre » | « Votre équipe utilise l’Espace EXIOR au quotidien. » |
| Accès au guide : « la page de confirmation affiche votre lien et votre code d’accès, et un e-mail les reprend. [selon le niveau d’automatisation…] » | « la page de confirmation affiche le lien de l’espace et votre code d’accès. Conservez-les : ils vous permettent de revenir quand vous voulez. » (l’e-mail n’est pas garanti) |
| Fin d’engagement : variante entre crochets | texte propre ; la promesse « formats ouverts » reste à valider (voir §D) |

### 12. CTA final
| Avant | Après |
|---|---|
| « Votre système IA souverain commence par le guide. » | « Mettez en place le système IA souverain de votre cabinet. » |
| « Plus de 100 chapitres pour comprendre, décider et déployer, puis l’architecture ou le clé en main quand vous êtes prêt. » | « Lisez d’abord le guide, puis passez à l’architecture ou au clé en main quand vous êtes prêt. » |
| « Accès envoyé automatiquement après le paiement. » | « Lien et code d’accès affichés dès la confirmation du paiement. » |

## C. Rapport offert (HTML + PDF, 14 pages)

| Page | Avant | Après |
|---|---|---|
| 3 | « mais il ne demande pas l’expertise du gestionnaire » | « mais il n’exploite pas l’expertise du gestionnaire » |
| 3 | « Le premier se confie à des programmes de calcul. Le second se confie, depuis peu, à des modèles de langage. » (répétition) | « Le premier relève de programmes de calcul. Le second relève, depuis peu, de modèles de langage. » |
| 3 | « convocation notifiée au moins 21 jours avant, sauf exceptions prévues par les textes » | « … sauf urgence ou délai plus long prévu par le règlement de copropriété » (formulation de l’art. 9) |
| 3 | « Le chapitre 11 explique comment. » | « La section 11 explique comment. » (le rapport n’a pas de chapitres) |
| 4 | « Il ne s’agit ni d’un robot ni d’une fenêtre de discussion. » (négation en contraste) | supprimée |
| 4 | « Un orchestrateur répartit le travail entre eux. » (jargon) | « Un orchestrateur, le programme qui répartit le travail, les coordonne. » |
| 7 | « Beaucoup d’outils grand public fonctionnent en envoyant … » | « Avec un outil d’IA grand public, vos textes partent en général sur les serveurs de son éditeur … » |
| 7 | « pas envoyées à un fournisseur d’IA tiers » | « envoyées à aucun autre fournisseur d’IA » |
| 7 | Tableau Continuité : « Dépend de vos locaux » / « Infrastructure d’un hébergeur » (vague) | « Dépend de votre installation : alimentation, réseau, sauvegardes » / « Assurée par l’hébergeur, selon son contrat de service » |
| 8 | « Avec un modèle fermé, vous envoyez vos données à l’éditeur » | « … vous envoyez en général … » |
| 8 | « appelés à la demande, avec une facturation à l’usage » (conditions OVHcloud non vérifiées) | « appelés à la demande » |
| 11 | « rendent un système IA acceptable pour un syndic » | « encadrent un système IA dans un cabinet de syndic » |
| 13 | Encadré « Durée réaliste : Le cadrage se fait en quelques jours si les accès sont prêts. » (délai inventé) | « Une règle de méthode : … mieux vaut un processus bien ouvert que cinq à moitié. » |
| 14 | Guide : « Accès envoyé après le paiement. » | « Lien et code d’accès affichés dès la confirmation du paiement. » |
| 14 | Clé en main : sans mention des frais d’infrastructure | « Engagement de 6 mois sur l’exploitation. Frais d’infrastructure précisés dans le devis. » |
| 14 | « Exploitation annuelle prépayée possible : 9 900 € HT pour 12 mois. » | « … au lieu de 11 880 € HT. » + ligne « Tarifs : guide en TTC, architecture et clé en main en HT. » |
| Toutes | Espaces simples, apostrophes droites | Espaces insécables, apostrophes ’ |

Vérifié après re-rendu : 14 pages, sommaire exact (sections 1 à 12 en pages 3 à 14), aucun débordement.

## D. À décider par Guillaume (non affirmés sur la page)
1. Le guide (690 € TTC) est-il offert ou déduit à la signature de l’architecture ou du clé en main ? (retiré des cartes en attendant).
2. Frais OVHcloud : inclus dans les 990 € HT par mois ou facturés ? (la page dit « précisés dans votre devis »).
3. Durée d’accès au guide et mises à jour : à fixer dans les CGV avant toute promesse.
4. Restitution en fin de contrat (« formats ouverts », FAQ 11 et guide) : à confirmer.
5. TVA : le lien Stripe 690 € est un montant fixe ; « TTC » suppose que la TVA est incluse. À vérifier avec l’activité réelle (franchise ou non).
6. Guide du site : plusieurs chapitres disent « aucun fournisseur d’IA tiers ». OVHcloud AI Endpoints étant un fournisseur, la formule exacte est « aucun autre fournisseur d’IA » : correction possible par recherche et remplacement dans `guide/`.

## E. Pour le développeur (agent déjà lancé sur la branche `syndics-sources`)
Remplacer `_sources/syndics/copy_syndics.md` par la nouvelle version, et appliquer : suppression du champ budget du devis, 13 questions de FAQ, guide retiré des cartes architecture / clé en main, titre de « Mise en place » neutre, séparation guide / Espace EXIOR, espaces insécables conservés, `brief_cloud_agent.md` mis à jour.
