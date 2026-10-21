import { DoneShare } from "@/features/share/SharePrompt";
import { useMemo, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { DAY, eventsFor, HIJRI_MONTHS, addMonths, calText, daysBetween, fmtGregorian, fmtHijri, fromHijri, hijriMonthName, monthGrid, monthLength, nextOccurrence, toHijri, todayUtc } from "@/web/hijri";
import { intlLocale, useLang } from "@/i18n";
import { CALLIG_FONT, FONT, R, stage, useTheme, AR_RIGHT } from "@/lib/theme";
import { Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Callout, H2, IllumFrame, Label, Niche, go } from "./art";
import { DateField, SelectField } from "./ui";
import { IslamicCountdown } from "./IslamicCountdown";
import { useTradition } from "@/lib/tradition";

const NIGHTS = new Set(["lastten", "qadr", "qadr19", "qadr21", "qadr23"]);
const toIso = (t: number) => new Date(t).toISOString().slice(0, 10);
const fromIso = (s: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null; };
type T = ReturnType<typeof calText>["t"];
type Ev = ReturnType<typeof calText>["ev"];

// Today's Hijri date, a month grid with the Gregorian days, countdowns to the important days and a small converter
// (website HijriCalendar.tsx; dates from the Umm al-Qura calendar through Intl, as on the website)
export default function HijriCalendar() {
  const { lang } = useLang();
  const locale = lang;
  const { t, ev } = calText(locale);
  const [today] = useState(() => todayUtc());
  const [view, setView] = useState(() => { const h = toHijri(today); return { y: h.y, m: h.m }; });
  const th = useTheme();
  return (
    <View style={{ gap: 48 }}>
      <IslamicCountdown full />
      <TodayCard today={today} locale={locale} t={t} ev={ev} />
      <MonthView today={today} view={view} setView={setView} locale={locale} t={t} ev={ev} />
      <Upcoming today={today} locale={locale} t={t} ev={ev} />
      <Callout style={{ padding: 20 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 20, lineHeight: 26, color: th.ink }}>{t("noteTitle")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.ink, marginTop: 8 }}>{t("note")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: th.muted, marginTop: 8 }}>{t("sunset")}</Text>
      </Callout>
      <Converter today={today} locale={locale} t={t} />
    </View>
  );
}

