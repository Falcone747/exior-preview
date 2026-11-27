# EXIOR syndics

Pages : `/syndics/`, `/syndics/rapport/`, `/syndics/sommaire/`, `/syndics/espace/`, `/syndics/merci/`.

Adresse publiée : `https://falcone747.github.io/exior-preview/syndics/`. Les liens du site sont relatifs, donc le préfixe `/exior-preview/` de GitHub Pages est respecté.

Marque : EXIOR. Contact : `exior.tech@gmail.com`.

## Prix

Texte publié : section 5 de `_sources/syndics/copy_syndics.md` (v3). Une seule offre, une seule source de lien : `assets/offre-syndics.js`.

L’architecture complète de votre système IA souverain : 690 €. TVA non applicable, art. 293 B du CGI. Aucun autre montant. Ne pas écrire TTC ni HT. Ne pas écrire « guide » dans l’interface.

Le paiement ouvre le dossier (112 chapitres) dans `/syndics/espace/`. Le rapport de 14 pages, `/syndics/rapport/`, reste offert et sans paiement.

Lien Stripe, seul bouton d’achat : `https://buy.stripe.com/14AaEW37yfrt3Nxaxn7IY0a`

Pas de formulaire de devis. Le contact est l’e-mail du pied de page, `exior.tech@gmail.com`.

## Guide chiffré

Le dépôt est public. Le texte des chapitres ne doit jamais y être commité en clair. Seuls les titres et les descriptions d'une ligne sont publics (`_sources/syndics/guide-index.md`, repris dans `syndics/espace/data/manifest.public.json`).

Cette livraison contient trois chapitres factices dans `tools/sample-guide/`, chiffrés dans `syndics/espace/data/`. Code de démonstration, à remplacer avant toute vente :

```
vN4p-L8cQ-2mX7-sR9d
```

### Chiffrer le vrai guide

1. Placer les chapitres Markdown dans un dossier local `guide-src/` (ignoré par git), avec les mêmes chemins que le sommaire : `01-comprendre/01-systeme-ia-souverain.md`, etc.
2. Écrire les codes d'accès dans un fichier non commité, un code par ligne, 16 caractères minimum.
3. Lancer :

```bash
node tools/encrypt-guide.mjs \
  --guide guide-src \
  --index _sources/syndics/guide-index.md \
  --codes codes.txt \
  --out syndics/espace/data
```

Le script convertit le Markdown en HTML (titres, listes, tableaux, gras, liens, encadrés `En pratique`, `Point de vigilance`, bloc `À retenir`), construit l'index de recherche, chiffre chaque chapitre et l'index en AES-256-GCM avec une clé aléatoire K, puis enveloppe K pour chaque code avec PBKDF2-SHA256, 310 000 itérations, sel aléatoire. Il réécrit aussi le nombre de chapitres de la page de vente et le sommaire public. Il ne relit pas les codes dans `keys.json`.

Révoquer un code : relancer le script sans ce code. La clé K change, les anciens fichiers chiffrés ne se lisent plus. Republier `syndics/espace/data/`.

### Limites, sans les maquiller

- Un code partagé ouvre le dossier à quiconque le reçoit.
- La révocation demande un nouveau chiffrement et une republication. Elle n'est pas instantanée.
- La résistance dépend de la longueur du code. Un code court se devine.
- Le chiffrement empêche la lecture du dépôt. Il n'empêche pas un acheteur de copier le texte une fois le chapitre affiché.
- La clé de contenu reste dans `sessionStorage` le temps de l'onglet. Elle n'est pas un compte utilisateur.
- Une authentification par compte demanderait un service serveur, par exemple un worker qui vérifie le paiement Stripe et délivre un jeton. C'est une étape 2. Aucun service payant n'est souscrit ici.

## Paiement du dossier

Stripe affiche, sur sa page de confirmation, le code d’accès et l’adresse `https://falcone747.github.io/exior-preview/syndics/espace/`. Lien et code d’accès affichés dès la confirmation du paiement.

`/syndics/merci/` confirme le paiement et renvoie vers l'espace. Cette page ne contient aucun code : elle est publique. Si une redirection Stripe vers `/syndics/merci/` est activée, le code doit rester dans le reçu, parce que la page de retour ne l'affiche pas.

Étape 2, non livrée, et seulement avec l'accord de Guillaume : webhook `checkout.session.completed`, worker, code unique par acheteur, e-mail. Cela demande un serveur et un envoi d'e-mails.

## Contact

Pas de formulaire. L’e-mail `exior.tech@gmail.com` est dans le pied de page.

## Rapport

`/syndics/rapport/` reprend les 14 pages. Le bouton « Télécharger en PDF » lance `window.print()` avec une mise en page A4. Le lien `assets/syndics/rapport-systeme-ia-souverain-syndic.pdf` est réservé : quand le fichier sera ajouté, le même bouton le téléchargera.

## Contrôle

```bash
grep -rniE 'rgpd|h[ée]bergement ue|dans l.ue|exior\.io|recette|ll gestion|grok|\bxai\b|gta|rockstar|chatbot|À FOURNIR|À CONFIRMER' syndics/ assets/syndics* assets/offre-syndics.js
```

Résultat attendu : aucune ligne.
