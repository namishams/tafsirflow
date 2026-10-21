import { memo, useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as WebBrowser from "expo-web-browser";
import { router, type Href } from "expo-router";
import { Icon, type IconName } from "@/components/icons";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { SITE } from "@/lib/api";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { openPro } from "@/lib/pro";
import { readJSON, writeJSON } from "@/lib/store";
import { useNamesPrice, useProPrice, withPrice } from "@/lib/purchases";
import { guessTopic } from "@/web/duaGenerator";
import { LIB } from "./library";
import { remoteConfig, type FeedMonetize } from "./remote";
import { currentStreak, statOffer, totals } from "./statsStore";
import { fillText, useFeedText, type FeedText } from "./texts";

// How the feed earns its keep, without ads and without pressure (App Store 3.1.1 / 3.1.2):
// - contextual offers: one quiet line under a fitting post (dua → personal dua for that topic, names → name report,
//   verse/word/quiz → Shams lesson, the reciters post → more reciters with Pro)
// - Pro-only posts mixed in: a blurred preview with a lock; free users may open a few per day, Pro users see them open
// - when the free premium posts of the day are used up: one paywall card in the stream (never a modal), with the
//   benefits, the real store price, the trial only if the server says the store offers it, restore, terms, privacy
// - celebration cards at real milestones (7-day streak, 20 words, 5 saves) and a dua offer after sharing a hadith/dua
// Prices always come from the store (no price shown before it answers); no countdowns, no "discounts".
// Every number and switch can be set by the server (config.json → monetize); the defaults below apply offline.

const DEFAULTS = {
  variants: ["a"],
  context: { everyNItems: 6, maxPerSession: 4 },
  premium: { everyNItems: 20, maxPerSession: 3, freePerDay: 2, kinds: ["tafsir-deep", "all-reciters", "root-deep", "stories"] },
  paywall: { maxPerSession: 1, trialDays: 0 },
  moments: { streakDays: 7, words: 20, saves: 5 },
};
const mc = (): FeedMonetize => remoteConfig()?.monetize ?? {};
const cfg = () => {
  const m = mc();
  return {
    context: { ...DEFAULTS.context, ...m.context },
    premium: { ...DEFAULTS.premium, ...m.premium },
    paywall: { ...DEFAULTS.paywall, ...m.paywall },
    moments: { ...DEFAULTS.moments, ...m.moments },
  };
};
export const offerOn = (id: string) => mc().offers?.[id] ?? true;

// ---------- A/B variant, kept per install ----------
const VARIANT_KEY = "qmc.ab-variant";
export function variant(): string {
  const list = mc().variants?.length ? mc().variants! : DEFAULTS.variants;
  const cur = readJSON<string | null>(VARIANT_KEY, null);
  if (cur && list.includes(cur)) return cur;
  const v = list[Math.floor(Math.random() * list.length)];
  writeJSON(VARIANT_KEY, v, true);
  return v;
}

// ---------- funnel: impressions, taps and purchases attributed to the last tapped offer (30 minutes) ----------
const LAST_KEY = "qmc.offer-last";
export const offerImp = (id: string) => statOffer(id, variant(), "imp");
export function offerTap(id: string) {
  const v = variant();
  statOffer(id, v, "tap");
  writeJSON(LAST_KEY, { id, v, at: Date.now() }, true);
}
/** call with the Pro state: when it turns on shortly after an offer tap, that offer gets the purchase */
export function usePurchaseAttribution(pro: boolean) {
  const was = useRef(pro);
  useEffect(() => {
    if (pro && !was.current) {
      const l = readJSON<{ id: string; v: string; at: number } | null>(LAST_KEY, null);
      if (l && Date.now() - l.at < 30 * 60000) { statOffer(l.id, l.v, "buy"); writeJSON(LAST_KEY, null, true); }
    }
    was.current = pro;
  }, [pro]);
}

// ---------- free premium posts per day ----------
const FREE_KEY = "qmc.premium-free";
const today = () => new Date().toDateString();
export function premiumLeft(): number {
  const d = readJSON<{ day: string; n: number }>(FREE_KEY, { day: today(), n: 0 });
  return Math.max(0, cfg().premium.freePerDay - (d.day === today() ? d.n : 0));
}
function spendPremiumFree() {
  const d = readJSON<{ day: string; n: number }>(FREE_KEY, { day: today(), n: 0 });
  writeJSON(FREE_KEY, { day: today(), n: (d.day === today() ? d.n : 0) + 1 }, true);
  if (premiumLeft() === 0) paywallDue = true;
}
let paywallDue = false;

// ---------- celebration moments (each once per install) ----------
const MOMENTS_KEY = "qmc.moments-shown";
let shareDue = false;
/** after sharing a hadith or a dua: the next feed batch carries the personal dua card */
export const markShareMoment = () => { if (offerOn("moment-share")) shareDue = true; };
function dueMoment(): string | null {
  const shown = readJSON<string[]>(MOMENTS_KEY, []);
  const m = cfg().moments;
  const t = totals();
  const n: [string, boolean][] = [
    ["moment-streak", currentStreak() >= m.streakDays],
    ["moment-words", t.words >= m.words],
    ["moment-saves", t.saves >= m.saves],
  ];
  const hit = n.find(([id, ok]) => ok && !shown.includes(id) && offerOn(id));
  if (!hit) return null;
  writeJSON(MOMENTS_KEY, [...shown, hit[0]], true);
  return hit[0];
}

/** places Pro posts, the paywall card and the moment cards in the stream (positions count from the session start) */
export class MonetizeCap {
  private lastPremium = 0;
  private premiumN = 0;
  private paywallN = 0;
  private turn = Math.floor(Math.random() * 4);
  at(index: number, pro: boolean): string | null {
    if (shareDue && index >= 3) { shareDue = false; return `mo:moment-share`; }
    if (!pro && index >= 6 && index % 4 === 0) { const m = dueMoment(); if (m) return `mo:${m}`; }
    const c = cfg();
    if (!pro && paywallDue && offerOn("paywall") && this.paywallN < c.paywall.maxPerSession) { paywallDue = false; this.paywallN++; return `pw:${index}`; }
    if (!offerOn("premium") || !c.premium.kinds.length) return null;
    if (index < 8 || index - this.lastPremium < Math.max(5, c.premium.everyNItems) || this.premiumN >= c.premium.maxPerSession) return null;
    this.lastPremium = index;
    this.premiumN++;
    return `pp:${c.premium.kinds[this.turn++ % c.premium.kinds.length]}:${index}`;
  }
}
export const isMonetizeItem = (item: string) => /^(pp|pw|mo):/.test(item);

// ---------- contextual offers under a post ----------
type Ctx = { id: string; label: string; icon: IconName; go: () => void };
let ctxShown = 0;
let ctxLast = -100;
let ctxSeen = 0;
const ctxDecided = new Map<string, string | null>();
function contextKind(item: string, pro: boolean): string | null {
  if (LIB.has(item)) {
    const k = LIB.get(item)?.kind;
    if (k === "dua") return "context-dua";
    if (k === "asma") return "context-name";
    if (k === "tafsir" || k === "word-root" || k === "word-of-day" || k === "arabic-word") return pro ? null : "context-lesson";
    return null;
  }
  if (item.startsWith("n:")) return "context-name";
  if (/^[qdw]:/.test(item)) return pro ? null : "context-lesson";
  if (item.startsWith("r:")) return pro ? null : "context-reciters";
  return null;
}
/** the offer under this post (decided once per item, frequency-capped per session) */
function decide(item: string, pro: boolean): string | null {
  if (ctxDecided.has(item)) return ctxDecided.get(item)!;
  ctxSeen++;
  const c = cfg().context;
  const k = contextKind(item, pro);
  const ok = !!k && offerOn(k) && ctxShown < c.maxPerSession && ctxSeen - ctxLast >= c.everyNItems;
  if (ok) { ctxShown++; ctxLast = ctxSeen; }
  ctxDecided.set(item, ok ? k : null);
  if (ctxDecided.size > 400) ctxDecided.delete(ctxDecided.keys().next().value!);
  return ok ? k : null;
}

function useContext(id: string | null, item: string): Ctx | null {
  const tx = useFeedText();
  const dt = useWebT("duagen");
  const names = useNamesPrice();
  if (!id) return null;
  if (id === "context-dua") {
    const p = LIB.get(item)?.items[0];
    const tp = p ? guessTopic(`${p.title} ${p.body}`) : null;
    return { id, icon: "hands", label: tp ? fillText(tx.offerDua, { topic: dt(`t_${tp}`) }) : tx.offerDuaAny, go: () => router.push((tp ? `/dua-generator?topic=${tp}` : "/dua-generator") as Href) };
  }
  if (id === "context-name") return { id, icon: "pen", label: withPrice(tx.offerName, names), go: () => router.push("/names" as Href) };
  if (id === "context-lesson") {
    const key = item.slice(2).split(":");
    const s = Number(key[0]);
    return { id, icon: "sun", label: tx.offerLesson, go: () => router.push((Number.isInteger(s) && s > 0 ? `/shams/${s}${key[1] ? `?v=${key[1]}` : ""}` : "/shams") as Href) };
  }
  return { id, icon: "lock", label: tx.offerReciters, go: () => openPro("reciters") };
}

/** a post with its contextual offer below (if one is due) */
export function OfferWrap({ item, pro, width, children }: { item: string; pro: boolean; width: number; children: React.ReactNode }) {
  const [id] = useState(() => (isMonetizeItem(item) || item.startsWith("ad:") ? null : decide(item, pro)));
  const c = useContext(id, item);
  if (!c) return <>{children}</>;
  return (
    <View>
      {children}
      <ContextLine c={c} width={width} />
    </View>
  );
}
function ContextLine({ c, width }: { c: Ctx; width: number }) {
  const t = useTheme();
  const tx = useFeedText();
  useEffect(() => { offerImp(c.id); }, [c.id]);
  return (
    <Pressable onPress={() => { offerTap(c.id); c.go(); }} accessibilityRole="button" accessibilityLabel={`${c.label}. ${tx.promoLabel}`}
      style={({ pressed }) => ({ width: width - 24, alignSelf: "center", marginTop: -6, marginBottom: 16, minHeight: 48, paddingHorizontal: 14, borderRadius: R.pill, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, opacity: pressed ? 0.8 : 1 })}>
      <Icon name={c.icon} color={t.accent} size={17} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{c.label}</Text>
        <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted }}>{tx.promoLabel}</Text>
      </View>
      <Icon name="chevronRight" color={t.muted} size={16} />
    </Pressable>
  );
}

