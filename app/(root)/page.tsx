import type { Metadata } from "next";
import { site } from "@/lib/content";
import { getLanguages, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t(site.name, site.defaultLanguage),
};

/**
 * The bare domain picks a language from the browser and moves to /{lang}/.
 * Relative URLs keep this working when the site is hosted in a subfolder.
 */
export default function RootRedirect() {
  const codes = getLanguages().map((l) => l.code);
  const fallback = site.defaultLanguage;
  const script = `(function(){var c=${JSON.stringify(codes)},d=${JSON.stringify(fallback)},p=(navigator.languages||[navigator.language||""]).map(function(x){return String(x).slice(0,2).toLowerCase()}),l=p.find(function(x){return c.indexOf(x)>-1})||d;location.replace("./"+l+"/");})();`;
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=./${fallback}/`} />
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <p style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <a href={`./${fallback}/`}>{t(site.name, fallback)}</a>
      </p>
    </>
  );
}
