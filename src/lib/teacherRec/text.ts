import { useCallback } from "react";
import trJ from "./i18n/tr.json";
import urJ from "./i18n/ur.json";
import faJ from "./i18n/fa.json";
import psJ from "./i18n/ps.json";
import frJ from "./i18n/fr.json";
import esJ from "./i18n/es.json";
import idJ from "./i18n/id.json";
import msJ from "./i18n/ms.json";
import bnJ from "./i18n/bn.json";
import ruJ from "./i18n/ru.json";
import zhJ from "./i18n/zh.json";
import { useLang } from "@/lib/learn/i18n";

// Teacher review of recordings (Shams 3.0): "send to teacher" (share through the device, or straight to a linked
// teacher), the list of recordings and the teacher's feedback. English, German and Arabic here; the other eleven
// languages in ./i18n/<lang>.json, merged over English. Polite address everywhere (German Sie-form). Copy of
// mobile/src/features/teacher/rec/text.ts (same tables and JSON files). Placeholders: {t} {n} {d} {l} {name}.
const en = {
  sendT: "Send to your teacher",
  share: "Share recording",
  shareNote: "Shares the file through your device (messages, e-mail). Nothing goes to our server.",
  download: "Download recording",
  copy: "Copy summary", copied: "Copied",
  direct: "Directly to your teacher",
  noTeacher: "No active teacher link yet. Invite a teacher in the live link to send recordings directly.",
  openLink: "Open the teacher link",
  privacy: "Only your teacher hears the recording. It is kept on our server for at most 60 days and then deleted; you can withdraw it at any time. Recordings and feedback can be reported.",
  consent: "I want to send this recording to {t}.",
  parental: "I am under 16 and my parent or guardian agrees to sending this recording.",
  tooShort: "For your teacher a recording needs at least {n} seconds.",
  tooLong: "A recording may be at most 5 minutes.",
  send: "Send", sending: "Sending…",
  sent: "Sent. Your teacher finds it under “Recordings and feedback”.",
  signIn: "Please sign in to send recordings directly to your teacher.",
  err_generic: "That did not work. Please try again.",
  err_too_many_open: "Up to 10 recordings can wait for feedback per teacher.",
  err_not_linked: "The link with this teacher is not active.",
  err_media: "The recording could not be read.",
  err_text: "Please rephrase the note.",
  err_parental: "Please confirm that your parent or guardian agrees.",
  recT: "Recordings and feedback",
  recLead: "Recordings you sent to a teacher and recordings your students sent you. Every file is deleted after 60 days.",
  mine: "Sent by me", inbox: "To review",
  none: "You have not sent a recording yet. Use “Send to your teacher” in the makhraj coach, talaqqi or recitation from memory.",
  noneInbox: "No recordings to review.",
  k_blind: "Recitation from memory", k_talaqqi: "Talaqqi", k_drill: "Drill", k_makhraj: "Makhraj {l}",
  st_open: "waiting for feedback", st_reviewed: "feedback received",
  expires: "Deleted on {d}", deleted: "The file has been deleted.",
  withdraw: "Withdraw", withdrawAsk: "Withdraw the recording and delete the file?", cancel: "Cancel",
  feedback: "Feedback", yourFeedback: "Your feedback", noFeedback: "No feedback yet.",
  r_makharij: "Articulation (makhārij)", r_tajweed: "Tajwīd", r_waqf: "Pauses (waqf)", r_pace: "Pace",
  ratingHint: "1 = needs much work · 5 = very good. Rate only what you heard.",
  marksT: "Words to work on", marksLead: "Tap the words that need work.", marked: "{n} words marked", noMarks: "No words marked.",
  note: "Short note (optional)", sendFeedback: "Send feedback", saved: "Feedback sent.",
  applied: "Your teacher's feedback was added to your weak words and to the pronunciation rating (teacher).",
  from: "From {t}", to: "To {t}",
  summaryT: "What the app noted",
  sumSelf: "Own rating: {n}/5 (self-assessment)", sumQuiz: "Ear training: {n}", sumHeard: "Words heard: {n}",
  reportRec: "Report recording", reportFb: "Report feedback", safetyFor: "Report or block {name}", blockedNote: "{name} is blocked and no longer appears here.",
  openRecs: "Recordings and feedback", openRecsSub: "Send recordings to your teacher and read the feedback.",
  loading: "Loading…",
  teacherRating: "Rating by your teacher – not a measurement by the app.",
};
export type RtKey = keyof typeof en;
type T = Record<RtKey, string>;

