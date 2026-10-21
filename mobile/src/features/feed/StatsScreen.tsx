import { SharerBadge } from "@/features/share/SharerUI";
import { useMySharer } from "@/features/share/sharer";
import { ShareCounter } from "@/features/share/SharePrompt";
import { useState } from "react";
import { I18nManager, Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Page } from "@/components/page";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { BrandFoot, CARD_SIZE, ShareSheet, type ShareFormat } from "./share";
import { dayNum, dayOf, longestStreak, streakOf, useFeedStats, type DayStats } from "./statsStore";
import { resetInterest } from "./interest";
import { fillText, useFeedText } from "./texts";
import { SITE } from "@/lib/api";
import { useEffect } from "react";
import { AccountNudge, nudgeAccount } from "./Promo";
import { router, type Href } from "expo-router";
import { LIB_TOPICS } from "./library";
import { MAX_FREEZES, STICKERS, lastMonth, levelOf, markRecapSeen, mastery, mondayOf, period, recordsNow, todaysQuests, topicCounts, useGamify, type Period, type QuestKind } from "./gamify";
import { useGameText, type GameText } from "./gamifyTexts";
import { StickerArt, topicLabel } from "./Sticker";

const QUEST_TX: Record<QuestKind, keyof GameText> = { verses: "qVerses", words: "qWords", hadith: "qHadith", posts: "qPosts", quiz: "qQuiz", dua: "qDua", share: "qShare", name: "qName" };

// /feed-stats: the feed statistics of this device (statsStore.ts): time today / week / all time, counters, a 7-day bar
// chart, a 12-week heatmap, the breakdown per kind, milestones and a shareable "learned today" card.
const READ = ["hadith", "hadith-of-day", "shia-hadith", "tafsir", "dua"];
const FOUND = ["scholar-bio", "scholar-work", "scholar-timeline", "mosque", "reciter-bio"];

