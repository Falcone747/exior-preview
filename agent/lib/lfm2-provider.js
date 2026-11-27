import { createOpenAICompatible } from "https://esm.sh/@ai-sdk/openai-compatible@3.0.96?bundle&deps=zod@4.1.8";

export const LFM2_MODEL_ID = "onnx-community/LFM2-1.2B-ONNX";
export const LFM2_DTYPE = "q4";
export const LFM2_LABEL = "LFM2 1.2B";
export const LFM2_SIZE_LABEL = "environ 850 Mo, une seule fois";
export const TRANSFORMERS_VERSION = "4.3.2";

function toLfmTool(t) {
  const fn = t.function || t;
  return {
    name: fn.name || t.name,
    description: fn.description || t.description || "",
    parameters: fn.parameters || t.parameters || { type: "object", properties: {} },
  };
}

function flattenContent(content) {
  if (content == null) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((p) => (typeof p === "string" ? p : p?.text || p?.content || "")).join("");
  }
  return String(content);
}

function formatCall(name, args) {
  let obj = args;
  if (typeof args === "string") {
    try { obj = JSON.parse(args); } catch { obj = { value: args }; }
  }
  const parts = Object.entries(obj || {}).map(([k, v]) => `${k}=${JSON.stringify(v)}`);
  return `[${name}(${parts.join(", ")})]`;
}

function normalizeMessages(messages) {
  const out = [];
  for (const m of messages || []) {
    const role = m.role || "user";
    if (role === "assistant" && Array.isArray(m.tool_calls) && m.tool_calls.length) {
      const text = m.tool_calls.map((tc) => {
        const fn = tc.function || tc;
        return formatCall(fn.name, fn.arguments);
      }).join("\n");
      out.push({ role: "assistant", content: flattenContent(m.content) ? flattenContent(m.content) + "\n" + text : text });
      continue;
    }
    if (role === "tool") {
      out.push({ role: "tool", content: flattenContent(m.content) });
      continue;
    }
    out.push({ role: role === "system" || role === "user" || role === "assistant" ? role : "user", content: flattenContent(m.content) });
  }
  return out;
}

function parseArgs(raw) {
  const s = String(raw || "").trim();
  if (!s) return {};
  try { return JSON.parse(s); } catch { /* continue */ }
  try { return JSON.parse("{" + s.replace(/([A-Za-z0-9_]+)\s*=/g, '"$1":') + "}"); } catch { /* continue */ }
  const out = {};
  const re = /([A-Za-z0-9_]+)\s*=\s*("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|[^,]+)/g;
  let m;
  while ((m = re.exec(s))) {
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
    else if (v === "true" || v === "false") v = v === "true";
    out[m[1]] = v;
  }
  return out;
}

function parseToolCalls(text) {
  const src = String(text || "").trim();
  if (!src) return [];
  const calls = [];
  const re = /\[([A-Za-z0-9_.-]+)\(([\s\S]*?)\)\]/g;
  let m;
  while ((m = re.exec(src))) {
    calls.push({ name: m[1], arguments: parseArgs(m[2]) });
  }
  if (calls.length) return calls;
  const start = src.indexOf("{");
  const end = src.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      const j = JSON.parse(src.slice(start, end + 1));
      const list = j.tool_calls || j.tools || (j.name ? [j] : []);
      for (const c of list) {
        const fn = c.function || c;
        if (fn.name) calls.push({ name: fn.name, arguments: typeof fn.arguments === "string" ? parseArgs(fn.arguments) : (fn.arguments || c.parameters || {}) });
      }
    } catch { /* ignore */ }
  }
  return calls;
}

function extractText(output) {
  const first = Array.isArray(output) ? output[0] : output;
  const gen = first?.generated_text;
  if (Array.isArray(gen)) {
    const last = gen[gen.length - 1];
    if (last && typeof last === "object") return flattenContent(last.content);
    return flattenContent(last);
  }
  if (typeof gen === "string") return gen;
  return flattenContent(first?.content || first || "");
}

export function createLFM2Model(generator) {
  const fetchImpl = async (_input, init = {}) => {
    const body = JSON.parse(init.body || "{}");
    const tools = (body.tools || []).map(toLfmTool);
    const messages = normalizeMessages(body.messages || []);
    const genOpts = {
      max_new_tokens: Math.min(body.max_tokens ?? 512, 768),
      temperature: body.temperature ?? 0.3,
      do_sample: (body.temperature ?? 0.3) > 0,
      repetition_penalty: 1.05,
    };
    if (tools.length) genOpts.tokenizer_encode_kwargs = { tools };

    const output = await generator(messages, genOpts);
    const text = extractText(output);
    const calls = tools.length ? parseToolCalls(text) : [];
    const message = calls.length
      ? {
          role: "assistant",
          content: "",
          tool_calls: calls.map((c, i) => ({
            id: "call_lfm2_" + i,
            type: "function",
            function: { name: c.name, arguments: JSON.stringify(c.arguments || {}) },
          })),
        }
      : { role: "assistant", content: text };

    return new Response(JSON.stringify({
      id: "lfm2-local",
      object: "chat.completion",
      choices: [{ index: 0, message, finish_reason: calls.length ? "tool_calls" : "stop" }],
      usage: { prompt_tokens: 0, completion_tokens: 0 },
    }), { headers: { "Content-Type": "application/json" } });
  };

  const provider = createOpenAICompatible({
    name: "lfm2-local",
    baseURL: "https://local.lfm2",
    apiKey: "local",
    fetch: fetchImpl,
  });
  return provider.chatModel("lfm2-1.2b");
}

export function formatLfm2Progress(p = {}) {
  const file = (p.file || p.name || "").split("/").pop() || "";
  const frac = typeof p.progress === "number"
    ? (p.progress > 1 ? p.progress / 100 : p.progress)
    : (p.loaded && p.total ? p.loaded / p.total : 0);
  const pct = Math.round((frac || 0) * 100);
  const status = p.status || "";
  if (status === "done" || status === "ready") return { frac: frac || 1, text: file ? `Prêt : ${file}` : "Prêt." };
  if (status === "initiate") return { frac: frac || 0.01, text: file ? `Préparation de ${file}…` : "Préparation…" };
  const label = file || "modèle";
  return { frac, text: `Téléchargement de ${label}… ${pct ? pct + " %" : ""}`.trim() };
}

export async function loadLFM2Engine(onProgress) {
  const mod = await import(`https://cdn.jsdelivr.net/npm/@huggingface/transformers@${TRANSFORMERS_VERSION}/+esm`);
  const { pipeline, env } = mod;
  if (env) {
    env.allowRemoteModels = true;
    env.allowLocalModels = false;
    if ("useBrowserCache" in env) env.useBrowserCache = true;
  }
  const progress_callback = (p) => {
    try { onProgress?.(formatLfm2Progress(p), p); } catch { /* ignore */ }
  };
  const tryLoad = (device) => pipeline("text-generation", LFM2_MODEL_ID, {
    dtype: LFM2_DTYPE,
    device,
    progress_callback,
  });
  const hasGPU = typeof navigator !== "undefined" && !!navigator.gpu;
  if (hasGPU) {
    try {
      const generator = await tryLoad("webgpu");
      return { generator, device: "webgpu" };
    } catch (err) {
      console.warn("LFM2 WebGPU indisponible, repli sur WASM", err);
    }
  }
  try {
    const generator = await tryLoad("wasm");
    return { generator, device: "wasm" };
  } catch (err) {
    const generator = await tryLoad("cpu");
    return { generator, device: "cpu" };
  }
}
