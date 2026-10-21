import { memo, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useIsFocused, type Href } from "expo-router";
import { Arcade, Eyebrow, GoldButton, GoldProgress, SectionTitle, SmallStar, Stage, StarLattice } from "@/components/brand";
import { Icon } from "@/components/icons";
import { isRTL, useLang } from "@/i18n";
import { useStoreVersion } from "@/lib/store";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, TONES, stage as ST, useTheme } from "@/lib/theme";
import { useNahjVisible } from "@/lib/tradition";
import { surahProgress } from "@/web/coach";
import { courseById, tx } from "@/features/courses";
import { courseI18n } from "@/features/courses/titles-i18n";
import { nahjCourseText } from "@/features/nahj-course/text";
import { useQbankT } from "@/features/qbank/text";
import { useS2 } from "@/features/shams2/text";
import { useShams2 } from "@/features/shams2/model";
import { useShamsContinue } from "@/features/shams2/ModeChooser";
import { useSchoolT } from "@/features/school/texts";
import { ABRAHAMIC_COURSE } from "@/features/abrahamic/lessons";
import { HARAMAIN_COURSE } from "@/features/haramain/lessons";
import { tick } from "@/features/feed/haptics";
import {
  FACULTIES, STAGES, SUBJECTS, SUBJECT_PLACE, coursesOf, currentStage, hrefOf, stageState, stateOf, subjectGrades, titleOf,
  type FacultyId, type SchoolCourse, type StageId,
} from "@/features/school/model";
import { useCampusT, type CampusKey } from "./text";
import { misharyTile } from "@/features/mishary/texts";
import { WISDOM, WISDOM_REVIEW, tipOfDay, wisdomText, type Wisdom } from "./wisdom";

// The campus: the Madrasa hero (stage, next step, today's wird, faculties, records) at the top of Discover and the
// Masterclass tab, rails of every course and tool per faculty with the learner's progress on each tile, a
// "continue" rail and the study wisdom of the day. Nothing is copied: every tile opens the existing screen and
// reads progress from that course's own store (school/model.ts stateOf).

const go = (href: string) => { tick(); router.push(href as Href); };
const pct = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 100);
const shortStage = (ar: string) => ar.replace("المرحلة ", "").replace(" (الجامعية)", "");

/** the store version while the Discover tab is in front. A hidden tab keeps the last value, so the hero and the rails
 *  are not recomputed on every write elsewhere (listening stats, settings); they catch up when the tab comes back. */
function useFocusedVersion(): number {
  const v = useStoreVersion();
  const focused = useIsFocused();
  const last = useRef(v);
  if (focused) last.current = v;
  return last.current;
}

/** letter-spacing for small Latin labels; none in Arabic-script languages, where tracking breaks the joining of letters */
function useTrack() {
  const { lang } = useLang();
  const rtl = isRTL(lang);
  return (x: number) => (rtl ? 0 : x);
}
/** in the Arabic interface an Arabic name and its translation are the same text: show it once (no Latin transliteration) */
const plain = (x: string) => x.replace(/[\u064B-\u0652\u0670\u0640]/g, "").replace(/\s*\(.*\)\s*$/, "").trim();
const sameAr = (lang: string, a: string, b: string) => lang === "ar" && plain(a) === plain(b);

/** the four records of the school shown in the Madrasa hero (Discover leaves them out of the exam rail below it) */
export const HERO_RECORD_HREFS = ["/school/report", "/school/transcript", "/school/timetable", "/school/certificates"] as const;

/** progress of any course source through the Madrasa's reader (no new store) */
const progressOf = (src: SchoolCourse["src"]) => stateOf({ id: "campus", stage: "ibtidai", subject: "quran", required: false, src }).done;

// ---------- the Madrasa hero ----------

