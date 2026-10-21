import { memo, useEffect, useState, useSyncExternalStore } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { StarLattice } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { useLang } from "@/i18n";
import { ARABIC_FONT, FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { audioUrl } from "@/lib/quran";
import { VerseEngine } from "@/features/quran/useVerseAudio";
import { allowedReciter } from "@/features/quran/reciter";
import { MomentCard } from "@/features/sijill/Moments";
import type { Moment } from "@/features/sijill/api";
import { GoldFrame } from "./ornament";
import { toneOf } from "./art";
import { tick } from "./haptics";
import { engaged } from "./interest";
import { LIB } from "./library";
import type { KnowItem, KnowKind } from "./knowledge";
import { loadVerse, type FeedVerse } from "./source";
import { statQuiz } from "./statsStore";
import { useKnowText, type KnowText } from "./knowTexts";
import { PostShareButtons, knowSpec, useShareCtx } from "@/features/share/feedShare";
import { PostPanel } from "@/features/share/ShareTemplates";
import { useFeedVoice } from "./voice";

// The knowledge posts (knowledge.ts) in the feed's emerald and gold: a card in Home (header, framed card, CTA, source)
// and a full-screen page in Reels. Verses come only from the Quran data (loadVerse), never from the item. Exam
// questions are answered by a tap with the explanation below; grammar posts ask to find the word in the verse; maqam
// posts play a verse with the learner's (allowed) reciter. Every post ends with one gold CTA into the right screen.

const ICON: Record<KnowKind, IconName> = {
  "kn-course": "cap", "kn-names": "starBig", "kn-tadabbur": "book", "kn-exam": "trophy", "kn-faculty": "mosque", "kn-adab": "pen", "kn-next": "compass",
  "kn-tajweed": "volume", "kn-maqam": "speaker", "kn-arabic-word": "pen", "kn-grammar": "list", "kn-abrahamic": "globe", "kn-haramain": "mosque", "kn-nahj": "note", "kn-moment": "heart",
};
export function knowKindLabel(kt: KnowText, k: KnowKind): string {
  return ({ "kn-course": kt.course, "kn-names": kt.course, "kn-tadabbur": kt.tadabbur, "kn-exam": kt.exam, "kn-faculty": kt.madrasa, "kn-adab": kt.adab, "kn-next": kt.nextStep,
    "kn-tajweed": kt.tajweed, "kn-maqam": kt.maqam, "kn-arabic-word": kt.arabicWord, "kn-grammar": kt.grammar, "kn-abrahamic": kt.abrahamic, "kn-haramain": kt.haramain,
    "kn-nahj": kt.nahj, "kn-moment": kt.moment } as Record<KnowKind, string>)[k];
}
export const knowItemOf = (id: string): KnowItem | null => { const p = LIB.get(id); return p && (p.kind as string).startsWith("kn-") ? (p.items[0] as KnowItem) : null; };
export const isKnowId = (id: string) => !!knowItemOf(id);

const words = (v: FeedVerse) => v.words.filter((w) => w.char_type_name === "word");

/** the verse of a post from the Quran data; highlighted word positions, or "find the word" taps */
function VerseBlock({ verseKey, mark, find, full, onFound }: { verseKey: string; mark?: number[]; find?: boolean; full?: boolean; onFound?: (ok: boolean) => void }) {
  const { lang } = useLang();
  const { reciter } = useFeedVoice();
  const kt = useKnowText();
  const [v, setV] = useState<FeedVerse | null>(null);
  const [tapped, setTapped] = useState<number | null>(null);
  useEffect(() => {
    let ok = true;
    loadVerse(verseKey, lang, reciter).then((d) => { if (ok) setV(d); }).catch(() => undefined);
    return () => { ok = false; };
  }, [verseKey, lang, reciter]);
  const size = full ? 26 : 22;
  if (!v) return <View style={{ height: size * 2 }} />;
  const ws = words(v);
  const solved = tapped !== null && !!mark?.includes(tapped);
  return (
    <View style={{ gap: 6 }}>
      {find && mark?.length ? (
        <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center", gap: 4 }}>
          {ws.map((w) => {
            const hit = tapped !== null && mark.includes(w.position) && (solved || tapped === w.position);
            const miss = tapped === w.position && !mark.includes(w.position);
            return (
              <Pressable key={w.position} disabled={solved} onPress={() => { tick(); setTapped(w.position); onFound?.(mark.includes(w.position)); }} accessibilityRole="button" accessibilityLabel={w.transliteration?.text ?? w.text_uthmani}
                style={{ paddingHorizontal: 6, borderRadius: 10, backgroundColor: hit ? "rgba(58,190,146,0.35)" : miss ? "rgba(150,52,52,0.45)" : "rgba(0,0,0,0.18)" }}>
                <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.9, color: "#fff" }}>{w.text_uthmani}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text accessibilityLanguage="ar" numberOfLines={full ? 8 : 6} adjustsFontSizeToFit minimumFontScale={0.6} style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.9, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>
          {mark?.length ? ws.map((w, i) => <Text key={w.position} style={mark.includes(w.position) ? { color: stage.gold } : undefined}>{i ? " " : ""}{w.text_uthmani}</Text>) : v.arabic}
        </Text>
      )}
      {v.translation && !find ? <Text numberOfLines={full ? 5 : 3} style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: "rgba(255,255,255,0.72)", textAlign: "center" }}>{v.translation.replace(/<[^>]+>/g, "")}</Text> : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 0.6, color: "rgba(214,180,108,0.9)", textAlign: "center" }}>Quran {verseKey}{tapped !== null && find ? ` · ${solved ? kt.right : kt.wrong}` : ""}</Text>
    </View>
  );
}

