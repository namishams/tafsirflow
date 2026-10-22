import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View, useWindowDimensions } from "react-native";
import { router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassButton, GlassIconButton, GlassSurface, GoldButton } from "@/components/brand";
import { FONT, stage } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { M, type ThreadRow } from "@/features/messenger/api";
import { ThreadAvatar } from "@/features/messenger/ui";
import { success } from "@/features/feed/haptics";
import { useMomentT } from "./texts";

// Sends a shared card into the in-app messenger: the conversations of the inbox as a list, one tap sends the image
// (when there is one) and the text with the link. Only the messenger's own client (features/messenger/api.ts) is used.
export type ChatPayload = { text: string; image?: () => Promise<string | null> };

export function ChatSendSheet({ payload, onClose }: { payload: ChatPayload; onClose: () => void }) {
  const tx = useMomentT();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [threads, setThreads] = useState<ThreadRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [sent, setSent] = useState<string[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) return;
    let live = true;
    M.threads("inbox").then((r) => { if (live) setThreads(r.threads.filter((x) => !x.request)); }).catch(() => { if (live) { setThreads([]); setErr(tx("chatFailed")); } });
    return () => { live = false; };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async (id: string) => {
    if (busy || sent.includes(id)) return;
    setBusy(id); setErr("");
    try {
      const uri = payload.image ? await payload.image().catch(() => null) : null;
      if (uri) await M.sendImage(id, uri);
      await M.sendText(id, payload.text);
      setSent((s) => [...s, id]);
      success();
    } catch {
      setErr(tx("chatFailed"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={onClose} accessibilityRole="button" accessibilityLabel={tx("close")} />
      <GlassSurface onStage strong style={{ maxHeight: height * 0.7, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: "rgba(5,28,21,0.96)" }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10 }}>
          <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 21, color: stage.cream }}>{tx("chatTitle")}</Text>
          <GlassIconButton icon="close" size={36} onStage label={tx("close")} onPress={onClose} />
        </View>
        {!user ? (
          <View style={{ padding: 18, gap: 14 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: stage.textSoft }}>{tx("chatSignIn")}</Text>
            <GoldButton title={tx("signIn")} onPress={() => { onClose(); setTimeout(() => router.push("/sign-in" as Href), 250); }} />
          </View>
        ) : threads === null ? <ActivityIndicator color={stage.gold} style={{ margin: 30 }} /> : (
          <FlatList
            data={threads}
            keyExtractor={(x) => x.id}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
            ListEmptyComponent={<View style={{ padding: 8, gap: 14 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: stage.textSoft }}>{tx("chatEmpty")}</Text>
              <GlassButton onStage title={tx("sendChat")} icon="comment" onPress={() => { onClose(); setTimeout(() => router.push("/talents/messages" as Href), 250); }} />
            </View>}
            renderItem={({ item }) => {
              const done = sent.includes(item.id);
              return (
                <Pressable onPress={() => void send(item.id)} disabled={done} accessibilityRole="button" accessibilityLabel={`${item.title}${done ? `, ${tx("chatSent")}` : ""}`} accessibilityState={{ busy: busy === item.id, disabled: done }}
                  style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9, paddingHorizontal: 6, borderRadius: 16, backgroundColor: pressed ? "rgba(255,255,255,0.06)" : "transparent" })}>
                  <ThreadAvatar kind={item.kind} title={item.title} photo={item.photo} avatar={item.with?.avatar ?? null} size={44} />
                  <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15.5, color: "#fff" }}>{item.title}</Text>
                  <View style={{ minWidth: 86, height: 34, borderRadius: 17, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: done ? stage.goldSoft : stage.gold, backgroundColor: done ? "transparent" : "rgba(214,180,108,0.16)" }}>
                    {busy === item.id ? <ActivityIndicator size="small" color={stage.gold} />
                      : <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: done ? stage.textMuted : stage.cream }}>{done ? tx("chatSent") : tx("share")}</Text>}
                  </View>
                </Pressable>
              );
            }}
          />
        )}
        {err ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgb(232,176,164)", paddingHorizontal: 18, marginTop: 6 }}>{err}</Text> : null}
      </GlassSurface>
    </Modal>
  );
}
