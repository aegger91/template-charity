import site from "@/content/site.json";
import ui from "@/content/ui.json";
import type { Language, Localized } from "@/lib/types";

const languages = site.languages as Language[];
const defaultLanguage = site.defaultLanguage;

export function getLanguages() {
  return languages;
}

export function getLanguage(code: string): Language {
  return languages.find((l) => l.code === code) ?? languages[0];
}

export function isLanguage(code: string) {
  return languages.some((l) => l.code === code);
}

/**
 * Resolves a localized field with per-field fallback:
 * requested language, then the site default, then the first value present.
 */
export function resolve(value: Localized | undefined, lang: string): { text: string; lang: string } {
  if (value == null) return { text: "", lang };
  if (typeof value === "string") return { text: value, lang };
  if (value[lang]) return { text: value[lang], lang };
  if (value[defaultLanguage]) return { text: value[defaultLanguage], lang: defaultLanguage };
  const first = Object.keys(value).find((k) => value[k]);
  return first ? { text: value[first], lang: first } : { text: "", lang };
}

export function t(value: Localized | undefined, lang: string): string {
  return resolve(value, lang).text;
}

export type UiKey = keyof typeof ui.strings;

/** Interface strings from content/ui.json, with the same fallback as content fields. */
export function tr(key: UiKey, lang: string, vars?: Record<string, string | number>): string {
  let text = t(ui.strings[key] as Localized, lang);
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
  return text;
}

export function formatMoney(amount: number, lang: string, currency = site.currency) {
  return new Intl.NumberFormat(getLanguage(lang).locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number, lang: string) {
  return new Intl.NumberFormat(getLanguage(lang).locale, { maximumFractionDigits: 0 }).format(n);
}

export function formatDate(iso: string, lang: string, opts: Intl.DateTimeFormatOptions = { dateStyle: "long" }) {
  return new Intl.DateTimeFormat(getLanguage(lang).locale, { timeZone: "UTC", ...opts }).format(new Date(iso));
}

export function isRtl(lang: string) {
  return getLanguage(lang).dir === "rtl";
}
