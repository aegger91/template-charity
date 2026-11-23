import { CROSS_PATH, CROSS_VIEWBOX } from "@/lib/cross";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title?: string;
  /** Position and size, for placing the cross inside another SVG (seal, kiot, cards). */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
};

/** The only cross in the template. Do not replace it with a glyph or mirror it for RTL. */
export function OrthodoxCross({ className, title, x, y, width, height, fill = "currentColor" }: Props) {
  return (
    <svg
      viewBox={`0 0 ${CROSS_VIEWBOX.width} ${CROSS_VIEWBOX.height}`}
      x={x}
      y={y}
      width={width}
      height={height}
      className={cn(width == null && "inline-block h-[1.4em] w-auto shrink-0", className)}
      fill={fill}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      data-orthodox-cross=""
    >
      {title ? <title>{title}</title> : null}
      <path d={CROSS_PATH} />
    </svg>
  );
}
