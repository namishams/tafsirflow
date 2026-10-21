import { DoneShare } from "@/features/share/SharePrompt";
import { TravelPrayerCard } from "@/features/talents/TravelCard";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ScrollViewInstance } from "react-native";
import Svg, { Circle, Defs, G, Line, LinearGradient as SvgLinear, Path, RadialGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { CITIES, DEFAULT_SETTINGS, METHODS, PRAYERS, cityName, countdown, dayFor, fmtClock, fmtTime, hijriDate, monthOf, nightOf, qiblaOf, spotToday, type Prayer, type PrayerSettings, type Spot } from "@/web/prayer";
import { adhanUrl, pickAdhan, type AdhanFile } from "@/web/adhan";
import { api, SITE } from "@/lib/api";
import { useStored, writeJSON } from "@/lib/store";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { CALLIG_FONT, FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Arcade, GoldCard, SmallStar, Stage, TextLink } from "@/components/brand";
import { Icon } from "@/components/icons";
import { DarkChip, HeroBack, LightChip, PageScroll, PracticeWindow, go, starPath, useGold } from "../art";
import { CardTitle, CheckRow, SelectField, Stepper, SwitchRow } from "../ui";
import { useSimpleAudio } from "../audio";
import { useTx } from "../text";
import { AR_NAME } from "../web/prayerBoard";
import { usePrayerPlace } from "./place";
import { ALERTS_KEY, SETUP_KEY, adhanForTradition, alertPrayers, alertsAvailable, andWord, ensurePermission, prayerName, remindsOf, reschedulePrayerAlerts, type AlertPrayer, type Alerts, type PrayerSetup } from "./alerts";
import { PrayerSetupCard } from "./setup/PrayerSetupCard";
import { Degrees, QiblaDial, turnBy, useHeading } from "./Compass";

type T = (key: string, params?: Record<string, string | number>) => string;

// Prayer times (website PrayerBoard): live countdown in the mihrab arch, the sun's path across the day, the six
// times, Qibla with a live compass, night and sunnah times, reminders on the phone and the adhan, a monthly
// timetable, the calculation settings and the cities of the Muslim world.
export default function PrayerBoard() {
  const t = useWebT("prayer");
  const tx = useTx();
  const th = useTheme();
  const { lang } = useLang();
  const locale = lang;
  const scroll = useRef<ScrollViewInstance>(null);
  const { spots, main, st, label, pick, saveSt, locate, geoMsg, setGeoMsg } = usePrayerPlace();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  // adhan recordings of the website (/api/adhan) and the chosen voice
  const [files, setFiles] = useState<AdhanFile[]>([]);
  const voice = useStored<string>("tf:adhanVoice", "random");
  const autoAdhan = useStored<boolean>("tf:prayerAutoAdhan", false);
  const [playing, setPlaying] = useState<AdhanFile | null>(null);
  const audio = useSimpleAudio();
  useEffect(() => {
    api<{ files?: AdhanFile[] }>("/api/adhan").then((d) => {
      const f = d.files ?? []; setFiles(f);
      // no voice chosen yet: the recording that fits the tradition from the setup (e.g. "tehran" for Shia)
      setPlaying((voice === "random" ? adhanForTradition(setup.tradition, f) : null) ?? pickAdhan(voice, f));
    }).catch(() => undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const urlOf = (f: AdhanFile) => `${SITE}${adhanUrl(f.id)}`;

  // compass
  const compass = useHeading();

  // reminders: chosen prayers (local only), planned again whenever place, settings or the choice change
  const alerts = useStored<Alerts>(ALERTS_KEY, {});
  const setup = useStored<PrayerSetup>(SETUP_KEY, {});
  const combine = !!setup.combine;
  const saveSetup = (p: Partial<PrayerSetup>) => writeJSON(SETUP_KEY, { ...setup, ...p }, true);
  const [alertMsg, setAlertMsg] = useState<"" | "denied" | "unavailable">("");
  const [canAlert, setCanAlert] = useState(true);
  useEffect(() => { alertsAvailable().then(setCanAlert).catch(() => setCanAlert(false)); }, []);
  const planKey = `${main.id}|${main.lat},${main.lon}|${JSON.stringify(st)}|${JSON.stringify(alerts)}|${combine}|${setup.minutesBefore ?? 0}|${lang}`;
  useEffect(() => {
    const id = setTimeout(() => { void reschedulePrayerAlerts(lang); }, 500);
    return () => clearTimeout(id);
  }, [planKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggleAlert = async (p: AlertPrayer, on: boolean) => {
    if (on) {
      const r = await ensurePermission();
      if (r !== "granted") { setAlertMsg(r); return; }
    }
    setAlertMsg("");
    writeJSON(ALERTS_KEY, { ...alerts, [p]: on }, true);
  };

  // adhan at prayer time while this screen is open (as on the website)
  const fired = useRef(new Set<string>());
  useEffect(() => {
    if (!autoAdhan) return;
    const day = dayFor(main, now, st);
    for (const p of PRAYERS) {
      if (p === "sunrise") continue;
      const at = day.times[p].getTime(), key = `${main.id}-${p}-${day.times[p].toDateString()}`;
      if (now.getTime() >= at && now.getTime() - at < 60_000 && !fired.current.has(key)) {
        fired.current.add(key);
        const f = (voice === "random" ? adhanForTradition(setup.tradition, files) : null) ?? pickAdhan(voice, files);
        if (f) { setPlaying(f); audio.play(urlOf(f)); }
      }
    }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

  const day = dayFor(main, now, st);
  const hijri = hijriDate(now, locale, main.tz);
  const ar = locale === "ar"; // Arabic readers see the Arabic names once (website: no Latin repetition)
  let hijriAr = "";
  try { hijriAr = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-arab", { timeZone: main.tz, day: "numeric", month: "long", year: "numeric" }).format(now); } catch { /* calendar not supported */ }
  const greg = new Intl.DateTimeFormat(locale, { timeZone: main.tz, calendar: "gregory", numberingSystem: "latn", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
  const night = nightOf(main, now, st);
  const qibla = qiblaOf(main);
  const current = [...PRAYERS].reverse().find((p) => p !== "sunrise" && day.times[p].getTime() <= now.getTime()) ?? "isha";
  const methodOf = st.method === "auto" ? main.method : st.method;
  const past = PRAYERS.map((p) => day.times[p].getTime()).filter((x) => x <= now.getTime());
  const prevAt = past.length ? Math.max(...past) : day.times.isha.getTime() - 86400000;
  const frac = Math.min(1, Math.max(0, (now.getTime() - prevAt) / Math.max(1, day.nextAt.getTime() - prevAt)));
  const minute = Math.floor(now.getTime() / 60000);
  const pickCity = useCallback((id: string) => { setGeoMsg(""); pick(id); scroll.current?.scrollTo({ y: 0, animated: true }); }, [pick, setGeoMsg]);
  const { width } = useWindowDimensions();
  const archW = Math.min(340, width - 32);

  return (
    <PageScroll scrollRef={scroll}>
      {/* Hero: place, the next prayer in an arch with its countdown ring, the sun's path across the day */}
      <Stage hairlines={false}>
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id="pb-glow" cx="22%" cy="30%" rx="42%" ry="30%"><Stop offset="0" stopColor="rgb(214,180,108)" stopOpacity={0.13} /><Stop offset="1" stopColor="rgb(214,180,108)" stopOpacity={0} /></RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#pb-glow)" />
        </Svg>
        <HeroInset>
          <HeroBack />
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 12 }}>
            <SelectField dark title={t("city")} value={main.id} options={spots.map((s) => ({ value: s.id, label: label(s) }))} onChange={(id) => { setGeoMsg(""); pick(id); }} style={{ flexShrink: 1, maxWidth: "100%" }} />
            <DarkChip label={t("useLocation")} onPress={() => void locate()} />
          </View>
          {hijriAr ? <Text style={{ fontFamily: CALLIG_FONT, fontSize: 22, lineHeight: 34, color: stage.gold, marginTop: 12, writingDirection: "rtl", alignSelf: "flex-start" }}>{hijriAr}</Text> : null}
          {geoMsg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>{geoMsg}</Text> : null}

          <View style={{ alignSelf: "flex-end", marginTop: 8 }}>
            <DoneShare kind="prayerTimes" banner={false} onStage title={label(main)} arabic={hijriAr || undefined} footer={greg}
              body={PRAYERS.map((p) => `${t(p)}  ${fmtTime(day.times[p], main.tz, locale)}`).join("\n")} />
          </View>
          <View style={{ marginTop: 24, alignItems: "center" }}>
            <NextArch width={archW} prayer={day.next} at={fmtTime(day.nextAt, main.tz, locale)} left={countdown(day.nextAt, now)} frac={frac} label={t("nextPrayer")} name={t(day.next)} ar={ar} />
          </View>
          <View style={{ marginTop: 32 }}>
            <Text style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 28, letterSpacing: -0.5, color: "#eef0f3" }}>{greg}</Text>
            {hijri && !ar ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{hijri}</Text> : null}
            <View style={{ marginTop: 16, alignSelf: "flex-start", flexDirection: "row", alignItems: "baseline", gap: 12, borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 16, paddingVertical: 8 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{t("localTime")}</Text>
              <Text style={{ fontFamily: FONT.display, fontSize: 20, color: "#ffffff", fontVariant: ["tabular-nums"] }}>{fmtClock(now, main.tz)}</Text>
            </View>
            <View style={{ marginTop: 24 }}><DayArc times={day.times} now={now} tz={main.tz} locale={locale} t={t} /></View>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 32 }} accessibilityRole="list">
            {PRAYERS.map((p) => {
              const isNext = p === day.next, isNow = p === current && !isNext;
              const inner = (
                <>
                  {!ar ? <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 17, lineHeight: 24, color: isNext ? "rgba(8,38,29,0.7)" : "rgba(214,180,108,0.8)", writingDirection: "rtl" }}>{AR_NAME[p]}</Text> : null}
                  <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 12, color: isNext ? goldButton.text : "rgba(255,255,255,0.65)", marginTop: 4 }}>{t(p)}{isNow ? ` · ${t("now")}` : ""}</Text>
                  <Text style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 27, color: isNext ? goldButton.text : "#eef0f3", fontVariant: ["tabular-nums"], marginTop: 2 }}>{fmtTime(day.times[p], main.tz, locale)}</Text>
                </>
              );
              const box = { width: "31.5%" as const, flexGrow: 1, borderTopLeftRadius: 50, borderTopRightRadius: 50, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: "hidden" as const };
              return isNext ? (
                <LinearGradient key={p} colors={["#ecd7a2", "#c6a65e"]} style={[box, { alignItems: "center", paddingHorizontal: 8, paddingTop: 20, paddingBottom: 12 }]}
                  accessible accessibilityLabel={`${t("nextPrayer")}: ${t(p)} ${fmtTime(day.times[p], main.tz, locale)}`}>{inner}</LinearGradient>
              ) : (
                <View key={p} style={[box, { alignItems: "center", paddingHorizontal: 8, paddingTop: 20, paddingBottom: 12, borderWidth: 1, borderColor: isNow ? "rgba(214,180,108,0.6)" : "rgba(255,255,255,0.1)", backgroundColor: isNow ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.035)" }]}
                  accessible accessibilityLabel={`${t(p)} ${fmtTime(day.times[p], main.tz, locale)}${isNow ? `, ${t("now")}` : ""}`}>{inner}</View>
              );
            })}
          </View>
        </HeroInset>
        <Arcade />
      </Stage>

      <View style={{ paddingHorizontal: 16, paddingTop: 40, gap: 20 }}>
        <PrayerSetupCard />
        {/* travel mode (owner, 21.10.2026): the note on praying while travelling, travel duas, Umrah and Hajj */}
        <TravelPrayerCard hanafi={st.madhab === "hanafi" || (st.madhab === "auto" && !!main.hanafi)} />
        {/* Qibla */}
        <GoldCard>
          <CardTitle>{t("qibla")}</CardTitle>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20, marginTop: 16 }}>
            <QiblaDial qibla={qibla} heading={compass.heading?.deg ?? null} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Degrees value={qibla} />
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 19, color: th.muted, marginTop: 4 }}>{t("qiblaHint")}</Text>
            </View>
          </View>
          <CompassStatus compass={compass} qibla={qibla} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 20, marginTop: 4 }}>
            {compass.state === "on" ? <TextLink title={tx("compassOff")} onPress={compass.stop} style={{ fontSize: 14 }} />
              : <TextLink title={t("compass")} onPress={() => void compass.start()} style={{ fontSize: 14 }} />}
            <TextLink title={tx("openQibla")} onPress={() => { compass.stop(); go("/qibla"); }} style={{ fontSize: 14 }} />
          </View>
        </GoldCard>

        {/* Night and sunnah times */}
        <GoldCard>
          <CardTitle icon={<Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M15.5 3.5a8.5 8.5 0 1 0 5 15 7 7 0 1 1-5-15z" fill={th.gold} fillOpacity={0.25} stroke={th.gold} strokeWidth={1.4} /></Svg>}>{t("sunnahTitle")}</CardTitle>
          <View style={{ marginTop: 16, gap: 12 }}>
            {[[t("duha"), `${fmtTime(night.duha, main.tz, locale)} – ${fmtTime(new Date(day.times.dhuhr.getTime() - 10 * 60000), main.tz, locale)}`], [t("midnight"), fmtTime(night.midnight, main.tz, locale)], [t("lastThird"), fmtTime(night.lastThird, main.tz, locale)]].map(([k, v]) => (
              <View key={k} style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }} accessible accessibilityLabel={`${k}: ${v}`}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: th.muted }}>{k}</Text>
                <DottedLeader />
                <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: th.ink, fontVariant: ["tabular-nums"] }}>{v}</Text>
              </View>
            ))}
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 19, color: th.muted, marginTop: 16 }}>{t("sunnahNote")}</Text>
        </GoldCard>

        {/* Reminders and adhan */}
        <GoldCard>
          <CardTitle>{t("remindTitle")}</CardTitle>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: th.ink, marginTop: 16 }}>{tx("alertsTitle")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: th.muted, marginTop: 4 }}>{canAlert ? tx("alertsLead") : tx("alertsUnavailable")}</Text>
          {canAlert ? (
            <View style={{ marginTop: 8 }}>
              {alertPrayers(combine).map((p) => {
                const group = remindsOf(p, combine);
                const label = group.length > 1 ? group.map((x) => prayerName(x, lang)).join(` ${andWord(lang)} `) : t(p);
                return <SwitchRow key={p} label={label} sub={group.map((x) => fmtTime(day.times[x], main.tz, locale)).join(" · ")} value={!!alerts[p]} onChange={(v) => void toggleAlert(p, v)} />;
              })}
              {setup.tradition === "shia" ? <SwitchRow label={tx("combineSwitch")} value={combine} onChange={(v) => saveSetup({ combine: v })} /> : null}
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: th.muted, marginTop: 10, marginBottom: 8 }}>{tx("reminderWhen")}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {([0, 5, 10, 15] as const).map((m) => <LightChip key={m} label={m === 0 ? tx("atTime") : tx("minutesBefore", { n: m })} on={(setup.minutesBefore ?? 0) === m} onPress={() => saveSetup({ minutesBefore: m })} />)}
              </View>
            </View>
          ) : null}
          {alertMsg === "denied" ? (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: th.muted }}>{tx("alertsDenied")}</Text>
              <TextLink title={tx("openSettings")} onPress={() => void Linking.openSettings()} style={{ fontSize: 14 }} />
            </View>
          ) : alertMsg === "unavailable" ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: th.muted, marginTop: 8 }}>{tx("alertsUnavailable")}</Text> : null}
          {canAlert && alertPrayers(combine).some((p) => alerts[p]) ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: th.muted, marginTop: 6 }}>{tx("alertsFor", { place: label(main) })}</Text> : null}

          <TextLink title={tx("setupAgain")} onPress={() => go("/prayer-setup")} style={{ fontSize: 14 }} />
          <View style={{ height: 1, backgroundColor: th.line, marginVertical: 16 }} />
          <CheckRow label={t("autoAdhan")} value={autoAdhan} onChange={(v) => writeJSON("tf:prayerAutoAdhan", v, true)} />
          <SelectField style={{ marginTop: 16 }} label={t("adhanVoice")} value={files.some((f) => f.id === voice) ? voice : "random"}
            options={[{ value: "random", label: t("random") }, ...files.map((f) => ({ value: f.id, label: f.label }))]}
            onChange={(v) => { writeJSON("tf:adhanVoice", v, true); setPlaying(pickAdhan(v, files)); audio.stop(); }} />
          {playing ? (
            <View style={{ marginTop: 12, gap: 6 }}>
              <Pressable onPress={() => audio.toggle(urlOf(playing))} accessibilityRole="button" accessibilityLabel={t("playAdhan")}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? goldButton.line : th.line, backgroundColor: th.bg, padding: 6, paddingEnd: 16 })}>
                <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
                  <Icon name={audio.playing && audio.url === urlOf(playing) ? "pause" : "play"} color={goldButton.text} size={18} />
                </LinearGradient>
                <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14.5, color: th.ink }}>{t("playAdhan")}</Text>
              </Pressable>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: th.muted }}>
                {playing.label}{playing.credit ? ` · ${playing.credit}` : ""}
                {voice === "random" && files.length > 1 ? <>{" · "}<Text onPress={() => { audio.stop(); setPlaying(pickAdhan("random", files.filter((f) => f.id !== playing.id))); }} accessibilityRole="button" style={{ fontFamily: FONT.semibold, color: th.accent }}>{t("another")}</Text></> : null}
              </Text>
            </View>
          ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: th.muted, marginTop: 12 }}>{t("adhanNone")}</Text>}
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: th.muted, marginTop: 12 }}>{tx("autoAdhanNote")}</Text>
        </GoldCard>

        {/* Monthly timetable */}
        <MonthTable main={main} st={st} locale={locale} t={t} title={t("monthTitle", { place: label(main) })} todayKey={`${spotToday(now, main.tz).y}-${spotToday(now, main.tz).m}-${spotToday(now, main.tz).d}`} />

        {/* Settings */}
        <GoldCard style={{ marginTop: 28 }}>
          <CardTitle>{t("settings")}</CardTitle>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: th.muted, marginTop: 4 }}>{t("settingsLead", { method: t(`m_${methodOf}`) })}</Text>
          <View style={{ gap: 14, marginTop: 16 }}>
            <SelectField label={t("method")} value={st.method} onChange={(v) => saveSt({ ...st, method: v as PrayerSettings["method"] })}
              options={[{ value: "auto", label: `${t("auto")} (${t(`m_${main.method}`)})` }, ...METHODS.map((m) => ({ value: m, label: t(`m_${m}`) }))]} />
            <SelectField label={t("asr")} value={st.madhab} onChange={(v) => saveSt({ ...st, madhab: v as PrayerSettings["madhab"] })}
              options={[{ value: "auto", label: t("auto") }, { value: "shafi", label: t("shafi") }, { value: "hanafi", label: t("hanafi") }]} />
            <SelectField label={t("highLat")} value={st.highLat} onChange={(v) => saveSt({ ...st, highLat: v as PrayerSettings["highLat"] })}
              options={[{ value: "auto", label: t("auto") }, { value: "middle", label: t("hlMiddle") }, { value: "seventh", label: t("hlSeventh") }, { value: "twilight", label: t("hlTwilight") }]} />
          </View>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.ink, marginTop: 20 }}>{t("adjust")}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {PRAYERS.map((p) => (
              <View key={p} style={{ width: "31.5%", flexGrow: 1 }}>
                <Stepper label={t(p)} value={Number(st.adjust[p] ?? 0)} min={-30} max={30} unit={tx("minutes")} onChange={(v) => saveSt({ ...st, adjust: { ...st.adjust, [p]: v } })} />
              </View>
            ))}
          </View>
          <Text onPress={() => saveSt(DEFAULT_SETTINGS)} accessibilityRole="button" style={{ fontFamily: FONT.regular, fontSize: 14, color: th.muted, textDecorationLine: "underline", marginTop: 16, alignSelf: "flex-start", paddingVertical: 4 }}>{t("reset")}</Text>
        </GoldCard>

        {/* World cities */}
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: th.ink, marginTop: 28 }}>{t("citiesTitle")}</Text>
        <Cities minute={minute} mainId={main.id} st={st} locale={locale} t={t} onPick={pickCity} />
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: th.muted, marginTop: 4 }}>{t("notice")}</Text>
      </View>
    </PageScroll>
  );
}

