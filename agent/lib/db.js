const DB_NAME = "exior-agent";
const DB_VER = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("conversations")) {
        db.createObjectStore("conversations", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("notes")) {
        const notes = db.createObjectStore("notes", { keyPath: "id" });
        notes.createIndex("updatedAt", "updatedAt");
      }
      if (!db.objectStoreNames.contains("kv")) {
        db.createObjectStore("kv", { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(store, mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const req = fn(s);
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
    if (req) {
      req.onsuccess = () => {};
      req.onerror = () => reject(req.error);
    }
  });
}

export async function kvGet(key) {
  const row = await tx("kv", "readonly", (s) => s.get(key));
  return row?.value;
}

export async function kvSet(key, value) {
  await tx("kv", "readwrite", (s) => s.put({ key, value }));
}

export function newId() {
  return crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function saveConversation(conv) {
  conv.updatedAt = Date.now();
  await tx("conversations", "readwrite", (s) => s.put(conv));
  return conv;
}

export async function getConversation(id) {
  return tx("conversations", "readonly", (s) => s.get(id));
}

export async function listConversations() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction("conversations", "readonly");
    const req = t.objectStore("conversations").getAll();
    req.onsuccess = () => {
      const rows = req.result || [];
      rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function listNotes() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction("notes", "readonly");
    const req = t.objectStore("notes").getAll();
    req.onsuccess = () => {
      const rows = req.result || [];
      rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getNote(id) {
  return tx("notes", "readonly", (s) => s.get(id));
}

export async function upsertNote({ id, title, content }) {
  const now = Date.now();
  const existing = id ? await getNote(id) : null;
  const note = {
    id: existing?.id || newId(),
    title: (title || existing?.title || "Sans titre").toString().slice(0, 200),
    content: (content ?? existing?.content ?? "").toString().slice(0, 20000),
    updatedAt: now,
    createdAt: existing?.createdAt || now,
  };
  await tx("notes", "readwrite", (s) => s.put(note));
  return note;
}

export async function deleteNote(id) {
  await tx("notes", "readwrite", (s) => s.delete(id));
  return true;
}
