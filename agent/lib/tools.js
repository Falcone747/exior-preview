import { listNotes, getNote, upsertNote, deleteNote } from "./db.js?v=11";

export const BUILTIN_TOOLS = [
  {
    name: "calculator",
    description: "Calcule une expression mathématique déterministe (+, -, *, /, %, ^, parenthèses, sqrt, sin, cos, tan, log, ln, abs, round, floor, ceil, pi, e). À utiliser pour tout calcul numérique, sans approximation mentale.",
    parameters: {
      type: "object",
      properties: { expression: { type: "string", description: "Ex. (12.5 * 4) ^ 2" } },
      required: ["expression"],
    },
  },
  {
    name: "js_eval",
    description: "Exécute un court script JavaScript dans un bac à sable isolé (pas d'accès réseau, pas de navigateur). Utile pour calculs composés, transformations de listes ou formatage. Le code doit renvoyer une valeur.",
    parameters: {
      type: "object",
      properties: { code: { type: "string", description: "Code JS court qui retourne une valeur, ex. [1,2,3].reduce((a,b)=>a+b,0)" } },
      required: ["code"],
    },
  },
  {
    name: "now",
    description: "Renvoie la date et l'heure actuelles, avec le fuseau Europe/Paris par défaut. À utiliser dès qu'une question dépend du moment présent (aujourd'hui, demain, quel jour, quelle heure).",
    parameters: {
      type: "object",
      properties: {
        timeZone: { type: "string", description: "Identifiant IANA, ex. Europe/Paris (défaut)" },
      },
    },
  },
  {
    name: "web_search",
    description: "Recherche des informations à jour sur le web (requête en langage naturel). À utiliser pour des faits, l'actualité, des définitions ou pour trouver une URL à lire ensuite avec web_fetch. Ne jamais inventer un fait d'actualité.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Requête de recherche, précise et courte" },
      },
      required: ["query"],
    },
  },
  {
    name: "web_fetch",
    description: "Lit le contenu textuel d'une page web publique via le lecteur r.jina.ai. Fournir une URL http ou https complète.",
    parameters: {
      type: "object",
      properties: { url: { type: "string", description: "URL complète commençant par http:// ou https://" } },
      required: ["url"],
    },
  },
  {
    name: "notes_list",
    description: "Liste les notes enregistrées localement dans le navigateur.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "notes_read",
    description: "Lit une note locale par son identifiant.",
    parameters: {
      type: "object",
      properties: { id: { type: "string", description: "Identifiant de la note" } },
      required: ["id"],
    },
  },
  {
    name: "notes_write",
    description: "Crée ou met à jour une note locale. Pour modifier, fournir l'id existant.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Identifiant existant (optionnel)" },
        title: { type: "string", description: "Titre" },
        content: { type: "string", description: "Contenu" },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "notes_delete",
    description: "Supprime une note locale par son identifiant.",
    parameters: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "connect_app",
    description: "Démarre la connexion à une ou plusieurs apps de l'utilisateur (GitHub, Notion, Linear, Figma, PayPal, Atlassian, et documentations sans compte). À utiliser dès que l'utilisateur demande de connecter Gmail, GitHub ou une autre app. Renvoie des liens cliquables d'autorisation. Gmail n'a pas de connecteur officiel utilisable depuis une page web.",
    parameters: {
      type: "object",
      properties: {
        apps: { type: "string", description: "Liste d'apps séparées par des virgules, ex. github, notion, gmail" },
      },
      required: ["apps"],
    },
  },
];

export const BUILTIN_LABELS = {
  calculator: "Calculatrice",
  js_eval: "Bac à sable JavaScript",
  now: "Date et heure",
  web_search: "Recherche web",
  web_fetch: "Lecture de pages (r.jina.ai)",
  notes_list: "Lister les notes",
  notes_read: "Lire une note",
  notes_write: "Écrire une note",
  notes_delete: "Supprimer une note",
  connect_app: "Connecter une app",
};

export function truncateText(text, limit = 2500) {
  const s = String(text ?? "");
  if (s.length <= limit) return s;
  const head = Math.floor(limit * 0.7);
  const tail = limit - head - 40;
  return s.slice(0, head) + "\n\n[… texte tronqué …]\n\n" + s.slice(-tail);
}

function safeUrl(raw) {
  let u;
  try { u = new URL(String(raw || "").trim()); }
  catch { throw new Error("URL invalide."); }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Seules les URL http et https sont autorisées.");
  }
  return u.toString();
}

