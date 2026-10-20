import { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { openPro, usePro } from "@/lib/pro";
import { readJSON } from "@/lib/store";
import { RULES, dayNow, levelOf, readPoints, streakOf, totalPoints, type PointKind } from "@/web/points";
import { firstListenDay, readListen, summarize } from "@/web/listen";
import { BADGES, HOUR_STICKERS, buildCtx, hoursOf, nextHourSticker, type StickerDef } from "@/web/stickers";
import { readSrs, strength } from "@/web/learning";
import { NOT_COUNTED } from "@/web/coach";
import { LESSONS as ARABIC_LESSONS } from "@/web/arabic";
import { LevelBar, LevelSeal, alpha } from "./art";
import { Sticker } from "./Sticker";
import { useChapterNames, useLive, useNf } from "./hooks";
import { go } from "./links";
import { Rays, StickerPop } from "./motion";
import { dayLabel } from "./format";
import { Card, GoldPill, Grid, H2, HairStat, InkSegmented, OutlinePill, ProLock, StageBox, useCols } from "./ui";

const RANGES = [7, 30, 365, 0] as const; // 0 = all time
type Range = (typeof RANGES)[number];
// Free: the last 7 and 30 days. Pro: a year and all time, and the detailed breakdowns (hour, surah, reciter).
const FREE_RANGES: Range[] = [7, 30];

export type StatsSection = "level" | "stickers" | "badges" | "listen" | "points" | "learn";
export type StatsViewProps = {
  /** only these sections (the profile shows level/stickers/badges and listen/points/learn on two tabs) */
  only?: StatsSection[];
  /** inside the profile: sections become rounded cards */
  embedded?: boolean;
  /** standalone screen: the level section is the hero with a back button under the status bar */
  hero?: boolean;
};

/**
 * Points, level, stickers, achievements and the listening and learning statistics (website: StatsView.tsx).
 * Free: level, stickers, badges, points, learning, listening totals and per day (7/30 days).
 * Pro: listening by hour, by surah, by reciter, and the ranges "365 days" and "all time".
 */
export function StatsView({ only, embedded = false, hero = false }: StatsViewProps) {
  const show = (x: StatsSection) => !only || only.includes(x);
  const t = useTheme();
  const tr = useWebT("rewards");
  const { lang } = useLang();
  const nf = useNf();
  const { pro } = usePro();
  const insets = useSafeAreaInsets();
  const name = useChapterNames();
  const [range, setRange] = useState<Range>(30);
  const [open, setOpen] = useState<{ def: StickerDef; have: boolean; note: string } | null>(null);
  const stickerCols = useCols(3, 4, 6);
  const badgeCols = useCols(2, 3, 4);
  const learnCols = useCols(1, 2, 4);
  const wide = useCols(1, 1, 2);
  const four = useCols(2, 4, 4);

  const d = useLive(() => {
    const srs = readSrs(); const mem = { strong: 0, mid: 0, weak: 0 };
    for (const [k, e] of Object.entries(srs)) { if (NOT_COUNTED.has(k)) continue; const s = strength(e); if (s >= 0.8) mem.strong++; else if (s >= 0.5) mem.mid++; else mem.weak++; }
    return {
      pts: readPoints(), listen: readListen(), ctx: buildCtx(ARABIC_LESSONS.length), mem,
      extra: { tajweed: Object.keys(readJSON<Record<string, number>>("tf:tajweed", {})).length, vocab: Object.keys(readJSON<Record<string, unknown>>("tf:vocab", {})).length },
    };
  });
  const { pts, listen, ctx, mem, extra } = d;
  const today = dayNow();
  const effRange: Range = pro || FREE_RANGES.includes(range) ? range : 30;
  const sum = useMemo(() => summarize(listen, effRange ? today - effRange + 1 : firstListenDay(listen), today, effRange === 0), [listen, effRange, today]);

  const total = totalPoints(pts);
  const lvl = levelOf(total);
  const st = streakOf(pts.d);
  const hours = hoursOf(ctx);
  const next = nextHourSticker(ctx);
  const dur = (sec: number) => { const m = Math.round(sec / 60); return m < 60 ? tr("min", { m }) : tr("hm", { h: Math.floor(m / 60), m: m % 60 }); };
  const series = sum.series.slice(-30);
  const maxS = Math.max(60, ...series.map((x) => x.seconds));
  const maxH = Math.max(1, ...sum.byHour);
  const favHour = sum.byHour.indexOf(Math.max(...sum.byHour));
  const ptsSeries = Array.from({ length: 30 }, (_, i) => ({ day: today - 29 + i, p: pts.d[String(today - 29 + i)] ?? 0 }));
  const maxP = Math.max(10, ...ptsSeries.map((x) => x.p));
  const todayKinds = pts.k.day === today ? pts.k.v : {};
  const pad = { paddingHorizontal: embedded ? 16 : 20, paddingVertical: embedded ? 32 : 56 };

  const pickRange = (r: Range) => { if (!pro && !FREE_RANGES.includes(r)) { openPro("stats"); return; } setRange(r); };

  return (
    <View style={embedded ? { gap: 24 } : undefined}>
      {/* level */}
      {show("level") ? (
        <Stage hairlines={false} rounded={embedded ? 16 : 0}>
          <View style={[pad, hero && { paddingTop: insets.top + 8 }]}>
            {hero ? (
              <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} style={{ width: 40, height: 40, justifyContent: "center", marginLeft: -6, marginBottom: 12 }}>
                <Icon name="chevronLeft" color="#ffffff" size={24} />
              </Pressable>
            ) : null}
            <StickerPop style={{ alignSelf: "center" }}><LevelSeal n={lvl.n} size={156} /></StickerPop>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.6, textTransform: "uppercase", color: stage.gold, marginTop: 32 }}>{tr("kicker")}</Text>
            <Text style={{ fontFamily: CALLIG_FONT, fontSize: 48, lineHeight: 72, color: stage.gold, marginTop: 12, alignSelf: "flex-start" }}>
              {lvl.ar}{lvl.stars > 0 ? <Text style={{ fontFamily: FONT.display, fontSize: 24 }}>{"  "}{"★".repeat(Math.min(lvl.stars, 5))}</Text> : null}
            </Text>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 36, lineHeight: 40, letterSpacing: -0.8, color: "#eef0f3", marginTop: 4 }}>{tr("levelN", { n: lvl.n })} · {tr(`l${lvl.n}`)}</Text>
            <View style={{ marginTop: 20 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{tr("points", { n: nf(total) })}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.7)", flexShrink: 1, textAlign: "right" }}>{tr("toNext", { n: nf(Math.max(0, lvl.to - total)) })}</Text>
              </View>
              <View style={{ marginTop: 8 }}><LevelBar value={lvl.pct} height={10} /></View>
            </View>
            <Grid cols={four} gap={16} style={{ marginTop: 24 }}>
              {[[nf(pts.d[String(today)] ?? 0), tr("today")], [String(st.current), tr("streak")], [nf(hours, hours < 10 ? 1 : 0), tr("hours")], [nf(ctx.versesHeard), tr("versesHeard")]].map(([n, l]) => <HairStat key={l} value={n} label={l} />)}
            </Grid>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
              <GoldPill pill={false} arrow={false} title={tr("toRanking")} onPress={() => go("/ranking")} />
              <OutlinePill onStage title={tr("toToday")} onPress={() => go("/today")} style={{ minHeight: 44, borderColor: "rgba(255,255,255,0.25)" }} />
            </View>
          </View>
        </Stage>
      ) : null}

      {/* hour stickers */}
      {show("stickers") ? (
        <View style={[{ paddingHorizontal: embedded ? 4 : 20, paddingVertical: embedded ? 8 : 56 }]}>
          <H2>{tr("stickersTitle")}</H2>
          <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.muted, marginTop: 12 }}>{tr("stickersLead")}</Text>
          {next ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: t.accent, marginTop: 12 }}>{tr("nextSticker", { name: tr(`s_${next.id}`), left: dur(Math.max(0, next.h * 3600 - ctx.minutes * 60)) })}</Text> : null}
          <Grid cols={stickerCols} gap={12} rowGap={28} style={{ marginTop: 32 }}>
            {HOUR_STICKERS.map((s, i) => {
              const have = hours >= s.h, prevH = i ? HOUR_STICKERS[i - 1].h : 0;
              const pct = have ? 1 : Math.max(0, (hours - prevH) / (s.h - prevH));
              return (
                <Pressable key={s.id} onPress={() => setOpen({ def: s, have, note: tr("hoursN", { n: nf(s.h) }) })} accessibilityRole="button"
                  accessibilityLabel={`${tr(`s_${s.id}`)}, ${tr("hoursN", { n: nf(s.h) })}, ${have ? tr("earned") : tr("notYet")}`}
                  style={({ pressed }) => ({ alignItems: "center", gap: 8, transform: [{ translateY: pressed ? -4 : 0 }] })}>
                  <Sticker def={s} size={92} locked={!have} pct={pct} />
                  <Text style={{ fontFamily: CALLIG_FONT, fontSize: 20, lineHeight: 30, color: t.gold }}>{s.ar}</Text>
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 13, lineHeight: 16, color: t.ink, textAlign: "center" }}>{tr(`s_${s.id}`)}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{tr("hoursN", { n: nf(s.h) })}</Text>
                  </View>
                </Pressable>
              );
            })}
          </Grid>
        </View>
      ) : null}

      {/* achievements */}
      {show("badges") ? (
        <View style={[{ backgroundColor: t.surface, borderColor: t.line }, embedded ? { borderRadius: 16, borderWidth: 1 } : { borderTopWidth: 1, borderBottomWidth: 1 }]}>
          <View style={pad}>
            <H2>{tr("badgesTitle")}</H2>
            <Grid cols={badgeCols} gap={12} style={{ marginTop: 32 }}>
              {BADGES.map((b) => {
                const [have, goal] = b.need(ctx), done = have >= goal;
                return (
                  <Pressable key={b.id} onPress={() => setOpen({ def: b, have: done, note: tr(`d_${b.id}`) })} accessibilityRole="button"
                    accessibilityLabel={`${tr(`s_${b.id}`)}, ${done ? tr("earned") : Number.isFinite(goal) ? `${nf(Math.min(have, goal))} / ${nf(goal)}` : "–"}`}
                    style={({ pressed }) => ({ flex: 1, alignItems: "center", gap: 8, borderRadius: R.md, borderWidth: 1, padding: 12, borderColor: pressed ? alpha(t.gold, 0.6) : done ? alpha(t.gold, 0.4) : t.line, backgroundColor: done ? t.bg : "transparent" })}>
                    <Sticker def={b} size={56} locked={!done} pct={Number.isFinite(goal) ? have / goal : 0} />
                    <Text style={{ fontFamily: FONT.bold, fontSize: 14, lineHeight: 17, color: t.ink, textAlign: "center" }}>{tr(`s_${b.id}`)}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "center" }}>{done ? tr("earned") : Number.isFinite(goal) ? `${nf(Math.min(have, goal))} / ${nf(goal)}` : "–"}</Text>
                  </Pressable>
                );
              })}
            </Grid>
          </View>
        </View>
      ) : null}

      {/* listening */}
      {show("listen") ? (
        <View style={{ paddingHorizontal: embedded ? 4 : 20, paddingVertical: embedded ? 8 : 56 }}>
          <H2>{tr("listenTitle")}</H2>
          <View style={{ marginTop: 16 }}>
            <InkSegmented value={effRange} options={RANGES.map((r) => [r, r ? tr("lastDays", { n: r }) : tr("allTime")] as [Range, string])} onChange={pickRange} locked={pro ? [] : [365, 0]} />
          </View>
          <View style={{ marginTop: 24, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.line, overflow: "hidden" }}>
            <Grid cols={four} gap={1}>
              {[[dur(sum.seconds), tr("listened")], [nf(sum.verses), tr("versesHeard")], [nf(sum.days), tr("daysListened")], [sum.seconds ? `${String(favHour).padStart(2, "0")}:00` : "–", tr("favHour")]].map(([n, l]) => (
                <View key={l} style={{ backgroundColor: t.surface, padding: 16, flex: 1 }} accessible accessibilityLabel={`${n} ${l}`}>
                  <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }} adjustsFontSizeToFit numberOfLines={1}>{n}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 4 }}>{l}</Text>
                </View>
              ))}
            </Grid>
          </View>
          <Grid cols={wide} gap={20} style={{ marginTop: 24 }}>
            <Card>
              <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{tr("perDay")}</Text>
              <View style={{ height: 144, flexDirection: "row", alignItems: "flex-end", gap: 3, marginTop: 16 }} accessible accessibilityLabel={tr("perDay")}>
                {series.map((x) => <View key={x.day} style={{ flex: 1, minWidth: 0, height: `${Math.max(x.seconds ? 4 : 1, (x.seconds / maxS) * 100)}%`, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: x.day === today ? t.gold : alpha(t.accent, 0.7), opacity: x.seconds ? 1 : 0.25 }} />)}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{series[0] ? dayLabel(series[0].day, lang) : ""}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{tr("today")}</Text>
              </View>
            </Card>
            {pro ? (
              <Card>
                <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{tr("perHour")}</Text>
                <View style={{ height: 144, flexDirection: "row", alignItems: "flex-end", gap: 2, marginTop: 16 }}>
                  {sum.byHour.map((s, h) => <View key={h} style={{ flex: 1, minWidth: 0, height: `${Math.max(1, (s / maxH) * 100)}%`, borderTopLeftRadius: 2, borderTopRightRadius: 2, backgroundColor: h >= 4 && h <= 6 ? t.gold : alpha(t.accent, 0.6), opacity: s ? 1 : 0.25 }} />)}
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                  {["00", "06", "12", "18", "23"].map((h) => <Text key={h} style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{h}</Text>)}
                </View>
              </Card>
            ) : <ProLock title={tr("perHour")} height={100} />}
          </Grid>
          {pro ? (
            <Grid cols={wide} gap={20} style={{ marginTop: 20 }}>
              <Card>
                <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{tr("bySurah")}</Text>
                {sum.bySurah.length === 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, marginTop: 12 }}>{tr("noListen")}</Text> : (
                  <View style={{ gap: 10, marginTop: 16 }}>
                    {sum.bySurah.slice(0, 12).map((x) => (
                      <Pressable key={x.surah} onPress={() => go(`/surah/${x.surah}`)} accessibilityRole="link">
                        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                          <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{x.surah}. {name(x.surah)}</Text>
                          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{dur(x.seconds)} · {tr("versesN", { n: x.verses })}</Text>
                        </View>
                        <View style={{ height: 6, borderRadius: 3, backgroundColor: t.line, overflow: "hidden", marginTop: 4 }}>
                          <View style={{ height: 6, borderRadius: 3, backgroundColor: t.accent, width: `${Math.max(3, (x.seconds / sum.bySurah[0].seconds) * 100)}%` }} />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
                {sum.bySurah.length > 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 16 }}>{tr("surahsHeard", { n: sum.bySurah.length })}</Text> : null}
              </Card>
              <Card>
                <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{tr("byReciter")}</Text>
                {sum.byReciter.length === 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, marginTop: 12 }}>{tr("noListen")}</Text> : (
                  <View style={{ gap: 10, marginTop: 16 }}>
                    {sum.byReciter.slice(0, 8).map((x) => (
                      <View key={x.reciter}>
                        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                          <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{x.reciter}</Text>
                          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{dur(x.seconds)}</Text>
                        </View>
                        <View style={{ height: 6, borderRadius: 3, backgroundColor: t.line, overflow: "hidden", marginTop: 4 }}>
                          <View style={{ height: 6, borderRadius: 3, backgroundColor: t.gold, width: `${Math.max(3, (x.seconds / sum.byReciter[0].seconds) * 100)}%` }} />
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            </Grid>
          ) : (
            <Grid cols={wide} gap={20} style={{ marginTop: 20 }}>
              <ProLock title={tr("bySurah")} height={70} />
              <ProLock title={tr("byReciter")} height={70} />
            </Grid>
          )}
        </View>
      ) : null}

      {/* points */}
      {show("points") ? (
        <Stage hairlines={false} pattern={false} rounded={embedded ? 16 : 0}>
          <View style={[pad, { gap: 32 }]}>
            <View>
              <H2 onStage>{tr("pointsTitle")}</H2>
              <View style={{ height: 160, flexDirection: "row", alignItems: "flex-end", gap: 3, marginTop: 24 }} accessible accessibilityLabel={tr("last30")}>
                {ptsSeries.map((x) => <View key={x.day} style={{ flex: 1, minWidth: 0, height: `${Math.max(1, (x.p / maxP) * 100)}%`, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: x.day === today ? stage.gold : "rgba(255,255,255,0.35)", opacity: x.p ? 1 : 0.3 }} />)}
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>{tr("last30")}</Text>
              {Object.keys(todayKinds).length > 0 ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
                  {Object.entries(todayKinds).map(([k, v]) => (
                    <View key={k} style={{ borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 4 }}>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "#eef0f3" }}>{tr(`k_${k}`)} <Text style={{ fontFamily: FONT.bold, color: stage.gold }}>+{v}</Text></Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
            <StageBox style={{ padding: 20 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: "#eef0f3" }}>{tr("howTitle")}</Text>
              <View style={{ marginTop: 12 }}>
                {(Object.keys(RULES) as PointKind[]).filter((k) => k !== "streak").map((k, i) => (
                  <View key={k} style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: "rgba(255,255,255,0.1)" }}>
                    <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.8)" }}>{tr(`r_${k}`)}</Text>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: stage.gold }}>+{RULES[k].pts}{RULES[k].cap ? <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: "rgba(255,255,255,0.45)" }}> {tr("cap", { n: RULES[k].cap! })}</Text> : null}</Text>
                  </View>
                ))}
                <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" }}>
                  <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.8)" }}>{tr("r_streak")}</Text>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: stage.gold }}>+5 … 50</Text>
                </View>
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>{tr("intention")}</Text>
            </StageBox>
          </View>
        </Stage>
      ) : null}

      {/* learning */}
      {show("learn") ? (
        <View style={{ paddingHorizontal: embedded ? 4 : 20, paddingVertical: embedded ? 8 : 56 }}>
          <H2>{tr("learnTitle")}</H2>
          <Grid cols={learnCols} gap={12} style={{ marginTop: 24 }}>
            {[
              { n: nf(ctx.learned), l: tr("learned"), href: "/map", sub: `${tr("strong")} ${mem.strong} · ${tr("mid")} ${mem.mid} · ${tr("weak")} ${mem.weak}` },
              { n: `${ctx.arabicDone}/${ARABIC_LESSONS.length}`, l: tr("arabicLessons"), href: "/arabic" },
              { n: nf(ctx.reviews), l: tr("reviews"), href: "/today" },
              { n: nf(ctx.sessions), l: tr("sessions"), href: "/today" },
              { n: nf(ctx.fullSurahs), l: tr("fullSurahs"), href: "/map" },
              { n: nf(extra.tajweed), l: tr("tajweed"), href: "/tajweed" },
              { n: nf(extra.vocab), l: tr("vocab"), href: "/vocab" },
              { n: String(st.best), l: tr("bestStreak"), href: "/today" },
            ].map((x) => (
              <Card key={x.l} onPress={() => go(x.href)} label={`${x.n} ${x.l}`} style={{ padding: 16 }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 30, color: t.ink }}>{x.n}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, marginTop: 4 }}>{x.l}</Text>
                {x.sub ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 4 }}>{x.sub}</Text> : null}
              </Card>
            ))}
          </Grid>
        </View>
      ) : null}

      <StickerDialog open={open} onClose={() => setOpen(null)} />
    </View>
  );
}

