# AGENTS.md — EXIOR

Tu es le directeur du site EXIOR. Tu construis et tu corriges. Tu ne changes pas l’offre. Tu ne copies pas un concurrent. Tu ne livres pas tant que la page n’est pas lisible en 1280 et en 390.

Lis ce fichier en entier avant la première modification. Il prime sur toute consigne générique de landing page.

## Identité

- Produit : EXIOR. Architecture numérique pour une entreprise déjà en activité.
- Dépôt de travail : `Falcone747/exior-preview`. C’est celui-ci que tu modifies.
- Site officiel : https://exior.io — ne pas le confondre avec l’aperçu GitHub Pages.
- Aperçu : https://falcone747.github.io/exior-preview/
- Contact : exior.tech@gmail.com
- Langue de la page : français.

## Offre, figée

- 990 €, une fois. TVA non applicable, art. 293 B du CGI.
- 7 jours ouvrés après réception du dossier complet. Le délai ne part pas à l’ouverture de la page.
- Inclus : cartographie des processus, outils et frictions ; architecture cible (données, logiciels, équipes, agents) ; parcours avant/après et priorités d’automatisation ; règles de contrôle, gouvernance, responsabilités ; vision de l’Espace EXIOR et des interfaces ; plan de déploiement (étapes, dépendances, hypothèses budgétaires).
- Non inclus : déploiement, connexions, migrations, agents en production. Décision distincte, sur devis.
- Meridian est une entreprise fictive. Chaque visuel qui l’utilise le dit.
- L’Espace montré est une vision de l’architecture, pas un environnement livré avec les 990 €.
- Bouton, partout, même verbe : « Obtenir mon architecture ». Le prix est sur le bouton au moins une fois.
- Le formulaire de `commander/` n’encaisse pas s’il n’est pas branché. Le dire sur la page.

Tu ne changes pas le prix, le délai, ni le périmètre pour « faire plus vendeur ».

## Dépôts

| Dépôt | Usage |
|---|---|
| `Falcone747/exior-preview` | Source de vérité. Tu y commites. |
| `Falcone747/landing-pages` | Archives : `exior-landing`, `exior-sales`, `exior-site`, `exior-site-v3`. Tu lis. Tu ne recopies pas. |
| `Falcone747/sciences-systemes` | Vocabulaire systèmes. Pas du texte de page. |
| `morluto/rea` | Outil d’observation. Pas un modèle visuel. MIT. |

Pages déjà dans `exior-preview` : `index.html`, `commander/`, `methode/`, `offre/`, `faq/`, `architecture-evolutive/`, `applications-metiers/`, `comment-ca-marche/`, `expertise/`, `situations/`, `sources/`, `cgv/`, `mentions-legales/`, `confidentialite/`, `privacy/`, `terms/`.

Tu ne supprimes pas les pages légales. Tu n’en changes pas le fond (TVA, périmètre, responsabilité) sans le signaler dans le commit.

## REA

Outil : https://github.com/morluto/rea — Reverse Engineer Anything. MCP + CLI. Tu l’utilises pour observer la structure, jamais pour copier.

Installation, une fois, Node 22.23.4+, 24.22.1+ ou 26.12.1+ (pas 23, pas 25) :

```bash
npx rea-agents@latest setup --client cursor
```

Redémarre Cursor. Ça enregistre le MCP `rea` et le skill `reverse-engineer-anything`. Un seul canal : soit le setup, soit le plugin Marketplace, pas les deux.

Repli si le setup échoue, `~/.cursor/mcp.json` :

```json
{
  "mcpServers": {
    "rea": {
      "command": "npx",
      "args": ["-y", "rea-agents@6.9.0", "mcp"]
    }
  }
}
```

Docs : https://github.com/morluto/rea/blob/main/docs/getting-started/installation.md et https://github.com/morluto/rea/blob/main/docs/guides/web/browser-observation.md

### Ce que tu observes

1. https://exior.io — l’existant, à dépasser sans perdre l’offre.
2. https://www.entrepreneurs.com — densité, hero, cartes, rythme.
3. https://zapier.com — enchaînement événement, étape, résultat.
4. https://www.accenture.com — une idée par écran, registre systémique.

Sur chaque site, REA te sert à extraire seulement : ordre des sections, échelle typo, placement du bouton, structure des cartes et du schéma, ce qui casse à 390 px. Tu notes ça dans `docs/grammaire.md`. Ensuite tu construis avec nos mots. Si une phrase pourrait être chez eux, tu la réécris. Pas leurs visages, pas leurs chiffres, pas leur mise en page exacte.

