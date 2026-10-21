import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Chip, GoldCard, GoldProgress, OutlineButton, SectionTitle } from "@/components/brand";
import { Page, PageHero } from "@/components/page";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useTradition } from "@/lib/tradition";
import { TOTAL_VERSES } from "@/web/quranIndex";
import { formatNumber } from "@/features/progress/format";
import { loadVerse } from "@/features/srs/verse";
import type { HadithItem } from "@/features/hadith/data";
import {
  allLemmas, doneHadith, doneKhatm, doneLemmas, doneMut, doneReview, doneTafsir, hadithSequence, isToday, khatmPortion, knownIndices,
  loadHadith, MUT_COUNT, mutGroup, rangesOf, readerHref, reviewPortion, workOf, type Lemma, type Range,
} from "./engines";
import { PER_OPTIONS, setPer, useJourney, type EngineId } from "./store";
import { useJT, type JKey } from "./texts";

// /journey/today – the endless daily plans. Each card shows today's portion, where it sits in its cycle, and one
// quiet "done" button; finishing a cycle simply starts the next one. Nothing is due, nothing is lost, no reminders.

export default function JourneyTodayScreen() {
  const jt = useJT();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back arabic="رحلة العلم" eyebrow={jt("eyebrow")} title={jt("todayTitle")} lead={jt("todayLead")} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 22 }}>
          <KhatmCard />
          <ReviewCard />
          <TafsirCard />
          <HadithCard />
          <LemmaCard />
          <MutCard />
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: useTheme().muted }}>{jt("todayNote")}</Text>
        </View>
      </Page>
    </>
  );
}

function useNf() { const { lang } = useLang(); return (n: number) => formatNumber(n, lang); }

function PlanCard({ id, title, line, frac, children, onDone, doneLabel, perLabel }: {
  id: EngineId; title: string; line: string; frac: number; children: ReactNode; onDone?: () => void; doneLabel?: string; perLabel?: (n: number) => string;
}) {
  const t = useTheme();
  const jt = useJT();
  const j = useJourney();
  const e = j.e[id];
  return (
    <GoldCard>
      <SectionTitle title={title} style={{ marginBottom: 4 }} />
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{line}</Text>
      <View style={{ marginTop: 10 }}><GoldProgress value={frac} /></View>
      <View style={{ marginTop: 14, gap: 10 }}>{children}</View>
      {perLabel ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }} accessibilityLabel={jt("portionSize")}>
          {PER_OPTIONS[id].map((n) => <Chip key={n} label={perLabel(n)} selected={e.per === n} onPress={() => setPer(id, n)} />)}
        </View>
      ) : null}
      {onDone ? (
        <View style={{ marginTop: 14, gap: 6 }}>
          <OutlineButton title={doneLabel ?? jt("markDone")} icon="check" onPress={onDone} />
          {isToday(e.last) ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.gold }}>{jt("doneToday")}</Text> : null}
        </View>
      ) : null}
    </GoldCard>
  );
}

function Ranges({ list, tafsir = false }: { list: Range[]; tafsir?: boolean }) {
  const t = useTheme();
  const jt = useJT();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {list.slice(0, 12).map((r) => {
        const label = r.a === r.b ? `${r.s}:${r.a}` : `${r.s}:${r.a}–${r.b}`;
        return <Chip key={label} label={label} onPress={() => router.push(readerHref(r.s, r.a, tafsir) as Href)} />;
      })}
      {list.length > 12 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, alignSelf: "center" }}>{jt("moreRanges", { n: list.length - 12 })}</Text> : null}
    </View>
  );
}

function KhatmCard() {
  const jt = useJT();
  const nf = useNf();
  const e = useJourney().e.khatm;
  const p = khatmPortion(e.pos, e.per);
  return (
    <PlanCard id="khatm" title={jt("e_khatm")} frac={e.pos / TOTAL_VERSES} line={jt("khatmLine", { c: nf(e.cycles + 1), a: nf(e.pos), b: nf(TOTAL_VERSES) })}
      onDone={doneKhatm} doneLabel={jt("markRead")} perLabel={(n) => jt("versesN", { n: nf(n) })}>
      <Ranges list={rangesOf(p.idx)} />
    </PlanCard>
  );
}

