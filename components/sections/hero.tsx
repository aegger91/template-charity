import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CampaignProgress } from "@/components/giving-totals";
import { OrthodoxCross } from "@/components/orthodox-cross";
import { Photo } from "@/components/photo";
import { Tx } from "@/components/tx";
import { Button } from "@/components/ui/button";
import { getFeaturedCampaign, site } from "@/lib/content";
import { t, tr } from "@/lib/i18n";
import { campaignHref, navHref, pageHref } from "@/lib/links";
import type { ImageRef, Localized, NavItem, Section } from "@/lib/types";
import type { SectionProps } from "./types";

type HeroSection = Section & {
  image: ImageRef;
  secondaryButton?: NavItem;
  showCampaign?: boolean;
};

export function HeroSection({ section, lang }: SectionProps<HeroSection>) {
  const campaign = section.showCampaign !== false ? getFeaturedCampaign() : null;
  const heading: Localized = section.heading ?? site.mission;
  const giveHref = pageHref(lang, "give");

  return (
    <section className="relative isolate overflow-hidden bg-teal-deep text-white">
      <div className="absolute inset-0 -z-10">
        <Photo image={section.image} lang={lang} priority className="scale-[1.02]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,62,75,0.35)_0%,rgba(9,62,75,0.55)_45%,rgba(9,62,75,0.96)_100%)] lg:bg-[linear-gradient(90deg,rgba(9,62,75,0.94)_0%,rgba(9,62,75,0.7)_45%,rgba(9,62,75,0.15)_100%)] lg:rtl:bg-[linear-gradient(270deg,rgba(9,62,75,0.94)_0%,rgba(9,62,75,0.7)_45%,rgba(9,62,75,0.15)_100%)]" />
      </div>

      <div className="container-site grid gap-10 pt-28 pb-14 sm:pt-40 lg:min-h-[min(46rem,calc(100dvh-var(--token-layout-headerHeight)))] lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14 lg:pt-24 lg:pb-20">
        <div className="max-w-2xl">
          {section.eyebrow ? (
            <p className="eyebrow mb-5 flex items-center gap-2 text-gold">
              <OrthodoxCross className="h-5" />
              <Tx value={section.eyebrow} lang={lang} />
            </p>
          ) : null}
          <Tx
            as="h1"
            value={heading}
            lang={lang}
            className="font-heading text-[2.35rem] leading-[1.06] font-semibold text-white sm:text-6xl lg:text-[4.1rem]"
          />
          {section.intro ? <Tx as="p" value={section.intro} lang={lang} className="mt-6 max-w-xl text-lg text-white/85" /> : null}
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild className="h-13 rounded-full bg-gold px-7 text-base font-semibold text-gold-ink shadow-[0_12px_30px_-10px_rgba(201,149,43,0.9)] hover:bg-gold/90">
              <Link href={giveHref}>
                {tr("giveNow", lang)}
                <ArrowRight className="rtl:-scale-x-100" />
              </Link>
            </Button>
            {section.secondaryButton ? (
              <Button asChild variant="outline" className="h-13 rounded-full border-white/40 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/15 hover:text-white">
                <Link href={navHref(lang, section.secondaryButton)}>{t(section.secondaryButton.label, lang)}</Link>
              </Button>
            ) : null}
          </div>
        </div>

        {campaign ? (
          <aside className="rounded-2xl border border-white/15 bg-teal-deep/70 p-6 shadow-2xl backdrop-blur-md sm:p-7">
            <p className="eyebrow text-gold">{tr("currentCampaign", lang)}</p>
            <h2 className="mt-2 font-heading text-2xl leading-snug font-semibold text-white">
              <Link href={campaignHref(lang, campaign.slug)} className="hover:underline hover:underline-offset-4">
                <Tx value={campaign.title} lang={lang} />
              </Link>
            </h2>
            <Tx as="p" value={campaign.summary} lang={lang} className="mt-2 text-[0.95rem] text-white/75" />
            <CampaignProgress
              className="mt-6"
              lang={lang}
              tone="dark"
              goal={campaign.goal}
              currency={campaign.currency ?? site.currency}
              fundId={campaign.fundId}
              provider={campaign.provider}
              deadline={campaign.deadline}
            />
            <Link
              href={`${giveHref}?fund=${encodeURIComponent(campaign.fundId)}`}
              className="mt-6 inline-flex items-center gap-1.5 font-semibold text-gold hover:underline hover:underline-offset-4"
            >
              {tr("supportThis", lang)}
              <ArrowRight className="size-4 rtl:-scale-x-100" />
            </Link>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