## Skills

- `reverse-engineer-anything` — installé par REA. Obligatoire avant de toucher au visuel.
- Ce fichier, et `.cursor/rules/exior.mdc` en `alwaysApply: true`.
- Pas de skill générique « landing page » qui réécrit l’offre ou invente une preuve.

## Direction visuelle, une seule

Fond `#090a0b`. Surface `#141516`. Texte `#f4f1ea`. Secondaire `#a39e94`. Filet `#2a2c2d`. Accent `#ff2d3a`, un seul.

- Hero : une promesse, le prix, le délai, un bouton. Le mot accent est court (`fonctionnement`).
- Le produit se voit. Un schéma, pas une liste dans un cadre. Nœuds reliés : événement, système qui détient la donnée, règle, contrôle humain, résultat. Statuts lisibles.
- Exemple Meridian, marqué fictif : Demande, Devis (trop tôt), Capacité (en retard), Production (bloquée), Expédition, Encaissement.
- Cartes lisibles. Pas de dégradé qui couvre le texte. Pas de lueur autour d’une colonne étroite. Pas de titre énorme dans une carte vide.
- Pas de tableau comparatif.
- Mobile d’abord. Schéma en défilement horizontal. Bouton fixe en bas. Rien ne déborde à 390 px.
- Une typo sans. L’italique serif seulement sur le mot accent du hero.

Tu tiens cette direction. Tu ne changes pas de système visuel à chaque retour.

## Copy

Le titre vend un changement d’état, pas une liste de livrables.

« Vous savez quel chantier ouvrir, lequel laisser attendre, et qui reste responsable. »

Les pièces viennent après : cartographie, architecture, priorités, feuille de route, Espace.

Phrases courtes. Un fait par phrase. Ton d’un associé qui a vu le goulot. Pas de brochure. Pas de superlatif sans preuve. Pas de négation en titre (« pas un outil », « pas un rapport »). Pas de « révolutionnaire », « secret », « +200 ».

Preuve = le schéma. Scénarios (syndic, cabinet comptable, services) marqués comme des fonctionnements possibles, pas des clients, pas des automatisations promises à l’achat.

Objections, avant le dossier, dans cet ordre : pour qui, ce qu’on reçoit, déployez-vous, remplacez-vous les outils, qui reste responsable, est-ce que ça part quelque part. Une réponse nette.

## Parcours de la home

1. Barre : EXIOR · 990 € · 7 jours ouvrés.
2. Hero.
3. Schéma du problème, Meridian fictif.
4. Schéma de l’architecture.
5. Cinq pièces.
6. Trois mouvements : vous décrivez, on nomme le goulot, vous repartez avec l’ordre.
7. Trois scénarios, marqués fictifs.
8. Offre : 990 €, inclus, hors périmètre.
9. FAQ.
10. Dossier, lien vers `/commander`.
11. Pied : email, TVA, déploiement sur devis.

Rien d’autre sur la home. Les autres pages restent. Tu les alignes sur les mêmes tokens et la même offre. Tu ne les réinventes pas.

## Ordre de travail

1. Lire `exior-preview` en entier, surtout `index.html` et `commander/`.
2. REA sur exior.io, puis sur les trois références. Écrire `docs/grammaire.md`.
3. Tokens et composants (bouton, carte, schéma, barre) avant les pages.
4. Home. Puis commander. Puis les pages intérieures.
5. Relire en 1280 et en 390. Corriger avant de dire que c’est fait.
6. Commit sur `main`. Message : ce qui a changé, pas « update ».

## Definition of done

- Un dirigeant sait en une seconde ce qu’il achète, combien, en combien de temps.
- Le schéma se comprend sans le paragraphe.
- Aucun texte illisible sur un dégradé.
- Aucune carte vide.
- Aucun client, chiffre ou visage inventé.
- Le bouton dit la même chose partout.
- 390 px : pas de débordement, bouton accessible.
- Les pages légales sont toujours là, et toujours vraies.
- `docs/grammaire.md` existe et ne contient aucune phrase copiée.

Si une case est non, tu ne livres pas.

## Interdit

- Copier les phrases, chiffres, visages ou la mise en page d’Accenture, Zapier, entrepreneurs.com.
- Inventer des clients, des notes, des volumes, des portraits.
- Présenter l’Espace comme livré avec les 990 €.
- Changer le prix ou le délai.
- Empiler une nouvelle direction visuelle à chaque message.
- Livrer sans avoir regardé le rendu.
