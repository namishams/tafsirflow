import { useId } from "react";
import { useLocale } from "next-intl";
import { WORDMARK, WORDMARK_FOIL } from "./wordmark-paths";
import { ARABIC_VARIANT, WORDMARK_FILES, wordmarkSrc, type WordmarkFile } from "./wordmark-files";

// The brand: "Quran Masterclass" in gold foil, served as the SVG files in public/brand/ (wordmark-files.ts).
// tone "gold" = light foil for emerald stages and dark mode, "deep" = darker gold for light canvases,
// "auto" = deep in light mode, light foil in dark mode. Height sets the size; the width follows.
// On Arabic pages the calligraphic Arabic lockup (Aref Ruqaa) is shown instead of the Latin one.
type Variant = WordmarkFile;
type Tone = "gold" | "deep" | "auto";

/** fallback: the v1 wordmark drawn from inline outlines (wordmark-paths.ts), e.g. where files cannot be loaded */
export function WordmarkVector({ variant = "inline", foil, height, className }: { variant?: keyof typeof WORDMARK; foil: "light" | "deep"; height: number; className?: string }) {
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

function File({ variant, tone, height, className }: { variant: Variant; tone: "gold" | "deep"; height: number; className?: string }) {
  const { w, h } = WORDMARK_FILES[variant];
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={wordmarkSrc(variant, tone)} alt="" aria-hidden="true" height={height} width={Math.round((height * w) / h)} decoding="async" draggable={false} className={className} />;
}

/** svgClassName can resize per breakpoint (e.g. "h-[24px] w-auto sm:h-[30px]"); CSS wins over the height attribute */
export default function Wordmark({ height = 28, variant = "inline", tone = "auto", className = "", svgClassName = "" }: { height?: number; variant?: Variant; tone?: Tone; className?: string; svgClassName?: string }) {
  const locale = useLocale();
  const v = (locale === "ar" && ARABIC_VARIANT[variant]) || variant;
  if (v === "ar") height = Math.round(height * 1.3); // the calligraphy needs a little more height to read as large as the Latin
  const label = v === "ar" || v === "arStacked" ? "ماستركلاس القرآن" : "Quran Masterclass";
  if (tone !== "auto") {
    return <span role="img" aria-label={label} className={`inline-flex shrink-0 ${className}`}><File variant={v} tone={tone} height={height} className={`block ${svgClassName}`} /></span>;
  }
  return (
    <span role="img" aria-label={label} className={`inline-flex shrink-0 ${className}`}>
      <File variant={v} tone="deep" height={height} className={`dark:hidden ${svgClassName}`} />
      <File variant={v} tone="gold" height={height} className={`hidden dark:block ${svgClassName}`} />
    </span>
  );
}
