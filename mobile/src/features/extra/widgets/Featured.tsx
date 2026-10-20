import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { SectionTitle, Stage } from "@/components/brand";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { getChapter, getVerseByKey, type Chapter, type SingleVerse } from "@/lib/quran";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, stage, useTheme, AR_RIGHT } from "@/lib/theme";
import { DUA_OF_MONTH, SURAH_OF_MONTH, hijriMonth, surahOfDay } from "@/web/featured";
import { hijriMonthName } from "@/web/hijri";
import { SUNNAH_DUAS } from "@/web/sunnahDuas";
import { SUNNAH_DUAS_2 } from "@/web/sunnahDuas2";
import { GOLD, GOLD_L, IllumFrame, Rosette, alpha, useHm } from "../art";
import { openVerse } from "../links";

/** Hijri month 1–12: the Umm al-Qura calendar through Intl when the JS engine supports it, otherwise the tabular calendar */
export function safeHijriMonth(d = new Date()): number {
  try {
    const f = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { year: "numeric", timeZone: "UTC" });
    const y = Number(f.formatToParts(d).find((p) => p.type === "year")?.value);
    if (y > 1300 && y < 1700) return hijriMonth(d);
  } catch { /* fall through */ }
  // tabular Islamic calendar (Kuwaiti algorithm) from the Julian day number
  const jd = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12) / 86400000 + 2440587.5);
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  return Math.min(12, Math.max(1, Math.floor((24 * l) / 709)));
}

/** the pointed niche drawn faintly inside the light cards (.niche) */
function Niche({ color }: { color: string }) {
  return (
    <Svg pointerEvents="none" style={{ position: "absolute", top: 10, right: 10, bottom: 10, left: 10 }} viewBox="0 0 100 140" preserveAspectRatio="none">
      <Path d="M2 140V40C2 20 30 8 50 2C70 8 98 20 98 40V140" fill="none" stroke={color} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
    </Svg>
  );
}

/**
 * "Today and this month" of the website's home page (Featured.tsx): surah of the day (al-Kahf on Fridays), surah of
 * the month and dua of the month chosen by the Hijri month, and the door to the dua generator. The dua's Arabic and
 * translation come from the server (Quran) or the website's hadith collection (Sunnah).
 * Props: layout "carousel" (default, swipeable cards for the Today tab) or "stack" (one under the other);
 * title (default true: the section heading "Today and this month").
 */
