"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Chapter } from "@/lib/quran";
import { readJSON } from "@/lib/storage";

type Last = { chapter: number; verse: number };

export default function SurahBrowser({ chapters }: { chapters: Chapter[] }) {
  const t = useTranslations("home");
  const [q, setQ] = useState("");
  const [last, setLast] = useState<Last | null>(null);
  const [marks, setMarks] = useState<string[]>([]);

  useEffect(() => {
    setLast(readJSON<Last | null>("tf:last", null));
    setMarks(readJSON<string[]>("tf:bookmarks", []));
  }, []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return chapters;
    return chapters.filter((c) => String(c.id) === s || c.name_simple.toLowerCase().includes(s) || c.translated_name.name.toLowerCase().includes(s) || c.name_arabic.includes(s));
  }, [q, chapters]);

  const lastChapter = last && chapters.find((c) => c.id === last.chapter);

  return (
    <>
      {lastChapter && last && (
        <Link href={`/surah/${last.chapter}?v=${last.verse}`} className="mb-6 flex items-center justify-between rounded-2xl bg-accent p-4 text-white shadow-card">
          <span>
            <span className="block text-xs uppercase tracking-wide opacity-80">{t("resume")}</span>
            <span className="text-lg font-semibold">{t("resumeAt", { surah: lastChapter.name_simple, verse: last.verse })}</span>
          </span>
          <span aria-hidden className="text-2xl">▶</span>
        </Link>
      )}

      {marks.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{t("bookmarks")}</h2>
          <div className="flex flex-wrap gap-2">
            {marks.map((k) => {
              const [s, v] = k.split(":");
              return (
                <Link key={k} href={`/surah/${s}?v=${v}`} className="rounded-full border border-line bg-surface px-3 py-1 text-sm shadow-card hover:border-accent">
                  {chapters.find((c) => c.id === Number(s))?.name_simple ?? s} · {v}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("search")}
        className="mb-4 w-full rounded-xl border border-line bg-surface px-4 py-3 shadow-card outline-none focus:border-accent"
      />

      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((c) => (
          <li key={c.id}>
            <Link href={`/surah/${c.id}`} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-3 shadow-card transition hover:border-accent">
              <span className="relative grid h-11 w-11 shrink-0 place-items-center">
                <span className="absolute inset-1 rotate-45 rounded-md bg-accent-soft" />
                <span className="relative text-sm font-semibold text-accent">{c.id}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{c.name_simple}</span>
                <span className="block truncate text-xs text-muted">{c.translated_name.name} · {c.verses_count} {t("verses")}</span>
              </span>
              <span className="font-arabic text-2xl text-ink" dir="rtl">{c.name_arabic}</span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="py-8 text-center text-muted">{t("noResults")}</p>}
    </>
  );
}
