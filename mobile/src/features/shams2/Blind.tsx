import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { Page, PageHero, Loading } from "@/components/page";
import { Chip, Segmented } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { FREE, usePro } from "@/lib/pro";
import { useEntitlement } from "@/lib/entitlements";
import type { Verse } from "@/lib/quran";
import { VERSE_COUNTS } from "@/web/counts";
import { useVerseAudio } from "@/features/quran/useVerseAudio";
import { useSurahVerses, wordsOf } from "@/features/reciter-path/useVerse";
import { shamsGrow } from "@/features/garden/garden";
import { useShams2 } from "./model";
import { useSurahNames } from "./names";
import { maqasidOf } from "./maqasid";
import type { Range } from "./plan";
import { noteCheck, noteWords } from "./store";
import { NOTHING_SAVED, saveRatings, wasSaved, type SavedRatings } from "./rated";
import { blindAlignAsync, fitVerses, suggestedGrades, type BlindResult, type LinkReason, type RefVerse } from "./blindAlign";
import { contextualOf, deleteTake, useOnDeviceArabic, useTake, type TakeOut } from "./take";
import { useS2 } from "./text";
import { useRec } from "./rec/text";
import { Capsule, DOCK_SPACE, Dock, MarkedWords, Pill, RateChips, Stepper } from "./rec/ui";
import { Card } from "./ui";

// /shams/blind?s=&from=&to= – blind recitation (Shams 3.0): a whole passage from memory with the text hidden. One take
// with on-device recognition (take.ts), aligned with the verses (blindAlign.ts): words heard and possibly missed per
// verse, transitions, pauses (timing only). The learner hears the own take from any word and the reciter's word,
// confirms a rating per verse (FSRS via rateGrade) and the transitions; words, checks and links are recorded.
// Without recognition: a self check verse by verse. Never a pronunciation or tajweed score.
// Pro: surahs outside al-Fātiḥa and Juzʾ ʿAmma, as in talaqqī (FREE.shamsSurah).
type Src = "today" | "surah" | "page" | "section";
type Phase = "pick" | "ready" | "result" | "manual";
const clampRange = (r: Range): Range => {
  const s = Math.max(1, Math.min(114, r.s || 1));
  const n = VERSE_COUNTS[s - 1];
  const from = Math.max(1, Math.min(n, r.from || 1));
  return { s, from, to: Math.max(from, Math.min(n, r.to || n)) };
};

export function BlindScreen({ initial }: { initial?: Range }) {
  const [range, setRange] = useState<Range | null>(initial ? clampRange(initial) : null);
  const [phase, setPhase] = useState<Phase>(initial ? "ready" : "pick");
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {phase === "pick" || !range ? (
        <Picker initial={range} onPick={(x) => { setRange(clampRange(x)); setPhase("ready"); }} />
      ) : (
        <Session key={`${range.s}:${range.from}-${range.to}`} range={range} phase={phase} setPhase={setPhase} />
      )}
    </>
  );
}

/** the page (hero, content, honesty note) with the dock outside the scrolling content */
function Shell({ children, dock }: { children: ReactNode; dock?: ReactNode }) {
  const t = useTheme();
  const { r } = useRec();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Page contentContainerStyle={{ paddingBottom: dock ? DOCK_SPACE + 24 : 60 }}>
        <PageHero back topInset eyebrow={r("eyebrow")} arabic="التَّسْمِيعُ بِالغَيْب" title={r("blindTitle")} lead={r("blindLead")} />
        <View style={{ padding: 16, gap: 12 }}>{children}</View>
        <Text style={{ paddingHorizontal: 20, fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted }}>{r("honest")}</Text>
      </Page>
      {dock ? <Dock>{dock}</Dock> : null}
    </View>
  );
}

