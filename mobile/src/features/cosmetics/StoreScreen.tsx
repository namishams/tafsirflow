import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { GlassButton, GlassCard, GlassIconButton, GoldButton, OutlineButton, TextLink } from "@/components/brand";
import { Page, PageHero } from "@/components/page";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useIdentity } from "@/lib/identity";
import { readTradition, showsShia } from "@/lib/tradition";
import {
  frameProduct, numberOf, owns, ownsFrame, ownsPack, ownsRare, refreshShop, reserveUnique, sendGift, setBoardOptIn, setFrame, setShowcase, takeProPack, titleOf, useShop, type Shop, type ShopPack, type ShopRare,
} from "@/lib/shop";
import { FramePreview, NumberPlate, StickerView } from "./art";
import { useLuxText } from "./texts3";
import { api } from "@/lib/api";
import { useEffect } from "react";
import { useBuy, useStorePrices } from "./buy";
import { fillN, useCosmeticsText, type CosmeticsText } from "./texts";
import { fill, useStoreText, type StoreKey } from "./texts2";

// /sticker-store – sticker packs (albums), rare stickers and profile frames. Every pack shows all of its stickers
// before purchase; nothing is random, nothing expires, no countdowns. Prices only from the App Store: a buy button
// appears once the store has answered. Pro takes one pack per month (it stays theirs); the rest is bought.
type Tab = "packs" | "rare" | "frames";

const PACK_KEY: Record<string, StoreKey> = {
  "islamic-art": "packIslamicArt", "asma-ul-husna": "packNames", "hajj-days": "packHajj", muharram: "packMuharram",
  "rose-garden": "packRose", "hijab-elegance": "packHijab", "henna-arabesque": "packHenna", "pearls-lanterns": "packPearls", "strong-women": "packWomen",
};
export function usePackTitle() {
  const { lang } = useLang();
  const x = useCosmeticsText();
  const s = useStoreText();
  return (p: Pick<ShopPack, "slug" | "title">) =>
    (x.packs as Record<string, [string, string]>)[p.slug]?.[0] ?? (PACK_KEY[p.slug] ? s[PACK_KEY[p.slug]] : titleOf(p.title, lang));
}
const frameName = (x: CosmeticsText, s: Record<StoreKey, string>, slug: string) =>
  slug === "collector" ? s.collectorFrame : slug === "rose-garden" ? s.frameRose : (x.frames as Record<string, string>)[slug] ?? slug;