// ---------- Pro-only posts ----------
const PREMIUM: Record<string, { icon: IconName; title: (x: FeedText) => string; body: (x: FeedText) => string; href: string; tone: [string, string] }> = {
  "tafsir-deep": { icon: "book", title: (x) => x.premiumTafsir, body: (x) => x.premiumTafsirBody, href: "/shams", tone: ["#0b2f3d", "#1d5a6b"] },
  "all-reciters": { icon: "radio", title: (x) => x.premiumReciters, body: (x) => x.premiumRecitersBody, href: "/reciters", tone: ["#2b1f47", "#5a3e8c"] },
  "root-deep": { icon: "cap", title: (x) => x.premiumRoot, body: (x) => x.premiumRootBody, href: "/vocab", tone: ["#3d2a0b", "#8c6a1d"] },
  stories: { icon: "moon", title: (x) => x.premiumStories, body: (x) => x.premiumStoriesBody, href: "/prophet-stories", tone: ["#0b3d2e", "#1d6b52"] },
};
const proPriceLabel = (tx: FeedText, price: string | null) => (price ? fillText(tx.paywallPrice, { price }) : null);

export const PremiumPost = memo(function PremiumPost({ item, width, pro }: { item: string; width: number; pro: boolean }) {
  const t = useTheme();
  const tx = useFeedText();
  const price = useProPrice();
  const kind = item.split(":")[1];
  const p = PREMIUM[kind];
  const [left, setLeft] = useState(premiumLeft);
  useEffect(() => { if (p && !pro) offerImp("premium"); }, [p, pro]);
  if (!p) return <View style={{ height: 1 }} />;
  const open = () => router.push(p.href as Href);
  const free = () => { spendPremiumFree(); setLeft(premiumLeft()); open(); };
  const locked = !pro;
  return (
    <View style={{ width, alignSelf: "center", paddingBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, height: 56 }}>
        <LinearGradient colors={p.tone} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
          <Icon name={p.icon} color={stage.gold} size={17} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{p.title(tx)}</Text>
          <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>Pro · {tx.promoLabel}</Text>
        </View>
      </View>
      <View style={{ marginHorizontal: 12, borderRadius: R.card, overflow: "hidden" }}>
        <LinearGradient colors={p.tone} style={{ padding: 24, gap: 12, alignItems: "center", minHeight: width * 0.7, justifyContent: "center" }}>
          <Icon name={p.icon} color={stage.gold} size={40} />
          <Text style={{ fontFamily: FONT.display, fontSize: 22, color: "#fff", textAlign: "center" }}>{p.title(tx)}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: "rgba(255,255,255,0.88)", textAlign: "center" }}>{p.body(tx)}</Text>
          {!locked ? (
            <Pressable onPress={open} accessibilityRole="button" style={{ height: 46, paddingHorizontal: 22, borderRadius: R.pill, justifyContent: "center", backgroundColor: stage.gold }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: stage.bg }}>{tx.premiumOpen}</Text>
            </Pressable>
          ) : null}
        </LinearGradient>
        {locked ? (
          <BlurView intensity={Platform.OS === "ios" ? 28 : 60} tint="dark" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", gap: 12, padding: 20 }}>
            <Icon name="lock" color={stage.gold} size={34} />
            <Text style={{ fontFamily: FONT.display, fontSize: 20, color: "#fff", textAlign: "center" }}>{p.title(tx)}</Text>
            <Pressable onPress={() => { offerTap("premium"); openPro("general"); }} accessibilityRole="button"
              style={({ pressed }) => ({ minHeight: 46, paddingHorizontal: 20, borderRadius: R.pill, justifyContent: "center", backgroundColor: stage.gold, opacity: pressed ? 0.85 : 1 })}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: stage.bg, textAlign: "center" }}>{withPrice(tx.premiumUnlock, proPriceLabel(tx, price))}</Text>
            </Pressable>
            {left > 0 ? (
              <Text onPress={free} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#fff", paddingVertical: 8, textDecorationLine: "underline" }}>{fillText(tx.premiumFreeLeft, { n: left })}</Text>
            ) : null}
          </BlurView>
        ) : null}
      </View>
    </View>
  );
});

