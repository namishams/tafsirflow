import { Linking, Text, View } from "react-native";
import { useLang } from "@/i18n";
import { FONT, useTheme } from "@/lib/theme";

// The published contact for safety and moderation with the stated response time (App Store guideline 1.2): shown in
// every report sheet, in the network settings and under the community guidelines. 14 languages, formal address.
export const SAFETY_EMAIL = "info@quranmasterclass.com";
const TX: Record<string, { label: string; time: string }> = {
  de: { label: "Kontakt für Sicherheit und Moderation", time: "Wir antworten innerhalb von 24 Stunden. In akuter Gefahr wenden Sie sich bitte sofort an den örtlichen Notruf." },
  en: { label: "Contact for safety and moderation", time: "We respond within 24 hours. If someone is in immediate danger, please call your local emergency number right away." },
  ar: { label: "التواصل بشأن الأمان والإشراف", time: "نردّ خلال 24 ساعة. إذا كان أحد في خطر داهم فاتصلوا فورًا برقم الطوارئ المحلي." },
  tr: { label: "Güvenlik ve moderasyon iletişimi", time: "24 saat içinde yanıt veriyoruz. Acil bir tehlike varsa lütfen hemen yerel acil durum numarasını arayın." },
  ur: { label: "حفاظت اور نگرانی کے لیے رابطہ", time: "ہم 24 گھنٹوں کے اندر جواب دیتے ہیں۔ فوری خطرے کی صورت میں براہِ کرم فوراً مقامی ہنگامی نمبر پر رابطہ کریں۔" },
  fa: { label: "تماس برای ایمنی و نظارت", time: "ما ظرف ۲۴ ساعت پاسخ می‌دهیم. در صورت خطر فوری لطفاً بی‌درنگ با شمارهٔ اورژانس محلی تماس بگیرید." },
  ps: { label: "د خوندیتوب او څارنې لپاره اړیکه", time: "موږ په ۲۴ ساعتونو کې ځواب ورکوو. که څوک په بېړني خطر کې وي، مهرباني وکړئ سمدستي سیمه‌ییز بېړني شمېرې ته زنګ ووهئ." },
  fr: { label: "Contact sécurité et modération", time: "Nous répondons dans les 24 heures. En cas de danger immédiat, appelez sans attendre le numéro d'urgence local." },
  es: { label: "Contacto de seguridad y moderación", time: "Respondemos en un plazo de 24 horas. Si alguien corre peligro inmediato, llame enseguida al número de emergencias local." },
  id: { label: "Kontak keamanan dan moderasi", time: "Kami menanggapi dalam 24 jam. Jika ada bahaya mendesak, segera hubungi nomor darurat setempat." },
  ms: { label: "Hubungan keselamatan dan moderasi", time: "Kami membalas dalam masa 24 jam. Jika ada bahaya segera, sila hubungi nombor kecemasan tempatan dengan serta-merta." },
  bn: { label: "নিরাপত্তা ও মডারেশনের যোগাযোগ", time: "আমরা 24 ঘণ্টার মধ্যে উত্তর দিই। কেউ তাৎক্ষণিক বিপদে থাকলে অনুগ্রহ করে এখনই স্থানীয় জরুরি নম্বরে ফোন করুন।" },
  ru: { label: "Контакт по вопросам безопасности и модерации", time: "Мы отвечаем в течение 24 часов. Если кому-то грозит непосредственная опасность, сразу звоните в местную экстренную службу." },
  zh: { label: "安全与审核联系方式", time: "我们会在 24 小时内回复。如有人身处紧急危险，请立即拨打当地急救电话。" },
};
export const safetyText = (lang: string) => TX[lang] ?? TX.en;

export function SafetyContact({ compact = false }: { compact?: boolean }) {
  const t = useTheme();
  const { lang } = useLang();
  const x = safetyText(lang);
  return (
    <View style={{ gap: 4, paddingVertical: compact ? 4 : 8 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{x.label}</Text>
      <Text onPress={() => void Linking.openURL(`mailto:${SAFETY_EMAIL}`).catch(() => undefined)} accessibilityRole="link"
        style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.accent }}>{SAFETY_EMAIL}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{x.time}</Text>
    </View>
  );
}
