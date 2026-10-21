import { useEffect, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Stack } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Eyebrow, GoldButton, GoldCard, TextLink } from "@/components/brand";
import { Icon } from "@/components/icons";
import { pick, useLang } from "@/i18n";
import { ARABIC_FONT, FONT, stage, useTheme } from "@/lib/theme";
import { useEntitlement } from "@/lib/entitlements";
import { getVerseByKey, type SingleVerse } from "@/lib/quran";
import { SITE } from "@/lib/api";
import { extraItemsFor, type ExtraItem } from "@/content/extra";
import { openVerse } from "@/features/coursekit/links";
import { BrandFoot, CARD_SIZE, ShareSheet, type ShareFormat } from "@/features/feed/share";
import { SECTIONS, TIMELINE, UI, expandRange, type Section } from "./content";
import { router } from "expo-router";
import { CourseList } from "@/features/abrahamic/courseKit";
import { HARAMAIN_COURSE } from "./lessons";
import { GUIDE_LABEL } from "./HajjGuide";

// /haramain – the Kaaba, Mecca and Medina. The first section is free, the rest needs Pro ("haramain").
export function HaramainScreen() {
  const { lang } = useLang();
  const t = useTheme();
  const s = (k: string) => pick(UI[k], lang);
  const ent = useEntitlement("haramain");
  const [open, setOpen] = useState(0);
  const [share, setShare] = useState(false);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} title={s("title")} lead={s("lead")} arabic="الْحَرَمَانِ الشَّرِيفَانِ">
          <GoldButton compact title={s("share")} icon="send" onPress={() => setShare(true)} style={{ marginTop: 14, alignSelf: "flex-start" }} />
        </PageHero>
        <View style={{ padding: 16, gap: 14 }}>
          <CourseList def={HARAMAIN_COURSE} />
          <GoldButton title={pick(GUIDE_LABEL, lang)} icon="map" onPress={() => router.push("/haramain/guide")} />
          <View style={{ backgroundColor: t.surface, borderRadius: 14, borderWidth: 1, borderColor: t.line, padding: 16 }}>
            <Eyebrow>{s("timeline")}</Eyebrow>
            <View style={{ marginTop: 10 }}>
              {TIMELINE.map((e, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ alignItems: "center", width: 14 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: t.gold, marginTop: 5 }} />
                    {i < TIMELINE.length - 1 ? <View style={{ width: 2, flex: 1, backgroundColor: t.line }} /> : null}
                  </View>
                  <View style={{ flex: 1, paddingBottom: 14 }}>
                    {e.year ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1, color: t.gold }}>{e.year}</Text> : null}
                    <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 21, color: t.ink }}>{pick(e.title, lang)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          {SECTIONS.map((sec, i) => {
            const locked = i > 0 && !ent.allowed;
            return <SectionCard key={sec.id} sec={sec} free={i === 0} locked={locked} expanded={open === i}
              onToggle={() => (locked ? ent.upsell() : setOpen(open === i ? -1 : i))} s={s} lang={lang} />;
          })}
        </View>
        <ShareSheet visible={share} onClose={() => setShare(false)} link={`${SITE}/haramain`} noDecoration message={s("shareMsg")}
          renderCard={(f) => <ShareCard format={f} title={s("title")} sub={s("card")} />} />
      </Page>
    </>
  );
}

function ShareCard({ format, title, sub }: { format: ShareFormat; title: string; sub: string }) {
  const size = CARD_SIZE[format];
  return (
    <View style={{ width: size.w, height: size.h, backgroundColor: stage.bg, alignItems: "center", justifyContent: "center", padding: size.w * 0.08, gap: 18 }}>
      <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: size.w * 0.09, lineHeight: size.w * 0.17, color: stage.gold, textAlign: "center" }}>الْحَرَمَانِ الشَّرِيفَانِ</Text>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: size.w * 0.065, color: stage.text, textAlign: "center" }}>{title}</Text>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: size.w * 0.035, color: stage.textSoft, textAlign: "center" }}>{sub}</Text>
      <View style={{ marginTop: 24 }}><BrandFoot /></View>
    </View>
  );
}

