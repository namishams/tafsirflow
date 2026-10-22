import { Fragment, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { Chip } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import type { Rating4 } from "@/web/learning";
import { tick } from "@/features/feed/haptics";
import { useIntl } from "@/features/srs/format";
import type { Shams2Model } from "../model";
import { useSurahNames } from "../names";
import type { Range, Tathbit, TathbitItem } from "../plan";
import type { DayLog } from "../store";
import { markToday, noteLink, rateVerseToday, setTodayMinutes } from "../store2";
import { MUT_GROUPS } from "../mutData";
import { useS2 } from "../text";
import { Btn, Card, Term } from "../ui";
import { useRv } from "./text";

// Shams 3.0 additions to the wird (/shams/wird): "Heute habe ich … Min." (today's minutes, only for this day), the verse
// strip of a review range (rate single verses and the transitions between them) and the tathbīt block. The website has
// the same parts in src/components/learn/shams2/review/WirdExtras.tsx.

export const TODAY_CHOICES = [10, 15, 20, 30, 45, 60] as const;
type Mark = "fluent" | "hesitant" | "weak";
/** ids of the verse strip's marks in the day log (rateRange): a verse "2:5", the transition into it ">2:5" */
export const verseMarkId = (key: string) => key;
export const gapMarkId = (key: string) => `>${key}`;
const GRADE: Record<Mark, Rating4> = { fluent: 3, hesitant: 2, weak: 1 };

/** today's minutes: chips for this day only, "as set" goes back to the daily minutes of the settings */
export function TodayMinutes({ m }: { m: Shams2Model }) {
  const t = useTheme();
  const rv = useRv();
  const nf = useIntl();
  const set = (n: number | null) => { tick(); setTodayMinutes(n); };
  return (
    <Card>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{rv("todayTitle")}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {TODAY_CHOICES.map((n) => <Chip key={n} label={rv("todayMin", { n: nf(n) })} selected={m.todayMin === n} onPress={() => set(n)} />)}
        <Chip label={rv("todayAsSet")} selected={!m.todayMin} onPress={() => set(null)} />
      </View>
      {m.todayMin ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" }}>{rv("todayNote", { n: nf(m.wird.usual) })}</Text> : null}
    </Card>
  );
}

/** a review range verse by verse: tap a verse (held / hesitated / shaky -> FSRS 3 / 2 / 1) or the line between two verses
 *  (the transition held or stalled -> links.v1) */
export function VerseStrip({ r, known, marks }: { r: Range; known: Shams2Model["known"]; marks: Record<string, string> }) {
  const t = useTheme();
  const rv = useRv();
  const nf = useIntl();
  const [sel, setSel] = useState<{ gap: boolean; key: string } | null>(null);
  const tone = (x: Mark | undefined) => (x === "fluent" ? t.accent : x === "hesitant" ? t.gold : x === "weak" ? t.danger : t.line);
  const verses = Array.from({ length: r.to - r.from + 1 }, (_, i) => r.from + i);
  // once per mark and day (markToday): the same chip again does nothing; a changed mark replaces today's rating
  const markVerse = (key: string, g: Mark) => {
    if (markToday(verseMarkId(key), g, () => { if (known.has(key)) rateVerseToday(key, GRADE[g]); })) tick();
    setSel(null);
  };
  const markGap = (key: string, ok: boolean) => {
    if (markGapToday(key, ok)) tick();
    setSel(null);
  };
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted, textAlign: "left" }}>{rv("stripHint")}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", rowGap: 8 }}>
        {verses.map((v) => {
          const key = `${r.s}:${v}`;
          const vm = marks[verseMarkId(key)] as Mark | undefined;
          const gm = marks[gapMarkId(key)] as Mark | undefined;
          const onV = sel?.key === key && !sel.gap, onG = sel?.key === key && sel.gap;
          return (
            <Fragment key={v}>
              {v > r.from ? (
                <Pressable onPress={() => setSel(onG ? null : { gap: true, key })} hitSlop={{ top: 8, bottom: 8 }} accessibilityRole="button" accessibilityState={{ selected: onG }}
                  accessibilityLabel={`${rv("gapLabel", { a: nf(v - 1), b: nf(v) })}${gm ? `, ${rv(gm === "fluent" ? "gapOk" : "gapMiss")}` : ""}`}
                  style={{ width: 16, height: 34, alignItems: "center", justifyContent: "center" }}>
                  <View style={{ width: onG ? 4 : 3, height: 20, borderRadius: 2, backgroundColor: onG ? t.gold : gm ? tone(gm) : t.line }} />
                </Pressable>
              ) : null}
              <Pressable onPress={() => setSel(onV ? null : { gap: false, key })} accessibilityRole="button" accessibilityState={{ selected: onV }}
                accessibilityLabel={`${rv("verseLabel", { v: nf(v) })}${vm ? `, ${rv(vm === "fluent" ? "v_ok" : vm === "hesitant" ? "v_hesitant" : "v_weak")}` : ""}`}
                style={({ pressed }) => ({ minWidth: 38, height: 34, paddingHorizontal: 8, borderRadius: R.pill, alignItems: "center", justifyContent: "center", borderWidth: onV ? 2 : 1, borderColor: onV ? t.gold : vm ? tone(vm) : t.line, backgroundColor: vm === "fluent" ? t.accentSoft : vm === "hesitant" ? "rgba(201,166,94,0.16)" : vm === "weak" ? "rgba(160,58,52,0.12)" : t.surface, opacity: pressed ? 0.8 : 1 })}>
                <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 13, color: vm ? tone(vm) : t.ink }}>{nf(v)}</Text>
              </Pressable>
            </Fragment>
          );
        })}
      </View>
      {sel ? (
        <View style={{ gap: 6, padding: 10, borderRadius: R.card, backgroundColor: t.accentSoft }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink, textAlign: "left" }}>
            {sel.gap ? rv("gapLabel", { a: nf(Number(sel.key.split(":")[1]) - 1), b: nf(Number(sel.key.split(":")[1])) }) : rv("verseLabel", { v: nf(Number(sel.key.split(":")[1])) })}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {sel.gap ? (
              <>
                <Chip label={rv("gapOk")} selected={marks[gapMarkId(sel.key)] === "fluent"} onPress={() => markGap(sel.key, true)} />
                <Chip label={rv("gapMiss")} selected={marks[gapMarkId(sel.key)] === "weak"} onPress={() => markGap(sel.key, false)} />
              </>
            ) : (["fluent", "hesitant", "weak"] as const).map((g) => (
              <Chip key={g} label={rv(g === "fluent" ? "v_ok" : g === "hesitant" ? "v_hesitant" : "v_weak")} selected={marks[verseMarkId(sel.key)] === g} onPress={() => markVerse(sel.key, g)} />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** a transition marked held or stalled in the wird, once per day (noteLinks counts one result per transition and day) */
const markGapToday = (key: string, ok: boolean) => markToday(gapMarkId(key), ok ? "fluent" : "weak", () => noteLink(key, ok));

/** the strip behind a toggle, so long manzil portions stay compact */
export function StripToggle({ r, known, marks }: { r: Range; known: Shams2Model["known"]; marks: Record<string, string> }) {
  const rv = useRv();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <Chip label={rv(open ? "stripHide" : "stripShow")} selected={open} onPress={() => setOpen(!open)} />
      {open ? <VerseStrip r={r} known={known} marks={marks} /> : null}
    </View>
  );
}

function ItemRow({ x, marks }: { x: TathbitItem; marks: NonNullable<DayLog["r"]> }) {
  const t = useTheme();
  const rv = useRv();
  const { cl } = useS2();
  const nf = useIntl();
  const { name } = useSurahNames();
  const ref = (k: string) => { const [a, b] = k.split(":"); return `${name(Number(a))} ${nf(Number(b))}`; };
  let title: string, sub: string, href: string;
  if (x.t === "spot") {
    const [a, b] = x.key.split(":");
    title = ref(x.key);
    // a verse confused with a similar one (and no weak words): its own label, practised among the mutashābihāt
    const mut = !x.words.length && x.reason.includes("mutashabih");
    const g = mut ? MUT_GROUPS.find((y) => y.keys.includes(x.key)) : undefined;
    sub = x.words.length ? rv("t_spot", { n: nf(x.words.length) }) : mut ? rv("t_mutSpot") : x.reason.includes("lapses") ? rv("t_lapses") : rv("t_fading");
    href = mut ? (g ? `/shams/mutashabihat?g=${encodeURIComponent(g.id)}` : "/shams/mutashabihat") : `/shams/talaqqi?s=${a}&v=${b}`;
  } else if (x.t === "link") {
    const [a, b] = x.key.split(":").map(Number);
    title = `${name(a)} · ${rv("t_link", { a: nf(b - 1), b: nf(b) })}`;
    sub = x.weak ? rv("why_transition") : "";
    href = `/shams/talaqqi?s=${a}&v=${b - 1}&to=${b}`;
  } else {
    const g = MUT_GROUPS.find((y) => y.id === x.id);
    title = g ? (g.topic[cl] || g.topic.en) : rv("t_mut");
    sub = x.keys.map(ref).join(" · ");
    href = `/shams/mutashabihat?g=${encodeURIComponent(x.id)}`;
  }
  const gm = x.t === "link" ? marks[gapMarkId(x.key)] : undefined;
  return (
    <View style={{ gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: t.line }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: x.t === "mut" ? "rgba(201,166,94,0.16)" : t.accentSoft }}>
          <Icon name={x.t === "spot" ? "eye" : x.t === "link" ? "repeat" : "grid"} size={14} color={x.t === "mut" ? t.gold : t.accent} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink, textAlign: "left" }} numberOfLines={2}>{title}</Text>
          {sub ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }} numberOfLines={2}>{x.t === "mut" ? `${rv("t_mut")} · ${sub}` : sub}</Text> : null}
        </View>
        <Btn title={rv("practise")} icon="play" onPress={() => router.push(href as Href)} label={`${rv("practise")}: ${title}`} />
      </View>
      {x.t === "link" ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          <Chip label={rv("gapOk")} selected={gm === "fluent"} onPress={() => { if (markGapToday(x.key, true)) tick(); }} />
          <Chip label={rv("gapMiss")} selected={gm === "weak"} onPress={() => { if (markGapToday(x.key, false)) tick(); }} />
        </View>
      ) : null}
    </View>
  );
}

/** the tathbīt block of the wird: the learner's own weak points, at most 15 % of the day */
export function TathbitCard({ tb, marks }: { tb: Tathbit; marks: NonNullable<DayLog["r"]> }) {
  const t = useTheme();
  const rv = useRv();
  const nf = useIntl();
  return (
    <Card>
      <Term id="tathbit" />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, textAlign: "left" }}>{tb.items.length ? rv("tathbitMeta", { n: nf(tb.items.length), m: nf(Math.max(1, tb.minutes)) }) : rv("tathbitEmpty")}</Text>
      {tb.items.map((x) => <ItemRow key={`${x.t}:${x.t === "mut" ? x.id : x.key}`} x={x} marks={marks} />)}
    </Card>
  );
}
