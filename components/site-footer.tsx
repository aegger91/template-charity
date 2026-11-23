import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { NewsletterForm } from "@/components/newsletter-form";
import { OrthodoxCross } from "@/components/orthodox-cross";
import { site } from "@/lib/content";
import { t, tr } from "@/lib/i18n";
import { navHref, pageHref } from "@/lib/links";

export function SiteFooter({ lang }: { lang: string }) {
  const oc = site.orthodoxConnect;
  const showNewsletter = oc.enabled && oc.newsletter;
  const year = new Date().getUTCFullYear();

  return (
    <footer className="mt-auto bg-teal-deep text-white/85">
      {showNewsletter ? (
        <div className="border-b border-white/10">
          <div className="container-site grid gap-6 py-12 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <h2 className="font-heading text-2xl text-white md:text-3xl">{tr("newsletterTitle", lang)}</h2>
              <p className="mt-2 max-w-xl text-white/75">{tr("newsletterBody", lang)}</p>
            </div>
            <NewsletterForm
              lang={lang}
              strings={{
                email: tr("email", lang),
                subscribe: tr("subscribe", lang),
                errorEmail: tr("errorEmail", lang),
                opens: tr("openInConnect", lang),
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Logo lang={lang} inverted />
          <p className="mt-5 text-sm leading-relaxed text-white/70">{t(site.footer.about, lang)}</p>
          <ul className="mt-6 space-y-2.5 text-sm">
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href={`mailto:${site.contact.email}`} className="hover:text-white" dir="ltr">
                {site.contact.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href={`tel:${site.contact.phone.replace(/[^+\d]/g, "")}`} className="hover:text-white" dir="ltr">
                {site.contact.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              <span>{t(site.contact.address, lang)}</span>
            </li>
          </ul>
        </div>
        {site.footer.columns.map((col) => (
          <div key={t(col.heading, "en")}>
            <h2 className="eyebrow text-gold">{t(col.heading, lang)}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={t(l.label, "en")}>
                  <Link href={navHref(lang, l)} className="text-white/75 transition-colors hover:text-white">
                    {t(l.label, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-2">
            <OrthodoxCross className="h-4 text-gold" />
            <span>
              © {year} {t(site.name, lang)}. {t(site.footer.legal, lang)}
            </span>
          </p>
          <p>
            <span className="me-1.5 rounded-full border border-gold/50 px-2 py-0.5 text-gold">{tr("sampleData", lang)}</span>
            {t(site.sampleNotice, lang)}{" "}
            <Link href={pageHref(lang, "credits")} className="underline underline-offset-2 hover:text-white">
              {tr("photoCredits", lang)}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
