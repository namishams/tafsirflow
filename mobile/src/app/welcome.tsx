import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { Divider } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useX } from "@/features/extra/strings";
import { Featured } from "@/features/extra/widgets/Featured";
import { HomeCourses, HomeFaq, HomeFeatures, HomeFinalCta, HomeGlossary, HomeHero, HomeTajweed, HomeMapTeaser, HomeMethod, HomePaths, HomePopular, HomeTools, HomeWhy } from "@/features/extra/widgets/Home";
import { ProTeaser } from "@/features/extra/widgets/ProTeaser";
import { SiteFooter } from "@/features/extra/widgets/SiteFooter";
import { WhyQuran } from "@/features/extra/widgets/WhyQuran";
import { useTheme } from "@/lib/theme";
import { goBack } from "@/components/page";

// The website's home page (quranmasterclass.com) as one native screen: everything the landing page explains, in the
// same order. The Today tab stays the daily hub; this is the "what is Quran Masterclass" page (Discover, onboarding).
export default function Welcome() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const x = useX();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} accessibilityLabel={x.welcome.title}>
        <HomeHero topInset={insets.top} />
        <HomeCourses />
        <Divider style={{ marginVertical: 28 }} />
        <Featured />
        <View style={{ height: 12 }} />
        <WhyQuran />
        <HomeWhy />
        <HomePaths />
        <HomeMethod />
        <HomeFeatures />
        <HomeMapTeaser />
        <HomePopular />
        <HomeTajweed />
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}><ProTeaser /></View>
        <HomeGlossary />
        <HomeTools />
        <HomeFaq />
        <HomeFinalCta />
        <SiteFooter />
      </ScrollView>
      {router.canGoBack() ? (
        <Pressable onPress={() => goBack()} accessibilityRole="button" accessibilityLabel={x.back} hitSlop={10}
          style={{ position: "absolute", top: insets.top + 6, left: 12, width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,28,21,0.55)" }}>
          <Icon name="chevronLeft" color="#ffffff" size={22} />
        </Pressable>
      ) : null}
    </>
  );
}