function TodayCard({ today, locale, t, ev }: { today: number; locale: string; t: T; ev: Ev }) {
  const h = toHijri(today);
  const { tradition } = useTradition();
  const next = useMemo(() => eventsFor(tradition).map((e) => ({ e, o: nextOccurrence(e.m, e.d, today) })).filter((x) => x.o).sort((a, b) => a.o!.t - b.o!.t)[0], [today, tradition]);
  const n = next ? daysBetween(today, next.o!.t) : 0;
  return (
    <Stage rounded={16} hairlines={false}>
      <IllumFrame />
      <View style={{ paddingHorizontal: 28, paddingVertical: 36, gap: 32 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: locale === "ar" ? 0 : 2.4, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{t("todayIs")} · {fmtGregorian(today, locale, { weekday: "long" })}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "center", columnGap: 20, marginTop: 12 }}>
            <Text style={{ fontFamily: FONT.display, fontSize: 84, lineHeight: 88, letterSpacing: -2, color: "#eef0f3" }}>{h.d}</Text>
            <View style={{ paddingBottom: 8 }}>
              <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 44, lineHeight: 60, color: stage.gold, writingDirection: "rtl" }}>{HIJRI_MONTHS[h.m - 1].ar}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 18, color: "rgba(255,255,255,0.75)", textAlign: "center" }}>{locale === "ar" ? `${h.y} هـ` : `${hijriMonthName(h.m, locale)} ${h.y} AH`}</Text>
            </View>
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: "rgba(255,255,255,0.7)", marginTop: 16, textAlign: "center" }}>{fmtGregorian(today, locale, { day: "numeric", month: "long", year: "numeric" })}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 20, color: "rgba(255,255,255,0.5)", marginTop: 8, textAlign: "center" }}>{t("sunset")}</Text>
        </View>
        {next ? (
          <View style={{ alignSelf: "center", width: "100%", maxWidth: 320, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)", padding: 20, alignItems: "center" }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: locale === "ar" ? 0 : 2, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{t("upcoming")}</Text>
            <Text style={{ fontFamily: FONT.display, fontSize: 20, lineHeight: 26, color: "#eef0f3", marginTop: 8, textAlign: "center" }}>{ev(next.e.id).name}</Text>
            <Text style={{ fontFamily: FONT.display, fontSize: 36, lineHeight: 42, color: stage.gold, marginTop: 4 }}>{n === 0 ? t("todayCount") : n === 1 ? t("tomorrow") : t("days", { n })}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{fmtGregorian(next.o!.t, locale, { day: "numeric", month: "long", year: "numeric" })}</Text>
          </View>
        ) : null}
        <DoneShare kind="calendar" banner={false} onStage arabic={`${h.d} ${HIJRI_MONTHS[h.m - 1].ar} ${h.y}`} big={String(h.d)}
          title={locale === "ar" ? `${h.y} هـ` : `${hijriMonthName(h.m, locale)} ${h.y} AH`} body={fmtGregorian(today, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          footer={next ? `${ev(next.e.id).name} · ${n === 0 ? t("todayCount") : n === 1 ? t("tomorrow") : t("days", { n })}` : undefined} />
      </View>
    </Stage>
  );
}

function MonthView({ today, view, setView, locale, t, ev }: { today: number; view: { y: number; m: number }; setView: (v: { y: number; m: number }) => void; locale: string; t: T; ev: Ev }) {
  const th = useTheme();
  const weekStart = locale === "en" ? 0 : 1;
  const grid = useMemo(() => monthGrid(view.y, view.m, weekStart), [view.y, view.m, weekStart]);
  const thy = toHijri(today);
  const isCurrent = thy.y === view.y && thy.m === view.m;
  const { tradition } = useTradition();
  const evs = eventsFor(tradition).filter((e) => e.m === view.m);
  const last = grid.first + (grid.len - 1) * DAY;
  const span = `${fmtGregorian(grid.first, locale, { day: "numeric", month: "short" })} – ${fmtGregorian(last, locale, { day: "numeric", month: "short", year: "numeric" })}`;
  const wd = Array.from({ length: 7 }, (_, i) => { const d = (weekStart + i) % 7; return { d, s: fmtGregorian(Date.UTC(1970, 0, 4 + d), locale, { weekday: "short" }) }; });
  const step = (k: number) => setView(addMonths(view.y, view.m, k));
  const round = (k: -1 | 1) => (
    <Pressable onPress={() => step(k)} accessibilityRole="button" accessibilityLabel={t(k < 0 ? "prev" : "next")}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: pressed ? "rgb(201,166,94)" : th.line, backgroundColor: th.surface, alignItems: "center", justifyContent: "center" })}>
      <Icon name={k < 0 ? "chevronLeft" : "chevronRight"} color={th.ink} size={20} />
    </Pressable>
  );
  const rows: (typeof grid.cells)[] = [];
  for (let i = 0; i < grid.cells.length; i += 7) rows.push(grid.cells.slice(i, i + 7));
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        {round(-1)}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text accessibilityRole="header" allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 34, lineHeight: 50, color: th.gold, writingDirection: "rtl" }}>{HIJRI_MONTHS[view.m - 1].ar}{locale === "ar" ? ` ${view.y}` : ""}</Text>
          {locale !== "ar" ? <Text style={{ fontFamily: FONT.display, fontSize: 20, lineHeight: 25, color: th.ink }}>{hijriMonthName(view.m, locale)} {view.y}</Text> : null}
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: th.muted, marginTop: 4, textAlign: "center" }}>{span} · {t("days", { n: grid.len })}</Text>
        </View>
        {round(1)}
      </View>
      {!isCurrent ? <Text onPress={() => setView({ y: thy.y, m: thy.m })} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.accent, textAlign: "center", marginTop: 12, paddingVertical: 4 }}>{t("backToday")}</Text> : null}

      <View style={{ marginTop: 20, borderRadius: 16, borderWidth: 1, borderColor: "rgba(201,166,94,0.3)", backgroundColor: th.surface, padding: 8 }}>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {wd.map((w) => <Text key={w.d} numberOfLines={1} style={{ flex: 1, textAlign: "center", paddingVertical: 4, fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase", color: w.d === 5 ? th.gold : th.muted }}>{w.s}</Text>)}
        </View>
        <View style={{ gap: 4, marginTop: 4 }}>
          {rows.map((row, ri) => (
            <View key={ri} style={{ flexDirection: "row", gap: 4 }}>
              {row.map((c, i) => {
                if (!c) return <View key={`e${ri}-${i}`} style={{ flex: 1 }} />;
                const e = evs.find((x) => x.d === c.h);
                const isToday = c.t === today;
                const white = c.h >= 13 && c.h <= 15;
                const gDay = new Date(c.t).getUTCDate();
                const label = `${fmtHijri({ y: view.y, m: view.m, d: c.h }, locale)} · ${fmtGregorian(c.t, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${e ? ` · ${ev(e.id).name}` : ""}`;
                return (
                  <View key={c.t} accessible accessibilityLabel={label} accessibilityState={{ selected: isToday }}
                    style={{ flex: 1, minHeight: 52, borderRadius: R.md, borderWidth: isToday ? 1.5 : 1, alignItems: "center", justifyContent: "center", paddingVertical: 4,
                      borderColor: isToday ? "rgb(201,166,94)" : "transparent", backgroundColor: isToday ? "rgba(201,166,94,0.15)" : white ? th.accentSoft : th.bg }}>
                    <Text style={{ fontFamily: FONT.display, fontSize: 16, lineHeight: 18, color: e ? th.gold : th.ink }}>{c.h}</Text>
                    <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 10, lineHeight: 12, color: th.muted, marginTop: 4 }}>{gDay === 1 || c.h === 1 ? fmtGregorian(c.t, locale, { day: "numeric", month: "short" }) : gDay}</Text>
                    {e ? <View style={{ position: "absolute", right: 5, top: 5, width: 6, height: 6, transform: [{ rotate: "45deg" }], backgroundColor: "rgb(201,166,94)" }} /> : null}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 16, rowGap: 4, paddingHorizontal: 4, marginTop: 12 }}>
          <Legend swatch={<View style={{ width: 12, height: 12, borderRadius: 3, borderWidth: 1, borderColor: "rgb(201,166,94)", backgroundColor: "rgba(201,166,94,0.15)" }} />} text={t("legendToday")} />
          <Legend swatch={<View style={{ width: 6, height: 6, transform: [{ rotate: "45deg" }], backgroundColor: "rgb(201,166,94)" }} />} text={t("legendEvent")} />
          <Legend swatch={<View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: th.accentSoft }} />} text={t("legendWhite")} />
        </View>
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: th.muted, marginTop: 12 }}>{t("white")} · <Text style={{ color: th.gold }}>{t("friday")}</Text></Text>

      {evs.length > 0 ? (
        <View style={{ marginTop: 20 }}>
          <H2 size={20}>{t("thisMonth")}</H2>
          <View style={{ gap: 8, marginTop: 12 }}>
            {evs.map((e) => {
              const gt = fromHijri(view.y, view.m, e.d);
              return (
                <View key={e.id} style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: 12, rowGap: 4, borderRadius: R.md, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface, paddingHorizontal: 16, paddingVertical: 12 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14.5, color: th.gold }}>{e.d} {hijriMonthName(view.m, locale)}</Text>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: th.ink }}>{ev(e.id).name}</Text>
                  {gt !== null ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, color: th.muted }}>{fmtGregorian(gt, locale, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</Text> : null}
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Legend({ swatch, text }: { swatch: ReactNode; text: string }) {
  const th = useTheme();
  return <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>{swatch}<Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted }}>{text}</Text></View>;
}

function Upcoming({ today, locale, t, ev }: { today: number; locale: string; t: T; ev: Ev }) {
  const th = useTheme();
  const { tradition } = useTradition();
  const list = useMemo(() => eventsFor(tradition).map((e) => ({ e, o: nextOccurrence(e.m, e.d, today) })).filter((x) => x.o).sort((a, b) => a.o!.t - b.o!.t), [today, tradition]);
  return (
    <View>
      <H2>{t("upcoming")}</H2>
      <View style={{ gap: 12, marginTop: 20 }}>
        {list.map(({ e, o }) => {
          const n = daysBetween(today, o!.t);
          const x = ev(e.id);
          return (
            <View key={e.id} style={{ borderRadius: R.card, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface, padding: 20, overflow: "hidden" }}>
              <Niche color="rgba(201,166,94,0.2)" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <Text accessibilityRole="header" style={{ flexShrink: 1, fontFamily: FONT.display, fontSize: 20, lineHeight: 26, color: th.ink }}>{x.name}</Text>
                <View style={{ borderRadius: R.pill, backgroundColor: "rgba(201,166,94,0.15)", paddingHorizontal: 12, paddingVertical: 4 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: th.gold }}>{n === 0 ? t("todayCount") : n === 1 ? t("tomorrow") : t("inDays", { n })}</Text>
                </View>
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: th.muted, marginTop: 4 }}>
                <Text style={{ fontFamily: FONT.semibold, color: th.ink }}>{fmtHijri({ y: o!.y, m: e.m, d: e.d }, locale)}</Text> · {fmtGregorian(o!.t, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.ink, marginTop: 12 }}>{x.desc}</Text>
              {NIGHTS.has(e.id) ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: th.muted, marginTop: 4 }}>{t("nightNote")}</Text> : null}
              {x.note ? <Text style={{ fontFamily: FONT.italic, fontSize: 13.5, lineHeight: 21, color: th.muted, marginTop: 8 }}>{x.note}</Text> : null}
              {e.link ? <Text onPress={() => go(e.link!)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.accent, paddingTop: 12, alignSelf: "flex-start" }}>{t("more")}</Text> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Converter({ today, locale, t }: { today: number; locale: string; t: T }) {
  const th = useTheme();
  const h0 = toHijri(today);
  const [g, setG] = useState(toIso(today));
  const [hd, setHd] = useState({ y: h0.y, m: h0.m, d: h0.d });
  const gt = fromIso(g);
  const inRange = gt !== null && gt >= Date.UTC(1937, 2, 14) && gt <= Date.UTC(2076, 10, 16);
  const gh = gt !== null && inRange ? toHijri(gt) : null;
  const ht = fromHijri(hd.y, hd.m, hd.d);
  const len = monthLength(hd.y, hd.m);
  const monthNames = (m: number) => new Intl.DateTimeFormat(intlLocale(locale), { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2001, m - 1, 1)));
  const card = { borderRadius: R.card, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface, padding: 20 };
  return (
    <View>
      <H2>{t("conv")}</H2>
      <View style={{ gap: 16, marginTop: 20 }}>
        <View style={card}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 18, color: th.ink }}>{t("convG")}</Text>
          <Label style={{ marginTop: 16, marginBottom: 8 }}>{t("day")}</Label>
          <DateField label={t("convG")} value={g} onChange={setG} minYear={1937} maxYear={2076} monthName={monthNames} />
          <View style={{ minHeight: 48, marginTop: 16 }} accessibilityLiveRegion="polite">
            {gh ? (
              <>
                <Text style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: th.gold }}>{fmtHijri(gh, locale)}</Text>
                <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 24, lineHeight: 38, color: th.ink, writingDirection: "rtl", textAlign: AR_RIGHT }}>{gh.d} {HIJRI_MONTHS[gh.m - 1].ar} {gh.y}</Text>
              </>
            ) : null}
          </View>
        </View>
        <View style={card}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 18, color: th.ink }}>{t("convH")}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <Label style={{ marginBottom: 8 }}>{t("day")}</Label>
              <SelectField title={t("day")} value={hd.d} options={Array.from({ length: 30 }, (_, i) => ({ value: i + 1, label: String(i + 1) }))} onChange={(v) => setHd({ ...hd, d: v })} />
            </View>
            <View style={{ flex: 2, minWidth: 0 }}>
              <Label style={{ marginBottom: 8 }}>{t("month")}</Label>
              <SelectField title={t("month")} value={hd.m} options={HIJRI_MONTHS.map((_, i) => ({ value: i + 1, label: `${i + 1}. ${hijriMonthName(i + 1, locale)}` }))} onChange={(v) => setHd({ ...hd, m: v })} />
            </View>
            <View style={{ flex: 1.3 }}>
              <Label style={{ marginBottom: 8 }}>{t("year")}</Label>
              <SelectField title={t("year")} value={hd.y} options={Array.from({ length: 31 }, (_, i) => h0.y - 15 + i).map((y) => ({ value: y, label: String(y) }))} onChange={(v) => setHd({ ...hd, y: v })} />
            </View>
          </View>
          <View style={{ minHeight: 48, marginTop: 16 }} accessibilityLiveRegion="polite">
            {ht !== null && hd.d <= len
              ? <Text style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: th.gold }}>{fmtGregorian(ht, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</Text>
              : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: th.muted }}>{t("invalid")}</Text>}
          </View>
        </View>
      </View>
    </View>
  );
}