export function MadrasaHero({ eyebrow, topInset = true }: { eyebrow?: string; topInset?: boolean }) {
  const insets = useSafeAreaInsets();
  const st = useSchoolT();
  const ct = useCampusT();
  const { s } = useS2();
  const { lang } = useLang();
  const { wird } = useShams2();
  const sc = useShamsContinue();
  const ar = lang === "ar"; // Arabic interface: one Arabic name, no Latin transliteration
  const v = useFocusedVersion();
  const data = useMemo(() => {
    const stage = currentStage();
    const stages = STAGES.map((x) => stageState(x.id));
    const grades = subjectGrades(stage);
    const faculties = FACULTIES.map((f) => {
      const subs = grades.filter((g) => SUBJECT_PLACE[g.subject].faculty === f.id);
      return { ...f, done: subs.length ? subs.reduce((a, g) => a + g.done, 0) / subs.length : 0 };
    });
    const list = coursesOf(stage);
    const next = [...list.filter((c) => c.required), ...list.filter((c) => !c.required)].find((c) => stateOf(c).done < 0.999) ?? null;
    return { stage, stages, faculties, next, nextDone: next ? stateOf(next).done : 1 };
  }, [v]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = data.stages.find((x) => x.id === data.stage)!;
  const curDef = STAGES.find((x) => x.id === data.stage)!;
  const curIdx = STAGES.findIndex((x) => x.id === data.stage);
  const records: { ar: string; label: string; href: string }[] = [
    { ar: "كشف الدرجات", label: st("report"), href: "/school/report" },
    { ar: "السجل الأكاديمي", label: st("w_sijill"), href: "/school/transcript" },
    { ar: "الجدول الدراسي", label: st("timetable"), href: "/school/timetable" },
    { ar: "الشهادات", label: st("certificates"), href: "/school/certificates" },
  ];
  return (
    <Stage hairlines={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: (topInset ? insets.top : 0) + 22, paddingBottom: 8, gap: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1, gap: 8 }}>
            <Eyebrow onStage>{eyebrow ?? st("kicker")}</Eyebrow>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 34, lineHeight: 38, color: "#fff", letterSpacing: -0.6 }}>{st("title")}</Text>
          </View>
          {sameAr(lang, "المدرسة", st("title")) ? null : <Text allowFontScaling={false} accessibilityLanguage="ar" style={{ fontFamily: CALLIG_FONT, fontSize: 34, lineHeight: 58, color: ST.gold }}>{"المدرسة"}</Text>}
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: ST.textSoft, marginTop: -6 }}>{ct("heroLead")}</Text>

        {/* the learner's stage */}
        <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: "rgba(233,207,153,0.28)", backgroundColor: "rgba(255,255,255,0.05)", padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 13, color: ST.gold }}>{st("yourStage")}</Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: ST.cream }}>{ct("stageN", { n: `${curIdx + 1}/4` })}</Text>
          </View>
          <View style={{ gap: 2 }}>
            <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 36, color: ST.gold, textAlign: "left" }}>{curDef.ar}</Text>
            {ar ? null : <Text style={{ fontFamily: FONT.display, fontSize: 19, lineHeight: 24, color: "#fff" }}>{st(`stage_${data.stage}`)}</Text>}
            {ar ? null : <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: ST.textMuted }}>{curDef.tr}</Text>}
          </View>
          <GoldProgress value={cur.done} track="rgba(255,255,255,0.12)" />
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: ST.textSoft }}>{st("stageProgress", { p: pct(cur.done) })}</Text>
          {/* the four stages */}
          <View style={{ flexDirection: "row", gap: 6, marginTop: 2 }}>
            {STAGES.map((x, i) => {
              const sd = data.stages[i];
              const isCur = x.id === data.stage, complete = sd.complete;
              return (
                <Pressable key={x.id} onPress={() => go(`/school/${x.id}`)} accessibilityRole="button" accessibilityLabel={`${st(`stage_${x.id}`)}, ${complete ? ct("done") : isCur ? ct("current") : st("locked")}`}
                  style={{ flex: 1, alignItems: "center", gap: 6 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1.5,
                    borderColor: isCur || complete ? ST.gold : "rgba(255,255,255,0.25)", backgroundColor: isCur ? ST.gold : complete ? "rgba(214,180,108,0.18)" : "transparent" }}>
                    {complete ? <Icon name="check" size={14} color={ST.gold} /> : <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: isCur ? ST.bg : ST.textMuted }}>{x.n}</Text>}
                  </View>
                  <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={1} style={{ fontFamily: ARABIC_FONT, fontSize: 13, lineHeight: 22, color: isCur ? ST.gold : ST.textMuted }}>{shortStage(x.ar)}</Text>
                  {ar ? null : <Text numberOfLines={2} style={{ fontFamily: FONT.medium, fontSize: 10.5, lineHeight: 13, textAlign: "center", color: isCur ? "#fff" : ST.textMuted }}>{st(`stage_${x.id}`)}</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* next step and today's wird */}
        <View style={{ gap: 10 }}>
          {data.next ? (
            <HeroRow icon="cap" kicker={ct("nextStep")} title={titleOf(data.next, lang, st)} sub={`${st(`subj_${data.next.subject}`)} · ${data.nextDone > 0 ? st("progress", { p: pct(data.nextDone) }) : ct("start")}`}
              value={data.nextDone} onPress={() => go(hrefOf(data.next!))} />
          ) : <HeroRow icon="checkCircle" kicker={ct("nextStep")} title={ct("allDone")} sub={st("stageDone")} onPress={() => go(`/school/${data.stage}`)} />}
          {/* the Shams method the learner chose: today's wird (2.0) or the next classic session */}
          {sc.mode === "v2"
            ? <HeroRow icon="sun" kicker={ct("todayWird")} title={s("hubTitle")} sub={s("entryToday", { a: wird.sabaq.verses, b: wird.sabqi.verses, c: wird.manzil.verses })} onPress={() => go(sc.href)} />
            : <HeroRow icon="sun" kicker={sc.kicker} title={sc.title} sub={sc.line} onPress={() => go(sc.href)} />}
        </View>

        {/* faculties */}
        <View style={{ gap: 10 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 13, color: ST.gold }}>{ct("faculties")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingEnd: 4 }} style={{ marginHorizontal: -20 }} contentInset={{ left: 20 }}>
            <View style={{ width: 10 }} />
            {data.faculties.map((f) => (
              <Pressable key={f.id} onPress={() => go("/school")} accessibilityRole="button" accessibilityLabel={`${st(`fac_${f.id}`)}, ${pct(f.done)} %`}
                style={({ pressed }) => ({ width: 200, borderRadius: R.md, borderWidth: 1, borderColor: f.id === "quran" ? ST.gold : "rgba(255,255,255,0.16)", backgroundColor: f.id === "quran" ? "rgba(214,180,108,0.10)" : "rgba(255,255,255,0.04)", padding: 14, gap: 6, opacity: pressed ? 0.85 : 1 })}>
                <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={1} style={{ fontFamily: ARABIC_FONT, fontSize: 16, lineHeight: 28, color: ST.gold, textAlign: "left" }}>{f.ar}</Text>
                {ar ? null : <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 12, color: ST.cream }}>{f.tr}</Text>}
                {sameAr(lang, f.ar, st(`fac_${f.id}`)) ? null : <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 16, color: ST.textSoft, minHeight: 32 }}>{st(`fac_${f.id}`)}</Text>}
                <GoldProgress value={f.done} track="rgba(255,255,255,0.12)" />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: ST.textMuted }}>{ct("pct", { p: pct(f.done) })}</Text>
              </Pressable>
            ))}
            <View style={{ width: 10 }} />
          </ScrollView>
        </View>

        {/* records of the school */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {records.map((r) => (
            <Pressable key={r.href} onPress={() => go(r.href)} accessibilityRole="button" accessibilityLabel={r.label}
              style={({ pressed }) => ({ width: "48.6%", flexGrow: 1, borderRadius: R.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", backgroundColor: "rgba(255,255,255,0.04)", paddingVertical: 10, paddingHorizontal: 12, opacity: pressed ? 0.85 : 1 })}>
              <Text allowFontScaling={false} accessibilityLanguage="ar" numberOfLines={1} style={{ fontFamily: ARABIC_FONT, fontSize: 14, lineHeight: 24, color: ST.gold, textAlign: "left" }}>{r.ar}</Text>
              {sameAr(lang, r.ar, r.label) ? null : <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13, color: "#fff" }}>{r.label}</Text>}
            </Pressable>
          ))}
        </View>

        <GoldButton title={ct("enter")} icon="cap" onPress={() => go("/school")} />
      </View>
      <View style={{ marginTop: 12 }}><Arcade /></View>
    </Stage>
  );
}

