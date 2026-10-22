"use client";
// mirrors mobile/src/features/shams2/adab/Adab.tsx: the pillar "Adab des Qurʾān-Trägers" of the Shams Method (its newest
// form, Shams 3.0) – the page /shams/adab, the pillar card for the method hub and the handbook, "Adab des Tages" for the
// hub and today's wird, and the link from the classic method. Verses, hadith and duʿāʾs are only rendered from their
// data sources (Quran API, hadith-api, Thaqalayn, sunnahDuas) – nothing is typed here. The daily tick is stored in this
// browser only (never synced, no score).
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useStored, writeJSON } from "@/lib/learn/store";
import { getVerseByKey } from "@/lib/learn/quran";
import { readTradition, showsShia } from "@/lib/learn/tradition";
import { SUNNAH_DUAS, type SunnahDua } from "@/lib/sunnahDuas";
import { SUNNAH_DUAS_2 } from "@/lib/sunnahDuas2";
import { useShams2 } from "@/lib/learn/shams2/model";
import { ADAB_DONE_KEY, ADAB_ITEMS, ADAB_REVIEW, ADAB_ROUTES, ADAB_SOURCES, ADAB_TOPICS, adabOfDay, toggleAdabDone, type AdabItem, type AdabRef, type AdabStatus } from "@/lib/learn/shams2/adab/data";
import { loadShia, loadSunni, type LoadedText } from "@/lib/learn/shams2/adab/load";
import { useAdabText } from "@/lib/learn/shams2/adab/text";
import { Card, LearnHero, LearnMain } from "@/components/learn/ui";
import { Fold, Live, S2Kicker, useBack } from "./ui";

const DUAS: SunnahDua[] = [...SUNNAH_DUAS, ...SUNNAH_DUAS_2];
const linkCls = "text-[13px] font-semibold text-[rgb(var(--hm-gold-d))] underline-offset-2 hover:underline";

function StatusPills({ status }: { status: AdabStatus[] }) {
  const { a } = useAdabText();
  const strong = (s: AdabStatus) => s === "fard" || s === "wajib" || s === "haram";
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={a("status")}>
      {status.map((s) => (
        <li key={s} className={`rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${strong(s) ? "border-accent bg-accent-soft text-accent" : "border-[rgb(var(--hm-gold))]/60 text-[rgb(var(--hm-gold-d))]"}`}>{a(`st_${s}`)}</li>
      ))}
    </ul>
  );
}

function RefText({ r }: { r: Extract<AdabRef, { k: "verse" | "hadith" | "kafi" }> }) {
  const { a, lang } = useAdabText();
  const [v, setV] = useState<LoadedText | "loading" | "error">("loading");
  useEffect(() => {
    let live = true;
    const done = (x: LoadedText | null) => { if (live) setV(x ?? "error"); };
    const p = r.k === "verse"
      ? getVerseByKey(r.key, lang).then((x) => ({ arabic: x.text_uthmani, text: x.translation, ref: `Qurʾān ${r.key}` }))
      : r.k === "hadith" ? loadSunni(r.c, r.n, lang) : loadShia(r.book, r.n, lang, r.cite);
    p.then(done).catch(() => done(null));
    return () => { live = false; };
  }, [r, lang]);
  if (v === "loading") return <p className="text-[13px] text-muted">{a("loading")}</p>;
  if (v === "error") return <p className="text-[13px] text-muted">{a("offline")}</p>;
  return (
    <div className="grid gap-1.5 pt-1">
      {v.arabic && <p lang="ar" dir="rtl" className="font-arabic text-[20px] leading-[1.9]">{v.arabic}</p>}
      {v.text && <p className="whitespace-pre-line text-[14px] leading-relaxed">{v.text}</p>}
      <p className="text-[12px] font-semibold text-[rgb(var(--hm-gold-d))]">{v.ref}{v.grade ? ` · ${v.grade}` : ""}</p>
    </div>
  );
}

function DuaBlock({ id }: { id: string }) {
  const { cl } = useAdabText();
  const d = DUAS.find((x) => x.id === id);
  if (!d) return null;
  return (
    <div className="grid gap-1.5 rounded-xl border border-line bg-[rgb(var(--bg))] p-3">
      <p lang="ar" dir="rtl" className="font-arabic text-[20px] leading-[1.9]">{d.ar}</p>
      <p className="text-[13px] italic leading-relaxed text-muted">{d.tr}</p>
      <p className="text-[14px] leading-relaxed">{d[cl]}</p>
      <p className="text-[12px] font-semibold text-[rgb(var(--hm-gold-d))]">{d.src}</p>
    </div>
  );
}

