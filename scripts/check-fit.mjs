// Loads every exported page in every language at 360 / 768 / 1280 (and optional
 // extra widths) and flags:
 //   - page-level horizontal overflow
 //   - text / control elements with scrollWidth > clientWidth
 //   - text / control elements with scrollHeight > clientHeight
 //   - overlapping interactive or heading text
 //   - clipped button/link text inside overflow:hidden ancestors
 //   - mirrored Orthodox crosses in RTL
 //   - header height jitter on scroll (sampled once per width × language)
 // Usage: npm run build && npm run check:fit [-- --widths=360,768,1280 --only=/ar/]
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { serve } from "./serve-static.mjs";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const widths = (args.widths ?? "360,768,1280").split(",").map(Number);
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
const targets = pages
  .filter((p) => p !== "/" && !p.startsWith("/_next"))
  .filter((p) => !args.only || p.startsWith(args.only))
  .sort();

const server = await serve(out, port);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? findChrome() });
const problems = [];
const counts = { loads: 0, overflow: 0, scrollWidth: 0, scrollHeight: 0, overlap: 0, clipped: 0, rtl: 0, header: 0 };
let checked = 0;
const headerChecked = new Set();

async function check(context, path, width, { checkHeader }) {
  const page = await context.newPage();
  try {
    await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.evaluate(() => document.fonts.ready.catch(() => {}));
    await page.waitForTimeout(80);
    const result = await page.evaluate(async ({ checkHeader }) => {
      const vw = document.documentElement.clientWidth;
      const issues = [];
      const step = Math.max(500, innerHeight);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 8));
      }
      scrollTo(0, 0);

      const skipSel = ".sr-only, [data-overflow-ok], [aria-hidden='true']";
      const isSkipped = (el) => {
        if (!el || el.closest(skipSel)) return true;
        if (el.classList.contains("truncate") || el.closest(".truncate")) return true;
        for (const c of el.classList) if (c.startsWith("line-clamp")) return true;
        if (el.closest("[class*='line-clamp']")) return true;
        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) return true;
        // Closed desktop dropdown panels stay in the DOM with layout boxes; ignore them.
        if (el.closest(".invisible, [data-closed], [aria-hidden='true']")) return true;
        return false;
      };

      const labelOf = (el) => {
        const text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
        const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
        return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""} "${text}"`;
      };

      if (document.documentElement.scrollWidth > vw + 1) {
        const wide = [...document.querySelectorAll("body *")]
          .filter((el) => {
            if (isSkipped(el)) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > vw + 1 || r.left < -1);
          })
          .slice(0, 4)
          .map(labelOf);
        issues.push({ kind: "overflow", msg: `page is ${document.documentElement.scrollWidth}px wide (viewport ${vw}px): ${wide.join(", ")}` });
      }

      const textLike =
        "p, h1, h2, h3, h4, h5, h6, a, button, label, li, span, figcaption, legend, [role='button'], [role='tab'], .nav-link, .eyebrow";
      for (const el of document.querySelectorAll(textLike)) {
        if (isSkipped(el)) continue;
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!ownText && !el.matches("a, button, [role='button'], [role='tab'], .nav-link, .eyebrow, h1, h2, h3, h4")) continue;

        if (el.scrollWidth > el.clientWidth + 2) {
          const clipsX = style.overflowX === "hidden" || style.overflow === "hidden" || style.textOverflow === "ellipsis";
          if (clipsX || style.whiteSpace === "nowrap") {
            issues.push({ kind: "scrollWidth", msg: `scrollWidth>clientWidth ${el.scrollWidth}>${el.clientWidth} in ${labelOf(el)}` });
          }
        }

        if (el.scrollHeight > el.clientHeight + 2) {
          const clipsY =
            style.overflowY === "hidden" ||
            style.overflow === "hidden" ||
            style.backgroundClip === "text" ||
            style.webkitBackgroundClip === "text";
          if (clipsY) {
            issues.push({ kind: "scrollHeight", msg: `scrollHeight>clientHeight ${el.scrollHeight}>${el.clientHeight} in ${labelOf(el)}` });
          }
        }
      }

      for (const el of document.querySelectorAll("a, button, [role=tab], .nav-link")) {
        if (isSkipped(el)) continue;
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        const label = labelOf(el);
        const style = getComputedStyle(el);
        if (style.overflow !== "visible" && el.scrollWidth > el.clientWidth + 2) {
          issues.push({ kind: "clipped", msg: `clipped text in ${label}` });
        }
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const os = getComputedStyle(a);
          if (os.overflowX === "visible" && os.overflow === "visible") continue;
          const box = a.getBoundingClientRect();
          if (a.scrollWidth <= a.clientWidth + 1) break;
          if (r.right > box.right + 2 || r.left < box.left - 2) {
            issues.push({ kind: "clipped", msg: `cut off by a clipping container: ${label}` });
          }
          break;
        }
      }

      // Overlap: only nearby pairs among visible headings/controls (cap work).
      const candidates = [...document.querySelectorAll("h1, h2, h3, a.nav-link, header a, header button, [role='button']")]
        .filter((el) => !isSkipped(el))
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight)
        .slice(0, 80);

      const seen = new Set();
      for (let i = 0; i < candidates.length; i++) {
        for (let j = i + 1; j < Math.min(candidates.length, i + 12); j++) {
          const a = candidates[i];
          const b = candidates[j];
          if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
          if (a.el.closest("a, button") === b.el || b.el.closest("a, button") === a.el) continue;
          const ar = a.r;
          const br = b.r;
          const ox = Math.max(0, Math.min(ar.right, br.right) - Math.max(ar.left, br.left));
          const oy = Math.max(0, Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top));
          if (ox > 6 && oy > 6) {
            const ratio = Math.min(ox / Math.min(ar.width, br.width), oy / Math.min(ar.height, br.height));
            if (ratio > 0.4) {
              const key = `${labelOf(a.el)} ∩ ${labelOf(b.el)}`;
              if (!seen.has(key)) {
                seen.add(key);
                issues.push({ kind: "overlap", msg: `overlap: ${key}` });
              }
            }
          }
        }
      }

      for (const svg of document.querySelectorAll("[data-orthodox-cross]")) {
        let flips = 0;
        for (let el = svg; el && el !== document.body; el = el.parentElement) {
          const t = getComputedStyle(el).transform;
          if (t !== "none" && new DOMMatrix(t).a < 0) flips++;
        }
        if (flips % 2) issues.push({ kind: "rtl", msg: "a cross is mirrored" });
      }

      if (checkHeader) {
        const header = document.querySelector("header");
        if (header && document.documentElement.scrollHeight > innerHeight + 120) {
          const h0 = header.getBoundingClientRect().height;
          scrollTo(0, 480);
          await new Promise((r) => setTimeout(r, 50));
          const h1 = header.getBoundingClientRect().height;
          scrollTo(0, 0);
          await new Promise((r) => setTimeout(r, 50));
          const h2 = header.getBoundingClientRect().height;
          if (Math.abs(h0 - h1) > 1.5 || Math.abs(h1 - h2) > 1.5 || Math.abs(h0 - h2) > 1.5) {
            issues.push({ kind: "header", msg: `header height jitter on scroll: ${h0.toFixed(1)} → ${h1.toFixed(1)} → ${h2.toFixed(1)}` });
          }
        }
      }

      return issues;
    }, { checkHeader });

    checked++;
    counts.loads++;
    for (const issue of result) {
      counts[issue.kind] = (counts[issue.kind] || 0) + 1;
      problems.push(`${width}px ${path}  ${issue.msg}`);
    }
  } catch (err) {
    problems.push(`${width}px ${path}  load error: ${err.message || err}`);
    counts.overflow++;
  } finally {
    await page.close();
  }
}

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  const queue = [...targets];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (queue.length) {
        const path = queue.shift();
        const lang = path.split("/")[1] || "";
        const key = `${width}:${lang}`;
        const checkHeader = path.endsWith(`/${lang}/`) || path === `/${lang}` || path === `/${lang}/`;
        const doHeader = checkHeader && !headerChecked.has(key);
        if (doHeader) headerChecked.add(key);
        await check(context, path, width, { checkHeader: doHeader });
      }
    }),
  );
  await context.close();
  console.log(`${width}px: ${targets.length} pages checked`);
}

await browser.close();
server.close();

const unique = [...new Set(problems)];
console.log(
  `\nCounts: loads=${counts.loads} overflow=${counts.overflow || 0} scrollWidth=${counts.scrollWidth || 0} scrollHeight=${counts.scrollHeight || 0} overlap=${counts.overlap || 0} clipped=${counts.clipped || 0} rtl=${counts.rtl || 0} header=${counts.header || 0} totalIssues=${problems.length} unique=${unique.length}`,
);

if (problems.length) {
  console.error(`\n${unique.length} unique problem(s):\n  ${unique.slice(0, 100).join("\n  ")}${unique.length > 100 ? `\n  … +${unique.length - 100} more` : ""}`);
  process.exit(1);
}
console.log(`\nAll ${checked} page loads fit cleanly at ${widths.join("/")}.`);

function findChrome() {
  const candidates = [
    "/usr/local/bin/google-chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  const found = candidates.find((c) => existsSync(c));
  if (!found) throw new Error("Chrome not found. Set CHROME_PATH.");
  return found;
}
