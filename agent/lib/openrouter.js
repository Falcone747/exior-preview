import { createOpenAICompatible } from "https://esm.sh/@ai-sdk/openai-compatible@3.0.96?bundle&deps=zod@4.1.8";

export const KEY_STORAGE = "exior-agent-openrouter-key";
export const PRIMARY_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
export const FALLBACK_MODELS = [
  "baidu/ernie-5.5-flash-preview:free",
  "nvidia/nemotron-3.5-lightning:free",
];
export const MODEL_ID = PRIMARY_MODEL;
export const MODEL_LABEL = "Nemotron 3 Ultra";
export const MODEL_SUBTITLE = "gratuit via OpenRouter · secours automatique";
export const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export function getOpenRouterKey() {
  try { return (localStorage.getItem(KEY_STORAGE) || "").trim();
  } catch { return ""; }
}

export function hasOpenRouterKey() {
  return getOpenRouterKey().length > 8;
}

export function setOpenRouterKey(value) {
  const v = String(value || "").trim();
  if (!v) {
    localStorage.removeItem(KEY_STORAGE);
    return "";
  }
  localStorage.setItem(KEY_STORAGE, v);
  return v;
}

function modelChain(preferred) {
  const list = [preferred, PRIMARY_MODEL, ...FALLBACK_MODELS];
  const seen = new Set();
  const out = [];
  for (const id of list) {
    if (id && !seen.has(id)) { seen.add(id); out.push(id); }
  }
  return out;
}

function shouldRetry(status) {
  return status === 429 || status === 408 || status === 400 || status === 404
    || status === 502 || status === 503 || status === 504;
}

export async function openrouterFetch(input, init = {}, { enableThinking = false } = {}) {
  const key = getOpenRouterKey();
  if (!key) {
    throw new Error("Ajoutez votre clé OpenRouter pour commencer. Elle reste dans ce navigateur.");
  }
  const url = typeof input === "string" ? input : (input && input.url) || String(input);
  let original = {};
  try { original = JSON.parse(init.body || "{}"); } catch { original = {}; }
  original = {
    ...original,
    reasoning: enableThinking
      ? { enabled: true, effort: "medium" }
      : { enabled: false },
  };
  const models = modelChain(original.model);
  let lastStatus = 500;
  let lastBody = "";
  let lastType = "application/json";

  for (let i = 0; i < models.length; i++) {
    const body = { ...original, model: models[i] };
    const headers = new Headers(init.headers || {});
    headers.set("Authorization", "Bearer " + key);
    headers.set("HTTP-Referer", "https://falcone747.github.io/exior-preview/agent/");
    headers.set("X-Title", "EXIOR Agent");
    headers.set("Content-Type", "application/json");
    const res = await fetch(url, { ...init, headers, body: JSON.stringify(body) });
    if (res.ok) return res;
    const text = await res.text();
    lastStatus = res.status;
    lastBody = text;
    lastType = res.headers.get("Content-Type") || "application/json";
    if (res.status === 401 || res.status === 403) {
      return new Response(text, { status: res.status, headers: { "Content-Type": lastType } });
    }
    if (i < models.length - 1 && shouldRetry(res.status)) continue;
    if (i < models.length - 1) continue;
    return new Response(text, { status: res.status, headers: { "Content-Type": lastType } });
  }
  return new Response(
    lastBody || JSON.stringify({ error: { message: "Tous les modèles gratuits sont indisponibles pour le moment. Réessayez dans un instant." } }),
    { status: lastStatus, headers: { "Content-Type": lastType } },
  );
}

export function createOpenRouterModel({ enableThinking = false, modelId = PRIMARY_MODEL } = {}) {
  const provider = createOpenAICompatible({
    name: "openrouter",
    baseURL: OPENROUTER_BASE,
    apiKey: "browser",
    fetch: (input, init) => openrouterFetch(input, init, { enableThinking }),
  });
  return provider.chatModel(modelId);
}
