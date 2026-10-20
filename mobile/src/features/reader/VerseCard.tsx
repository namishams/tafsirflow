import { memo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { ARABIC_FONT, FONT, R, goldButton, useTheme, AR_RIGHT } from "@/lib/theme";
import { Icon, type IconName } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import type { Verse } from "@/lib/quran";
import type { Rating } from "@/web/learning";
import { firstLetter, hashOf } from "@/features/shams/memory";
import { toAr } from "@/features/quran/useVerseAudio";
import { FrameCorners, VerseStar } from "./ornaments";

// One verse card of the website's Player.tsx: quiet and compact while inactive; the active verse is framed in gold with
// corner brackets and carries the word-by-word text (the recited word lit), the Read / Practise / Test tools,
// reveal and self-rating, bookmark, note, share, play, Tafsir and the Shams Method.
export type Hide = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 all, 1 every 2nd word, 2 hard, 3 first letters, 4 random, 5 soft, 6 test word by word
export type CardHandlers = {
  goTo: (i: number) => void;
  playVerse: (i: number) => void;
  toggleMark: (key: string) => void;
  openNote: (key: string | null) => void;
  saveNote: (key: string, text: string) => void;
  setHide: (h: Hide) => void;
  shuffle: () => void;
  reveal: () => void;
  markWord: (ok: boolean) => void;
  rate: (r: Rating) => void;
  tafsir: (v: Verse) => void;
  shams: (v: Verse) => void;
  share: (v: Verse) => void;
  playWord: (key: string, pos: number) => void;
};
export type CardState = { hide: Hide; practiceHide: Hide; revealed: boolean; seed: number; testPos: number; testMarks: Record<number, boolean>; activeWord: number | null; playing: boolean; wordOn: string | null };
export const IDLE: CardState = { hide: 0, practiceHide: 5, revealed: false, seed: 1, testPos: 0, testMarks: {}, activeWord: null, playing: false, wordOn: null };

const SunMark = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Circle cx={12} cy={12} r={5.5} fill={color} /><Circle cx={12} cy={12} r={9.5} fill="none" stroke={color} strokeWidth={1.6} strokeOpacity={0.55} /></Svg>
);

