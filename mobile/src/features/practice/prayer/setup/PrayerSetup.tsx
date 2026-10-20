import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { CalculationMethod } from "adhan";
import { CITIES, METHODS, cityName, type MethodKey, type PrayerSettings, type Spot } from "@/web/prayer";
import type { AdhanFile } from "@/web/adhan";
import { api } from "@/lib/api";
import { writeJSON } from "@/lib/store";
import { intlLocale, useLang, pick } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { FONT, R, goldButton, stage } from "@/lib/theme";
import { GoldButton, SmallStar, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { PracticeWindow, go } from "../../art";
import { OptionSheet } from "../../ui";
import { useTx } from "../../text";
import { UI as TRAINER_UI } from "../../web/prayerTrainer";
import { CITY_KEY, SETTINGS_KEY, SPOT_KEY, placeLabel, storedPlace } from "../place";
import { ALERTS_KEY, SETUP_KEY, adhanForTradition, alertPrayers, andWord, ensurePermission, prayerName, remindsOf, reschedulePrayerAlerts, type AlertPrayer, type Alerts, type PrayerSetup as Setup, type Tradition } from "../alerts";
import { asrPassage, combinePassage, samePrayerPassage, type Passage } from "./chapters";

type StepId = "place" | "city" | "tradition" | "unsure" | "combine" | "asr" | "method" | "alerts" | "summary" | "declined";
const NUMBER: Record<StepId, number> = { place: 1, city: 1, tradition: 2, unsure: 3, combine: 3, asr: 3, method: 4, alerts: 5, summary: 6, declined: 6 };
const MINUTES = [0, 5, 10, 15] as const;
type Answers = {
  place?: { kind: "location"; spot: Spot } | { kind: "city"; id: string };
  tradition?: Tradition; combine?: boolean; madhab?: PrayerSettings["madhab"]; method?: PrayerSettings["method"];
  prayers: AlertPrayer[]; minutes?: (typeof MINUTES)[number]; sound?: "adhan" | "soft";
};
const deviceTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; } };

