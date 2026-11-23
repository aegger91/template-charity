"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Car, Hammer, Home, ShoppingBasket, MapPin, Plus, ScrollText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NeedView = {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  location: string;
  postedBy: string;
  posted: string;
  urgent?: boolean;
  respondUrl: string | null;
};

type Props = {
  needs: NeedView[];
  categories: { id: string; label: string }[];
  postNeedUrl: string | null;
  compact?: boolean;
  strings: { all: string; iCanHelp: string; postANeed: string; urgent: string; noNeeds: string; opens: string; connectOff: string };
};

const icons: Record<string, typeof Car> = {
  food: ShoppingBasket,
  household: Home,
  transport: Car,
  skills: Hammer,
  prayer: ScrollText,
  visits: Users,
};

export function NeedsBoard({ needs, categories, postNeedUrl, compact, strings }: Props) {
  const [filter, setFilter] = useState("all");
  const list = useMemo(() => (filter === "all" ? needs : needs.filter((n) => n.category === filter)), [filter, needs]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {!compact ? (
          <div role="group" aria-label="Filter" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
            {[{ id: "all", label: strings.all }, ...categories].map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={filter === c.id}
                onClick={() => setFilter(c.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  filter === c.id ? "border-teal bg-teal text-white" : "bg-surface text-ink-soft hover:bg-muted",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        {postNeedUrl ? (
          <Button asChild variant="outline" className="h-10 shrink-0 rounded-full border-teal/40 px-4 font-semibold text-teal-deep hover:bg-teal-tint">
            <a href={postNeedUrl} target="_blank" rel="noopener" title={strings.opens}>
              <Plus />
              {strings.postANeed}
            </a>
          </Button>
        ) : null}
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-surface p-10 text-center text-muted-foreground">{strings.noNeeds}</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((n) => {
            const Icon = icons[n.category] ?? Users;
            return (
              <li key={n.id} className="flex flex-col rounded-2xl border bg-surface p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-tint px-2.5 py-1 text-xs font-semibold text-teal-deep">
                    <Icon className="size-3.5" />
                    {n.categoryLabel}
                  </span>
                  {n.urgent ? (
                    <span className="rounded-full bg-gold-soft px-2.5 py-1 text-xs font-semibold text-gold-deep">{strings.urgent}</span>
                  ) : null}
                </div>
                <h3 className="mt-4 flex-1 font-heading text-lg leading-snug font-semibold text-ink">{n.title}</h3>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" />
                  {n.location}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{n.postedBy}</p>
                {n.respondUrl ? (
                  <Button asChild className="mt-5 h-10 rounded-full bg-teal font-semibold text-white hover:bg-teal-deep">
                    <a href={n.respondUrl} target="_blank" rel="noopener" title={strings.opens}>
                      {strings.iCanHelp}
                      <ArrowUpRight className="rtl:-scale-x-100" />
                    </a>
                  </Button>
                ) : (
                  <p className="mt-5 text-xs text-muted-foreground">{strings.connectOff}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
