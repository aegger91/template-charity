import site from "@/content/site.json";
import type { OrthodoxConnectLink } from "@/lib/types";

/**
 * Deep link into the OrthodoxConnect app. Returns null when OrthodoxConnect is turned off,
 * so callers can show a contact fallback instead.
 */
export function connectLink(kind: OrthodoxConnectLink, lang: string, vars: Record<string, string> = {}) {
  const oc = site.orthodoxConnect;
  const links = oc.links as Record<OrthodoxConnectLink, string>;
  if (!oc.enabled) return null;
  let path = links[kind];
  const all: Record<string, string> = { org: oc.organizationId, lang, ...vars };
  for (const [k, v] of Object.entries(all)) path = path.replaceAll(`{${k}}`, encodeURIComponent(v));
  return `${oc.baseUrl}${path}`;
}
