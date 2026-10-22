import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { GoldCard, OutlineButton, SectionTitle } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, PageHero } from "@/components/page";
import { useLang } from "@/i18n";
import { FONT, R, useTheme } from "@/lib/theme";
import { openLink } from "@/features/extra/links";
import { SISTERS_ROUTES, SOURCES } from "@/web/sisters";
import type { Point } from "@/web/sisters/types";
import { useSis, useSisters } from "./state";
import { DaysCard, ListenDaysCard, PositionRow, ReviewLine, SrcLine } from "./ui";

// /sisters – "Für Schwestern": recitation, hifz and the muṣḥaf during ḥayḍ and nifās by school, how the Shams Method
// continues (listening and understanding days), sajdat al-tilāwa, women and the Quran (the "understand" step), learning
// with a female teacher and sisters' circles. Reachable for everyone (brothers may look it up for their families); the
// "Meine Tage" card only for a sister who agreed to the setup. Every statement with its source; draft until reviewed.

function Part({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <SectionTitle title={title} style={{ marginBottom: 0 }} />
      {lead ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.muted, textAlign: "left" }}>{lead}</Text> : null}
      {children}
    </View>
  );
}

function Points({ items }: { items: Point[] }) {
  const t = useTheme();
  return (
    <GoldCard star={false}>
      {items.map((p, i) => (
        <View key={p.text} style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: t.line }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink, textAlign: "left" }}>{p.text}</Text>
          <SrcLine ids={p.src} />
        </View>
      ))}
    </GoldCard>
  );
}

export function SistersScreen() {
  const t = useTheme();
  const tx = useSis();
  const st = useSisters();
  const { lang } = useLang();
  const go = (href: string) => router.push(href as Href);
  const used = new Set<string>();
  const note = (ids?: string[]) => ids?.forEach((i) => used.add(i));
  tx.partRecite.blocks.forEach((b) => { b.positions?.forEach((p) => note(p.src)); b.points?.forEach((p) => note(p.src)); });
  tx.partShams.steps.forEach((s) => note(s.src)); tx.partShams.notes.forEach((p) => note(p.src));
  tx.partSajda.positions.forEach((p) => note(p.src));
  [...tx.partWomen.companions, ...tx.partWomen.scholars, ...tx.partWomen.reciters].forEach((p) => note(p.src));
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={tx.kicker} arabic="لِلْأَخَوَات" title={tx.title} lead={tx.lead}><ReviewLine onStage /></PageHero>
        <View style={{ padding: 16, gap: 28 }}>
          {/* her own card: consent, school, "Meine Tage" (device only); declined = nothing asked, the reading stays */}
          {st.consent !== false ? <DaysCard /> : null}

          <Part title={tx.partRecite.title} lead={tx.partRecite.lead}>
            {tx.partRecite.blocks.map((b) => (
              <GoldCard key={b.id} star={false}>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left", marginBottom: 2 }}>{b.title}</Text>
                {b.positions?.map((p, i) => <PositionRow key={`${p.school}${i}`} p={p} first={i === 0} />)}
                {b.points?.map((p, i) => (
                  <View key={p.text} style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: t.line }}>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink, textAlign: "left" }}>{p.text}</Text>
                    <SrcLine ids={p.src} />
                  </View>
                ))}
              </GoldCard>
            ))}
          </Part>

          <Part title={tx.partShams.title} lead={tx.partShams.lead}>
            <ListenDaysCard />
            <Points items={tx.partShams.notes} />
          </Part>

          <Part title={tx.partSajda.title} lead={tx.partSajda.lead}>
            <GoldCard star={false}>{tx.partSajda.positions.map((p, i) => <PositionRow key={`${p.school}${i}`} p={p} first={i === 0} />)}</GoldCard>
          </Part>

          <Part title={tx.partWomen.title} lead={tx.partWomen.lead}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink, textAlign: "left" }}>{tx.partWomen.versesTitle}</Text>
            <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
              {tx.partWomen.verses.map((v, i) => (
                <Pressable key={v.ref} onPress={() => go(SISTERS_ROUTES.verse(v.ref))} accessibilityRole="button" accessibilityLabel={`${v.ref}. ${v.topic}. ${tx.readVerse}`}
                  style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: t.line, backgroundColor: pressed ? t.bg : t.surface })}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.gold, minWidth: 48 }}>{v.ref}</Text>
                  <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink, textAlign: "left" }}>{v.topic}</Text>
                  <Icon name="speaker" size={15} color={t.muted} />
                </Pressable>
              ))}
            </View>
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink, textAlign: "left", marginTop: 6 }}>{tx.partWomen.companionsTitle}</Text>
            <Points items={tx.partWomen.companions} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink, textAlign: "left", marginTop: 6 }}>{tx.partWomen.recitersTitle}</Text>
            <Points items={tx.partWomen.reciters} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink, textAlign: "left", marginTop: 6 }}>{tx.partWomen.scholarsTitle}</Text>
            <Points items={tx.partWomen.scholars} />
          </Part>

          <Part title={tx.partTogether.title} lead={tx.partTogether.lead}>
            <GoldCard star={false}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink, textAlign: "left" }}>{tx.partTogether.teacher}</Text>
              <OutlineButton title={tx.partTogether.teacherCta} icon="user" onPress={() => go(SISTERS_ROUTES.teacher)} style={{ marginTop: 10 }} />
              <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink, textAlign: "left", marginTop: 14 }}>{tx.partTogether.circles}</Text>
              <OutlineButton title={tx.partTogether.circlesCta} icon="hands" onPress={() => go(SISTERS_ROUTES.circles)} style={{ marginTop: 10 }} />
            </GoldCard>
          </Part>

          <Part title={tx.sourcesTitle}>
            <View style={{ gap: 8 }}>
              {[...used].map((id) => SOURCES[id]).filter(Boolean).map((s) => (
                <Text key={s.title} onPress={s.url ? () => openLink(s.url!, lang) : undefined} accessibilityRole={s.url ? "link" : "text"}
                  style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: s.url ? t.accent : t.muted, textAlign: "left" }}>{s.title}</Text>
              ))}
            </View>
          </Part>

          <View style={{ gap: 8, paddingBottom: 24 }}>
            <ReviewLine />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 21, color: t.ink, textAlign: "left" }}>{tx.notFatwa}</Text>
          </View>
        </View>
      </Page>
    </>
  );
}
