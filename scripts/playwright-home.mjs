import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const url = process.env.PAGE_URL || "http://127.0.0.1:8080/";
const outDir = path.join(root, "captures");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"]
});

const defects = [];

function luminance(hex) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const lin = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function contrast(a, b) {
  const L1 = luminance(a);
  const L2 = luminance(b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}
function parseColor(c) {
  const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return "#" + [m[1], m[2], m[3]].map((x) => Number(x).toString(16).padStart(2, "0")).join("");
}

async function shoot(width, height, name) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const logs = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") logs.push(msg.text());
  });
  page.on("pageerror", (err) => logs.push(String(err)));
  const failed = [];
  page.on("response", (res) => {
    if (res.status() >= 400) failed.push(res.status() + " " + res.url());
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const file = path.join(outDir, name);
  await page.screenshot({ path: file });
  const metrics = await page.evaluate(() => {
    const heroBtn = document.querySelector(".hero .btn");
    const r = heroBtn.getBoundingClientRect();
    const h1 = document.querySelector("h1");
    const hs = getComputedStyle(h1);
    const body = getComputedStyle(document.body);
    const samples = [];
    for (const el of document.querySelectorAll("h1, h2, p, a.btn, label, figcaption, .fine, .data-note, summary")) {
      const s = getComputedStyle(el);
      if (s.opacity === "0" || s.visibility === "hidden") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      samples.push({
        tag: el.tagName,
        text: (el.innerText || "").slice(0, 48),
        color: s.color,
        bg: s.backgroundColor,
        size: parseFloat(s.fontSize),
        opacity: s.opacity
      });
    }
    const doc = document.documentElement;
    return {
      overflow: doc.scrollWidth - doc.clientWidth,
      cta: { top: r.top, bottom: r.bottom, left: r.left, right: r.right, text: heroBtn.innerText },
      h1opacity: hs.opacity,
      bodySize: parseFloat(body.fontSize),
      buttons: [...document.querySelectorAll("a.btn, button.btn")].map((b) => [...b.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim()),
      samples
    };
  });
  if (metrics.overflow > 1) defects.push(name + " débordement horizontal " + metrics.overflow + "px");
  if (metrics.h1opacity !== "1") defects.push(name + " hero h1 opacity " + metrics.h1opacity);
  if (width === 390) {
    const v = height;
    if (metrics.cta.top < 0 || metrics.cta.bottom > v || metrics.cta.left < 0 || metrics.cta.right > width) {
      defects.push(name + " CTA hors écran " + JSON.stringify(metrics.cta));
    }
    if (metrics.bodySize < 16) defects.push(name + " corps " + metrics.bodySize);
  }
  const badBtn = metrics.buttons.filter((t) => t !== "Obtenir mon architecture");
  if (badBtn.length) defects.push(name + " boutons inattendus: " + badBtn.join(" | "));
  if (logs.length) defects.push(name + " console: " + logs.join(" | "));
  if (failed.length) defects.push(name + " http: " + failed.join(" | "));
  await page.close();
  return file;
}

const a = await shoot(1280, 860, "desktop-1280.png");
const b = await shoot(390, 844, "mobile-390.png");
await browser.close();
console.log(a);
console.log(b);
if (defects.length) {
  console.log("DEFECTS");
  for (const d of defects) console.log("- " + d);
  process.exit(1);
}
console.log("DEFECTS none");
