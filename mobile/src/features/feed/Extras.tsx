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
import { loadVerse, shuffle, type FeedVerse } from "./source";
import { fillText, useFeedText } from "./texts";
import { addLearnedWords } from "./seen";

// More post kinds of the Home feed, built only from data the app already has: the Quran API's verses and word data
// (quiz, carousel, memorise) and the prayer times of the app's own calculation (web/prayer.ts). Nothing typed by hand.
//   "q:S:A" word quiz · "c:S:A" carousel of the verses A.. (3–5) · "m:S:A" memorise (words covered) · "p:<prayer>" prayer

type Common = { item: string; width: number; lang: string; reciter: Reciter; nameOf: (s: number) => string; reduce: boolean };

function Frame({ icon, title, sub, children, width, tone, learn }: { icon: IconName; title: string; sub?: string; children: React.ReactNode; width: number; tone: [string, string]; learn?: string }) {
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
    if (i === q.answer) addLearnedWords(1);
  };
  const tone = toneOf(`quiz:${key}`);
  if (v && v2 && !q) return <View style={{ height: 1 }} />;
  return (
    <Frame learn={`/shams/${s}?v=${key.split(":")[1]}`} icon="cap" title={tx.quizTitle} sub={`${p.nameOf(s)} · ${key}`} width={p.width} tone={tone}>
      <LinearGradient colors={tone} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 18, gap: 14 }}>
        <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 40, lineHeight: 76, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{q?.word ?? " "}</Text>
        {q?.options.map((o, i) => {
          const done = pick !== null;
          const ok = i === q.answer;
          const bg = done && ok ? "rgba(58,190,146,0.35)" : done && i === pick ? "rgba(220,80,80,0.35)" : "rgba(0,0,0,0.25)";
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
      </LinearGradient>
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
  return (
    <Frame learn={`/quran/${s}?v=${a}`} icon="book" title={`${p.nameOf(s)} · ${s}:${a}–${a + keys.length - 1}`} sub={tx.carouselTitle} width={W} tone={tone}>
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
    <LinearGradient colors={tone} style={{ width: w, height: w, padding: 22, justifyContent: "center", gap: 14 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2, color: stage.gold, textAlign: "center" }}>{k}</Text>
      <Text accessibilityLanguage="ar" numberOfLines={9} adjustsFontSizeToFit minimumFontScale={0.5} style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 44, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{v?.arabic ?? ""}</Text>
      <Text numberOfLines={6} style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.86)", textAlign: "center" }}>{v?.translation ?? ""}</Text>
    </LinearGradient>
  );
}

// ---------- memorise: words covered, tap to reveal ----------
export const MemoPost = memo(function MemoPost(p: Common) {
  const tx = useFeedText();
  const key = p.item.slice(2);
  const [s] = key.split(":").map(Number);
  const v = useVerse(key, p.lang, p.reciter);
  const words = useMemo(() => (v ? v.words.filter((w) => w.char_type_name === "word") : []), [v]);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const all = words.length > 0 && shown.size >= words.length;
  const counted = useRef(false);
  const tone = toneOf(`memo:${key}`);
  return (
    <Frame learn={`/shams/${s}?v=${key.split(":")[1]}`} icon="eye" title={tx.memoTitle} sub={`${p.nameOf(s)} · ${key}`} width={p.width} tone={tone}>
      <LinearGradient colors={tone} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 18, gap: 12 }}>
        <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
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
      </LinearGradient>
    </Frame>
  );
});

// ---------- prayer: a gentle card when a prayer time has come ----------
/** the place of the Today screen's prayer times */
function spotNow(): Spot {
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
      <LinearGradient colors={tone} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 22, gap: 12, alignItems: "center" }}>
        <Icon name="mosque" color={stage.gold} size={34} />
        <Text style={{ fontFamily: FONT.display, fontSize: 20, color: "#fff", textAlign: "center" }}>{fillText(tx.prayerTitle, { prayer: wp(prayer) })}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.86)", textAlign: "center" }}>{tx.prayerLead}</Text>
        <Pressable onPress={onOpen} accessibilityRole="button" style={{ marginTop: 4, height: 44, paddingHorizontal: 20, borderRadius: R.pill, justifyContent: "center", borderWidth: 1, borderColor: stage.goldSoft }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: stage.gold }}>{tx.prayerOpen}</Text>
        </Pressable>
      </LinearGradient>
    </Frame>
  );
});

/** "Learn this": the reader / the Shams lesson of the post; back returns to the feed at the same place (the feed
 *  stays mounted under the pushed screen) */
export function LearnLink({ href, label }: { href: string; label: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => router.push(href as Href)} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}
      style={({ pressed }) => ({ height: 32, paddingHorizontal: 12, borderRadius: R.pill, justifyContent: "center", borderWidth: 1, borderColor: t.line, opacity: pressed ? 0.6 : 1 })}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.accent }}>{label}</Text>
    </Pressable>
  );
}
