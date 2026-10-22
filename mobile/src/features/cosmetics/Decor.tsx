import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { GlassButton, GlassIconButton, GoldButton } from "@/components/brand";
import { FONT, R, useTheme } from "@/lib/theme";
import { ownedStickers, saveDecor, stickerById, useShop, type Placed } from "@/lib/shop";
import { success } from "@/features/feed/haptics";
import { StickerView } from "./art";
import { useCosmeticsText } from "./texts";
import { fill, useStoreText } from "./texts2";

// Stickers on the garden tree: an overlay over the (unchanged) tree art. The person places owned stickers on the
// crown, a branch, the arch above the tree or the ground; stickers with the name of Allah, His names or other sacred
// words go only to the crown or the arch (the server refuses anything else). Placing a sticker for the first time
// fills its slot in the pack's album; a complete album earns the collector frame.
type Spot = Placed["spot"];
const BANDS: Record<Spot, [number, number]> = { arch: [0.03, 0.1], crown: [0.12, 0.36], branch: [0.4, 0.6], ground: [0.86, 0.94] };

/** the placed stickers over the tree box (w x h); the newest one pops in with a soft glow */
export function DecorLayer({ w, h, still }: { w: number; h: number; still?: boolean }) {
  const { shop } = useShop();
  const items = shop?.me?.decor.items ?? [];
  if (!items.length) return null;
  const last = items[items.length - 1]?.id;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: w, height: h }}>
      {items.map((p, i) => {
        const st = stickerById(shop, p.id);
        if (!st) return null;
        const size = Math.round(Math.max(22, w * 0.085) * p.s);
        return <Placed key={`${p.id}-${i}`} svg={st.svg} rare={st.rare} glow={!!st.glow || st.rare} size={size} x={p.x * w - size / 2} y={p.y * h - size / 2} fresh={!still && p.id === last && i === items.length - 1} />;
      })}
      <Necklace w={w} h={h} n={items.filter((p) => p.id.startsWith("pearls-gems-")).length} />
    </View>
  );
}

/** the pearl necklace along the crown: one pearl for every gem or pearl placed (up to 24) */
function Necklace({ w, h, n }: { w: number; h: number; n: number }) {
  if (!n) return null;
  const count = Math.min(24, n * 2);
  const r = Math.max(2.5, w * 0.012);
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const tt = count === 1 ? 0.5 : i / (count - 1);
        // a gentle downward curve across the crown (quadratic, from 25 % to 75 % of the width)
        const x = (0.25 + 0.5 * tt) * w, y = (0.3 + 0.12 * 4 * tt * (1 - tt)) * h;
        return <View key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, backgroundColor: "#f6f0e2", borderWidth: 0.5, borderColor: "#c9b98f", shadowColor: "#fff3d0", shadowOpacity: 0.9, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } }} />;
      })}
    </>
  );
}

function Placed({ svg, rare, glow: lit, size, x, y, fresh }: { svg: string; rare: boolean; glow: boolean; size: number; x: number; y: number; fresh: boolean }) {
  const k = useSharedValue(fresh ? 0 : 1);
  // gems, pearls and rare stickers keep a soft glow on the tree, like lit ornaments
  const glow = useSharedValue(lit ? 0.35 : 0);
  useEffect(() => {
    if (!fresh) return;
    k.value = withSpring(1, { damping: 9, stiffness: 140 });
    glow.value = withSequence(withTiming(1, { duration: 380 }), withTiming(lit ? 0.35 : 0, { duration: 1400, easing: Easing.out(Easing.quad) }));
  }, [fresh, k, glow, lit]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: k.value }] }));
  const gl = useAnimatedStyle(() => ({ opacity: glow.value }));
  return (
    <Animated.View style={[{ position: "absolute", left: x, top: y, width: size, height: size }, st]}>
      <Animated.View style={[{ position: "absolute", left: -size * 0.25, top: -size * 0.25, width: size * 1.5, height: size * 1.5, borderRadius: size, backgroundColor: "rgba(255,226,150,0.45)" }, gl]} />
      <StickerView svg={svg} size={size} shimmer={rare} gloss={!rare} />
    </Animated.View>
  );
}

