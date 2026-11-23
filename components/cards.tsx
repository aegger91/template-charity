import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { CampaignProgress } from "@/components/giving-totals";
import { Photo } from "@/components/photo";
import { Tx } from "@/components/tx";
import { site } from "@/lib/content";
import { formatDate, tr } from "@/lib/i18n";
import { campaignHref, programHref, storyHref } from "@/lib/links";
import type { Campaign, Program, Story } from "@/lib/types";

export function ProgramCard({ program, lang, priority }: { program: Program; lang: string; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-surface shadow-[0_1px_0_rgba(19,36,43,0.04)] transition-shadow hover:shadow-[0_24px_50px_-28px_rgba(9,62,75,0.45)]">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <Photo image={program.image} lang={lang} priority={priority} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl leading-snug font-semibold text-ink">
          <Link href={programHref(lang, program.slug)} className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:ring-3 after:focus-visible:ring-ring/50 after:rounded-2xl">
            <Tx value={program.title} lang={lang} />
          </Link>
        </h3>
        <Tx as="p" value={program.summary} lang={lang} className="mt-2.5 flex-1 text-[0.95rem] leading-relaxed text-ink-soft" />
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
          {tr("learnMore", lang)}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

export function StoryCard({ story, lang }: { story: Story; lang: string }) {
  return (
    <article className="group relative flex flex-col">
      {story.image ? (
        <div className="aspect-[3/2] overflow-hidden rounded-2xl bg-muted">
          <Photo image={story.image} lang={lang} sizes="(min-width: 1024px) 33vw, 100vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
        </div>
      ) : null}
      <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="rounded-full bg-teal-tint px-2.5 py-0.5 text-xs font-semibold text-teal-deep">
          {story.kind === "news" ? tr("news", lang) : tr("story", lang)}
        </span>
        <time dateTime={story.date} className="num">
          {formatDate(story.date, lang, { dateStyle: "medium" })}
        </time>
      </div>
      <h3 className="mt-3 font-heading text-xl leading-snug font-semibold text-ink">
        <Link href={storyHref(lang, story.slug)} className="after:absolute after:inset-0 hover:underline hover:underline-offset-4">
          <Tx value={story.title} lang={lang} />
        </Link>
      </h3>
      <Tx as="p" value={story.summary} lang={lang} className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft" />
    </article>
  );
}

export function CampaignCard({ campaign, lang }: { campaign: Campaign; lang: string }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-surface md:flex-row">
      <div className="aspect-[16/10] shrink-0 overflow-hidden bg-muted md:aspect-auto md:w-[42%]">
        <Photo image={campaign.image} lang={lang} sizes="(min-width: 768px) 40vw, 100vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          <span>{tr("endsOn", lang, { date: formatDate(campaign.deadline, lang) })}</span>
        </p>
        <h3 className="mt-2 font-heading text-2xl leading-snug font-semibold text-ink">
          <Link href={campaignHref(lang, campaign.slug)} className="hover:underline hover:underline-offset-4">
            <Tx value={campaign.title} lang={lang} />
          </Link>
        </h3>
        <Tx as="p" value={campaign.summary} lang={lang} className="mt-2 text-ink-soft" />
        <CampaignProgress
          className="mt-6"
          lang={lang}
          goal={campaign.goal}
          currency={campaign.currency ?? site.currency}
          fundId={campaign.fundId}
          provider={campaign.provider}
          deadline={campaign.deadline}
        />
        <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-6">
          <Link href={campaignHref(lang, campaign.slug)} className="inline-flex items-center gap-1.5 font-semibold text-teal hover:underline hover:underline-offset-4">
            {tr("learnMore", lang)}
            <ArrowRight className="size-4 rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </article>
  );
}
