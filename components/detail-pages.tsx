import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Check } from "lucide-react";
import { CampaignCard, StoryCard } from "@/components/cards";
import { CampaignProgress } from "@/components/giving-totals";
import { OrthodoxCross } from "@/components/orthodox-cross";
import { Photo } from "@/components/photo";
import { Tx } from "@/components/tx";
import { Button } from "@/components/ui/button";
import { campaigns, getProgram, locations, programs, site, stories } from "@/lib/content";
import { formatDate, t, tr } from "@/lib/i18n";
import { pageHref, programHref } from "@/lib/links";
import type { Campaign, Program, Story } from "@/lib/types";

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 hover:text-white">
      <ArrowLeft className="size-4 rtl:-scale-x-100" />
      {label}
    </Link>
  );
}

function DetailHero({ image, lang, back, eyebrow, title, summary }: {
  image: Program["image"];
  lang: string;
  back: { href: string; label: string };
  eyebrow: string;
  title: Program["title"];
  summary: Program["summary"];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-teal-deep text-white">
      <div className="absolute inset-0 -z-10">
        <Photo image={image} lang={lang} priority />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,62,75,0.25),rgba(9,62,75,0.92)_80%)]" />
      </div>
      <div className="container-site flex min-h-[26rem] flex-col justify-end gap-4 pt-24 pb-12 md:min-h-[32rem] md:pb-16">
        <BackLink {...back} />
        <p className="eyebrow flex items-center gap-2 text-gold">
          <OrthodoxCross className="h-4" />
          {eyebrow}
        </p>
        <Tx as="h1" value={title} lang={lang} className="max-w-3xl font-heading text-4xl leading-[1.08] font-semibold sm:text-5xl lg:text-6xl" />
        <Tx as="p" value={summary} lang={lang} className="max-w-2xl text-lg text-white/85" />
      </div>
    </section>
  );
}

