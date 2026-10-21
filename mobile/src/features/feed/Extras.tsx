import { memo, useEffect, useMemo, useRef, useState } from "react";
import { router, type Href } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, type IconName } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import type { Reciter, Word } from "@/lib/quran";
import { VERSE_COUNTS } from "@/web/counts";
import { CITIES, dayFor, fmtTime, type Prayer, type Spot } from "@/web/prayer";
import { toneOf } from "./art";
import { tick } from "./haptics";
import { engaged } from "./interest";
import { loadVerse, shuffle, type FeedVerse } from "./source";
import { fillText, useFeedText } from "./texts";
import { FEED_STATS_KEY, addLearnedWords, todayWords, type FeedStats } from "./seen";
import type { VerseEngine } from "@/features/quran/useVerseAudio";
import { reciterName } from "@/lib/quran";
import type { StoryGroup } from "@/features/prophet/stories";
import { calText, countdown, fmtHijri, toHijri, todayUtc } from "@/web/hijri";
import { readTradition } from "@/lib/tradition";
import { livePos, radio, useRadioSelect } from "@/features/radio/engine";
import { STATIONS } from "@/features/radio/stations";
import { statQuiz } from "./statsStore";
import { PostShareButtons, quizSpec, useShareCtx, verseSpec, type ShareSpec } from "@/features/share/feedShare";
import { PostPanel } from "@/features/share/ShareTemplates";

// More post kinds of the Home feed, built only from data the app already has: the Quran API's verses and word data
// (quiz, carousel, memorise) and the prayer times of the app's own calculation (web/prayer.ts). Nothing typed by hand.
//   "q:S:A" word quiz · "c:S:A" carousel of the verses A.. (3–5) · "m:S:A" memorise (words covered) · "p:<prayer>" prayer

type Common = { item: string; width: number; lang: string; reciter: Reciter; nameOf: (s: number) => string; reduce: boolean };

function Frame({ icon, title, sub, children, width, tone, learn, share }: { icon: IconName; title: string; sub?: string; children: React.ReactNode; width: number; tone: [string, string]; learn?: string;
  /** the post's share image (features/share/feedShare.tsx); shows the Story pill and the paper plane */
  share?: () => ShareSpec | null | Promise<ShareSpec | null> }) {
  const t = useTheme();
  const tx = useFeedText();
  return (
    <View style={{ width, alignSelf: "center", paddingBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, height: 56 }}>
        <LinearGradient colors={tone} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} color="rgb(233,207,153)" size={17} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{title}</Text>
          {sub ? <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{sub}</Text> : null}
        </View>
        {share ? <PostShareButtons get={share} /> : null}
        {learn ? <LearnLink href={learn} label={tx.learnThis} /> : null}
      </View>
      {children}
    </View>
  );
}

function useVerse(key: string, lang: string, reciter: Reciter) {
  const [d, setD] = useState<FeedVerse | null>(null);
  useEffect(() => {
    let ok = true;
    loadVerse(key, lang, reciter).then((x) => { if (ok) setD(x); }).catch(() => undefined);
    return () => { ok = false; };
  }, [key, lang, reciter]);
  return d;
}
const realWords = (ws: Word[]) => ws.filter((w) => w.char_type_name === "word" && !!w.translation?.text?.trim());

