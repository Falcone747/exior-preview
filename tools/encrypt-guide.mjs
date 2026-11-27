#!/usr/bin/env node
/**
 * Chiffre le guide syndic hors du dépôt public.
 *
 *   node tools/encrypt-guide.mjs \
 *     --guide guide-src \
 *     --index _sources/syndics/guide-index.md \
 *     --codes codes.txt \
 *     --out syndics/espace/data
 *
 * --guide  dossier local des chapitres .md (jamais commité : guide-src/)
 * --codes  un code par ligne, 16 caractères minimum, fichier non commité
 * --index  sommaire public (titres et descriptions seulement)
 * --out    dossier de sortie (manifeste public, enveloppes, chapitres .bin)
 *
 * Le script tamponne aussi, s'ils existent :
 *   syndics/index.html          (grille des parties + extrait du chapitre 1.1)
 *   syndics/sommaire/index.html (table des matières publique)
 *
 * AES-256-GCM. La clé de contenu K est aléatoire. Chaque code enveloppe K
 * via PBKDF2-SHA256 (310 000 itérations, sel aléatoire). Les codes ne sont
 * pas écrits dans la sortie.
 */
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ITERATIONS = 310000;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function arg(name, fallback) {
  const i = process.argv.indexOf("--" + name);
  if (i === -1 || !process.argv[i + 1] || process.argv[i + 1].startsWith("--")) return fallback;
  return process.argv[i + 1];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "\u2019"
  }[c]));
}

function inline(source) {
  let out = escapeHtml(source);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  return out;
}

function slug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isTableSep(line) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function splitRow(line) {
  const raw = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return raw.split("|").map((cell) => cell.trim());
}

