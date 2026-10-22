import { CardShareSheet } from "@/features/share/ShareKit";
import { useShareText } from "@/features/share/texts";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, Share, Text, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { FRAME, NAMES, PLAN, TOPICS, WHO, guessTopic, type Topic, type Who } from "@/web/duaGenerator";
import { SUNNAH_DUAS, type SunnahDua } from "@/web/sunnahDuas";
import { SUNNAH_DUAS_2 } from "@/web/sunnahDuas2";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { buyPersonalDua, duaPrices, useAiCredits } from "@/lib/purchases";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, goldButton, stage, useTheme, AR_RIGHT } from "@/lib/theme";
import { OutlineButton, Stage } from "@/components/brand";
import { Callout, IllumFrame, Label, LightChip, Niche, Rosette, StageButton, go, useGold } from "./art";
import { Field } from "./ui";
import { useTx } from "./text";
import { ETIQUETTE_HADITH } from "./web/duaEtiquette";
import { useSiteConfig } from "@/features/extra/config";
import { useX } from "@/features/extra/strings";

type QuranDua = { key: string; ar: string; tr: string };
const ALL_SUNNAH: SunnahDua[] = [...SUNNAH_DUAS, ...SUNNAH_DUAS_2];
type Made = { topic: Topic; text: string; who: Who; key: number };

