import {
  Client,
  StreamableHTTPClientTransport,
  SSEClientTransport,
  UnauthorizedError,
} from "https://esm.sh/@modelcontextprotocol/client@2.4.0?bundle";

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
