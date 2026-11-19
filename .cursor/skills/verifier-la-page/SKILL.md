---
name: verifier-la-page
description: Vérifie la page EXIOR avant de dire que c’est fait. Contraste, formulaire, performance, mobile, preuves.
---

# Vérifier la page

Ne dis pas que c’est fait tant que chaque ligne n’est pas vraie.

## Offre

- 990 €, 7 jours ouvrés, conception seulement.
- Meridian marqué fictif.
- Bouton « Obtenir mon architecture » partout.
- Aucun client, chiffre ou visage inventé.

## Contraste (WCAG AA)

- Texte normal ≥ 4.5:1.
- Texte large (≥ 24 px ou 18.7 px gras) ≥ 3:1.
- Bordures de champs et focus ≥ 3:1.
- `#a39e94` sur `#090a0b` : vérifier. Si ça rate, éclaircir le secondaire.

## Formulaire

- Labels visibles, pas seulement des placeholders.
- 2 à 4 champs. Pas de téléphone.
- Ce qui arrive aux données, une ligne sous le bouton.
- Focus visible au clavier.

## Performance

- LCP ≤ 2.5 s. Pas d’opacité 0 sur le hero.
- CLS ≤ 0.1. Largeur et hauteur sur les images.
- INP ≤ 200 ms. Pas de script tiers lourd.
- Images WebP, sous 200 Ko.

## Mobile

- 390 px : pas de débordement.
- Bouton accessible sans zoom.
- Cible tactile ≥ 24 px.

## Mouvement

- Conforme à `MOTION.md`.
- `prefers-reduced-motion` coupe tout.

## Sortie

Une liste. Une ligne par défaut. Si rien ne casse, dis « rien à corriger ».