/** the sticker or badge, large, with its verse and whether it is earned */
function StickerDialog({ open, onClose }: { open: { def: StickerDef; have: boolean; note: string } | null; onClose: () => void }) {
  const tr = useWebT("rewards");
  const def = open?.def;
  const hourNote = def && /^h\d/.test(def.id) ? ` · ${tr(`d_${def.id}`)}` : "";
  return (
    <Modal visible={!!open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 20 }} accessibilityLabel={tr("close")}>
        {open && def ? (
          <Pressable onPress={() => undefined} style={{ width: "100%", maxWidth: 384 }} accessibilityViewIsModal>
            <Stage rounded={16} style={{ borderWidth: 1, borderColor: "rgba(214,180,108,0.3)" }}>
              <View style={{ padding: 28, alignItems: "center" }}>
                {open.have ? <Rays size={400} style={{ top: 100 - 200, left: "50%", marginLeft: -200 }} /> : null}
                <StickerPop key={def.id}><Sticker def={def} size={140} locked={!open.have} /></StickerPop>
                <Text style={{ fontFamily: CALLIG_FONT, fontSize: 36, lineHeight: 54, color: stage.gold, marginTop: 16 }}>{def.ar}</Text>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 24, color: "#eef0f3", marginTop: 4, textAlign: "center" }}>{tr(`s_${def.id}`)}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.7)", marginTop: 8, textAlign: "center" }}>{open.note}{hourNote}</Text>
                {def.verse ? (
                  <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 40, color: "rgba(255,255,255,0.9)", marginTop: 16, textAlign: "center", writingDirection: "rtl" }}>
                    {def.verse} <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>({def.ref})</Text>
                  </Text>
                ) : null}
                <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: 1.9, textTransform: "uppercase", color: stage.gold, marginTop: 16 }}>{open.have ? tr("earned") : tr("notYet")}</Text>
                <OutlinePill onStage title={tr("close")} onPress={onClose} style={{ marginTop: 20, alignSelf: "center", minHeight: 44, paddingHorizontal: 20, borderColor: "rgba(255,255,255,0.25)" }} />
              </View>
            </Stage>
          </Pressable>
        ) : null}
      </Pressable>
    </Modal>
  );
}

export default StatsView;
