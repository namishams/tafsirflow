import { memo, useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useIsFocused, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/components/icons";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { StarLattice } from "@/components/brand";
import { GoldFrame, Medallion, Rule } from "./ornament";
import { openPro } from "@/lib/pro";
import { useAuth } from "@/lib/auth";
import { readJSON, writeJSON } from "@/lib/store";
import { useDuaPrice, useNamesPrice, useProPrice, withPrice } from "@/lib/purchases";
import { statPromo } from "./statsStore";
import { useFeedText } from "./texts";
import { flagOn, openDeeplink, remoteConfig } from "./remote";

// Our own products in the feed, drawn like a post with a clear "From Quran Masterclass" label (never disguised):
// the Shams Method, Pro, the personal dua and the name report. Frequency cap: none in the first 10 posts of a session, then at most one
// per ~15 posts, never two in a row; Pro users see no Pro promo (the dua and name products only now and then).
// Taps open the existing paywall / purchase screens. Impressions and taps are counted locally (statsStore).

export type PromoId = "shams" | "pro" | "dua" | "name";
// The remote config (website /api/feed/config) may set the cap (every N posts, per session, per day), switch promos
// off (flags.promos) and choose / order the items; offline the local defaults below apply.
const DAY_KEY = "qmc.promo-day";
export class PromoCap {
  private last = -100;
  private turn = 0;
  private session = 0;
  /** the promo to place at feed position `index` (or null) */
  at(index: number, pro: boolean): string | null {
    if (!flagOn("promos")) return null;
    const rc = remoteConfig()?.promo;
    const cap = rc?.frequencyCap;
    const gap = Math.max(5, cap?.everyNItems ?? 15) * (pro ? 2 : 1);
    if (index < 10 || index - this.last < gap) return null;
    if (cap && this.session >= cap.maxPerSession) return null;
    const today = new Date().toDateString();
    const d = readJSON<{ day: string; n: number }>(DAY_KEY, { day: today, n: 0 });
    const n = d.day === today ? d.n : 0;
    if (cap && n >= cap.maxPerDay) return null;
    const local: string[] = pro ? ["shams", "dua", "name"] : ["shams", "pro", "dua", "name"];
    const ids = rc?.items?.length ? rc.items.map((i) => i.id).filter((id) => !(pro && id === "pro")) : local;
    if (!ids.length) return null;
    this.last = index;
    this.session++;
    writeJSON(DAY_KEY, { day: today, n: n + 1 }, true);
    return `ad:${ids[this.turn++ % ids.length]}`;
  }
}

const META: Record<PromoId, { icon: IconName; tone: [string, string] }> = {
  shams: { icon: "sun", tone: ["#0f3f3a", "#061c19"] },
  pro: { icon: "starBig", tone: ["#0c4a37", "#06221a"] },
  dua: { icon: "hands", tone: ["#13392b", "#06221a"] },
  name: { icon: "pen", tone: ["#0b3d2e", "#062a20"] },
};

export const PromoPost = memo(function PromoPost({ item, width }: { item: string; width: number }) {
  const t = useTheme();
  const tx = useFeedText();
  const id = item.slice(3) as PromoId;
  const pro = useProPrice(), dua = useDuaPrice(), names = useNamesPrice();
  useEffect(() => { statPromo(id, "imp"); }, [id]);
  const text = {
    shams: { title: tx.promoShamsTitle, body: tx.promoShamsBody, cta: tx.promoShamsCta, go: () => router.push("/shams" as Href) },
    pro: { title: tx.promoProTitle, body: tx.promoProBody, cta: withPrice(tx.promoProCta, pro), go: () => openPro("general") },
    dua: { title: tx.promoDuaTitle, body: tx.promoDuaBody, cta: withPrice(tx.promoDuaCta, dua), go: () => router.push("/dua-generator" as Href) },
    name: { title: tx.promoNameTitle, body: tx.promoNameBody, cta: withPrice(tx.promoNameCta, names), go: () => router.push("/names" as Href) },
  }[id];
  if (!text) {
    // a promo only the server knows: its title and deeplink, same labelled card
    const r = remoteConfig()?.promo.items.find((x) => x.id === id);
    if (!r) return <View style={{ height: 1 }} />;
    return <RemotePromo title={r.title} label={tx.promoLabel} onPress={() => { statPromo(id, "tap"); openDeeplink(r.deeplink); }} width={width} />;
  }
  const m = META[id];
  const open = () => { statPromo(id, "tap"); text.go(); };
  return (
    <View style={{ width, alignSelf: "center", paddingBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, height: 56 }}>
        <Medallion size={36}><Icon name={m.icon} color={stage.gold} size={16} /></Medallion>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{text.title}</Text>
          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: t.gold }}>{tx.promoLabel}</Text>
        </View>
      </View>
      <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`${text.title}. ${tx.promoLabel}`} style={({ pressed }) => ({ marginHorizontal: 12, opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}>
        <LinearGradient colors={m.tone} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ borderRadius: R.card, paddingHorizontal: 28, paddingVertical: 30, gap: 14, alignItems: "center", overflow: "hidden" }}>
          <StarLattice opacity={0.06} />
          <GoldFrame inset={8} />
          <Medallion size={64}><Icon name={m.icon} color={stage.gold} size={26} /></Medallion>
          <Rule width={72} />
          <Text style={{ fontFamily: FONT.display, fontSize: 21, letterSpacing: -0.4, lineHeight: 27, color: stage.cream, textAlign: "center" }}>{text.title}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: "rgba(255,255,255,0.78)", textAlign: "center" }}>{text.body}</Text>
          <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ marginTop: 4, height: 44, paddingHorizontal: 24, borderRadius: R.pill, justifyContent: "center" }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, letterSpacing: 0.2, color: goldButton.text }}>{text.cta}</Text>
          </LinearGradient>
        </LinearGradient>
      </Pressable>
    </View>
  );
});

