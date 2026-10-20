import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import Markdown from "@/components/Markdown";
import ShamsPlanner from "@/components/ShamsPlanner";
import { GUIDES, guideText } from "@/lib/guides";
import { shamsContent, type ShamsContent } from "@/lib/shamsContent";
import { abs, pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";
import { IslamArcadeLine, IslamBreak, IslamCorners, IslamNum, IslamRain, IslamStarMark, starPath } from "@/components/art/IslamArt";
import { IslamStepIcon, IslamSun, STEP_AR } from "@/components/art/IslamShams";
import IslamShamsDemo from "@/components/art/IslamShamsDemo";
import DonateCTA from "@/components/DonateCTA";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shams" });
  return pageMeta(locale, "/shams", t("seoTitle"), t("seoDesc"), t("seoKeywords"));
}

// Al-Fatihah 1:2 – used to show the four stages of one verse
const W = ["ٱلْحَمْدُ", "لِلَّهِ", "رَبِّ", "ٱلْعَٰلَمِينَ"];
const CUES = ["ٱلْحَـ", "لِـ", "رَ", "ٱلْعَـ"];

function Curve({ c }: { c: ShamsContent }) {
  // schematic forgetting curves: one without review, one with reviews on day 1, 3, 7, 14 and 30
  const X = (d: number) => 40 + (d / 35) * 540, Y = (p: number) => 20 + (1 - p) * 200;
  const without = Array.from({ length: 36 }, (_, d) => `${d ? "L" : "M"}${X(d).toFixed(1)},${Y(Math.exp(-d / 2.2)).toFixed(1)}`).join(" ");
  const reviews = [0, 1, 3, 7, 14, 30];
  let path = "";
  reviews.forEach((r, i) => {
    const next = reviews[i + 1] ?? 35, s = 1.2 * Math.pow(2.2, i);
    for (let d = r; d <= next; d += 0.25) path += `${path ? "L" : "M"}${X(d).toFixed(1)},${Y(Math.exp(-(d - r) / s)).toFixed(1)} `;
  });
  return (
    <svg viewBox="0 0 600 260" className="w-full" role="img" aria-label={c.curveTitle}>
      <defs>
        <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgb(var(--isl-gold-soft))" stopOpacity=".28" /><stop offset="1" stopColor="rgb(var(--isl-gold-soft))" stopOpacity="0" /></linearGradient>
      </defs>
      <line x1="40" y1="220" x2="585" y2="220" stroke="currentColor" strokeOpacity=".25" />
      <line x1="40" y1="20" x2="40" y2="220" stroke="currentColor" strokeOpacity=".25" />
      {reviews.slice(1).map((r) => <g key={r}><line x1={X(r)} y1="20" x2={X(r)} y2="220" stroke="rgb(var(--isl-gold-soft))" strokeOpacity=".22" strokeDasharray="2 4" /><path d={starPath(X(r), 220, 5, 2.2)} fill="rgb(var(--isl-gold-soft))" /><text x={X(r)} y="240" textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity=".6">{r}</text></g>)}
      <path d={`${path} L${X(35)},220 L${X(0)},220 Z`} fill="url(#curve-fill)" />
      <path d={without} fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" strokeDasharray="5 5" />
      <path d={path} pathLength={1000} className="isl-draw" fill="none" stroke="rgb(var(--isl-gold-soft))" strokeWidth="3" strokeLinejoin="round" strokeDasharray="1000 0" />
      <text x="585" y="256" textAnchor="end" fontSize="12" fill="currentColor" fillOpacity=".6">{c.curveAxis.x}</text>
      <text x="44" y="14" fontSize="12" fill="currentColor" fillOpacity=".6">{c.curveAxis.y}</text>
      <g fontSize="12"><rect x="380" y="30" width="14" height="3" fill="rgb(var(--isl-gold-soft))" /><text x="400" y="35" fill="currentColor">{c.curveAxis.with}</text><rect x="380" y="50" width="14" height="2" fill="currentColor" fillOpacity=".35" /><text x="400" y="55" fill="currentColor" fillOpacity=".7">{c.curveAxis.without}</text></g>
    </svg>
  );
}