/** segmented control in the website's style (inline-flex rounded-full bg-bg p-1, white active pill) */
function Seg<T extends string | number>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignSelf: "flex-start", backgroundColor: t.bg, borderRadius: R.pill, padding: 4 }} accessibilityRole="tablist" accessibilityLabel={label}>
      {options.map(([v, l]) => {
        const on = v === value;
        return (
          <Pressable key={String(v)} onPress={() => onChange(v)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={l}
            style={{ paddingHorizontal: 14, height: 32, justifyContent: "center", borderRadius: R.pill, backgroundColor: on ? t.surface : "transparent", borderWidth: on ? 1 : 0, borderColor: t.line,
              shadowColor: "#000", shadowOpacity: on ? 0.06 : 0, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: on ? t.ink : t.muted }}>{l}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ActionIcon({ icon, label, onPress, color, filled }: { icon: IconName; label: string; onPress: () => void; color: string; filled?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}
      style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? t.bg : "transparent" })}>
      <Icon name={icon} color={color} size={18} filled={filled} />
    </Pressable>
  );
}

export const VerseCard = memo(function VerseCard({ v, i, active, marked, note, noteOpen, translit, translation, words: showWords, scale, st, h }: {
  v: Verse; i: number; active: boolean; marked: boolean; note?: string; noteOpen: boolean;
  translit: boolean; translation: boolean; words: boolean; scale: number; st: CardState; h: CardHandlers;
}) {
  const t = useTheme();
  const w = useWebT("player");
  const gold = t.gold;
  const words = v.words.filter((x) => x.char_type_name === "word");
  const { hide, revealed, seed, testPos, testMarks } = st;
  const tool = hide === 0 ? "read" : hide === 6 ? "test" : "practice";
  const hasTimings = v.segments.length > 0;
  const size = Math.round(30 * scale);
  const [draft, setDraft] = useState<string | null>(null);

  const arabicActive = (
    <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", columnGap: 10, rowGap: 6, alignItems: "flex-start" }} accessible={hide === 0} accessibilityLabel={hide === 0 ? v.text_uthmani : undefined} accessibilityLanguage="ar">
      {words.map((x, wi) => {
        const randomHidden = hide === 4 && ((hashOf(`${v.verse_key}:${seed}:${wi}`) % 100) < 45 || (words.length > 1 && wi === hashOf(`${v.verse_key}:${seed}`) % words.length));
        const covered = !revealed && (hide === 2 || (hide === 1 && wi % 2 === 1) || randomHidden || (hide === 6 && wi >= testPos));
        const soft = hide === 5 && !revealed;
        const cue = hide === 3 && !revealed;
        const mark = hide === 6 ? testMarks[wi] : undefined;
        const focus = hide === 6 && wi === testPos && !revealed;
        const lit = !covered && hasTimings && st.activeWord === x.position;
        const hearing = st.wordOn === `${v.verse_key}:${x.position}`;
        const color = covered ? "transparent" : hearing ? gold : mark === true ? t.accent : mark === false ? t.danger : cue ? gold : lit ? t.accent : t.arabic;
        const body = (
          <View style={{ alignItems: "center" }}>
            <Text allowFontScaling style={{
              fontFamily: ARABIC_FONT, fontSize: size, lineHeight: Math.round(size * 2.05), writingDirection: "rtl", paddingHorizontal: 6, borderRadius: 8, overflow: "hidden", color,
              backgroundColor: covered ? t.line : hearing ? "rgba(201,166,94,0.15)" : lit ? t.accentSoft : "transparent", opacity: soft ? 0.4 : 1,
              borderWidth: focus ? 2 : 0, borderColor: gold, textDecorationLine: mark === false ? "underline" : "none", textDecorationColor: t.danger,
            }}>{cue ? firstLetter(x.text_uthmani) : x.text_uthmani}</Text>
            {showWords && !covered ? (
              <View style={{ alignItems: "center", maxWidth: 130, marginTop: -6 }}>
                {translit && x.transliteration?.text ? <Text style={{ fontFamily: FONT.italic, fontSize: 11, lineHeight: 14, color: gold }}>{x.transliteration.text}</Text> : null}
                {x.translation?.text ? <Text style={{ fontFamily: FONT.regular, fontSize: 11, lineHeight: 14, color: t.muted, textAlign: "center" }}>{x.translation.text}</Text> : null}
              </View>
            ) : null}
          </View>
        );
        return covered || soft || cue
          ? <View key={x.position}>{body}</View>
          : <Pressable key={x.position} onPress={() => h.playWord(v.verse_key, x.position)} accessibilityRole="button" accessibilityLabel={x.translation?.text ?? x.text_uthmani}>{body}</Pressable>;
      })}
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: size * 0.7, lineHeight: Math.round(size * 2.05), color: gold, writingDirection: "rtl" }} accessibilityElementsHidden>﴿{toAr(v.verse_number)}﴾</Text>
    </View>
  );

  const card = (
    <View style={[{ borderRadius: 16, borderWidth: 1, padding: 20 },
      active
        ? { borderColor: "rgba(201,166,94,0.35)", backgroundColor: t.surface, shadowColor: "rgb(201,166,94)", shadowOpacity: t.dark ? 0.25 : 0.35, shadowRadius: 22, shadowOffset: { width: 0, height: 14 }, elevation: 3 }
        : { borderColor: t.dark ? "rgba(33,56,47,0.7)" : "rgba(226,231,228,0.7)", backgroundColor: t.dark ? "rgba(13,33,26,0.6)" : "rgba(255,255,255,0.6)" }]}>
      {active ? <FrameCorners /> : null}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <VerseStar n={v.verse_number} active={active} gold={gold} surface={t.surface} label={`${w("verse")} ${v.verse_number}`} />
        {active ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ActionIcon icon="bookmark" label={marked ? w("bookmarked") : w("bookmark")} filled={marked} color={marked ? gold : t.muted} onPress={() => h.toggleMark(v.verse_key)} />
            <ActionIcon icon="note" label={w("note")} color={note ? t.accent : t.muted} onPress={() => h.openNote(noteOpen ? null : v.verse_key)} />
            <ActionIcon icon="share" label={w("share")} color={t.muted} onPress={() => h.share(v)} />
            <ActionIcon icon={st.playing ? "pause" : "playSm"} label={st.playing ? w("pause") : w("playVerse")} color={t.muted} onPress={() => h.playVerse(i)} />
          </View>
        ) : marked ? <View accessibilityLabel={w("bookmarked")}><Icon name="bookmark" color={gold} size={18} filled /></View> : null}
      </View>

      {active ? arabicActive : (
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: Math.round(27 * scale), lineHeight: Math.round(27 * scale * 2.1), color: t.arabic, writingDirection: "rtl", textAlign: AR_RIGHT }} accessibilityLanguage="ar">
          {v.text_uthmani} <Text style={{ color: gold, fontSize: Math.round(27 * scale * 0.7) }}>﴿{toAr(v.verse_number)}﴾</Text>
        </Text>
      )}
      {translit && v.transliteration && !(active && hide > 0 && !revealed) ? <Text style={{ fontFamily: FONT.italic, fontSize: 15, lineHeight: 24, color: gold, marginTop: 10 }}>{v.transliteration}</Text> : null}
      {translation ? <Text selectable style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.muted, marginTop: 6 }}>{v.translation}</Text> : null}

      {active ? (
        <View style={{ marginTop: 18, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 16, gap: 12 }}>
          <Seg value={tool} label={w("memorize")} onChange={(x) => h.setHide(x === "read" ? 0 : x === "test" ? 6 : st.practiceHide)}
            options={[["read", w("toolRead")], ["practice", w("toolPractice")], ["test", w("toolTest")]]} />
          <Pressable onPress={() => h.shams(v)} accessibilityRole="button" accessibilityLabel={w("toolShams")}>
            <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 40, borderRadius: R.pill, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <SunMark color={goldButton.text} />
              <Text style={{ fontFamily: FONT.bold, fontSize: 13.5, color: goldButton.text }}>{w("toolShams")}</Text>
            </LinearGradient>
          </Pressable>
          {tool === "practice" ? (
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{w("hideLabel")}</Text>
              <Seg value={hide} label={w("hideLabel")} onChange={(x) => { if (x === 4 && hide === 4) h.shuffle(); h.setHide(x); }}
                options={[[5, w("hideSoft")], [1, w("hideHalf")], [4, w("hideRandom")], [2, w("hideHard")]]} />
              {hide === 4 && !revealed ? <Text onPress={h.shuffle} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent, paddingVertical: 4 }}>↻ {w("shuffle")}</Text> : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {active && hide > 0 ? (
        <View>
          {hide === 6 && !revealed ? (
            <View style={panel(t.dark)}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: t.ink }}>{w("testWord", { n: testPos + 1, total: words.length })}</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                <Pressable onPress={() => h.markWord(true)} accessibilityRole="button" accessibilityLabel={w("knewWord")} style={{ flex: 1 }}>
                  <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 42, borderRadius: R.pill, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>✓ {w("knewWord")}</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable onPress={() => h.markWord(false)} accessibilityRole="button" accessibilityLabel={w("missedWord")}
                  style={({ pressed }) => ({ flex: 1, height: 42, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? t.ink : t.line, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" })}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>✗ {w("missedWord")}</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
          {hide === 6 && revealed && words.length > 0 ? (
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: t.ink, marginTop: 12 }}>
              {w("testScore", { ok: Object.values(testMarks).filter(Boolean).length, total: words.length, pct: Math.round((Object.values(testMarks).filter(Boolean).length / words.length) * 100) })}
            </Text>
          ) : null}
          {hide !== 6 && !revealed ? (
            <View style={[panel(t.dark), { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }]}>
              <Text style={{ flexShrink: 1, fontFamily: FONT.medium, fontSize: 14, color: t.ink }}>{w("tapToReveal")}</Text>
              <Pressable onPress={h.reveal} accessibilityRole="button" accessibilityLabel={w("reveal")}>
                <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 40, borderRadius: R.pill, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{w("reveal")}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : null}
          {revealed ? (
            <View style={panel(t.dark)}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, marginBottom: 10 }}>{w("rateQ")}</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable onPress={() => h.rate("again")} accessibilityRole="button" accessibilityLabel={w("again")}
                  style={({ pressed }) => ({ flex: 1, height: 44, borderRadius: R.md, borderWidth: 1, borderColor: t.dark ? "rgba(239,68,68,0.4)" : "rgb(252,165,165)", backgroundColor: pressed ? "rgba(239,68,68,0.08)" : t.surface, alignItems: "center", justifyContent: "center" })}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.dark ? "rgb(252,165,165)" : "rgb(185,28,28)" }}>↺ {w("again")}</Text>
                </Pressable>
                <Pressable onPress={() => h.rate("good")} accessibilityRole="button" accessibilityLabel={w("good")}
                  style={({ pressed }) => ({ flex: 1, height: 44, borderRadius: R.md, backgroundColor: t.accent, opacity: pressed ? 0.88 : 1, alignItems: "center", justifyContent: "center" })}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.dark ? t.onAccent : "#ffffff" }}>✓ {w("good")}</Text>
                </Pressable>
                <Pressable onPress={() => h.rate("easy")} accessibilityRole="button" accessibilityLabel={w("easy")} style={{ flex: 1 }}>
                  <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 44, borderRadius: R.md, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>★ {w("easy")}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {noteOpen || note ? (
        <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 14 }}>
          {noteOpen ? (
            <TextInput autoFocus multiline value={draft ?? note ?? ""} onChangeText={setDraft} placeholder={w("notePlaceholder")} placeholderTextColor={t.muted} accessibilityLabel={w("note")}
              onBlur={() => { h.saveNote(v.verse_key, draft ?? note ?? ""); setDraft(null); h.openNote(null); }}
              style={{ minHeight: 84, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, padding: 12, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink, textAlignVertical: "top" }} />
          ) : (
            <Text onPress={() => h.openNote(v.verse_key)} accessibilityRole="button" style={{ fontFamily: FONT.italic, fontSize: 14, lineHeight: 21, color: t.muted }}>“{note}”</Text>
          )}
        </View>
      ) : null}

      {active ? (
        <Pressable onPress={() => h.tafsir(v)} accessibilityRole="button" accessibilityLabel={w("tafsir")}
          style={({ pressed }) => ({ alignSelf: "flex-start", marginTop: 16, height: 40, paddingHorizontal: 16, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? gold : t.line, backgroundColor: t.surface, flexDirection: "row", alignItems: "center", gap: 8 })}>
          <Icon name="book" color={gold} size={16} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{w("tafsir")}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  if (active) return <View style={{ marginHorizontal: 16, marginTop: 12 }}>{card}</View>;
  return (
    <Pressable onPress={() => h.goTo(i)} accessibilityRole="button" accessibilityLabel={`${w("verse")} ${v.verse_number}. ${w("playVerse")}`} style={({ pressed }) => ({ marginHorizontal: 16, marginTop: 12, opacity: pressed ? 0.85 : 1 })}>
      {card}
    </Pressable>
  );
});

const panel = (dark: boolean) => ({ marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(201,166,94,0.4)", backgroundColor: dark ? "rgba(214,178,106,0.06)" : "rgba(150,116,52,0.05)", padding: 12 });
