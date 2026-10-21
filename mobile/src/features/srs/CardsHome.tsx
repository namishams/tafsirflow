import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { GoldCard, SectionTitle } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, FWD, R, useTheme } from "@/lib/theme";
import { today } from "@/web/learning";
import { BigButton, CourseHero, ProCard, ProLock } from "../coursekit/ui";
import { StepIn } from "../coursekit/motion";
import { tick } from "../feed/haptics";
import { DECK_IDS, deckSize, type DeckId } from "./decks";
import { useIntl } from "./format";
import { useSrsLimits } from "./gate";
import { freeNewPerDay, buildQueue, deckOpen, forecast, setDecks, streakOf, useSrsState } from "./store";
import { syncOwnCards } from "./sync";
import { useSrsT, type SrsKey } from "./texts";

// /cards – the daily review: counts, streak, 7-day forecast, decks (locked ones with a preview and the Pro card),
// links to the Hifz tracker and the tests.
export const deckTitleKey = (d: DeckId) => `deck_${d}` as SrsKey;

export function CardsHome() {
  const t = useTheme();
  const st = useSrsT();
  const nf = useIntl();
  const s = useSrsState();
  const lim = useSrsLimits();
  useEffect(() => { syncOwnCards(); }, []);
  const day = today();
  const q = useMemo(() => buildQueue(s, lim, day), [s, lim, day]);
  const fc = useMemo(() => forecast(s, 7, day), [s, day]);
  const streak = streakOf(s, day);
  const own = Object.values(s.cards).filter((c) => c.own).length;
  const total = q.due.length + q.fresh.length;
  const max = Math.max(1, ...fc);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 56 }}>
        <CourseHero back word="ذِكْر" title={st("title")} lead={st("lead")}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {([[st("due"), q.due.length], [st("newCards"), q.fresh.length], [st("streak"), streak]] as [string, number][]).map(([l, n]) => (
              <View key={l} style={{ flex: 1, borderRadius: R.lg, borderWidth: 1, borderColor: "rgba(233,207,153,0.22)", backgroundColor: "rgba(255,255,255,0.04)", padding: 12 }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 24, color: "rgb(233,207,153)" }}>{nf(n)}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{l}</Text>
              </View>
            ))}
          </View>
          <BigButton title={total ? st("reviewToday", { n: nf(total) }) : st("reviewNone")} disabled={!total} onPress={() => router.push("/cards/review" as Href)} style={{ marginTop: 16 }} />
        </CourseHero>

        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 24 }}>
          {!lim.unlimited ? (
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted }}>
              {q.newLeft > 0 ? `${st("freeLimit", { n: nf(freeNewPerDay()) })} ${st("newLeft", { n: nf(q.newLeft) })}` : st("limitReached", { n: nf(freeNewPerDay()) })}
            </Text>
          ) : null}

          <StepIn>
            <GoldCard star={false} style={{ alignItems: "stretch" }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{st("forecast")}</Text>
              <View accessible accessibilityLabel={`${st("forecast")}: ${fc.map(nf).join(", ")}`} style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, height: 90, marginTop: 12 }}>
                {fc.map((n, i) => (
                  <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: t.muted }}>{nf(n)}</Text>
                    <View style={{ width: "100%", height: Math.max(3, (n / max) * 56), borderRadius: 4, backgroundColor: i === 0 ? t.accent : t.gold, opacity: i === 0 ? 1 : 0.55 }} />
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: "row", marginTop: 6 }}>
                {fc.map((_, i) => <Text key={i} style={{ flex: 1, textAlign: "center", fontFamily: FONT.regular, fontSize: 10.5, color: t.muted }}>{i === 0 ? st("today") : `+${nf(i)}`}</Text>)}
              </View>
            </GoldCard>
          </StepIn>

          <View>
            <SectionTitle title={st("decks")} />
            <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
              <DeckRow id="mine" count={own} sub={st("mineLead")} active open onPress={() => router.push("/cards/deck/mine" as Href)} />
              {DECK_IDS.map((d) => {
                const open = deckOpen(d, lim);
                const active = s.decks.includes(d);
                return (
                  <DeckRow key={d} id={d} count={deckSize(d)} active={active} open={open}
                    onPress={() => router.push(`/cards/deck/${d}` as Href)}
                    onToggle={open ? () => { tick(); setDecks(active ? s.decks.filter((x) => x !== d) : [...s.decks, d]); } : lim.upsell} />
                );
              })}
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <LinkRow title={st("hifz")} sub={st("hifzLead")} icon="map" onPress={() => router.push("/cards/hifz" as Href)} />
            <LinkRow title={st("tests")} sub={st("testsLead")} icon="trophy" onPress={() => router.push("/tests" as Href)} />
          </View>

          {!lim.unlimited ? <ProCard feature="vocab" title={st("proTitle")} text={st("proText")} /> : null}
        </View>
      </ScrollView>
    </>
  );
}

function DeckRow({ id, count, sub, active, open, onPress, onToggle }: { id: DeckId; count: number; sub?: string; active: boolean; open: boolean; onPress: () => void; onToggle?: () => void }) {
  const t = useTheme();
  const st = useSrsT();
  const nf = useIntl();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: t.line }}>
      <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ flex: 1, padding: 14, opacity: pressed ? 0.6 : 1 })}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink, textAlign: "left" }}>{st(deckTitleKey(id))}</Text>
          {!open ? <ProLock size={13} /> : null}
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, marginTop: 2, textAlign: "left" }}>{sub ?? st("cardsCount", { n: nf(count) })}</Text>
      </Pressable>
      {onToggle ? (
        <Pressable onPress={onToggle} accessibilityRole="switch" accessibilityState={{ checked: active && open }} accessibilityLabel={open ? (active ? st("removeDeck") : st("addDeck")) : `${st(deckTitleKey(id))}, ${st("locked")}`} hitSlop={6}
          style={{ width: 44, height: 44, marginEnd: 8, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: active && open ? t.accentSoft : "transparent", borderWidth: 1, borderColor: active && open ? t.accent : t.line }}>
          <Icon name={!open ? "lock" : active ? "check" : "plus"} size={18} color={!open ? t.gold : t.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

function LinkRow({ title, sub, icon, onPress }: { title: string; sub: string; icon: "map" | "trophy"; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, opacity: pressed ? 0.7 : 1 })}>
      <Icon name={icon} size={22} color={t.gold} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink, textAlign: "left" }}>{title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, textAlign: "left" }}>{sub}</Text>
      </View>
      <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.muted }}>{FWD}</Text>
    </Pressable>
  );
}
