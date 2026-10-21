import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, FlatList, Modal, Pressable, Text, View, useWindowDimensions, type ListRenderItemInfo } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { FONT, GOLD_FOIL, R, TONES, goldButton, stage } from "@/lib/theme";
import { Icon, type IconName } from "@/components/icons";
import { Loading } from "@/components/page";
import { useLang } from "@/i18n";
import { BadgeButton } from "./badges";
import { Muted, TalentAvatar, useTalentErr } from "./ui";
import { sijillApi, type Moment, type Reaction } from "@/features/sijill/api";
import { useMomentText } from "@/features/sijill/Moments";
import { useST, type SKey } from "@/features/sijill/text";
import { usePT, type PKey } from "./profileText";

// Achievement "posts" of the talent profile (owner, 21.10.2026: "like Instagram / early TikTok, only the likes are
// MashaAllahs"): a three-column grid of generated achievement cards with a gold heart and the MashaAllah count, and a
// full-screen vertical feed of the same moments. The gold heart is the MashaAllah (reaction "like"; the older preset
// "MashaAllah" counts towards it); double-tap says MashaAllah with a short heart burst and a haptic tap (the burst is
// skipped with Reduce Motion). Barakallahu fik and Allahumma barik stay as preset encouragements; never free text.

/** MashaAllah count of a moment: gold hearts plus the preset "MashaAllah" */
export const maOf = (m: Moment) => (m.counts.like ?? 0) + (m.counts.mashallah ?? 0);
const isMa = (r: Reaction | null) => r === "like" || r === "mashallah";

const ICON: Record<Moment["kind"], IconName> = {
  certificate: "starBig", exam: "checkCircle", level: "trophy", hifz: "trophy", juz: "book", tree: "sun", sticker: "grid", streak: "flame", course: "cap",
};
const TONE: Record<Moment["kind"], [string, string]> = {
  certificate: TONES[1], exam: TONES[0], level: TONES[3], hifz: TONES[4], juz: TONES[6], tree: TONES[5], sticker: TONES[1], streak: TONES[4], course: TONES[2],
};
const legendary = (m: Moment) => m.kind === "sticker" && typeof m.data?.id === "string";
/** the big figure on a card (juz number, level, streak days, score) */
function figure(m: Moment): string {
  const d = m.data ?? {};
  if (m.kind === "certificate" || m.kind === "exam") return typeof d.pct === "number" && d.pct > 0 ? `${d.pct}%` : "";
  if (["level", "juz", "tree", "streak", "hifz"].includes(m.kind)) return Number(d.n) ? String(d.n) : "";
  return "";
}

const compact = (n: number, lang: string) => {
  try { return Intl.NumberFormat(lang, { notation: n >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n); } catch { return String(n); }
};

/** the generated card of one achievement (grid tile and feed poster share it) */
function MomentArt({ m, size, big, edge }: { m: Moment; size: number; big?: boolean; /** edge-to-edge grid tile: no inner frame */ edge?: boolean }) {
  const pt = usePT();
  const text = useMomentText();
  const fig = figure(m);
  const leg = legendary(m);
  const seal = Math.round(size * (big ? 0.3 : 0.34));
  return (
    <LinearGradient colors={leg ? ["#4a3a12", "#120e06"] : TONE[m.kind]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
      style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: big ? 28 : 8, gap: big ? 14 : 5 }}>
      {/* hairline gold frame */}
      {edge ? null : <View pointerEvents="none" style={{ position: "absolute", top: big ? 14 : 5, left: big ? 14 : 5, right: big ? 14 : 5, bottom: big ? 14 : 5, borderRadius: big ? R.card : 4, borderWidth: 1, borderColor: leg ? goldButton.from : "rgba(214,180,108,0.45)" }} />}
      <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: big ? 14 : 9.5, letterSpacing: 0.3, color: stage.gold }}>
        {leg ? pt("legendary") : pt(`kind_${m.kind}` as PKey)}
      </Text>
      <LinearGradient colors={[GOLD_FOIL[0], GOLD_FOIL[1], GOLD_FOIL[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ width: seal, height: seal, borderRadius: seal / 2, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: seal - 6, height: seal - 6, borderRadius: (seal - 6) / 2, backgroundColor: stage.bg, alignItems: "center", justifyContent: "center" }}>
          {fig ? <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: FONT.display, fontSize: seal * 0.36, color: stage.cream }}>{fig}</Text>
            : <Icon name={ICON[m.kind]} color={goldButton.from} size={seal * 0.42} />}
        </View>
      </LinearGradient>
      <Text numberOfLines={big ? 4 : 2} style={{ textAlign: "center", fontFamily: big ? FONT.display : FONT.semibold, fontSize: big ? 24 : 10.5, lineHeight: big ? 31 : 13.5, color: stage.text }}>
        {text(m)}
      </Text>
    </LinearGradient>
  );
}

