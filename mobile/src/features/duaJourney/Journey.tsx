import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View, type ScrollViewInstance } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { JourneyStage } from "@/features/garden/Landscape";
import { ShareSheet } from "@/features/feed/share";
import { success, tick } from "@/features/feed/haptics";
import { useSiteConfig } from "@/features/extra/config";
import { Display, GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { api, ApiError, SITE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PRO_DUAS_PER_MONTH, buyPersonalDuaResult, duaPrices, useAiCredits } from "@/lib/purchases";
import { usePro } from "@/lib/pro";
import { ProBadge } from "@/components/page";
import { useStored, writeJSON } from "@/lib/store";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, stage } from "@/lib/theme";
import { NAMES, PLAN } from "@/web/duaGenerator";
import { SUNNAH_DUAS, type SunnahDua } from "@/web/sunnahDuas";
import { SUNNAH_DUAS_2 } from "@/web/sunnahDuas2";
import {
  ARABIC_SCRIPT, DIRECTIONS, DIRECTION_AR, DUA_AI_CONSENT_KEY, DUA_AI_CONSENT_VERSION, DUA_BUYS_KEY, DUA_LANGS, DUA_MOMENTS_KEY, LENGTHS, MOMENTS_DEFAULT, MY_DUAS_KEY, MY_DUAS_MAX, OCCASIONS, QUESTION_STEPS, WHO_J,
  anchorsFor, dawnOf, decodeGift, directionFor, encodeGift, isDuaLang, topicFor, type BuyStats, type Direction, type DuaLength, type GiftDua, type Moment, type MomentPrefs, type Occasion, type SavedDua, type Step, type WhoJ,
} from "@/web/duaJourney";
import { useTx } from "@/features/practice/text";
import { DuaReveal } from "./Reveal";
import { CARD_STYLES, DuaCard, type CardStyle, type DuaView } from "./DuaCard";
import { PackRow, SealBreak, SealButton, SealScene } from "./Seal";
import { GiftMoment, MessengerSheet, MomentCard, MomentSettings, MyDuas, useMoment } from "./Keep";
import { useReducedMotion } from "@/features/practice/art";

// The personal dua journey (website components/dua/DuaJourney.tsx; owner, 22.10.2026): gentle questions on the
// landscape that dawns with every answer (why, for whom, direction, situation, length, language), then the dua is
// composed and revealed (Reveal.tsx), then the card to keep, share and save. The dua is built around authentic duas of
// the Quran (loaded by reference from the Quran API) and the Sunnah (sunnahDuas, with sources); only the personal words
// are composed by AI on the server and always labelled so. In the app a personal dua is only ever paid (owner,
// 22.10.2026): a bought credit (com.quranmasterclass.app.dua / .dua5, opened as a sealed scroll) or one of the duas
// Pro includes each month; there is no free composition. The authentic duas stay free to read in the library.
const ALL_SUNNAH: SunnahDua[] = [...SUNNAH_DUAS, ...SUNNAH_DUAS_2];
const GLASS = Platform.OS === "ios" && isLiquidGlassAvailable();
type QuranDua = { key: string; ar: string; tr: string };
type Result = { personal: string; arabic: string | null; ai: boolean; note?: string };
const alpha = (rgb: string, a: number) => rgb.replace("rgb(", "rgba(").replace(")", `,${a})`);

// dev only (Metro, ?demo=1): the reveal without a server call or a purchase, with the prepared request in the app language

