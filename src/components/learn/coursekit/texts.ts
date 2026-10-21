// A few website-only strings of the course engine (the app has no name field, no clipboard fallback and no hub link).
// en/de/ar written (Sie-form), other languages fall back to English. Everything else comes from CK in
// src/lib/learn/abrahamic/kit.ts (the app's own texts).
import type { L } from "@/lib/learn/abrahamic/core";

export const WEB: Record<string, L> = {
  hub: { en: "Masterclass", de: "Masterclass", ar: "Masterclass" },
  name: { en: "Name on the certificate (optional)", de: "Name auf dem Zertifikat (optional)", ar: "الاسم على الشهادة (اختياري)" },
  nameHint: {
    en: "The certificate stays on this device. The name is not saved.",
    de: "Das Zertifikat bleibt auf diesem Gerät. Der Name wird nicht gespeichert.",
    ar: "تبقى الشهادة على هذا الجهاز، ولا يُحفظ الاسم.",
  },
  copied: { en: "Copied to the clipboard.", de: "In die Zwischenablage kopiert.", ar: "تم النسخ إلى الحافظة." },
  print: { en: "Print", de: "Drucken", ar: "طباعة" },
  source: { en: "Source", de: "Quelle", ar: "المصدر" },
  image: { en: "Image", de: "Bild", ar: "الصورة" },
  collapse: { en: "Collapse", de: "Zuklappen", ar: "طيّ" },
  expand: { en: "Expand", de: "Aufklappen", ar: "توسيع" },
};
