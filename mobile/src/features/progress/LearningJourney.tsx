import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { writeJSON } from "@/lib/store";
import { readSrs } from "@/web/learning";
import { levelOf, readPoints, totalPoints } from "@/web/points";
import { HOUR_STICKERS, buildCtx, earnedIds, hoursOf, nextHourSticker, readSeen, stickerById, type StickerDef } from "@/web/stickers";
import { fill, journeyText, nextStep, readSnapshot, readVisited, stationViews, type JourneyCatalog, type JourneyText, type NextReason, type StationId, type StationState, type StationView } from "@/web/journey";
import { LESSONS as ARABIC_LESSONS, PASS_PCT } from "@/web/arabic";
import { tajweedFor } from "@/web/tajweed";
import { VOCAB_DECKS } from "@/web/vocab";
import { ISLAM } from "@/web/islam";
import { LinearGradient as ExpoGradient } from "expo-linear-gradient";
import { Icon } from "@/components/icons";
import { Callout, LevelBar, LevelSeal, alpha } from "./art";
import { Sticker } from "./Sticker";
import { useChapterNames, useLive, useNf } from "./hooks";
import { go } from "./links";
import { Pulse, useReduceMotion } from "./motion";
import { ArrowLink, Kicker } from "./ui";
import { courseLang } from "@/features/arabic/lang";

// The learning journey (website: LearningJourney.tsx + lib/journey.ts): every learning area as a station on one path,
// with the learner's real progress and the single best next step. On phones the path runs straight down.

// ---------- catalogue: what the journey needs from the courses ----------
const catalogs: Record<string, JourneyCatalog> = {};
/** the course catalogue in the reader's language (same as the website's map page builds on the server) */
export function journeyCatalog(lang: string): JourneyCatalog {
  return (catalogs[lang] ??= {
    arabic: ARABIC_LESSONS.map((l) => ({ id: l.id, title: l.title[courseLang(lang)] ?? l.title.en })),
    arabicPass: PASS_PCT,
    tajweed: tajweedFor(lang).map((l) => ({ id: l.id, title: lang === "de" ? l.title_de : l.title_en })),
    tajweedPass: 70, // same threshold as the profile ("passed" = at least 70 % in the quiz)
    vocabTotal: new Set(VOCAB_DECKS.flatMap((d) => d.words.map((w) => w.id))).size,
    islamCount: ISLAM.length,
  });
}

// the website keeps "opened from the map" in tf:jv (localStorage); here it lives in the app's store
function markVisited(id: StationId) {
  if (id !== "salah" && id !== "islam") return;
  const v = readVisited();
  if (!v.includes(id)) writeJSON("tf:jv", [...v, id], true);
}

