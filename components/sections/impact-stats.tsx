import { GivingStat, SampleBadge, StaticStat } from "@/components/giving-totals";
import { Tx } from "@/components/tx";
import { impact, site } from "@/lib/content";
import { t, tr } from "@/lib/i18n";
import type { Section } from "@/lib/types";
import type { SectionProps } from "./types";

type ImpactSection = Section & { items?: string[] };

export function ImpactStatsSection({ section, lang }: SectionProps<ImpactSection>) {
  const items = section.items ? impact.filter((i) => section.items!.includes(i.id)) : impact;
  return (
    <section className="relative overflow-hidden bg-teal text-white">
      <div aria-hidden className="pointer-events-none absolute -top-24 end-[-6rem] size-80 rounded-full bg-gold/15 blur-3xl" />
      <div className="container-site relative py-12 md:py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          {section.heading ? <Tx as="h2" value={section.heading} lang={lang} className="font-heading text-2xl font-semibold md:text-3xl" /> : null}
          <SampleBadge lang={lang} tone="dark" label={tr("sampleFigures", lang)} note={tr("sampleFiguresNote", lang)} />
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 min-[420px]:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
          {items.map((item) =>
            item.giving ? (
              <GivingStat
                key={item.id}
                lang={lang}
                label={t(item.label, lang)}
                fundId={item.giving.fundId}
                metric={item.giving.metric}
                provider={item.giving.provider}
                currency={site.currency}
              />
            ) : (
              <StaticStat key={item.id} lang={lang} label={t(item.label, lang)} value={item.value ?? 0} suffix={item.suffix ? t(item.suffix, lang) : undefined} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
