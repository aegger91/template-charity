"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { CountUp, ProgressBar } from "@/components/motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getTotalsAdapter, type FundTotals } from "@/lib/giving/totals";
import { formatDate, formatMoney, formatNumber, tr } from "@/lib/i18n";
import type { TotalsProvider } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useClientValue } from "@/lib/use-client";

type TotalsState =
  | { status: "off" }
  | { status: "loading" }
  | { status: "ready"; totals: FundTotals; sample: boolean };

/**
 * Totals always come through an adapter. No adapter (no provider connected) or a failed
 * request both mean "off": callers hide the bar, the raised amount and giving-based counters.
 */
export function useFundTotals(provider: TotalsProvider, fundId: string, goal?: number): TotalsState {
  const adapter = getTotalsAdapter(provider);
  const initial = adapter?.getStaticTotals?.({ fundId, goal });
  const [state, setState] = useState<TotalsState>(() =>
    !adapter ? { status: "off" } : initial ? { status: "ready", totals: initial, sample: adapter.id === "mock" } : { status: "loading" },
  );

  useEffect(() => {
    if (!adapter || initial) return;
    let alive = true;
    adapter
      .getTotals({ fundId, goal })
      .then((totals) => alive && setState({ status: "ready", totals, sample: false }))
      .catch(() => alive && setState({ status: "off" }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, fundId, goal]);

  return state;
}

function useDaysLeft(deadline?: string) {
  return useClientValue(
    () => (deadline ? Math.ceil((new Date(`${deadline}T23:59:59Z`).getTime() - Date.now()) / 86400000) : null),
    null,
  );
}

export function SampleBadge({ lang, tone = "light", note, label }: { lang: string; tone?: "light" | "dark"; note?: string; label?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] leading-snug font-semibold tracking-wide uppercase overflow-visible",
            tone === "dark" ? "border-gold/60 text-gold" : "border-gold-deep/40 bg-gold-soft/70 text-gold-deep",
          )}
        >
          {label ?? tr("sampleData", lang)}
          <Info className="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-center">{note ?? tr("sampleTotalsNote", lang)}</TooltipContent>
    </Tooltip>
  );
}

type ProgressProps = {
  lang: string;
  goal: number;
  currency: string;
  fundId: string;
  provider: TotalsProvider;
  deadline?: string;
  tone?: "light" | "dark";
  size?: "md" | "lg";
  className?: string;
};

export function CampaignProgress({ lang, goal, currency, fundId, provider, deadline, tone = "light", size = "md", className }: ProgressProps) {
  const state = useFundTotals(provider, fundId, goal);
  const days = useDaysLeft(deadline);
  const dark = tone === "dark";
  const muted = dark ? "text-white/70" : "text-muted-foreground";

  const deadlineText =
    days == null
      ? deadline
        ? tr("endsOn", lang, { date: formatDate(deadline, lang, { dateStyle: "medium" }) })
        : null
      : days < 0
        ? tr("ended", lang)
        : tr("daysLeft", lang, { days: formatNumber(days, lang) });

  if (state.status === "off") {
    return (
      <div className={cn("flex flex-wrap items-baseline gap-x-4 gap-y-1", className)} data-totals="off">
        <p className={cn("font-heading font-semibold num", size === "lg" ? "text-2xl" : "text-lg", dark ? "text-white" : "text-ink")}>
          {tr("goalOf", lang, { goal: formatMoney(goal, lang, currency) })}
        </p>
        {deadlineText ? <p className={cn("text-sm", muted)}>{deadlineText}</p> : null}
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className={cn("space-y-3", className)} data-totals="loading" aria-busy="true">
        <div className={cn("h-8 w-40 animate-pulse rounded-md", dark ? "bg-white/15" : "bg-muted")} />
        <div className={cn("h-3 animate-pulse rounded-full", dark ? "bg-white/15" : "bg-teal-tint")} />
        <p className={cn("text-sm", muted)}>{tr("loadingTotals", lang)}</p>
      </div>
    );
  }

  const { totals, sample } = state;
  const percent = goal > 0 ? (totals.raised / goal) * 100 : 0;

  return (
    <div className={cn("space-y-3", className)} data-totals="ready">
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
        <p className="min-w-0">
          <CountUp
            value={totals.raised}
            lang={lang}
            money
            currency={currency}
            className={cn("block font-heading leading-none font-semibold", size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl", dark ? "text-white" : "text-ink")}
          />
          <span className={cn("mt-1.5 block text-sm", muted)}>{tr("raisedOf", lang, { goal: formatMoney(goal, lang, currency) })}</span>
        </p>
        {sample ? <SampleBadge lang={lang} tone={tone} /> : null}
      </div>
      <ProgressBar percent={percent} tone={tone} label={tr("percentFunded", lang, { percent: formatNumber(percent, lang) })} />
      <div className={cn("flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm", muted)}>
        <span className="num">{tr("percentFunded", lang, { percent: formatNumber(percent, lang) })}</span>
        <span className="num">{tr("donorsCount", lang, { count: formatNumber(totals.donors, lang) })}</span>
        {deadlineText ? <span>{deadlineText}</span> : null}
      </div>
    </div>
  );
}

/** One impact counter fed by giving totals. Renders nothing when no provider is connected. */
export function GivingStat({
  lang,
  label,
  fundId,
  metric,
  provider,
  currency,
}: {
  lang: string;
  label: string;
  fundId: string;
  metric: "raised" | "donors";
  provider: TotalsProvider;
  currency: string;
}) {
  const state = useFundTotals(provider, fundId);
  if (state.status === "off") return null;
  return (
    <StatTile label={label} sample={state.status === "ready" && state.sample}>
      {state.status === "loading" ? (
        <span className="block h-12 w-28 animate-pulse rounded-md bg-white/15" aria-busy="true" />
      ) : (
        <CountUp value={state.totals[metric]} lang={lang} money={metric === "raised"} currency={currency} />
      )}
    </StatTile>
  );
}

export function StatTile({ label, children, sample }: { label: string; children: React.ReactNode; sample?: boolean }) {
  return (
    <div className="relative flex min-w-0 flex-col gap-2 border-white/10 px-1 py-2 sm:border-s sm:ps-6" data-sample={sample || undefined}>
      <span className="font-heading text-[clamp(1.85rem,5.4vw,3rem)] leading-[1.15] font-semibold text-gold">{children}</span>
      <span className="text-[0.95rem] text-white/80">{label}</span>
    </div>
  );
}

export function StaticStat({ lang, label, value, suffix }: { lang: string; label: string; value: number; suffix?: string }) {
  return (
    <StatTile label={label} sample>
      <CountUp value={value} lang={lang} suffix={suffix} />
    </StatTile>
  );
}
