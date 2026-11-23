/**
 * Regenerates logo files, the favicon and the sample PDFs from lib/cross.ts and design/tokens.json.
 * Run with: npm run assets
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";
import tokens from "../design/tokens.json";
import { CROSS_PATH } from "../lib/cross";

const c = tokens.color;
const logoDir = "public/images/logo";
const downloadsDir = "public/downloads";
mkdirSync(logoDir, { recursive: true });
mkdirSync(downloadsDir, { recursive: true });

const cross = (x: number, y: number, w: number, fill: string) =>
  `<svg x="${x}" y="${y}" width="${w}" height="${(w * 56) / 40}" viewBox="0 0 40 56" fill="${fill}"><path d="${CROSS_PATH}"/></svg>`;

const square = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${c.primary}"/>
  <rect x="28" y="28" width="456" height="456" rx="90" fill="none" stroke="${c.gold}" stroke-width="6" opacity="0.55"/>
  <circle cx="256" cy="256" r="150" fill="${c.primaryDeep}" opacity="0.55"/>
  ${cross(176, 144, 160, c.gold)}
</svg>`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${c.primary}"/>
  ${cross(19, 9, 26, c.gold)}
</svg>`;

const seal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs><path id="ring" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0"/></defs>
  <circle cx="60" cy="60" r="58" fill="${c.primary}"/>
  <circle cx="60" cy="60" r="55" fill="none" stroke="${c.gold}" stroke-width="2"/>
  <circle cx="60" cy="60" r="33" fill="none" stroke="${c.gold}" stroke-width="1.5"/>
  <text fill="#fff" font-size="10.5" font-weight="600" letter-spacing="1.2" font-family="Georgia, serif"><textPath href="#ring" startOffset="50%" text-anchor="middle">ST. EXAMPLE ORTHODOX CHARITY</textPath></text>
  ${cross(46, 40, 28, c.gold)}
</svg>`;

const kiot = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 120">
  <path d="M8 116V44C8 26 26 10 48 4C70 10 88 26 88 44V116Z" fill="${c.primaryDeep}" stroke="${c.gold}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M18 108V47C18 33 31 21 48 15C65 21 78 33 78 47V108Z" fill="none" stroke="${c.gold}" stroke-width="1.6" opacity="0.8"/>
  ${cross(30, 36, 36, c.gold)}
</svg>`;

const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 120">
  <text x="0" y="62" font-family="Georgia, 'Times New Roman', serif" font-size="56" font-weight="600" fill="${c.ink}">St. Example</text>
  <text x="2" y="104" font-family="Georgia, 'Times New Roman', serif" font-size="30" letter-spacing="6" fill="${c.primary}">ORTHODOX CHARITY</text>
</svg>`;

async function writeLogos() {
  const files: Record<string, string> = {
    "logo-square.svg": square,
    "favicon.svg": favicon,
    "logo-seal.svg": seal,
    "logo-kiot.svg": kiot,
    "logo-wordmark.svg": wordmark,
  };
  for (const [name, svg] of Object.entries(files)) writeFileSync(`${logoDir}/${name}`, svg.trim() + "\n");
  await sharp(Buffer.from(square)).resize(512, 512).png().toFile(`${logoDir}/logo-square-512.png`);
  await sharp(Buffer.from(favicon)).resize(180, 180).png().toFile(`public/apple-touch-icon.png`);
}

function hex(h: string) {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

async function writePdf(file: string, title: string, lines: string[]) {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setAuthor("St. Example Orthodox Charity (sample)");
  const page = doc.addPage([595, 842]);
  const serif = await doc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  page.drawRectangle({ x: 0, y: 772, width: 595, height: 70, color: hex(c.primary) });
  page.drawText("St. Example Orthodox Charity", { x: 48, y: 800, size: 18, font: serif, color: rgb(1, 1, 1) });
  page.drawText("SAMPLE DOCUMENT FOR TEMPLATE PREVIEW", { x: 48, y: 782, size: 9, font: sans, color: hex(c.goldSoft) });
  page.drawText(title, { x: 48, y: 720, size: 22, font: serif, color: hex(c.ink) });
  let y = 680;
  for (const line of lines) {
    page.drawText(line, { x: 48, y, size: 11, font: sans, color: hex(c.inkSoft), maxWidth: 500, lineHeight: 15 });
    y -= 30;
  }
  page.drawText("All names and figures in this file are placeholders.", { x: 48, y: 60, size: 9, font: sans, color: hex(c.muted) });
  writeFileSync(`${downloadsDir}/${file}`, await doc.save());
}

async function writePdfs() {
  const generic = [
    "This is a placeholder PDF that ships with the website template.",
    "Replace it with your own document in the website builder.",
    "Keep the file name short and include the year.",
  ];
  await writePdf("sample-annual-report-2025.pdf", "Sample annual report 2025", generic);
  await writePdf("sample-annual-report-2024.pdf", "Sample annual report 2024", generic);
  await writePdf("sample-financial-statements-2025.pdf", "Sample financial statements 2025", generic);
  await writePdf("sample-tax-filing-2024.pdf", "Sample tax filing 2024", generic);
  await writePdf("sample-letter-of-blessing.pdf", "Sample letter of blessing", [
    "Placeholder. Replace with your scanned letter of blessing.",
  ]);
  await writePdf("sample-fact-sheet.pdf", "Sample fact sheet", [
    "Placeholder. Replace with your own one-page fact sheet.",
    "Press contact: press@example.org",
  ]);
}

writeLogos()
  .then(writePdfs)
  .then(() => console.log("Brand assets and sample PDFs written."));
