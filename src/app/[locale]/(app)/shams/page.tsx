import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import Markdown from "@/components/Markdown";
import ShamsPlanner from "@/components/ShamsPlanner";
import { GUIDES, guideText } from "@/lib/guides";
import { shamsContent } from "@/lib/shamsContent";
import { abs, pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shams" });
  return pageMeta(locale, "/shams", t("seoTitle"), t("seoDesc"), t("seoKeywords"));
}

// Al-Fatihah 1:2 – used to show the four stages of one verse
const W = ["ٱلْحَمْدُ", "لِلَّهِ", "رَبِّ", "ٱلْعَٰلَمِينَ"];
const CUES = ["ٱلْحَـ", "لِـ", "رَ", "ٱلْعَـ"];

function Curve({ c }: { c: ReturnType<typeof shamsContent> }) {
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
      <line x1="40" y1="220" x2="585" y2="220" stroke="currentColor" strokeOpacity=".25" />
      <line x1="40" y1="20" x2="40" y2="220" stroke="currentColor" strokeOpacity=".25" />
      {reviews.slice(1).map((r) => <g key={r}><line x1={X(r)} y1="20" x2={X(r)} y2="220" stroke="currentColor" strokeOpacity=".08" /><text x={X(r)} y="240" textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity=".6">{r}</text></g>)}
      <path d={without} fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" strokeDasharray="5 5" />
      <path d={path} fill="none" stroke="rgb(var(--gold))" strokeWidth="3" strokeLinejoin="round" />
      <text x="585" y="256" textAnchor="end" fontSize="12" fill="currentColor" fillOpacity=".6">{c.curveAxis.x}</text>
      <text x="44" y="14" fontSize="12" fill="currentColor" fillOpacity=".6">{c.curveAxis.y}</text>
      <g fontSize="12"><rect x="380" y="30" width="14" height="3" fill="rgb(var(--gold))" /><text x="400" y="35" fill="currentColor">{c.curveAxis.with}</text><rect x="380" y="50" width="14" height="2" fill="currentColor" fillOpacity=".35" /><text x="400" y="55" fill="currentColor" fillOpacity=".7">{c.curveAxis.without}</text></g>
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
            <rect x={X(d) - 14} y={190 - h} width="28" height={h} rx="4" fill="rgb(var(--gold))" fillOpacity={0.55 + i * 0.075} />
            <text x={X(d)} y={190 - h - 8} textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">{i + 1}.</text>
            <text x={X(d)} y="208" textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity=".7">{day} {d}</text>
          </g>
        );
      })}
      <path d={`M${X(0)} 175 ${gaps.map((d, i) => `L${X(d)} ${190 - (50 + i * 22) - 2}`).join(" ")}`} fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

