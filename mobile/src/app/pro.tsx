import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import Svg, { Circle, G, Path } from "react-native-svg";
import { CALLIG_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { Arcade, Display, Eyebrow, GoldButton, GoldCard, LogoMark, OutlineButton, SmallStar, Stage, TextLink } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { intlLocale, useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { usePro, type ProFeature } from "@/lib/pro";
import { SITE } from "@/lib/api";
import { TILES } from "@/web/tiles";
import { loadPrices, manageSubscriptions, purchasePro, restore } from "@/lib/iap";
import { goBack } from "@/components/page";
import { useDuaPrice } from "@/lib/purchases";

// The Pro sheet: what Pro brings (gold medallions), Free and Pro side by side, and a clear price card with the summary
// Apple asks for (what, price, term, how to cancel) before Apple's own purchase sheet. Purchases belong to the account.
const BENEFITS: [IconName, string, string][] = [
  ["sun", "f_shams", "d_shams"], ["speaker", "f_reciters", "d_reciters"], ["radio", "f_radio", "d_radio"],
  ["cap", "f_courses", "d_courses"], ["checkCircle", "f_tests", "d_tests"], ["hands", "f_ai", "d_ai"],
  ["list", "f_stats", "d_stats"], ["download", "f_offline", "d_offline"],
];
const COMPARE: [string, string, string][] = [
  ["c_quran", "✓", "✓"], ["c_prayer", "✓", "✓"], ["c_progress", "✓", "✓"],
  ["c_shams", "c_shamsFree", "c_shamsPro"], ["c_reciters", "c_recitersFree", "c_recitersPro"], ["c_radio", "c_radioFree", "c_radioPro"],
  ["c_arabic", "c_arabicFree", "c_full"], ["c_tajweed", "c_tajweedFree", "c_full"], ["c_vocab", "c_vocabFree", "c_vocabPro"],
  ["c_tests", "c_testsFree", "c_shamsPro"], ["c_ai", "–", "✓"], ["c_duas", "c_duasFree", "c_duasPro"],
];

export default function ProSheet() {
  const t = useTheme();
  const tr = useT();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const { f } = useLocalSearchParams<{ f?: ProFeature }>();
  const { user, refresh } = useAuth();
  const { pro, until } = usePro();
  const [price, setPrice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"buy" | "restore" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { loadPrices().then((p) => setPrice(p.pro)).catch(() => undefined); }, []);
  const shown = price; // Apple's price in the buyer's currency; nothing until the store has answered
  const why = f && ["shams", "reciters", "radio", "arabic", "tajweed", "academy", "offline", "vocab", "stats"].includes(f) ? f : "general";

  const buy = async () => {
    if (!user) { router.push("/sign-in"); return; }
    setBusy("buy"); setMsg(null);
    const r = await purchasePro();
    setBusy(null);
    if (r === "ok") { await refresh(); setMsg(tr("pro.thanks")); }
    else if (r === "pending") setMsg(tr("pro.pending"));
    else if (r === "failed") setMsg(tr("pro.failed"));
    else if (r === "unavailable") setMsg(tr("pro.unavailable"));
  };
  const doRestore = async () => {
    if (!user) { router.push("/sign-in"); return; }
    setBusy("restore"); setMsg(null);
    const r = await restore();
    setBusy(null);
    if (r === "restored") { await refresh(); setMsg(tr("pro.thanks")); }
    else setMsg(r === "none" ? tr("pro.nothingToRestore") : tr("pro.unavailable"));
  };
  const openDoc = (doc: "terms" | "privacy") => WebBrowser.openBrowserAsync(`${SITE}/${lang}/legal/${doc}`);
  const duaPrice = useDuaPrice();
  const cell = (k: string) => (k === "✓" || k === "–" ? k : (duaPrice || !k.includes("Free") ? tr(`pro.${k}`, { price: duaPrice ?? "" }) : "✓"));

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        {/* hero */}
        <Stage hairlines={false}>
          <Text allowFontScaling={false} style={{ position: "absolute", right: -10, top: 30, fontFamily: CALLIG_FONT, fontSize: 120, lineHeight: 190, color: "rgba(214,180,108,0.12)" }}>{TILES.shams.ar}</Text>
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
            <Pressable onPress={() => goBack()} accessibilityRole="button" accessibilityLabel={tr("common.close")} hitSlop={10}
              style={{ alignSelf: "flex-end", width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" }}>
              <Icon name="close" color="#fff" size={17} />
            </Pressable>
            <View style={{ alignItems: "center", marginTop: 6 }}>
              <Seal />
              <Eyebrow onStage style={{ marginTop: 16 }}>{tr("pro.name")}</Eyebrow>
              <Display onStage style={{ marginTop: 10, textAlign: "center" }}>{tr(`pro.why_${why}`)}</Display>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: stage.textSoft, marginTop: 12, textAlign: "center" }}>{tr("pro.lead")}</Text>
            </View>
            {!pro ? <GoldButton title={user ? (shown ? tr("pro.subscribe", { price: shown }) : tr("pro.cta")) : tr("account.signIn")} busy={busy === "buy"} disabled={!!busy} onPress={buy} style={{ marginTop: 22 }} /> : null}
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted, textAlign: "center", marginTop: 10 }}>{tr("pro.cancelAnytime")} · {tr("pro.noAds")}</Text>
          </View>
          <View style={{ marginTop: 14 }}><Arcade /></View>
        </Stage>

        <View style={{ padding: 16, gap: 22 }}>
          {pro ? (
            <GoldCard>
              <Text style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink }}>{tr("pro.active")}</Text>
              {until ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, marginTop: 4 }}>{tr("pro.activeUntil", { date: new Date(until).toLocaleDateString(intlLocale(lang)) })}</Text> : null}
              <OutlineButton title={tr("pro.manage")} onPress={manageSubscriptions} style={{ marginTop: 14 }} />
            </GoldCard>
          ) : null}

          {/* what Pro brings */}
          <View style={{ gap: 12 }}>
            {BENEFITS.map(([icon, title, desc]) => (
              <View key={title} style={{ flexDirection: "row", gap: 14, alignItems: "flex-start", padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(150,116,52,0.22)", backgroundColor: t.surface }}>
                <Medallion icon={icon} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink }}>{tr(`pro.${title}`)}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted, marginTop: 3 }}>{tr(`pro.${desc}`)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Free and Pro side by side */}
          <View>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 23, color: t.ink, marginBottom: 12 }}>{tr("pro.compareTitle")}</Text>
            <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
              <View style={{ flexDirection: "row", paddingHorizontal: 14, paddingVertical: 10, backgroundColor: t.bg }}>
                <Text style={{ flex: 1.4 }} />
                <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: t.muted, textAlign: "center" }}>{tr("pro.compareFree")}</Text>
                <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: t.gold, textAlign: "center" }}>{tr("pro.comparePro")}</Text>
              </View>
              {COMPARE.map(([row, free, prov], i) => (
                <View key={row} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11, borderTopWidth: 1, borderTopColor: t.line }} accessible accessibilityLabel={`${tr(`pro.${row}`)}: ${cell(free)} / ${cell(prov)}`}>
                  <Text style={{ flex: 1.4, fontFamily: FONT.semibold, fontSize: 13.5, lineHeight: 18, color: t.ink }}>{tr(`pro.${row}`)}</Text>
                  <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "center" }}>{cell(free)}</Text>
                  <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 13, color: i < 3 ? t.muted : t.accent, textAlign: "center" }}>{cell(prov)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* price card with the summary before Apple's sheet */}
          {!pro ? (
            <GoldCard>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <LogoMark size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{tr("pro.priceTitle")}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{tr("pro.summaryTerm")}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{shown ?? "…"}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{tr("pro.perMonth")}</Text>
                </View>
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, marginTop: 12 }}>{tr("pro.summaryCancel")}</Text>
              {!user ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, backgroundColor: t.accentSoft, borderRadius: R.sm, padding: 12, marginTop: 12 }}>{tr("pro.signInFirst")}</Text> : null}
              <GoldButton title={user ? (shown ? tr("pro.subscribe", { price: shown }) : tr("pro.cta")) : tr("account.signIn")} busy={busy === "buy"} disabled={!!busy} onPress={buy} style={{ marginTop: 14 }} />
              <OutlineButton title={tr("pro.restore")} disabled={!!busy} onPress={doRestore} style={{ marginTop: 10 }} />
            </GoldCard>
          ) : null}
          {msg ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 21, color: t.ink, textAlign: "center" }} accessibilityLiveRegion="polite">{msg}</Text> : null}

          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <SmallStar size={12} color={t.gold} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, flex: 1 }}>{tr("pro.free")}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 20 }}>
            <TextLink title={tr("account.terms")} onPress={() => openDoc("terms")} style={{ fontSize: 13 }} />
            <TextLink title={tr("account.privacy")} onPress={() => openDoc("privacy")} style={{ fontSize: 13 }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/** a gilded seal with the logo mark in the middle */
function Seal() {
  const pts = Array.from({ length: 32 }, (_, i) => { const a = (Math.PI / 16) * i - Math.PI / 2, r = i % 2 ? 40 : 48; return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`; });
  return (
    <View style={{ width: 112, height: 112, alignItems: "center", justifyContent: "center" }}>
      <Svg width={112} height={112} viewBox="0 0 100 100" style={{ position: "absolute" }}>
        <Path d={`M${pts.join("L")}Z`} fill="rgba(214,180,108,0.12)" stroke={stage.gold} strokeWidth={0.8} />
        <Circle cx={50} cy={50} r={36} fill="rgba(5,28,21,0.6)" stroke={stage.gold} strokeWidth={0.8} />
        <Circle cx={50} cy={50} r={32} fill="none" stroke={stage.gold} strokeOpacity={0.4} strokeWidth={0.6} strokeDasharray="1.2 2.2" />
      </Svg>
      <LogoMark size={44} />
    </View>
  );
}

/** a small gold medallion around an icon */
function Medallion({ icon }: { icon: IconName }) {
  return (
    <View style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
      <Svg width={44} height={44} viewBox="0 0 40 40" style={{ position: "absolute" }}>
        <G fill="rgba(201,166,94,0.12)" stroke="rgb(201,166,94)" strokeWidth={1}>
          <Path d="M9 9h22v22H9z" />
          <Path d="M20 4.5L35.5 20 20 35.5 4.5 20z" />
        </G>
      </Svg>
      <Icon name={icon} color="rgb(150,116,52)" size={18} />
    </View>
  );
}
