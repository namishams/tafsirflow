import { useEffect, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { TextLink } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useStored, writeJSON } from "@/lib/store";
import { getVerseByKey, type SingleVerse } from "@/lib/quran";
import { showsShia, useTradition } from "@/lib/tradition";
import { sunniHadith } from "@/content/sources/hadith";
import { shiaHadith } from "@/features/hadith/data";
import { openVerse } from "@/features/coursekit/links";
import { SUNNAH_DUAS, type SunnahDua } from "@/web/sunnahDuas";
import { SUNNAH_DUAS_2 } from "@/web/sunnahDuas2";
import { useShams2 } from "../model";
import { Card } from "../ui";
import { ADAB_DONE_KEY, ADAB_ITEMS, ADAB_REVIEW, ADAB_ROUTES, ADAB_SOURCES, ADAB_TOPICS, adabOfDay, toggleAdabDone, type AdabItem, type AdabRef, type AdabStatus } from "./data";
import { useAdabText } from "./text";

// The pillar "Adab des Qurʾān-Trägers" of the Shams Method (its newest form, Shams 3.0): the page /shams/adab, the
// pillar card for the method hub, and "Adab des Tages" for the hub and today's wird. Verses, hadith and duʿāʾs are only
// rendered from their data sources (Quran API, hadith-api, Thaqalayn, sunnahDuas) – nothing is typed here. The daily
// tick is stored on this device only (never synced, no score). The website mirrors this file in
// src/components/learn/shams2/Adab.tsx.

const DUAS: SunnahDua[] = [...SUNNAH_DUAS, ...SUNNAH_DUAS_2];
const open = (href: string) => router.push(href as Href);

function StatusPills({ status }: { status: AdabStatus[] }) {
  const t = useTheme();
  const { a } = useAdabText();
  const strong = (s: AdabStatus) => s === "fard" || s === "wajib" || s === "haram";
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }} accessibilityLabel={`${a("status")}: ${status.map((s) => a(`st_${s}`)).join(", ")}`}>
      {status.map((s) => (
        <View key={s} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: strong(s) ? t.accent : "rgba(201,166,94,0.6)", backgroundColor: strong(s) ? t.accentSoft : t.surface }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: strong(s) ? t.accent : t.gold }}>{a(`st_${s}`)}</Text>
        </View>
      ))}
    </View>
  );
}

type Loaded = { state: "loading" } | { state: "error" } | { state: "ok"; arabic?: string; text: string; ref: string; url?: string };

/** the text of one verse or hadith, loaded from its source only when the reader asks for it */
function RefText({ r }: { r: Extract<AdabRef, { k: "verse" | "hadith" | "kafi" }> }) {
  const t = useTheme();
  const { a, lang } = useAdabText();
  const [v, setV] = useState<Loaded>({ state: "loading" });
  useEffect(() => {
    let live = true;
    const done = (x: Loaded) => { if (live) setV(x); };
    if (r.k === "verse") getVerseByKey(r.key, lang).then((x: SingleVerse) => done({ state: "ok", arabic: x.text_uthmani, text: x.translation, ref: `Qurʾān ${r.key}` })).catch(() => done({ state: "error" }));
    else if (r.k === "hadith") sunniHadith(r.c, r.n, lang).then((x) => done(x ? { state: "ok", arabic: x.arabic, text: x.body, ref: x.title, url: x.sourceUrl } : { state: "error" })).catch(() => done({ state: "error" }));
    else shiaHadith(r.book, r.n, lang).then((x) => done(x ? { state: "ok", arabic: x.arabic, text: x.text, ref: x.reference, url: x.url } : { state: "error" })).catch(() => done({ state: "error" }));
    return () => { live = false; };
  }, [r, lang]);
  if (v.state === "loading") return <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{a("loading")}</Text>;
  if (v.state === "error") return <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{a("offline")}</Text>;
  return (
    <View style={{ gap: 6, paddingTop: 4 }}>
      {v.arabic ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 38, color: t.arabic, textAlign: "right", writingDirection: "rtl" }}>{v.arabic}</Text> : null}
      {v.text ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, textAlign: "left" }}>{v.text}</Text> : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.gold }}>{v.ref}</Text>
    </View>
  );
}

function DuaBlock({ id }: { id: string }) {
  const t = useTheme();
  const { cl } = useAdabText();
  const d = DUAS.find((x) => x.id === id);
  if (!d) return null;
  return (
    <View style={{ gap: 6, padding: 12, borderRadius: R.card, backgroundColor: t.bg, borderWidth: 1, borderColor: t.line }}>
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 38, color: t.arabic, textAlign: "right", writingDirection: "rtl" }}>{d.ar}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, fontStyle: "italic", textAlign: "left" }}>{d.tr}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, textAlign: "left" }}>{d[cl]}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.gold }}>{d.src}</Text>
    </View>
  );
}

