# Ce que signifie un système IA souverain pour un cabinet de syndic

Un système IA souverain est un système dont le cabinet connaît le lieu d'exécution, les droits de chaque agent et la façon de récupérer ses données. Pour un syndic, les programmes tournent en France, chez OVHcloud, ou sur un serveur du cabinet. Les données des copropriétés ne sont envoyées à aucun autre fournisseur d'IA.

Le contrôle des droits vient ensuite. Chaque agent n'accède qu'aux informations de son processus. Une écriture, un courrier ou un mail sortant attend la validation d'un collaborateur habilité. Les agents n'ont aucun droit de paiement : les fonds des mandants restent entre les mains de l'équipe.

La réversibilité ferme le cadre. Les règles, les référentiels et le journal sont conservés dans des formats ouverts. Le cabinet peut repartir avec ses données, que le système soit installé sur son serveur ou sur une infrastructure dédiée.

Texte d'exemple pour le lecteur de démonstration. Le guide complet est chiffré hors du dépôt, à partir des fichiers du cabinet, et n'est jamais publié en clair.

## Le lieu d'exécution

Le lieu d'exécution est le premier fait à écrire. Soit un serveur se trouve dans les locaux du cabinet, soit une infrastructure dédiée est ouverte chez OVHcloud en France. Dans les deux cas, le logiciel de copropriété reste la comptabilité officielle. Les modèles ouverts, par exemple ceux de Mistral via OVHcloud AI Endpoints, lisent et rédigent. Ils ne calculent pas les tantièmes.

## Le contrôle des droits

Chaque agent a un compte technique limité à son processus. L'agent des factures lit les pièces et propose une imputation. L'agent de la banque lit les relevés. Aucun des deux ne peut ordonner un virement.

> **En pratique.** Écrivez, pour chaque agent, la liste des outils qu'il peut lire et la liste des actions qui attendent une personne. Cette liste devient une page du dossier d'architecture.

> **Point de vigilance.** Un mail peut contenir une instruction cachée. Le harness ignore cette instruction et s'arrête sur la validation. Le test se fait avant l'ouverture, sur des pièces préparées pour cela.

## À retenir

- Le cabinet sait où tournent les programmes.
- Chaque action qui engage le cabinet attend un collaborateur habilité.
- Les données, les règles et le journal sortent dans des formats ouverts.
