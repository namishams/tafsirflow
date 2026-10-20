import { Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { FONT, FWD } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { GUIDES } from "@/web/guides";
import { HeroLead, HeroTitle, IslCard, IslHero, IslamNum, Marble, useSaw } from "@/features/library/art";
import { IslScreen } from "@/features/library/screen";
import { useIsl } from "@/features/library/palette";
import { guideOf } from "@/features/library/content";

// /guides – long-form guides on learning, memorising, reading and understanding the Quran
// (website: src/app/[locale]/(app)/guides/page.tsx)
export default function GuidesPage() {
  const { lang } = useLang();
  const t = useWebT("guides");
  const isl = useIsl();
  const sw = useSaw();
  return (
    <IslScreen>
      <IslHero callig="دليل" fall={420} rainOpacity={0.7} paddingBottom={88}>
        <HeroTitle size={40} style={{ marginTop: 0, lineHeight: 42 }}>{t("title")}</HeroTitle>
        <HeroLead style={{ marginTop: 20 }}>{t("lead")}</HeroLead>
      </IslHero>
      <Marble>
        <View style={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 80, gap: 12 }}>
          {GUIDES.map((g, i) => {
            const gt = guideOf(g, lang);
            return (
              <IslCard key={g.slug} onPress={() => router.push(`/guides/${g.slug}` as Href)} accessibilityLabel={gt.title}>
                <View style={{ flexDirection: "row", gap: 16, padding: 20 }}>
                  <IslamNum n={i + 1} size={40} fontSize={13} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 17.5, lineHeight: 24, color: isl.ink }}>{sw(gt.title)}</Text>
                    <Text style={{ marginTop: 6, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 23.5, color: isl.muted }}>{sw(gt.desc)}</Text>
                  </View>
                  <Text style={{ marginTop: 4, fontFamily: FONT.semibold, fontSize: 16, color: isl.gold }}>{FWD}</Text>
                </View>
              </IslCard>
            );
          })}
        </View>
      </Marble>
    </IslScreen>
  );
}
