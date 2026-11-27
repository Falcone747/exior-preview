# Votre système IA souverain : guide complet pour les cabinets de syndic de copropriété

Guide EXIOR réservé aux membres. 10 parties, 112 chapitres. Chaque chapitre est un fichier Markdown `NN-partie/NN-chapitre.md` (titre H1 = titre ci-dessous, 400 à 900 mots, règles dans `STYLE.md`).

Statut : 112/112 chapitres écrits ✅ · environ 73 000 mots (vérification de cohérence du 27/11/2026 : numérotation, titres, liens internes, encadrés, mots interdits).

## Partie 1 — Comprendre le système IA souverain (`01-comprendre/`)
1. ✅ `01-comprendre/01-systeme-ia-souverain.md` — Ce que signifie un système IA souverain pour un cabinet de syndic : lieu d'exécution (France, OVHcloud), contrôle des droits, réversibilité.
2. ✅ `01-comprendre/02-pourquoi-le-syndic.md` — Pourquoi le métier de syndic se prête à des agents encadrés : règles écrites + entrées désordonnées.
3. ✅ `01-comprendre/03-cadre-legal-1965-1967.md` — Le cadre légal de base : loi du 10 juillet 1965 et décret du 17 mars 1967.
4. ✅ `01-comprendre/04-hoguet-fonds-mandants.md` — Loi Hoguet, carte professionnelle et fonds des mandants : pourquoi les agents n'ont aucun droit de paiement.
5. ✅ `01-comprendre/05-alur-elan-extranet.md` — ALUR, ELAN, ordonnance 2019 : contrat type, extranet, compte séparé, fonds de travaux, immatriculation, plan pluriannuel.
6. ✅ `01-comprendre/06-vocabulaire-ia.md` — Le vocabulaire IA indispensable : modèle de langage, poids ouverts, inférence, contexte, embeddings, RAG, agent, outil, harness, orchestrateur.
7. ✅ `01-comprendre/07-vocabulaire-copropriete.md` — Le vocabulaire des logiciels de copropriété : lots, tantièmes, clés de répartition, budget prévisionnel, appels de fonds, exercice, annexes comptables, état daté.
8. ✅ `01-comprendre/08-agent-ce-quil-fait.md` — Ce qu'un agent fait et ne fait pas : lire, classer, préparer, proposer ; jamais décider, payer ou envoyer seul.
9. ✅ `01-comprendre/09-trois-modes-interfacage.md` — Les trois modes d'interfaçage avec un logiciel : API, import/export de fichiers, opérateur sous contrôle humain.
10. ✅ `01-comprendre/10-principes-non-negociables.md` — Les principes non négociables : validation humaine bloquante, zéro paiement, moindre privilège, journal, calculs déterministes, réversibilité.

## Partie 2 — Cartographier son cabinet (`02-cartographier/`)
1. ✅ `02-cartographier/01-methode-cartographie.md` — Méthode de cartographie des processus d'un cabinet : entretiens, observation, pièces réelles.
2. ✅ `02-cartographier/02-inventaire-outils.md` — Inventaire des outils : logiciel de copropriété, banques, messageries, GED, extranet, téléphonie, tableurs, signature.
3. ✅ `02-cartographier/03-inventaire-donnees.md` — Inventaire des données et niveau de sensibilité : identité, coordonnées bancaires, santé (handicap, sinistres), comptes des syndicats.
4. ✅ `02-cartographier/04-mesurer-volumes.md` — Mesurer ses volumes sans les deviner : comment compter mails, factures, demandes et AG sur une période témoin.
5. ✅ `02-cartographier/05-goulots.md` — Repérer les goulots d'étranglement : files d'attente, ressaisies, allers-retours, périodes de pointe.
6. ✅ `02-cartographier/06-regles-vs-jugement.md` — La matrice règles / jugement : ce qui relève du calcul, de la lecture, de l'arbitrage du gestionnaire.
7. ✅ `02-cartographier/07-roles-du-cabinet.md` — Les rôles du cabinet et leurs habilitations : dirigeant, gestionnaire, assistant, comptable, service sinistres.
8. ✅ `02-cartographier/08-calendrier-annuel.md` — Le calendrier annuel d'un syndic : saison des AG, clôtures, appels trimestriels, contrats, échéances réglementaires.
9. ✅ `02-cartographier/09-prioriser-flux.md` — Prioriser les flux à confier aux agents : impact, risque, facilité de connexion.
10. ✅ `02-cartographier/10-fiche-processus.md` — Rédiger une fiche processus exploitable : déclencheur, entrées, règles, sorties, validation, exceptions.
11. ✅ `02-cartographier/11-dossier-architecture.md` — Le document d'architecture interne : contenu, livrables, critères d'acceptation, ce qu'il permet de décider.