// The review ladder: the gaps a verse travels through when every review succeeds (days, log scale)
function Ladder({ day }: { day: string }) {
  const gaps = [1, 3, 7, 14, 30, 90];
  const X = (d: number) => 40 + (Math.log(d + 1) / Math.log(91)) * 530;
  return (
    <svg viewBox="0 0 600 230" className="w-full" role="img" aria-label="1 · 3 · 7 · 14 · 30 · 90">
      <line x1="30" y1="190" x2="590" y2="190" stroke="currentColor" strokeOpacity=".25" />
      <g>
        <line x1={X(0)} y1="190" x2={X(0)} y2="60" stroke="currentColor" strokeOpacity=".3" strokeDasharray="4 3" />
        <text x={X(0)} y="208" textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity=".6">{day} 0</text>
      </g>
      {gaps.map((d, i) => {
        const h = 50 + i * 22;
        return (
          <g key={d}>
            <path d={`M${X(d) - 14} 190V${190 - h + 12}Q${X(d) - 14} ${190 - h} ${X(d)} ${190 - h - 8}Q${X(d) + 14} ${190 - h} ${X(d) + 14} ${190 - h + 12}V190Z`} fill="rgb(233 207 153)" fillOpacity={0.45 + i * 0.09} />
            <text x={X(d)} y={190 - h - 16} textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">{i + 1}.</text>
            <text x={X(d)} y="208" textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity=".7">{day} {d}</text>
          </g>
        );
      })}
      <path d={`M${X(0)} 175 ${gaps.map((d, i) => `L${X(d)} ${190 - (50 + i * 22) - 10}`).join(" ")}`} fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

// small line pictures for the learning principles (static)
function PrincipleIcon({ n }: { n: number }) {
  const map: Record<number, number> = { 1: 1, 2: 2, 3: 3, 5: 6, 7: 7, 8: 6, 10: 4 };
  if (map[n]) return <IslamStepIcon n={map[n]} className="isl-static h-9 w-9" />;
  const c = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="h-9 w-9">
      {n === 4 && <g {...c}><circle cx="19" cy="24" r="10" fill="currentColor" fillOpacity=".12" /><circle cx="29" cy="24" r="10" fill="currentColor" fillOpacity=".12" /></g>}
      {n === 6 && <g {...c}><path d="M8 38h32" />{[1, 3, 7, 14, 30].map((d, i) => <rect key={d} x={9 + i * 6.4} y={36 - (6 + i * 5)} width="4.2" height={6 + i * 5} rx="1" fill="currentColor" fillOpacity={0.15 + i * 0.12} />)}</g>}
      {n === 9 && <g {...c}><path d="M8 38h32M8 38V10" strokeOpacity=".5" /><path d="M10 14c4 14 7 18 10 18 3 0 5-10 8-10s5 6 10 6" /><circle cx="20" cy="32" r="1.8" fill="currentColor" /><circle cx="28" cy="22" r="1.8" fill="currentColor" /><circle cx="38" cy="28" r="1.8" fill="currentColor" /></g>}
    </svg>
  );
}

// the four parts of a learning day, as the sun moves
function DayIcon({ n }: { n: number }) {
  const c = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="h-10 w-10">
      <path d="M6 34h36" {...c} strokeOpacity=".5" />
      {n === 1 && <g {...c}><path d="M15 34a9 9 0 0 1 18 0" fill="currentColor" fillOpacity=".15" /><path d="M24 18v4M14 24l2.5 2.5M34 24l-2.5 2.5" /></g>}
      {n === 2 && <g {...c}><circle cx="24" cy="18" r="6" fill="currentColor" fillOpacity=".2" />{Array.from({ length: 8 }, (_, i) => { const a = (Math.PI / 4) * i; return <path key={i} d={`M${24 + 9 * Math.cos(a)} ${18 + 9 * Math.sin(a)}L${24 + 12 * Math.cos(a)} ${18 + 12 * Math.sin(a)}`} />; })}</g>}
      {n === 3 && <g {...c}><path d="M17 34a7 7 0 0 1 14 0" fill="currentColor" fillOpacity=".2" /><path d="M10 40h28" strokeOpacity=".35" /><path d="M31 22l3-3M17 22l-3-3" /></g>}
      {n === 4 && <g {...c}><path d="M28 12a10 10 0 1 0 6 18 8 8 0 1 1-6-18z" fill="currentColor" fillOpacity=".2" /><path d="M14 14l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8z" fill="currentColor" stroke="none" /></g>}
    </svg>
  );
}