// ---------- choosing the passage ----------
function Picker({ initial, onPick }: { initial: Range | null; onPick: (r: Range) => void }) {
  const t = useTheme();
  const { cl } = useS2();
  const { r, nf } = useRec();
  const { name } = useSurahNames();
  const m = useShams2();
  const today = useMemo(() => (["sabaq", "sabqi", "manzil"] as const).flatMap((k) => m.wird[k].ranges.map((x) => ({ k, x }))), [m.wird]);
  const memorised = useMemo(() => [...new Set([...m.known.keys()].map((k) => Number(k.split(":")[0])))].sort((a, b) => a - b), [m.known]);
  const [src, setSrc] = useState<Src>(today.length && !initial ? "today" : "surah");
  const [sur, setSur] = useState(initial?.s ?? memorised[0] ?? 1);
  const n = VERSE_COUNTS[sur - 1];
  const [from, setFrom] = useState(initial?.from ?? 1);
  const [to, setTo] = useState(initial?.to ?? n);
  // another surah resets the verses; the first run keeps the passage the picker opened with
  const firstSur = useRef(true);
  useEffect(() => { if (firstSur.current) { firstSur.current = false; return; } setFrom(1); setTo(VERSE_COUNTS[sur - 1]); }, [sur]); // eslint-disable-line react-hooks/exhaustive-deps
  const { verses } = useSurahVerses(src === "page" ? sur : null);
  const pages = useMemo(() => {
    const out = new Map<number, Range>();
    for (const v of verses ?? []) { const p = v.page; const cur = out.get(p); out.set(p, cur ? { ...cur, to: Math.max(cur.to, v.verse_number) } : { s: sur, from: v.verse_number, to: v.verse_number }); }
    return [...out.entries()].sort((a, b) => a[0] - b[0]);
  }, [verses, sur]);
  const sections = maqasidOf(sur)?.sections ?? [];
  const label = (x: Range) => `${name(x.s)} · ${x.from === x.to ? r("verseOne", { a: nf(x.from) }) : r("verses", { a: nf(x.from), b: nf(x.to) })}`;
  const opt = (key: string, title: string, sub: string, onPress: () => void) => (
    <Pressable key={key} onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, opacity: pressed ? 0.85 : 1 })}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }}>{title}</Text>
        {sub ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{sub}</Text> : null}
      </View>
      <Icon name="chevronRight" size={14} color={t.muted} />
    </Pressable>
  );
  return (
    <Shell>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, textAlign: "left" }}>{r("pick")}</Text>
      <Segmented value={src} onChange={setSrc} options={[["today", r("src_today")], ["surah", r("src_surah")], ["page", r("src_page")], ["section", r("src_section")]]} />
      {src !== "today" ? (
        <Card>
          <Stepper label={r("src_surah")} value={sur} min={1} max={114} onChange={setSur} format={(x) => `${nf(x)} · ${name(x)}`} />
          {memorised.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {memorised.map((x) => <Chip key={x} label={name(x)} selected={x === sur} onPress={() => setSur(x)} />)}
            </ScrollView>
          ) : null}
        </Card>
      ) : null}
      {src === "today" ? (
        today.length ? today.map(({ k, x }) => opt(`${k}:${x.s}:${x.from}`, label(x), r(`k_${k}` as never), () => onPick(x))) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{r("noToday")}</Text>
      ) : src === "surah" ? (
        <Card>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Stepper label={r("from")} value={from} min={1} max={to} onChange={setFrom} format={(x) => nf(x)} />
            <Stepper label={r("to")} value={to} min={from} max={n} onChange={setTo} format={(x) => nf(x)} />
          </View>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Chip label={r("wholeSurah")} selected={from === 1 && to === n} onPress={() => { setFrom(1); setTo(n); }} />
          </View>
          <Capsule title={label({ s: sur, from, to })} onPress={() => onPick({ s: sur, from, to })} flex={0} />
        </Card>
      ) : src === "page" ? (
        !verses ? <Loading /> : pages.map(([p, x]) => opt(`p${p}`, r("pageN", { p: nf(p) }), label(x), () => onPick(x)))
      ) : sections.length ? (
        sections.map((x) => opt(`sec${x.from}`, x.title[cl], label({ s: sur, from: x.from, to: x.to }), () => onPick({ s: sur, from: x.from, to: x.to })))
      ) : (
        opt("whole", r("wholeSurah"), label({ s: sur, from: 1, to: n }), () => onPick({ s: sur, from: 1, to: n }))
      )}
    </Shell>
  );
}

