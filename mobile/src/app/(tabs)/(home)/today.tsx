import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, Pressable, Text, View } from "react-native";
import { Stack, router, useFocusEffect, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { CALLIG_FONT, FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Arabic, Arcade, GoldButton, GoldProgress, OutlineButton, Poster, PosterGrid, SectionTitle, SmallStar, Stage, Tile, gradientColors } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, goBack } from "@/components/page";
import { intlLocale, useLang, useT } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { useAuth } from "@/lib/auth";
import { readJSON, useStoreVersion } from "@/lib/store";
import { getChapters, type Chapter } from "@/lib/quran";
import { dueVerses, readSrs, stats, today, weakestVerses } from "@/web/learning";
import { dailyGoal, levelOf, levelStart, nextLesson, readProgress, streakOf } from "@/web/academy";
import { PLAN_DAYS, TRACKS, dayOfPlan, newPerDay, portion, ranges, readPlan } from "@/web/plans";
import { TOTAL_VERSES } from "@/web/quranIndex";
import { CITIES, dayFor, fmtTime, type Spot } from "@/web/prayer";
import { LESSONS as ARABIC_LESSONS, arabicPercent, nextArabic, readArabic } from "@/web/arabic";
import { dayPlan } from "@/web/coach";
import { currentItem, readSession, startSession } from "@/web/session";
import { tile, routeOf } from "@/lib/features";
import { VerseOfTheDay } from "@/features/today/VerseOfTheDay";
import { TODAY_VERSE, TODAY_WORD } from "@/features/today/arabic";
import { ProPromo } from "@/features/learn/ProPromo";
import { CoachCard, MapCard, RewardsCard, WeekCard } from "@/features/progress";
import { PrayerSetupCard } from "@/features/practice";
import { IslamicCountdown } from "@/features/practice/IslamicCountdown";
import { Onboarding } from "@/features/extra/Onboarding";
import { HadithOfTheDay, HowToPrayCard, NahjCard, TraditionAsk } from "@/features/hadith/cards";
import { CommunityCard } from "@/features/community/ui";
import { Announcement } from "@/features/extra/widgets/Announcement";
import { courseLang } from "@/features/arabic/lang";
import { FeedButton, FeedSpotlight } from "@/features/feed/EntryCards";
import { readShamsMode, usesWird } from "@/features/shams2/mode";

// "Today" (website TodayDashboard.tsx): the daily hub – the greeting stage with the ring of today's tasks and the next
// prayer, one big button for today's guided session, the checklist that ticks itself off, verse of the day, paths,
// weak verses, courses and tools.
type Task = { key: string; title: string; detail: string; href: string; cta: string; done: boolean };
type Last = { chapter: number; verse: number };