const minutesOf = (s: string) => { const m = s.match(/\d+/); return m ? Number(m[0]) : 1; };

export default async function ShamsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shams");
  const c = shamsContent(locale);
  const guide = GUIDES.find((g) => g.slug === "shams-method");
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "HowTo", name: c.heroTitle, description: c.heroLead, author: { "@type": "Person", name: "Nami Shams" }, url: abs(`/${locale}/shams`), totalTime: "PT4M",
        step: c.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: t(`s${i + 1}`), text: `${s.what} ${s.why}` })) },
      { "@type": "FAQPage", mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
  const dark = "stage text-[#eef0f3]";
  const gold = "text-[rgb(233_207_153)]";
  const kicker = "text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]";
  const total = c.teachPlan.reduce((a, s) => a + minutesOf(s.min), 0);

  return (
    <div>
      <JsonLd data={ld} />

      {/* Hero: the sun rises over an arcade */}
      <section className={`${dark} girih isl-arcade relative z-[1] overflow-hidden`}>
        <IslamRain fall={620} className="opacity-70" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-5 pb-20 pt-10 sm:pb-28 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 [&>*]:min-w-0">
          <div className="relative order-1 mx-auto -mb-4 w-[230px] sm:w-[300px] lg:order-2 lg:mb-0 lg:w-full lg:max-w-[460px]">
            <IslamSun className="h-auto w-full" />
          </div>
          <div className="order-2 lg:order-1">
            <p className={kicker}>{c.heroKicker}</p>
            <h1 className="font-display mt-4 text-[44px] leading-[1.02] sm:text-7xl">{c.heroTitle}</h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/75">{c.heroLead}</p>
            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-white/90"><IslamStarMark className={`h-3.5 w-3.5 ${gold}`} />{c.heroBy}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/surah/1?shams=1" className="btn-gold inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{t("cta")}</Link>
              <Link href="/plan" className="inline-flex h-12 items-center rounded-full border border-[rgb(233_207_153)]/40 px-6 text-[15px] font-bold text-white/90 transition hover:border-[rgb(233_207_153)] hover:text-white">{t("planCta")}</Link>
            </div>
            {c.heroFacts && (
              <dl className="mt-10 grid max-w-xl grid-cols-3 gap-2.5 sm:gap-3">
                {c.heroFacts.map((f) => <div key={f.l} className="isl-fact"><dt className={`font-display text-[26px] leading-none sm:text-4xl ${gold}`}>{f.n}</dt><dd className="mt-2 text-[12px] leading-snug text-white/65 sm:text-[13px]">{f.l}</dd></div>)}
              </dl>
            )}
          </div>
        </div>
        <IslamArcadeLine />
      </section>

      <div className="isl-marble isl-under">
        {/* Why "Shams" */}
        {c.name && (
          <section className="mx-auto max-w-6xl px-5 pt-14 sm:pt-20">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center [&>*]:min-w-0">
              <div>
                <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.name.title}</h2>
                <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink/80">{c.name.body}</p>
              </div>
              <ul className="grid gap-4">
                {c.name.verses.map((v) => (
                  <li key={v.ref} className="isl-card px-5 pb-5 pt-6 text-center sm:px-8">
                    <IslamCorners />
                    <p className="font-arabic text-[26px] leading-[1.9] text-[rgb(var(--isl-head))] sm:text-[30px]" dir="rtl">{v.ar}</p>
                    {v.meaning && <p className="mx-auto mt-1 max-w-md text-[15px] text-muted">{v.meaning}</p>}
                    <p className="mt-3"><span className="isl-ref"><IslamStarMark />{v.ref}</span></p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Problem and solution */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.problemTitle}</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {c.problems.map((p, i) => (
              <li key={i} className="isl-card p-6">
                <IslamNum n={i + 1} className="!h-11 !w-11 !text-[15px]" />
                <h3 className="mt-4 text-lg font-bold leading-snug">{p.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.d}</p>
              </li>
            ))}
          </ol>
          <figure className="relative mt-12 overflow-hidden rounded-2xl stage px-6 py-9 text-center text-[#f3ead6] sm:px-14 sm:py-12">
            <span aria-hidden className="illum-frame" />
            <IslamSun word="" className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-25" id="sun-sol" />
            <figcaption className={`relative ${kicker}`}>{c.solutionTitle}</figcaption>
            <blockquote className="isl-serif relative mx-auto mt-4 max-w-4xl text-[22px] leading-snug rtl:leading-[1.8] sm:text-[30px]">{c.solution}</blockquote>
          </figure>
        </section>
      </div>

      {/* Seven steps: a journey towards the sun */}
      <section className={`${dark} girih relative overflow-hidden`}>
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.stepsTitle}</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-white/70">{c.stepsLead}</p>
          </div>
          <ol className="isl-journey mt-14">
            {c.steps.map((s, i) => (
              <li key={i} className="isl-jstep" style={{ ["--glow" as string]: (0.18 + i * 0.07).toFixed(2) }}>
                <div className="isl-jnode"><IslamNum n={i + 1} /></div>
                <article className="isl-jcard">
                  <div className="flex items-center gap-3">
                    <span className="isl-jicon"><IslamStepIcon n={i + 1} /></span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[21px] leading-tight sm:text-2xl">{t(`s${i + 1}`)}</h3>
                      <p className="mt-1 text-[12px] font-semibold text-white/55">{c.labels.time}: {s.time}</p>
                    </div>
                    {locale !== "ar" && <span className={`font-callig hidden shrink-0 text-[26px] leading-none sm:block ${gold} opacity-80`} dir="rtl" aria-hidden>{STEP_AR[i]}</span>}
                  </div>
                  {c.stepTags?.[i] && <p className="mt-4"><span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(233_207_153)]/35 bg-[rgb(233_207_153)]/10 px-2.5 py-1 text-[11.5px] font-semibold text-[rgb(233_207_153)]"><IslamStarMark className="h-3 w-3" />{c.stepTags[i]}</span></p>}
                  <p className="mt-3 text-[15.5px] leading-relaxed text-white/85">{s.what}</p>
                  <details className="group mt-4 border-t border-white/10 pt-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-bold text-[rgb(233_207_153)]">
                      {c.labels.why}<span className="isl-plus h-6 w-6 rounded-full border border-[rgb(233_207_153)]/40 text-base leading-none">+</span>
                    </summary>
                    <p className="mt-3 text-[14.5px] leading-relaxed text-white/75">{s.why}</p>
                    <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/45">{c.labels.platform}</p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-white/75">{s.platform}</p>
                  </details>
                </article>
              </li>
            ))}
          </ol>
          <div className="isl-jend mt-4"><IslamSun word="" id="sun-end" className="h-full w-full" /></div>
        </div>
      </section>

      <div className="isl-marble">
        {/* One verse, four stages (interactive) */}
        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center [&>*]:min-w-0">
          <div>
            <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.demoTitle}</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-ink/75">{t("d6")}</p>
            <Link href="/surah/1?shams=1" className="btn-gold mt-7 inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{t("cta")}</Link>
          </div>
          <IslamShamsDemo words={W} cues={CUES} stages={c.demoStages} title={c.demoTitle} />
        </section>

        {/* Roots in the hifz tradition */}
        {c.heritage && (
          <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-24">
            <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.heritage.title}</h2>
            <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-ink/75">{c.heritage.lead}</p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {c.heritage.items.map((h) => (
                <li key={h.t} className="isl-card isl-card-hover flex flex-col overflow-hidden">
                  <div className="relative grid h-32 place-items-center overflow-hidden rounded-t-[13px] bg-[rgb(var(--stage))] text-[rgb(233_207_153)]">
                    <span aria-hidden className="niche" />
                    <span className="font-arabic relative px-3 text-center text-[28px] font-bold leading-[1.6]" dir="rtl" lang="ar">{h.ar}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-[17px] font-bold leading-snug">{h.t}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{h.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Why it works: the learning principles */}
        <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("why")}</h2>
          {c.principlesLead && <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-ink/75">{c.principlesLead}</p>}
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {[9, 10, 2, 8, 1, 3, 4, 5, 6, 7].map((n) => (
              <li key={n} className="isl-card isl-card-hover flex gap-4 p-5 sm:p-6">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-[rgb(var(--isl-gold))]" style={{ background: "radial-gradient(circle at 50% 35%, rgb(var(--isl-gold-soft) / .2), rgb(var(--isl-gold-soft) / .05) 70%)", boxShadow: "inset 0 0 0 1px rgb(var(--isl-gold-soft) / .4)" }}><PrincipleIcon n={n} /></span>
                <div className="min-w-0">
                  <h3 className="text-[16.5px] font-bold leading-snug">{t(`p${n}t`)}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{t(`p${n}d`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Forgetting curve */}
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 sm:pb-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center [&>*]:min-w-0">
          <div>
            <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.curveTitle}</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-ink/75">{c.curveLead}</p>
          </div>
          <figure className="isl-card p-5 text-ink sm:p-6">
            <Curve c={c} />
            <figcaption className="mt-2 text-xs text-muted">{c.curveNote}</figcaption>
          </figure>
        </section>
      </div>

      {/* Deep dive: spacing, non-stop repetition, 4-3-2, meaning */}
      {c.spacing && (
        <section className={`${dark} girih relative overflow-hidden`}>
          <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.spacing.title}</h2>
            <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-white/70">{c.spacing.lead}</p>
            <ol className="mt-10 grid gap-4 md:grid-cols-2">
              {c.spacing.points.map((p, i) => (
                <li key={i} className="isl-jcard">
                  <IslamNum n={i + 1} className={`!h-11 !w-11 !text-[15px] ${gold}`} />
                  <h3 className="mt-3 text-lg font-bold leading-snug">{p.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/75">{p.d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] [&>*]:min-w-0">
              <figure className="isl-jcard">
                <figcaption className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(233_207_153)]">{c.spacing.ladderTitle}</figcaption>
                <p className="mt-2 text-sm text-white/70">{c.spacing.ladderLead}</p>
                <div className="mt-4 text-white"><Ladder day={c.spacing.ladderDay} /></div>
                <p className="mt-2 text-sm font-semibold text-white/85">{c.spacing.ladderNote}</p>
              </figure>
              <figure className="isl-jcard">
                <figcaption className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(233_207_153)]">{c.spacing.fluencyTitle}</figcaption>
                <p className="mt-2 text-sm text-white/70">{c.spacing.fluencyLead}</p>
                <ol className="mt-4 grid gap-3">
                  {c.spacing.fluencySteps.map((st, i) => (
                    <li key={i}>
                      <p className="flex items-baseline justify-between gap-3"><span className="text-sm font-bold">{st.min}</span></p>
                      <span className="isl-grow mt-1.5 block h-2.5 rounded-full" style={{ width: `${100 - i * 25}%`, background: "linear-gradient(90deg, #c9a65e, #ecd6a2)" }} aria-hidden />
                      <span className="mt-1.5 block text-[13px] leading-snug text-white/70">{st.d}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-sm text-white/75">{c.spacing.fluencyNote}</p>
              </figure>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
              <div className="max-w-3xl">
                <h3 className="font-display text-2xl">{c.spacing.meaningTitle}</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-white/75">{c.spacing.meaning}</p>
              </div>
              <p className="isl-serif rounded-2xl border border-[rgb(233_207_153)]/40 bg-[rgb(233_207_153)]/10 px-5 py-4 text-[17px] font-semibold text-[rgb(233_207_153)]">{c.spacing.rule}</p>
            </div>
          </div>
        </section>
      )}

      <div className="isl-marble">
        {/* Adaptive */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.adaptTitle}</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {c.adapt.map((a, i) => (
              <li key={i} className="isl-card flex gap-4 p-5 sm:p-6">
                <IslamNum n={i + 1} className="!h-10 !w-10" />
                <div className="min-w-0"><h3 className="text-lg font-bold leading-snug">{a.t}</h3><p className="mt-2 text-[15px] leading-relaxed text-muted">{a.d}</p></div>
              </li>
            ))}
          </ul>
        </section>

        {/* Daily routine + planner */}
        <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("dayTitle")}</h2>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink/75">{t("dayLead")}</p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="isl-card p-6">
                <div className="flex items-center justify-between text-[rgb(var(--isl-gold))]"><DayIcon n={n} /><span className="font-display text-3xl opacity-80">{n}</span></div>
                <h3 className="mt-4 text-[16px] font-bold leading-snug">{t(`day${n}t`)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{t(`day${n}d`)}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] [&>*]:min-w-0">
            <div>
              <h3 className="font-display text-3xl">{t("howTitle")}</h3>
              <p className="mt-3 text-[15px] text-muted">{t("howLead")}</p>
              <ul className="isl-ul mt-4 text-[15px]">{["how1", "how2", "how3"].map((k) => <li key={k}>{t(k)}</li>)}</ul>
              <p className="mt-3 text-sm text-muted">{t("howNote")}</p>
              <Link href="/plan" className="btn-gold mt-6 inline-flex h-11 items-center rounded-full px-5 text-sm font-bold">{t("planCta")}</Link>
            </div>
            <div><h3 className="mb-3 text-lg font-bold">{t("planTitle")}</h3><ShamsPlanner /></div>
          </div>
        </section>

        {/* Comparison */}
        <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.compareTitle}</h2>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink/75">{c.compareLead}</p>
          <div className="isl-card mt-10 hidden overflow-hidden md:block">
            <table className="isl-compare w-full text-[14.5px]">
              <thead><tr><th className="w-[22%]" />{c.compareCols.map((h, i) => <th key={i} className={`font-bold ${i === 3 ? "hl" : "text-muted"}`}>{i === 3 ? <span className="flex items-center gap-2"><IslamStarMark className="h-4 w-4" />{h}</span> : h}</th>)}</tr></thead>
              <tbody>
                {c.compareRows.map((r) => <tr key={r.label}><th className="font-semibold">{r.label}</th>{r.cells.map((x, i) => <td key={i} className={i === 3 ? "hl" : "text-muted"}>{x}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
          <ul className="mt-8 grid gap-3 md:hidden">
            {c.compareRows.map((r) => (
              <li key={r.label} className="isl-card p-4">
                <h3 className="font-bold">{r.label}</h3>
                <dl className="mt-3 grid gap-1.5 text-[14px]">
                  {r.cells.map((x, i) => (
                    <div key={i} className={`grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 rounded-lg px-2.5 py-1.5 ${i === 3 ? "bg-[rgb(var(--isl-gold-soft))]/15 font-semibold" : ""}`}>
                      <dt className={i === 3 ? "text-[rgb(var(--isl-gold))]" : "text-muted"}>{c.compareCols[i]}</dt><dd>{x}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-muted">{c.compareNote}</p>
        </section>
      </div>

      {/* Teachers */}
      <section className={`${dark} girih relative overflow-hidden`}>
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.teachTitle}</h2>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">{c.teachLead}</p>
          <div className="isl-lesson mt-10" aria-hidden>
            {c.teachPlan.map((s, i) => <span key={i} style={{ flex: minutesOf(s.min) / total, ["--a" as string]: (0.3 + (i % 2) * 0.35).toFixed(2) }} />)}
          </div>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.teachPlan.map((s, i) => (
              <li key={i} className="isl-jcard">
                <div className="flex items-center justify-between gap-3"><IslamNum n={i + 1} className={`!h-9 !w-9 ${gold}`} /><span className="rounded-full border border-[rgb(233_207_153)]/35 px-2.5 py-0.5 text-[12px] font-semibold text-[rgb(233_207_153)]">{s.min}</span></div>
                <h3 className="mt-3 text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/70">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-3xl text-[15px] text-white/70">{c.teachNote}</p>
        </div>
      </section>

      <div className="isl-marble">
        {/* Why learning the Quran matters (hadith and Quran) */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{t("whyTitle")}</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-ink/75">{t("whyLead")}</p>
          </div>
          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <li key={n} className={n === 5 ? "md:col-span-2" : ""}>
                <figure className="isl-quote !my-0 h-full">
                  <span className="isl-quote-star"><svg viewBox="0 0 24 24" className="h-full w-full"><path d={starPath(12, 12, 11, 5)} fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1" /><circle cx="12" cy="12" r="2.2" fill="currentColor" /></svg></span>
                  <blockquote className="text-[17px] sm:text-[19px]">{t(`why${n}`)}</blockquote>
                  <figcaption><span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--isl-gold))]">{t(`why${n}s`)}</span></figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p className="isl-serif mx-auto mt-10 max-w-3xl text-center text-[19px] leading-relaxed text-ink/85">{t("whyClose")}</p>
        </section>

        {/* In-depth article */}
        {guide && (
          <section className="mx-auto max-w-3xl px-5 pb-16 sm:pb-24">
            <IslamBreak className="!mt-0" />
            <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.deepTitle}</h2>
            <p className="mt-4 text-[17px] text-muted">{c.deepLead}</p>
            <article className="mt-8"><Markdown text={guideText(guide, locale).body} variant="article" numbered={false} /></article>
          </section>
        )}

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-5 pb-16 sm:pb-24">
          <h2 className="font-display text-4xl leading-[1.1]">{t("faqTitle")}</h2>
          <div className="mt-8 grid gap-3">
            {c.faq.map((f, i) => (
              <details key={i} className="isl-faq isl-card group p-0">
                <summary className="flex cursor-pointer list-none items-start gap-3 p-4 text-[16.5px] font-semibold leading-snug sm:p-5">
                  <IslamStarMark className="mt-1 h-4 w-4 shrink-0 text-[rgb(var(--isl-gold-soft))]" />
                  <span className="min-w-0 flex-1">{f.q}</span>
                  <span aria-hidden className="isl-plus h-7 w-7 shrink-0 rounded-full border border-[rgb(var(--isl-gold-soft))]/50 text-[rgb(var(--isl-gold))]">+</span>
                </summary>
                <p className="px-4 pb-5 ps-11 text-[15px] leading-relaxed text-muted sm:px-5 sm:ps-12">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="callout mt-8 rounded-lg p-4 text-sm leading-relaxed text-muted">{t("note")}</p>
        </section>
      </div>

      {/* Final call: your first verse */}
      <section className={`${dark} girih relative overflow-hidden text-center`}>
        <IslamSun word="" id="sun-final" className="pointer-events-none absolute bottom-[-200px] left-1/2 h-[400px] w-[400px] -translate-x-1/2 opacity-70 sm:bottom-[-280px] sm:h-[560px] sm:w-[560px]" />
        <IslamRain fall={560} className="opacity-60" />
        <div className="relative mx-auto max-w-3xl px-5 pb-[230px] pt-16 sm:pb-[310px] sm:pt-24">
          <h2 className="font-display text-4xl leading-[1.1] sm:text-6xl">{c.finalTitle}</h2>
          <p className="mt-4 text-[17px] text-white/75">{c.finalLead}</p>
          <ol className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-1.5 gap-y-2 text-[12.5px] font-semibold text-white/80">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => <li key={n} className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(233_207_153)]/25 bg-white/[0.04] py-1 pe-3 ps-1"><IslamNum n={n} className={`!h-6 !w-6 !text-[10px] ${gold}`} />{t(`s${n}`)}</li>)}
          </ol>
          {c.finalPoints && <ul className="mx-auto mt-8 grid max-w-xl gap-2 text-start text-[15px] text-white/80">{c.finalPoints.map((p) => <li key={p} className="flex gap-2.5"><IslamStarMark className={`mt-1 h-3.5 w-3.5 shrink-0 ${gold}`} />{p}</li>)}</ul>}
          <Link href="/surah/1?shams=1" className="btn-gold mt-9 inline-flex h-12 items-center rounded-full px-7 text-[15px] font-bold">{t("cta")}</Link>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-5 pt-12"><DonateCTA variant="slim" /></div>
      <MoreTiles keys={["courses", "plan", "map", "arabic"]} className="pt-12" />
    </div>
  );
}
