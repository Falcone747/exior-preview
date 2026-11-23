import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function loadPlaywright() {
  const candidates = [
    "/tmp/exior-tools/package.json",
    path.resolve("package.json"),
  ];
  for (const pkg of candidates) {
    try {
      return createRequire(pkg)("playwright");
    } catch {
      /* essai suivant */
    }
  }
  throw new Error("Installez playwright pour lancer ce script.");
}
const { chromium } = loadPlaywright();

const base = process.argv[2] || "http://127.0.0.1:8080/";
const out = path.resolve("captures");
const shots = ["hero", "enonce", "meta-os", "agents", "connecteurs", "comment", "ressources", "tarifs", "demarrer", "pied"];
const views = [
  { name: "1280", width: 1280, height: 860 },
  { name: "390", width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true });
const errors = [];

for (const view of views) {
  const dir = path.join(out, view.name);
  await mkdir(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: view.width, height: view.height } });
  const logs = [];
  page.on("pageerror", (err) => logs.push("pageerror: " + err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") logs.push("console: " + msg.text());
  });
  const failed = [];
  page.on("response", (res) => {
    if (res.status() >= 400) failed.push(res.status() + " " + res.url());
  });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 240) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1800);
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll("[data-reveal]")).every((el) => el.classList.contains("in")),
    null,
    { timeout: 8000 }
  );
  const metrics = await page.evaluate(() => {
    const heroBtn = document.querySelector(".hero .btn");
    const r = heroBtn.getBoundingClientRect();
    const cs = getComputedStyle(heroBtn);
    const body = getComputedStyle(document.querySelector(".lead"));
    const hero = getComputedStyle(document.querySelector(".hero"));
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      btnTop: r.top,
      btnBottom: r.bottom,
      btnOpacity: cs.opacity,
      heroOpacity: hero.opacity,
      leadSize: body.fontSize,
      text: document.body.innerText,
    };
  });
  if (metrics.scrollWidth > view.width + 1) errors.push(view.name + " overflow " + metrics.scrollWidth);
  if (metrics.btnTop < 0 || metrics.btnBottom > view.height) errors.push(view.name + " CTA hors écran " + metrics.btnTop + " " + metrics.btnBottom);
  if (Number(metrics.heroOpacity) === 0 || Number(metrics.btnOpacity) === 0) errors.push(view.name + " hero opacity 0");
  if (parseFloat(metrics.leadSize) < 16) errors.push(view.name + " corps " + metrics.leadSize);
  if (/exior\.io|recette|Grok|xAI|RGPD/i.test(metrics.text)) errors.push(view.name + " mot interdit");
  if (!metrics.text.includes("990")) errors.push(view.name + " prix absent");
  if (!metrics.text.includes("Sur devis")) errors.push(view.name + " sur devis absent");
  logs.forEach((l) => errors.push(view.name + " " + l));
  failed.forEach((f) => errors.push(view.name + " " + f));
  await page.screenshot({ path: path.join(dir, "viewport.png") });
  await page.screenshot({ path: path.join(dir, "full.png"), fullPage: true });
  await page.addStyleTag({ content: ".sticky{display:none !important}" });
  for (const id of shots) {
    const el = page.locator(`[data-shot="${id}"]`);
    if (!(await el.count())) continue;
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1600);
    await el.screenshot({ path: path.join(dir, id + ".png") });
  }
  await page.close();
}

await browser.close();
await writeFile(path.join(out, "report.txt"), errors.join("\n") || "rien à corriger\n");
console.log(errors.join("\n") || "rien à corriger");
if (errors.length) process.exit(1);
