// The tutor's "next level" (website and app; the app has an identical copy in mobile/src/features/tutor/next.ts –
// keep both in step): voice (on-device speech only), the recitation coach, the daily check-in, the learner's confirmed
// memory and the follow-up chips into the app. Pure data and functions, no imports.
//
// Rules: Quran text is never synthesised (speakable() drops Arabic script outside an Arabic answer and every vowelled
// word inside one; verses play from the reciter audio). The coach and the check-in use only the learner's own figures,
// computed on the device – nothing is estimated. German in the polite Sie form.

// ---------------------------------------------------------------- voice
/** BCP-47 voice per app language (on-device text-to-speech and recognition) */
export const VOICE_LANG: Record<string, string> = {
  en: "en-US", de: "de-DE", ar: "ar-SA", tr: "tr-TR", ur: "ur-PK", fa: "fa-IR", ps: "ps-AF", fr: "fr-FR", es: "es-ES",
  id: "id-ID", ms: "ms-MY", bn: "bn-BD", ru: "ru-RU", zh: "zh-CN",
};
export const voiceLang = (lang: string) => VOICE_LANG[lang] ?? "en-US";

const ARABIC_WORD = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
/** Quranic vowel and recitation marks: a word carrying them is never spoken by the synthetic voice */
const QURAN_MARKS = /[ً-ْٰۖ-ۭ࣓-ࣿ]/;

