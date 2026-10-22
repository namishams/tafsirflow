import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Animated, Easing, FlatList, I18nManager, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions, type LayoutChangeEvent, type TextStyle } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path } from "react-native-svg";
import { CALLIG_FONT, FONT, goldButton, stage, useTheme } from "@/lib/theme";
import { Divider, GlassButton, GlassIconButton, GlassSurface, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ErrorState, READ_WIDTH } from "@/components/page";
import { useTabBarSpace } from "@/components/TabBar";
import { QArcade } from "@/features/radio/art";
import { useReduceMotion } from "@/features/radio/motion";
import { useScreenBarStyle } from "@/features/reader/statusBar";
import { ringOf, useUiVerses } from "@/features/quran/uiVerses";
import {
  ArchWindow, EMERALD, FourStar, JUZ, JUZ_OF_SURAH, JuzHeadArt, PlaceIcon, QuranHeroBackdrop, QuranPageBackdrop, QuranShamsa, QuranStar, Ribbon,
  TileArch, TileRibbon, placeOf, qPalette, withAlpha, type Juz, type JuzPart, type Place, type QPal,
} from "@/features/quran/art";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { readJSON, useStoreVersion, writeJSON } from "@/lib/store";
import { getChapters, savedChapters, type Chapter } from "@/lib/quran";
import { savedSurahs } from "@/features/reader/offline";
import { useReaderT } from "@/features/reader/texts";
import { useAppT } from "@/features/radio/strings";
import { surahProgress } from "@/web/coach";
import { dueVerses, readSrs, stats } from "@/web/learning";
import { TOTAL_VERSES, indexOf, juzOf } from "@/web/quranIndex";

// The Quran tab as the website's /quran page (src/app/[locale]/(app)/quran/page.tsx + SurahBrowser.tsx): a marble hero
// with the shamsa medallion and the numbers, then continue / review, bookmarks, search, the Surahs / Juz and
// Meccan / Medinan switches and the 114 surahs as illuminated tiles (or grouped by juz).

type Mode = "surah" | "juz";
type Filter = "all" | Place;
type Last = { chapter: number; verse: number };
type Item = { k: "s"; c: Chapter } | { k: "j"; j: Juz; parts: JuzPart[] };
type Labels = { verses: string; juz: string; makki: string; madani: string; plain: boolean; learnedOf: (n: number, total: number) => string; saved: string };

const VIEW_KEY = "tf:quranView";
// no letter spacing or capitals in these scripts (art-quran.css .q-kicker, globals.css .font-display)
const PLAIN = ["ar", "fa", "ur", "ps", "bn", "zh"];
const ARABIC_SCRIPT = ["ar", "fa", "ur", "ps"];
const GOLD_HAIR = ["rgba(201,166,94,0)", "rgb(201,166,94)", "rgba(201,166,94,0)"] as const;
const CREAM_HAIR = ["rgba(233,207,153,0)", "rgba(233,207,153,0.9)", "rgba(233,207,153,0)"] as const;

const kicker = (plain: boolean): TextStyle => (plain
  ? { fontFamily: FONT.semibold, fontSize: 13, lineHeight: 18 }
  : { fontFamily: FONT.semibold, fontSize: 11.5, lineHeight: 15, letterSpacing: 2.07, textTransform: "uppercase" });

