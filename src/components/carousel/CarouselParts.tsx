import { Link } from "@/i18n/navigation";
import { ShareArt } from "@/components/share/ShareArt";
import { PALETTES } from "@/lib/share/formats";
import { carouselText, fill, webText } from "@/lib/feed/carousels/uiText";
import type { CarouselPayload } from "@/lib/feed/carousels/types";
import type { ResolvedCarousel } from "@/lib/feed/carousels/resolve";

// Server-rendered parts of the carousel pages: the cover tile of the gallery (the square cover in the share design,
// real text for search engines) and the text version of a carousel (every slide's words, the scripture with its
// reference from the source, the sources).

const SERIF = "'Fraunces Variable', Georgia, serif";
const RTL = new Set(["ar", "ur", "fa", "ps"]);

export function CoverTile({ c }: { c: CarouselPayload }) {
  const p = PALETTES[c.palette];
  const tx = carouselText(c.lang);
  const rtl = RTL.has(c.lang);
  return (
    <Link href={`/carousels/${c.id}`} className="group relative block overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ backgroundColor: p.bg[1] }}>
      <ShareArt palette={c.palette} seed={`cr:${c.id}`} w={360} h={360} layout="square" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-[11%] text-center" dir={rtl ? "rtl" : "ltr"} lang={c.lang}>
        <span className="text-[10.5px] font-semibold tracking-[0.12em]" style={{ color: p.accent }}>{c.cover.kicker}</span>
        {c.cover.arabic ? <span lang="ar" dir="rtl" className="font-arabic text-[26px] leading-[1.6] sm:text-[30px]" style={{ color: p.arabic }}>{c.cover.arabic}</span> : null}
        <span className={`line-clamp-3 font-semibold leading-tight ${rtl ? "font-arabic text-[19px] sm:text-[21px]" : "text-[18px] sm:text-[20px]"}`} style={{ color: p.ink, fontFamily: rtl ? undefined : SERIF }}>{c.cover.title}</span>
        <span className="text-[11px]" style={{ color: p.muted }}>{fill(webText(c.lang).slidesN, { n: c.slides.length + 2 })} · {tx.swipe}</span>
      </div>
      {/* the carousel mark */}
      <span aria-hidden className="absolute end-2.5 top-2.5 h-4 w-4">
        <span className="absolute end-0 top-0 h-3 w-3 rounded-[2px] border-[1.5px] border-white" />
        <span className="absolute bottom-0 start-0 h-3 w-3 rounded-[2px] border-[1.5px] border-white bg-black/25" />
      </span>
    </Link>
  );
}

export function TextVersion({ c }: { c: ResolvedCarousel }) {
  const tx = carouselText(c.lang);
  const wt = webText(c.lang);
  const rtl = RTL.has(c.lang);
  return (
    <section aria-labelledby="carousel-text" dir={rtl ? "rtl" : "ltr"} lang={c.lang} className="mt-12">
      <h2 id="carousel-text" className="font-display text-2xl">{wt.textVersion}</h2>
      <ol className="mt-5 grid gap-6">
        {c.slides.map((s) => {
          const texts = c.texts[s.n] ?? [];
          return (
            <li key={s.n} className="rounded-2xl border border-line bg-surface p-5">
              <p className="text-[12px] font-semibold text-muted tabular-nums">{fill(tx.slideOf, { n: s.n + 1, total: c.slides.length + 2 })}</p>
              {s.title ? <h3 className="mt-1 text-lg font-bold">{s.title}</h3> : null}
              {s.arabic ? <p lang="ar" dir="rtl" className="font-arabic mt-2 text-2xl leading-loose">{s.arabic}</p> : null}
              {texts.map((t, i) => (
                <blockquote key={i} className="mt-3 border-s-2 ps-4" style={{ borderColor: "rgb(var(--gold))" }}>
                  {t.arabic ? <p lang="ar" dir="rtl" className="font-arabic text-[1.35rem] leading-[2]">{t.arabic}</p> : null}
                  {t.text ? <p className="mt-2 text-[15px] leading-relaxed text-ink/90">{t.text}</p> : null}
                  <footer className="mt-1 text-[13px] font-semibold text-muted">{t.url ? <a href={t.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{t.ref}</a> : t.ref}</footer>
                </blockquote>
              ))}
              {s.body ? <p className="mt-3 text-[15px] leading-relaxed">{s.body}</p> : null}
              {s.list?.length ? <ol className="mt-3 list-decimal space-y-1 ps-6 text-[15px]">{s.list.map((x, i) => <li key={i}>{x}</li>)}</ol> : null}
            </li>
          );
        })}
      </ol>
      <h3 className="mt-8 text-lg font-bold">{tx.sources}</h3>
      <ul className="mt-2 grid gap-1 text-[14px] text-muted">
        {c.sources.map((s, i) => <li key={i}>{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.label}</a> : s.label}</li>)}
      </ul>
      {c.review ? <p className="mt-4 text-[13px] text-muted">{tx.review}</p> : null}
    </section>
  );
}
