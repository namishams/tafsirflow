"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { readJSON, writeJSON } from "@/lib/storage";
import { fmtHijri, hijriMonthName, toHijri } from "@/lib/hijri";
import {
  AR_ALPHABET, COUNTS, NAMES, NAME_BY_KEY, ORIGIN_FILTERS, ORIGIN_LABEL, THEMES, THEME_LABEL,
  findName, hasArabic, langOf, latinOf, lengthOf, letterOf, matchesOrigin, meaningOf, namesText, normArabic, normLatin,
  type BabyName, type Gender, type Lang, type OriginFilter, type Theme,
} from "@/lib/names";
import { MONTH_LINKS, bestPool, pickRandom, rankNames, verseFor, type LetterPref, type OriginPick, type Scored } from "@/lib/names/rules";
import { Rosette } from "./Ornaments";

const FAV_KEY = "tf:nameFav";
type Verse = { key: string; ar: string; tr: string };
type Tx = ReturnType<typeof namesText>;

const chip = (on: boolean) => `min-h-10 rounded-full border px-4 py-1.5 text-[14px] font-semibold transition ${on ? "border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15 text-ink shadow-[0_0_0_3px_rgb(201_166_94/0.12)]" : "border-line bg-surface text-muted hover:border-ink/30 hover:text-ink"}`;
const field = "w-full rounded-xl border border-line bg-bg px-4 py-3 text-[16px] focus:border-[rgb(201_166_94)] focus:outline-none";
const label = "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted";

function Heart({ on, className = "" }: { on: boolean; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`h-5 w-5 ${className}`}>
      <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7.1 4.5c2 0 3.4 1.1 4.9 2.9 1.5-1.8 2.9-2.9 4.9-2.9 3.5 0 5.7 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function useFavs() {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => { setList(readJSON<string[]>(FAV_KEY, []).filter((k) => NAME_BY_KEY.has(k))); }, []);
  const toggle = (key: string) => {
    const has = list.includes(key);
    const next = has ? list.filter((k) => k !== key) : [...list, key];
    setList(next);
    writeJSON(FAV_KEY, next, true);
    if (!has) fetch("/api/names", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: key }) }).catch(() => {});
  };
  return { list, has: (k: string) => list.includes(k), toggle };
}
type Favs = ReturnType<typeof useFavs>;

async function shareText(title: string, text: string, onCopied: () => void) {
  try {
    if (navigator.share) { await navigator.share({ title, text }); return; }
  } catch { return; /* cancelled */ }
  try { await navigator.clipboard.writeText(text); onCopied(); } catch { /* not allowed */ }
}