function HeroRow({ icon, kicker, title, sub, value, onPress }: { icon: "cap" | "sun" | "checkCircle"; kicker: string; title: string; sub: string; value?: number; onPress: () => void }) {
  const tr = useTrack();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${kicker}: ${title}. ${sub}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: R.lg, borderWidth: 1, borderColor: "rgba(233,207,153,0.35)", backgroundColor: pressed ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)", padding: 14 })}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(214,180,108,0.16)", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={18} color={ST.gold} /></View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: tr(1.6), textTransform: "uppercase", color: ST.gold }}>{kicker}</Text>
        <Text numberOfLines={2} style={{ fontFamily: FONT.bold, fontSize: 15.5, lineHeight: 20, color: "#fff" }}>{title}</Text>
        <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: ST.textSoft }}>{sub}</Text>
        {value !== undefined && value > 0 ? <View style={{ marginTop: 4 }}><GoldProgress value={value} track="rgba(255,255,255,0.12)" /></View> : null}
      </View>
      <Icon name="chevronRight" size={15} color={ST.gold} />
    </Pressable>
  );
}

// ---------- tiles and rails ----------

export type CampusItem = { key: string; title: string; sub: string; ar: string; href: string; done: number | null; tone: number; kicker?: string };

/** a tile: tone, Arabic word, title, line and the learner's progress */
export const CampusTile = memo(function CampusTile({ item, width = 168 }: { item: CampusItem; width?: number }) {
  const ct = useCampusT();
  const st = useSchoolT();
  const tr = useTrack();
  const [a, b] = TONES[item.tone % TONES.length];
  const status = item.done === null ? null : item.done >= 0.999 ? ct("done") : item.done > 0 ? ct("pct", { p: pct(item.done) }) : ct("start");
  return (
    <Pressable onPress={() => go(item.href)} accessibilityRole="button" accessibilityLabel={`${item.title}. ${item.sub}${status ? `. ${status}` : ""}`}
      style={({ pressed }) => ({ width, height: 214, borderRadius: R.md, overflow: "hidden", borderWidth: 1, borderColor: "rgba(214,180,108,0.28)", transform: [{ scale: pressed ? 0.985 : 1 }] })}>
      <LinearGradient colors={[a, b]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ flex: 1, padding: 14, justifyContent: "space-between" }}>
        <StarLattice opacity={0.05} size={44} />
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
          {item.kicker ? <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1 }}><SmallStar size={9} color={ST.gold} /><Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 9.5, letterSpacing: tr(1.3), textTransform: "uppercase", color: ST.gold, flexShrink: 1 }}>{item.kicker}</Text></View> : <View />}
        </View>
        <Text allowFontScaling={false} accessibilityElementsHidden importantForAccessibility="no" numberOfLines={1}
          style={{ position: "absolute", top: 26, end: 10, fontFamily: CALLIG_FONT, fontSize: 40, lineHeight: 70, color: "rgba(214,180,108,0.22)" }}>{item.ar}</Text>
        <View style={{ gap: 5 }}>
          <Text numberOfLines={2} style={{ fontFamily: FONT.display, fontSize: 16.5, lineHeight: 20, color: "#fff" }}>{item.title}</Text>
          <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 15, color: ST.textSoft, minHeight: 30 }}>{item.sub}</Text>
          {item.done !== null ? (
            <View style={{ gap: 5, marginTop: 4 }}>
              <GoldProgress value={item.done} track="rgba(255,255,255,0.14)" />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: tr(1.1), textTransform: "uppercase", color: item.done >= 0.999 ? ST.gold : ST.cream }}>{status}</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: tr(1.1), textTransform: "uppercase", color: ST.gold }}>{st("open")}</Text>
              <Icon name="chevronRight" size={11} color={ST.gold} />
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
});

