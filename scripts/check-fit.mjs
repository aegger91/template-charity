// Loads every exported page in every language at each test width and reports
// horizontal overflow, clipped button or link text, and pages that cannot scroll.
// Usage: npm run build && npm run check:fit [-- --widths=360,1440 --only=/es/]
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { serve } from "./serve-static.mjs";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const widths = (args.widths ?? "360,390,768,1280,1440").split(",").map(Number);
const out = fileURLToPath(new URL("../out", import.meta.url));
const port = 4319;

const pages = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f === "index.html") pages.push("/" + relative(out, dir).split("\\").join("/") + (dir === out ? "" : "/"));
  }
};
walk(out);
const targets = pages.filter((p) => p !== "/" && !p.startsWith("/_next")).filter((p) => !args.only || p.startsWith(args.only)).sort();

const server = await serve(out, port);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? findChrome() });
const problems = [];
let checked = 0;

async function check(context, path, width) {
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: "load" });
  await page.waitForTimeout(150);
  const result = await page.evaluate(async () => {
    const vw = document.documentElement.clientWidth;
    const issues = [];
    const step = Math.max(400, innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 20));
    }
    const scrolled = scrollY > 0 || document.documentElement.scrollHeight <= innerHeight + 2;
    if (!scrolled) issues.push("page did not scroll");
    if (document.documentElement.scrollWidth > vw + 1) {
      const wide = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !el.closest("[data-overflow-ok], .sr-only");
        })
        .slice(0, 3)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")}`);
      issues.push(`page is ${document.documentElement.scrollWidth}px wide (viewport ${vw}px): ${wide.join(", ")}`);
    }
    for (const el of document.querySelectorAll("a, button, [role=tab]")) {
      if (el.closest(".sr-only, [data-overflow-ok]") || el.classList.contains("truncate") || el.querySelector(".truncate")) continue;
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      const label = `${el.tagName.toLowerCase()}: "${el.textContent.trim().slice(0, 40)}"`;
      if (getComputedStyle(el).overflow !== "visible" && el.scrollWidth > el.clientWidth + 2) issues.push(`clipped text in ${label}`);
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).overflowX === "visible") continue;
        const box = a.getBoundingClientRect();
        if (a.scrollWidth <= a.clientWidth + 1) break;
        if (r.right > box.right + 2 || r.left < box.left - 2) issues.push(`cut off by a clipping container: ${label}`);
        break;
      }
    }
    for (const svg of document.querySelectorAll("[data-orthodox-cross]")) {
      let flips = 0;
      for (let el = svg; el && el !== document.body; el = el.parentElement) {
        const t = getComputedStyle(el).transform;
        if (t !== "none" && new DOMMatrix(t).a < 0) flips++;
      }
      if (flips % 2) issues.push("a cross is mirrored");
    }
    return issues;
  });
  await page.close();
  for (const issue of result) problems.push(`${width}px ${path}  ${issue}`);
  checked++;
}

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  const queue = [...targets];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) await check(context, queue.shift(), width);
  }));
  await context.close();
  console.log(`${width}px: ${targets.length} pages checked`);
}

await browser.close();
server.close();

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n  ${[...new Set(problems)].join("\n  ")}`);
  process.exit(1);
}
console.log(`\nAll ${checked} page loads fit and scroll.`);

function findChrome() {
  const candidates = ["/usr/local/bin/google-chrome", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"];
  const found = candidates.find((c) => existsSync(c));
  if (!found) throw new Error("Chrome not found. Set CHROME_PATH.");
  return found;
}