export default function QuranIndex() {
  const t = useTheme();
  const pal = qPalette(t);
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const reduce = useReduceMotion();
  const { width } = useWindowDimensions();
  const { lang } = useLang();
  const wh = useWebT("home");
  const wm = useWebT("map");
  const wp = useWebT("player");
  const wf = useWebT("feedback");
  const wn = useWebT("nav");
  const wsr = useWebT("search");
  const wa = useWebT("app");
  const ws = useWebT("seo");
  const rt = useReaderT();
  const ra = useAppT();
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [failed, setFailed] = useState(false);
  // no connection: the list of the last visit (or the bundled one), with a note and the surahs saved offline marked
  const [offlineList, setOfflineList] = useState(false);
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<Filter>("all");

  const load = useCallback(() => {
    setFailed(false);
    getChapters(lang)
      .then((c) => { setChapters(c); setOfflineList(false); })
      .catch(() => {
        const saved = savedChapters(lang);
        if (!saved) { setFailed(true); return; }
        setChapters((cur) => cur ?? saved.chapters);
        setOfflineList(true);
      });
  }, [lang]);
  useEffect(load, [load]);

  // the hero is light marble: dark status bar text while this tab is in front (the app default is light); applied a tick
  // later so it wins over the blur of the screen that was in front before (features/reader/statusBar.ts)
  useScreenBarStyle(t.dark ? "light" : "dark");

  // stored state: Surahs / Juz switch, last position, bookmarks and the review plan (re-read when the store changes)
  const version = useStoreVersion();
  const mode: Mode = readJSON<string>(VIEW_KEY, "surah") === "juz" ? "juz" : "surah";
  const changeMode = useCallback((m: Mode) => writeJSON(VIEW_KEY, m, true), []);
  const learn = useMemo(() => {
    const srs = readSrs();
    // verses in the review plan, counted per juz (website SurahBrowser)
    const juz: Record<number, number> = {};
    for (const k of Object.keys(srs)) {
      const [s, v] = k.split(":").map(Number);
      if (!(s >= 1 && s <= 114 && v >= 1)) continue;
      const j = juzOf(indexOf(s, v));
      juz[j] = (juz[j] ?? 0) + 1;
    }
    // surahs saved for listening offline (Pro), with any reciter: marked while there is no connection
    const offline = new Set(Object.keys(savedSurahs()).map((k) => Number(k.split(":")[0])));
    return { progress: surahProgress(srs), juz, due: dueVerses(srs), st: stats(), last: readJSON<Last | null>("tf:last", null), marks: readJSON<string[]>("tf:bookmarks", []), offline };
  }, [version]); // eslint-disable-line react-hooks/exhaustive-deps

  const byId = useMemo(() => new Map((chapters ?? []).map((c) => [c.id, c])), [chapters]);
  const list = useMemo(() => {
    if (!chapters) return [];
    const q = query.trim().toLowerCase();
    return chapters.filter((c) => (place === "all" || placeOf(c) === place)
      && (!q || String(c.id) === q || c.name_simple.toLowerCase().includes(q) || c.translated_name.name.toLowerCase().includes(q) || c.name_arabic.includes(query.trim())));
  }, [chapters, query, place]);
  const items = useMemo<Item[]>(() => {
    if (mode === "surah") return list.map((c): Item => ({ k: "s", c }));
    const shown = new Set(list.map((c) => c.id));
    return JUZ.flatMap((j): Item[] => { const parts = j.parts.filter((p) => shown.has(p.s)); return parts.length ? [{ k: "j", j, parts }] : []; });
  }, [mode, list]);

  // layout: phones one column, from 640 pt two; content at most READ_WIDTH wide and centred
  const sm = width >= 640, tiny = width < 360;
  const pad = Math.max(sm ? 24 : 16, (width - READ_WIDTH) / 2);
  const cols = sm ? 2 : 1;
  const gap = mode === "surah" ? 12 : 16;
  const itemW = cols > 1 ? (width - 2 * pad - gap) / 2 : undefined;
  const plain = PLAIN.includes(lang);
  const ar = lang === "ar";

  // tiles of the first screen arrive one after another (only right after the list appears)
  const enterRef = useRef(true);
  useEffect(() => { if (!chapters) return; const id = setTimeout(() => { enterRef.current = false; }, 1500); return () => clearTimeout(id); }, [chapters]);

  const statLabels = useMemo(() => [wh("surahs"), wh("verses"), wm("juz")], [wh, wm]);
  const labels = useMemo<Labels>(() => ({ verses: wh("verses"), juz: wp("juz"), makki: wh("makki"), madani: wh("madani"), plain, learnedOf: (n, total) => wm("learnedOf", { n, total }), saved: rt("savedOffline") }), [wh, wp, wm, plain, rt]);
  const fmt = useMemo(() => {
    try { const nf = new Intl.NumberFormat(`${lang}-u-nu-latn`, { maximumFractionDigits: 0 }); return (n: number) => nf.format(n); }
    catch { return (n: number) => String(Math.round(n)); }
  }, [lang]);

  const lastId = learn.last?.chapter;
  const renderItem = useCallback(({ item, index }: { item: Item; index: number }) => {
    const enter = enterRef.current && !reduce && index < 18 ? index : -1;
    if (item.k === "s") {
      const p = learn.progress[item.c.id - 1];
      const pct = p?.learned ? (p.learned / Math.max(1, p.total)) * 100 : 0;
      return <SurahTile c={item.c} pct={pct} learned={p?.learned ?? 0} total={p?.total ?? item.c.verses_count} here={lastId === item.c.id} ar={ar} tiny={tiny} pal={pal} labels={labels} w={itemW} enter={enter}
        saved={offlineList && learn.offline.has(item.c.id)} />;
    }
    return <JuzCard j={item.j} parts={item.parts} byId={byId} learned={learn.juz[item.j.n] ?? 0} ar={ar} pal={pal} labels={labels} w={itemW} />;
  }, [learn, lastId, ar, tiny, pal, labels, itemW, byId, reduce, offlineList]);

  if (failed) return <ErrorState retry={load} />;

  const { last, marks, due, st } = learn;
  const lastChapter = last ? byId.get(last.chapter) : undefined;
  const hasReview = st.streak > 0 || due.length > 0;
  const topCards = !!(lastChapter && last) || hasReview;
  const q = query.trim();

  const header = (
    <View>
      <QuranHero pal={pal} reduce={reduce} width={width} top={insets.top} pad={pad} plain={plain} rtlScript={ARABIC_SCRIPT.includes(lang)}
        kickerText={wa("name")} title={wh("surahs")} lead={ws("quranDesc")} statLabels={statLabels} fmt={fmt} />
      <View style={{ paddingTop: sm ? 40 : 32 }}>
        {offlineList ? (
          <View accessibilityRole="alert" style={{ marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)", backgroundColor: pal.surface, padding: 14 }}>
            <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: pal.ink }}>{rt("offlineList")}</Text>
            <GlassButton compact title={ra("tryAgain")} onPress={load} />
          </View>
        ) : null}
        {topCards ? (
          <View style={{ gap: 16 }}>
            {lastChapter && last ? (
              <ContinueCard chapter={lastChapter} verse={last.verse} sm={sm} tiny={tiny} plain={plain}
                label={wh("resume")} title={wh("resumeAt", { surah: lastChapter.name_simple, verse: last.verse })} />
            ) : null}
            {hasReview ? (
              <ReviewCallout pal={pal} sm={sm} plain={plain} due={due[0] ?? null}
                streak={st.streak > 0 ? wh("streak", { n: st.streak }) : null} today={st.todayCount > 0 ? wh("todayCount", { n: st.todayCount }) : null}
                review={wh("review")} dueText={wh("reviewDue", { n: due.length })} start={wh("reviewStart")} none={wh("reviewNone")} />
            ) : null}
          </View>
        ) : null}

        {marks.length > 0 ? (
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ribbon color={pal.gold} />
              <Text accessibilityRole="header" style={[kicker(plain), { color: pal.muted }]}>{wh("bookmarks")}</Text>
            </View>
            <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {marks.slice(-12).reverse().map((k) => {
                const [s, v] = k.split(":");
                const name = byId.get(Number(s))?.name_simple ?? s;
                return (
                  <Pressable key={k} onPress={() => router.push(`/quran/${s}?v=${v}` as Href)} accessibilityRole="link" accessibilityLabel={`${name} ${v}`}
                    style={({ pressed }) => ({ maxWidth: "100%", transform: [{ scale: pressed ? 0.96 : 1 }] })}>
                    <GlassSurface interactive style={[s_.chip, { height: 34, borderWidth: StyleSheet.hairlineWidth }]}>
                      <Ribbon color={pal.gold} />
                      <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.semibold, fontSize: 13, color: pal.ink }}>{name}</Text>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: pal.muted, fontVariant: ["tabular-nums"] }}>{v}</Text>
                    </GlassSurface>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={{ marginTop: topCards || marks.length > 0 ? 32 : 0, gap: 12 }}>
          <SearchField value={query} onChange={setQuery} pal={pal} placeholder={wh("search")} />
          {q.length > 2 ? (
            <Pressable onPress={() => router.push(`/search?q=${encodeURIComponent(q)}` as Href)} accessibilityRole="link" hitSlop={6}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{wh("searchVerses")} · „{q}“ · {wsr("go")}</Text>
            </Pressable>
          ) : null}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <QSeg fill pal={pal} compact={width <= 440} label={wh("surahs")} value={mode} onChange={changeMode}
              options={[{ id: "surah", label: wh("surahs") }, { id: "juz", label: wm("juz") }]} />
            <GlassIconButton label={wn("map")} onPress={() => router.push("/map" as Href)} size={40}>
              <Icon name="map" size={17} color={pal.gold} />
            </GlassIconButton>
          </View>
          <QSeg fill pal={pal} compact={width <= 440} label={`${wh("makki")} / ${wh("madani")}`} value={place} onChange={setPlace}
            options={[
              { id: "all", label: wf("all") },
              { id: "makki", label: wh("makki"), icon: (c) => <PlaceIcon place="makki" color={c} gold={pal.gold} /> },
              { id: "madani", label: wh("madani"), icon: (c) => <PlaceIcon place="madani" color={c} gold={pal.gold} /> },
            ]} />
        </View>
        <View style={{ height: 24 }} />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: pal.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <QuranPageBackdrop pal={pal} />
      <FlatList
        key={`cols-${cols}`}
        style={{ flex: 1 }}
        data={items}
        keyExtractor={(it) => (it.k === "s" ? `s${it.c.id}` : `j${it.j.n}`)}
        renderItem={renderItem}
        numColumns={cols}
        columnWrapperStyle={cols > 1 ? { gap } : undefined}
        ItemSeparatorComponent={mode === "surah" ? Gap12 : Gap16}
        ListHeaderComponent={header}
        ListEmptyComponent={!chapters
          ? <View style={{ paddingVertical: 40, alignItems: "center" }}><ActivityIndicator color={t.accent} /></View>
          : <Text style={{ paddingVertical: 40, textAlign: "center", fontFamily: FONT.regular, fontSize: 15, color: pal.muted }}>{wh("noResults")}</Text>}
        ListFooterComponent={<Divider style={{ marginTop: 56 }} />}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: pad, paddingBottom: tabSpace + 24 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={9}
        removeClippedSubviews={Platform.OS === "android"}
      />
    </View>
  );
}

const Gap12 = () => <View style={{ height: 12 }} />;
const Gap16 = () => <View style={{ height: 16 }} />;

// ---------- hero ----------

/** a number that counts up once (CountUp.tsx: 1.4 s, ease-out cubic); stands still with reduced motion */
function useCountProgress(reduce: boolean) {
  const [p, setP] = useState(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) { setP(1); return; }
    let raf = 0;
    const t0 = Date.now();
    const tick = () => { const x = Math.min(1, (Date.now() - t0) / 1400); setP(1 - Math.pow(1 - x, 3)); if (x < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);
  return p;
}

const STAT_VALUES = [114, TOTAL_VERSES, 30];
/** .q-stats: three numbers in a gold-framed card with fine gold dividers */
function HeroStats({ pal, reduce, labels, tiny, sm, plain, fmt }: { pal: QPal; reduce: boolean; labels: string[]; tiny: boolean; sm: boolean; plain: boolean; fmt: (n: number) => string }) {
  const p = useCountProgress(reduce);
  const size = tiny ? 19 : sm ? 28 : 22;
  return (
    <View style={{ marginTop: 24, maxWidth: 448, flexDirection: "row", borderWidth: 1, borderColor: "rgba(201,166,94,0.4)", borderRadius: 10, overflow: "hidden", backgroundColor: pal.dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.55)" }}>
      {STAT_VALUES.map((n, i) => (
        <View key={i} accessible accessibilityLabel={`${fmt(n)} ${labels[i]}`} style={{ flex: 1, minWidth: 0, paddingVertical: tiny ? 10 : 12, paddingHorizontal: tiny ? 9 : 14 }}>
          {i > 0 ? <LinearGradient colors={["rgba(201,166,94,0)", "rgba(201,166,94,0.6)", "rgba(201,166,94,0)"]} style={{ position: "absolute", top: 10, bottom: 10, start: 0, width: 1 }} /> : null}
          <Text numberOfLines={1} style={{ fontFamily: FONT.display, fontSize: size, lineHeight: Math.round(size * 1.1), letterSpacing: plain ? 0 : -0.025 * size, color: pal.ink, fontVariant: ["tabular-nums"] }}>{fmt(Math.round(n * p))}</Text>
          <Text numberOfLines={1} style={{ marginTop: 6, fontFamily: FONT.regular, fontSize: 12, lineHeight: 16, color: pal.muted }}>{labels[i]}</Text>
        </View>
      ))}
    </View>
  );
}

/** .q-hero: kicker with a four-pointed star and the big title next to the shamsa, the lead, the numbers, the arcade */
const QuranHero = memo(function QuranHero({ pal, reduce, width, top, pad, plain, rtlScript, kickerText, title, lead, statLabels, fmt }: {
  pal: QPal; reduce: boolean; width: number; top: number; pad: number; plain: boolean; rtlScript: boolean;
  kickerText: string; title: string; lead: string; statLabels: string[]; fmt: (n: number) => string;
}) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => { const { width: w, height: h } = e.nativeEvent.layout; setBox((b) => (b.w === w && b.h === h ? b : { w, h })); };
  const sm = width >= 640, tiny = width < 360;
  const medal = tiny ? 104 : sm ? 230 : 156;
  // the verses around the medallion (54:17, 56:77–80) from the Quran data, never typed by hand
  const verses = useUiVerses();
  const ring = useMemo(() => ringOf(verses), [verses["54:17"], verses["56:77"], verses["56:78"], verses["56:79"], verses["56:80"]]); // eslint-disable-line react-hooks/exhaustive-deps
  const size = tiny ? 34 : sm ? 72 : 44;
  const leadSize = sm ? 17 : 15;
  return (
    <View onLayout={onLayout} style={{ marginHorizontal: -pad, overflow: "hidden", borderBottomWidth: 1, borderBottomColor: "rgba(201,166,94,0.45)" }}>
      <QuranHeroBackdrop width={box.w} height={box.h} pal={pal} reduce={reduce} inlay={sm ? 240 : 176} />
      <View style={{ paddingHorizontal: pad, paddingTop: top + (sm ? 48 : 32), paddingBottom: sm ? 64 : 56 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <FourStar size={12} color={pal.inkGold} />
              <Text numberOfLines={1} style={[kicker(plain), { flexShrink: 1, color: pal.inkGold }]}>{kickerText}</Text>
            </View>
            <Text accessibilityRole="header" style={{ marginTop: 12, fontFamily: FONT.display, fontSize: size, lineHeight: Math.round(size * (rtlScript ? 1.4 : 1)), letterSpacing: plain ? 0 : -0.025 * size, color: pal.ink }}>{title}</Text>
          </View>
          <QuranShamsa size={medal} pal={pal} reduce={reduce} ring={ring} />
        </View>
        <Text style={{ marginTop: 20, maxWidth: 576, fontFamily: FONT.regular, fontSize: leadSize, lineHeight: leadSize * 1.625, color: pal.muted }}>{lead}</Text>
        <HeroStats pal={pal} reduce={reduce} labels={statLabels} tiny={tiny} sm={sm} plain={plain} fmt={fmt} />
      </View>
      <QArcade />
    </View>
  );
});

// ---------- continue and review ----------

/** .q-continue: dark green stage with the surah in an arched window, where you stopped, a gold bar and a play button */
const ContinueCard = memo(function ContinueCard({ chapter, verse, sm, tiny, plain, label, title }: { chapter: Chapter; verse: number; sm: boolean; tiny: boolean; plain: boolean; label: string; title: string }) {
  const pct = Math.min(100, (verse / chapter.verses_count) * 100);
  const size = sm ? 20 : 17;
  return (
    <Pressable onPress={() => router.push(`/quran/${chapter.id}?v=${verse}` as Href)} accessibilityRole="button" accessibilityLabel={`${label}. ${title}`}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.985 : 1 }] })}>
      <Stage rounded={12} pattern={false}>
        <LinearGradient pointerEvents="none" colors={CREAM_HAIR} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: 0, left: 24, right: 24, height: 1 }} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: sm ? 20 : 16, padding: sm ? 20 : 16 }}>
          {!tiny ? (
            <ArchWindow>
              <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 17, lineHeight: 23, color: "#e9cf99", textAlign: "center", writingDirection: "rtl" }}>{chapter.name_arabic}</Text>
            </ArchWindow>
          ) : null}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={2} style={[kicker(plain), { color: stage.gold }]}>{label}</Text>
            <Text style={{ marginTop: 4, fontFamily: FONT.display, fontSize: size, lineHeight: size * 1.375, letterSpacing: plain ? 0 : -0.025 * size, color: "#eef0f3" }}>{title}</Text>
            <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1, minWidth: 0, height: 3, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                <LinearGradient colors={["#b98f45", "#f3e2b6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 3, width: `${pct}%`, borderRadius: 3 }} />
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.6)", fontVariant: ["tabular-nums"], writingDirection: "ltr" }}>{verse} / {chapter.verses_count}</Text>
            </View>
          </View>
          <PlayDisc />
        </View>
      </Stage>
    </Pressable>
  );
});

