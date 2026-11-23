import { OrthodoxCross } from "@/components/orthodox-cross";
import { site } from "@/lib/content";
import { t } from "@/lib/i18n";
import { asset } from "@/lib/links";
import type { LogoStyle } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  lang: string;
  style?: LogoStyle;
  /** Light text and frame for dark backgrounds (footer). */
  inverted?: boolean;
  className?: string;
  showName?: boolean;
};

export function Logo({ lang, style = site.logo.style, inverted, className, showName = true }: Props) {
  const name = t(site.name, lang);
  const shortName = t(site.shortName, lang);
  const mark = (() => {
    switch (style) {
      case "circular-seal":
        return <SealMark lang={lang} inverted={inverted} />;
      case "kiot-frame":
        return <KiotMark inverted={inverted} />;
      case "wordmark":
        return null;
      case "square-image":
      default:
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset(site.logo.image)}
            alt=""
            width={48}
            height={48}
            className="logo-mark size-full rounded-[22%] object-cover"
          />
        );
    }
  })();

  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)} data-logo-style={style}>
      {mark ? (
        <span className="logo-box block size-[var(--logo-size,2.75rem)] shrink-0">
          {mark}
        </span>
      ) : null}
      {showName ? (
        <span
          className={cn(
            "min-w-0 font-heading leading-[1.1] font-semibold",
            style === "wordmark" ? "text-[1.35rem] tracking-tight" : "text-[1.02rem]",
            inverted ? "text-white" : "text-ink",
          )}
        >
          {style === "wordmark" ? (
            <span className="block">{name}</span>
          ) : (
            <>
              <span className="block truncate min-[420px]:hidden">{shortName}</span>
              <span className="hidden max-w-[14rem] min-[420px]:line-clamp-2">{name}</span>
            </>
          )}
        </span>
      ) : (
        <span className="sr-only">{name}</span>
      )}
    </span>
  );
}

function SealMark({ lang, inverted }: { lang: string; inverted?: boolean }) {
  const text = t(site.logo.sealText ?? site.name, lang);
  const id = `seal-${lang}`;
  return (
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
      <defs>
        <path id={id} d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill={inverted ? "transparent" : "var(--token-color-primary)"} />
      <circle cx="60" cy="60" r="55" fill="none" stroke="var(--token-color-gold)" strokeWidth="2" />
      <circle cx="60" cy="60" r="33" fill="none" stroke="var(--token-color-gold)" strokeWidth="1.5" />
      <text fill="#fff" fontSize="10.5" fontWeight="600" letterSpacing="1.2" style={{ fontFamily: "var(--font-display-role)" }}>
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          {text.toUpperCase()}
        </textPath>
      </text>
      <OrthodoxCross x={46} y={40} width={28} height={39} fill="var(--token-color-gold)" />
    </svg>
  );
}

function KiotMark({ inverted }: { inverted?: boolean }) {
  // A kiot is the carved case that holds an icon: a tall frame with an arched head.
  return (
    <svg viewBox="0 0 96 120" className="size-full" aria-hidden="true">
      <path
        d="M8 116V44C8 26 26 10 48 4C70 10 88 26 88 44V116Z"
        fill={inverted ? "transparent" : "var(--token-color-primaryDeep)"}
        stroke="var(--token-color-gold)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M18 108V47C18 33 31 21 48 15C65 21 78 33 78 47V108Z"
        fill="none"
        stroke="var(--token-color-gold)"
        strokeWidth="1.6"
        opacity="0.8"
      />
      <OrthodoxCross x={30} y={36} width={36} height={50} fill="var(--token-color-gold)" />
    </svg>
  );
}
