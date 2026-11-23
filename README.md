# Orthodox Charity Template

`orthodox-charity-template` is a sample website design for Orthodox charities, mission societies, brotherhoods, youth groups, relief funds and schools, built for the Project Orthodox website builder and OrthodoxConnect. The sample brand is "St. Example Orthodox Charity". Every name, figure, photo and document is a placeholder.

## Run it

```bash
npm install
npm run dev        # http://localhost:4317/en/
npm run build      # validates content, then writes a static site to out/
npm run serve      # serves out/ at http://127.0.0.1:4318
```

`out/` works on any static host. To host it in a subfolder, build with `BASE_PATH=/subfolder npm run build`.

## Edit it

- `content/*.json`: all text and sample data. Each file names its JSON Schema in `schemas/`. Run `npm run validate` after editing.
- `content/pages.json`: pages and their sections. Reorder sections to reorder a page, set `"enabled": false` to hide one, and add a page at any `path`.
- `content/site.json`: name, languages, navigation, `logo.style` (`circular-seal`, `kiot-frame`, `square-image` or `wordmark`), OrthodoxConnect links and giving settings.
- `design/tokens.json`: colors, fonts, radius, layout and motion.
- Languages: add a code to `site.json` languages, then add that code to any field. Missing translations fall back to the default language. Right-to-left languages are supported.

## Content policy

The template ships layout and one- or two-line neutral placeholders only. It contains no teaching, explainer, how-to or etiquette content; each organization adds its own. The `text` section (the "Our mission" block on About, and switched off on Home) is a generic About or Mission block.

## Giving and totals

- Gift forms call `submitDonation` in `lib/giving/payments.ts`. With `giving.paymentProvider` set to `"none"` they run a demo. The Stripe, Authorize.net and Tithe.ly branches are TODOs.
- Raised amounts and donor counts are never typed in. Each campaign has `goal`, `fundId` and `provider`. Totals come from an adapter in `lib/giving/totals/` that sums successful payments tagged with that fund id, fed by a provider webhook or API sync.
- Adapters fetch `giving.totalsEndpoint`, which must return `{ "raised": number, "donors": number, "updatedAt": "ISO date" }` (see `schemas/totals-response.schema.json`).
- A real provider only shows totals once it is listed in `giving.connectedProviders`. Otherwise the progress bar, raised amount and giving-based impact counters are hidden, and only the goal shows. The `mock` provider shows labeled sample totals for the demo.

## Checks

```bash
npm run typecheck
npm run check:fit     # every page, every language, at 360, 390, 768, 1280 and 1440 px (needs Chrome)
npm run assets        # regenerates logos and sample PDFs
```

Photo credits are in `content/image-sources.json` and on the site's Photo credits page.