/** .q-play: a gold disc with a play mark inside a dashed gold ring */
function PlayDisc() {
  return (
    <View style={{ width: 60, height: 60, alignItems: "center", justifyContent: "center", marginHorizontal: -6 }}>
      <Svg width={60} height={60} style={StyleSheet.absoluteFill}><Circle cx={30} cy={30} r={29.5} fill="none" stroke="rgba(233,207,153,0.55)" strokeWidth={1} strokeDasharray="3 3" /></Svg>
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#c6a65e", shadowColor: "rgb(214,180,108)", shadowOffset: { width: 0, height: 6 }, shadowRadius: 9, shadowOpacity: 0.5 }}>
        <LinearGradient colors={["#e6cd92", "#c6a65e"]} style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" }}>
          <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M8 5.5v13l10.5-6.5z" fill="rgb(8,38,29)" /></Svg>
        </LinearGradient>
      </View>
    </View>
  );
}

/** .callout with the streak, today's count and the verses due for review */
const ReviewCallout = memo(function ReviewCallout({ pal, sm, plain, due, streak, today, review, dueText, start, none }: {
  pal: QPal; sm: boolean; plain: boolean; due: string | null; streak: string | null; today: string | null; review: string; dueText: string; start: string; none: string;
}) {
  const [s, v] = due ? due.split(":") : [];
  return (
    <View style={{ borderRadius: 6, borderWidth: 1, borderColor: withAlpha(pal.gold, 0.28), backgroundColor: pal.surface, padding: sm ? 20 : 16, gap: 12 }}>
      <LinearGradient pointerEvents="none" colors={[withAlpha(pal.gold, 0.07), withAlpha(pal.gold, 0)]} locations={[0, 0.7]} style={[StyleSheet.absoluteFill, { borderRadius: 5 }]} />
      <LinearGradient pointerEvents="none" colors={[withAlpha(pal.gold, 0), withAlpha(pal.gold, 0.95), withAlpha(pal.gold, 0)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: -1, left: 22, right: 22, height: 1 }} />
      {streak || today ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          {streak ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(201,166,94,0.14)" }}>
              <Icon name="flame" size={14} color={pal.inkGold} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: pal.inkGold }}>{streak}</Text>
            </View>
          ) : null}
          {today ? (
            <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: "rgba(201,166,94,0.35)" }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: pal.muted }}>{today}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      {due ? (
        <Pressable onPress={() => router.push(`/quran/${s}?v=${v}&m=2&r=1` as Href)} accessibilityRole="button" accessibilityLabel={`${review}. ${dueText}. ${start}`}
          style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <View style={{ minWidth: 0, flexShrink: 1 }}>
            <Text style={[kicker(plain), { color: pal.inkGold }]}>{review}</Text>
            <Text style={{ marginTop: 2, fontFamily: FONT.display, fontSize: 20, lineHeight: 27, letterSpacing: plain ? 0 : -0.5, color: pal.ink }}>{dueText}</Text>
          </View>
          <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 44, borderRadius: 999, overflow: "hidden", paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{start}</Text>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={goldButton.text} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
              <Path d="M5 12h14M13 6l6 6-6 6" />
            </Svg>
          </LinearGradient>
        </Pressable>
      ) : (
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: pal.muted }}>{none}</Text>
      )}
    </View>
  );
});