## Partie 3 — L'architecture technique souveraine (`03-architecture/`)
1. ✅ `03-architecture/01-vue-ensemble-couches.md` — Vue d'ensemble : entrées, agents et mémoire, validation, logiciel officiel, journal.
2. ✅ `03-architecture/02-local-ou-serveur.md` — Local, serveur dédié ou cloud français : critères de choix pour un cabinet.
3. ✅ `03-architecture/03-ovhcloud-france.md` — L'infrastructure chez OVHcloud en France : ce que cela couvre concrètement, ce que cela ne couvre pas.
4. ✅ `03-architecture/04-ai-endpoints-open-weights.md` — Les modèles ouverts via OVHcloud AI Endpoints (par exemple Mistral) : principe, avantages, limites.
5. ✅ `03-architecture/05-taille-des-modeles.md` — Choisir la taille des modèles : petits modèles pour l'extraction, modèles plus grands pour les cas difficiles.
6. ✅ `03-architecture/06-deterministe-vs-llm.md` — Moteurs déterministes et modèle de langage : qui calcule, qui lit, qui rédige.
7. ✅ `03-architecture/07-memoire-metier.md` — La mémoire métier : référentiel des copropriétés, lots, tantièmes, clés, contrats, règles validées.
8. ✅ `03-architecture/08-harness.md` — Le harness d'un agent : boucle, outils, mémoire, garde-fous, validation, pourquoi il est indispensable en production.
9. ✅ `03-architecture/09-orchestrateur-agents.md` — L'orchestrateur et les agents spécialisés : répartition du travail, escalade, files.
10. ✅ `03-architecture/10-sorties-structurees.md` — Sorties structurées et contrôles : schémas, seuils de confiance, champs « à vérifier ».
11. ✅ `03-architecture/11-journal-audit.md` — Le journal d'audit : ce qu'on enregistre, comment le consulter, combien de temps le garder.
12. ✅ `03-architecture/12-isolation-cabinet.md` — Isolation des données : un environnement par cabinet, séparation par copropriété.
13. ✅ `03-architecture/13-couts-infrastructure.md` — Estimer les coûts d'infrastructure et d'inférence : méthode, sans chiffres inventés.

## Partie 4 — Connecter les outils du cabinet (`04-connecteurs/`)
1. ✅ `04-connecteurs/01-logiciel-copropriete.md` — Connecter le logiciel de copropriété (Vilogi, ICS, Septeo, Powimo…) : principes et questions à poser à l'éditeur.
2. ✅ `04-connecteurs/02-sans-api.md` — Quand l'éditeur n'ouvre pas d'API : imports, exports, opérateur sous contrôle.
3. ✅ `04-connecteurs/03-messagerie.md` — Connecter les boîtes mail (Microsoft 365, Google Workspace, IMAP) : boîtes partagées, règles, pièces jointes.
4. ✅ `04-connecteurs/04-banque.md` — Connecter la banque en lecture seule : relevés, formats de fichiers, avis de virement.
5. ✅ `04-connecteurs/05-ged-documents.md` — GED et documents : classement par copropriété, nommage, versions.
6. ✅ `04-connecteurs/06-extranet.md` — L'extranet copropriétaires : lire ce qui est publié, préparer les publications.
7. ✅ `04-connecteurs/07-telephonie.md` — Téléphonie et comptes rendus d'appels : rattacher les appels aux dossiers.
8. ✅ `04-connecteurs/08-recommande-electronique.md` — Lettre recommandée électronique et courrier : préparer, faire valider, suivre les preuves.
9. ✅ `04-connecteurs/09-tableurs.md` — Tableurs et fichiers Excel du cabinet : les intégrer sans les casser.
10. ✅ `04-connecteurs/10-comptes-techniques.md` — Comptes techniques, droits et secrets par connecteur.
11. ✅ `04-connecteurs/11-tester-lecture-seule.md` — Tester un connecteur en lecture seule : protocole et critères.

