import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const base = process.env.PAGE_URL || "http://127.0.0.1:8080";
const outDir = path.join(root, "captures");
await mkdir(outDir, { recursive: true });

const pages = [
  ["/", "accueil"],
  ["/architecture-evolutive/", "architecture"],
  ["/comment-ca-marche/", "fonctionnement"],
  ["/applications-metiers/", "metiers"],
  ["/methode/", "methode"],
  ["/faq/", "faq"],
  ["/commander/", "commander"],
];

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const defects = [];

async function shoot(width, height, tag) {
  const page = await browser.newPage({ viewport: { width, height } });
  const logs = [];
  page.on("console", (msg) => { if (msg.type() === "error") logs.push(msg.text()); });
  page.on("pageerror", (err) => logs.push(String(err)));
  for (const [route, name] of pages) {
    const failed = [];
    const onRes = (res) => { if (res.status() >= 400) failed.push(res.status() + " " + res.url()); };
    page.on("response", onRes);
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      const step = Math.max(400, window.innerHeight * 0.7);
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);
    const file = path.join(outDir, `${name}-${tag}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: getComputedStyle(document.querySelector("h1")).opacity,
    }));
    if (metrics.overflow > 1) defects.push(`${name}-${tag} débordement ${metrics.overflow}px`);
    if (metrics.h1 !== "1") defects.push(`${name}-${tag} h1 opacity ${metrics.h1}`);
    if (logs.length) defects.push(`${name}-${tag} console ${logs.join(" | ")}`);
    if (failed.length) defects.push(`${name}-${tag} http ${failed.join(" | ")}`);
    logs.length = 0;
    page.off("response", onRes);
    console.log(file);
  }
  await page.close();
}

await shoot(1280, 860, "1280");
await shoot(390, 844, "390");

const crawl = await browser.newPage();
const seen = new Set();
const broken = [];
async function walk(url) {
  const u = new URL(url, base);
  if (u.origin !== new URL(base).origin) return;
  const key = u.pathname;
  if (seen.has(key)) return;
  seen.add(key);
  const res = await crawl.goto(u.href, { waitUntil: "domcontentloaded" });
  if (!res || res.status() >= 400) broken.push((res && res.status()) + " " + key);
  const hrefs = await crawl.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  for (const href of hrefs) {
    if (!href || href.startsWith("mailto:") || href.startsWith("http")) continue;
    if (href.startsWith("#")) continue;
    await walk(new URL(href, u.href).href);
  }
}
await walk(base + "/");
for (const extra of ["/offre/", "/expertise/", "/situations/", "/sources/", "/privacy/", "/terms/", "/mentions-legales/", "/confidentialite/", "/cgv/"]) {
  await walk(base + extra);
}
await crawl.close();
await browser.close();
console.log("routes", [...seen].join(", "));
if (broken.length) defects.push("liens " + broken.join(" | "));
if (defects.length) {
  console.log("DEFECTS");
  for (const d of defects) console.log("- " + d);
  process.exit(1);
}
console.log("DEFECTS none");
