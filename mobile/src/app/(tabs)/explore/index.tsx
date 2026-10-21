import { Stack, router, useIsFocused, useLocalSearchParams, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBarSpace } from "@/components/TabBar";
import { Icon } from "@/components/icons";
import { goBack } from "@/components/page";
import { useT } from "@/i18n";
import { FONT, useTheme } from "@/lib/theme";
import { ExploreBody } from "@/features/feed/Explore";
import { openInFeed } from "@/features/feed/FeedRoot";
import { useFeedText } from "@/features/feed/texts";

// The Explore tab: the grid with a search field and topic chips; a tile opens in the Feed tab's Reels. The empty search
// bar opens the full search screen (/talents/search), like Instagram. The tab is hidden in the tab bar (it is opened
// from the search and the feed), so it has its own title row with a way back.
export default function ExploreTab() {
  const t = useTheme();
  const tr = useT();
  const tx = useFeedText();
  const insets = useSafeAreaInsets();
  const space = useTabBarSpace();
  const focused = useIsFocused();
  // the search bar opens the full search (accounts, content); "Posts about … in Explore" comes back with ?q=
  const { q } = useLocalSearchParams<{ q?: string }>();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingBottom: space - 24 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingTop: insets.top, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, minHeight: insets.top + 48 }}>
        <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel={tr("common.back")} hitSlop={10}
          style={({ pressed }) => ({ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
          <Icon name="chevronLeft" color={t.ink} size={24} />
        </Pressable>
        <Text accessibilityRole="header" numberOfLines={1} style={{ flex: 1, fontFamily: FONT.display, fontSize: 21, letterSpacing: -0.3, color: t.ink }}>{tx.explore}</Text>
      </View>
      <ExploreBody active={focused} top={0} onOpen={(item, hadith) => { openInFeed(item, hadith); router.navigate("/" as Href); }}
        onSearch={() => router.push("/talents/search" as Href)} initialQuery={typeof q === "string" ? q : undefined} />
    </View>
  );
}
