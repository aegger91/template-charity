import { Download, FileText, UserRound } from "lucide-react";
import { OrthodoxCross } from "@/components/orthodox-cross";
import { SectionHeading } from "@/components/section-heading";
import { Tx } from "@/components/tx";
import { Button } from "@/components/ui/button";
import { partners, people, reports } from "@/lib/content";
import { formatNumber, t, tr } from "@/lib/i18n";
import { asset } from "@/lib/links";
import type { Localized, Section } from "@/lib/types";
import type { SectionProps } from "./types";

type HistorySection = Section & { items: { label: Localized; title: Localized; body: Localized }[] };

export function HistorySection({ section, lang }: SectionProps<HistorySection>) {
  return (
    <section className="container-site py-16 md:py-20">
      <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} intro={section.intro} />
      <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
        <span aria-hidden className="absolute start-[0.6875rem] top-2 bottom-2 w-px bg-gold/50 md:start-0 md:end-0 md:top-[0.6875rem] md:bottom-auto md:h-px md:w-auto" />
        {section.items?.map((item, i) => (
          <li key={i} className="relative ps-10 md:ps-0 md:pt-10">
            <span aria-hidden className="absolute start-0 top-0 flex size-6 items-center justify-center rounded-full border-2 border-gold bg-background">
              <span className="size-2 rounded-full bg-gold" />
            </span>
            <Tx as="p" value={item.label} lang={lang} className="font-heading text-sm font-semibold text-gold-deep" />
            <Tx as="h3" value={item.title} lang={lang} className="mt-1 font-heading text-xl font-semibold text-ink" />
            <Tx as="p" value={item.body} lang={lang} className="mt-2 text-[0.95rem] text-ink-soft" />
          </li>
        ))}
      </ol>
    </section>
  );
}

export function BlessingSection({ section, lang }: SectionProps) {
  const a = people.spiritualAdvisor;
  return (
    <section className="container-site py-12 md:py-16">
      <div className="relative overflow-hidden rounded-3xl bg-teal-deep p-8 text-white sm:p-12">
        <OrthodoxCross className="pointer-events-none absolute end-6 -bottom-8 h-64 text-white/5" />
        <div className="relative grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
          <div className="flex size-24 items-center justify-center rounded-full border-2 border-gold/60 bg-white/5 text-gold">
            <OrthodoxCross className="h-12" />
          </div>
          <div>
            {section.heading ? <Tx as="h2" value={section.heading} lang={lang} className="eyebrow text-gold" /> : null}
            <Tx as="p" value={a.name} lang={lang} className="mt-3 font-heading text-2xl font-semibold sm:text-3xl" />
            <Tx as="p" value={a.role} lang={lang} className="mt-1 text-white/70" />
            <blockquote className="mt-6 border-s-2 border-gold ps-5 text-lg leading-relaxed text-white/85">
              <Tx value={a.blessing} lang={lang} />
            </blockquote>
            {a.letterFile ? (
              <Button asChild variant="outline" className="mt-7 h-11 rounded-full border-white/30 bg-transparent px-5 font-semibold text-white hover:bg-white/10 hover:text-white">
                <a href={asset(a.letterFile)} download>
                  <FileText />
                  {tr("readLetter", lang)}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

type PeopleSection = Section & { groups?: string[] };

export function PeopleSection({ section, lang }: SectionProps<PeopleSection>) {
  const groups = section.groups ? people.groups.filter((g) => section.groups!.includes(g.id)) : people.groups;
  return (
    <section className="container-site py-12 md:py-16">
      <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} intro={section.intro} />
      <div className="space-y-12">
        {groups.map((g) => (
          <div key={g.id}>
            <Tx as="h3" value={g.title} lang={lang} className="mb-5 font-heading text-xl font-semibold text-ink" />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {g.members.map((m, i) => (
                <li key={i} className="rounded-2xl border bg-surface p-5">
                  <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl bg-[repeating-linear-gradient(135deg,var(--token-color-surfaceWarm)_0_10px,var(--token-color-background)_10px_20px)] text-muted-foreground">
                    <UserRound className="size-10 opacity-50" />
                    <span className="text-xs">{tr("photoPlaceholder", lang)}</span>
                  </div>
                  <Tx as="p" value={m.name} lang={lang} className="mt-4 font-heading text-lg font-semibold text-ink" />
                  <Tx as="p" value={m.role} lang={lang} className="text-sm font-medium text-teal" />
                  {m.bio ? <Tx as="p" value={m.bio} lang={lang} className="mt-2 text-sm text-ink-soft" /> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

type FinancialsSection = Section & { allocationHeading?: Localized; allocation?: { label: Localized; percent: number }[] };

const allocationColors = ["var(--token-color-primary)", "var(--token-color-gold)", "var(--token-color-primaryDeep)", "var(--token-color-goldDeep)"];

export function FinancialsSection({ section, lang }: SectionProps<FinancialsSection>) {
  return (
    <section className="container-site py-12 md:py-16">
      <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} intro={section.intro} />
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {section.allocation?.length ? (
          <div className="rounded-2xl border bg-surface p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <Tx as="h3" value={section.allocationHeading} lang={lang} className="font-heading text-lg font-semibold text-ink" />
              <span className="rounded-full border border-gold-deep/40 bg-gold-soft/70 px-2 py-0.5 text-[0.7rem] font-semibold text-gold-deep uppercase">
                {tr("sampleFigures", lang)}
              </span>
            </div>
            <div className="mt-6 flex h-4 overflow-hidden rounded-full">
              {section.allocation.map((a, i) => (
                <span key={i} style={{ width: `${a.percent}%`, background: allocationColors[i % allocationColors.length] }} />
              ))}
            </div>
            <ul className="mt-6 space-y-3">
              {section.allocation.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-ink-soft">
                    <span className="size-3 rounded-sm" style={{ background: allocationColors[i % allocationColors.length] }} />
                    <Tx value={a.label} lang={lang} />
                  </span>
                  <span className="font-heading text-xl font-semibold text-ink num">{formatNumber(a.percent, lang)}%</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <ul className="divide-y rounded-2xl border bg-surface">
          {reports.map((r) => (
            <li key={r.file} className="flex items-center gap-4 p-4 sm:p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-tint text-teal-deep">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <Tx as="p" value={r.title} lang={lang} className="font-medium text-ink" />
                <p className="text-sm text-muted-foreground">
                  {tr("pdf", lang)} · {tr("kb", lang, { size: formatNumber(r.sizeKb, lang) })}
                </p>
              </div>
              <Button asChild variant="ghost" className="h-10 shrink-0 rounded-full px-3 font-semibold text-teal-deep hover:bg-teal-tint">
                <a href={asset(r.file)} download aria-label={`${tr("download", lang)}: ${t(r.title, lang)}`}>
                  <Download />
                  <span className="hidden sm:inline">{tr("download", lang)}</span>
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PartnersSection({ section, lang }: SectionProps) {
  return (
    <section className="container-site py-14 md:py-16">
      <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} intro={section.intro} align="center" className="md:mb-10" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {partners.map((p, i) => (
          <li key={i} className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-dashed bg-surface px-3 py-5 text-center">
            <Tx value={p.name} lang={lang} className="font-heading text-[0.95rem] leading-snug font-semibold text-ink-soft" />
            <Tx value={p.kind} lang={lang} className="mt-1 text-xs text-muted-foreground" />
          </li>
        ))}
      </ul>
    </section>
  );
}