export default function StoreScreen() {
  const t = useTheme();
  const x = useCosmeticsText();
  const s = useStoreText();
  const { pack: openSlug } = useLocalSearchParams<{ pack?: string }>();
  const { shop } = useShop();
  const id = useIdentity();
  const [tab, setTab] = useState<Tab>("packs");
  const [open, setOpen] = useState<string | null>(openSlug ?? null);
  const { buy, busy, msg, restore } = useBuy();
  const title = usePackTitle();
  const lux = useLuxText();

  const shia = showsShia(readTradition());
  const packs = useMemo(() => {
    const list = (shop?.packs ?? []).filter((p) => p.tradition !== "shia" || shia);
    // featured for sisters first (everyone can see and buy every pack)
    return id.gender === "sister" ? [...list.filter((p) => p.featured === "sister"), ...list.filter((p) => p.featured !== "sister")] : list;
  }, [shop, shia, id.gender]);
  const skus = useMemo(() => !shop ? [] : [shop.bundle, ...packs.flatMap((p) => [p.product, p.gift]), ...shop.rare.filter((r) => r.tier !== "earned").flatMap((r) => (r.founder ? [r.product, r.founder] : [r.product])), ...shop.frames.filter((f) => !f.reward).map((f) => f.product)], [shop, packs]);
  const prices = useStorePrices(skus);
  const me = shop?.me ?? null;
  const proPack = shop?.proPack ? packs.find((p) => p.slug === shop.proPack) : null;
  const bundleOwned = !!shop && owns(shop, shop.bundle);

  return (
    <Page>
      <PageHero topInset back eyebrow="Quran Masterclass" title={x.storeTitle} lead={x.storeLead} arabic="ملصقات" />
      <View style={{ paddingHorizontal: 16, marginTop: 12, flexDirection: "row", gap: 8 }} accessibilityRole="tablist">
        {(["packs", "rare", "frames"] as Tab[]).map((k) => (
          <Pressable key={k} onPress={() => setTab(k)} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}
            style={{ flex: 1, minHeight: 40, borderRadius: R.pill, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: tab === k ? t.gold : t.line, backgroundColor: tab === k ? t.accentSoft : t.surface }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: tab === k ? t.ink : t.muted }}>{k === "packs" ? x.stickersTab : k === "rare" ? s.rareTab : x.framesTab}</Text>
          </Pressable>
        ))}
      </View>
      {msg ? <Text accessibilityLiveRegion="polite" style={{ marginHorizontal: 16, marginTop: 12, fontFamily: FONT.semibold, fontSize: 14, color: t.gold }}>{msg}</Text> : null}

      {tab === "packs" ? (
        <View style={{ paddingHorizontal: 16, gap: 14, marginTop: 14 }}>
          {me?.pro && proPack && !me.proMonthTaken && !ownsPack(shop, proPack) ? (
            <GlassCard>
              <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{s.proPackTitle}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, marginTop: 4 }}>{s.proPackText}</Text>
              <PackPreview pack={proPack} />
              <GoldButton title={`${s.take} · ${title(proPack)}`} onPress={() => void takeProPack()} style={{ marginTop: 10 }} />
            </GlassCard>
          ) : null}
          {me?.gifts.length ? <GiftsWaiting shop={shop!} /> : null}
          {!bundleOwned && prices[shop?.bundle ?? ""] ? (
            <GlassCard>
              <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{s.bundleTitle}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, marginTop: 4 }}>{s.bundleText}</Text>
              <GoldButton title={`${x.buy} · ${prices[shop!.bundle]}`} disabled={!!busy} onPress={() => void buy(shop!.bundle)} style={{ marginTop: 10 }} />
            </GlassCard>
          ) : null}
          {id.gender === "sister" && packs.some((p) => p.featured === "sister") ? <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold, marginTop: 4 }}>{s.forSisters}</Text> : null}
          {packs.map((p) => (
            <PackCard key={p.slug} pack={p} shop={shop!} price={prices[p.product]} giftPrice={prices[p.gift]} onOpen={() => setOpen(p.slug)} onBuy={() => void buy(p.product)} onGift={() => void buy(p.gift)} busy={!!busy} />
          ))}
          {!shop ? <Text style={{ fontFamily: FONT.regular, color: t.muted }}>{x.waiting}</Text> : null}
        </View>
      ) : tab === "rare" ? (
        <View style={{ paddingHorizontal: 16, gap: 14, marginTop: 14 }}>
          {(["unique", "rare", "earned"] as const).map((tier) => {
            const list = (shop?.rare ?? []).filter((r) => r.tier === tier);
            if (!list.length) return null;
            return (
              <View key={tier} style={{ gap: 12 }}>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, marginTop: 6 }}>{tier === "unique" ? lux.uniqueTab : tier === "rare" ? s.rareTab : lux.earnedTab}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted }}>{tier === "unique" ? lux.uniqueLead : tier === "rare" ? s.rareLead : lux.earnedLead}</Text>
                {list.map((r) => <RareCard key={r.slug} r={r} shop={shop!} prices={prices} buy={buy} busy={!!busy} />)}
              </View>
            );
          })}
          <Board />
        </View>
      ) : (
        <View style={{ paddingHorizontal: 16, gap: 14, marginTop: 14 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted }}>{x.framesLead}</Text>
          {me?.frame ? <OutlineButton title={x.noFrame} onPress={() => void setFrame(null)} /> : null}
          {(shop?.frames ?? []).filter((f) => !f.reward || ownsFrame(shop, f.slug)).map((f) => {
            const mine = ownsFrame(shop, f.slug), inUse = me?.frame === f.slug;
            return (
              <GlassCard key={f.slug}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                  <FramePreview frame={f.slug} size={72} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{frameName(x, s, f.slug)}</Text>
                    {mine ? (inUse ? <Text style={{ fontFamily: FONT.semibold, color: t.accent }}>{x.inUse}</Text> : <GlassButton compact title={x.useFrame} onPress={() => void setFrame(f.slug)} />)
                      : prices[frameProduct(f.slug)] ? <GoldButton compact title={`${x.buy} · ${prices[frameProduct(f.slug)]}`} disabled={!!busy} onPress={() => void buy(frameProduct(f.slug))} /> : <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{x.waiting}</Text>}
                  </View>
                </View>
              </GlassCard>
            );
          })}
        </View>
      )}

      <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 8 }}>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{x.proNote}</Text>
        <TextLink title={x.restore} onPress={() => void restore()} />
      </View>
      {open && shop ? <AlbumModal pack={shop.packs.find((p) => p.slug === open) ?? null} shop={shop} onClose={() => setOpen(null)} /> : null}
    </Page>
  );
}

