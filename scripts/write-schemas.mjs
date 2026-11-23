// Writes the simple collection schemas. site, pages, campaigns, common and
// totals-response are hand-written in schemas/ and are not touched here.
import { writeFileSync } from "node:fs";

const L = { $ref: "common.schema.json#/$defs/localized" };
const LIST = { type: "array", items: L };
const IMAGE = { $ref: "common.schema.json#/$defs/image" };
const SLUG = { $ref: "common.schema.json#/$defs/slug" };
const DATE = { $ref: "common.schema.json#/$defs/date" };
const DATETIME = { $ref: "common.schema.json#/$defs/dateTime" };
const FUND = { $ref: "common.schema.json#/$defs/fundId" };
const STR = { type: "string" };

const obj = (properties, required = Object.keys(properties), extra = {}) => ({
  type: "object",
  required,
  additionalProperties: false,
  properties,
  ...extra,
});

const collection = (title, item, description) => ({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title,
  ...(description ? { description } : {}),
  ...obj({ $schema: STR, items: { type: "array", items: item } }, ["items"]),
});

const file = (title, properties, required, description) => ({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title,
  ...(description ? { description } : {}),
  ...obj({ $schema: STR, ...properties }, required),
});

const person = obj({ name: L, role: L, bio: L }, ["name", "role"]);

const schemas = {
  programs: collection(
    "Programs",
    obj(
      { slug: SLUG, title: L, summary: L, body: LIST, image: IMAGE, fundId: FUND, locations: { type: "array", items: STR, description: "Ids from locations.json" }, highlights: LIST },
      ["slug", "title", "summary", "body", "image", "fundId", "locations"],
    ),
  ),
  locations: collection(
    "Where we work",
    obj({ id: SLUG, name: L, region: L, lon: { type: "number", minimum: -180, maximum: 180 }, lat: { type: "number", minimum: -90, maximum: 90 }, summary: L }),
    "Map markers. Longitude and latitude in decimal degrees.",
  ),
  stories: collection(
    "News and stories",
    obj({ slug: SLUG, title: L, kind: { enum: ["story", "news"] }, date: DATE, summary: L, body: LIST, image: IMAGE, program: STR }, ["slug", "title", "kind", "date", "summary", "body"]),
  ),
  events: collection(
    "Events",
    obj({ id: SLUG, title: L, start: DATETIME, end: DATETIME, location: L, summary: L, kind: L }, ["id", "title", "start", "location", "summary", "kind"]),
    "Times are UTC. RSVP goes through OrthodoxConnect using the event id.",
  ),
  needs: collection(
    "Needs board",
    obj(
      { id: STR, title: L, category: { enum: ["food", "household", "transport", "skills", "prayer", "visits"] }, location: L, postedBy: L, posted: DATE, urgent: { type: "boolean" } },
      ["id", "title", "category", "location", "postedBy", "posted"],
    ),
    "Sample needs. A live site lists needs from OrthodoxConnect.",
  ),
  people: file(
    "Board, staff and spiritual advisor",
    {
      spiritualAdvisor: obj({ name: L, role: L, bio: L, blessing: L, letterFile: STR }, ["name", "role", "blessing"]),
      groups: { type: "array", items: obj({ id: SLUG, title: L, members: { type: "array", items: person } }) },
    },
    ["spiritualAdvisor", "groups"],
  ),
  reports: collection(
    "Financials and reports",
    obj({ title: L, year: { type: "integer" }, kind: { enum: ["annual-report", "financial-statement", "tax-filing", "letter"] }, file: { type: "string", pattern: "\\.pdf$" }, sizeKb: { type: "number", minimum: 0 } }),
  ),
  partners: collection("Partners", obj({ name: L, kind: L, url: STR }, ["name", "kind"])),
  chapters: file(
    "Chapters and partner parishes",
    {
      regions: { type: "object", additionalProperties: L, description: "Region id to display name." },
      items: { type: "array", items: obj({ name: L, type: { enum: ["chapter", "partner-parish"] }, city: L, region: STR, country: L, email: STR }) },
    },
    ["regions", "items"],
  ),
  impact: collection(
    "Impact stats",
    {
      ...obj({ id: SLUG, label: L, value: { type: "number", minimum: 0 }, suffix: L, giving: obj({ fundId: STR, metric: { enum: ["raised", "donors"] }, provider: { $ref: "common.schema.json#/$defs/totalsProvider" } }) }, ["id", "label"]),
      oneOf: [{ required: ["value"], not: { required: ["giving"] } }, { required: ["giving"], not: { required: ["value"] } }],
    },
    "Each stat has either a fixed value or a giving source. Giving stats are hidden when their provider is not connected. Use fundId \"all-funds\" for the total across funds.",
  ),
  sponsorship: file(
    "Sponsorship",
    {
      note: L,
      options: { type: "array", items: obj({ id: SLUG, title: L, body: L, monthlyAmount: { type: "number", minimum: 1 }, fundId: FUND }) },
    },
    ["note", "options"],
  ),
  ui: file("Interface text", { strings: { type: "object", additionalProperties: L } }, ["strings"], "Labels used by components. Add a language by adding its code to each string."),
  "image-sources": file(
    "Image sources",
    {
      note: L,
      images: { type: "array", items: obj({ file: STR, title: STR, author: STR, date: STR, license: STR, licenseNote: STR, source: { type: "string", pattern: "^https://commons\\.wikimedia\\.org/" }, description: STR }) },
    },
    ["note", "images"],
  ),
  tokens: file(
    "Design tokens",
    {
      color: { type: "object", additionalProperties: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" } },
      font: { type: "object", additionalProperties: STR },
      radius: { type: "object", additionalProperties: STR },
      layout: { type: "object", additionalProperties: STR },
      motion: { type: "object", additionalProperties: { type: "number", minimum: 0 } },
    },
    ["color", "font", "radius", "layout", "motion"],
    "Each value becomes a CSS variable named --token-{group}-{name}.",
  ),
};

for (const [name, schema] of Object.entries(schemas)) {
  writeFileSync(new URL(`../schemas/${name}.schema.json`, import.meta.url), JSON.stringify(schema, null, 2) + "\n");
}
console.log(`Wrote ${Object.keys(schemas).length} schemas`);