// The guided prayer setup: one question per step on the dark stage, nothing preselected, every answer can be
// changed later on /prayer. It writes the website's own keys (tf:city, tf:myspot, tf:prayerSettings) and the app's
// qmc.prayerAlerts / qmc.prayerSetup, then plans the reminders.
export default function PrayerSetup() {
  const tx = useTx();
  const t = useWebT("prayer");
  const { lang } = useLang();
  const l = lang === "de" ? "de" : "en";
  const insets = useSafeAreaInsets();
  const [hist, setHist] = useState<StepId[]>(["place"]);
  const step = hist[hist.length - 1];
  const goTo = (s: StepId, keepNote = false) => { if (!keepNote) setNote(""); setHist((h) => [...h, s]); };
  const back = () => { setNote(""); if (hist.length > 1) setHist((h) => h.slice(0, -1)); else router.back(); };
  const [a, setA] = useState<Answers>({ prayers: [] });
  const set = (p: Partial<Answers>) => setA((x) => ({ ...x, ...p }));
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<AdhanFile[] | null>(null);
  const [sheet, setSheet] = useState(false);
  useEffect(() => { api<{ files?: AdhanFile[] }>("/api/adhan").then((d) => setFiles(d.files ?? [])).catch(() => setFiles([])); }, []);

  const spot: Spot | null = a.place ? (a.place.kind === "location" ? a.place.spot : CITIES.find((c) => c.id === (a.place as { id: string }).id) ?? null) : null;
  const place = spot ? placeLabel(spot, lang, t("yourPlace")) : "";
  const shia = a.tradition === "shia";
  const combine = shia && !!a.combine;
  const suggested: MethodKey = shia ? "Tehran" : spot?.method ?? "MuslimWorldLeague";
  const methodOf = a.method === undefined ? null : a.method === "auto" ? (spot?.method ?? "MuslimWorldLeague") : a.method;
  const hasAdhan = !!files && files.length > 0;
  const fmt = (n: number) => new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits: 1 }).format(n);
  const tehran = useMemo(() => CalculationMethod.Tehran(), []);
  const groupName = (p: AlertPrayer) => remindsOf(p, combine).map((x) => (remindsOf(p, combine).length > 1 ? prayerName(x, lang) : t(x))).join(` ${andWord(lang)} `);

  const locate = async () => {
    setBusy(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") { setBusy(false); setNote(t("locationDenied")); goTo("city", true); return; }
      const pos = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<null>((r) => setTimeout(() => r(null), 12000)),
      ]) ?? await Location.getLastKnownPositionAsync();
      setBusy(false);
      if (!pos) { setNote(t("locationDenied")); goTo("city", true); return; }
      set({ place: { kind: "location", spot: { id: "mine", lat: pos.coords.latitude, lon: pos.coords.longitude, tz: deviceTz(), method: "MuslimWorldLeague" } } });
      goTo("tradition");
    } catch {
      setBusy(false); setNote(t("locationDenied")); goTo("city", true);
    }
  };

  const toAlerts = async () => {
    if (a.prayers.length) {
      const r = await ensurePermission();
      if (r !== "granted") { setNote(tx("alertsDenied")); goTo("summary", true); return; }
    }
    goTo("summary");
  };

  const save = async (declined: boolean) => {
    setBusy(true);
    if (!declined && a.place) {
      if (a.place.kind === "location") { writeJSON(SPOT_KEY, a.place.spot, true); writeJSON(CITY_KEY, "mine", true); }
      else writeJSON(CITY_KEY, a.place.id, true);
      const cur = storedPlace().settings;
      const madhab: PrayerSettings["madhab"] = shia ? "shafi" : a.madhab ?? "auto";
      writeJSON(SETTINGS_KEY, { ...cur, method: a.method ?? "auto", madhab } satisfies PrayerSettings, true);
      const alerts: Alerts = {};
      for (const p of a.prayers) alerts[p] = true;
      writeJSON(ALERTS_KEY, alerts, true);
      if (a.sound === "adhan" && files?.length) {
        const pick = adhanForTradition(a.tradition, files);
        writeJSON("tf:adhanVoice", pick?.id ?? "random", true);
        writeJSON("tf:prayerAutoAdhan", true, true);
      }
    } else {
      writeJSON(ALERTS_KEY, {}, true);
    }
    const setup: Setup = declined ? { done: true, declined: true, at: Date.now() }
      : { tradition: a.tradition, combine, minutesBefore: a.minutes ?? 0, sound: a.sound ?? "soft", done: true, at: Date.now() };
    writeJSON(SETUP_KEY, setup, true);
    await reschedulePrayerAlerts(lang).catch(() => 0);
    setBusy(false);
    router.back();
  };

  const prayersInMode = alertPrayers(combine);
  const allOn = prayersInMode.every((p) => a.prayers.includes(p));
  const toggle = (p: AlertPrayer) => set({ prayers: a.prayers.includes(p) ? a.prayers.filter((x) => x !== p) : [...a.prayers, p] });
  const alertsReady = a.prayers.length === 0 || (a.minutes !== undefined && (a.sound !== undefined || !hasAdhan));

  let body: ReactNode = null;
  if (step === "place") {
    body = (
      <Q kicker={tx("setupKicker")} title={tx("qPlace")} lead={tx("qPlaceLead")}>
        <Choice title={tx("yesLocation")} sub={tx("yesLocationSub")} icon="map" busy={busy} onPress={() => void locate()} />
        <Choice title={tx("chooseCity")} sub={tx("chooseCitySub")} icon="mosque" onPress={() => goTo("city")} />
        <Choice title={tx("noThanks")} sub={tx("noThanksSub")} icon="close" quiet onPress={() => goTo("declined")} />
      </Q>
    );
  } else if (step === "city") {
    body = (
      <Q kicker={tx("setupKicker")} title={tx("qCity")} lead={note || undefined}>
        {CITIES.map((c) => <Choice key={c.id} title={cityName(c, l)} compact onPress={() => { set({ place: { kind: "city", id: c.id } }); goTo("tradition"); }} />)}
      </Q>
    );
  } else if (step === "tradition") {
    body = (
      <Q kicker={tx("setupKicker")} title={tx("qTradition")} lead={tx("qTraditionLead")}>
        <Choice title={pick(TRAINER_UI, lang).sunni} onPress={() => { set({ tradition: "sunni", combine: false }); goTo("asr"); }} />
        <Choice title={pick(TRAINER_UI, lang).shia} onPress={() => { set({ tradition: "shia", madhab: undefined, prayers: [] }); goTo("combine"); }} />
        <Choice title={tx("unsure")} quiet onPress={() => { set({ tradition: "unsure", combine: false, madhab: "auto" }); goTo("unsure"); }} />
      </Q>
    );
  } else if (step === "unsure") {
    const p = samePrayerPassage(l);
    body = (
      <Q kicker={tx("setupKicker")} title={tx("unsureTitle")} lead={tx("unsureText")}>
        {p ? <Quote p={p} /> : null}
        <GoldButton title={tx("next")} onPress={() => goTo("method")} style={{ marginTop: 8 }} />
      </Q>
    );
  } else if (step === "combine") {
    const p = combinePassage(l);
    body = (
      <Q kicker={pick(TRAINER_UI, lang).shia} title={tx("qCombine")}>
        {p ? <Quote p={p} /> : null}
        <Choice title={tx("combine3")} sub={(["fajr", "dhuhr", "maghrib"] as const).map((x) => remindsOf(x, true).map((y) => prayerName(y, lang)).join(` ${andWord(lang)} `)).join(" · ")}
          onPress={() => { set({ combine: true, prayers: [] }); goTo("method"); }} />
        <Choice title={tx("combine5")} sub={(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((x) => prayerName(x, lang)).join(" · ")}
          onPress={() => { set({ combine: false, prayers: [] }); goTo("method"); }} />
      </Q>
    );
  } else if (step === "asr") {
    const p = asrPassage(l);
    body = (
      <Q kicker={pick(TRAINER_UI, lang).sunni} title={tx("qAsr")}>
        {p ? <Quote p={p} /> : null}
        <Choice title={tx("asrShafi")} sub={tx("asrShafiSub")} onPress={() => { set({ madhab: "shafi" }); goTo("method"); }} />
        <Choice title={tx("asrHanafi")} sub={tx("asrHanafiSub")} onPress={() => { set({ madhab: "hanafi" }); goTo("method"); }} />
        <Choice title={tx("unsure")} sub={tx("asrUnsureSub")} quiet onPress={() => { set({ madhab: "auto" }); goTo("method"); }} />
      </Q>
    );
  } else if (step === "method") {
    body = (
      <Q kicker={tx("setupKicker")} title={tx("qMethod")}>
        <View style={{ borderRadius: 14, borderWidth: 1, borderColor: "rgba(214,180,108,0.45)", backgroundColor: "rgba(214,180,108,0.08)", padding: 18, gap: 6 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase", color: stage.gold }}>{tx("methodSuggested", { place })}</Text>
          <Text style={{ fontFamily: FONT.display, fontSize: 20, lineHeight: 26, color: "#eef0f3" }}>{t(`m_${suggested}`)}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.72)" }}>
            {shia ? tx("methodShia", { fajr: fmt(tehran.fajrAngle), isha: fmt(tehran.ishaAngle), maghrib: fmt(tehran.maghribAngle) }) : tx("methodRegional", { place })}
          </Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 19, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{t("notice")}</Text>
        </View>
        <Choice title={tx("useSuggested")} onPress={() => { set({ method: shia ? "Tehran" : "auto" }); goTo("alerts"); }} />
        <Choice title={tx("otherMethod")} quiet onPress={() => setSheet(true)} />
        <OptionSheet open={sheet} title={t("method")} value={(a.method ?? "") as string} options={METHODS.map((m) => ({ value: m as string, label: t(`m_${m}`) }))}
          onClose={() => setSheet(false)} onPick={(m) => { setSheet(false); set({ method: m as MethodKey }); goTo("alerts"); }} />
      </Q>
    );
  } else if (step === "alerts") {
    body = (
      <Q kicker={tx("setupKicker")} title={tx("qAlerts")} lead={tx("permissionNote")}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Pill label={tx("all")} on={allOn} onPress={() => set({ prayers: allOn ? [] : [...prayersInMode] })} />
          {prayersInMode.map((p) => <Pill key={p} label={groupName(p)} on={a.prayers.includes(p)} onPress={() => toggle(p)} />)}
        </View>
        {a.prayers.length ? (
          <>
            <SubTitle>{tx("when")}</SubTitle>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {MINUTES.map((m) => <Pill key={m} label={m === 0 ? tx("atTime") : tx("minutesBefore", { n: m })} on={a.minutes === m} onPress={() => set({ minutes: m })} />)}
            </View>
            <SubTitle>{tx("sound")}</SubTitle>
            {files === null ? <ActivityIndicator color={stage.gold} style={{ alignSelf: "flex-start" }} /> : (
              <>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {hasAdhan ? <Pill label={tx("soundAdhan")} on={a.sound === "adhan"} onPress={() => set({ sound: "adhan" })} /> : null}
                  <Pill label={tx("soundSoft")} on={a.sound === "soft" || !hasAdhan} onPress={() => set({ sound: "soft" })} />
                </View>
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.6)" }}>{hasAdhan ? (a.sound === "adhan" ? tx("adhanNote") : "") : tx("adhanSoon")}</Text>
              </>
            )}
          </>
        ) : null}
        <GoldButton title={a.prayers.length ? tx("next") : tx("withoutAlerts")} disabled={!alertsReady} onPress={() => { if (!hasAdhan && a.prayers.length) set({ sound: "soft" }); void toAlerts(); }} style={{ marginTop: 12 }} />
      </Q>
    );
  } else if (step === "summary") {
    const tradLabel = a.tradition === "shia" ? pick(TRAINER_UI, lang).shia : a.tradition === "sunni" ? pick(TRAINER_UI, lang).sunni : tx("unsure");
    const asrLabel = shia ? null : a.madhab === "shafi" ? `${tx("asrShafi")} · ${tx("asrShafiSub")}` : a.madhab === "hanafi" ? `${tx("asrHanafi")} · ${tx("asrHanafiSub")}` : tx("asrUnsureSub");
    const rem = a.prayers.length
      ? `${prayersInMode.filter((p) => a.prayers.includes(p)).map(groupName).join(" · ")}\n${a.minutes ? tx("minutesBefore", { n: a.minutes }) : tx("atTime")} · ${a.sound === "adhan" ? tx("soundAdhan") : tx("soundSoft")}`
      : tx("sumNone");
    body = (
      <Q kicker={tx("setupKicker")} title={tx("qSummary")} lead={tx("sumChange")}>
        <View style={{ borderRadius: 14, borderWidth: 1, borderColor: "rgba(214,180,108,0.3)", backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 18 }}>
          <Row k={tx("sumPlace")} v={place} />
          <Row k={tx("sumTradition")} v={`${tradLabel}${combine ? ` · ${tx("combine3")}` : ""}`} />
          {asrLabel ? <Row k={tx("sumAsr")} v={asrLabel} /> : null}
          <Row k={tx("sumMethod")} v={methodOf ? t(`m_${methodOf}`) : ""} />
          <Row k={tx("sumAlerts")} v={rem} last />
        </View>
        {note ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: "rgba(255,255,255,0.65)" }}>{note}</Text> : null}
        <GoldButton title={tx("finish")} busy={busy} onPress={() => void save(false)} style={{ marginTop: 8 }} />
      </Q>
    );
  } else if (step === "declined") {
    body = (
      <Q kicker={tx("setupKicker")} title={tx("declinedTitle")} lead={tx("declinedText")}>
        <GoldButton title={tx("finish")} busy={busy} onPress={() => void save(true)} style={{ marginTop: 8 }} />
      </Q>
    );
  }

  const n = NUMBER[step], total = 6;
  return (
    <Stage hairlines={false} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: insets.top + 40, alignItems: "center", opacity: 0.12 }}>
        <PracticeWindow uid="setup" lamp height={420} />
      </View>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 44 }}>
          <Pressable onPress={back} accessibilityRole="button" accessibilityLabel={tx("back")} hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <Icon name="chevronLeft" color="#ffffff" size={24} />
          </Pressable>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{tx("stepOf", { n, total })}</Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={tx("close")} hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <Icon name="close" color="rgba(255,255,255,0.8)" size={20} />
          </Pressable>
        </View>
        <View style={{ height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 8, overflow: "hidden" }} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: n }}>
          <LinearGradient colors={["#c6a65e", "#ecd7a2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 3, width: `${(n / total) * 100}%` }} />
        </View>
      </View>
      <ScrollView key={step} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled">
        {body}
      </ScrollView>
    </Stage>
  );
}

