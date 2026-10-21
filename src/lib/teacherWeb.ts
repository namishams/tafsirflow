// Texts of the teacher dashboard on the website (/[locale]/teacher). English, German and Arabic here; the other
// locales read English (the app has all 14 languages). Polite address in German. Placeholders: {n}, {s}, {a}, {b}, {d}.
const en = {
  metaTitle: "Teacher dashboard", title: "My students", lead: "Students who invited you as their teacher and chose to share their Shams 2.0 summary. Aggregates only, no recordings.",
  signIn: "Please sign in to see your students.", signInBtn: "Sign in", invites: "Invitations", accept: "Accept", decline: "Decline",
  none: "No students yet. A student invites you from their connections in the app; the invitation appears here.",
  never: "Not synced yet", attention: "Needs a gentle word", idle: "{n} days without wird", active28: "{n} of 28 days", mem: "{n} verses", grade: "Grade {n}",
  weak: "{n} weak spots", itqan: "{n} surahs at itqān", plan: "Today's plan", sabaq: "New", sabqi: "Recent", manzil: "Long-term", minutes: "{n} min",
  last28: "Last 28 days", bySurah: "Quality per surah", surahN: "Surah {n}", encourage: "Send encouragement", suggest: "Suggest a portion",
  surahNo: "Surah number", fromV: "From verse", toV: "To verse", send: "Send", sent: "Sent", withdraw: "Withdraw", open: "Show", close: "Hide",
  nudge_keep_going: "Keep going, you are doing well.", nudge_well_done: "Well done, this is steady work.", nudge_gentle_reminder: "A gentle reminder: a short wird today helps.", nudge_take_your_time: "Take your time; steady is better than fast.",
  st_open: "waiting", st_accepted: "accepted", st_dismissed: "dismissed", st_done: "done", stopLink: "End the link", stopAsk: "End the link and delete the shared copy?",
  err: "That did not work. Please try again.", errSoon: "One encouragement a day per student.", errRange: "Please check the surah and the verses.", updated: "Updated {d}",
  student: "As a student", studentLead: "Teachers you invited. Stopping deletes the copy on the server. Invitations and the summary are sent from the app.", myTeachers: "My teachers", waiting: "Waiting for the answer", sharing: "Sharing", stop: "Stop sharing",
  noTeachers: "No teacher linked.",
};
type K = keyof typeof en;
const de: Record<K, string> = {
  metaTitle: "Dashboard für Lehrkräfte", title: "Meine Lernenden", lead: "Lernende, die Sie als Lehrkraft eingeladen haben und ihre Shams-2.0-Zusammenfassung teilen. Nur Kennzahlen, keine Aufnahmen.",
  signIn: "Bitte melden Sie sich an, um Ihre Lernenden zu sehen.", signInBtn: "Anmelden", invites: "Einladungen", accept: "Annehmen", decline: "Ablehnen",
  none: "Noch keine Lernenden. Lernende laden Sie in der App aus ihren Verbindungen ein; die Einladung erscheint hier.",
  never: "Noch nicht synchronisiert", attention: "Ein freundliches Wort wäre gut", idle: "{n} Tage ohne Wird", active28: "{n} von 28 Tagen", mem: "{n} Verse", grade: "Grad {n}",
  weak: "{n} Schwachstellen", itqan: "{n} Suren auf Itqān", plan: "Plan für heute", sabaq: "Neu", sabqi: "Kürzlich", manzil: "Langzeit", minutes: "{n} Min.",
  last28: "Letzte 28 Tage", bySurah: "Qualität je Sure", surahN: "Sure {n}", encourage: "Ermutigung senden", suggest: "Abschnitt vorschlagen",
  surahNo: "Surennummer", fromV: "Ab Vers", toV: "Bis Vers", send: "Senden", sent: "Gesendet", withdraw: "Zurückziehen", open: "Anzeigen", close: "Ausblenden",
  nudge_keep_going: "Machen Sie weiter so, Sie sind auf gutem Weg.", nudge_well_done: "Gut gemacht, das ist stetige Arbeit.", nudge_gentle_reminder: "Eine kleine Erinnerung: Ein kurzes Wird heute hilft.", nudge_take_your_time: "Nehmen Sie sich Zeit; stetig ist besser als schnell.",
  st_open: "wartet", st_accepted: "angenommen", st_dismissed: "abgelehnt", st_done: "erledigt", stopLink: "Verbindung beenden", stopAsk: "Verbindung beenden und die geteilte Kopie löschen?",
  err: "Das hat nicht geklappt. Bitte versuchen Sie es erneut.", errSoon: "Eine Ermutigung pro Tag und Lernendem.", errRange: "Bitte prüfen Sie Sure und Verse.", updated: "Aktualisiert {d}",
  student: "Als Lernende:r", studentLead: "Lehrkräfte, die Sie eingeladen haben. Beenden löscht die Kopie auf dem Server. Einladungen und Zusammenfassung senden Sie aus der App.", myTeachers: "Meine Lehrkräfte", waiting: "Wartet auf Antwort", sharing: "Wird geteilt", stop: "Teilen beenden",
  noTeachers: "Keine Lehrkraft verbunden.",
};
const ar: Partial<Record<K, string>> = {
  metaTitle: "لوحة المعلّم", title: "طلابي", lead: "الطلاب الذين دعوك معلّمًا وقرّروا مشاركة ملخّص شمس ٢٫٠. أرقام مجمّعة فقط، بلا تسجيلات.",
  signIn: "سجّل الدخول لرؤية طلابك.", signInBtn: "تسجيل الدخول", invites: "الدعوات", accept: "قبول", decline: "رفض",
  none: "لا طلاب بعد. يدعوك الطالب من صلاته في التطبيق وتظهر الدعوة هنا.", never: "لم تتم المزامنة بعد", attention: "كلمة لطيفة ستفيد", idle: "{n} يومًا بلا ورد",
  active28: "{n} من ٢٨ يومًا", mem: "{n} آية", grade: "الدرجة {n}", weak: "{n} مواضع ضعف", itqan: "{n} سور في الإتقان", plan: "خطة اليوم", sabaq: "جديد", sabqi: "قريب", manzil: "بعيد", minutes: "{n} د",
  last28: "آخر ٢٨ يومًا", bySurah: "الجودة لكل سورة", surahN: "سورة {n}", encourage: "أرسل تشجيعًا", suggest: "اقترح مقطعًا", surahNo: "رقم السورة", fromV: "من الآية", toV: "إلى الآية",
  send: "إرسال", sent: "أُرسل", withdraw: "سحب", open: "عرض", close: "إخفاء",
  nudge_keep_going: "واصل، أنت تسير جيدًا.", nudge_well_done: "أحسنت، هذا عمل منتظم.", nudge_gentle_reminder: "تذكير لطيف: ورد قصير اليوم يفيد.", nudge_take_your_time: "خذ وقتك؛ الثبات خير من السرعة.",
  st_open: "بانتظار", st_accepted: "مقبول", st_dismissed: "مرفوض", st_done: "تم", stopLink: "إنهاء الصلة", stopAsk: "إنهاء الصلة وحذف النسخة المشتركة؟",
  err: "لم تنجح العملية. حاول مرة أخرى.", errSoon: "تشجيع واحد في اليوم لكل طالب.", errRange: "تحقّق من السورة والآيات.", updated: "حُدّث {d}",
  student: "بصفتي طالبًا", studentLead: "المعلّمون الذين دعوتهم. الإيقاف يحذف النسخة من الخادم. الدعوات والملخّص يُرسلان من التطبيق.", myTeachers: "معلّموني", waiting: "في انتظار الرد", sharing: "قيد المشاركة", stop: "إيقاف المشاركة", noTeachers: "لا معلّم مرتبط.",
};
export type TcKey = K;
export function teacherText(locale: string): Record<K, string> {
  if (locale === "de") return de;
  if (locale === "ar") return { ...en, ...ar };
  return en;
}
export const fillT = (s: string, v: Record<string, string | number>) => Object.entries(v).reduce((a, [k, x]) => a.split(`{${k}}`).join(String(x)), s);
