import { useState } from "react";
import { Linking, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GoldCard, StarLattice } from "@/components/brand";
import { ProGate } from "@/components/page";
import { Icon, type IconName } from "@/components/icons";
import { useStored } from "@/lib/store";
import { SITE } from "@/lib/api";
import { ARABIC_FONT, AR_RIGHT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { BrandFoot, CARD_SIZE, ShareSheet, type ShareFormat } from "@/features/feed/share";
import { SAVED_KEY, toggleSaved, type HadithItem } from "./data";
import { fill, useHadithText } from "./texts";

/** Arabic as published, right-aligned, with the app's Quran font */
export function ArabicBlock({ text, size = 22, color, lines }: { text: string; size?: number; color?: string; lines?: number }) {
  const t = useTheme();
  return (
    <Text lang="ar" numberOfLines={lines} style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.95, color: color ?? t.arabic, writingDirection: "rtl", textAlign: AR_RIGHT }}>{text}</Text>
  );
}

export function ActionButton({ icon, label, on, onPress, onStage }: { icon: IconName; label: string; on?: boolean; onPress: () => void; onStage?: boolean }) {
  const t = useTheme();
  const c = onStage ? stage.gold : t.gold;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={on !== undefined ? { selected: on } : undefined} hitSlop={6}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 7, minHeight: 40, paddingHorizontal: 13, borderRadius: R.pill, borderWidth: 1,
        borderColor: on ? c : onStage ? stage.goldSoft : t.line, backgroundColor: pressed ? (onStage ? "rgba(255,255,255,0.08)" : t.bg) : on ? (onStage ? "rgba(214,180,108,0.15)" : t.accentSoft) : "transparent" })}>
      <Icon name={icon} color={c} size={16} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: onStage ? "#fff" : t.ink }}>{label}</Text>
    </Pressable>
  );
}

/** save state of one item (re-renders when the saved list changes) */
export function useSavedState(id: string) {
  const all = useStored<HadithItem[]>(SAVED_KEY, []);
  return all.some((x) => x.id === id);
}

/** one hadith: Arabic, translation, reference, gradings, translator; actions save and share */
export function HadithCard({ item, style, maxLines }: { item: HadithItem; style?: StyleProp<ViewStyle>; maxLines?: number }) {
  const t = useTheme();
  const x = useHadithText();
  const { lang } = useLang();
  const saved = useSavedState(item.id);
  const [share, setShare] = useState(false);
  const foreign = !!item.text && item.textLang !== lang && lang !== "en" && item.source !== "nahj";
  return (
    <GoldCard style={style}>
      {item.chapter ? <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", color: t.gold, marginBottom: 10 }} numberOfLines={2}>{item.chapter}</Text> : null}
      {item.arabic ? <ArabicBlock text={item.arabic} lines={maxLines} /> : null}
      {item.text ? (
        <Text lang={item.textLang} style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.ink, marginTop: item.arabic ? 12 : 0, writingDirection: item.textLang === "ur" ? "rtl" : "auto" }} numberOfLines={maxLines}>{item.text}</Text>
      ) : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold, marginTop: 14 }}>{item.reference}</Text>
      {item.grades.length ? (
        <View style={{ marginTop: 6, gap: 2 }} accessible accessibilityLabel={`${x.grade}: ${item.grades.map((g) => `${g.by} ${g.grade}`).join(", ")}`}>
          {item.grades.map((g) => <Text key={g.by} style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{x.grade} · {g.by}: <Text style={{ fontFamily: FONT.semibold, color: t.ink }}>{g.grade}</Text></Text>)}
        </View>
      ) : null}
      {item.translator ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, marginTop: 4 }}>{fill(x.translator, { name: item.translator })}</Text> : null}
      {item.source === "nahj" ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, marginTop: 4 }}>{item.credit}</Text> : null}
      {foreign ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 4, fontStyle: "italic" }}>{x.englishOnly}</Text> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        <ActionButton icon="bookmark" label={saved ? x.saved : x.save} on={saved} onPress={() => toggleSaved(item)} />
        <ActionButton icon="send" label={x.share} onPress={() => setShare(true)} />
        {item.url && item.source === "thaqalayn" ? <ActionButton icon="globe" label={x.openSource} onPress={() => void Linking.openURL(item.url!)} /> : null}
      </View>
      {share ? <HadithShare item={item} onClose={() => setShare(false)} /> : null}
    </GoldCard>
  );
}