async function fetchText(url, { timeout = 20000, accept = "text/plain" } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { headers: { Accept: accept }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`Lecture impossible (${res.status}).`);
    return await res.text();
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Délai dépassé.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url, timeout = 18000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json, text/plain, */*" }, signal: ctrl.signal });
    if (!res.ok) throw new Error(String(res.status));
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("json")) return await res.json();
    const t = await res.text();
    try { return JSON.parse(t); } catch { return t; }
  } finally {
    clearTimeout(timer);
  }
}

async function webFetch({ url }) {
  const target = safeUrl(url);
  try {
    const text = await fetchText("https://r.jina.ai/" + target);
    return truncateText(text || "(page vide)", 4000);
  } catch (err) {
    if (/wikipedia\.org/i.test(target)) {
      const title = decodeURIComponent(target.split("/wiki/")[1] || "").replace(/_/g, " ");
      if (title) {
        const api = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exchars=3000&format=json&origin=*&titles=" + encodeURIComponent(title);
        const data = await fetchJson(api);
        const page = Object.values((data.query || {}).pages || {})[0] || {};
        if (page.extract) return truncateText(`# ${page.title}\\n\\n${page.extract}\\n\\nSource : ${target}`, 4000);
      }
    }
    throw err;
  }
}

function searchVariants(q) {
  const raw = String(q || "").trim();
  const out = [];
  const add = (s) => {
    const t = String(s || "").replace(/\s+/g, " ").trim();
    if (t && !out.includes(t)) out.push(t);
  };
  const looksLikeSentence = /[,.!?]|aujourd|avec la source|dis[- ]moi/i.test(raw) || raw.split(/\s+/).length > 8;
  if (!looksLikeSentence) add(raw);
  const stop = new Set(("le la les un une des du de d l et ou a à au aux en y on je tu il elle nous vous ils elles mon ma mes ton ta tes son sa ses ce cet cette ces qui que quoi dont ou pour par pas plus moins tres très avec sans sur sous dans chez vers quel quelle quels quelles combien comment pourquoi quand est sont ai as avons avez ont ete été aujourd hui aujourd'hui aujourd’hui aujourdhui moi stp svp source sources merci voici voila voilà donc alors aussi bien encore deja déjà cours action actions prix cote cotee coté cotée cotation bourse ticker valeur valorisation cloture clôture market cap the of for today stock price with source").split(/\s+/));
  const tokens = raw.replace(/[«»"'’`.,;:!?()[\]]/g, " ").split(/\s+/).filter(Boolean);
  const kept = tokens.filter((tok) => {
    const n = tok.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
    return n.length > 1 && !stop.has(n) && !stop.has(tok.toLowerCase());
  });
  if (kept.length) add(kept.join(" "));
  const names = kept.filter((tok) => /^[A-ZÉÈÀÂÎÙÇ]/.test(tok) || /anthropic|nvidia|microsoft|google|apple|meta|tesla|openai|amazon|netflix|broadcom/i.test(tok));
  const finance = /(cours|action|bourse|cot[ée]|ipo|nasdaq|nyse|stock|ticker|prix|valorisation|cl[oô]ture)/i.test(raw);
  if (finance && names.length) {
    add(names.join(" ") + " IPO");
    add(names.join(" ") + " stock NASDAQ");
    add(names[0] + " IPO");
    add(names[0] + " stock");
  } else if (names.length) {
    add(names.join(" "));
  }
  if (!out.length) add(raw);
  return out.slice(0, 6);
}

function decodeEntities(s) {
  return String(s || "").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16))).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&apos;/g, "'").replace(/&#039;/g, "'");
}

function resultScore(item, names) {
  const hay = decodeEntities((item.title || "") + " " + (item.snippet || "")).toLowerCase();
  let s = 0;
  if (names.some((n) => n && hay.includes(String(n).toLowerCase()))) s += 4;
  if (/\bipo\b|introduction en bourse|nasdaq|ticker|\bant\b|stock lists|trading live|initial public offering/.test(hay)) s += 6;
  if (s === 0) return -1;
  return s;
}

async function wikiSearch(q, lang = "en") {
  const host = lang === "fr" ? "https://fr.wikipedia.org" : "https://en.wikipedia.org";
  const url = host + "/w/api.php?action=query&list=search&utf8=1&format=json&origin=*&srlimit=4&srsearch=" + encodeURIComponent(q);
  const data = await fetchJson(url);
  const hits = ((data.query || {}).search || []);
  if (!hits.length) return [];
  const titles = hits.map((h) => h.title).join("|");
  const exUrl = host + "/w/api.php?action=query&prop=extracts&explaintext=1&exchars=900&format=json&origin=*&titles=" + encodeURIComponent(titles);
  const ex = await fetchJson(exUrl);
  const pages = Object.values((ex.query || {}).pages || {});
  const byTitle = Object.fromEntries(pages.map((p) => [p.title, p.extract || ""]));
  return hits.map((h) => {
    const href = host + "/wiki/" + encodeURIComponent(h.title.replace(/ /g, "_"));
    return { title: h.title, url: href, snippet: (byTitle[h.title] || h.snippet || "").replace(/<[^>]+>/g, " "), source: lang === "fr" ? "Wikipédia" : "Wikipedia" };
  });
}

async function hnSearch(q) {
  const url = "https://hn.algolia.com/api/v1/search?hitsPerPage=6&query=" + encodeURIComponent(q);
  const data = await fetchJson(url);
  return (data.hits || []).filter((h) => h.title && h.url).map((h) => ({
    title: h.title,
    url: h.url,
    snippet: (h.created_at || "").slice(0, 10),
    source: "Actualité",
  }));
}

async function jinaSearch(q) {
  const target = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(q);
  const text = await fetchText("https://r.jina.ai/" + target);
  return text;
}

async function webSearch({ query }) {
  const variants = searchVariants(query);
  if (!variants.length) throw new Error("Requête vide.");
  if (variants[0].length > 300) throw new Error("Requête trop longue.");
  const names = variants
    .join(" ")
    .split(/\s+/)
    .filter((w) => /^[A-ZÉÈÀÂÎÙÇ]/.test(w) || /anthropic|nvidia|microsoft|google|apple|meta|tesla|openai|amazon|nasdaq|\bant\b|ipo/i.test(w));
  const scored = [];
  const seen = new Set();
  for (const v of variants) {
    for (const lang of ["en", "fr"]) {
      try {
        const wiki = await wikiSearch(v, lang);
        for (const r of wiki) {
          if (seen.has(r.url)) continue;
          const score = resultScore(r, names);
          if (score < 0) continue;
          seen.add(r.url);
          r.snippet = decodeEntities(r.snippet || "");
          scored.push({ score, line: "• " + r.title + "\n" + String(r.snippet || "").slice(0, 700) + "\nSource : " + r.url });
        }
      } catch { /* continue */ }
    }
    try {
      const news = await hnSearch(v);
      for (const r of news) {
        if (seen.has(r.url)) continue;
        const score = resultScore(r, names);
        if (score < 0) continue;
        seen.add(r.url);
        scored.push({ score, line: "• " + r.title + (r.snippet ? " (" + r.snippet + ")" : "") + "\nSource : " + r.url });
      }
    } catch { /* continue */ }
  }
  scored.sort((a, b) => b.score - a.score);
  const blocks = scored.slice(0, 8).map((x) => x.line);
  if (!blocks.length) {
    try {
      const raw = await jinaSearch(variants[0]);
      if (raw && raw.length > 80 && !/AuthenticationRequiredError/i.test(raw)) {
        blocks.push(truncateText(raw, 1800));
      }
    } catch { /* optional */ }
  }
  if (!blocks.length) throw new Error("Aucun résultat web pour le moment. Relance web_search avec une requête courte (nom de l'entreprise + IPO ou stock).");
  return truncateText("Résultats web pour « " + variants[0] + " » :\n\n" + blocks.join("\n\n"), 5000);
}


