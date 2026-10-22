"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ESSENCE, PRAYERS, buildPrayer, langOf, type L2, type Lang, type Posture, type Tradition } from "@/lib/salah";
import { ArrowNext } from "./Icons";
import { PracticeStar, starPath } from "./art/PracticeArt";
import { Courtyard, FigureArt, Glyph, Mat, Motes, TS_CSS, TsDefs, useTsId } from "./art/TrainerScene";
import { TA, figureParts } from "./art/trainerArt";

type UiKey = "sunni" | "shia" | "rakah" | "of" | "play" | "pause" | "prev" | "next" | "steps" | "aloud" | "silent" | "qibla" | "meaning" | "restart" | "note" | "learnFatiha";
const UI: Record<Lang, Record<UiKey, string>> = {
  de: { sunni: "Sunnitisch", shia: "Schiitisch (Dscha'fari)", rakah: "Raka", of: "von", play: "Abspielen", pause: "Pause", prev: "Zurück", next: "Weiter", steps: "Alle Schritte", aloud: "laut", silent: "leise", qibla: "Qibla", meaning: "Bedeutung", restart: "Von vorn", note: "Dieser Trainer zeigt den üblichen Ablauf. Einzelheiten unterscheiden sich zwischen den Rechtsschulen – lernen Sie das Gebet zusätzlich bei einem Lehrer Ihrer Schule.", learnFatiha: "Al-Fatiha Vers für Vers lernen" },
  en: { sunni: "Sunni", shia: "Shia (Ja'fari)", rakah: "Rak'ah", of: "of", play: "Play", pause: "Pause", prev: "Back", next: "Next", steps: "All steps", aloud: "aloud", silent: "silent", qibla: "Qibla", meaning: "Meaning", restart: "Start again", note: "This trainer shows the common sequence. Details differ between the schools – also learn the prayer with a teacher of your school.", learnFatiha: "Learn Al-Fatiha verse by verse" },
  ar: { sunni: "أهل السنة", shia: "الشيعة (المذهب الجعفري)", rakah: "الركعة", of: "من", play: "تشغيل", pause: "إيقاف", prev: "السابق", next: "التالي", steps: "كل الخطوات", aloud: "جهرًا", silent: "سرًّا", qibla: "القبلة", meaning: "المعنى", restart: "من البداية", note: "يعرض هذا المدرّب الترتيب المعتاد للصلاة، وتختلف بعض التفاصيل بين المذاهب، فتعلّم الصلاة أيضًا على يد معلّم من مذهبك.", learnFatiha: "تعلّم سورة الفاتحة آيةً آية" },
  tr: { sunni: "Sünni", shia: "Şii (Caferî)", rakah: "Rekât", of: "/", play: "Oynat", pause: "Duraklat", prev: "Geri", next: "Sonraki", steps: "Tüm adımlar", aloud: "sesli", silent: "sessiz", qibla: "Kıble", meaning: "Anlam", restart: "Baştan başlayın", note: "Bu eğitim yaygın sırayı gösterir. Ayrıntılar mezhepler arasında farklılık gösterir – namazı ayrıca kendi mezhebinizden bir hocayla da öğrenin.", learnFatiha: "Fâtiha'yı ayet ayet öğrenin" },
  ur: { sunni: "سنی", shia: "شیعہ (جعفری)", rakah: "رکعت", of: "/", play: "چلائیں", pause: "روکیں", prev: "پیچھے", next: "اگلا", steps: "تمام مراحل", aloud: "بلند آواز", silent: "آہستہ", qibla: "قبلہ", meaning: "معنی", restart: "دوبارہ شروع کریں", note: "یہ مشق عام ترتیب دکھاتی ہے۔ تفصیلات مکاتب کے درمیان مختلف ہوتی ہیں – نماز اپنے مکتب کے کسی استاد سے بھی سیکھیں۔", learnFatiha: "سورۂ فاتحہ آیت بہ آیت سیکھیں" },
  fa: { sunni: "اهل سنت", shia: "شیعه (جعفری)", rakah: "رکعت", of: "از", play: "پخش", pause: "توقف", prev: "قبلی", next: "بعدی", steps: "همه گام‌ها", aloud: "بلند", silent: "آهسته", qibla: "قبله", meaning: "معنا", restart: "از نو", note: "این تمرین ترتیب رایج را نشان می‌دهد. جزئیات میان مذاهب فرق می‌کند – نماز را علاوه بر این نزد معلمی از مذهب خودتان نیز بیاموزید.", learnFatiha: "آموختن فاتحه آیه به آیه" },
  ps: { sunni: "سني", shia: "شیعه (جعفري)", rakah: "رکعت", of: "/", play: "غږول", pause: "ودرول", prev: "شاته", next: "بل", steps: "ټول ګامونه", aloud: "په لوړ غږ", silent: "په ټیټ غږ", qibla: "قبله", meaning: "معنا", restart: "له سره پیل", note: "دا تمرین عام ترتیب ښیي. جزئیات د مذهبونو ترمنځ توپیر لري – لمونځ د خپل مذهب له یوه ښوونکي سره هم زده کړئ.", learnFatiha: "الفاتحه آیت په آیت زده کړئ" },
  fr: { sunni: "Sunnite", shia: "Chiite (ja'farite)", rakah: "Rak'a", of: "sur", play: "Lecture", pause: "Pause", prev: "Retour", next: "Suivant", steps: "Toutes les étapes", aloud: "à voix haute", silent: "à voix basse", qibla: "Qibla", meaning: "Sens", restart: "Recommencer", note: "Cet entraînement montre le déroulement courant. Les détails diffèrent d'une école à l'autre – apprenez aussi la prière auprès d'un enseignant de votre école.", learnFatiha: "Apprendre Al-Fatiha verset par verset" },
  es: { sunni: "Suní", shia: "Chií (yafarí)", rakah: "Rak'a", of: "de", play: "Reproducir", pause: "Pausa", prev: "Atrás", next: "Siguiente", steps: "Todos los pasos", aloud: "en voz alta", silent: "en silencio", qibla: "Qibla", meaning: "Significado", restart: "Empezar de nuevo", note: "Este entrenador muestra el desarrollo habitual. Los detalles difieren entre las escuelas; aprenda también la oración con un maestro de su escuela.", learnFatiha: "Aprender Al-Fatiha aleya por aleya" },
  id: { sunni: "Sunni", shia: "Syiah (Ja'fari)", rakah: "Rakaat", of: "dari", play: "Putar", pause: "Jeda", prev: "Kembali", next: "Berikutnya", steps: "Semua langkah", aloud: "keras", silent: "pelan", qibla: "Kiblat", meaning: "Arti", restart: "Mulai dari awal", note: "Latihan ini menunjukkan urutan yang umum. Rinciannya berbeda antarmazhab – pelajari juga shalat bersama guru dari mazhab Anda.", learnFatiha: "Pelajari Al-Fatihah ayat demi ayat" },
  ms: { sunni: "Sunni", shia: "Syiah (Ja'fari)", rakah: "Rakaat", of: "daripada", play: "Main", pause: "Jeda", prev: "Kembali", next: "Seterusnya", steps: "Semua langkah", aloud: "kuat", silent: "perlahan", qibla: "Kiblat", meaning: "Maksud", restart: "Mulakan semula", note: "Latihan ini menunjukkan urutan yang lazim. Perincian berbeza antara mazhab – pelajari juga solat bersama guru daripada mazhab anda.", learnFatiha: "Pelajari Al-Fatihah ayat demi ayat" },
  bn: { sunni: "সুন্নি", shia: "শিয়া (জাফরি)", rakah: "রাকাত", of: "/", play: "চালান", pause: "বিরতি", prev: "পিছনে", next: "পরবর্তী", steps: "সব ধাপ", aloud: "উচ্চস্বরে", silent: "নিচুস্বরে", qibla: "কিবলা", meaning: "অর্থ", restart: "আবার শুরু করুন", note: "এই প্রশিক্ষণ প্রচলিত ধারাক্রম দেখায়। মাযহাবভেদে খুঁটিনাটি ভিন্ন হয় – নামাজ আপনার মাযহাবের একজন শিক্ষকের কাছ থেকেও শিখুন।", learnFatiha: "আল-ফাতিহা আয়াত ধরে ধরে শিখুন" },
  ru: { sunni: "Сунниты", shia: "Шииты (джафариты)", rakah: "Ракаат", of: "из", play: "Воспроизвести", pause: "Пауза", prev: "Назад", next: "Далее", steps: "Все шаги", aloud: "вслух", silent: "про себя", qibla: "Кибла", meaning: "Смысл", restart: "Начать заново", note: "Этот тренажёр показывает общепринятую последовательность. Детали различаются между школами – изучайте намаз также у наставника своей школы.", learnFatiha: "Учить Аль-Фатиху аят за аятом" },
  zh: { sunni: "逊尼派", shia: "什叶派（贾法里）", rakah: "拉克尔提", of: "/", play: "播放", pause: "暂停", prev: "上一步", next: "下一步", steps: "全部步骤", aloud: "出声", silent: "低声", qibla: "基卜拉", meaning: "含义", restart: "重新开始", note: "本训练展示通行的礼拜顺序。各学派的细节有所不同——请再向您所属学派的老师学习礼拜。", learnFatiha: "逐节学习开端章" },
};

