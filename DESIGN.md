# DESIGN.md — EXIOR

Style du hero validé, entre Linear et Cursor. Décision de Guillaume pour cette page.

## Observation

Navigation très fine, titre large aligné à gauche, deux pastilles, puis la fenêtre du produit. Le rythme descend ensuite : une phrase manifeste, trois colonnes sur filet, un bloc titre et interface, une grille, trois temps, l’offre, un appel final, un pied court. Une phrase porte un fait. L’accent reste rare. Le hero validé fixe la composition : le Meta OS sur un fond peint violet et graphite.

## Couleurs

- Fond `#0A0A0B`
- Surface `#101113`
- Surface fenêtre `#121316`
- Texte `#f4f5f6`
- Secondaire `#9b9ba3` (contraste ≥ 7:1 sur le fond)
- Filet `#26262c`
- Accent `#7A45F5` (pastilles, sélection, points). Texte blanc sur ce violet : 5,25:1
- Bouton plein `#ffffff` / texte `#0A0A0B`
- Bouton sombre `#141416`, filet `#3a3a40`

Pas de dégradé sur le texte. Le fond peint est une image derrière la fenêtre, jamais sous un titre.

## Typo

Inter Variable, auto-hébergée. Display 36–60 px, graisse 560, interligne 1,05, approche −0,035 em. Titre de section 32–48 px. Corps 16–18 px, interligne 1,55. Label 13 px. Corps mobile ≥ 16 px.

## Rythme

Conteneur 1120 px. Sections 112 px desktop, 72 px mobile, séparées par un filet. Hero : titre, ligne d’appui, deux pastilles, fenêtre produit.

## Formes

Pastilles pleinement arrondies. Cartes : rayon 12–16 px, filet, contenu réel (interface ou offre). Fenêtre Meta OS en HTML/CSS, fond `decor-meta.webp`.

## Offre affichée

Source unique : `assets/offre.js`. 990 € HT, paiement unique, 7 jours ouvrés après réception du dossier complet, conception seulement. Paiement : le lien Stripe de ce fichier. Mise en service : sur devis, sans montant inventé.

## Interdit

Preuve inventée. Client, logo, témoignage, prix ou statistique inventés. Dégradé sur texte. Tableau. Carte vide. Glassmorphism. Particules. Pas de domaine historique dans les liens publics.
