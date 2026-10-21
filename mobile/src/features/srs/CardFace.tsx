import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { ARABIC_FONT, FONT, stage, useTheme } from "@/lib/theme";
import { tajweedFor } from "@/web/tajweed";
import { meaning, vocabFor } from "@/web/vocabI18n";
import { wordClipUrl } from "@/web/vocabStudy";
import type { Word } from "@/web/vocab";
import { solidGoldA } from "../coursekit/art";
import { kindOf, refOf } from "./decks";
import { useSrsT } from "./texts";
import { clozePositions, useVerseData, useWordPosition, type VWord } from "./verse";

// What a card shows on its front (on the dark stage) and back (gold card), for every card kind.
// Quran text always comes from the Quran API or the app's word data, never from the card itself.
export type Face = { front: React.ReactNode; back: React.ReactNode; audio: string | null; ready: boolean; error?: boolean };

const vocabCache = new Map<string, Map<string, Word>>();
function vocabMap(lang: string) {
  let m = vocabCache.get(lang);
  if (!m) { m = new Map(vocabFor(lang).flatMap((d) => d.words).map((w) => [w.id, w])); vocabCache.set(lang, m); }
  return m;
}
export const vocabWord = (id: string, lang: string) => vocabMap(lang).get(id);
export function tajweedQ(ref: string, lang: string) {
  const [lid, i] = ref.split(":");
  const l = tajweedFor(lang).find((x) => x.id === lid);
  const q = l?.quiz[Number(i)];
  if (!l || !q) return null;
  const de = lang === "de";
  return { title: de ? l.title_de : l.title_en, q: de ? q.q_de : q.q_en, options: de ? q.options_de : q.options_en, answer: q.answer, explain: de ? q.explain_de : q.explain_en };
}

const Ar = ({ children, size = 44, color = "#fff" }: { children: string; size?: number; color?: string }) => (
  <Text accessibilityLanguage="ar" allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.9, color, textAlign: "center", writingDirection: "rtl" }}>{children}</Text>
);
const Kicker = ({ children }: { children: string }) => (
  <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase", color: stage.gold, textAlign: "center", marginBottom: 8 }}>{children}</Text>
);