// ---------- quiz: what does this word mean? ----------
const STREAK_KEY = "qmc.feed-quiz-streak";
export const QuizPost = memo(function QuizPost(p: Common) {
  const tx = useFeedText();
  const t = useTheme();
  const key = p.item.slice(2);
  const [s] = key.split(":").map(Number);
  const v = useVerse(key, p.lang, p.reciter);
  // distractors from the next verse of the same surah (same data source)
  const nextKey = `${s}:${Math.min(VERSE_COUNTS[s - 1], Number(key.split(":")[1]) + 1)}`;
  const v2 = useVerse(nextKey === key ? `${s}:1` : nextKey, p.lang, p.reciter);
  const streak = useStored<number>(STREAK_KEY, 0);
  const [pick, setPick] = useState<number | null>(null);
  const q = useMemo(() => {
    if (!v || !v2) return null;
    const ws = realWords(v.words);
    if (!ws.length) return null;
    const target = ws[Math.floor(Math.random() * ws.length)];
    const right = target.translation!.text.trim();
    const pool = [...realWords(v2.words), ...ws].map((w) => w.translation!.text.trim()).filter((x, i, a) => x.toLowerCase() !== right.toLowerCase() && a.indexOf(x) === i);
    if (pool.length < 2) return null;
    const options = shuffle([right, ...shuffle(pool).slice(0, 2)]);
    return { word: target.text_uthmani, options, answer: options.indexOf(right) };
  }, [v, v2]);
  const choose = (i: number) => {
    if (pick !== null || !q) return;
    tick();
    setPick(i);
    writeJSON(STREAK_KEY, i === q.answer ? readJSON<number>(STREAK_KEY, 0) + 1 : 0, true);
    statQuiz(i === q.answer);
    if (i === q.answer) addLearnedWords(1);
  };
  const tone = toneOf(`quiz:${key}`);
  const ctx = useShareCtx();
  if (v && v2 && !q) return <View style={{ height: 1 }} />;
  const share = () => (q ? quizSpec(ctx, { question: tx.quizTitle, arabic: q.word, options: q.options, answer: q.answer, explain: `${p.nameOf(s)} · ${key}`, seed: key }) : null);
  return (
    <Frame learn={`/shams/${s}?v=${key.split(":")[1]}`} icon="cap" title={tx.quizTitle} sub={`${p.nameOf(s)} · ${key}`} width={p.width} tone={tone} share={share}>
      <PostPanel seed={tone.join("")} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 18, gap: 14 }}>
        <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 40, lineHeight: 76, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{q?.word ?? " "}</Text>
        {q?.options.map((o, i) => {
          const done = pick !== null;
          const ok = i === q.answer;
          const bg = done && ok ? "rgba(58,190,146,0.35)" : done && i === pick ? "rgba(176,64,56,0.35)" : "rgba(0,0,0,0.25)";
          return (
            <Pressable key={o} onPress={() => choose(i)} accessibilityRole="button" accessibilityState={{ selected: pick === i, disabled: done }}
              style={{ minHeight: 46, borderRadius: R.pill, paddingHorizontal: 16, justifyContent: "center", backgroundColor: bg, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: "#fff", textAlign: "center" }}>{o}</Text>
            </Pressable>
          );
        })}
        {pick !== null && q ? (
          <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.gold, textAlign: "center" }}>
            {pick === q.answer ? tx.quizRight : tx.quizWrong} · {fillText(tx.quizStreak, { n: streak })}
          </Text>
        ) : null}
      </PostPanel>
      <Text style={{ fontFamily: FONT.regular, fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", color: t.muted, marginTop: 10, paddingHorizontal: 14 }}>{tx.quizTitle}</Text>
    </Frame>
  );
});