// one question: kicker, the question in the display face, a short explanation, then the answers
function Q({ kicker, title, lead, children }: { kicker: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <SmallStar size={10} color={stage.gold} />
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.4, textTransform: "uppercase", color: stage.gold }}>{kicker}</Text>
      </View>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 35, letterSpacing: -0.7, color: "#eef0f3", marginTop: 12 }}>{title}</Text>
      {lead ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: "rgba(255,255,255,0.7)", marginTop: 12 }}>{lead}</Text> : null}
      <View style={{ gap: 12, marginTop: 28 }}>{children}</View>
    </View>
  );
}

// an answer: a calm card on the stage that turns gold when pressed
function Choice({ title, sub, icon, onPress, quiet, busy, compact }: { title: string; sub?: string; icon?: "map" | "mosque" | "close"; onPress: () => void; quiet?: boolean; busy?: boolean; compact?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={busy} accessibilityRole="button" accessibilityLabel={sub ? `${title}, ${sub}` : title}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 14, borderWidth: 1, paddingHorizontal: 18, paddingVertical: compact ? 14 : 18,
        borderColor: pressed ? stage.gold : quiet ? "rgba(255,255,255,0.14)" : "rgba(214,180,108,0.35)", backgroundColor: pressed ? "rgba(214,180,108,0.14)" : quiet ? "transparent" : "rgba(255,255,255,0.045)",
        transform: [{ scale: pressed ? 0.99 : 1 }] })}>
      {icon ? (
        <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "rgba(214,180,108,0.4)", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} color={stage.gold} size={19} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: compact ? 16 : 17, lineHeight: 22, color: quiet ? "rgba(255,255,255,0.85)" : "#ffffff" }}>{title}</Text>
        {sub ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>{sub}</Text> : null}
      </View>
      {busy ? <ActivityIndicator color={stage.gold} /> : <Icon name="chevronRight" color={stage.gold} size={18} />}
    </Pressable>
  );
}

// a passage from a website chapter, with its source
function Quote({ p }: { p: Passage }) {
  const tx = useTx();
  return (
    <View style={{ borderStartWidth: 2, borderStartColor: "rgba(214,180,108,0.6)", paddingStart: 14, paddingVertical: 2, marginBottom: 8 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 23, color: "rgba(255,255,255,0.82)" }}>{p.text}</Text>
      <Text onPress={() => go(p.href)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 12.5, lineHeight: 18, color: stage.gold, marginTop: 8 }}>{tx("fromChapter", { chapter: p.chapter })} →</Text>
    </View>
  );
}

function Pill({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={label}>
      {on ? (
        <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ minHeight: 42, borderRadius: R.pill, paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="check" color={goldButton.text} size={14} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: goldButton.text }}>{label}</Text>
        </LinearGradient>
      ) : (
        <View style={{ minHeight: 42, borderRadius: R.pill, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.04)", justifyContent: "center" }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.8, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: 12 }}>{children}</Text>;
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <View style={{ paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: "rgba(255,255,255,0.08)", gap: 3 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: stage.gold }}>{k}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, lineHeight: 22, color: "#eef0f3" }}>{v}</Text>
    </View>
  );
}