// Dua generator (website DuaGenerator.tsx + lib/duaGenerator.ts): for a concern it builds a personal dua – praise,
// blessings on the Prophet ﷺ, the fitting names of Allah, the request, closing – and shows the authentic duas of the
// Quran and the Sunnah (Arabic readers get no translation lines). Free, no AI. A personal dua written by the server (AI)
// is a paid extra in the app.
export default function DuaGenerator({ scrollTo, initialTopic }: { scrollTo?: (y: number) => void; initialTopic?: string }) {
  const t = useWebT("duagen");
  const th = useTheme();
  const g = useGold();
  const { lang } = useLang();
  const locale = lang;
  const ar = locale === "ar";
  // the AI phrasing exists only while the owner has it switched on (admin: ai + features.duaAi)
  const cfg = useSiteConfig();
  const aiOn = cfg.ai && cfg.features.duaAi;
  const [topic, setTopic] = useState<Topic | null>((TOPICS as readonly string[]).includes(initialTopic ?? "") ? (initialTopic as Topic) : null);
  const [text, setText] = useState("");
  const [who, setWho] = useState<Who>("me");
  const [made, setMade] = useState<Made | null>(null);
  const [quran, setQuran] = useState<QuranDua[] | null>(null);
  const [ai, setAi] = useState<{ state: "idle" | "busy" | "err"; text: string; err?: string }>({ state: "idle", text: "" });
  const y = useRef({ result: 0, personal: 0 });
  const pending = useRef(false);

  const guessed = useMemo(() => (text.trim().length > 2 ? guessTopic(text) : null), [text]);
  const chosen = topic ?? guessed;

  const make = () => {
    const tp = chosen ?? "heart";
    setMade({ topic: tp, text: text.trim().slice(0, 300), who, key: Date.now() });
    setAi({ state: "idle", text: "" });
    setQuran(null);
    api<{ quran?: QuranDua[] }>(`/api/dua-generator?topic=${tp}&locale=${locale}`).then((d) => setQuran(d.quran ?? [])).catch(() => setQuran([]));
    pending.current = true; // scroll to the result once it is laid out
  };

  const plan = made ? PLAN[made.topic] : null;
  const names = plan ? plan.names.map((id) => NAMES[id]) : [];
  const request = made ? (ai.text || [made.text ? t("ownWords", { text: made.text }) : "", t(`req_${made.topic}`)].filter(Boolean).join("\n\n")) : "";
  const sunnah = plan ? plan.sunnah.map((id) => ALL_SUNNAH.find((d) => d.id === id)).filter(Boolean) as SunnahDua[] : [];

  const plain = () => made ? [
    FRAME.praise, ar ? "" : t("praiseTr"), "", FRAME.salawat, ar ? "" : t("salawatTr"), "",
    names.map((n) => n.voc).join("، "), "", request, made.who !== "me" ? t("forWho", { who: t(`wf_${made.who}`) }) : "", "",
    FRAME.close, ar ? "" : t("closeTr"), FRAME.end, "", "quranmasterclass.com",
  ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n") : "";
  const stx = useShareText();
  const [sharing, setSharing] = useState(false);
  const share = () => setSharing(true);

  const chip = (label: string, on: boolean, onPress: () => void) => <LightChip key={label} label={label} on={on} onPress={onPress} />;

  return (
    <View>
      {sharing && made ? <CardShareSheet visible onClose={() => setSharing(false)}
        data={{ kicker: stx.dua, arabic: [FRAME.praise, FRAME.salawat, names.map((n) => n.voc).join("، ")].join("\n"), body: request, footer: t("title") }} /> : null}
      {/* the request */}
      <View style={{ borderRadius: 16, borderWidth: 1, borderColor: "rgba(201,166,94,0.3)", backgroundColor: th.surface, padding: 20, shadowColor: "rgb(3,25,18)", shadowOpacity: 0.06, shadowRadius: 30, shadowOffset: { width: 0, height: 10 } }}>
        <Label>{t("step1")}</Label>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {TOPICS.map((tp) => chip(t(`t_${tp}`), chosen === tp, () => setTopic(topic === tp ? null : tp)))}
        </View>
        <Label style={{ marginTop: 24 }}>{t("step2")}</Label>
        <Field value={text} onChangeText={(v) => setText(v.slice(0, 300))} maxLength={300} multiline numberOfLines={3} placeholder={t("placeholder")} accessibilityLabel={t("step2")}
          style={{ marginTop: 8, minHeight: 96, textAlignVertical: "top", lineHeight: 24 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12, color: th.muted }}>{guessed && !topic ? t("guessed", { topic: t(`t_${guessed}`) }) : t("anyLanguage")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted }}>{text.length}/300</Text>
        </View>
        <Label style={{ marginTop: 20 }}>{t("step3")}</Label>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {WHO.map((w) => chip(t(`w_${w}`), who === w, () => setWho(w)))}
        </View>
        <Pressable onPress={make} accessibilityRole="button" accessibilityLabel={t("make")} style={({ pressed }) => ({ marginTop: 28, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
          <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 48, borderRadius: R.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Rosette size={20} color={goldButton.text} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: goldButton.text }}>{t("make")}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {made && plan ? (
        <View key={made.key} onLayout={(e) => { y.current.result = e.nativeEvent.layout.y; if (pending.current) { pending.current = false; scrollTo?.(y.current.result); } }}>
          {/* the personal dua */}
          <Stage rounded={16} hairlines={false} style={{ marginTop: 32 }}>
            <IllumFrame rosettes={26} />
            <View style={{ paddingHorizontal: 24, paddingVertical: 36, alignItems: "center" }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2.4, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{t("yourDua")} · {t(`t_${made.topic}`)}</Text>
              <View style={{ marginTop: 24, gap: 20, width: "100%", maxWidth: 640 }}>
                <FrameLine ar={FRAME.praise} tr={ar ? "" : t("praiseTr")} />
                <FrameLine ar={FRAME.salawat} tr={ar ? "" : t("salawatTr")} />
                <View style={{ alignItems: "center" }}>
                  <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 34, lineHeight: 52, color: stage.gold, writingDirection: "rtl", textAlign: "center" }}>{names.map((n) => n.voc).join("، ")}</Text>
                  {!ar ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4, textAlign: "center" }}>{names.map((n) => t(`n_${n.id}`)).join(" · ")}</Text> : null}
                </View>
                <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 20, paddingVertical: 20 }}>
                  <Text style={{ fontFamily: ar ? ARABIC_FONT : FONT.regular, fontSize: ar ? 22 : 18, lineHeight: ar ? 40 : 29, color: "rgba(255,255,255,0.9)", textAlign: "center", writingDirection: ar ? "rtl" : undefined }}>{request}</Text>
                  {made.who !== "me" ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: "rgba(255,255,255,0.7)", marginTop: 8, textAlign: "center" }}>{t("forWho", { who: t(`wf_${made.who}`) })}</Text> : null}
                  {ai.text ? <Text style={{ fontFamily: FONT.regular, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginTop: 12, textAlign: "center" }}>{t("aiLabel")}</Text> : null}
                </View>
                <FrameLine ar={FRAME.close} tr={ar ? "" : t("closeTr")} small="2:201" />
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 40, color: stage.gold, writingDirection: "rtl", textAlign: "center" }}>{FRAME.end}</Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 32 }}>
                <StageButton title={t("share")} onPress={share} />
                {aiOn ? <StageButton gold title={t("aiRefine")} onPress={() => scrollTo?.(y.current.result + y.current.personal)} /> : null}
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 19, color: "rgba(255,255,255,0.5)", marginTop: 24, textAlign: "center", maxWidth: 520 }}>{t("note")}</Text>
            </View>
          </Stage>

          {/* names */}
          <View style={{ gap: 12, marginTop: 32 }}>
            {names.map((n) => (
              <View key={n.id} style={{ borderRadius: R.card, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface, padding: 20, alignItems: "center", overflow: "hidden" }}>
                <Niche color="rgba(201,166,94,0.25)" />
                <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 36, lineHeight: 54, color: th.gold, writingDirection: "rtl" }}>{n.ar}</Text>
                {!ar ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.ink, marginTop: 8, textAlign: "center" }}>{t(`n_${n.id}`)}</Text> : null}
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 20, color: th.muted, marginTop: 4, textAlign: "center" }}>{t(`nd_${n.id}`)}</Text>
              </View>
            ))}
          </View>

          {/* Quran */}
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: th.ink, marginTop: 40 }}>{t("fromQuran")}</Text>
          {quran === null ? <View style={{ height: 160, borderRadius: R.card, backgroundColor: th.line, opacity: 0.4, marginTop: 20 }} /> : (
            <View style={{ gap: 12, marginTop: 20 }}>
              {quran.map((q) => {
                const [s, v] = q.key.split(":");
                return (
                  <View key={q.key} style={{ borderRadius: R.card, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface, padding: 20 }}>
                    <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 50, color: th.arabic, writingDirection: "rtl", textAlign: AR_RIGHT }}>{q.ar}</Text>
                    {q.tr ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.muted, marginTop: 8 }}>{q.tr.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "")}</Text> : null}
                    <Text onPress={() => go(`/surah/${s}?v=${v}`)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.accent, marginTop: 12, alignSelf: "flex-start" }}>{t("quranRef", { ref: q.key })}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Sunnah */}
          {sunnah.length > 0 ? (
            <View style={{ marginTop: 40 }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: th.ink }}>{t("fromSunnah")}</Text>
              <View style={{ gap: 12, marginTop: 20 }}>
                {sunnah.map((d) => (
                  <View key={d.id} style={{ borderRadius: R.card, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface, padding: 20 }}>
                    <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 46, color: th.arabic, writingDirection: "rtl", textAlign: AR_RIGHT }}>{d.ar}</Text>
                    {!ar ? <Text style={{ fontFamily: FONT.italic, fontSize: 14, lineHeight: 22, color: th.gold, marginTop: 8 }}>{d.tr}</Text> : null}
                    {!ar ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.muted, marginTop: 8 }}>{locale === "de" ? d.de : d.en}</Text> : null}
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: th.muted, marginTop: 12 }}>{d.src}{d.n ? ` · ${d.n}×` : ""}</Text>
                  </View>
                ))}
              </View>
              <Text onPress={() => go("/duas")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.accent, marginTop: 16, alignSelf: "flex-start" }}>{t("allDuas")}</Text>
            </View>
          ) : null}

          {/* a personal dua written for this concern (paid) */}
          <View onLayout={(e) => { y.current.personal = e.nativeEvent.layout.y; }}>
            <PersonalDua made={made} names={names.map((n) => n.id)} ai={ai} setAi={(a) => { setAi(a); if (a.text) scrollTo?.(y.current.result); }} goldRgb={g} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function FrameLine({ ar, tr, small }: { ar: string; tr: string; small?: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ writingDirection: "rtl", textAlign: "center" }}>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 50, color: "#ffffff" }}>{ar}</Text>
        {small ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{"  "}({small})</Text> : null}
      </Text>
      {tr ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.6)", marginTop: 4, textAlign: "center" }}>{tr}</Text> : null}
    </View>
  );
}

