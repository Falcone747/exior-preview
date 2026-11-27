# Brief agent cloud Cursor : page EXIOR syndics v3 + rapport offert + espace dossier sécurisé

Repo : `Falcone747/exior-preview` (public). Branche de travail : celle déjà ouverte pour les syndics (ex. `cursor/meta-os-marketing-9297` ou `syndics-sources`). Site statique : https://falcone747.github.io/exior-preview/
Langue : français. Marque : EXIOR.

**Offre unique (27/11/2026, décision Guillaume). À appliquer immédiatement, même si une version antérieure du copy a déjà été poussée.**

On ne vend qu’une chose : **l’architecture complète du système IA souverain**, **690 €**, paiement unique. **TVA non applicable, art. 293 B du CGI.** Jamais les mentions TTC ni HT, nulle part. Le client achète le dossier complet (112 chapitres, 10 parties), livré dans l’espace sécurisé dès la confirmation du paiement. Un rapport offert de 14 pages sert d’aimant (sans inscription).

**Retirer de la page, s’ils existent déjà :** cartes 990 €, 2 990 €, 990 € par mois, 9 900 €, 11 880 € ; formulaires de devis ; onglets déploiement ; section « mise en place » vendue comme un service ; abonnement ; clé en main ; le mot « guide » (remplacé par « dossier d’architecture », « votre architecture », « le dossier ») ; tout CTA autre que « Obtenir mon architecture · 690 € » et « Lire le rapport offert ».

Le texte fait foi : `copy_syndics.md` v3, **section 5 uniquement**. Ne pas réécrire, ne pas ajouter de phrases. Conserver les espaces insécables U+00A0 et les apostrophes typographiques ’. Aucun crochet visible.

Fichiers source :
- `copy_syndics.md` (v3)
- `rapport/index.html`, `rapport/logo.png`, `rapport/rapport-systeme-ia-souverain-syndic.pdf`
- `guide/index.md` et `guide/NN-partie/NN-chapitre.md` : contenu du dossier. **Le dossier en clair ne doit jamais être commité** (repo public). Voir §4. Dans l’interface publique, ne plus l’appeler « guide ».

## 1. Routes

| Route | Contenu | Accès |
|---|---|---|
| `/syndics/` | Page de vente (copy v3, section 5) | Public |
| `/syndics/rapport/` | Rapport offert (HTML + PDF fournis) | Public, sans inscription |
| `/syndics/sommaire/` | Sommaire public du dossier : 10 parties, titres et descriptions (depuis `guide/index.md`), sans le contenu | Public |
| `/syndics/espace/` | Espace du dossier : écran d’accès, puis lecteur | Code d’accès |
| `/syndics/merci/` | Retour après paiement Stripe | Publique mais non liée (noindex) |

`<html lang="fr">`, title et meta propres, favicon existant, `noindex` sur `/syndics/espace/` et `/syndics/merci/`. Lien « Syndics » dans la nav du site principal : seulement si Guillaume le demande (par défaut : non).

## 2. Design

Réutiliser le système du site live : `assets/home.css` (tokens `--bg #0a0a0b`, `--accent #7a45f5` en accent seulement, Inter locale), `assets/home.js` (reveal, `data-live="code"`, `data-live="chat"`, `data-live="feed"` / `ask` / `reply`, `data-schema` / `data-node`, `.sticky`, `prefers-reduced-motion`).
- `assets/syndics.css` pour les seuls ajouts (démo boîte syndic, **une** carte d’offre, lecteur). Pas de nouvelle couleur. Graphite + métal brossé, violet en filets, points, focus.
- Interdit : robots, mascottes, photos d’ambiance, illustrations génériques, emojis, faux logos, faux compteurs, dégradés arc-en-ciel.
- Visuels autorisés : fenêtre Espace EXIOR, terminal, tableaux d’état, schéma d’architecture en SVG/HTML.
- Mention « Démonstration, données fictives. Extrait de l’architecture. » sous chaque démo.

## 3. Page `/syndics/` : ordre des sections