function ReviewCard() {
  const t = useTheme();
  const jt = useJT();
  const nf = useNf();
  const e = useJourney().e.review;
  const known = useMemo(() => knownIndices(), [e.pos, e.cycles]); // eslint-disable-line react-hooks/exhaustive-deps
  const p = reviewPortion(e.pos, e.per, known);
  if (!known.length) return (
    <PlanCard id="review" title={jt("e_review")} frac={0} line={jt("reviewEmpty")}>
      <OutlineButton title={jt("openShams")} icon="sun" onPress={() => router.push("/shams" as Href)} />
    </PlanCard>
  );
  return (
    <PlanCard id="review" title={jt("e_review")} frac={e.pos / TOTAL_VERSES} line={jt("reviewLine", { c: nf(e.cycles + 1), n: nf(known.length) })}
      onDone={doneReview} doneLabel={jt("markRecited")} perLabel={(n) => jt("versesN", { n: nf(n) })}>
      <Ranges list={rangesOf(p.idx)} />
      <OutlineButton title={jt("openWird")} icon="repeat" onPress={() => router.push("/shams/wird" as Href)} />
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{jt("reviewHint")}</Text>
    </PlanCard>
  );
}

function TafsirCard() {
  const t = useTheme();
  const jt = useJT();
  const nf = useNf();
  const e = useJourney().e.tafsir;
  const w = workOf(e.cycles + 1);
  const p = khatmPortion(e.pos, e.per);
  return (
    <PlanCard id="tafsir" title={jt("e_tafsir")} frac={e.pos / TOTAL_VERSES} line={jt("tafsirLine", { c: nf(e.cycles + 1), w: jt(`work_${w.key}` as JKey), a: nf(e.pos), b: nf(TOTAL_VERSES) })}
      onDone={doneTafsir} doneLabel={jt("markRead")} perLabel={(n) => jt("versesN", { n: nf(n) })}>
      <Ranges list={rangesOf(p.idx)} tafsir />
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted }}>{jt("tafsirHint")}</Text>
    </PlanCard>
  );
}

function HadithCard() {
  const t = useTheme();
  const jt = useJT();
  const nf = useNf();
  const { lang } = useLang();
  const { tradition } = useTradition();
  const j = useJourney();
  const e = j.e.hadith;
  const seq = useMemo(() => hadithSequence(tradition), [tradition]);
  const col = seq[j.hCol % Math.max(1, seq.length)];
  const [h, setH] = useState<{ item: HadithItem | null; n: number } | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (!col) return;
    let off = false;
    setH(null); setErr(false);
    loadHadith(col, e.pos, lang).then((x) => { if (!off) setH(x); }).catch(() => { if (!off) setErr(true); });
    return () => { off = true; };
  }, [col?.id, e.pos, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!col) return null;
  return (
    <PlanCard id="hadith" title={jt("e_hadith")} frac={e.pos / Math.max(1, col.max)} line={jt("hadithLine", { s: col.name, a: nf(e.pos), b: nf(col.max), n: nf(e.units) })}
      onDone={h ? () => doneHadith(seq, h.n) : undefined} doneLabel={jt("markHadith")}>
      {!h && !err ? <ActivityIndicator color={t.accent} /> : null}
      {err ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{jt("offline")}</Text> : null}
      {h?.item ? (
        <View style={{ gap: 8 }}>
          {h.item.arabic ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 19, lineHeight: 36, color: t.ink, writingDirection: "rtl", textAlign: "right" }}>{h.item.arabic}</Text> : null}
          {h.item.text ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink }}>{h.item.text}</Text> : null}
          <Text style={{ fontFamily: FONT.medium, fontSize: 12, color: t.muted }}>{h.item.reference}{h.item.grades[0] ? ` · ${h.item.grades[0].by}: ${h.item.grades[0].grade}` : ""}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted }}>{h.item.credit}</Text>
        </View>
      ) : h && !h.item ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{jt("hadithGap")}</Text> : null}
    </PlanCard>
  );
}

