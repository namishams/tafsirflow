import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import Svg, { Rect } from "react-native-svg";
import { GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, PageHero } from "@/components/page";
import { useLang } from "@/i18n";
import { usePro, openPro } from "@/lib/pro";
import { getVerses, reciterName, type Reciter, type Segment, type Verse } from "@/lib/quran";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { isFreeReciter, useReciterList } from "@/features/quran/reciter";
import { useVerseAudio } from "@/features/quran/useVerseAudio";
import { RecordCompare, VerseWords } from "@/features/reciter-path/Practice";
import { useMt, type MtKey } from "./texts";
import { Card, Chip, Muted, NeedsReview, Row, Section } from "./ui";

// Style studies of the masters: phrase-by-phrase listening from the word timings, pace and pauses drawn from the
// gaps between the timings (no audio analysis), the Reciter Path's A/B recording, and style notes in our own words
// (drafts until a teacher has checked them). Voices go through the same Pro rule as every player (allowedReciter):
// a Pro voice without Pro is shown locked instead of silently playing another reciter.

export type Master = { key: string; id: number; note: MtKey; ar: string; name: string };
export const MASTERS: Master[] = [
  { key: "alafasy", id: 7, note: "n_alafasy", ar: "مشاري راشد العفاسي", name: "Mishary Alafasy" },
  { key: "abdulbasit", id: 2, note: "n_abdulbasit", ar: "عبد الباسط عبد الصمد", name: "AbdulBaset AbdulSamad" },
  { key: "minshawi", id: 9, note: "n_minshawi", ar: "محمد صديق المنشاوي", name: "Mohamed Siddiq Al-Minshawi" },
  { key: "husary", id: 6, note: "n_husary", ar: "محمود خليل الحصري", name: "Mahmoud Khalil Al-Husary" },
  { key: "sudais", id: 3, note: "n_sudais", ar: "عبد الرحمن السديس", name: "Abdur-Rahman As-Sudais" },
];
export const STUDY_VERSES = ["1:1", "1:2", "1:3", "1:4", "1:5", "1:6", "1:7", "67:1", "67:2", "67:3", "112:1", "112:2", "112:3", "112:4", "2:255"];
const PAUSE_MS = 180;

/** the master's voice from the server list, and whether it may play */
function useMasterVoice(id: number): { reciter: Reciter | null; locked: boolean } {
  const all = useReciterList();
  const { pro } = usePro();
  const reciter = all.find((r) => r.id === id) ?? null;
  return { reciter, locked: !!reciter && !pro && !isFreeReciter(reciter) };
}
function useMasterVerse(reciter: Reciter | null, locked: boolean, key: string) {
  const { lang } = useLang();
  const [state, setState] = useState<{ verse: Verse | null; error: boolean }>({ verse: null, error: false });
  useEffect(() => {
    if (!reciter || locked) return;
    let alive = true;
    setState({ verse: null, error: false });
    const surah = Number(key.split(":")[0]);
    getVerses(surah, lang, reciter).then((vs) => { if (alive) setState({ verse: vs.find((v) => v.verse_key === key) ?? null, error: false }); })
      .catch(() => { if (alive) setState({ verse: null, error: true }); });
    return () => { alive = false; };
  }, [reciter, locked, key, lang]);
  return state;
}

/** phrases: words joined while the gap to the next word is shorter than PAUSE_MS */
export function phrasesOf(segs: Segment[]): { words: number[]; start: number; end: number }[] {
  const s = [...segs].sort((a, b) => a.start - b.start);
  const out: { words: number[]; start: number; end: number }[] = [];
  for (const x of s) {
    const cur = out.at(-1);
    if (cur && x.start - cur.end < PAUSE_MS) { cur.words.push(x.word); cur.end = Math.max(cur.end, x.end); }
    else out.push({ words: [x.word], start: x.start, end: x.end });
  }
  return out;
}
export function paceOf(segs: Segment[]) {
  const s = [...segs].sort((a, b) => a.start - b.start);
  if (s.length < 2) return null;
  const span = s.at(-1)!.end - s[0].start;
  const gaps = s.slice(1).map((x, i) => Math.max(0, x.start - s[i].end));
  const pauses = gaps.filter((g) => g >= PAUSE_MS);
  return { wpm: Math.round((s.length / Math.max(1, span)) * 60_000), pauses: pauses.length, longest: Math.max(0, ...gaps) };
}

// ——— /mishary/masters ———
export function MastersScreen() {
  const t = useTheme();
  const mt = useMt();
  const { lang } = useLang();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow={mt("kicker")} title={mt("mastersTitle")} lead={mt("mastersLead")} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 12 }}>
          {MASTERS.map((m) => (
            <Pressable key={m.key} onPress={() => router.push(`/mishary/masters/${m.key}` as Href)} accessibilityRole="button">
              <Card>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{reciterName({ name: m.name, slug: m.key }, lang)}</Text>
                    <Text style={{ fontFamily: ARABIC_FONT, fontSize: 18, color: t.gold, textAlign: "left" }}>{m.ar}</Text>
                  </View>
                  <Icon name="chevronRight" size={16} color={t.muted} />
                </View>
                <Muted>{mt(m.note).split(". ")[0]}.</Muted>
              </Card>
            </Pressable>
          ))}
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}

