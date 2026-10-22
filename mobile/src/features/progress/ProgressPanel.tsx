import { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stage } from "@/components/brand";
import { ProBadge } from "@/components/page";
import { CALLIG_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { openPro, usePro } from "@/lib/pro";
import { dayPlan, learner } from "@/web/coach";
import { LESSONS as ARABIC_LESSONS, readArabic } from "@/web/arabic";
import { HM_GOLD, HmBar, HomeRing, HomeStar, StarGlyph, alpha, hmGoldD, hmIvory } from "./art";
import { useChapterNames, useLive, useNf } from "./hooks";
import { go } from "./links";
import { narrowWeekday } from "./format";
import { ArrowLink, GoldPill, Grid, Kicker, StageBox, useCols } from "./ui";

// The coach's read of the learner (website: ProgressPanel.tsx): CoachCard for Today, ProgressPanel for the profile,
// MapInsights under the Quran map. Everything is computed on the device from tf:srs, tf:days and tf:goal.
const verseHref = (s: number, v: number, review = false) => `/surah/${s}?v=${v}${review ? "&m=2&r=1" : "&shams=1"}`;

function useCoach() {
  return useLive(() => ({ L: learner(), plan: dayPlan(), arabic: Object.values(readArabic().done).filter((x) => x.stars > 0).length }));
}

/** reviews due today and on the next six days, today in gold */
export function Forecast({ days, dark = false }: { days: number[]; dark?: boolean }) {
  const t = useTheme();
  const tr = useWebT("coach");
  const { lang } = useLang();
  const max = Math.max(1, ...days);
  const sub = dark ? "rgba(255,255,255,0.55)" : t.muted;
  return (
    <View style={{ height: 80, flexDirection: "row", alignItems: "flex-end", gap: 6 }} accessible accessibilityLabel={`${tr("forecast")}: ${days.join(", ")}`}>
      {days.map((n, i) => {
        const h = Math.max(4, (n / max) * 48);
        return (
          <View key={i} style={{ flex: 1, minWidth: 0, alignItems: "center", gap: 4 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 10, color: sub }}>{n || ""}</Text>
            <View style={{ width: "100%", maxWidth: 34, height: h, borderTopLeftRadius: 999, borderTopRightRadius: 999, overflow: "hidden" }}>
              {i === 0 ? <LinearGradient colors={["#e9cf99", "#c6a65e"]} style={{ flex: 1 }} />
                : dark ? <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.25)" }} />
                : <LinearGradient colors={[alpha(t.accent, 0.7), alpha(t.accent, 0.4)]} style={{ flex: 1 }} />}
            </View>
            <Text style={{ fontFamily: FONT.regular, fontSize: 10, color: sub }}>{i === 0 ? tr("todayShort") : narrowWeekday(new Date(Date.now() + i * 86400000), lang)}</Text>
          </View>
        );
      })}
    </View>
  );
}

/** the forecast is part of Pro: its title with a lock and a faded chart that opens the Pro sheet */
function ForecastBlock({ days, dark = false }: { days: number[]; dark?: boolean }) {
  const t = useTheme();
  const tr = useWebT("coach");
  const { pro } = usePro();
  const title = tr("forecast");
  if (pro) {
    return (
      <View>
        {dark ? <Kicker color={stage.gold} style={{ marginBottom: 8 }}>{title}</Kicker> : <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted, marginBottom: 8 }}>{title}</Text>}
        <Forecast days={days} dark={dark} />
      </View>
    );
  }
  return (
    <Pressable onPress={() => openPro("stats")} accessibilityRole="button" accessibilityLabel={`${title}, Pro`}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        {dark ? <Kicker color={stage.gold} style={{ flex: 1 }}>{title}</Kicker> : <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 12, color: t.muted }}>{title}</Text>}
        <ProBadge onStage={dark} />
      </View>
      <View style={{ opacity: 0.35 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Forecast days={[5, 3, 6, 2, 4, 3, 5]} dark={dark} />
      </View>
    </Pressable>
  );
}

