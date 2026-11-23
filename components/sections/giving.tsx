import Link from "next/link";
import { ArrowRight, BookOpen, CalendarClock, CreditCard, FileText, Home, Info, School } from "lucide-react";
import { GivingForm } from "@/components/giving-form";
import { SectionHeading } from "@/components/section-heading";
import { Tx } from "@/components/tx";
import { Button } from "@/components/ui/button";
import { campaigns, programs, site, sponsorship } from "@/lib/content";
import { formatMoney, t, tr } from "@/lib/i18n";
import { connectLink, pageHref } from "@/lib/links";
import type { Localized, Section } from "@/lib/types";
import type { SectionProps } from "./types";

export function GivingFormSection({ section, lang }: SectionProps) {
  const seen = new Set<string>();
  const funds = [
    ...site.giving.funds.map((f) => ({ fundId: f.fundId, name: t(f.name, lang) })),
    ...campaigns.map((c) => ({ fundId: c.fundId, name: t(c.title, lang) })),
    ...programs.map((p) => ({ fundId: p.fundId, name: t(p.title, lang) })),
    ...sponsorship.options.map((o) => ({ fundId: o.fundId, name: t(o.title, lang) })),
  ].filter((f) => (seen.has(f.fundId) ? false : (seen.add(f.fundId), true)));

  return (
    <section className="container-site py-12 md:py-16" id={section.id ?? "give"}>
      <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} intro={section.intro} />
      <GivingForm
        lang={lang}
        orgName={t(site.name, lang)}
        currency={site.currency}
        funds={funds}
        presets={site.giving.presetAmounts}
        monthlyPresets={site.giving.monthlyPresetAmounts}
      />
    </section>
  );
}

const sponsorIcons = { child: School, family: Home, seminarian: BookOpen } as const;

type SponsorSection = Section & { compact?: boolean };

export function SponsorshipSection({ section, lang }: SectionProps<SponsorSection>) {
  const giveHref = pageHref(lang, "give");
  return (
    <section className="bg-surface-warm py-16 md:py-20">
      <div className="container-site">
        <SectionHeading
          lang={lang}
          eyebrow={section.eyebrow}
          heading={section.heading}
          intro={section.intro}
          action={section.compact ? { label: tr("learnMore", lang), href: pageHref(lang, "sponsor") } : undefined}
        />
        <div className="grid gap-5 md:grid-cols-3">
          {sponsorship.options.map((o) => {
            const Icon = sponsorIcons[o.id as keyof typeof sponsorIcons] ?? School;
            return (
              <article key={o.id} className="flex flex-col rounded-2xl border bg-surface p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-teal-tint text-teal-deep">
                    <Icon className="size-6" />
                  </span>
                  <span className="rounded-full border border-dashed border-gold-deep/50 px-2.5 py-0.5 text-xs font-semibold text-gold-deep">
                    {tr("sponsorPlaceholder", lang)}
                  </span>
                </div>
                <Tx as="h3" value={o.title} lang={lang} className="mt-5 font-heading text-xl font-semibold text-ink" />
                <Tx as="p" value={o.body} lang={lang} className="mt-2 flex-1 text-ink-soft" />
                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-heading text-3xl font-semibold text-ink num">{formatMoney(o.monthlyAmount, lang)}</span>
                  <span className="text-sm text-muted-foreground">{tr("perMonth", lang)}</span>
                </p>
                <p className="text-xs text-muted-foreground">{tr("perMonthSample", lang)}</p>
                <Button asChild variant="outline" className="mt-5 h-auto min-h-11 rounded-full border-teal/40 px-4 py-2 text-base leading-snug font-semibold whitespace-normal text-teal-deep hover:bg-teal-tint">
                  <Link href={`${giveHref}?fund=${o.fundId}&frequency=monthly`} className="text-center">
                    {tr("askAboutSponsoring", lang)}
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
        <p className="mt-6 flex max-w-3xl items-start gap-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <Tx value={sponsorship.note} lang={lang} />
        </p>
      </div>
    </section>
  );
}

const featureIcons = [CreditCard, CalendarClock, FileText];

type MonthlySection = Section & { features?: Localized[] };

export function MonthlyDonorsSection({ section, lang }: SectionProps<MonthlySection>) {
  const portal = connectLink("donorPortal", lang);
  const features = section.features ?? [];
  return (
    <section className="container-site py-12 md:py-16">
      <div className="grid gap-8 rounded-3xl border bg-surface p-6 sm:p-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="min-w-0">
          <span className="rounded-full border border-dashed border-gold-deep/50 px-2.5 py-0.5 text-xs font-semibold text-gold-deep">
            {tr("sponsorPlaceholder", lang)}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-ink">{tr("manageGift", lang)}</h2>
          <ul className="mt-6 space-y-4">
            {features.map((f, i) => {
              const Icon = featureIcons[i % featureIcons.length];
              return (
              <li key={i} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-tint text-teal-deep">
                  <Icon className="size-4.5" />
                </span>
                <Tx value={f} lang={lang} className="pt-1.5 text-ink-soft" />
              </li>
              );
            })}
          </ul>
        </div>
        <div className="min-w-0 rounded-2xl bg-teal-deep p-6 text-white sm:p-8">
          <p className="text-white/80">{tr("openInConnect", lang)}</p>
          {portal ? (
            <Button asChild className="mt-5 h-auto min-h-12 w-full rounded-full bg-gold py-3 text-center text-base font-semibold whitespace-normal text-gold-ink hover:bg-gold/90">
              <a href={portal} target="_blank" rel="noopener">
                {tr("manageGift", lang)}
                <ArrowRight className="rtl:-scale-x-100" />
              </a>
            </Button>
          ) : (
            <p className="mt-4 text-sm text-white/70">{tr("connectOff", lang)}</p>
          )}
          <p className="mt-5 text-xs text-white/60">{tr("secureNote", lang)}</p>
        </div>
      </div>
    </section>
  );
}

export function TaxReceiptSection({ lang }: SectionProps) {
  return (
    <section className="container-site pb-16 md:pb-20">
      <div className="flex flex-col gap-3 rounded-2xl border-s-4 border-gold bg-gold-soft/40 p-5 sm:flex-row sm:gap-5 sm:p-6">
        <FileText className="size-6 shrink-0 text-gold-deep" />
        <div>
          <h2 className="font-heading text-lg font-semibold text-ink">{tr("taxReceipt", lang)}</h2>
          <Tx as="p" value={site.giving.taxReceiptNote} lang={lang} className="mt-1 text-[0.95rem] text-ink-soft" />
        </div>
      </div>
    </section>
  );
}
