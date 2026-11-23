import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OrthodoxCross } from "@/components/orthodox-cross";
import { Tx } from "@/components/tx";
import type { Localized } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  lang: string;
  eyebrow?: Localized;
  heading?: Localized;
  intro?: Localized;
  action?: { label: string; href: string };
  align?: "start" | "center";
  tone?: "light" | "dark";
  className?: string;
  as?: "h1" | "h2";
};

export function SectionHeading({ lang, eyebrow, heading, intro, action, align = "start", tone = "light", className, as = "h2" }: Props) {
  if (!heading && !eyebrow && !intro) return null;
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 md:mb-12",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className={cn("eyebrow mb-3 flex items-center gap-2", dark ? "text-gold" : "text-gold-deep", align === "center" && "justify-center")}>
            <OrthodoxCross className="h-4" />
            <Tx value={eyebrow} lang={lang} />
          </p>
        ) : null}
        {heading ? (
          <Tx
            as={as}
            value={heading}
            lang={lang}
            className={cn(
              "font-heading font-semibold",
              as === "h1" ? "text-4xl leading-[1.08] sm:text-5xl lg:text-[3.6rem]" : "text-3xl leading-tight sm:text-4xl",
              dark ? "text-white" : "text-ink",
            )}
          />
        ) : null}
        {intro ? (
          <Tx as="p" value={intro} lang={lang} className={cn("mt-4 text-lg leading-relaxed", dark ? "text-white/80" : "text-ink-soft")} />
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-1.5 font-semibold underline-offset-4 hover:underline",
            dark ? "text-gold" : "text-teal",
          )}
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