## Partie 5 — Les agents du cabinet, processus par processus (`05-agents/`)
1. ✅ `05-agents/01-accueil-boite-mail.md` — Agent accueil et boîte mail : tri par copropriété, lot, sujet, urgence.
2. ✅ `05-agents/02-relation-coproprietaires.md` — Agent relation copropriétaires : réponses préparées avec pièces.
3. ✅ `05-agents/03-gestion-courante.md` — Agent gestion courante : demandes d'intervention, suivi jusqu'à clôture.
4. ✅ `05-agents/04-prestataires-contrats.md` — Agent prestataires et contrats : échéances, attestations, mise en concurrence.
5. ✅ `05-agents/05-sinistres.md` — Agent sinistres : déclaration, pièces, conventions entre assureurs, relances.
6. ✅ `05-agents/06-travaux.md` — Agent travaux : devis comparés, ordres de service, suivi de chantier, réception.
7. ✅ `05-agents/07-preparation-ag.md` — Agent préparation d'AG : ordre du jour, majorités, pièces jointes, convocation 21 jours avant.
8. ✅ `05-agents/08-tenue-ag.md` — Agent tenue d'AG : feuille de présence, pouvoirs, vote par correspondance, visioconférence, procès-verbal.
9. ✅ `05-agents/09-apres-ag.md` — Agent après l'AG : notification du PV, délai de contestation, exécution des décisions.
10. ✅ `05-agents/10-conseil-syndical.md` — Agent conseil syndical : préparation des réunions, contrôle des comptes, délégations.
11. ✅ `05-agents/11-factures-fournisseurs.md` — Agent factures fournisseurs : imputation par copropriété et clé, doublons, TVA.
12. ✅ `05-agents/12-banque-rapprochement.md` — Agent banque et rapprochement : opérations, virements non identifiés.
13. ✅ `05-agents/13-appels-de-fonds.md` — Agent appels de fonds : budget voté, tantièmes, fonds de travaux, appels trimestriels.
14. ✅ `05-agents/14-recouvrement-amiable.md` — Agent recouvrement amiable : vérification du contexte, paliers, limites.
15. ✅ `05-agents/15-mutations-etat-date.md` — Agent mutations : pré-état daté, état daté, échanges avec les notaires.
16. ✅ `05-agents/16-cloture-exercice.md` — Agent clôture d'exercice : contrôles, annexes comptables, écarts budget/réalisé.
17. ✅ `05-agents/17-conformite.md` — Agent conformité : immatriculation, fiche synthétique, plan pluriannuel, diagnostics.
18. ✅ `05-agents/18-veille-reglementaire.md` — Agent veille réglementaire : textes nouveaux, impact, mise à jour des règles.
19. ✅ `05-agents/19-direction.md` — Agent direction : état du portefeuille, points bloquants, charge par gestionnaire.

## Partie 6 — L'Espace EXIOR (`06-espace-exior/`)
1. ✅ `06-espace-exior/01-role-espace.md` — Le rôle de l'Espace EXIOR dans le cabinet.
2. ✅ `06-espace-exior/02-file-validation.md` — La file de validation : priorités, affectation, délais.
3. ✅ `06-espace-exior/03-fiche-action.md` — La fiche action : pièce source, justification, contrôles, incertitudes.
4. ✅ `06-espace-exior/04-vue-copropriete.md` — La vue par copropriété : tout ce qui est en cours sur un immeuble.
5. ✅ `06-espace-exior/05-journal-consultable.md` — Le journal consultable : retrouver qui a décidé quoi.
6. ✅ `06-espace-exior/06-droits-collaborateurs.md` — Les droits par collaborateur et par type d'action.
7. ✅ `06-espace-exior/07-mobile-notifications.md` — Mobile et notifications : valider en déplacement sans perdre le contrôle.
8. ✅ `06-espace-exior/08-parametrer-regles.md` — Paramétrer ses règles : seuils, paliers, modèles de courriers.

