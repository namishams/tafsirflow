"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LESSONS, PASS_PCT, UNITS, arabicPercent, nextArabic, readArabic, unlocked, type ArabicProgress } from "@/lib/arabic";

const T = {
  de: { start: "Kurs beginnen", cont: "Weiterlernen", lessons: "Lektionen", unit: "Einheit", locked: "Erst die vorherige Lektion schaffen", done: "geschafft", xp: "XP", progress: "Kursfortschritt", allDone: "Kurs abgeschlossen – du kannst den Koran lesen! Weiter mit der Shams-Methode.", test: "Test" },
  en: { start: "Start the course", cont: "Continue", lessons: "lessons", unit: "Unit", locked: "Pass the previous lesson first", done: "done", xp: "XP", progress: "Course progress", allDone: "Course complete – you can read the Quran! Continue with the Shams Method.", test: "Test" },
};

export default function ArabicHome() {
  const lang = useLocale() === "de" ? "de" : "en";
  const t = T[lang];
  const [p, setP] = useState<ArabicProgress | null>(null);
  useEffect(() => {
    const load = () => setP(readArabic());
    load(); window.addEventListener("tf-synced", load); window.addEventListener("focus", load);
    return () => { window.removeEventListener("tf-synced", load); window.removeEventListener("focus", load); };
  }, []);
  if (!p) return <div className="h-96 animate-pulse rounded-lg bg-line/40" />;
  const nx = nextArabic(p);
  const pct = arabicPercent(p);

  return (
    <div>
      {/* progress card */}
      <div className="flex flex-wrap items-center gap-5 rounded-xl border border-line bg-surface p-5 sm:p-6">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90"><circle cx="18" cy="18" r="15.5" fill="none" stroke="rgb(var(--line))" strokeWidth="3.5" /><circle cx="18" cy="18" r="15.5" fill="none" stroke="rgb(var(--accent))" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} /></svg>
          <span className="absolute inset-0 grid place-items-center font-display text-lg">{pct}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{t.progress}</p>
          <p className="font-display mt-1 text-xl">{nx ? nx.title[lang] : t.allDone}</p>
          <p className="mt-1 text-sm text-muted">{p.xp} {t.xp} · {LESSONS.filter((l) => (p.done[l.id]?.best ?? 0) >= PASS_PCT).length}/{LESSONS.length} {t.lessons}</p>
        </div>
        <Link href={nx ? `/arabic/${nx.id}` : "/surah/1?shams=1"} className="btn-gold inline-flex h-12 w-full items-center justify-center rounded-md px-6 text-[15px] font-bold sm:w-auto">{Object.keys(p.done).length ? t.cont : t.start} →</Link>
      </div>

      {/* path */}
      <div className="mt-10 grid gap-10">
        {UNITS.map((u) => {
          const ls = LESSONS.filter((l) => l.unit === u.n);
          return (
            <section key={u.n}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{t.unit} {u.n}</p>
              <h3 className="font-display mt-1 text-2xl">{u.title[lang]}</h3>
              <p className="mt-1 text-sm text-muted">{u.lead[lang]}</p>
              <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ls.map((l) => {
                  const d = p.done[l.id]; const open = unlocked(p, l.id); const passed = (d?.best ?? 0) >= PASS_PCT; const current = nx?.id === l.id;
                  const inner = (
                    <>
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-lg ${passed ? "bg-accent text-white" : current ? "btn-gold" : open ? "bg-line/60" : "bg-line/40 text-muted"}`}>{passed ? "✓" : open ? (l.test ? "★" : LESSONS.indexOf(l) + 1) : "🔒"}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{l.test ? `${t.test}: ` : ""}{l.title[lang]}</span>
                        <span className="block truncate text-xs text-muted">{open ? l.goal[lang] : t.locked}</span>
                        {d && <span className="mt-1 block text-sm text-gold" aria-label={`${d.stars}/3`}>{[1, 2, 3].map((n) => <span key={n} className={n <= d.stars ? "" : "text-line"}>★</span>)} <span className="text-xs text-muted">{d.best}%</span></span>}
                      </span>
                    </>
                  );
                  const cls = `flex items-center gap-3 rounded-xl border p-3 transition ${current ? "border-gold bg-gold/5 shadow-sm" : "border-line bg-surface"} ${open ? "hover:-translate-y-0.5 hover:border-ink/40" : "opacity-60"}`;
                  return <li key={l.id}>{open ? <Link href={`/arabic/${l.id}`} className={cls}>{inner}</Link> : <div className={cls} title={t.locked}>{inner}</div>}</li>;
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
