import { streamText, generateText, tool, stepCountIs, jsonSchema } from "https://esm.sh/ai@7.0.183?bundle&deps=zod@4.1.8";
import { createOpenRouterModel, PRIMARY_MODEL, MODEL_LABEL as OR_LABEL } from "./openrouter.js?v=9";
import { runBuiltin, BUILTIN_TOOLS, truncateText } from "./tools.js?v=9";

export const MODEL_ID = PRIMARY_MODEL;
export const MODEL_LABEL = OR_LABEL;
export const MAX_STEPS = 8;

export { BUILTIN_TOOLS, runBuiltin, truncateText };

export function needsFreshness(text) {
  const t = String(text || "");
  if (!t.trim()) return false;
  return /(cours|cotation|cot[ée]e?s?|bourse|ticker|nasdaq|nyse|ipo|introduction en bourse|prix de l['’]?action|action d['’]?\w+|stock price|market cap|valorisation boursière|cl[oô]ture|actualité|à jour|aujourd['’]?hui|cette semaine|ce matin|hier|est[- ]ce que .+cot|société cotée|en bourse|qui a rachet|annonce officielle)/i.test(t);
}

export function looksComplex(text) {
  const t = String(text || "");
  if (needsFreshness(t)) return true;
  if (/https?:\/\//i.test(t)) return true;
  if (/[0-9].*[+\-*/^%]|[+\-*/^%].*[0-9]/.test(t)) return true;
  return /(calcule|calcul|combien|connecte|connexion|gmail|github|notion|linear|erp|odoo|sap|sage|cegid)/i.test(t);
}

function systemPrompt() {
  return `Tu es EXIORBOT, l'assistant d'EXIOR. Tu réponds en français, de façon concise, précise et orientée action.

Tu es expert des systèmes d'exploitation métier des entreprises : ERP (SAP, Odoo, Sage, Cegid, Microsoft Dynamics, NetSuite, Pennylane, Cegid Loop, EBP, Quadratus), CRM (Salesforce, HubSpot, Pipedrive), comptabilité, paie, et la façon de les relier (API, webhooks, MCP, iPaaS, connecteurs). Tu expliques clairement comment connecter un outil à un autre, les prérequis, et les limites réelles.

Règles de fraîcheur — non négociables :
- Pour toute question d'actualité, de prix, de cours de Bourse, d'entreprise, d'IPO, de date récente ou de fait susceptible d'avoir changé, tu t'appuies UNIQUEMENT sur les résultats de l'outil web_search (et web_fetch si besoin). Tu ne réponds jamais de mémoire sur ces sujets.
- Tu cites toujours tes sources avec leur URL markdown.
- Si les sources ne suffisent pas, tu le dis, tu ne inventes pas un cours, une date ou une cotation.

Connecteurs :
- Si l'utilisateur demande de connecter une app (Gmail, GitHub, Notion, etc.), tu appelles l'outil connect_app et tu affiches les liens renvoyés, cliquables. Tu n'inventes pas qu'une connexion est faite tant que l'outil ne l'a pas confirmée.
- Tu n'inventes jamais un outil absent de la liste.
- Tu délégués tout calcul à l'outil calculator.

Pour un simple échange (salutation, avis, explication générale d'un ERP sans chiffre d'actualité), réponds directement, brièvement, sans outil.`;
}

function toAiTools(toolDefs, executeTool, hooks) {
  const out = {};
  for (const def of toolDefs) {
    const schema = def.parameters || { type: "object", properties: {} };
    out[def.name] = tool({
      description: def.description || def.name,
      inputSchema: jsonSchema(schema),
      execute: async (args) => {
        hooks.onToolStart?.({ name: def.name, arguments: args });
        try {
          const content = truncateText(await executeTool(def.name, args || {}), 2500);
          hooks.onToolEnd?.({ name: def.name, arguments: args, content, isError: false });
          return content;
        } catch (err) {
          const content = err.message || String(err);
          hooks.onToolEnd?.({ name: def.name, arguments: args, content, isError: true });
          return `Erreur : ${content}`;
        }
      },
    });
  }
  return out;
}

function compactHistory(messages, maxChars = 14000) {
  if (!messages.length) return messages;
  const size = (arr) => arr.reduce((n, m) => n + (String(m.content || "").length), 0);
  if (size(messages) <= maxChars) return messages;
  const keep = [];
  let acc = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const len = String(messages[i].content || "").length;
    if (keep.length >= 4 && acc + len > Math.floor(maxChars * 0.7)) break;
    keep.unshift(messages[i]);
    acc += len;
  }
  const dropped = messages.slice(0, messages.length - keep.length);
  if (!dropped.length) return keep;
  const digest = dropped.map((m) => {
    const role = m.role === "assistant" ? "Assistant" : "Utilisateur";
    return `${role} : ${truncateText(String(m.content || "").replace(/\s+/g, " "), 240)}`;
  }).join("\n");
  return [{ role: "user", content: "Résumé des échanges précédents :\n" + truncateText(digest, 2000) }, ...keep];
}

function deltaText(part) {
  return part.text ?? part.textDelta ?? part.delta ?? "";
}

export async function runAgentTurn({
  modelId = PRIMARY_MODEL,
  history,
  userText,
  toolDefs,
  executeTool,
  onDelta,
  onPlan,
  onToolStart,
  onToolEnd,
  onCheck,
  signal,
}) {
  const steps = [];
  const hooks = {
    onToolStart,
    onToolEnd: (rec) => { steps.push(rec); onToolEnd?.(rec); },
  };

  let extra = "";
  if (needsFreshness(userText)) {
    hooks.onToolStart?.({ name: "web_search", arguments: { query: userText } });
    try {
      const content = truncateText(await executeTool("web_search", { query: userText }), 3500);
      hooks.onToolEnd?.({ name: "web_search", arguments: { query: userText }, content, isError: false });
      extra = "\n\nRésultats web (à utiliser et citer, ne pas contredire de mémoire) :\n" + content;
    } catch (err) {
      const content = err.message || String(err);
      hooks.onToolEnd?.({ name: "web_search", arguments: { query: userText }, content, isError: true });
      extra = "\n\nLa recherche web a échoué : " + content + " Dis-le clairement, n'invente pas de cours ou de date.";
    }
  }

  const messages = compactHistory([
    ...history,
    { role: "user", content: userText + extra },
  ]);

  const model = createOpenRouterModel({ enableThinking: false, modelId });
  let streamed = "";

  const result = streamText({
    model,
    system: systemPrompt(),
    messages,
    tools: toAiTools(toolDefs, executeTool, hooks),
    stopWhen: stepCountIs(MAX_STEPS),
    abortSignal: signal,
    temperature: 0.3,
    maxOutputTokens: 900,
  });

  try {
    for await (const part of result.fullStream) {
      if (signal?.aborted) break;
      const typ = part.type || "";
      if (typ === "text-delta" || typ === "text") {
        const d = deltaText(part);
        if (d) { streamed += d; onDelta?.(d, streamed); }
      }
    }
  } catch (err) {
    if (signal?.aborted) return { assistant: streamed, think: "", raw: streamed, steps, plan: "", aborted: true };
    throw err;
  }

  const finalText = (await result.text.catch(() => streamed) || streamed).trim();
  if (finalText && finalText !== streamed) onDelta?.("", finalText);

  const usedTools = steps.length > 0;
  let answer = finalText;

  const mutating = steps.some((s) => !/^(web_search|web_fetch|now)$/.test(s.name));
  if (usedTools && mutating && answer && !signal?.aborted) {
    const evidence = steps.map((s) => `- ${s.name}${s.isError ? " (erreur)" : ""} : ${truncateText(s.content, 350)}`).join("\n");
    const check = await generateText({
      model: createOpenRouterModel({ enableThinking: false, modelId }),
      system: "Vérifie une réponse d'agent. JSON uniquement {\"ok\": true ou false, \"issue\": \"...\", \"answer\": \"réponse corrigée ou identique, en français, avec sources si besoin\"}.",
      prompt: `Question : ${userText}\nOutils :\n${evidence}\nRéponse :\n${answer}`,
      abortSignal: signal,
      temperature: 0.1,
      maxOutputTokens: 700,
    });
    const src = check.text || "";
    const a = src.indexOf("{");
    const b = src.lastIndexOf("}");
    if (a >= 0 && b > a) {
      try {
        const parsed = JSON.parse(src.slice(a, b + 1));
        if (parsed.answer) answer = String(parsed.answer).trim();
        onCheck?.({ ok: parsed.ok !== false, issue: parsed.issue || "", answer });
      } catch { /* keep streamed answer */ }
    }
  }

  if (answer) onDelta?.("", answer);
  return { assistant: answer, think: "", raw: finalText || answer, steps, plan: "", aborted: !!signal?.aborted };
}
