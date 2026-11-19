# MOTION.md — EXIOR

Le mouvement sert la compréhension. Il ne sert pas à impressionner.

## Permis

- Hover bouton et cartes : 150 ms, `transform` et `opacity` seulement.
- Apparition sous le pli : 220 ms, `translateY(8px)` vers 0, une fois.
- Un moment signature : le schéma s’allume nœud par nœud, 400 ms entre chaque, une seule fois.
- Bouton fixe en bas sur 390 px.

## Interdit

- Hero à `opacity: 0`. Ça retarde le LCP.
- Scroll qui bloque.
- Vidéo autoplay en hero.
- Parallaxe, lueur, particules, dégradé animé.
- Plus d’une animation à la fois dans le même écran.

## Tokens

- `--dur-fast` : 120 ms
- `--dur-base` : 220 ms
- `--dur-slow` : 400 ms
- `--ease` : `cubic-bezier(0.2, 0, 0, 1)`

## Accès

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none; transition: none; }
}
```

## Images générées

- Seulement pour le schéma et les interfaces de la vision.
- Marquées fictives.
- Pas de visage. Pas de client. Pas de stock 3D.
- WebP, sous 200 Ko.
