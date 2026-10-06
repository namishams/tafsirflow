"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { searchVerses, type SearchHit } from "@/lib/quran";

export default function SearchView() {
  const t = useTranslations("search");
  const th = useTranslations("home");
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
  const strip = (s: string) => s.replace(/<[^>]+>/g, "");

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <h1 className="font-display text-[34px] leading-none">{t("title")}</h1>
      <form onSubmit={go} className="mt-5 flex gap-2">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={th("searchVerses")} className="h-12 min-w-0 flex-1 rounded-md border border-line bg-surface px-4 text-[15px] outline-none focus:border-accent" autoFocus />
        <button disabled={busy} className="h-12 rounded-md bg-accent px-5 text-[15px] font-bold text-white disabled:opacity-60">{t("go")}</button>
      </form>
      {hits && hits.length === 0 && <p className="mt-8 text-muted">{t("noResults")}</p>}
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {hits?.map((h) => {
          const [s, v] = h.verse_key.split(":");
          return (
            <li key={h.verse_key}>
              <Link href={`/surah/${s}?v=${v}`} className="block py-4 hover:bg-surface">
                <span className="text-[13px] font-bold text-accent">{h.verse_key}</span>
                <span className="font-arabic mt-1 block text-2xl leading-[2]" dir="rtl">{strip(h.text)}</span>
                {h.translation && <span className="mt-1 block text-[15px] leading-relaxed text-muted">{strip(h.translation)}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