// ---------- carousel: consecutive verses, swiped horizontally ----------
export const CarouselPost = memo(function CarouselPost(p: Common) {
  const tx = useFeedText();
  const t = useTheme();
  const [s, a] = p.item.slice(2).split(":").map(Number);
  const n = Math.min(5, VERSE_COUNTS[s - 1] - a + 1);
  const keys = useMemo(() => Array.from({ length: Math.max(1, n) }, (_, i) => `${s}:${a + i}`), [s, a, n]);
  const [page, setPage] = useState(0);
  const W = p.width;
  const tone = toneOf(`car:${s}:${a}`);
  const ctx = useShareCtx();
  const share = async () => { const d = await loadVerse(keys[page] ?? keys[0], p.lang, p.reciter); return verseSpec(ctx, d, p.nameOf(d.s)); };
  return (
    <Frame learn={`/shams/${s}?v=${a}`} icon="book" title={`${p.nameOf(s)} · ${s}:${a}–${a + keys.length - 1}`} sub={tx.carouselTitle} width={W} tone={tone} share={share}>
      <FlatList
        horizontal pagingEnabled showsHorizontalScrollIndicator={false} data={keys} keyExtractor={(k) => k}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / W))}
        renderItem={({ item }) => <Slide k={item} w={W} lang={p.lang} reciter={p.reciter} tone={tone} />}
        accessibilityLabel={tx.carouselTitle}
      />
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 10 }} accessibilityElementsHidden>
        {keys.map((k, i) => <View key={k} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i === page ? t.accent : t.line }} />)}
      </View>
    </Frame>
  );
});
function Slide({ k, w, lang, reciter, tone }: { k: string; w: number; lang: string; reciter: Reciter; tone: [string, string] }) {
  const v = useVerse(k, lang, reciter);
  return (
    <PostPanel seed={tone.join("")} style={{ width: w, height: w, padding: 22, justifyContent: "center", gap: 14 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2, color: stage.gold, textAlign: "center" }}>{k}</Text>
      <Text accessibilityLanguage="ar" numberOfLines={9} adjustsFontSizeToFit minimumFontScale={0.5} style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 44, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{v?.arabic ?? ""}</Text>
      <Text numberOfLines={6} style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.86)", textAlign: "center" }}>{v?.translation ?? ""}</Text>
    </PostPanel>
  );
}

// ---------- memorise: words covered, tap to reveal ----------
export const MemoPost = memo(function MemoPost(p: Common) {
  const tx = useFeedText();
  const shareCtx = useShareCtx();
  const key = p.item.slice(2);
  const [s] = key.split(":").map(Number);
  const v = useVerse(key, p.lang, p.reciter);
  const words = useMemo(() => (v ? v.words.filter((w) => w.char_type_name === "word") : []), [v]);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const all = words.length > 0 && shown.size >= words.length;
  const counted = useRef(false);
  const tone = toneOf(`memo:${key}`);
  return (
    <Frame learn={`/shams/${s}?v=${key.split(":")[1]}`} icon="eye" title={tx.memoTitle} sub={`${p.nameOf(s)} · ${key}`} width={p.width} tone={tone} share={v ? () => verseSpec(shareCtx, v, p.nameOf(s)) : undefined}>
      <PostPanel seed={tone.join("")} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 18, gap: 12 }}>
        <View style={{ flexDirection: "row-reverse", direction: "ltr", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
          {words.map((w, i) => {
            const on = shown.has(i);
            return (
              <Pressable key={`${w.position}`} onPress={() => { tick(); setShown((x) => new Set(x).add(i)); }} accessibilityRole="button" accessibilityLabel={on ? w.text_uthmani : fillText(tx.memoWord, { n: i + 1 })}
                style={{ minWidth: 44, minHeight: 44, paddingHorizontal: 8, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: on ? "transparent" : "rgba(255,255,255,0.14)" }}>
                <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 44, color: on ? "#fff" : "transparent" }}>{w.text_uthmani}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={() => { if (!all && !counted.current) { counted.current = true; addLearnedWords(words.length); } setShown(all ? new Set() : new Set(words.map((_, i) => i))); }} accessibilityRole="button" style={{ alignSelf: "center", paddingVertical: 8 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.gold }}>{all ? tx.memoHide : tx.memoReveal}</Text>
        </Pressable>
        {all && v ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.86)", textAlign: "center" }}>{v.translation}</Text> : null}
      </PostPanel>
    </Frame>
  );
});

// ---------- prayer: a gentle card when a prayer time has come ----------
/** the place of the Today screen's prayer times */
export function spotNow(): Spot {
  const cityId = readJSON<string>("tf:city", "makkah");
  return cityId === "mine" ? readJSON<Spot | null>("tf:myspot", null) ?? CITIES[0] : CITIES.find((c) => c.id === cityId) ?? CITIES[0];
}
/** the prayer whose time began within the last `minutes` (not sunrise), or null */
export function prayerNow(minutes = 30): { prayer: Prayer; at: Date } | null {
  try {
    const d = dayFor(spotNow(), new Date());
    const now = Date.now();
    for (const p of ["fajr", "dhuhr", "asr", "maghrib", "isha"] as Prayer[]) {
      const at = d.times[p];
      if (at && now >= at.getTime() && now - at.getTime() < minutes * 60000) return { prayer: p, at };
    }
  } catch { /* no prayer times */ }
  return null;
}
export const PrayerPost = memo(function PrayerPost({ item, width, lang, onOpen }: { item: string; width: number; lang: string; onOpen: () => void }) {
  const tx = useFeedText();
  const wp = useWebT("prayer");
  const prayer = item.slice(2) as Prayer;
  const at = useMemo(() => { try { return dayFor(spotNow(), new Date()).times[prayer]; } catch { return null; } }, [prayer]);
  const tone = toneOf(`prayer:${prayer}`);
  return (
    <Frame icon="mosque" title={wp(prayer)} sub={at ? fmtTime(at, spotNow().tz, lang) : undefined} width={width} tone={tone}>
      <PostPanel seed={tone.join("")} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 22, gap: 12, alignItems: "center" }}>
        <Icon name="mosque" color={stage.gold} size={34} />
        <Text style={{ fontFamily: FONT.display, fontSize: 20, color: "#fff", textAlign: "center" }}>{fillText(tx.prayerTitle, { prayer: wp(prayer) })}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.86)", textAlign: "center" }}>{tx.prayerLead}</Text>
        <Pressable onPress={onOpen} accessibilityRole="button" style={{ marginTop: 4, height: 44, paddingHorizontal: 20, borderRadius: R.pill, justifyContent: "center", borderWidth: 1, borderColor: stage.goldSoft }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: stage.gold }}>{tx.prayerOpen}</Text>
        </Pressable>
      </PostPanel>
    </Frame>
  );
});