/** an exam-centre question: tap an option, then the explanation */
function Quiz({ it, full }: { it: KnowItem; full?: boolean }) {
  const kt = useKnowText();
  const [pick, setPick] = useState<number | null>(null);
  const q = it.quiz!;
  const choose = (i: number) => {
    if (pick !== null) return;
    tick();
    setPick(i);
    statQuiz(i === q.answer);
    engaged(it.kind, "like");
    engaged(`sub:${it.subject}`, "like");
  };
  return (
    <View style={{ gap: 9 }}>
      {q.options.map((o, i) => {
        const done = pick !== null;
        const ok = i === q.answer;
        const bg = done && ok ? "rgba(58,190,146,0.35)" : done && i === pick ? "rgba(150,52,52,0.45)" : "rgba(0,0,0,0.25)";
        return (
          <Pressable key={`${i}-${o}`} onPress={() => choose(i)} accessibilityRole="button" accessibilityState={{ selected: pick === i, disabled: done }}
            style={{ minHeight: full ? 50 : 44, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, justifyContent: "center", backgroundColor: bg, borderWidth: 1, borderColor: done && ok ? "rgba(58,190,146,0.7)" : "rgba(255,255,255,0.18)" }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: full ? 15.5 : 14.5, lineHeight: 20, color: "#fff", textAlign: "center" }}>{o}</Text>
          </Pressable>
        );
      })}
      {pick !== null ? (
        <View accessibilityLiveRegion="polite" style={{ gap: 4, marginTop: 4 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.gold, textAlign: "center" }}>{pick === q.answer ? kt.right : kt.wrong}</Text>
          {q.explain ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: "rgba(255,255,255,0.88)" }}><Text style={{ fontFamily: FONT.semibold }}>{kt.explanation}: </Text>{q.explain}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

/** maqam posts: a verse with the learner's allowed reciter; stops when the post leaves the screen */
function Listen({ verseKey, active }: { verseKey: string; active: boolean }) {
  const kt = useKnowText();
  const voice = useFeedVoice();
  const [engine] = useState(() => new VerseEngine());
  useEffect(() => () => engine.dispose(), [engine]);
  const snap = useSyncExternalStore(engine.subscribe, engine.getSnapshot);
  useEffect(() => { if (!active) engine.stop(); }, [active, engine]);
  const r = allowedReciter(voice.reciter, voice.pro, voice.all);
  const [s, v] = verseKey.split(":").map(Number);
  const toggle = () => { tick(); if (snap.playing) engine.stop(); else engine.play(audioUrl(r, s, v), { track: false }); };
  return (
    <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={snap.playing ? kt.stop : kt.listen}
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: "center", height: 38, paddingHorizontal: 16, borderRadius: R.pill, borderWidth: 1, borderColor: stage.gold, backgroundColor: "rgba(0,0,0,0.2)" }}>
      <Icon name={snap.playing ? "stop" : "play"} color={stage.gold} size={14} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.cream }}>{snap.playing ? kt.stop : kt.listen} · {kt.listenWith.replace("{name}", r.name)}</Text>
    </Pressable>
  );
}