// ---------- one take ----------
function Session({ range, phase, setPhase }: { range: Range; phase: Phase; setPhase: (p: Phase) => void }) {
  const t = useTheme();
  const { s } = useS2();
  const { r, nf } = useRec();
  const { pro } = usePro();
  const ent = useEntitlement("shams");
  const { name } = useSurahNames();
  const { verses, error } = useSurahVerses(range.s);
  const locked = !pro && !FREE.shamsSurah(range.s);
  // the verses of the range, cut to what one take can hold
  const all = useMemo(() => (verses ?? []).filter((v) => v.verse_number >= range.from && v.verse_number <= range.to), [verses, range]);
  const fit = useMemo(() => fitVerses(all.map((v) => wordsOf(v).length)), [all]);
  const list = useMemo(() => all.slice(0, fit), [all, fit]);
  const ref: RefVerse[] = useMemo(() => list.map((v) => ({ key: v.verse_key, words: wordsOf(v).map((w) => ({ position: w.position, text: w.text_uthmani })) })), [list]);
  const wordCount = ref.reduce((a, v) => a + v.words.length, 0);
  const take = useTake({ contextual: contextualOf(ref.flatMap((v) => v.words.map((w) => w.text))), persist: true, kind: "blind", range: { s: range.s, from: list[0]?.verse_number ?? range.from, to: list.at(-1)?.verse_number ?? range.to } });
  const [res, setRes] = useState<BlindResult | null>(null);
  const [aligning, setAligning] = useState(false);
  useEffect(() => {
    if (!take.result) return;
    setAligning(true);
    let gone = false;
    // in slices with pauses, so a long passage does not freeze the screen
    void blindAlignAsync(ref, take.result.words, {}, () => gone).then((x) => { if (gone || !x) return; setRes(x); setAligning(false); setPhase("result"); });
    return () => { gone = true; };
  }, [take.result]); // eslint-disable-line react-hooks/exhaustive-deps
  const onDevice = useOnDeviceArabic();
  // recognition on this device not confirmed: straight to the self check (nothing is ever sent to a server)
  useEffect(() => { if (onDevice === false && phase === "ready") setPhase("manual"); }, [onDevice]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (take.state === "unavailable" || take.state === "denied") setPhase("manual"); }, [take.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const title = `${name(range.s)} · ${list.length && list.length < all.length ? r("verses", { a: nf(range.from), b: nf(list.at(-1)!.verse_number) }) : range.from === range.to ? r("verseOne", { a: nf(range.from) }) : r("verses", { a: nf(range.from), b: nf(range.to) })}`;
  // "again": a take whose ratings were never saved is not kept
  const again = (saved: boolean) => { if (!saved && take.result?.id) deleteTake(take.result.id); take.reset(); setRes(null); setPhase("ready"); };
  const other = () => { take.reset(); setRes(null); setPhase("pick"); };

  if (locked) {
    return (
      <Shell dock={<Capsule title={s("unlock")} onPress={() => ent.upsell()} />}>
        <Card gold><Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{s("proSurah")}</Text></Card>
        <View style={{ flexDirection: "row" }}><Chip label={r("other")} onPress={other} /></View>
      </Shell>
    );
  }
  if (error) return <Shell dock={<Capsule title={r("other")} tone="quiet" onPress={other} />}><Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{r("loadFailed")}</Text></Shell>;
  if (!verses) return <Shell><Loading /></Shell>;

  if (phase === "manual") return <Manual list={list} title={title} denied={take.state === "denied"} onOther={other} />;
  if (phase === "result" && res && take.result) return <Result range={range} list={list} res={res} take={take.result} title={title} onAgain={again} onOther={other} />;

  const listening = take.state === "listening" || take.state === "stopping";
  const dock = listening ? <Capsule title={r("stop")} tone="red" disabled={take.state === "stopping"} onPress={take.stop} /> : (
    <Capsule title={r("start")} tone="emerald" disabled={!ref.length || aligning} onPress={() => void take.start()} />
  );
  return (
    <Shell dock={dock}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "left" }}>{title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "left" }}>{r("words", { n: nf(wordCount) })}</Text>
        {list.length < all.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.gold }}>{r("tooLong", { v: nf(list.at(-1)!.verse_number) })}</Text> : null}
        <Card gold style={{ alignItems: "center", paddingVertical: 34, gap: 14 }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", backgroundColor: listening ? "rgba(160,58,52,0.12)" : t.accentSoft, borderWidth: 1, borderColor: listening ? "rgba(160,58,52,0.4)" : "rgba(201,166,94,0.55)" }}>
            {aligning || take.state === "stopping" ? <ActivityIndicator color={t.gold} /> : <Icon name={listening ? "speaker" : "eye"} size={34} color={listening ? "rgb(160,58,52)" : t.gold} />}
          </View>
          <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "center" }}>
            {aligning ? r("aligning") : listening ? r("listening", { n: nf(take.count) }) : take.state === "silent" ? r("heardNothing") : r("hidden")}
          </Text>
          {onDevice ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "center" }}>{r("onDevice")}</Text> : null}
        </Card>
        {!listening ? <View style={{ flexDirection: "row" }}><Chip label={r("other")} onPress={other} /></View> : null}
    </Shell>
  );
}

