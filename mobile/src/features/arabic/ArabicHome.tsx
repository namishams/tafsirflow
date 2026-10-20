import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { GoldButton, GoldCard, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { courseLang, type CourseLang } from "./lang";
import { useLang } from "@/i18n";
import { FREE, openPro, usePro } from "@/lib/pro";
import { useStoreVersion } from "@/lib/store";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, useTheme, FWD } from "@/lib/theme";
import { LESSONS, PASS_PCT, UNITS, arabicPercent, nextArabic, readArabic, unlocked, type ArabicProgress, type Lesson } from "@/web/arabic";
import { Gate, IllumFrame, MedalText, PracticeMedallion, PracticeStar, PracticeStarNum, Rail } from "../coursekit/art";
import { ChipButton, ProCard } from "../coursekit/ui";
import { useCourseT } from "../coursekit/strings";
import { HOME_T } from "./texts";

// ArabicHome.tsx: where you are (a medallion and the next gate), the placement test, and the path – every unit a row
// of arched gates. Progress is the website's "tf:arabic" (synced with the account). Lessons after the free ones carry
// a small gold lock and open the Pro sheet; the whole course always stays visible.

// the Arabic shown in a lesson's gate: its letters, or the first words of its first learning card (website glyph())
const glyph = (l: Lesson) => l.letters ? l.letters.join(" ") : l.formsOf ? l.formsOf.slice(0, 3).join(" ") : (l.learn[0]?.ar ?? "").split(" ").slice(0, 2).join(" ");

export const isProLesson = (l: Lesson) => !l.placement && LESSONS.indexOf(l) >= FREE.arabicLessons;

export function useOpenLesson() {
  const { pro } = usePro();
  return (l: Lesson) => (!pro && isProLesson(l) ? openPro("arabic") : router.push(`/arabic/${l.id}` as Href));
}

