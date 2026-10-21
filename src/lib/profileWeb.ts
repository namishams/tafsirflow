// Texts of the Instagram/TikTok-style parts of the public talent profile on the website (counters, achievement grid,
// full-screen moment feed, share, profile photo on /talents/me). English, German and Arabic; other locales fall back to
// English. Polite address everywhere. {n}, {m} are placeholders.
const en = {
  usernameFree: "Available", usernameChecking: "Checking …", username_format: "3 to 20 characters: a-z, 0-9, dot, underscore.",
  username_reserved: "This username is reserved.", username_taken: "This username is already taken.", username_inappropriate: "Please choose a different username.",
  followedBy1: "Followed by {a}", followedBy2: "Followed by {a} and {b}", followedByMore: "Followed by {a}, {b} and {n} others",
  mashaallah: "MashaAllah", tabAchievements: "Achievements", tabSijill: "Sijill", tabBadges: "Badges",
  share: "Share profile", copied: "Link copied", editProfile: "Edit profile",
  doubleTap: "Double-click or tap the heart to say MashaAllah", sayMashaAllah: "Say MashaAllah", takeBack: "Take back MashaAllah",
  close: "Close", prev: "Previous", next: "Next", momentOf: "Achievement {n} of {m}", maCount: "{n} MashaAllah",
  noMoments: "No achievements shown yet.", signInToReact: "Sign in to say MashaAllah.", signIn: "Sign in", error: "That did not work. Please try again.",
  ownHint: "Your own achievement. Others can honour it with MashaAllah.",
  kind_certificate: "Certificate", kind_exam: "Exam", kind_level: "Level up", kind_juz: "Juz memorised", kind_tree: "Tree stage",
  kind_sticker: "Sticker", kind_streak: "Streak", kind_course: "Course", kind_hifz: "Hifz stage", legendary: "Legendary",
  photoTitle: "Profile photo", photoChoose: "Choose photo", photoRemove: "Remove photo", photoSaving: "Saving photo …",
  photoHint: "JPEG or PNG. Cropped square and saved without location data. Others see photos only from age 16; otherwise your initials are shown.",
  photoTooBig: "Please choose an image under 15 MB.",
};
export type PwKey = keyof typeof en;
const de: Record<PwKey, string> = {
  usernameFree: "Verfügbar", usernameChecking: "Wird geprüft …", username_format: "3 bis 20 Zeichen: a-z, 0-9, Punkt, Unterstrich.",
  username_reserved: "Dieser Benutzername ist reserviert.", username_taken: "Dieser Benutzername ist schon vergeben.", username_inappropriate: "Bitte wählen Sie einen anderen Benutzernamen.",
  followedBy1: "Gefolgt von {a}", followedBy2: "Gefolgt von {a} und {b}", followedByMore: "Gefolgt von {a}, {b} und {n} weiteren",
  mashaallah: "MashaAllah", tabAchievements: "Erfolge", tabSijill: "Sijill", tabBadges: "Abzeichen",
  share: "Profil teilen", copied: "Link kopiert", editProfile: "Profil bearbeiten",
  doubleTap: "Doppelklicken oder auf das Herz tippen, um MashaAllah zu sagen", sayMashaAllah: "MashaAllah sagen", takeBack: "MashaAllah zurücknehmen",
  close: "Schließen", prev: "Zurück", next: "Weiter", momentOf: "Erfolg {n} von {m}", maCount: "{n} MashaAllah",
  noMoments: "Noch keine Erfolge sichtbar.", signInToReact: "Melden Sie sich an, um MashaAllah zu sagen.", signIn: "Anmelden", error: "Das hat nicht geklappt. Bitte versuchen Sie es erneut.",
  ownHint: "Ihr eigener Erfolg. Andere können ihn mit MashaAllah würdigen.",
  kind_certificate: "Zertifikat", kind_exam: "Prüfung", kind_level: "Neues Level", kind_juz: "Juz auswendig", kind_tree: "Baumstufe",
  kind_sticker: "Sticker", kind_streak: "Serie", kind_course: "Kurs", kind_hifz: "Hifz-Stufe", legendary: "Legendär",
  photoTitle: "Profilfoto", photoChoose: "Foto wählen", photoRemove: "Foto entfernen", photoSaving: "Foto wird gespeichert …",
  photoHint: "JPEG oder PNG. Quadratisch zugeschnitten und ohne Standortdaten gespeichert. Fotos sehen andere erst ab 16 Jahren, sonst erscheinen Ihre Initialen.",
  photoTooBig: "Bitte wählen Sie ein Bild unter 15 MB.",
};
const ar: Record<PwKey, string> = {
  usernameFree: "متاح", usernameChecking: "جارٍ التحقق …", username_format: "من 3 إلى 20 حرفًا: a-z و0-9 والنقطة والشرطة السفلية.",
  username_reserved: "اسم المستخدم هذا محجوز.", username_taken: "اسم المستخدم هذا مستخدم بالفعل.", username_inappropriate: "يرجى اختيار اسم مستخدم آخر.",
  followedBy1: "يتابعه {a}", followedBy2: "يتابعه {a} و{b}", followedByMore: "يتابعه {a} و{b} و{n} آخرون",
  mashaallah: "ما شاء الله", tabAchievements: "الإنجازات", tabSijill: "السجل", tabBadges: "الشارات",
  share: "مشاركة الملف", copied: "تم نسخ الرابط", editProfile: "تعديل الملف",
  doubleTap: "انقروا مرتين أو اضغطوا على القلب لقول ما شاء الله", sayMashaAllah: "قولوا ما شاء الله", takeBack: "التراجع عن ما شاء الله",
  close: "إغلاق", prev: "السابق", next: "التالي", momentOf: "الإنجاز {n} من {m}", maCount: "{n} ما شاء الله",
  noMoments: "لا توجد إنجازات ظاهرة بعد.", signInToReact: "سجّلوا الدخول لقول ما شاء الله.", signIn: "تسجيل الدخول", error: "لم ينجح ذلك. يرجى المحاولة مرة أخرى.",
  ownHint: "إنجازكم الخاص. يمكن للآخرين تكريمه بقول ما شاء الله.",
  kind_certificate: "شهادة", kind_exam: "اختبار", kind_level: "مستوى جديد", kind_juz: "جزء محفوظ", kind_tree: "مرحلة الشجرة",
  kind_sticker: "ملصق", kind_streak: "سلسلة أيام", kind_course: "دورة", kind_hifz: "مرحلة الحفظ", legendary: "أسطوري",
  photoTitle: "صورة الملف", photoChoose: "اختيار صورة", photoRemove: "حذف الصورة", photoSaving: "جارٍ حفظ الصورة …",
  photoHint: "JPEG أو PNG. تُقصّ مربّعةً وتُحفظ دون بيانات الموقع. لا يرى الآخرون الصور إلا من سن 16، وإلا تظهر الأحرف الأولى من اسمكم.",
  photoTooBig: "يرجى اختيار صورة أصغر من 15 ميغابايت.",
};
const ALL: Record<string, Record<PwKey, string>> = { en, de, ar };
export function profileText(locale: string): Record<PwKey, string> {
  return ALL[locale] ?? en;
}