// ---------- playback: the own take from a time, the reciter's word ----------
function usePlayback(take: TakeOut | null) {
  const player = useAudioPlayer(null);
  const audio = useVerseAudio();
  const end = useRef<number | null>(null);
  useEffect(() => () => { audio.stop(); try { player.pause(); } catch { /* released */ } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (end.current === null || !audio.playing || audio.positionMs < end.current) return;
    audio.pause(); end.current = null;
  }, [audio.positionMs, audio.playing]); // eslint-disable-line react-hooks/exhaustive-deps
  const mine = async (ms: number) => {
    if (!take?.parts.length) return;
    const part = [...take.parts].reverse().find((p) => p.offset <= ms) ?? take.parts[0];
    audio.pause();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    player.replace({ uri: part.uri });
    await player.seekTo(Math.max(0, (ms - part.offset - 600) / 1000)).catch(() => undefined);
    player.play();
  };
  const reciter = (v: Verse, position: number) => {
    const seg = v.segments.find((x) => x.word === position);
    try { player.pause(); } catch { /* idle */ }
    end.current = seg ? seg.end : null;
    audio.play(v.audioUrl, { fallback: v.remoteAudioUrl, fromMs: seg?.start ?? 0, track: false });
  };
  return { mine, reciter, hasMine: !!take?.parts.length };
}

const WHY: Record<LinkReason, "why_missing" | "why_order" | "why_restart" | "why_pause"> = { missing: "why_missing", order: "why_order", restart: "why_restart", pause: "why_pause" };

