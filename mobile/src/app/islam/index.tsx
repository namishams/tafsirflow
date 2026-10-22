import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { FONT } from "@/lib/theme";
import { useLang } from "@/i18n";
import { ISLAM, hubOrder, readingMinutes, tradUi } from "@/web/islam";
import { useTradition } from "@/lib/tradition";
import { ArchWindow, Corners, HeroKicker, HeroLead, HeroTitle, IslCard, IslH2, IslHero, IslamNum, Marble, Mosque, useSaw } from "@/features/library/art";
import { GoldPill } from "@/features/library/ui";
import { IslScreen } from "@/features/library/screen";
import { SERIF, useIsl } from "@/features/library/palette";
import { useChapters, useIslamUi } from "@/features/library/content";

// /islam – "Understanding Islam": the hub with every chapter as a marble card with a window of coloured inlay
// (website: src/app/[locale]/(app)/islam/page.tsx)
export default function IslamHub() {
  const { lang } = useLang();
  const u = useIslamUi();
  const isl = useIsl();
  const sw = useSaw();
  const chs = useChapters();
  const { tradition } = useTradition();
  const [openOther, setOpenOther] = useState(false);
  if (!u) return <IslScreen><View /></IslScreen>;
  // the tradition setting orders the chapters; the other school's chapters wait behind "Andere Rechtsschulen"
  const order = hubOrder(tradition);
  const tu = tradUi(lang);
  const pairs = (list: number[]) => { const out: number[][] = []; list.forEach((i, k) => { if (k % 2 === 0) out.push([]); out[out.length - 1].push(i); }); return out; };
  const rows: number[][] = [...pairs(order.main), ...(openOther ? pairs(order.other) : [])];
  return (
    <IslScreen>
      <IslHero callig="الإسلام" dome domeTop={-160} fall={560} rainOpacity={0.8}>
        <HeroKicker>{u.kicker}</HeroKicker>
        <HeroTitle size={42} style={{ lineHeight: 43.7 }}>{u.title}</HeroTitle>
        <HeroLead style={{ fontSize: 18, lineHeight: 29 }}>{sw(u.lead)}</HeroLead>
        <GoldPill title={u.start} onPress={() => router.push(`/islam/${ISLAM[0].slug}` as Href)} style={{ marginTop: 32 }} />
      </IslHero>

      <Marble>
        <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 64 }}>
          <IslH2 size={36} style={{ lineHeight: 45 }}>{u.chapters}</IslH2>
          <View style={{ marginTop: 32, gap: 12 }}>
            {rows.map((r, ri) => (
              <View key={ri} style={{ flexDirection: "row", gap: 12 }}>
                {r.map((i) => {
                  const d = ISLAM[i], c = chs[i];
                  return (
                    <View key={d.slug} style={{ flex: 1, minWidth: 0 }}>
                      <IslCard onPress={() => router.push(`/islam/${d.slug}` as Href)} accessibilityLabel={`${i + 1}. ${c.title}`} fill style={{ padding: 10 }}>
                        <ArchWindow i={i} ar={d.arabic} />
                        <View style={{ flex: 1, alignItems: "center", marginTop: -16, paddingHorizontal: 6, paddingBottom: 8 }}>
                          <View style={{ borderRadius: 999, backgroundColor: isl.paper, padding: 2 }}><IslamNum n={i + 1} size={36} fontSize={12} /></View>
                          <Text numberOfLines={1} style={{ marginTop: 6, fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.47, textTransform: "uppercase", color: isl.gold, textAlign: "center" }}>{c.kicker}</Text>
                          <Text style={{ marginTop: 6, fontFamily: FONT.display, fontSize: 17, lineHeight: 20, letterSpacing: -0.3, color: isl.ink, textAlign: "center" }}>{sw(c.title)}</Text>
                          <Text numberOfLines={3} style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 13, lineHeight: 17.9, color: isl.muted, textAlign: "center" }}>{sw(c.lead)}</Text>
                          <View style={{ flex: 1 }} />
                          <Text style={{ paddingTop: 12, fontFamily: FONT.semibold, fontSize: 11.5, color: isl.gold, textAlign: "center" }}>{u.read} · {readingMinutes(c.body)} {u.min}</Text>
                        </View>
                      </IslCard>
                    </View>
                  );
                })}
                {r.length === 1 ? <View style={{ flex: 1 }} /> : null}
              </View>
            ))}
          </View>
          {order.other.length ? (
            <Pressable onPress={() => setOpenOther((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: openOther }}
              style={({ pressed }) => ({ marginTop: 20, borderRadius: 16, borderWidth: 1, borderColor: isl.a("goldSoft", 0.4), padding: 16, opacity: pressed ? 0.8 : 1 })}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: isl.ink }}>{tu.other} ({order.other.length}) {openOther ? "−" : "+"}</Text>
              <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: isl.muted }}>{tu.otherLead}</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
          <IslCard style={{ paddingHorizontal: 24, paddingVertical: 40 }}>
            <Corners />
            <IslH2 size={30} style={{ lineHeight: 36 }}>{u.uaeTitle}</IslH2>
            <Text style={{ marginTop: 16, fontFamily: SERIF, fontSize: 18, lineHeight: 29, color: isl.a("ink", 0.85) }}>{u.uae}</Text>
            <Text style={{ marginTop: 20, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: isl.muted }}>{u.note}</Text>
            <View style={{ alignItems: "center", marginTop: 32 }}><Mosque width={260} color={isl.goldSoft} /></View>
          </IslCard>
        </View>
      </Marble>
    </IslScreen>
  );
}