export function ProgramDetail({ program, lang }: { program: Program; lang: string }) {
  const related = campaigns.find((c) => c.program === program.slug);
  const here = locations.filter((l) => program.locations.includes(l.id));
  const programStories = stories.filter((s) => s.program === program.slug);
  const others = programs.filter((p) => p.slug !== program.slug).slice(0, 3);
  const giveHref = `${pageHref(lang, "give")}?fund=${encodeURIComponent(program.fundId)}`;

  return (
    <>
      <DetailHero image={program.image} lang={lang} back={{ href: pageHref(lang, "our-work"), label: tr("allPrograms", lang) }} eyebrow={tr("programs", lang)} title={program.title} summary={program.summary} />
      <div className="container-site grid gap-12 py-14 lg:grid-cols-[1.4fr_0.9fr] lg:py-20">
        <article className="space-y-6 text-lg leading-relaxed text-ink-soft">
          {program.body.map((p, i) => <Tx key={i} as="p" value={p} lang={lang} />)}
          {program.highlights?.length ? (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {program.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl border bg-surface p-4 text-base">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-teal text-white"><Check className="size-3.5" /></span>
                  <Tx value={h} lang={lang} />
                </li>
              ))}
            </ul>
          ) : null}
          {here.length ? (
            <div className="pt-6">
              <h2 className="font-heading text-2xl font-semibold text-ink">{tr("whereThisHappens", lang)}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {here.map((l) => (
                  <li key={l.id} className="rounded-full border bg-surface px-3.5 py-1.5 text-base">
                    <Tx value={l.region} lang={lang} /> <span className="text-sm text-muted-foreground">({tr("sampleLocation", lang)})</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-surface p-6">
            <h2 className="font-heading text-xl font-semibold text-ink">{tr("supportThis", lang)}</h2>
            <p className="mt-2 text-ink-soft">{t(site.giving.funds.find((f) => f.fundId === program.fundId)?.name ?? program.title, lang)}</p>
            <Button asChild className="mt-5 h-12 w-full rounded-full bg-gold text-base font-semibold text-gold-ink hover:bg-gold/90">
              <Link href={giveHref}>{tr("giveNow", lang)}</Link>
            </Button>
          </div>
          {related ? (
            <div className="rounded-2xl border bg-surface p-6">
              <p className="eyebrow text-gold-deep">{tr("relatedCampaign", lang)}</p>
              <Tx as="h3" value={related.title} lang={lang} className="mt-2 font-heading text-xl font-semibold text-ink" />
              <CampaignProgress className="mt-5" lang={lang} goal={related.goal} currency={related.currency ?? site.currency} fundId={related.fundId} provider={related.provider} deadline={related.deadline} />
            </div>
          ) : null}
        </aside>
      </div>
      {programStories.length ? (
        <section className="container-site pb-16">
          <h2 className="mb-8 font-heading text-3xl font-semibold text-ink">{tr("relatedStories", lang)}</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {programStories.map((s) => <StoryCard key={s.slug} story={s} lang={lang} />)}
          </div>
        </section>
      ) : null}
      <section className="border-t bg-surface-warm py-14">
        <div className="container-site">
          <h2 className="mb-6 font-heading text-2xl font-semibold text-ink">{tr("allPrograms", lang)}</h2>
          <ul className="grid gap-3 md:grid-cols-3">
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={programHref(lang, p.slug)} className="group flex items-center justify-between gap-3 rounded-xl border bg-surface p-4 font-semibold text-teal-deep hover:border-teal/40">
                  <Tx value={p.title} lang={lang} />
                  <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

export function CampaignDetail({ campaign, lang }: { campaign: Campaign; lang: string }) {
  const giveHref = `${pageHref(lang, "give")}?fund=${encodeURIComponent(campaign.fundId)}`;
  const program = campaign.program ? getProgram(campaign.program) : undefined;
  const others = campaigns.filter((c) => c.slug !== campaign.slug);
  return (
    <>
      <DetailHero image={campaign.image} lang={lang} back={{ href: pageHref(lang, "campaigns"), label: tr("allCampaigns", lang) }} eyebrow={tr("currentCampaign", lang)} title={campaign.title} summary={campaign.summary} />
      <div className="container-site grid gap-12 py-14 lg:grid-cols-[1.3fr_1fr] lg:py-20">
        <div>
          <article className="space-y-6 text-lg leading-relaxed text-ink-soft">
            {campaign.body.map((p, i) => <Tx key={i} as="p" value={p} lang={lang} />)}
          </article>
          <section className="mt-14">
            <h2 className="font-heading text-2xl font-semibold text-ink">{tr("campaignUpdates", lang)}</h2>
            {campaign.updates.length ? (
              <ol className="relative mt-6 space-y-8 border-s border-gold/50 ps-7">
                {campaign.updates.map((u, i) => (
                  <li key={i} className="relative">
                    <span aria-hidden className="absolute -start-[2.15rem] top-1.5 size-3 rounded-full border-2 border-background bg-gold" />
                    <time dateTime={u.date} className="text-sm text-muted-foreground">{formatDate(u.date, lang)}</time>
                    <Tx as="h3" value={u.title} lang={lang} className="mt-1 font-heading text-lg font-semibold text-ink" />
                    <Tx as="p" value={u.body} lang={lang} className="mt-1 text-ink-soft" />
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed bg-surface p-6 text-muted-foreground">{tr("noUpdates", lang)}</p>
            )}
          </section>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-surface p-6 shadow-[0_30px_60px_-40px_rgba(9,62,75,0.5)] sm:p-7">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              {tr("endsOn", lang, { date: formatDate(campaign.deadline, lang) })}
            </p>
            <CampaignProgress className="mt-5" size="lg" lang={lang} goal={campaign.goal} currency={campaign.currency ?? site.currency} fundId={campaign.fundId} provider={campaign.provider} deadline={campaign.deadline} />
            <Button asChild className="mt-7 h-13 w-full rounded-full bg-gold text-lg font-semibold text-gold-ink hover:bg-gold/90">
              <Link href={giveHref}>{tr("giveNow", lang)}</Link>
            </Button>
            <Button asChild variant="outline" className="mt-3 h-11 w-full rounded-full">
              <Link href={`${giveHref}&dedication=memory`}>{tr("inMemory", lang)}…</Link>
            </Button>
            {program ? (
              <Link href={programHref(lang, program.slug)} className="mt-5 flex items-center justify-between gap-3 border-t pt-5 text-sm font-semibold text-teal-deep hover:text-teal">
                <Tx value={program.title} lang={lang} />
                <ArrowRight className="size-4 rtl:-scale-x-100" />
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
      {others.length ? (
        <section className="border-t bg-surface-warm py-14">
          <div className="container-site">
            <h2 className="mb-8 font-heading text-2xl font-semibold text-ink">{tr("allCampaigns", lang)}</h2>
            <div className="grid gap-6">
              {others.map((c) => <CampaignCard key={c.slug} campaign={c} lang={lang} />)}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

export function StoryDetail({ story, lang }: { story: Story; lang: string }) {
  const program = story.program ? getProgram(story.program) : undefined;
  const more = stories.filter((s) => s.slug !== story.slug).slice(0, 3);
  return (
    <>
      <article>
        <header className="container-site max-w-4xl pt-12 pb-8 md:pt-16">
          <Link href={pageHref(lang, "news")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
            <ArrowLeft className="size-4 rtl:-scale-x-100" />
            {tr("allNews", lang)}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="rounded-full bg-teal-tint px-2.5 py-0.5 text-xs font-semibold text-teal-deep">{story.kind === "news" ? tr("news", lang) : tr("story", lang)}</span>
            <time dateTime={story.date}>{tr("publishedOn", lang, { date: formatDate(story.date, lang) })}</time>
          </div>
          <Tx as="h1" value={story.title} lang={lang} className="mt-4 font-heading text-4xl leading-tight font-semibold text-ink sm:text-5xl" />
          <Tx as="p" value={story.summary} lang={lang} className="mt-4 text-xl leading-relaxed text-ink-soft" />
        </header>
        {story.image ? (
          <figure className="container-site max-w-5xl">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
              <Photo image={story.image} lang={lang} priority />
            </div>
            <figcaption className="mt-2 text-sm text-muted-foreground">{tr("archivalPhoto", lang)}</figcaption>
          </figure>
        ) : null}
        <div className="container-site max-w-3xl space-y-6 py-12 text-lg leading-relaxed text-ink-soft">
          {story.body.map((p, i) => <Tx key={i} as="p" value={p} lang={lang} />)}
          {program ? (
            <div className="mt-10 flex flex-col gap-4 rounded-2xl bg-gold-soft/50 p-6 sm:flex-row sm:items-center sm:justify-between">
              <Tx value={program.title} lang={lang} className="font-heading text-xl font-semibold text-ink" />
              <Button asChild className="h-11 rounded-full bg-teal px-5 font-semibold text-white hover:bg-teal-deep">
                <Link href={`${pageHref(lang, "give")}?fund=${encodeURIComponent(program.fundId)}`}>{tr("supportThis", lang)}</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </article>
      <section className="border-t bg-surface-warm py-14">
        <div className="container-site grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {more.map((s) => <StoryCard key={s.slug} story={s} lang={lang} />)}
        </div>
      </section>
    </>
  );
}