const de: T = {
  sendT: "An Ihre Lehrkraft senden",
  share: "Aufnahme teilen",
  shareNote: "Teilt die Datei über Ihr Gerät (Nachrichten, E-Mail). Nichts geht an unseren Server.",
  download: "Aufnahme herunterladen",
  copy: "Zusammenfassung kopieren", copied: "Kopiert",
  direct: "Direkt an Ihre Lehrkraft",
  noTeacher: "Noch keine aktive Verbindung zu einer Lehrkraft. Laden Sie eine Lehrkraft über die direkte Verbindung ein, um Aufnahmen direkt zu senden.",
  openLink: "Verbindung zur Lehrkraft öffnen",
  privacy: "Nur Ihre Lehrkraft hört die Aufnahme. Sie bleibt höchstens 60 Tage auf unserem Server und wird dann gelöscht; Sie können sie jederzeit zurückziehen. Aufnahmen und Rückmeldungen können gemeldet werden.",
  consent: "Ich möchte diese Aufnahme an {t} senden.",
  parental: "Ich bin unter 16 und meine Eltern oder mein Vormund sind mit dem Senden dieser Aufnahme einverstanden.",
  tooShort: "Für Ihre Lehrkraft braucht eine Aufnahme mindestens {n} Sekunden.",
  tooLong: "Eine Aufnahme darf höchstens 5 Minuten lang sein.",
  send: "Senden", sending: "Wird gesendet …",
  sent: "Gesendet. Ihre Lehrkraft findet sie unter „Aufnahmen und Rückmeldungen“.",
  signIn: "Bitte melden Sie sich an, um Aufnahmen direkt an Ihre Lehrkraft zu senden.",
  err_generic: "Das hat nicht geklappt. Bitte versuchen Sie es erneut.",
  err_too_many_open: "Je Lehrkraft können bis zu 10 Aufnahmen auf eine Rückmeldung warten.",
  err_not_linked: "Die Verbindung zu dieser Lehrkraft ist nicht aktiv.",
  err_media: "Die Aufnahme konnte nicht gelesen werden.",
  err_text: "Bitte formulieren Sie die Notiz anders.",
  err_parental: "Bitte bestätigen Sie, dass Ihre Eltern oder Ihr Vormund einverstanden sind.",
  recT: "Aufnahmen und Rückmeldungen",
  recLead: "Aufnahmen, die Sie an eine Lehrkraft gesendet haben, und Aufnahmen, die Ihre Lernenden Ihnen gesendet haben. Jede Datei wird nach 60 Tagen gelöscht.",
  mine: "Von mir gesendet", inbox: "Zu prüfen",
  none: "Sie haben noch keine Aufnahme gesendet. Nutzen Sie „An Ihre Lehrkraft senden“ im Machradsch-Coach, beim Talaqqi oder beim Rezitieren aus dem Gedächtnis.",
  noneInbox: "Keine Aufnahmen zu prüfen.",
  k_blind: "Rezitation aus dem Gedächtnis", k_talaqqi: "Talaqqi", k_drill: "Übung", k_makhraj: "Machradsch {l}",
  st_open: "wartet auf Rückmeldung", st_reviewed: "Rückmeldung erhalten",
  expires: "Wird am {d} gelöscht", deleted: "Die Datei wurde gelöscht.",
  withdraw: "Zurückziehen", withdrawAsk: "Die Aufnahme zurückziehen und die Datei löschen?", cancel: "Abbrechen",
  feedback: "Rückmeldung", yourFeedback: "Ihre Rückmeldung", noFeedback: "Noch keine Rückmeldung.",
  r_makharij: "Artikulation (Machāridsch)", r_tajweed: "Tadschwīd", r_waqf: "Pausen (Waqf)", r_pace: "Tempo",
  ratingHint: "1 = braucht viel Übung · 5 = sehr gut. Bewerten Sie nur, was Sie gehört haben.",
  marksT: "Wörter zum Üben", marksLead: "Tippen Sie auf die Wörter, die Übung brauchen.", marked: "{n} Wörter markiert", noMarks: "Keine Wörter markiert.",
  note: "Kurze Notiz (optional)", sendFeedback: "Rückmeldung senden", saved: "Rückmeldung gesendet.",
  applied: "Die Rückmeldung Ihrer Lehrkraft wurde zu Ihren schwachen Wörtern und zur Aussprache-Bewertung (Lehrkraft) hinzugefügt.",
  from: "Von {t}", to: "An {t}",
  summaryT: "Was die App festgehalten hat",
  sumSelf: "Eigene Einschätzung: {n}/5 (Selbsteinschätzung)", sumQuiz: "Hörübung: {n}", sumHeard: "Erkannte Wörter: {n}",
  reportRec: "Aufnahme melden", reportFb: "Rückmeldung melden", safetyFor: "{name} melden oder blockieren", blockedNote: "{name} ist blockiert und erscheint hier nicht mehr.",
  openRecs: "Aufnahmen und Rückmeldungen", openRecsSub: "Senden Sie Aufnahmen an Ihre Lehrkraft und lesen Sie die Rückmeldungen.",
  loading: "Wird geladen …",
  teacherRating: "Bewertung Ihrer Lehrkraft – keine Messung der App.",
};