function HeroInset({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 40 }}>{children}</View>;
}

function DottedLeader() {
  const g = useGold();
  return (
    <View style={{ flex: 1, minWidth: 16, height: 6, marginBottom: 4 }}>
      <Svg width="100%" height={6}><Line x1="0" y1="5" x2="100%" y2="5" stroke={`rgba(${g},0.4)`} strokeWidth={1} strokeDasharray="1,3" /></Svg>
    </View>
  );
}

function CompassStatus({ compass, qibla }: { compass: ReturnType<typeof useHeading>; qibla: number }) {
  const t = useWebT("prayer");
  const tx = useTx();
  const th = useTheme();
  const small = { fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: th.muted, marginTop: 8 };
  if (compass.state === "denied") return <Text style={small}>{tx("compassPermission")}</Text>;
  if (compass.state === "unavailable") return <Text style={small}>{tx("noCompass")}</Text>;
  if (compass.state !== "on" || !compass.heading) return null;
  const d = turnBy(qibla, compass.heading.deg);
  return (
    <View style={{ marginTop: 12, gap: 2 }} accessibilityLiveRegion="polite">
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.ink }}>{t("compassOn")}</Text>
      <Text style={[small, { marginTop: 0, color: Math.abs(d) <= 5 ? th.gold : th.muted, fontFamily: Math.abs(d) <= 5 ? FONT.bold : FONT.regular }]}>
        {Math.abs(d) <= 5 ? tx("facing") : `${d > 0 ? tx("turnRight") : tx("turnLeft")} · ${Math.abs(Math.round(d))}°`}
      </Text>
      <Text style={small}>{tx("compassHint")}</Text>
      {compass.heading.accuracy <= 1 ? <Text style={small}>{tx("calibrate")}</Text> : null}
      {compass.heading.magnetic ? <Text style={small}>{tx("magnetic")}</Text> : null}
    </View>
  );
}