Suivre `copy_syndics.md` §5, dans cet ordre exact. **Ne pas rajouter les sections devis, mise en place commerciale, ou une grille de tarifs à plusieurs cartes.**

0. **Nav** : logo EXIOR, ancres Agents · Démo · Souveraineté · Le dossier · Offre · Questions, bouton « Obtenir mon architecture », lien Rapport offert, Connexion → `/syndics/espace/`.
1. **Héros** (`#hero`) : H1, sous-titre, CTA 690 €, lien rapport, microcopy TVA. Visuel `.window` + `data-live="feed"` (fil du copy) + question/réponse. Sidebar : Boîte syndic, Comptabilité, AG, Sinistres, Travaux, Copropriétaires.
2. **Constat** (`#constat`) : titre + 3 cartes.
3. **Démo** (`#demo`) : composant `data-live="triage"` (boîte syndic → cartes agents, 4 messages du copy, noms fictifs, boucle, `prefers-reduced-motion` = état final statique).
4. **Agents** (`#agents`) : 16 cartes titre + ligne d’état + note.
5. **Connecteurs** (`#connecteurs`) : terminal `data-live="code"` + tableau `.board` `data-schema` + ligne de détail.
6. **Architecture** (`#architecture`) : schéma 4 colonnes, nœuds `data-node`, validation avec filet accent et libellé « bloquant ».
7. **Espace EXIOR** (`#espace`) : chat `data-live="chat"` + 3 points. Présenté comme une partie de l’architecture décrite dans le dossier, pas comme un abonnement.
8. **Souveraineté** (`#souverainete`) : titre, sous-titre, comparatif 2 colonnes, 6 cartes, ligne de détail.
9. **Le dossier** (`#dossier`) : 10 parties (nombre de chapitres lu depuis le sommaire au build), aperçu public des 3 premiers paragraphes du chapitre 1.1, CTA 690 €. Ancienne ancre `#guide` : rediriger vers `#dossier`.
10. **Offre** (`#offre`) : **une seule carte**, 690 €, puces et microcopy du copy. Pas de badge « recommandée », pas de seconde ou troisième carte.
11. **Rapport offert** (`#rapport`) : bloc court + 2 boutons (`/syndics/rapport/`, PDF).
12. **FAQ** (`#questions`) : `<details>` natifs, **8 questions** du copy, dans cet ordre.
13. **CTA final** (`#demarrer`) : `.sec.final`, un bouton, un lien rapport.
14. **Pied** : CGV, Mentions légales, Confidentialité, e-mail, © 2026 EXIOR. Aucun autre tarif.

S’il reste dans le HTML déjà produit des blocs #devis, #mise-en-place, cartes d’abonnement ou anciens prix : les supprimer, ne pas les masquer.

### Source unique des prix et liens
`assets/offre-syndics.js`, et seulement ceci :

```js
var EXIOR_OFFRE_SYNDICS = {
  produit: "L’architecture complète de votre système IA souverain",
  prix: "690\u00a0€",
  prixMontant: "690",
  devise: "EUR",
  paiement: "paiement unique",
  tva: "TVA non applicable, art. 293 B du CGI",
  cta: "Obtenir mon architecture",
  stripe: "https://buy.stripe.com/14AaEW37yfrt3Nxaxn7IY0a",
  email: "exior.tech@gmail.com"
};
```

Tous les prix et liens passent par `data-offre-s`, `data-stripe`, `data-mail`. **Le seul montant affiché sur tout le parcours syndics (page, rapport, merci, espace) est 690 €.**

## 4. Espace sécurisé `/syndics/espace/`

Même lecteur qu’au brief précédent (sidebar, recherche chiffrée, prev/next, hash par chapitre, encadrés « En pratique » / « Point de vigilance », « À retenir »), avec ces libellés publics :
- « Votre dossier d’architecture » (plus « guide »)
- Écran d’accès : « Entrez votre code d’accès pour ouvrir votre dossier. »

