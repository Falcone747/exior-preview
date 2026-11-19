---
name: definir-le-design-system
description: Force les décisions de design avant d’écrire du code. Couleurs, typo, rythme, interdits. Sauvegarde dans DESIGN.md.
---

# Définir le design system

Ne commence pas à coder tant que ce fichier n’est pas écrit ou confirmé.

## Décisions obligatoires

Écris ou confirme dans `DESIGN.md` :

- Fond, surface, texte, secondaire, filet, accent. Hex exacts.
- Typo : une sans, tailles display / H2 / corps / label, line-height, tracking.
- Rythme vertical : espace entre sections.
- Forme des boutons et des cartes.
- Interdits : dégradé sur texte, tableau, carte vide, glassmorphism, particules, preuve inventée.

## Vérification

- Contraste texte normal ≥ 4.5:1.
- Contraste contrôles ≥ 3:1.
- Corps ≥ 16 px sur mobile.

## Sortie

Confirme que `DESIGN.md` est à jour. Ensuite seulement, passe à `/construire-la-page`.
