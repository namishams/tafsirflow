import { statSave } from "./statsStore";
import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ActivityIndicator, Animated, Pressable, ScrollView, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { useWebT } from "@/i18n/web";
import { AR_RIGHT, ARABIC_FONT, FONT, stage } from "@/lib/theme";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { HEART, compact } from "@/features/extra/SocialBar";
import type { Reciter, Word } from "@/lib/quran";
import type { VerseEngine } from "@/features/quran/useVerseAudio";
import { FeedBackdrop, toneOf } from "./art";
import { loadVerse, type FeedVerse } from "./source";
import { fillText, useFeedText } from "./texts";
import { useVerseLike } from "./useLike";
import { Action, HeartBurst, useTapGestures } from "./ui";

// One verse page of the feed (and the "word of the verse" card): the verse full screen on its own slowly moving
// background, the recitation playing while the page is visible with the recited word lighting up (word timings
// from the verse data, like the reader), a thin progress bar, and the Instagram-like action column.
// Gestures like Reels: tap = pause / play, double tap = like (heart pop), touch and hold = 0.75× while held.

export type PageProps = {
  verseKey: string; variant: "verse" | "word"; width: number; height: number; active: boolean; near: boolean; sound: boolean;
  lang: string; reciter: Reciter; reciterLabel: string; surahName: string; topInset: number; bottomInset: number; reduce: boolean;
  engine: VerseEngine; onShare: (v: FeedVerse) => void;
};

function arabicSize(n: number, wide: boolean) {
  const k = wide ? 1.2 : 1;
  return Math.round((n < 60 ? 36 : n < 140 ? 31 : n < 280 ? 26 : n < 520 ? 22 : 19) * k);
}

/** the word of the verse: one word with a meaning (Quran.com word-by-word data), chosen the same way every time */
export function pickWord(words: Word[], key: string): Word | null {
  const cands = words.filter((w) => w.char_type_name === "word" && (w.translation?.text ?? "").trim().length >= 3 && w.text_uthmani.length >= 3);
  if (!cands.length) return null;
  let h = 0;
  for (const ch of key) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  const longest = [...cands].sort((a, b) => b.text_uthmani.length - a.text_uthmani.length).slice(0, 4);
  return longest[h % longest.length];
}

/** the verse word by word; while its recitation plays, the recited word lights up */
function Karaoke({ data, engine, live, size, color, mark }: { data: FeedVerse; engine: VerseEngine; live: boolean; size: number; color: string; mark?: number }) {
  const snap = useSyncExternalStore(live ? engine.subscribe : noopSub, live ? engine.getSnapshot : idle);
  const mine = live && (engine.url === data.audio) && !!snap.loadedUrl;
  // timings belong to the Quran.com recording (the same recording as the self-hosted file of a timed reciter)
  const cur = mine && data.segments.length ? data.segments.find((s) => snap.positionMs >= s.start && snap.positionMs < s.end)?.word ?? -1 : -1;
  const words = data.words.filter((w) => w.char_type_name === "word" || w.char_type_name === "end");
  const style = { fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.9, color, textAlign: AR_RIGHT, writingDirection: "rtl" as const };
  if (!words.length) return <Text accessibilityLanguage="ar" style={style}>{data.arabic}</Text>;
  return (
    <Text accessibilityLanguage="ar" accessibilityLabel={data.arabic} style={style}>
      {words.map((w, i) => {
        const on = w.char_type_name === "word" && w.position === cur;
        const marked = mark !== undefined && w.position === mark;
        return (
          <Text key={i} style={on ? { color: "rgb(233,207,153)", textShadowColor: "rgba(233,207,153,0.55)", textShadowRadius: 10 } : marked ? { color: "rgb(233,207,153)" } : undefined}>
            {w.text_uthmani}{i < words.length - 1 ? " " : ""}
          </Text>
        );
      })}
    </Text>
  );
}
const noopSub = () => () => undefined;
const IDLE = { playing: false, positionMs: 0, durationMs: 0, ended: false, loadedUrl: "", fallback: false };
const idle = () => IDLE;