Protection inchangée (site statique, repo public) :
1. Chiffrer le contenu au build, hors repo (`tools/encrypt-guide.mjs`, AES-256-GCM, PBKDF2-SHA256 ≥ 310 000 itérations). Le dossier en clair (`guide/`) ne se commite jamais.
2. Déchiffrement WebCrypto, clé en `sessionStorage`.
3. Codes d’accès forts, un par période ou par acheteur. Révoquer = rechiffrer et republier.
4. L’agent cloud ne reçoit pas le dossier en clair : 3 chapitres factices dans `tools/sample-guide/`. Le coordinateur chiffre le vrai dossier sur la box et ne commite que `syndics/espace/data/`.

Limites à écrire dans le README, sans les maquiller : un code partagé ouvre l’accès à qui le possède ; la révocation demande un nouveau chiffrement ; un acheteur peut copier le texte. Une authentification par compte exigerait un service serveur, à proposer plus tard, sans souscrire aucun service sans l’accord de Guillaume.

Après paiement (lien Stripe déjà créé) : redirection vers `/syndics/merci/`. La page merci confirme l’achat du dossier d’architecture, renvoie vers `/syndics/espace/`, et indique que le code figure dans le message de confirmation Stripe et le reçu. **Ne pas afficher le code en dur sur la page merci** (elle est publique). Ne pas modifier les fichiers de `secrets/`.

## 5. Rapport offert `/syndics/rapport/`

Copier `rapport/index.html`, `logo.png` et le PDF v3 tels quels (dernière page = offre unique 690 €, TVA non applicable). Lien retour « ← Page syndics » en haut, masqué à l’impression, s’il ne casse pas la mise en page A4. Le bouton « Télécharger le PDF » existe déjà.

## 6. Contraintes (vérifier avant la PR)

- Une offre, un prix : 690 €. TVA non applicable, art. 293 B du CGI.
- Jamais TTC, jamais HT, jamais 990, 2 990, 9 900, 11 880.
- Jamais « guide » dans l’interface (sauf éventuels chemins de fichiers internes).
- Pas de devis, pas d’abonnement, pas de clé en main, pas de déploiement vendu.
- Pas de chiffre inventé, témoignage, logo client, étude de cas, compteur décoratif.
- Aucun client réel nommé. Démo : Ascenseurs Dupont, Résidence Les Ormes, M. Martin, Mme Leroy, Entreprise Durand.
- Interdits : `RGPD`, `hébergement UE` (et « hébergé dans l’UE »), `exior.io`, `recette`, `Grok`, `xAI`, `GTA`, `Rockstar`, `chatbot`.
- Émetteur : EXIOR. Pas de coût de supervision humaine.
- Accessibilité : contrastes AA, clavier, `prefers-reduced-motion`. Lighthouse ≥ 90 mobile sur `/syndics/`. JS vanilla, pas de framework lourd.

Commande à lancer et coller dans la PR :

```
grep -rniE 'rgpd|h[ée]bergement ue|dans l.ue|exior\.io|recette|ll gestion|grok|\bxai\b|gta|rockstar|chatbot|\bttc\b|\bht\b|2.?990|9.?900|11.?880|abonnement|clé en main|À FOURNIR|À CONFIRMER' syndics/ assets/syndics* assets/offre-syndics.js
```

Ignorer un « 990 » seulement s’il apparaît dans un commentaire de code rappelant l’interdiction. Résultat attendu sur le HTML publié : aucune ligne.

## 7. Livrables de la PR

- `syndics/index.html`, `syndics/rapport/`, `syndics/sommaire/index.html`, `syndics/espace/index.html` (+ `data/` d’exemple), `syndics/merci/index.html`
- `assets/syndics.css`, `assets/syndics.js`, `assets/offre-syndics.js`, `assets/guide-reader.js` (le lecteur peut garder ce nom de fichier)
- `tools/encrypt-guide.mjs`, `tools/sample-guide/`, `README-syndics.md`
- Captures desktop 1440 px et mobile 390 px de chaque section, du rapport et de l’espace
