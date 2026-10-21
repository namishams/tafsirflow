"use client";
// A few website-only texts of the card trainer (keyboard instead of swiping, the clipboard fallback of sharing, the
// list of device certificates). en, de, ar written in the polite form; other languages fall back to English.
// Everything else comes from useSrsT() in @/lib/learn/srs/texts (the app's own texts).
import { formatWeb, useLang } from "@/lib/learn/i18n";

const en = {
  turn: "Turn the card",
  keysFront: "Space or Enter turns the card.",
  keysBack: "Keys 1 to 4: Again, Hard, Good, Easy. On a touch screen you can also swipe.",
  copied: "Copied to the clipboard.",
  shareProgress: "Share",
  shareHifz: "I have learned {name} with the Hifz tracker of Quran Masterclass.",
  shareReview: "I reviewed {n} cards today on Quran Masterclass.",
  allCerts: "Your app certificates",
  print: "Print",
  openExam: "Open the exam",
};
type W = typeof en;
const de: W = {
  turn: "Karte umdrehen",
  keysFront: "Leertaste oder Eingabetaste dreht die Karte um.",
  keysBack: "Tasten 1 bis 4: Nochmal, Schwer, Gut, Leicht. Auf einem Touchscreen können Sie auch wischen.",
  copied: "In die Zwischenablage kopiert.",
  shareProgress: "Teilen",
  shareHifz: "Ich habe {name} mit der Hifz-Übersicht von Quran Masterclass gelernt.",
  shareReview: "Ich habe heute {n} Karten bei Quran Masterclass wiederholt.",
  allCerts: "Ihre App-Zertifikate",
  print: "Drucken",
  openExam: "Prüfung öffnen",
};
const ar: W = {
  turn: "اقلبوا البطاقة",
  keysFront: "مفتاح المسافة أو الإدخال يقلب البطاقة.",
  keysBack: "المفاتيح من ١ إلى ٤: مرة أخرى، صعب، جيد، سهل. ويمكنكم السحب على شاشة اللمس.",
  copied: "تم النسخ إلى الحافظة.",
  shareProgress: "مشاركة",
  shareHifz: "حفظتُ {name} بمتابعة الحفظ في Quran Masterclass.",
  shareReview: "راجعتُ اليوم {n} بطاقة في Quran Masterclass.",
  allCerts: "شهاداتكم في التطبيق",
  print: "طباعة",
  openExam: "افتحوا الاختبار",
};
const TABLE: Record<string, W> = { en, de, ar };
export type SrsWebKey = keyof W;

export function useSrsWeb() {
  const { lang } = useLang();
  const t = TABLE[lang] ?? en;
  return (k: SrsWebKey, p?: Record<string, string | number>) => formatWeb(t[k], p);
}
