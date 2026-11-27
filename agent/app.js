import {
  MODEL_ID, MODEL_LABEL, WEBLLM_VERSION, hasWebGPU,
  runAgentTurn, BUILTIN_TOOLS, runBuiltin, looksComplex,
} from "./lib/agent.js";
import { BUILTIN_LABELS } from "./lib/tools.js";
import { kvGet, kvSet, newId, saveConversation, getConversation, listNotes } from "./lib/db.js";
import { loadConnectors, saveConnectors, probeConnector, callMcpTool, finishPendingOAuth } from "./lib/mcp.js";

const $ = (id) => document.getElementById(id);

let engine = null;
let engineKind = null;
let conversation = { id: newId(), messages: [], updatedAt: Date.now() };
let abort = null;
let mcpClients = new Map();

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function renderMarkdown(src) {
  const escaped = escapeHtml(src);
  const parts = escaped.split(/```([\s\S]*?)```/);
  let html = "";
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      const nl = parts[i].indexOf("\n");
      const body = nl >= 0 ? parts[i].slice(nl + 1) : parts[i];
      html += `<pre><code>${body}</code></pre>`;
    } else {
      html += parts[i]
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, "<br>");
    }
  }
  return `<div class="md">${html}</div>`;
}

function showEmpty() {
  $("messages").innerHTML = `
    <div class="empty">
      <h1>Agent EXIOR, sur votre appareil</h1>
      <p>Un seul modèle : <strong>Qwen3 4B</strong>. Il se télécharge une première fois (environ 2,3&nbsp;Go), reste enregistré dans ce navigateur, puis tourne ici via WebGPU — rien n'est envoyé à un serveur d'inférence.</p>
      <p>Chargez le modèle, puis posez une question. L'agent peut calculer, chercher sur le web, lire une page, gérer vos notes, et se connecter à vos apps via MCP.</p>
    </div>`;
}

function appendMsg(role, html, { cls } = {}) {
  const empty = $("messages").querySelector(".empty");
  if (empty) empty.remove();
  const el = document.createElement("div");
  el.className = `msg ${cls || role}`;
  el.innerHTML = html;
  $("messages").appendChild(el);
  $("messages").scrollTop = $("messages").scrollHeight;
  return el;
}

function setProgress(frac, text) {
  const wrap = $("progress");
  wrap.classList.toggle("hidden", !text && !frac);
  $("prog-bar").style.width = `${Math.round((frac || 0) * 100)}%`;
  $("prog-text").textContent = text || "";
}

function setReady(ready) {
  $("input").disabled = !ready;
  $("btn-send").disabled = !ready;
  if (ready) $("input").placeholder = "Écrivez votre message…";
}

function thinkingPref() {
  return $("thinking").value || "auto";
}

function renderBuiltins() {
  $("builtin-list").innerHTML = BUILTIN_TOOLS.map((t) =>
    `<li><b>${escapeHtml(BUILTIN_LABELS[t.name] || t.name)}</b><span>${escapeHtml(t.description)}</span></li>`
  ).join("");
}

async function renderNotes() {
  const rows = await listNotes();
  $("notes").innerHTML = rows.length
    ? rows.map((n) => `<article class="note"><b>${escapeHtml(n.title)}</b><p>${escapeHtml(n.content).slice(0, 280)}</p></article>`).join("")
    : `<p class="hint">Aucune note pour le moment. Demandez à l'agent d'en enregistrer une.</p>`;
}

function renderConnectors() {
  const list = loadConnectors();
  const ul = $("connector-list");
  if (!list.length) {
    ul.innerHTML = `<li class="hint" style="border:0;background:transparent;padding:0">Aucun connecteur pour l'instant.</li>`;
    return;
  }
  ul.innerHTML = list.map((c) => {
    const client = mcpClients.get(c.id);
    const tools = client?.tools || [];
    const err = client?.error;
    return `<li class="connector-card" data-id="${escapeHtml(c.id)}">
      <div class="row">
        <span class="cname">${escapeHtml(c.name)}</span>
        <span>
          <button type="button" class="btn-s" data-act="refresh">Actualiser</button>
          <button type="button" class="btn-s" data-act="remove">Retirer</button>
        </span>
      </div>
      <div class="tools ${err ? "err" : ""}">${
        err ? escapeHtml(err) : (tools.length ? tools.map((t) => t.name).join(" · ") : "Outils non encore listés")
      }</div>
    </li>`;
  }).join("");
}

