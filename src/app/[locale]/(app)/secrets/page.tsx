import type { Metadata } from "next";
import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import WordCounter from "@/components/WordCounter";
import { MoreTiles } from "@/components/PosterTiles";
import DonateCTA from "@/components/DonateCTA";
import { MORE_GROUPS, SECTIONS, secretsContent, type Verdict } from "@/lib/secrets/content";
import { COUNTS } from "@/lib/secrets/counts";
import { missingRefs, refPath, refSegments } from "@/lib/secrets/refs";
import { bundledVerses } from "@/lib/secrets/scripture";
import { HADITH_API_NAME, hadithWording } from "@/lib/secrets/hadith";
import { DAY, getJson, memo, withTimeout } from "@/lib/feedWeb/net";
import { getResources, getVerseByKey, pickTranslation } from "@/lib/quran";
import { abs, pageMeta } from "@/lib/site";
import { CalligraphyDraw } from "@/components/Ornaments";
import { IslamArcadeLine, IslamArchWindow, IslamBreak, IslamCorners, IslamDome, IslamNum, IslamRain, IslamStarMark, saw, starPath } from "@/components/art/IslamArt";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = await secretsContent(locale);
  return pageMeta(locale, "/secrets", `${c.title} | Quran Masterclass`, c.lead.slice(0, 158));
}

// A reference like "71:10-12" from Quran.com (through our cache): the Uthmani wording and the translation in the
// reader's language (none for Arabic); empty if it is not available, then the page shows the same verses from the
// Quran.com snapshots (bundledVerses in lib/secrets/scripture.ts) – never a rendering of our own
type VerseText = { ar: string; tr: string };
async function verseOf(ref: string, locale: string, tid: number): Promise<VerseText> {
  const [s, range] = ref.split(":");
  const [a, b = a] = range.split("-").map(Number);
  try {
    const vs = await Promise.all(Array.from({ length: b - a + 1 }, (_, i) => getVerseByKey(`${s}:${a + i}`, locale, tid)));
    if (vs.some((v, i) => v.verse_key !== `${s}:${a + i}`)) return { ar: "", tr: "" };
    const clean = (t: string) => t.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    return { ar: vs.map((v) => v.text_uthmani).join(" ۝ "), tr: vs.map((v) => clean(v.translation)).filter(Boolean).join(" ") };
  } catch { return { ar: "", tr: "" }; }
}
async function translationOf(locale: string): Promise<{ id: number; name: string }> {
  try {
    const { translations } = await getResources();
    const id = pickTranslation(locale, translations);
    const t = translations.find((x) => x.id === id);
    return { id, name: t ? t.author_name || t.name : "" };
  } catch { return { id: 20, name: "" }; }
}

// The hadith quotes ("read" and the wealth hadith) in the wording of hadith-api where it has the reader's language
// (lib/secrets/hadith.ts, cached a week like the home page's hadith); null shows the item's own-words summary instead
async function hadithJSON(url: string): Promise<unknown> {
  const v = await memo(`secrets:${url}`, 7 * DAY, () => getJson<unknown>(url));
  if (v === null) throw new Error("unavailable");
  return v;
}
function wordingOf(ref: string | undefined, locale: string): Promise<string | null> {
  return ref ? withTimeout(hadithWording(ref, locale, hadithJSON), 9000).catch(() => null) : Promise.resolve(null);
}