/** "Learn this": the reader / the Shams lesson of the post; back returns to the feed at the same place (the feed
 *  stays mounted under the pushed screen) */
export function LearnLink({ href, label, kind = href.startsWith("/shams") ? "word" : "verse" }: { href: string; label: string; kind?: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => { engaged(kind, "learn"); router.push(href as Href); }} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}
      style={({ pressed }) => ({ height: 32, paddingHorizontal: 12, borderRadius: R.pill, justifyContent: "center", borderWidth: 1, borderColor: t.line, opacity: pressed ? 0.6 : 1 })}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.accent }}>{label}</Text>
    </Pressable>
  );
}

// ---------- more kinds (all from existing data): reciters, transliteration, word, chapters, calendar, radio, progress ----------
const hashOf = (x: string) => { let h = 0; for (let i = 0; i < x.length; i++) h = (h * 31 + x.charCodeAt(i)) | 0; return Math.abs(h); };

/** "r:S:A" the same verse by 2–3 voices; `voices` are already passed through allowedReciter by the feed */
export const RecitersPost = memo(function RecitersPost(p: Common & { voices: Reciter[]; engine: VerseEngine; active: boolean; sound: boolean }) {
  const tx = useFeedText();
  const shareCtx = useShareCtx();
  const key = p.item.slice(2);
  const [s] = key.split(":").map(Number);
  const picks = useMemo(() => {
    const pool = p.voices.filter((r, i, a) => a.findIndex((x) => x.folder === r.folder) === i);
    const start = hashOf(key) % Math.max(1, pool.length);
    return Array.from({ length: Math.min(3, pool.length) }, (_, i) => pool[(start + i) % pool.length]);
  }, [p.voices, key]);
  const v = useVerse(key, p.lang, picks[0] ?? p.reciter);
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => { if (!p.active || !p.sound) { if (playing) p.engine.stop(); setPlaying(null); } }, [p.active, p.sound]); // eslint-disable-line react-hooks/exhaustive-deps
  const play = (r: Reciter) => {
    tick();
    if (playing === r.folder) { p.engine.stop(); setPlaying(null); return; }
    setPlaying(r.folder);
    loadVerse(key, p.lang, r).then((d) => { p.engine.play(d.audio, { fallback: d.fallback, track: false }); }).catch(() => setPlaying(null));
  };
  const tone = toneOf(`rec:${key}`);
  if (picks.length < 2) return <View style={{ height: 1 }} />;
  return (
    <Frame learn={`/shams/${s}?v=${key.split(":")[1]}`} icon="radio" title={tx.recitersTitle} sub={`${p.nameOf(s)} · ${key}`} width={p.width} tone={tone} share={v ? () => verseSpec(shareCtx, v, p.nameOf(s)) : undefined}>
      <PostPanel seed={tone.join("")} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 18, gap: 12 }}>
        <Text accessibilityLanguage="ar" numberOfLines={6} adjustsFontSizeToFit minimumFontScale={0.6} style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 44, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{v?.arabic ?? " "}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgba(255,255,255,0.75)", textAlign: "center" }}>{tx.recitersLead}</Text>
        {picks.map((r) => {
          const on = playing === r.folder;
          return (
            <Pressable key={r.folder} onPress={() => play(r)} accessibilityRole="button" accessibilityState={{ selected: on }}
              style={{ minHeight: 48, borderRadius: R.pill, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: on ? "rgba(233,207,153,0.25)" : "rgba(0,0,0,0.25)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }}>
              <Icon name={on ? "pause" : "play"} color={stage.gold} size={16} />
              <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: "#fff" }}>{reciterName(r, p.lang)}</Text>
            </Pressable>
          );
        })}
      </PostPanel>
    </Frame>
  );
});

