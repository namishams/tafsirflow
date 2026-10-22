import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Animated, Image, PanResponder, Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { FONT, useTheme } from "@/lib/theme";
import { Icon, type IconName } from "@/components/icons";
import { useLang } from "@/i18n";
import { mediaSource } from "@/features/talents/api";
import { LevelBadge, TalentAvatar } from "@/features/talents/ui";
import { BadgeButton } from "@/features/talents/badges";
import type { Level } from "@/features/talents/api";
import { countryName } from "@/lib/countries";
import { tick } from "@/features/feed/haptics";
import { fill, messengerText, type MessengerText } from "./text";
import { shareHref, type Person, type Reaction, type ShareCard, type ShareType, type ThreadKind } from "./api";

export function useMT(): MessengerText {
  const { lang } = useLang();
  return useMemo(() => messengerText(lang), [lang]);
}

/** reactions are icons, never emojis in text */
export const REACTION_ICON: Record<Reaction, IconName> = { mashallah: "starBig", heart: "heart", dua: "hands" };
export const reactionLabel = (t: MessengerText, r: Reaction) => (r === "mashallah" ? t.r_mashallah : r === "heart" ? t.r_heart : t.r_dua);

/** a group or circle picture (sealed on the server, loaded with the sign-in header) or the person's avatar */
export function ThreadAvatar({ kind, title, photo, avatar, frame, size = 50 }: { kind: ThreadKind; title: string; photo: string | null; avatar?: string | null; frame?: string | null; size?: number }) {
  const t = useTheme();
  const [src, setSrc] = useState<{ uri: string; headers?: Record<string, string> } | null>(null);
  useEffect(() => { let on = true; if (photo) void mediaSource(photo).then((s) => { if (on) setSrc(s); }); else setSrc(null); return () => { on = false; }; }, [photo]);
  if (kind === "direct") return <TalentAvatar name={title} uri={avatar ?? null} size={size} frame={frame} />;
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

/** the bars of a voice note: measured while recording (0-9 per bar), or an even placeholder for old notes */
export function waveBars(wave: string | null | undefined, id: string, n = 32): number[] {
  if (wave && /^[0-9]+$/.test(wave)) {
    const src = wave.split("").map(Number);
    return Array.from({ length: n }, (_, i) => src[Math.min(src.length - 1, Math.floor((i / n) * src.length))]);
  }
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Array.from({ length: n }, (_, i) => 3 + ((h >> (i % 24)) & 3));
}

/** a voice note: play/pause, waveform with progress and length */
export function VoiceBubble({ path, durationMs, mine, labels, wave, id = path }: { path: string; durationMs: number | null; mine: boolean; labels: { play: string; pause: string; voice: string }; wave?: string | null; id?: string }) {
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
      <View accessible={false} style={{ flex: 1, height: 30, flexDirection: "row", alignItems: "center", gap: 2 }}>
        {waveBars(wave, id).map((v, i, all) => {
          const done = total ? i / all.length <= pos / total : false;
          return <View key={i} style={{ flex: 1, height: 4 + v * 2.6, borderRadius: 2, backgroundColor: done ? color : mine ? "rgba(255,255,255,0.35)" : "rgba(6,108,78,0.25)" }} />;
        })}
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

/** swipe a message sideways to answer it (like Instagram); a light tick when the reply is armed */
export function SwipeToReply({ onReply, mine, enabled, children }: { onReply: () => void; mine: boolean; enabled: boolean; children: ReactNode }) {
  const th = useTheme();
  const x = useRef(new Animated.Value(0)).current;
  const armed = useRef(false);
  const dir = mine ? -1 : 1;
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => enabled && Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 2 && g.dx * dir > 0,
    onPanResponderMove: (_, g) => {
      const d = Math.max(0, Math.min(80, g.dx * dir));
      x.setValue(d * dir);
      if (d > 56 && !armed.current) { armed.current = true; tick(); }
      if (d <= 56) armed.current = false;
    },
    onPanResponderRelease: () => { if (armed.current) onReply(); armed.current = false; Animated.spring(x, { toValue: 0, useNativeDriver: true }).start(); },
    onPanResponderTerminate: () => { armed.current = false; Animated.spring(x, { toValue: 0, useNativeDriver: true }).start(); },
  }), [enabled, dir, onReply, x]);
  const iconOpacity = x.interpolate({ inputRange: mine ? [-80, -20, 0] : [0, 20, 80], outputRange: mine ? [1, 0, 0] : [0, 0, 1] });
  return (
    <View>
      <Animated.View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, [mine ? "right" : "left"]: 4, justifyContent: "center", opacity: iconOpacity }}>
        <Icon name="reply" size={18} color={th.gold} />
      </Animated.View>
      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: x }] }}>{children}</Animated.View>
    </View>
  );
}

/** a view-once photo or video: "Tippen zum Ansehen" for the recipient, "Geöffnet" once opened */
export function ViewOnceBubble({ video, opened, canOpen, mine, t, onOpen }: { video: boolean; opened: boolean; canOpen: boolean; mine: boolean; t: MessengerText; onOpen: () => void }) {
  const th = useTheme();
  const fg = mine ? "#ffffff" : th.ink;
  const status = opened ? t.opened : canOpen ? t.tapToView : video ? t.viewOnceVideo : t.viewOncePhoto;
  return (
    <Pressable onPress={canOpen ? onOpen : undefined} disabled={!canOpen} accessibilityRole={canOpen ? "button" : "text"}
      accessibilityLabel={`${video ? t.viewOnceVideo : t.viewOncePhoto}, ${status}`}
      style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44, minWidth: 190 }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderStyle: opened ? "dashed" : "solid", borderColor: mine ? "#E2C77F" : th.gold }}>
        <Icon name={video ? "reels" : "eye"} size={16} color={mine ? "#E2C77F" : th.gold} />
      </View>
      <View style={{ flexShrink: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: fg }}>{video ? t.viewOnceVideo : t.viewOncePhoto}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: mine ? "rgba(255,255,255,0.7)" : th.muted }}>{status}</Text>
      </View>
    </Pressable>
  );
}

