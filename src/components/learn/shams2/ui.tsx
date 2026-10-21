"use client";
// mirrors mobile/src/features/shams2/ui.tsx: the small building blocks of Shams Method 2.0 on the website – score
// colours (emerald scale, gold for itqān), the level pill, Arabic terms with transliteration and meaning, the source
// line with its review status, the glossary, chips and a segmented control; plus web helpers: a hydration gate (stored
// progress only after hydration), surah names seeded by the server, the web routes of the app's hrefs and the web texts.
import { createContext, useContext } from "react";
import { Link } from "@/i18n/navigation";
import { useLang } from "@/lib/learn/i18n";
import { useHydrated } from "@/lib/learn/store";
import { useSurahNames } from "@/lib/learn/shams2/names";
import { SOURCES, TERMS, termOf, type Review, type SourceRef } from "@/lib/learn/shams2/sources";
import { useS2 } from "@/lib/learn/shams2/text";
import type { Level } from "@/lib/learn/shams2/qualityModel";
import { Spinner } from "@/components/learn/ui";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

// ---------- web texts (not in the app's text.ts) ----------
const WT = {
  en: { method: "Shams Method", stop: "Stop", retry: "Try again", copied: "Copied", loading: "Loading", care: "Prepared with care from classical sources.", report: "Found a mistake? Please report it.", openReader: "Open in the reader", tafsirSource: "Tafsir source", tafsirNone: "No tafsir for this verse in this source.", tafsirLimit: "The daily tafsir limit is reached. Please sign in or open the verse in the reader.", wordCheckNote: "The word check uses your browser's speech recognition; it only compares words and never judges tajwīd." },
  de: { method: "Shams-Methode", stop: "Anhalten", retry: "Erneut versuchen", copied: "Kopiert", loading: "Wird geladen", care: "Mit Sorgfalt aus klassischen Quellen erarbeitet.", report: "Einen Fehler gefunden? Bitte melden Sie ihn.", openReader: "Im Leser öffnen", tafsirSource: "Tafsir-Quelle", tafsirNone: "Für diesen Vers gibt es in dieser Quelle keinen Tafsir.", tafsirLimit: "Das tägliche Tafsir-Limit ist erreicht. Bitte melden Sie sich an oder öffnen Sie den Vers im Leser.", wordCheckNote: "Die Wortprüfung nutzt die Spracherkennung Ihres Browsers; sie vergleicht nur Wörter und beurteilt nie das Tadschwid." },
  ar: { method: "منهج شمس", stop: "إيقاف", retry: "أعد المحاولة", copied: "تم النسخ", loading: "جارٍ التحميل", care: "أُعِدَّ بعناية من المصادر الكلاسيكية.", report: "وجدتم خطأً؟ نرجو أن تبلّغونا عنه.", openReader: "افتح في القارئ", tafsirSource: "مصدر التفسير", tafsirNone: "لا يوجد تفسير لهذه الآية في هذا المصدر.", tafsirLimit: "بلغتم حدّ التفسير اليومي. نرجو تسجيل الدخول أو فتح الآية في القارئ.", wordCheckNote: "يستخدم فحص الكلمات التعرّف على الكلام في متصفحكم؛ يقارن الكلمات فقط ولا يحكم على التجويد." },
};
export function useWebT() {
  const { lang } = useLang();
  return lang === "de" ? WT.de : lang === "ar" ? WT.ar : WT.en;
}

/** the hero's back link to the method hub */
export function useBack(): { href: string; label: string } {
  return { href: "/shams/method", label: useWebT().method };
}

/** the app's hrefs on the website: a Shams session of a surah is the reader with the Shams method switched on */
export function webHref(h: string): string {
  const m = h.match(/^\/shams\/(\d+)\?v=(\d+)/);
  if (m) return `/surah/${m[1]}?v=${m[2]}&shams=1`;
  return h.replace(/&tafsir=1$/, "");
}