export default function Today() {
  const t = useTheme();
  const w = useWebT("today");
  const ws = useWebT("session");
  const wp = useWebT("prayer");
  const wh = useWebT("home2");
  const { lang } = useLang();
  const tr = useT();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  useStoreVersion();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [now, setNow] = useState(new Date());
  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  useFocusEffect(useCallback(() => { setNow(new Date()); const id = setInterval(() => setNow(new Date()), 30_000); return () => clearInterval(id); }, []));
  useEffect(() => { const s = AppState.addEventListener("change", (st) => st === "active" && setNow(new Date())); return () => s.remove(); }, []);

  const v = useMemo(() => collect(lang), [lang, now]); // eslint-disable-line react-hooks/exhaustive-deps
  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? String(s);
  const loc = intlLocale(lang);
  const dateText = now.toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long" });
  const hijri = (() => { try { return new Intl.DateTimeFormat(`${lang}-u-ca-islamic-umalqura`, { day: "numeric", month: "long", year: "numeric", numberingSystem: "latn" }).format(now); } catch { return ""; } })();
  const cityId = readJSON<string>("tf:city", "makkah");
  const spot: Spot = cityId === "mine" ? readJSON<Spot | null>("tf:myspot", null) ?? CITIES[0] : CITIES.find((c) => c.id === cityId) ?? CITIES[0];
  const pd = dayFor(spot, now);
  const placeName = cityId === "mine" ? wp("yourPlace") : (CITIES.find((c) => c.id === cityId)?.names[lang] ?? CITIES.find((c) => c.id === cityId)?.names.en ?? "");

  // the daily checklist (same tasks as the website)
  const tasks: Task[] = [];
  const first = v.due[0];
  // the learner's Shams method decides where the review and the first step lead: today's wird (2.0) or the classic session
  const wirdMode = usesWird(readShamsMode());
  tasks.push(first
    ? { key: "review", title: w("taskReview", { n: v.due.length }), detail: w("taskReviewD"), href: wirdMode ? "/shams/wird" : `/shams/${first.split(":")[0]}?v=${first.split(":")[1]}`, cta: w("start"), done: false }
    : v.learned
      ? { key: "review", title: w("taskReviewDone"), detail: w("taskReviewDoneD"), href: "/map", cta: w("open"), done: true }
      : { key: "start", title: w("startTitle"), detail: w("startBody"), href: wirdMode ? "/shams/wird" : "/shams/1", cta: w("startCta"), done: false });
  if (v.plan) {
    const r = ranges(v.plan.portion);
    tasks.push({ key: "plan", title: w("taskPlan", { n: v.plan.perDay }), detail: r.map((x) => `${name(x.s)} ${x.from}${x.to > x.from ? `–${x.to}` : ""}`).join(", "), href: r[0] ? `/shams/${r[0].s}?v=${r[0].from}` : "/plan", cta: w("learn"), done: v.plan.doneToday });
  } else tasks.push({ key: "plan", title: w("taskNoPlan"), detail: w("taskNoPlanD"), href: "/plan", cta: w("choose"), done: false });
  if (v.arabicNext) tasks.push({ key: "arabic", title: w("taskArabic"), detail: v.arabicNext.title[courseLang(lang)] ?? v.arabicNext.title.en, href: `/arabic/${v.arabicNext.id}`, cta: w("learn"), done: v.arabicDoneToday });
  tasks.push({ key: "academy", title: w("taskAcademy", { goal: v.goal }), detail: w("taskAcademyD", { xp: v.todayXp, lesson: `${name(v.next.s)} ${v.next.from}–${v.next.to}` }), href: `/academy/${v.next.s}/${v.next.from}`, cta: w("test"), done: v.todayXp >= v.goal });
  if (v.khatm) tasks.push({ key: "khatm", title: w("taskKhatm"), detail: w("taskKhatmD", { pct: v.khatm.pct }), href: "/khatm", cta: w("read"), done: v.khatm.readToday });
  const doneCount = tasks.filter((x) => x.done).length;
  const nextTask = tasks.find((x) => !x.done);
  const lvl = v.level, lvlFrom = levelStart(lvl), lvlTo = levelStart(lvl + 1);
  const lvlPct = Math.min(100, Math.round(((v.xp - lvlFrom) / Math.max(1, lvlTo - lvlFrom)) * 100));
  const plan = dayPlan();
  const open = readSession();
  const startDay = () => { const s = open ?? startSession(); const it = currentItem(s); if (it) { const [su, ve] = it.key.split(":"); router.push(`/shams/${su}?v=${ve}&session=1` as Href); } };
  const go = (href: string) => router.push(href as Href);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        {/* stage: the day under a lattice of light */}
        <Stage hairlines={false}>
          <Text allowFontScaling={false} style={{ position: "absolute", right: -6, top: insets.top + 6, fontFamily: CALLIG_FONT, fontSize: 92, lineHeight: 150, color: "rgba(214,180,108,0.16)" }}>{TODAY_WORD}</Text>
          <View style={{ paddingHorizontal: 18, paddingTop: insets.top + 6, paddingBottom: 18 }}>
            {/* a stack screen (opened from the Feed and the account settings): the way back, as on every PageHero */}
            <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel={tr("common.back")} hitSlop={12} style={{ width: 40, height: 40, justifyContent: "center", marginStart: -6, marginBottom: 2 }}>
              <Icon name="chevronLeft" color="#ffffff" size={24} />
            </Pressable>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.4, textTransform: "uppercase", color: stage.gold }}>{dateText}{hijri ? ` · ${hijri}` : ""}</Text>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.8, color: "#fff", marginTop: 8 }}>{user?.name ? w("hello", { name: user.name.split(" ")[0] }) : w("title")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: stage.textSoft, marginTop: 8 }}>{doneCount >= tasks.length ? w("allDone") : w("tasksLeft", { n: tasks.length - doneCount })}</Text>
            <Arabic size={20} color="rgb(233,207,153)" style={{ textAlign: "left", writingDirection: "rtl", marginTop: 4 }}>{TODAY_VERSE.text} <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted }}>({TODAY_VERSE.cite})</Text></Arabic>

            {/* next prayer in an arch */}
            <Pressable onPress={() => go("/prayer")} accessibilityRole="button" accessibilityLabel={`${w("nextPrayer")}: ${wp(pd.next)} ${fmtTime(pd.nextAt, spot.tz, lang)}`}
              style={{ alignSelf: "flex-start", marginTop: 14, borderWidth: 1, borderColor: "rgba(214,180,108,0.35)", backgroundColor: "rgba(255,255,255,0.04)", borderTopLeftRadius: 80, borderTopRightRadius: 80, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 10, alignItems: "center" }}>
              <View style={{ position: "absolute", top: 5 }}><Icon name="moon" color={stage.gold} size={14} /></View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted }}>{w("nextPrayer")} · {placeName}</Text>
              <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: "#fff", marginTop: 2 }}>{wp(pd.next)} · <Text style={{ color: stage.gold }}>{fmtTime(pd.nextAt, spot.tz, lang)}</Text></Text>
            </Pressable>

            {/* ring of today's tasks + stats */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 18, marginTop: 22 }}>
              <Ring value={tasks.length ? doneCount / tasks.length : 0} label={`${doneCount}/${tasks.length}`} />
              <View style={{ flex: 1, flexDirection: "row" }}>
                <HeroStat n={String(v.streak)} l={w("tileStreak")} />
                <HeroStat n={String(v.todayCount)} l={w("tileToday")} border />
                <HeroStat n={String(lvl)} l={`${w("level")} · ${lvlPct} %`} border />
              </View>
            </View>

            <View style={{ marginTop: 22, gap: 10 }}>
              <GoldButton title={open ? ws("resume", { n: open.i + 1, total: open.items.length }) : ws("start", { min: plan.minutes })} icon="play" onPress={startDay} />
              {v.last ? <OutlineButton onStage title={w("continueTitle", { surah: name(v.last.chapter), verse: v.last.verse })} onPress={() => go(`/quran/${v.last!.chapter}?v=${v.last!.verse}`)} /> : null}
              <FeedButton />
            </View>
          </View>
          <Arcade />
        </Stage>
        <Announcement />

        <View style={{ paddingHorizontal: 16, gap: 28, marginTop: 24 }}>
          <FeedSpotlight />
          <Onboarding />
          <TraditionAsk />
          <IslamicCountdown onPress={() => go("/calendar")} />
          <HowToPrayCard />
          <RewardsCard />
          {/* checklist */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 12 }}><SmallStar size={15} color={t.gold} /><Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 23, color: t.ink }}>{w("tasksTitle")}</Text></View>
            <View style={{ gap: 10 }}>
              {tasks.map((task, i) => {
                const isNext = nextTask?.key === task.key;
                return (
                  <View key={task.key} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderRadius: R.lg, borderWidth: 1, borderColor: task.done ? "rgba(150,116,52,0.2)" : isNext ? "rgba(150,116,52,0.6)" : "rgba(150,116,52,0.25)", backgroundColor: isNext ? (t.dark ? "rgba(214,178,106,0.07)" : "rgb(253,250,243)") : t.surface }}>
                    <StarBadge tone={task.done ? "emerald" : isNext ? "gold" : "light"}>{task.done ? <Icon name="check" color="#fff" size={15} /> : <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: isNext ? goldButton.text : t.gold }}>{i + 1}</Text>}</StarBadge>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: task.done ? t.muted : t.ink, textDecorationLine: task.done ? "line-through" : "none" }}>{task.title}</Text>
                      <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{task.detail}</Text>
                    </View>
                    {!task.done ? (isNext
                      ? <GoldButton title={task.cta} compact onPress={() => go(task.href)} style={{ alignSelf: "center" }} />
                      : <Pressable onPress={() => go(task.href)} accessibilityRole="button" style={{ paddingHorizontal: 14, height: 36, justifyContent: "center", borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(150,116,52,0.4)" }}><Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.ink }}>{task.cta}</Text></Pressable>) : null}
                  </View>
                );
              })}
            </View>
          </View>

          <CoachCard />
          <VerseOfTheDay />
          <HadithOfTheDay />
          <CommunityCard />
          <NahjCard />
          <PrayerSetupCard />
          <WeekCard />
          <MapCard />

          {/* learning paths */}
          <Tile style={{ padding: 18 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{w("pathsTitle")}</Text>
            <View style={{ gap: 14, marginTop: 12 }}>
              <PathRow label={w("pathArabic")} pct={v.arabicPct} hint={v.arabicNext ? (v.arabicNext.title[courseLang(lang)] ?? v.arabicNext.title.en) : w("done")} onPress={() => go("/arabic")} />
              <PathRow label={w("pathAcademy", { lvl })} pct={lvlPct} hint={w("xpToNext", { n: Math.max(0, lvlTo - v.xp) })} onPress={() => go("/academy")} />
              <PathRow label={w("pathPlan")} pct={v.plan ? Math.round((v.plan.day / PLAN_DAYS) * 100) : 0} hint={v.plan ? w("planDay", { d: v.plan.day, total: PLAN_DAYS }) : w("taskNoPlan")} onPress={() => go("/plan")} />
              <PathRow label={w("pathKhatm")} pct={v.khatm?.pct ?? 0} hint={v.khatm ? `${v.khatm.pct} %` : w("tileKhatm")} onPress={() => go("/khatm")} />
            </View>
          </Tile>

          {/* weak verses + tiles */}
          <Tile style={{ padding: 18 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{w("weakTitle")}</Text>
            {v.weak.length === 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}><SmallStar size={11} color={t.gold} /><Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, flex: 1 }}>{w("weakNone")}</Text></View>
            ) : (
              <View style={{ gap: 8, marginTop: 10 }}>
                {v.weak.map((x) => { const [s, vn] = x.key.split(":").map(Number); return (
                  <Pressable key={x.key} onPress={() => go(`/shams/${s}?v=${vn}`)} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: R.md, borderWidth: 1, borderColor: "rgba(150,116,52,0.25)", paddingHorizontal: 12, paddingVertical: 10 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, flex: 1 }} numberOfLines={1}>{name(s)} · {vn}</Text>
                    <View style={{ width: 80 }}><GoldProgress value={x.strength} /></View>
                  </Pressable>); })}
              </View>
            )}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              <SmallTile v={v.learned} l={w("tileToday")} /><SmallTile v={v.secure} l={w("tileSecure")} /><SmallTile v={v.marks} l={w("tileMarks")} /><SmallTile v={v.notes} l={w("tileNotes")} />
            </View>
          </Tile>

          <ProPromo compact />

          <View>
            <SectionTitle title={wh("coursesTitle")} action={wh("coursesAll")} onAction={() => go("/academy")} />
            <PosterGrid>
              {["shams", "arabic", "salah", "tajweed", "vocab", "duas", "reciters", "islam", "radio", "prayer"].map((k) => tile(k)).filter((x) => !!x).map((x) => (
                <CourseTile key={x!.key} k={x!.key} />
              ))}
            </PosterGrid>
          </View>

          {/* how the masterclass is built */}
          <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: "rgba(150,116,52,0.3)", backgroundColor: t.dark ? "rgba(214,178,106,0.06)" : "rgb(251,247,238)", padding: 18, overflow: "hidden" }}>
            <Text allowFontScaling={false} style={{ position: "absolute", right: 10, bottom: -18, fontFamily: CALLIG_FONT, fontSize: 70, lineHeight: 110, color: "rgba(150,116,52,0.12)" }}>منهج</Text>
            <Text style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink }}>{w("howTitle")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, marginTop: 6 }}>{w("howBody")}</Text>
            <Text onPress={() => go("/how")} accessibilityRole="link" style={{ fontFamily: FONT.bold, fontSize: 14, color: t.accent, marginTop: 10 }}>{w("howCta")}</Text>
          </View>

          {!user ? (
            <Tile style={{ padding: 18, gap: 12 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.muted }}>{w("saveHint")}</Text>
              <GoldButton title={w("saveCta")} onPress={() => go("/register")} />
            </Tile>
          ) : null}
        </View>
      </Page>
    </>
  );
}