function RefRow({ r }: { r: AdabRef }) {
  const { a } = useAdabText();
  const [shown, setShown] = useState(false);
  if (r.k === "dua") return <DuaBlock id={r.id} />;
  if (r.k === "src") {
    const s = ADAB_SOURCES[r.id];
    return (
      <p className="text-[12.5px] leading-snug text-muted">
        {s.label}
        {s.url && <> · <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkCls}>{a("openSource")}</a></>}
      </p>
    );
  }
  const label = r.k === "verse" ? `Qurʾān ${r.key}` : r.cite;
  const url = r.k === "hadith" ? `https://sunnah.com/${r.sunnah}` : r.k === "kafi" ? r.url : null;
  return (
    <div className="grid gap-1 border-t border-line pt-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="min-w-0 flex-1 text-[13.5px] font-semibold">{label}</span>
        <button type="button" onClick={() => setShown(!shown)} aria-expanded={shown} className={linkCls}>{shown ? a("hideText") : a("showText")}</button>
        {r.k === "verse" ? <Link href={ADAB_ROUTES.verse(r.key)} className={linkCls}>{a("openReader")}</Link>
          : url ? <a href={url} target="_blank" rel="noopener noreferrer" className={linkCls}>{a("openSource")}</a> : null}
      </div>
      {shown && <RefText r={r} />}
    </div>
  );
}