function OriginBadges({ n, l, dark = false }: { n: BabyName; l: Lang; dark?: boolean }) {
  return (
    <span className="inline-flex flex-wrap justify-center gap-1.5">
      {n.o.slice(0, 2).map((o) => (
        <span key={o} className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${dark ? "border-[rgb(var(--gold))]/40 text-[rgb(var(--gold))]" : "border-[rgb(201_166_94)]/45 text-gold"}`}>{ORIGIN_LABEL[l][o]}</span>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------- the page body
export default function NameGenerator() {
  const locale = useLocale();
  const l = langOf(locale);
  const t = namesText(locale);
  const favs = useFavs();
  const [tab, setTab] = useState<"finder" | "all">("finder");
  const [loved, setLoved] = useState<{ id: string; n: number }[] | null>(null);
  useEffect(() => { fetch("/api/names").then((r) => r.json()).then((d) => setLoved(Array.isArray(d.top) ? d.top : [])).catch(() => setLoved([])); }, []);

  return (
    <div>
      <div role="tablist" aria-label={t("title")} className="grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1">
        {(["finder", "all"] as const).map((k) => (
          <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)} className={`h-11 rounded-full text-[14px] font-bold transition ${tab === k ? "btn-gold" : "text-muted hover:text-ink"}`}>
            {t(k === "finder" ? "tabFinder" : "tabAll")}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-muted">{t("boysN", { n: COUNTS.b })} · {t("girlsN", { n: COUNTS.g })}</p>

      <div className="mt-6">
        {tab === "finder" ? <Finder t={t} l={l} locale={locale} favs={favs} /> : <Browse t={t} l={l} favs={favs} />}
      </div>

      <FavList t={t} l={l} locale={locale} favs={favs} />
      <Loved t={t} l={l} loved={loved} />
      <Notes t={t} l={l} />
    </div>
  );
}

// ---------------------------------------------------------------- guided finder
type Form = { father: string; mother: string; family: string; gender: Gender | "both"; date: string; siblings: string; letter: LetterPref; themes: Theme[]; origins: OriginPick[]; maxLen: number; easy: boolean };
const EMPTY: Form = { father: "", mother: "", family: "", gender: "both", date: "", siblings: "", letter: "any", themes: [], origins: [], maxLen: 0, easy: false };
type Result = { pools: Partial<Record<Gender, Scored[]>>; shown: Partial<Record<Gender, Scored[]>>; month: number | null; n: number };

function hijriOfInput(date: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  return toHijri(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

function Finder({ t, l, locale, favs }: { t: Tx; l: Lang; locale: string; favs: Favs }) {
  const [f, setF] = useState<Form>(EMPTY);
  const [step, setStep] = useState(1);
  const [res, setRes] = useState<Result | null>(null);
  const [verses, setVerses] = useState<Record<string, Verse | null>>({});
  const top = useRef<HTMLDivElement>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const h = useMemo(() => hijriOfInput(f.date), [f.date]);
  const steps = [t("s1"), t("s2"), t("s3"), t("s4")];

  const go = (s: number) => { setStep(s); requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" })); };

  const run = (prev?: Result) => {
    const genders: Gender[] = f.gender === "both" ? ["b", "g"] : [f.gender];
    const month = h ? h.m : null;
    const pools: Result["pools"] = {};
    const shown: Result["shown"] = {};
    for (const g of genders) {
      const pool = prev?.pools[g] ?? bestPool(rankNames(g, { ...f, hijriMonth: month }, l));
      pools[g] = pool;
      shown[g] = pickRandom(pool, 3, new Set((prev?.shown[g] ?? []).map((s) => s.n.key)));
    }
    setRes({ pools, shown, month, n: (prev?.n ?? 0) + 1 });
    go(4);
  };

  // verses of the shown names (exact Arabic + translation)
  useEffect(() => {
    if (!res) return;
    const keys = [...new Set(Object.values(res.shown).flat().map((s) => verseFor(s.n).key))].filter((k) => !(k in verses));
    if (!keys.length) return;
    fetch(`/api/names?verses=${keys.join(",")}&locale=${locale}`).then((r) => r.json()).then((d: { verses?: Verse[] }) => {
      const got: Record<string, Verse | null> = Object.fromEntries(keys.map((k) => [k, null]));
      for (const v of d.verses ?? []) got[v.key] = v;
      setVerses((x) => ({ ...x, ...got }));
    }).catch(() => setVerses((x) => ({ ...x, ...Object.fromEntries(keys.map((k) => [k, null])) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res, locale]);

  const monthLink = res?.month ? MONTH_LINKS[res.month] : undefined;
  const pct = Math.round((Math.min(step, 4) / 4) * 100);

  return (
    <div ref={top} className="scroll-mt-24">
      {/* progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3 text-[12px] font-semibold text-muted">
          <span>{t("step", { n: Math.min(step, 4), total: 4 })}</span>
          <span className="truncate text-ink">{steps[Math.min(step, 4) - 1]}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t("step", { n: Math.min(step, 4), total: 4 })}>
          <div className="h-full rounded-full bg-gradient-to-r from-[#c6a65e] to-[#e9cf99] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <ol className="mt-2 hidden grid-cols-4 gap-2 text-[11px] text-muted sm:grid">
          {steps.map((s, i) => <li key={s} className={i + 1 <= step ? "font-semibold text-ink" : ""}>{s}</li>)}
        </ol>
      </div>

      {step < 4 && (
        <section key={step} className="callout step-in relative overflow-hidden rounded-2xl p-5 shadow-[0_10px_30px_rgba(3,25,18,0.06)] sm:p-7">
          <Rosette size={22} className="absolute end-3 top-3 opacity-70" />
          <h2 className="font-display pe-8 text-2xl sm:text-3xl">{steps[step - 1]}</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-muted">{t(`s${step}d`)}</p>

          {step === 1 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2"><span className={label}>{t("father")}</span><input value={f.father} onChange={(e) => set("father", e.target.value.slice(0, 40))} placeholder={t("fatherPh")} className={field} autoComplete="off" /></label>
              <label className="grid gap-2"><span className={label}>{t("mother")}</span><input value={f.mother} onChange={(e) => set("mother", e.target.value.slice(0, 40))} placeholder={t("motherPh")} className={field} autoComplete="off" /></label>
              <label className="grid gap-2 sm:col-span-2"><span className={label}>{t("family")}</span><input value={f.family} onChange={(e) => set("family", e.target.value.slice(0, 40))} placeholder={t("familyPh")} className={field} autoComplete="off" /></label>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 grid gap-6">
              <div>
                <p className={label}>{t("gender")}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {(["b", "g", "both"] as const).map((g) => (
                    <button key={g} type="button" aria-pressed={f.gender === g} onClick={() => set("gender", g)} className={`${chip(f.gender === g)} h-12 rounded-xl`}>{t(g === "b" ? "boy" : g === "g" ? "girl" : "both")}</button>
                  ))}
                </div>
              </div>
              <label className="grid gap-2">
                <span className={label}>{t("date")}</span>
                <input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className={`${field} max-w-xs`} />
                {h && <span className="text-[14px] text-gold">{t("hijriIs", { date: fmtHijri(h, locale) })}</span>}
              </label>
              <label className="grid gap-2">
                <span className={label}>{t("siblings")}</span>
                <input value={f.siblings} onChange={(e) => set("siblings", e.target.value.slice(0, 160))} placeholder={t("siblingsPh")} className={field} autoComplete="off" />
              </label>
              {f.siblings.trim() && (
                <div>
                  <p className={label}>{t("letter")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["any", "same", "diff"] as const).map((k) => <button key={k} type="button" aria-pressed={f.letter === k} onClick={() => set("letter", k)} className={chip(f.letter === k)}>{t(k === "any" ? "letterAny" : k === "same" ? "letterSame" : "letterDiff")}</button>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="mt-6 grid gap-6">
              <div>
                <p className={label}>{t("themesQ")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {THEMES.map((th) => <button key={th} type="button" aria-pressed={f.themes.includes(th)} onClick={() => set("themes", toggle(f.themes, th))} className={chip(f.themes.includes(th))}>{THEME_LABEL[l][th]}</button>)}
                </div>
              </div>
              <div>
                <p className={label}>{t("originsQ")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["quran", "prophet", "companion", "arabic"] as const).map((o) => <button key={o} type="button" aria-pressed={f.origins.includes(o)} onClick={() => set("origins", toggle(f.origins, o))} className={chip(f.origins.includes(o))}>{t(`o_${o}`)}</button>)}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
                <label className="grid gap-2">
                  <span className={label}>{t("maxLen")}</span>
                  <select value={f.maxLen} onChange={(e) => set("maxLen", Number(e.target.value))} className={field}>
                    <option value={0}>{t("any")}</option>
                    {[4, 5, 6, 7, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line bg-bg px-4 py-3">
                  <input type="checkbox" checked={f.easy} onChange={(e) => set("easy", e.target.checked)} className="h-5 w-5 shrink-0 accent-[#c6a65e]" />
                  <span className="text-[15px]">{t("easy")}</span>
                </label>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {step > 1 && <button type="button" onClick={() => go(step - 1)} className="h-12 rounded-xl border border-line px-5 text-[15px] font-semibold hover:border-ink/30">{t("back")}</button>}
            {step < 3 && <button type="button" onClick={() => go(step + 1)} className="btn-gold h-12 flex-1 rounded-xl px-8 text-[15px] font-bold sm:flex-none">{t("next")}</button>}
            {step === 3 && (
              <button type="button" onClick={() => run()} className="btn-gold inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-8 text-[15px] font-bold sm:flex-none">
                <Rosette size={20} className="!text-[rgb(8_38_29)]" />{t("find")}
              </button>
            )}
          </div>
        </section>
      )}

      {step === 4 && res && (
        <div className="step-in">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-3xl">{t("s4")}</h2>
              <p className="mt-1 text-[14px] text-muted">{t("resultLead")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => run(res)} className="btn-gold h-11 rounded-full px-5 text-sm font-bold">{t("shuffle")}</button>
              <button type="button" onClick={() => { go(1); }} className="h-11 rounded-full border border-line px-5 text-sm font-semibold hover:border-ink/30">{t("edit")}</button>
            </div>
          </div>
          {monthLink && res.month && (
            <p className="callout mt-5 rounded-lg p-4 text-[15px] leading-relaxed">
              <b>{t("monthNote", { month: hijriMonthName(res.month, locale) })}</b> {monthLink.note[l]}
            </p>
          )}
          {(["b", "g"] as const).filter((g) => res.shown[g]).map((g) => (
            <section key={`${g}-${res.n}`} className="mt-7">
              {f.gender === "both" && <h3 className="font-display mb-3 text-xl">{t(g === "b" ? "forBoy" : "forGirl")}</h3>}
              {res.shown[g]!.length ? (
                <ul className="grid gap-4 lg:grid-cols-3">
                  {res.shown[g]!.map((s) => <li key={s.n.key} className="min-w-0"><ResultCard n={s.n} f={f} t={t} l={l} locale={locale} favs={favs} verse={verses[verseFor(s.n).key]} /></li>)}
                </ul>
              ) : <p className="callout rounded-lg p-4 text-[15px]">{t("noPool")}</p>}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function classicalName(n: BabyName, father: string) {
  const fa = father.trim();
  if (!fa) return null;
  const known = findName(fa, "b");
  const typedAr = hasArabic(fa);
  const latinF = typedAr ? (known ? latinOf(known) : null) : fa.charAt(0).toUpperCase() + fa.slice(1);
  const arF = known ? known.ar : typedAr ? fa : null;
  return {
    latin: latinF ? `${latinOf(n)} ${n.g === "b" ? "ibn" : "bint"} ${latinF}` : null,
    arabic: arF ? `${n.ar} ${n.g === "b" ? "بن" : "بنت"} ${arF}` : null,
  };
}

function ResultCard({ n, f, t, l, locale, favs, verse }: { n: BabyName; f: Form; t: Tx; l: Lang; locale: string; favs: Favs; verse: Verse | null | undefined }) {
  const ar = l === "ar";
  const [copied, setCopied] = useState(false);
  const v = verseFor(n);
  const [s, a] = v.key.split(":");
  const cl = classicalName(n, f.father);
  const fam = f.family.trim();
  const famLine = fam ? (ar ? (hasArabic(fam) ? `${n.ar} ${fam}` : null) : `${latinOf(n)} ${fam}`) : null;
  const kind = v.kind === "theme" ? t("v_theme", { theme: THEME_LABEL[l][v.theme!] }) : t(`v_${v.kind}`);
  const on = favs.has(n.key);
  const share = () => {
    const lines = [ar ? n.ar : `${n.ar} – ${latinOf(n)}`, meaningOf(n, l), ar ? cl?.arabic : cl?.latin, `${kind}: ${t("verseRef", { ref: v.key })}`, `${location.origin}/${locale}/names`].filter(Boolean);
    shareText(t("title"), lines.join("\n"), () => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <article className="stage relative h-full overflow-hidden rounded-2xl px-5 pb-6 pt-9 text-center text-[#eef0f3] sm:px-6">
      <span aria-hidden className="illum-frame" />
      {["start-1.5 top-1.5", "end-1.5 top-1.5", "bottom-1.5 start-1.5", "bottom-1.5 end-1.5"].map((c) => <Rosette key={c} size={22} className={`absolute ${c}`} />)}
      <div className="relative">
        <OriginBadges n={n} l={l} dark />
        <p className="font-callig mt-3 text-[46px] leading-[1.35] text-[rgb(var(--gold))] sm:text-[54px]" dir="rtl" lang="ar">{n.ar}</p>
        {!ar && <p className="font-display text-[26px] leading-tight">{latinOf(n)}</p>}
        {!ar && n.tr.length > 1 && <p className="mt-0.5 text-[12px] text-white/50">{n.tr.slice(1).join(" · ")}</p>}
        <p className={`mt-3 text-[15px] leading-relaxed text-white/80 ${ar ? "font-arabic text-[19px]" : ""}`}>{meaningOf(n, l)}</p>

        {(cl?.latin || cl?.arabic || famLine) && (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/45">{t("classical")}</p>
            {!ar && cl?.latin && <p className="mt-1 text-[16px] font-semibold">{cl.latin}</p>}
            {cl?.arabic && <p className="font-arabic mt-1 text-[22px] text-[rgb(var(--gold))]" dir="rtl" lang="ar">{cl.arabic}</p>}
            {famLine && <p className="mt-1 text-[14px] text-white/70" dir="auto">{famLine}</p>}
          </div>
        )}

        <div className="mt-5 border-t border-white/10 pt-4 text-start">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))]">{kind}</p>
          {verse === undefined ? (
            <div className="mt-3 h-16 animate-pulse rounded-lg bg-white/10" />
          ) : verse ? (
            <>
              <p className="font-arabic mt-2 text-[20px] leading-[2.05] text-white" dir="rtl" lang="ar">{verse.ar}</p>
              {!ar && verse.tr && <p className="mt-2 text-[13.5px] leading-relaxed text-white/65">{verse.tr}</p>}
            </>
          ) : null}
          <Link href={`/surah/${s}?v=${a}`} className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-[rgb(var(--gold))] hover:underline">
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 rtl:-scale-x-100"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
            {t("listen")} · {t("verseRef", { ref: v.key })}
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => favs.toggle(n.key)} aria-pressed={on} className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold ${on ? "btn-gold" : "border border-white/25 hover:border-white"}`}>
            <Heart on={on} />{on ? t("saved") : t("save")}
          </button>
          <button type="button" onClick={share} className="h-11 rounded-full border border-white/25 px-5 text-sm font-bold hover:border-white">{copied ? t("copied") : t("share")}</button>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------- browse all names
function Browse({ t, l, favs }: { t: Tx; l: Lang; favs: Favs }) {
  const ar = l === "ar";
  const [g, setG] = useState<Gender | "all">("all");
  const [theme, setTheme] = useState<Theme | "">("");
  const [origin, setOrigin] = useState<OriginFilter | "">("");
  const [letter, setLetter] = useState("");
  const [maxLen, setMaxLen] = useState(0);
  const [q, setQ] = useState("");
  const [surprise, setSurprise] = useState<BabyName | null>(null);

  const byGender = useMemo(() => NAMES.filter((n) => g === "all" || n.g === g), [g]);
  const letters = useMemo(() => {
    const set = new Set(byGender.map((n) => letterOf(n, l)));
    return ar ? AR_ALPHABET.filter((c) => set.has(c)) : [...set].sort();
  }, [byGender, l, ar]);
  const list = useMemo(() => {
    const qq = q.trim();
    const qa = hasArabic(qq) ? normArabic(qq) : "";
    const ql = qa ? "" : qq.toLowerCase();
    const qn = normLatin(ql);
    return byGender.filter((n) => {
      if (theme && !n.t.includes(theme)) return false;
      if (origin && !matchesOrigin(n, origin)) return false;
      if (letter && letterOf(n, l) !== letter) return false;
      if (maxLen && lengthOf(n, l) > maxLen) return false;
      if (qa) return normArabic(n.ar).includes(qa) || normArabic(n.arM).includes(qa);
      if (ql) return (qn && n.tr.some((x) => normLatin(x).includes(qn))) || meaningOf(n, l).toLowerCase().includes(ql);
      return true;
    }).sort((a, b) => (ar ? normArabic(a.ar).localeCompare(normArabic(b.ar), "ar") : normLatin(latinOf(a)).localeCompare(normLatin(latinOf(b)))));
  }, [byGender, theme, origin, letter, maxLen, q, l, ar]);
  const groups = useMemo(() => {
    const m = new Map<string, BabyName[]>();
    for (const n of list) { const k = letterOf(n, l); m.set(k, [...(m.get(k) ?? []), n]); }
    return ar ? AR_ALPHABET.filter((c) => m.has(c)).map((c) => [c, m.get(c)!] as const) : [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [list, l, ar]);

  return (
    <div>
      <section className="rounded-2xl border border-[rgb(201_166_94)]/30 bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {(["all", "b", "g"] as const).map((k) => <button key={k} type="button" aria-pressed={g === k} onClick={() => { setG(k); setLetter(""); }} className={chip(g === k)}>{k === "all" ? t("all") : t(k === "b" ? "boy" : "girl")}</button>)}
        </div>
        <p className={`${label} mt-5`}>{t("theme")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" aria-pressed={!theme} onClick={() => setTheme("")} className={chip(!theme)}>{t("all")}</button>
          {THEMES.map((th) => <button key={th} type="button" aria-pressed={theme === th} onClick={() => setTheme(theme === th ? "" : th)} className={chip(theme === th)}>{THEME_LABEL[l][th]}</button>)}
        </div>
        <p className={`${label} mt-5`}>{t("origin")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" aria-pressed={!origin} onClick={() => setOrigin("")} className={chip(!origin)}>{t("all")}</button>
          {ORIGIN_FILTERS.map((o) => <button key={o} type="button" aria-pressed={origin === o} onClick={() => setOrigin(origin === o ? "" : o)} className={chip(origin === o)}>{ORIGIN_LABEL[l][o]}</button>)}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_2fr]">
          <label className="grid gap-1.5"><span className={label}>{t("letterF")}</span>
            <select value={letter} onChange={(e) => setLetter(e.target.value)} className={field}><option value="">{t("all")}</option>{letters.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </label>
          <label className="grid gap-1.5"><span className={label}>{t("lenF")}</span>
            <select value={maxLen} onChange={(e) => setMaxLen(Number(e.target.value))} className={field}><option value={0}>{t("any")}</option>{[4, 5, 6, 7, 8, 10].map((n) => <option key={n} value={n}>≤ {n}</option>)}</select>
          </label>
          <label className="grid gap-1.5"><span className={label}>{t("search").replace(" …", "")}</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value.slice(0, 40))} placeholder={t("search")} className={field} dir="auto" />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-muted" aria-live="polite">{t("count", { n: list.length })}</span>
          <button type="button" disabled={!list.length} onClick={() => setSurprise(list[Math.floor(Math.random() * list.length)] ?? null)} className="btn-gold inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold disabled:opacity-50">
            <Rosette size={18} className="!text-[rgb(8_38_29)]" />{t("surprise")}
          </button>
        </div>
      </section>

      {surprise && (
        <section key={surprise.key} className="stage step-in relative mt-6 overflow-hidden rounded-2xl px-5 py-9 text-center text-[#eef0f3]">
          <span aria-hidden className="illum-frame" />
          <div className="relative">
            <OriginBadges n={surprise} l={l} dark />
            <p className="font-callig mt-3 text-[56px] leading-[1.35] text-[rgb(var(--gold))] sm:text-[72px]" dir="rtl" lang="ar">{surprise.ar}</p>
            {!ar && <p className="font-display text-3xl">{latinOf(surprise)}</p>}
            <p className={`mx-auto mt-3 max-w-md text-[16px] leading-relaxed text-white/80 ${ar ? "font-arabic text-[20px]" : ""}`}>{meaningOf(surprise, l)}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => favs.toggle(surprise.key)} aria-pressed={favs.has(surprise.key)} className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold ${favs.has(surprise.key) ? "btn-gold" : "border border-white/25 hover:border-white"}`}><Heart on={favs.has(surprise.key)} />{favs.has(surprise.key) ? t("saved") : t("save")}</button>
              <QuranLink n={surprise} t={t} dark />
            </div>
          </div>
        </section>
      )}

      {list.length === 0 ? <p className="callout mt-6 rounded-lg p-4 text-[15px]">{t("noMatch")}</p> : (
        <div className="mt-6">
          <nav aria-label={t("letterF")} className="flex flex-wrap gap-1">
            {groups.map(([c]) => <a key={c} href={`#nl-${c}`} className="grid h-8 min-w-8 place-items-center rounded-md border border-line bg-surface px-1.5 text-[13px] font-semibold text-muted hover:border-[rgb(201_166_94)] hover:text-ink">{c}</a>)}
          </nav>
          {groups.map(([c, ns]) => (
            <section key={c} id={`nl-${c}`} className="mt-6 scroll-mt-24">
              <h3 className="font-display border-b border-[rgb(201_166_94)]/40 pb-1 text-2xl text-gold">{c}</h3>
              <ul>
                {ns.map((n) => <Row key={n.key} n={n} t={t} l={l} favs={favs} />)}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function QuranLink({ n, t, dark = false }: { n: BabyName; t: Tx; dark?: boolean }) {
  if (!n.q) return null;
  const [s, v] = n.q.split(":");
  return <Link href={`/surah/${s}?v=${v}`} className={`inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold hover:underline ${dark ? "border border-white/25 text-[rgb(var(--gold))]" : "text-accent"}`}>{t("verseRef", { ref: n.q })}</Link>;
}

function Row({ n, t, l, favs }: { n: BabyName; t: Tx; l: Lang; favs: Favs }) {
  const ar = l === "ar";
  const on = favs.has(n.key);
  return (
    <li className="flex items-start gap-3 border-b border-line py-3">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {ar ? <span className="font-arabic text-[24px] leading-snug text-gold" lang="ar">{n.ar}</span> : <span className="text-[16px] font-bold">{latinOf(n)}</span>}
          {!ar && n.tr.length > 1 && <span className="text-[12px] text-muted">{n.tr.slice(1).join(" · ")}</span>}
          <span className="rounded-full bg-line/60 px-2 py-0.5 text-[10.5px] font-semibold text-muted">{t(`g_${n.g}`)}</span>
        </p>
        <p className={`mt-0.5 text-[14px] leading-relaxed text-muted ${ar ? "font-arabic text-[17px]" : ""}`}>{meaningOf(n, l)}</p>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-[12px]">
          <span className="text-gold">{n.o.slice(0, 2).map((o) => ORIGIN_LABEL[l][o]).join(" · ")}</span>
          {n.q && <Link href={`/surah/${n.q.split(":")[0]}?v=${n.q.split(":")[1]}`} className="font-semibold text-accent hover:underline">{t("verseRef", { ref: n.q })}</Link>}
        </p>
      </div>
      {!ar && <span className="font-arabic shrink-0 pt-0.5 text-[24px] leading-snug text-gold" dir="rtl" lang="ar">{n.ar}</span>}
      <button type="button" onClick={() => favs.toggle(n.key)} aria-pressed={on} aria-label={`${on ? t("favRemove") : t("favAdd")}: ${ar ? n.ar : latinOf(n)}`} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${on ? "border-[rgb(201_166_94)] text-gold" : "border-line text-muted hover:text-ink"}`}>
        <Heart on={on} />
      </button>
    </li>
  );
}

// ---------------------------------------------------------------- favourites, most loved, notes
function FavList({ t, l, locale, favs }: { t: Tx; l: Lang; locale: string; favs: Favs }) {
  const ar = l === "ar";
  const [copied, setCopied] = useState(false);
  const names = favs.list.map((k) => NAME_BY_KEY.get(k)).filter(Boolean) as BabyName[];
  const text = () => [...names.map((n) => (ar ? `${n.ar} – ${n.arM}` : `${latinOf(n)} (${n.ar}) – ${meaningOf(n, l)}`)), "", `${location.origin}/${locale}/names`].join("\n");
  return (
    <section className="mt-12">
      <h2 className="font-display text-3xl">{t("favTitle")}</h2>
      {names.length === 0 ? <p className="mt-3 text-[15px] text-muted">{t("favEmpty")}</p> : (
        <>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {names.map((n) => (
              <li key={n.key} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
                <span className="font-arabic shrink-0 text-[24px] leading-snug text-gold" dir="rtl" lang="ar">{n.ar}</span>
                <span className="min-w-0 flex-1">
                  {!ar && <b className="block text-[15px]">{latinOf(n)}</b>}
                  <span className={`block truncate text-[13px] text-muted ${ar ? "font-arabic text-[16px]" : ""}`}>{meaningOf(n, l)}</span>
                </span>
                <button type="button" onClick={() => favs.toggle(n.key)} aria-label={`${t("favRemove")}: ${ar ? n.ar : latinOf(n)}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-gold hover:bg-line/50"><Heart on /></button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(text()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* not allowed */ } }} className="h-11 rounded-full border border-line px-5 text-sm font-semibold hover:border-ink/30">{copied ? t("copied") : t("copyList")}</button>
            <button type="button" onClick={() => shareText(t("favTitle"), text(), () => { setCopied(true); setTimeout(() => setCopied(false), 2000); })} className="h-11 rounded-full border border-line px-5 text-sm font-semibold hover:border-ink/30">{t("shareList")}</button>
          </div>
        </>
      )}
    </section>
  );
}

function Loved({ t, l, loved }: { t: Tx; l: Lang; loved: { id: string; n: number }[] | null }) {
  const ar = l === "ar";
  const items = (loved ?? []).map((x) => ({ n: NAME_BY_KEY.get(x.id), c: x.n })).filter((x): x is { n: BabyName; c: number } => !!x.n);
  return (
    <section className="mt-12">
      <h2 className="font-display text-3xl">{t("loved")}</h2>
      <p className="mt-1 text-[14px] text-muted">{t("lovedD")}</p>
      {loved === null ? <div className="mt-4 h-24 animate-pulse rounded-xl bg-line/40" /> : items.length === 0 ? <p className="callout mt-4 rounded-lg p-4 text-[15px]">{t("lovedEmpty")}</p> : (
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ n, c }, i) => (
            <li key={n.key} className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-line bg-surface px-4 py-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/50 font-display text-[12px] text-gold">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="font-arabic block text-[22px] leading-snug text-gold" dir="rtl" lang="ar">{n.ar}</span>
                {!ar && <span className="block truncate text-[13px] font-semibold">{latinOf(n)} <span className="font-normal text-muted">· {t(`g_${n.g}`)}</span></span>}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-muted"><Heart on className="!h-3.5 !w-3.5 text-gold" />{c}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Notes({ t, l }: { t: Tx; l: Lang }) {
  const ar = l === "ar";
  return (
    <section className="mt-12 grid gap-4 md:grid-cols-2">
      <div className="callout rounded-lg p-5">
        <h2 className="font-display text-xl">{t("abdTitle")}</h2>
        <p className="mt-2 text-[15px] leading-relaxed">{t("abdText")}</p>
        {!ar && <p className="font-arabic mt-3 text-[22px] leading-[1.9] text-gold" dir="rtl" lang="ar">إِنَّ أَحَبَّ أَسْمَائِكُمْ إِلَى اللَّهِ عَبْدُ اللَّهِ وَعَبْدُ الرَّحْمَنِ</p>}
        <p className={`mt-2 text-[15px] leading-relaxed ${ar ? "font-arabic text-[22px] text-gold" : "italic"}`}>{t("abdHadith")}</p>
        <p className="mt-1 text-xs font-semibold text-muted">{t("abdSrc")}</p>
      </div>
      <div className="callout rounded-lg p-5">
        <h2 className="font-display text-xl">{t("changeTitle")}</h2>
        <p className="mt-2 text-[15px] leading-relaxed">{t("changeText")}</p>
        <p className="mt-2 text-xs font-semibold text-muted">{t("changeSrc")}</p>
      </div>
      <div className="rounded-lg border border-line bg-surface p-5">
        <h2 className="font-display text-xl">{t("rulesTitle")}</h2>
        <ul className="mt-3 grid gap-2 text-[14.5px] leading-relaxed text-muted">
          {[1, 2, 3, 4].map((i) => <li key={i} className="flex gap-2"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[rgb(201_166_94)]" />{t(`rule${i}`)}</li>)}
        </ul>
      </div>
      <div className="rounded-lg border border-line bg-surface p-5">
        <h2 className="font-display text-xl">{t("rightTitle")}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{t("rightText")}</p>
        <p className="mt-3 text-xs text-muted">{t("meaningNote")}</p>
      </div>
    </section>
  );
}
