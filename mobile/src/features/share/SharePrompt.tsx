import { fillText } from "@/features/feed/texts";
import { SharerBadge } from "./SharerUI";
import { useMySharer } from "./sharer";
import { useSharerText } from "./sharerTexts";
import { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { openPro, usePro } from "@/lib/pro";
import { flagOn } from "@/features/feed/remote";
import { XP, shareStreakOf, weekShares } from "@/features/feed/gamify";
import { useGameText } from "@/features/feed/gamifyTexts";
import { useLang } from "@/i18n";
import { dayNum, statsNow, STATS2_KEY } from "@/features/feed/statsStore";
import { verseOfDayKey } from "@/web/votd";
import { useDailyHadith } from "@/features/hadith/cards";
import { HadithShare } from "@/features/hadith/ui";
import { useShareText } from "./texts";
import { ShareCardButton, VerseShare, type CardData } from "./ShareKit";

// The daily "Have you shared something today?" suggestion: a small card in the feed and a tiny banner after a lesson.
// At most one suggestion a day (gone once dismissed or once something was shared today), never in the very first
// session of the app, switchable from the server (flags.sharePrompt in the feed config). Only Pro can turn it off.
// Shares go through the ShareSheet, which counts them (statsStore) and gives XP and the share quest (gamify).

const KEY = "qmc.share-prompt";
type State = { first?: number; dismissed?: number; optOut?: boolean; prompted?: number };
let firstRun: boolean | null = null;
function isFirstSession(): boolean {
  if (firstRun === null) {
    const s = readJSON<State>(KEY, {});
    firstRun = !s.first;
    if (firstRun) writeJSON(KEY, { ...s, first: dayNum() }, true);
  }
  return firstRun;
}
const sharedToday = () => statsNow().days[String(dayNum())]?.shares ?? 0;

export function useSharePrompt(): { show: boolean; dismiss: () => void; shares: number } {
  const st = useStored<State>(KEY, {});
  useStored(STATS2_KEY, null);
  const { pro } = usePro();
  const today = dayNum();
  const show = flagOn("sharePrompt") && !isFirstSession() && st.dismissed !== today && !(pro && st.optOut) && sharedToday() === 0;
  return { show, shares: statsNow().total.shares, dismiss: () => writeJSON(KEY, { ...readJSON<State>(KEY, {}), dismissed: today }) };
}

/** card in the feed: share today's verse or hadith with one tap */
export function SharePromptCard({ width }: { width?: number }) {
  const t = useTheme();
  const tx = useShareText();
  const p = useSharePrompt();
  const hadith = useDailyHadith();
  const [open, setOpen] = useState<"verse" | "hadith" | null>(null);
  if (!p.show && !open) return null;
  return (
    <View style={{ width, alignSelf: "center", marginVertical: 10, padding: 14, gap: 10, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        <Icon name="send" color={t.accent} size={22} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{tx.promptTitle}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, marginTop: 2 }}>{tx.promptBody}</Text>
        </View>
        <Pressable onPress={p.dismiss} accessibilityRole="button" accessibilityLabel={tx.notToday} hitSlop={10}><Icon name="close" color={t.muted} size={18} /></Pressable>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <Btn label={tx.promptVerse} onPress={() => setOpen("verse")} primary />
        {hadith.item ? <Btn label={tx.promptHadith} onPress={() => setOpen("hadith")} /> : null}
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.gold }}>{tx.reward.replace("{n}", String(XP.share))}</Text>
      </View>
      {open === "verse" ? <VerseShare verseKey={verseOfDayKey()} kicker={tx.verseOfDay} onClose={() => setOpen(null)} /> : null}
      {open === "hadith" && hadith.item ? <HadithShare item={hadith.item} onClose={() => setOpen(null)} /> : null}
    </View>
  );
}