function CourseTile({ k }: { k: string }) {
  const w = useWebT();
  const x = tile(k)!;
  return <Poster title={w(`nav.${x.key}`)} desc={w(`home2.${x.desc}`)} badge={w(`home2.badge_${x.badge}`)} arabic={x.ar} colors={gradientColors(x.bg)} cta={w("home2.open")} onPress={() => router.push(routeOf(x) as Href)} />;
}

function Ring({ value, label }: { value: number; label: string }) {
  const size = 96, r = 40, c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityLabel={label}>
      <Svg width={size} height={size} viewBox="0 0 96 96" style={{ position: "absolute" }}>
        <Defs><SvgGradient id="ring" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f3e2b6" /><Stop offset="1" stopColor="#c6a65e" /></SvgGradient></Defs>
        <Circle cx={48} cy={48} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={6} fill="none" />
        <Circle cx={48} cy={48} r={r} stroke="url(#ring)" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={`${c * Math.max(0.001, value)} ${c}`} rotation={-90} origin="48,48" />
      </Svg>
      <Text style={{ fontFamily: FONT.display, fontSize: 21, color: "#fff" }}>{label}</Text>
    </View>
  );
}

function HeroStat({ n, l, border }: { n: string; l: string; border?: boolean }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 8, borderStartWidth: border ? 1 : 0, borderStartColor: "rgba(214,180,108,0.2)" }} accessible accessibilityLabel={`${n} ${l}`}>
      <Text style={{ fontFamily: FONT.display, fontSize: 27, color: "#fff" }}>{n}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: "rgba(255,255,255,0.6)", marginTop: 3 }} numberOfLines={2}>{l}</Text>
    </View>
  );
}