/** a rail: title (optional Arabic line) and tiles that scroll sideways */
export function CampusRail({ title, arabic, lead, items, action, onAction }: { title: string; arabic?: string; lead?: string; items: CampusItem[]; action?: string; onAction?: () => void }) {
  const t = useTheme();
  const { lang } = useLang();
  if (!items.length) return null; // never an empty row
  if (arabic && sameAr(lang, arabic, title)) arabic = undefined;
  return (
    <View>
      <View style={{ paddingHorizontal: 16 }}>
        {arabic ? <Text allowFontScaling={false} accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 17, lineHeight: 28, color: t.gold, textAlign: "left" }}>{arabic}</Text> : null}
        <SectionTitle title={title} action={action} onAction={onAction} style={lead ? { marginBottom: 4 } : undefined} />
        {lead ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted, marginBottom: 12 }}>{lead}</Text> : null}
      </View>
      {/* virtualised: only the first tiles of each rail mount with Discover, the rest as they scroll in */}
      <FlatList horizontal data={items} keyExtractor={railKey} renderItem={renderRailTile} showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }} ItemSeparatorComponent={RailGap} initialNumToRender={3} maxToRenderPerBatch={4} windowSize={3} />
    </View>
  );
}

const railKey = (i: CampusItem) => i.key;
const renderRailTile = ({ item }: { item: CampusItem }) => <CampusTile item={item} />;
const RailGap = () => <View style={{ width: 12 }} />;