function SectionCard({ sec, free, locked, expanded, onToggle, s, lang }: {
  sec: Section; free: boolean; locked: boolean; expanded: boolean; onToggle: () => void; s: (k: string) => string; lang: string;
}) {
  const t = useTheme();
  const body = (
    <>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={`${pick(sec.title, lang)}${locked ? `, ${s("pro")}` : ""}`}
        style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          {free ? <Eyebrow>{s("free")}</Eyebrow> : locked ? <Eyebrow>{s("pro")}</Eyebrow> : null}
          <Text style={{ fontFamily: FONT.display, fontSize: 19, lineHeight: 24, color: t.ink, marginTop: 6 }}>{pick(sec.title, lang)}</Text>
        </View>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, color: t.gold }}>{sec.arabic}</Text>
        <Icon name={locked ? "lock" : expanded ? "chevronDown" : "chevronRight"} color={locked ? t.gold : t.muted} size={17} />
      </Pressable>
      {expanded && !locked ? <SectionBody sec={sec} s={s} lang={lang} /> : null}
    </>
  );
  return free
    ? <GoldCard>{body}</GoldCard>
    : <View style={{ backgroundColor: t.surface, borderRadius: 14, borderWidth: 1, borderColor: t.line, padding: 16 }}>{body}</View>;
}

function SectionBody({ sec, s, lang }: { sec: Section; s: (k: string) => string; lang: string }) {
  const t = useTheme();
  const keys = sec.ranges.flatMap(expandRange);
  const [verses, setVerses] = useState<(SingleVerse | null)[] | null>(null);
  const [items, setItems] = useState<ExtraItem[] | null>(null);
  useEffect(() => {
    let live = true;
    Promise.all(sec.ranges.flatMap(expandRange).map((k) => getVerseByKey(k, lang).catch(() => null))).then((v) => live && setVerses(v));
    extraItemsFor(sec.kind, sec.items, lang).then((v) => live && setItems(v));
    return () => { live = false; };
  }, [sec, lang]);
  return (
    <View style={{ marginTop: 14, gap: 14 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink }}>{pick(sec.text, lang)}</Text>
      <Eyebrow>{s("read")}</Eyebrow>
      {items === null ? <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{s("loading")}</Text>
        : items.length === 0 ? <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{s("offline")}</Text>
        : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
            {items.map((it) => <ItemCard key={it.id} item={it} />)}
          </ScrollView>
        )}
      {sec.ranges.length ? <Eyebrow>{s("verses")}</Eyebrow> : null}
      {!sec.ranges.length ? null : verses === null ? <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{s("loading")}</Text> : sec.ranges.map((r) => {
        const rk = expandRange(r);
        return (
          <View key={r} style={{ borderTopWidth: 1, borderTopColor: t.line, paddingTop: 12, gap: 8 }}>
            {rk.map((k) => {
              const v = verses[keys.indexOf(k)];
              return v ? (
                <View key={k} style={{ gap: 4 }}>
                  <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 42, color: t.arabic, textAlign: "right", writingDirection: "rtl" }}>{v.text_uthmani}</Text>
                  {v.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted }}>{`${k} · ${v.translation}`}</Text> : null}
                </View>
              ) : <Text key={k} style={{ color: t.muted, fontFamily: FONT.regular }}>{`${k} · ${s("offline")}`}</Text>;
            })}
            <TextLink title={`${r} · ${s("openReader")}`} onPress={() => openVerse(rk[0])} />
          </View>
        );
      })}
    </View>
  );
}

function ItemCard({ item }: { item: ExtraItem }) {
  const t = useTheme();
  return (
    <View style={{ width: 260, borderRadius: 12, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.bg }}>
      {item.image ? <Image source={{ uri: item.image }} style={{ width: "100%", aspectRatio: 4 / 3 }} resizeMode="cover" accessibilityIgnoresInvertColors /> : null}
      <View style={{ padding: 12, gap: 6 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{item.title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.ink }} numberOfLines={7}>{item.body}</Text>
        {item.imageCredit ? <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }} numberOfLines={2}>{item.imageCredit}</Text> : null}
        <Text onPress={() => Linking.openURL(item.sourceUrl)} accessibilityRole="link" style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted }}>
          {`${item.source}, ${item.license}`}
        </Text>
      </View>
    </View>
  );
}

/** Discover tab card */
export function HaramainCard({ onPress }: { onPress: () => void }) {
  const { lang } = useLang();
  const t = useTheme();
  const s = (k: string) => pick(UI[k], lang);
  return (
    <GoldCard>
      <Eyebrow>{s("eyebrow")}</Eyebrow>
      <Text style={{ fontFamily: FONT.display, fontSize: 20, lineHeight: 25, marginTop: 6, color: t.ink }}>{s("title")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, marginTop: 6, color: t.muted }}>{s("card")}</Text>
      <GoldButton compact title={s("open")} onPress={onPress} style={{ marginTop: 12, alignSelf: "flex-start" }} />
    </GoldCard>
  );
}
