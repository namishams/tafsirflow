// Texts of /verify and /verify/review (own table, so the shared messages files stay untouched). English, German and
// Arabic in full; other languages fall back to English.
const en = {
  seoTitle: "Verify a certificate | Quran Masterclass",
  seoDesc: "Check whether a Quran Masterclass certificate is genuine: enter the code printed on the certificate or scan its QR code.",
  kicker: "Certificate check", title: "Is this certificate genuine?",
  lead: "Every Quran Masterclass certificate carries a code and a QR code. Enter the code to see the record kept on our server.",
  codeLabel: "Certificate code", codePlaceholder: "QMC-XXXX-XXXX", check: "Check", invalidCode: "Please enter a code in the form QMC-XXXX-XXXX.",
  notFound: "No certificate with this code exists. A certificate that cannot be found here is not genuine.",
  holder: "Holder", course: "Course", date: "Issued", result: "Result", status: "Status", code: "Code", decided: "Reviewed",
  valid: "Valid", pending: "Pending review", rejected: "Not confirmed", revoked: "Revoked",
  validNote: "This certificate was issued by Quran Masterclass from an exam result recorded on our server.",
  pendingNote: "The exam was passed. A teacher is still reviewing the recitation; the certificate is valid only after confirmation.",
  rejectedNote: "The review did not confirm this certificate.",
  revokedNote: "This certificate is not valid.",
  sigOk: "Signature verified", sigBad: "Signature does not match",
  disclaimer: "An app certificate of Quran Masterclass. It is not an ijazah.",
  another: "Check another code",
  // review queue
  reviewTitle: "Review queue", reviewLead: "Listen to the recording, look at the result and confirm or decline the certificate. Recordings are deleted after 90 days.",
  open: "Open", done: "Decided", empty: "Nothing to review.", noAccess: "Only admins and verified masters can review certificates.", signIn: "Please sign in.",
  approve: "Confirm certificate", reject: "Decline", note: "Note for the learner (required when declining)", noRecording: "No recording uploaded yet.",
  recordingDeleted: "Recording deleted (90 days).", wordScore: "Word check", duration: "Duration", flags: "Notes", own: "Your own certificate", score: "Score",
  approved: "Confirmed", declined: "Declined", error: "That did not work. Please try again.",
};
export type VerifyT = typeof en;

const de: VerifyT = {
  seoTitle: "Zertifikat prüfen | Quran Masterclass",
  seoDesc: "Prüfen Sie, ob ein Zertifikat von Quran Masterclass echt ist: Geben Sie den Code vom Zertifikat ein oder scannen Sie den QR-Code.",
  kicker: "Zertifikatsprüfung", title: "Ist dieses Zertifikat echt?",
  lead: "Jedes Zertifikat von Quran Masterclass trägt einen Code und einen QR-Code. Geben Sie den Code ein, um den Eintrag auf unserem Server zu sehen.",
  codeLabel: "Zertifikatscode", codePlaceholder: "QMC-XXXX-XXXX", check: "Prüfen", invalidCode: "Bitte geben Sie einen Code im Format QMC-XXXX-XXXX ein.",
  notFound: "Zu diesem Code gibt es kein Zertifikat. Ein Zertifikat, das hier nicht gefunden wird, ist nicht echt.",
  holder: "Inhaberin oder Inhaber", course: "Kurs", date: "Ausgestellt", result: "Ergebnis", status: "Status", code: "Code", decided: "Geprüft",
  valid: "Gültig", pending: "Prüfung ausstehend", rejected: "Nicht bestätigt", revoked: "Widerrufen",
  validNote: "Dieses Zertifikat wurde von Quran Masterclass anhand eines auf unserem Server gespeicherten Prüfungsergebnisses ausgestellt.",
  pendingNote: "Die Prüfung wurde bestanden. Eine Lehrkraft prüft noch die Rezitation; gültig ist das Zertifikat erst nach der Bestätigung.",
  rejectedNote: "Die Prüfung hat dieses Zertifikat nicht bestätigt.",
  revokedNote: "Dieses Zertifikat ist nicht gültig.",
  sigOk: "Signatur bestätigt", sigBad: "Signatur stimmt nicht",
  disclaimer: "Ein App-Zertifikat von Quran Masterclass. Es ist keine Idschaza.",
  another: "Anderen Code prüfen",
  reviewTitle: "Prüfungswarteschlange", reviewLead: "Hören Sie die Aufnahme, sehen Sie das Ergebnis an und bestätigen oder lehnen Sie das Zertifikat ab. Aufnahmen werden nach 90 Tagen gelöscht.",
  open: "Offen", done: "Entschieden", empty: "Nichts zu prüfen.", noAccess: "Nur Admins und bestätigte Meister können Zertifikate prüfen.", signIn: "Bitte melden Sie sich an.",
  approve: "Zertifikat bestätigen", reject: "Ablehnen", note: "Hinweis für die lernende Person (beim Ablehnen erforderlich)", noRecording: "Noch keine Aufnahme hochgeladen.",
  recordingDeleted: "Aufnahme gelöscht (90 Tage).", wordScore: "Wortprüfung", duration: "Dauer", flags: "Hinweise", own: "Ihr eigenes Zertifikat", score: "Punkte",
  approved: "Bestätigt", declined: "Abgelehnt", error: "Das hat nicht geklappt. Bitte versuchen Sie es erneut.",
};