export default function DuaJourney({ initialTopic, demo, demoStep, gift: giftParam }: { initialTopic?: string; demo?: boolean; /** dev only: open at a step with sample answers */ demoStep?: Step; /** a dua received as a gift (link) */ gift?: string }) {
  const t = useWebT("duagen");
  const tx = useTx();
  const insets = useSafeAreaInsets();
  const { lang: uiLang } = useLang();
  const { user } = useAuth();
  const { credits, refresh } = useAiCredits();
  // credits null = still loading or not loadable (offline): buying is offered only when "nothing left" is confirmed
  const [credState, setCredState] = useState<"loading" | "error" | "ok">("loading");
  const reloadCredits = useCallback(async () => { setCredState("loading"); await refresh(); }, [refresh]);
  useEffect(() => { if (credits) setCredState("ok"); }, [credits]);
  useEffect(() => {
    if (!user) return;
    const id = setTimeout(() => setCredState((s) => (s === "loading" ? "error" : s)), 8000);
    return () => clearTimeout(id);
  }, [user, credState]);
  const cfg = useSiteConfig();
  const aiOn = !!(cfg.ai && cfg.features.duaAi) || !!demo;
  const saved = useStored<SavedDua[]>(MY_DUAS_KEY, []);
  const consent = useStored<number>(DUA_AI_CONSENT_KEY, 0) >= DUA_AI_CONSENT_VERSION;
  const moments = useStored<MomentPrefs>(DUA_MOMENTS_KEY, MOMENTS_DEFAULT);
  const moment = useMoment(moments);
  const buys = useStored<BuyStats>(DUA_BUYS_KEY, { singles: 0, packShown: false });
  const { pro } = usePro();
  const still = useReducedMotion();
  const [breaking, setBreaking] = useState(false);
  const [look, setLook] = useState<CardStyle>("night");
  const [messenger, setMessenger] = useState(false);
  const [gift, setGift] = useState<GiftDua | null>(() => decodeGift(giftParam));
  const [restoring, setRestoring] = useState<"" | "busy" | "ok" | "fail">("");

  const startDir = directionFor(initialTopic);
  const sample = !!(demo && demoStep);
  const [step, setStep] = useState<Step>(sample && demoStep !== "reveal" && demoStep !== "card" ? demoStep! : "intro");
  const [occasion, setOccasion] = useState<Occasion | null>(sample ? "hardship" : null);
  const [who, setWho] = useState<WhoJ | null>(sample ? "mother" : null);
  const [direction, setDirection] = useState<Direction | null>(sample ? "worry" : startDir);
  const [text, setText] = useState("");
  const [len, setLen] = useState<DuaLength | null>(null);
  const [lang, setLang] = useState<string>(isDuaLang(uiLang) ? uiLang : "en");
  const [withAr, setWithAr] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [err, setErr] = useState("");
  const [askConsent, setAskConsent] = useState(false);
  const [buying, setBuying] = useState<"one" | "pack" | null>(null);
  const [prices, setPrices] = useState<{ one: string | null; pack: string | null }>({ one: null, pack: null });
  const [sharing, setSharing] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [quran, setQuran] = useState<QuranDua[] | null>(null);
  const scroller = useRef<ScrollViewInstance>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { duaPrices().then(setPrices).catch(() => undefined); }, []);
  useEffect(() => { scroller.current?.scrollTo({ y: 0, animated: false }); }, [step]);

  const topic = direction && who ? topicFor(direction, who) : direction ? topicFor(direction, "me") : "heart";
  const plan = PLAN[topic];
  const anchors = anchorsFor(topic);
  const names = plan.names.map((id) => NAMES[id]);
  const sunnah = plan.sunnah.map((id) => ALL_SUNNAH.find((d) => d.id === id)).filter(Boolean) as SunnahDua[];
  const anchorSunnah = sunnah.find((d) => d.id === anchors.sunnah) ?? null;
  const left = (credits?.dua ?? 0) + (credits?.proDuaLeft ?? 0);
  // the Quran duas of the concern in the reader's language, by reference (never typed by hand)
  useEffect(() => {
    if (step !== "ready" && step !== "reveal" && step !== "card") return;
    let live = true;
    setQuran(null);
    api<{ quran?: QuranDua[] }>(`/api/dua-generator?topic=${topic}&locale=${uiLang}`).then((d) => { if (live) setQuran(d.quran ?? []); }).catch(() => { if (live) setQuran([]); });
    return () => { live = false; };
  }, [topic, uiLang, step === "intro"]); // eslint-disable-line react-hooks/exhaustive-deps

  const qIndex = QUESTION_STEPS.indexOf(step);
  const go = (s: Step) => { tick(); setErr(""); setStep(s); };
  const next = () => { const i = QUESTION_STEPS.indexOf(step); go(i >= 0 && i < QUESTION_STEPS.length - 1 ? QUESTION_STEPS[i + 1] : "ready"); };
  const back = () => {
    if (step === "intro") { router.back(); return; }
    const i = QUESTION_STEPS.indexOf(step);
    go(step === "ready" ? "language" : step === "card" ? "ready" : i > 0 ? QUESTION_STEPS[i - 1] : "intro");
  };

  const template = useCallback(() => [text.trim() ? t("ownWords", { text: text.trim() }) : "", t(`req_${topic}`)].filter(Boolean).join(" "), [text, topic, t]);

  const compose = async () => {
    if (!consent && !demo) { setAskConsent(true); return; }
    setSavedId(null); setResult(null); setWaiting(true); go("reveal");
    if (demo && __DEV__) { const sample = template(); setTimeout(() => { if (alive.current) { setResult({ personal: sample, arabic: null, ai: false }); setWaiting(false); } }, 2500); return; }
    try {
      const d = await api<{ text?: string; arabic?: string | null }>("/api/dua-generator", {
        body: { v: 2, occasion, who: who ?? "me", direction: direction ?? "heart", text: text.trim(), length: len ?? "medium", lang, arabic: withAr && !ARABIC_SCRIPT.has(lang), locale: uiLang, names: plan.names },
        timeoutMs: 60000, // longer than the server deadline (35 s), so a credit is never spent without an answer
      });
      if (!alive.current) return;
      if (d.text) setResult({ personal: d.text, arabic: d.arabic ?? null, ai: true });
      else { setWaiting(false); setErr(t("s_failKept")); setStep("ready"); void refresh(); return; }
    } catch (e) {
      if (!alive.current) return;
      const status = e instanceof ApiError ? e.status : 0;
      if (status === 422) { setWaiting(false); setErr(t("j_refused")); setStep("situation"); void refresh(); return; }
      if (status === 402) { setWaiting(false); setErr(tx("noCredit")); setStep("ready"); void refresh(); return; }
      if (status === 401) { setWaiting(false); setErr(t("aiLogin")); setStep("ready"); return; }
      // no free fallback in the app: the credit was given back by the server, the seal stays closed
      setWaiting(false); setErr(status === 503 ? t("j_aiOff") : t("s_failKept")); setStep("ready"); void refresh(); return;
    }
    setWaiting(false);
    void refresh();
  };
  const buy = async (pack: boolean) => {
    if (!consent) { setAskConsent(true); return; }
    setErr(""); setBuying(pack ? "pack" : "one");
    let r: Awaited<ReturnType<typeof buyPersonalDuaResult>> = "failed";
    try { r = await buyPersonalDuaResult(pack); } catch { r = "failed"; }
    if (!alive.current) return;
    setBuying(null);
    if (r === "cancelled") return;
    if (r === "pending") { setErr(t("j_buyPending")); return; }
    if (r === "unconfirmed") { setErr(t("j_buyUnconfirmed")); void refresh(); return; }
    if (r !== "ok") { setErr(tx("buyFailed")); return; }
    if (!pack) writeJSON(DUA_BUYS_KEY, { ...buys, singles: buys.singles + 1 }, true);
    success();
    await refresh();
    setBreaking(true); // the seal breaks, then the dua is composed and revealed
  };
  const openSeal = () => {
    if (!consent && !demo) { setAskConsent(true); return; }
    success();
    setBreaking(true);
  };
  const onBroken = useCallback(() => { setBreaking(false); void compose(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const restorePurchases = async () => {
    setRestoring("busy");
    try {
      const { restore, settlePending } = await import("@/lib/iap");
      await settlePending();
      const r = await restore();
      await refresh();
      setRestoring(r === "failed" ? "fail" : "ok");
    } catch { setRestoring("fail"); }
  };

  const view: DuaView | null = result ? {
    kicker: `${t("j_kicker")} · ${t(`d_${direction ?? "heart"}`)}`,
    title: t("j_title"),
    names: names.map((n) => n.voc).join("، "),
    namesTr: uiLang === "ar" ? "" : names.map((n) => t(`n_${n.id}`)).join(" · "),
    quran: (() => { const q = quran?.find((x) => x.key === anchors.quran); return q ? { ...q, ref: t("j_quranRef", { ref: q.key }) } : null; })(),
    sunnah: anchorSunnah ? { ar: anchorSunnah.ar, tr: uiLang === "ar" ? "" : uiLang === "de" ? anchorSunnah.de : anchorSunnah.en, src: anchorSunnah.src } : null,
    personalLabel: result.ai ? t("j_personalAi") : t("j_personal"),
    personal: result.personal,
    arabicLabel: t("j_personalAr"),
    arabic: result.arabic,
    forWho: who && who !== "me" ? t("forWho", { who: t(`wf_${who}`) }) : null,
    addressee: who && who !== "me" ? (() => { const w = t("s_for", { who: t(`wf_${who}`) }); return w.charAt(0).toUpperCase() + w.slice(1); })() : null,
    disclosure: result.ai ? t("j_disclosure") : t("j_disclosureFree"),
    footer: "quranmasterclass.com",
    rtl: ARABIC_SCRIPT.has(lang),
  } : null;

  const save = () => {
    if (!result || !direction) return;
    const item: SavedDua = { id: `d${Date.now()}`, at: Date.now(), direction, topic, who: who ?? "me", lang, personal: result.personal, arabic: result.arabic ?? undefined, ai: result.ai, quran: anchors.quran, sunnah: anchors.sunnah, names: plan.names };
    writeJSON(MY_DUAS_KEY, [item, ...saved].slice(0, MY_DUAS_MAX), true);
    setSavedId(item.id); tick();
  };
  const openSaved = (d: SavedDua) => {
    setDirection(d.direction); setWho(d.who); setLang(d.lang);
    setResult({ personal: d.personal, arabic: d.arabic ?? null, ai: d.ai }); setSavedId(d.id); go("card");
  };
  const startMoment = (m: Moment) => { writeJSON(DUA_MOMENTS_KEY, { ...moments, lastShown: Date.now() }, true); setDirection(m.direction); if (m.who) setWho(m.who); go("why"); };
  const giftLink = () => result && direction ? `${SITE}/${uiLang}/dua-generator#g=${encodeGift({ p: result.personal, a: result.arabic ?? undefined, d: direction, w: who ?? "me", q: anchors.quran, s: anchors.sunnah, l: lang })}` : SITE;
  const reset = () => { setOccasion(null); setWho(null); setDirection(null); setText(""); setLen(null); setWithAr(false); setResult(null); setSavedId(null); go("why"); };
  const onRevealDone = useCallback(() => setStep("card"), []);
  useEffect(() => { if (sample && (demoStep === "reveal" || demoStep === "card")) { setLen("medium"); setStep("ready"); setTimeout(() => { success(); setBreaking(true); }, 1500); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- small building blocks ----------
  const title = (s: string, lead?: string) => (
    <View style={{ marginBottom: 18 }}>
      <Display size="title1" onStage>{s}</Display>
      {lead ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: stage.textSoft, marginTop: 8 }}>{lead}</Text> : null}
    </View>
  );
  const opt = (key: string, on: boolean, label: string, onPress: () => void, desc?: string, ar?: string) => (
    <Pressable key={key} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={desc ? `${label}. ${desc}` : label}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: R.lg, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 13, minHeight: 56,
        borderColor: on ? stage.gold : pressed ? alpha(stage.gold, 0.6) : alpha(stage.gold, 0.22), backgroundColor: on ? alpha(stage.gold, 0.14) : pressed ? "rgba(255,255,255,0.06)" : "rgba(6,30,23,0.62)", transform: [{ scale: pressed ? 0.985 : 1 }] })}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: "#ffffff" }}>{label}</Text>
        {desc ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: stage.textMuted, marginTop: 3 }}>{desc}</Text> : null}
      </View>
      {ar ? <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 19, color: on ? stage.gold : "rgba(214,180,108,0.7)" }}>{ar}</Text> : null}
      {on ? <Icon name="checkCircle" color={stage.gold} size={20} /> : null}
    </Pressable>
  );
  const pick = <T,>(set: (v: T) => void, v: T) => () => { set(v); tick(); setTimeout(() => { if (alive.current) next(); }, 260); };
  const nextBtn = (enabled: boolean, label = t("j_next")) => <GoldButton title={label} disabled={!enabled} onPress={next} style={{ marginTop: 20 }} />;

  const header = step !== "reveal" ? (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 40 }}>
        <Pressable onPress={back} accessibilityRole="button" accessibilityLabel={t("j_back")} hitSlop={10} style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <Glass round />
          <Icon name="chevronLeft" color="#ffffff" size={20} />
        </Pressable>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>
          {qIndex >= 0 ? `${t("j_kicker")} · ${t("j_step", { n: qIndex + 1, total: QUESTION_STEPS.length })}` : step === "intro" ? "" : t("j_kicker")}
        </Text>
        <View style={{ width: 38 }} />
      </View>
      {qIndex >= 0 ? (
        <View style={{ height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.12)", marginTop: 12, overflow: "hidden" }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: QUESTION_STEPS.length, now: qIndex + 1 }}>
          <View style={{ height: 3, borderRadius: 2, backgroundColor: stage.gold, width: `${((qIndex + 1) / QUESTION_STEPS.length) * 100}%` }} />
        </View>
      ) : null}
    </View>
  ) : null;

  const progress = step === "reveal" ? (result && !waiting ? 1 : 0.02) : dawnOf(step);

  return (
    <JourneyStage progress={progress} horizon={step === "intro" ? 0.46 : step === "reveal" || step === "card" ? 0.3 : 0.36} veil={step === "reveal" ? 0.75 : step === "ready" || step === "card" ? 0.72 : 0.55}>
      {header}
      <ScrollView ref={scroller} contentContainerStyle={{ padding: 20, paddingTop: step === "intro" ? 120 : step === "reveal" ? insets.top + 24 : 28, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <Animated.View key={step} entering={FadeInDown.duration(420)}>
          {step === "intro" && gift ? (
            <GiftMoment g={gift} t={t} quranAr={null} onClose={() => setGift(null)} onGive={() => { setGift(null); setWho("loved"); go("why"); }} />
          ) : null}
          {step === "intro" && !gift ? (
            <>
              {moment ? <MomentCard m={moment} t={t} prefs={moments} onStart={startMoment} /> : null}
              <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 64, lineHeight: 96, color: stage.gold, textAlign: "center", textShadowColor: "rgba(255,214,130,0.45)", textShadowRadius: 16 }}>دعاء</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2.2, textTransform: "uppercase", color: stage.gold, textAlign: "center", marginTop: 4 }}>{t("j_kicker")}</Text>
              <Display size="largeTitle" onStage style={{ textAlign: "center", marginTop: 10 }}>{t("j_title")}</Display>
              <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: stage.textSoft, textAlign: "center", marginTop: 12 }}>{t("j_lead")}</Text>
              <GoldButton title={t("j_begin")} onPress={() => go("why")} style={{ marginTop: 28 }} />
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: stage.textMuted, textAlign: "center", marginTop: 14 }}>{aiOn ? t("j_disclosure") : t("j_disclosureFree")}</Text>
              <MyDuas saved={saved} t={t} lang={uiLang} onOpen={openSaved} />
              <MomentSettings t={t} prefs={moments} />
            </>
          ) : null}

          {step === "why" ? (<>{title(t("q_why"), t("q_whyLead"))}<View style={{ gap: 8 }}>{OCCASIONS.map((o) => opt(o, occasion === o, t(`o_${o}`), pick(setOccasion, o)))}</View></>) : null}

          {step === "who" ? (
            <>{title(t("q_who"))}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {WHO_J.map((w) => (
                  <Pressable key={w} onPress={pick(setWho, w)} accessibilityRole="button" accessibilityState={{ selected: who === w }}
                    style={({ pressed }) => ({ paddingHorizontal: 16, height: 44, borderRadius: R.pill, borderWidth: 1, justifyContent: "center", borderColor: who === w ? stage.gold : alpha(stage.gold, 0.3), backgroundColor: who === w ? alpha(stage.gold, 0.16) : pressed ? "rgba(255,255,255,0.08)" : "rgba(6,30,23,0.62)" })}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: "#ffffff" }}>{t(`w_${w}`)}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {step === "direction" ? (
            <>{title(t("q_dir"), t("q_dirLead"))}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {DIRECTIONS.map((d) => (
                  <Pressable key={d} onPress={pick(setDirection, d)} accessibilityRole="button" accessibilityState={{ selected: direction === d }} accessibilityLabel={t(`d_${d}`)}
                    style={({ pressed }) => ({ width: "48.6%", minHeight: 92, borderRadius: R.card, borderWidth: 1, padding: 12, justifyContent: "space-between", borderColor: direction === d ? stage.gold : alpha(stage.gold, 0.22), backgroundColor: direction === d ? alpha(stage.gold, 0.16) : pressed ? "rgba(255,255,255,0.08)" : "rgba(6,30,23,0.62)", transform: [{ scale: pressed ? 0.98 : 1 }] })}>
                    <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 34, color: direction === d ? stage.gold : "rgba(214,180,108,0.75)", textAlign: "right" }}>{DIRECTION_AR[d]}</Text>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, lineHeight: 19, color: "#ffffff" }}>{t(`d_${d}`)}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {step === "situation" ? (
            <>{title(t("q_sit"), t("q_sitLead"))}
              {err ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "#f3d48e", marginBottom: 12 }}>{err}</Text> : null}
              <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: alpha(stage.gold, 0.35), overflow: "hidden" }}>
                <Glass />
                <TextInput value={text} onChangeText={(v) => setText(v.slice(0, 300))} maxLength={300} multiline placeholder={t("placeholder")} placeholderTextColor="rgba(255,255,255,0.45)" accessibilityLabel={t("q_sit")}
                  style={{ minHeight: 130, padding: 16, fontFamily: FONT.regular, fontSize: 17, lineHeight: 25, color: "#ffffff", textAlignVertical: "top" }} />
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted, marginTop: 8, textAlign: "right" }}>{text.length}/300</Text>
              {nextBtn(true, text.trim() ? t("j_next") : t("j_skip"))}
            </>
          ) : null}

          {step === "length" ? (<>{title(t("q_len"))}<View style={{ gap: 8 }}>{LENGTHS.map((l) => opt(l, len === l, t(`l_${l}`), pick(setLen, l), t(`l_${l}D`)))}</View></>) : null}

          {step === "language" ? (
            <>{title(t("q_lang"), t("q_langLead"))}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {DUA_LANGS.map(([c, n]) => (
                  <Pressable key={c} onPress={() => { setLang(c); tick(); }} accessibilityRole="button" accessibilityState={{ selected: lang === c }}
                    style={{ paddingHorizontal: 14, height: 44, borderRadius: R.pill, borderWidth: 1, justifyContent: "center", borderColor: lang === c ? stage.gold : alpha(stage.gold, 0.3), backgroundColor: lang === c ? alpha(stage.gold, 0.16) : "rgba(6,30,23,0.62)" }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: "#ffffff" }}>{n}</Text>
                  </Pressable>
                ))}
              </View>
              {!ARABIC_SCRIPT.has(lang) ? (
                <Pressable onPress={() => { setWithAr(!withAr); tick(); }} accessibilityRole="switch" accessibilityState={{ checked: withAr }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 18, borderRadius: R.card, borderWidth: 1, borderColor: alpha(stage.gold, withAr ? 0.8 : 0.25), padding: 14, backgroundColor: "rgba(6,30,23,0.62)" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: "#ffffff" }}>{t("j_alsoAr")}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: stage.textMuted, marginTop: 3 }}>{t("j_alsoArD")}</Text>
                  </View>
                  <View style={{ width: 46, height: 28, borderRadius: 14, padding: 3, backgroundColor: withAr ? stage.gold : "rgba(255,255,255,0.18)", alignItems: withAr ? "flex-end" : "flex-start" }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#ffffff" }} />
                  </View>
                </Pressable>
              ) : null}
              {nextBtn(true)}
            </>
          ) : null}

          {step === "ready" ? (
            <>
              {title(t("s_title"), t("s_lead"))}
              <SealScene still={still} arabic={DIRECTION_AR[direction ?? "heart"]}
                chips={[direction ? t(`d_${direction}`) : "", occasion ? t(`o_${occasion}`) : "", who && who !== "me" ? t(`w_${who}`) : "", text.trim() ? (text.trim().length > 28 ? `${text.trim().slice(0, 28)} …` : text.trim()) : ""].filter(Boolean)} />
              {err ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "#f3d48e", marginTop: 16, textAlign: "center" }}>{err}</Text> : null}
              <View style={{ marginTop: 22, gap: 14 }}>
                {!aiOn ? (
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: stage.textMuted, textAlign: "center" }}>{t("j_aiOff")}</Text>
                ) : !user && !demo ? (
                  <GoldButton title={t("j_signIn")} onPress={() => router.push("/sign-in")} />
                ) : !demo && !credits ? (
                  credState === "error" ? (
                    <View style={{ gap: 10, alignItems: "center" }}>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: stage.textMuted }}>{t("j_creditsErr")}</Text>
                      <OutlineButton onStage compact title={t("j_retry")} onPress={() => void reloadCredits()} />
                    </View>
                  ) : <ActivityIndicator color={stage.gold} style={{ minHeight: 56 }} />
                ) : left > 0 || (demo && demoStep !== "ready") ? (
                  <>
                    <SealButton title={t("s_openCredit")} onPress={openSeal} />
                    {!demo ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: stage.textMuted, textAlign: "center" }}>{left === 1 ? tx("leftOne") : tx("left", { n: left })}</Text> : null}
                  </>
                ) : (
                  <>
                    {prices.one ? <SealButton title={t("s_open", { price: prices.one })} busy={buying === "one"} disabled={!!buying} onPress={() => void buy(false)} /> : (
                      <View style={{ height: 56, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 }}>
                        <ActivityIndicator color={stage.gold} />
                        <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: stage.textMuted }}>{t("s_loadingPrice")}</Text>
                      </View>
                    )}
                    {prices.pack ? (
                      <>
                        {buys.singles >= 2 && !buys.packShown ? <PackNudge text={t("p_nudge", { price: prices.pack })} onSeen={() => writeJSON(DUA_BUYS_KEY, { ...buys, packShown: true }, true)} /> : null}
                        <PackRow title={t("s_pack", { price: prices.pack })} ribbon={t("s_popular")} busy={buying === "pack"} disabled={!!buying} onPress={() => void buy(true)} />
                      </>
                    ) : null}
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: stage.textMuted, textAlign: "center" }}>{t("s_oneTime")}</Text>
                  </>
                )}
                {!pro ? (
                  <Pressable onPress={() => router.push("/pro")} accessibilityRole="link" style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 6 }}>
                    <ProBadge onStage />
                    <Text style={{ fontFamily: FONT.medium, fontSize: 13.5, color: "#f6ead0" }}>{t("s_pro", { n: PRO_DUAS_PER_MONTH })}</Text>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: stage.gold }}>{t("s_proCta")}</Text>
                  </Pressable>
                ) : null}
                <Text style={{ fontFamily: FONT.italic, fontSize: 12.5, lineHeight: 18, color: "rgba(243,226,182,0.8)", textAlign: "center" }}>{t("s_trust")}</Text>
                {user ? (
                  <Text onPress={() => void restorePurchases()} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.textSoft, textAlign: "center", paddingVertical: 6 }}>
                    {restoring === "busy" ? "…" : restoring === "ok" ? t("s_restored") : restoring === "fail" ? t("s_restoreFail") : t("s_restore")}
                  </Text>
                ) : null}
              </View>
              {/* the authentic duas it is rooted in and the answers (tap to change) */}
              <View style={{ marginTop: 26, borderRadius: 18, borderWidth: 1, borderColor: alpha(stage.gold, 0.3), overflow: "hidden", padding: 18, gap: 14 }}>
                <Glass />
                <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: stage.textSoft }}>{t("j_readyLead")}</Text>
                <Anchor ar={quran?.find((q) => q.key === anchors.quran)?.ar ?? null} label={t("j_quranRef", { ref: anchors.quran })} />
                {anchorSunnah ? <Anchor ar={anchorSunnah.ar} label={anchorSunnah.src} /> : null}
                <View style={{ height: 1, backgroundColor: alpha(stage.gold, 0.25) }} />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: stage.gold }}>{t("j_answers")}</Text>
                {[
                  [t("q_why"), occasion ? t(`o_${occasion}`) : "–", "why"],
                  [t("q_who"), t(`w_${who ?? "me"}`), "who"],
                  [t("q_dir"), t(`d_${direction ?? "heart"}`), "direction"],
                  [t("q_len"), t(`l_${len ?? "medium"}`), "length"],
                  [t("q_lang"), `${DUA_LANGS.find(([c]) => c === lang)?.[1] ?? lang}${withAr && !ARABIC_SCRIPT.has(lang) ? ` · ${t("j_alsoAr")}` : ""}`, "language"],
                ].map(([q, a, st]) => (
                  <Pressable key={st} onPress={() => go(st as Step)} accessibilityRole="button" accessibilityLabel={`${q} ${a}`} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13.5, color: stage.textMuted }} numberOfLines={1}>{q}</Text>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#ffffff", maxWidth: "55%" }} numberOfLines={1}>{a}</Text>
                    <Icon name="chevronRight" color="rgba(255,255,255,0.5)" size={16} />
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {step === "reveal" ? (
            <DuaReveal lines={result && !waiting ? result.personal : null} arabic={result?.arabic} still={false} phrases={[t("j_r1"), t("j_r2"), t("j_r3")]} label={t("j_kicker")} continueLabel={t("j_next")} onDone={onRevealDone} />
          ) : null}

          {step === "card" && view ? (
            <>
              {result?.note ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "#f3d48e", marginBottom: 14 }}>{result.note}</Text> : null}
              <Animated.View entering={FadeIn.duration(900)}><DuaCard v={view} look={look} /></Animated.View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 }} accessibilityRole="radiogroup" accessibilityLabel={t("sh_style")}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: stage.textMuted, marginRight: 4 }}>{t("sh_style")}</Text>
                {CARD_STYLES.map((cs) => (
                  <Pressable key={cs} onPress={() => { setLook(cs); tick(); }} accessibilityRole="radio" accessibilityState={{ selected: look === cs }}
                    style={{ paddingHorizontal: 12, height: 32, borderRadius: R.pill, borderWidth: 1, justifyContent: "center", borderColor: look === cs ? stage.gold : alpha(stage.gold, 0.3), backgroundColor: look === cs ? alpha(stage.gold, 0.16) : "transparent" }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: "#ffffff" }}>{t(`sh_${cs}`)}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                <OutlineButton onStage icon="bookmark" title={savedId ? t("j_savedOk") : t("j_save")} disabled={!!savedId} onPress={save} style={{ flex: 1 }} />
                <GoldButton icon="share" title={t("j_share")} onPress={() => setSharing(true)} style={{ flex: 1.3 }} />
              </View>
              {who && who !== "me" ? (
                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <OutlineButton onStage icon="send" title={t("g_gift")} onPress={() => void Share.share({ message: `${t("g_shareLine")}\n${giftLink()}` })} style={{ flex: 1 }} />
                  <OutlineButton onStage icon="comment" title={t("g_messenger")} onPress={() => setMessenger(true)} style={{ flex: 1 }} />
                </View>
              ) : (
                <OutlineButton onStage icon="comment" title={t("g_messenger")} onPress={() => setMessenger(true)} style={{ marginTop: 10 }} />
              )}
              <MessengerSheet visible={messenger} onClose={() => setMessenger(false)} t={t} text={[t("g_msgIntro"), view.personal, view.quran ? view.quran.ref : "", `– ${t("j_personalAi")}`].filter(Boolean).join("\n\n")} />
              <OutlineButton onStage icon="copy" title={t("copy")} onPress={() => void Share.share({ message: [view.names, view.quran ? `${view.quran.ar}\n(${view.quran.ref})` : "", view.personal, view.arabic ?? "", view.forWho ?? "", `— ${view.disclosure}`, SITE].filter(Boolean).join("\n\n") })} style={{ marginTop: 10 }} />
              <AuthenticList t={t} quran={quran} sunnah={sunnah} uiLang={uiLang} names={names} />
              <OutlineButton onStage title={t("j_new")} onPress={reset} style={{ marginTop: 28 }} />
              {sharing ? (
                <ShareSheet visible onClose={() => setSharing(false)} link={`${SITE}/dua-generator`} noDecoration seed="dua"
                  message={[view.personal, view.quran?.ref ?? "", view.disclosure].filter(Boolean).join("\n\n")} renderCard={(f) => <DuaCard v={view} format={f} hideTr={uiLang === "ar"} look={look} />} />
              ) : null}
            </>
          ) : null}
        </Animated.View>
      </ScrollView>

      {breaking ? <SealBreak still={still} onDone={onBroken} /> : null}
      <Modal visible={askConsent} transparent animationType="fade" onRequestClose={() => setAskConsent(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(2,12,9,0.6)", justifyContent: "flex-end" }}>
          <View style={{ margin: 12, marginBottom: insets.bottom + 12, borderRadius: 26, overflow: "hidden", borderWidth: 1, borderColor: alpha(stage.gold, 0.4), padding: 22, gap: 14 }}>
            <Glass strong />
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 28, color: "#ffffff" }}>{t("j_consentTitle")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: stage.textSoft }}>{t("j_consent")}</Text>
            <GoldButton title={t("j_consentOk")} onPress={() => { writeJSON(DUA_AI_CONSENT_KEY, DUA_AI_CONSENT_VERSION, true); setAskConsent(false); }} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: stage.textMuted }}>{t("s_trust")}</Text>
            <OutlineButton onStage title={t("j_back")} onPress={() => setAskConsent(false)} />
          </View>
        </View>
      </Modal>
    </JourneyStage>
  );
}