/** Instagram grid: 3 columns, 4:5 tiles, heart + MashaAllah count on each. `edge` (TikTok profile): edge to edge,
 * 1 px gaps, square corners, 3:4 tiles; the heart and the count sit bottom-left like TikTok's view count */
export function MomentGrid({ moments, onOpen, empty, width, edge }: { moments: Moment[] | null; onOpen: (index: number) => void; empty: React.ReactNode; width: number; edge?: boolean }) {
  const pt = usePT();
  const text = useMomentText();
  const { lang } = useLang();
  if (!moments) return <Loading />;
  if (!moments.length) return <>{empty}</>;
  const gap = edge ? 1 : 2;
  const w = Math.floor((width - gap * 2) / 3);
  // the third column takes the rest, so an edge-to-edge grid has no gap at the right
  const wOf = (i: number) => (edge && i % 3 === 2 ? width - gap * 2 - w * 2 : w);
  const h = Math.round(w * (edge ? 4 / 3 : 1.25));
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
      {moments.map((m, i) => {
        const n = maOf(m);
        return (
          <Pressable key={m.id} onPress={() => onOpen(i)} accessibilityRole="button" accessibilityLabel={`${text(m)}, ${pt("maCount", { n })}`}
            style={({ pressed }) => ({ width: wOf(i), height: h, borderRadius: edge ? 0 : 3, overflow: "hidden", opacity: pressed ? 0.85 : 1 })}>
            <MomentArt m={m} size={w} edge={edge} />
            {edge ? <LinearGradient pointerEvents="none" colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.45)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 38 }} /> : null}
            <View style={{ position: "absolute", left: 7, bottom: 6, flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Icon name="heart" filled={n > 0 || isMa(m.mine)} color={n > 0 || isMa(m.mine) ? goldButton.from : "#fff"} size={12} />
              <Text style={{ fontFamily: FONT.bold, fontSize: 11.5, color: "#fff", textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: 3 }}>{compact(n, lang)}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** TikTok-style full-screen vertical feed of one member's moments */
export function MomentFeed({ visible, moments, start, username, more, onClose, onChange, onMore }: {
  visible: boolean; moments: Moment[]; start: number; username: string; more: string | null;
  onClose: () => void; onChange: (m: Moment) => void; onMore: (list: Moment[], more: string | null) => void;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pt = usePT();
  const { lang } = useLang();
  const loading = useRef(false);
  const loadMore = async () => {
    if (!more || loading.current) return;
    loading.current = true;
    try { const d = await sijillApi.moments({ scope: "user", u: username, before: more, locale: lang }); onMore(d.moments, d.more); } catch { /* keep what is there */ } finally { loading.current = false; }
  };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose} supportedOrientations={["portrait", "landscape"]}>
      <View style={{ flex: 1, backgroundColor: stage.deep }}>
        <FlatList data={moments} keyExtractor={(m) => m.id} pagingEnabled showsVerticalScrollIndicator={false} initialScrollIndex={Math.min(start, Math.max(0, moments.length - 1))}
          getItemLayout={(_, i) => ({ length: height, offset: height * i, index: i })} onEndReached={() => void loadMore()} onEndReachedThreshold={1.5}
          renderItem={({ item, index }: ListRenderItemInfo<Moment>) => (
            <FeedItem m={item} width={width} height={height} top={insets.top} bottom={insets.bottom} label={pt("momentOf", { n: index + 1, m: moments.length })} onChange={onChange} />
          )} />
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={pt("close")} hitSlop={10}
          style={{ position: "absolute", top: insets.top + 8, left: 14, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" }}>
          <Icon name="close" color="#fff" size={20} />
        </Pressable>
      </View>
    </Modal>
  );
}

function FeedItem({ m, width, height, top, bottom, label, onChange }: { m: Moment; width: number; height: number; top: number; bottom: number; label: string; onChange: (m: Moment) => void }) {
  const pt = usePT();
  const st = useST();
  const err = useTalentErr();
  const { lang } = useLang();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [reduce, setReduce] = useState(false);
  const burst = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);
  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => undefined); }, []);

  const react = async (r: Reaction | null) => {
    if (m.own || busy) return;
    setBusy(true); setMsg("");
    try {
      const d = await sijillApi.react(m.id, r);
      onChange({ ...m, mine: d.mine, counts: d.counts, total: d.total });
    } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  const showBurst = () => {
    if (reduce) return;
    burst.setValue(0);
    Animated.sequence([
      Animated.spring(burst, { toValue: 1, useNativeDriver: true, friction: 4, tension: 160 }),
      Animated.timing(burst, { toValue: 2, duration: 260, delay: 220, useNativeDriver: true }),
    ]).start();
  };
  const sayMa = (fromDoubleTap: boolean) => {
    if (m.own) return;
    if (isMa(m.mine)) { if (!fromDoubleTap) void react(null); else showBurst(); return; }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    showBurst();
    void react("like");
  };
  const onTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) { lastTap.current = 0; sayMa(true); } else lastTap.current = now;
  };

  const n = maOf(m);
  const on = isMa(m.mine);
  const card = Math.min(width - 48, 420, (height - top - bottom) * 0.62 * 0.8);
  const scale = burst.interpolate({ inputRange: [0, 1, 2], outputRange: [0.3, 1.15, 1.35] });
  const opacity = burst.interpolate({ inputRange: [0, 0.2, 1, 2], outputRange: [0, 1, 1, 0] });
  const side = (r: Reaction) => {
    const sel = m.mine === r, c = m.counts[r] ?? 0;
    const name = st(`react_${r}` as SKey);
    return (
      <Pressable key={r} onPress={() => void react(sel ? null : r)} disabled={m.own || busy} accessibilityRole="button" accessibilityState={{ selected: sel, disabled: m.own }}
        accessibilityLabel={`${sel ? st("removeReaction") : name}${c ? `, ${c}` : ""}`}
        style={{ minHeight: 40, maxWidth: 110, paddingHorizontal: 10, borderRadius: R.pill, borderWidth: 1, alignItems: "center", justifyContent: "center",
          borderColor: sel ? goldButton.from : "rgba(255,255,255,0.35)", backgroundColor: sel ? "rgba(214,180,108,0.25)" : "rgba(0,0,0,0.25)" }}>
        <Text numberOfLines={2} style={{ textAlign: "center", fontFamily: FONT.semibold, fontSize: 11.5, color: "#fff" }}>{name}{c ? ` · ${compact(c, lang)}` : ""}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ width, height, paddingTop: top + 60, paddingBottom: bottom + 20 }}>
      <Pressable onPress={onTap} accessible={false} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View accessible accessibilityLabel={`${label}. ${m.own ? pt("ownHint") : pt("doubleTap")}`} accessibilityActions={m.own ? undefined : [{ name: "activate", label: pt("sayMashaAllah") }]}
          onAccessibilityAction={() => sayMa(true)}
          style={{ width: card, height: card * 1.25, borderRadius: R.card, overflow: "hidden", borderWidth: 1, borderColor: goldButton.line }}>
          <MomentArt m={m} size={card} big />
        </View>
        <Animated.View pointerEvents="none" style={{ position: "absolute", transform: [{ scale }], opacity }}>
          <Icon name="heart" filled color={goldButton.from} size={120} />
        </Animated.View>
      </Pressable>

      {/* author and date */}
      <Pressable onPress={() => router.push(`/talents/u/${m.author.username}` as Href)} disabled={!m.author.username} accessibilityRole={m.author.username ? "link" : "text"} accessibilityLabel={m.author.name}
        style={{ position: "absolute", left: 16, right: 96, bottom: bottom + 22, flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TalentAvatar name={m.author.name} size={40} uri={m.author.avatar} badge={m.author.badge} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 15, color: "#fff" }}>{m.author.username ? `@${m.author.username}` : m.author.name}</Text>
            <BadgeButton badge={m.author.badge} size={14} />
          </View>
          {/* achievements of this device (no community profile yet) have no date */}
          {m.at ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted }}>{new Date(m.at).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" })}</Text> : null}
          {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: stage.cream }}>{msg}</Text> : null}
        </View>
      </Pressable>

      {/* TikTok action rail: MashaAllah heart and the preset encouragements */}
      <View style={{ position: "absolute", right: 12, bottom: bottom + 22, alignItems: "center", gap: 14 }}>
        <Pressable onPress={() => sayMa(false)} disabled={m.own || busy} accessibilityRole="button" accessibilityState={{ selected: on, disabled: m.own }}
          accessibilityLabel={`${on ? pt("takeBack") : pt("sayMashaAllah")}, ${pt("maCount", { n })}`} style={{ alignItems: "center", gap: 2, minWidth: 64 }}>
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" }}>
            <Icon name="heart" filled={on} color={on ? goldButton.from : "#fff"} size={30} />
          </View>
          <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: "#fff" }}>{compact(n, lang)}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: stage.gold }}>{pt("statMashaAllah")}</Text>
        </Pressable>
        {(["barakallah", "barik"] as const).map(side)}
      </View>
    </View>
  );
}

/** empty grid for the own profile: where the moments come from */
export function MomentsEmpty({ mine }: { mine: boolean }) {
  const pt = usePT();
  return mine ? (
    <View style={{ gap: 10, paddingVertical: 8 }}>
      <Muted>{pt("noMomentsMine")}</Muted>
      <Pressable onPress={() => router.push("/talents/sijill" as Href)} accessibilityRole="button" style={{ alignSelf: "center", minHeight: 44, justifyContent: "center", paddingHorizontal: 12 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.to }}>{pt("showInSijill")}</Text>
      </Pressable>
    </View>
  ) : <Muted>{pt("noMoments")}</Muted>;
}
