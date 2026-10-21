import { memo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { ARABIC_FONT, FONT, R, goldButton, useTheme, AR_RIGHT } from "@/lib/theme";
import { Icon, type IconName } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import type { Verse } from "@/lib/quran";
import type { Rating } from "@/web/learning";
import { toAr } from "@/features/quran/useVerseAudio";
import { ArabicWord, coverOf, type Cover } from "@/features/quran/VerseWords";
import { SocialBar } from "@/features/extra/SocialBar";
import { ReciteCheck } from "@/features/extra/ReciteCheck";
import { FrameCorners, VerseStar } from "./ornaments";
import { MemoControls } from "./MemoControls";
import { useReaderT } from "./texts";
import type { Level, Memo, Tool } from "./memo";

// One verse card of the website's Player.tsx: quiet and compact while inactive; the active verse is framed in gold with
// corner brackets and carries the word-by-word text (the recited word lit), the memorising modes (Read · Practise with
// levels 1–5 · Test · Listen & repeat · Random check), reveal and self-rating, recite & check, bookmark, note, copy, share,
// play, focus mode, likes and comments, Tafsir and the Shams Method. With "cover every verse" (st.hide on quiet cards)
// every card is covered too; tapping uncovers it. Covered words: tap reveals that word (and plays it), long-press the verse.
// Kids mode (website Player.tsx): only Read and Listen & repeat; no note, copy, share, Shams Method, recite check, social bar or tafsir.
export type Hide = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 all, 1 every 2nd word, 2 hard, 3 first letters, 4 random, 5 soft, 6 test word by word
export type CardHandlers = {
  goTo: (i: number) => void;
  playVerse: (i: number) => void;
  toggleMark: (key: string) => void;
  openNote: (key: string | null) => void;
  saveNote: (key: string, text: string) => void;
  setTool: (t: Tool) => void;
  setLevel: (l: Level) => void;
  shuffle: () => void;
  reveal: () => void;
  revealWord: (wi: number, pos: number) => void;
  markWord: (ok: boolean) => void;
  rate: (r: Rating) => void;
  tafsir: (v: Verse) => void;
  shams: (v: Verse) => void;
  share: (v: Verse) => void;
  copy: (v: Verse) => void;
  playWord: (key: string, pos: number) => void;
  /** learn mode: next verse */
  cont: () => void;
  /** recite check: the reciter from the start / pause the reader */
  replay: () => void;
  pause: () => void;
  /** random check: another verse */
  nextCheck: () => void;
  testAgain: () => void;
  next: () => void;
  focus: () => void;
  /** the active card's size changed (auto-follow re-aligns it) */
  layout: (i: number) => void;
};
export type TestDone = { ok: number; total: number; pct: number; days: number };
export type CardState = {
  hide: Hide; memo: Memo; revealed: boolean; seed: number; testPos: number; testMarks: Record<number, boolean>; shown: number[]; activeWord: number | null;
  playing: boolean; wordOn: string | null; waiting: boolean; turn: boolean; testDone: TestDone | null; reduce: boolean;
};
export const IDLE: CardState = { hide: 0, memo: { tool: "read", level: 1, all: false }, revealed: false, seed: 1, testPos: 0, testMarks: {}, shown: [], activeWord: null, playing: false, wordOn: null, waiting: false, turn: false, testDone: null, reduce: false };

const SunMark = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Circle cx={12} cy={12} r={5.5} fill={color} /><Circle cx={12} cy={12} r={9.5} fill="none" stroke={color} strokeWidth={1.6} strokeOpacity={0.55} /></Svg>
);

function ActionIcon({ icon, label, onPress, color, filled }: { icon: IconName; label: string; onPress: () => void; color: string; filled?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={3}
      style={({ pressed }) => ({ width: 40, height: 44, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? t.bg : "transparent" })}>
      <Icon name={icon} color={color} size={18} filled={filled} />
    </Pressable>
  );
}