function toolCatalog() {
  const defs = [...BUILTIN_TOOLS];
  for (const [id, client] of mcpClients) {
    const prefix = `mcp_${id}_`;
    for (const t of client.tools || []) {
      defs.push({
        name: prefix + t.name,
        description: `(connecteur ${client.name}) ${t.description || t.name}`,
        parameters: t.inputSchema || t.parameters || { type: "object", properties: {} },
        _mcp: { id, tool: t.name },
      });
    }
  }
  return defs;
}

async function executeTool(name, args) {
  if (name.startsWith("mcp_")) {
    const rest = name.slice(4);
    const idx = rest.indexOf("_");
    const id = idx >= 0 ? rest.slice(0, idx) : rest;
    const tool = idx >= 0 ? rest.slice(idx + 1) : "";
    const entry = mcpClients.get(id);
    if (!entry?.client) throw new Error("Connecteur indisponible. Réessayez de l'ajouter.");
    return callMcpTool(entry.client, tool, args || {});
  }
  return runBuiltin(name, args || {});
}

async function connectSaved() {
  mcpClients = new Map();
  for (const c of loadConnectors()) {
    try {
      const { client, tools } = await probeConnector(c);
      mcpClients.set(c.id, { client, tools, name: c.name, error: null });
    } catch (err) {
      mcpClients.set(c.id, { client: null, tools: [], name: c.name, error: err.message || String(err) });
    }
  }
  renderConnectors();
}

function gpuBanner() {
  const el = $("gpu-banner");
  if (hasWebGPU()) {
    el.className = "banner danger hidden";
    el.textContent = "";
    return true;
  }
  el.className = "banner danger";
  el.textContent = "WebGPU est indisponible dans ce navigateur. L'agent ne peut pas faire tourner Qwen3 4B sur cet appareil. Ouvrez cette page dans Chrome ou Edge à jour (sur Android : Chrome).";
  return false;
}

async function loadEngine() {
  if (!gpuBanner()) return;
  $("btn-load").disabled = true;
  setProgress(0.01, "Préparation du moteur…");
  try {
    const webllm = await import(`https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@${WEBLLM_VERSION}/+esm`);
    let cached = false;
    try { cached = await webllm.hasModelInCache(MODEL_ID); } catch { cached = false; }
    const onProgress = (p) => {
      const frac = typeof p.progress === "number" ? p.progress : 0;
      const label = cached
        ? "Déjà téléchargé — chargement depuis le navigateur…"
        : "Téléchargement du modèle (une seule fois, environ 2,3 Go)…";
      setProgress(frac, `${label} ${p.text || ""}`.trim());
    };
    try {
      const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
      engine = await webllm.CreateWebWorkerMLCEngine(worker, MODEL_ID, {
        initProgressCallback: onProgress,
        logLevel: "error",
      });
      engineKind = "worker";
    } catch (err) {
      console.warn("Worker indisponible, repli sur le fil principal", err);
      engine = await webllm.CreateMLCEngine(MODEL_ID, {
        initProgressCallback: onProgress,
        logLevel: "error",
      });
      engineKind = "main";
    }
    setProgress(1, "Modèle prêt. Vous pouvez écrire.");
    setReady(true);
    $("btn-load").textContent = "Modèle chargé";
    appendMsg("system", `Modèle ${escapeHtml(MODEL_LABEL)} prêt (${engineKind === "worker" ? "arrière-plan" : "fil principal"}).`);
    setTimeout(() => $("progress").classList.add("hidden"), 1600);
  } catch (err) {
    setProgress(0, "");
    $("progress").classList.add("hidden");
    $("btn-load").disabled = false;
    appendMsg("system", `Impossible de charger le modèle : ${escapeHtml(err.message || err)}`, { cls: "error" });
  }
}

