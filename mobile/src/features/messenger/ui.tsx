import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { FONT, useTheme } from "@/lib/theme";
import { Icon, type IconName } from "@/components/icons";
import { useLang } from "@/i18n";
import { mediaSource } from "@/features/talents/api";
import { TalentAvatar } from "@/features/talents/ui";
import { messengerText, type MessengerText } from "./text";
import type { Reaction, ThreadKind } from "./api";

export function useMT(): MessengerText {
  const { lang } = useLang();
  return useMemo(() => messengerText(lang), [lang]);
}

/** reactions are icons, never emojis in text */
export const REACTION_ICON: Record<Reaction, IconName> = { mashallah: "starBig", heart: "heart", dua: "hands" };
export const reactionLabel = (t: MessengerText, r: Reaction) => (r === "mashallah" ? t.r_mashallah : r === "heart" ? t.r_heart : t.r_dua);

/** a group or circle picture (sealed on the server, loaded with the sign-in header) or the person's avatar */
export function ThreadAvatar({ kind, title, photo, avatar, size = 50 }: { kind: ThreadKind; title: string; photo: string | null; avatar?: string | null; size?: number }) {
  const t = useTheme();
  const [src, setSrc] = useState<{ uri: string; headers?: Record<string, string> } | null>(null);
  useEffect(() => { let on = true; if (photo) void mediaSource(photo).then((s) => { if (on) setSrc(s); }); else setSrc(null); return () => { on = false; }; }, [photo]);
  if (kind === "direct") return <TalentAvatar name={title} uri={avatar ?? null} size={size} />;
  return (
    <View accessible={false} style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", backgroundColor: "rgb(8,58,44)", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: t.gold }}>
      {src ? <Image source={src} style={{ width: size, height: size }} /> : <Icon name={kind === "circle" ? "book" : "users"} size={size * 0.44} color="#E2C77F" />}
    </View>
  );
}

/** an image message: loaded with the sign-in header, opens full size on tap */
export function ImageBubble({ path, onOpen }: { path: string; onOpen?: (src: { uri: string; headers?: Record<string, string> }) => void }) {
  const t = useTheme();
  const [src, setSrc] = useState<{ uri: string; headers?: Record<string, string> } | null>(null);
  const [ratio, setRatio] = useState(4 / 3);
  useEffect(() => { let on = true; void mediaSource(path).then((s) => { if (on) setSrc(s); }); return () => { on = false; }; }, [path]);
  return (
    <Pressable onPress={() => src && onOpen?.(src)} accessibilityRole="imagebutton" style={{ width: 230, maxWidth: "100%", aspectRatio: ratio, borderRadius: 14, overflow: "hidden", backgroundColor: t.line }}>
      {src ? <Image source={src} resizeMode="cover" onLoad={(e) => { const s = e.nativeEvent.source; if (s?.width && s?.height) setRatio(Math.min(Math.max(s.width / s.height, 0.6), 1.8)); }} style={{ width: "100%", height: "100%" }} />
        : <ActivityIndicator style={{ flex: 1 }} />}
    </Pressable>
  );
}

const mmss = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

/** a voice note: play/pause, progress and length */
export function VoiceBubble({ path, durationMs, mine, labels }: { path: string; durationMs: number | null; mine: boolean; labels: { play: string; pause: string; voice: string } }) {
  const [src, setSrc] = useState<{ uri: string; headers?: Record<string, string> } | null>(null);
  useEffect(() => { let on = true; void mediaSource(path).then((s) => { if (on) setSrc(s); }); return () => { on = false; }; }, [path]);
  const player = useAudioPlayer(src);
  const st = useAudioPlayerStatus(player);
  const total = (st.duration ? st.duration * 1000 : 0) || durationMs || 0;
  const pos = (st.currentTime ?? 0) * 1000;
  const color = mine ? "#ffffff" : "rgb(6,108,78)";
  const toggle = async () => {
    if (!src) return;
    if (st.playing) { player.pause(); return; }
    await setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
    if (st.didJustFinish || (total && pos >= total - 200)) await player.seekTo(0);
    player.play();
  };
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minWidth: 190 }}>
      <Pressable onPress={() => void toggle()} accessibilityRole="button" accessibilityLabel={`${st.playing ? labels.pause : labels.play}, ${labels.voice}, ${mmss(total)}`}
        style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: mine ? "rgba(255,255,255,0.18)" : "rgba(6,108,78,0.12)" }}>
        <Icon name={st.playing ? "pause" : "play"} size={16} color={color} />
      </Pressable>
      <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: mine ? "rgba(255,255,255,0.25)" : "rgba(6,108,78,0.18)" }}>
        <View style={{ width: `${total ? Math.min(100, (pos / total) * 100) : 0}%`, height: 4, borderRadius: 2, backgroundColor: color }} />
      </View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: mine ? "rgba(255,255,255,0.8)" : "rgb(90,103,98)", minWidth: 34 }}>{mmss(st.playing ? pos : total)}</Text>
    </View>
  );
}

/** the reaction counts under a bubble */
export function ReactionRow({ reactions, mine: myReaction, onPress, t }: { reactions: Partial<Record<Reaction, number>>; mine: Reaction | null; onPress: (r: Reaction) => void; t: MessengerText }) {
  const th = useTheme();
  const list = (Object.keys(reactions) as Reaction[]).filter((r) => (reactions[r] ?? 0) > 0);
  if (!list.length) return null;
  return (
    <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
      {list.map((r) => (
        <Pressable key={r} onPress={() => onPress(r)} accessibilityRole="button" accessibilityLabel={`${reactionLabel(t, r)} ${reactions[r]}`} accessibilityState={{ selected: myReaction === r }}
          style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, height: 26, borderRadius: 13, borderWidth: 1, borderColor: myReaction === r ? th.gold : th.line, backgroundColor: th.surface }}>
          <Icon name={REACTION_ICON[r]} size={13} color={r === "heart" ? "rgb(170,60,70)" : th.gold} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: th.ink }}>{reactions[r]}</Text>
        </Pressable>
      ))}
    </View>
  );
}