function GoldPill({ label, onPress, flex }: { label: string; onPress: () => void; flex?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={flex ? { flex: 1 } : undefined}>
      <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ minHeight: 44, borderRadius: R.pill, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" }}>
        <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function LinePill({ label, onPress, flex }: { label: string; onPress: () => void; flex?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => ({ flex: flex ? 1 : undefined, minHeight: 44, paddingHorizontal: 16, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? t.ink : t.line, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" })}>
      <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{label}</Text>
    </Pressable>
  );
}

export const VerseCard = memo(function VerseCard({ v, i, active, marked, note, noteOpen, translit, translation, words: showWords, scale, kids, st, h }: {
  v: Verse; i: number; active: boolean; marked: boolean; note?: string; noteOpen: boolean;
  translit: boolean; translation: boolean; words: boolean; scale: number; kids: boolean; st: CardState; h: CardHandlers;
}) {
  const t = useTheme();
  const w = useWebT("player");
  const r = useReaderT();
  const gold = t.gold;
  const words = v.words.filter((x) => x.char_type_name === "word");
  const { hide, revealed, seed, testPos, testMarks, memo: m, reduce } = st;
  const tool = m.tool;
  const hasTimings = v.segments.length > 0;
  const size = Math.round(30 * scale);
  const [draft, setDraft] = useState<string | null>(null);
  // whole-surah cover practice on a quiet card: covered until tapped (again after another cover level or a reshuffle)
  const coverKey = `${hide}:${seed}`;
  const [peek, setPeek] = useState("");
  const covered = !active && hide > 0 && peek !== coverKey;
  const shown = new Set(st.shown);
  const anyCovered = active && hide > 0 && !revealed;

  const coverLabel = (c: Cover, n: number) => r(c === "soft" ? "blurredWord" : c === "cue" ? "cueWord" : "hiddenWord", { n, total: words.length });
  const arabicActive = (
    <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", columnGap: 6, rowGap: 6, alignItems: "flex-start" }}
      accessible={hide === 0} accessibilityLabel={hide === 0 ? v.text_uthmani : undefined} accessibilityLanguage="ar">
      {words.map((x, wi) => {
        const cover = coverOf(hide, v.verse_key, seed, wi, words.length, { revealed, shown, testPos });
        const mark = hide === 6 ? testMarks[wi] : undefined;
        const focus = hide === 6 && wi === testPos && !revealed;
        const lit = cover !== "hidden" && hasTimings && st.activeWord === x.position;
        const hearing = st.wordOn === `${v.verse_key}:${x.position}`;
        const color = hearing ? gold : mark === true ? t.accent : mark === false ? t.danger : lit ? t.accent : t.arabic;
        const body = (
          <View style={{ alignItems: "center" }}>
            <ArabicWord text={x.text_uthmani} cover={cover} size={size} lineHeight={Math.round(size * 2.05)} color={color} reduce={reduce}
              background={hearing ? "rgba(201,166,94,0.15)" : lit ? t.accentSoft : "transparent"}
              style={{ borderWidth: focus ? 2 : cover === "hidden" ? 1 : 0, borderColor: focus ? gold : t.muted, textDecorationLine: mark === false ? "underline" : "none", textDecorationColor: t.danger }} />
            {showWords && cover === "none" ? (
              <View style={{ alignItems: "center", maxWidth: 130, marginTop: -6 }}>
                {translit && x.transliteration?.text ? <Text maxFontSizeMultiplier={1.6} style={{ fontFamily: FONT.italic, fontSize: 11, lineHeight: 14, color: gold }}>{x.transliteration.text}</Text> : null}
                {x.translation?.text ? <Text maxFontSizeMultiplier={1.6} style={{ fontFamily: FONT.regular, fontSize: 11, lineHeight: 14, color: t.muted, textAlign: "center" }}>{x.translation.text}</Text> : null}
              </View>
            ) : null}
          </View>
        );
        const hidden = cover !== "none";
        return (
          <Pressable key={x.position} onPress={() => (hidden ? h.revealWord(wi, x.position) : h.playWord(v.verse_key, x.position))}
            onLongPress={anyCovered ? h.reveal : undefined} delayLongPress={450}
            accessibilityRole="button" accessibilityLabel={hidden ? coverLabel(cover, wi + 1) : x.text_uthmani} accessibilityLanguage={hidden ? undefined : "ar"}
            accessibilityHint={hidden ? undefined : x.translation?.text}
            accessibilityActions={anyCovered ? [{ name: "longpress", label: r("revealVerse") }] : undefined}
            onAccessibilityAction={(e) => { if (e.nativeEvent.actionName === "longpress") h.reveal(); }}
            style={{ minHeight: 44, justifyContent: "center" }}>
            {body}
          </Pressable>
        );
      })}
      <Text maxFontSizeMultiplier={1.6} style={{ fontFamily: ARABIC_FONT, fontSize: size * 0.7, lineHeight: Math.round(size * 2.05), color: gold, writingDirection: "rtl" }} accessibilityElementsHidden importantForAccessibility="no">﴿{toAr(v.verse_number)}﴾</Text>
    </View>
  );

  // a quiet card in the cover practice: the same cover as the active verse, without word taps
  const qsize = Math.round(27 * scale);
  const coveredQuiet = covered ? (
    <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", columnGap: 6, rowGap: 4, alignItems: "flex-start" }}>
      {words.map((x, wi) => (
        <ArabicWord key={x.position} text={x.text_uthmani} cover={coverOf(hide, v.verse_key, seed, wi, words.length, { testPos: 0 })} size={qsize} lineHeight={Math.round(qsize * 2.05)} color={t.arabic} reduce={reduce} />
      ))}
      <Text maxFontSizeMultiplier={1.6} style={{ fontFamily: ARABIC_FONT, fontSize: qsize * 0.7, lineHeight: Math.round(qsize * 2.05), color: gold, writingDirection: "rtl" }}>﴿{toAr(v.verse_number)}﴾</Text>
    </View>
  ) : null;

  const testOk = Object.values(testMarks).filter(Boolean).length;
  const card = (
    <View onLayout={active ? () => h.layout(i) : undefined} style={[{ borderRadius: 16, borderWidth: 1, padding: 20 },
      active
        ? { borderColor: "rgba(201,166,94,0.35)", backgroundColor: t.surface, shadowColor: "rgb(201,166,94)", shadowOpacity: t.dark ? 0.25 : 0.35, shadowRadius: 22, shadowOffset: { width: 0, height: 14 }, elevation: 3 }
        : { borderColor: t.dark ? "rgba(33,56,47,0.7)" : "rgba(226,231,228,0.7)", backgroundColor: t.dark ? "rgba(13,33,26,0.6)" : "rgba(255,255,255,0.6)" }]}>
      {active ? <FrameCorners /> : null}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <VerseStar n={v.verse_number} active={active} gold={gold} surface={t.surface} label={`${w("verse")} ${v.verse_number}`} />
        {active ? (
          <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <ActionIcon icon="bookmark" label={marked ? w("bookmarked") : w("bookmark")} filled={marked} color={marked ? gold : t.muted} onPress={() => h.toggleMark(v.verse_key)} />
            {kids ? null : <ActionIcon icon="note" label={w("note")} color={note ? t.accent : t.muted} onPress={() => h.openNote(noteOpen ? null : v.verse_key)} />}
            {kids ? null : <ActionIcon icon="copy" label={w("copy")} color={t.muted} onPress={() => h.copy(v)} />}
            {kids ? null : <ActionIcon icon="share" label={w("share")} color={t.muted} onPress={() => h.share(v)} />}
            <ActionIcon icon="eye" label={r("focusOpen")} color={t.muted} onPress={h.focus} />
            <ActionIcon icon={st.playing ? "pause" : "playSm"} label={st.playing ? w("pause") : w("playVerse")} color={t.muted} onPress={() => h.playVerse(i)} />
          </View>
        ) : marked ? <View accessibilityLabel={w("bookmarked")}><Icon name="bookmark" color={gold} size={18} filled /></View> : null}
      </View>

      {active && tool === "check" && !kids ? (
        <Text maxFontSizeMultiplier={1.6} style={{ fontFamily: FONT.semibold, fontSize: 13, color: gold, marginBottom: 6 }} accessibilityRole="header">{r("checkTitle", { n: v.verse_number })}</Text>
      ) : null}
      {active ? arabicActive : covered ? coveredQuiet : (
        <Text maxFontSizeMultiplier={1.6} style={{ fontFamily: ARABIC_FONT, fontSize: Math.round(27 * scale), lineHeight: Math.round(27 * scale * 2.1), color: t.arabic, writingDirection: "rtl", textAlign: AR_RIGHT }} accessibilityLanguage="ar">
          {v.text_uthmani} <Text style={{ color: gold, fontSize: Math.round(27 * scale * 0.7) }}>﴿{toAr(v.verse_number)}﴾</Text>
        </Text>
      )}
      {translit && v.transliteration && !(active && hide > 0 && !revealed) && !covered ? <Text maxFontSizeMultiplier={1.8} style={{ fontFamily: FONT.italic, fontSize: 15, lineHeight: 24, color: gold, marginTop: 10 }}>{v.transliteration}</Text> : null}
      {translation && !(active && tool === "check" && !revealed) ? (
        <Text selectable allowFontScaling maxFontSizeMultiplier={2} style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.muted, marginTop: 6 }}>{v.translation}</Text>
      ) : null}

      {active ? (
        <View style={{ marginTop: 18, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 16, gap: 12 }}>
          <MemoControls memo={m} kids={kids} onTool={h.setTool} onLevel={h.setLevel} onShuffle={h.shuffle} />
          {anyCovered ? <Text maxFontSizeMultiplier={1.8} style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{r("wordHint")}</Text> : null}
          {kids ? null : (
            <Pressable onPress={() => h.shams(v)} accessibilityRole="button" accessibilityLabel={w("toolShams")}>
              <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ minHeight: 44, borderRadius: R.pill, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <SunMark color={goldButton.text} />
                <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.bold, fontSize: 13.5, color: goldButton.text }}>{w("toolShams")}</Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>
      ) : null}

      {active && tool === "listen" ? (
        <View style={[panel(t.dark), { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }]} accessibilityLiveRegion="polite">
          <Text maxFontSizeMultiplier={1.8} style={{ flexShrink: 1, fontFamily: FONT.medium, fontSize: 14, lineHeight: 20, color: t.ink }}>
            {st.turn ? r("turnNow") : st.playing ? r("listenNow") : r("modeListenD")}
          </Text>
          {!st.turn && !st.playing ? <GoldPill label={r("listenStart")} onPress={() => h.playVerse(i)} /> : null}
        </View>
      ) : null}

      {active && hide > 0 ? (
        <View>
          {hide === 6 && !revealed ? (
            <View style={panel(t.dark)}>
              <Text maxFontSizeMultiplier={1.8} style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: t.ink }}>{w("testWord", { n: Math.min(testPos + 1, words.length), total: words.length })}</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                <GoldPill flex label={`✓ ${w("knewWord")}`} onPress={() => h.markWord(true)} />
                <LinePill flex label={`✗ ${w("missedWord")}`} onPress={() => h.markWord(false)} />
              </View>
            </View>
          ) : null}
          {hide === 6 && revealed && words.length > 0 ? (
            <View style={panel(t.dark)} accessibilityLiveRegion="polite">
              <Text maxFontSizeMultiplier={1.8} style={{ fontFamily: FONT.bold, fontSize: 15, lineHeight: 21, color: t.ink }}>
                {r("testResult", { ok: st.testDone?.ok ?? testOk, total: st.testDone?.total ?? words.length, pct: st.testDone?.pct ?? Math.round((testOk / words.length) * 100) })}
              </Text>
              {/* the score bar */}
              <View style={{ height: 6, borderRadius: 3, backgroundColor: t.line, overflow: "hidden", marginTop: 8 }} importantForAccessibility="no" accessibilityElementsHidden>
                <View style={{ height: 6, width: `${st.testDone?.pct ?? Math.round((testOk / words.length) * 100)}%`, backgroundColor: t.accent }} />
              </View>
              {st.testDone ? <Text maxFontSizeMultiplier={1.8} style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, marginTop: 8 }}>{st.testDone.days ? r("testSaved", { days: st.testDone.days }) : r("testSavedToday")}</Text> : null}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                <LinePill label={r("testAgain")} onPress={h.testAgain} />
                <GoldPill label={r("nextVerse")} onPress={h.next} />
              </View>
            </View>
          ) : null}
          {hide !== 6 && !revealed ? (
            <View style={[panel(t.dark), { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }]}>
              <Text maxFontSizeMultiplier={1.8} style={{ flexShrink: 1, fontFamily: FONT.medium, fontSize: 14, color: t.ink }}>{w("tapToReveal")}</Text>
              <GoldPill label={w("reveal")} onPress={h.reveal} />
            </View>
          ) : null}
          {!revealed && !kids ? (
            <View style={{ marginTop: 12 }}>
              <ReciteCheck words={words.map((x) => x.text_uthmani)} onResult={() => h.reveal()} onPlayReciter={h.replay} pauseOthers={h.pause} />
            </View>
          ) : null}
          {revealed && hide !== 6 ? (
            <View style={panel(t.dark)}>
              <Text maxFontSizeMultiplier={1.8} style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, marginBottom: 10 }}>{w("rateQ")}</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable onPress={() => h.rate("again")} accessibilityRole="button" accessibilityLabel={w("again")}
                  style={({ pressed }) => ({ flex: 1, minHeight: 44, borderRadius: R.md, borderWidth: 1, borderColor: t.dark ? "rgba(239,68,68,0.4)" : "rgb(252,165,165)", backgroundColor: pressed ? "rgba(239,68,68,0.08)" : t.surface, alignItems: "center", justifyContent: "center" })}>
                  <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.dark ? "rgb(252,165,165)" : "rgb(185,28,28)" }}>↺ {w("again")}</Text>
                </Pressable>
                <Pressable onPress={() => h.rate("good")} accessibilityRole="button" accessibilityLabel={w("good")}
                  style={({ pressed }) => ({ flex: 1, minHeight: 44, borderRadius: R.md, backgroundColor: t.accent, opacity: pressed ? 0.88 : 1, alignItems: "center", justifyContent: "center" })}>
                  <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.bold, fontSize: 14, color: t.dark ? t.onAccent : "#ffffff" }}>✓ {w("good")}</Text>
                </Pressable>
                <Pressable onPress={() => h.rate("easy")} accessibilityRole="button" accessibilityLabel={w("easy")} style={{ flex: 1 }}>
                  <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ minHeight: 44, borderRadius: R.md, alignItems: "center", justifyContent: "center" }}>
                    <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>★ {w("easy")}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          ) : null}
          {tool === "check" ? <View style={{ marginTop: 10, alignSelf: "flex-start" }}><LinePill label={`↻ ${r("checkNext")}`} onPress={h.nextCheck} /></View> : null}
        </View>
      ) : null}

      {active && !kids ? <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 4 }}><SocialBar verseKey={v.verse_key} shareText={v.translation} /></View> : null}

      {(noteOpen || note) && !kids ? (
        <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 14 }}>
          {noteOpen ? (
            <TextInput autoFocus multiline value={draft ?? note ?? ""} onChangeText={setDraft} placeholder={w("notePlaceholder")} placeholderTextColor={t.muted} accessibilityLabel={w("note")}
              onBlur={() => { h.saveNote(v.verse_key, draft ?? note ?? ""); setDraft(null); h.openNote(null); }}
              style={{ minHeight: 84, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, padding: 12, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink, textAlignVertical: "top" }} />
          ) : (
            <Pressable onPress={() => h.openNote(v.verse_key)} accessibilityRole="button" accessibilityLabel={`${w("note")}: ${note}`} style={{ minHeight: 44, justifyContent: "center" }}>
              <Text maxFontSizeMultiplier={1.8} style={{ fontFamily: FONT.italic, fontSize: 14, lineHeight: 21, color: t.muted }}>“{note}”</Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {active && st.waiting ? (
        <View style={[panel(t.dark), { marginTop: 16, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, borderColor: t.line, backgroundColor: t.bg }]} accessibilityLiveRegion="polite">
          <Text maxFontSizeMultiplier={1.8} style={{ flexShrink: 1, fontFamily: FONT.medium, fontSize: 14, lineHeight: 20, color: t.ink }}>{w("learnHint")}</Text>
          <GoldPill label={w("continue")} onPress={h.cont} />
        </View>
      ) : null}

      {active && !kids ? (
        <Pressable onPress={() => h.tafsir(v)} accessibilityRole="button" accessibilityLabel={w("tafsir")}
          style={({ pressed }) => ({ alignSelf: "flex-start", marginTop: 16, minHeight: 44, paddingHorizontal: 16, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? gold : t.line, backgroundColor: t.surface, flexDirection: "row", alignItems: "center", gap: 8 })}>
          <Icon name="book" color={gold} size={16} />
          <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{w("tafsir")}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  if (active) return <View style={{ marginHorizontal: 16, marginTop: 12 }}>{card}</View>;
  return (
    <Pressable onPress={() => (covered ? setPeek(coverKey) : h.goTo(i))} accessibilityRole="button"
      accessibilityLabel={covered ? `${w("verse")} ${v.verse_number}. ${w("reveal")}` : `${w("verse")} ${v.verse_number}. ${v.text_uthmani}`}
      accessibilityHint={covered ? undefined : w("playVerse")}
      style={({ pressed }) => ({ marginHorizontal: 16, marginTop: 12, opacity: pressed ? 0.85 : 1 })}>
      {card}
    </Pressable>
  );
});

const panel = (dark: boolean) => ({ marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(201,166,94,0.4)", backgroundColor: dark ? "rgba(214,178,106,0.06)" : "rgba(150,116,52,0.05)", padding: 12 });
