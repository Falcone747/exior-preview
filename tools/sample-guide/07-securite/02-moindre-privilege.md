# Le moindre privilège appliqué à chaque agent

Le moindre privilège donne à chaque agent exactement les accès de son processus. Un assistant du cabinet n'a pas les droits bancaires du dirigeant. Un agent est tenu encore plus court, parce qu'un message peut chercher à le tromper.

## Accès par processus

| Agent | Peut lire | Peut préparer | N'atteint pas |
| --- | --- | --- | --- |
| Accueil | Boîtes mail, référentiel des lots | Classement, transmission | Comptabilité, banque |
| Factures | Pièces fournisseurs, contrats, clés | Imputation proposée | Ordres de paiement |
| Banque | Relevés en lecture seule | Rapprochement proposé | Tout ordre de paiement |
| AG | Comptes, budget, liste des copropriétaires | Convocation, feuille de présence | Banque |
| Sinistres | Dossiers, contrats d'entretien | Déclaration, relances en brouillon | Comptabilité |

## Comptes techniques

Chaque connecteur a un compte technique distinct. Les droits sont limités à la lecture pendant les tests. Les coordonnées bancaires et les données d'identité sont masquées quand l'agent n'en a pas besoin pour la tâche en cours.

> **En pratique.** Quand un éditeur n'ouvre pas d'API, le mode retenu est l'import et l'export de fichiers, ou un opérateur qui agit dans l'interface sous le contrôle de l'équipe. Le mode est écrit dans le dossier d'architecture.

> **Point de vigilance.** Un message qui annonce un changement de coordonnées bancaires ne met aucune fiche à jour. L'agent n'a pas ce droit. Il transmet le message à un collaborateur habilité, avec le rappel de vérifier par un canal déjà connu.

## À retenir

- Un compte technique par agent et par outil.
- Aucun droit de paiement, même en lecture des relevés.
- Les tentatives de détournement ont lieu avant l'ouverture.