// ---------- search and switches ----------

/** .q-search: a tall field with a gold frame, a gold magnifier and a soft gold focus ring */
function SearchField({ value, onChange, pal, placeholder }: { value: string; onChange: (v: string) => void; pal: QPal; placeholder: string }) {
  const [focus, setFocus] = useState(false);
  return (
    <View>
      {focus ? <View pointerEvents="none" style={{ position: "absolute", top: -4, left: -4, right: -4, bottom: -4, borderRadius: 16, borderWidth: 4, borderColor: "rgba(201,166,94,0.14)" }} /> : null}
      <View style={{ height: 52, flexDirection: "row", alignItems: "center", gap: 12, paddingStart: 16, paddingEnd: 12, borderRadius: 12, borderWidth: 1, borderColor: focus ? "rgba(201,166,94,0.9)" : "rgba(201,166,94,0.38)", backgroundColor: pal.surface,
        shadowColor: "rgb(120,90,30)", shadowOffset: { width: 0, height: 10 }, shadowRadius: 10, shadowOpacity: pal.dark ? 0 : 0.12 }}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={pal.gold} strokeWidth={2} strokeLinecap="round"><Circle cx={11} cy={11} r={6.5} /><Path d="M16 16l4.5 4.5" /></Svg>
        <TextInput value={value} onChangeText={onChange} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholder={placeholder} placeholderTextColor={pal.muted}
          accessibilityLabel={placeholder} returnKeyType="search" autoCorrect={false} style={{ flex: 1, height: 50, fontFamily: FONT.regular, fontSize: 16, color: pal.ink }} />
        {value ? <Pressable onPress={() => onChange("")} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear"><Icon name="close" color={pal.muted} size={16} /></Pressable> : null}
      </View>
    </View>
  );
}

/** .q-seg: the shared segmented look – a glass track with the active segment as a gold capsule */
function QSeg<T extends string>({ value, options, onChange, label, pal, compact, fill }: {
  value: T; options: { id: T; label: string; icon?: (color: string) => ReactNode }[]; onChange: (v: T) => void; label: string; pal: QPal; compact: boolean; fill?: boolean;
}) {
  return (
    <GlassSurface accessibilityLabel={label} style={{ flexDirection: "row", maxWidth: "100%", flex: fill ? 1 : undefined, padding: 3, gap: 2, borderRadius: 999 }}>
      {options.map((o) => {
        const on = o.id === value;
        const color = on ? goldButton.text : pal.muted;
        const inner = (
          <View style={{ height: 32, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: compact ? 4 : 6, paddingHorizontal: (compact ? 9 : 13) - 1 }}>
            {o.icon?.(color)}
            <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: compact ? 12.5 : 13, color }}>{o.label}</Text>
          </View>
        );
        return (
          <Pressable key={o.id} onPress={() => onChange(o.id)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={o.label}
            style={[{ minWidth: 0, borderRadius: 999, flex: fill ? 1 : undefined }, on && s_.segShadow]}>
            {on ? <LinearGradient colors={[goldButton.from, goldButton.to]} style={s_.segOn}>{inner}</LinearGradient> : <View style={s_.segOff}>{inner}</View>}
          </Pressable>
        );
      })}
    </GlassSurface>
  );
}