function PackPreview({ pack, n = 6 }: { pack: ShopPack; n?: number }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
      {pack.stickers.slice(0, n).map((st) => <StickerView key={st.id} svg={st.svg} size={46} shimmer={st.shimmer} gloss={st.tier === "edel"} label={st.ar} />)}
    </View>
  );
}

function PackCard({ pack, shop, price, giftPrice, onOpen, onBuy, onGift, busy }: { pack: ShopPack; shop: Shop; price?: string; giftPrice?: string; onOpen: () => void; onBuy: () => void; onGift: () => void; busy: boolean }) {
  const t = useTheme();
  const x = useCosmeticsText();
  const s = useStoreText();
  const title = usePackTitle();
  const mine = ownsPack(shop, pack);
  const desc = (x.packs as Record<string, [string, string]>)[pack.slug]?.[1];
  const have = new Set(shop.me?.decor.collected ?? []);
  const placed = pack.stickers.filter((st) => have.has(st.id)).length;
  return (
    <GlassCard onPress={onOpen} accessibilityLabel={title(pack)}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{title(pack)}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{fillN(x.count, pack.stickers.length)}</Text>
      </View>
      {desc ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, marginTop: 4 }}>{desc}</Text> : null}
      <PackPreview pack={pack} />
      {mine ? <Text style={{ marginTop: 10, fontFamily: FONT.semibold, color: t.accent }}>{x.owned} · {s.album} {placed}/{pack.stickers.length}{placed === pack.stickers.length ? ` · ${s.albumDone}` : ""}</Text> : null}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        {!mine && price ? <GoldButton compact title={`${x.buy} · ${price}`} disabled={busy} onPress={onBuy} /> : null}
        {giftPrice ? <GlassButton compact icon="send" title={`${s.gift} · ${giftPrice}`} disabled={busy} onPress={onGift} /> : null}
        {!price && !mine ? <Text style={{ color: t.muted, fontFamily: FONT.regular, fontSize: 13 }}>{x.waiting}</Text> : null}
      </View>
    </GlassCard>
  );
}