export function useCardFace(id: string, seed: number): Face {
  const { lang } = useLang();
  const t = useTheme();
  const st = useSrsT();
  const kind = kindOf(id);
  const ref = refOf(id);
  const word = kind === "word" || kind === "name" ? vocabWord(ref, lang) : undefined;
  const pos = useWordPosition(word, lang);
  const verseKey = kind === "verse" || kind === "dua" ? ref : kind === "qword" ? ref.split(":").slice(0, 2).join(":") : null;
  const verse = useVerseData(verseKey, lang);
  const words = verse?.data?.words ?? [];
  const hidden = useMemo(() => clozePositions(words, seed), [words, seed]);

  const muted = { fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted, textAlign: "center" as const };
  const strong = { fontFamily: FONT.bold, fontSize: 22, lineHeight: 28, color: t.ink, textAlign: "center" as const };

  if (word) {
    return {
      ready: true, audio: word.ex && pos ? wordClipUrl(word.ex.key, pos) : null,
      front: <View style={{ alignItems: "center" }}><Kicker>{kind === "name" ? st("nameOfAllah") : st("whatMeans")}</Kicker><Ar size={52}>{word.ar}</Ar></View>,
      back: (
        <View style={{ alignItems: "center", gap: 6 }}>
          <Ar size={34} color={t.ink}>{word.ar}</Ar>
          <Text style={strong}>{meaning(word, lang)}</Text>
          {lang !== "ar" ? <Text style={muted}>{word.tr}</Text> : null}
          {word.root ? <Text accessibilityLanguage="ar" style={[muted, { fontFamily: ARABIC_FONT, fontSize: 18 }]}>{word.root}</Text> : null}
          {word.ex ? <Text style={[muted, { fontSize: 13 }]}>{st("verse", { key: word.ex.key })}</Text> : null}
        </View>
      ),
    };
  }
  if (kind === "tajweed") {
    const q = tajweedQ(ref, lang);
    if (!q) return { ready: false, error: true, audio: null, front: null, back: null };
    return {
      ready: true, audio: null,
      front: (
        <View style={{ alignItems: "stretch", gap: 10, alignSelf: "stretch" }}>
          <Kicker>{`${st("tajweedRule")} · ${q.title}`}</Kicker>
          <Text style={{ fontFamily: FONT.bold, fontSize: 19, lineHeight: 26, color: "#fff", textAlign: "center" }}>{q.q}</Text>
          {q.options.map((o, i) => <Text key={i} style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 21, color: stage.textSoft, textAlign: "center" }}>{o}</Text>)}
        </View>
      ),
      back: <View style={{ gap: 10 }}><Text style={strong}>{q.options[q.answer]}</Text><Text style={muted}>{q.explain}</Text></View>,
    };
  }
  if (!verse || (!verse.data && !verse.error)) return { ready: false, audio: null, front: <Text style={{ color: stage.textMuted, fontFamily: FONT.regular }}>{st("loading")}</Text>, back: null };
  if (!verse.data) return { ready: false, error: true, audio: null, front: <Text style={{ color: stage.textSoft, fontFamily: FONT.regular, textAlign: "center" }}>{st("loadError")}</Text>, back: null };
  const data = verse.data;
  if (kind === "qword") {
    const p = Number(ref.split(":")[2]);
    const w = data.words.find((x) => x.position === p);
    if (!w) return { ready: false, error: true, audio: null, front: <Text style={{ color: stage.textSoft }}>{st("loadError")}</Text>, back: null };
    return {
      ready: true, audio: wordClipUrl(data.key, p),
      front: <View style={{ alignItems: "center" }}><Kicker>{st("whatMeans")}</Kicker><Ar size={52}>{w.text}</Ar></View>,
      back: (
        <View style={{ alignItems: "center", gap: 6 }}>
          <Ar size={34} color={t.ink}>{w.text}</Ar>
          {w.meaning ? <Text style={strong}>{w.meaning}</Text> : null}
          {w.tr ? <Text style={muted}>{w.tr}</Text> : null}
          <Text style={[muted, { fontSize: 13 }]}>{st("verse", { key: data.key })}</Text>
        </View>
      ),
    };
  }
  // verse / dua: cloze
  const line = (ws: VWord[], reveal: boolean, color: string) => (
    <Text accessibilityLanguage="ar" allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 54, color, textAlign: "center", writingDirection: "rtl" }}>
      {ws.map((w, i) => {
        const h = hidden.has(w.position);
        const txt = `${i ? " " : ""}${w.text}`;
        if (!h) return <Text key={w.position}>{txt}</Text>;
        return reveal
          ? <Text key={w.position} style={{ color: t.gold, backgroundColor: solidGoldA(0.2) }}>{txt}</Text>
          : <Text key={w.position} style={{ color: "transparent", backgroundColor: "rgba(214,180,108,0.28)" }}>{txt}</Text>;
      })}
    </Text>
  );
  return {
    ready: true, audio: data.audio,
    front: <View style={{ alignSelf: "stretch" }}><Kicker>{`${kind === "dua" ? st("dua") : st("verse", { key: data.key })} · ${st("recite")}`}</Kicker>{line(data.words, false, "#fff")}</View>,
    back: (
      <View style={{ alignSelf: "stretch", gap: 8 }}>
        {line(data.words, true, t.ink)}
        {data.translation ? <Text style={muted}>{data.translation}</Text> : null}
        <Text style={[muted, { fontSize: 13 }]}>{st("verse", { key: data.key })}</Text>
      </View>
    ),
  };
}

export function PlayButton({ onPress, label, onStage }: { onPress: () => void; label: string; onStage?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}
      style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: onStage ? stage.goldSoft : t.line }}>
      <Icon name="speaker" size={20} color={onStage ? stage.gold : t.accent} />
    </Pressable>
  );
}