function Result({ range, list, res, take, title, onAgain, onOther }: { range: Range; list: Verse[]; res: BlindResult; take: TakeOut; title: string; onAgain: (saved: boolean) => void; onOther: () => void }) {
  const t = useTheme();
  const { s } = useS2();
  const { r, nf } = useRec();
  const { pro } = usePro();
  const play = usePlayback(take);
  // no rating is chosen for the verses after the last heard word (the take may have ended there), nor their transitions
  const reached = useMemo(() => new Set(res.verses.slice(0, res.lastHeard + 1).map((v) => v.key)), [res]);
  const [grades, setGrades] = useState<Record<string, 1 | 2 | 3 | 4 | null>>(() => suggestedGrades(res));
  const [links, setLinks] = useState<Record<string, boolean | undefined>>(() => Object.fromEntries(res.links.map((l) => [l.key, reached.has(l.key) ? l.ok : undefined])));
  const [active, setActive] = useState<{ key: string; position: number } | null>(null);
  const [saved, setSaved] = useState(false);
  const done = useRef<SavedRatings>(NOTHING_SAVED); // what the saves so far have written
  const grownRef = useRef(0);
  const [kept, setKept] = useState(!!take.id);
  const missed = res.total - res.heard;
  const byKey = useMemo(() => new Map(list.map((v) => [v.verse_key, v])), [list]);
  const vNum = (k: string) => nf(Number(k.split(":")[1]));

  const save = () => {
    if (saved) return;
    // the heard words are recorded once (for the verses the take reached); ratings: only what changed since the last save
    if (!wasSaved(done.current)) for (const v of res.verses) if (reached.has(v.key)) { noteWords(v.key, v.words.map((w) => ({ position: w.position, ok: w.ok }))); noteCheck(v.key, v.heard, v.total); }
    const { saved: next, newlyGood } = saveRatings(done.current, grades, links);
    done.current = next;
    for (let k = 0; k < newlyGood.length && grownRef.current < 10; k++) { shamsGrow("verse", pro); grownRef.current++; }
    setSaved(true);
  };
  const practise = () => {
    const weak = res.verses.find((v) => v.words.some((w) => !w.ok));
    if (weak) {
      const [a, b] = weak.key.split(":");
      router.push(`/shams/drill?s=${a}&v=${b}&w=${weak.words.filter((w) => !w.ok).map((w) => w.position).slice(0, 12).join(",")}` as Href);
      return;
    }
    const stalled = res.links.find((l) => links[l.key] === false);
    if (stalled) { const [a, b] = stalled.key.split(":"); router.push(`/shams/drill?s=${a}&v=${b}&mode=link` as Href); return; }
    router.push(`/shams/drill?s=${range.s}&v=${range.from}&mode=phrase` as Href);
  };
  const onWord = (key: string, position: number) => {
    setActive({ key, position });
    const v = res.verses.find((x) => x.key === key);
    if (!v) return;
    // the own take from this word; a missed word from the heard word before it
    const i = v.words.findIndex((w) => w.position === position);
    const at = v.words.slice(0, i + 1).reverse().find((w) => w.t !== null)?.t ?? v.t;
    if (at !== null && play.hasMine) void play.mine(at);
  };

  const anyRating = Object.values(grades).some((g) => !!g) || Object.values(links).some((x) => x !== undefined);
  const dock = saved ? <Capsule title={r("practise")} onPress={practise} /> : <Capsule title={r("save")} disabled={!anyRating} onPress={save} />;
  return (
    <Shell dock={dock}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "left" }}>{title}</Text>
        <Card gold>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{r("result")}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: missed ? t.gold : t.accent }}>{s("heardOf", { n: nf(res.heard), total: nf(res.total) })}</Text>
          {missed ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.ink }}>{r("missed", { n: nf(missed) })}</Text> : null}
          {play.hasMine ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{r("tapWord")}</Text> : null}
        </Card>

        <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, marginTop: 4 }}>{r("rateTitle")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{r("rateLead")}</Text>
        {res.verses.map((v) => {
          const verse = byKey.get(v.key);
          const marks = new Map(v.words.map((w) => [w.position, w.ok] as const));
          const tone = v.status === "ok" ? "ok" : v.status === "partial" ? "warn" : "bad";
          const act = active?.key === v.key ? active.position : null;
          return (
            <Card key={v.key}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 14.5, color: t.ink }}>{s("verseN", { v: vNum(v.key) })}</Text>
                <Pill label={r(`st_${v.status}` as never)} tone={tone} />
                {v.repeated ? <Pill label={r("repeated")} tone="info" /> : null}
                <Text style={{ marginStart: "auto", fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{`${nf(v.heard)}/${nf(v.total)}`}</Text>
              </View>
              {verse ? <MarkedWords words={wordsOf(verse).map((w) => ({ position: w.position, text: w.text_uthmani }))} marks={marks} active={act} onWord={(p) => onWord(v.key, p)} /> : null}
              {act !== null && verse ? (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {play.hasMine ? <Chip label={r("mine")} onPress={() => onWord(v.key, act)} /> : null}
                  <Chip label={r("reciter")} onPress={() => play.reciter(verse, act)} />
                </View>
              ) : null}
              <RateChips value={grades[v.key] ?? 0} onChange={(g) => { setGrades((x) => ({ ...x, [v.key]: g })); setSaved(false); }} labels={[r("r1"), r("r2"), r("r3"), r("r4")]} />
            </Card>
          );
        })}

        {res.links.length ? (
          <Card>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{r("links")}</Text>
            {res.links.map((l) => (
              <View key={l.key} style={{ gap: 6, paddingVertical: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink, textAlign: "left" }}>{`${vNum(l.from)} → ${vNum(l.key)}`}</Text>
                  <Chip label={r("link_ok")} selected={links[l.key] === true} onPress={() => { setLinks((x) => ({ ...x, [l.key]: true })); setSaved(false); }} />
                  <Chip label={r("link_stalled")} selected={links[l.key] === false} onPress={() => { setLinks((x) => ({ ...x, [l.key]: false })); setSaved(false); }} />
                </View>
                {l.reason ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "left" }}>{r(WHY[l.reason], { s: nf(Math.round((l.pauseMs ?? 0) / 100) / 10) })}</Text> : null}
              </View>
            ))}
          </Card>
        ) : null}

        {res.hesitations.length ? (
          <Card>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{r("pauses")}</Text>
            {res.hesitations.slice(0, 12).map((h) => (
              <Text key={`${h.key}:${h.position}`} style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "left" }}>
                {r("pauseAt", { s: nf(Math.round(h.ms / 100) / 10), w: nf(h.position), v: vNum(h.key) })}
              </Text>
            ))}
          </Card>
        ) : null}

        {saved ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{r("saved")}</Text> : null}
        {kept && take.id ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{r("takeKept")}</Text>
            <Chip label={r("deleteTake")} onPress={() => { deleteTake(take.id!); setKept(false); }} />
          </View>
        ) : null}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}><Chip label={r("again")} onPress={() => onAgain(wasSaved(done.current))} /><Chip label={r("other")} onPress={onOther} /></View>
    </Shell>
  );
}