function ItemBody({ item }: { item: AdabItem }) {
  const { a, cl } = useAdabText();
  const [shia, setShia] = useState(false);
  useEffect(() => { setShia(showsShia(readTradition())); }, []);
  return (
    <div className="grid gap-3">
      <p className="text-[15.5px] leading-relaxed">{item.practice[cl]}</p>
      <StatusPills status={item.status} />
      {item.note && <p className="text-[14px] leading-relaxed text-muted">{item.note[cl]}</p>}
      <S2Kicker>{a("sources")}</S2Kicker>
      <div className="grid gap-2">{item.refs.map((r, i) => <RefRow key={i} r={r} />)}</div>
      {item.jafari && shia && (
        <div className="grid gap-2 rounded-xl border border-line p-3">
          <p className="text-[12.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{a("jafari")}</p>
          <p className="text-[14px] leading-relaxed">{item.jafari.note[cl]}</p>
          {item.jafari.refs.map((r, i) => <RefRow key={i} r={r} />)}
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {item.sisters && <Link href={ADAB_ROUTES.sisters} className={linkCls}>{a("sisters")}</Link>}
        {item.href && <Link href={item.href} className={linkCls}>{a("related")}</Link>}
      </div>
    </div>
  );
}

function ReviewLine() {
  const { a } = useAdabText();
  if (!ADAB_REVIEW.needs_review) return null;
  return <p className="text-[12.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{a("review")}</p>;
}

function TodayBody({ withLink }: { withLink: boolean }) {
  const { a, cl } = useAdabText();
  const { day } = useShams2();
  const item = adabOfDay(day);
  const done = useStored<Record<string, string>>(ADAB_DONE_KEY, {});
  const on = done[day] === item.id;
  return (
    <Card className="grid gap-3 border-[rgb(var(--hm-gold))]/55">
      <S2Kicker>{a("todayKicker")}</S2Kicker>
      <h2 className="font-display text-[21px] leading-tight">{item.title[cl]}</h2>
      <p className="text-[15px] leading-relaxed">{item.practice[cl]}</p>
      <StatusPills status={item.status} />
      <label className="flex min-h-11 cursor-pointer items-center gap-3">
        <input type="checkbox" checked={on} onChange={() => writeJSON(ADAB_DONE_KEY, toggleAdabDone(done, day, item.id))} className="h-5 w-5 accent-[rgb(var(--hm-gold))]" />
        <span className={`text-[14.5px] font-semibold ${on ? "text-[rgb(var(--hm-gold-d))]" : ""}`}>{on ? a("doneTodayOn") : a("doneToday")}</span>
      </label>
      <p className="text-[12.5px] text-muted">{a("privacy")}</p>
      {withLink && <Link href={`${ADAB_ROUTES.page}#${item.id}`} className={linkCls}>{`${a("name")} – ${a("open")}`}</Link>}
    </Card>
  );
}

/** "Adab des Tages": one item per plan day with the optional local tick (stored progress only after hydration) */
export function AdabTodayCard({ withLink = true }: { withLink?: boolean }) {
  return <Live fallback={null}><TodayBody withLink={withLink} /></Live>;
}

/** the pillar in the method description: a dark stage card, strict and honest */
export function AdabPillarCard() {
  const { a } = useAdabText();
  return (
    <Link href={ADAB_ROUTES.page} className="hm-lift grid gap-2 rounded-2xl border border-[rgb(214_180_108)]/50 bg-[#0b2a20] p-5 text-white sm:p-6">
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[rgb(233_207_153)] rtl:tracking-normal">{a("pillarKicker")}</span>
      <span lang="ar" dir="rtl" className="font-arabic text-start text-[22px] leading-[1.7] text-[rgb(233_207_153)]">آداب حَمَلَة القُرْآن</span>
      <span className="font-display text-[22px] leading-tight">{a("name")}</span>
      <span className="text-[14px] font-semibold text-[rgb(233_207_153)]">{a("pillars")}</span>
      <span className="text-[14.5px] leading-relaxed text-white/80">{a("pillarBody")}</span>
      <span className="text-[13.5px] font-semibold text-[rgb(233_207_153)]">{a("open")} →</span>
    </Link>
  );
}

/** the link from the classic method page: the pillar belongs to every Shams path */
export function AdabClassicLink() {
  const { a } = useAdabText();
  return (
    <Link href={ADAB_ROUTES.page} className="hm-card hm-lift flex items-center gap-4 border-[rgb(var(--hm-gold))]/55 p-4 sm:p-5">
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold">{a("name")}</span>
        <span className="block text-[14px] leading-snug text-muted">{a("classicLink")}</span>
      </span>
      <span aria-hidden className="text-muted">→</span>
    </Link>
  );
}

/** the line of the pillar in "How the method works" */
export function AdabMethodLine() {
  const { a } = useAdabText();
  return <p className="text-[15.5px] font-semibold leading-relaxed">{a("methodLine")}</p>;
}

/** the hub tile's texts */
export function useAdabTile() {
  const { a } = useAdabText();
  return { title: a("name"), lead: a("tileLead"), href: ADAB_ROUTES.page };
}

/** /shams/adab – the pillar page */
export function AdabScreen() {
  const { a, cl, lang } = useAdabText();
  return (
    <>
      <LearnHero back={useBack()} kicker={a("pillarKicker")} title={a("name")} lead={a("pageLead")} word="آداب حملة القرآن" uid="s2a" />
      <LearnMain className="grid gap-6">
        <Card className="grid gap-3">
          <p className="text-[15px] font-semibold text-[rgb(var(--hm-gold-d))]">{a("pillars")}</p>
          <p className="text-[16px] leading-relaxed">{a("pillarBody")}</p>
          <p className="text-[15px] leading-relaxed">{a("pillarClassic")}</p>
          <p className="text-[14.5px] leading-relaxed text-muted">{a("pillarHonest")}</p>
          <ReviewLine />
        </Card>
        <AdabTodayCard withLink={false} />
        {lang !== "de" && lang !== "en" && <p className="text-[13px] text-muted">{a("translationNote")}</p>}
        <nav aria-label={a("topics")} className="flex flex-wrap gap-2 text-[13.5px] font-semibold">
          {ADAB_TOPICS.map((tp) => <a key={tp.id} href={`#t-${tp.id}`} className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-3 hover:border-[rgb(var(--hm-gold))]/70">{tp.title[cl]}</a>)}
        </nav>
        {ADAB_TOPICS.map((tp) => (
          <section key={tp.id} id={`t-${tp.id}`} className="grid scroll-mt-20 gap-2.5">
            <p lang="ar" dir="rtl" className="font-arabic text-start text-[19px] leading-[1.7] text-[rgb(var(--hm-gold-d))]">{tp.ar}</p>
            <h2 className="font-display text-[24px]">{tp.title[cl]}</h2>
            <p className="text-[15px] leading-relaxed text-muted">{tp.lead[cl]}</p>
            {tp.link && <Link href={tp.link.href} className="text-[15px] font-semibold text-accent hover:underline">{tp.link.label[cl]}</Link>}
            {ADAB_ITEMS.filter((i) => i.topic === tp.id).map((i) => (
              <div key={i.id} id={i.id} className="scroll-mt-20">
                <Fold title={i.title[cl]}><ItemBody item={i} /></Fold>
              </div>
            ))}
            <p className="text-[13px] italic leading-relaxed text-muted">{a("notFatwa")}</p>
          </section>
        ))}
        <ReviewLine />
      </LearnMain>
    </>
  );
}