/** "t:S:A" the verse with the word-by-word transliteration of the Quran API */
export const TranslitPost = memo(function TranslitPost(p: Common) {
  const tx = useFeedText();
  const shareCtx = useShareCtx();
  const key = p.item.slice(2);
  const [s] = key.split(":").map(Number);
  const v = useVerse(key, p.lang, p.reciter);
  const tr = useMemo(() => (v ? v.words.filter((w) => w.char_type_name === "word").map((w) => w.transliteration?.text?.trim() ?? "").filter(Boolean).join(" ") : ""), [v]);
  const tone = toneOf(`tr:${key}`);
  if (v && !tr) return <View style={{ height: 1 }} />;
  return (
    <Frame learn={`/shams/${s}?v=${key.split(":")[1]}`} icon="book" title={tx.translitTitle} sub={`${p.nameOf(s)} · ${key}`} width={p.width} tone={tone} share={v ? () => verseSpec(shareCtx, v, p.nameOf(s)) : undefined}>
      <PostPanel seed={tone.join("")} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 20, gap: 14 }}>
        <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 46, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{v?.arabic ?? " "}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, lineHeight: 23, color: stage.gold, textAlign: "center", fontStyle: "italic" }}>{tr}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.86)", textAlign: "center" }}>{v?.translation ?? ""}</Text>
      </PostPanel>
    </Frame>
  );
});

/** "d:S:A" one word of the verse in depth: Arabic, transliteration, meaning, its place in the verse */
export const WordPost = memo(function WordPost(p: Common) {
  const tx = useFeedText();
  const shareCtx = useShareCtx();
  const key = p.item.slice(2);
  const [s] = key.split(":").map(Number);
  const v = useVerse(key, p.lang, p.reciter);
  const words = useMemo(() => (v ? v.words.filter((w) => w.char_type_name === "word") : []), [v]);
  const real = realWords(words);
  const w = real.length ? real[hashOf(key) % real.length] : null;
  const counted = useRef(false);
  const tone = toneOf(`word:${key}`);
  if (v && !w) return <View style={{ height: 1 }} />;
  const pos = w ? words.indexOf(w) + 1 : 0;
  return (
    <Frame learn={`/shams/${s}?v=${key.split(":")[1]}`} icon="cap" title={tx.wordDeepTitle} sub={`${p.nameOf(s)} · ${key}`} width={p.width} tone={tone} share={v ? () => verseSpec(shareCtx, v, p.nameOf(s)) : undefined}>
      <Pressable onPress={() => { if (!counted.current && w) { counted.current = true; addLearnedWords(1); tick(); } }} accessibilityRole="button">
        <PostPanel seed={tone.join("")} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 22, gap: 10, alignItems: "center" }}>
          <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 48, lineHeight: 90, color: "#fff", writingDirection: "rtl" }}>{w?.text_uthmani ?? " "}</Text>
          {w?.transliteration?.text ? <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: stage.gold, fontStyle: "italic" }}>{w.transliteration.text}</Text> : null}
          <Text style={{ fontFamily: FONT.display, fontSize: 20, color: "#fff", textAlign: "center" }}>{w?.translation?.text ?? ""}</Text>
          {w ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: "rgba(255,255,255,0.7)" }}>{fillText(tx.wordOf, { n: pos, total: words.length })}</Text> : null}
          <Text accessibilityLanguage="ar" numberOfLines={3} style={{ fontFamily: ARABIC_FONT, fontSize: 18, lineHeight: 34, color: "rgba(255,255,255,0.7)", textAlign: "center", writingDirection: "rtl", marginTop: 6 }}>{v?.arabic ?? ""}</Text>
        </PostPanel>
      </Pressable>
    </Frame>
  );
});