/** the share sheet of the feed with a hadith image: Arabic, text, reference and the source's credit line */
export function HadithShare({ item, onClose }: { item: HadithItem; onClose: () => void }) {
  const link = item.source === "nahj" && item.url ? item.url : SITE;
  const message = `${item.text ? `${item.text.length > 400 ? `${item.text.slice(0, 400)} …` : item.text}\n` : ""}— ${item.reference}${item.source === "nahj" ? `\n${item.credit}` : ""}`;
  return <ShareSheet visible onClose={onClose} link={link} message={message} renderCard={(f) => <ShareImage item={item} format={f} />} />;
}

function ShareImage({ item, format }: { item: HadithItem; format: ShareFormat }) {
  const { w, h } = CARD_SIZE[format];
  const len = item.text.length + (item.arabic?.length ?? 0) * 0.6;
  const size = len > 900 ? 13 : len > 600 ? 14.5 : len > 350 ? 16.5 : 19;
  const arLines = format === "story" ? 6 : 4;
  return (
    <LinearGradient colors={[stage.bg, stage.deep]} style={{ width: w, height: h, padding: 26, justifyContent: "space-between", overflow: "hidden" }}>
      <StarLattice opacity={0.06} />
      <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{item.collectionName}</Text>
      <View style={{ gap: 12 }}>
        {item.arabic ? <Text allowFontScaling={false} numberOfLines={arLines} style={{ fontFamily: ARABIC_FONT, fontSize: size + 3, lineHeight: (size + 3) * 1.9, color: stage.cream, writingDirection: "rtl", textAlign: "center" }}>{item.arabic}</Text> : null}
        {item.text ? <Text allowFontScaling={false} numberOfLines={format === "story" ? 18 : 12} style={{ fontFamily: FONT.regular, fontSize: size, lineHeight: size * 1.5, color: "#fff", textAlign: "center" }}>{item.text}</Text> : null}
        <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: stage.gold, textAlign: "center" }}>{item.reference}</Text>
        {item.source === "nahj" ? <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 11, color: stage.textSoft, textAlign: "center" }}>{item.credit}</Text> : null}
      </View>
      <BrandFoot />
    </LinearGradient>
  );
}

/** small state view for loading / offline with a retry */
export function LoadState({ state, onRetry }: { state: "loading" | "error"; onRetry?: () => void }) {
  const t = useTheme();
  const x = useHadithText();
  return (
    <View style={{ paddingVertical: 24, alignItems: "center", gap: 12 }} accessibilityLiveRegion="polite">
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.muted, textAlign: "center" }}>{state === "loading" ? x.loading : x.offline}</Text>
      {state === "error" && onRetry ? <ActionButton icon="repeat" label={x.retry} onPress={onRetry} /> : null}
    </View>
  );
}

/** how many entries of each section (book, page, Nahj section) are free in the app; the rest needs Pro */
export const HADITH_FREE_PREVIEW = 3;

/** the Pro card under a free preview */
export function HadithProCard() {
  const x = useHadithText();
  return <ProGate feature="general" title={x.proTitle} text={x.proText} />;
}

/** loading or "not available" while content from the server is not on the device yet */
export function ContentState({ status, onRetry, onStage }: { status: "loading" | "missing"; onRetry: () => void; onStage?: boolean }) {
  const x = useHadithText();
  const t = useTheme();
  return (
    <View style={{ padding: 24, gap: 14, alignItems: "center" }} accessibilityLiveRegion="polite">
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: onStage ? stage.textSoft : t.muted, textAlign: "center" }}>{status === "loading" ? x.contentLoading : x.contentMissing}</Text>
      {status === "missing" ? <ActionButton icon="repeat" label={x.retry} onPress={onRetry} onStage={onStage} /> : null}
    </View>
  );
}
