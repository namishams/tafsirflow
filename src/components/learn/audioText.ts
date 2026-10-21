"use client";
// Texts for course sound (recordings and the device voice) in all 14 languages, copied from the app
// (mobile/src/features/coursekit/audioText.ts; keep both in step). Always the polite form of address.
import { useCallback } from "react";
import { pick, useLang } from "@/lib/learn/i18n";

const en = {
  clipFailed: "The recording could not be loaded. Tap to try again.",
  clipVoice: "The recording could not be loaded, so the device voice read it. Tap to try the recording again.",
  loadFailed: "The exercises could not be loaded. Please check your connection.",
  tryAgain: "Try again",
  loading: "Loading…",
  noVoice: "This device has no Arabic voice for speech output, so the listening exercises are left out. You can add an Arabic voice in the system settings.",
};
type T = typeof en;
const de: T = {
  clipFailed: "Die Aufnahme konnte nicht geladen werden. Tippen Sie, um es erneut zu versuchen.",
  clipVoice: "Die Aufnahme konnte nicht geladen werden, deshalb hat die Gerätestimme vorgelesen. Tippen Sie, um die Aufnahme erneut zu laden.",
  loadFailed: "Die Übungen konnten nicht geladen werden. Bitte prüfen Sie Ihre Verbindung.",
  tryAgain: "Erneut versuchen",
  loading: "Wird geladen…",
  noVoice: "Dieses Gerät hat keine arabische Stimme für die Sprachausgabe, deshalb entfallen die Hörübungen. Sie können eine arabische Stimme in den Systemeinstellungen hinzufügen.",
};
const ar: T = {
  clipFailed: "تعذّر تحميل التسجيل. اضغط للمحاولة مرة أخرى.",
  clipVoice: "تعذّر تحميل التسجيل، فقرأه صوت الجهاز. اضغط لإعادة محاولة التسجيل.",
  loadFailed: "تعذّر تحميل التمارين. يُرجى التحقق من الاتصال.",
  tryAgain: "إعادة المحاولة",
  loading: "جارٍ التحميل…",
  noVoice: "لا يوجد في هذا الجهاز صوت عربي للنطق، لذلك تُحذف تمارين الاستماع. يمكنك إضافة صوت عربي من إعدادات النظام.",
};
const tr: T = {
  clipFailed: "Kayıt yüklenemedi. Tekrar denemek için dokunun.",
  clipVoice: "Kayıt yüklenemedi, bu yüzden cihaz sesi okudu. Kaydı tekrar denemek için dokunun.",
  loadFailed: "Alıştırmalar yüklenemedi. Lütfen bağlantınızı kontrol edin.",
  tryAgain: "Tekrar deneyin",
  loading: "Yükleniyor…",
  noVoice: "Bu cihazda konuşma için Arapça ses yok, bu yüzden dinleme alıştırmaları atlanır. Sistem ayarlarından Arapça bir ses ekleyebilirsiniz.",
};
const ur: T = {
  clipFailed: "ریکارڈنگ لوڈ نہیں ہو سکی۔ دوبارہ کوشش کے لیے ٹیپ کریں۔",
  clipVoice: "ریکارڈنگ لوڈ نہیں ہو سکی، اس لیے آلے کی آواز نے پڑھا۔ ریکارڈنگ دوبارہ آزمانے کے لیے ٹیپ کریں۔",
  loadFailed: "مشقیں لوڈ نہیں ہو سکیں۔ براہِ کرم اپنا کنکشن چیک کریں۔",
  tryAgain: "دوبارہ کوشش کریں",
  loading: "لوڈ ہو رہا ہے…",
  noVoice: "اس آلے میں بولنے کے لیے عربی آواز نہیں ہے، اس لیے سننے کی مشقیں شامل نہیں ہیں۔ آپ سسٹم کی ترتیبات میں عربی آواز شامل کر سکتے ہیں۔",
};
const fa: T = {
  clipFailed: "ضبط بارگیری نشد. برای تلاش دوباره ضربه بزنید.",
  clipVoice: "ضبط بارگیری نشد، به همین دلیل صدای دستگاه آن را خواند. برای تلاش دوباره ضبط ضربه بزنید.",
  loadFailed: "تمرین‌ها بارگیری نشدند. لطفاً اتصال خود را بررسی کنید.",
  tryAgain: "تلاش دوباره",
  loading: "در حال بارگیری…",
  noVoice: "این دستگاه صدای عربی برای خواندن متن ندارد، بنابراین تمرین‌های شنیداری حذف می‌شوند. می‌توانید یک صدای عربی را در تنظیمات سیستم اضافه کنید.",
};
const ps: T = {
  clipFailed: "ثبت پورته نه شو. د بیا هڅې لپاره ټک وکړئ.",
  clipVoice: "ثبت پورته نه شو، نو د وسیلې غږ ولوست. د ثبت د بیا هڅې لپاره ټک وکړئ.",
  loadFailed: "تمرینونه پورته نه شول. مهرباني وکړئ خپل اتصال وګورئ.",
  tryAgain: "بیا هڅه وکړئ",
  loading: "پورته کېږي…",
  noVoice: "په دې وسیله کې د ویلو لپاره عربي غږ نشته، نو د اورېدو تمرینونه پرېښودل کېږي. تاسو کولی شئ د سیسټم په ترتیباتو کې عربي غږ ورزیات کړئ.",
};
const fr: T = {
  clipFailed: "L’enregistrement n’a pas pu être chargé. Touchez pour réessayer.",
  clipVoice: "L’enregistrement n’a pas pu être chargé, la voix de l’appareil l’a donc lu. Touchez pour réessayer l’enregistrement.",
  loadFailed: "Les exercices n’ont pas pu être chargés. Veuillez vérifier votre connexion.",
  tryAgain: "Réessayer",
  loading: "Chargement…",
  noVoice: "Cet appareil n’a pas de voix arabe pour la synthèse vocale, les exercices d’écoute sont donc omis. Vous pouvez ajouter une voix arabe dans les réglages du système.",
};
const es: T = {
  clipFailed: "No se pudo cargar la grabación. Toque para intentarlo de nuevo.",
  clipVoice: "No se pudo cargar la grabación, así que la leyó la voz del dispositivo. Toque para volver a intentar la grabación.",
  loadFailed: "No se pudieron cargar los ejercicios. Compruebe su conexión.",
  tryAgain: "Intentar de nuevo",
  loading: "Cargando…",
  noVoice: "Este dispositivo no tiene una voz árabe para la lectura en voz alta, por eso se omiten los ejercicios de escucha. Puede añadir una voz árabe en los ajustes del sistema.",
};
const id: T = {
  clipFailed: "Rekaman tidak dapat dimuat. Ketuk untuk mencoba lagi.",
  clipVoice: "Rekaman tidak dapat dimuat, jadi suara perangkat yang membacakannya. Ketuk untuk mencoba rekaman lagi.",
  loadFailed: "Latihan tidak dapat dimuat. Silakan periksa koneksi Anda.",
  tryAgain: "Coba lagi",
  loading: "Memuat…",
  noVoice: "Perangkat ini tidak memiliki suara bahasa Arab untuk pembacaan, sehingga latihan mendengar dilewati. Anda dapat menambahkan suara bahasa Arab di pengaturan sistem.",
};
const ms: T = {
  clipFailed: "Rakaman tidak dapat dimuatkan. Ketik untuk mencuba lagi.",
  clipVoice: "Rakaman tidak dapat dimuatkan, jadi suara peranti yang membacanya. Ketik untuk mencuba rakaman sekali lagi.",
  loadFailed: "Latihan tidak dapat dimuatkan. Sila semak sambungan anda.",
  tryAgain: "Cuba lagi",
  loading: "Memuatkan…",
  noVoice: "Peranti ini tiada suara bahasa Arab untuk pertuturan, jadi latihan mendengar ditinggalkan. Anda boleh menambah suara bahasa Arab dalam tetapan sistem.",
};
const bn: T = {
  clipFailed: "রেকর্ডিংটি লোড করা যায়নি। আবার চেষ্টা করতে ট্যাপ করুন।",
  clipVoice: "রেকর্ডিংটি লোড করা যায়নি, তাই ডিভাইসের কণ্ঠ এটি পড়েছে। রেকর্ডিংটি আবার চেষ্টা করতে ট্যাপ করুন।",
  loadFailed: "অনুশীলনগুলো লোড করা যায়নি। অনুগ্রহ করে আপনার সংযোগ পরীক্ষা করুন।",
  tryAgain: "আবার চেষ্টা করুন",
  loading: "লোড হচ্ছে…",
  noVoice: "এই ডিভাইসে উচ্চারণের জন্য কোনো আরবি কণ্ঠ নেই, তাই শোনার অনুশীলনগুলো বাদ দেওয়া হয়েছে। আপনি সিস্টেম সেটিংসে একটি আরবি কণ্ঠ যোগ করতে পারেন।",
};
const ru: T = {
  clipFailed: "Не удалось загрузить запись. Нажмите, чтобы попробовать снова.",
  clipVoice: "Не удалось загрузить запись, поэтому её прочитал голос устройства. Нажмите, чтобы снова загрузить запись.",
  loadFailed: "Не удалось загрузить упражнения. Пожалуйста, проверьте подключение.",
  tryAgain: "Попробовать снова",
  loading: "Загрузка…",
  noVoice: "На этом устройстве нет арабского голоса для озвучивания, поэтому упражнения на слух пропускаются. Вы можете добавить арабский голос в системных настройках.",
};
const zh: T = {
  clipFailed: "录音无法加载。请点按重试。",
  clipVoice: "录音无法加载，因此由设备语音朗读。请点按重新尝试录音。",
  loadFailed: "练习无法加载。请检查您的网络连接。",
  tryAgain: "重试",
  loading: "正在加载…",
  noVoice: "此设备没有用于朗读的阿拉伯语语音，因此省略听力练习。您可以在系统设置中添加阿拉伯语语音。",
};

export type AudioKey = keyof T;
export function useAudioT() {
  const { lang } = useLang();
  return useCallback((k: AudioKey) => pick<T>({ en, de, ar, tr, ur, fa, ps, fr, es, id, ms, bn, ru, zh }, lang)[k], [lang]);
}