/** renders children only after hydration (stored progress is read in the browser), a spinner before */
export function Live({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const h = useHydrated();
  const w = useWebT();
  if (!h) return <>{fallback === undefined ? <Spinner label={w.loading} /> : fallback}</>;
  return <>{children}</>;
}

// ---------- surah names, seeded by the server where it has them ----------
export type NameRow = [number, string, string, string?]; // id, name_simple, name_arabic, revelation_place
const NamesCtx = createContext<NameRow[] | null>(null);
export function NamesProvider({ names, children }: { names: NameRow[] | null; children: React.ReactNode }) {
  return <NamesCtx.Provider value={names}>{children}</NamesCtx.Provider>;
}
export function useNames() {
  const seeded = useContext(NamesCtx);
  const live = useSurahNames();
  // the server's names win where they exist (same text on the server and in the browser), the browser's elsewhere
  if (!seeded?.length) return { name: live.name, arabic: live.arabic, place: (s: number) => live.chapters.find((c) => c.id === s)?.revelation_place };
  const row = (s: number) => seeded.find((r) => r[0] === s);
  return { name: (s: number) => row(s)?.[1] ?? String(s), arabic: (s: number) => row(s)?.[2] ?? "", place: (s: number) => row(s)?.[3] };
}

// ---------- scores ----------
/** emerald scale for scores, gold for itqān; hairline when nothing is memorised */
export function scoreColor(score: number | null): string {
  if (score === null) return "rgb(var(--line))";
  if (score >= 90) return "rgb(var(--hm-gold))";
  const a = 0.22 + (Math.max(0, score) / 90) * 0.78;
  return `rgb(var(--accent) / ${a.toFixed(2)})`;
}
export const onScore = (score: number | null) => (score !== null && score >= 45 ? "#ffffff" : undefined);

/** a round score badge */
export function ScoreDot({ score, size = 40, className = "" }: { score: number | null; size?: number; className?: string }) {
  const { nf } = useS2();
  return (
    <span className={cx("inline-grid shrink-0 place-items-center rounded-full font-bold tabular-nums", className)}
      style={{ width: size, height: size, background: scoreColor(score), color: onScore(score) ?? "rgb(var(--ink))", fontSize: Math.round(size / 3) }}>
      {score === null ? "–" : nf(score)}
    </span>
  );
}

export function LevelPill({ level }: { level: Level }) {
  const { s } = useS2();
  if (level === "none") return null;
  const gold = level === "itqan";
  return (
    <span className={cx("inline-flex h-6 items-center rounded-full border px-2.5 text-[11.5px] font-semibold", gold ? "border-[rgb(var(--hm-gold))]/60 bg-[rgb(var(--hm-gold))]/[0.18] text-[rgb(var(--hm-gold-d))]" : "border-transparent bg-accent-soft text-accent")}>
      {s(`lv_${level}` as never)}
    </span>
  );
}

// ---------- terms, sources, glossary ----------
/** Arabic term, transliteration and meaning in the reader's language (content languages: de, en, ar) */
export function Term({ id, inline }: { id: string; inline?: boolean }) {
  const { cl } = useS2();
  const x = termOf(id);
  const meaning = cl === "ar" ? x.arDef : cl === "de" ? x.de : x.en;
  if (inline) return <span className="text-[12.5px] font-semibold text-[rgb(var(--hm-gold-d))]"><span lang="ar" className="font-arabic">{x.ar}</span>{` · ${x.tr}`}</span>;
  return (
    <div className="grid gap-0.5">
      <p className="flex flex-wrap items-baseline gap-2">
        <span lang="ar" dir="rtl" className="font-arabic text-[20px] leading-[1.7] text-[rgb(var(--hm-gold-d))]">{x.ar}</span>
        <span className="text-[13px] font-semibold italic">{x.tr}</span>
      </p>
      <p className="text-[13.5px] leading-relaxed text-muted">{meaning}</p>
    </div>
  );
}

/** the calm note for texts still awaiting scholarly review */
export function CareNote() {
  const w = useWebT();
  return <p className="text-[12px] leading-relaxed text-muted">{w.care} <Link href="/feedback" className="font-semibold text-accent hover:underline">{w.report}</Link></p>;
}

/** the discreet source line under every explanatory text, with the scholarly review status */
export function SourceNote({ src, review, className = "" }: { src: readonly SourceRef[]; review?: Review; className?: string }) {
  const { s } = useS2();
  const status = review?.status === "reviewed" ? s("reviewedBy", { by: review.by, at: review.at }) : "";
  return (
    <div className={cx("grid gap-1", className)}>
      <details className="group">
        <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 text-[12px] font-semibold text-muted [&::-webkit-details-marker]:hidden">
          {s("sources")}{status && <span className="font-normal text-accent">{`· ${status}`}</span>}
          <span aria-hidden className="transition group-open:rotate-90 rtl:-scale-x-100">›</span>
        </summary>
        <ul className="mt-1 grid gap-0.5">{src.map((k) => <li key={k} className="text-[12px] leading-snug text-muted">{`– ${SOURCES[k].label}`}</li>)}</ul>
      </details>
      {review?.status === "draft" && <CareNote />}
    </div>
  );
}

/** the terms of the method, open (handbook) or collapsible (hub) */
export function Glossary({ open = false, id }: { open?: boolean; id?: string }) {
  const { s } = useS2();
  const body = (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {TERMS.map((x) => <Term key={x.id} id={x.id} />)}
      <SourceNote src={["halaqa", "jazari", "nawawi", "kirmani"]} review={{ status: "draft" }} className="sm:col-span-2" />
    </div>
  );
  return (
    <section id={id} className="hm-card relative scroll-mt-20 p-5 sm:p-6">
      {open ? (<><h2 className="font-display text-[22px]">{s("glossary")}</h2>{body}</>) : (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
            <h2 className="font-display text-[20px]">{s("glossary")}</h2>
            <span aria-hidden className="text-muted transition group-open:rotate-90 rtl:-scale-x-100">›</span>
          </summary>
          {body}
        </details>
      )}
    </section>
  );
}

// ---------- controls ----------
export function Chip({ label, on, onClick, ariaLabel }: { label: React.ReactNode; on?: boolean; onClick: () => void; ariaLabel?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on ?? undefined} aria-label={ariaLabel}
      className={cx("inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition", on ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70")}>
      {label}
    </button>
  );
}

/** a small secondary button (or link); `primary` gives it the gold fill */
export function SmallBtn({ children, onClick, href, primary, disabled, label }: { children: React.ReactNode; onClick?: () => void; href?: string; primary?: boolean; disabled?: boolean; label?: string }) {
  const cls = cx("inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border px-4 text-[13.5px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
    primary ? "btn-gold border-transparent" : "border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70");
  if (href) return <Link href={href} aria-label={label} className={cls}>{children}</Link>;
  return <button type="button" onClick={onClick} disabled={disabled} aria-label={label} className={cls}>{children}</button>;
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label?: string }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full border border-line bg-surface p-1">
      {options.map(([k, l]) => (
        <button key={k} type="button" onClick={() => onChange(k)} aria-pressed={value === k}
          className={cx("min-h-9 flex-1 rounded-full px-3 text-[13.5px] font-semibold transition", value === k ? "bg-accent text-white" : "text-muted hover:text-ink")}>{l}</button>
      ))}
    </div>
  );
}