// ---------- the figure: a simple side view, drawn from joints so it can move smoothly between postures ----------
type P = [number, number];
type Pose = { head: P; neck: P; shoulder: P; hip: P; knee: P; ankle: P; toe: P; elbow: P; hand: P };
const STAND: Pose = { head: [118, 38], neck: [118, 55], shoulder: [118, 62], hip: [118, 124], knee: [119, 166], ankle: [118, 205], toe: [133, 209], elbow: [117, 94], hand: [117, 124] };
const SIT: Pose = { head: [106, 103], neck: [105, 120], shoulder: [104, 127], hip: [96, 187], knee: [148, 206], ankle: [82, 204], toe: [70, 209], elbow: [116, 158], hand: [140, 185] };
const POSES: Record<Posture, Pose> = {
  stand: STAND,
  sides: STAND,
  takbir: { ...STAND, elbow: [105, 74], hand: [113, 40] },
  folded: { ...STAND, elbow: [106, 98], hand: [126, 95] },
  qunut: { ...STAND, elbow: [111, 92], hand: [138, 72] },
  ruku: { head: [189, 125], neck: [174, 121], shoulder: [167, 122], hip: [112, 124], knee: [114, 166], ankle: [113, 205], toe: [128, 209], elbow: [148, 146], hand: [118, 163] },
  sujud: { head: [173, 197], neck: [160, 193], shoulder: [150, 187], hip: [97, 163], knee: [108, 206], ankle: [66, 203], toe: [57, 209], elbow: [150, 205], hand: [167, 207] },
  sujudTurbah: { head: [173, 194], neck: [160, 191], shoulder: [150, 185], hip: [97, 163], knee: [108, 206], ankle: [66, 203], toe: [57, 209], elbow: [150, 205], hand: [158, 207] },
  sit: SIT,
  tashahhud: SIT,
  salamR: SIT,
  salamL: SIT,
};
const KEYS = Object.keys(STAND) as (keyof Pose)[];
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const o = {} as Pose;
  for (const k of KEYS) o[k] = [a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t];
  return o;
}
function usePoseAnimation(target: Posture) {
  const [pose, setPose] = useState<Pose>(POSES[target]);
  const cur = useRef(pose);
  useEffect(() => {
    const from = cur.current, to = POSES[target];
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { cur.current = to; setPose(to); return; }
    const t0 = performance.now(); let raf = 0;
    const tick = (now: number) => { const t = Math.min(1, (now - t0) / 750); const p = lerpPose(from, to, ease(t)); cur.current = p; setPose(p); if (t < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return pose;
}
// the figure in the painted courtyard: the garden's light, the terrace, the prayer mat and the qibla on the horizon
function Figure({ posture, qibla, label }: { posture: Posture; qibla: string; label: string }) {
  const p = usePoseAnimation(posture);
  const u = useTsId("sl");
  const f = figureParts(p);
  return (
    <svg viewBox="0 -36 240 290" className="h-full w-full" role="img" aria-label={label}>
      <TsDefs u={u} />
      <Courtyard u={u} H={254} G={209} qibla={qibla}>
        <circle cx="118" cy="128" r="100" fill={`url(#${u}aura)`} className="ts-breathe" />
        <Mat u={u} />
        <FigureArt u={u} f={f} finger={posture === "tashahhud"} turbah={posture === "sujudTurbah"} />
        {(posture === "salamR" || posture === "salamL") && (
          <path d={posture === "salamR" ? `M${p.head[0] - 10} ${p.head[1] - 24} q12 -10 24 0 m-4 -5 l4 5 l-6 2` : `M${p.head[0] + 12} ${p.head[1] - 24} q-12 -10 -24 0 m4 -5 l-4 5 l6 2`} stroke={TA.goldHi} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="ts-in" />
        )}
        <Motes />
      </Courtyard>
    </svg>
  );
}

export default function PrayerTrainer() {
  const locale = useLocale();
  const lang = langOf(locale);
  const u = UI[lang];
  const tx = (v?: L2) => (v ? v[lang] ?? v.en : "");
  const [tradition, setTradition] = useState<Tradition>("sunni");
  const [prayer, setPrayer] = useState<(typeof PRAYERS)[number]["id"]>("fajr");
  const steps = useMemo(() => buildPrayer(prayer, tradition), [prayer, tradition]);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const [list, setList] = useState(false);
  useEffect(() => { setI(0); setAuto(false); }, [prayer, tradition]);
  const step = steps[Math.min(i, steps.length - 1)]; // i still points past the end for one render after switching to a shorter prayer
  const rakat = PRAYERS.find((p) => p.id === prayer)!.rakat;
  useEffect(() => {
    if (!auto) return;
    if (i >= steps.length - 1) { setAuto(false); return; }
    const ms = Math.min(14000, 3500 + (step.translit?.length ?? 0) * 45);
    const id = setTimeout(() => setI((n) => n + 1), ms);
    return () => clearTimeout(id);
  }, [auto, i, steps.length, step]);
  const last = i >= steps.length - 1;

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#04201a] text-[#eef0f3] shadow-[0_40px_80px_-50px_rgba(4,30,22,.9)] ring-1 ring-[rgb(214_180_108)]/25">
      <style>{TS_CSS}</style>
      <div className="relative grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* the picture, with the glass controls floating over its sky and terrace */}
        <div className="relative aspect-[240/290] w-full bg-[#041d16]">
          <div className="absolute inset-0"><Figure posture={step.posture} qibla={u.qibla} label={tx(step.title)} /></div>
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
            <div role="tablist" className="tg-glass tg-dark flex rounded-full p-1">
              {(["sunni", "shia"] as const).map((t) => (
                <button key={t} role="tab" aria-selected={tradition === t} onClick={() => setTradition(t)}
                  className={`tg-btn min-h-9 rounded-full px-3.5 text-[13px] font-semibold sm:px-4 ${tradition === t ? "tg-lens" : "text-white/85"}`}>{u[t]}</button>
              ))}
            </div>
            <div className="tg-glass tg-dark flex shrink-0 flex-col items-center gap-1 rounded-[18px] px-3 py-2">
              <span className="text-[11px] font-bold text-[#f3e2b6]">{u.rakah} {Math.min(step.rakah, rakat)} {u.of} {rakat}</span>
              <span className="flex gap-1" aria-hidden>{Array.from({ length: rakat }, (_, k) => (
                <svg key={k} viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d={starPath(12, 12, 11, 5.2)} fill={k + 1 < step.rakah ? "#d6b46c" : k + 1 === step.rakah ? "#fff" : "rgb(255 255 255 / .2)"} stroke={k + 1 === step.rakah ? "#d6b46c" : "none"} strokeWidth="1" /></svg>
              ))}</span>
            </div>
          </div>
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
            <div className="tg-glass tg-dark tg-scroll flex gap-1 overflow-x-auto rounded-full p-1">
              {PRAYERS.map((p) => (
                <button key={p.id} aria-pressed={prayer === p.id} onClick={() => setPrayer(p.id)}
                  className={`tg-btn min-h-9 shrink-0 grow rounded-full px-3 text-[13px] font-semibold ${prayer === p.id ? "tg-lens" : "text-white/85"}`}>{tx(p.name)} <span className="opacity-60">{p.rakat}</span></button>
              ))}
            </div>
          </div>
        </div>

        {/* the words of the step, then the controls: they stay at the bottom of the screen while the trainer is in view */}
        <div className="relative flex min-h-[460px] flex-col bg-[radial-gradient(120%_80%_at_0%_0%,rgba(47,125,102,.28),transparent_60%)] p-5 sm:p-7">
          <div key={`${prayer}-${tradition}-${i}`} className="step-in">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal"><PracticeStar size={10} /><span dir="ltr">{i + 1} / {steps.length}</span>{step.aloud !== undefined && step.ar ? ` · ${step.aloud ? u.aloud : u.silent}` : ""}</p>
            <h3 className="font-display mt-2 text-3xl leading-tight">{tx(step.title)}</h3>
            {step.ar && <p className="font-arabic tg-glass mt-5 rounded-[22px] px-4 py-3 text-[26px] leading-[2] text-[#fbf3dc] sm:text-[30px]" dir="rtl">{step.ar}</p>}
            {step.translit && lang !== "ar" && <p className="mt-3 text-[15px] italic leading-relaxed text-[rgb(var(--gold))]"><span dir="ltr">{step.translit}</span></p>}
            {/* a summary in own words (of a hadith or a verse) is labelled as such, never as the meaning of the wording */}
            {step.meaning && lang !== "ar" && <p className="mt-3 text-[15px] leading-relaxed text-white/80"><span className="font-semibold text-white">{step.essence ? tx(ESSENCE) : u.meaning}: </span>{tx(step.meaning)}</p>}
            {step.note && <p className="tg-glass mt-4 rounded-[18px] p-3.5 text-sm leading-relaxed text-white/80">{tx(step.note)}</p>}
          </div>
          <div className="sticky bottom-4 z-[2] mt-auto pt-6">
            <div className="tg-glass tg-dark rounded-[30px] p-2">
              <div className="mx-3 mb-2 mt-1 h-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1}>
                <div className="h-full rounded-full bg-gradient-to-r from-[#c6a65e] to-[#f2dfaa] transition-all duration-500 rtl:bg-gradient-to-l" style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setAuto(false); setI((n) => Math.max(0, n - 1)); }} disabled={i === 0} aria-label={u.prev} title={u.prev} className="tg-btn tg-glass grid h-12 w-12 shrink-0 place-items-center rounded-full text-white"><Glyph name="prev" /></button>
                <button onClick={() => (last ? (setI(0), setAuto(true)) : setAuto((a) => !a))} className="tg-btn tg-lens inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold"><Glyph name={last ? "restart" : auto ? "pause" : "play"} className="h-4 w-4" />{last ? u.restart : auto ? u.pause : u.play}</button>
                <button onClick={() => { setAuto(false); setI((n) => Math.min(steps.length - 1, n + 1)); }} disabled={last} aria-label={u.next} title={u.next} className="tg-btn tg-glass grid h-12 w-12 shrink-0 place-items-center rounded-full text-white"><Glyph name="next" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 p-4 sm:p-5">
        <button onClick={() => setList((v) => !v)} aria-expanded={list} className="tg-btn tg-glass inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white/85"><Glyph name="chevron" className={`h-3.5 w-3.5 transition ${list ? "rotate-90 rtl:-rotate-90" : ""}`} />{u.steps}</button>
        {list && (
          <ol className="tg-glass mt-3 grid gap-1 rounded-[22px] p-2 text-sm sm:grid-cols-2">
            {steps.map((s, k) => <li key={k}><button onClick={() => { setAuto(false); setI(k); }} className={`tg-btn min-h-10 w-full rounded-[14px] px-3 py-1.5 text-start ${k === i ? "bg-[rgb(214_180_108)]/20 font-bold text-white" : "text-white/75 hover:bg-white/5"}`}>{k + 1}. {tx(s.title)} <span className="text-white/40">· {u.rakah} {Math.min(s.rakah, rakat)}</span></button></li>)}
          </ol>
        )}
        <p className="mt-4 text-xs leading-relaxed text-white/55">{u.note} <Link href="/surah/1?shams=1" className="font-semibold text-[rgb(var(--gold))] underline-offset-2 hover:underline">{u.learnFatiha} <ArrowNext /></Link></p>
      </div>
    </div>
  );
}