// The next prayer stands in a mihrab arch; a gold ring around it fills from the last prayer time to the next one
function NextArch({ width, prayer, at, left, frac, label, name, ar }: { width: number; prayer: Prayer; at: string; left: string; frac: number; label: string; name: string; ar: boolean }) {
  const r = 78, C = 2 * Math.PI * r, a = frac * Math.PI * 2 - Math.PI / 2;
  const tip = { x: 120 + r * Math.cos(a), y: 196 + r * Math.sin(a) };
  const H = (width * 4) / 3, cy = H * 0.6125;
  return (
    <View style={{ width, height: H }} accessible accessibilityLabel={`${label}: ${name}, ${left}, ${at}`}>
      <PracticeWindow uid="pb-next" lamp width={width} height={H} style={{ position: "absolute" }} />
      <Svg width={width} height={H} viewBox="0 0 240 320" style={{ position: "absolute" }}>
        <Defs><SvgLinear id="pb-ring" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f6e7bf" /><Stop offset="0.5" stopColor="#c9a65e" /><Stop offset="1" stopColor="#efe2bf" /></SvgLinear></Defs>
        <Circle cx={120} cy={196} r={88} fill="rgba(5,28,21,0.55)" />
        <Circle cx={120} cy={196} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={3} />
        {Array.from({ length: 24 }, (_, i) => { const b = (Math.PI / 12) * i; return <Path key={i} d={`M${(120 + 84 * Math.cos(b)).toFixed(1)} ${(196 + 84 * Math.sin(b)).toFixed(1)}L${(120 + (i % 2 ? 86 : 88) * Math.cos(b)).toFixed(1)} ${(196 + (i % 2 ? 86 : 88) * Math.sin(b)).toFixed(1)}`} stroke="#d6b46c" strokeOpacity={0.5} strokeWidth={0.8} />; })}
        <Circle cx={120} cy={196} r={r} fill="none" stroke="url(#pb-ring)" strokeWidth={3.5} strokeLinecap="round" strokeDasharray={`${(frac * C).toFixed(1)} ${C.toFixed(1)}`} rotation={-90} origin="120, 196" />
        <Circle cx={tip.x} cy={tip.y} r={5} fill="#f3e2b6" />
        <Circle cx={tip.x} cy={tip.y} r={3.4} fill="#fff8e6" />
      </Svg>
      <View style={{ position: "absolute", left: width * 0.2, width: width * 0.6, top: cy - width * 0.25, height: width * 0.5, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: ar ? 0 : 2, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{label}</Text>
        {!ar ? <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 22, lineHeight: 32, color: stage.gold, marginTop: 2 }}>{AR_NAME[prayer]}</Text> : null}
        <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontFamily: FONT.display, fontSize: name.length > 9 ? 22 : 34, lineHeight: name.length > 9 ? 26 : 38, letterSpacing: -0.8, color: "#eef0f3", marginTop: 2 }}>{name}</Text>
        <Text style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 26, color: "#f3e2b6", fontVariant: ["tabular-nums"], marginTop: 8 }}>{left}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgba(255,255,255,0.6)", fontVariant: ["tabular-nums"], marginTop: 6 }}>{at}</Text>
      </View>
    </View>
  );
}

