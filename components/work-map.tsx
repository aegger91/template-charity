"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export type MapMarker = {
  id: string;
  x: number;
  y: number;
  name: string;
  region: string;
  summary: string;
  programs: { title: string; href: string }[];
};

type Props = {
  land: string;
  width: number;
  height: number;
  markers: MapMarker[];
  showList?: boolean;
  strings: { select: string; programsHere: string; sample: string };
};

export function WorkMap({ land, width, height, markers, showList, strings }: Props) {
  const [selectedId, setSelectedId] = useState(markers[0]?.id);
  const selected = markers.find((m) => m.id === selectedId);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-stretch">
      <div className="relative overflow-hidden rounded-2xl border bg-surface p-3 sm:p-5">
        {/* Maps never mirror: geography reads the same in every language. */}
        <div dir="ltr" className="relative" style={{ aspectRatio: `${width} / ${height}` }}>
          <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 size-full" aria-hidden="true">
            <defs>
              <pattern id="map-dots" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="1.3" fill="var(--token-color-primary)" opacity="0.38" />
              </pattern>
            </defs>
            <path d={land} fill="var(--token-color-primaryTint)" stroke="none" />
            <path d={land} fill="url(#map-dots)" stroke="var(--token-color-primary)" strokeOpacity="0.18" strokeWidth="0.6" />
          </svg>
          {markers.map((m) => {
            const active = m.id === selectedId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedId(m.id)}
                aria-pressed={active}
                aria-label={`${m.name}, ${m.region}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              >
                <span
                  className={cn(
                    "absolute inset-0 m-auto size-5 rounded-full bg-gold/40",
                    active ? "animate-ping" : "opacity-0 group-hover:opacity-100",
                  )}
                />
                <span
                  className={cn(
                    "relative block rounded-full border-2 border-white shadow-md transition-all",
                    active ? "size-5 bg-gold" : "size-3.5 bg-teal group-hover:bg-gold",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col rounded-2xl border bg-surface p-6 sm:p-7" aria-live="polite">
        {selected ? (
          <>
            <p className="flex items-center gap-2 text-sm font-semibold text-gold-deep">
              <MapPin className="size-4" />
              {strings.sample}
            </p>
            <h3 className="mt-2 font-heading text-2xl font-semibold text-ink">{selected.region}</h3>
            <p className="text-sm text-muted-foreground">{selected.name}</p>
            <p className="mt-4 text-ink-soft">{selected.summary}</p>
            <h4 className="mt-6 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{strings.programsHere}</h4>
            <ul className="mt-2 divide-y">
              {selected.programs.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="group flex items-center justify-between gap-3 py-3 font-medium text-teal-deep hover:text-teal">
                    {p.title}
                    <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-muted-foreground">{strings.select}</p>
        )}
        <div className={cn("mt-auto flex flex-wrap gap-2 pt-6", !showList && "lg:hidden")}>
          {markers.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedId(m.id)}
              aria-pressed={m.id === selectedId}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                m.id === selectedId ? "border-teal bg-teal text-white" : "bg-surface hover:bg-muted",
              )}
            >
              {m.region}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
