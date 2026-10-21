import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { GoldCard } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { LinkRow, Page, PageHero, RowGroup } from "@/components/page";
import { FONT, useTheme } from "@/lib/theme";
import { useMt, type MtKey } from "./texts";
import { Muted, NeedsReview, Row } from "./ui";

// The Mishary track: what comes after the Reciter Path – forming the next generation of reciters.
const ITEMS: { href: string; title: MtKey; lead: MtKey; icon: IconName; ar: string }[] = [
  { href: "/mishary/ear", title: "earTitle", lead: "earLead", icon: "speaker", ar: "مقام" },
  { href: "/mishary/masters", title: "mastersTitle", lead: "mastersLead", icon: "user", ar: "أسلوب" },
  { href: "/mishary/journal", title: "journalTitle", lead: "journalLead", icon: "calendar", ar: "يومية" },
  { href: "/mishary/mentoring", title: "mentoringTitle", lead: "mentoringLead", icon: "comment", ar: "إرشاد" },
  { href: "/mishary/seasons", title: "seasonsTitle", lead: "seasonsLead", icon: "trophy", ar: "موسم" },
  { href: "/mishary/hall-of-fame", title: "hofTitle", lead: "hofLead", icon: "starBig", ar: "شرف" },
];

// ——— /mishary ———
export function MisharyHome() {
  const mt = useMt();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow={mt("kicker")} title={mt("title")} lead={mt("lead")} arabic="جيل القراء" />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 16 }}>
          <RowGroup>
            {ITEMS.map((x, i) => <LinkRow key={x.href} first={i === 0} icon={x.icon} title={mt(x.title)} subtitle={mt(x.lead)} arabic={x.ar} onPress={() => router.push(x.href as Href)} />)}
          </RowGroup>
          <Row><NeedsReview /><Muted size={12}>{mt("needsReviewNote")}</Muted></Row>
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}

/** entry card on the Reciter Path page */
export function MisharyCard() {
  const t = useTheme();
  const mt = useMt();
  return (
    <Pressable onPress={() => router.push("/mishary" as Href)} accessibilityRole="button">
      <GoldCard>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Icon name="speaker" color={t.gold} /><Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{mt("cardTitle")}</Text><Icon name="chevronRight" size={16} color={t.muted} /></View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 8 }}>{mt("cardLead")}</Text>
      </GoldCard>
    </Pressable>
  );
}