/** Liquid Glass on iOS 26+, a dark blur elsewhere */
function Glass({ round, strong }: { round?: boolean; strong?: boolean }) {
  if (GLASS) return <GlassView glassEffectStyle={strong ? "regular" : "clear"} tintColor={strong ? "rgba(4,32,24,0.7)" : "rgba(4,32,24,0.4)"} style={[StyleSheet.absoluteFill, round ? { borderRadius: 999 } : null]} />;
  return (
    <>
      <BlurView intensity={strong ? 60 : 30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: strong ? "rgba(4,32,24,0.82)" : "rgba(6,30,23,0.55)" }]} />
    </>
  );
}

function Anchor({ ar, label }: { ar: string | null; label: string }) {
  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      {ar ? <Text numberOfLines={3} style={{ fontFamily: ARABIC_FONT, fontSize: 19, lineHeight: 36, color: "#ffffff", textAlign: "center", writingDirection: "rtl" }}>{ar}</Text> : <ActivityIndicator color={stage.gold} />}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: "rgba(214,180,108,0.9)" }}>{label}</Text>
    </View>
  );
}

function BuyTile({ title, price, note, highlight, busy, disabled, onPress }: { title: string; price: string | null; note?: string; highlight?: boolean; busy?: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={[title, price, note].filter(Boolean).join(", ")}
      style={({ pressed }) => ({ flex: 1, minHeight: 112, borderRadius: R.card, borderWidth: highlight ? 1.5 : 1, padding: 14, justifyContent: "space-between", overflow: "hidden", opacity: disabled && !busy ? 0.6 : 1,
        borderColor: highlight ? stage.gold : alpha(stage.gold, 0.35), backgroundColor: highlight ? alpha(stage.gold, 0.14) : "rgba(6,30,23,0.7)", transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      <View>
        {note ? <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: stage.gold, marginBottom: 6 }}>{note}</Text> : null}
        <Text style={{ fontFamily: FONT.bold, fontSize: 15, lineHeight: 20, color: "#ffffff" }}>{title}</Text>
      </View>
      {busy ? <ActivityIndicator color={stage.gold} style={{ alignSelf: "flex-start", marginTop: 10 }} /> : price ? (
        <Text style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 28, color: "#ffffff", marginTop: 10, fontVariant: ["tabular-nums"] }}>{price}</Text>
      ) : null}
    </Pressable>
  );
}