function ProgressBar({ engine, url, top }: { engine: VerseEngine; url: string; top: number }) {
  const snap = useSyncExternalStore(engine.subscribe, engine.getSnapshot);
  const pct = engine.url === url && snap.durationMs > 0 ? Math.min(1, snap.positionMs / snap.durationMs) : 0;
  return (
    <View pointerEvents="none" accessibilityElementsHidden style={{ position: "absolute", left: 14, right: 14, top, height: 2.5, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
      <View style={{ width: `${pct * 100}%`, height: "100%", backgroundColor: stage.gold }} />
    </View>
  );
}

export const FeedPage = memo(function FeedPage(p: PageProps) {
  const tx = useFeedText();
  const ws = useWebT("social");
  const wp = useWebT("player");
  const [data, setData] = useState<FeedVerse | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [boxH, setBoxH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (!p.near || data) return;
    let ok = true;
    setFailed(false);
    loadVerse(p.verseKey, p.lang, p.reciter).then((d) => { if (ok) setData(d); }).catch(() => { if (ok) setFailed(true); });
    return () => { ok = false; };
  }, [p.near, p.verseKey, p.lang, p.reciter, attempt, data]);
  const sig = `${p.lang}|${p.reciter.folder}`;
  const lastSig = useRef(sig);
  useEffect(() => { if (lastSig.current !== sig) { lastSig.current = sig; setData(null); } }, [sig]);

  const a = p.engine;
  const start = (d: FeedVerse) => a.play(d.audio, { fallback: d.fallback || undefined, title: `${p.surahName} ${d.key}`, artist: p.reciterLabel });
  useEffect(() => {
    if (!p.active || !data) return;
    if (!p.sound) { a.pause(); return; }
    const snap = a.getSnapshot();
    if (a.url === data.audio && !snap.ended && snap.loadedUrl) a.resume();
    else start(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.active, p.sound, data]);

  const marks = useStored<string[]>("tf:bookmarks", []);
  const saved = marks.includes(p.verseKey);
  const toggleSave = () => {
    if (!saved) statSave();
    const cur = readJSON<string[]>("tf:bookmarks", []);
    writeJSON("tf:bookmarks", cur.includes(p.verseKey) ? cur.filter((k) => k !== p.verseKey) : [...cur, p.verseKey]);
  };
  const like = useVerseLike(p.verseKey, p.active);
  const pop = useRef(new Animated.Value(1)).current;
  const popHeart = () => { if (!p.reduce) Animated.sequence([Animated.timing(pop, { toValue: 1.3, duration: 120, useNativeDriver: true }), Animated.timing(pop, { toValue: 1, duration: 160, useNativeDriver: true })]).start(); };
  const onLike = () => { if (!like.liked) popHeart(); void like.toggle(); };

  const togglePlay = () => {
    if (!data) return;
    const snap = a.getSnapshot();
    if (snap.playing && a.url === data.audio) a.pause();
    else if (a.url === data.audio && snap.loadedUrl && !snap.ended) a.resume();
    else start(data);
  };
  const gestures = useTapGestures({
    onTap: togglePlay,
    onDouble: () => { setBurst((n) => n + 1); if (!like.liked) { popHeart(); void like.toggle(); } },
    onHoldStart: () => a.setRate(0.75),
    onHoldEnd: () => a.setRate(1),
  });

  const [s, v] = p.verseKey.split(":");
  const wide = p.width >= 700;
  const ref = `${p.surahName} · ${p.verseKey}`;
  const scrollable = contentH > boxH + 2;
  const tone = toneOf(p.verseKey);
  const word = useMemo(() => (p.variant === "word" && data ? pickWord(data.words, data.key) : null), [p.variant, data]);
  const showWord = p.variant === "word" && !!word;
  const arSize = data ? (showWord ? Math.min(22, arabicSize(data.arabic.length, wide)) : arabicSize(data.arabic.length, wide)) : 30;

  return (
    <View style={{ width: p.width, height: p.height, overflow: "hidden" }}>
      <FeedBackdrop tone={tone} width={p.width} height={p.height} animate={p.active && !p.reduce} still={p.reduce} />
      {p.active && data ? <ProgressBar engine={a} url={data.audio} top={p.topInset + 56} /> : null}
      <View style={{ flex: 1, paddingTop: p.topInset + 70, paddingBottom: p.bottomInset + 28, flexDirection: "row" }}>
        <View style={{ flex: 1, alignItems: "center" }} onLayout={(e) => setBoxH(e.nativeEvent.layout.height)}>
          <ScrollView style={{ width: "100%", maxWidth: 680 }} scrollEnabled={scrollable} showsVerticalScrollIndicator={scrollable} nestedScrollEnabled
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingStart: 22, paddingEnd: 12, paddingVertical: 8 }} onContentSizeChange={(_, h) => setContentH(h)}>
            <Pressable {...gestures} accessible={false}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: stage.gold, marginBottom: 18 }} accessibilityRole="header">
                {showWord ? `${tx.wordTitle} · ${ref}` : ref}
              </Text>
              {data ? (
                <>
                  {showWord && word ? (
                    <View style={{ marginBottom: 26 }}>
                      <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: wide ? 76 : 62, lineHeight: (wide ? 76 : 62) * 1.7, color: "rgb(233,207,153)", textAlign: AR_RIGHT, writingDirection: "rtl" }}>{word.text_uthmani}</Text>
                      {word.transliteration?.text ? <Text style={{ fontFamily: FONT.italic, fontSize: 17, color: stage.textSoft, marginTop: 2 }}>{word.transliteration.text}</Text> : null}
                      <Text style={{ fontFamily: FONT.display, fontSize: wide ? 30 : 26, lineHeight: wide ? 36 : 31, color: "#fff", marginTop: 8 }}>{word.translation?.text}</Text>
                    </View>
                  ) : null}
                  <Karaoke data={data} engine={a} live={p.active} size={arSize} color={showWord ? "rgba(255,255,255,0.85)" : "#fff"} mark={showWord ? word?.position : undefined} />
                  {data.translation ? (
                    <Text style={{ fontFamily: FONT.regular, fontSize: wide ? 19 : data.translation.length > 400 || showWord ? 15 : 17, lineHeight: wide ? 29 : data.translation.length > 400 || showWord ? 23 : 26, color: "rgba(255,255,255,0.88)", marginTop: 20 }}>{data.translation}</Text>
                  ) : null}
                </>
              ) : failed ? (
                <View style={{ gap: 12, alignItems: "flex-start" }}>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: stage.textSoft }}>{tx.offline}</Text>
                  <Pressable onPress={() => setAttempt((n) => n + 1)} accessibilityRole="button" style={{ paddingHorizontal: 16, height: 40, justifyContent: "center", borderRadius: 999, borderWidth: 1, borderColor: stage.goldSoft }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#fff" }}>{tx.retry}</Text>
                  </Pressable>
                </View>
              ) : (
                <ActivityIndicator color={stage.gold} accessibilityLabel={tx.loading} style={{ alignSelf: "flex-start" }} />
              )}
            </Pressable>
          </ScrollView>
          <Text numberOfLines={1} style={{ alignSelf: "stretch", paddingHorizontal: 22, marginTop: 10, fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted }}>{fillText(tx.reciter, { name: p.reciterLabel })}</Text>
        </View>

        <View style={{ width: 72, justifyContent: "flex-end", alignItems: "center", gap: 16, paddingEnd: 6 }}>
          <Action icon="heart" filled={like.liked} color={like.liked ? HEART : "#fff"} label={like.count !== null ? compact(like.count, p.lang) : ws("like")} a11y={`${ws("like")}${like.count !== null ? `, ${like.count}` : ""}`} selected={like.liked} onPress={onLike} scale={pop} />
          <Action icon="bookmark" filled={saved} color={saved ? stage.gold : "#fff"} label={saved ? tx.saved : tx.save} a11y={saved ? wp("bookmarked") : wp("bookmark")} selected={saved} onPress={toggleSave} />
          <Action icon="send" color="#fff" label={ws("share")} a11y={ws("share")} onPress={() => data && p.onShare(data)} disabled={!data} />
          <Action icon="book" color="#fff" label={tx.reader} a11y={tx.reader} onPress={() => router.push(`/quran/${s}?v=${v}` as Href)} />
          <Action icon="cap" color="#fff" label={tx.learn} a11y={tx.learn} onPress={() => router.push(`/shams/${s}?v=${v}` as Href)} />
        </View>
      </View>
      <HeartBurst n={burst} reduce={p.reduce} />
    </View>
  );
});