// ---------- without speech recognition: a self check, verse by verse ----------
function Manual({ list, title, denied, onOther }: { list: Verse[]; title: string; denied: boolean; onOther: () => void }) {
  const t = useTheme();
  const { s } = useS2();
  const { r, nf } = useRec();
  const { pro } = usePro();
  const [shown, setShown] = useState<Set<string>>(new Set());
  const [grades, setGrades] = useState<Record<string, 1 | 2 | 3 | 4>>({});
  const [links, setLinks] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const done = useRef<SavedRatings>(NOTHING_SAVED); // what the saves so far have written
  const grownRef = useRef(0);
  // a second save applies only the changed verses and transitions, replacing their earlier rating (rated.ts)
  const save = () => {
    if (saved) return;
    const { saved: next, newlyGood } = saveRatings(done.current, grades, links);
    done.current = next;
    for (let k = 0; k < newlyGood.length && grownRef.current < 10; k++) { shamsGrow("verse", pro); grownRef.current++; }
    setSaved(true);
  };
  return (
    <Shell dock={<Capsule title={r("save")} disabled={(!Object.keys(grades).length && !Object.keys(links).length) || saved} onPress={save} />}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "left" }}>{title}</Text>
        <Card gold><Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink }}>{denied ? r("denied") : r("unavailable")}</Text><Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{r("manualLead")}</Text></Card>
        {list.map((v, i) => {
          const open = shown.has(v.verse_key);
          return (
            <Card key={v.verse_key}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 14.5, color: t.ink }}>{s("verseN", { v: nf(v.verse_number) })}</Text>
              {open ? <MarkedWords words={wordsOf(v).map((w) => ({ position: w.position, text: w.text_uthmani }))} marks={new Map()} /> : (
                <Chip label={r("reveal")} onPress={() => setShown((x) => new Set(x).add(v.verse_key))} />
              )}
              {open ? <RateChips value={grades[v.verse_key] ?? 0} onChange={(g) => { setGrades((x) => ({ ...x, [v.verse_key]: g })); setSaved(false); }} labels={[r("r1"), r("r2"), r("r3"), r("r4")]} /> : null}
              {open && i > 0 && list[i - 1].verse_number === v.verse_number - 1 ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{`${r("links")} ${nf(v.verse_number - 1)} → ${nf(v.verse_number)}`}</Text>
                  <Chip label={r("link_ok")} selected={links[v.verse_key] === true} onPress={() => { setLinks((x) => ({ ...x, [v.verse_key]: true })); setSaved(false); }} />
                  <Chip label={r("link_stalled")} selected={links[v.verse_key] === false} onPress={() => { setLinks((x) => ({ ...x, [v.verse_key]: false })); setSaved(false); }} />
                </View>
              ) : null}
            </Card>
          );
        })}
        {saved ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{r("saved")}</Text> : null}
        <View style={{ flexDirection: "row" }}><Chip label={r("other")} onPress={onOther} /></View>
    </Shell>
  );
}