// ---------- the paywall card (a post in the stream, never a modal) ----------
export const PaywallCard = memo(function PaywallCard({ width }: { width: number }) {
  const t = useTheme();
  const tx = useFeedText();
  const { lang } = useLang();
  const price = useProPrice();
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);
  useEffect(() => { offerImp("paywall"); }, []);
  const trial = cfg().paywall.trialDays;
  const priceLine = price ? (trial > 0 ? fillText(tx.paywallTrial, { n: trial, price }) : fillText(tx.paywallPrice, { price })) : null;
  const doc = (d: "terms" | "privacy") => void WebBrowser.openBrowserAsync(`${SITE}/${lang}/legal/${d}`);
  const restore = async () => {
    const { restore: r } = await import("@/lib/iap");
    const res = await r().catch(() => "failed" as const);
    setRestoreMsg(res === "restored" ? tx.paywallRestored : tx.paywallNone);
  };
  return (
    <View style={{ width, alignSelf: "center", paddingBottom: 16, paddingHorizontal: 12 }}>
      <LinearGradient colors={["#0b3d2e", "#1d6b52"]} style={{ borderRadius: R.card, padding: 24, gap: 12 }}>
        <Icon name="starBig" color={stage.gold} size={36} />
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: "#fff" }}>{tx.paywallTitle}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: "rgba(255,255,255,0.88)" }}>{tx.paywallBody}</Text>
        {[tx.paywallB1, tx.paywallB2, tx.paywallB3, tx.paywallB4].map((b) => (
          <View key={b} style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <Icon name="check" color={stage.gold} size={16} />
            <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14.5, color: "#fff" }}>{b}</Text>
          </View>
        ))}
        {priceLine ? <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: stage.gold, marginTop: 4 }}>{priceLine}</Text> : null}
        <Pressable onPress={() => { offerTap("paywall"); openPro("general"); }} accessibilityRole="button"
          style={({ pressed }) => ({ height: 48, borderRadius: R.pill, alignItems: "center", justifyContent: "center", backgroundColor: stage.gold, opacity: pressed ? 0.85 : 1 })}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: stage.bg }}>{tx.paywallCta}</Text>
        </Pressable>
        <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 16, color: "rgba(255,255,255,0.7)" }}>{tx.paywallTerms}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {Platform.OS !== "web" ? <Text onPress={() => void restore()} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 13, color: "#fff", paddingVertical: 6 }}>{tx.paywallRestore}</Text> : null}
          <Text onPress={() => doc("terms")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 13, color: "#fff", paddingVertical: 6 }}>{tx.paywallTermsLink}</Text>
          <Text onPress={() => doc("privacy")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 13, color: "#fff", paddingVertical: 6 }}>{tx.paywallPrivacyLink}</Text>
        </View>
        {restoreMsg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 13, color: "#fff" }}>{restoreMsg}</Text> : null}
      </LinearGradient>
      <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted, marginTop: 6, textAlign: "center" }}>{tx.promoLabel}</Text>
    </View>
  );
});