// ---------- surah tile ----------

/** .q-in: rises in once, one tile after another */
function useEnter(i: number) {
  const v = useRef(new Animated.Value(i >= 0 ? 0 : 1)).current;
  useEffect(() => {
    if (i < 0) return;
    const a = Animated.timing(v, { toValue: 1, duration: 700, delay: i * 38 + 120, easing: Easing.bezier(0.2, 0.7, 0.2, 1), useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return v;
}

const MetaItem = ({ children, pal }: { children: ReactNode; pal: QPal }) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <View style={{ width: 3, height: 3, borderRadius: 1, marginEnd: 8, backgroundColor: "rgba(201,166,94,0.8)", transform: [{ rotate: "45deg" }] }} />
    <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 15, color: pal.muted, fontVariant: ["tabular-nums"] }}>{children}</Text>
  </View>
);

/** .q-tile: star medallion | name, meaning, details | Arabic name in a mihrab outline; a gold hairline on top */
const SurahTile = memo(function SurahTile({ c, pct, learned, total, here, ar, tiny, pal, labels, w, enter, saved = false }: {
  c: Chapter; pct: number; learned: number; total: number; here: boolean; ar: boolean; tiny: boolean; pal: QPal; labels: Labels; w?: number; enter: number;
  /** saved for listening offline (shown while there is no connection) */
  saved?: boolean;
}) {
  const rise = useEnter(enter);
  const place = placeOf(c);
  const juz = JUZ_OF_SURAH[c.id - 1];
  const sub = c.translated_name?.name ?? "";
  const name = ar
    ? <Text numberOfLines={1} style={{ fontFamily: CALLIG_FONT, fontSize: 21, lineHeight: 30, color: pal.ink, writingDirection: "rtl" }}>{c.name_simple}</Text>
    : <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 15.5, lineHeight: 19, color: pal.ink }}>{c.name_simple}</Text>;
  const arSize = tiny ? 19 : 23;
  const end = ar ? (
    <View style={{ width: 78, alignItems: "center", paddingTop: 8 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 19, lineHeight: 21, color: pal.inkGold, fontVariant: ["tabular-nums"] }}>{c.verses_count}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 15, color: pal.muted }}>{labels.verses}</Text>
    </View>
  ) : (
    <Text numberOfLines={1} allowFontScaling={false} style={{ maxWidth: tiny ? 96 : 132, fontFamily: CALLIG_FONT, fontSize: arSize, lineHeight: arSize * 1.6, color: pal.inkSoft, writingDirection: "rtl" }}>{c.name_arabic}</Text>
  );
  const details = (
    <>
      {sub ? <Text numberOfLines={1} style={{ marginTop: 2, fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 16, color: pal.muted }}>{sub}</Text> : null}
      <View style={{ marginTop: 6, flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <PlaceIcon place={place} color={pal.inkGold} gold={pal.gold} />
          <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 15, color: pal.inkGold }}>{labels[place]}</Text>
        </View>
        {!ar ? <MetaItem pal={pal}>{c.verses_count} {labels.verses}</MetaItem> : null}
        <MetaItem pal={pal}>{labels.juz} {juz}</MetaItem>
        {saved ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon name="download" size={12} color={pal.inkGold} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, lineHeight: 15, color: pal.inkGold }}>{labels.saved}</Text>
          </View>
        ) : null}
      </View>
    </>
  );
  const a11y = `${c.id}. ${c.name_simple}${sub ? `, ${sub}` : ""}, ${labels[place]}, ${c.verses_count} ${labels.verses}, ${labels.juz} ${juz}${learned > 0 ? `, ${labels.learnedOf(learned, total)}` : ""}${saved ? `, ${labels.saved}` : ""}`;
  return (
    <Animated.View style={[w ? { width: w } : null, enter >= 0 ? { opacity: rise, transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }, { scale: rise.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) }] } : null]}>
      <Pressable onPress={() => router.push(`/quran/${c.id}` as Href)} accessibilityRole="button" accessibilityLabel={a11y}
        style={({ pressed }) => [s_.tile, { backgroundColor: pal.tile, borderColor: here ? "rgba(201,166,94,0.75)" : "rgba(201,166,94,0.24)" }, pressed && { transform: [{ scale: 0.985 }] }]}>
        {here ? <View pointerEvents="none" style={s_.hereRing} /> : null}
        <View pointerEvents="none" style={[s_.innerRing, { borderColor: here ? "rgba(201,166,94,0.3)" : "rgba(201,166,94,0.1)" }]} />
        <TileArch color={pal.gold} />
        <View pointerEvents="none" style={s_.hairWrap}><LinearGradient colors={GOLD_HAIR} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s_.hair} /></View>
        {here ? <TileRibbon /> : null}
        <View style={[s_.tileRow, { columnGap: tiny ? 10 : 12 }]}>
          <QuranStar n={c.id} pct={pct} ink={pal.ink} gold={pal.gold} />
          {tiny ? (
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><View style={{ flex: 1, minWidth: 0 }}>{name}</View>{end}</View>
              {details}
            </View>
          ) : (
            <>
              <View style={{ flex: 1, minWidth: 0 }}>{name}{details}</View>
              {end}
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
});

