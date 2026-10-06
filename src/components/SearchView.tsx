"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { searchVerses, type SearchHit } from "@/lib/quran";
import { QuranInlay } from "./art/QuranArt";

// keeps the <em> highlight of the search API, drops every other tag
function Highlighted({ html }: { html: string }) {
  const parts = html.replace(/<sup[^>]*>[\s\S]*?<\/sup>/g, "").replace(/<(?!\/?em>)[^>]*>/g, "").split(/(<em>[\s\S]*?<\/em>)/);
  return <>{parts.map((p, i) => (p.startsWith("<em>") ? <mark key={i} className="q-mark">{p.slice(4, -5)}</mark> : p))}</>;
}

// Quran search: a marble opening with a gilded search field, results as framed verse cards
export default function SearchView() {
  const t = useTranslations("search");
  const th = useTranslations("home");
  const ta = useTranslations("app");
  const locale = useLocale();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (text: string) => {
    if (text.trim().length < 2) return;
    setBusy(true);
    try { setHits(await searchVerses(text.trim(), locale)); } catch { setHits([]); } finally { setBusy(false); }
  };
  const go = (e: React.FormEvent) => { e.preventDefault(); void run(q); };
  // /search?q=rahma runs the search right away
  useEffect(() => {
    const init = new URLSearchParams(window.location.search).get("q");
    if (init) { setQ(init); void run(init); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="q-page min-w-0 pb-20">
      <section className="q-hero">
        <QuranInlay className="-bottom-6 -end-8 w-40 -scale-x-100 sm:w-56 rtl:scale-x-100" />
        <div className="mx-auto max-w-3xl px-4 pb-14 pt-9 sm:px-6 sm:pb-16 sm:pt-14">
          <p className="q-kicker flex items-center gap-2 text-[rgb(var(--q-ink-gold))]">
            <svg aria-hidden viewBox="0 0 24 24" className="h-3 w-3 shrink-0"><path d="M12 1l2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8z" fill="currentColor" /></svg>
            <span className="truncate">{ta("name")}</span>
          </p>
          <h1 className="font-display mt-3 text-[36px] leading-[1] sm:text-6xl">{t("title")}</h1>
          <form onSubmit={go} className="q-searchbar mt-7">
            <label className="q-search min-w-0 flex-1">
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
              <span className="sr-only">{th("searchVerses")}</span>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={th("searchVerses")} autoFocus />
            </label>
            <button disabled={busy} className="btn-gold inline-flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-bold disabled:opacity-70">
              {busy && <svg aria-hidden viewBox="0 0 24 24" className="q-spin h-4 w-4"><path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>}
              {t("go")}
            </button>
          </form>
        </div>
        <span aria-hidden className="q-arcade" />
      </section>

      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        {hits && hits.length === 0 && <p className="py-6 text-center text-muted">{t("noResults")}</p>}
        <ul className="grid gap-3" aria-busy={busy}>
          {hits?.map((h, i) => {
            const [s, v] = h.verse_key.split(":");
            return (
              <li key={h.verse_key} className="min-w-0">
                <Link href={`/surah/${s}?v=${v}`} className="q-tile q-hit q-in block p-4 sm:p-5" style={{ "--i": Math.min(i, 12) } as React.CSSProperties}>
                  <span className="flex items-center gap-3">
                    <span className="q-key tabular-nums" dir="ltr">{h.verse_key}</span>
                    <span aria-hidden className="h-px min-w-0 flex-1 bg-gradient-to-r from-[rgb(201_166_94/0.45)] to-transparent rtl:bg-gradient-to-l" />
                  </span>
                  <span className="font-arabic mt-3 block text-[24px] leading-[2] sm:text-[28px]" dir="rtl" lang="ar"><Highlighted html={h.text} /></span>
                  {h.translation && <span className="mt-2 block text-[15px] leading-relaxed text-muted"><Highlighted html={h.translation} /></span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