const ar: T = {
  sendT: "أرسلوا إلى معلّمكم",
  share: "مشاركة التسجيل",
  shareNote: "يشارك الملف عبر جهازكم (الرسائل، البريد). لا يصل شيء إلى خادمنا.",
  download: "تنزيل التسجيل",
  copy: "نسخ الملخّص", copied: "تم النسخ",
  direct: "مباشرةً إلى معلّمكم",
  noTeacher: "لا يوجد ارتباط نشط بمعلّم بعد. ادعوا معلّمًا عبر الارتباط المباشر لإرسال التسجيلات مباشرة.",
  openLink: "فتح الارتباط بالمعلّم",
  privacy: "لا يسمع التسجيل إلا معلّمكم. يُحفظ على خادمنا 60 يومًا على الأكثر ثم يُحذف، ويمكنكم سحبه في أي وقت. يمكن الإبلاغ عن التسجيلات والملاحظات.",
  consent: "أريد إرسال هذا التسجيل إلى {t}.",
  parental: "عمري أقل من 16 عامًا، ووليّ أمري موافق على إرسال هذا التسجيل.",
  tooShort: "يحتاج التسجيل المرسل إلى المعلّم {n} ثانية على الأقل.",
  tooLong: "لا يتجاوز التسجيل 5 دقائق.",
  send: "إرسال", sending: "جارٍ الإرسال…",
  sent: "أُرسل. يجده معلّمكم في «التسجيلات والملاحظات».",
  signIn: "نرجو تسجيل الدخول لإرسال التسجيلات مباشرة إلى معلّمكم.",
  err_generic: "لم ينجح ذلك. نرجو المحاولة مرة أخرى.",
  err_too_many_open: "يمكن أن ينتظر حتى 10 تسجيلات ملاحظات كل معلّم.",
  err_not_linked: "الارتباط بهذا المعلّم غير نشط.",
  err_media: "تعذّرت قراءة التسجيل.",
  err_text: "نرجو إعادة صياغة الملاحظة.",
  err_parental: "نرجو تأكيد موافقة وليّ الأمر.",
  recT: "التسجيلات والملاحظات",
  recLead: "تسجيلات أرسلتموها إلى معلّم، وتسجيلات أرسلها إليكم طلابكم. يُحذف كل ملف بعد 60 يومًا.",
  mine: "أرسلتُها", inbox: "للمراجعة",
  none: "لم ترسلوا تسجيلًا بعد. استخدموا «أرسلوا إلى معلّمكم» في مدرّب المخارج أو التلقّي أو التسميع من الحفظ.",
  noneInbox: "لا توجد تسجيلات للمراجعة.",
  k_blind: "تسميع من الحفظ", k_talaqqi: "التلقّي", k_drill: "تمرين", k_makhraj: "مخرج {l}",
  st_open: "بانتظار الملاحظات", st_reviewed: "وصلت الملاحظات",
  expires: "يُحذف في {d}", deleted: "حُذف الملف.",
  withdraw: "سحب", withdrawAsk: "سحب التسجيل وحذف الملف؟", cancel: "إلغاء",
  feedback: "الملاحظات", yourFeedback: "ملاحظاتكم", noFeedback: "لا ملاحظات بعد.",
  r_makharij: "المخارج", r_tajweed: "التجويد", r_waqf: "الوقف", r_pace: "الإيقاع",
  ratingHint: "1 = يحتاج إلى تدريب كثير · 5 = ممتاز. قيّموا ما سمعتموه فقط.",
  marksT: "كلمات للتدريب", marksLead: "اضغطوا على الكلمات التي تحتاج إلى تدريب.", marked: "{n} كلمات محدّدة", noMarks: "لا كلمات محدّدة.",
  note: "ملاحظة قصيرة (اختيارية)", sendFeedback: "إرسال الملاحظات", saved: "أُرسلت الملاحظات.",
  applied: "أُضيفت ملاحظات معلّمكم إلى كلماتكم الضعيفة وإلى تقييم النطق (المعلّم).",
  from: "من {t}", to: "إلى {t}",
  summaryT: "ما سجّله التطبيق",
  sumSelf: "التقييم الذاتي: {n}/5", sumQuiz: "تدريب السمع: {n}", sumHeard: "كلمات سُمعت: {n}",
  reportRec: "الإبلاغ عن التسجيل", reportFb: "الإبلاغ عن الملاحظات", safetyFor: "الإبلاغ عن {name} أو حظره", blockedNote: "{name} محظور ولن يظهر هنا بعد الآن.",
  openRecs: "التسجيلات والملاحظات", openRecsSub: "أرسلوا تسجيلاتكم إلى معلّمكم واقرؤوا ملاحظاته.",
  loading: "جارٍ التحميل…",
  teacherRating: "تقييم معلّمكم – وليس قياسًا من التطبيق.",
};

const LOAD: Record<string, () => Partial<T>> = { tr: () => trJ, ur: () => urJ, fa: () => faJ, ps: () => psJ, fr: () => frJ, es: () => esJ, id: () => idJ, ms: () => msJ, bn: () => bnJ, ru: () => ruJ, zh: () => zhJ };
const cache = new Map<string, T>();
export function recText(lang: string): T {
  if (lang === "de") return de;
  if (lang === "ar") return ar;
  if (!LOAD[lang]) return en;
  let d = cache.get(lang);
  if (!d) {
    let tr: Partial<T> = {};
    try { tr = LOAD[lang]() ?? {}; } catch { tr = {}; }
    d = { ...en, ...tr };
    cache.set(lang, d);
  }
  return d;
}
export const fillRt = (s: string, p?: Record<string, string | number>) => (p ? s.replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : s);
export function useRt() {
  const { lang } = useLang();
  return useCallback((k: RtKey, p?: Record<string, string | number>) => fillRt(recText(lang)[k] ?? en[k], p), [lang]);
}
export const REC_EN = en;
export const REC_DE = de;
export const REC_AR = ar;
