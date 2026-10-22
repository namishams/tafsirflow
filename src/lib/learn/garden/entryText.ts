import { useLang } from "@/lib/learn/i18n";

// mirrors mobile/src/features/garden/entryText.ts: texts of the garden entry card (GardenEntryCard), polite address.
// Keep both copies in step.
export type EntryText = { today: string; todayGp: string; todayNone: string; watered: string; nextT: string; enter: string; ring: string; grown: string };
export const ENTRY_TEXT: Record<string, EntryText> = {
  en: { today: "Today", todayGp: "+{n} growth today", todayNone: "No growth yet today", watered: "Watered today", nextT: "Next stage", enter: "Enter your garden", ring: "{p} percent to the next stage", grown: "Fully grown" },
  de: { today: "Heute", todayGp: "+{n} Wachstum heute", todayNone: "Heute noch kein Wachstum", watered: "Heute gegossen", nextT: "Nächste Stufe", enter: "Garten betreten", ring: "{p} Prozent bis zur nächsten Stufe", grown: "Ausgewachsen" },
  ar: { today: "اليوم", todayGp: "+{n} نمو اليوم", todayNone: "لا نمو بعدُ اليوم", watered: "سُقيت اليوم", nextT: "المرحلة التالية", enter: "الدخول إلى حديقتكم", ring: "{p} بالمئة حتى المرحلة التالية", grown: "اكتمل نموها" },
  tr: { today: "Bugün", todayGp: "Bugün +{n} büyüme", todayNone: "Bugün henüz büyüme yok", watered: "Bugün sulandı", nextT: "Sonraki aşama", enter: "Bahçenize girin", ring: "Sonraki aşamaya kadar yüzde {p}", grown: "Tamamen büyüdü" },
  ur: { today: "آج", todayGp: "آج +{n} نشوونما", todayNone: "آج ابھی تک کوئی نشوونما نہیں", watered: "آج پانی دیا گیا", nextT: "اگلا مرحلہ", enter: "اپنے باغ میں تشریف لائیں", ring: "اگلے مرحلے تک {p} فیصد", grown: "مکمل بڑھ چکا ہے" },
  fa: { today: "امروز", todayGp: "+{n} رشد امروز", todayNone: "امروز هنوز رشدی نبوده", watered: "امروز آبیاری شد", nextT: "مرحلهٔ بعد", enter: "ورود به باغ شما", ring: "{p} درصد تا مرحلهٔ بعد", grown: "کاملاً رشد کرده" },
  ps: { today: "نن", todayGp: "نن +{n} وده", todayNone: "نن تر اوسه وده نشته", watered: "نن اوبه ورکړل شوې", nextT: "بل پړاو", enter: "خپل باغ ته ورننوځئ", ring: "بل پړاو ته {p} سلنه", grown: "بشپړ لوی شوی" },
  fr: { today: "Aujourd'hui", todayGp: "+{n} de croissance aujourd'hui", todayNone: "Pas encore de croissance aujourd'hui", watered: "Arrosé aujourd'hui", nextT: "Prochaine étape", enter: "Entrer dans votre jardin", ring: "{p} pour cent jusqu'à la prochaine étape", grown: "Pleinement grandi" },
  es: { today: "Hoy", todayGp: "+{n} de crecimiento hoy", todayNone: "Hoy aún sin crecimiento", watered: "Regado hoy", nextT: "Siguiente etapa", enter: "Entrar en su jardín", ring: "{p} por ciento hasta la siguiente etapa", grown: "Totalmente crecido" },
  id: { today: "Hari ini", todayGp: "+{n} pertumbuhan hari ini", todayNone: "Belum ada pertumbuhan hari ini", watered: "Disiram hari ini", nextT: "Tahap berikutnya", enter: "Masuki taman Anda", ring: "{p} persen menuju tahap berikutnya", grown: "Tumbuh sempurna" },
  ms: { today: "Hari ini", todayGp: "+{n} pertumbuhan hari ini", todayNone: "Belum ada pertumbuhan hari ini", watered: "Disiram hari ini", nextT: "Peringkat seterusnya", enter: "Masuki taman anda", ring: "{p} peratus ke peringkat seterusnya", grown: "Tumbuh sepenuhnya" },
  bn: { today: "আজ", todayGp: "আজ +{n} বৃদ্ধি", todayNone: "আজ এখনও কোনো বৃদ্ধি নেই", watered: "আজ পানি দেওয়া হয়েছে", nextT: "পরবর্তী ধাপ", enter: "আপনার বাগানে প্রবেশ করুন", ring: "পরবর্তী ধাপ পর্যন্ত {p} শতাংশ", grown: "পূর্ণ বেড়ে উঠেছে" },
  ru: { today: "Сегодня", todayGp: "+{n} роста сегодня", todayNone: "Сегодня роста пока нет", watered: "Полито сегодня", nextT: "Следующая ступень", enter: "Войти в ваш сад", ring: "{p} процентов до следующей ступени", grown: "Полностью вырос" },
  zh: { today: "今天", todayGp: "今天成长 +{n}", todayNone: "今天尚无成长", watered: "今天已浇水", nextT: "下一阶段", enter: "进入您的花园", ring: "距下一阶段 {p}%", grown: "已完全长成" },
};
export function useEntryText(): EntryText { const { lang } = useLang(); return ENTRY_TEXT[lang] ?? ENTRY_TEXT.en; }