function Cta({ it, full }: { it: KnowItem; full?: boolean }) {
  const kt = useKnowText();
  const go = () => { tick(); engaged(it.kind, "learn"); engaged(`sub:${it.subject}`, "learn"); router.push(it.href as Href); };
  return (
    <Pressable onPress={go} accessibilityRole="button" accessibilityHint={it.title} style={({ pressed }) => ({ alignSelf: full ? "stretch" : "center", marginTop: full ? 18 : 12, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: full ? 50 : 44, paddingHorizontal: 22, borderRadius: R.pill, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: full ? 16 : 14.5, color: goldButton.text }}>{kt[it.cta]}</Text>
        <Icon name="chevronRight" color={goldButton.text} size={15} />
      </LinearGradient>
    </Pressable>
  );
}

/** the inner content shared by card and page */
function Body({ it, full, active }: { it: KnowItem; full?: boolean; active: boolean }) {
  const kt = useKnowText();
  const [m, setM] = useState<Moment | undefined>(it.moment);
  if (it.kind === "kn-moment" && m) return <View style={{ borderRadius: R.card, overflow: "hidden" }}><MomentCard m={m} onChange={setM} /></View>;
  return (
    <View style={{ gap: full ? 14 : 11 }}>
      {it.arabic ? <Text accessibilityLanguage="ar" numberOfLines={2} adjustsFontSizeToFit style={{ fontFamily: ARABIC_FONT, fontSize: full ? 46 : 36, lineHeight: full ? 84 : 66, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{it.arabic}</Text> : null}
      {it.verse && !it.quiz ? <VerseBlock verseKey={it.verse} mark={it.words} find={it.find} full={full} onFound={(ok) => { if (ok) { engaged(it.kind, "like"); statQuiz(true); } }} /> : null}
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: full ? 23 : 18.5, lineHeight: full ? 30 : 25, color: stage.gold, textAlign: it.quiz ? "left" : "center" }}>{it.title}</Text>
      {it.quiz && it.verse ? <VerseBlock verseKey={it.verse} mark={it.words} full={full} /> : null}
      {it.body ? <Text numberOfLines={full ? 12 : 8} style={{ fontFamily: FONT.regular, fontSize: full ? 15.5 : 14.5, lineHeight: full ? 24 : 21.5, color: "rgba(255,255,255,0.92)", textAlign: it.bullets?.length ? "left" : "center" }}>{it.body}</Text> : null}
      {it.bullets?.length ? (
        <View style={{ gap: 7 }}>
          {it.bullets.map((b, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 9, alignItems: "flex-start" }}>
              <View style={{ width: 7, height: 7, marginTop: 7, transform: [{ rotate: "45deg" }], backgroundColor: stage.gold }} />
              <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: full ? 14.5 : 13.5, lineHeight: full ? 22 : 20, color: "rgba(255,255,255,0.86)" }}>{b}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {it.quiz ? <Quiz it={it} full={full} /> : null}
      {it.listen && it.verse ? <Listen verseKey={it.verse} active={active} /> : null}
      {it.note || it.madhhab ? (
        <View style={{ borderLeftWidth: 2, borderLeftColor: stage.goldSoft, paddingLeft: 10, gap: 4 }}>
          {it.note ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.7)" }}>{it.note}</Text> : null}
          {it.madhhab ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.7)" }}>{kt.madhhab}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function Header({ it, light }: { it: KnowItem; light?: boolean }) {
  const t = useTheme();
  const kt = useKnowText();
  const ctx = useShareCtx();
  const { reciter } = useFeedVoice();
  // the share image: the post's template (quiz with its answer, name, insight; the verse text from the Quran data)
  const getShare = async () => {
    const v = it.verse ? await loadVerse(it.verse, ctx.lang, reciter).catch(() => null) : null;
    engaged(it.kind, "share");
    return knowSpec(ctx, it, knowKindLabel(kt, it.kind), v ? { arabic: v.arabic, translation: v.translation } : null);
  };
  const shareable = it.kind !== "kn-moment" || !!it.moment?.own;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, height: 56 }}>
      <LinearGradient colors={toneOf(`lib:${it.kind}`)} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: stage.goldSoft }}>
        <Icon name={ICON[it.kind]} color="rgb(233,207,153)" size={17} />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, color: light ? "#fff" : t.ink }}>{knowKindLabel(kt, it.kind)}</Text>
        {it.eyebrow ? <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: light ? "rgba(255,255,255,0.65)" : t.muted }}>{it.eyebrow}</Text> : null}
      </View>
      {shareable ? <PostShareButtons get={getShare} onDark={light} /> : null}
    </View>
  );
}

