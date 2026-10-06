"use client";
import { IconLock, ArrowNext } from "./Icons";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LESSONS, PASS_PCT, UNITS, arabicPercent, nextArabic, readArabic, unlocked, type ArabicProgress, type Lesson } from "@/lib/arabic";
import { PracticeMedallion, PracticeStar, PracticeStarNum } from "./art/PracticeArt";

const T = {
  de: { start: "Kurs beginnen", cont: "Weiterlernen", lessons: "Lektionen", unit: "Einheit", locked: "Erst die vorherige Lektion schaffen", done: "geschafft", xp: "XP", progress: "Kursfortschritt", allDone: "Kurs abgeschlossen – du kannst den Koran lesen! Weiter mit der Shams-Methode.", test: "Test", placeTitle: "Einstufungstest", placeBody: "Du kannst schon etwas lesen? Zwölf kurze Fragen zeigen dir, wo du einsteigst – Einheiten, die du sicher beherrschst, überspringst du.", placeCta: "Test starten", placeAgain: "Test wiederholen", placeLast: "Letztes Ergebnis: {a} von {b} richtig", placeNote: "Per Einstufungstest übersprungen" },
  ar: { start: "ابدأ الدورة", cont: "تابع التعلّم", lessons: "دروس", unit: "الوحدة", locked: "أتمّ الدرس السابق أولًا", done: "تمّ", xp: "نقطة", progress: "تقدّمك في الدورة", allDone: "أتممت الدورة – صرت تقرأ القرآن! تابع مع منهج شمس.", test: "اختبار", placeTitle: "اختبار تحديد المستوى", placeBody: "هل تقرأ العربية قليلًا؟ اثنا عشر سؤالًا قصيرًا تبيِّن لك من أين تبدأ – وتتخطّى الوحدات التي تُتقنها.", placeCta: "ابدأ الاختبار", placeAgain: "أعد الاختبار", placeLast: "آخر نتيجة: {a} من {b} صحيحة", placeNote: "تخطّيتَ بالاختبار" },
  en: { start: "Start the course", cont: "Continue", lessons: "lessons", unit: "Unit", locked: "Pass the previous lesson first", done: "done", xp: "XP", progress: "Course progress", allDone: "Course complete – you can read the Quran! Continue with the Shams Method.", test: "Test", placeTitle: "Placement test", placeBody: "Can you already read a little? Twelve short questions show where you join the course – units you know well are skipped.", placeCta: "Start the test", placeAgain: "Repeat the test", placeLast: "Last result: {a} of {b} correct", placeNote: "Skipped by the placement test" },
};

// the Arabic shown in a lesson's gate: its letters, or the first words of its first learning card
const glyph = (l: Lesson) => l.letters ? l.letters.join(" ") : l.formsOf ? l.formsOf.slice(0, 3).join(" ") : (l.learn[0]?.ar ?? "").split(" ").slice(0, 2).join(" ");

