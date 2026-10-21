import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { goBack } from "@/components/page";
import { Icon } from "@/components/icons";
import { T } from "@/features/talents/api";
import { useTT } from "@/features/talents/text";
import { ClipPlayer, type Loader } from "@/features/talents/Player";
import { Text } from "react-native";
import { FONT, stage } from "@/lib/theme";
import { usePostingOn } from "@/features/sijill/config";
import { useST } from "@/features/sijill/text";

// /talents/player?src=user&u=<username>&type=post|story&start=<id> | src=saved | src=reels | src=highlight&u=&h=<id> | src=post&start=<id>
export default function PlayerScreen() {
  const tt = useTT();
  const st = useST();
  const postingOn = usePostingOn();
  const insets = useSafeAreaInsets();
  const p = useLocalSearchParams<{ src?: string; u?: string; type?: string; start?: string; h?: string }>();
  const load = useMemo<Loader>(() => {
    if (p.src === "saved") return async () => ({ posts: (await T.saved()).posts, next: null });
    if (p.src === "reels") return (c) => T.reels(c);
    if (p.src === "highlight" && p.u) return async () => ({ posts: (await T.highlights(p.u!)).highlights.find((h) => h.id === p.h)?.posts ?? [], next: null });
    if (p.src === "post" && p.start) return async () => ({ posts: [(await T.post(p.start!)).post], next: null });
    return (c) => T.posts(p.u ?? "", p.type === "story" ? "story" : "post", c).then((d) => ({ posts: d.posts.filter((x) => x.media), next: d.next }));
  }, [p.src, p.u, p.type, p.start, p.h]);
  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: "fade" }} />
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        {postingOn ? <ClipPlayer load={load} startId={p.start} /> : (
          <View style={{ flex: 1, backgroundColor: stage.deep, alignItems: "center", justifyContent: "center", padding: 32 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 16, lineHeight: 23, color: stage.cream, textAlign: "center" }}>{st("postingOff")}</Text>
          </View>
        )}
        <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel={tt("back")} hitSlop={10}
          style={{ position: "absolute", top: insets.top + 8, left: 12, width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <Icon name="chevronLeft" color="#fff" size={22} />
        </Pressable>
      </View>
    </>
  );
}