// text with its verse references as gold chips that open the reader
function Linked({ text, k }: { text: string; k: string }): ReactNode {
  return refSegments(text).map((s, i) => s.ref
    ? <Link key={`${k}${i}`} href={refPath(s.ref)} className="isl-ref"><IslamStarMark />{s.text}</Link>
    : <span key={`${k}${i}`}>{saw(s.text, `${k}${i}-`)}</span>);
}
// a source line: hadith collections as text, verses as chips (also those a translation names by surah name only)
function Source({ local, en, k, className = "" }: { local: string; en: string; k: string; className?: string }) {
  const extra = missingRefs(local, en);
  if (!local && !extra.length) return null;
  return (
    <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--isl-gold))] rtl:tracking-normal ${className}`}>
      <Linked text={local} k={k} />
      {extra.map((r) => <Link key={r} href={refPath(r)} className="isl-ref normal-case tracking-normal"><IslamStarMark />{r}</Link>)}
    </span>
  );
}

const BADGE: Record<Verdict, string> = { true: "border-accent/35 bg-accent/10 text-accent", false: "border-[rgb(var(--isl-garnet))]/35 bg-[rgb(var(--isl-garnet))]/10 text-[rgb(var(--isl-garnet))]", method: "border-[rgb(var(--isl-gold-soft))]/45 bg-[rgb(var(--isl-gold-soft))]/10 text-[rgb(var(--isl-gold))]" };
const STAR = <svg viewBox="0 0 24 24" className="h-full w-full"><path d={starPath(12, 12, 11, 5)} fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1" /><circle cx="12" cy="12" r="2.2" fill="currentColor" /></svg>;
const H2 = "font-display text-3xl sm:text-4xl";

export default async function SecretsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = await secretsContent(locale);
  const en = await secretsContent("en");
  const tr = await translationOf(locale);
  const [verses, said, wealthSaid] = await Promise.all([
    Promise.all(c.promises.map((p) => verseOf(p.ref, locale, tr.id))),
    Promise.all(c.hadith.map((h) => wordingOf(h.ref, locale))),
    wordingOf(c.wealthHadith.ref, locale),
  ]);
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", url: abs(`/${locale}/secrets`), inLanguage: locale, mainEntity: c.claims.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) };
  const more = c.more ?? [];
  let n = 0;

  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih isl-arcade relative z-[1] overflow-hidden text-[#eef0f3]">
        <IslamDome id="dome-sec" className="-end-40 -top-44 w-[560px] sm:-end-24 sm:-top-48 sm:w-[780px]" />
        <IslamRain fall={700} className="opacity-70" />
        <CalligraphyDraw text={"أسرار"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-14 sm:pb-14 sm:pt-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{c.kicker}</p>
          <h1 className="font-display mt-4 max-w-3xl text-[40px] leading-[1.05] sm:text-6xl">{c.title}</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/75">{saw(c.lead)}</p>
          <nav aria-label={c.nav.title} className="mt-8 max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55 rtl:tracking-normal">{c.nav.title}</p>
            <ol className="mt-3 flex flex-wrap gap-2">
              {SECTIONS.map((id, i) => (
                <li key={id}>
                  <a href={`#${id}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 py-1.5 pe-3.5 ps-2 text-[13px] font-semibold text-white/80 transition hover:border-[rgb(233_207_153)]/60 hover:text-white">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[rgb(233_207_153)]/15 text-[11px] text-[rgb(233_207_153)]">{i + 1}</span>{c.nav[id]}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <div id="counter" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 pb-24 sm:pb-32">
          <div className="relative overflow-hidden rounded-2xl border border-[rgb(233_207_153)]/25 bg-white/[0.04] p-5 sm:p-8">
            <span aria-hidden className="illum-frame opacity-60" />
            <div className="relative">
              <h2 className="font-display text-2xl sm:text-3xl">{c.counterTitle}</h2>
              <p className="mt-2 max-w-2xl text-[15px] text-white/70">{c.counterLead}</p>
              <div className="mt-6"><WordCounter words={c.words} times={c.times} spots={c.spots} note={c.allahNote} locale={locale} /></div>
              <p className="mt-6 border-t border-white/10 pt-4 text-[12px] leading-relaxed text-white/50">{c.method}</p>
            </div>
          </div>
        </div>
        <IslamArcadeLine />
      </section>

      <div className="isl-marble isl-under">
        <section id="claims" className="mx-auto max-w-4xl scroll-mt-20 px-5 pb-14 pt-14 sm:pb-20 sm:pt-20">
          <h2 className={H2}>{c.claimsTitle}</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/75">{c.claimsLead}</p>
          <dl className="isl-card mt-6 grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
            {(["true", "method", "false"] as Verdict[]).map((v) => (
              <div key={v}>
                <dt><span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${BADGE[v]}`}>{c.verdicts[v]}</span></dt>
                <dd className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{c.verdictHelp[v]}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 grid gap-3">
            {c.claims.map((x, i) => (
              <details key={x.q} className="isl-faq isl-card group p-0">
                <summary className="flex cursor-pointer list-none items-start gap-3 p-4 sm:p-5">
                  <span className="min-w-0 flex-1">
                    <span className={`mb-2 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold sm:mb-0 sm:me-3 ${BADGE[x.v]}`}>{c.verdicts[x.v]}</span>
                    <span className="block text-[16px] font-semibold leading-snug sm:inline">{saw(x.q)}</span>
                  </span>
                  <span aria-hidden className="isl-plus h-7 w-7 shrink-0 rounded-full border border-[rgb(var(--isl-gold-soft))]/50 text-[rgb(var(--isl-gold))]">+</span>
                </summary>
                <div className="px-4 pb-5 sm:px-5">
                  <p className="text-[15px] leading-relaxed text-muted"><Linked text={x.a} k={`c${i}-`} /></p>
                  {x.key && (x.key === "allah" || COUNTS[x.key]) && (
                    <a href={`#w-${x.key}`} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:underline">
                      <IslamStarMark className="h-3.5 w-3.5" />{c.showPlaces}
                    </a>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>

        <IslamBreak className="!my-0 px-5" />

        <section id="facts" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14 sm:py-20">
          <h2 className={H2}>{c.factsTitle}</h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {c.facts.map((f, i) => (
              <li key={f.title} className="isl-card isl-card-hover flex flex-col overflow-hidden p-2.5 sm:p-3">
                <IslamArchWindow i={i} ar={f.ar} id={`sf${i}`} />
                <div className="flex flex-1 flex-col px-1.5 pb-2 pt-3 text-center">
                  <h3 className="font-display text-[18px] leading-tight sm:text-[20px]">{saw(f.title)}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted"><Linked text={f.body} k={`f${i}-`} /></p>
                  <Source local={f.src} en={en.facts[i]?.src ?? ""} k={`fs${i}-`} className="mt-auto block pt-3" />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {more.length > 0 && (
          <section id="more" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-14 sm:pb-20">
            <h2 className={H2}>{c.moreTitle}</h2>
            {MORE_GROUPS.map((g, gi) => {
              const items = g.filter((i) => more[i]);
              if (!items.length) return null;
              return (
                <div key={gi} className="mt-10 first-of-type:mt-8">
                  <h3 className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.14em] text-[rgb(var(--isl-gold))] rtl:tracking-normal">
                    <IslamStarMark className="h-4 w-4 shrink-0" />{c.moreGroups[gi]}
                    <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-[rgb(var(--isl-gold-soft))]/50 to-transparent rtl:bg-gradient-to-l" />
                  </h3>
                  <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    {items.map((i) => {
                      const f = more[i];
                      n += 1;
                      return (
                        <li key={f.title} className="isl-card relative flex flex-col overflow-hidden p-5">
                          <span aria-hidden className="font-callig pointer-events-none absolute -end-1 -top-1 whitespace-nowrap text-[3.4rem] leading-none text-[rgb(var(--isl-gold))] opacity-[0.12]" dir="rtl">{f.ar}</span>
                          <IslamNum n={n} className="relative !h-9 !w-9" />
                          <h4 className="font-display relative mt-2 text-[19px] leading-tight">{saw(f.title)}</h4>
                          <p className="relative mt-2 text-[14.5px] leading-relaxed text-muted"><Linked text={f.body} k={`m${i}-`} /></p>
                          <Source local={f.src} en={en.more?.[i]?.src ?? ""} k={`ms${i}-`} className="relative mt-auto block pt-3" />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </section>
        )}

        <section id="read" className="mx-auto max-w-4xl scroll-mt-20 px-5 pb-14 sm:pb-20">
          <h2 className={H2}>{c.readTitle}</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/75">{c.readLead}</p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {c.hadith.map((h, i) => (
              <li key={h.src} className={c.hadith.length % 2 && i === c.hadith.length - 1 ? "sm:col-span-2" : ""}>
                <figure className="isl-quote !my-0 h-full">
                  <span className="isl-quote-star" aria-hidden>{STAR}</span>
                  <blockquote className="text-[17px]">{saw(said[i] ?? h.text)}</blockquote>
                  <figcaption><span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--isl-gold))] rtl:tracking-normal">{said[i] ? `${h.src} · ${HADITH_API_NAME}` : h.src}</span></figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>

        <section id="wealth" className="mx-auto max-w-4xl scroll-mt-20 px-5 pb-14 sm:pb-20">
          <h2 className={H2}>{c.wealthTitle}</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/75">{c.wealthLead}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {c.promises.map((p, i) => {
              // the verses from Quran.com, else from its snapshots; Arabic shows the wording only
              const b = bundledVerses(p.ref, locale);
              const v = { ar: verses[i].ar || b.ar, tr: verses[i].tr || b.tr };
              const text = locale === "ar" ? "" : v.tr;
              const trName = verses[i].tr ? tr.name : b.name;
              return (
                <li key={p.ref} className="isl-card flex flex-col p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[16px] font-bold leading-snug">{p.title}</h3>
                    <Link href={refPath(p.ref)} className="isl-ref !m-0 shrink-0"><IslamStarMark />{p.ref}</Link>
                  </div>
                  {v.ar && <p className="font-arabic mt-4 rounded-xl border border-[rgb(var(--isl-gold-soft))]/35 bg-[rgb(var(--isl-gold-soft))]/[0.07] px-3 py-2 text-center text-[21px] leading-[2.1] text-[rgb(var(--isl-head))]" dir="rtl" lang="ar">{v.ar}</p>}
                  {text && <p className="mt-3 text-[15px] leading-relaxed text-muted">{text}</p>}
                  {v.tr && locale !== "ar" && trName && <p className="mt-auto pt-3 text-[11px] font-semibold text-[rgb(var(--isl-gold))]/80">{trName}</p>}
                </li>
              );
            })}
          </ul>
          <p className="mt-8 text-[16px] leading-relaxed">{c.wealthNote}</p>
          <figure className="isl-card relative mt-10 overflow-hidden px-6 py-10 text-center sm:px-12">
            <IslamCorners />
            <blockquote className="isl-serif relative text-[21px] leading-relaxed text-[rgb(var(--isl-head))] sm:text-[24px]">{saw(wealthSaid ?? c.wealthHadith.text)}</blockquote>
            <figcaption className="relative mt-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--isl-gold))] rtl:tracking-normal">{wealthSaid ? `${c.wealthHadith.src} · ${HADITH_API_NAME}` : c.wealthHadith.src}</figcaption>
          </figure>
        </section>
      </div>

      <section id="places" className="stage girih relative scroll-mt-20 overflow-hidden text-[#eef0f3]">
        <IslamRain fall={600} className="opacity-60" />
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <h2 className={H2}>{c.placesTitle}</h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/70">{c.placesLead}</p>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {c.places.map((pl, i) => {
              const extra = pl.href ? [] : missingRefs(pl.src, en.places[i]?.src ?? "");
              const inner = (
                <>
                  <span aria-hidden className="niche" />
                  <span aria-hidden className="font-callig pointer-events-none absolute inset-x-0 top-10 text-center text-[2.6rem] leading-none text-[rgb(233_207_153)]/[0.22] transition duration-700 group-hover:text-[rgb(233_207_153)]/40" dir="rtl">{pl.ar}</span>
                  <span className="font-display relative text-[19px] leading-tight">{pl.title}</span>
                  <span className="relative mt-2 text-[13.5px] leading-relaxed text-white/70">{pl.href ? saw(pl.body) : <Linked text={pl.body} k={`p${i}-`} />}</span>
                  {(pl.src || extra.length > 0) && (
                    <span className="relative mt-3 text-[11px] font-semibold text-[rgb(var(--gold))]">
                      {pl.href ? pl.src : <Linked text={pl.src} k={`ps${i}-`} />}
                      {extra.map((r) => <Link key={r} href={refPath(r)} className="isl-ref"><IslamStarMark />{r}</Link>)}
                    </span>
                  )}
                </>
              );
              const cls = "arch relative flex h-full min-h-[17rem] flex-col justify-end overflow-hidden border border-[rgb(233_207_153)]/20 bg-white/[0.04] p-5 pt-24";
              return <li key={pl.title} className="min-w-0">{pl.href ? <Link href={pl.href} className={`group ${cls} hover:border-[rgb(233_207_153)]/50`}>{inner}</Link> : <div className={`group ${cls}`}>{inner}</div>}</li>;
            })}
          </ul>
        </div>
      </section>

      <section id="next" className="isl-marble scroll-mt-20">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
          <div className="text-center">
            <h2 className={H2}>{c.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-[16px] text-ink/75">{c.ctaBody}</p>
            <Link href="/surah/1?shams=1" className="btn-gold mt-6 inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{c.cta}</Link>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {([["shams", "/shams", "شمس"], ["reader", "/quran", "القرآن"]] as const).map(([k, href, ar]) => (
              <li key={k}>
                <Link href={href} className="isl-card isl-card-hover group relative flex h-full flex-col overflow-hidden p-6 sm:p-7">
                  <IslamCorners />
                  <span aria-hidden className="font-callig pointer-events-none absolute -end-2 -top-2 whitespace-nowrap text-[4.2rem] leading-none text-[rgb(var(--isl-gold))] opacity-[0.13]" dir="rtl">{ar}</span>
                  <h3 className="font-display relative text-[24px] leading-tight">{c.next[k].title}</h3>
                  <p className="relative mt-2 text-[15px] leading-relaxed text-muted">{c.next[k].body}</p>
                  <span className="relative mt-auto inline-flex items-center gap-2 pt-5 text-[14px] font-bold text-accent">
                    {c.next[k].cta}<span aria-hidden className="transition group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <IslamBreak />
          <p className="mx-auto max-w-3xl text-center text-[13px] leading-relaxed text-muted">{c.note}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-12"><DonateCTA variant="slim" /></div>
      <MoreTiles keys={["shams", "islam", "arabic", "radio"]} className="pt-12" />
    </div>
  );
}