const ar: VerifyT = {
  seoTitle: "التحقق من شهادة | Quran Masterclass",
  seoDesc: "تحقّقوا من صحة شهادة Quran Masterclass بإدخال الرمز المطبوع على الشهادة أو بمسح رمز QR.",
  kicker: "التحقق من الشهادة", title: "هل هذه الشهادة صحيحة؟",
  lead: "تحمل كل شهادة من Quran Masterclass رمزًا ورمز QR. أدخلوا الرمز لعرض السجل المحفوظ على خادمنا.",
  codeLabel: "رمز الشهادة", codePlaceholder: "QMC-XXXX-XXXX", check: "تحقّق", invalidCode: "يرجى إدخال رمز بالصيغة QMC-XXXX-XXXX.",
  notFound: "لا توجد شهادة بهذا الرمز. الشهادة التي لا تظهر هنا ليست صحيحة.",
  holder: "صاحب الشهادة", course: "الدورة", date: "تاريخ الإصدار", result: "النتيجة", status: "الحالة", code: "الرمز", decided: "تاريخ المراجعة",
  valid: "صالحة", pending: "قيد المراجعة", rejected: "غير مؤكدة", revoked: "ملغاة",
  validNote: "أصدرت Quran Masterclass هذه الشهادة بناءً على نتيجة اختبار محفوظة على خادمنا.",
  pendingNote: "تم اجتياز الاختبار، وما زال معلّم يراجع التلاوة؛ ولا تصبح الشهادة صالحة إلا بعد التأكيد.",
  rejectedNote: "لم تؤكد المراجعة هذه الشهادة.",
  revokedNote: "هذه الشهادة غير صالحة.",
  sigOk: "التوقيع صحيح", sigBad: "التوقيع غير مطابق",
  disclaimer: "شهادة تطبيق من Quran Masterclass، وليست إجازة.",
  another: "التحقق من رمز آخر",
  reviewTitle: "قائمة المراجعة", reviewLead: "استمعوا إلى التسجيل وانظروا في النتيجة، ثم أكّدوا الشهادة أو ارفضوها. تُحذف التسجيلات بعد 90 يومًا.",
  open: "مفتوحة", done: "تم البتّ", empty: "لا يوجد ما يُراجَع.", noAccess: "المراجعة متاحة للمشرفين والمشايخ الموثّقين فقط.", signIn: "يرجى تسجيل الدخول.",
  approve: "تأكيد الشهادة", reject: "رفض", note: "ملاحظة للمتعلّم (مطلوبة عند الرفض)", noRecording: "لم يُرفع تسجيل بعد.",
  recordingDeleted: "حُذف التسجيل (90 يومًا).", wordScore: "فحص الكلمات", duration: "المدة", flags: "ملاحظات", own: "شهادتكم أنتم", score: "الدرجة",
  approved: "مؤكدة", declined: "مرفوضة", error: "لم ينجح ذلك. يرجى المحاولة مرة أخرى.",
};

export function verifyText(locale: string): VerifyT {
  return locale === "de" ? de : locale === "ar" ? ar : en;
}