function RefRow({ r }: { r: AdabRef }) {
  const t = useTheme();
  const { a } = useAdabText();
  const [shown, setShown] = useState(false);
  if (r.k === "dua") return <DuaBlock id={r.id} />;
  if (r.k === "src") {
    const s = ADAB_SOURCES[r.id];
    return (
      <View style={{ flexDirection: "row", gap: 6, alignItems: "flex-start" }}>
        <Icon name="book" size={12} color={t.muted} />
        <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" }}>{s.label}</Text>
        {s.url ? <TextLink title={a("openSource")} onPress={() => void Linking.openURL(s.url)} /> : null}
      </View>
    );
  }
  const label = r.k === "verse" ? `Qurʾān ${r.key}` : r.cite;
  const url = r.k === "hadith" ? `https://sunnah.com/${r.sunnah}` : r.k === "kafi" ? r.url : null;
  return (
    <View style={{ gap: 4, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Text style={{ flex: 1, minWidth: 140, fontFamily: FONT.semibold, fontSize: 13, color: t.ink, textAlign: "left" }}>{label}</Text>
        <TextLink title={shown ? a("hideText") : a("showText")} onPress={() => setShown(!shown)} />
        {r.k === "verse" ? <TextLink title={a("openReader")} onPress={() => openVerse(r.key)} /> : url ? <TextLink title={a("openSource")} onPress={() => void Linking.openURL(url)} /> : null}
      </View>
      {shown ? <RefText r={r} /> : null}
    </View>
  );
}

function ItemBody({ item }: { item: AdabItem }) {
  const t = useTheme();
  const { a, cl } = useAdabText();
  const { tradition } = useTradition();
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink, textAlign: "left" }}>{item.practice[cl]}</Text>
      <StatusPills status={item.status} />
      {item.note ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted, textAlign: "left" }}>{item.note[cl]}</Text> : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.1, color: t.gold }}>{a("sources").toUpperCase()}</Text>
      {item.refs.map((r, i) => <RefRow key={i} r={r} />)}
      {item.jafari && showsShia(tradition) ? (
        <View style={{ gap: 6, padding: 12, borderRadius: R.card, borderWidth: 1, borderColor: t.line }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.gold }}>{a("jafari")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.ink, textAlign: "left" }}>{item.jafari.note[cl]}</Text>
          {item.jafari.refs.map((r, i) => <RefRow key={i} r={r} />)}
        </View>
      ) : null}
      {item.sisters ? <TextLink title={a("sisters")} onPress={() => open(ADAB_ROUTES.sisters)} /> : null}
      {item.href ? <TextLink title={a("related")} onPress={() => open(item.href!)} /> : null}
    </View>
  );
}

function ItemFold({ item, openId, setOpen }: { item: AdabItem; openId: string | null; setOpen: (id: string | null) => void }) {
  const t = useTheme();
  const { cl } = useAdabText();
  const on = openId === item.id;
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: on ? "rgba(201,166,94,0.6)" : t.line, backgroundColor: t.surface }}>
      <Pressable onPress={() => setOpen(on ? null : item.id)} accessibilityRole="button" accessibilityState={{ expanded: on }} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14 }}>
        <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 15, color: t.ink, textAlign: "left" }}>{item.title[cl]}</Text>
        <Icon name={on ? "chevronDown" : "chevronRight"} size={13} color={t.muted} />
      </Pressable>
      {on ? <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}><ItemBody item={item} /></View> : null}
    </View>
  );
}

function ReviewLine() {
  const t = useTheme();
  const { a } = useAdabText();
  if (!ADAB_REVIEW.needs_review) return null;
  return (
    <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
      <Icon name="eye" size={12} color={t.gold} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.gold }}>{a("review")}</Text>
    </View>
  );
}