/** the album of one pack: every sticker shown before purchase; after purchase the slots fill as stickers are placed */
function AlbumModal({ pack, shop, onClose }: { pack: ShopPack | null; shop: Shop; onClose: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = useStoreText();
  const title = usePackTitle();
  if (!pack) return null;
  const mine = ownsPack(shop, pack);
  const have = new Set(shop.me?.decor.collected ?? []);
  const size = Math.floor((Math.min(width, 520) - 32 - 3 * 10) / 4);
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top > 30 ? 16 : insets.top + 16, paddingBottom: insets.bottom + 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{title(pack)}</Text>
            <GlassIconButton icon="close" label="Close" onPress={onClose} size={44} />
          </View>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted, marginTop: 4 }}>{s.album} · {pack.stickers.filter((x) => have.has(x.id)).length}/{pack.stickers.length}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
            {pack.stickers.map((st) => {
              const filled = !mine || have.has(st.id);
              return (
                <View key={st.id} style={{ width: size, alignItems: "center", gap: 4, padding: 4, borderRadius: R.md, borderWidth: 1, borderStyle: filled ? "solid" : "dashed", borderColor: filled ? "transparent" : t.line, opacity: filled ? 1 : 0.45 }}>
                  <StickerView svg={st.svg} size={size - 12} shimmer={filled && st.shimmer} gloss={filled && st.tier === "edel"} label={st.ar} />
                  {st.sacred ? <Icon name="starBig" size={11} color={t.gold} /> : null}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function RareCard({ r, shop, prices, buy, busy }: { r: ShopRare; shop: Shop; prices: Record<string, string>; buy: (sku: string, hold?: boolean) => Promise<boolean>; busy: boolean }) {
  const t = useTheme();
  const { lang } = useLang();
  const x = useCosmeticsText();
  const s = useStoreText();
  const l = useLuxText();
  const [note, setNote] = useState<string | null>(null);
  const mine = ownsRare(shop, r);
  const st = shop.editionsLeft[r.slug];
  const nr = numberOf(shop, r);
  const pinned = shop.me?.showcase.includes(r.slug) ?? false;
  const show = shop.me?.showcase ?? [];
  const buyUnique = async () => {
    const why = await reserveUnique(r.product);
    if (why) { setNote(why === "taken" ? null : l.reserved); void refreshShop(); return; }
    await buy(r.product, true);
  };
  return (
    <GlassCard>
      <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
        <StickerView svg={r.sticker.svg} size={96} shimmer label={titleOf(r.title, lang)} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{titleOf(r.title, lang)}</Text>
          {r.tier === "unique" ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold }}>{l.oneOfOne}</Text> : null}
          {r.tier === "rare" && st ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{fill(s.edition, { n: r.edition ?? 300 })} · {st.left > 0 ? fill(s.left, { n: st.left, m: (r.edition ?? 300) - 10 }) : s.soldOut}</Text> : null}
          {r.tier === "unique" && st?.owner ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{fill(l.owner, { u: st.owner })}</Text> : null}
          {r.tier === "earned" ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{l.notForSale} · {EARN_HOW(l)[r.slug] ?? ""}</Text> : null}
          {mine && nr ? <NumberPlate n={nr} unique={r.tier === "unique"} frame={shop.plate} /> : null}
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        {mine ? (
          <GlassButton compact icon="starBig" title={pinned ? s.unpin : s.pin} onPress={() => void setShowcase(pinned ? show.filter((y) => y !== r.slug) : [...show, r.slug].slice(-3))} />
        ) : r.tier === "rare" && st ? (
          <>
            {/* the buyer sees the number before buying; founder numbers 1-10 are their own, higher-priced product */}
            {st.founderNext && r.founder && prices[r.founder] ? <GoldButton compact title={`${fill(l.founder, { n: st.founderNext })} · ${prices[r.founder]}`} disabled={busy} onPress={() => void buy(r.founder!)} /> : null}
            {st.next && prices[r.product] ? <GlassButton compact title={`${fill(l.youGet, { n: st.next })} · ${prices[r.product]}`} disabled={busy} onPress={() => void buy(r.product)} /> : null}
            {!prices[r.product] && st.next ? <Text style={{ color: t.muted, fontFamily: FONT.regular, fontSize: 13 }}>{x.waiting}</Text> : null}
          </>
        ) : r.tier === "unique" && st && !st.owner ? (
          st.reservedByOther ? <Text style={{ color: t.muted, fontFamily: FONT.regular, fontSize: 13 }}>{l.reserved}</Text>
            : prices[r.product] ? <GoldButton compact title={`${x.buy} · ${prices[r.product]}`} disabled={busy} onPress={() => void buyUnique()} /> : <Text style={{ color: t.muted, fontFamily: FONT.regular, fontSize: 13 }}>{x.waiting}</Text>
        ) : null}
      </View>
      {note ? <Text accessibilityLiveRegion="polite" style={{ marginTop: 6, fontFamily: FONT.semibold, fontSize: 13, color: t.gold }}>{note}</Text> : null}
    </GlassCard>
  );
}
const EARN_HOW = (l: ReturnType<typeof useLuxText>): Record<string, string> => ({ "hafiz-pearl": l.e_hafiz, "khatm-emerald": l.e_khatm, "qadr-nights-star": l.e_qadr, "streak-100": l.e_100, "streak-365": l.e_365 });

/** packs bought as a gift and not sent yet: send to a friend (the messenger delivers a gift card) */
function GiftsWaiting({ shop }: { shop: Shop }) {
  const t = useTheme();
  const s = useStoreText();
  const title = usePackTitle();
  const [user, setUser] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const g = shop.me!.gifts[0];
  const pack = shop.packs.find((p) => p.slug === g.pack);
  const send = async () => {
    setBusy(true); setMsg(null);
    const e = await sendGift(g.id, user.trim().replace(/^@/, "").toLowerCase(), note);
    setBusy(false);
    setMsg(!e ? s.giftSent : e === "friends_only" ? s.giftFriends : e === "already_owned" ? s.giftOwned : null);
  };
  const field = { minHeight: 44, borderRadius: R.md, borderWidth: 1, borderColor: t.line, paddingHorizontal: 12, fontFamily: FONT.regular, fontSize: 15, color: t.ink, backgroundColor: t.surface };
  return (
    <GlassCard>
      <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{s.giftsWaiting} · {shop.me!.gifts.length}</Text>
      {pack ? <Text style={{ fontFamily: FONT.regular, color: t.muted, marginTop: 2 }}>{title(pack)}</Text> : null}
      <TextInput value={user} onChangeText={setUser} placeholder={s.giftUser} placeholderTextColor={t.muted} autoCapitalize="none" autoCorrect={false} accessibilityLabel={s.giftUser} style={[field, { marginTop: 10 }]} />
      <TextInput value={note} onChangeText={setNote} placeholder={s.giftNote} placeholderTextColor={t.muted} maxLength={300} accessibilityLabel={s.giftNote} style={[field, { marginTop: 8 }]} />
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, marginTop: 6 }}>{s.giftFriends}</Text>
      <GoldButton title={s.giftSend} busy={busy} disabled={!user.trim()} onPress={() => void send()} style={{ marginTop: 10 }} />
      {msg ? <Text accessibilityLiveRegion="polite" style={{ marginTop: 8, fontFamily: FONT.semibold, color: t.gold }}>{msg}</Text> : null}
    </GlassCard>
  );
}

