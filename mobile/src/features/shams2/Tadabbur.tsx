import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Chip, GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { TafsirPanel } from "@/features/quran/TafsirPanel";
import { maqasidOf, sectionOf, type L, type LL, type Section } from "./maqasid";
import { useSurahNames } from "./names";
import { useS2, type CL } from "./text";
import { Card, SourceNote } from "./ui";

// Tadabbur & Maqāṣid: what the Qurʾān wants to teach – understanding makes memorising easier. Surah card (central theme,
// setting, asbāb al-nuzūl where well known, links to the neighbouring surahs, structure), per section "what this
// teaches us", a practical takeaway and questions for reflection, plus live tafsir of each verse from the reader's
// tafsir sources (Quran.com). Our own words, drawn from the classical works named under each card; drafts until reviewed.
const pick = (x: L, cl: CL) => x[cl] || x.en;
const pickL = (x: LL | undefined, cl: CL) => (x ? (x[cl]?.length ? x[cl] : x.en) : []);

function Bullets({ items, color }: { items: string[]; color?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {items.map((x, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 8 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: color ?? t.gold }}>{"•"}</Text>
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink, textAlign: "left" }}>{x}</Text>
        </View>
      ))}
    </View>
  );
}

function Label({ children }: { children: string }) {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, color: t.gold, textAlign: "left" }}>{children}</Text>;
}

/** "What this teaches us" for one section – shown before the sabaq and as a review prompt */
export function SectionLessons({ s: surah, section, compact }: { s: number; section: Section; compact?: boolean }) {
  const t = useTheme();
  const { s, cl, nf } = useS2();
  const lessons = pickL(section.lessons, cl);
  const qs = pickL(section.questions, cl);
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink, textAlign: "left" }}>{`${pick(section.title, cl)} · ${s("versesAB", { a: nf(section.from), b: nf(section.to) })}`}</Text>
      {lessons.length ? <><Label>{s("teachesUs")}</Label><Bullets items={compact ? lessons.slice(0, 2) : lessons} /></> : null}
      {section.takeaway ? <View style={{ padding: 10, borderRadius: R.md, backgroundColor: t.accentSoft }}><Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 21, color: t.accent, textAlign: "left" }}>{`${s("takeaway")}: ${pick(section.takeaway, cl)}`}</Text></View> : null}
      {!compact && qs.length ? <><Label>{s("reflect")}</Label><Bullets items={qs} color={t.accent} /></> : null}
      {compact ? <Pressable onPress={() => router.push(`/shams/tadabbur?s=${surah}&v=${section.from}` as Href)} accessibilityRole="button"><Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent }}>{s("moreTadabbur")}</Text></Pressable> : null}
    </View>
  );
}

/** compact briefing for the verse where the sabaq starts (or a review prompt) – nothing when no content exists */
export function Briefing({ s: surah, v, review }: { s: number; v: number; review?: boolean }) {
  const t = useTheme();
  const { s, cl } = useS2();
  const m = maqasidOf(surah);
  const sec = sectionOf(surah, v);
  if (!m) return null;
  if (review) {
    const qs = [...pickL(sec?.questions, cl), ...pickL(m.questions, cl)];
    if (!qs.length) return null;
    const q = qs[(surah * 31 + v) % qs.length];
    return <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted, textAlign: "left", fontStyle: "italic" }}>{`${s("reflect")}: ${q}`}</Text>;
  }
  if (sec?.lessons) return <View style={{ padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)", gap: 6 }}><SectionLessons s={surah} section={sec} compact /></View>;
  return (
    <Pressable onPress={() => router.push(`/shams/tadabbur?s=${surah}&v=${v}` as Href)} accessibilityRole="button" style={{ padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)", gap: 4 }}>
      <Label>{s("maqsad")}</Label>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, textAlign: "left" }}>{pick(m.theme, cl)}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent }}>{s("moreTadabbur")}</Text>
    </Pressable>
  );
}