function RemotePromo({ title, label, onPress, width }: { title: string; label: string; onPress: () => void; width: number }) {
  const tone: [string, string] = ["#0c4a37", "#06221a"];
  return (
    <View style={{ width, alignSelf: "center", paddingBottom: 16, paddingHorizontal: 12 }}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${label}`} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}>
        <LinearGradient colors={tone} style={{ borderRadius: R.card, padding: 28, gap: 12, alignItems: "center", overflow: "hidden" }}>
          <StarLattice opacity={0.06} />
          <GoldFrame inset={8} />
          <Medallion size={56}><Icon name="starBig" color={stage.gold} size={22} /></Medallion>
          <Text style={{ fontFamily: FONT.display, fontSize: 21, letterSpacing: -0.4, color: stage.cream, textAlign: "center" }}>{title}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: stage.gold }}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

// ---------- the account nudge (Apple 5.1.1: everything works without an account; the sheet only offers one) ----------
const NUDGE_KEY = "qmc.account-nudge-at";
const subs = new Set<() => void>();
/** ask to create an account (shown at most every 3 days, never when signed in) */
export function nudgeAccount() {
  if (Date.now() - readJSON<number>(NUDGE_KEY, 0) < 3 * 86400000) return;
  subs.forEach((f) => f());
}
export function AccountNudge() {
  const t = useTheme();
  const tx = useFeedText();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const focused = useIsFocused();
  useEffect(() => { if (!focused) return; const f = () => { if (!user) setOpen(true); }; subs.add(f); return () => { subs.delete(f); }; }, [user, focused]);
  const close = () => { writeJSON(NUDGE_KEY, Date.now(), true); setOpen(false); };
  const go = (path: "/register" | "/sign-in") => { close(); router.push(path as Href); };
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={close} accessibilityRole="button" accessibilityLabel={tx.accountLater} />
      <View style={{ backgroundColor: t.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: Math.max(insets.bottom, 18), gap: 12 }}>
        <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: t.line }} />
        <Medallion size={48}><Icon name="bookmark" color={stage.gold} size={20} /></Medallion>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{tx.accountTitle}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted }}>{tx.accountBody}</Text>
        <Pressable onPress={() => go("/register")} accessibilityRole="button" style={({ pressed }) => ({ height: 50, borderRadius: R.pill, alignItems: "center", justifyContent: "center", backgroundColor: t.accent, opacity: pressed ? 0.85 : 1 })}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.onAccent }}>{tx.accountCreate}</Text>
        </Pressable>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text onPress={() => go("/sign-in")} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent, paddingVertical: 10 }}>{tx.accountSignIn}</Text>
          <Text onPress={close} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.muted, paddingVertical: 10 }}>{tx.accountLater}</Text>
        </View>
      </View>
    </Modal>
  );
}
