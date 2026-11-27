import { createOpenAICompatible } from "https://esm.sh/@ai-sdk/openai-compatible@3.0.96?bundle&deps=zod@4.1.8";

const MODEL_ID = "Qwen3-4B-q4f16_1-MLC";

/**
 * WebLLM refuses the OpenAI `tools` field for Qwen3-4B (only a few Hermes
 * models are on functionCallingModelIds). We keep the official AI SDK / OpenAI
 * tool loop, and fulfil each request with WebLLM's json_schema grammar.
 */
export function createWebLLMModel(engine, { enableThinking = false } = {}) {
  const fetchImpl = async (_input, init = {}) => {
    const body = JSON.parse(init.body || "{}");
    const tools = body.tools || [];
    const messages = Array.isArray(body.messages) ? body.messages.map(normalizeMessage) : [];

    const req = {
      messages,
      temperature: body.temperature ?? 0.6,
      max_tokens: body.max_tokens ?? 1024,
      enable_thinking: !!enableThinking,
      stream: false,
    };

    if (tools.length) {
      const names = tools.map((t) => t.function?.name || t.name).filter(Boolean);
      const schema = {
        type: "object",
        properties: {
          content: { type: "string" },
          tool_calls: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", enum: names },
                arguments: { type: "object" },
              },
              required: ["name", "arguments"],
            },
          },
        },
      };
      req.messages = injectToolPreamble(messages, tools);
      req.response_format = { type: "json_object", schema: JSON.stringify(schema) };
      req.temperature = body.temperature ?? 0.3;
    }

    let completion;
    try {
      completion = await engine.chat.completions.create(req);
    } catch (err) {
      if (req.response_format) {
        delete req.response_format;
        completion = await engine.chat.completions.create(req);
      } else {
        throw err;
      }
    }

    const adapted = tools.length ? adaptToolCompletion(completion) : completion;
    return new Response(JSON.stringify(adapted), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const provider = createOpenAICompatible({
    name: "webllm",
    baseURL: "https://exior-webllm.local/v1",
    apiKey: "local",
    fetch: fetchImpl,
  });
  return provider.chatModel(MODEL_ID);
}

function normalizeMessage(m) {
  if (m.role === "tool") {
    const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? "");
    return { role: "user", content: `<tool_response name="${m.name || m.tool_call_id || ""}">\n${content}\n</tool_response>` };
  }
  if (m.role === "assistant" && m.tool_calls) {
    const calls = m.tool_calls.map((c) => ({
      name: c.function?.name || c.name,
      arguments: safeParse(c.function?.arguments || c.arguments || {}),
    }));
    return { role: "assistant", content: JSON.stringify({ content: m.content || "", tool_calls: calls }) };
  }
  return { role: m.role, content: typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? "") };
}

function injectToolPreamble(messages, tools) {
  const catalog = tools.map((t) => JSON.stringify({
    type: "function",
    function: t.function || { name: t.name, description: t.description, parameters: t.parameters },
  })).join("\n");
  const preamble = `Tu disposes d'outils. Quand tu en as besoin, réponds uniquement avec un JSON { "content": "", "tool_calls": [{ "name": "...", "arguments": { } }] }. Quand tu as fini, réponds { "content": "ta réponse en français", "tool_calls": [] }. N'invente pas d'outil.\n<tools>\n${catalog}\n</tools>`;
  if (messages[0]?.role === "system") {
    return [{ ...messages[0], content: `${messages[0].content}\n\n${preamble}` }, ...messages.slice(1)];
  }
  return [{ role: "system", content: preamble }, ...messages];
}

function safeParse(v) {
  if (v && typeof v === "object") return v;
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return { value: v }; }
  }
  return {};
}

function parseMaybeJson(text) {
  const src = String(text || "").replace(/<think>[\s\S]*?<\/think>/i, "").trim();
  const fence = src.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1] : src;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(body.slice(start, end + 1)); } catch { return null; }
}

function adaptToolCompletion(completion) {
  const choice = completion?.choices?.[0];
  const raw = choice?.message?.content || "";
  const parsed = parseMaybeJson(raw);
  if (!parsed) return completion;
  const calls = Array.isArray(parsed.tool_calls) ? parsed.tool_calls : [];
  if (!calls.length) {
    return {
      ...completion,
      choices: [{
        ...choice,
        finish_reason: "stop",
        message: { role: "assistant", content: parsed.content || raw },
      }],
    };
  }
  return {
    ...completion,
    choices: [{
      ...choice,
      finish_reason: "tool_calls",
      message: {
        role: "assistant",
        content: parsed.content || "",
        tool_calls: calls.map((c, i) => ({
          id: `call_${i}_${c.name || "tool"}`,
          type: "function",
          function: {
            name: c.name,
            arguments: typeof c.arguments === "string" ? c.arguments : JSON.stringify(c.arguments || {}),
          },
        })),
      },
    }],
  };
}