/** "k:<groupId>" a story group as numbered chapters; a tap opens the story viewer there */
export const ChaptersPost = memo(function ChaptersPost({ group, width, onOpen }: { group: StoryGroup; width: number; onOpen: (story: number) => void }) {
  const tx = useFeedText();
  const t = useTheme();
  const tone = toneOf(`chap:${group.id}`);
  return (
    <Frame icon="list" title={group.title} sub={tx.chaptersTitle} width={width} tone={tone}>
      <PostPanel seed={tone.join("")} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 16, gap: 8 }}>
        {group.arabic ? <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 42, color: stage.gold, textAlign: "center" }}>{group.arabic}</Text> : null}
        {group.stories.slice(0, 6).map((st, i) => (
          <Pressable key={st.id} onPress={() => { tick(); onOpen(i); }} accessibilityRole="button" accessibilityLabel={`${fillText(tx.chapterN, { n: i + 1 })}: ${st.title}`}
            style={({ pressed }) => ({ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, borderRadius: 12, backgroundColor: pressed ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.22)" })}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: stage.gold, width: 72 }}>{fillText(tx.chapterN, { n: i + 1 })}</Text>
            <Text numberOfLines={2} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14.5, color: "#fff" }}>{st.title}</Text>
            <Icon name="chevronRight" color="rgba(255,255,255,0.6)" size={16} />
          </Pressable>
        ))}
        {group.stories.length > 6 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "center" }}>+{group.stories.length - 6}</Text> : null}
      </PostPanel>
    </Frame>
  );
});

/** "cal:<day>" today's Hijri date (web/hijri, Umm al-Qura) and the next important day of the chosen tradition */
export const CalendarPost = memo(function CalendarPost({ width, lang }: { width: number; lang: string }) {
  const tx = useFeedText();
  const info = useMemo(() => {
    try {
      const today = todayUtc();
      const c = countdown(readTradition(), today, 1);
      const ct = calText(lang);
      return { date: fmtHijri(toHijri(today), lang), next: c ? { name: ct.ev(c.next.e.id).name, days: c.days } : null };
    } catch { return null; }
  }, [lang]);
  const tone = toneOf("calendar");
  if (!info) return <View style={{ height: 1 }} />;
  return (
    <Frame icon="calendar" title={tx.calendarTitle} width={width} tone={tone}>
      <Pressable onPress={() => router.push("/calendar" as Href)} accessibilityRole="button">
        <PostPanel seed={tone.join("")} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 24, gap: 12, alignItems: "center" }}>
          <Icon name="moon" color={stage.gold} size={32} />
          <Text style={{ fontFamily: FONT.display, fontSize: 26, color: "#fff", textAlign: "center" }}>{info.date}</Text>
          {info.next ? (
            <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: stage.gold, textAlign: "center" }}>
              {info.next.days === 0 ? fillText(tx.calendarToday, { name: info.next.name }) : fillText(tx.calendarNext, { name: info.next.name, n: info.next.days })}
            </Text>
          ) : null}
        </PostPanel>
      </Pressable>
    </Frame>
  );
});