/** Today: the coach's plan for this session, with the reason behind it */
export function CoachCard() {
  const t = useTheme();
  const tr = useWebT("coach");
  const name = useChapterNames();
  const { plan, L } = useCoach();
  const first = plan.repair[0] ?? plan.reviews[0];
  const href = first ? verseHref(Number(first.split(":")[0]), Number(first.split(":")[1]), true) : verseHref(plan.next.surah, plan.next.verse);
  const tiles: [number, string, "light" | "gold"][] = [[plan.reviews.length, tr("planReviews"), "light"], [plan.repair.length, tr("planRepair"), "light"], [plan.newVerses, tr("planNew"), "gold"]];
  return (
    <HmCard>
      <Text allowFontScaling={false} style={{ position: "absolute", top: -12, right: 16, fontFamily: CALLIG_FONT, fontSize: 72, lineHeight: 100, color: alpha(HM_GOLD, 0.1) }} accessibilityElementsHidden>خطة</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <StarGlyph size={14} color={HM_GOLD} />
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{tr("planTitle")}</Text>
        </View>
        <View style={{ borderRadius: R.pill, borderWidth: 1, borderColor: alpha(HM_GOLD, 0.35), backgroundColor: alpha(HM_GOLD, 0.1), paddingHorizontal: 10, paddingVertical: 2 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: hmGoldD(t) }}>{tr("planMinutes", { n: plan.minutes })}</Text>
        </View>
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 4 }}>{tr(`reason_${plan.reason}`)}</Text>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
        {tiles.map(([n, l, tone]) => (
          <View key={l} style={{ flex: 1, alignItems: "center", borderRadius: R.md, borderWidth: 1, borderColor: alpha(HM_GOLD, 0.2), backgroundColor: hmIvory(t), paddingHorizontal: 8, paddingTop: 12, paddingBottom: 10 }} accessible accessibilityLabel={`${n} ${l}`}>
            <HomeStar n={n} size={46} tone={tone} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 11, lineHeight: 13, color: t.muted, marginTop: 6, textAlign: "center" }}>{l}</Text>
          </View>
        ))}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, marginTop: 12 }}>{tr("nextBody", { surah: name(plan.next.surah), v: plan.next.verse })}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 16 }}>
        <GoldPill title={tr("startPlan")} onPress={() => go(href)} />
        <ArrowLink title={tr("title")} onPress={() => go("/profile")} size={13} />
      </View>
      {L.learned > 0 ? <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: alpha(HM_GOLD, 0.2) }}><ForecastBlock days={L.forecast} /></View> : null}
    </HmCard>
  );
}