/** "Seltenste Sammlungen" / "Unikate & Nummern": holders per sticker and the owners who chose to be listed */
type BoardData = { items: { slug: string; tier: string; holders: number; owners: { username: string; number: number | null }[] }[] };
function Board() {
  const t = useTheme();
  const { lang } = useLang();
  const l = useLuxText();
  const { shop } = useShop();
  const [d, setD] = useState<BoardData | null>(null);
  useEffect(() => { api<BoardData>("/api/app/store/board").then(setD).catch(() => undefined); }, []);
  if (!d || !shop) return null;
  return (
    <GlassCard>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{l.board}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, marginTop: 4 }}>{l.boardLead}</Text>
      {d.items.slice().sort((a, b) => a.holders - b.holders).map((it) => {
        const r = shop.rare.find((y) => y.slug === it.slug);
        if (!r) return null;
        return (
          <View key={it.slug} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
            <StickerView svg={r.sticker.svg} size={34} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{titleOf(r.title, lang)}</Text>
              {it.owners.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{it.owners.map((o) => `@${o.username}${o.number ? ` (${o.number})` : ""}`).join(", ")}</Text> : null}
            </View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{fill(l.holders, { n: it.holders })}</Text>
          </View>
        );
      })}
      {shop.me ? <GlassButton compact title={l.boardOptIn} icon={shop.me.showCollection ? "check" : undefined} onPress={() => void setBoardOptIn(!shop.me!.showCollection)} style={{ marginTop: 12 }} /> : null}
    </GlassCard>
  );
}
