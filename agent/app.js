import {
  MODEL_ID, MODEL_LABEL, runAgentTurn, BUILTIN_TOOLS, runBuiltin,
} from "./lib/agent.js?v=5";
import { BUILTIN_LABELS } from "./lib/tools.js?v=5";
import { kvGet, kvSet, newId, saveConversation, getConversation, listNotes } from "./lib/db.js?v=5";
import { loadConnectors, saveConnectors, probeConnector, callMcpTool, finishPendingOAuth, PRESET_CONNECTORS } from "./lib/mcp.js?v=5";
import { loadLFM2Engine } from "./lib/lfm2-provider.js?v=5";

const $ = (id) => document.getElementById(id);

let lfm2 = null;
let lfm2Device = null;
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
      <p>Un seul modèle : <strong>LFM2 1.2B</strong> de Liquid AI. Il se télécharge une première fois (environ 850&nbsp;Mo), reste enregistré dans ce navigateur, puis tourne ici — rien n'est envoyé à un serveur d'inférence.</p>
      <p>Chargez le modèle, puis posez une question. L'agent peut calculer, chercher sur le web, lire une page, gérer vos notes, et se connecter à vos apps via MCP. Sans WebGPU, il fonctionne quand même, plus lentement.</p>
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
  else $("input").placeholder = "Chargez d’abord le modèle…";
}

function renderBuiltins() {
  $("builtin-list").innerHTML = BUILTIN_TOOLS.map((t) =>
    `<li><b>${escapeHtml(BUILTIN_LABELS[t.name] || t.name)}</b><span>${escapeHtml(t.description)}</span></li>`
  ).join("");
}

function renderPresets() {
  const saved = new Set(loadConnectors().map((c) => c.url.replace(/\/+$/, "")));
  $("presets").innerHTML = PRESET_CONNECTORS.map((p) => {
    const added = saved.has(p.url.replace(/\/+$/, ""));
    const tagClass = p.cors === false ? "warn" : "ok";
    const tag = added ? "Ajouté" : p.tag;
    return `<button type="button" class="preset ${p.cors === false ? "blocked" : ""}" data-preset="${escapeHtml(p.id)}">
      <b>${escapeHtml(p.name)}</b>
      <span>${escapeHtml(p.blurb)}</span>
      <i class="tag ${tagClass}">${escapeHtml(tag)}</i>
    </button>`;
  }).join("");
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
  renderPresets();
}

async function addConnector(connector, statusEl) {
  const status = statusEl || $("c-status");
  status.className = "status";
  status.textContent = "Connexion au serveur MCP…";
  try {
    const { client, tools } = await probeConnector(connector);
    const list = loadConnectors();
    if (!list.some((c) => c.id === connector.id)) {
      list.push(connector);
      saveConnectors(list);
    }
    mcpClients.set(connector.id, { client, tools, name: connector.name, error: null });
    status.className = "status ok";
    status.textContent = tools.length
      ? `Connecté : ${tools.length} outil(s) trouvé(s).`
      : "Connecté, aucun outil exposé.";
    renderConnectors();
    renderPresets();
    return true;
  } catch (err) {
    status.className = "status err";
    status.textContent = err.message || String(err);
    return false;
  }
}

async function addPreset(id) {
  const preset = PRESET_CONNECTORS.find((p) => p.id === id);
  const status = $("preset-status");
  if (!preset) return;
  if (preset.cors === false) {
    status.className = "status err";
    status.textContent = `${preset.name} est un vrai serveur MCP, mais il refuse les appels depuis un navigateur (CORS). Il ne peut pas être utilisé depuis cette page.`;
    return;
  }
  const already = loadConnectors().find((c) => c.url.replace(/\/+$/, "") === preset.url.replace(/\/+$/, ""));
  if (already) {
    status.className = "status ok";
    status.textContent = `${preset.name} est déjà dans vos connecteurs.`;
    return;
  }
  const connector = {
    id: newId().slice(0, 8),
    name: preset.name,
    url: preset.url,
    token: "",
    oauth: preset.auth === "oauth" || preset.auth === "token-or-oauth",
  };
  if (preset.auth === "token-or-oauth" || preset.auth === "token") {
    $("c-name").value = preset.name;
    $("c-url").value = preset.url;
    if ($("c-oauth")) $("c-oauth").checked = preset.auth === "token-or-oauth";
    status.className = "status";
    status.textContent = `${preset.name} : collez un jeton si vous en avez un, ou ajoutez le connecteur pour lancer l’autorisation.`;
    $("c-token").focus();
    togglePanel(true);
    return;
  }
  await addConnector(connector, status);
}

async function loadEngine() {
  $("btn-load").disabled = true;
  setProgress(0.01, "Préparation de LFM2 1.2B…");
  try {
    const { generator, device } = await loadLFM2Engine((info) => {
      setProgress(info.frac || 0, info.text || "Chargement…");
    });
    lfm2 = generator;
    lfm2Device = device;
    const mode = device === "webgpu" ? "WebGPU" : "WASM (plus lent, sans WebGPU)";
    setProgress(1, "Modèle prêt. Vous pouvez écrire.");
    setReady(true);
    $("btn-load").textContent = "Modèle chargé";
    appendMsg("system", `Modèle ${escapeHtml(MODEL_LABEL)} prêt (${mode}).`);
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
  if (!lfm2 || !text.trim()) return;
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
      lfm2,
      history,
      userText,
      toolDefs: toolCatalog(),
      executeTool,
      thinkingPref: "off",
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
    setReady(!!lfm2);
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
  renderPresets();
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
  });

  $("presets").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-preset]");
    if (btn) addPreset(btn.dataset.preset);
  });

  $("connector-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("c-name").value.trim();
    const url = $("c-url").value.trim();
    const token = $("c-token").value;
    const oauth = $("c-oauth")?.checked || false;
    const id = newId().slice(0, 8);
    const ok = await addConnector({ id, name, url, token, oauth }, $("c-status"));
    if (ok) {
      $("c-name").value = "";
      $("c-url").value = "";
      $("c-token").value = "";
      if ($("c-oauth")) $("c-oauth").checked = false;
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
      renderPresets();
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