type T = (k: string, p?: Record<string, string | number>) => string;
function AuthenticList({ t, quran, sunnah, uiLang, names }: { t: T; quran: QuranDua[] | null; sunnah: SunnahDua[]; uiLang: string; names: { id: string; ar: string }[] }) {
  const ar = uiLang === "ar";
  const card = (k: string, children: ReactNode) => <View key={k} style={{ borderRadius: R.card, borderWidth: 1, borderColor: alpha(stage.gold, 0.22), backgroundColor: "rgba(6,30,23,0.72)", padding: 16 }}>{children}</View>;
  return (
    <View style={{ marginTop: 36, gap: 10 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: "#ffffff", marginBottom: 4 }}>{t("j_authentic")}</Text>
      {(quran ?? []).map((q) => card(q.key, (
        <>
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 21, lineHeight: 42, color: "#ffffff", writingDirection: "rtl", textAlign: "right" }}>{q.ar}</Text>
          {q.tr && !ar ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: stage.textSoft, marginTop: 6 }}>{q.tr.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "")}</Text> : null}
          <Text onPress={() => { const [s, v] = q.key.split(":"); router.push(`/surah/${s}?v=${v}` as never); }} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold, marginTop: 10 }}>{t("quranRef", { ref: q.key })}</Text>
        </>
      )))}
      {sunnah.map((d) => card(d.id, (
        <>
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 40, color: "#ffffff", writingDirection: "rtl", textAlign: "right" }}>{d.ar}</Text>
          {!ar ? <Text style={{ fontFamily: FONT.italic, fontSize: 13.5, lineHeight: 20, color: stage.gold, marginTop: 6 }}>{d.tr}</Text> : null}
          {!ar ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: stage.textSoft, marginTop: 6 }}>{uiLang === "de" ? d.de : d.en}</Text> : null}
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: stage.textMuted, marginTop: 10 }}>{d.src}{d.n ? ` · ${d.n}×` : ""}</Text>
        </>
      )))}
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: "#ffffff", marginTop: 24, marginBottom: 4 }}>{t("j_namesTitle")}</Text>
      {/* names first, then when duas are answered and how to make dua (the generator page's sections) */}
      {names.map((n) => card(n.id, (
        <View style={{ alignItems: "center" }}>
          <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 32, lineHeight: 50, color: stage.gold, writingDirection: "rtl" }}>{n.ar}</Text>
          {!ar ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#ffffff", marginTop: 4 }}>{t(`n_${n.id}`)}</Text> : null}
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: stage.textMuted, marginTop: 3, textAlign: "center" }}>{t(`nd_${n.id}`)}</Text>
        </View>
      )))}
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: "#ffffff", marginTop: 24, marginBottom: 4 }}>{t("timesTitle")}</Text>
      {[1, 2, 3, 4, 5].map((i) => card(`time${i}`, (
        <>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, lineHeight: 21, color: "#ffffff" }}>{t(`time${i}`)}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textMuted, marginTop: 3 }}>{t(`time${i}d`)}</Text>
        </>
      )))}
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: "#ffffff", marginTop: 24, marginBottom: 4 }}>{t("adabTitle")}</Text>
      {[1, 2, 3, 4].map((i) => card(`adab${i}`, <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: stage.textSoft }}>{t(`adab${i}`)}</Text>))}
    </View>
  );
}

/** the pack value, shown once after the second single dua (price only from the store) */
function PackNudge({ text, onSeen }: { text: string; onSeen: () => void }) {
  useEffect(() => { onSeen(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <Text style={{ fontFamily: FONT.medium, fontSize: 13.5, lineHeight: 20, color: "#f3d48e", textAlign: "center" }}>{text}</Text>;
}
