// Validates content/*.json and design/tokens.json against schemas/, then checks
// the links between files. Runs before every build.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("..", import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, root), "utf8"));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const f of readdirSync(new URL("schemas/", root))) ajv.addSchema(read(`schemas/${f}`), f);

const errors = [];
const fail = (msg) => errors.push(msg);

const files = [...readdirSync(new URL("content/", root)).map((f) => `content/${f}`), "design/tokens.json"];
const data = {};
for (const f of files) {
  const json = read(f);
  data[f.split("/").pop().replace(".json", "")] = json;
  const schemaName = json.$schema?.split("/").pop();
  if (!schemaName) { fail(`${f}: missing $schema`); continue; }
  const validate = ajv.getSchema(schemaName);
  if (!validate) { fail(`${f}: unknown schema ${schemaName}`); continue; }
  if (!validate(json)) for (const e of validate.errors) fail(`${f}${e.instancePath}: ${e.message}`);
}

const { site, pages, programs, campaigns, stories, locations, impact, sponsorship } = data;
const langs = site.languages.map((l) => l.code);
const pageIds = new Set(pages.pages.map((p) => p.id));
const fundIds = new Set(site.giving.funds.map((f) => f.fundId));

const paths = pages.pages.map((p) => p.path);
for (const p of paths) if (paths.indexOf(p) !== paths.lastIndexOf(p)) fail(`pages.json: duplicate path "${p}"`);
const reserved = [site.collections.programs, site.collections.campaigns, site.collections.stories];
for (const r of reserved) if (!pageIds.has(r) && !paths.includes(r)) fail(`site.json collections: no page at "${r}"`);

const walkNav = (items, where) => {
  for (const item of items) {
    if (item.page !== undefined && !pageIds.has(item.page)) fail(`${where}: page "${item.page}" does not exist`);
    if (item.children) walkNav(item.children, where);
  }
};
walkNav(site.navigation, "site.json navigation");
site.footer.columns.forEach((c) => walkNav(c.links, "site.json footer"));
if (!pageIds.has(site.donateButton.page)) fail(`site.json donateButton: page "${site.donateButton.page}" does not exist`);
for (const page of pages.pages) for (const s of page.sections) {
  for (const b of [s.button, s.secondaryButton]) if (b?.page !== undefined && !pageIds.has(b.page)) fail(`pages.json ${page.id}: button page "${b.page}" does not exist`);
}

const locIds = new Set(locations.items.map((l) => l.id));
const programSlugs = new Set(programs.items.map((p) => p.slug));
for (const p of programs.items) {
  for (const l of p.locations) if (!locIds.has(l)) fail(`programs.json ${p.slug}: unknown location "${l}"`);
  if (!fundIds.has(p.fundId)) fail(`programs.json ${p.slug}: fund "${p.fundId}" is not in site.json giving.funds`);
}
for (const c of campaigns.items) {
  if (!fundIds.has(c.fundId)) fail(`campaigns.json ${c.slug}: fund "${c.fundId}" is not in site.json giving.funds`);
  if (c.program && !programSlugs.has(c.program)) fail(`campaigns.json ${c.slug}: unknown program "${c.program}"`);
}
if (campaigns.items.filter((c) => c.featured).length > 1) fail("campaigns.json: mark at most one campaign as featured");
for (const s of stories.items) if (s.program && !programSlugs.has(s.program)) fail(`stories.json ${s.slug}: unknown program "${s.program}"`);
for (const s of impact.items) if (s.giving && s.giving.fundId !== "all-funds" && !fundIds.has(s.giving.fundId)) fail(`impact.json ${s.id}: unknown fund "${s.giving.fundId}"`);
for (const o of sponsorship.options) if (!o.fundId.startsWith("sponsor-") && !fundIds.has(o.fundId)) fail(`sponsorship.json ${o.id}: unknown fund "${o.fundId}"`);
if (!langs.includes(site.defaultLanguage)) fail("site.json: defaultLanguage is not in languages");

const assetRefs = [];
const walk = (value, where) => {
  if (typeof value === "string") {
    if (/[\u2014\u2013]/.test(value)) fail(`${where}: contains an em or en dash`);
    if (value.includes("\u2626")) fail(`${where}: uses the cross glyph; use the OrthodoxCross component`);
    if (/^\/(images|downloads)\//.test(value)) assetRefs.push([value, where]);
    return;
  }
  if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${where}[${i}]`));
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    const isLocalized = keys.length > 0 && keys.every((k) => langs.includes(k)) && keys.every((k) => typeof value[k] === "string");
    if (isLocalized && !keys.includes(site.defaultLanguage)) fail(`${where}: missing default language "${site.defaultLanguage}"`);
    for (const k of keys) walk(value[k], `${where}.${k}`);
  }
};
for (const [name, json] of Object.entries(data)) walk(json, name);
for (const [ref, where] of assetRefs) if (!existsSync(new URL(`public${ref}`, root))) fail(`${where}: file public${ref} not found (run npm run assets)`);

if (errors.length) {
  console.error(`Content check failed with ${errors.length} problem(s):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log(`Content OK: ${files.length} files, ${pages.pages.length} pages, ${langs.length} languages.`);