/** "radio" the app's Quran radio (features/radio engine, first station) with an On air badge; stops when the post
 *  scrolls away or the feed's audio guard says no sound (tab switch, background) */
export const RadioPost = memo(function RadioPost({ width, active, sound, nameOf, onStart }: { width: number; active: boolean; sound: boolean; nameOf: (s: number) => string; onStart: () => void }) {
  const tx = useFeedText();
  const st = STATIONS[0];
  const playing = useRadioSelect((r) => r.started && r.playing && r.station.id === st.id);
  const now = useRadioSelect((r) => r.now);
  const mine = useRef(false);
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((x) => x + 1), 15000); return () => clearInterval(id); }, []);
  useEffect(() => { if ((!active || !sound) && mine.current) { mine.current = false; radio.stop(); } }, [active, sound]);
  useEffect(() => () => { if (mine.current) radio.stop(); }, []);
  const pos = playing ? now : livePos(st);
  const toggle = () => {
    tick();
    if (playing) { mine.current = false; radio.stop(); return; }
    onStart();
    mine.current = radio.chooseStation(st);
  };
  const tone = toneOf("radio");
  return (
    <Frame icon="radio" title={tx.radioTitle} sub={fillText(tx.radioNow, { surah: nameOf(pos.s), v: pos.v })} width={width} tone={tone}>
      <PostPanel seed={tone.join("")} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 24, gap: 14, alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, height: 26, borderRadius: R.pill, backgroundColor: "rgb(150,52,52)" }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff" }} />
          <Text style={{ fontFamily: FONT.bold, fontSize: 11.5, letterSpacing: 1, textTransform: "uppercase", color: "#fff" }}>{tx.onAir}</Text>
        </View>
        <Text style={{ fontFamily: FONT.display, fontSize: 22, color: "#fff", textAlign: "center" }}>{fillText(tx.radioNow, { surah: nameOf(pos.s), v: pos.v })}</Text>
        <Pressable onPress={toggle} accessibilityRole="button" accessibilityState={{ selected: playing }}
          style={({ pressed }) => ({ height: 48, paddingHorizontal: 22, borderRadius: R.pill, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: stage.gold, opacity: pressed ? 0.85 : 1 })}>
          <Icon name={playing ? "stop" : "play"} color={stage.bg} size={16} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: stage.bg }}>{playing ? tx.radioStop : tx.radioListen}</Text>
        </Pressable>
      </PostPanel>
    </Frame>
  );
});

/** "prog" the person's progress: quiz streak and words learned today (FeedStats) */
export const ProgressPost = memo(function ProgressPost({ width, lang }: { width: number; lang: string }) {
  const tx = useFeedText();
  const words = todayWords(useStored<FeedStats>(FEED_STATS_KEY, { day: 0, words: 0 }));
  const streak = useStored<number>(STREAK_KEY, 0);
  const nf = (n: number) => Intl.NumberFormat(lang).format(n);
  const tone = toneOf("progress");
  return (
    <Frame icon="trophy" title={tx.progressTitle} width={width} tone={tone}>
      <PostPanel seed={tone.join("")} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 22, gap: 12 }}>
        {words || streak ? (
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[[tx.progressWords, words, "cap"], [tx.progressStreak, streak, "flame"]].map(([l, n, ic]) => (
              <View key={l as string} style={{ flex: 1, alignItems: "center", gap: 6, padding: 14, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.22)" }}>
                <Icon name={ic as IconName} color={stage.gold} size={22} />
                <Text style={{ fontFamily: FONT.display, fontSize: 28, color: "#fff" }}>{nf(n as number)}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: "rgba(255,255,255,0.8)", textAlign: "center" }}>{(l as string).replace(/[:：]\s*\{n\}/, "").replace("{n}", "").trim()}</Text>
              </View>
            ))}
          </View>
        ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: "rgba(255,255,255,0.88)", textAlign: "center" }}>{tx.progressStart}</Text>}
      </PostPanel>
    </Frame>
  );
});
