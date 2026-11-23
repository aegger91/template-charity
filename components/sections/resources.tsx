import Link from "next/link";
import { Clock, Download, ExternalLink, FileText, Mail, MapPin, Phone } from "lucide-react";
import { ChapterDirectory, ContactForm, CopyButton } from "@/components/client-bits";
import { Logo } from "@/components/logo";
import { SectionHeading } from "@/components/section-heading";
import { Tx } from "@/components/tx";
import { Button } from "@/components/ui/button";
import { chapterRegions, chapters, credits, site } from "@/lib/content";
import { t, tr } from "@/lib/i18n";
import { asset, pageHref } from "@/lib/links";
import { brandColors } from "@/lib/tokens";
import type { Localized, LogoStyle, Section } from "@/lib/types";
import type { SectionProps } from "./types";

type PressSection = Section & { boilerplate: Localized; factSheet?: string; pressEmail?: string };

const logoFiles: { style: LogoStyle; file: string; label: string }[] = [
  { style: "square-image", file: "/images/logo/logo-square.svg", label: "Square (SVG)" },
  { style: "circular-seal", file: "/images/logo/logo-seal.svg", label: "Seal (SVG)" },
  { style: "kiot-frame", file: "/images/logo/logo-kiot.svg", label: "Kiot frame (SVG)" },
  { style: "wordmark", file: "/images/logo/logo-wordmark.svg", label: "Wordmark (SVG)" },
];

const swatches: (keyof typeof brandColors)[] = ["primary", "primaryDeep", "gold", "goldSoft", "background", "ink"];

