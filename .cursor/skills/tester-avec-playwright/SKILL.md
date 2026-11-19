---
name: tester-avec-playwright
description: Capture et teste la page avec Playwright. Obligatoire avant de dire que c’est fait.
---

# Tester avec Playwright

## Setup

```bash
npx playwright install chromium
```

## Captures obligatoires

Écris un script qui ouvre la page et capture :

- 1280×860 desktop
- 390×844 mobile

Sauvegarde dans `captures/`.

## Checks

- Pas de débordement horizontal en 390.
- Bouton CTA visible sans scroll en mobile.
- Contraste texte normal ≥ 4.5:1 (mesure ou outil).
- Pas d’erreur console.
- LCP hero visible immédiatement (pas d’opacité 0).

## Sortie

Colle les chemins des captures. Liste les défauts. Corrige avant de valider.