// ---------- celebration cards ----------
export const MomentCard = memo(function MomentCard({ item, width }: { item: string; width: number }) {
  const tx = useFeedText();
  const id = item.slice(3);
  const m = cfg().moments;
  useEffect(() => { offerImp(id); }, [id]);
  const share = id === "moment-share";
  const title = share ? tx.momentShareTitle
    : id === "moment-streak" ? fillText(tx.momentStreak, { n: m.streakDays })
    : id === "moment-words" ? fillText(tx.momentWords, { n: m.words })
    : fillText(tx.momentSaves, { n: m.saves });
  const go = () => { offerTap(id); if (share) router.push("/dua-generator" as Href); else openPro("general"); };
  return (
    <View style={{ width, alignSelf: "center", paddingBottom: 16, paddingHorizontal: 12 }}>
      <LinearGradient colors={share ? ["#2b1f47", "#5a3e8c"] : ["#3d2a0b", "#8c6a1d"]} style={{ borderRadius: R.card, padding: 24, gap: 12, alignItems: "center" }}>
        <Icon name={share ? "hands" : id === "moment-streak" ? "flame" : "trophy"} color={stage.gold} size={40} />
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, color: "#fff", textAlign: "center" }}>{title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: "rgba(255,255,255,0.88)", textAlign: "center" }}>{share ? tx.momentShareBody : tx.momentBody}</Text>
        <Pressable onPress={go} accessibilityRole="button" style={({ pressed }) => ({ minHeight: 46, paddingHorizontal: 22, borderRadius: R.pill, justifyContent: "center", backgroundColor: stage.gold, opacity: pressed ? 0.85 : 1 })}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: stage.bg }}>{share ? tx.offerDuaAny : tx.paywallCta}</Text>
        </Pressable>
        <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: "rgba(255,255,255,0.7)" }}>{tx.promoLabel}</Text>
      </LinearGradient>
    </View>
  );
});