export default function StatsScreen() {
  const t = useTheme();
  const tx = useFeedText();
  const { lang } = useLang();
  const s = useFeedStats();
  const [share, setShare] = useState<null | "today" | "week" | "month">(null);
  const gt = useGameText();
  const sharer = useMySharer();
  const gm = useGamify();
  const [resetNote, setResetNote] = useState(false);
  useEffect(() => { const id = setTimeout(nudgeAccount, 1500); return () => clearTimeout(id); }, []);
  // the recaps count as seen once this screen was open for a moment
  useEffect(() => { const id = setTimeout(() => { markRecapSeen("week", mondayOf(dayNum()) - 7); markRecapSeen("month", lastMonth().from); }, 1500); return () => clearTimeout(id); }, []);
  const nf = (n: number) => Intl.NumberFormat(lang).format(Math.round(n));
  const min = (ms: number) => fillText(tx.statsMinutes, { n: nf(ms / 60000) });
  const today = dayNum();
  const sumDays = (from: number, to: number) => { const o: DayStats = { ms: 0, posts: 0, verses: 0, words: 0, likes: 0, saves: 0, shares: 0, kinds: {} }; for (let d = from; d <= to; d++) { const x = dayOf(s, d); o.ms += x.ms; o.posts += x.posts; o.verses += x.verses; o.words += x.words; } return o; };
  const week = sumDays(today - 6, today);
  const td = dayOf(s, today);
  const kindSum = (ks: string[]) => ks.reduce((a, k) => a + (s.total.kinds[k] ?? 0), 0);
  const streak = streakOf(s);
  const last7 = Array.from({ length: 7 }, (_, i) => dayOf(s, today - 6 + i));
  const max7 = Math.max(1, ...last7.map((d) => d.ms));
  const heat = Array.from({ length: 84 }, (_, i) => dayOf(s, today - 83 + i).posts);
  const maxHeat = Math.max(1, ...heat);
  const kinds = Object.entries(s.total.kinds).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxKind = Math.max(1, ...kinds.map((k) => k[1]));
  const lv = levelOf(gm.xp);
  const quests = todaysQuests();
  const mon = mondayOf(today);
  const wk = period(s, mon - 7, mon - 1);
  const wkPrev = period(s, mon - 14, mon - 8);
  const lm = lastMonth();
  const mo = period(s, lm.from, lm.to);
  const weekNew = today === mon && gm.recapSeen.week !== mon - 7;
  const monthNew = new Date().getDate() <= 3 && gm.recapSeen.month !== lm.from;
  const monthName = new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }).format(lm.date);
  const rangeName = (p: Period) => { const f = new Intl.DateTimeFormat(lang, { day: "numeric", month: "short" }); const at = (d: number) => new Date(d * 86400000 + new Date().getTimezoneOffset() * 60000 + 43200000); return `${f.format(at(p.from))} – ${f.format(at(p.to))}`; };
  const delta = (a: number, b: number, fmt = nf) => (a === b ? gt.same : `${a > b ? "+" : "−"}${fmt(Math.abs(a - b))}`);
  const topics = topicCounts(s.total.kinds);
  const listenAll = Object.values(s.days).reduce((a, d) => a + (d.listen ?? 0), 0);
  const learnAll = Math.max(0, Object.values(s.days).reduce((a, d) => a + d.ms, 0) - listenAll);
  const rec = recordsNow();
  const recent = STICKERS.filter((x) => gm.stickers[x.id]).sort((a, b) => gm.stickers[b.id] - gm.stickers[a.id]).slice(0, 6);
  const haveN = STICKERS.filter((x) => gm.stickers[x.id]).length;
  const recapCard = (p: Period, title: string, sub: string) => (f: ShareFormat) => (
    <LinearGradient colors={[stage.bg, stage.deep]} style={{ width: CARD_SIZE[f].w, height: CARD_SIZE[f].h, padding: 28, justifyContent: "space-between" }}>
      <View style={{ alignItems: "center", gap: 4 }}>
        <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{title}</Text>
        <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{sub}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 18 }}>
        {([[tx.statsPosts, nf(p.posts)], [tx.statsVerses, nf(p.verses)], [tx.statsWords, nf(p.words)], [gt.activeDays, nf(p.active)], [tx.statsAll, min(p.ms)], ["XP", nf(p.xp)]] as [string, string][]).map(([l, v]) => (
          <View key={l} style={{ width: "50%", alignItems: "center" }}>
            <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: 30, color: "#fff" }}>{v}</Text>
            <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>{l}</Text>
          </View>
        ))}
      </View>
      <View style={{ alignItems: "center", gap: 8 }}>
        {p.top ? <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 15, color: stage.gold, textAlign: "center" }}>{gt.topTopic}: {topicLabel(p.top, tx)}</Text> : null}
        <View style={{ alignSelf: "center" }}><SharerBadge tier={sharer.tier} onStage /></View>
      </View>
      <BrandFoot />
    </LinearGradient>
  );
  const Bar = ({ frac, color }: { frac: number; color?: string }) => (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: t.line }}><View style={{ width: `${Math.max(0, Math.min(1, frac)) * 100}%`, height: 6, borderRadius: 3, backgroundColor: color ?? t.accent }} /></View>
  );
  const NewTag = () => <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.pill, backgroundColor: t.gold }}><Text style={{ fontFamily: FONT.bold, fontSize: 11, color: t.bg }}>{gt.recapNew}</Text></View>;
  const card = { borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16, gap: 12 } as const;
  const h = (x: string) => <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 17, color: t.ink }}>{x}</Text>;
  const Stat = ({ label, value }: { label: string; value: string }) => (
    <View style={{ flexBasis: "47%", flexGrow: 1, padding: 12, borderRadius: 12, backgroundColor: t.bg, gap: 2 }}>
      <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{value}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{label}</Text>
    </View>
  );
  const learnedCard = (f: ShareFormat) => (
    <LinearGradient colors={[stage.bg, stage.deep]} style={{ width: CARD_SIZE[f].w, height: CARD_SIZE[f].h, padding: 28, justifyContent: "space-between" }}>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{tx.statsLearned}</Text>
      <View style={{ gap: 16 }}>
        {[[tx.statsWords, td.words], [tx.statsVerses, td.verses], [tx.statsPosts, td.posts]].map(([l, n]) => (
          <View key={l as string} style={{ alignItems: "center" }}>
            <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: 40, color: "#fff" }}>{nf(n as number)}</Text>
            <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{l as string}</Text>
          </View>
        ))}
        {streak ? <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 15, color: stage.gold, textAlign: "center" }}>{tx.statsStreak}: {fillText(tx.statsDays, { n: nf(streak) })}</Text> : null}
        <View style={{ alignSelf: "center" }}><SharerBadge tier={sharer.tier} onStage /></View>
      </View>
      <BrandFoot />
    </LinearGradient>
  );
  return (
    <Page padded>
      <Stack.Screen options={{ title: tx.statsTitle }} />
      <View style={{ gap: 14 }}>
        <View style={card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: t.gold }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{nf(lv.level)}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 18, color: t.ink }}>{fillText(gt.levelN, { n: nf(lv.level) })}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{fillText(gt.xpN, { n: nf(gm.xp) })} · {fillText(gt.xpToNext, { n: nf(lv.need - lv.into), l: nf(lv.level + 1) })}</Text>
              <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: lv.need, now: lv.into }}><Bar frac={lv.into / lv.need} color={t.gold} /></View>
            </View>
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{gt.xpNote}</Text>
        </View>

        <View style={card}>
          {h(gt.quests)}
          {quests.map((q, i) => (
            <View key={i} style={{ gap: 4 }} accessible accessibilityLabel={`${fillText(gt[QUEST_TX[q.kind]] as string, { n: nf(q.n) })}, ${nf(q.p)} / ${nf(q.n)}`}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink, textDecorationLine: q.p >= q.n ? "line-through" : "none" }}>{fillText(gt[QUEST_TX[q.kind]] as string, { n: nf(q.n) })}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{nf(q.p)}/{nf(q.n)}</Text>
              </View>
              <Bar frac={q.p / q.n} color={q.p >= q.n ? t.gold : t.accent} />
            </View>
          ))}
          {quests.every((q) => q.p >= q.n) ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent }}>{gt.questsDone}</Text> : null}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon name="shield" color={t.gold} size={18} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{fillText(gt.freezes, { n: `${nf(gm.freezes)}/${nf(MAX_FREEZES)}` })}</Text>
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{fillText(gt.freezeBody, { n: nf(MAX_FREEZES) })}</Text>
        </View>

        <View style={[card, weekNew ? { borderColor: t.gold } : null]}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>{h(gt.weekRecap)}{weekNew ? <NewTag /> : null}</View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{rangeName(wk)} · {gt.recapMonday}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Stat label={tx.statsPosts} value={nf(wk.posts)} />
            <Stat label={tx.statsVerses} value={nf(wk.verses)} />
            <Stat label={tx.statsWords} value={nf(wk.words)} />
            <Stat label={gt.activeDays} value={`${nf(wk.active)}/${nf(7)}`} />
          </View>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{gt.vsLastWeek}</Text>
          {([[tx.statsPosts, wk.posts, wkPrev.posts, nf], [tx.statsVerses, wk.verses, wkPrev.verses, nf], [tx.statsWords, wk.words, wkPrev.words, nf], [tx.statsAll, wk.ms, wkPrev.ms, (n: number) => min(n)]] as [string, number, number, (n: number) => string][]).map(([l, a, b, f]) => (
            <View key={l} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{l}</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: a > b ? t.accent : t.muted }}>{delta(a, b, f)}</Text>
            </View>
          ))}
          {wk.top ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{gt.topTopic}: {topicLabel(wk.top, tx)}</Text> : null}
          {(() => { let n = 0; for (let d = wk.from; d <= wk.to; d++) n += s.days[String(d)]?.shares ?? 0; return n ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent }}>{gt.weekShared.replace("{n}", nf(n))}</Text> : null; })()}
          <Pressable onPress={() => setShare("week")} accessibilityRole="button" style={({ pressed }) => ({ height: 42, borderRadius: R.pill, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.accent, opacity: pressed ? 0.7 : 1 })}>
            <Icon name="send" color={t.accent} size={16} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{gt.recapShare}</Text>
          </Pressable>
        </View>

        <View style={[card, monthNew ? { borderColor: t.gold } : null]}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>{h(gt.monthRecap)}{monthNew ? <NewTag /> : null}</View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{monthName}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Stat label={tx.statsPosts} value={nf(mo.posts)} />
            <Stat label={tx.statsVerses} value={nf(mo.verses)} />
            <Stat label={tx.statsWords} value={nf(mo.words)} />
            <Stat label={gt.activeDays} value={nf(mo.active)} />
          </View>
          <Pressable onPress={() => setShare("month")} accessibilityRole="button" style={({ pressed }) => ({ height: 42, borderRadius: R.pill, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.accent, opacity: pressed ? 0.7 : 1 })}>
            <Icon name="send" color={t.accent} size={16} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{gt.recapShare}</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push("/feed-stickers" as Href)} accessibilityRole="button" accessibilityLabel={`${gt.album}, ${fillText(gt.albumProgress, { n: nf(haveN), m: nf(STICKERS.length) })}`} style={({ pressed }) => [card, { opacity: pressed ? 0.85 : 1 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            {h(gt.album)}
            {gm.fresh.length ? <NewTag /> : <Icon name={I18nManager.isRTL ? "chevronLeft" : "chevronRight"} color={t.muted} size={18} />}
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{fillText(gt.albumProgress, { n: nf(haveN), m: nf(STICKERS.length) })}</Text>
          <Bar frac={haveN / STICKERS.length} color={t.gold} />
          {recent.length ? (
            <View style={{ flexDirection: "row", gap: 6 }}>
              {recent.map((x) => <StickerArt key={x.id} def={x} size={46} />)}
            </View>
          ) : null}
        </Pressable>

        <View style={card}>
          {h(gt.timeTitle)}
          {([[gt.timeLearning, learnAll, t.accent], [gt.timeListening, listenAll, t.gold]] as [string, number, string][]).map(([l, ms, c]) => (
            <View key={l} style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{l}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{min(ms)}</Text>
              </View>
              <Bar frac={ms / Math.max(1, learnAll + listenAll)} color={c} />
            </View>
          ))}
        </View>

        <View style={card}>
          {h(gt.mastery)}
          {LIB_TOPICS.map((tp) => { const m = mastery(topics[tp]); return (
            <View key={tp} style={{ gap: 4 }} accessible accessibilityLabel={`${topicLabel(tp, tx)}, ${fillText(gt.levelN, { n: nf(m.level) })}`}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{topicLabel(tp, tx)}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{fillText(gt.levelN, { n: nf(m.level) })}</Text>
              </View>
              <Bar frac={m.level >= 10 ? 1 : m.frac} color={m.level >= 10 ? t.gold : t.accent} />
            </View>
          ); })}
        </View>

        <View style={card}>
          {h(gt.records)}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Stat label={gt.recPosts} value={nf(rec.posts)} />
            <Stat label={gt.recVerses} value={nf(rec.verses)} />
            <Stat label={gt.recWords} value={nf(rec.words)} />
            <Stat label={gt.recTime} value={min(rec.ms)} />
            <Stat label={gt.recXp} value={nf(rec.xp)} />
            <Stat label={gt.recStreak} value={fillText(tx.statsDays, { n: nf(longestStreak(s)) })} />
          </View>
        </View>

        <View style={card}>
          {h(tx.statsLearned)}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Stat label={tx.statsWords} value={nf(td.words)} />
            <Stat label={tx.statsVerses} value={nf(td.verses)} />
            <Stat label={tx.statsPosts} value={nf(td.posts)} />
            <Stat label={tx.statsStreak} value={fillText(tx.statsDays, { n: nf(streak) })} />
          </View>
          <Pressable onPress={() => setShare("today")} accessibilityRole="button" style={({ pressed }) => ({ height: 46, borderRadius: R.pill, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: t.accent, transform: pressed ? [{ scale: 0.97 }] : undefined })}>
            <Icon name="send" color={t.onAccent} size={18} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.onAccent }}>{tx.shareTitle}</Text>
          </Pressable>
        </View>

        <View style={card}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Stat label={tx.statsDayToday} value={min(td.ms)} />
            <Stat label={tx.statsWeek} value={min(week.ms)} />
            <Stat label={tx.statsAll} value={min(s.total.ms)} />
            <Stat label={tx.statsLongest} value={min(s.longestMs)} />
          </View>
        </View>

        <View style={card}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Stat label={tx.statsPosts} value={nf(s.total.posts)} />
            <Stat label={tx.statsVerses} value={nf(s.total.verses)} />
            <Stat label={tx.statsWords} value={nf(s.total.words)} />
            <Stat label={tx.statsRead} value={nf(kindSum(READ))} />
            <Stat label={tx.statsFound} value={nf(kindSum(FOUND))} />
            <Stat label={tx.statsLikes} value={nf(s.total.likes)} />
            <Stat label={tx.statsSaves} value={nf(s.total.saves)} />
            <Stat label={tx.statsShares} value={nf(s.total.shares)} />
          </View>
        </View>
        <ShareCounter />

        <View style={card}>
          {h(tx.statsLast7)}
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, height: 120 }} accessible accessibilityLabel={last7.map((d) => min(d.ms)).join(", ")}>
            {last7.map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                <View style={{ width: "100%", height: Math.max(3, (d.ms / max7) * 96), borderRadius: 6, backgroundColor: i === 6 ? t.accent : t.accentSoft }} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 10.5, color: t.muted }}>{new Intl.DateTimeFormat(lang, { weekday: "narrow" }).format(new Date(Date.now() - (6 - i) * 86400000))}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={card}>
          {h(tx.statsWeeks)}
          <View style={{ flexDirection: "row", gap: 3 }} accessibilityElementsHidden>
            {Array.from({ length: 12 }, (_, w) => (
              <View key={w} style={{ flex: 1, gap: 3 }}>
                {heat.slice(w * 7, w * 7 + 7).map((n, d) => (
                  <View key={d} style={{ aspectRatio: 1, borderRadius: 3, backgroundColor: n ? t.accent : t.line, opacity: n ? 0.25 + 0.75 * (n / maxHeat) : 1 }} />
                ))}
              </View>
            ))}
          </View>
        </View>

        {kinds.length ? (
          <View style={card}>
            {h(tx.statsByKind)}
            {kinds.map(([k, n]) => (
              <View key={k} style={{ gap: 4 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{k}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{nf(n)}</Text>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: t.line }}><View style={{ width: `${(n / maxKind) * 100}%`, height: 6, borderRadius: 3, backgroundColor: t.accent }} /></View>
              </View>
            ))}
          </View>
        ) : null}

        <Pressable onPress={() => { resetInterest(); setResetNote(true); }} accessibilityRole="button" style={{ alignSelf: "center", paddingVertical: 10 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{tx.statsReset}</Text>
        </Pressable>
        {resetNote ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "center" }}>{tx.statsResetDone}</Text> : null}
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "center" }}>{tx.statsLocal}</Text>
      </View>
      <AccountNudge />
      <ShareSheet visible={!!share} onClose={() => setShare(null)} link={SITE}
        message={share === "week" ? `${gt.weekRecap}: ${nf(wk.posts)} · ${nf(wk.verses)} · ${nf(wk.words)}` : share === "month" ? `${gt.monthRecap}: ${nf(mo.posts)} · ${nf(mo.verses)} · ${nf(mo.words)}` : `${tx.statsLearned}: ${nf(td.words)} · ${nf(td.verses)} · ${nf(td.posts)}`}
        renderCard={share === "week" ? recapCard(wk, gt.weekRecap, rangeName(wk)) : share === "month" ? recapCard(mo, gt.monthRecap, monthName) : learnedCard} />
    </Page>
  );
}