/** a small kicker (gold, uppercase in latin scripts) */
export function S2Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--hm-gold-d))] rtl:tracking-normal">{children}</p>;
}

/** a tile row on the hub: title, lead, optional trailing element */
export function Tile({ title, lead, href, right }: { title: string; lead: string; href: string; right?: React.ReactNode }) {
  return (
    <Link href={href} className="hm-card hm-lift relative flex items-center gap-4 p-4 sm:p-5">
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold leading-snug">{title}</span>
        <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{lead}</span>
      </span>
      {right ?? <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>}
    </Link>
  );
}

/** a collapsible row (native details, so the text is in the page for readers and search engines); gold border when open */
export function Fold({ title, ar, meta, children, defaultOpen = false, onToggle }: { title: React.ReactNode; ar?: string; meta?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; onToggle?: (open: boolean) => void }) {
  return (
    <details open={defaultOpen || undefined} onToggle={(e) => onToggle?.((e.currentTarget as HTMLDetailsElement).open)} className="group rounded-xl border border-line bg-surface open:border-[rgb(var(--hm-gold))]/60">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
        {meta && <span className="min-w-16 text-[12.5px] font-semibold tabular-nums text-[rgb(var(--hm-gold-d))]">{meta}</span>}
        <span className="min-w-0 flex-1">
          {ar && <span lang="ar" dir="rtl" className="font-arabic block text-[17px] leading-[1.8] text-[rgb(var(--hm-gold-d))]">{ar}</span>}
          <span className="block text-[15.5px] font-bold">{title}</span>
        </span>
        <span aria-hidden className="text-muted transition group-open:rotate-90 rtl:-scale-x-100">›</span>
      </summary>
      <div className="grid gap-3 px-4 pb-4">{children}</div>
    </details>
  );
}