## Partie 7 — Sécurité et gouvernance (`07-securite/`)
1. ✅ `07-securite/01-modele-de-menace.md` — Le modèle de menace d'un cabinet de syndic : fraude au faux RIB, usurpation, fuite, erreur.
2. ✅ `07-securite/02-moindre-privilege.md` — Le moindre privilège appliqué à chaque agent.
3. ✅ `07-securite/03-masquage-donnees.md` — Masquer les données sensibles avant traitement.
4. ✅ `07-securite/04-injection-prompt.md` — Les instructions cachées dans les mails et pièces jointes (injection de prompt).
5. ✅ `07-securite/05-red-team.md` — Éprouver le système avant ouverture : tentatives de détournement.
6. ✅ `07-securite/06-secrets.md` — Gestion des secrets et des accès techniques.
7. ✅ `07-securite/07-sauvegardes-reversibilite.md` — Sauvegardes, restauration et réversibilité.
8. ✅ `07-securite/08-donnees-personnelles.md` — Protection des données personnelles des copropriétaires : principes et documentation.
9. ✅ `07-securite/09-charte-usage.md` — La charte d'usage interne de l'IA.
10. ✅ `07-securite/10-responsabilite.md` — Responsabilité : le cabinet reste responsable, comment la documenter.
11. ✅ `07-securite/11-incident.md` — Gérer un incident : détection, arrêt, analyse, correction.

## Partie 8 — Déployer (`08-deployer/`)
1. ✅ `08-deployer/01-plan-quatre-semaines.md` — Le plan de déploiement par étapes.
2. ✅ `08-deployer/02-acces-lecture-seule.md` — Étape 1 : accès et lecture seule.
3. ✅ `08-deployer/03-bac-a-sable.md` — Étape 2 : bac à sable et jeux de test sur pièces réelles.
4. ✅ `08-deployer/04-tests-validation.md` — Étape 3 : tests de validation et cycles d'ajustement.
5. ✅ `08-deployer/05-ouverture-progressive.md` — Étape 4 : ouverture processus par processus.
6. ✅ `08-deployer/06-criteres-acceptation.md` — Écrire des critères d'acceptation mesurables.
7. ✅ `08-deployer/07-former-equipes.md` — Former les équipes à valider, corriger, refuser.
8. ✅ `08-deployer/08-conduite-changement.md` — Conduite du changement dans un cabinet.
9. ✅ `08-deployer/09-communiquer.md` — Informer le conseil syndical et les copropriétaires.
10. ✅ `08-deployer/10-erreurs-frequentes.md` — Les erreurs fréquentes de déploiement et comment les éviter.

## Partie 9 — Exploiter et améliorer (`09-exploiter/`)
1. ✅ `09-exploiter/01-exploitation-mensuelle.md` — L'exploitation mensuelle : ce qui est surveillé et maintenu.
2. ✅ `09-exploiter/02-indicateurs.md` — Les indicateurs à suivre : délais, taux de validation, corrections.
3. ✅ `09-exploiter/03-memoire-regles.md` — Faire vivre la mémoire des règles validées.
4. ✅ `09-exploiter/04-ajouter-agent.md` — Ajouter un agent ou un processus.
5. ✅ `09-exploiter/05-mises-a-jour-reglementaires.md` — Intégrer les évolutions réglementaires.
6. ✅ `09-exploiter/06-maintenance-connecteurs.md` — Maintenir les connecteurs quand les outils changent.
7. ✅ `09-exploiter/07-revue-trimestrielle.md` — La revue trimestrielle avec la direction.
8. ✅ `09-exploiter/08-changer-de-modele.md` — Changer de modèle sans tout casser.
9. ✅ `09-exploiter/09-fin-de-contrat.md` — Fin de contrat : restitution et réversibilité.

## Partie 10 — Décider et passer à l'action (`10-decider/`)
1. ✅ `10-decider/01-cout-complet.md` — Calculer le coût complet d'un système IA.
2. ✅ `10-decider/02-mesurer-temps-gagne.md` — Mesurer le temps gagné avec une méthode honnête.
3. ✅ `10-decider/03-comparer-alternatives.md` — Comparer avec le recrutement, l'externalisation, les modules d'éditeur, l'IA grand public.
4. ✅ `10-decider/04-business-case.md` — Construire son dossier de décision.
5. ✅ `10-decider/05-questions-prestataire.md` — Les questions à poser à tout prestataire IA.
6. ✅ `10-decider/06-faire-soi-meme.md` — Faire soi-même, avec EXIOR, ou faire faire : arbitrer.
7. ✅ `10-decider/07-checklist-decision.md` — La checklist de décision.
8. ✅ `10-decider/08-glossaire.md` — Glossaire.
9. ✅ `10-decider/09-faq.md` — Questions fréquentes.
10. ✅ `10-decider/10-ressources-officielles.md` — Ressources officielles et textes de référence (Legifrance, service-public.fr, ANAH, OVHcloud).

Total : 10 + 11 + 13 + 11 + 19 + 8 + 11 + 10 + 9 + 10 = 112 chapitres.