export function PressKitSection({ section, lang }: SectionProps<PressSection>) {
  const boiler = t(section.boilerplate, lang);
  return (
    <section className="container-site space-y-14 py-12 md:py-16">
      <div>
        <h2 className="mb-5 font-heading text-2xl font-semibold text-ink">{tr("logoFiles", lang)}</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {logoFiles.map((l) => (
            <li key={l.style} className="flex flex-col rounded-2xl border bg-surface p-5">
              <div className="flex h-32 items-center justify-center rounded-xl bg-background px-3 [--logo-size:4rem]">
                <Logo lang={lang} style={l.style} showName={l.style === "wordmark"} />
              </div>
              <p className="mt-4 text-sm font-medium text-ink" dir="ltr">{l.label}</p>
              <a href={asset(l.file)} download className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
                <Download className="size-4" />
                {tr("download", lang)}
              </a>
            </li>
          ))}
        </ul>
        <a href={asset("/images/logo/logo-square-512.png")} download className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
          <Download className="size-4" />
          <span dir="ltr">logo-square-512.png</span>
        </a>
      </div>

      <div>
        <h2 className="mb-5 font-heading text-2xl font-semibold text-ink">{tr("brandColors", lang)}</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {swatches.map((k) => (
            <li key={k} className="overflow-hidden rounded-2xl border bg-surface">
              <div className="h-20" style={{ background: brandColors[k] }} />
              <div className="p-3 text-sm" dir="ltr">
                <p className="font-medium text-ink">{k}</p>
                <p className="font-mono text-muted-foreground">{brandColors[k]}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold text-ink">{tr("boilerplate", lang)}</h2>
            <CopyButton text={boiler} label={tr("copy", lang)} done={tr("copied", lang)} />
          </div>
          <Tx as="p" value={section.boilerplate} lang={lang} className="mt-4 leading-relaxed text-ink-soft" />
        </div>
        <div className="space-y-4 rounded-2xl border bg-surface p-6">
          <h2 className="font-heading text-xl font-semibold text-ink">{tr("pressContact", lang)}</h2>
          {section.pressEmail ? (
            <a href={`mailto:${section.pressEmail}`} className="flex items-center gap-2 font-semibold text-teal hover:underline" dir="ltr">
              <Mail className="size-4" />
              {section.pressEmail}
            </a>
          ) : null}
          {section.factSheet ? (
            <Button asChild variant="outline" className="h-11 w-full justify-start rounded-xl">
              <a href={asset(section.factSheet)} download>
                <FileText />
                {tr("factSheet", lang)} ({tr("pdf", lang)})
              </a>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="h-11 w-full justify-start rounded-xl">
            <Link href={pageHref(lang, "credits")}>
              <ExternalLink />
              {tr("pressPhotos", lang)}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ChaptersSection({ section, lang }: SectionProps) {
  return (
    <section className="container-site py-12 md:py-16">
      <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} intro={section.intro} />
      <ChapterDirectory
        regions={Object.entries(chapterRegions).map(([id, label]) => ({ id, label: t(label, lang) }))}
        chapters={chapters.map((c) => ({
          name: t(c.name, lang),
          type: c.type,
          typeLabel: c.type === "chapter" ? tr("chapter", lang) : tr("partnerParish", lang),
          city: t(c.city, lang),
          country: t(c.country, lang),
          region: c.region,
          regionLabel: t(chapterRegions[c.region], lang),
          email: c.email,
        }))}
        strings={{
          search: tr("search", lang),
          placeholder: tr("searchChapters", lang),
          region: tr("region", lang),
          allRegions: tr("allRegions", lang),
          none: tr("noChapters", lang),
          results: tr("resultsCount", lang),
          clear: tr("clearFilters", lang),
        }}
      />
    </section>
  );
}

export function ContactSection({ section, lang }: SectionProps) {
  const c = site.contact;
  return (
    <section className="container-site py-12 md:py-16">
      <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} intro={section.intro} />
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <ContactForm
          strings={{
            name: tr("fullName", lang),
            email: tr("email", lang),
            subject: tr("subject", lang),
            message: tr("message", lang),
            send: tr("send", lang),
            sending: tr("sending", lang),
            done: tr("contactDemo", lang),
            errorName: tr("errorName", lang),
            errorEmail: tr("errorEmail", lang),
            errorMessage: tr("errorMessage", lang),
          }}
        />
        <ul className="space-y-5 rounded-2xl bg-teal-deep p-6 text-white sm:p-7">
          <ContactRow icon={Mail} label={tr("email", lang)}>
            <a href={`mailto:${c.email}`} className="hover:underline" dir="ltr">{c.email}</a>
          </ContactRow>
          <ContactRow icon={Phone} label={tr("phone", lang)}>
            <a href={`tel:${c.phone.replace(/[^+\d]/g, "")}`} className="hover:underline" dir="ltr">{c.phone}</a>
          </ContactRow>
          <ContactRow icon={MapPin} label={tr("address", lang)}>
            <Tx value={c.address} lang={lang} />
          </ContactRow>
          {c.hours ? (
            <ContactRow icon={Clock} label={tr("officeHours", lang)}>
              <Tx value={c.hours} lang={lang} />
            </ContactRow>
          ) : null}
        </ul>
      </div>
    </section>
  );
}

function ContactRow({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <Icon className="mt-1 size-5 shrink-0 text-gold" />
      <div>
        <p className="text-xs font-semibold tracking-wide text-white/60 uppercase">{label}</p>
        <div className="mt-0.5 text-white/90">{children}</div>
      </div>
    </li>
  );
}

export function ImageCreditsSection({ lang }: SectionProps) {
  return (
    <section className="container-site py-12 md:py-16">
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {credits.images.map((img) => (
          <li key={img.file} className="overflow-hidden rounded-2xl border bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(img.file)} alt="" loading="lazy" className="aspect-[3/2] w-full object-cover" />
            <div className="space-y-1.5 p-4 text-sm">
              <p className="font-medium text-ink" dir="ltr">{img.title}</p>
              <p className="text-muted-foreground">{tr("archivalPhoto", lang)}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-ink-soft">
                <dt className="text-muted-foreground">{tr("author", lang)}</dt>
                <dd dir="ltr" className="text-start">{img.author}, {img.date}</dd>
                <dt className="text-muted-foreground">{tr("license", lang)}</dt>
                <dd dir="ltr" className="text-start">{img.license}</dd>
              </dl>
              <a href={img.source} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-semibold text-teal hover:underline">
                {tr("source", lang)}: Wikimedia Commons
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

type TextSection = Section & { body?: Localized[] };

export function TextSection({ section, lang }: SectionProps<TextSection>) {
  return (
    <section className="container-site py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} intro={section.intro} className="md:mb-8" />
        <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
          {section.body?.map((p, i) => <Tx key={i} as="p" value={p} lang={lang} />)}
        </div>
      </div>
    </section>
  );
}
