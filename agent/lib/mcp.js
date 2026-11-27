import {
  Client,
  StreamableHTTPClientTransport,
  SSEClientTransport,
  UnauthorizedError,
} from "https://esm.sh/@modelcontextprotocol/client@2.4.0?bundle&deps=zod@4.1.8";

const STORAGE_KEY = "exior-agent-connectors";
const OAUTH_PREFIX = "exior-agent-oauth:";

export function loadConnectors() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveConnectors(list) {
  const safe = list.map((c) => ({
    id: c.id,
    name: c.name,
    url: c.url,
    token: c.token || "",
    oauth: !!c.oauth,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
}

function corsHint(err) {
  const msg = String(err && err.message ? err.message : err);
  if (/failed to fetch|networkerror|load failed|cors/i.test(msg)) {
    return "Connexion bloquée (souvent un problème CORS). Le serveur MCP doit autoriser les requêtes depuis cette page GitHub Pages.";
  }
  return msg;
}

function kv(prefix, key, value) {
  const k = prefix + key;
  if (arguments.length === 3) {
    if (value === undefined) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(value));
    return value;
  }
  try { return JSON.parse(localStorage.getItem(k) || "null"); }
  catch { return null; }
}

export function oauthRedirectUrl() {
  return `${location.origin}${location.pathname}`;
}

/** Official OAuthClientProvider, persisted in this browser only. */
export function createBrowserOAuthProvider(connectorId, name = "EXIOR Agent") {
  const prefix = `${OAUTH_PREFIX}${connectorId}:`;
  return {
    get redirectUrl() { return oauthRedirectUrl(); },
    get clientMetadata() {
      return {
        client_name: name,
        redirect_uris: [oauthRedirectUrl()],
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
        application_type: "web",
      };
    },
    clientInformation(ctx) {
      return kv(prefix, "clientInfo:" + (ctx?.issuer || "default"));
    },
    saveClientInformation(info, ctx) {
      kv(prefix, "clientInfo:" + (ctx?.issuer || "default"), info);
    },
    tokens() { return kv(prefix, "tokens"); },
    saveTokens(tokens) { kv(prefix, "tokens", tokens); },
    state() {
      const s = crypto.randomUUID();
      kv(prefix, "state", s);
      return s;
    },
    saveDiscoveryState(state) { kv(prefix, "discovery", state); },
    discoveryState() { return kv(prefix, "discovery"); },
    codeVerifier() { return kv(prefix, "verifier"); },
    saveCodeVerifier(v) { kv(prefix, "verifier", v); },
    redirectToAuthorization(url) {
      sessionStorage.setItem("exior-agent-oauth-pending", connectorId);
      location.href = url.toString();
    },
  };
}

function authOptions(connector) {
  if (connector.oauth) {
    return { authProvider: createBrowserOAuthProvider(connector.id, connector.name) };
  }
  if (connector.token) {
    const token = connector.token;
    return { authProvider: { token: async () => token } };
  }
  return {};
}

export async function finishPendingOAuth() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  if (!code) return null;
  const id = sessionStorage.getItem("exior-agent-oauth-pending");
  if (!id) return { error: "Aucun connecteur en attente d'autorisation." };
  const connector = loadConnectors().find((c) => c.id === id);
  if (!connector) return { error: "Connecteur introuvable pour terminer l'autorisation." };
  const transport = new StreamableHTTPClientTransport(new URL(connector.url), authOptions({ ...connector, oauth: true }));
  try {
    if (typeof transport.finishAuth === "function") {
      await transport.finishAuth(code);
    }
    sessionStorage.removeItem("exior-agent-oauth-pending");
    const clean = new URL(location.href);
    clean.searchParams.delete("code");
    clean.searchParams.delete("state");
    history.replaceState({}, "", clean.pathname + clean.search + clean.hash);
    const probed = await probeConnector({ ...connector, oauth: true });
    return { connector, ...probed };
  } catch (err) {
    return { error: corsHint(err) };
  }
}

async function connectWith(connector, Transport) {
  const client = new Client({ name: "exior-agent", version: "1.0.0" });
  const transport = new Transport(new URL(connector.url), authOptions(connector));
  await client.connect(transport);
  return { client, transport };
}

export async function probeConnector(connector) {
  try {
    const { client, transport } = await connectWith(connector, StreamableHTTPClientTransport);
    const listed = await client.listTools();
    const tools = listed?.tools || listed || [];
    return { client, transport, tools, info: client.getServerVersion?.() || null };
  } catch (err) {
    if (UnauthorizedError.isInstance?.(err) || err instanceof UnauthorizedError) {
      throw new Error("Autorisation requise. Activez OAuth ou fournissez un jeton, puis réessayez.");
    }
    try {
      const { client, transport } = await connectWith(connector, SSEClientTransport);
      const listed = await client.listTools();
      const tools = listed?.tools || listed || [];
      return { client, transport, tools, info: client.getServerVersion?.() || null };
    } catch (err2) {
      throw new Error(corsHint(err) + (err2 && err2.message !== err.message ? " " + corsHint(err2) : ""));
    }
  }
}

export async function callMcpTool(client, name, args) {
  const result = await client.callTool({ name, arguments: args || {} });
  if (result?.isError) {
    const text = (result.content || []).map((c) => c.text || "").join("\n").trim();
    throw new Error(text || "Le connecteur a renvoyé une erreur.");
  }
  const parts = result?.content || [];
  const text = parts.map((c) => {
    if (c.type === "text") return c.text || "";
    if (c.type === "resource" && c.resource) return JSON.stringify(c.resource);
    return c.text || JSON.stringify(c);
  }).join("\n").trim();
  return text || JSON.stringify(result ?? {});
}


export const PRESET_CONNECTORS = [
  {
    id: "context7",
    name: "Context7",
    url: "https://mcp.context7.com/mcp",
    blurb: "Documentation à jour des bibliothèques.",
    auth: "none",
    cors: true,
    tag: "Sans compte",
  },
  {
    id: "deepwiki",
    name: "DeepWiki",
    url: "https://mcp.deepwiki.com/mcp",
    blurb: "Questions sur des dépôts documentés.",
    auth: "none",
    cors: true,
    tag: "Sans compte",
  },
  {
    id: "ms-learn",
    name: "Microsoft Learn",
    url: "https://learn.microsoft.com/api/mcp",
    blurb: "Documentation et exemples Microsoft.",
    auth: "none",
    cors: true,
    tag: "Sans compte",
  },
  {
    id: "github",
    name: "GitHub",
    url: "https://api.githubcopilot.com/mcp/",
    blurb: "Repos, issues, pull requests. Jeton GitHub (PAT) ou OAuth.",
    auth: "token-or-oauth",
    cors: true,
    tag: "Jeton ou OAuth",
  },
  {
    id: "notion",
    name: "Notion",
    url: "https://mcp.notion.com/mcp",
    blurb: "Pages et bases Notion.",
    auth: "oauth",
    cors: true,
    tag: "OAuth",
  },
  {
    id: "linear",
    name: "Linear",
    url: "https://mcp.linear.app/mcp",
    blurb: "Issues et projets Linear.",
    auth: "oauth",
    cors: true,
    tag: "OAuth",
  },
  {
    id: "figma",
    name: "Figma",
    url: "https://mcp.figma.com/mcp",
    blurb: "Fichiers et composants Figma.",
    auth: "oauth",
    cors: true,
    tag: "OAuth",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    url: "https://huggingface.co/mcp",
    blurb: "Modèles et dépôts Hugging Face. Jeton optionnel.",
    auth: "token",
    cors: true,
    tag: "Jeton optionnel",
  },
  {
    id: "paypal",
    name: "PayPal",
    url: "https://mcp.paypal.com/mcp",
    blurb: "Paiements et activité PayPal.",
    auth: "oauth",
    cors: true,
    tag: "OAuth",
  },
  {
    id: "atlassian",
    name: "Atlassian",
    url: "https://mcp.atlassian.com/v1/sse",
    blurb: "Jira et Confluence (SSE).",
    auth: "oauth",
    cors: true,
    tag: "OAuth",
  },
  {
    id: "stripe",
    name: "Stripe",
    url: "https://mcp.stripe.com",
    blurb: "Paiements Stripe. Le serveur refuse les appels depuis un navigateur (CORS).",
    auth: "oauth",
    cors: false,
    tag: "CORS bloqué",
  },
  {
    id: "sentry",
    name: "Sentry",
    url: "https://mcp.sentry.dev/mcp",
    blurb: "Erreurs et projets Sentry. Bloqué par CORS depuis le navigateur.",
    auth: "oauth",
    cors: false,
    tag: "CORS bloqué",
  },
];

const APP_ALIASES = {
  github: "github", gh: "github", git: "github",
  notion: "notion",
  linear: "linear",
  figma: "figma",
  paypal: "paypal",
  atlassian: "atlassian", jira: "atlassian", confluence: "atlassian",
  huggingface: "huggingface", "hugging face": "huggingface", hf: "huggingface",
  context7: "context7", deepwiki: "deepwiki",
  "microsoft learn": "ms-learn", microsoft: "ms-learn",
};

export async function beginOAuthLink(connector) {
  let authUrl = null;
  const provider = createBrowserOAuthProvider(connector.id, "EXIORBOT");
  provider.redirectToAuthorization = (url) => {
    sessionStorage.setItem("exior-agent-oauth-pending", connector.id);
    authUrl = url.toString();
  };
  async function tryTransport(Transport) {
    const client = new Client({ name: "exiorbot", version: "1.0.0" });
    const transport = new Transport(new URL(connector.url), { authProvider: provider });
    await client.connect(transport);
    const listed = await client.listTools();
    const tools = listed?.tools || listed || [];
    return { already: true, name: connector.name, tools: tools.map((t) => t.name), client };
  }
  try {
    return await tryTransport(StreamableHTTPClientTransport);
  } catch (err) {
    if (authUrl) return { url: authUrl, name: connector.name };
    try {
      return await tryTransport(SSEClientTransport);
    } catch (err2) {
      if (authUrl) return { url: authUrl, name: connector.name };
      throw new Error(corsHint(err));
    }
  }
}

export async function connectApps(appsRaw) {
  let names = [];
  if (Array.isArray(appsRaw)) names = appsRaw;
  else names = String(appsRaw || "").split(/[,;+/]|\bet\b/i);
  names = names.map((n) => String(n || "").trim().toLowerCase()).filter(Boolean);
  if (!names.length) throw new Error("Précisez au moins une app à connecter (ex. GitHub).");
  const lines = [];
  const saved = loadConnectors();
  for (const name of names) {
    if (/gmail|google\s*mail|google\s*workspace|messagerie google/.test(name)) {
      lines.push("Gmail : il n'existe pas de connecteur officiel utilisable depuis une page web statique (Google ne l'autorise pas sans une plateforme intermédiaire). Je ne peux donc pas ouvrir la connexion Gmail ici, sans te demander de clé.");
      continue;
    }
    if (/composio|activepieces|slack|odoo|hubspot|drive|google drive/.test(name) && !APP_ALIASES[name]) {
      lines.push(name + " : connexion directe depuis cette page impossible sans une clé de plateforme tierce. Les apps disponibles sans clé à coller sont GitHub, Notion, Linear, Figma, PayPal et Atlassian (connexion par autorisation, un clic).");
      continue;
    }
    const slug = APP_ALIASES[name] || name;
    const preset = PRESET_CONNECTORS.find((p) => p.id === slug || p.name.toLowerCase() === name);
    if (!preset) {
      lines.push(name + " : pas de connecteur connu pour cette app depuis le navigateur.");
      continue;
    }
    if (preset.cors === false) {
      lines.push(preset.name + " : le serveur refuse les appels depuis une page web (CORS).");
      continue;
    }
    if (preset.auth === "none") {
      const connector = { id: preset.id, name: preset.name, url: preset.url, token: "", oauth: false };
      if (!saved.some((c) => c.url.replace(/\/+$/, "") === connector.url.replace(/\/+$/, ""))) {
        saved.push(connector);
        saveConnectors(saved);
      }
      lines.push(preset.name + " : déjà utilisable, sans compte. Ajouté à tes connecteurs.");
      continue;
    }
    const connector = {
      id: preset.id,
      name: preset.name,
      url: preset.url,
      token: "",
      oauth: true,
    };
    if (!saved.some((c) => c.id === connector.id || c.url.replace(/\/+$/, "") === connector.url.replace(/\/+$/, ""))) {
      saved.push(connector);
      saveConnectors(saved);
    }
    try {
      const res = await beginOAuthLink(connector);
      if (res.already) {
        lines.push(preset.name + " : déjà autorisé" + (res.tools && res.tools.length ? " · outils : " + res.tools.slice(0, 8).join(", ") : "") + ".");
      } else if (res.url) {
        lines.push("Pour connecter " + preset.name + ", ouvre ce lien d'autorisation (un clic, tu te connectes avec ton compte " + preset.name + ", sans coller de clé) :\n" + res.url);
      } else {
        lines.push(preset.name + " : connexion commencée.");
      }
    } catch (err) {
      lines.push(preset.name + " : " + (err.message || err));
    }
  }
  return lines.join("\n\n");
}