/** "Adab des Tages": one item per plan day with the optional local tick; for the hub, today's wird and the page */
export function AdabTodayCard({ withLink = true }: { withLink?: boolean }) {
  const t = useTheme();
  const { a, cl } = useAdabText();
  const { day } = useShams2();
  const item = adabOfDay(day);
  const done = useStored<Record<string, string>>(ADAB_DONE_KEY, {});
  const on = done[day] === item.id;
  return (
    <Card gold>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, color: t.gold }}>{a("todayKicker").toUpperCase()}</Text>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink, textAlign: "left" }}>{item.title[cl]}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink, textAlign: "left" }}>{item.practice[cl]}</Text>
      <StatusPills status={item.status} />
      <Pressable onPress={() => writeJSON(ADAB_DONE_KEY, toggleAdabDone(done, day, item.id))} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
        style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6, minHeight: 44 }}>
        {on ? <Icon name="checkCircle" size={22} color={t.gold} /> : <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: t.line }} />}
        <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14.5, color: on ? t.gold : t.ink, textAlign: "left" }}>{on ? a("doneTodayOn") : a("doneToday")}</Text>
      </Pressable>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "left" }}>{a("privacy")}</Text>
      {withLink ? <TextLink title={`${a("name")} – ${a("open")}`} onPress={() => open(`${ADAB_ROUTES.page}?i=${item.id}`)} /> : null}
    </Card>
  );
}

/** the pillar in the method description of the hub: a dark stage card, strict and honest */
export function AdabPillarCard() {
  const { a } = useAdabText();
  return (
    <Pressable onPress={() => open(ADAB_ROUTES.page)} accessibilityRole="button" accessibilityLabel={`${a("name")}. ${a("tileLead")}`}
      style={({ pressed }) => ({ padding: 18, borderRadius: R.card, backgroundColor: stage.bg, borderWidth: 1, borderColor: "rgba(214,180,108,0.5)", gap: 8, opacity: pressed ? 0.9 : 1 })}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.3, color: stage.gold }}>{a("pillarKicker").toUpperCase()}</Text>
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 38, color: stage.gold, textAlign: "left" }}>{"آداب حَمَلَة القُرْآن"}</Text>
      <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: stage.text, textAlign: "left" }}>{a("name")}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: stage.gold, textAlign: "left" }}>{a("pillars")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textSoft, textAlign: "left" }}>{a("pillarBody")}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold, marginTop: 2 }}>{a("open")}</Text>
    </Pressable>
  );
}

/** /shams/adab – the pillar page */
export function AdabScreen({ initial }: { initial?: string }) {
  const t = useTheme();
  const { a, cl, lang } = useAdabText();
  const [openId, setOpen] = useState<string | null>(initial && ADAB_ITEMS.some((i) => i.id === initial) ? initial : null);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={a("pillarKicker")} arabic="آداب حَمَلَة القُرْآن" title={a("name")} lead={a("pageLead")} />
        <View style={{ padding: 16, gap: 14 }}>
          <Card gold>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.gold, textAlign: "left" }}>{a("pillars")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink, textAlign: "left" }}>{a("pillarBody")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, textAlign: "left" }}>{a("pillarClassic")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted, textAlign: "left" }}>{a("pillarHonest")}</Text>
            <ReviewLine />
          </Card>
          <AdabTodayCard withLink={false} />
          {lang !== "de" && lang !== "en" ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{a("translationNote")}</Text> : null}
          {ADAB_TOPICS.map((tp) => (
            <View key={tp.id} style={{ gap: 8, marginTop: 6 }}>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 18, lineHeight: 32, color: t.gold, textAlign: "left" }}>{tp.ar}</Text>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, textAlign: "left" }}>{tp.title[cl]}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "left" }}>{tp.lead[cl]}</Text>
              {ADAB_ITEMS.filter((i) => i.topic === tp.id).map((i) => <ItemFold key={i.id} item={i} openId={openId} setOpen={setOpen} />)}
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, fontStyle: "italic", textAlign: "left" }}>{a("notFatwa")}</Text>
            </View>
          ))}
          <ReviewLine />
        </View>
      </Page>
    </>
  );
}

/** the link from the classic method and the Masterclass: the pillar belongs to every Shams path */
export function AdabClassicLink() {
  const t = useTheme();
  const { a } = useAdabText();
  return (
    <Pressable onPress={() => open(ADAB_ROUTES.page)} accessibilityRole="link" accessibilityLabel={`${a("name")}. ${a("classicLink")}`}
      style={({ pressed }) => ({ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(201,166,94,0.55)", backgroundColor: t.surface, opacity: pressed ? 0.85 : 1 })}>
      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.accentSoft, alignItems: "center", justifyContent: "center" }}><Icon name="hands" size={17} color={t.accent} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink, textAlign: "left" }}>{a("name")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, textAlign: "left" }}>{a("classicLink")}</Text>
      </View>
      <Icon name="chevronRight" size={14} color={t.muted} />
    </Pressable>
  );
}
