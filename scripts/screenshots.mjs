// Full-page screenshots of the key pages in every language, desktop and mobile.
// Usage: npm run build && npm run screenshots -- --out=/path/to/folder
import { mkdirSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { serve } from "./serve-static.mjs";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const outDir = args.out ?? fileURLToPath(new URL("../screenshots", import.meta.url));
const site = JSON.parse(readFileSync(new URL("../content/site.json", import.meta.url), "utf8"));
const langs = site.languages.map((l) => l.code);
const pages = [
  ["home", ""],
  ["our-work", "our-work/"],
  ["program", "our-work/winter-relief/"],
  ["campaign", "campaigns/warm-homes-winter-appeal/"],
  ["give", "give/"],
  ["get-involved", "get-involved/"],
  ["about", "about/"],
  ["story", "news/a-pantry-that-opens-every-tuesday/"],
  ["chapters", "get-involved/chapters/"],
  ["contact", "contact/"],
];
const sizes = [["desktop", 1440, 900], ["mobile", 390, 844]];
const port = 4321;

mkdirSync(outDir, { recursive: true });
const server = await serve(fileURLToPath(new URL("../out", import.meta.url)), port);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? ["/usr/local/bin/google-chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(existsSync),
});

for (const [size, width, height] of sizes) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: size === "mobile" ? 2 : 1 });
  for (const lang of langs) {
    for (const [name, path] of pages) {
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${port}/${lang}/${path}`, { waitUntil: "load" });
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        await new Promise((r) => setTimeout(r, 1800));
        scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 400));
      });
      await page.screenshot({ path: `${outDir}/${lang}-${name}-${size}.jpg`, fullPage: true, type: "jpeg", quality: 82 });
      if (size === "mobile" && name === "home") {
        await page.getByRole("button", { name: /menu|menú|القائمة/i }).first().click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: `${outDir}/${lang}-menu-${size}.jpg`, type: "jpeg", quality: 82 });
      }
      await page.close();
    }
    console.log(`${size} ${lang} done`);
  }
  await context.close();
}

await browser.close();
server.close();
console.log(`Screenshots saved to ${outDir}`);