function StarBadge({ tone, children }: { tone: "emerald" | "gold" | "light"; children: React.ReactNode }) {
  const t = useTheme();
  const fill = tone === "emerald" ? "rgb(6,108,78)" : tone === "gold" ? "#d8bd80" : t.surface;
  const stroke = tone === "light" ? "rgba(150,116,52,0.5)" : "transparent";
  return (
    <View style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", width: 28, height: 28, backgroundColor: fill, borderWidth: 1, borderColor: stroke, transform: [{ rotate: "45deg" }], borderRadius: 4 }} />
      <View style={{ position: "absolute", width: 28, height: 28, backgroundColor: fill, borderWidth: 1, borderColor: stroke, borderRadius: 4 }} />
      {children}
    </View>
  );
}

function PathRow({ label, pct, hint, onPress }: { label: string; pct: number; hint: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}, ${pct} %`}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, flex: 1 }} numberOfLines={1}>{label}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.gold }}>{pct}{" "}%</Text>
      </View>
      <View style={{ marginTop: 7 }}><GoldProgress value={pct / 100} /></View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 5 }} numberOfLines={1}>{hint}</Text>
    </Pressable>
  );
}

function SmallTile({ v, l }: { v: number; l: string }) {
  const t = useTheme();
  return (
    <View style={{ flexBasis: "47%", flexGrow: 1, alignItems: "center", borderRadius: R.md, borderWidth: 1, borderColor: "rgba(150,116,52,0.2)", backgroundColor: t.dark ? "rgba(214,178,106,0.05)" : "rgb(253,250,243)", paddingVertical: 10 }}>
      <Text style={{ fontFamily: FONT.display, fontSize: 20, color: t.gold }}>{v}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{l}</Text>
    </View>
  );
}

function collect(lang: string) {
  const srs = readSrs();
  const st = stats();
  const ac = readProgress();
  const plan = readPlan();
  const tr = plan ? TRACKS.find((x) => x.id === plan.track) : null;
  const k0 = readJSON<{ pos: number; log: Record<string, number>; deleted?: boolean } | null>("tf:khatm", null);
  const khatm = k0 && !k0.deleted ? k0 : null;
  const ar = readArabic();
  const d = today();
  const arabicNext = nextArabic(ar);
  void lang;
  return {
    due: dueVerses(srs),
    streak: Math.max(st.streak, streakOf(ac)), todayCount: st.todayCount,
    learned: Object.keys(srs).length, secure: Object.values(srs).filter((x) => x.stage >= 3).length,
    marks: readJSON<string[]>("tf:bookmarks", []).length, notes: Object.keys(readJSON<Record<string, unknown>>("tf:notes", {})).length,
    last: readJSON<Last | null>("tf:last", null),
    todayXp: ac.days[d] ?? 0, goal: dailyGoal(ac), level: levelOf(ac.xp), xp: ac.xp, next: nextLesson(ac),
    arabicPct: arabicPercent(ar), arabicNext, arabicDoneToday: Object.values(ar.done).some((x) => Math.floor((x.at ?? 0) / 86400000) === d) || (!arabicNext && ARABIC_LESSONS.length > 0),
    plan: plan && tr ? (() => {
      const day = dayOfPlan(plan);
      const part = portion(tr, day);
      const practised = part.length > 0 && part.every((x) => srs[`${x.s}:${x.v}`]?.last === d);
      return { day, perDay: newPerDay(tr, day), portion: part, doneToday: (plan.done[d] ?? 0) > 0 || practised };
    })() : null,
    khatm: khatm ? { pct: Math.round((khatm.pos / TOTAL_VERSES) * 100), readToday: (khatm.log?.[d] ?? 0) > 0 } : null,
    weak: weakestVerses(4, srs).filter((x) => x.strength < 0.9),
  };
}
