---
name: animer-la-page
description: Ajoute le mouvement selon MOTION.md. Transform et opacity seulement. Pas de jank.
---

# Animer la page

Lis `MOTION.md` avant d’animer.

## Contraintes

- Transform et opacity seulement. Pas de layout.
- Durées : 120 / 220 / 400 ms.
- `prefers-reduced-motion` respecté.
- Hero visible immédiatement. Pas d’animation sur le LCP.
- Pas de particules, pas de parallaxe lourd, pas de blur animé.

## Sources

Si besoin d’une bibliothèque, utilise les skills GSAP officiels ou Motion. Pas d’invention.

## Sortie

Confirme que les animations respectent `MOTION.md`. Capture avant/après si tu changes le mouvement.