function LemmaCard() {
  const t = useTheme();
  const jt = useJT();
  const nf = useNf();
  const { lang } = useLang();
  const e = useJourney().e.lemma;
  const [table, setTable] = useState<Lemma[] | null>(null);
  const [err, setErr] = useState(false);
  const [mean, setMean] = useState<Record<string, string>>({});
  useEffect(() => { allLemmas().then(setTable).catch(() => setErr(true)); }, []);
  const rows = table ? table.slice(e.pos, e.pos + e.per) : [];
  useEffect(() => {
    if (!rows.length) return;
    let off = false;
    void Promise.all(rows.map(async ([lem, , , ref]) => {
      const [s, a, w] = ref.split(":");
      try { const v = await loadVerse(`${s}:${a}`, lang); const x = v.words.find((y) => y.position === Number(w)); return [lem, x ? `${x.text} · ${x.meaning}` : ""] as const; } catch { return [lem, ""] as const; }
    })).then((list) => { if (!off) setMean(Object.fromEntries(list)); });
    return () => { off = true; };
  }, [table, e.pos, e.per, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = table?.length ?? 0;
  return (
    <PlanCard id="lemma" title={jt("e_lemma")} frac={total ? e.pos / total : 0} line={total ? jt("lemmaLine", { c: nf(e.cycles + 1), a: nf(e.pos), b: nf(total) }) : jt("loading")}
      onDone={total ? () => doneLemmas(total) : undefined} doneLabel={jt("markStudied")} perLabel={(n) => jt("wordsN", { n: nf(n) })}>
      {!table && !err ? <ActivityIndicator color={t.accent} /> : null}
      {err ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{jt("offline")}</Text> : null}
      {rows.map(([lem, root, count, ref]) => {
        const [s, a] = ref.split(":").map(Number);
        return (
          <View key={lem} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: R.md, borderWidth: 1, borderColor: t.line, padding: 10 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.ink }} numberOfLines={2}>{mean[lem] || "…"}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted }}>{jt("lemmaMeta", { r: root ? [...root].join(" ") : "–", n: nf(count), k: `${s}:${a}` })}</Text>
            </View>
            <Text onPress={() => router.push(readerHref(s, a) as Href)} accessibilityRole="link" style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 40, color: t.ink }}>{lem}</Text>
          </View>
        );
      })}
      <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 16, color: t.muted }}>{jt("lemmaSource")}</Text>
    </PlanCard>
  );
}

function MutCard() {
  const t = useTheme();
  const jt = useJT();
  const nf = useNf();
  const { lang } = useLang();
  const e = useJourney().e.mut;
  const groups = Array.from({ length: Math.min(e.per, MUT_COUNT - e.pos) }, (_, i) => mutGroup(e.pos + i));
  return (
    <PlanCard id="mut" title={jt("e_mut")} frac={e.pos / Math.max(1, MUT_COUNT)} line={jt("mutLine", { c: nf(e.cycles + 1), a: nf(e.pos), b: nf(MUT_COUNT) })}
      onDone={doneMut} doneLabel={jt("markStudied")} perLabel={(n) => jt("groupsN", { n: nf(n) })}>
      {groups.map((g) => (
        <View key={g.id} style={{ gap: 6 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{lang === "de" ? g.topic.de : lang === "ar" ? g.topic.ar : g.topic.en}</Text>
          <Ranges list={g.keys.map((k) => { const [s, v] = k.split(":").map(Number); return { s, a: v, b: v }; })} />
        </View>
      ))}
      <OutlineButton title={jt("openMut")} icon="grid" onPress={() => router.push("/shams/mutashabihat" as Href)} />
      <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted }}>{jt("mutDraft")}</Text>
    </PlanCard>
  );
}
