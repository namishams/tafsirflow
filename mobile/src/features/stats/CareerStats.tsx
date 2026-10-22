import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { StarLattice } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Loading } from "@/components/page";
import { useLang } from "@/i18n";
import { usePro } from "@/lib/pro";
import { countryName } from "@/lib/countries";
import { SITE } from "@/lib/api";
import { TOTAL_VERSES } from "@/web/quranIndex";
import { ShareSheet as ImageShareSheet } from "@/features/feed/share";
import { TalentAvatar } from "@/features/talents/ui";
import { BadgeMark } from "@/features/talents/badges";
import { CountryBadge } from "@/features/rankings/Flag";
import { DIVISION_MARK, type BoardCat } from "./career";
import { statsApi, type BoardRow, type CareerStats as Stats, type RankPos, type Side } from "./api";
import { localStats, ownExtras } from "./local";
import { demoBoard, demoStats } from "./demo";
import { useCT, type CKey } from "./text";
import { TierEmblem } from "./TierEmblem";
import { CareerCard, type CareerCardData } from "./CareerCard";

// The "Statistik" tab of a profile in the app (owner 22.10.2026; website: src/components/stats/CareerStatsWeb.tsx, 1:1):
// the career card (tier emblem in its progress ring, level and XP, member since, verified badge, country), places
// worldwide and in the country with the percentile, consistency, Shams progress, the Quran read in the khatm plan and
// the courses begun (own, this device), exams and certificates, garden and stickers, time learned, the milestone
// timeline, "you vs. them" between mutual follows, and the best learners worldwide. Every section shows only what the
// member shares. The card can be shared as an image (4:5 or 9:16). Spirit: encouragement in good, never boasting.

type Ct = ReturnType<typeof useCT>;

/** `username` null or `local`: the own statistics from this device (no community profile, offline) */
export function CareerStats({ username, own, local, name, demo }: { username: string | null; own: boolean; local?: boolean; name: string; demo?: boolean }) {
  const ct = useCT();
  const { lang } = useLang();
  const { pro } = usePro();
  const [s, setS] = useState<Stats | null>(null);
  const [state, setState] = useState<"load" | "ok" | "restricted" | "error">("load");
  const [top, setTop] = useState<Record<BoardCat, BoardRow[]> | null>(null);
  const load = () => {
    setState("load");
    if (__DEV__ && demo) {
      setS(demoStats(own)); setState("ok");
      setTop({ xp: demoBoard(48_000).slice(0, 3), verses: demoBoard(6_100).slice(0, 3), streak: demoBoard(400).slice(0, 3), exams: demoBoard(60).slice(0, 3) });
      return;
    }
    statsApi.top().then((d) => setTop(d.top)).catch(() => undefined);
    if (!username || local) { setS(localStats(name, username ?? "", pro)); setState("ok"); return; }
    statsApi.of(username, lang)
      .then((d) => { if (d.restricted || !d.stats) setState("restricted"); else { setS(d.stats); setState("ok"); } })
      .catch(() => { if (own) { setS(localStats(name, username, pro)); setState("ok"); } else setState("error"); });
  };
  useEffect(load, [username, local, lang, demo]); // eslint-disable-line react-hooks/exhaustive-deps
  if (state === "load") return <View style={{ padding: 24 }}><Loading /></View>;
  if (state === "restricted") return <Note>{ct("restricted")}</Note>;
  if (state === "error" || !s) return (
    <View style={{ padding: 20, gap: 12, alignItems: "center" }}>
      <Note>{ct("error")}</Note>
      <SoftBtn title={ct("retry")} onPress={load} />
    </View>
  );
  return <Body s={s} own={own || s.mine} local={!!local || !username} top={top} />;
}

