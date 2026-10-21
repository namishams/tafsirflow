import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Display, Eyebrow, GoldButton, LogoMark, OutlineButton, Stage, TextLink } from "@/components/brand";
import { Icon } from "@/components/icons";
import { intlLocale, useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { SITE } from "@/lib/api";
import { FREE } from "@/lib/pro";
import { RECITERS } from "@/lib/quran";
import { FONT, R, stage } from "@/lib/theme";
import { remoteConfig } from "@/features/feed/remote";
import { success, tick } from "@/features/feed/haptics";
import { alpha } from "@/features/extra/art";
import type { IntroOffer, ProPlan } from "@/lib/iap";
import { STEPS, type Plan } from "./plan";
import { fmt, usePlanT } from "./texts";

// The paywall right after the personal plan (App Review 3.1.1 / 3.1.2): what Pro adds to this plan, the real store
// price in the buyer's currency, an intro offer only when the store reports one for this buyer, the renewal terms
// next to the button, restore, terms and privacy, and "Continue for free" that is always visible. No countdowns,
// no invented discounts. Layout options come from the feed config (monetize.paywall.day1); prices never do.
const STORE = Platform.OS === "ios" ? "App Store" : "Google Play";
const COMPARE: [string, string, string][] = [
  ["c_shams", "c_shamsFree", "c_shamsPro"], ["c_arabic", "c_arabicFree", "c_full"], ["c_tajweed", "c_tajweedFree", "c_full"], ["c_reciters", "c_recitersFree", "c_recitersPro"],
];

/** "7 days", "1 month" … in the interface language (plain number + unit when Intl has no unit formatting) */
function duration(o: IntroOffer, lang: string): string {
  try { return new Intl.NumberFormat(intlLocale(lang), { style: "unit", unit: o.unit, unitDisplay: "long" }).format(o.count); }
  catch { return `${o.count} ${o.unit}`; }
}

export function Day1Paywall({ plan, onDone }: { plan: Plan | null; onDone: () => void }) {
  const p = usePlanT();
  const tr = useT();
  const { lang } = useLang();
  const { user, refresh } = useAuth();
  const insets = useSafeAreaInsets();
  const cfg = remoteConfig()?.monetize?.paywall?.day1 ?? {};
  const [plans, setPlans] = useState<ProPlan[] | null>(null);
  const [sku, setSku] = useState<string | null>(null);
  const [busy, setBusy] = useState<"buy" | "restore" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    import("@/lib/iap").then((m) => m.loadProPlans()).then((l) => {
      if (!live) return;
      setPlans(l);
      const yearly = l.find((x) => x.period === "year");
      setSku((yearly && cfg.defaultPlan !== "monthly" ? yearly : l[0])?.sku ?? null);
    }).catch(() => { if (live) setPlans([]); });
    return () => { live = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chosen = plans?.find((x) => x.sku === sku) ?? null;
  const per = (x: ProPlan) => (x.period === "year" ? p.perYear : p.perMonth);
  const introLine = (x: ProPlan) => !x.intro ? null : x.intro.mode === "free-trial"
    ? fmt(p.introFree, { duration: duration(x.intro, lang), price: x.price, per: per(x) })
    : fmt(p.introPaid, { intro: x.intro.price, duration: duration(x.intro, lang), price: x.price, per: per(x) });

  const benefits = useMemo(() => {
    const out: string[] = [];
    if (plan?.weeks.some((w) => w.steps.some((s) => STEPS[s].pro))) out.push(p.pb_plan);
    out.push(p.pb_courses);
    const r = RECITERS.find((x) => x.folder === plan?.answers.reciter);
    out.push(r && !FREE.reciterIds.includes(r.id) ? fmt(p.pb_reciters, { name: r.name }) : p.pb_recitersAll);
    out.push(p.pb_limits);
    return out;
  }, [plan, p]);

  const buy = async () => {
    if (!chosen) return;
    if (!user) { router.push("/sign-in"); return; }
    tick(); setBusy("buy"); setMsg(null);
    const { purchasePro } = await import("@/lib/iap");
    const r = await purchasePro(chosen.sku);
    setBusy(null);
    if (r === "ok") { await refresh(); success(); onDone(); }
    else if (r === "pending") setMsg(tr("pro.pending"));
    else if (r === "failed") setMsg(tr("pro.failed"));
    else if (r === "unavailable") setMsg(tr("pro.unavailable"));
  };
  const doRestore = async () => {
    if (!user) { router.push("/sign-in"); return; }
    setBusy("restore"); setMsg(null);
    const { restore } = await import("@/lib/iap");
    const r = await restore();
    setBusy(null);
    if (r === "restored") { await refresh(); onDone(); }
    else setMsg(r === "none" ? tr("pro.nothingToRestore") : tr("pro.unavailable"));
  };
  const openDoc = (doc: "terms" | "privacy") => WebBrowser.openBrowserAsync(`${SITE}/${lang}/legal/${doc}`);
  const free = () => { tick(); onDone(); };

  const priceCards = (
    <View style={{ gap: 10 }} accessibilityRole="radiogroup">
      {plans === null ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: stage.textMuted, textAlign: "center", paddingVertical: 18 }}>…</Text> : null}
      {plans && !plans.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: stage.textSoft, textAlign: "center" }}>{fmt(p.noPrice, { store: STORE })}</Text> : null}
      {plans?.map((x) => {
        const on = x.sku === sku;
        const intro = introLine(x);
        return (
          <Pressable key={x.sku} onPress={() => { tick(); setSku(x.sku); }} accessibilityRole="radio" accessibilityState={{ checked: on }}
            accessibilityLabel={`${x.period === "year" ? p.yearly : p.monthly}, ${x.price} ${per(x)}${intro ? `. ${intro}` : ""}`}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: R.card, borderWidth: on ? 2 : 1, borderColor: on ? stage.gold : alpha(stage.gold, 0.3), backgroundColor: on ? alpha(stage.gold, 0.1) : "rgba(255,255,255,0.03)" }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? stage.gold : stage.goldSoft, alignItems: "center", justifyContent: "center" }}>
              {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: stage.gold }} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: "#ffffff" }}>{x.period === "year" ? p.yearly : p.monthly}</Text>
              {intro ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: stage.gold, marginTop: 2 }}>{intro}</Text> : null}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 20, color: "#ffffff" }}>{x.price}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted }}>{per(x)}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
  const benefitList = (
    <View style={{ gap: 10 }}>
      {benefits.map((b) => (
        <View key={b} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
          <Icon name="checkCircle" color={stage.gold} size={18} />
          <Text style={{ flex: 1, fontFamily: FONT.medium, fontSize: 15, lineHeight: 21, color: "#ffffff" }}>{b}</Text>
        </View>
      ))}
    </View>
  );
  const compare = cfg.showCompare === false ? null : (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: stage.hair, overflow: "hidden" }}>
      <View style={{ flexDirection: "row", paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.05)" }}>
        <Text style={{ flex: 1.3 }} />
        <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: stage.textMuted, textAlign: "center" }}>{p.compareFree}</Text>
        <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{p.pro}</Text>
      </View>
      {COMPARE.map(([row, f, pr]) => (
        <View key={row} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 9, borderTopWidth: 1, borderTopColor: stage.hair }}>
          <Text style={{ flex: 1.3, fontFamily: FONT.semibold, fontSize: 13, color: "#ffffff" }}>{tr(`pro.${row}`)}</Text>
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted, textAlign: "center" }}>{tr(`pro.${f}`)}</Text>
          <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 12.5, color: stage.gold, textAlign: "center" }}>{tr(`pro.${pr}`)}</Text>
        </View>
      ))}
    </View>
  );
  const compact = cfg.variant === "compact";

  return (
    <Stage hairlines={false} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 10, paddingBottom: insets.bottom + 24, gap: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Pressable onPress={free} accessibilityRole="button" accessibilityLabel={p.continueFree} hitSlop={8}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 34, borderRadius: R.pill, backgroundColor: "rgba(255,255,255,0.1)" }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: "#ffffff" }}>{p.continueFree}</Text>
            <Icon name="close" color="#ffffff" size={14} />
          </Pressable>
        </View>
        <View style={{ alignItems: "center" }}>
          <LogoMark size={46} />
          <Eyebrow onStage style={{ marginTop: 12 }}>{tr("pro.name")}</Eyebrow>
          <Display onStage size="largeTitle" style={{ marginTop: 8, textAlign: "center" }}>{p.pwTitle}</Display>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: stage.textSoft, marginTop: 8, textAlign: "center" }}>{p.pwLead}</Text>
        </View>
        {compact ? priceCards : benefitList}
        {compact ? benefitList : priceCards}
        {!user ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: "#ffffff", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: R.sm, padding: 12 }}>{tr("pro.signInFirst")}</Text> : null}
        <View style={{ gap: 10 }}>
          <GoldButton title={!user ? tr("account.signIn") : chosen?.intro?.mode === "free-trial" ? p.ctaTrial : p.cta} busy={busy === "buy"} disabled={!!busy || !chosen} onPress={buy} />
          {chosen ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: stage.textMuted, textAlign: "center" }}>{fmt(p.renew, { price: chosen.price, per: per(chosen), store: STORE })}</Text> : null}
          <OutlineButton title={p.continueFree} onStage onPress={free} />
        </View>
        {msg ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: "#ffffff", textAlign: "center" }} accessibilityLiveRegion="polite">{msg}</Text> : null}
        {compare}
        <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", columnGap: 18 }}>
          <TextLink onStage title={tr("pro.restore")} onPress={doRestore} style={{ fontSize: 13 }} />
          <TextLink onStage title={tr("account.terms")} onPress={() => openDoc("terms")} style={{ fontSize: 13 }} />
          <TextLink onStage title={tr("account.privacy")} onPress={() => openDoc("privacy")} style={{ fontSize: 13 }} />
        </View>
      </ScrollView>
    </Stage>
  );
}