type AiState = { state: "idle" | "busy" | "err"; text: string; err?: string };
const FALLBACK = { one: "", pack: "" }; // no fixed euro amounts: only Apple's price in the buyer's currency

// The paid step: the server phrases the request in the person's own words (website POST /api/dua-generator).
// Signed out → sign in; credits left → write; otherwise one dua or a pack of five through the store.
function PersonalDua({ made, names, ai, setAi, goldRgb }: { made: Made; names: string[]; ai: AiState; setAi: (a: AiState) => void; goldRgb: string }) {
  const t = useWebT("duagen");
  const tx = useTx();
  const xa = useX();
  const th = useTheme();
  const { lang } = useLang();
  const { user } = useAuth();
  const { credits, refresh } = useAiCredits();
  const [on, setOn] = useState<boolean | null>(null);
  const [prices, setPrices] = useState<{ one: string | null; pack: string | null }>({ one: null, pack: null });
  const [buying, setBuying] = useState<"one" | "pack" | null>(null);
  const [msg, setMsg] = useState("");
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  useEffect(() => {
    api<{ ai?: boolean; features?: { duaAi?: boolean } }>("/api/config").then((c) => setOn(!!c.ai && !!c.features?.duaAi)).catch(() => setOn(null));
    duaPrices().then(setPrices).catch(() => undefined);
  }, []);
  if (on === false) return null;
  const left = (credits?.dua ?? 0) + (credits?.proDuaLeft ?? 0);

  const write = async () => {
    setMsg("");
    setAi({ state: "busy", text: "" });
    try {
      const d = await api<{ text?: string }>("/api/dua-generator", { body: { text: made.text, topic: made.topic, who: made.who, locale: lang, names } });
      if (!alive.current) return;
      if (d.text) setAi({ state: "idle", text: d.text }); else setAi({ state: "err", text: "", err: t("aiError") });
    } catch (e) {
      if (!alive.current) return;
      const status = e instanceof ApiError ? e.status : 0;
      setAi({ state: "err", text: "", err: status === 401 ? t("aiLogin") : status === 403 ? xa.verify : status === 429 ? t("aiLimit") : status === 402 ? tx("noCredit") : t("aiError") });
    }
    void refresh();
  };
  const buy = async (pack: boolean) => {
    setMsg(""); setBuying(pack ? "pack" : "one");
    let ok = false;
    try { ok = await buyPersonalDua(pack); } catch { ok = false; }
    if (!alive.current) return;
    setBuying(null);
    if (!ok) { setMsg(tx("buyFailed")); return; }
    await refresh();
    await write();
  };

  return (
    <Callout style={{ padding: 20, marginTop: 40 }} radius={R.card}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 28, color: th.ink }}>{tx("personalTitle")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.ink, marginTop: 10 }}>{tx("personalLead", { narrator: ETIQUETTE_HADITH.narrator })}</Text>
      <Text style={{ fontFamily: FONT.italic, fontSize: 14.5, lineHeight: 23, color: th.muted, marginTop: 6 }}>{t("adab1")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 23, color: th.ink, marginTop: 12 }}>{tx("personalGet")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 19, color: th.muted, marginTop: 10 }}>{t("note")}</Text>

      <View style={{ marginTop: 20, gap: 12 }}>
        {!user ? (
          <>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: th.muted }}>{tx("personalSignIn")}</Text>
            <OutlineButton title={tx("signIn")} onPress={() => router.push("/sign-in")} compact />
          </>
        ) : ai.state === "busy" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48 }}>
            <ActivityIndicator color={th.accent} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: th.ink }}>{t("aiBusy")}</Text>
          </View>
        ) : left > 0 ? (
          <>
            <Pressable onPress={() => void write()} accessibilityRole="button" style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.985 : 1 }] })}>
              <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 52, borderRadius: R.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Rosette size={20} color={goldButton.text} />
                <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: goldButton.text }}>{ai.text ? t("aiRefine") : tx("write")}</Text>
              </LinearGradient>
            </Pressable>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: th.muted }}>{left === 1 ? tx("leftOne") : tx("left", { n: left })}</Text>
          </>
        ) : (
          <>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <BuyTile title={tx("one")} price={prices.one ?? FALLBACK.one} busy={buying === "one"} disabled={!!buying} onPress={() => void buy(false)} goldRgb={goldRgb} />
              <BuyTile title={tx("pack")} price={prices.pack ?? FALLBACK.pack} note={tx("packNote")} highlight busy={buying === "pack"} disabled={!!buying} onPress={() => void buy(true)} goldRgb={goldRgb} />
            </View>
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: th.muted }}>{Platform.OS === "android" ? tx("storeNote") : tx("storeNote").replace(/App Store\s+(or|bzw\.|或|atau|یا|veya|o de|или|ou|বা|أو)\s+Google Play/, "App Store")}</Text>
          </>
        )}
        {ai.err ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 14, color: th.muted }}>{ai.err}</Text> : null}
        {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 14, color: th.muted }}>{msg}</Text> : null}
      </View>
    </Callout>
  );
}