const CONSTANTS = { pi: Math.PI, e: Math.E };
const FUNS = {
  sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan,
  log: Math.log10, ln: Math.log, abs: Math.abs, round: Math.round,
  floor: Math.floor, ceil: Math.ceil,
};

function calculate(expression) {
  const src = String(expression || "").trim();
  if (!src) throw new Error("Expression vide.");
  if (src.length > 200) throw new Error("Expression trop longue.");
  const tokens = [];
  const re = /\s+|[A-Za-z]+|\d+(\.\d+)?([eE][+-]?\d+)?|[+\-*/%^(),]/y;
  let lastIndex = 0;
  while (lastIndex < src.length) {
    re.lastIndex = lastIndex;
    const m = re.exec(src);
    if (!m || m.index !== lastIndex) throw new Error(`Caractère inattendu près de « ${src.slice(lastIndex, lastIndex + 8)} ».`);
    if (!/^\s+$/.test(m[0])) tokens.push(m[0]);
    lastIndex = re.lastIndex;
  }
  let i = 0;
  const peek = () => tokens[i];
  const eat = (x) => { if (peek() === x) { i++; return true; } return false; };
  function parseAdd() {
    let v = parseMul();
    while (peek() === "+" || peek() === "-") {
      const op = tokens[i++];
      const r = parseMul();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function parseMul() {
    let v = parsePow();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const op = tokens[i++];
      const r = parsePow();
      if (op === "/" && r === 0) throw new Error("Division par zéro.");
      v = op === "*" ? v * r : op === "/" ? v / r : v % r;
    }
    return v;
  }
  function parsePow() {
    let v = parseUnary();
    if (peek() === "^") { i++; v = v ** parsePow(); }
    return v;
  }
  function parseUnary() {
    if (eat("+")) return parseUnary();
    if (eat("-")) return -parseUnary();
    return parsePrimary();
  }
  function parsePrimary() {
    const t = peek();
    if (t == null) throw new Error("Expression incomplète.");
    if (/^\d/.test(t)) { i++; return Number(t); }
    if (t === "(") {
      i++;
      const v = parseAdd();
      if (!eat(")")) throw new Error("Parenthèse fermante manquante.");
      return v;
    }
    if (t.toLowerCase() in CONSTANTS) { i++; return CONSTANTS[t.toLowerCase()]; }
    if (t.toLowerCase() in FUNS) {
      const fn = FUNS[t.toLowerCase()];
      i++;
      if (!eat("(")) throw new Error(`« ${t} » attend une parenthèse.`);
      const v = parseAdd();
      if (!eat(")")) throw new Error("Parenthèse fermante manquante.");
      const out = fn(v);
      if (!Number.isFinite(out)) throw new Error("Résultat non défini.");
      return out;
    }
    throw new Error(`Symbole inconnu : « ${t} ».`);
  }
  const value = parseAdd();
  if (i !== tokens.length) throw new Error(`Reste non lu : « ${tokens.slice(i).join("")} ».`);
  if (!Number.isFinite(value)) throw new Error("Résultat non défini.");
  return String(value);
}

const JS_BLOCKED = /\b(fetch|XMLHttpRequest|WebSocket|importScripts|import\s|export\s|eval|Function|Worker|SharedWorker|ServiceWorker|document|window|localStorage|sessionStorage|indexedDB|caches|navigator|location|process|require|Deno|Bun|globalThis\.fetch)\b/;

export function evalJsSandbox(code, timeoutMs = 800) {
  const src = String(code || "").trim();
  if (!src) throw new Error("Code vide.");
  if (src.length > 4000) throw new Error("Code trop long.");
  if (JS_BLOCKED.test(src)) throw new Error("Le code contient une instruction interdite dans le bac à sable (réseau, API du navigateur, eval).");
  return new Promise((resolve, reject) => {
    const blob = new Blob([`"use strict";
self.onmessage = (e) => {
  try {
    const raw = String(e.data);
    const result = Function('"use strict"; return (function(){ return (' + raw + '); })();')();
    let out = result;
    if (typeof out === "object") {
      try { out = JSON.stringify(out, null, 2); }
      catch { out = String(out); }
    } else out = String(out);
    self.postMessage({ ok: true, result: out });
  } catch (err) {
    self.postMessage({ ok: false, error: err && err.message ? err.message : String(err) });
  }
};
`], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      reject(new Error("Le script a dépassé le délai de 800 ms."));
    }, timeoutMs);
    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      if (e.data?.ok) resolve(truncateText(e.data.result, 2000));
      else reject(new Error(e.data?.error || "Erreur dans le bac à sable."));
    };
    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      reject(new Error(e.message || "Erreur dans le bac à sable."));
    };
    worker.postMessage(src);
  });
}

