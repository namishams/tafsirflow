"use client";
import { IconLock, ArrowNext } from "./Icons";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LESSONS, PASS_PCT, UNITS, arabicPercent, nextArabic, readArabic, unlocked, type ArabicProgress, type L2, type Lang, type Lesson } from "@/lib/arabic";
import { PracticeMedallion, PracticeStar, PracticeStarNum } from "./art/PracticeArt";

const T = {
  de: { start: "Kurs beginnen", cont: "Weiterlernen", lessons: "Lektionen", unit: "Einheit", locked: "Erst die vorherige Lektion schaffen", done: "geschafft", xp: "XP", progress: "Kursfortschritt", allDone: "Kurs abgeschlossen – Sie können den Koran lesen! Weiter mit der Shams-Methode.", test: "Test", placeTitle: "Einstufungstest", placeBody: "Sie können schon etwas lesen? Zwölf kurze Fragen zeigenen Sie sich, wo Sie einsteigen – Einheiten, die Sie sicher beherrschen, überspringen Sie.", placeCta: "Test starten", placeAgain: "Test wiederholen", placeLast: "Letztes Ergebnis: {a} von {b} richtig", placeNote: "Per Einstufungstest übersprungen" },
  ar: { start: "ابدأ الدورة", cont: "تابع التعلّم", lessons: "دروس", unit: "الوحدة", locked: "أتمّ الدرس السابق أولًا", done: "تمّ", xp: "نقطة", progress: "تقدّمك في الدورة", allDone: "أتممت الدورة – صرت تقرأ القرآن! تابع مع منهج شمس.", test: "اختبار", placeTitle: "اختبار تحديد المستوى", placeBody: "هل تقرأ العربية قليلًا؟ اثنا عشر سؤالًا قصيرًا تبيِّن لك من أين تبدأ – وتتخطّى الوحدات التي تُتقنها.", placeCta: "ابدأ الاختبار", placeAgain: "أعد الاختبار", placeLast: "آخر نتيجة: {a} من {b} صحيحة", placeNote: "تخطّيتَ بالاختبار" },
  en: { start: "Start the course", cont: "Continue", lessons: "lessons", unit: "Unit", locked: "Pass the previous lesson first", done: "done", xp: "XP", progress: "Course progress", allDone: "Course complete – you can read the Quran! Continue with the Shams Method.", test: "Test", placeTitle: "Placement test", placeBody: "Can you already read a little? Twelve short questions show where you join the course – units you know well are skipped.", placeCta: "Start the test", placeAgain: "Repeat the test", placeLast: "Last result: {a} of {b} correct", placeNote: "Skipped by the placement test" },
  tr: {
    start: "Kursa başla", cont: "Devam et", lessons: "ders", unit: "Ünite", locked: "Önce önceki dersi geç", done: "tamamlandı", xp: "XP",
    progress: "Kurs ilerlemesi", allDone: "Kursu tamamladın – Kur’an’ı okuyabiliyorsun! Shams Metodu ile devam et.", test: "Test",
    placeTitle: "Seviye belirleme testi",
    placeBody: "Zaten biraz okuyabiliyor musun? On iki kısa soru, kursa nereden gireceğini gösterir – iyi bildiğin üniteler atlanır.",
    placeCta: "Teste başla", placeAgain: "Testi tekrarla", placeLast: "Son sonuç: {b} sorudan {a} doğru",
    placeNote: "Seviye belirleme testiyle atlanan",
  },
  ur: {
    start: "کورس شروع کریں", cont: "جاری رکھیں", lessons: "اسباق", unit: "یونٹ", locked: "پہلے پچھلا سبق پاس کریں", done: "مکمل", xp: "XP",
    progress: "کورس کی پیش رفت", allDone: "کورس مکمل – اب آپ قرآن پڑھ سکتے ہیں! شمس طریقے کے ساتھ آگے بڑھیں۔", test: "ٹیسٹ",
    placeTitle: "سطح جانچنے کا ٹیسٹ",
    placeBody: "کیا آپ پہلے سے کچھ پڑھ لیتے ہیں؟ بارہ مختصر سوالات بتاتے ہیں کہ آپ کورس میں کہاں سے شامل ہوں – جو یونٹس آپ کو اچھی طرح آتے ہیں وہ چھوڑ دیے جاتے ہیں۔",
    placeCta: "ٹیسٹ شروع کریں", placeAgain: "ٹیسٹ دہرائیں", placeLast: "آخری نتیجہ: {b} میں سے {a} درست", placeNote: "سطح کے ٹیسٹ کی وجہ سے چھوڑا گیا",
  },
  fa: {
    start: "شروع دوره", cont: "ادامه", lessons: "درس", unit: "بخش", locked: "نخست درس پیشین را بگذرانید", done: "انجام شد", xp: "XP",
    progress: "پیشرفت دوره", allDone: "دوره به پایان رسید – شما می‌توانید قرآن بخوانید! با روش شمس ادامه دهید.", test: "آزمون",
    placeTitle: "آزمون تعیین سطح",
    placeBody: "آیا کمی می‌توانید بخوانید؟ دوازده پرسش کوتاه نشان می‌دهد از کجای دوره وارد شوید – بخش‌هایی که خوب می‌دانید رد می‌شوند.",
    placeCta: "شروع آزمون", placeAgain: "تکرار آزمون", placeLast: "آخرین نتیجه: {a} از {b} درست", placeNote: "با آزمون تعیین سطح رد شد",
  },
  ps: {
    start: "کورس پیل کړئ", cont: "ادامه", lessons: "درسونه", unit: "څپرکی", locked: "لومړی مخکینی درس تېر کړئ", done: "بشپړ", xp: "XP",
    progress: "د کورس پرمختګ", allDone: "کورس بشپړ شو – تاسو قرآن لوستلای شئ! د شمس طریقې سره ادامه ورکړئ.", test: "ازموینه",
    placeTitle: "د کچې ازموینه",
    placeBody: "آیا تاسو دمخه لږ لوستلای شئ؟ دولس لنډې پوښتنې ښيي چې تاسو کورس له کوم ځایه پیل کوئ – هغه څپرکي چې ښه یې پېژنئ، پرېښودل کېږي.",
    placeCta: "ازموینه پیل کړئ", placeAgain: "ازموینه تکرار کړئ", placeLast: "وروستۍ پایله: {a} له {b} سم",
    placeNote: "د کچې ازموینې له مخې پرېښودل شوی",
  },
  fr: {
    start: "Commencer le cours", cont: "Continuer", lessons: "leçons", unit: "Unité", locked: "Réussis d’abord la leçon précédente", done: "terminée",
    xp: "XP", progress: "Progression du cours", allDone: "Cours terminé – tu sais lire le Coran ! Poursuis avec la Méthode Shams.", test: "Test",
    placeTitle: "Test de niveau",
    placeBody: "Tu sais déjà lire un peu ? Douze questions courtes montrent où tu rejoins le cours – les unités que tu maîtrises bien sont sautées.",
    placeCta: "Commencer le test", placeAgain: "Refaire le test", placeLast: "Dernier résultat : {a} sur {b} justes",
    placeNote: "Sautée grâce au test de niveau",
  },
  es: {
    start: "Empezar el curso", cont: "Continuar", lessons: "lecciones", unit: "Unidad", locked: "Supera primero la lección anterior", done: "hecha",
    xp: "XP", progress: "Progreso del curso", allDone: "Curso completado – ¡ya puedes leer el Corán! Continúa con el Método Shams.", test: "Prueba",
    placeTitle: "Prueba de nivel",
    placeBody: "¿Ya sabes leer un poco? Doce preguntas breves muestran por dónde te unes al curso: las unidades que dominas bien se omiten.",
    placeCta: "Empezar la prueba", placeAgain: "Repetir la prueba", placeLast: "Último resultado: {a} de {b} correctas",
    placeNote: "Omitida por la prueba de nivel",
  },
  id: {
    start: "Mulai kursus", cont: "Lanjut", lessons: "pelajaran", unit: "Unit", locked: "Lulus dulu pelajaran sebelumnya", done: "selesai", xp: "XP",
    progress: "Kemajuan kursus", allDone: "Kursus selesai – kamu sudah bisa membaca Al-Qur’an! Lanjutkan dengan Metode Shams.", test: "Tes",
    placeTitle: "Tes penempatan",
    placeBody: "Sudah bisa membaca sedikit? Dua belas pertanyaan singkat menunjukkan di mana kamu masuk ke dalam kursus – unit yang sudah kamu kuasai dilewati.",
    placeCta: "Mulai tes", placeAgain: "Ulangi tes", placeLast: "Hasil terakhir: {a} dari {b} benar", placeNote: "Dilewati oleh tes penempatan",
  },
  ms: {
    start: "Mulakan kursus", cont: "Teruskan", lessons: "pelajaran", unit: "Unit", locked: "Lulus pelajaran sebelumnya dahulu", done: "selesai",
    xp: "XP", progress: "Kemajuan kursus", allDone: "Kursus selesai – anda sudah boleh membaca Quran! Teruskan dengan Kaedah Shams.", test: "Ujian",
    placeTitle: "Ujian penempatan",
    placeBody: "Adakah anda sudah boleh membaca sedikit? Dua belas soalan ringkas menunjukkan di mana anda menyertai kursus – unit yang anda kuasai dengan baik akan dilangkau.",
    placeCta: "Mulakan ujian", placeAgain: "Ulang ujian", placeLast: "Keputusan terakhir: {a} daripada {b} betul",
    placeNote: "Dilangkau oleh ujian penempatan",
  },
  bn: {
    start: "কোর্স শুরু করুন", cont: "চালিয়ে যান", lessons: "পাঠ", unit: "ইউনিট", locked: "আগে পূর্ববর্তী পাঠে উত্তীর্ণ হোন", done: "সম্পন্ন",
    xp: "XP", progress: "কোর্সের অগ্রগতি", allDone: "কোর্স সম্পন্ন – আপনি কুরআন পড়তে পারেন! শামস পদ্ধতি দিয়ে এগিয়ে যান।", test: "পরীক্ষা",
    placeTitle: "স্তর-নির্ধারণী পরীক্ষা",
    placeBody: "আপনি কি আগে থেকেই একটু পড়তে পারেন? বারোটি ছোট প্রশ্ন দেখিয়ে দেয় কোর্সের কোন জায়গা থেকে শুরু করবেন – যে ইউনিটগুলো আপনি ভালো জানেন, সেগুলো বাদ যায়।",
    placeCta: "পরীক্ষা শুরু করুন", placeAgain: "পরীক্ষা আবার দিন", placeLast: "সর্বশেষ ফল: {b}টির মধ্যে {a}টি সঠিক",
    placeNote: "স্তর-নির্ধারণী পরীক্ষায় বাদ পড়েছে",
  },
  ru: {
    start: "Начать курс", cont: "Продолжить", lessons: "уроков", unit: "Раздел", locked: "Сначала пройди предыдущий урок", done: "пройдено", xp: "XP",
    progress: "Прогресс курса", allDone: "Курс пройден – ты умеешь читать Коран! Продолжай с Методом Шамса.", test: "Тест", placeTitle: "Вводный тест",
    placeBody: "Ты уже немного умеешь читать? Двенадцать коротких вопросов покажут, с какого места начать курс – хорошо знакомые разделы пропускаются.",
    placeCta: "Начать тест", placeAgain: "Повторить тест", placeLast: "Последний результат: верно {a} из {b}",
    placeNote: "Пропущено по итогам вводного теста",
  },
  zh: {
    start: "开始课程", cont: "继续", lessons: "课", unit: "单元", locked: "请先通过上一课", done: "已完成", xp: "XP", progress: "课程进度",
    allDone: "课程完成——你已经能读古兰经了！接着学习 Shams 方法吧。", test: "测试", placeTitle: "水平测试", placeBody: "你已经会读一点了吗？十二道简短的题目会显示你从哪里加入课程——掌握得好的单元将被跳过。",
    placeCta: "开始测试", placeAgain: "重做测试", placeLast: "上次结果：{b} 题中答对 {a} 题", placeNote: "已通过水平测试跳过",
  },
} satisfies Record<Lang, unknown>;

// the Arabic shown in a lesson's gate: its letters, or the first words of its first learning card
const glyph = (l: Lesson) => l.letters ? l.letters.join(" ") : l.formsOf ? l.formsOf.slice(0, 3).join(" ") : (l.learn[0]?.ar ?? "").split(" ").slice(0, 2).join(" ");

export default function ArabicHome() {
  const loc = useLocale();
  const lang = (loc in T ? loc : "en") as keyof typeof T; // the locale if the table has it, otherwise English
  const tx = (v: L2) => v[lang] ?? v.en;
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
