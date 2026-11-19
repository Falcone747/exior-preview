# EXIOR — spec Cursor

Tu travailles dans le dépôt `Falcone747/exior-preview`. Tu livres un site premium, pas une maquette. Tu lis le dépôt avant d’écrire. Tu ne changes pas l’offre.

Le contrat complet de l’agent est `AGENTS.md`. Cette spec est le même contrat, côté projet.

## 0. Démarrage, une fois

Node 22.23.4+, 24.22.1+ ou 26.12.1+. Pas 23, pas 25.

```bash
npx rea-agents@latest setup --client cursor
```

Puis redémarre Cursor. Ça enregistre le MCP `rea` et le skill `reverse-engineer-anything`. Ne double pas avec le plugin Marketplace : un seul des deux.

Si le setup ne passe pas, `~/.cursor/mcp.json` :

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

Dépôt REA : https://github.com/morluto/rea — MIT.

## 1. Dépôts

| Dépôt | Rôle |
|---|---|
| `Falcone747/exior-preview` | Source de vérité. C’est celui-ci que tu modifies. |
| `Falcone747/landing-pages` | Archives. À lire, pas à recopier. |
| `Falcone747/sciences-systemes` | Vocabulaire systèmes. Pas du texte de page. |
| `morluto/rea` | Outil. Pas un modèle visuel. |

Tu ne supprimes pas les pages légales.

## 2. Offre, figée

990 €, une fois. 7 jours ouvrés après le dossier complet. Conception seulement. Déploiement sur devis. Meridian fictif. Espace = vision, pas livré. Bouton : « Obtenir mon architecture ». Contact : exior.tech@gmail.com. TVA non applicable, art. 293 B du CGI.

## 3. REA

Tu observes exior.io, entrepreneurs.com, zapier.com, accenture.com. Tu notes la grammaire dans `docs/grammaire.md`. Tu ne copies ni phrases, ni chiffres, ni visages.

## 4. Definition of done

1280 et 390 propres. Schéma lisible sans le texte. Aucune preuve inventée. Pages légales intactes. Voir AGENTS.md pour le détail.