function nowInfo({ timeZone } = {}) {
  const tz = String(timeZone || "Europe/Paris").trim() || "Europe/Paris";
  const date = new Date();
  let formatted;
  try {
    formatted = new Intl.DateTimeFormat("fr-FR", {
      timeZone: tz,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date);
  } catch {
    throw new Error("Fuseau horaire inconnu.");
  }
  return [
    `Fuseau : ${tz}`,
    `Affichage : ${formatted}`,
    `ISO UTC : ${date.toISOString()}`,
    `Horodatage : ${date.getTime()}`,
  ].join("\n");
}

export async function runBuiltin(name, args = {}) {
  switch (name) {
    case "calculator":
      return calculate(args.expression);
    case "js_eval":
      return evalJsSandbox(args.code);
    case "now":
      return nowInfo(args);
    case "web_search":
      return webSearch(args);
    case "web_fetch":
      return webFetch(args);
    case "notes_list": {
      const rows = await listNotes();
      if (!rows.length) return "Aucune note.";
      return rows.map((n) => `- ${n.id} · ${n.title} (${new Date(n.updatedAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })})`).join("\n");
    }
    case "notes_read": {
      const n = await getNote(args.id);
      if (!n) throw new Error("Note introuvable.");
      return truncateText(`# ${n.title}\n\n${n.content}`, 4000);
    }
    case "notes_write": {
      const n = await upsertNote(args);
      return `Note enregistrée (id : ${n.id}, titre : ${n.title}).`;
    }
    case "notes_delete": {
      const n = await getNote(args.id);
      if (!n) throw new Error("Note introuvable.");
      await deleteNote(args.id);
      return `Note « ${n.title} » supprimée.`;
    }
    case "connect_app": {
      const { connectApps } = await import("./mcp.js?v=11");
      return connectApps(args.apps);
    }
    default:
      throw new Error(`Outil inconnu : ${name}`);
  }
}
