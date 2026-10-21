import { useId } from "react";
import { WORDMARK, WORDMARK_FOIL } from "./wordmark-paths";

// The brand: "Quran Masterclass" written in gold foil, nothing else (public/brand/wordmark-*.svg).
// tone "gold" = light foil for emerald stages and dark mode, "deep" = darker gold for light canvases,
// "auto" = deep in light mode, light foil in dark mode. Height sets the size; the width follows.
type Variant = keyof typeof WORDMARK;
type Tone = "gold" | "deep" | "auto";

function Mark({ variant, foil, height, className }: { variant: Variant; foil: "light" | "deep"; height: number; className?: string }) {
  const id = `qm-foil-${useId().replace(/:/g, "")}`;
  const { box, parts } = WORDMARK[variant];
  const [x, y, w, h] = box;
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} height={height} width={(height * w) / h} aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={y} x2="0" y2={y + h}>
          {WORDMARK_FOIL[foil].map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`}>{parts.map((p, i) => <path key={i} transform={`translate(${p.x} ${p.y})`} d={p.d} />)}</g>
    </svg>
  );
}

/** svgClassName can resize per breakpoint (e.g. "h-[24px] w-auto sm:h-[30px]"); CSS wins over the height attribute */
export default function Wordmark({ height = 28, variant = "inline", tone = "auto", className = "", svgClassName = "" }: { height?: number; variant?: Variant; tone?: Tone; className?: string; svgClassName?: string }) {
  if (tone !== "auto") {
    return <span role="img" aria-label="Quran Masterclass" className={`inline-flex shrink-0 ${className}`}><Mark variant={variant} foil={tone === "gold" ? "light" : "deep"} height={height} className={svgClassName} /></span>;
  }
  return (
    <span role="img" aria-label="Quran Masterclass" className={`inline-flex shrink-0 ${className}`}>
      <Mark variant={variant} foil="deep" height={height} className={`dark:hidden ${svgClassName}`} />
      <Mark variant={variant} foil="light" height={height} className={`hidden dark:block ${svgClassName}`} />
    </span>
  );
}