// Arc of the day: the sun's path from sunrise to sunset (Dhuhr and Asr on it), Fajr and Isha below the horizon.
// The part of the path already travelled is gilded; the sun (or the crescent at night) marks "now".
function DayArc({ times, now, tz, locale, t }: { times: Record<Prayer, Date>; now: Date; tz: string; locale: string; t: T }) {
  const W = 560, base = 150, L = 90, Rr = W - 90, rx = (Rr - L) / 2, ry = 110;
  const rise = times.sunrise.getTime(), set = times.maghrib.getTime();
  const onArc = (ms: number) => { const f = Math.min(1, Math.max(0, (ms - rise) / (set - rise))); const a = Math.PI * (1 - f); return { x: L + rx + Math.cos(a) * rx, y: base - Math.sin(a) * ry }; };
  const pts: Record<Prayer, { x: number; y: number; below?: boolean }> = {
    fajr: { x: 28, y: base + 18, below: true }, sunrise: { x: L, y: base }, dhuhr: onArc(times.dhuhr.getTime()), asr: onArc(times.asr.getTime()), maghrib: { x: Rr, y: base }, isha: { x: W - 28, y: base + 18, below: true },
  };
  const n = now.getTime();
  const isDay = n >= rise && n <= set;
  const nowP = n < rise ? { x: 28 + ((L - 28) * Math.max(0, n - (rise - 3 * 3600000))) / (3 * 3600000), y: base + 18 } : n > set ? { x: Rr + ((W - 28 - Rr) * Math.min(1, (n - set) / (3 * 3600000))), y: base + 18 } : onArc(n);
  const travelled = n <= rise ? "" : `M${L} ${base} A ${rx} ${ry} 0 0 1 ${(n >= set ? Rr : nowP.x).toFixed(1)} ${(n >= set ? base : nowP.y).toFixed(1)}`;
  return (
    <View style={{ width: "100%", aspectRatio: W / (base + 60) }} accessible accessibilityRole="image" accessibilityLabel={t("arc")}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${base + 60}`}>
        <Defs>
          <SvgLinear id="pb-horizon" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#d6b46c" stopOpacity={0} /><Stop offset="0.5" stopColor="#d6b46c" stopOpacity={0.8} /><Stop offset="1" stopColor="#d6b46c" stopOpacity={0} /></SvgLinear>
          <RadialGradient id="pb-sky" cx="50%" cy="100%" r="70%"><Stop offset="0" stopColor="#e9cf99" stopOpacity={0.16} /><Stop offset="1" stopColor="#e9cf99" stopOpacity={0} /></RadialGradient>
          <SvgLinear id="pb-night" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#0d2f25" stopOpacity={0.45} /><Stop offset="1" stopColor="#0d2f25" stopOpacity={0} /></SvgLinear>
        </Defs>
        <Path d={`M${L} ${base} A ${rx} ${ry} 0 0 1 ${Rr} ${base} Z`} fill="url(#pb-sky)" />
        <Rect x={8} y={base} width={W - 16} height={56} fill="url(#pb-night)" />
        <Path d={`M${L} ${base} A ${rx} ${ry} 0 0 1 ${Rr} ${base}`} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} strokeDasharray="3 6" />
        {travelled ? <Path d={travelled} fill="none" stroke="#d6b46c" strokeWidth={2.4} strokeLinecap="round" /> : null}
        <Line x1={8} y1={base} x2={W - 8} y2={base} stroke="url(#pb-horizon)" strokeWidth={1} />
        {PRAYERS.map((p) => {
          const q = pts[p], above = !q.below;
          return (
            <G key={p}>
              <Path d={starPath(q.x, q.y, 6.5, 2.8)} fill="#d6b46c" />
              <SvgText x={q.x} y={above ? q.y - 24 : q.y + 24} textAnchor="middle" fontSize={12.5} fontFamily={FONT.semibold} fill="rgba(255,255,255,0.82)">{t(p).replace(/­/g, "")}</SvgText>
              <SvgText x={q.x} y={above ? q.y - 10 : q.y + 38} textAnchor="middle" fontSize={11.5} fontFamily={FONT.regular} fill="rgba(255,255,255,0.5)">{fmtTime(times[p], tz, locale)}</SvgText>
            </G>
          );
        })}
        {isDay ? (
          <G>
            <Circle cx={nowP.x} cy={nowP.y} r={24} fill="#ffe7a8" fillOpacity={0.35} />
            <Path d={starPath(nowP.x, nowP.y, 14, 9, 12)} fill="#f3d58e" />
            <Circle cx={nowP.x} cy={nowP.y} r={8} fill="#fff4d6" />
          </G>
        ) : (
          <G>
            <Circle cx={nowP.x} cy={nowP.y} r={18} fill="#e3eaff" fillOpacity={0.18} />
            <Path d={`M${nowP.x + 4} ${nowP.y - 11}a11 11 0 1 0 0 22 8.5 8.5 0 1 1 0-22z`} fill="#f3e2b6" />
          </G>
        )}
      </Svg>
    </View>
  );
}

// Monthly timetable (scrolls sideways like the website's table on a phone)
const MonthTable = memo(function MonthTable({ main, st, locale, t, title, todayKey }: { main: Spot; st: PrayerSettings; locale: string; t: T; title: string; todayKey: string }) {
  const th = useTheme();
  const [shift, setShift] = useState(0);
  const [y, m, d] = todayKey.split("-").map(Number);
  const mDate = new Date(y, m + shift, 1);
  const rows = useMemo(() => monthOf(main, mDate.getFullYear(), mDate.getMonth(), st), [main, st, mDate.getFullYear(), mDate.getMonth()]); // eslint-disable-line react-hooks/exhaustive-deps
  const colW = 64, dateW = 150;
  const round = (dir: -1 | 1) => (
    <Pressable onPress={() => setShift(shift + dir)} accessibilityRole="button" accessibilityLabel={t(dir < 0 ? "prevMonth" : "nextMonth")}
      style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: pressed ? "rgb(201,166,94)" : th.line, alignItems: "center", justifyContent: "center" })}>
      <Icon name={dir < 0 ? "chevronLeft" : "chevronRight"} color={th.ink} size={18} />
    </Pressable>
  );
  return (
    <View style={{ marginTop: 28 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: th.ink }}>{title}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
        {round(-1)}
        <Text style={{ minWidth: 144, textAlign: "center", fontFamily: FONT.bold, fontSize: 14, color: th.ink }}>{mDate.toLocaleDateString(locale, { calendar: "gregory", month: "long", year: "numeric" })}</Text>
        {round(1)}
      </View>
      <GoldCard star={false} padded={false} style={{ marginTop: 20, overflow: "hidden" }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "rgba(201,166,94,0.3)" }}>
              <Text style={[cell.head, { width: dateW, color: th.muted }]}>{t("date")}</Text>
              {PRAYERS.map((p) => <Text key={p} numberOfLines={1} style={[cell.head, { width: colW + 14, color: th.muted }]}>{t(p).replace(/­/g, "")}</Text>)}
            </View>
            {rows.map((r, i) => {
              const isToday = shift === 0 && r.date.getDate() === d;
              const fri = r.date.getDay() === 5;
              return (
                <View key={r.date.getDate()} style={{ flexDirection: "row", alignItems: "center", backgroundColor: isToday ? "rgba(201,166,94,0.15)" : fri ? "rgba(201,166,94,0.05)" : "transparent", borderTopWidth: i ? 1 : 0, borderTopColor: th.line }}>
                  <View style={{ width: dateW, padding: 12, flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {isToday ? <SmallStar size={12} color={th.gold} /> : null}
                    <Text style={{ fontFamily: isToday ? FONT.bold : FONT.regular, fontSize: 14, color: th.ink }}>{r.date.toLocaleDateString(locale, { calendar: "gregory", weekday: "short", day: "numeric" })}</Text>
                    <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.regular, fontSize: 12, color: th.muted }}>{hijriDate(new Date(r.date.getTime() + 12 * 3600000), locale, main.tz).replace(/\s*\d{4}.*$/, "")}</Text>
                  </View>
                  {PRAYERS.map((p) => <Text key={p} style={{ width: colW + 14, padding: 12, fontFamily: isToday ? FONT.bold : FONT.regular, fontSize: 14, color: th.ink, fontVariant: ["tabular-nums"] }}>{fmtTime(r.times[p], main.tz, locale)}</Text>)}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </GoldCard>
    </View>
  );
});
const cell = StyleSheet.create({ head: { padding: 12, fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 0.7, textTransform: "uppercase" } });

// The cities of the Muslim world, each with its local time and next prayer (recomputed once a minute)
const Cities = memo(function Cities({ minute, mainId, st, locale, t, onPick }: { minute: number; mainId: string; st: PrayerSettings; locale: string; t: T; onPick: (id: string) => void }) {
  const th = useTheme();
  const g = useGold();
  const now = new Date(minute * 60000 + 1000);
  return (
    <View style={{ gap: 12, marginTop: 8 }}>
      {CITIES.map((c) => {
        const d = dayFor(c, now, { ...st, method: "auto", madhab: "auto" });
        const on = mainId === c.id;
        return (
          <Pressable key={c.id} onPress={() => onPick(c.id)} accessibilityRole="button" accessibilityState={{ selected: on }}
            accessibilityLabel={`${cityName(c, locale)}, ${fmtClock(now, c.tz).slice(0, 5)}. ${t(d.next)} ${fmtTime(d.nextAt, c.tz, locale)}`}
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: R.card, borderWidth: 1, backgroundColor: th.surface,
              borderColor: on ? "rgb(201,166,94)" : pressed ? `rgba(${g},0.55)` : `rgba(${g},0.26)` })}>
            {on ? <View pointerEvents="none" style={{ position: "absolute", left: -3, top: -3, right: -3, bottom: -3, borderRadius: R.card + 3, borderWidth: 3, borderColor: "rgba(201,166,94,0.14)" }} /> : null}
            <View pointerEvents="none" style={{ position: "absolute", top: 5, left: 5, right: 5, bottom: 5, borderRadius: 9, borderWidth: 1, borderColor: `rgba(${g},0.14)` }} />
            <Svg width={28} height={36} viewBox="0 0 28 36">
              <Path d="M3 35V15C3 8 8 4 14 1.5 20 4 25 8 25 15v20" fill={th.gold} fillOpacity={on ? 0.18 : 0.06} stroke={on ? th.gold : `rgba(${g},0.55)`} strokeWidth={1.3} />
              <Path d="M14 13l1.3 2.8 2.8 1.3-2.8 1.3L14 21.2l-1.3-2.8-2.8-1.3 2.8-1.3z" fill={on ? th.gold : `rgba(${g},0.55)`} />
            </Svg>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 15.5, color: th.ink }}>{cityName(c, locale)}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted, fontVariant: ["tabular-nums"] }}>{fmtClock(now, c.tz).slice(0, 5)}</Text>
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: th.muted, marginTop: 2 }}>{t(d.next)} · <Text style={{ fontVariant: ["tabular-nums"] }}>{fmtTime(d.nextAt, c.tz, locale)}</Text></Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
});