type Rail = { id: string; title: string; arabic?: string; lead?: string; items: CampusItem[] };

export type CampusRailsData = { rails: Rail[]; stageItems: CampusItem[]; stageTitle: string };

/** every course and tool, grouped by faculty, with progress */
export function useCampusRails(): CampusRailsData {
  const st = useSchoolT();
  const ct = useCampusT();
  const qt = useQbankT();
  const { s } = useS2();
  const { lang } = useLang();
  const nahjOn = useNahjVisible();
  const v = useFocusedVersion();
  return useMemo(() => {
    const course = (id: string, tone: number, kicker?: string): CampusItem[] => {
      const c = courseById(id);
      if (!c) return [];
      return [{ key: `course-${id}`, title: courseI18n(id, 0, lang) ?? tx(c.title, lang), sub: courseI18n(id, 1, lang) ?? tx(c.lead, lang), ar: c.word, href: `/courses/${id}`, done: progressOf({ k: "course", id: id as never }), tone, kicker }];
    };
    const item = (key: string, title: CampusKey | string, sub: CampusKey | string, ar: string, href: string, done: number | null, tone: number, kicker?: string): CampusItem =>
      ({ key, title, sub, ar, href, done, tone, kicker });
    const sp = surahProgress();
    const shamsAll = (() => { const tot = sp.reduce((a, r) => a + (r?.total ?? 0), 0); return tot ? sp.reduce((a, r) => a + (r?.learned ?? 0), 0) / tot : 0; })();
    const fac = (id: FacultyId) => FACULTIES.find((f) => f.id === id)!;
    const facTitle = (id: FacultyId) => st(`fac_${id}`).replace(/\s*\(.*\)$/, "");
    const levels = ["A1", "A2", "B1", "B2", "C1"] as const;
    const nc = nahjCourseText(lang);

    const quran: CampusItem[] = [
      item("shams2", ct("shamsHub"), ct("shamsHubD"), "منهج", "/shams/method", null, 0),
      item("wird", ct("wird"), ct("wirdD"), "ورد", "/shams/wird", null, 1),
      item("shams", ct("shams"), ct("shamsD"), "شمس", "/shams", shamsAll, 2),
      item("rp", ct("reciterPath"), ct("reciterPathD"), "تلاوة", "/reciter-path", progressOf({ k: "rp", from: 1, to: 10 }), 3),
      item("mishary", misharyTile(lang).title, misharyTile(lang).sub, "قارئ", "/mishary", null, 4),
      item("tajweed", ct("tajweed"), ct("tajweedD"), "تجويد", "/tajweed", progressOf({ k: "tajweed" }), 4),
      ...course("tajweed-deep", 5),
      ...course("ulum", 6),
      item("darajat", ct("darajat"), ct("darajatD"), "درجات", "/shams/darajat", null, 7),
      item("mut", ct("mutashabihat"), ct("mutashabihatD"), "متشابه", "/shams/mutashabihat", null, 0),
      item("hifz", ct("hifz"), ct("hifzD"), "حفظ", "/cards/hifz", null, 1),
      item("cards", ct("cards"), ct("cardsD"), "بطاقات", "/cards", null, 2),
      item("tests", ct("tests"), ct("testsD"), "امتحان", "/tests", null, 3),
    ];
    const arabic: CampusItem[] = [
      item("qaida", ct("readArabic"), ct("readArabicD"), "اقرأ", "/arabic/read", progressOf({ k: "qaida" }), 4),
      ...levels.map((l, i) => item(`ar-${l}`, ct("arabicLevel", { level: l }), ct("arabicLevelD"), "عربي", "/arabic/lang", progressOf({ k: "arabic", level: l }), 5 + i)),
      item("vocab", ct("vocab"), ct("vocabD"), "كلمات", "/vocab", null, 2),
    ];
    const usul: CampusItem[] = [
      ...course("aqidah", 0), ...course("names", 1), ...course("prophets", 2), ...course("seerah", 3), ...course("hadith-sci", 4),
      item("hadith", ct("hadithLib"), ct("hadithLibD"), "حديث", "/hadith", null, 5),
      ...course("akhlaq", 6), ...course("adhkar", 7),
      item("nahj", nahjOn ? nc.short : nc.optInTitle, nahjOn ? nc.lead : nc.optInNote, "نهج", "/nahj-studies", nahjOn ? progressOf({ k: "nahj" }) : null, 0),
    ];
    const sharia: CampusItem[] = [
      ...course("fiqh-salah-sawm", 1), ...course("ramadan", 2), ...course("hajj", 3),
      item("salah", ct("salah"), ct("salahD"), "صلاة", "/salah", null, 4),
      item("wudu", ct("wudu"), ct("wuduD"), "وضوء", "/wudu", null, 5),
      item("duas", ct("duas"), ct("duasD"), "دعاء", "/duas", null, 6),
    ];
    const heritage: CampusItem[] = [
      item("abrahamic", ABRAHAMIC_COURSE.title[lang as "en"] ?? ABRAHAMIC_COURSE.title.en, ct("abrahamicD"), "إبراهيم", ABRAHAMIC_COURSE.route, progressOf({ k: "kit", def: ABRAHAMIC_COURSE }), 1),
      item("haramain", HARAMAIN_COURSE.title[lang as "en"] ?? HARAMAIN_COURSE.title.en, ct("haramainD"), "الحرمين", HARAMAIN_COURSE.route, progressOf({ k: "kit", def: HARAMAIN_COURSE }), 0),
    ];
    const exams: CampusItem[] = [
      item("exams", qt("title"), ct("examsD"), "امتحانات", "/exams", null, 0, qt("titleTr")),
      item("mock", ct("mock"), ct("mockD"), "اختبار", "/exams/mock", null, 1),
      item("examStats", ct("examStats"), ct("examStatsD"), "إحصاء", "/exams/stats", null, 2),
      item("certs", st("certificates"), ct("certificatesD"), "شهادة", "/school/certificates", null, 3),
      item("report", st("report"), ct("reportD"), "كشف", "/school/report", null, 4, "Kashf ad-darajāt"),
      item("transcript", st("w_sijill"), ct("transcriptD"), "سجل", "/school/transcript", null, 5),
      item("timetable", st("timetable"), ct("timetableD"), "جدول", "/school/timetable", null, 6),
    ];
    const growth: CampusItem[] = [
      item("garden", ct("garden"), ct("gardenD"), "حديقة", "/garden", null, 0),
      item("sijill", ct("sijill"), ct("sijillD"), "سجل", "/talents/sijill", null, 1),
      item("talents", ct("talents"), ct("talentsD"), "مواهب", "/talents", null, 2),
      item("leaderboard", ct("leaderboard"), ct("leaderboardD"), "تنافس", "/talents/leaderboard", null, 3),
    ];
    const stage: StageId = currentStage();
    const stageItems: CampusItem[] = coursesOf(stage).map((c, i) => ({
      key: `stage-${c.id}`, title: titleOf(c, lang, st), sub: `${st(`subj_${c.subject}`)} · ${c.required ? st("required") : st("elective")}`,
      ar: SUBJECTS.find((x) => x.id === c.subject)?.ar ?? "", href: hrefOf(c), done: stateOf(c).done, tone: i,
    }));
    // the Arabic interface shows no Latin transliteration under the faculty name
    const facRail = (id: FacultyId, items: CampusItem[]): Rail => ({ id, title: facTitle(id), arabic: fac(id).ar, lead: lang === "ar" ? undefined : fac(id).tr, items });
    return {
      stageItems,
      stageTitle: `${ct("stageTitle")} · ${st(`stage_${stage}`)}`,
      rails: [
        facRail("quran", quran), facRail("arabic", arabic), facRail("usul", usul), facRail("sharia", sharia),
        { id: "exams", title: ct("examsTitle"), arabic: "مركز الامتحانات", items: exams },
        { id: "heritage", title: ct("heritageTitle"), items: heritage },
        { id: "growth", title: ct("growthTitle"), items: growth },
      ],
    };
  }, [v, lang, nahjOn]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** "continue" (started, not finished), the courses of the learner's stage, then one rail per faculty */
export function CampusRails({ only, skip }: { only?: string[]; skip?: ReadonlySet<string> }) {
  const data = useCampusRails();
  return <CampusRailsView data={data} only={only} skip={skip} />;
}

/** the rails of CampusRails from data the screen already computed (Discover reads the hrefs to show each place once);
 *  faculty tiles whose href is in `skip` are left out (the records the Madrasa hero already shows) */
export function CampusRailsView({ data, only, skip }: { data: CampusRailsData; only?: string[]; skip?: ReadonlySet<string> }) {
  const ct = useCampusT();
  const { rails: all, stageItems, stageTitle } = data;
  const rails = useMemo(() => (skip ? all.map((r) => ({ ...r, items: r.items.filter((i) => !skip.has(i.href)) })) : all), [all, skip]);
  const started = useMemo(() => {
    const seen = new Set<string>();
    return [...stageItems, ...rails.flatMap((r) => r.items)]
      .filter((i) => i.done !== null && i.done > 0.001 && i.done < 0.999)
      .filter((i) => { const k = i.href; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => (b.done ?? 0) - (a.done ?? 0)).slice(0, 12);
  }, [rails, stageItems]);
  const shown = only ? rails.filter((r) => only.includes(r.id)) : rails;
  return (
    <View style={{ gap: 30 }}>
      <CampusRail title={ct("continueTitle")} items={started} />
      <CampusRail title={stageTitle} items={stageItems} />
      {shown.map((r) => <CampusRail key={r.id} title={r.title} arabic={r.arabic} lead={r.lead} items={r.items} />)}
    </View>
  );
}

// ---------- study wisdom ----------

export function StudyWisdom() {
  const t = useTheme();
  const ct = useCampusT();
  const tr = useTrack();
  const { lang } = useLang();
  const today = tipOfDay();
  const [pick, setPick] = useState(today);
  const w = WISDOM[pick];
  const others = useMemo(() => WISDOM.map((x, i) => ({ x, i })).filter(({ i }) => i !== pick), [pick]);
  return (
    <View style={{ gap: 14 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <SectionTitle title={ct("wisdomTitle")} style={{ marginBottom: 4 }} />
        <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted }}>{ct("wisdomLead")}</Text>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <Stage rounded={R.card} hairlines={false} style={{ borderWidth: 1, borderColor: "rgba(214,180,108,0.45)" }}>
          <View style={{ padding: 20, gap: 10 }} accessible accessibilityLabel={`${pick === today ? ct("tipOfDay") : ct(`cat_${w.cat}`)}. ${wisdomText(w.title, lang)}. ${wisdomText(w.body, lang)}${w.source ? `. ${ct("source")}: ${w.source}` : ""}`}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <SmallStar size={11} color={ST.gold} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: tr(1.6), textTransform: "uppercase", color: ST.gold }}>{pick === today ? `${ct("tipOfDay")} · ${ct(`cat_${w.cat}`)}` : ct(`cat_${w.cat}`)}</Text>
            </View>
            <Text style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 27, color: "#fff" }}>{wisdomText(w.title, lang)}</Text>
            {w.ar ? <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 19, lineHeight: 36, color: ST.gold, textAlign: "right", writingDirection: "rtl" }}>{w.ar}</Text> : null}
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: ST.textSoft }}>{wisdomText(w.body, lang)}</Text>
            {w.source ? <Text style={{ fontFamily: FONT.medium, fontSize: 12, lineHeight: 17, color: ST.cream }}>{`${w.who ? `${w.who} · ` : ""}${ct("source")}: ${w.source}`}</Text> : null}
            {WISDOM_REVIEW.status === "pending" && w.cat === "saying" ? <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: ST.textMuted }}>{ct("review")}</Text> : null}
          </View>
        </Stage>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }} accessibilityLabel={ct("more")}>
        {others.map(({ x, i }) => <WisdomChip key={x.id} w={x} onPress={() => { tick(); setPick(i); }} />)}
      </ScrollView>
    </View>
  );
}

function WisdomChip({ w, onPress }: { w: Wisdom; onPress: () => void }) {
  const t = useTheme();
  const ct = useCampusT();
  const tr = useTrack();
  const { lang } = useLang();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${ct(`cat_${w.cat}`)}: ${wisdomText(w.title, lang)}`}
      style={({ pressed }) => ({ width: 200, height: 118, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: pressed ? t.bg : t.surface, padding: 14, gap: 6 })}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: tr(1.3), textTransform: "uppercase", color: t.gold }}>{ct(`cat_${w.cat}`)}</Text>
      <Text numberOfLines={2} style={{ fontFamily: FONT.bold, fontSize: 14.5, lineHeight: 19, color: t.ink }}>{wisdomText(w.title, lang)}</Text>
      <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 16, color: t.muted }}>{wisdomText(w.body, lang)}</Text>
    </Pressable>
  );
}