export function Featured({ layout = "carousel", title = true }: { layout?: "carousel" | "stack"; title?: boolean }) {
  const t = useTheme();
  const hm = useHm(t);
  const w = useWebT("featured");
  const { lang } = useLang();
  const { width } = useWindowDimensions();
  const now = useMemo(() => new Date(), []);
  const day = surahOfDay(now);
  const m = safeHijriMonth(now);
  const month = SURAH_OF_MONTH[m] ?? SURAH_OF_MONTH[1];
  const dua = DUA_OF_MONTH[m] ?? DUA_OF_MONTH[1];
  const monthName = hijriMonthName(m, lang);
  const [cDay, setCDay] = useState<Chapter | null>(null);
  const [cMonth, setCMonth] = useState<Chapter | null>(null);
  const [qDua, setQDua] = useState<SingleVerse | null>(null);

  useEffect(() => {
    let live = true;
    getChapter(day.surah, lang).then((c) => live && setCDay(c)).catch(() => undefined);
    getChapter(month.surah, lang).then((c) => live && setCMonth(c)).catch(() => undefined);
    if (dua.quran) getVerseByKey(dua.quran, lang).then((v) => live && setQDua(v)).catch(() => undefined);
    return () => { live = false; };
  }, [day.surah, month.surah, dua.quran, lang]);

  const sDua = dua.sunnah ? [...SUNNAH_DUAS, ...SUNNAH_DUAS_2].find((d) => d.id === dua.sunnah) : undefined;
  const duaAr = qDua?.text_uthmani ?? sDua?.ar ?? "";
  // website rule: de | ar | en; Arabic readers get no translation line and no Latin surah name
  const L = lang === "de" ? "de" : lang === "ar" ? "ar" : "en";
  const duaTr = L === "ar" ? "" : qDua?.translation ?? (sDua ? (L === "de" ? sDua.de : sDua.en) : "");
  const duaSrc = dua.quran ? `Quran ${dua.quran}` : sDua?.src ?? "";

  const cardW = layout === "carousel" ? Math.min(300, width - 64) : undefined;
  const kicker = (s: string, color: string) => <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.9, textTransform: "uppercase", color }}>{s}</Text>;
  const chapterLines = (c: Chapter | null, n: number) => (
    <>
      <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 32, lineHeight: 54, color: hm.goldD, writingDirection: "rtl", textAlign: "left", marginTop: 8 }}>{c ? `سورة ${c.name_arabic}` : " "}</Text>
      {L !== "ar" ? <Text style={{ fontFamily: FONT.bold, fontSize: 19, color: t.ink }}>{n}. {c?.name_simple ?? ""}</Text> : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted, marginTop: 2 }}>{c ? `${c.translated_name.name} · ${w("verses", { n: c.verses_count })}` : " "}</Text>
    </>
  );
  const light = (key: string, onPress: () => void, children: React.ReactNode, label: string) => (
    <Pressable key={key} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [{ width: cardW, borderRadius: R.card, borderWidth: 1, borderColor: alpha(GOLD, pressed ? 0.6 : 0.3), backgroundColor: t.surface, padding: 22, overflow: "hidden", minHeight: 250 }, pressed && { transform: [{ scale: 0.99 }] }]}>
      <Niche color={alpha(GOLD, 0.22)} />
      {children}
    </Pressable>
  );

  const cards = [
    light("day", () => router.push({ pathname: "/quran/[surah]", params: { surah: String(day.surah) } } as Href), (
      <View style={{ flex: 1 }}>
        {kicker(w("day"), hm.goldD)}
        {chapterLines(cDay, day.surah)}
        <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 12 }}>{day.friday ? w("friday") : w("dayLead")}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent, marginTop: 14 }}>{w("listen")}</Text>
      </View>
    ), `${w("day")}: ${cDay?.name_simple ?? day.surah}`),
    light("month", () => month.ref ? openVerse(month.ref) : router.push({ pathname: "/quran/[surah]", params: { surah: String(month.surah) } } as Href), (
      <View style={{ flex: 1 }}>
        {kicker(w("month", { month: monthName }), hm.goldD)}
        {chapterLines(cMonth, month.surah)}
        <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 12 }}>{month.reason[L]}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent, marginTop: 14 }}>{w("listen")}</Text>
      </View>
    ), `${w("month", { month: monthName })}: ${cMonth?.name_simple ?? month.surah}`),
    <Stage key="dua" rounded={R.card} style={{ width: cardW, minHeight: 250 }}>
      <IllumFrame rosettes={false} />
      <View style={{ padding: 22, flex: 1 }}>
        {kicker(w("dua", { month: monthName }), stage.gold)}
        <Text numberOfLines={4} style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 38, color: GOLD_L, writingDirection: "rtl", textAlign: AR_RIGHT, marginTop: 12 }}>{duaAr}</Text>
        {duaTr ? <Text numberOfLines={3} style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>{duaTr}</Text> : null}
        <Text numberOfLines={3} style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.5)", marginTop: 10 }}>{dua.reason[L]} · {duaSrc}</Text>
        <Text onPress={() => (dua.quran ? openVerse(dua.quran) : router.push("/duas" as Href))} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.gold, marginTop: 14 }}>{dua.quran ? w("listen") : w("moreDuas")}</Text>
      </View>
    </Stage>,
    <Pressable key="gen" onPress={() => router.push("/dua-generator" as Href)} accessibilityRole="button" accessibilityLabel={w("genTitle")}
      style={({ pressed }) => [{ width: cardW, borderRadius: R.card, overflow: "hidden", borderWidth: 1, borderColor: alpha(GOLD, 0.4), minHeight: 250 }, pressed && { transform: [{ scale: 0.99 }] }]}>
      <LinearGradient colors={["#2f2a44", "#0e0c18"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ flex: 1, padding: 22 }}>
        <Niche color="rgba(233,207,153,0.16)" />
        <Rosette size={34} color="rgb(214,180,108)" />
        <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 34, lineHeight: 56, color: GOLD_L, writingDirection: "rtl", textAlign: "left", marginTop: 6 }}>دعاء</Text>
        <Text style={{ fontFamily: FONT.bold, fontSize: 19, color: "#ffffff" }}>{w("genTitle")}</Text>
        <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>{w("genLead")}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: GOLD_L, marginTop: 14 }}>{w("genCta")}</Text>
      </LinearGradient>
    </Pressable>,
  ];

  return (
    <View>
      {title ? <SectionTitle title={w("title")} style={{ paddingHorizontal: layout === "carousel" ? 16 : 0 }} /> : null}
      {layout === "carousel" ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={(cardW ?? 280) + 12} decelerationRate="fast" contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
          {cards}
        </ScrollView>
      ) : <View style={{ gap: 12 }}>{cards}</View>}
    </View>
  );
}
