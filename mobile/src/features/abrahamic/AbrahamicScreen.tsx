import { ShareVerseButton } from "@/features/share/ShareKit";
import { DoneShare } from "@/features/share/SharePrompt";
import { useEffect, useState } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Eyebrow, GoldButton, GoldCard, TextLink } from "@/components/brand";
import { Icon } from "@/components/icons";
import { pick, useLang } from "@/i18n";
import { ARABIC_FONT, FONT, useTheme } from "@/lib/theme";
import { useEntitlement } from "@/lib/entitlements";
import { getVerseByKey, type SingleVerse } from "@/lib/quran";
import { extraItemsFor, type ExtraItem } from "@/content/extra";
import { openVerse } from "@/features/coursekit/links";
import { UI, UNITS, type AbrahamicUnit } from "./content";

// /abrahamic – "Abraham and the Abrahamic religions in the Quran". Unit 1 is free, the rest needs Pro ("abrahamic").
export function AbrahamicScreen() {
  const { lang } = useLang();
  const s = (k: string) => pick(UI[k], lang);
  const ent = useEntitlement("abrahamic");
  const [open, setOpen] = useState(0);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} title={s("title")} lead={s("lead")} arabic="مِلَّةَ إِبْرَاهِيمَ" />
        <View style={{ padding: 16, gap: 14 }}>
          {UNITS.map((u, i) => {
            const locked = i > 0 && !ent.allowed;
            return <UnitCard key={u.id} unit={u} n={i + 1} locked={locked} expanded={open === i}
              onToggle={() => (locked ? ent.upsell() : setOpen(open === i ? -1 : i))} s={s} lang={lang} />;
          })}
        </View>
      </Page>
    </>
  );
}

function UnitCard({ unit, n, locked, expanded, onToggle, s, lang }: {
  unit: AbrahamicUnit; n: number; locked: boolean; expanded: boolean; onToggle: () => void; s: (k: string) => string; lang: string;
}) {
  const t = useTheme();
  const body = (
    <>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={`${s("unit")} ${n}: ${pick(unit.title, lang)}${locked ? ", Pro" : ""}`}
        style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{`${s("unit")} ${n}${n === 1 ? ` · ${s("free")}` : ""}`}</Eyebrow>
          <Text style={{ fontFamily: FONT.display, fontSize: 19, lineHeight: 24, color: t.ink, marginTop: 6 }}>{pick(unit.title, lang)}</Text>
        </View>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, color: t.gold }}>{unit.arabic}</Text>
        <Icon name={locked ? "lock" : expanded ? "chevronDown" : "chevronRight"} color={locked ? t.gold : t.muted} size={17} />
      </Pressable>
      {expanded && !locked ? <UnitBody unit={unit} s={s} lang={lang} /> : null}
    </>
  );
  return unit.highlight
    ? <GoldCard>{body}</GoldCard>
    : <View style={{ backgroundColor: t.surface, borderRadius: 14, borderWidth: 1, borderColor: t.line, padding: 16 }}>{body}</View>;
}

function UnitBody({ unit, s, lang }: { unit: AbrahamicUnit; s: (k: string) => string; lang: string }) {
  const t = useTheme();
  const [verses, setVerses] = useState<(SingleVerse | null)[] | null>(null);
  const [items, setItems] = useState<ExtraItem[] | null>(null);
  useEffect(() => {
    let live = true;
    Promise.all(unit.verses.map((k) => getVerseByKey(k, lang).catch(() => null))).then((v) => live && setVerses(v));
    extraItemsFor(unit.kind, unit.items, lang).then((v) => live && setItems(v));
    return () => { live = false; };
  }, [unit, lang]);
  return (
    <View style={{ marginTop: 14, gap: 14 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink }}>{pick(unit.text, lang)}</Text>
      <Eyebrow>{s("verses")}</Eyebrow>
      {verses === null ? <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{s("loading")}</Text> : unit.verses.map((k, i) => {
        const v = verses[i];
        return (
          <View key={k} style={{ borderTopWidth: 1, borderTopColor: t.line, paddingTop: 12, gap: 6 }}>
            {v ? (
              <>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 42, color: t.arabic, textAlign: "right", writingDirection: "rtl" }}>{v.text_uthmani}</Text>
                {v.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted }}>{v.translation}</Text> : null}
              </>
            ) : <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{s("offline")}</Text>}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <TextLink title={`${k} · ${s("openReader")}`} onPress={() => openVerse(k)} />
              <ShareVerseButton verseKey={k} />
            </View>
          </View>
        );
      })}
      <Eyebrow>{s("read")}</Eyebrow>
      {items === null ? <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{s("loading")}</Text>
        : items.length === 0 ? <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{s("offline")}</Text>
        : items.map((it) => <ItemCard key={it.id} item={it} />)}
      <DoneShare kind="course" banner={false} arabic={unit.arabic} title={pick(unit.title, lang)} body={pick(unit.text, lang)} />
    </View>
  );
}

function ItemCard({ item }: { item: ExtraItem }) {
  const t = useTheme();
  return (
    <View style={{ borderRadius: 12, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.bg }}>
      {item.image ? <Image source={{ uri: item.image }} style={{ width: "100%", aspectRatio: 16 / 9 }} resizeMode="cover" accessibilityIgnoresInvertColors /> : null}
      <View style={{ padding: 12, gap: 6 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{item.title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.ink }} numberOfLines={8}>{item.body}</Text>
        {item.imageCredit ? <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{item.imageCredit}</Text> : null}
        <Text onPress={() => Linking.openURL(item.sourceUrl)} accessibilityRole="link" style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted }}>
          {`${item.source}, ${item.license}`}
        </Text>
      </View>
    </View>
  );
}

/** Discover tab card */
export function AbrahamicCard({ onPress }: { onPress: () => void }) {
  const { lang } = useLang();
  const s = (k: string) => pick(UI[k], lang);
  return (
    <GoldCard>
      <Eyebrow>{s("eyebrow")}</Eyebrow>
      <Text style={{ fontFamily: FONT.display, fontSize: 20, lineHeight: 25, marginTop: 6, color: useTheme().ink }}>{s("title")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, marginTop: 6, color: useTheme().muted }}>{s("card")}</Text>
      <GoldButton compact title={s("open")} onPress={onPress} style={{ marginTop: 12, alignSelf: "flex-start" }} />
    </GoldCard>
  );
}