/** .hm-card: ivory wash, gold border, a gold hairline on the top edge */
export function HmCard({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ borderRadius: 12, borderWidth: 1, borderColor: alpha(HM_GOLD, 0.26), backgroundColor: t.surface, overflow: "hidden" }}>
      <LinearGradient pointerEvents="none" colors={[hmIvory(t), t.surface]} locations={[0, 0.72]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <LinearGradient pointerEvents="none" colors={[alpha(HM_GOLD, 0), alpha(HM_GOLD, 0.95), alpha(HM_GOLD, 0)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", top: 0, left: 22, right: 22, height: 1 }} />
      <View style={padded ? { padding: 20 } : undefined}>{children}</View>
    </View>
  );
}

/** Profile: how far the learner is – Quran share, memory, pace, surahs done and in progress, what needs attention */
export function ProgressPanel() {
  const t = useTheme();
  const tr = useWebT("coach");
  const nf = useNf();
  const name = useChapterNames();
  const c = useCoach();
  const cols = useCols(1, 2);
  const { L } = c;
  const pct = L.percent * 100;
  const mem = L.memory < 0.85 ? "memLow" : L.memory > 1.3 ? "memHigh" : "memAvg";
  const tile = (label: string, value: string) => (
    <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: alpha(HM_GOLD, 0.2), backgroundColor: hmIvory(t), padding: 12 }} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 11, lineHeight: 14, color: t.muted }} numberOfLines={2}>{label}</Text>
      <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink, marginTop: 4 }} adjustsFontSizeToFit numberOfLines={1}>{value}</Text>
    </View>
  );
  return (
    <View style={{ borderRadius: 12, borderWidth: 1, borderColor: alpha(HM_GOLD, 0.3), backgroundColor: t.surface, overflow: "hidden" }}>
      <Stage hairlines={false}>
        <View style={{ padding: 20, gap: 24 }}>
          <View style={{ alignItems: "center" }}>
            <HomeRing value={Math.max(L.learned ? 0.012 : 0, L.percent)} size={124} stroke={7}>
              <Text style={{ fontFamily: FONT.display, fontSize: 24, color: "#eef0f3" }}>{pct < 10 ? nf(pct, 1, 1) : nf(Math.round(pct))}{" "}%</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{tr("ofQuran")}</Text>
            </HomeRing>
          </View>
          <View>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, color: "#eef0f3" }}>{tr("title")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{L.learned ? tr("learnedN", { n: L.learned, solid: L.solid, done: L.complete.length }) : tr("empty")}</Text>
            <GoldPill title={tr("nextBody", { surah: name(L.next.surah), v: L.next.verse })} onPress={() => go(verseHref(L.next.surah, L.next.verse))} style={{ marginTop: 16 }} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 8 }}>{tr("noBasmala")}</Text>
          </View>
        </View>
      </Stage>

      {L.learned > 0 ? (
        <View style={{ padding: 20, gap: 24 }}>
          <View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>{tile(tr("retention"), L.retention === null ? "–" : `${Math.round(L.retention * 100)} %`)}</View>
              <View style={{ flex: 1 }}>{tile(tr("memory"), nf(L.memory, 2, 2))}</View>
              <View style={{ flex: 1 }}>{tile(tr("pace"), L.pace ? nf(L.pace) : "–")}</View>
            </View>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 20, color: t.muted, marginTop: 12 }}>{tr(mem)} {tr("paceHint", { days: L.activeDays })}</Text>
          </View>

          <ForecastBlock days={L.forecast} />

          {L.working.length > 0 ? (
            <View>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{tr("working")}</Text>
              <Grid cols={cols} gap={10} style={{ marginTop: 12 }}>
                {L.working.slice(0, 8).map((p) => (
                  <Pressable key={p.id} onPress={() => go(verseHref(p.id, p.next ?? 1))} accessibilityRole="button" accessibilityLabel={`${p.id}. ${name(p.id)}, ${p.learned}/${p.total}`}
                    style={({ pressed }) => ({ borderRadius: R.md, borderWidth: 1, borderColor: alpha(HM_GOLD, pressed ? 0.7 : 0.25), padding: 12 })}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{p.id}. {name(p.id)}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{p.learned}/{p.total}</Text>
                    </View>
                    <HmBar value={p.learned / p.total} style={{ marginTop: 10 }} />
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 6 }}>{tr("continueAt", { v: p.next ?? 1 })}</Text>
                  </Pressable>
                ))}
              </Grid>
            </View>
          ) : null}

          {L.fading.length > 0 ? (
            <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: alpha(t.gold, 0.4), backgroundColor: alpha(t.gold, 0.05), padding: 16 }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{tr("fading")}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, marginTop: 4 }}>{tr("fadingHint")}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {L.fading.map((p) => (
                  <Pressable key={p.id} onPress={() => go(`/surah/${p.id}?v=1&m=2`)} accessibilityRole="button"
                    style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? t.ink : t.line, backgroundColor: t.surface, paddingHorizontal: 12, paddingVertical: 6 })}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{name(p.id)}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{Math.round((p.avg ?? 0) * 100)} %</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {L.complete.length > 0 ? (
            <View>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{tr("complete")} <Text style={{ fontFamily: FONT.regular, color: t.muted }}>· {L.complete.length}</Text></Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                {L.complete.map((p) => (
                  <Pressable key={p.id} onPress={() => go(`/surah/${p.id}`)} accessibilityRole="button" style={{ borderRadius: R.pill, backgroundColor: t.accentSoft, paddingHorizontal: 12, paddingVertical: 4 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent }}>{name(p.id)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      <Pressable onPress={() => go("/arabic")} accessibilityRole="button" style={{ borderTopWidth: 1, borderTopColor: alpha(HM_GOLD, 0.2), padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{tr("arabic")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{tr("arabicHint", { done: c.arabic, total: ARABIC_LESSONS.length })}</Text>
        </View>
        <HmBar gold value={c.arabic / Math.max(1, ARABIC_LESSONS.length)} style={{ marginTop: 10 }} />
      </Pressable>
    </View>
  );
}

/** Quran map: what the coach reads from the map – next step, what fades first, the coming reviews (on the stage) */
export function MapInsights() {
  const tr = useWebT("coach");
  const name = useChapterNames();
  const { L } = useCoach();
  if (L.learned === 0) return null;
  const gold = stage.gold;
  return (
    <View style={{ marginTop: 24, gap: 12 }}>
      <StageBox onPress={() => go(verseHref(L.next.surah, L.next.verse))} label={tr("nextBody", { surah: name(L.next.surah), v: L.next.verse })}>
        <Kicker color={gold}>{tr("planNew")}</Kicker>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15, lineHeight: 21, color: "#eef0f3", marginTop: 8 }}>{tr("nextBody", { surah: name(L.next.surah), v: L.next.verse })}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{tr("learnedN", { n: L.learned, solid: L.solid, done: L.complete.length })}</Text>
      </StageBox>
      <StageBox>
        <Kicker color={gold}>{tr("fading")}</Kicker>
        {L.fading.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {L.fading.map((p) => (
              <Pressable key={p.id} onPress={() => go(`/surah/${p.id}?v=1&m=2`)} accessibilityRole="button"
                style={({ pressed }) => ({ borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4 })}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "#eef0f3" }}>{name(p.id)} · {Math.round((p.avg ?? 0) * 100)} %</Text>
              </Pressable>
            ))}
          </View>
        ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>{tr("reason_steady")}</Text>}
      </StageBox>
      <StageBox><ForecastBlock days={L.forecast} dark /></StageBox>
    </View>
  );
}

export default ProgressPanel;
