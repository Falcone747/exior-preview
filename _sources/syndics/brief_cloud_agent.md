# Brief agent cloud Cursor : page EXIOR syndics + rapport offert + espace guide sécurisé

Repo : `Falcone747/exior-preview` (public). Branche de travail : `cursor/meta-os-marketing-9297` (PR #2). Site statique publié sur GitHub Pages : https://falcone747.github.io/exior-preview/
Langue : français. Marque : EXIOR.

Fichiers source fournis (à copier dans le repo par le coordinateur, sauf le guide en clair) :
- `copy_syndics.md` : texte final de la page de vente, section par section. **Le texte fait foi** : ne pas réécrire, ne pas ajouter de phrases. Les balises `[À FOURNIR]` / `[À CONFIRMER]` ne doivent jamais apparaître sur la page : masquer l'élément concerné ou utiliser la variante neutre indiquée.
- `rapport/index.html`, `rapport/logo.png`, `rapport/rapport-systeme-ia-souverain-syndic.pdf` : rapport offert (14 pages A4), déjà mis en page.
- `guide/index.md` (sommaire, 10 parties, 112 chapitres) et `guide/NN-partie/NN-chapitre.md` : contenu du guide. **Le guide en clair ne doit jamais être commité** (le repo est public). Voir §4.

---

## 1. Routes à créer

| Route | Contenu | Accès |
|---|---|---|
| `/syndics/` | Page de vente (copy_syndics.md) | Public |
| `/syndics/rapport/` | Rapport offert (HTML fourni) + PDF téléchargeable | Public, sans inscription |
| `/syndics/sommaire/` | Sommaire public du guide : 10 parties, titres et descriptions des chapitres (depuis `guide/index.md`), sans le contenu | Public |
| `/syndics/espace/` | Espace guide : écran d'accès, puis lecteur du guide | Code d'accès |
| `/syndics/merci/` | Page de retour après paiement Stripe du guide | Publique mais non liée (noindex) |

Toutes les pages : `<html lang="fr">`, title et meta description propres, favicon existant, `noindex` sur `/syndics/espace/` et `/syndics/merci/`. Ajouter un lien « Syndics » dans la nav du site principal seulement si Guillaume le demande (par défaut : non).

## 2. Design : réutiliser l'existant, ne rien réinventer

Reprendre tel quel le système du site live : `assets/home.css` (tokens `--bg #0a0a0b`, `--surface`, `--panel`, `--text`, `--muted`, `--line`, `--accent #7a45f5`, `--wrap 1120px`, police Inter locale `assets/fonts/inter-latin.woff2`), et `assets/home.js` (reveal au scroll `data-reveal`/`.stagger`, `data-live="code"` terminal tapé, `data-live="chat"` bulles tapées, `data-live="feed"` + `data-live="ask"` + `data-live="reply"` du héros, `data-schema`/`data-node` allumage progressif, `.sticky` CTA mobile, `prefers-reduced-motion` respecté).
- Créer `assets/syndics.css` pour les seuls ajouts (démo boîte syndic, cartes d'offre à 3 colonnes, formulaires, lecteur du guide). Pas de nouvelle couleur : graphite + métal brossé, violet électrique **en accent uniquement** (filets, points actifs, focus, bouton actif), jamais en aplat de section.
- Typographie et rythme Linear / Cursor / x.ai : titres 560-620, interlettrage négatif, beaucoup d'air, texte secondaire `--muted`.
- Interdit : robots, mascottes, photos d'ambiance, illustrations génériques, dégradés arc-en-ciel, emojis, faux logos clients, faux compteurs.
- Visuels autorisés : composants d'interface (fenêtre Espace EXIOR, terminal, tableaux d'état, schéma d'architecture en SVG/HTML), tous animés sobrement.
- Mention « Démonstration, données fictives » sous chaque démo.

## 3. Page `/syndics/` : ordre des sections et composants

Suivre `copy_syndics.md` §5 dans cet ordre exact :

0. **Nav** : logo EXIOR (lien vers `/exior-preview/`), ancres Agents · Démo · Souveraineté · Guide · Offre · Devis · Questions, bouton « Accéder au guide » (`data-stripe-guide`). Menu mobile `details.drawer` existant.
1. **Héros** (`#hero`) : H1, sous-titre, CTA principal guide 690 € TTC, CTA secondaire `#devis`, lien rapport. Visuel = composant `.window` du héros actuel avec `data-live="feed"` (5 lignes du copy) + question/réponse `data-live="ask"`/`reply`. Sidebar de la fenêtre : Boîte syndic, Comptabilité, AG, Sinistres, Travaux, Copropriétaires.
2. **Constat** (`#constat`) : titre retenu + 3 cartes (`.grid` ou `.cols`).
3. **Démo** (`#demo`) — **nouveau composant `data-live="triage"`** (à ajouter dans `assets/syndics.js`) :
   - Colonne gauche « Boîte syndic » : 4 messages (expéditeur, objet, extrait) qui arrivent l'un après l'autre (fade + slide 8px, 900 ms d'écart).
   - Pour chaque message : un trait animé vers la colonne droite, où une carte « Agent » se remplit (nom de l'agent, champs extraits tapés avec la fonction `typeText` existante, puis pastille d'état « À valider » qui s'allume en violet).
   - Boucle après 3 s de pause ; arrêt hors écran (IntersectionObserver comme `watch()`); avec `prefers-reduced-motion`, afficher l'état final statique.
   - Données : tableau du copy §3 (remplacer toute vraie marque par un nom fictif, ex. « Ascenseurs Dupont »).
   - Mobile : les deux colonnes s'empilent, le trait devient une flèche verticale.
4. **Agents** (`#agents`) : grille de 16 cartes titre + ligne d'état (réutiliser le style des 8 cartes « Vos agents » du site), note sous la grille.
5. **Connecteurs** (`#connecteurs`) : terminal `data-live="code"` (fichier `connecteurs.syndic`, 6 lignes du copy) + tableau `.board` `data-schema` 4 lignes + ligne de détail.
6. **Architecture** (`#architecture`) : schéma 4 colonnes en HTML/SVG (Entrées → Agents et mémoire → Validation [bordure accent, libellé « bloquant »] → Logiciel de copropriété + journal), nœuds `data-node` allumés en séquence, flèches fines.
7. **Espace EXIOR** (`#espace`) : chat `data-live="chat"` (6 bulles du copy) + 3 points + encart guide.
7 bis. **Guide** (`#guide`) : 10 parties en grille ou accordéon ; **le nombre de chapitres par partie est généré au build depuis `guide/index.md`** (ne pas l'écrire en dur) ; aperçu public des 3 premiers paragraphes du chapitre 1.1 avec dégradé de fondu + CTA guide.
8. **Souveraineté** (`#souverainete`) : titre, sous-titre, comparatif 2 colonnes (Serveur du cabinet / Infrastructure dédiée OVHcloud), 6 cartes, ligne de détail.
9. **Mise en place** (`#mise-en-place`) : `.steps` 4 étapes + note. Utiliser le **titre neutre** (« Votre système se met en place par étapes, en lecture seule d'abord. ») tant que « quatre semaines » n'est pas confirmé.
10. **Offre** (`#offre`) : 3 cartes (Guide 690 € TTC · Architecture 990 € HT · Clé en main 2 990 € HT puis 990 € HT/mois, badge « Recommandée » sur la 3e), note annuelle 9 900 € HT. Sur desktop : 3 colonnes égales ; mobile : pile, carte recommandée en premier.
10 bis. **Devis** (`#devis`) : 2 onglets accessibles (role="tablist") avec les 2 formulaires du copy (voir §5).
10 ter. **Rapport offert** (`#rapport`) : bloc court + 2 boutons (`/syndics/rapport/`, PDF).
11. **FAQ** (`#questions`) : `<details>` natifs, 11 questions du copy, dans l'ordre 1-8, 10, 11, 9 tel qu'écrit.
12. **CTA final** (`#demarrer`) : réutiliser `.sec.final`.
13. **Pied de page** : celui du site (CGV, Mentions légales, Confidentialité, e-mail, © 2026 EXIOR).

### Source unique des prix et liens
Créer `assets/offre-syndics.js` sur le modèle d'`assets/offre.js` (qui reste inchangé) :
```js
var EXIOR_OFFRE_SYNDICS = {
  guidePrix: "690\u00a0€ TTC",
  guideStripe: "https://buy.stripe.com/14AaEW37yfrt3Nxaxn7IY0a", // lien Stripe 690 € TTC (confirmation Stripe affiche le code et le lien vers /syndics/espace/)
  architecturePrix: "990\u00a0€ HT",
  architectureStripe: "https://buy.stripe.com/fZu5kC0Zqenp5VF6h77IY05", // lien existant du site
  cleEnMainPrix: "2\u00a0990\u00a0€ HT",
  mensuelPrix: "990\u00a0€ HT par mois",
  annuelPrix: "9\u00a0900\u00a0€ HT",
  engagement: "6 mois",
  delaiArchitecture: "7 jours ouvrés",
  email: "exior.tech@gmail.com"   // même adresse que le site live ; Guillaume peut la remplacer par gbauchart.pro@gmail.com
};
```
Tous les prix et liens de la page sont injectés depuis cet objet via des attributs `data-offre-s="clé"`, `data-stripe-guide`, `data-stripe-architecture`, `data-mail`. **Aucun autre montant ne doit apparaître** (en particulier aucun montant de déploiement séparé).

## 4. Espace guide sécurisé `/syndics/espace/`

### 4.1 Lecteur
- Mise en page 3 zones : barre latérale gauche (parties repliables → chapitres, chapitre actif surligné avec filet violet, progression « lu » stockée en `localStorage`), contenu central (largeur de lecture ~68ch, typographie du site), sommaire de page à droite (H2 du chapitre) sur desktop.
- Barre de recherche plein texte en haut de la sidebar : index construit au build (titre + H2 + texte) **chiffré avec le reste**, déchiffré en mémoire après connexion ; recherche côté client (MiniSearch ou implémentation simple), résultats avec extrait surligné, raccourci `/`.
- Navigation précédent / suivant en bas de chaque chapitre, fil d'Ariane « Partie N › Chapitre », URL par chapitre en hash (`#/05-agents/07-preparation-ag`) pour partage interne et retour arrière.
- Rendu des encadrés : une citation Markdown commençant par `**En pratique.**` → encadré neutre ; `**Point de vigilance.**` → encadré avec filet accent ; `## À retenir` → bloc résumé. Tableaux Markdown stylés comme `.board`.
- Page d'accueil de l'espace = sommaire complet (10 parties, cartes) + « Reprendre la lecture ».
- Impression propre d'un chapitre (`@media print`).
- Bouton « Se déconnecter » (efface la clé en sessionStorage).

### 4.2 Protection : méthode honnête pour un site statique
Le site est statique et le repo est **public** : tout fichier commité est lisible par n'importe qui. Il n'existe donc pas de vraie authentification sans serveur. Méthode retenue :

1. **Chiffrement du contenu au build, hors du repo.** Écrire `tools/encrypt-guide.mjs` (Node, sans dépendance payante) :
   - lit `guide/` en clair depuis un dossier local passé en argument (jamais dans le repo, ajouter `guide-src/` au `.gitignore`) ;
   - convertit le Markdown en HTML (marked ou markdown-it), construit l'index de recherche et le manifeste (parties, chapitres, titres, nombre de mots) ;
   - chiffre chaque chapitre et l'index en **AES-256-GCM** avec une clé de contenu aléatoire K ;
   - pour chaque code d'accès fourni (`--codes codes.txt`, non commité), dérive une clé par **PBKDF2-SHA256 (≥ 310 000 itérations, sel aléatoire)** et enveloppe K → `syndics/espace/data/keys.json` (liste d'enveloppes, sans les codes) ;
   - écrit `syndics/espace/data/manifest.public.json` (titres et descriptions seulement, pour le sommaire public) et `syndics/espace/data/c/<id>.bin` (chapitres chiffrés).
2. **Déchiffrement côté navigateur** avec WebCrypto : l'utilisateur saisit son code, le script essaie les enveloppes, récupère K, déchiffre à la demande chaque chapitre. Clé gardée en `sessionStorage` (pas de `localStorage`).
3. **Codes d'accès** : un code fort (≥ 16 caractères aléatoires) par acheteur ou, à défaut, un code par période. Révoquer = relancer le script sans ce code (nouvelle clé K, nouveau chiffrement) et republier.
4. **L'agent cloud ne reçoit pas le guide en clair** : il livre le lecteur, le script et un jeu de 3 chapitres factices (`tools/sample-guide/`) chiffrés avec un code de test documenté dans le README. Le coordinateur (box EXIOR) lance ensuite le script avec le vrai guide et les vrais codes, et commite seulement `syndics/espace/data/`.

**Limites à écrire dans le README et à ne pas maquiller** : un code partagé donne accès à qui le reçoit ; la révocation demande un nouveau chiffrement ; la force dépend de la longueur du code ; le chiffrement protège contre la lecture du repo, pas contre un acheteur qui copie le texte. Une vraie authentification par compte demanderait un service serveur (par exemple un worker serverless qui vérifie le paiement Stripe et délivre un jeton), à proposer à Guillaume comme étape 2, sans souscrire aucun service payant sans son accord.

### 4.3 Accès automatique après paiement (690 € TTC)
Niveau 1, sans serveur (à livrer) :
- Le lien de paiement Stripe du guide (créé par le coordinateur avec l'accord de Guillaume, pas par l'agent cloud) est configuré pour, après paiement, **rediriger vers `/syndics/merci/`**. La page merci affiche : confirmation, lien vers `/syndics/espace/`, et le texte « Votre code d'accès figure dans le message de confirmation Stripe et dans votre e-mail de reçu ».
- Le code d'accès de la période est placé dans le **message de confirmation personnalisé** du lien de paiement (option Stripe « afficher un message de confirmation ») et/ou dans la description du produit reprise sur le reçu. → l'acheteur le reçoit automatiquement, sans intervention.
- Si la redirection est utilisée à la place du message, la page merci ne doit **pas** afficher le code en dur (elle serait publique) : elle renvoie vers le reçu.
Niveau 2 (à proposer, non livré) : webhook `checkout.session.completed` → worker serverless → génération d'un code unique, ajout de son enveloppe, e-mail à l'acheteur. Nécessite un service serveur et un service d'envoi d'e-mails : accord explicite de Guillaume requis.

## 5. Formulaires de devis (statique)
- Deux formulaires du copy §10 bis, champs et libellés exacts, champs obligatoires marqués `*`, validation HTML5 (`required`, `type="email"`), messages d'erreur en français sous chaque champ, focus visible violet.
- Envoi : comme le formulaire « Démarrer » du site live, **composition d'un `mailto:`** vers l'e-mail de `EXIOR_OFFRE_SYNDICS.email`, objet « Devis déploiement syndic — {Cabinet} » ou « Devis sur mesure syndic — {Cabinet} », corps = champs en lignes `Libellé : valeur`, encodés. Puis affichage du message de confirmation du copy.
- Ne jamais demander de mot de passe, d'identifiant, de coordonnées bancaires. Pas de service tiers de formulaires (ni Formspree, ni Google Forms) sans accord de Guillaume.

## 6. Rapport offert `/syndics/rapport/`
- Copier `rapport/index.html`, `logo.png` et le PDF tels quels. Ajouter seulement la nav/footer minimale du site si cela ne casse pas la mise en page A4 (sinon garder un lien retour « ← Page syndics » en haut, masqué à l'impression).
- Le bouton flottant « Télécharger le PDF » existe déjà dans le HTML.

## 7. Contraintes non négociables (vérifier avant la PR)
- Aucun chiffre inventé, témoignage, logo client, étude de cas, compteur décoratif.
- Ne jamais mentionner un client (aucun nom de cabinet réel). Noms de démo fictifs uniquement.
- Ne jamais écrire : `RGPD`, `hébergement UE` (ni variantes « hébergé dans l'UE »), `exior.io`, `recette`, `Grok`, `xAI`, `GTA`, `Rockstar`, `chatbot`.
- Pas de coût de supervision humaine.
- Pas de montant autre que 690 € TTC, 990 € HT, 2 990 € HT, 990 € HT par mois, 9 900 € HT (et 11 880 € dans la note annuelle).
- Émetteur / marque : « EXIOR ».
- Aucun texte `[À FOURNIR]` / `[À CONFIRMER]` visible.
- Accessibilité : contrastes AA, navigation clavier (onglets, accordéons, lecteur), `aria-live` discret pour les démos ou `aria-hidden` + texte alternatif statique, `prefers-reduced-motion`.
- Performance : pas de framework lourd ; JS vanilla comme le site ; images en SVG/HTML ; Lighthouse ≥ 90 mobile sur `/syndics/`.

Commande de contrôle à lancer et coller dans la PR :
```
grep -rniE 'rgpd|h[ée]bergement ue|dans l.ue|exior\.io|recette|ll gestion|grok|\bxai\b|gta|rockstar|chatbot|À FOURNIR|À CONFIRMER' syndics/ assets/syndics* assets/offre-syndics.js
```
Résultat attendu : aucune ligne.

## 8. Livrables de la PR
- `syndics/index.html`, `syndics/rapport/`, `syndics/sommaire/index.html`, `syndics/espace/index.html` (+ `data/` d'exemple), `syndics/merci/index.html`
- `assets/syndics.css`, `assets/syndics.js` (démo triage + onglets + formulaires), `assets/offre-syndics.js`, `assets/guide-reader.js` (lecteur + recherche + déchiffrement)
- `tools/encrypt-guide.mjs`, `tools/sample-guide/`, `README-syndics.md` (build, codes, limites)
- Captures desktop 1440 px et mobile 390 px de chaque section de `/syndics/`, du rapport et de l'espace (écran d'accès, sommaire, un chapitre, recherche).