// ---------- juz view ----------

const JuzRow = memo(function JuzRow({ p, c, first, ar, pal, labels }: { p: JuzPart; c?: Chapter; first: boolean; ar: boolean; pal: QPal; labels: Labels }) {
  const whole = p.from === 1 && p.to === (c?.verses_count ?? p.to);
  const name = c?.name_simple ?? String(p.s);
  const range = whole ? `${p.to} ${labels.verses}` : `${p.from}–${p.to}`;
  return (
    <Pressable onPress={() => router.push(`/quran/${p.s}${p.from > 1 ? `?v=${p.from}` : ""}` as Href)} accessibilityRole="button" accessibilityLabel={`${p.s}. ${name}, ${range}`}
      style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 9 }, !first && { borderTopWidth: 1, borderTopColor: "rgba(201,166,94,0.14)" }, pressed && { backgroundColor: "rgba(201,166,94,0.08)" }]}>
      {/* "right" is the end side: React Native swaps it in a right-to-left layout */}
      <Text style={{ width: 28, textAlign: "right", fontFamily: FONT.semibold, fontSize: 12, color: pal.inkGold, fontVariant: ["tabular-nums"] }}>{p.s}</Text>
      <View style={{ flex: 1, minWidth: 0 }}>
        {ar
          ? <Text numberOfLines={1} style={{ fontFamily: CALLIG_FONT, fontSize: 18, lineHeight: 27, color: pal.ink, writingDirection: "rtl" }}>{name}</Text>
          : <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 19, color: pal.ink }}>{name}</Text>}
        <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 15, color: pal.muted, fontVariant: ["tabular-nums"], writingDirection: whole ? undefined : "ltr" }}>{range}</Text>
      </View>
      {!ar && c ? <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 18, lineHeight: 27, color: pal.inkFaint, writingDirection: "rtl" }}>{c.name_arabic}</Text> : null}
    </Pressable>
  );
});

