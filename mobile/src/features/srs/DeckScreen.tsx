import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { GoldCard, Stage } from "@/components/brand";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { today } from "@/web/learning";
import { BigButton, CourseHero, ProCard } from "../coursekit/ui";
import { useCardFace } from "./CardFace";
import { deckItems, type DeckId, DECK_IDS } from "./decks";
import { deckTitleKey } from "./CardsHome";
import { useIntl } from "./format";
import { useSrsLimits } from "./gate";
import { ReviewSession } from "./Review";
import { buildQueue, deckOpen, readSrsState, useSrsState } from "./store";
import { syncOwnCards } from "./sync";
import { useSrsT } from "./texts";

const isDeck = (d: string | undefined): d is DeckId => !!d && (d === "mine" || (DECK_IDS as string[]).includes(d));

/** /cards/deck/[id] – what a deck holds: three sample cards (front and back) as a preview, then study or Pro */
export function DeckScreen({ id }: { id: string }) {
  const t = useTheme();
  const st = useSrsT();
  const nf = useIntl();
  const s = useSrsState();
  const lim = useSrsLimits();
  const deck: DeckId = isDeck(id) ? id : "juzamma";
  const open = deckOpen(deck, lim);
  const items = deck === "mine" ? Object.keys(s.cards).filter((k) => s.cards[k].own) : deckItems(deck);
  const q = useMemo(() => buildQueue(s, lim, today(), deck), [s, lim, deck]);
  const samples = items.slice(0, 3);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 56 }}>
        <CourseHero back title={st(deckTitleKey(deck))} lead={deck === "mine" ? st("mineLead") : st("cardsCount", { n: nf(items.length) })}>
          {open ? <BigButton title={q.due.length + q.fresh.length ? st("start") : st("reviewNone")} disabled={!(q.due.length + q.fresh.length)} onPress={() => router.push(`/cards/review?deck=${deck}` as Href)} /> : null}
        </CourseHero>
        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 16 }}>
          {samples.length ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: t.muted, textAlign: "left" }}>{st("preview")}</Text> : null}
          {samples.map((c, i) => <Sample key={c} id={c} seed={i} />)}
          {!open ? <ProCard feature="vocab" title={st("proTitle")} text={st("proText")} /> : null}
        </View>
      </ScrollView>
    </>
  );
}

function Sample({ id, seed }: { id: string; seed: number }) {
  const f = useCardFace(id, seed);
  return (
    <View style={{ gap: 8 }}>
      <Stage rounded={R.card} hairlines={false} style={{ padding: 18, minHeight: 140, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: stage.goldSoft }}>{f.front}</Stage>
      {f.back ? <GoldCard star={false} style={{ padding: 16, alignItems: "center" }}>{f.back}</GoldCard> : null}
    </View>
  );
}

/** /cards/review – the round is fixed when the screen opens (due cards first, then the new ones) */
export function ReviewScreen({ deck }: { deck?: string }) {
  const t = useTheme();
  const lim = useSrsLimits();
  const [ids, setIds] = useState<string[] | null>(null);
  useEffect(() => {
    syncOwnCards();
    const q = buildQueue(readSrsState(), lim, today(), isDeck(deck) ? deck : undefined);
    // new cards are mixed in after every fourth review, so a long backlog does not hide them
    const out: string[] = [];
    let f = 0;
    q.due.forEach((d, i) => { out.push(d); if (i % 4 === 3 && f < q.fresh.length) out.push(q.fresh[f++]); });
    out.push(...q.fresh.slice(f));
    setIds(out);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 56 }}>
        <CourseHero back title={useSrsT()("title")} />
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>{ids ? <ReviewSession ids={ids} /> : null}</View>
      </ScrollView>
    </>
  );
}