export function ArabicHome() {
  const t = useTheme();
  const lang = courseLang(useLang().lang);
  const T = HOME_T[lang];
  const ct = useCourseT();
  const { pro } = usePro();
  const openLesson = useOpenLesson();
  useStoreVersion(); // progress written by a lesson or arriving from the account re-renders the path
  const p = readArabic();
  const nx = nextArabic(p);
  const pct = arabicPercent(p);
  const passedN = LESSONS.filter((l) => (p.done[l.id]?.best ?? 0) >= PASS_PCT).length;
  const nxUnit = nx ? UNITS.find((u) => u.n === nx.unit)! : null;
  const started = Object.keys(p.done).length > 0;
  const tx = (v: { de: string; en: string; ar?: string }) => v[lang] ?? v.en;
  const lastFreeUnit = LESSONS[FREE.arabicLessons - 1]?.unit ?? 1;
  const ctx: GateCtx = { p, nx, pro, started, T, lang, openLesson };

  return (
    <View>
      {/* continue: where you are, in a medallion, and the next gate */}
      <Stage rounded={R.md} hairlines={false}>
        <IllumFrame />
        <View style={{ padding: 24, alignItems: "center", gap: 0 }}>
          <PracticeMedallion pct={pct / 100} size={128}><MedalText size={28}>{`${pct}%`}</MedalText></PracticeMedallion>
          <Text style={{ marginTop: 22, fontFamily: FONT.bold, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgb(214,180,108)", textAlign: "center" }}>{T.progress}</Text>
          <Text style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 24, lineHeight: 29, color: "#eef0f3", textAlign: "center" }}>{nx ? tx(nx.title) : T.allDone}</Text>
          {nx && nxUnit ? <Text style={{ marginTop: 4, fontFamily: FONT.semibold, fontSize: 14, color: "#e9cf99", textAlign: "center" }}>{`${T.unit} ${nx.unit} · ${tx(nxUnit.title)}`}</Text> : null}
          <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>{`${p.xp} ${T.xp} · ${passedN}/${LESSONS.length} ${T.lessons}`}</Text>
          {p.placement && p.placement.units > 0 ? (
            <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{`${T.placeNote}: ${T.unit} 1${p.placement.units > 1 ? `–${p.placement.units}` : ""}`}</Text>
          ) : null}
          <GoldButton compact title={`${started ? T.cont : T.start}  ${FWD}`} style={{ alignSelf: "stretch", marginTop: 22 }}
            onPress={() => (nx ? openLesson(nx) : router.push("/shams/1" as Href))} />
        </View>
      </Stage>

      {/* placement test: for learners who can already read a bit (offered while units 1–6 are not finished) */}
      {nx && nx.unit <= 6 ? (
        <GoldCard style={{ marginTop: 16, padding: 20 }}>
          <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
            <Svg width={48} height={48} viewBox="0 0 48 48">
              <Path d="M24 3l5 10.5L40.5 9 36 20.5 46 24l-10 3.5L40.5 39 29 34.5 24 45l-5-10.5L7.5 39 12 27.5 2 24l10-3.5L7.5 9 19 13.5z" fill={t.gold} fillOpacity={0.1} stroke={t.gold} strokeWidth={1.2} />
              <Path d="M17 25l5 5 9-11" fill="none" stroke={t.gold} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 20, lineHeight: 25, color: t.ink }}>{T.placeTitle}</Text>
              <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: t.muted }}>{T.placeBody}</Text>
              {p.placement ? <Text style={{ marginTop: 8, fontFamily: FONT.semibold, fontSize: 14, color: t.gold }}>{T.placeLast.replace("{a}", String(p.placement.correct)).replace("{b}", String(p.placement.total))}</Text> : null}
            </View>
          </View>
          <ChipButton title={p.placement ? T.placeAgain : T.placeCta} onPress={() => router.push("/arabic/placement" as Href)} style={{ alignSelf: "stretch", marginTop: 16 }} />
        </GoldCard>
      ) : null}

      {/* the path: every unit a row of arched gates */}
      <View style={{ marginTop: 48, gap: 56 }}>
        {UNITS.map((u, ui) => {
          const ls = LESSONS.filter((l) => l.unit === u.n);
          const doneN = ls.filter((l) => (p.done[l.id]?.best ?? 0) >= PASS_PCT).length;
          const all = doneN === ls.length;
          const rows: Lesson[][] = [];
          ls.forEach((l, k) => { if (k % 2 === 0) rows.push([]); rows[rows.length - 1].push(l); });
          return (
            <View key={u.n}>
              <View style={{ paddingStart: 60 }}>
                {ui < UNITS.length - 1 ? <Rail left={23} /> : null}
                <View style={{ position: "absolute", left: 0, top: 0 }}><PracticeStarNum n={all ? "✓" : u.n} size={48} filled={all} /></View>
                <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: 1.9, textTransform: "uppercase", color: t.gold }}>
                  {`${T.unit} ${u.n} `}<Text style={{ color: t.muted }}>{`· ${doneN}/${ls.length}`}</Text>
                </Text>
                {u.title.ar ? <Text allowFontScaling={false} style={{ marginTop: 4, fontFamily: CALLIG_FONT, fontSize: 26, lineHeight: 40, color: t.gold, textAlign: "left", writingDirection: "rtl", alignSelf: "flex-start" }}>{u.title.ar}</Text> : null}
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 29, letterSpacing: -0.5, color: t.ink }}>{tx(u.title)}</Text>
                <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: t.muted }}>{tx(u.lead)}</Text>
                <View style={{ marginTop: 20, gap: 12 }}>
                  {rows.map((r, ri) => (
                    <View key={ri} style={{ flexDirection: "row", gap: 12 }}>
                      {r.map((l) => <LessonGate key={l.id} l={l} c={ctx} />)}
                      {r.length === 1 ? <View style={{ flex: 1 }} /> : null}
                    </View>
                  ))}
                </View>
              </View>
              {!pro && u.n === lastFreeUnit ? (
                <ProCard feature="arabic" title={ct("arabicProTitle")} text={ct("arabicProText", { n: FREE.arabicLessons, total: LESSONS.length })} style={{ marginTop: 32 }} />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

type GateCtx = { p: ArabicProgress; nx: Lesson | null; pro: boolean; started: boolean; T: (typeof HOME_T)["en"]; lang: CourseLang; openLesson: (l: Lesson) => void };

function LessonGate({ l, c }: { l: Lesson; c: GateCtx }) {
  const t = useTheme();
  const ct = useCourseT();
  const { p, nx, pro, started, T, lang, openLesson } = c;
  const tx = (v: { de: string; en: string; ar?: string }) => v[lang] ?? v.en;
  const d = p.done[l.id];
  const open = unlocked(p, l.id);
  const passed = (d?.best ?? 0) >= PASS_PCT;
  const current = nx?.id === l.id;
  const proLocked = !pro && isProLesson(l);
  const g = glyph(l);
  const size = g.length > 9 ? 18 : g.length > 5 ? 23 : 30;
  const stars = d?.stars ?? 0;
  const label = `${l.test ? `${T.test}: ` : ""}${tx(l.title)}. ${stars}/3${proLocked ? `. ${ct("proLabel")}` : !open ? `. ${T.locked}` : ""}`;
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Gate current={current} done={passed} locked={!open && !proLocked} accessibilityLabel={label} style={{ flex: 1 }}
        onPress={proLocked ? () => openPro("arabic") : open ? () => openLesson(l) : undefined}>
        <View style={{ marginTop: 14, height: 30, alignItems: "center", justifyContent: "center" }}>
          {passed ? <PracticeStarNum n="✓" size={30} filled /> : proLocked ? <Icon name="lock" size={18} color={t.gold} /> : open ? <PracticeStarNum n={l.test ? "★" : LESSONS.indexOf(l) + 1} size={30} /> : <Icon name="lock" size={18} color={t.muted} />}
        </View>
        <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}
          style={{ paddingHorizontal: 8, paddingTop: 4, textAlign: "center", fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.75, color: current || passed ? t.gold : t.ink, opacity: current || passed ? 1 : 0.8 }}>{g}</Text>
        <View style={{ marginTop: "auto", paddingHorizontal: 12, paddingBottom: 12, paddingTop: 8, alignItems: "center" }}>
          <Text numberOfLines={2} style={{ fontFamily: FONT.bold, fontSize: 13.5, lineHeight: 18, color: t.ink, textAlign: "center" }}>{`${l.test ? `${T.test}: ` : ""}${tx(l.title)}`}</Text>
          <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 2 }}>
            {[1, 2, 3].map((n) => <PracticeStar key={n} size={11} dim={n > stars} />)}
            {d ? <Text style={{ marginStart: 6, fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{`${d.best}%`}</Text> : null}
          </View>
          {current ? (
            <LinearGradient colors={["#ecd7a2", "#c6a65e"]} style={{ marginTop: 8, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 2 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 11, color: "rgb(8,38,29)" }}>{started ? T.cont : T.start}</Text>
            </LinearGradient>
          ) : null}
        </View>
      </Gate>
    </View>
  );
}