function Foot({ it, light }: { it: KnowItem; light?: boolean }) {
  const t = useTheme();
  const kt = useKnowText();
  const color = light ? "rgba(255,255,255,0.6)" : t.muted;
  return (
    <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 16, color, paddingHorizontal: 14, marginTop: 8 }}>
      {it.source}{it.review ? ` · ${kt.review}` : ""}
    </Text>
  );
}

/** Home and Explore-opened cards; `onDark` inside the Reels view */
export const KnowledgePost = memo(function KnowledgePost({ id, width, onDark, active = true }: { id: string; width: number; onDark?: boolean; active?: boolean }) {
  const it = knowItemOf(id);
  if (!it) return <View style={{ height: 1 }} />;
  return (
    <View style={{ width, alignSelf: "center", paddingBottom: 16 }}>
      <Header it={it} light={onDark} />
      <PostPanel seed={it.id} style={{ marginHorizontal: 12, borderRadius: R.card, padding: 22, paddingVertical: 26 }}>
        <Body it={it} active={active} />
        {it.kind !== "kn-moment" ? <Cta it={it} /> : null}
      </PostPanel>
      {it.kind === "kn-moment" ? <Cta it={it} /> : null}
      <Foot it={it} light={onDark} />
    </View>
  );
});

/** the Reels page: full screen, the post's tone from edge to edge, the CTA at the bottom */
export const KnowledgePage = memo(function KnowledgePage({ id, width, height, topInset, bottomInset, active }: { id: string; width: number; height: number; topInset: number; bottomInset: number; active: boolean }) {
  const it = knowItemOf(id);
  if (!it) return <View style={{ width, height, backgroundColor: stage.bg }} />;
  const w = Math.min(width, 560);
  return (
    <LinearGradient colors={[toneOf(it.id)[0], stage.deep]} style={{ width, height, overflow: "hidden" }}>
      <StarLattice opacity={0.06} />
      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingTop: topInset + 8, paddingBottom: bottomInset + 24 }}>
        <View style={{ width: w, alignSelf: "center" }}>
          <Header it={it} light />
          <View style={{ marginHorizontal: 18, marginTop: 6, padding: 22, borderRadius: R.card, borderWidth: 1, borderColor: stage.goldSoft, backgroundColor: "rgba(0,0,0,0.18)", overflow: "hidden" }}>
            <GoldFrame inset={6} />
            <Body it={it} full active={active} />
          </View>
          <View style={{ paddingHorizontal: 18 }}><Cta it={it} full /></View>
          <Foot it={it} light />
        </View>
      </ScrollView>
    </LinearGradient>
  );
});

