import "@fontsource-variable/fraunces";
import "@fontsource-variable/public-sans";
import "@fontsource/cormorant-sc/500.css";
import "@fontsource/cormorant-sc/600.css";
import "@fontsource-variable/noto-naskh-arabic";
import "@fontsource-variable/noto-kufi-arabic";
import "../globals.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Logo } from "@/components/logo";
import { DirectionProvider } from "@/components/ui/direction";
import { TooltipProvider } from "@/components/ui/tooltip";
import { site } from "@/lib/content";
import { getLanguage, getLanguages, isLanguage, t, tr } from "@/lib/i18n";
import { asset, navHref, pageHref } from "@/lib/links";
import { tokensToCss } from "@/lib/tokens";

export const dynamicParams = false;

export function generateStaticParams() {
  return getLanguages().map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: { default: t(site.name, lang), template: `%s | ${t(site.shortName, lang)}` },
    description: t(site.description, lang),
    icons: { icon: asset("/images/logo/favicon.svg"), apple: asset("/apple-touch-icon.png") },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const language = getLanguage(lang);

  const nav = site.navigation.map((item) => ({
    label: t(item.label, lang),
    href: navHref(lang, item),
    children: item.children?.map((c) => ({ label: t(c.label, lang), href: navHref(lang, c) })),
  }));

  return (
    <html lang={language.code} dir={language.dir} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: tokensToCss() }} />
      </head>
      <body className="flex min-h-dvh flex-col overflow-x-clip">
        <DirectionProvider dir={language.dir}>
          <TooltipProvider>
            <a
              href="#main"
              className="sr-only z-[100] rounded-md bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
            >
              {tr("skipToContent", lang)}
            </a>
            <SiteHeader
              lang={lang}
              dir={language.dir}
              homeHref={pageHref(lang, "home")}
              logo={<Logo lang={lang} />}
              drawerLogo={<Logo lang={lang} />}
              nav={nav}
              donate={{ label: t(site.donateButton.label, lang), href: pageHref(lang, site.donateButton.page) }}
              languages={getLanguages().map((l) => ({ code: l.code, label: l.label, dir: l.dir }))}
              strings={{
                menu: tr("menu", lang),
                closeMenu: tr("closeMenu", lang),
                language: tr("language", lang),
              }}
            />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter lang={lang} />
          </TooltipProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
