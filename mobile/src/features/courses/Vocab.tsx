import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { ErrorState, Loading, Page, PageHero } from "@/components/page";
import { Chip, GoldButton, GoldProgress, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { ARABIC_FONT, FONT, FWD, R, useTheme } from "@/lib/theme";
import { useEntitlement } from "@/lib/entitlements";
import { FREE } from "@/lib/pro";
import { RECITERS, getChapters, getVerses, type Chapter } from "@/lib/quran";
import { HmCard } from "@/features/extra/art";
import { StepIn } from "@/features/coursekit/motion";
import { gEvent } from "@/features/feed/gamify";
import { tick } from "@/features/feed/haptics";
import { VOCAB_DECKS, type Word } from "@/web/vocab";
import { meaning } from "@/web/vocabI18n";
import { award } from "@/web/points";
import { Quiz, type RunQ } from "./Screens";
import { useCT } from "./texts";

// More vocabulary decks (the existing trainer and its decks are unchanged):
//  - by surah: every distinct word of a surah with its word-by-word meaning, straight from the Quran API (nothing typed)
//  - by theme: the core vocabulary regrouped by word type and by root family
// Cards (flip, "I knew it" / "Again") and a quiz; reviewed words count as vocabulary points.
type Card = { ar: string; tr: string };
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const ALL: Word[] = VOCAB_DECKS.flatMap((d) => d.words);
const TYPES = ["verbs", "names", "nouns", "adjectives", "particles", "pronouns"] as const;
const TYPE_OF: Record<(typeof TYPES)[number], Word["type"][]> = { verbs: ["verb"], names: ["name"], nouns: ["noun"], adjectives: ["adjective"], particles: ["particle"], pronouns: ["pronoun"] };
const ROOTS = (() => { const m = new Map<string, Word[]>(); for (const w of ALL) if (w.root) m.set(w.root, [...(m.get(w.root) ?? []), w]); return [...m.entries()].filter(([, ws]) => ws.length >= 3).sort((a, b) => b[1].length - a[1].length).slice(0, 24); })();
const FREE_THEMES = 1;

export function VocabDecksEntry() {
  const t = useTheme();
  const c = useCT();
  return (
    <HmCard onPress={() => router.push("/vocab-decks" as Href)} accessibilityLabel={`${c("vdTitle")}. ${c("vdLead")}`} style={{ marginHorizontal: 16, marginTop: 16 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{c("vdTitle")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 4 }}>{c("vdLead")}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.accent, marginTop: 10 }}>{`${c("start")} ${FWD}`}</Text>
    </HmCard>
  );
}

export function VocabDecksScreen() {
  const t = useTheme();
  const c = useCT();
  const { lang } = useLang();
  const ent = useEntitlement("vocab");
  const [ch, setCh] = useState<Chapter[]>([]);
  useEffect(() => { getChapters(lang).then(setCh).catch(() => undefined); }, [lang]);
  const go = (deck: string, free: boolean) => (free || ent.allowed ? router.push(`/vocab-decks/${deck}` as Href) : ent.upsell());
  const themes: [string, string, number][] = [
    ...TYPES.map((k) => [`type-${k}`, c(`theme_${k}` as never), ALL.filter((w) => TYPE_OF[k].includes(w.type)).length] as [string, string, number]),
    ...ROOTS.map(([r, ws]) => [`root-${encodeURIComponent(r)}`, c("theme_root", { r }), ws.length] as [string, string, number]),
  ];
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset title={c("vdTitle")} lead={c("vdLead")} />
        <View style={{ padding: 16, gap: 10 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink }}>{c("vdByTheme")}</Text>
          {themes.map(([id, title, n], i) => (
            <Pressable key={id} onPress={() => go(id, i < FREE_THEMES)} accessibilityRole="button" accessibilityLabel={`${title}, ${c("vdWords", { n })}`}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, flex: 1 }}>{title}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{c("vdWords", { n })}</Text>
              {i >= FREE_THEMES && !ent.allowed ? <Icon name="lock" size={14} color={t.gold} /> : null}
            </Pressable>
          ))}
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, marginTop: 12 }}>{c("vdBySurah")}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {ch.map((x) => <Chip key={x.id} label={`${x.id} ${x.name_simple}${!ent.allowed && !FREE.shamsSurah(x.id) ? " (Pro)" : ""}`} onPress={() => go(`surah-${x.id}`, FREE.shamsSurah(x.id))} />)}
          </View>
        </View>
      </Page>
    </>
  );
}

