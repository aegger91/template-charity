import type { ElementType } from "react";
import { getLanguage, resolve } from "@/lib/i18n";
import type { Localized } from "@/lib/types";

type Props = {
  value: Localized | undefined;
  lang: string;
  as?: ElementType;
  className?: string;
};

/**
 * Renders a localized field. When the text falls back to another language,
 * the element carries that language and direction so RTL pages stay correct.
 */
export function Tx({ value, lang, as: Tag = "span", className }: Props) {
  const r = resolve(value, lang);
  if (!r.text) return null;
  const fallback = r.lang !== lang;
  return (
    <Tag
      className={className}
      lang={fallback ? r.lang : undefined}
      dir={fallback ? getLanguage(r.lang).dir : undefined}
      data-fallback={fallback || undefined}
    >
      {r.text}
    </Tag>
  );
}