/** the sheet to place and remove stickers */
export function DecorSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const x = useCosmeticsText();
  const s = useStoreText();
  const { shop } = useShop();
  const [pick, setPick] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const owned = ownedStickers(shop);
  const items = shop?.me?.decor.items ?? [];
  const chosen = pick ? owned.find((o) => o.id === pick) : null;
  const place = async (spot: Spot) => {
    if (!chosen) return;
    if (chosen.sacred && spot !== "crown" && spot !== "arch") { setMsg(s.sacredNote); return; }
    const [a, b] = BANDS[spot];
    const n = items.length;
    // spread stickers evenly (golden-angle steps), no randomness needed
    const fx = 0.22 + ((n * 0.618) % 1) * 0.56, fy = a + ((n * 0.382) % 1) * (b - a);
    const next = [...items, { id: chosen.id, x: fx, y: fy, s: chosen.rare ? 1.25 : 1, spot }].slice(-60);
    setPick(null); setMsg(null); success();
    const r = await saveDecor(next);
    if ("error" in r) setMsg(r.error === "sacred_spot" ? s.sacredNote : x.failed);
    else if (r.reward) setMsg(s.collectorFrame);
  };
  const remove = (i: number) => void saveDecor(items.filter((_, j) => j !== i));
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{s.decorTitle}</Text>
            <GlassIconButton icon="close" label="Close" onPress={onClose} size={44} />
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 6 }}>{s.decorLead}</Text>
          {!shop?.me ? <Text style={{ marginTop: 16, fontFamily: FONT.regular, color: t.muted }}>{x.signIn}</Text> : null}
          {shop?.me && !owned.length ? (
            <View style={{ marginTop: 16, gap: 10 }}>
              <Text style={{ fontFamily: FONT.regular, color: t.muted }}>{s.noStickers}</Text>
              <GoldButton title={x.open} onPress={() => { onClose(); router.push("/sticker-store" as Href); }} />
            </View>
          ) : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {owned.map((o) => (
              <Pressable key={o.id} onPress={() => { setPick(o.id); setMsg(null); }} accessibilityRole="button" accessibilityState={{ selected: pick === o.id }} accessibilityLabel={o.ar}
                style={{ padding: 4, borderRadius: R.md, borderWidth: 2, borderColor: pick === o.id ? t.gold : "transparent" }}>
                <StickerView svg={o.svg} size={52} shimmer={o.rare} />
              </Pressable>
            ))}
          </View>
          {chosen ? (
            <View style={{ marginTop: 16, gap: 8 }}>
              {chosen.sacred ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold }}>{s.sacredNote}</Text> : null}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {(["crown", "arch", "branch", "ground"] as Spot[]).filter((sp) => !chosen.sacred || sp === "crown" || sp === "arch").map((sp) => (
                  <GlassButton key={sp} compact title={sp === "crown" ? s.spotCrown : sp === "arch" ? s.spotArch : sp === "branch" ? s.spotBranch : s.spotGround} onPress={() => void place(sp)} />
                ))}
              </View>
            </View>
          ) : null}
          {msg ? <Text accessibilityLiveRegion="polite" style={{ marginTop: 12, fontFamily: FONT.semibold, color: t.gold }}>{msg}</Text> : null}
          {items.length ? (
            <View style={{ marginTop: 24, gap: 8 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: t.gold }}>{fill(s.collectionLine, { done: new Set(shop?.me?.decor.collected ?? []).size, total: owned.length, complete: "" }).split("·")[0]}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {items.map((p, i) => {
                  const st = stickerById(shop, p.id);
                  return st ? (
                    <Pressable key={`${p.id}-${i}`} onPress={() => remove(i)} accessibilityRole="button" accessibilityLabel={`${s.remove}: ${st.ar}`} style={{ alignItems: "center" }}>
                      <StickerView svg={st.svg} size={40} />
                      <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{s.remove}</Text>
                    </Pressable>
                  ) : null;
                })}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
