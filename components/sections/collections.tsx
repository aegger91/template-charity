import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CampaignCard, ProgramCard, StoryCard } from "@/components/cards";
import { OrthodoxCross } from "@/components/orthodox-cross";
import { Photo } from "@/components/photo";
import { SectionHeading } from "@/components/section-heading";
import { Tx } from "@/components/tx";
import { Button } from "@/components/ui/button";
import { campaigns, programs, stories } from "@/lib/content";
import { t, tr } from "@/lib/i18n";
import { navHref, pageHref } from "@/lib/links";
import type { ImageRef, NavItem, Section } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

type ListSection = Section & { limit?: number; showAllLink?: boolean; kind?: "story" | "news" | "all" };

export function ProgramsSection({ section, lang, index }: SectionProps<ListSection>) {
  const list = section.limit ? programs.slice(0, section.limit) : programs;
  return (
    <section className="container-site py-16 md:py-24">
      <SectionHeading
        lang={lang}
        eyebrow={section.eyebrow}
        heading={section.heading}
        intro={section.intro}
        action={section.showAllLink ? { label: tr("allPrograms", lang), href: pageHref(lang, "our-work") } : undefined}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProgramCard key={p.slug} program={p} lang={lang} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}

export function StoriesSection({ section, lang }: SectionProps<ListSection>) {
  const kind = section.kind ?? "all";
  const filtered = kind === "all" ? stories : stories.filter((s) => s.kind === kind);
  const list = section.limit ? filtered.slice(0, section.limit) : filtered;
  return (
    <section className="container-site py-16 md:py-24">
      <SectionHeading
        lang={lang}
        eyebrow={section.eyebrow}
        heading={section.heading}
        intro={section.intro}
        action={section.showAllLink ? { label: tr("allNews", lang), href: pageHref(lang, "news") } : undefined}
      />
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <StoryCard key={s.slug} story={s} lang={lang} />
        ))}
      </div>
    </section>
  );
}

export function CampaignsSection({ section, lang }: SectionProps<ListSection>) {
  return (
    <section className="container-site py-12 md:py-16">
      <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} intro={section.intro} />
      <div className="grid gap-8">
        {campaigns.map((c) => (
          <CampaignCard key={c.slug} campaign={c} lang={lang} />
        ))}
      </div>
    </section>
  );
}

type CtaSection = Section & { button: NavItem; image?: ImageRef };

export function CallToActionSection({ section, lang }: SectionProps<CtaSection>) {
  return (
    <section className="container-site py-10 md:py-14">
      <div className="relative isolate overflow-hidden rounded-3xl bg-gold-soft">
        <div className={cn("grid items-stretch", section.image && "md:grid-cols-[1fr_0.8fr]")}>
          <div className="relative p-8 sm:p-12">
            <OrthodoxCross className="absolute end-8 top-8 h-16 text-gold/25" />
            <Tx as="h2" value={section.heading} lang={lang} className="max-w-lg font-heading text-3xl leading-tight font-semibold text-ink sm:text-4xl" />
            {section.intro ? <Tx as="p" value={section.intro} lang={lang} className="mt-4 max-w-lg text-lg text-ink-soft" /> : null}
            <Button asChild className="mt-8 h-12 rounded-full bg-teal px-6 text-base font-semibold text-white hover:bg-teal-deep">
              <Link href={navHref(lang, section.button)}>
                {t(section.button.label, lang)}
                <ArrowRight className="rtl:-scale-x-100" />
              </Link>
            </Button>
          </div>
          {section.image ? (
            <div className="min-h-56 overflow-hidden">
              <Photo image={section.image} lang={lang} sizes="(min-width: 768px) 40vw, 100vw" className="scale-[1.08]" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type HeaderSection = Section & { image?: ImageRef };

export function PageHeaderSection({ section, lang }: SectionProps<HeaderSection>) {
  return (
    <section className="relative overflow-hidden border-b bg-surface-warm">
      <div aria-hidden className="pointer-events-none absolute -bottom-10 end-[-3rem] text-gold/10">
        <OrthodoxCross className="h-72" />
      </div>
      <div className={cn("container-site relative grid gap-10 py-14 md:py-20", section.image && "lg:grid-cols-[1.2fr_0.8fr] lg:items-center")}>
        <SectionHeading lang={lang} as="h1" eyebrow={section.eyebrow} heading={section.heading} intro={section.intro} className="mb-0 md:mb-0" />
        {section.image ? (
          <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
            <Photo image={section.image} lang={lang} priority sizes="(min-width: 1024px) 35vw, 100vw" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