/** a video message: a dark tile with play and length; opens full screen */
export function VideoTile({ durationMs, label, onOpen }: { durationMs: number | null; label: string; onOpen: () => void }) {
  return (
    <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${label}, ${mmss(durationMs ?? 0)}`}
      style={{ width: 230, maxWidth: "100%", aspectRatio: 4 / 3, borderRadius: 14, backgroundColor: "rgb(6,30,23)", alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.16)" }}>
        <Icon name="play" size={22} color="#ffffff" />
      </View>
      {durationMs ? <Text style={{ position: "absolute", right: 10, bottom: 8, fontFamily: FONT.semibold, fontSize: 12, color: "#ffffff" }}>{mmss(durationMs)}</Text> : null}
    </Pressable>
  );
}

const CARD_ICON: Record<ShareType, IconName> = { verse: "book", surah: "book", course: "cap", carousel: "grid", profile: "user", post: "reels" };
export const cardLabel = (t: MessengerText, type: ShareType) => t[`card_${type}` as keyof MessengerText] as string;

/** a shared verse, surah, course, carousel, profile or feed post; opens inside the app */
export function ShareCardBubble({ card, mine, t }: { card: ShareCard; mine: boolean; t: MessengerText }) {
  const th = useTheme();
  return (
    <Pressable onPress={() => router.push(card.url as Href)} accessibilityRole="link" accessibilityLabel={`${cardLabel(t, card.type)}: ${card.title}${card.subtitle ? `, ${card.subtitle}` : ""}`}
      style={({ pressed }) => ({ flexDirection: "row", gap: 10, padding: 10, minWidth: 210, borderRadius: 14, opacity: pressed ? 0.8 : 1,
        backgroundColor: mine ? "rgba(255,255,255,0.1)" : th.bg, borderWidth: 1, borderColor: mine ? "rgba(226,199,127,0.4)" : th.line })}>
      <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgb(8,58,44)", borderWidth: 1, borderColor: "#E2C77F" }}>
        <Icon name={CARD_ICON[card.type]} size={18} color="#E2C77F" />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 0.4, color: mine ? "#E2C77F" : th.gold }}>{cardLabel(t, card.type)}</Text>
        <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 15, color: mine ? "#ffffff" : th.ink }}>{card.title}</Text>
        {card.subtitle ? <Text numberOfLines={3} style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: mine ? "rgba(255,255,255,0.75)" : th.muted }}>{card.subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

/** the profile mini card at the top of a one-to-one chat (Instagram style): avatar, name, @username, badge, country, level, mutual friends */
export function ProfileMiniCard({ who, card, active, t }: { who: Person; card: { country: string | null; level: string; mutual: number } | null | undefined; active: boolean; t: MessengerText }) {
  const th = useTheme();
  const { lang } = useLang();
  const meta = [card?.mutual ? fill(t.mutual, card.mutual) : ""].filter(Boolean).join(" · ");
  return (
    <Pressable onPress={() => router.push(`/talents/u/${who.username}` as Href)} accessibilityRole="link"
      accessibilityLabel={`${who.name}, @${who.username}${active ? `, ${t.activeNow}` : ""}${card?.country ? `, ${countryName(card.country, lang)}` : ""}${meta ? `, ${meta}` : ""}. ${t.viewProfile}`}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minHeight: 56 }}>
      <View>
        <TalentAvatar name={who.name} uri={who.avatar} size={48} />
        {active ? <View style={{ position: "absolute", right: 0, bottom: 1, width: 14, height: 14, borderRadius: 7, backgroundColor: "rgb(46,170,110)", borderWidth: 2.5, borderColor: th.bg }} /> : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 16, color: th.ink }}>{who.name}</Text>
          <BadgeButton badge={who.badge} size={15} />
          {card?.country ? (
            <View style={{ paddingHorizontal: 5, height: 16, borderRadius: 3, borderWidth: 1, borderColor: th.line, justifyContent: "center" }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 0.5, color: th.muted }}>{card.country}</Text>
            </View>
          ) : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 13, color: th.muted }}>@{who.username}</Text>
          {card ? <LevelBadge level={(card.level as Level) ?? "talent"} /> : null}
        </View>
        {active || meta ? <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12.5, color: active ? "rgb(46,150,100)" : th.muted }}>{[active ? t.activeNow : "", meta].filter(Boolean).join(" · ")}</Text> : null}
      </View>
    </Pressable>
  );
}

/** "In Chat senden": opens the chat picker for a card (16+; the screen explains when messaging is not available) */
export function ChatShareButton({ card, label }: { card: ShareCard; label?: string }) {
  const th = useTheme();
  const t = useMT();
  return (
    <Pressable onPress={() => router.push(shareHref(card) as Href)} accessibilityRole="button" accessibilityLabel={label ?? t.shareToChat}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, borderColor: th.gold, opacity: pressed ? 0.7 : 1 })}>
      <Icon name="comment" size={17} color={th.gold} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: th.ink }}>{label ?? t.shareToChat}</Text>
    </Pressable>
  );
}