function BuyTile({ title, price, note, highlight, busy, disabled, onPress, goldRgb }: { title: string; price: string; note?: string; highlight?: boolean; busy?: boolean; disabled?: boolean; onPress: () => void; goldRgb: string }) {
  const th = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={`${title}, ${price}${note ? `, ${note}` : ""}`}
      style={({ pressed }) => ({ flex: 1, minHeight: 116, borderRadius: R.card, borderWidth: highlight ? 1.5 : 1, padding: 14, justifyContent: "space-between", opacity: disabled && !busy ? 0.6 : 1,
        borderColor: highlight ? "rgb(201,166,94)" : pressed ? `rgba(${goldRgb},0.55)` : th.line, backgroundColor: highlight ? "rgba(201,166,94,0.1)" : th.surface, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
      <View>
        {note ? <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: th.gold, marginBottom: 6 }}>{note}</Text> : null}
        <Text style={{ fontFamily: FONT.bold, fontSize: 15, lineHeight: 20, color: th.ink }}>{title}</Text>
      </View>
      {busy ? <ActivityIndicator color={th.accent} style={{ alignSelf: "flex-start", marginTop: 10 }} /> : (
        <Text style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 28, color: th.ink, marginTop: 10, fontVariant: ["tabular-nums"] }}>{price}</Text>
      )}
    </Pressable>
  );
}
