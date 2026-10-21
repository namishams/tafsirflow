import { ShareVerseButton } from "@/features/share/ShareKit";
import { useShareText } from "@/features/share/texts";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { FONT, useTheme } from "@/lib/theme";
import { ActionRow, Arabic, Eyebrow, GoldButton, GoldCard, OutlineButton } from "@/components/brand";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { RECITERS, audioUrl, getChapter, getVerseByKey, type SingleVerse } from "@/lib/quran";
import { verseOfDayKey } from "@/web/votd";
import { useVerseAudio } from "@/features/quran/useVerseAudio";

// Verse of the day (website VerseOfTheDay.tsx): the same hand-picked verse for everyone, text and translation from the
// server, Alafasy's recitation, links to hear & learn it, memorize it with the Shams Method, or read its tafsir.
export function VerseOfTheDay() {
  const t = useTheme();
  const w = useWebT("home2");
  const { lang } = useLang();
  const key = verseOfDayKey();
  const stx = useShareText();
  const [c, v] = key.split(":").map(Number);
  const [verse, setVerse] = useState<SingleVerse | null>(null);
  const [surahName, setSurahName] = useState("");
  const audio = useVerseAudio();
  useEffect(() => {
    getVerseByKey(key, lang).then(setVerse).catch(() => undefined);
    getChapter(c, lang).then((ch) => setSurahName(ch.name_simple)).catch(() => undefined);
  }, [key, lang, c]);
  if (!verse) return null;
  return (
    <GoldCard>
      <Eyebrow style={{ color: t.gold, marginBottom: 12 }}>{w("votdTitle")}</Eyebrow>
      <Arabic size={26} center>{verse.text_uthmani}</Arabic>
      {verse.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: t.muted, textAlign: "center", marginTop: 6 }}>{verse.translation}</Text> : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold, textAlign: "center", marginTop: 8 }}>{surahName} · {key}</Text>
      <View style={{ gap: 10, marginTop: 16 }}>
        <GoldButton title={w("votdPlay")} icon={audio.playing ? "pause" : "play"} onPress={() => (audio.playing ? audio.pause() : audio.play(audioUrl(RECITERS[0], c, v), { title: `${surahName} · ${v}` }))} />
        <ActionRow>
          <OutlineButton title={w("votdTafsir")} icon="book" onPress={() => router.push(`/quran/${c}?v=${v}&tafsir=1` as Href)} style={{ flex: 1 }} />
          <OutlineButton title={w("votdMemorize")} icon="sun" onPress={() => router.push(`/shams/${c}?v=${v}` as Href)} style={{ flex: 1 }} />
        </ActionRow>
        <ShareVerseButton verseKey={key} kicker={stx.verseOfDay} pill />
      </View>
    </GoldCard>
  );
}