function Body({ s, own, local, top }: { s: Stats; own: boolean; local: boolean; top: Record<BoardCat, BoardRow[]> | null }) {
  const t = useTheme();
  const ct = useCT();
  const { lang } = useLang();
  const [sharing, setSharing] = useState(false);
  const nf = useMemo(() => { try { return new Intl.NumberFormat(lang); } catch { return new Intl.NumberFormat("en"); } }, [lang]);
  const f = (n: number) => nf.format(n);
  const j = s.sijill;
  const extras = useMemo(() => (own ? ownExtras(lang) : null), [own, lang]);
  const since = s.memberSince ? ct("memberSince", { d: monthName(s.memberSince, lang) }) : "";
  const tierName = s.career ? `${ct(`tier_${s.career.tier}` as CKey)}${s.career.division ? ` ${DIVISION_MARK[s.career.division]}` : ""}` : "";
  const juzDone = (j.memorised?.juz ?? []).filter((x) => x >= 100).length;
  const hidden = <Text style={[st.small, { color: t.muted }]}>{ct("hidden")}</Text>;
  const card: CareerCardData | null = s.career ? {
    name: s.name, username: s.username, avatar: s.avatar, badge: s.badge, country: s.country, title: ct("careerCard"), tierLabel: tierName,
    pointsLabel: ct("pointsN", { n: f(s.career.score) }), career: s.career,
    stats: [
      { value: String(s.career.level.level), label: ct("levelN", { n: "" }).trim() || "Level" },
      { value: j.memorised ? f(j.memorised.verses) : "–", label: ct("cat_verses") },
      { value: j.time ? f(j.time.best) : "–", label: ct("streakBest") },
      s.ranks?.xp?.pct ? { value: ct("topPct", { n: f(s.ranks.xp.pct) }), label: ct("worldwide") } : { value: j.exams ? f(j.exams.length) : "–", label: ct("cat_exams") },
    ],
    place: [s.ranks?.xp?.rank ? `${ct("worldwide")} #${f(s.ranks.xp.rank)}` : "", s.country ? countryName(s.country, lang) : ""].filter(Boolean).join("  ·  "),
    since, url: `quranmasterclass.com/${lang}/talents/${s.username}`,
  } : null;

  return (
    <View style={{ padding: 16, gap: 14 }}>
      {/* career card */}
      <View style={{ borderRadius: 22, overflow: "hidden" }}>
        <LinearGradient colors={[stage.glow, stage.bg, stage.deep]} style={{ padding: 18, gap: 14 }}>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}><StarLattice opacity={0.07} /></View>
          <View style={{ alignItems: "center", gap: 8 }}>
            {s.career ? <TierEmblem tier={s.career.tier} division={s.career.division} size={136} progress={s.career.into} label={`${ct("tierLabel")}: ${tierName}`} />
              : <View style={{ width: 136, height: 136, borderRadius: 68, borderWidth: 1, borderColor: stage.hair, alignItems: "center", justifyContent: "center" }}><Text style={[st.small, { color: stage.textMuted }]}>{ct("hidden")}</Text></View>}
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, color: stage.gold }}>{ct("careerCard")}</Text>
            {s.career ? <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, color: stage.cream }}>{tierName}</Text> : null}
            {s.career ? (
              <Text style={{ fontFamily: FONT.medium, fontSize: 13.5, color: stage.textSoft, textAlign: "center" }}>
                {ct("pointsN", { n: f(s.career.score) })} · {s.career.next ? ct("nextTier", { n: f((s.career.nextAt ?? 0) - s.career.score), t: ct(`tier_${s.career.next}` as CKey) }) : ct("maxTier")}
              </Text>
            ) : null}
          </View>
          {s.career ? (
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 13.5, color: stage.text }}>{ct("levelN", { n: s.career.level.level })}</Text>
                <Text style={{ fontFamily: FONT.medium, fontSize: 12.5, color: stage.textMuted }}>{ct("xpToNext", { n: f(s.career.level.need - s.career.level.into), l: s.career.level.level + 1 })}</Text>
              </View>
              <Bar frac={s.career.level.into / Math.max(1, s.career.level.need)} dark />
            </View>
          ) : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
            {s.badge ? <Chip><BadgeMark badge={s.badge} size={14} /><ChipText>{ct("verified")}</ChipText></Chip> : null}
            {s.country ? <Chip><CountryBadge code={s.country} size={18} /><ChipText>{countryName(s.country, lang)}</ChipText></Chip> : !local ? <Chip><ChipText>{ct("noCountry")}</ChipText></Chip> : null}
            {since ? <Chip><ChipText>{since}</ChipText></Chip> : null}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Big value={s.ranks?.xp?.rank ? `#${f(s.ranks.xp.rank)}` : "–"} label={ct("worldwide")} />
            <Big value={s.ranks?.xp?.pct ? ct("topPct", { n: f(s.ranks.xp.pct) }) : "–"} label={ct("cat_xp")} />
            <Big value={j.memorised ? f(j.memorised.verses) : "–"} label={ct("cat_verses")} />
            <Big value={j.time ? f(j.time.best) : "–"} label={ct("streakBest")} />
          </View>
          {card && !local ? (
            <Pressable onPress={() => setSharing(true)} accessibilityRole="button"
              style={({ pressed }) => ({ minHeight: 46, borderRadius: R.md, backgroundColor: goldButton.to, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, opacity: pressed ? 0.8 : 1 })}>
              <Icon name="share" color={goldButton.text} size={17} />
              <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: goldButton.text }}>{ct("shareCard")}</Text>
            </Pressable>
          ) : null}
          {local ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: stage.textMuted, textAlign: "center" }}>{ct("localNote")}</Text> : null}
        </LinearGradient>
      </View>

      {/* places */}
      <Section title={ct("sec_ranks")}>
        {s.ranks ? (
          <View style={{ gap: 8 }}>
            {(["xp", "xp_week", "verses", "streak", "exams"] as const).map((k) => <Place key={k} label={ct(`cat_${k}` as CKey)} p={s.ranks![k]} country={s.country} f={f} />)}
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Text style={[st.body, { color: t.muted }]}>{own ? ct("notListedOwn") : ct("notListed")}</Text>
            {own && !local ? <GoldBtn title={ct("joinRankings")} onPress={() => router.push("/ranking" as Href)} /> : null}
          </View>
        )}
      </Section>

      {/* consistency */}
      <Section title={ct("sec_streaks")}>
        {j.time ? (
          <View style={{ gap: 12 }}>
            <Row3>
              <Num value={ct("daysN", { n: f(j.time.streak) })} label={ct("streakNow")} />
              <Num value={ct("daysN", { n: f(j.time.best) })} label={ct("streakBest")} />
              <Num value={ct("daysN", { n: f(j.time.wird) })} label={ct("wird")} />
            </Row3>
            {j.activity ? (
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: "row", gap: 5 }} accessible={false}>
                  {j.activity.week.map((x, i) => <View key={i} style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: x > 0 ? goldButton.to : t.line }} />)}
                </View>
                <Text style={[st.small, { color: t.muted }]}>{ct("activeWeek", { n: j.activity.active })}</Text>
              </View>
            ) : null}
          </View>
        ) : hidden}
      </Section>

      {/* Shams */}
      <Section title={ct("sec_shams")}>
        {j.memorised || j.hifz ? (
          <View style={{ gap: 12 }}>
            {j.memorised ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
                  <Num value={f(j.memorised.verses)} label={ct("versesMemorised")} />
                  <Text style={[st.small, { color: t.muted, fontFamily: FONT.semibold }]}>{ct("ofQuran", { n: f(pct1(j.memorised.verses, TOTAL_VERSES)) })}</Text>
                </View>
                <Bar frac={j.memorised.verses / TOTAL_VERSES} />
                <Text style={[st.small, { color: t.ink, fontFamily: FONT.semibold }]}>{`${ct("juzDone")}: ${juzDone} / 30`}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                  {(j.memorised.juz.length ? j.memorised.juz : new Array(30).fill(0)).map((x: number, i: number) => (
                    <View key={i} accessibilityLabel={`Juz ${i + 1}: ${x} %`}
                      style={{ width: "8.9%", aspectRatio: 1, borderRadius: 5, alignItems: "center", justifyContent: "center", backgroundColor: x >= 100 ? goldButton.to : x > 0 ? `rgba(15,138,99,${0.18 + (x / 100) * 0.6})` : t.dark ? "rgba(255,255,255,0.08)" : "rgba(13,31,25,0.07)" }}>
                      <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 10, color: x >= 100 ? goldButton.text : t.ink }}>{i + 1}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
            {j.hifz ? (
              <Row3>
                <Num value={ct("darajaN", { n: j.hifz.grade })} label={ct("darajat")} />
                <Num value={j.hifz.quality !== null ? `${j.hifz.quality} %` : "–"} label={ct("quality")} />
                <Num value={f(j.hifz.tests)} label={ct("hifzTests")} />
              </Row3>
            ) : null}
          </View>
        ) : hidden}
      </Section>

      {/* Quran read (own, khatm plan of this device) */}
      {extras?.readPct ? (
        <Section title={ct("sec_quran")}>
          <View style={{ gap: 8 }}>
            <Num value={`${f(extras.readPct)} %`} label={ct("quranRead")} />
            <Bar frac={extras.readPct / 100} />
            {extras.khatms > 0 ? <Text style={[st.small, { color: t.ink, fontFamily: FONT.semibold }]}>{ct("khatmN", { n: extras.khatms })}</Text> : null}
            <Text style={[st.small, { color: t.muted }]}>{ct("readHint")}</Text>
          </View>
        </Section>
      ) : null}

      {/* courses */}
      <Section title={ct("sec_courses")}>
        {j.courses || extras?.started.length ? (
          <View style={{ gap: 12 }}>
            {j.courses ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 10 }}>
                <Num value={f(j.courses.done)} label={ct("coursesDone")} half />
                <Num value={f(j.courses.qaida)} label={ct("qaida")} half />
                <Num value={f(j.courses.arabic)} label={ct("arabic")} half />
                <Num value={f(j.courses.rp)} label={ct("reciterPath")} half />
              </View>
            ) : null}
            {j.courses?.arLevels.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                <Text style={[st.small, { color: t.ink, fontFamily: FONT.semibold }]}>{ct("arLevels")}:</Text>
                {j.courses.arLevels.map((l) => <View key={l} style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: R.pill, borderWidth: 1, borderColor: t.line }}><Text style={[st.small, { color: t.ink }]}>{l}</Text></View>)}
              </View>
            ) : null}
            {extras?.started.length ? (
              <View style={{ gap: 10 }}>
                <Text style={[st.small, { color: t.ink, fontFamily: FONT.bold }]}>{ct("coursesStarted")}</Text>
                {extras.started.slice(0, 8).map((c) => (
                  <View key={c.id} style={{ gap: 4 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                      <Text numberOfLines={1} style={[st.small, { flex: 1, color: t.ink, fontFamily: FONT.semibold }]}>{c.title}</Text>
                      <Text style={[st.small, { color: t.muted }]}>{ct("lessonsOf", { n: c.done, t: c.total })}</Text>
                    </View>
                    <Bar frac={c.done / Math.max(1, c.total)} />
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : hidden}
      </Section>

      {/* exams and certificates */}
      <Section title={ct("sec_exams")}>
        {j.exams || j.certificates ? (
          <View style={{ gap: 12 }}>
            {j.exams ? (j.exams.length ? (
              <>
                <Row3>
                  <Num value={f(j.exams.length)} label={ct("examsPassed")} />
                  <Num value={`${Math.max(...j.exams.map((x) => x.pct))} %`} label={ct("bestScore")} />
                  <View style={{ flex: 1 }} />
                </Row3>
                {j.exams.slice(0, 6).map((x) => (
                  <View key={`${x.exam}:${x.ref}`} style={{ gap: 4 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={[st.small, { color: t.ink, fontFamily: FONT.semibold }]}>{examName(x.exam, x.ref)}</Text>
                      <Text style={[st.small, { color: t.muted }]}>{x.pct} %</Text>
                    </View>
                    <Bar frac={x.pct / 100} />
                  </View>
                ))}
              </>
            ) : <Text style={[st.body, { color: t.muted }]}>{ct("noExams")}</Text>) : null}
            {j.certificates?.length ? (
              <View style={{ gap: 6 }}>
                <Text style={[st.small, { color: t.ink, fontFamily: FONT.bold }]}>{ct("certificates")}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {j.certificates.map((c) => <View key={c.url} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.pill, borderWidth: 1, borderColor: goldButton.line }}><Text style={[st.small, { color: t.gold, fontFamily: FONT.semibold }]}>{`${c.title} · ${c.pct} %`}</Text></View>)}
                </View>
              </View>
            ) : null}
          </View>
        ) : hidden}
      </Section>

      {/* garden and stickers */}
      <Section title={ct("sec_garden")}>
        {j.tree || j.stickers ? (
          <View style={{ gap: 12 }}>
            {j.tree ? (
              <Row3>
                <Num value={ct("stageN", { n: j.tree.stage })} label={ct("treeStage")} />
                <Num value={f(j.tree.trees)} label={ct("trees")} />
                <Num value={f(j.tree.fruits)} label={ct("fruits")} />
              </Row3>
            ) : null}
            {j.stickers ? (
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={[st.small, { color: t.ink, fontFamily: FONT.semibold }]}>{ct("stickers")}</Text>
                  <Text style={[st.small, { color: t.muted }]}>{`${f(j.stickers.total)} / ${f(j.stickers.catalog)}`}</Text>
                </View>
                <Bar frac={j.stickers.total / Math.max(1, j.stickers.catalog)} />
                <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 10, marginTop: 4 }}>
                  <Num value={f(j.stickers.rare)} label={ct("rare")} half />
                  <Num value={f(j.stickers.epic)} label={ct("epic")} half />
                  <Num value={f(j.stickers.legendaryN)} label={ct("legendary")} half />
                  <Num value={f(j.stickers.series.length)} label={ct("seriesDone")} half />
                </View>
              </View>
            ) : null}
          </View>
        ) : hidden}
      </Section>

      {/* time learned */}
      <Section title={ct("sec_time")}>
        {j.time ? (
          <Row3>
            <Num value={ct("hoursN", { n: f(Math.round(j.time.totalMin / 6) / 10) })} label={ct("timeTotal")} />
            <Num value={ct("minutesN", { n: f(j.time.weekMin) })} label={ct("timeWeek")} />
            <View style={{ flex: 1 }} />
          </Row3>
        ) : hidden}
      </Section>

      {/* milestones */}
      {!local ? <Section title={ct("sec_milestones")}><Timeline s={s} ct={ct} lang={lang} /></Section> : null}

      {/* you vs. them */}
      {!own && s.compare ? (
        <Section title={ct("compareTitle", { u: s.name })}>
          {s.compare.allowed && s.compare.me ? <Compare me={s.compare.me} them={s} ct={ct} f={f} /> : <Text style={[st.body, { color: t.muted }]}>{ct("compareLocked")}</Text>}
        </Section>
      ) : null}

      {/* the best learners worldwide */}
      {top && (["xp", "verses", "streak", "exams"] as BoardCat[]).some((c) => top[c]?.length) ? (
        <Section title={ct("sec_top")} action={<Pressable onPress={() => router.push((__DEV__ && s.username.startsWith("demo.") ? "/ranking-global?demo=stats" : "/ranking-global") as Href)} accessibilityRole="link" hitSlop={8}><Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{ct("seeAll")}</Text></Pressable>}>
          <View style={{ gap: 14 }}>
            {(["xp", "verses", "streak", "exams"] as BoardCat[]).map((c) => top[c]?.length ? (
              <View key={c} style={{ gap: 6 }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.gold }}>{ct(c === "streak" ? "streakBest" : (`cat_${c}` as CKey))}</Text>
                {top[c].map((r) => <TopRow key={r.username} r={r} unit={ct(({ xp: "u_xp", verses: "u_verses", streak: "u_days", exams: "u_exams" } as const)[c])} f={f} />)}
              </View>
            ) : null)}
          </View>
        </Section>
      ) : null}

      <View style={{ borderRadius: R.lg, backgroundColor: "rgba(214,180,108,0.12)", padding: 14 }}>
        <Text style={[st.body, { color: t.ink }]}>{ct("humility")}</Text>
      </View>
      <View style={{ gap: 6, paddingHorizontal: 2 }}>
        <Text style={[st.small, { color: t.ink, fontFamily: FONT.bold }]}>{ct("tierInfo")}</Text>
        <Text style={[st.small, { color: t.muted }]}>{ct("tierText")}</Text>
        <Text style={[st.small, { color: t.muted }]}>{ct("privacyNote")}</Text>
      </View>
      {card ? (
        <ImageShareSheet visible={sharing} onClose={() => setSharing(false)} link={`${SITE}/${lang}/talents/${s.username}`} message={`${s.name} (@${s.username}) · ${tierName} · Quran Masterclass`} noDecoration seed={s.username}
          renderCard={(fmt) => <CareerCard d={card} format={fmt} />} />
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------- pieces
const pct1 = (n: number, of: number) => (of > 0 ? Math.min(100, Math.round((1000 * n) / of) / 10) : 0);
function monthName(ym: string, lang: string) {
  const [y, m] = ym.split("-").map(Number);
  try { return new Intl.DateTimeFormat(lang, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, (m || 1) - 1, 1))); } catch { return ym; }
}
const examName = (exam: string, ref: string) => ({ juz: `Juz ${ref}`, surah: `Surah ${ref}`, "rp-level": `Reciter Path ${ref}`, "ar-unit": `Arabic ${ref}`, qbank: ref } as Record<string, string>)[exam] ?? `${exam} ${ref}`;
const st = StyleSheet.create({
  body: { fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21 },
  small: { fontFamily: FONT.regular, fontSize: 13, lineHeight: 18 },
});

function Note({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[st.body, { color: t.muted, textAlign: "center", padding: 24 }]}>{children}</Text>;
}
function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: t.line, backgroundColor: t.dark ? t.surface : t.bg, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, flexShrink: 1 }}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}
function Chip({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.pill, borderWidth: 1, borderColor: stage.hair, backgroundColor: "rgba(255,255,255,0.08)" }}>{children}</View>;
}
const ChipText = ({ children }: { children: ReactNode }) => <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: stage.text }}>{children}</Text>;
function Big({ value, label }: { value: string; label: string }) {
  return (
    <View accessible accessibilityLabel={`${value}, ${label}`} style={{ flexBasis: "47%", flexGrow: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: StyleSheet.hairlineWidth, borderColor: stage.hair, alignItems: "center" }}>
      <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: FONT.display, fontSize: 24, color: "#fff", fontVariant: ["tabular-nums"] }}>{value}</Text>
      <Text numberOfLines={1} style={{ fontFamily: FONT.medium, fontSize: 12, color: stage.textMuted }}>{label}</Text>
    </View>
  );
}
function Num({ value, label, half }: { value: string; label: string; half?: boolean }) {
  const t = useTheme();
  return (
    <View accessible accessibilityLabel={`${value}, ${label}`} style={half ? { width: "50%", paddingEnd: 8 } : { flex: 1, minWidth: 0 }}>
      <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink, fontVariant: ["tabular-nums"] }}>{value}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 16, color: t.muted }}>{label}</Text>
    </View>
  );
}
const Row3 = ({ children }: { children: ReactNode }) => <View style={{ flexDirection: "row", gap: 10 }}>{children}</View>;
function Bar({ frac, dark }: { frac: number; dark?: boolean }) {
  const t = useTheme();
  const w = Math.max(0, Math.min(100, frac * 100));
  return (
    <View style={{ height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: dark ? "rgba(255,255,255,0.15)" : t.line }}>
      <View style={{ width: `${w}%`, height: 8, borderRadius: 4, backgroundColor: goldButton.to }} />
    </View>
  );
}
function GoldBtn({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ alignSelf: "flex-start", minHeight: 44, paddingHorizontal: 18, borderRadius: R.md, backgroundColor: goldButton.to, justifyContent: "center", opacity: pressed ? 0.8 : 1 })}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: goldButton.text }}>{title}</Text>
    </Pressable>
  );
}
function SoftBtn({ title, onPress }: { title: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: 18, borderRadius: R.md, borderWidth: 1, borderColor: t.line, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{title}</Text>
    </Pressable>
  );
}
function Place({ label, p, country, f }: { label: string; p: RankPos | undefined; country: string | null; f: (n: number) => string }) {
  const t = useTheme();
  const ct = useCT();
  const { lang } = useLang();
  if (!p) return null;
  return (
    <View style={{ borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: t.line, padding: 12, gap: 4 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: 10, rowGap: 4 }}>
        <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink, fontVariant: ["tabular-nums"] }}>{p.rank ? `#${f(p.rank)}` : "–"}</Text>
        {p.rank ? <Text style={[st.small, { color: t.muted }]}>{ct("ofN", { n: f(p.total) })}</Text> : null}
        {p.pct ? <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.pill, backgroundColor: "rgba(214,180,108,0.16)" }}><Text style={{ fontFamily: FONT.bold, fontSize: 12, color: t.gold }}>{ct("topPct", { n: f(p.pct) })}</Text></View> : null}
      </View>
      {p.country && country ? <Text style={[st.small, { color: t.ink }]}>{`${ct("inCountry", { c: countryName(country, lang) })}: #${f(p.country)} ${ct("ofN", { n: f(p.countryTotal) })}`}</Text> : null}
    </View>
  );
}
function TopRow({ r, unit, f }: { r: BoardRow; unit: string; f: (n: number) => string }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => { if (!r.username.startsWith("demo.")) router.push(`/talents/u/${r.username}` as Href); }} accessibilityRole="link" accessibilityLabel={`${r.rank}. ${r.name}, ${f(r.score)} ${unit}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44, opacity: pressed ? 0.7 : 1 })}>
      <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: r.rank === 1 ? goldButton.to : t.dark ? "rgba(255,255,255,0.1)" : "rgba(13,31,25,0.07)" }}>
        <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 12, color: r.rank === 1 ? goldButton.text : t.ink }}>{r.rank}</Text>
      </View>
      <TalentAvatar name={r.name} size={32} uri={r.avatar} badge={r.badge} />
      <View style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{r.name}</Text>
        {r.badge ? <BadgeMark badge={r.badge} size={13} /> : null}
      </View>
      {r.country ? <CountryBadge code={r.country} size={22} /> : null}
      <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.ink, fontVariant: ["tabular-nums"] }}>{`${f(r.score)} `}<Text style={{ fontFamily: FONT.medium, color: t.muted }}>{unit}</Text></Text>
    </Pressable>
  );
}
function Timeline({ s, ct, lang }: { s: Stats; ct: Ct; lang: string }) {
  const t = useTheme();
  const label = (m: { kind: string; ref: string; data: Record<string, unknown> }) => {
    const n = Number(m.data.n ?? m.data.pct ?? 0);
    switch (m.kind) {
      case "level": return ct("ms_level", { n });
      case "hifz": return ct("ms_hifz", { n });
      case "juz": return ct("ms_juz", { n });
      case "tree": return ct("ms_tree", { n });
      case "sticker": return m.ref.startsWith("S:") ? ct("ms_series") : ct("ms_sticker");
      case "streak": return ct("ms_streak", { n });
      case "course": return m.data.arabic ? ct("ms_arabic", { n: String(m.data.arabic) }) : ct("ms_course");
      case "certificate": return ct("ms_certificate");
      case "exam": return ct("ms_exam", { n: Number(m.data.pct ?? 0) });
      default: return m.kind;
    }
  };
  let df: Intl.DateTimeFormat;
  try { df = new Intl.DateTimeFormat(lang, { day: "numeric", month: "short", year: "numeric" }); } catch { df = new Intl.DateTimeFormat("en"); }
  const items = [...s.milestones.map((m) => ({ key: `${m.kind}:${m.ref}`, label: label(m), when: df.format(new Date(m.at)) })),
    ...(s.memberSince ? [{ key: "joined", label: ct("ms_joined"), when: monthName(s.memberSince, lang) }] : [])];
  if (!items.length) return <Text style={[st.body, { color: t.muted }]}>{ct("noMilestones")}</Text>;
  return (
    <View>
      {items.map((x, i) => (
        <View key={x.key} style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ width: 14, alignItems: "center" }}>
            <View style={{ width: 11, height: 11, marginTop: 5, borderRadius: 2, borderWidth: 2, borderColor: goldButton.to, transform: [{ rotate: "45deg" }] }} />
            {i < items.length - 1 ? <View style={{ flex: 1, width: 1, backgroundColor: "rgba(214,180,108,0.4)", marginTop: 3 }} /> : null}
          </View>
          <View style={{ flex: 1, paddingBottom: 14 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{x.label}</Text>
            <Text style={[st.small, { color: t.muted }]}>{x.when}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
function Compare({ me, them, ct, f }: { me: Side; them: Side; ct: Ct; f: (n: number) => string }) {
  const t = useTheme();
  const rows: [string, number | null, number | null][] = [
    [ct("careerScore"), me.career?.score ?? null, them.career?.score ?? null],
    [ct("cat_xp"), me.sijill.level?.xp ?? null, them.sijill.level?.xp ?? null],
    [ct("cat_verses"), me.sijill.memorised?.verses ?? null, them.sijill.memorised?.verses ?? null],
    [ct("streakBest"), me.sijill.time?.best ?? null, them.sijill.time?.best ?? null],
    [ct("cat_exams"), me.sijill.exams?.length ?? null, them.sijill.exams?.length ?? null],
  ];
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: "#0F8A63" }}>{ct("you")}</Text>
        <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 13, color: t.gold, flexShrink: 1 }}>{them.name}</Text>
      </View>
      {rows.map(([label, a, b]) => {
        if (a === null || b === null) return null;
        const max = Math.max(1, a, b);
        return (
          <View key={label} accessible accessibilityLabel={`${label}: ${ct("you")} ${f(a)}, ${them.name} ${f(b)}`} style={{ gap: 4 }}>
            <Text style={[st.small, { color: t.muted, textAlign: "center", fontFamily: FONT.semibold }]}>{label}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ flex: 1, height: 9, borderRadius: 5, overflow: "hidden", backgroundColor: t.line, flexDirection: "row", justifyContent: "flex-end" }}>
                <View style={{ width: `${(a / max) * 100}%`, height: 9, borderRadius: 5, backgroundColor: "#0F8A63" }} />
              </View>
              <Text style={{ minWidth: 96, textAlign: "center", fontFamily: FONT.bold, fontSize: 12.5, color: t.ink, fontVariant: ["tabular-nums"] }}>{`${f(a)} · ${f(b)}`}</Text>
              <View style={{ flex: 1, height: 9, borderRadius: 5, overflow: "hidden", backgroundColor: t.line }}>
                <View style={{ width: `${(b / max) * 100}%`, height: 9, borderRadius: 5, backgroundColor: goldButton.to }} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
