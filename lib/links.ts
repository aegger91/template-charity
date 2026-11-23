import { pages, site } from "@/lib/content";
import type { NavItem } from "@/lib/types";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const pagePaths: Record<string, string> = Object.fromEntries(pages.map((p) => [p.id, p.path]));

/** Public files (images, PDFs) need the base path when the site lives in a subfolder. */
export function asset(path: string) {
  if (/^https?:/.test(path)) return path;
  return `${basePath}${path}`;
}

/** Internal link for next/link (it adds the base path itself). */
export function href(lang: string, path = "") {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `/${lang}/${clean}/` : `/${lang}/`;
}

export function pageHref(lang: string, pageId: string) {
  return href(lang, pagePaths[pageId] ?? "");
}

export function navHref(lang: string, item: NavItem) {
  if (item.href) return item.href;
  return item.page ? pageHref(lang, item.page) : href(lang);
}

export function programHref(lang: string, slug: string) {
  return href(lang, `${site.collections.programs}/${slug}`);
}
export function campaignHref(lang: string, slug: string) {
  return href(lang, `${site.collections.campaigns}/${slug}`);
}
export function storyHref(lang: string, slug: string) {
  return href(lang, `${site.collections.stories}/${slug}`);
}

export { connectLink } from "@/lib/connect";