export default function ArabicHome() {
  const loc = useLocale();
  const lang = loc === "de" ? "de" : loc === "ar" ? "ar" : "en";
  const tx = (v: { de: string; en: string; ar?: string }) => v[lang] ?? v.en;
  const t = T[lang];
  const [p, setP] = useState<ArabicProgress | null>(null);
  useEffect(() => {
    const load = () => setP(readArabic());
    load(); window.addEventListener("tf-synced", load); window.addEventListener("focus", load);
    return () => { window.removeEventListener("tf-synced", load); window.removeEventListener("focus", load); };
  }, []);
  if (!p) return <div className="h-96 animate-pulse rounded-2xl bg-line/40" />;
  const nx = nextArabic(p);
  const pct = arabicPercent(p);
  const passedN = LESSONS.filter((l) => (p.done[l.id]?.best ?? 0) >= PASS_PCT).length;
  const nxUnit = nx ? UNITS.find((u) => u.n === nx.unit)! : null;

  return (
    <div>
      {/* continue: where you are, in a medallion, and the next gate */}
      <div className="stage girih relative overflow-hidden rounded-2xl text-[#eef0f3]">
        <span aria-hidden className="illum-frame" />
        <div className="relative grid items-center gap-6 p-6 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:p-8">
          <PracticeMedallion pct={pct / 100} size={128} uid="ah-m" className="mx-auto">
            <span className="font-display text-[28px] leading-none">{pct}%</span>
          </PracticeMedallion>
          <div className="min-w-0 text-center sm:text-start">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--gold))] rtl:tracking-normal">{t.progress}</p>
            <p className="font-display mt-2 text-2xl leading-tight sm:text-[28px]">{nx ? tx(nx.title) : t.allDone}</p>
            {nx && nxUnit && <p className="mt-1 text-sm font-semibold text-[#e9cf99]">{t.unit} {nx.unit} · {tx(nxUnit.title)}</p>}
            <p className="mt-2 text-sm text-white/60">{p.xp} {t.xp} · {passedN}/{LESSONS.length} {t.lessons}</p>
            {p.placement && p.placement.units > 0 && <p className="mt-1 text-xs text-white/50">{t.placeNote}: {t.unit} 1{p.placement.units > 1 ? `–${p.placement.units}` : ""}</p>}
          </div>
          <div className="grid justify-items-center gap-3">
            {nx && <span className="font-arabic hidden text-[40px] leading-[1.5] text-[#f3e2b6] sm:block" dir="rtl" lang="ar">{glyph(nx)}</span>}
            <Link href={nx ? `/arabic/${nx.id}` : "/surah/1?shams=1"} className="btn-gold inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full px-7 text-[15px] font-bold sm:w-auto">{Object.keys(p.done).length ? t.cont : t.start} <ArrowNext /></Link>
          </div>
        </div>
      </div>

      {/* placement test: for learners who can already read a bit (offered while units 1–6 are not finished) */}
      {nx && nx.unit <= 6 && (
        <div className="pa-card mt-4 flex flex-wrap items-center gap-4 p-5 sm:p-6">
          <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 text-gold" aria-hidden><path d="M24 3l5 10.5L40.5 9 36 20.5 46 24l-10 3.5L40.5 39 29 34.5 24 45l-5-10.5L7.5 39 12 27.5 2 24l10-3.5L7.5 9 19 13.5z" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1.2" /><path d="M17 25l5 5 9-11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div className="min-w-0 flex-1 basis-56">
            <h3 className="font-display text-xl">{t.placeTitle}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{t.placeBody}</p>
            {p.placement && <p className="mt-2 text-sm font-semibold text-gold">{t.placeLast.replace("{a}", String(p.placement.correct)).replace("{b}", String(p.placement.total))}</p>}
          </div>
          <Link href="/arabic/placement" className="pa-chip h-11 w-full justify-center px-5 text-[15px] sm:w-auto">{p.placement ? t.placeAgain : t.placeCta} <ArrowNext /></Link>
        </div>
      )}

      {/* the path: every unit a row of arched gates */}
      <div className="mt-12 grid gap-14">
        {UNITS.map((u, ui) => {
          const ls = LESSONS.filter((l) => l.unit === u.n);
          const doneN = ls.filter((l) => (p.done[l.id]?.best ?? 0) >= PASS_PCT).length;
          const all = doneN === ls.length;
          return (
            <section key={u.n} className="relative ps-[60px] sm:ps-[84px]">
              {ui < UNITS.length - 1 && <span aria-hidden className="pa-rail start-[23px] sm:start-[31px]" />}
              <span className="absolute start-0 top-0 sm:hidden"><PracticeStarNum n={all ? "✓" : u.n} size={48} filled={all} /></span>
              <span className="absolute start-0 top-0 hidden sm:block"><PracticeStarNum n={all ? "✓" : u.n} size={64} filled={all} /></span>
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold rtl:tracking-normal">{t.unit} {u.n} <span className="ms-1 text-muted">· {doneN}/{ls.length}</span></p>
                  {lang !== "ar" && <p className="font-callig mt-1 text-left text-[26px] leading-tight text-gold sm:text-[30px]" dir="rtl" lang="ar">{u.title.ar}</p>}
                  <h3 className={`font-display text-2xl leading-tight ${lang === "ar" ? "mt-1 text-[28px]" : ""}`}>{tx(u.title)}</h3>
                </div>
              </div>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{tx(u.lead)}</p>
              <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {ls.map((l) => {
                  const d = p.done[l.id]; const open = unlocked(p, l.id); const passed = (d?.best ?? 0) >= PASS_PCT; const current = nx?.id === l.id;
                  const g = glyph(l);
                  const inner = (
                    <>
                      <span className="mx-auto mt-3.5 grid h-[30px] place-items-center">
                        {passed ? <PracticeStarNum n="✓" size={30} filled /> : open ? <PracticeStarNum n={l.test ? "★" : LESSONS.indexOf(l) + 1} size={30} /> : <span className="text-muted"><IconLock /></span>}
                      </span>
                      <span className={`font-arabic mx-auto block max-w-full truncate px-2 pt-1 text-center leading-[1.7] ${current || passed ? "text-gold" : "text-ink/80"} ${g.length > 9 ? "text-[18px] sm:text-[21px]" : g.length > 5 ? "text-[23px] sm:text-[28px]" : "text-[30px]"}`} dir="rtl" lang="ar">{g}</span>
                      <span className="mt-auto block px-3 pb-3 pt-2 text-center">
                        <span className="line-clamp-2 text-[13.5px] font-bold leading-snug">{l.test ? `${t.test}: ` : ""}{tx(l.title)}</span>
                        <span className="mt-1.5 flex items-center justify-center gap-0.5" aria-label={`${d?.stars ?? 0}/3`}>
                          {[1, 2, 3].map((n) => <PracticeStar key={n} size={11} className={n <= (d?.stars ?? 0) ? "" : "opacity-20"} />)}
                          {d && <span className="ms-1.5 text-[11px] text-muted">{d.best}%</span>}
                        </span>
                        {current && <span className="mt-2 inline-flex rounded-full bg-gradient-to-b from-[#ecd7a2] to-[#c6a65e] px-3 py-0.5 text-[11px] font-bold text-[rgb(8_38_29)]">{Object.keys(p.done).length ? t.cont : t.start}</span>}
                      </span>
                    </>
                  );
                  const cls = `pa-gate flex min-h-[184px] flex-col ${current ? "is-current" : ""} ${passed ? "is-done" : ""} ${open ? "" : "is-locked"}`;
                  return <li key={l.id} className="min-w-0">{open ? <Link href={`/arabic/${l.id}`} className={cls}>{inner}</Link> : <div className={cls} title={t.locked}>{inner}</div>}</li>;
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
