import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { TONES } from "@/components/PosterTiles";
import { ISLAM, islamUi, loadChapters, readingMinutes } from "@/lib/islam";
import { abs, pageMeta } from "@/lib/site";
import { CalligraphyDraw } from "@/components/Ornaments";
import { IslamArcadeLine, IslamCorners, IslamDome, IslamMosque, IslamNum, IslamRain, saw, starPath } from "@/components/art/IslamArt";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const u = await islamUi(locale);
  return pageMeta(locale, "/islam", `${u.kicker} | Quran Masterclass`, u.lead.slice(0, 158));
}

// a pointed arch in a 400×300 box (the window of each chapter card)
const ARCH = "M34 300V158C34 92 118 46 200 14C282 46 366 92 366 158V300Z";
const ARCH_OUT = "M22 300V156C22 84 110 34 200 0C290 34 378 84 378 156V300";
const toneColors = (bg: string) => { const m = bg.match(/#[0-9a-f]{6}/gi) ?? []; return [m[0] ?? "#0c4a37", m[1] ?? "#06221a"]; };

// A chapter as a marble card with a window of coloured inlay: the Arabic word in gold, a lattice that turns on hover
function ChapterCard({ i, href, title, lead, kicker, ar, meta }: { i: number; href: string; title: string; lead: string; kicker: string; ar: string; meta: string }) {
  const [a, b] = toneColors(TONES[i % TONES.length]);
  const id = `w${i}`;
  return (
    <Link href={href} className="isl-card isl-card-hover group flex h-full flex-col overflow-hidden p-2.5 sm:p-3">
      <div className="isl-window">
        <svg className="frame" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id={`${id}g`} x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
            <radialGradient id={`${id}l`} cx="50%" cy="18%" r="60%"><stop offset="0" stopColor="#ffe9b8" stopOpacity=".35" /><stop offset="1" stopColor="#ffe9b8" stopOpacity="0" /></radialGradient>
            <pattern id={`${id}p`} width="50" height="50" patternUnits="userSpaceOnUse"><path d={starPath(25, 25, 21, 10)} fill="none" stroke="#e9cf99" strokeOpacity=".16" strokeWidth="1" /><circle cx="25" cy="25" r="4" fill="none" stroke="#e9cf99" strokeOpacity=".12" /></pattern>
            <clipPath id={`${id}c`}><path d={ARCH} /></clipPath>
          </defs>
          <path d={ARCH} fill={`url(#${id}g)`} />
          <g clipPath={`url(#${id}c)`}>
            <g className="lattice"><rect x="-100" y="-100" width="600" height="500" fill={`url(#${id}p)`} /></g>
            <rect className="glow" width="400" height="300" fill={`url(#${id}l)`} />
          </g>
          <path d={ARCH} fill="none" stroke="#d6b46c" strokeOpacity=".9" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          <path d={ARCH_OUT} fill="none" stroke="#c9a65e" strokeOpacity=".45" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="isl-window-ar" dir="rtl" aria-hidden style={{ fontSize: `clamp(17px, ${Math.min(17, 230 / Math.max(6, ar.length)).toFixed(1)}cqw, 60px)` }}>{ar}</span>
      </div>
      <div className="relative -mt-4 flex flex-1 flex-col items-center px-1.5 pb-2 text-center sm:px-2">
        <span className="rounded-full bg-[rgb(var(--isl-paper))] p-0.5"><IslamNum n={i + 1} className="!h-9 !w-9 !text-[12px]" /></span>
        <span className="mt-1.5 line-clamp-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--isl-gold))] rtl:tracking-normal">{kicker}</span>
        <span className="font-display mt-1.5 text-[17px] leading-tight text-ink sm:text-[19px]">{saw(title)}</span>
        <span className="mt-2 line-clamp-3 text-[13px] leading-snug text-muted sm:text-[13.5px]">{saw(lead)}</span>
        <span className="mt-auto pt-3 text-[11.5px] font-semibold text-[rgb(var(--isl-gold))]">{meta}</span>
      </div>
    </Link>
  );
}

export default async function IslamHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const u = await islamUi(locale);
  const chs = await loadChapters(locale);
  const ld = { "@context": "https://schema.org", "@type": "CollectionPage", name: u.title, description: u.lead, url: abs(`/${locale}/islam`), inLanguage: locale,
    hasPart: ISLAM.map((d) => ({ "@type": "Article", headline: chs[ISLAM.indexOf(d)].title, url: abs(`/${locale}/islam/${d.slug}`) })) };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih isl-arcade relative z-[1] overflow-hidden text-[#eef0f3]">
        <IslamDome id="dome-hub" className="-end-40 -top-40 w-[560px] sm:-end-20 sm:-top-48 sm:w-[820px]" />
        <IslamRain fall={560} className="opacity-80" />
        <CalligraphyDraw text={"الإسلام"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-14 sm:pb-32 sm:pt-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{u.kicker}</p>
          <h1 className="font-display mt-4 max-w-4xl text-[42px] leading-[1.04] sm:text-7xl">{u.title}</h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/75">{saw(u.lead)}</p>
          <Link href={`/islam/${ISLAM[0].slug}`} className="btn-gold mt-8 inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{u.start}</Link>
        </div>
        <IslamArcadeLine />
      </section>

      <div className="isl-marble isl-under">
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pb-20 sm:pt-20">
          <h2 className="font-display text-4xl leading-tight">{u.chapters}</h2>
          <ol className="mt-8 grid grid-cols-1 gap-3 min-[340px]:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {ISLAM.map((d, i) => {
              const c = chs[i];
              return (
                <li key={d.slug} className="min-w-0">
                  <ChapterCard i={i} href={`/islam/${d.slug}`} title={c.title} lead={c.lead} kicker={c.kicker} ar={d.arabic} meta={`${u.read} · ${readingMinutes(c.body)} ${u.min}`} />
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-24">
          <div className="isl-card relative overflow-hidden px-6 py-10 sm:px-12 sm:py-14">
            <IslamCorners />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_minmax(0,300px)]">
              <div className="min-w-0">
                <h2 className="font-display text-3xl leading-tight sm:text-4xl">{u.uaeTitle}</h2>
                <p className="isl-serif mt-4 max-w-3xl text-[18px] leading-relaxed text-ink/85 sm:text-[19px]">{u.uae}</p>
                <p className="mt-5 text-sm text-muted">{u.note}</p>
              </div>
              <IslamMosque className="mx-auto w-full max-w-[300px] text-[rgb(var(--isl-gold-soft))]" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