/** .q-juz: an emerald head with the star of the part, then its surahs */
const JuzCard = memo(function JuzCard({ j, parts, byId, learned, ar, pal, labels, w }: { j: Juz; parts: JuzPart[]; byId: Map<number, Chapter>; learned: number; ar: boolean; pal: QPal; labels: Labels; w?: number }) {
  return (
    <View style={[{ borderRadius: 12, borderWidth: 1, borderColor: "rgba(201,166,94,0.28)", backgroundColor: pal.tile, overflow: "hidden" }, w ? { width: w } : null]}>
      <View accessible accessibilityRole="header" accessibilityLabel={`${labels.juz} ${j.n}, ${j.total} ${labels.verses}${learned > 0 ? `, ${labels.learnedOf(learned, j.total)}` : ""}`}>
        <JuzHeadArt />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
          <QuranStar n={j.n} pct={(learned / j.total) * 100} ink={pal.ink} gold={pal.gold} onStage />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: FONT.display, fontSize: 18, lineHeight: 22, letterSpacing: labels.plain ? 0 : -0.45, color: "#eef0f3" }}>{labels.juz} {j.n}</Text>
            <Text style={{ marginTop: 2, fontFamily: FONT.regular, fontSize: 12, lineHeight: 16, color: "rgba(255,255,255,0.6)", fontVariant: ["tabular-nums"], writingDirection: "ltr" }}>{j.from} – {j.to}</Text>
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.6)", fontVariant: ["tabular-nums"] }}>{j.total} {labels.verses}</Text>
        </View>
      </View>
      {parts.map((p, i) => <JuzRow key={p.s} p={p} c={byId.get(p.s)} first={i === 0} ar={ar} pal={pal} labels={labels} />)}
    </View>
  );
});

const s_ = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 7, maxWidth: "100%", paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  segOn: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.35)", overflow: "hidden" },
  segOff: { borderRadius: 999, borderWidth: 1, borderColor: "transparent" },
  segShadow: { backgroundColor: "rgb(6,36,27)", shadowColor: "rgb(6,36,27)", shadowOffset: { width: 0, height: 6 }, shadowRadius: 6, shadowOpacity: 0.35 },
  tile: { borderRadius: 12, borderWidth: 1 },
  innerRing: { position: "absolute", top: 3, left: 3, right: 3, bottom: 3, borderRadius: 8, borderWidth: 1 },
  hereRing: { position: "absolute", top: -4, left: -4, right: -4, bottom: -4, borderRadius: 15, borderWidth: 3, borderColor: "rgba(201,166,94,0.12)" },
  hairWrap: { position: "absolute", top: 0, left: 18, right: 18, height: 1, alignItems: "center" },
  hair: { width: "35%", height: 1, opacity: 0.55 },
  tileRow: { flexDirection: "row", alignItems: "center", minHeight: 80, paddingVertical: 12, paddingStart: 12, paddingEnd: 14 },
});