/** the answer as plain text for on-device TTS: no Markdown, no source markers, no links, never Quran text */
export function speakable(md: string, lang: string): string {
  let s = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[(\d{1,2}|S\d{1,2})\]/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/[*_`>~|]/g, "")
    .replace(/ﷺ/g, lang === "ar" ? "صلى الله عليه وسلم" : "")
    .replace(/\(as\)/g, "");
  s = s.split(/(\s+)/).filter((w) => {
    if (!ARABIC_WORD.test(w)) return true;
    // in an Arabic answer plain words stay; anything vowelled (a possible verse) goes. In other languages no Arabic script.
    return lang === "ar" && !QURAN_MARKS.test(w);
  }).join("");
  return s.replace(/\s+([,.;:!?،؟])/g, "$1").replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim().slice(0, 3800);
}

// ---------------------------------------------------------------- recitation coach and daily check-in
export type CoachSpot = { key: string; words: number[]; reason: string[] };
export type CoachInput = {
  spots: CoachSpot[];
  mutDue: { id: string; keys: string[] }[];
  makhraj: Record<string, { ok: number; miss: number; self?: number }>;
  weakestDim?: string | null;
  weakestPct?: number | null;
  todayNew: number;
  todayReview: number;
  testsDue: number;
  learnedToday: boolean;
  known: number;
};
export type CoachKind = "word" | "link" | "phrase" | "makhraj" | "mut" | "review" | "new" | "test";
export type CoachStep = { kind: CoachKind; minutes: number; href: string; ref?: string; letter?: string };

const isKey = (k: string) => /^\d{1,3}:\d{1,3}$/.test(k);
const drill = (key: string, mode: "word" | "phrase" | "link", words: number[] = []) => {
  const [s, v] = key.split(":");
  return `/shams/drill?s=${s}&v=${v}${words.length ? `&w=${words.slice(0, 12).join(",")}` : ""}&mode=${mode}`;
};

/** letters whose own rating is low (1–2) or whose listening quiz was missed more often than right (at least twice) */
export function weakLetters(mk: CoachInput["makhraj"], max = 3): string[] {
  return Object.entries(mk ?? {})
    .map(([l, x]) => ({ l, score: (typeof x.self === "number" && x.self <= 2 ? 3 - x.self : 0) + (x.miss >= 2 && x.miss > x.ok ? x.miss - x.ok : 0) }))
    .filter((x) => x.score > 0 && x.l.trim().length > 0 && x.l.length <= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.l);
}

/** a concrete 10-minute plan from the learner's own weak spots, letters and similar verses; every step links a drill */
export function practicePlan(i: CoachInput, total = 10): CoachStep[] {
  const out: CoachStep[] = [];
  let left = total;
  const add = (s: CoachStep) => { if (left <= 0) return; const m = Math.max(1, Math.min(s.minutes, left)); out.push({ ...s, minutes: m }); left -= m; };
  const spots = (i.spots ?? []).filter((s) => isKey(s.key));
  const words = spots.find((s) => s.words.length);
  if (words) add({ kind: "word", minutes: 3, ref: words.key, href: drill(words.key, "word", words.words) });
  const link = spots.find((s) => s.reason.includes("transition") && s !== words);
  if (link) add({ kind: "link", minutes: 2, ref: link.key, href: drill(link.key, "link") });
  const slip = spots.find((s) => s !== words && s !== link && (s.reason.includes("lapses") || s.reason.includes("fading")));
  if (slip) add({ kind: "phrase", minutes: 2, ref: slip.key, href: drill(slip.key, "phrase") });
  const letter = weakLetters(i.makhraj, 1)[0];
  if (letter) add({ kind: "makhraj", minutes: 2, letter, href: `/shams/makhraj?l=${encodeURIComponent(letter)}` });
  const mut = (i.mutDue ?? []).find((g) => g.keys.some(isKey));
  if (mut) add({ kind: "mut", minutes: 2, ref: mut.keys.filter(isKey).slice(0, 2).join(" / "), href: `/shams/mutashabihat?g=${encodeURIComponent(mut.id)}` });
  if (i.testsDue > 0 && left >= 3 && !out.length) add({ kind: "test", minutes: 4, href: "/shams/darajat" });
  if (i.todayReview > 0) add({ kind: "review", minutes: left, href: "/shams/wird" });
  else if (i.todayNew > 0) add({ kind: "new", minutes: left, href: "/shams/wird" });
  else if (left > 0 && out.length) out[out.length - 1].minutes += left;
  return out;
}

export type CheckIn = { kind: "test" | "weak" | "review" | "new" | "done" | "start"; n?: number; ref?: string; href: string };
/** one short message for today: what to review and why – only from the learner's own figures */
export function dailyCheckIn(i: CoachInput): CheckIn {
  if (i.known <= 0 && !i.todayReview) return { kind: "start", href: "/shams/welcome" };
  if (i.testsDue > 0) return { kind: "test", n: i.testsDue, href: "/shams/darajat" };
  const spot = (i.spots ?? []).find((s) => isKey(s.key));
  if (spot && !i.learnedToday) return { kind: "weak", ref: spot.key, href: spot.words.length ? drill(spot.key, "word", spot.words) : drill(spot.key, "phrase") };
  if (i.todayReview > 0 && !i.learnedToday) return { kind: "review", n: i.todayReview, href: "/shams/wird" };
  if (i.todayNew > 0 && !i.learnedToday) return { kind: "new", n: i.todayNew, href: "/shams/wird" };
  if (i.learnedToday) return { kind: "done", href: "/shams/wird" };
  return { kind: "review", n: i.todayReview, href: "/shams/wird" };
}

const REASON: Record<string, string> = { lapses: "slipped in review", fading: "recall fading", words: "missed words", mutashabih: "confused with a similar verse", transition: "transition stalls" };
/** the coach's facts for the tutor (whitelisted learner fields, see lib/tutor/learner.ts) */
export function coachFacts(i: CoachInput): Record<string, string | number> {
  const spots = (i.spots ?? []).filter((s) => isKey(s.key)).slice(0, 4);
  const out: Record<string, string | number> = {};
  if (spots.length) out.weakSpots = spots.map((s) => `${s.key} (${s.reason.map((r) => REASON[r] ?? r).join(", ")}${s.words.length ? `, words ${s.words.slice(0, 4).join(" ")}` : ""})`).join(" / ").slice(0, 240);
  const l = weakLetters(i.makhraj);
  if (l.length) out.weakLetters = l.join(" ");
  if (i.mutDue?.length) out.mutDue = i.mutDue.length;
  const plan = practicePlan(i);
  if (plan.length) out.practicePlan = plan.map((p) => `${p.minutes} min ${p.kind}${p.ref ? ` ${p.ref}` : ""}${p.letter ? ` ${p.letter}` : ""}`).join(" / ").slice(0, 240);
  return out;
}

// ---------------------------------------------------------------- memory (only what the learner confirms)
export type MemoryItem = { id: string; text: string; at: number };
export type MemoryState = { items: MemoryItem[]; use: boolean; sync: boolean };
export const MEMORY_KEY = "qmc.tutor.memory.v1";
/** the synced copy: written only while the learner allows syncing, emptied when they stop */
export const MEMORY_SYNC_KEY = "qmc.tutor.memory.sync.v1";
export const MEMORY_MAX = 8;
export const EMPTY_MEMORY: MemoryState = { items: [], use: true, sync: false };

/** a memory text without contact data, links or line breaks; null when too short */
export function cleanMemoryText(s: string): string | null {
  const t = String(s ?? "")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "")
    .replace(/https?:\/\/\S+|www\.\S+/g, "")
    .replace(/\+?\d[\d\s/().-]{7,}\d/g, "")
    .replace(/[\n\r\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 120);
  return t.length >= 3 ? t : null;
}
export function addMemory(m: MemoryState, text: string, now = Date.now()): MemoryState {
  const t = cleanMemoryText(text);
  if (!t || m.items.some((x) => x.text.toLowerCase() === t.toLowerCase())) return m;
  return { ...m, items: [...m.items, { id: `${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`, text: t, at: now }].slice(-MEMORY_MAX) };
}
export const removeMemory = (m: MemoryState, id: string): MemoryState => ({ ...m, items: m.items.filter((x) => x.id !== id) });
/** what goes to the tutor with a question: only when the learner allows it */
export const memoryForServer = (m: MemoryState | null | undefined): string[] => (m?.use ? m.items.map((x) => x.text).slice(0, MEMORY_MAX) : []);

const GOAL = /^\s*(ziel|mein ziel|goal|my goal|hedef|amacım|objectif|mon objectif|objetivo|mi objetivo|tujuan|matlamat|цель|моя цель|目标|我的目标|هدفي|هدف|مقصد|میرا مقصد|لक्ष्य|লক্ষ্য|زما موخه|موخه)\s*(is|ist|est|es|adalah|ialah|—|–|-)?\s*[:：]?\s*(.{3,110})$/i;
/** a goal the learner wrote ("Ziel: Juz Amma bis Ramadan") – offered to remember, never saved without a tap */
export function goalIn(question: string): string | null {
  const m = GOAL.exec(String(question ?? "").trim());
  return m ? cleanMemoryText(m[0]) : null;
}

// ---------------------------------------------------------------- places the tutor found ("öffne …"), shown as gold cards
export type OpenPlace = { title: string; desc: string; link: string; appOnly: boolean };
/** ms the found place stays visible before it opens on its own (one confident match after "öffne") */
export const AUTO_OPEN_MS = 1400;
export const OPEN_LABEL: Record<string, string> = { en: "Open", de: "Öffnen", ar: "فتح", tr: "Aç", ur: "کھولیں", fa: "باز کردن", ps: "پرانیزئ", fr: "Ouvrir", es: "Abrir", id: "Buka", ms: "Buka", bn: "খুলুন", ru: "Открыть", zh: "打开" };
export const APP_ONLY: Record<string, string> = { en: "In the app", de: "In der App", ar: "في التطبيق", tr: "Uygulamada", ur: "ایپ میں", fa: "در برنامه", ps: "په اپ کې", fr: "Dans l'application", es: "En la aplicación", id: "Di aplikasi", ms: "Dalam aplikasi", bn: "অ্যাপে", ru: "В приложении", zh: "在应用中" };

// ---------------------------------------------------------------- follow-up chips into the app
export type Chip = { label: string; href: string };
type CiteLike = { title: string; link: string; kind: string };
/** up to three chips that open the pages behind an answer (one per page), labelled by what the page is */
export function appChips(cites: CiteLike[], t: NextUi): Chip[] {
  const seen = new Set<string>();
  const out: Chip[] = [];
  for (const c of cites ?? []) {
    if (!c.link || !c.link.startsWith("/") || seen.has(c.link)) continue;
    seen.add(c.link);
    const verb = t.chips[c.kind as keyof NextUi["chips"]] ?? t.open;
    const short = c.title.split(" – ")[0].split(" · ").slice(-1)[0].slice(0, 32);
    out.push({ label: `${verb}: ${short}`, href: c.link });
    if (out.length >= 3) break;
  }
  return out;
}

// ---------------------------------------------------------------- the "Ask the tutor" bubble on learning screens
export type ScreenContext = { kind: "lesson" | "shams" | "verse" | "carousel" | "tajweed" | "guide" | "general"; id?: string; lesson?: string; verse?: string; title?: string };
/** learning screens where the bubble shows (path without locale) */
const LEARNING = /^\/(shams|courses|tajweed|arabic|qaida|surah|quran|carousels|salah|wudu|islam|sisters|guides|vocab|reciter-path|academy|school|names|tests|cards)(\/|$)/;
export const BUBBLE_KEY = "qmc.tutor.bubble.v1";
/** the setting that shows or hides the bubble (14 languages, Sie form) */
export const BUBBLE_SETTING: Record<string, string> = {
  en: "Show the tutor button on learning screens", de: "Tutor-Knopf auf Lernseiten anzeigen", ar: "إظهار زر المعلّم في صفحات التعلّم",
  tr: "Öğrenme ekranlarında öğretmen düğmesini göster", ur: "سیکھنے کی اسکرینوں پر ٹیوٹر بٹن دکھائیں", fa: "نمایش دکمهٔ معلم در صفحه‌های یادگیری",
  ps: "د زده‌کړې په پاڼو کې د ښوونکي تڼۍ وښایاست", fr: "Afficher le bouton du tuteur sur les écrans d'apprentissage", es: "Mostrar el botón del tutor en las pantallas de aprendizaje",
  id: "Tampilkan tombol tutor di layar belajar", ms: "Tunjukkan butang tutor pada skrin pembelajaran", bn: "শেখার পাতায় টিউটর বোতাম দেখান",
  ru: "Показывать кнопку наставника на учебных экранах", zh: "在学习页面显示导师按钮",
};
export const bubbleSetting = (lang: string) => BUBBLE_SETTING[lang] ?? BUBBLE_SETTING.en;
/** the tutor context a learning screen pre-fills (screen, surah:ayah, course and lesson id); null on other screens */
export function screenContext(path: string, q: Record<string, string | undefined> = {}): ScreenContext | null {
  const p = ("/" + String(path ?? "").split("?")[0].replace(/^\/+/, "")).replace(/^\/(en|de|ar|tr|ur|fa|ps|fr|es|id|ms|bn|ru|zh)(?=\/|$)/, "") || "/";
  if (!LEARNING.test(p)) return null;
  const seg = p.split("/").filter(Boolean).map((x) => { try { return decodeURIComponent(x); } catch { return x; } }).map((x) => x.replace(/[^\w:-]/g, "").slice(0, 80));
  const num = (x?: string) => (x && /^\d{1,3}$/.test(x) ? x : undefined);
  const verseOf = (s?: string, v?: string) => (num(s) && num(v) ? `${Number(s)}:${Number(v)}` : undefined);
  const title = seg.join(" · ");
  if (seg[0] === "surah") { const verse = verseOf(seg[1], q.v); return verse ? { kind: "verse", verse, title: verse } : { kind: "general", title }; }
  if (seg[0] === "courses" && seg[1]) return { kind: "lesson", id: seg[1], lesson: seg[2], title };
  if (seg[0] === "tajweed" && seg[1] && seg[1] !== "practice") return { kind: "tajweed", id: seg[1], title };
  if (seg[0] === "carousels" && seg[1]) return { kind: "carousel", id: seg[1], title };
  if (seg[0] === "guides" && seg[1]) return { kind: "guide", id: seg[1], title };
  if (seg[0] === "shams") { const verse = verseOf(q.s ?? (num(seg[1]) ? seg[1] : undefined), q.v); return verse ? { kind: "shams", title, verse } : { kind: "shams", title }; }
  return { kind: "general", title };
}

// ---------------------------------------------------------------- texts (14 languages)
export type NextUi = {
  listen: string; stop: string; speakAsk: string; listening: string; voiceOff: string; voiceNote: string; playVerse: string;
  typing: [string, string, string];
  coachTitle: string; coachLead: string; planTitle: string; coachAsk: string; coachAskBtn: string; min: string;
  steps: Record<CoachKind, string>;
  checkTitle: string; check: Record<CheckIn["kind"], string>; open: string; dismiss: string; fromData: string;
  memTitle: string; memLead: string; memEmpty: string; memAdd: string; memPh: string; memDelete: string; memDeleteAll: string; memUse: string; memSync: string; memSuggest: string; memSave: string;
  chips: { course: string; tajweed: string; handbook: string; glossary: string; islam: string; adab: string; sisters: string; carousel: string; guide: string; tafsir: string; progress: string };
};

const en: NextUi = {
  listen: "Listen", stop: "Stop", speakAsk: "Ask by voice", listening: "Listening – please speak now …",
  voiceOff: "Voice input needs speech recognition on this device, which is not available here.",
  voiceNote: "Your voice is recognised on this device only. The AI answer is read by your device's voice; Quran is never read by it – verses play from the reciter.",
  playVerse: "Listen to the reciter",
  typing: ["{name} is reading the lessons …", "{name} is checking the sources …", "{name} is writing the answer …"],
  coachTitle: "Your recitation coach", coachLead: "From your own practice – nothing is guessed.", planTitle: "Your 10-minute plan",
  coachAsk: "Please explain my weak spots in recitation and how I can practise them today.", coachAskBtn: "Ask {name} about my weak spots", min: "{n} min",
  steps: { word: "Repeat the missed words of {ref}", link: "Practise the transition into {ref}", phrase: "Strengthen {ref} phrase by phrase", makhraj: "Articulation of the letter {letter}", mut: "Tell similar verses apart ({ref})", review: "Today's review", new: "Today's new verses", test: "Your due test" },
  checkTitle: "Today's check-in",
  check: {
    test: "A test is due – it shows what has really settled. Begin with it today.",
    weak: "Verse {ref} slipped several times. Review it first today, while it is fresh.",
    review: "{n} verses are due for review today – review keeps what you have learned.",
    new: "Your review is up to date. {n} new verses are waiting today.",
    done: "You have learned today, MashaAllah. A short review before sleep strengthens it.",
    start: "Begin with the Shams Method: one verse a day is a strong start.",
  },
  open: "Open", dismiss: "Hide for today", fromData: "From your own data",
  memTitle: "What {name} remembers", memLead: "Only what you confirm. Kept on this device; synced with your account only if you allow it.",
  memEmpty: "Nothing saved yet.", memAdd: "Add", memPh: "e.g. Goal: Juz Amma by Ramadan", memDelete: "Delete", memDeleteAll: "Delete all",
  memUse: "Use in answers (sent with your questions to OpenAI)", memSync: "Sync with my account", memSuggest: "Shall {name} remember this goal?", memSave: "Remember",
  chips: { course: "Open lesson", tajweed: "Practise tajweed", handbook: "Shams Method", glossary: "Glossary", islam: "Read chapter", adab: "Adab of the reciter", sisters: "For sisters", carousel: "Open", guide: "Open guide", tafsir: "Read verse", progress: "My statistics" },
};

const de: NextUi = {
  listen: "Vorlesen", stop: "Stopp", speakAsk: "Per Sprache fragen", listening: "Ich höre zu – bitte sprechen Sie jetzt …",
  voiceOff: "Die Spracheingabe braucht eine Spracherkennung auf diesem Gerät, die hier nicht verfügbar ist.",
  voiceNote: "Ihre Stimme wird nur auf diesem Gerät erkannt. Die KI-Antwort liest die Gerätestimme vor; den Koran liest sie nie – Verse erklingen vom Rezitator.",
  playVerse: "Vom Rezitator hören",
  typing: ["{name} liest in den Lektionen …", "{name} prüft die Quellen …", "{name} schreibt die Antwort …"],
  coachTitle: "Ihr Rezitations-Coach", coachLead: "Aus Ihrem eigenen Üben – nichts ist geschätzt.", planTitle: "Ihr 10-Minuten-Plan",
  coachAsk: "Bitte erklären Sie mir meine Schwachstellen beim Rezitieren und wie ich sie heute üben kann.", coachAskBtn: "{name} zu meinen Schwachstellen fragen", min: "{n} Min.",
  steps: { word: "Die verfehlten Wörter von {ref} wiederholen", link: "Den Übergang in {ref} üben", phrase: "{ref} Abschnitt für Abschnitt festigen", makhraj: "Aussprache des Buchstabens {letter}", mut: "Ähnliche Verse unterscheiden ({ref})", review: "Heutige Wiederholung", new: "Heutige neue Verse", test: "Ihre fällige Prüfung" },
  checkTitle: "Ihr Tages-Check-in",
  check: {
    test: "Eine Prüfung ist fällig – sie zeigt, was wirklich sitzt. Beginnen Sie heute damit.",
    weak: "Vers {ref} ist mehrmals ins Rutschen gekommen. Wiederholen Sie ihn heute zuerst, solange er frisch ist.",
    review: "Heute sind {n} Verse zur Wiederholung fällig – die Wiederholung bewahrt, was Sie gelernt haben.",
    new: "Ihre Wiederholung ist aktuell. Heute warten {n} neue Verse.",
    done: "Sie haben heute gelernt, MashaAllah. Eine kurze Wiederholung vor dem Schlafen festigt es.",
    start: "Beginnen Sie mit der Shams-Methode: ein Vers am Tag ist ein starker Anfang.",
  },
  open: "Öffnen", dismiss: "Für heute ausblenden", fromData: "Aus Ihren eigenen Daten",
  memTitle: "Was {name} sich merkt", memLead: "Nur, was Sie bestätigen. Auf diesem Gerät gespeichert; mit Ihrem Konto nur synchronisiert, wenn Sie es erlauben.",
  memEmpty: "Noch nichts gespeichert.", memAdd: "Hinzufügen", memPh: "z. B. Ziel: Juz Amma bis Ramadan", memDelete: "Löschen", memDeleteAll: "Alles löschen",
  memUse: "In Antworten berücksichtigen (wird mit Ihren Fragen an OpenAI gesendet)", memSync: "Mit meinem Konto synchronisieren", memSuggest: "Soll {name} sich dieses Ziel merken?", memSave: "Merken",
  chips: { course: "Lektion öffnen", tajweed: "Tajwid üben", handbook: "Shams-Methode", glossary: "Glossar", islam: "Kapitel lesen", adab: "Adab des Rezitators", sisters: "Für Schwestern", carousel: "Öffnen", guide: "Ratgeber öffnen", tafsir: "Vers lesen", progress: "Meine Statistik" },
};

const ar: NextUi = {
  listen: "استمع", stop: "إيقاف", speakAsk: "اسأل بالصوت", listening: "أستمع – تفضّل بالكلام الآن …",
  voiceOff: "يحتاج الإدخال الصوتي إلى التعرّف على الكلام على هذا الجهاز، وهو غير متاح هنا.",
  voiceNote: "يُتعرَّف على صوتك على هذا الجهاز فقط. يقرأ صوتُ الجهاز إجابةَ الذكاء الاصطناعي، ولا يقرأ القرآن أبدًا – الآيات تُسمع من القارئ.",
  playVerse: "استمع إلى القارئ",
  typing: ["{name} يقرأ في الدروس …", "{name} يتحقق من المصادر …", "{name} يكتب الإجابة …"],
  coachTitle: "مدرّب التلاوة", coachLead: "من تدريبك أنت – لا شيء مُقدَّر.", planTitle: "خطتك لعشر دقائق",
  coachAsk: "من فضلك اشرح لي مواضع ضعفي في التلاوة وكيف أتدرّب عليها اليوم.", coachAskBtn: "اسأل {name} عن مواضع ضعفي", min: "{n} د",
  steps: { word: "كرّر الكلمات التي أخطأت فيها في {ref}", link: "تدرّب على الانتقال إلى {ref}", phrase: "ثبّت {ref} مقطعًا مقطعًا", makhraj: "مخرج حرف {letter}", mut: "ميّز بين الآيات المتشابهة ({ref})", review: "مراجعة اليوم", new: "آيات اليوم الجديدة", test: "اختبارك المستحق" },
  checkTitle: "متابعة اليوم",
  check: {
    test: "حان موعد اختبار – يُظهر ما ثبت حقًّا. ابدأ به اليوم.",
    weak: "تعثّرت الآية {ref} عدة مرات. راجعها أولًا اليوم ما دامت حاضرة.",
    review: "{n} آيات مستحقة للمراجعة اليوم – المراجعة تحفظ ما تعلّمته.",
    new: "مراجعتك محدَّثة. {n} آيات جديدة تنتظرك اليوم.",
    done: "تعلّمت اليوم، ما شاء الله. مراجعة قصيرة قبل النوم تثبّته.",
    start: "ابدأ بمنهج شمس: آية واحدة في اليوم بداية قوية.",
  },
  open: "فتح", dismiss: "إخفاء لليوم", fromData: "من بياناتك أنت",
  memTitle: "ما يتذكّره {name}", memLead: "ما تؤكّده أنت فقط. يُحفظ على هذا الجهاز، ولا يُزامَن مع حسابك إلا بإذنك.",
  memEmpty: "لا شيء محفوظ بعد.", memAdd: "إضافة", memPh: "مثال: هدفي: جزء عمّ قبل رمضان", memDelete: "حذف", memDeleteAll: "حذف الكل",
  memUse: "استخدامه في الإجابات (يُرسَل مع أسئلتك إلى OpenAI)", memSync: "المزامنة مع حسابي", memSuggest: "هل يتذكّر {name} هذا الهدف؟", memSave: "تذكَّر",
  chips: { course: "فتح الدرس", tajweed: "تدرّب على التجويد", handbook: "منهج شمس", glossary: "المصطلحات", islam: "قراءة الفصل", adab: "آداب حامل القرآن", sisters: "للأخوات", carousel: "فتح", guide: "فتح الدليل", tafsir: "قراءة الآية", progress: "إحصاءاتي" },
};

const tr: NextUi = {
  listen: "Sesli oku", stop: "Durdur", speakAsk: "Sesle sorun", listening: "Dinliyorum – lütfen şimdi konuşun …",
  voiceOff: "Sesli giriş bu cihazda konuşma tanıma gerektirir; burada mevcut değil.",
  voiceNote: "Sesiniz yalnızca bu cihazda tanınır. Yapay zekâ cevabını cihazın sesi okur; Kur'an'ı asla okumaz – ayetler kâriden dinlenir.",
  playVerse: "Kâriden dinleyin",
  typing: ["{name} derslere bakıyor …", "{name} kaynakları kontrol ediyor …", "{name} cevabı yazıyor …"],
  coachTitle: "Tilavet koçunuz", coachLead: "Kendi çalışmanızdan – hiçbir şey tahmin edilmez.", planTitle: "10 dakikalık planınız",
  coachAsk: "Lütfen tilavetteki zayıf noktalarımı ve bugün nasıl çalışabileceğimi açıklayın.", coachAskBtn: "{name}'a zayıf noktalarımı sorun", min: "{n} dk",
  steps: { word: "{ref} ayetinde kaçırılan kelimeleri tekrarlayın", link: "{ref} ayetine geçişi çalışın", phrase: "{ref} ayetini bölüm bölüm pekiştirin", makhraj: "{letter} harfinin mahreci", mut: "Benzer ayetleri ayırt edin ({ref})", review: "Bugünkü tekrar", new: "Bugünkü yeni ayetler", test: "Vadesi gelen sınavınız" },
  checkTitle: "Bugünkü durum",
  check: {
    test: "Bir sınavın vakti geldi – gerçekten neyin oturduğunu gösterir. Bugün onunla başlayın.",
    weak: "{ref} ayeti birkaç kez kaydı. Bugün taze iken önce onu tekrarlayın.",
    review: "Bugün {n} ayetin tekrarı var – tekrar, öğrendiklerinizi korur.",
    new: "Tekrarınız güncel. Bugün {n} yeni ayet bekliyor.",
    done: "Bugün öğrendiniz, MaşaAllah. Uyumadan önce kısa bir tekrar bunu pekiştirir.",
    start: "Şems Metodu ile başlayın: günde bir ayet güçlü bir başlangıçtır.",
  },
  open: "Aç", dismiss: "Bugünlük gizle", fromData: "Kendi verilerinizden",
  memTitle: "{name} neyi hatırlıyor", memLead: "Yalnızca onayladıklarınız. Bu cihazda saklanır; yalnızca izin verirseniz hesabınızla eşitlenir.",
  memEmpty: "Henüz bir şey kaydedilmedi.", memAdd: "Ekle", memPh: "ör. Hedef: Ramazan'a kadar Amme cüzü", memDelete: "Sil", memDeleteAll: "Tümünü sil",
  memUse: "Cevaplarda kullan (sorularınızla birlikte OpenAI'ye gönderilir)", memSync: "Hesabımla eşitle", memSuggest: "{name} bu hedefi hatırlasın mı?", memSave: "Hatırla",
  chips: { course: "Dersi aç", tajweed: "Tecvit çalış", handbook: "Şems Metodu", glossary: "Sözlük", islam: "Bölümü oku", adab: "Kâri adabı", sisters: "Kız kardeşler için", carousel: "Aç", guide: "Rehberi aç", tafsir: "Ayeti oku", progress: "İstatistiklerim" },
};

const ur: NextUi = {
  listen: "سنیں", stop: "روکیں", speakAsk: "آواز سے پوچھیں", listening: "سن رہا ہوں – براہِ کرم اب بولیں …",
  voiceOff: "آواز سے سوال کے لیے اس آلے پر تقریر کی شناخت درکار ہے، جو یہاں دستیاب نہیں۔",
  voiceNote: "آپ کی آواز صرف اسی آلے پر پہچانی جاتی ہے۔ AI کا جواب آلے کی آواز پڑھتی ہے؛ قرآن وہ کبھی نہیں پڑھتی – آیات قاری سے سنائی جاتی ہیں۔",
  playVerse: "قاری سے سنیں",
  typing: ["{name} اسباق دیکھ رہے ہیں …", "{name} ماخذ جانچ رہے ہیں …", "{name} جواب لکھ رہے ہیں …"],
  coachTitle: "آپ کا تلاوت کوچ", coachLead: "آپ کی اپنی مشق سے – کچھ بھی اندازہ نہیں۔", planTitle: "آپ کا 10 منٹ کا منصوبہ",
  coachAsk: "براہِ کرم تلاوت میں میری کمزوریاں اور آج ان کی مشق کا طریقہ سمجھائیں۔", coachAskBtn: "{name} سے میری کمزوریوں کے بارے میں پوچھیں", min: "{n} منٹ",
  steps: { word: "{ref} کے چھوٹے ہوئے الفاظ دہرائیں", link: "{ref} میں منتقلی کی مشق کریں", phrase: "{ref} کو حصہ حصہ پختہ کریں", makhraj: "حرف {letter} کا مخرج", mut: "ملتی جلتی آیات میں فرق کریں ({ref})", review: "آج کی دہرائی", new: "آج کی نئی آیات", test: "آپ کا واجب امتحان" },
  checkTitle: "آج کا جائزہ",
  check: {
    test: "ایک امتحان واجب ہے – یہ دکھاتا ہے کہ واقعی کیا پختہ ہوا۔ آج اسی سے شروع کریں۔",
    weak: "آیت {ref} کئی بار پھسلی۔ آج تازہ رہتے ہوئے پہلے اسے دہرائیں۔",
    review: "آج {n} آیات کی دہرائی واجب ہے – دہرائی سیکھے ہوئے کو محفوظ رکھتی ہے۔",
    new: "آپ کی دہرائی مکمل ہے۔ آج {n} نئی آیات منتظر ہیں۔",
    done: "آپ نے آج سیکھا، ماشاءاللہ۔ سونے سے پہلے مختصر دہرائی اسے پختہ کرتی ہے۔",
    start: "شمس طریقے سے آغاز کریں: روزانہ ایک آیت ایک مضبوط آغاز ہے۔",
  },
  open: "کھولیں", dismiss: "آج کے لیے چھپائیں", fromData: "آپ کے اپنے ڈیٹا سے",
  memTitle: "{name} کو کیا یاد ہے", memLead: "صرف وہ جو آپ تصدیق کریں۔ اسی آلے پر محفوظ؛ آپ کی اجازت سے ہی اکاؤنٹ سے ہم آہنگ۔",
  memEmpty: "ابھی کچھ محفوظ نہیں۔", memAdd: "شامل کریں", memPh: "مثلاً مقصد: رمضان تک جزء عمّ", memDelete: "حذف کریں", memDeleteAll: "سب حذف کریں",
  memUse: "جوابات میں استعمال کریں (آپ کے سوالات کے ساتھ OpenAI کو بھیجا جاتا ہے)", memSync: "میرے اکاؤنٹ سے ہم آہنگ کریں", memSuggest: "کیا {name} یہ مقصد یاد رکھیں؟", memSave: "یاد رکھیں",
  chips: { course: "سبق کھولیں", tajweed: "تجوید کی مشق", handbook: "شمس طریقہ", glossary: "اصطلاحات", islam: "باب پڑھیں", adab: "قاری کے آداب", sisters: "بہنوں کے لیے", carousel: "کھولیں", guide: "رہنما کھولیں", tafsir: "آیت پڑھیں", progress: "میرے اعداد و شمار" },
};

const fa: NextUi = {
  listen: "شنیدن", stop: "توقف", speakAsk: "با صدا بپرسید", listening: "گوش می‌دهم – لطفاً اکنون صحبت کنید …",
  voiceOff: "ورودی صوتی به تشخیص گفتار روی همین دستگاه نیاز دارد که اینجا در دسترس نیست.",
  voiceNote: "صدای شما فقط روی همین دستگاه تشخیص داده می‌شود. پاسخ هوش مصنوعی را صدای دستگاه می‌خواند؛ قرآن را هرگز نمی‌خواند – آیات از قاری پخش می‌شوند.",
  playVerse: "شنیدن از قاری",
  typing: ["{name} در درس‌ها می‌خواند …", "{name} منابع را بررسی می‌کند …", "{name} پاسخ را می‌نویسد …"],
  coachTitle: "مربی تلاوت شما", coachLead: "از تمرین خود شما – هیچ چیز حدسی نیست.", planTitle: "برنامهٔ ۱۰ دقیقه‌ای شما",
  coachAsk: "لطفاً نقاط ضعف من در تلاوت و راه تمرین امروزشان را توضیح دهید.", coachAskBtn: "از {name} دربارهٔ نقاط ضعفم بپرسید", min: "{n} دقیقه",
  steps: { word: "کلمات جاافتادهٔ {ref} را تکرار کنید", link: "گذر به {ref} را تمرین کنید", phrase: "{ref} را بخش به بخش محکم کنید", makhraj: "مخرج حرف {letter}", mut: "آیات مشابه را از هم جدا کنید ({ref})", review: "مرور امروز", new: "آیات جدید امروز", test: "آزمون موعددار شما" },
  checkTitle: "نگاه امروز",
  check: {
    test: "زمان یک آزمون رسیده است – نشان می‌دهد چه چیزی واقعاً جا افتاده. امروز با آن شروع کنید.",
    weak: "آیهٔ {ref} چند بار لغزید. امروز تا تازه است، اول آن را مرور کنید.",
    review: "امروز {n} آیه برای مرور موعد دارند – مرور، آموخته‌ها را نگه می‌دارد.",
    new: "مرور شما به‌روز است. امروز {n} آیهٔ جدید منتظر است.",
    done: "امروز آموختید، ماشاءالله. مروری کوتاه پیش از خواب آن را محکم می‌کند.",
    start: "با روش شمس آغاز کنید: روزی یک آیه آغازی قوی است.",
  },
  open: "باز کردن", dismiss: "برای امروز پنهان کن", fromData: "از داده‌های خود شما",
  memTitle: "آنچه {name} به خاطر دارد", memLead: "فقط آنچه شما تأیید کنید. روی همین دستگاه ذخیره می‌شود؛ تنها با اجازهٔ شما با حسابتان همگام می‌شود.",
  memEmpty: "هنوز چیزی ذخیره نشده است.", memAdd: "افزودن", memPh: "مثلاً هدف: جزء عمّ تا رمضان", memDelete: "حذف", memDeleteAll: "حذف همه",
  memUse: "استفاده در پاسخ‌ها (همراه پرسش‌های شما به OpenAI فرستاده می‌شود)", memSync: "همگام‌سازی با حسابم", memSuggest: "آیا {name} این هدف را به خاطر بسپارد؟", memSave: "به خاطر بسپار",
  chips: { course: "باز کردن درس", tajweed: "تمرین تجوید", handbook: "روش شمس", glossary: "واژه‌نامه", islam: "خواندن فصل", adab: "آداب قاری", sisters: "برای خواهران", carousel: "باز کردن", guide: "باز کردن راهنما", tafsir: "خواندن آیه", progress: "آمار من" },
};

const ps: NextUi = {
  listen: "واورئ", stop: "ودروئ", speakAsk: "په غږ وپوښتئ", listening: "اورم – مهرباني وکړئ اوس خبرې وکړئ …",
  voiceOff: "غږیز ننوتل په همدې وسیله د وینا پېژندنې ته اړتیا لري، چې دلته نشته.",
  voiceNote: "ستاسو غږ یوازې په همدې وسیله پېژندل کېږي. د AI ځواب د وسیلې غږ لولي؛ قرآن هېڅکله نه لولي – آیتونه له قاري اورېدل کېږي.",
  playVerse: "له قاري واورئ",
  typing: ["{name} په لوستونو کې ګوري …", "{name} سرچینې ګوري …", "{name} ځواب لیکي …"],
  coachTitle: "ستاسو د تلاوت روزونکی", coachLead: "ستاسو د خپل تمرین څخه – هېڅ اټکل نه دی.", planTitle: "ستاسو ۱۰ دقیقه‌یي پلان",
  coachAsk: "مهرباني وکړئ په تلاوت کې زما کمزورۍ او نن د هغو د تمرین لاره راته تشریح کړئ.", coachAskBtn: "له {name} نه زما د کمزوریو په اړه وپوښتئ", min: "{n} دقیقې",
  steps: { word: "د {ref} پاتې شوې کلمې تکرار کړئ", link: "{ref} ته د تګ تمرین وکړئ", phrase: "{ref} برخه په برخه ټینګ کړئ", makhraj: "د {letter} توري مخرج", mut: "ورته آیتونه سره جلا کړئ ({ref})", review: "د نن تکرار", new: "د نن نوي آیتونه", test: "ستاسو ټاکلی ازموینه" },
  checkTitle: "د نن کتنه",
  check: {
    test: "یوه ازموینه ټاکلې ده – ښيي چې څه رښتیا ټینګ شوي. نن له هغې پیل وکړئ.",
    weak: "آیت {ref} څو ځله وښوید. نن یې تر څو تازه دی، لومړی تکرار کړئ.",
    review: "نن {n} آیتونه د تکرار لپاره ټاکل شوي – تکرار زده کړې ساتي.",
    new: "ستاسو تکرار تازه دی. نن {n} نوي آیتونه انتظار باسي.",
    done: "تاسو نن زده کړه وکړه، ماشاءالله. د خوب مخکې لنډ تکرار یې ټینګوي.",
    start: "د شمس طریقې سره پیل وکړئ: ورځې یو آیت قوي پیل دی.",
  },
  open: "پرانیزئ", dismiss: "د نن لپاره پټ کړئ", fromData: "ستاسو د خپلو معلوماتو څخه",
  memTitle: "{name} څه په یاد لري", memLead: "یوازې هغه څه چې تاسو یې تایید کړئ. په همدې وسیله ساتل کېږي؛ یوازې ستاسو په اجازه له حساب سره همغږي کېږي.",
  memEmpty: "تر اوسه څه نه دي خوندي شوي.", memAdd: "زیات کړئ", memPh: "لکه موخه: تر روژې پورې د عمّ جزء", memDelete: "ړنګ کړئ", memDeleteAll: "ټول ړنګ کړئ",
  memUse: "په ځوابونو کې یې وکاروئ (ستاسو له پوښتنو سره OpenAI ته لېږل کېږي)", memSync: "زما له حساب سره همغږي کړئ", memSuggest: "آیا {name} دا موخه په یاد وساتي؟", memSave: "په یاد یې وساتئ",
  chips: { course: "لوست پرانیزئ", tajweed: "د تجوید تمرین", handbook: "د شمس طریقه", glossary: "اصطلاحات", islam: "څپرکی ولولئ", adab: "د قاري آداب", sisters: "د خویندو لپاره", carousel: "پرانیزئ", guide: "لارښود پرانیزئ", tafsir: "آیت ولولئ", progress: "زما شمېرې" },
};

const fr: NextUi = {
  listen: "Écouter", stop: "Arrêter", speakAsk: "Demander à voix haute", listening: "J'écoute – veuillez parler maintenant …",
  voiceOff: "La saisie vocale nécessite la reconnaissance vocale sur cet appareil, qui n'est pas disponible ici.",
  voiceNote: "Votre voix est reconnue uniquement sur cet appareil. La réponse de l'IA est lue par la voix de l'appareil ; elle ne lit jamais le Coran – les versets sont joués par le récitateur.",
  playVerse: "Écouter le récitateur",
  typing: ["{name} lit les leçons …", "{name} vérifie les sources …", "{name} rédige la réponse …"],
  coachTitle: "Votre coach de récitation", coachLead: "À partir de votre propre pratique – rien n'est estimé.", planTitle: "Votre plan de 10 minutes",
  coachAsk: "Veuillez m'expliquer mes points faibles en récitation et comment les travailler aujourd'hui.", coachAskBtn: "Demander à {name} mes points faibles", min: "{n} min",
  steps: { word: "Répéter les mots manqués de {ref}", link: "Travailler l'enchaînement vers {ref}", phrase: "Consolider {ref} passage par passage", makhraj: "Articulation de la lettre {letter}", mut: "Distinguer des versets semblables ({ref})", review: "La révision du jour", new: "Les nouveaux versets du jour", test: "Votre test à faire" },
  checkTitle: "Le point du jour",
  check: {
    test: "Un test est prévu – il montre ce qui est vraiment acquis. Commencez par lui aujourd'hui.",
    weak: "Le verset {ref} a glissé plusieurs fois. Révisez-le d'abord aujourd'hui, tant qu'il est frais.",
    review: "{n} versets sont à réviser aujourd'hui – la révision garde ce que vous avez appris.",
    new: "Votre révision est à jour. {n} nouveaux versets vous attendent aujourd'hui.",
    done: "Vous avez appris aujourd'hui, MashaAllah. Une courte révision avant de dormir le consolide.",
    start: "Commencez avec la méthode Shams : un verset par jour est un bon début.",
  },
  open: "Ouvrir", dismiss: "Masquer pour aujourd'hui", fromData: "À partir de vos propres données",
  memTitle: "Ce que {name} retient", memLead: "Seulement ce que vous confirmez. Conservé sur cet appareil ; synchronisé avec votre compte seulement si vous l'autorisez.",
  memEmpty: "Rien n'est encore enregistré.", memAdd: "Ajouter", memPh: "p. ex. Objectif : Juz Amma avant le Ramadan", memDelete: "Supprimer", memDeleteAll: "Tout supprimer",
  memUse: "Utiliser dans les réponses (envoyé avec vos questions à OpenAI)", memSync: "Synchroniser avec mon compte", memSuggest: "{name} doit-il retenir cet objectif ?", memSave: "Retenir",
  chips: { course: "Ouvrir la leçon", tajweed: "Pratiquer le tajwid", handbook: "Méthode Shams", glossary: "Glossaire", islam: "Lire le chapitre", adab: "Adab du récitateur", sisters: "Pour les sœurs", carousel: "Ouvrir", guide: "Ouvrir le guide", tafsir: "Lire le verset", progress: "Mes statistiques" },
};

const es: NextUi = {
  listen: "Escuchar", stop: "Detener", speakAsk: "Preguntar por voz", listening: "Escuchando – por favor, hable ahora …",
  voiceOff: "La entrada por voz necesita reconocimiento de voz en este dispositivo, que aquí no está disponible.",
  voiceNote: "Su voz se reconoce solo en este dispositivo. La respuesta de la IA la lee la voz del dispositivo; nunca lee el Corán – los versículos suenan del recitador.",
  playVerse: "Escuchar al recitador",
  typing: ["{name} está leyendo las lecciones …", "{name} está comprobando las fuentes …", "{name} está escribiendo la respuesta …"],
  coachTitle: "Su coach de recitación", coachLead: "A partir de su propia práctica – nada es estimado.", planTitle: "Su plan de 10 minutos",
  coachAsk: "Por favor, explíqueme mis puntos débiles en la recitación y cómo practicarlos hoy.", coachAskBtn: "Preguntar a {name} por mis puntos débiles", min: "{n} min",
  steps: { word: "Repetir las palabras falladas de {ref}", link: "Practicar la transición a {ref}", phrase: "Afianzar {ref} tramo a tramo", makhraj: "Articulación de la letra {letter}", mut: "Distinguir versículos parecidos ({ref})", review: "El repaso de hoy", new: "Los versículos nuevos de hoy", test: "Su prueba pendiente" },
  checkTitle: "Su repaso de hoy",
  check: {
    test: "Tiene una prueba pendiente – muestra lo que de verdad se ha asentado. Empiece hoy por ella.",
    weak: "El versículo {ref} se le escapó varias veces. Repáselo hoy primero, mientras está fresco.",
    review: "Hoy tocan {n} versículos de repaso – el repaso conserva lo aprendido.",
    new: "Su repaso está al día. Hoy le esperan {n} versículos nuevos.",
    done: "Hoy ha aprendido, MashaAllah. Un breve repaso antes de dormir lo afianza.",
    start: "Empiece con el método Shams: un versículo al día es un buen comienzo.",
  },
  open: "Abrir", dismiss: "Ocultar por hoy", fromData: "A partir de sus propios datos",
  memTitle: "Lo que {name} recuerda", memLead: "Solo lo que usted confirma. Guardado en este dispositivo; sincronizado con su cuenta solo si lo permite.",
  memEmpty: "Aún no hay nada guardado.", memAdd: "Añadir", memPh: "p. ej. Objetivo: Juz Amma antes de Ramadán", memDelete: "Eliminar", memDeleteAll: "Eliminar todo",
  memUse: "Usar en las respuestas (se envía con sus preguntas a OpenAI)", memSync: "Sincronizar con mi cuenta", memSuggest: "¿Debe {name} recordar este objetivo?", memSave: "Recordar",
  chips: { course: "Abrir lección", tajweed: "Practicar tajwid", handbook: "Método Shams", glossary: "Glosario", islam: "Leer capítulo", adab: "Adab del recitador", sisters: "Para hermanas", carousel: "Abrir", guide: "Abrir guía", tafsir: "Leer versículo", progress: "Mis estadísticas" },
};

const id: NextUi = {
  listen: "Dengarkan", stop: "Berhenti", speakAsk: "Bertanya dengan suara", listening: "Mendengarkan – silakan berbicara sekarang …",
  voiceOff: "Input suara memerlukan pengenalan ucapan di perangkat ini, yang tidak tersedia di sini.",
  voiceNote: "Suara Anda hanya dikenali di perangkat ini. Jawaban AI dibacakan oleh suara perangkat; Al-Qur'an tidak pernah dibacakannya – ayat diputar dari qari.",
  playVerse: "Dengarkan qari",
  typing: ["{name} sedang membaca pelajaran …", "{name} sedang memeriksa sumber …", "{name} sedang menulis jawaban …"],
  coachTitle: "Pelatih tilawah Anda", coachLead: "Dari latihan Anda sendiri – tidak ada yang ditebak.", planTitle: "Rencana 10 menit Anda",
  coachAsk: "Mohon jelaskan titik lemah tilawah saya dan cara melatihnya hari ini.", coachAskBtn: "Tanya {name} tentang titik lemah saya", min: "{n} mnt",
  steps: { word: "Ulangi kata yang terlewat di {ref}", link: "Latih peralihan ke {ref}", phrase: "Kuatkan {ref} bagian demi bagian", makhraj: "Makhraj huruf {letter}", mut: "Bedakan ayat yang mirip ({ref})", review: "Murajaah hari ini", new: "Ayat baru hari ini", test: "Ujian Anda yang jatuh tempo" },
  checkTitle: "Cek harian",
  check: {
    test: "Ada ujian yang jatuh tempo – ujian menunjukkan apa yang benar-benar melekat. Mulailah dengan itu hari ini.",
    weak: "Ayat {ref} beberapa kali tergelincir. Ulangi lebih dulu hari ini selagi masih segar.",
    review: "Hari ini {n} ayat perlu diulang – murajaah menjaga apa yang telah Anda pelajari.",
    new: "Murajaah Anda sudah terkini. Hari ini {n} ayat baru menanti.",
    done: "Anda sudah belajar hari ini, MasyaAllah. Murajaah singkat sebelum tidur menguatkannya.",
    start: "Mulailah dengan Metode Shams: satu ayat sehari adalah awal yang kuat.",
  },
  open: "Buka", dismiss: "Sembunyikan hari ini", fromData: "Dari data Anda sendiri",
  memTitle: "Yang diingat {name}", memLead: "Hanya yang Anda konfirmasi. Disimpan di perangkat ini; disinkronkan dengan akun Anda hanya jika Anda mengizinkan.",
  memEmpty: "Belum ada yang disimpan.", memAdd: "Tambah", memPh: "mis. Tujuan: Juz Amma sebelum Ramadan", memDelete: "Hapus", memDeleteAll: "Hapus semua",
  memUse: "Gunakan dalam jawaban (dikirim bersama pertanyaan Anda ke OpenAI)", memSync: "Sinkronkan dengan akun saya", memSuggest: "Apakah {name} perlu mengingat tujuan ini?", memSave: "Ingat",
  chips: { course: "Buka pelajaran", tajweed: "Latihan tajwid", handbook: "Metode Shams", glossary: "Glosarium", islam: "Baca bab", adab: "Adab qari", sisters: "Untuk muslimah", carousel: "Buka", guide: "Buka panduan", tafsir: "Baca ayat", progress: "Statistik saya" },
};

const ms: NextUi = {
  listen: "Dengar", stop: "Henti", speakAsk: "Tanya dengan suara", listening: "Sedang mendengar – sila bercakap sekarang …",
  voiceOff: "Input suara memerlukan pengecaman pertuturan pada peranti ini, yang tidak tersedia di sini.",
  voiceNote: "Suara anda dikenal pasti pada peranti ini sahaja. Jawapan AI dibacakan oleh suara peranti; al-Quran tidak sekali-kali dibacakannya – ayat dimainkan daripada qari.",
  playVerse: "Dengar qari",
  typing: ["{name} sedang membaca pelajaran …", "{name} sedang menyemak sumber …", "{name} sedang menulis jawapan …"],
  coachTitle: "Jurulatih tilawah anda", coachLead: "Daripada latihan anda sendiri – tiada yang diteka.", planTitle: "Pelan 10 minit anda",
  coachAsk: "Sila terangkan titik lemah tilawah saya dan cara melatihnya hari ini.", coachAskBtn: "Tanya {name} tentang titik lemah saya", min: "{n} min",
  steps: { word: "Ulang perkataan yang tertinggal dalam {ref}", link: "Latih peralihan ke {ref}", phrase: "Kukuhkan {ref} bahagian demi bahagian", makhraj: "Makhraj huruf {letter}", mut: "Bezakan ayat yang serupa ({ref})", review: "Ulang kaji hari ini", new: "Ayat baharu hari ini", test: "Ujian anda yang tiba masa" },
  checkTitle: "Semakan hari ini",
  check: {
    test: "Ada ujian yang tiba masanya – ia menunjukkan apa yang benar-benar melekat. Mulakan dengannya hari ini.",
    weak: "Ayat {ref} tergelincir beberapa kali. Ulang kaji dahulu hari ini selagi masih segar.",
    review: "Hari ini {n} ayat perlu diulang kaji – ulang kaji memelihara apa yang telah anda pelajari.",
    new: "Ulang kaji anda sudah terkini. Hari ini {n} ayat baharu menanti.",
    done: "Anda telah belajar hari ini, MasyaAllah. Ulang kaji ringkas sebelum tidur mengukuhkannya.",
    start: "Mulakan dengan Kaedah Shams: satu ayat sehari ialah permulaan yang kukuh.",
  },
  open: "Buka", dismiss: "Sembunyikan untuk hari ini", fromData: "Daripada data anda sendiri",
  memTitle: "Apa yang diingati {name}", memLead: "Hanya yang anda sahkan. Disimpan pada peranti ini; disegerakkan dengan akaun anda hanya jika anda membenarkan.",
  memEmpty: "Belum ada apa-apa disimpan.", memAdd: "Tambah", memPh: "cth. Matlamat: Juz Amma sebelum Ramadan", memDelete: "Padam", memDeleteAll: "Padam semua",
  memUse: "Guna dalam jawapan (dihantar bersama soalan anda kepada OpenAI)", memSync: "Segerakkan dengan akaun saya", memSuggest: "Adakah {name} perlu mengingati matlamat ini?", memSave: "Ingat",
  chips: { course: "Buka pelajaran", tajweed: "Latih tajwid", handbook: "Kaedah Shams", glossary: "Glosari", islam: "Baca bab", adab: "Adab qari", sisters: "Untuk muslimah", carousel: "Buka", guide: "Buka panduan", tafsir: "Baca ayat", progress: "Statistik saya" },
};

const bn: NextUi = {
  listen: "শুনুন", stop: "থামান", speakAsk: "কণ্ঠে জিজ্ঞাসা করুন", listening: "শুনছি – অনুগ্রহ করে এখন বলুন …",
  voiceOff: "কণ্ঠে প্রশ্নের জন্য এই ডিভাইসে বক্তৃতা শনাক্তকরণ প্রয়োজন, যা এখানে নেই।",
  voiceNote: "আপনার কণ্ঠ কেবল এই ডিভাইসেই শনাক্ত হয়। AI-এর উত্তর ডিভাইসের কণ্ঠ পড়ে; কুরআন সে কখনো পড়ে না – আয়াত ক্বারীর কণ্ঠে বাজে।",
  playVerse: "ক্বারীর কণ্ঠে শুনুন",
  typing: ["{name} পাঠগুলো দেখছেন …", "{name} উৎসগুলো যাচাই করছেন …", "{name} উত্তর লিখছেন …"],
  coachTitle: "আপনার তিলাওয়াত কোচ", coachLead: "আপনার নিজের অনুশীলন থেকে – কিছুই অনুমান নয়।", planTitle: "আপনার ১০ মিনিটের পরিকল্পনা",
  coachAsk: "অনুগ্রহ করে তিলাওয়াতে আমার দুর্বলতাগুলো এবং আজ কীভাবে সেগুলো অনুশীলন করব তা বুঝিয়ে দিন।", coachAskBtn: "{name}-কে আমার দুর্বলতা নিয়ে জিজ্ঞাসা করুন", min: "{n} মিনিট",
  steps: { word: "{ref}-এর বাদ পড়া শব্দগুলো পুনরাবৃত্তি করুন", link: "{ref}-এ প্রবেশের অনুশীলন করুন", phrase: "{ref} অংশ অংশ করে মজবুত করুন", makhraj: "{letter} হরফের মাখরাজ", mut: "সাদৃশ্যপূর্ণ আয়াত আলাদা করুন ({ref})", review: "আজকের পুনরাবৃত্তি", new: "আজকের নতুন আয়াত", test: "আপনার নির্ধারিত পরীক্ষা" },
  checkTitle: "আজকের খোঁজ",
  check: {
    test: "একটি পরীক্ষা নির্ধারিত – এটি দেখায় কী সত্যিই বসেছে। আজ এটি দিয়ে শুরু করুন।",
    weak: "আয়াত {ref} কয়েকবার পিছলে গেছে। তাজা থাকতে থাকতে আজ প্রথমে এটি পুনরাবৃত্তি করুন।",
    review: "আজ {n}টি আয়াত পুনরাবৃত্তির জন্য নির্ধারিত – পুনরাবৃত্তি শেখাকে ধরে রাখে।",
    new: "আপনার পুনরাবৃত্তি হালনাগাদ। আজ {n}টি নতুন আয়াত অপেক্ষা করছে।",
    done: "আজ আপনি শিখেছেন, মাশাআল্লাহ। ঘুমানোর আগে ছোট্ট পুনরাবৃত্তি এটিকে মজবুত করে।",
    start: "শামস পদ্ধতি দিয়ে শুরু করুন: দিনে একটি আয়াত একটি দৃঢ় সূচনা।",
  },
  open: "খুলুন", dismiss: "আজকের জন্য লুকান", fromData: "আপনার নিজের তথ্য থেকে",
  memTitle: "{name} যা মনে রাখেন", memLead: "কেবল যা আপনি নিশ্চিত করেন। এই ডিভাইসে সংরক্ষিত; আপনি অনুমতি দিলে তবেই অ্যাকাউন্টের সাথে সিঙ্ক হয়।",
  memEmpty: "এখনো কিছু সংরক্ষিত হয়নি।", memAdd: "যোগ করুন", memPh: "যেমন লক্ষ্য: রমজানের আগে জুয আম্মা", memDelete: "মুছুন", memDeleteAll: "সব মুছুন",
  memUse: "উত্তরে ব্যবহার করুন (আপনার প্রশ্নের সাথে OpenAI-তে পাঠানো হয়)", memSync: "আমার অ্যাকাউন্টের সাথে সিঙ্ক করুন", memSuggest: "{name} কি এই লক্ষ্যটি মনে রাখবেন?", memSave: "মনে রাখুন",
  chips: { course: "পাঠ খুলুন", tajweed: "তাজবীদ অনুশীলন", handbook: "শামস পদ্ধতি", glossary: "পরিভাষা", islam: "অধ্যায় পড়ুন", adab: "ক্বারীর আদব", sisters: "বোনদের জন্য", carousel: "খুলুন", guide: "নির্দেশিকা খুলুন", tafsir: "আয়াত পড়ুন", progress: "আমার পরিসংখ্যান" },
};

const ru: NextUi = {
  listen: "Прослушать", stop: "Стоп", speakAsk: "Спросить голосом", listening: "Слушаю – пожалуйста, говорите …",
  voiceOff: "Для голосового ввода нужно распознавание речи на этом устройстве, а здесь оно недоступно.",
  voiceNote: "Ваш голос распознаётся только на этом устройстве. Ответ ИИ читает голос устройства; Коран он не читает никогда – аяты звучат в исполнении чтеца.",
  playVerse: "Слушать чтеца",
  typing: ["{name} читает уроки …", "{name} проверяет источники …", "{name} пишет ответ …"],
  coachTitle: "Ваш тренер чтения", coachLead: "По вашей собственной практике – ничего не предполагается.", planTitle: "Ваш план на 10 минут",
  coachAsk: "Пожалуйста, объясните мои слабые места в чтении и как их сегодня отработать.", coachAskBtn: "Спросить {name} о моих слабых местах", min: "{n} мин",
  steps: { word: "Повторите пропущенные слова аята {ref}", link: "Отработайте переход к {ref}", phrase: "Закрепите {ref} по частям", makhraj: "Артикуляция буквы {letter}", mut: "Различайте похожие аяты ({ref})", review: "Повторение на сегодня", new: "Новые аяты на сегодня", test: "Ваша назначенная проверка" },
  checkTitle: "На сегодня",
  check: {
    test: "Пора пройти проверку – она показывает, что действительно закрепилось. Начните сегодня с неё.",
    weak: "Аят {ref} несколько раз ускользал. Повторите его сегодня первым, пока он свеж.",
    review: "Сегодня к повторению {n} аятов – повторение сохраняет выученное.",
    new: "Повторение у вас в порядке. Сегодня ждут {n} новых аятов.",
    done: "Сегодня вы занимались, МашаАллах. Короткое повторение перед сном закрепит это.",
    start: "Начните с метода Шамс: один аят в день – хорошее начало.",
  },
  open: "Открыть", dismiss: "Скрыть на сегодня", fromData: "По вашим собственным данным",
  memTitle: "Что помнит {name}", memLead: "Только то, что вы подтвердили. Хранится на этом устройстве; синхронизируется с аккаунтом только с вашего разрешения.",
  memEmpty: "Пока ничего не сохранено.", memAdd: "Добавить", memPh: "напр. Цель: Джуз Амма до Рамадана", memDelete: "Удалить", memDeleteAll: "Удалить всё",
  memUse: "Учитывать в ответах (отправляется вместе с вопросами в OpenAI)", memSync: "Синхронизировать с аккаунтом", memSuggest: "Запомнить {name} эту цель?", memSave: "Запомнить",
  chips: { course: "Открыть урок", tajweed: "Практика таджвида", handbook: "Метод Шамс", glossary: "Глоссарий", islam: "Читать главу", adab: "Адаб чтеца", sisters: "Для сестёр", carousel: "Открыть", guide: "Открыть руководство", tafsir: "Читать аят", progress: "Моя статистика" },
};

const zh: NextUi = {
  listen: "朗读", stop: "停止", speakAsk: "语音提问", listening: "正在聆听——请现在说话……",
  voiceOff: "语音输入需要本设备上的语音识别，此处不可用。",
  voiceNote: "您的声音只在本设备上识别。AI 回答由设备语音朗读；它从不朗读《古兰经》——经文由诵读者的录音播放。",
  playVerse: "收听诵读者",
  typing: ["{name} 正在查阅课程……", "{name} 正在核对来源……", "{name} 正在撰写回答……"],
  coachTitle: "您的诵读教练", coachLead: "来自您自己的练习——没有任何估计。", planTitle: "您的 10 分钟计划",
  coachAsk: "请解释我诵读中的薄弱之处，以及今天如何练习。", coachAskBtn: "向 {name} 询问我的薄弱之处", min: "{n} 分钟",
  steps: { word: "重复 {ref} 中遗漏的词", link: "练习进入 {ref} 的衔接", phrase: "逐段巩固 {ref}", makhraj: "字母 {letter} 的发音部位", mut: "区分相似经文（{ref}）", review: "今天的复习", new: "今天的新经文", test: "您到期的测验" },
  checkTitle: "今日提示",
  check: {
    test: "有一项测验到期——它显示真正记牢的内容。今天请先做它。",
    weak: "经文 {ref} 多次出错。趁记忆犹新，今天先复习它。",
    review: "今天有 {n} 节经文需要复习——复习能保住所学。",
    new: "您的复习已完成。今天有 {n} 节新经文等着您。",
    done: "您今天已经学习了，MashaAllah。睡前简短复习能巩固它。",
    start: "从 Shams 方法开始：每天一节经文是坚实的开端。",
  },
  open: "打开", dismiss: "今天隐藏", fromData: "来自您自己的数据",
  memTitle: "{name} 记住的内容", memLead: "只记您确认的内容。保存在本设备上；只有在您允许时才与账户同步。",
  memEmpty: "尚未保存任何内容。", memAdd: "添加", memPh: "例如 目标：斋月前背完第三十卷", memDelete: "删除", memDeleteAll: "全部删除",
  memUse: "在回答中使用（随您的问题发送至 OpenAI）", memSync: "与我的账户同步", memSuggest: "要让 {name} 记住这个目标吗？", memSave: "记住",
  chips: { course: "打开课程", tajweed: "练习泰吉威德", handbook: "Shams 方法", glossary: "术语表", islam: "阅读章节", adab: "诵读者的礼仪", sisters: "姐妹专区", carousel: "打开", guide: "打开指南", tafsir: "阅读经文", progress: "我的统计" },
};

export const NEXT_UI: Record<string, NextUi> = { en, de, ar, tr, ur, fa, ps, fr, es, id, ms, bn, ru, zh };
export const nextUi = (lang: string): NextUi => NEXT_UI[lang] ?? en;
/** {name}, {n}, {ref}, {letter} filled in */
export const fillNext = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (all, k: string) => (k in v ? String(v[k]) : all));
