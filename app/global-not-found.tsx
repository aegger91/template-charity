import "@fontsource-variable/fraunces";
import "@fontsource-variable/public-sans";
import "./globals.css";

import type { Metadata } from "next";
import { OrthodoxCross } from "@/components/orthodox-cross";
import { site } from "@/lib/content";
import { getLanguages, t, tr } from "@/lib/i18n";
import { asset } from "@/lib/links";
import { tokensToCss } from "@/lib/tokens";

export const metadata: Metadata = {
  title: tr("notFoundTitle", site.defaultLanguage),
};

export default function GlobalNotFound() {
  return (
    <html lang={site.defaultLanguage}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: tokensToCss() }} />
      </head>
      <body className="flex min-h-dvh items-center justify-center bg-background p-6">
        <main className="max-w-lg text-center">
          <OrthodoxCross className="mx-auto h-16 text-gold" />
          <p className="mt-6 font-heading text-6xl font-semibold text-teal-deep">404</p>
          <ul className="mt-6 space-y-6">
            {getLanguages().map((l) => (
              <li key={l.code} lang={l.code} dir={l.dir}>
                <h1 className="font-heading text-2xl font-semibold text-ink">{tr("notFoundTitle", l.code)}</h1>
                <a href={asset(`/${l.code}/`)} className="mt-1 inline-block font-semibold text-teal underline underline-offset-4">
                  {tr("backHome", l.code)}: {t(site.shortName, l.code)}
                </a>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  );
}
