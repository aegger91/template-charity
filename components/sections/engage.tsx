import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { NeedsBoard } from "@/components/needs-board";
import { SectionHeading } from "@/components/section-heading";
import { Tx } from "@/components/tx";
import { Button } from "@/components/ui/button";
import { events, needs } from "@/lib/content";
import { formatDate, t, tr, type UiKey } from "@/lib/i18n";
import { connectLink, pageHref } from "@/lib/links";
import type { Localized, Section } from "@/lib/types";
import type { SectionProps } from "./types";

type NeedsSection = Section & { limit?: number; compact?: boolean };

export function NeedsBoardSection({ section, lang }: SectionProps<NeedsSection>) {
  const list = section.limit ? needs.slice(0, section.limit) : needs;
  const categories = [...new Set(needs.map((n) => n.category))].map((id) => ({ id, label: tr(`cat_${id}` as UiKey, lang) }));
  return (
    <section className="container-site py-16 md:py-20">
      <SectionHeading
        lang={lang}
        eyebrow={section.eyebrow}
        heading={section.heading}
        intro={section.intro}
        action={section.compact ? { label: tr("viewAll", lang), href: pageHref(lang, "get-involved") } : undefined}
      />
      <NeedsBoard
        compact={section.compact}
        categories={categories}
        postNeedUrl={connectLink("postNeed", lang)}
        needs={list.map((n) => ({
          id: n.id,
          title: t(n.title, lang),
          category: n.category,
          categoryLabel: tr(`cat_${n.category}` as UiKey, lang),
          location: t(n.location, lang),
          postedBy: tr("postedBy", lang, { name: t(n.postedBy, lang) }),
          posted: n.posted,
          urgent: n.urgent,
          respondUrl: connectLink("respondToNeed", lang, { id: n.id }),
        }))}
        strings={{
          all: tr("allNeeds", lang),
          filterLabel: tr("filterByCategory", lang),
          iCanHelp: tr("iCanHelp", lang),
          postANeed: tr("postANeed", lang),
          urgent: tr("urgent", lang),
          noNeeds: tr("noNeeds", lang),
          opens: tr("openInConnect", lang),
          connectOff: tr("connectOff", lang),
        }}
      />
    </section>
  );
}

type VolunteerSection = Section & { roles: { title: Localized; body: Localized }[] };

export function VolunteerSection({ section, lang }: SectionProps<VolunteerSection>) {
  const signup = connectLink("volunteerSignup", lang);
  return (
    <section className="bg-teal-deep py-16 text-white md:py-20">
      <div className="container-site grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <SectionHeading lang={lang} tone="dark" eyebrow={section.eyebrow} heading={section.heading} intro={section.intro} className="mb-6 md:mb-8" />
          {signup ? (
            <Button asChild className="h-12 rounded-full bg-gold px-6 text-base font-semibold text-gold-ink hover:bg-gold/90">
              <a href={signup} target="_blank" rel="noopener">
                {tr("signUpVolunteer", lang)}
                <ArrowUpRight className="rtl:-scale-x-100" />
              </a>
            </Button>
          ) : (
            <p className="text-white/70">{tr("connectOff", lang)}</p>
          )}
          <p className="mt-3 text-sm text-white/60">{tr("openInConnect", lang)}</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {section.roles?.map((r, i) => (
            <li key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="font-heading text-sm text-gold num">0{i + 1}</span>
              <Tx as="h3" value={r.title} lang={lang} className="mt-2 font-heading text-lg font-semibold text-white" />
              <Tx as="p" value={r.body} lang={lang} className="mt-1.5 text-[0.95rem] text-white/75" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type EventsSection = Section & { limit?: number };

export function EventsSection({ section, lang }: SectionProps<EventsSection>) {
  const list = section.limit ? events.slice(0, section.limit) : events;
  return (
    <section className="container-site py-16 md:py-20">
      <SectionHeading
        lang={lang}
        eyebrow={section.eyebrow}
        heading={section.heading}
        intro={section.intro}
        action={section.limit ? { label: tr("viewAll", lang), href: pageHref(lang, "events") } : undefined}
      />
      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-surface p-10 text-center text-muted-foreground">{tr("noEvents", lang)}</p>
      ) : (
        <ul className="grid gap-4">
          {list.map((e) => {
            const rsvp = connectLink("eventRsvp", lang, { id: e.id });
            return (
              <li key={e.id} className="grid gap-5 rounded-2xl border bg-surface p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
                <div className="flex w-20 shrink-0 flex-col items-center rounded-xl bg-teal-tint py-3 text-teal-deep">
                  <span className="text-xs font-semibold uppercase">{formatDate(e.start, lang, { month: "short" })}</span>
                  <span className="font-heading text-3xl leading-none font-semibold num">{formatDate(e.start, lang, { day: "numeric" })}</span>
                </div>
                <div className="min-w-0">
                  <Tx as="p" value={e.kind} lang={lang} className="text-xs font-semibold tracking-wide text-gold-deep uppercase" />
                  <Tx as="h3" value={e.title} lang={lang} className="mt-1 font-heading text-xl font-semibold text-ink" />
                  <Tx as="p" value={e.summary} lang={lang} className="mt-1.5 text-ink-soft" />
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      {formatDate(e.start, lang, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    <span className="inline-flex items-center gap-1.5 num">
                      <Clock className="size-4" />
                      {formatDate(e.start, lang, { hour: "numeric", minute: "2-digit" })}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" />
                      <Tx value={e.location} lang={lang} />
                    </span>
                  </div>
                </div>
                {rsvp ? (
                  <Button asChild variant="outline" className="h-11 rounded-full border-teal/40 px-5 font-semibold text-teal-deep hover:bg-teal-tint">
                    <a href={rsvp} target="_blank" rel="noopener" title={tr("openInConnect", lang)}>
                      {tr("rsvp", lang)}
                      <ArrowUpRight className="rtl:-scale-x-100" />
                    </a>
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