/** word blocks and pauses on one time axis */
function PaceBar({ segs }: { segs: Segment[] }) {
  const t = useTheme();
  const s = [...segs].sort((a, b) => a.start - b.start);
  if (!s.length) return null;
  const from = s[0].start, span = Math.max(1, s.at(-1)!.end - from);
  const x = (ms: number) => ((ms - from) / span) * 1000;
  return (
    <Svg width="100%" height={26} viewBox="0 0 1000 26" preserveAspectRatio="none">
      {s.slice(1).map((w, i) => { const g = w.start - s[i].end; return g >= PAUSE_MS ? <Rect key={`g${i}`} x={x(s[i].end)} y={2} width={Math.max(3, x(w.start) - x(s[i].end))} height={22} rx={3} fill={t.gold} opacity={0.35} /> : null; })}
      {s.map((w) => <Rect key={`${w.word}-${w.start}`} x={x(w.start)} y={6} width={Math.max(3, x(w.end) - x(w.start) - 2)} height={14} rx={3} fill={t.accent} />)}
    </Svg>
  );
}

function PhrasePlayer({ verse }: { verse: Verse }) {
  const t = useTheme();
  const mt = useMt();
  const audio = useVerseAudio();
  const range = useRef<{ end: number } | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const phrases = useMemo(() => phrasesOf(verse.segments), [verse]);
  useEffect(() => () => audio.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const r = range.current;
    if (r && audio.playing && audio.positionMs >= r.end) { audio.pause(); range.current = null; setActive(null); }
  }, [audio.positionMs, audio.playing]); // eslint-disable-line react-hooks/exhaustive-deps
  audio.onEnd.current = () => { range.current = null; setActive(null); };
  const playPhrase = (i: number) => {
    const p = phrases[i];
    range.current = { end: p.end + 60 };
    setActive(i);
    audio.play(verse.audioUrl, { fallback: verse.remoteAudioUrl, fromMs: Math.max(0, p.start - 40), track: false });
  };
  const current = active !== null ? phrases[active] : null;
  const activeWord = current ? verse.segments.find((s) => s.start <= audio.positionMs && audio.positionMs < s.end && current.words.includes(s.word))?.word ?? null : null;
  return (
    <View style={{ gap: 12 }}>
      <VerseWords verse={verse} size={24} mark={current?.words} active={activeWord} />
      {phrases.length ? (
        <Row>
          {phrases.map((p, i) => <Chip key={i} label={mt("phrase", { n: i + 1 })} icon="play" on={active === i} onPress={() => (active === i && audio.playing ? (audio.pause(), setActive(null)) : playPhrase(i))} />)}
          <Chip label={mt("playAll")} icon="play" onPress={() => { range.current = null; setActive(null); audio.play(verse.audioUrl, { fallback: verse.remoteAudioUrl, track: false }); }} />
        </Row>
      ) : <Muted>{mt("noTimings")}</Muted>}
      {audio.playing ? <Chip label={mt("stop")} icon="pause" onPress={() => { range.current = null; setActive(null); audio.pause(); }} /> : null}
    </View>
  );
}

// ——— /mishary/masters/[key] ———
export function MasterStudyScreen({ id }: { id: string }) {
  const t = useTheme();
  const mt = useMt();
  const { lang } = useLang();
  const master = MASTERS.find((m) => m.key === id);
  const [key, setKey] = useState(STUDY_VERSES[0]);
  const { reciter, locked } = useMasterVoice(master?.id ?? -1);
  const { verse, error } = useMasterVerse(reciter, locked, key);
  if (!master) return null;
  const pace = verse ? paceOf(verse.segments) : null;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow={mt("mastersTitle")} title={reciterName({ name: master.name, slug: master.key }, lang)} arabic={master.ar} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 22 }}>
          <Section title={mt("styleNotes")} right={<NeedsReview />}>
            <Card><Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink }}>{mt(master.note)}</Text><Muted size={12}>{mt("needsReviewNote")}</Muted></Card>
          </Section>
          {!reciter ? <Card><Muted>{mt("notOnServer")}</Muted></Card> : locked ? (
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Icon name="lock" color={t.gold} size={18} /><Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{mt("proVoice")}</Text></View>
              <GoldButton title={mt("unlockPro")} icon="starBig" onPress={() => openPro("reciters")} />
            </Card>
          ) : (
            <>
              <Section title={mt("verse")}>
                <Row>{STUDY_VERSES.map((k) => <Chip key={k} label={k} on={k === key} onPress={() => setKey(k)} />)}</Row>
              </Section>
              {verse ? (
                <View key={`${reciter.folder}-${key}`} style={{ gap: 22 }}>
                  <Section title={mt("phrases")}><Card><PhrasePlayer verse={verse} /></Card></Section>
                  <Section title={mt("paceTitle")}>
                    <Card>
                      {pace ? (
                        <>
                          <Row>
                            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{mt("wpm", { n: pace.wpm })}</Text>
                            <Muted>· {mt("pauses", { n: pace.pauses })} · {mt("longestPause", { s: (pace.longest / 1000).toFixed(1) })}</Muted>
                          </Row>
                          <PaceBar segs={verse.segments} />
                          <Row>
                            <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: t.accent }} /><Muted size={12}>{mt("legendWords")}</Muted>
                            <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: t.gold, opacity: 0.5 }} /><Muted size={12}>{mt("legendPauses")}</Muted>
                          </Row>
                        </>
                      ) : <Muted>{mt("noTimings")}</Muted>}
                    </Card>
                  </Section>
                  <Section title={mt("yourTurn")}><Card><RecordCompare verse={verse} /></Card></Section>
                </View>
              ) : <Muted>{error ? mt("offline") : mt("loading")}</Muted>}
            </>
          )}
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}
