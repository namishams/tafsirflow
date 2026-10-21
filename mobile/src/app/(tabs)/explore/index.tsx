import { Stack, router, useIsFocused, useLocalSearchParams, type Href } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBarSpace } from "@/components/TabBar";
import { useTheme } from "@/lib/theme";
import { ExploreBody } from "@/features/feed/Explore";
import { openInFeed } from "@/features/feed/FeedRoot";

// The Explore tab: the grid with a search field and topic chips; a tile opens in the Feed tab's Reels. The empty search
// bar opens the full search screen (/talents/search), like Instagram
export default function ExploreTab() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const space = useTabBarSpace();
  const focused = useIsFocused();
  // the search bar opens the full search (accounts, content); "Posts about … in Explore" comes back with ?q=
  const { q } = useLocalSearchParams<{ q?: string }>();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingBottom: space - 24 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ExploreBody active={focused} top={insets.top} onOpen={(item, hadith) => { openInFeed(item, hadith); router.navigate("/" as Href); }}
        onSearch={() => router.push("/talents/search" as Href)} initialQuery={typeof q === "string" ? q : undefined} />
    </View>
  );
}
