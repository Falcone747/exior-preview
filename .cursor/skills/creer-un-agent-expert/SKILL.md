---
name: creer-un-agent-expert
description: Crée un agent expert sur mesure dans Cursor. À utiliser pour un nouveau domaine, pas pour modifier EXIOR.
---

# Créer un agent expert

| Fichier | Rôle | Taille |
|---|---|---|
| `AGENTS.md` | Contrat. Commandes, interdits, pointeurs. | Court. Sous 150 lignes. |
| `DESIGN.md` | Tokens, si le domaine a un visuel. | Une direction. |
| `.cursor/rules/nom.mdc` | 5 à 10 lignes dures, `alwaysApply: true`. | Minuscule. |
| `.cursor/skills/nom/SKILL.md` | Procédure, étapes, commandes. | Aussi long qu’il faut. |
| `.cursor/agents/nom.md` | Sous-agent isolé, pour une critique ou une recherche longue. | Court. |

Règle = toujours vrai. Skill = à faire dans l’ordre. Sous-agent = contexte propre. MCP = outil vivant.

Le `name` du skill est le nom du dossier. Invocation : `/nom`. Pour le garder toute la session : Option+Entrée, mode personnalisé.

N’écris dans `AGENTS.md` que ce que le code ne montre pas. Une vue d’ensemble du dépôt ne sert pas. Un interdiction non standard sert.

Ne duplique pas le même texte dans le contrat, la règle et le skill.