export function TadabburScreen({ surah, verse }: { surah: number; verse?: number }) {
  const t = useTheme();
  const { s, cl, nf } = useS2();
  const { name, arabic, chapters } = useSurahNames();
  const m = maqasidOf(surah);
  const initial = verse ? m?.sections.findIndex((x) => verse >= x.from && verse <= x.to) ?? 0 : 0;
  const [open, setOpen] = useState<number>(Math.max(0, initial));
  const sec = m?.sections[open] ?? null;
  const [tv, setTv] = useState<number | null>(null);
  const tafsirVerse = tv && sec && tv >= sec.from && tv <= sec.to ? tv : sec?.from ?? 1;
  const versesOfSec = useMemo(() => (sec ? Array.from({ length: Math.min(40, sec.to - sec.from + 1) }, (_, i) => sec.from + i) : []), [sec]);
  const place = chapters.find((c) => c.id === surah)?.revelation_place;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("tadabburEyebrow")} arabic={arabic(surah) || "التَّدَبُّر"} title={`${nf(surah)}. ${name(surah)}`} lead={m ? pick(m.theme, cl) : s("noMaqasid")} />
        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
            {surah > 1 ? <Chip label={`${nf(surah - 1)}. ${name(surah - 1)}`} onPress={() => router.replace(`/shams/tadabbur?s=${surah - 1}` as Href)} /> : null}
            {surah < 114 ? <Chip label={`${nf(surah + 1)}. ${name(surah + 1)}`} onPress={() => router.replace(`/shams/tadabbur?s=${surah + 1}` as Href)} /> : null}
          </View>
          {m ? (
            <>
              <Card gold>
                <Label>{s("context")}</Label>
                {place ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted, textAlign: "left" }}>{place === "madinah" ? s("medinan") : s("meccan")}</Text> : null}
                <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink, textAlign: "left" }}>{pick(m.context, cl)}</Text>
                {m.asbab ? <><Label>{s("asbab")}</Label><Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink, textAlign: "left" }}>{pick(m.asbab, cl)}</Text></> : null}
                <Label>{s("connects")}</Label>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink, textAlign: "left" }}>{pick(m.connects, cl)}</Text>
                <Label>{s("keyLessons")}</Label>
                <Bullets items={pickL(m.lessons, cl)} />
                {m.questions ? <><Label>{s("reflect")}</Label><Bullets items={pickL(m.questions, cl)} color={t.accent} /></> : null}
                <SourceNote src={m.src} review={m.review} />
              </Card>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, textAlign: "left" }}>{s("structure")}</Text>
              {m.sections.map((x, i) => {
                const on = i === open;
                return (
                  <View key={`${x.from}-${x.to}`} style={{ borderRadius: R.card, borderWidth: 1, borderColor: on ? "rgba(201,166,94,0.6)" : t.line, backgroundColor: t.surface }}>
                    <Pressable onPress={() => { setOpen(on ? -1 : i); setTv(null); }} accessibilityRole="button" accessibilityState={{ expanded: on }} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14 }}>
                      <Text style={{ minWidth: 64, fontFamily: FONT.semibold, fontSize: 12.5, color: t.gold }}>{`${nf(x.from)}–${nf(x.to)}`}</Text>
                      <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }}>{pick(x.title, cl)}</Text>
                      <Icon name={on ? "chevronDown" : "chevronRight"} size={13} color={t.muted} />
                    </Pressable>
                    {on ? (
                      <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>
                        {x.lessons ? <SectionLessons s={surah} section={x} /> : null}
                        <GoldButton title={s("memoriseSection")} onPress={() => router.push(`/shams/${surah}?v=${x.from}` as Href)} />
                        <Label>{s("liveTafsir")}</Label>
                        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                          {versesOfSec.map((v) => <Chip key={v} label={nf(v)} selected={v === tafsirVerse} onPress={() => setTv(v)} />)}
                        </View>
                        <TafsirPanel key={`${surah}:${tafsirVerse}`} surah={surah} verse={tafsirVerse} />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </>
          ) : (
            <Card><Text style={{ fontFamily: FONT.regular, fontSize: 14.5, color: t.muted }}>{s("noMaqasid")}</Text><TafsirPanel surah={surah} verse={verse ?? 1} /></Card>
          )}
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" }}>{s("tadabburNote")}</Text>
        </View>
      </Page>
    </>
  );
}