export function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  function pushParagraph(buf) {
    const text = buf.join(" ").trim();
    if (text) blocks.push({ type: "p", html: `<p>${inline(text)}</p>`, text });
  }

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = slug(text);
      blocks.push({
        type: "h" + level,
        text,
        html: `<h${level}${level === 2 ? ` id="${id}"` : ""}>${inline(text)}</h${level}>`
      });
      i += 1;
      continue;
    }

    if (line.trim().startsWith(">")) {
      const buf = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      const htmlInner = inline(buf.join(" "));
      let cls = "callout";
      if (htmlInner.startsWith("<strong>Point de vigilance.</strong>")) cls = "callout callout-alert";
      else if (!htmlInner.startsWith("<strong>En pratique.</strong>")) cls = "quote";
      blocks.push({ type: "quote", text: buf.join(" "), html: `<aside class="${cls}"><p>${htmlInner}</p></aside>` });
      continue;
    }

    if (line.trim().startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i]);
        i += 1;
      }
      const body = [];
      let header = null;
      rows.forEach((row) => {
        if (isTableSep(row)) return;
        const cells = splitRow(row);
        if (!header) header = cells;
        else body.push(cells);
      });
      if (header) {
        const thead = `<tr>${header.map((c) => `<th>${inline(c)}</th>`).join("")}</tr>`;
        const tbody = body.map((cells) => `<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("");
        blocks.push({
          type: "table",
          text: rows.join(" "),
          html: `<div class="board prose-board"><table><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`
        });
      }
      continue;
    }

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items = [];
      const re = ordered ? /^\d+\.\s+(.*)$/ : /^[-*]\s+(.*)$/;
      while (i < lines.length && re.test(lines[i])) {
        items.push(inline(lines[i].replace(re, "$1")));
        i += 1;
      }
      const tag = ordered ? "ol" : "ul";
      blocks.push({
        type: "list",
        text: items.join(" "),
        html: `<${tag}>${items.map((item) => `<li>${item}</li>`).join("")}</${tag}>`
      });
      continue;
    }

    const buf = [line.trim()];
    i += 1;
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|>|\||[-*]\s|\d+\.\s)/.test(lines[i])) {
      buf.push(lines[i].trim());
      i += 1;
    }
    pushParagraph(buf);
  }

  let html = "";
  for (let n = 0; n < blocks.length; n += 1) {
    if (blocks[n].type === "h2" && blocks[n].text === "À retenir") {
      const inner = [blocks[n].html];
      n += 1;
      while (n < blocks.length && blocks[n].type !== "h2" && blocks[n].type !== "h1") {
        inner.push(blocks[n].html);
        n += 1;
      }
      n -= 1;
      html += `<section class="takeaway">${inner.join("")}</section>`;
    } else if (blocks[n].type !== "h1") {
      html += blocks[n].html;
    }
  }
  const headings = blocks.filter((b) => b.type === "h2").map((b) => b.text);
  const title = (blocks.find((b) => b.type === "h1") || {}).text || "";
  const paragraphs = blocks.filter((b) => b.type === "p").slice(0, 3).map((b) => b.html);
  const text = blocks.map((b) => b.text || "").join("\n");
  return { html, headings, title, paragraphs, text };
}

export function parseGuideIndex(markdown) {
  const parts = [];
  let current = null;
  markdown.split("\n").forEach((raw) => {
    const line = raw.trim();
    const part = /^## Partie (\d+) — (.+?) \(`([^`]+)`\)/.exec(line);
    if (part) {
      current = {
        num: Number(part[1]),
        title: part[2].trim(),
        id: part[3].replace(/\/$/, ""),
        chapters: []
      };
      parts.push(current);
      return;
    }
    const chapter = /^\d+\.\s+✅\s+`([^`]+)`\s+—\s+(.+)$/.exec(line);
    if (chapter && current) {
      const rest = chapter[2].trim();
      const cut = rest.indexOf(" : ");
      current.chapters.push({
        id: chapter[1].replace(/\.md$/, ""),
        file: chapter[1],
        num: current.chapters.length + 1,
        title: cut === -1 ? rest : rest.slice(0, cut).trim(),
        summary: cut === -1 ? "" : rest.slice(cut + 3).trim()
      });
    }
  });
  return parts;
}

function walkMarkdown(dir, acc) {
  readdirSync(dir).forEach((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walkMarkdown(full, acc);
    else if (name.endsWith(".md")) acc.push(full);
  });
  return acc;
}

function aesEncrypt(key, plain) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(plain), cipher.final(), cipher.getAuthTag()]);
  return Buffer.concat([iv, body]);
}

function aesDecrypt(key, payload) {
  const iv = payload.subarray(0, 12);
  const body = payload.subarray(12, payload.length - 16);
  const tag = payload.subarray(payload.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]);
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function stamp(file, start, end, inner) {
  if (!statExists(file)) return false;
  const html = readFileSync(file, "utf8");
  const token = start + "\n" + end;
  const block = start + "\n" + inner.trim() + "\n" + end;
  if (!html.includes(start) || !html.includes(end)) return false;
  const re = new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*?" + end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  writeFileSync(file, html.replace(re, block));
  return html.includes(token) || true;
}

function statExists(file) {
  try { statSync(file); return true; } catch { return false; }
}

function chapterCards(parts) {
  return parts.map((part) => {
    const n = part.chapters.length;
    const label = n > 1 ? n + " chapitres" : n + " chapitre";
    return `<a class="part-card" href="sommaire/#partie-${part.num}"><span class="num">${String(part.num).padStart(2, "0")}</span><strong>${escapeHtml(part.title)}</strong><span class="count">${label}</span></a>`;
  }).join("\n");
}

function sommaireHtml(parts) {
  const jump = parts.map((part) => `<a href="#partie-${part.num}">${part.num}. ${escapeHtml(part.title)}</a>`).join("\n");
  const blocks = parts.map((part) => {
    const rows = part.chapters.map((ch) => {
      const summary = ch.summary ? `<span>${escapeHtml(ch.summary)}</span>` : "";
      return `<a class="toc-row" href="../espace/#/${ch.id}"><span class="num">${String(ch.num).padStart(2, "0")}</span><span class="toc-copy"><strong>${escapeHtml(ch.title)}</strong>${summary}</span></a>`;
    }).join("\n");
    const n = part.chapters.length;
    return `<section class="toc-part" id="partie-${part.num}"><p class="num">Partie ${part.num}</p><h2>${escapeHtml(part.title)}</h2><p class="note">${n} chapitre${n > 1 ? "s" : ""}</p><div class="toc-list">${rows}</div></section>`;
  }).join("\n");
  return `<nav class="part-jump" aria-label="Parties">${jump}</nav>\n${blocks}`;
}

function loadCodes(file) {
  return readFileSync(file, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function main() {
  const guideDir = path.resolve(arg("guide", ""));
  const indexFile = path.resolve(arg("index", path.join(ROOT, "_sources/syndics/guide-index.md")));
  const codesFile = path.resolve(arg("codes", ""));
  const outDir = path.resolve(arg("out", path.join(ROOT, "syndics/espace/data")));

  if (!arg("guide") || !arg("codes")) {
    console.error("Usage: node tools/encrypt-guide.mjs --guide <dossier> --codes <fichier> [--index sommaire.md] [--out syndics/espace/data]");
    process.exit(1);
  }

  const parts = parseGuideIndex(readFileSync(indexFile, "utf8"));
  const total = parts.reduce((sum, part) => sum + part.chapters.length, 0);
  if (parts.length !== 10 || total !== 112) {
    throw new Error("Sommaire inattendu : " + parts.length + " parties, " + total + " chapitres.");
  }

  const byId = new Map();
  parts.forEach((part) => part.chapters.forEach((ch) => byId.set(ch.id, { ...ch, partId: part.id, partNum: part.num, partTitle: part.title })));

  const files = walkMarkdown(guideDir, []);
  const chapters = [];
  files.forEach((file) => {
    const rel = path.relative(guideDir, file).split(path.sep).join("/");
    const id = rel.replace(/\.md$/, "");
    const meta = byId.get(id);
    if (!meta) throw new Error("Chapitre hors sommaire : " + rel);
    const parsed = markdownToHtml(readFileSync(file, "utf8"));
    chapters.push({ meta, parsed, rel });
  });
  if (!chapters.length) throw new Error("Aucun chapitre dans " + guideDir);

  const codes = loadCodes(codesFile);
  if (!codes.length) throw new Error("Aucun code dans " + codesFile);
  codes.forEach((code) => {
    if (code.length < 16) throw new Error("Code trop court (16 caractères minimum).");
  });

  const contentKey = randomBytes(32);
  const envelopes = codes.map((code) => {
    const salt = randomBytes(16);
    const derived = pbkdf2Sync(code, salt, ITERATIONS, 32, "sha256");
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", derived, iv);
    const wrapped = Buffer.concat([cipher.update(contentKey), cipher.final(), cipher.getAuthTag()]);
    const check = createDecipheriv("aes-256-gcm", derived, iv);
    check.setAuthTag(wrapped.subarray(wrapped.length - 16));
    const back = Buffer.concat([check.update(wrapped.subarray(0, wrapped.length - 16)), check.final()]);
    if (!back.equals(contentKey)) throw new Error("Enveloppe illisible.");
    return { salt: salt.toString("base64"), iv: iv.toString("base64"), wrapped: wrapped.toString("base64") };
  });

  const binDir = path.join(outDir, "c");
  rmSync(binDir, { recursive: true, force: true });
  mkdirSync(binDir, { recursive: true });

  const indexDoc = {
    chapters: chapters.map(({ meta, parsed }) => ({
      id: meta.id,
      partId: meta.partId,
      partNum: meta.partNum,
      title: parsed.title || meta.title,
      headings: parsed.headings,
      words: wordCount(parsed.text),
      text: parsed.text
    }))
  };
  writeFileSync(path.join(binDir, "index.bin"), aesEncrypt(contentKey, Buffer.from(JSON.stringify(indexDoc), "utf8")));
  chapters.forEach(({ meta, parsed }) => {
    const target = path.join(binDir, meta.id + ".bin");
    mkdirSync(path.dirname(target), { recursive: true });
    const payload = aesEncrypt(contentKey, Buffer.from(parsed.html, "utf8"));
    writeFileSync(target, payload);
    const back = aesDecrypt(contentKey, payload).toString("utf8");
    if (back !== parsed.html) throw new Error("Contrôle de déchiffrement échoué : " + meta.id);
  });

  const first = chapters.find((ch) => ch.meta.id === "01-comprendre/01-systeme-ia-souverain") || chapters[0];
  const publicManifest = {
    title: "Votre système IA souverain",
    parts: parts.map((part) => ({
      num: part.num,
      id: part.id,
      title: part.title,
      chapters: part.chapters.map((ch) => ({
        num: ch.num,
        id: ch.id,
        title: ch.title,
        summary: ch.summary
      }))
    }))
  };
  writeFileSync(path.join(outDir, "manifest.public.json"), JSON.stringify(publicManifest, null, 2) + "\n");
  writeFileSync(path.join(outDir, "keys.json"), JSON.stringify({
    version: 1,
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: ITERATIONS,
    envelopes
  }, null, 2) + "\n");

  const sales = path.join(ROOT, "syndics/index.html");
  const sommaire = path.join(ROOT, "syndics/sommaire/index.html");
  stamp(sales, "<!-- PARTS:START -->", "<!-- PARTS:END -->", chapterCards(parts));
  stamp(sales, "<!-- EXCERPT:START -->", "<!-- EXCERPT:END -->", first.parsed.paragraphs.slice(0, 3).join("\n"));
  stamp(sommaire, "<!-- TOC:START -->", "<!-- TOC:END -->", sommaireHtml(parts));

  console.log("Parties : " + parts.length + " · chapitres du sommaire : " + total);
  console.log("Chapitres chiffrés : " + chapters.length + " · enveloppes : " + envelopes.length);
  console.log("Sortie : " + outDir);
}

main();