async function newConversation() {
  conversation = { id: newId(), messages: [], updatedAt: Date.now() };
  await kvSet("currentConversation", conversation.id);
  showEmpty();
}

async function persist() {
  await saveConversation(conversation);
  await kvSet("currentConversation", conversation.id);
}

async function send(text) {
  if (!engine || !text.trim()) return;
  const userText = text.trim();
  $("input").value = "";
  autoSize();
  conversation.messages.push({ role: "user", content: userText });
  appendMsg("user", escapeHtml(userText));
  const bubble = appendMsg("assistant", `<span class="pending">Réflexion en cours…</span>`);
  const bits = { plan: "", tools: "", think: "", body: "" };
  const paint = () => {
    let html = "";
    if (bits.plan) html += `<div class="plan-box"><b>Plan</b>\n${escapeHtml(bits.plan)}</div>`;
    if (bits.tools) html += bits.tools;
    if (bits.think) html += `<details class="think"><summary>Réflexion</summary>${escapeHtml(bits.think)}</details>`;
    html += bits.body ? renderMarkdown(bits.body) : `<span class="pending">…</span>`;
    bubble.innerHTML = html;
    $("messages").scrollTop = $("messages").scrollHeight;
  };

  abort = new AbortController();
  $("btn-send").classList.add("hidden");
  $("btn-stop").classList.remove("hidden");
  setReady(false);
  $("btn-stop").disabled = false;

  try {
    const history = conversation.messages.slice(0, -1);
    const result = await runAgentTurn({
      engine,
      history,
      userText,
      toolDefs: toolCatalog(),
      executeTool,
      thinkingPref: thinkingPref(),
      signal: abort.signal,
      onPlan(plan) { bits.plan = plan; paint(); },
      onDelta(_d, full) { bits.body = full; paint(); },
      onToolStart(call) {
        bits.tools += `<div class="tool-chip"><b>${escapeHtml(call.name)}</b> en cours…</div>`;
        paint();
      },
      onToolEnd(rec) {
        bits.tools = bits.tools.replace(
          `<div class="tool-chip"><b>${escapeHtml(rec.name)}</b> en cours…</div>`,
          `<div class="tool-chip ${rec.isError ? "err" : ""}"><b>${escapeHtml(rec.name)}</b> ${rec.isError ? "erreur" : "ok"} — ${escapeHtml(String(rec.content || "")).slice(0, 180)}</div>`
        );
        paint();
      },
      onCheck(check) {
        bits.tools += `<div class="check-box ${check.ok ? "ok" : "bad"}">${
          check.retried ? "Contrôle : réponse corrigée." : (check.ok ? "Contrôle : la réponse est cohérente avec les outils." : `Contrôle : ${escapeHtml(check.issue || "un écart a été relevé, correction en cours.")}`)
        }</div>`;
        paint();
      },
    });
    bits.think = result.think || "";
    bits.body = result.assistant || "";
    paint();
    conversation.messages.push({ role: "assistant", content: result.assistant || "" });
    await persist();
    await renderNotes();
  } catch (err) {
    bubble.classList.add("error");
    bubble.textContent = err.message || String(err);
  } finally {
    abort = null;
    $("btn-stop").classList.add("hidden");
    $("btn-send").classList.remove("hidden");
    setReady(!!engine);
    $("input").focus();
  }
}

function autoSize() {
  const el = $("input");
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 160) + "px";
}

function togglePanel(open) {
  const panel = $("panel");
  const btn = $("btn-panel");
  const back = $("backdrop");
  const next = open ?? !panel.classList.contains("open");
  panel.classList.toggle("open", next);
  panel.hidden = false;
  btn.setAttribute("aria-expanded", String(next));
  back.classList.toggle("show", next);
  back.classList.toggle("hidden", !next);
}

