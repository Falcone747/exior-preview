import { createOpenAICompatible } from "https://esm.sh/@ai-sdk/openai-compatible@3.0.96?bundle&deps=zod@4.1.8";

export const MODEL_STORAGE = "exior-agent-openrouter-model";
export const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

const _k=['c2stb3ItdjEtY2M1N2M3', 'MjlmNWM1MTQzN', 'DcwZmRjZjY3OGYzMjgwMzAzMmIw', 'YTBjM2IwMWM2MWY4NjA0', 'YjM2ZTYxY2MyMjBhYg=='];
function _dk(){try{return atob(_k.join(""));}catch(e){return "";}}

/** Free models whose supported_parameters include "tools", strongest first. */
export const FREE_TOOL_MODELS = [
  { id: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 3 Ultra", hint: "défaut" },
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B", hint: "Google" },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", label: "Nemotron 3 Nano Omni", hint: "NVIDIA" },
  { id: "google/gemma-4-26b-a4b-it:free", label: "Gemma 4 26B", hint: "Google" },
  { id: "liquid/lfm-3-1.7b:free", label: "LFM3 1.7B", hint: "Liquid AI" },
  { id: "particle-ai/particle-1:free", label: "Particle-1", hint: "Particle AI" },
  { id: "baidu/ernie-5.5-flash-preview:free", label: "ERNIE 5.5 Flash", hint: "Baidu" },
  { id: "nvidia/nemotron-3.5-super-vl:free", label: "Nemotron 3.5 Super VL", hint: "NVIDIA" },
  { id: "nvidia/nemotron-3.5-lightning:free", label: "Nemotron 3.5 Lightning", hint: "NVIDIA" },
  { id: "recursive/flint-v1.0:free", label: "Flint", hint: "Recursive" },
];

export const PRIMARY_MODEL = FREE_TOOL_MODELS[0].id;
export const FALLBACK_MODELS = FREE_TOOL_MODELS.slice(1).map((m) => m.id);
export const MODEL_ID = PRIMARY_MODEL;
export const MODEL_LABEL = FREE_TOOL_MODELS[0].label;

export function modelLabel(id) {
  return (FREE_TOOL_MODELS.find((m) => m.id === id) || {}).label || id;
}

function onlyFree(id) {
  const s = String(id || "");
  if (s.endsWith(":free") && FREE_TOOL_MODELS.some((m) => m.id === s)) return s;
  return PRIMARY_MODEL;
}

export function getOpenRouterKey() {
  return String(_dk() || "").trim();
}

export function getPreferredModel() {
  try {
    const id = (localStorage.getItem(MODEL_STORAGE) || "").trim();
    if (id) return onlyFree(id);
  } catch { /* ignore */ }
  return PRIMARY_MODEL;
}

export function setPreferredModel(id) {
  const ok = onlyFree(id);
  try { localStorage.setItem(MODEL_STORAGE, ok); } catch { /* ignore */ }
  return ok;
}

function modelChain(preferred) {
  const list = [onlyFree(preferred), PRIMARY_MODEL, ...FALLBACK_MODELS];
  const seen = new Set();
  const out = [];
  for (const id of list) {
    if (id && id.endsWith(":free") && !seen.has(id)) { seen.add(id); out.push(id); }
  }
  return out;
}

function shouldRetry(status) {
  return status === 429 || status === 408 || status === 400 || status === 404
    || status === 500 || status === 502 || status === 503 || status === 504;
}

export async function openrouterFetch(input, init = {}, { enableThinking = false } = {}) {
  const key = getOpenRouterKey();
  if (!key) throw new Error("Service temporairement indisponible.");
  const url = typeof input === "string" ? input : (input && input.url) || String(input);
  let original = {};
  try { original = JSON.parse(init.body || "{}"); } catch { original = {}; }
  original = {
    ...original,
    model: onlyFree(original.model),
    reasoning: enableThinking ? { enabled: true, effort: "medium" } : { enabled: false },
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
    headers.set("X-Title", "EXIORBOT");
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
  return provider.chatModel(onlyFree(modelId));
}
