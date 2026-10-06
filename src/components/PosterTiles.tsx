import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TILES } from "@/lib/tiles";
import { HomeGlowLayer, StarGlyph } from "./art/HomeOrnaments";
import HomeGlow from "./art/HomeGlow";

// Poster card like a class catalogue: dark gradient, Arabic word as a watermark, label, title, short text
export type PosterItem = { href: string; title: string; desc: string; badge: string; ar: string; bg: string; cta: string };
export const TONES = [
  "linear-gradient(160deg,#0c4a37 0%,#06221a 100%)", "linear-gradient(160deg,#3a2f12 0%,#14110a 100%)", "linear-gradient(160deg,#173640 0%,#081418 100%)",
  "linear-gradient(160deg,#1f2b44 0%,#0b101b 100%)", "linear-gradient(160deg,#3b1f2b 0%,#160b10 100%)", "linear-gradient(160deg,#2c3a1a 0%,#10160a 100%)",
  "linear-gradient(160deg,#30254a 0%,#100c19 100%)", "linear-gradient(160deg,#401c14 0%,#170a07 100%)",
];

export function Poster({ it, tall = true }: { it: PosterItem; tall?: boolean }) {
  return (
    <Link href={it.href} className={`hm-poster hm-glow group relative flex ${tall ? "aspect-[4/5] sm:aspect-[3/4]" : "min-h-[11rem]"} flex-col justify-end overflow-hidden rounded-lg p-4 ring-1 ring-inset ring-[rgb(233_207_153/0.1)] sm:p-5`} style={{ background: it.bg }}>
      <HomeGlowLayer />
      <span aria-hidden className="hm-p-sky" />
      <span aria-hidden className="hm-p-lat" />
      <span aria-hidden className="niche transition duration-700 group-hover:border-[rgb(233_207_153/0.36)]" />
      <span aria-hidden className="hm-p-key"><StarGlyph size={13} /></span>
      <span aria-hidden className="hm-p-ar font-callig pointer-events-none absolute -end-1 top-1 whitespace-nowrap text-[4.25rem] leading-none sm:-end-2 sm:top-2 sm:text-[6.5rem]" dir="rtl">{it.ar}</span>
      <span className="hm-p-badge absolute start-4 top-4 max-w-[calc(100%-2rem)] truncate text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:start-5 sm:top-5 sm:text-[10px]">{it.badge}</span>
      <span className="font-display relative text-[19px] leading-tight text-white sm:text-[24px]">{it.title}</span>
      <span className="relative mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-white/65 sm:line-clamp-3 sm:text-sm sm:leading-relaxed">{it.desc}</span>
      <span className="relative mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))]/90 sm:mt-4 sm:text-[11px]">{it.cta} <span className="inline-block transition duration-500 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">→</span></span>
      <span aria-hidden className="hm-p-line" />
    </Link>
  );
}

export function PosterGrid({ items, title, more, className = "", tall = true }: { items: PosterItem[]; title?: string; more?: { href: string; label: string }; className?: string; tall?: boolean }) {
  return (
    <div className={className}>
      {(title || more) && (
        <div className="mb-5 flex items-end justify-between gap-4">
          {title && <h2 className="font-display text-[26px] leading-tight sm:text-3xl">{title}</h2>}
          {more && <Link href={more.href} className="group/m inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent hover:underline">{more.label} <span className="inline-block transition group-hover/m:translate-x-0.5 rtl:-scale-x-100">→</span></Link>}
        </div>
      )}
      <HomeGlow />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((it) => <li key={it.href} className="min-w-0"><Poster it={it} tall={tall} /></li>)}
      </ul>
    </div>
  );
}

// The site's courses and tools from lib/tiles.ts
export default function PosterTiles({ keys, title, more, className = "" }: { keys: string[]; title?: string; more?: { href: string; label: string }; className?: string }) {
  const t = useTranslations();
  const items = keys.map((k) => TILES[k]).filter(Boolean).map((c) => ({ href: c.href, title: t(`nav.${c.key}`), desc: t(`home2.${c.desc}`), badge: t(`home2.badge_${c.badge}`), ar: c.ar, bg: c.bg, cta: t("home2.open") }));
  return <PosterGrid items={items} title={title} more={more} className={className} />;
}

// "Courses and tools" block for the end of a page
export function MoreTiles({ keys, className = "" }: { keys: string[]; className?: string }) {
  const t = useTranslations("home2");
  return (
    <section className={`mx-auto max-w-6xl px-5 pb-16 ${className}`}>
      <PosterTiles keys={keys} title={t("coursesTitle")} more={{ href: "/academy", label: t("coursesAll") }} />
    </section>
  );
}
