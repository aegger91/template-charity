"use client";

import { useEffect, useRef, useState } from "react";
import { useClientValue, useHydrated } from "@/lib/use-client";
import { formatMoney, formatNumber } from "@/lib/i18n";
import { motion } from "@/lib/tokens";
import { cn } from "@/lib/utils";

const REDUCED = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion() {
  return useClientValue(
    () => window.matchMedia(REDUCED).matches,
    false,
    (onChange) => {
      const mq = window.matchMedia(REDUCED);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
  );
}

/** Fires once when the element first scrolls into view. */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}

const ease = (x: number) => 1 - Math.pow(1 - x, 3);

/**
 * Counts up from zero when scrolled into view. The static HTML holds the final value,
 * so the number is correct without JavaScript.
 */
export function CountUp({
  value,
  lang,
  money,
  currency,
  suffix = "",
  className,
}: {
  value: number;
  lang: string;
  money?: boolean;
  currency?: string;
  suffix?: string;
  className?: string;
}) {
  const format = (n: number) => (money ? formatMoney(n, lang, currency) : formatNumber(n, lang)) + suffix;
  const [ref, seen] = useInView<HTMLSpanElement>();
  const reduced = usePrefersReducedMotion();
  const hydrated = useHydrated();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!seen || reduced) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / motion.counterDurationMs);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduced]);

  const shown = !hydrated || reduced || progress >= 1 ? value : Math.round(value * ease(progress));

  return (
    <span ref={ref} className={cn("num", className)}>
      {format(shown)}
    </span>
  );
}

/** Progress fill using logical properties, so it grows from the reading start in RTL too. */
export function ProgressBar({
  percent,
  label,
  tone = "light",
  className,
}: {
  percent: number;
  label: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();
  const mounted = useHydrated();
  const clamped = Math.max(0, Math.min(100, percent));
  const animate = mounted && !reduced;
  const width = !animate || seen ? clamped : 0;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      aria-label={label}
      className={cn("relative h-3 overflow-hidden rounded-full", tone === "dark" ? "bg-white/15" : "bg-teal-tint", className)}
    >
      <div
        className="absolute inset-y-0 start-0 rounded-full bg-[linear-gradient(90deg,var(--token-color-gold),color-mix(in_oklab,var(--token-color-gold)_70%,white))] shadow-[0_0_12px_rgba(201,149,43,0.45)] rtl:bg-[linear-gradient(270deg,var(--token-color-gold),color-mix(in_oklab,var(--token-color-gold)_70%,white))]"
        style={{
          width: `${width}%`,
          transition: animate && seen ? `width ${motion.progressDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1)` : undefined,
        }}
      />
    </div>
  );
}
