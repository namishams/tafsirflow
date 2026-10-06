"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Chapter } from "@/lib/quran";
import { readJSON } from "@/lib/storage";
import { dueVerses, stats } from "@/lib/learning";

type Last = { chapter: number; verse: number };

export default function SurahBrowser({ chapters }: { chapters: Chapter[] }) {
  const t = useTranslations("home");
  const [q, setQ] = useState("");
  const [last, setLast] = useState<Last | null>(null);
  const [marks, setMarks] = useState<string[]>([]);
  const [due, setDue] = useState<string[]>([]);
  const [st, setSt] = useState({ streak: 0, todayCount: 0 });

  useEffect(() => {
    const load = () => {
      setLast(readJSON<Last | null>("tf:last", null));
      setMarks(readJSON<string[]>("tf:bookmarks", []));
      setDue(dueVerses());
      setSt(stats());
    };
    load();
    window.addEventListener("tf-synced", load); // account data arrived
    return () => window.removeEventListener("tf-synced", load);
  }, []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return chapters;
    return chapters.filter((c) => String(c.id) === s || c.name_simple.toLowerCase().includes(s) || c.translated_name.name.toLowerCase().includes(s) || c.name_arabic.includes(s));
  }, [q, chapters]);

  const lastChapter = last && chapters.find((c) => c.id === last.chapter);

  return (
    <>
      {(st.streak > 0 || due.length > 0) && (
        <section className="mb-5 rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
            {st.streak > 0 && <span className="rounded-full bg-accent-soft px-3 py-1 font-semibold text-accent">🔥 {t("streak", { n: st.streak })}</span>}
            {st.todayCount > 0 && <span className="rounded-full border border-line px-3 py-1 text-muted">{t("todayCount", { n: st.todayCount })}</span>}
          </div>
          {due.length > 0 ? (
            <Link href={`/surah/${due[0].split(":")[0]}?v=${due[0].split(":")[1]}&m=2&r=1`} className="flex items-center justify-between rounded-xl bg-accent px-4 py-3 text-white">
              <span><span className="block text-xs font-semibold uppercase tracking-wide opacity-80">{t("review")}</span><span className="font-display text-lg font-semibold">{t("reviewDue", { n: due.length })}</span></span>
              <span className="font-semibold">{t("reviewStart")} →</span>
            </Link>
          ) : (
            <p className="text-sm text-muted">{t("reviewNone")}</p>
          )}
        </section>
      )}

      {lastChapter && last && (
        <Link href={`/surah/${last.chapter}?v=${last.verse}`} className="mb-5 flex items-center justify-between rounded-2xl border border-accent/30 bg-accent-soft p-4 shadow-card">
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-accent">{t("resume")}</span>
            <span className="font-display text-lg font-semibold">{t("resumeAt", { surah: lastChapter.name_simple, verse: last.verse })}</span>
          </span>
          <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-accent text-white">▶</span>
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
        className="mb-5 w-full rounded-2xl border border-line bg-surface px-5 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.10)] outline-none focus:border-accent"
      />

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {list.map((c) => (
          <li key={c.id} className="min-w-0">
            <Link href={`/surah/${c.id}`} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-card transition hover:-translate-y-0.5 hover:border-accent">
              <span className="relative grid h-11 w-11 shrink-0 place-items-center">
                <span className="absolute inset-1 rotate-45 rounded-md bg-accent-soft transition group-hover:bg-accent" />
                <span className="absolute inset-1 rounded-md bg-accent-soft transition group-hover:bg-accent" />
                <span className="relative text-sm font-semibold text-accent transition group-hover:text-white">{c.id}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{c.name_simple}</span>
                <span className="block truncate text-xs text-muted">{c.translated_name.name} · {c.verses_count} {t("verses")}</span>
              </span>
              <span className="shrink-0 font-arabic text-2xl text-accent" dir="rtl">{c.name_arabic}</span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="py-8 text-center text-muted">{t("noResults")}</p>}
    </>
  );
}