async function init() {
  renderBuiltins();
  gpuBanner();
  showEmpty();
  await renderNotes();

  const oauth = await finishPendingOAuth();
  if (oauth?.error) {
    appendMsg("system", "Autorisation MCP : " + oauth.error, { cls: "error" });
  } else if (oauth?.connector) {
    mcpClients.set(oauth.connector.id, {
      client: oauth.client,
      tools: oauth.tools || [],
      name: oauth.connector.name,
      error: null,
    });
    appendMsg("system", "Connecteur « " + oauth.connector.name + " » autorisé.");
  }

  const savedThink = await kvGet("thinkingPref");
  if (savedThink) $("thinking").value = savedThink;
  $("thinking").addEventListener("change", () => kvSet("thinkingPref", thinkingPref()));

  const convId = await kvGet("currentConversation");
  if (convId) {
    const existing = await getConversation(convId);
    if (existing?.messages?.length) {
      conversation = existing;
      $("messages").innerHTML = "";
      for (const m of existing.messages) {
        if (m.role === "user") appendMsg("user", escapeHtml(m.content));
        else if (m.role === "assistant") appendMsg("assistant", renderMarkdown(m.content));
      }
    }
  }

  await connectSaved();

  $("btn-load").addEventListener("click", loadEngine);
  $("btn-new").addEventListener("click", newConversation);
  $("btn-panel").addEventListener("click", () => togglePanel());
  $("btn-panel-close").addEventListener("click", () => togglePanel(false));
  $("backdrop").addEventListener("click", () => togglePanel(false));
  $("input").addEventListener("input", autoSize);
  $("input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      $("composer").requestSubmit();
    }
  });
  $("composer").addEventListener("submit", (e) => {
    e.preventDefault();
    send($("input").value);
  });
  $("btn-stop").addEventListener("click", () => {
    abort?.abort();
    try { engine?.interruptGenerate?.(); } catch { /* ignore */ }
  });

  $("connector-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("c-name").value.trim();
    const url = $("c-url").value.trim();
    const token = $("c-token").value;
    const oauth = $("c-oauth")?.checked || false;
    const status = $("c-status");
    status.className = "status";
    status.textContent = "Connexion au serveur MCP…";
    const id = newId().slice(0, 8);
    const connector = { id, name, url, token, oauth };
    try {
      const { client, tools } = await probeConnector(connector);
      const list = loadConnectors();
      list.push(connector);
      saveConnectors(list);
      mcpClients.set(id, { client, tools, name, error: null });
      $("c-name").value = "";
      $("c-url").value = "";
      $("c-token").value = "";
      if ($("c-oauth")) $("c-oauth").checked = false;
      status.className = "status ok";
      status.textContent = tools.length
        ? `Connecté : ${tools.length} outil(s) trouvé(s).`
        : "Connecté, aucun outil exposé.";
      renderConnectors();
    } catch (err) {
      status.className = "status err";
      status.textContent = err.message || String(err);
    }
  });

  $("connector-list").addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const card = btn.closest("[data-id]");
    const id = card?.dataset.id;
    if (!id) return;
    if (btn.dataset.act === "remove") {
      const list = loadConnectors().filter((c) => c.id !== id);
      saveConnectors(list);
      try { await mcpClients.get(id)?.client?.close(); } catch { /* ignore */ }
      mcpClients.delete(id);
      renderConnectors();
      return;
    }
    if (btn.dataset.act === "refresh") {
      const c = loadConnectors().find((x) => x.id === id);
      if (!c) return;
      try {
        const { client, tools } = await probeConnector(c);
        mcpClients.set(id, { client, tools, name: c.name, error: null });
      } catch (err) {
        mcpClients.set(id, { client: null, tools: [], name: c.name, error: err.message || String(err) });
      }
      renderConnectors();
    }
  });
}

init().catch((err) => {
  appendMsg("system", escapeHtml(err.message || String(err)), { cls: "error" });
});
