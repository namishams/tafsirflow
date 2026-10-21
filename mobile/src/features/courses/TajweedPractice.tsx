import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero, useWide } from "@/components/page";
import { Eyebrow, GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { FONT, FWD, R, useTheme } from "@/lib/theme";
import { useEntitlement } from "@/lib/entitlements";
import { getChapters, type Chapter } from "@/lib/quran";
import { useEffect } from "react";
import { HmCard } from "@/features/extra/art";
import { StepIn } from "@/features/coursekit/motion";
import { GoldRing } from "@/features/today/art";
import { award } from "@/web/points";
import { PRACTICE, RULES, type PracticeItem, type RuleId } from "./content/tajweedPractice";
import { tx } from "./index";
import { Quiz, type RunQ } from "./Screens";
import { useCT } from "./texts";

// /tajweed/practice – practice the tajweed rules on real verses (by verse key, the text comes from the Quran API):
// "find the rule" (ten random places), a quiz per surah, and the in-depth course. Free: the first round of the game
// and al-Fatiha / the last three surahs; everything else Pro.

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const FREE_SURAHS = new Set([1, 112, 113, 114]);
const surahOf = (k: string) => Number(k.split(":")[0]);
const verseNo = (k: string) => Number(k.split(":")[1]);

function useQuestions(items: PracticeItem[], lang: string, c: ReturnType<typeof useCT>): RunQ[] {
  return useMemo(() => items.map((it) => {
    const others = shuffle((Object.keys(RULES) as RuleId[]).filter((r) => r !== it.rule)).slice(0, 3);
    const opts = shuffle([it.rule, ...others]);
    return { q: c("tjWhich", { w: it.word }), verse: it.key, options: opts.map((r) => tx(RULES[r].name, lang)), answer: opts.indexOf(it.rule), explain: tx(RULES[it.rule].hint, lang) };
  }), [items, lang]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function TajweedPracticeScreen() {
  const t = useTheme();
  const c = useCT();
  const { lang } = useLang();
  const wide = useWide();
  const ent = useEntitlement("tajweed");
  const [mode, setMode] = useState<null | { kind: "find" } | { kind: "surah"; s: number }>(null);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ right: number; n: number } | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  const surahs = useMemo(() => Array.from(new Set(PRACTICE.map((p) => surahOf(p.key)))).sort((a, b) => a - b), []);
  const items = useMemo(() => {
    if (!mode) return [];
    if (mode.kind === "find") return shuffle(PRACTICE).slice(0, 10);
    return PRACTICE.filter((p) => surahOf(p.key) === mode.s).sort((a, b) => verseNo(a.key) - verseNo(b.key));
  }, [mode, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const qs = useQuestions(items, lang, c);
  const name = (s: number) => chapters.find((x) => x.id === s)?.name_simple ?? String(s);
  const start = (m: NonNullable<typeof mode>) => {
    const free = m.kind === "find" ? round === 0 : FREE_SURAHS.has(m.s);
    if (!ent.allowed && !free) { ent.upsell(); return; }
    setResult(null); setMode(m); setRound((r) => r + 1);
  };
  const done = (right: number) => { award("quiz"); setResult({ right, n: qs.length }); };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow="Tajweed" title={c("tjPractice")} lead={c("tjPracticeLead")} arabic="تجويد" />
        <View style={{ padding: 16, gap: 14 }}>
          {mode && !result ? (
            <>
              <Quiz key={`${round}`} qs={qs} onDone={done} header={<Eyebrow>{mode.kind === "find" ? c("tjFind") : name(mode.s)}</Eyebrow>} />
              <OutlineButton title={c("overview")} onPress={() => setMode(null)} />
            </>
          ) : result ? (
            <StepIn style={{ alignItems: "center", gap: 12 }}>
              <GoldRing value={result.right / Math.max(1, result.n)} size={120} stroke={7} dark={false}>
                <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{result.right}/{result.n}</Text>
              </GoldRing>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{c("tjScore", { n: result.right, m: result.n })}</Text>
              <View style={{ alignSelf: "stretch", gap: 10 }}>
                <GoldButton title={c("tjAgain")} onPress={() => mode && start(mode)} />
                <OutlineButton title={c("overview")} onPress={() => { setMode(null); setResult(null); }} />
              </View>
            </StepIn>
          ) : (
            <>
              <View style={{ flexDirection: wide ? "row" : "column", gap: 12 }}>
                <HmCard onPress={() => start({ kind: "find" })} accessibilityLabel={`${c("tjFind")}. ${c("tjFindLead")}`} style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{c("tjFind")}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 4 }}>{c("tjFindLead")}</Text>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.accent, marginTop: 10 }}>{`${c("start")} ${FWD}`}</Text>
                </HmCard>
                <HmCard onPress={() => router.push("/courses/tajweed-deep" as Href)} accessibilityLabel={c("tjDeep")} style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{c("tjDeep")}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 4 }}>{c("coursesCard")}</Text>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.accent, marginTop: 10 }}>{`${c("continue")} ${FWD}`}</Text>
                </HmCard>
              </View>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, marginTop: 10 }}>{c("tjSurah")}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{c("tjSurahLead")}</Text>
              <View style={{ gap: 8 }}>
                {surahs.map((s) => {
                  const n = PRACTICE.filter((p) => surahOf(p.key) === s).length;
                  const locked = !ent.allowed && !FREE_SURAHS.has(s);
                  return (
                    <Pressable key={s} onPress={() => start({ kind: "surah", s })} accessibilityRole="button" accessibilityLabel={`${name(s)}, ${c("tjItems", { n })}${locked ? ", Pro" : ""}`}
                      style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: "rgba(150,116,52,0.22)", backgroundColor: t.surface }}>
                      <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.gold, minWidth: 28 }}>{s}</Text>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, flex: 1 }}>{name(s)}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{c("tjItems", { n })}</Text>
                      {locked ? <Icon name="lock" size={14} color={t.gold} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </Page>
    </>
  );
}

/** entry card for the tajweed course page */
export function TajweedPracticeEntry() {
  const t = useTheme();
  const c = useCT();
  return (
    <HmCard onPress={() => router.push("/tajweed/practice" as Href)} accessibilityLabel={`${c("tjPractice")}. ${c("tjPracticeLead")}`} style={{ marginHorizontal: 16, marginTop: 16 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{c("tjPractice")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 4 }}>{c("tjPracticeLead")}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.accent, marginTop: 10 }}>{`${c("start")} ${FWD}`}</Text>
    </HmCard>
  );
}
