import {
  MODEL_LABEL, runAgentTurn, BUILTIN_TOOLS, runBuiltin,
} from "./lib/agent.js?v=10";
import { BUILTIN_LABELS } from "./lib/tools.js?v=10";
import { kvGet, kvSet, newId, saveConversation, getConversation, listNotes } from "./lib/db.js?v=10";
import { loadConnectors, saveConnectors, probeConnector, callMcpTool, finishPendingOAuth, PRESET_CONNECTORS, connectApps } from "./lib/mcp.js?v=10";
import { FREE_TOOL_MODELS, getPreferredModel, setPreferredModel, modelLabel } from "./lib/openrouter.js?v=10";
import { marked } from "https://cdn.jsdelivr.net/npm/marked@15.0.12/+esm";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.2.6/+esm";

const $ = (id) => document.getElementById(id);
let conversation = { id: newId(), messages: [], updatedAt: Date.now() };
let abort = null;
let mcpClients = new Map();

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function renderMarkdown(src) {
  const html = marked.parse(String(src || ""), { gfm: true, breaks: true });
  return `<div class="md">${DOMPurify.sanitize(html)}</div>`;
}

function showEmpty() {
  $("messages").innerHTML = `
    <div class="empty">
      <h1>EXIORBOT</h1>
      <p>Expert des logiciels métier — ERP, CRM, comptabilité — et de la façon de les relier. Dis-moi ce dont tu as besoin.</p>
      <div class="chips">
        <button type="button" data-q="Cours de l'action Anthropic aujourd'hui, avec la source.">Cours Anthropic</button>
        <button type="button" data-q="Connecte mon GitHub.">Connecter GitHub</button>
        <button type="button" data-q="Comment relier Odoo à Pennylane, concrètement ?">Odoo → Pennylane</button>
      </div>
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
    const tag = added ? "Ajouté" : (p.auth === "none" ? "Sans compte" : (p.cors === false ? "CORS bloqué" : "Autorisation"));
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
    : `<p class="hint">Aucune note pour le moment.</p>`;
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

async function addPreset(id) {
  const preset = PRESET_CONNECTORS.find((p) => p.id === id);
  const status = $("preset-status");
  if (!preset) return;
  if (preset.cors === false) {
    status.className = "status err";
    status.textContent = `${preset.name} refuse les appels depuis une page web (CORS).`;
    return;
  }
  status.className = "status";
  status.textContent = "Connexion…";
  try {
    const text = await connectApps(preset.name);
    status.className = "status ok";
    status.textContent = text.replace(/\n/g, " ").slice(0, 280);
    const url = (text.match(/https?:\/\/\S+/) || [])[0];
    if (url) {
      appendMsg("system", `Pour connecter ${escapeHtml(preset.name)} : <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">ouvrir l'autorisation</a>`);
    }
    await connectSaved();
  } catch (err) {
    status.className = "status err";
    status.textContent = err.message || String(err);
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
  if (!text.trim()) return;
  const userText = text.trim();
  $("input").value = "";
  autoSize();
  conversation.messages.push({ role: "user", content: userText });
  appendMsg("user", escapeHtml(userText));
  const bubble = appendMsg("assistant", `<span class="pending">…</span>`);
  const bits = { tools: "", body: "" };
  const paint = (streaming) => {
    let html = bits.tools;
    if (bits.body) html += renderMarkdown(bits.body);
    else html += `<span class="pending">…</span>`;
    if (streaming) html += `<span class="cursor" aria-hidden="true"></span>`;
    bubble.innerHTML = html;
    $("messages").scrollTop = $("messages").scrollHeight;
  };

  abort = new AbortController();
  $("btn-send").classList.add("hidden");
  $("btn-stop").classList.remove("hidden");
  $("btn-send").disabled = true;
  $("input").disabled = true;
  $("btn-stop").disabled = false;

  try {
    const history = conversation.messages.slice(0, -1);
    const result = await runAgentTurn({
      modelId: getPreferredModel(),
      history,
      userText,
      toolDefs: toolCatalog(),
      executeTool,
      signal: abort.signal,
      onDelta(_d, full) { bits.body = full; paint(true); },
      onToolStart(call) {
        bits.tools += `<div class="tool-chip"><b>${escapeHtml(call.name)}</b> en cours…</div>`;
        paint(true);
      },
      onToolEnd(rec) {
        bits.tools = bits.tools.replace(
          `<div class="tool-chip"><b>${escapeHtml(rec.name)}</b> en cours…</div>`,
          `<div class="tool-chip ${rec.isError ? "err" : ""}"><b>${escapeHtml(rec.name)}</b> ${rec.isError ? "erreur" : "ok"} — ${escapeHtml(String(rec.content || "")).slice(0, 180)}</div>`
        );
        paint(true);
      },
      onCheck(check) {
        bits.tools += `<div class="check-box">${
          check.ok ? "Contrôle : réponse alignée avec les outils." : `Contrôle : ${escapeHtml(check.issue || "correction en cours.")}`
        }</div>`;
        paint(true);
      },
    });
    bits.body = result.assistant || "";
    paint(false);
    conversation.messages.push({ role: "assistant", content: result.assistant || "" });
    await persist();
    await renderNotes();
    await connectSaved();
  } catch (err) {
    bubble.classList.add("error");
    bubble.textContent = err.message || String(err);
  } finally {
    abort = null;
    $("btn-stop").classList.add("hidden");
    $("btn-send").classList.remove("hidden");
    $("btn-send").disabled = false;
    $("input").disabled = false;
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

function fillModels() {
  const sel = $("model-select");
  const current = getPreferredModel();
  sel.innerHTML = FREE_TOOL_MODELS.map((m) =>
    `<option value="${escapeHtml(m.id)}"${m.id === current ? " selected" : ""}>${escapeHtml(m.label)}</option>`
  ).join("");
  $("model-pill").textContent = modelLabel(current);
}

async function init() {
  renderBuiltins();
  renderPresets();
  showEmpty();
  fillModels();
  await renderNotes();

  const oauth = await finishPendingOAuth();
  if (oauth?.error) {
    appendMsg("system", "Autorisation : " + oauth.error, { cls: "error" });
  } else if (oauth?.connector) {
    mcpClients.set(oauth.connector.id, {
      client: oauth.client,
      tools: oauth.tools || [],
      name: oauth.connector.name,
      error: null,
    });
    appendMsg("system", "Connecteur « " + escapeHtml(oauth.connector.name) + " » autorisé.");
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
  $("btn-stop").addEventListener("click", () => abort?.abort());
  $("presets").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-preset]");
    if (btn) addPreset(btn.dataset.preset);
  });
  $("messages").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-q]");
    if (chip) send(chip.dataset.q);
  });
  $("model-select").addEventListener("change", () => {
    const id = setPreferredModel($("model-select").value);
    $("model-pill").textContent = modelLabel(id);
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
  const b = $("banner");
  if (b) { b.className = "banner"; b.textContent = err.message || String(err); }
});
