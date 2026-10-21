import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { router, type Href } from "expo-router";
import { useLang } from "@/i18n";
import { FONT, useTheme } from "@/lib/theme";

// The calm note shown where content used to carry a "draft" / "needs review" badge. All fourteen languages,
// polite address. The internal review-status fields in the data stay as they are.
const NOTE: Record<string, [string, string]> = {
  en: ["Prepared with care from classical sources.", "Found a mistake? Report it."],
  de: ["Mit Sorgfalt aus klassischen Quellen erarbeitet.", "Einen Fehler gefunden? Bitte melden Sie ihn."],
  ar: ["أُعِدَّ بعناية من المصادر الكلاسيكية.", "وجدتم خطأً؟ نرجو أن تبلّغونا عنه."],
  tr: ["Klasik kaynaklardan özenle hazırlanmıştır.", "Bir hata mı buldunuz? Lütfen bildirin."],
  ur: ["کلاسیکی مصادر سے احتیاط کے ساتھ تیار کیا گیا ہے۔", "کوئی غلطی ملی؟ براہِ کرم اطلاع دیں۔"],
  fa: ["با دقت از منابع کلاسیک تهیه شده است.", "اشتباهی یافتید؟ لطفاً گزارش دهید."],
  ps: ["له کلاسیکو سرچینو څخه په پاملرنه برابر شوی دی.", "تېروتنه مو وموندله؟ مهرباني وکړئ خبر یې کړئ."],
  fr: ["Élaboré avec soin à partir de sources classiques.", "Vous avez trouvé une erreur ? Merci de la signaler."],
  es: ["Elaborado con esmero a partir de fuentes clásicas.", "¿Ha encontrado un error? Por favor, infórmenos."],
  id: ["Disusun dengan cermat dari sumber-sumber klasik.", "Menemukan kesalahan? Mohon laporkan."],
  ms: ["Disediakan dengan teliti daripada sumber-sumber klasik.", "Menemui kesilapan? Sila laporkan."],
  bn: ["ধ্রুপদী উৎস থেকে যত্নসহকারে প্রস্তুত করা হয়েছে।", "কোনো ভুল পেয়েছেন? অনুগ্রহ করে জানান।"],
  ru: ["Подготовлено с заботой по классическим источникам.", "Нашли ошибку? Пожалуйста, сообщите."],
  zh: ["依据经典资料认真编写。", "发现错误？请您告知我们。"],
};

export function careNoteText(lang: string): { note: string; report: string } {
  const [note, report] = NOTE[lang] ?? NOTE.en;
  return { note, report };
}

/** "Prepared with care from classical sources. Found a mistake? Report it." The report link opens `onReport`, by default the feedback form. */
export function CareNote({ onReport, style, size = 11.5 }: { onReport?: () => void; style?: StyleProp<ViewStyle>; size?: number }) {
  const t = useTheme();
  const { lang } = useLang();
  const x = careNoteText(lang);
  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 6 }, style]}>
      <Text style={{ fontFamily: FONT.regular, fontSize: size, color: t.muted, textAlign: "left" }}>{x.note}</Text>
      <Pressable onPress={onReport ?? (() => router.push("/feedback" as Href))} hitSlop={8} accessibilityRole="link" accessibilityLabel={x.report}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: size, color: t.accent, textDecorationLine: "underline" }}>{x.report}</Text>
      </Pressable>
    </View>
  );
}