function useDeck(id: string, lang: string): { title: string; cards: Card[] | null; failed: boolean } {
  const c = useCT();
  const [cards, setCards] = useState<Card[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [title, setTitle] = useState("");
  useEffect(() => {
    setCards(null); setFailed(false);
    if (id.startsWith("surah-")) {
      const s = Number(id.slice(6));
      Promise.all([getVerses(s, lang, RECITERS[0]), getChapters(lang)]).then(([vs, chs]) => {
        setTitle(chs.find((x) => x.id === s)?.name_simple ?? String(s));
        const seen = new Map<string, Card>();
        for (const v of vs) for (const w of v.words) if (w.char_type_name === "word" && !seen.has(w.text_uthmani) && (w.translation?.text ?? "").trim()) seen.set(w.text_uthmani, { ar: w.text_uthmani, tr: w.translation!.text.trim() });
        setCards([...seen.values()]);
      }).catch(() => setFailed(true));
    } else if (id.startsWith("type-")) {
      const k = id.slice(5) as (typeof TYPES)[number];
      setTitle(c(`theme_${k}` as never));
      setCards(ALL.filter((w) => (TYPE_OF[k] ?? []).includes(w.type)).map((w) => ({ ar: w.ar, tr: meaning(w, lang) })));
    } else if (id.startsWith("root-")) {
      const r = decodeURIComponent(id.slice(5));
      setTitle(c("theme_root", { r }));
      setCards(ALL.filter((w) => w.root === r).map((w) => ({ ar: w.ar, tr: meaning(w, lang) })));
    } else setCards([]);
  }, [id, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  return { title, cards, failed };
}

export function VocabDeckScreen({ id }: { id: string }) {
  const t = useTheme();
  const c = useCT();
  const { lang } = useLang();
  const { title, cards, failed } = useDeck(id, lang);
  const [mode, setMode] = useState<"cards" | "quiz">("cards");
  const [queue, setQueue] = useState<Card[]>([]);
  const [shown, setShown] = useState(false);
  const [known, setKnown] = useState(0);
  const [quizDone, setQuizDone] = useState<number | null>(null);
  useEffect(() => { if (cards) { setQueue(shuffle(cards)); setKnown(0); } }, [cards]);
  const qs: RunQ[] = useMemo(() => {
    if (!cards || cards.length < 4) return [];
    return shuffle(cards).slice(0, 10).map((k) => {
      const opts = shuffle([k.tr, ...shuffle(cards.filter((x) => x.tr !== k.tr)).slice(0, 3).map((x) => x.tr)]);
      return { q: k.ar, options: opts, answer: opts.indexOf(k.tr) };
    });
  }, [cards, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  if (failed) return <ErrorState retry={() => router.replace(`/vocab-decks/${id}` as Href)} />;
  if (!cards) return <Loading />;
  const cur = queue[0];
  const rate = (ok: boolean) => {
    award("vocab"); gEvent({ t: "words", n: 1 }); tick();
    if (ok) setKnown((n) => n + 1);
    setQueue((q) => (ok ? q.slice(1) : [...q.slice(1), q[0]]));
    setShown(false);
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={c("vdTitle")} title={title} lead={c("vdWords", { n: cards.length })} />
        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Chip label={c("vdCards")} selected={mode === "cards"} onPress={() => setMode("cards")} />
            {qs.length ? <Chip label={c("vdQuiz")} selected={mode === "quiz"} onPress={() => { setQuizDone(null); setMode("quiz"); }} /> : null}
          </View>
          {mode === "cards" ? (
            cur ? (
              <StepIn key={`${cur.ar}-${queue.length}`} style={{ gap: 12 }}>
                <GoldProgress value={known / Math.max(1, cards.length)} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{c("vdKnown", { n: known, m: cards.length })}</Text>
                <Pressable onPress={() => setShown(true)} accessibilityRole="button" accessibilityLabel={shown ? `${cur.ar}: ${cur.tr}` : c("vdShow")}
                  style={{ minHeight: 200, alignItems: "center", justifyContent: "center", padding: 20, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(150,116,52,0.35)", backgroundColor: t.surface, gap: 12 }}>
                  <Text style={{ fontFamily: ARABIC_FONT, fontSize: 40, lineHeight: 72, color: t.ink, writingDirection: "rtl" }}>{cur.ar}</Text>
                  {shown ? <Text style={{ fontFamily: FONT.semibold, fontSize: 18, color: t.accent, textAlign: "center" }}>{cur.tr}</Text> : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{c("vdShow")}</Text>}
                </Pressable>
                {shown ? (
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ flex: 1 }}><OutlineButton title={c("vdAgain")} onPress={() => rate(false)} /></View>
                    <View style={{ flex: 1 }}><GoldButton title={c("vdKnew")} onPress={() => rate(true)} /></View>
                  </View>
                ) : null}
              </StepIn>
            ) : (
              <StepIn style={{ alignItems: "center", gap: 12 }}>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{c("vdDone")}</Text>
                <GoldButton title={c("tjAgain")} onPress={() => { setQueue(shuffle(cards)); setKnown(0); }} />
              </StepIn>
            )
          ) : quizDone === null ? (
            <Quiz qs={qs} onDone={(r) => { award("quiz"); setQuizDone(r); }} />
          ) : (
            <StepIn style={{ alignItems: "center", gap: 12 }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{c("result", { n: quizDone, m: qs.length })}</Text>
              <GoldButton title={c("tjAgain")} onPress={() => { setQuizDone(null); setMode("cards"); setTimeout(() => setMode("quiz"), 0); }} />
            </StepIn>
          )}
        </View>
      </Page>
    </>
  );
}
