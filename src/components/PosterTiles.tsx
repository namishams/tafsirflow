import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TILES } from "@/lib/tiles";

// Poster tiles like a class catalogue. A fixed grid (two columns on phones) – nothing scrolls sideways.
export default function PosterTiles({ keys, title, more, className = "" }: { keys: string[]; title?: string; more?: { href: string; label: string }; className?: string }) {
  const t = useTranslations();
  const tiles = keys.map((k) => TILES[k]).filter(Boolean);
  return (
    <div className={className}>
      {(title || more) && (
        <div className="mb-5 flex items-end justify-between gap-4">
          {title && <h2 className="font-display text-[26px] leading-tight sm:text-3xl">{title}</h2>}
          {more && <Link href={more.href} className="shrink-0 text-sm font-semibold text-accent hover:underline">{more.label} →</Link>}
        </div>
      )}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {tiles.map((c) => (
          <li key={c.key} className="min-w-0">
            <Link href={c.href} className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-lg p-4 ring-1 ring-inset ring-white/[0.06] sm:aspect-[3/4] sm:p-5" style={{ background: c.bg }}>
              <span aria-hidden className="font-arabic pointer-events-none absolute -end-1 top-1 text-[4.25rem] leading-none text-white/[0.07] transition duration-700 group-hover:text-white/[0.11] sm:-end-2 sm:top-2 sm:text-[6.5rem]" dir="rtl">{c.ar}</span>
              <span className="absolute start-4 top-4 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:start-5 sm:top-5 sm:text-[10px]">{t(`home2.badge_${c.badge}`)}</span>
              <span className="font-display relative text-[19px] leading-tight text-white sm:text-[24px]">{t(`nav.${c.key}`)}</span>
              <span className="relative mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-white/65 sm:line-clamp-3 sm:text-sm sm:leading-relaxed">{t(`home2.${c.desc}`)}</span>
              <span className="relative mt-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))]/90 sm:mt-4 sm:text-[11px]">{t("home2.open")} <span className="inline-block transition group-hover:translate-x-0.5 rtl:-scale-x-100">→</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