export default async function ShamsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shams");
  const c = shamsContent(locale);
  const guide = GUIDES.find((g) => g.slug === "shams-method");
  const de = locale === "de";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "HowTo", name: c.heroTitle, description: c.heroLead, author: { "@type": "Person", name: "Nami Shams" }, url: abs(`/${locale}/shams`), totalTime: "PT4M",
        step: c.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: t(`s${i + 1}`), text: `${s.what} ${s.why}` })) },
      { "@type": "FAQPage", mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
  const dark = "stage text-[#eef0f3]";

  return (
    <div>
      <JsonLd data={ld} />

      {/* Hero */}
      <section className={`${dark} relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgb(var(--gold)) 0, transparent 45%)" }} />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center [&>*]:min-w-0">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{c.heroKicker}</p>
            <h1 className="font-display mt-4 text-[46px] leading-[1.02] sm:text-7xl">{c.heroTitle}</h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/70">{c.heroLead}</p>
            <p className="mt-5 text-sm font-semibold text-white/90">{c.heroBy}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/surah/1?shams=1" className="inline-flex h-12 items-center rounded-md btn-gold px-6 text-[15px] font-bold">{t("cta")}</Link>
              <Link href="/plan" className="inline-flex h-12 items-center rounded-md border border-white/30 px-6 text-[15px] font-bold hover:border-white">{t("planCta")}</Link>
            </div>
          </div>
          {/* One verse, four stages */}
          <figure className="rounded-lg border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <figcaption className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">{c.demoTitle} · 1:2</figcaption>
            <ol className="mt-4 grid gap-3">
              <li className="min-w-0 overflow-hidden rounded-md bg-white/[0.04] p-4"><p className="text-[11px] font-bold text-[rgb(var(--gold))]">1 · {c.demoStages[0]}</p><p className="font-arabic mt-1 text-[28px] leading-[1.9]" dir="rtl">{W.join(" ")}</p></li>
              <li className="min-w-0 overflow-hidden rounded-md bg-white/[0.04] p-4"><p className="text-[11px] font-bold text-[rgb(var(--gold))]">2 · {c.demoStages[1]}</p>
                {[3, 2, 1].map((k) => <p key={k} className="font-arabic text-[22px] leading-[1.8]" dir="rtl">{W.map((w, i) => <span key={i} className={i < k ? "opacity-20" : ""}>{w} </span>)}</p>)}
              </li>
              <li className="min-w-0 overflow-hidden rounded-md bg-white/[0.04] p-4"><p className="text-[11px] font-bold text-[rgb(var(--gold))]">3 · {c.demoStages[2]}</p><p className="font-arabic mt-1 text-[28px] leading-[1.9] text-[rgb(var(--gold))]" dir="rtl">{CUES.join("  ")}</p></li>
              <li className="min-w-0 overflow-hidden rounded-md bg-white/[0.04] p-4"><p className="text-[11px] font-bold text-[rgb(var(--gold))]">4 · {c.demoStages[3]}</p><p className="mt-2 flex flex-row-reverse flex-wrap gap-2">{W.map((w, i) => <span key={i} className="h-7 rounded bg-white/15" style={{ width: `${w.length * 9}px` }} />)}</p></li>
            </ol>
          </figure>
        </div>
      </section>

      {/* Why "Shams" */}
      {c.name && (
        <section className="mx-auto grid max-w-6xl gap-8 px-5 pt-16 sm:pt-24 lg:grid-cols-[auto_1fr] lg:items-center">
          <p className="font-arabic text-center text-[120px] leading-none text-[rgb(var(--gold))] sm:text-[160px]" dir="rtl" aria-hidden>شمس</p>
          <div>
            <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.name.title}</h2>
            <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-muted">{c.name.body}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {c.name.verses.map((v) => (
                <li key={v.ref} className="rounded-lg border border-line bg-surface p-4">
                  <p className="font-arabic text-2xl leading-[1.9]" dir="rtl">{v.ar}</p>
                  {v.meaning && <p className="mt-1 text-sm text-muted">{v.meaning}</p>}
                  <p className="mt-1 text-xs font-semibold text-gold">{v.ref}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.problemTitle}</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
          {c.problems.map((p, i) => (
            <div key={i} className="bg-surface p-6"><p className="font-display text-4xl text-[rgb(var(--gold))]">0{i + 1}</p><h3 className="mt-3 text-lg font-bold">{p.t}</h3><p className="mt-2 text-[15px] leading-relaxed text-muted">{p.d}</p></div>
          ))}
        </div>
        <div className="mt-12 max-w-4xl border-s-4 border-[rgb(var(--gold))] ps-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{c.solutionTitle}</p>
          <p className="font-display mt-3 text-2xl leading-snug sm:text-3xl">{c.solution}</p>
        </div>
      </section>

      {/* Seven steps */}
      <section className={dark}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.stepsTitle}</h2>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">{c.stepsLead}</p>
          <ol className="mt-12 grid gap-6">
            {c.steps.map((s, i) => (
              <li key={i} className="grid gap-6 rounded-lg border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:grid-cols-[14rem_1fr]">
                <div>
                  <p className="font-display text-6xl leading-none text-[rgb(var(--gold))]">{i + 1}</p>
                  <h3 className="font-display mt-3 text-2xl leading-tight">{t(`s${i + 1}`)}</h3>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">{c.labels.time}: {s.time}</p>
                </div>
                <dl className="grid gap-5 sm:grid-cols-3">
                  <div><dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold))]">{c.labels.what}</dt><dd className="mt-2 text-[15px] leading-relaxed text-white/85">{s.what}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold))]">{c.labels.why}</dt><dd className="mt-2 text-[15px] leading-relaxed text-white/70">{s.why}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold))]">{c.labels.platform}</dt><dd className="mt-2 text-[15px] leading-relaxed text-white/70">{s.platform}</dd></div>
                </dl>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Forgetting curve */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.curveTitle}</h2>
          <p className="mt-5 text-[17px] leading-relaxed text-muted">{c.curveLead}</p>
        </div>
        <figure className="rounded-lg border border-line bg-surface p-5 text-ink">
          <Curve c={c} />
          <figcaption className="mt-2 text-xs text-muted">{c.curveNote}</figcaption>
        </figure>
      </section>

      {/* Deep dive: spacing, non-stop repetition, 4-3-2, meaning */}
      {c.spacing && (
        <section className={`${dark}`}>
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.spacing.title}</h2>
            <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-white/70">{c.spacing.lead}</p>
            <ol className="mt-10 grid gap-4 md:grid-cols-2">
              {c.spacing.points.map((p, i) => (
                <li key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                  <p className="font-display text-3xl text-[rgb(var(--gold))]">0{i + 1}</p>
                  <h3 className="mt-2 text-lg font-bold leading-snug">{p.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/75">{p.d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <figure className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <figcaption className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--gold))]">{c.spacing.ladderTitle}</figcaption>
                <p className="mt-2 text-sm text-white/70">{c.spacing.ladderLead}</p>
                <div className="mt-4 text-white"><Ladder day={c.spacing.ladderDay} /></div>
                <p className="mt-2 text-sm font-semibold text-white/85">{c.spacing.ladderNote}</p>
              </figure>
              <figure className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <figcaption className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--gold))]">{c.spacing.fluencyTitle}</figcaption>
                <p className="mt-2 text-sm text-white/70">{c.spacing.fluencyLead}</p>
                <ol className="mt-4 grid gap-3">
                  {c.spacing.fluencySteps.map((st, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="h-10 shrink-0 rounded-md bg-[rgb(var(--gold))] text-[rgb(var(--stage))]" style={{ width: `${(4 - i) * 22}%` }} aria-hidden />
                      <span className="min-w-0"><span className="block text-sm font-bold">{st.min}</span><span className="block text-xs leading-snug text-white/70">{st.d}</span></span>
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
              <p className="rounded-lg border border-[rgb(var(--gold))]/40 bg-[rgb(var(--gold))]/10 px-5 py-4 text-sm font-bold text-[rgb(var(--gold))]">{c.spacing.rule}</p>
            </div>
          </div>
        </section>
      )}

      {/* Adaptive */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.adaptTitle}</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
            {c.adapt.map((a, i) => <div key={i} className="bg-bg p-6"><h3 className="text-lg font-bold">{a.t}</h3><p className="mt-2 text-[15px] leading-relaxed text-muted">{a.d}</p></div>)}
          </div>
        </div>
      </section>

      {/* Daily routine + planner */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("dayTitle")}</h2>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted">{t("dayLead")}</p>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="bg-surface p-6"><p className="font-display text-4xl text-[rgb(var(--gold))]">{n}</p><h3 className="mt-3 text-[16px] font-bold">{t(`day${n}t`)}</h3><p className="mt-2 text-[15px] leading-relaxed text-muted">{t(`day${n}d`)}</p></li>
          ))}
        </ol>
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h3 className="font-display text-3xl">{t("howTitle")}</h3>
            <p className="mt-3 text-[15px] text-muted">{t("howLead")}</p>
            <ul className="mt-4 grid gap-2 text-[15px]">{["how1", "how2", "how3"].map((k) => <li key={k} className="flex gap-3"><span className="mt-2.5 h-px w-4 shrink-0 bg-gold" />{t(k)}</li>)}</ul>
            <p className="mt-3 text-sm text-muted">{t("howNote")}</p>
            <Link href="/plan" className="mt-6 inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-bold text-bg">{t("planCta")}</Link>
          </div>
          <div><h3 className="mb-3 text-lg font-bold">{t("planTitle")}</h3><ShamsPlanner /></div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.compareTitle}</h2>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted">{c.compareLead}</p>
          <div className="mt-10 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-bg text-left"><tr><th className="p-4" />{c.compareCols.map((h, i) => <th key={i} className={`p-4 font-bold ${i === 3 ? "bg-ink text-bg" : ""}`}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">
                {c.compareRows.map((r) => <tr key={r.label}><th className="p-4 text-left font-semibold">{r.label}</th>{r.cells.map((x, i) => <td key={i} className={`p-4 ${i === 3 ? "bg-accent-soft font-semibold" : "text-muted"}`}>{x}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-muted">{c.compareNote}</p>
        </div>
      </section>

      {/* Science principles */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("why")}</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {[9, 10, 2, 8, 1, 3, 4, 5, 6, 7].map((n) => <div key={n} className="bg-surface p-6"><h3 className="text-[16px] font-bold">{t(`p${n}t`)}</h3><p className="mt-2 text-[15px] leading-relaxed text-muted">{t(`p${n}d`)}</p></div>)}
        </div>
      </section>

      {/* Teachers */}
      <section className={dark}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{c.teachTitle}</h2>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">{c.teachLead}</p>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {c.teachPlan.map((s, i) => <li key={i} className="bg-stage p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold))]">{s.min}</p><h3 className="mt-2 text-lg font-bold">{s.t}</h3><p className="mt-2 text-[15px] leading-relaxed text-white/70">{s.d}</p></li>)}
          </ol>
          <p className="mt-6 max-w-3xl text-[15px] text-white/70">{c.teachNote}</p>
        </div>
      </section>

      {/* In-depth article */}
      {guide && (
        <section className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
          <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.deepTitle}</h2>
          <p className="mt-4 text-[17px] text-muted">{c.deepLead}</p>
          <article className="mt-4"><Markdown text={guideText(guide, locale).body} /></article>
        </section>
      )}

      {/* FAQ */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
          <h2 className="font-display text-4xl leading-[1.1]">{t("faqTitle")}</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {c.faq.map((f, i) => (
              <details key={i} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[17px] font-semibold">{f.q}<span aria-hidden className="mt-1 text-muted transition group-open:rotate-45">+</span></summary>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 rounded-lg border border-line border-s-4 border-s-gold bg-bg p-4 text-sm leading-relaxed text-muted">{t("note")}</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className={`${dark} text-center`}>
        <div className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
          <h2 className="font-display text-4xl leading-[1.1] sm:text-6xl">{c.finalTitle}</h2>
          <p className="mt-4 text-[17px] text-white/70">{c.finalLead}</p>
          <Link href="/surah/1?shams=1" className="mt-8 inline-flex h-12 items-center rounded-md btn-gold px-7 text-[15px] font-bold">{t("cta")}</Link>
        </div>
      </section>
    </div>
  );
}