// ---------- medallion: an eight-pointed star (two interlaced squares) inside a progress ring ----------
function starPath(R1: number, r: number, n = 8) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i - Math.PI / 2, rad = i % 2 ? r : R1;
    pts.push(`${(50 + rad * Math.cos(a)).toFixed(2)},${(50 + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}
const STAR = starPath(36, 27.6);
const RING = 2 * Math.PI * 46;

function StationIcon({ id, color }: { id: StationId; color: string }): ReactNode {
  switch (id) {
    case "wudu": return <><Path d="M50 33c6 7.5 10.5 13.2 10.5 18.8a10.5 10.5 0 0 1-21 0C39.5 46.2 44 40.5 50 33z" /><Path d="M45 54.5a5.5 5.5 0 0 0 4.5 5" /></>;
    case "salah": return <><Path d="M39.5 66V50.5c0-7 4.6-12.4 10.5-16.5 5.9 4.1 10.5 9.5 10.5 16.5V66" /><Path d="M35 66h30" /><Path d="M45.5 66v-9.5a4.5 4.5 0 0 1 9 0V66" /></>;
    case "arabic": return <SvgText x={50} y={58} textAnchor="middle" fontSize={21} stroke="none" fill={color} fontFamily={ARABIC_FONT}>أ ب</SvgText>;
    case "fatiha": return <><Path d="M50 40c-5-3.5-11-4-16-2v23c5-2 11-1.5 16 2 5-3.5 11-4 16-2V38c-5-2-11-1.5-16 2z" /><Path d="M50 40v23" /></>;
    case "tajweed": return <Path d="M37 46.5v7M42.2 41v18M47.4 36v28M52.6 42v16M57.8 38v24M63 45.5v9" />;
    case "vocab": return <><Path d="M45 35.5h15.5a2.5 2.5 0 0 1 2.5 2.5v19" /><Path d="M39.5 40h15a2.5 2.5 0 0 1 2.5 2.5v20a2.5 2.5 0 0 1-2.5 2.5h-15a2.5 2.5 0 0 1-2.5-2.5v-20a2.5 2.5 0 0 1 2.5-2.5z" /><Path d="M41.5 48h11M41.5 53.5h7.5" /></>;
    case "memo": return <><Path d="M34 45l16-8 16 8-16 8z" /><Path d="M34 52.5l16 8 16-8" /><Path d="M34 60l16 8 16-8" /></>;
    case "duas": return <>{Array.from({ length: 11 }, (_, i) => { const a = (Math.PI * 2 * i) / 12 - Math.PI / 2 + Math.PI / 12; return <Circle key={i} cx={50 + 11 * Math.cos(a)} cy={46 + 11 * Math.sin(a)} r={1.9} fill={color} stroke="none" />; })}<Path d="M50 57v8M46.5 68.5L50 65l3.5 3.5" /></>;
    case "islam": return <><Path d="M50 30v5" /><Path d="M42.5 35h15" /><Path d="M41.5 39h17l-2.8 19c-1 5-10.4 5-11.4 0z" /><Path d="M50 45c2.8 2.8 2.8 6.6 0 8.6-2.8-2-2.8-5.8 0-8.6z" /><Path d="M43.5 66h13" /></>;
  }
}

export function Medallion({ id, state, pct, size = 64 }: { id: StationId; state: StationState; pct: number | null; size?: number }) {
  const t = useTheme();
  const done = state === "done";
  const open = state === "open" || (state === "progress" && pct === null);
  const icon = done ? "#f3e2b6" : state === "none" ? t.muted : t.gold;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="m" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f6e7bf" /><Stop offset="0.45" stopColor="#c9a65e" /><Stop offset="0.7" stopColor="#efe2bf" /><Stop offset="1" stopColor="#8f7238" /></LinearGradient>
        <RadialGradient id="e" cx="38%" cy="32%" r="80%"><Stop offset="0" stopColor="#1d5640" /><Stop offset="1" stopColor="#0b261b" /></RadialGradient>
      </Defs>
      <Circle cx={50} cy={50} r={46} fill="none" stroke={t.line} strokeWidth={2} />
      {open ? <Circle cx={50} cy={50} r={46} fill="none" stroke={t.gold} strokeOpacity={0.7} strokeWidth={2.6} strokeLinecap="round" strokeDasharray="0.1 7.12" /> : null}
      {!open && (pct ?? 0) > 0 ? <Circle cx={50} cy={50} r={46} fill="none" stroke={t.gold} strokeWidth={3} strokeLinecap="round" strokeDasharray={`${(Math.min(1, pct ?? 0) * RING).toFixed(1)} ${RING.toFixed(1)}`} transform="rotate(-90 50 50)" /> : null}
      <Path d={STAR} fill={done ? "url(#m)" : t.surface} stroke={done ? "#8f7238" : state === "none" ? alpha(t.muted, 0.45) : t.gold} strokeOpacity={done ? 0.5 : 1} strokeWidth={done ? 1 : 1.6} strokeLinejoin="round" />
      {done ? (
        <>
          <Circle cx={50} cy={50} r={21} fill="url(#e)" stroke="#5c4519" strokeOpacity={0.55} />
          <Circle cx={50} cy={50} r={17.5} fill="none" stroke="#f3e2b6" strokeOpacity={0.3} strokeWidth={0.7} strokeDasharray="1 2.4" />
        </>
      ) : (
        <Circle cx={50} cy={50} r={21} fill={state === "none" ? "none" : alpha(t.gold, 0.09)} stroke={state === "none" ? alpha(t.muted, 0.25) : alpha(t.gold, 0.35)} strokeWidth={0.8} />
      )}
      <G transform="matrix(0.8 0 0 0.8 10 10)" stroke={icon} fill="none" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
        <StationIcon id={id} color={icon} />
      </G>
    </Svg>
  );
}

function Legend({ T }: { T: JourneyText }) {
  const t = useTheme();
  const items: [StationState, number | null][] = [["done", 1], ["progress", 0.4], ["none", 0], ["open", null]];
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 16, rowGap: 8 }}>
      {items.map(([s, p]) => (
        <View key={s} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Medallion id="wudu" state={s} pct={p} size={20} />
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{T.legend[s]}</Text>
        </View>
      ))}
    </View>
  );
}

export type LearningJourneyProps = { /** course catalogue; defaults to journeyCatalog(lang) */ catalog?: JourneyCatalog };

/** the nine stations with real progress and the one next step (light canvas, as on /map) */
export function LearningJourney({ catalog }: LearningJourneyProps = {}) {
  const t = useTheme();
  const { lang } = useLang();
  const T = journeyText(lang);
  const nf = useNf();
  const surahName = useChapterNames();
  const cat = catalog ?? journeyCatalog(lang);
  const snap = useLive(() => readSnapshot(cat, readSrs()), [cat]);
  const views = useMemo(() => stationViews(snap, T, (n) => nf(n)), [snap, T, nf]);
  const next = nextStep(snap);

  // the gold line runs to the furthest completed station, and a little into the next one by its progress
  const furthest = views.reduce((acc, v, i) => (v.state === "done" ? i : acc), -1);
  const after = views[furthest + 1];
  const target = furthest < 0 ? 0 : furthest + (after && after.state === "progress" && after.pct ? Math.min(0.85, after.pct) : 0);
  const reduce = useReduceMotion();
  const drawn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) { drawn.setValue(target); return; }
    Animated.timing(drawn, { toValue: target, duration: 2200, easing: Easing.bezier(0.45, 0, 0.2, 1), useNativeDriver: false }).start();
  }, [target, reduce, drawn]);

  const doneN = views.filter((v) => v.state === "done").length;
  const progN = views.filter((v) => v.state === "progress").length;
  const nv = views.find((v) => v.id === next.id)!;
  const reasonVars: Record<NextReason, Record<string, string | number>> = {
    due: { n: nf(snap.memo.due) }, wudu: {}, salah: {}, fatihaGoOn: { n: nf(snap.fatiha.learned) },
    arabicStart: { title: snap.arabic.next?.title ?? "" }, arabicGoOn: { title: snap.arabic.next?.title ?? "" }, fatiha: {},
    tajweed: { title: snap.tajweed.next?.title ?? "" }, tajweedGoOn: { title: snap.tajweed.next?.title ?? "" }, vocab: {},
    memo: { verse: fill(T.verseOf, { surah: surahName(snap.memo.next.surah), v: nf(snap.memo.next.verse) }) },
  };
  const nextHref = next.reason === "due" ? "/today" : nv.href;
  const nextCta = next.reason === "due" ? T.cta.dueNow : nv.cta;
  const open = (v: StationView, href = v.href) => { markVisited(v.id); go(href); };

  return (
    <View>
      <Kicker style={{ fontSize: 11.5, letterSpacing: 1.8 }}>{T.kicker}</Kicker>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 33, letterSpacing: -0.6, color: t.ink, marginTop: 12 }}>{T.title}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.muted, marginTop: 16 }}>{T.lead}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, marginTop: 24 }}>{fill(T.summary, { d: nf(doneN), p: nf(progN) })}</Text>
      <View style={{ marginTop: 12 }}><Legend T={T} /></View>

      {/* the one next step */}
      <Callout style={{ marginTop: 32, padding: 16, borderRadius: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View style={{ width: 60, height: 60, alignItems: "center", justifyContent: "center" }}>
            <Pulse size={60} />
            <Medallion id={nv.id} state={nv.state} pct={nv.pct} size={60} />
          </View>
          <Kicker style={{ fontSize: 11.5, letterSpacing: 1.8 }}>{T.nextLabel}</Kicker>
        </View>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 20, lineHeight: 27, color: t.ink, marginTop: 16 }}>
          {T.stations[nv.id].title}{"  "}<Text style={{ fontFamily: CALLIG_FONT, fontSize: 20, color: t.gold }}>{T.stations[nv.id].ar}</Text>
        </Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, marginTop: 8 }}>{fill(T.reason[next.reason], reasonVars[next.reason])}</Text>
        <Pressable onPress={() => open(nv, nextHref)} accessibilityRole="button" accessibilityLabel={nextCta} style={({ pressed }) => ({ marginTop: 16, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
          <GoldBlock title={nextCta} />
        </Pressable>
      </Callout>

      {/* the path */}
      <View style={{ marginTop: 48 }}>
        {views.map((v, i) => (
          <StationItem key={v.id} v={v} i={i} T={T} isNext={v.id === next.id} last={i === views.length - 1} drawn={drawn} onOpen={open} />
        ))}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: t.muted, marginTop: 40 }}>{T.openNote}</Text>
    </View>
  );
}

function GoldBlock({ title }: { title: string }) {
  return (
    <ExpoGradient colors={["#dcc48c", "#c6a65e"]} style={{ minHeight: 48, borderRadius: R.sm, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 15, lineHeight: 20, color: "rgb(8,38,29)", textAlign: "center", flexShrink: 1 }}>{title}</Text>
      <Icon name="chevronRight" size={15} color="rgb(8,38,29)" />
    </ExpoGradient>
  );
}

function StationItem({ v, i, T, isNext, last, drawn, onOpen }: { v: StationView; i: number; T: JourneyText; isNext: boolean; last: boolean; drawn: Animated.Value; onOpen: (v: StationView) => void }) {
  const t = useTheme();
  const s = T.stations[v.id];
  const goldH = drawn.interpolate({ inputRange: [i, i + 1], outputRange: ["0%", "100%"], extrapolate: "clamp" });
  return (
    <View style={{ flexDirection: "row", gap: 16, paddingBottom: last ? 0 : 36 }}>
      {!last ? (
        <View pointerEvents="none" style={{ position: "absolute", left: 28, top: 30, bottom: -30, width: 4 }}>
          <Svg width={4} height="100%"><Line x1={2} y1={0} x2={2} y2="100%" stroke={alpha(t.muted, 0.35)} strokeWidth={2} strokeLinecap="round" strokeDasharray="1 7" /></Svg>
          <Animated.View style={{ position: "absolute", left: 0.5, top: 0, width: 3, height: goldH, borderRadius: 1.5, backgroundColor: t.gold }} />
        </View>
      ) : null}
      <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" }}>
        {isNext ? <Pulse size={60} /> : null}
        <Medallion id={v.id} state={v.state} pct={v.pct} size={60} />
      </View>
      <View style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 11, letterSpacing: 1.5, color: t.gold }}>{String(i + 1).padStart(2, "0")}</Text>
          <Text style={{ fontFamily: FONT.bold, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: t.muted }}>{s.area}</Text>
          {isNext ? (
            <View style={{ borderRadius: R.pill, borderWidth: 1, borderColor: alpha(t.gold, 0.5), backgroundColor: alpha(t.gold, 0.1), paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: t.gold }}>{T.nextBadge}</Text>
            </View>
          ) : null}
        </View>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 17, lineHeight: 23, color: t.ink, marginTop: 4 }}>
          {s.title}<Text style={{ fontFamily: CALLIG_FONT, fontSize: 15, color: alpha(t.gold, 0.8) }}>{"  "}{s.ar}</Text>
        </Text>
        <Text style={{ fontFamily: v.state === "done" ? FONT.semibold : FONT.regular, fontSize: 14, lineHeight: 19, color: v.state === "done" ? t.accent : alpha(t.ink, 0.8), marginTop: 4 }}>{v.status}</Text>
        {v.detail ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 16, color: t.muted, marginTop: 4 }}>{v.detail}</Text> : null}
        <ArrowLink title={v.cta} onPress={() => onOpen(v)} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

// ---------- compact strip on the stage: level from points, latest stickers, the next hour sticker ----------
export function JourneyLevelStrip({ arabicTotal = ARABIC_LESSONS.length }: { arabicTotal?: number }) {
  const tr = useWebT("rewards");
  const { lang } = useLang();
  const T = journeyText(lang);
  const nf = useNf();
  const v = useLive(() => {
    const ctx = buildCtx(arabicTotal);
    const earned = earnedIds(ctx), seen = readSeen();
    // newest first: earned but not yet celebrated, then in the order they were celebrated
    const order = [...earned.filter((id) => !seen.includes(id)).reverse(), ...seen.filter((id) => earned.includes(id)).reverse()];
    const latest = order.map((id) => stickerById(id)).filter((d): d is StickerDef => !!d).slice(0, 4);
    const next = nextHourSticker(ctx), hours = hoursOf(ctx);
    const i = next ? HOUR_STICKERS.indexOf(next) : HOUR_STICKERS.length;
    return { total: totalPoints(readPoints()), latest, next, hours, prevH: i > 0 ? HOUR_STICKERS[i - 1].h : 0 };
  }, [arabicTotal]);
  const lvl = levelOf(v.total);
  const name = (d: StickerDef) => tr(`s_${d.id}`);
  return (
    <View style={{ marginTop: 16, borderRadius: R.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.03)", padding: 16, gap: 16 }}>
      <Pressable onPress={() => go("/stats")} accessibilityRole="link" accessibilityLabel={tr("toStats")} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <LevelSeal n={lvl.n} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: CALLIG_FONT, fontSize: 24, lineHeight: 34, color: stage.gold, alignSelf: "flex-start" }}>{lvl.ar}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#eef0f3" }}>{tr("levelN", { n: lvl.n })} · {tr(`l${lvl.n}`)}</Text>
        </View>
      </Pressable>
      <View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", columnGap: 12 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{tr("points", { n: nf(v.total) })}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{tr("toNext", { n: nf(Math.max(0, lvl.to - v.total)) })}</Text>
        </View>
        <View style={{ marginTop: 6 }}><LevelBar value={lvl.pct} height={8} /></View>
      </View>
      <View>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>{T.strip.latest}</Text>
        {v.latest.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {v.latest.map((d) => <Pressable key={d.id} onPress={() => go("/stats")} accessibilityRole="link" accessibilityLabel={name(d)}><Sticker def={d} size={40} /></Pressable>)}
          </View>
        ) : <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 16, color: "rgba(255,255,255,0.6)", marginTop: 6, maxWidth: 256 }}>{T.strip.none}</Text>}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 16 }}>
        {v.next ? (
          <Pressable onPress={() => go("/stats")} accessibilityRole="link" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Sticker def={v.next} size={44} locked pct={(v.hours - v.prevH) / (v.next.h - v.prevH)} />
            <View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{tr("nextShort")}</Text>
              <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: "#ffffff" }}>{name(v.next)}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{tr("hoursN", { n: nf(v.next.h) })}</Text>
            </View>
          </Pressable>
        ) : null}
        <ArrowLink title={tr("toStats")} onPress={() => go("/stats")} color={stage.gold} />
      </View>
    </View>
  );
}

export default LearningJourney;
