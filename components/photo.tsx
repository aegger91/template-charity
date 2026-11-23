import { t } from "@/lib/i18n";
import { asset } from "@/lib/links";
import type { ImageRef } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  image: ImageRef;
  lang: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function Photo({ image, lang, className, priority, sizes = "100vw" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(image.src)}
      alt={t(image.alt, lang)}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("size-full object-cover", className)}
      style={{ objectPosition: image.position ?? "50% 50%" }}
    />
  );
}