/** tiny banner after a completed lesson */
export function ShareLessonBanner() {
  const t = useTheme();
  const tx = useShareText();
  const p = useSharePrompt();
  const [open, setOpen] = useState(false);
  if (!p.show && !open) return null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: R.lg, backgroundColor: t.accentSoft, marginVertical: 8 }}>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={tx.promptVerse} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="send" color={t.accent} size={18} />
        <Text style={{ flex: 1, fontFamily: FONT.medium, fontSize: 13, color: t.ink }}>{tx.bannerLesson}</Text>
      </Pressable>
      <Pressable onPress={p.dismiss} accessibilityRole="button" accessibilityLabel={tx.notToday} hitSlop={10}><Icon name="close" color={t.muted} size={16} /></Pressable>
      {open ? <VerseShare verseKey={verseOfDayKey()} kicker={tx.verseOfDay} onClose={() => setOpen(false)} /> : null}
    </View>
  );
}

/** the switch in Account: visible to everyone, only Pro can turn the suggestion off */
export function SharePromptSetting() {
  const t = useTheme();
  const tx = useShareText();
  const { pro } = usePro();
  const st = useStored<State>(KEY, {});
  const on = !(pro && st.optOut);
  return (
    <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{tx.settingTitle}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, marginTop: 2 }}>{tx.settingBody}</Text>
        {!pro ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.gold, marginTop: 4 }}>{tx.settingPro}</Text> : null}
      </View>
      <Switch value={on} trackColor={{ true: t.accent }} accessibilityLabel={tx.settingTitle}
        onValueChange={(v) => { if (!pro) { openPro("general"); return; } writeJSON(KEY, { ...readJSON<State>(KEY, {}), optOut: !v }); }} />
    </View>
  );
}

function Btn({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.pill, backgroundColor: primary ? t.accent : "transparent", borderWidth: 1, borderColor: t.accent, opacity: pressed ? 0.7 : 1 })}>
      <Icon name="send" color={primary ? t.onAccent : t.accent} size={15} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: primary ? t.onAccent : t.accent }}>{label}</Text>
    </Pressable>
  );
}

/** the visible share counter (stats screen and profile): total shares, share streak and this week's line */
export function ShareCounter() {
  const t = useTheme();
  const gt = useGameText();
  const { lang } = useLang();
  useStored(STATS2_KEY, null);
  const st = statsNow();
  const nf = (n: number) => Intl.NumberFormat(lang).format(n);
  const streak = shareStreakOf(st).now;
  const week = weekShares(st);
  const me = useMySharer();
  const sx = useSharerText();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
      <Icon name="send" color={t.accent} size={22} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{`${gt.sharesLabel}: ${nf(st.total.shares)}`}</Text>
        {me.tier > 0 ? <View style={{ marginTop: 4 }}><SharerBadge tier={me.tier} compact /></View> : null}
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, marginTop: 2 }}>
          {[me.next ? fillText(sx.toNext, { n: nf(me.next.left), l: nf(me.next.tier) }) : "", week ? gt.weekShared.replace("{n}", nf(week)) : "", streak > 1 ? gt.shareStreakNow.replace("{n}", nf(streak)) : ""].filter(Boolean).join(" · ") || gt.sShare1}
        </Text>
      </View>
    </View>
  );
}

type DoneKind = "lessonDone" | "unitDone" | "levelDone" | "testResult" | "review" | "milestone" | "course" | "prayerTimes" | "calendar";
/** for completion screens: a paper-plane pill sharing a branded card of the achievement, plus the daily lesson banner */
export function DoneShare({ kind, banner = true, onStage, ...card }: Omit<CardData, "kicker"> & { kind: DoneKind; banner?: boolean; onStage?: boolean }) {
  const tx = useShareText();
  return (
    <View style={{ gap: 4 }}>
      <ShareCardButton pill data={{ kicker: tx[kind], seed: kind, ...card }} color={onStage ? "#ffffff" : undefined} />
      {banner ? <ShareLessonBanner /> : null}
    </View>
  );
}
