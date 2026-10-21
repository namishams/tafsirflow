import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import Svg, { Circle, G, Path } from "react-native-svg";
import { CALLIG_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { Arcade, Display, Eyebrow, GoldButton, GoldCard, OutlineButton, SmallStar, Stage, TextLink, Wordmark } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { intlLocale, useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { usePro, type ProFeature } from "@/lib/pro";
import { SITE } from "@/lib/api";
import { TILES } from "@/web/tiles";
import { loadProPlans, manageSubscriptions, purchasePro, restore, type ProPlan } from "@/lib/iap";
import { goBack } from "@/components/page";
import { useDuaPrice } from "@/lib/purchases";
import { fmt, usePlanT } from "@/features/plan/texts";
import { planIntro, planPer, planRenew } from "@/features/plan/offer";

// iOS: Pro can be bought without an account (App Review 5.1.1); signing in later binds it to the account.
const GUEST_PURCHASE = Platform.OS === "ios";
const STORE = Platform.OS === "ios" ? "App Store" : "Google Play";

// The Pro sheet: what Pro brings (gold medallions), Free and Pro side by side, and a clear price card with the summary
// Apple asks for (what, price, term, how to cancel) before Apple's own purchase sheet. Purchases belong to the account.
// App Review 3.1.2: the plans come from the store (monthly; yearly and intro offers only when the store reports them
// for this buyer, the same wording as the day-1 paywall), the renewal terms, restore, terms and privacy sit right under
// the first buy button too, no buy button works before the store has answered, and the result of a purchase or a
// restore appears next to the button that was tapped.
const BENEFITS: [IconName, string, string][] = [
  ["sun", "f_shams", "d_shams"], ["speaker", "f_reciters", "d_reciters"],
  ["cap", "f_courses", "d_courses"], ["checkCircle", "f_tests", "d_tests"], ["hands", "f_ai", "d_ai"],
  ["list", "f_stats", "d_stats"], ["download", "f_offline", "d_offline"],
];
const COMPARE: [string, string, string][] = [
  ["c_quran", "✓", "✓"], ["c_prayer", "✓", "✓"], ["c_progress", "✓", "✓"],
  ["c_shams", "c_shamsFree", "c_shamsPro"], ["c_reciters", "c_recitersFree", "c_recitersPro"],
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
  // the Pro plans the store sells to this buyer (null while asking, [] when the store cannot be reached)
  const [plans, setPlans] = useState<ProPlan[] | null>(null);
  const [sku, setSku] = useState<string | null>(null);
  const [busy, setBusy] = useState<"buy" | "restore" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgAt, setMsgAt] = useState<"hero" | "card">("hero"); // the result appears next to the button that was tapped
  useEffect(() => {
    let live = true;
    loadProPlans().then((l) => { if (live) { setPlans(l); setSku(l[0]?.sku ?? null); } }).catch(() => { if (live) setPlans([]); });
    return () => { live = false; };
  }, []);
  const chosen = plans?.find((x) => x.sku === sku) ?? null;
  const shown = chosen?.price ?? null; // Apple's price in the buyer's currency; nothing until the store has answered
  const why = f && ["shams", "reciters", "arabic", "tajweed", "academy", "offline", "vocab", "stats"].includes(f) ? f : "general";

  const pt = usePlanT();
  const canBuy = !!user || GUEST_PURCHASE;
  const buy = async (at: "hero" | "card") => {
    if (!canBuy) { router.push("/sign-in"); return; }
    if (!chosen) return;
    setBusy("buy"); setMsg(null); setMsgAt(at);
    const r = await purchasePro(chosen.sku);
    setBusy(null);
    if (r === "ok") { await refresh(); setMsg(tr(user ? "pro.thanks" : "pro.thanksGuest")); }
    else if (r === "pending") setMsg(tr("pro.pending"));
    else if (r === "failed") setMsg(tr("pro.failed"));
    else if (r === "unavailable") setMsg(tr("pro.unavailable"));
  };
  const doRestore = async (at: "hero" | "card") => {
    if (!canBuy) { router.push("/sign-in"); return; }
    setBusy("restore"); setMsg(null); setMsgAt(at);
    const r = await restore();
    setBusy(null);
    if (r === "restored") { await refresh(); setMsg(tr(user ? "pro.thanks" : "pro.thanksGuest")); }
    else setMsg(r === "none" ? tr("pro.nothingToRestore") : tr("pro.unavailable"));
  };
  const openDoc = (doc: "terms" | "privacy") => WebBrowser.openBrowserAsync(`${SITE}/${lang}/legal/${doc}`);
  const duaPrice = useDuaPrice();
  // only the dua row needs a price: without it (store not answered, offline) it shows "–", never a checkmark
  const cell = (k: string) => (k === "✓" || k === "–" ? k : k === "c_duasFree" && !duaPrice ? "–" : tr(`pro.${k}`, { price: duaPrice ?? "" }));
  // the buy button: the trial, an intro offer (its terms in the line below) or the plan's price and period
  const buyTitle = !canBuy ? tr("account.signIn") : !chosen ? tr("pro.cta")
    : chosen.intro?.mode === "free-trial" ? pt.ctaTrial : chosen.intro ? pt.cta
    : tr(chosen.period === "year" ? "pro.subscribeYear" : "pro.subscribe", { price: chosen.price });
  const buyDisabled = !!busy || (canBuy && !chosen);
  const noStore = plans !== null && !plans.length;
  const message = (at: "hero" | "card", onStage: boolean) => (msg && msgAt === at ? (
    <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 21, color: onStage ? "#ffffff" : t.ink, textAlign: "center", marginTop: onStage ? 12 : 0 }} accessibilityLiveRegion="polite">{msg}</Text>
  ) : null);

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
            {!pro ? <GoldButton title={buyTitle} busy={busy === "buy" && msgAt === "hero"} disabled={buyDisabled} onPress={() => void buy("hero")} style={{ marginTop: 22 }} /> : null}
            {message("hero", true)}
            {!pro && chosen?.intro ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, lineHeight: 19, color: stage.gold, textAlign: "center", marginTop: 10 }}>{planIntro(pt, chosen, lang)}</Text> : null}
            {!pro && chosen ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: stage.textMuted, textAlign: "center", marginTop: 8 }}>{planRenew(pt, chosen, STORE)}</Text> : null}
            {!pro && noStore ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: stage.textSoft, textAlign: "center", marginTop: 10 }}>{fmt(pt.noPrice, { store: STORE })}</Text> : null}
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted, textAlign: "center", marginTop: 10 }}>{tr("pro.cancelAnytime")} · {tr("pro.noAds")}</Text>
            {!pro ? (
              <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", columnGap: 18, marginTop: 2 }}>
                <TextLink onStage title={tr("pro.restore")} onPress={() => { if (!busy) void doRestore("hero"); }} style={{ fontSize: 13 }} />
                <TextLink onStage title={tr("account.terms")} onPress={() => openDoc("terms")} style={{ fontSize: 13 }} />
                <TextLink onStage title={tr("account.privacy")} onPress={() => openDoc("privacy")} style={{ fontSize: 13 }} />
              </View>
            ) : null}
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
                <Wordmark variant="stacked" height={38} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{tr("pro.priceTitle")}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{chosen?.period === "year" ? pt.yearly : tr("pro.summaryTerm")}</Text>
                </View>
                {plans && plans.length > 1 ? null : (
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{shown ?? "…"}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{chosen?.period === "year" ? pt.perYear : tr("pro.perMonth")}</Text>
                  </View>
                )}
              </View>
              {/* more than one plan (yearly next to monthly): choose one, each with its own intro offer as the store reports it */}
              {plans && plans.length > 1 ? (
                <View style={{ gap: 8, marginTop: 14 }} accessibilityRole="radiogroup">
                  {plans.map((x) => {
                    const on = x.sku === sku;
                    const intro = planIntro(pt, x, lang);
                    return (
                      <Pressable key={x.sku} onPress={() => setSku(x.sku)} accessibilityRole="radio" accessibilityState={{ checked: on }}
                        accessibilityLabel={`${x.period === "year" ? pt.yearly : pt.monthly}, ${x.price} ${planPer(pt, x)}${intro ? `. ${intro}` : ""}`}
                        style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.md, borderWidth: on ? 2 : 1, borderColor: on ? t.gold : t.line, backgroundColor: on ? t.accentSoft : t.bg }}>
                        <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: on ? t.gold : t.line, alignItems: "center", justifyContent: "center" }}>
                          {on ? <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: t.gold }} /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{x.period === "year" ? pt.yearly : pt.monthly}</Text>
                          {intro ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: t.accent, marginTop: 2 }}>{intro}</Text> : null}
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink }}>{x.price}</Text>
                          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{planPer(pt, x)}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ) : chosen?.intro ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, lineHeight: 19, color: t.accent, marginTop: 12 }}>{planIntro(pt, chosen, lang)}</Text> : null}
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, marginTop: 12 }}>{chosen ? planRenew(pt, chosen, STORE) : noStore ? fmt(pt.noPrice, { store: STORE }) : tr("pro.summaryCancel")}</Text>
              {!user ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, backgroundColor: t.accentSoft, borderRadius: R.sm, padding: 12, marginTop: 12 }}>{tr(GUEST_PURCHASE ? "pro.guestNote" : "pro.signInFirst")}</Text> : null}
              <GoldButton title={buyTitle} busy={busy === "buy" && msgAt === "card"} disabled={buyDisabled} onPress={() => void buy("card")} style={{ marginTop: 14 }} />
              <OutlineButton title={tr("pro.restore")} disabled={!!busy} onPress={() => void doRestore("card")} style={{ marginTop: 10 }} />
            </GoldCard>
          ) : null}
          {message("card", false)}

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
      <Wordmark variant="stacked" tone="gold" height={28} />
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
