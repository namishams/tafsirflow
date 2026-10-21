import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Page } from "@/components/page";
import { useLang } from "@/i18n";
import { SITE } from "@/lib/api";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { StickerPop } from "@/features/progress/motion";
import { BrandFoot, CARD_SIZE, ShareSheet, type ShareFormat } from "./share";
import { STICKERS, STICKER, markStickersSeen, useGamify } from "./gamify";
import { useGameText } from "./gamifyTexts";
import { StickerArt, stickerName } from "./Sticker";
import { fillText, useFeedText } from "./texts";
import { tick } from "./haptics";

// /feed-stickers: all collectible stickers (gamify.ts STICKERS), collected ones in colour with the date, the others
// greyed with their milestone as the name. New ones pop in once (StickerPop stands still with Reduce Motion).
// A sticker can be shared as an Instagram / WhatsApp story through the feed's share sheet.
export default function StickerAlbum() {
  const t = useTheme();
  const tx = useFeedText();
  const gt = useGameText();
  const { lang } = useLang();
  const gm = useGamify();
  const [fresh] = useState(() => new Set(gm.fresh));
  const [open, setOpen] = useState<string | null>(null);
  const [share, setShare] = useState<string | null>(null);
  useEffect(() => { const id = setTimeout(markStickersSeen, 800); return () => clearTimeout(id); }, []);
  const nf = (n: number) => Intl.NumberFormat(lang).format(n);
  const have = STICKERS.filter((s) => gm.stickers[s.id]).length;
  const date = (d: number) => new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(new Date(d * 86400000 + new Date().getTimezoneOffset() * 60000 + 43200000));
  const sel = open ? STICKER.get(open) : undefined;
  const regular = STICKERS.filter((s) => !s.rare);
  const rare = STICKERS.filter((s) => s.rare);
  const card = (f: ShareFormat) => {
    const d = share ? STICKER.get(share) : undefined;
    return (
      <LinearGradient colors={[stage.bg, stage.deep]} style={{ width: CARD_SIZE[f].w, height: CARD_SIZE[f].h, padding: 28, alignItems: "center", justifyContent: "space-between" }}>
        <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{gt.album}</Text>
        {d ? <StickerArt def={d} size={Math.min(CARD_SIZE[f].w - 80, 240)} /> : <View />}
        <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: 24, color: "#fff", textAlign: "center" }}>{share ? stickerName(share, gt, tx, nf) : ""}</Text>
        <BrandFoot />
      </LinearGradient>
    );
  };
  const tile = (id: string) => {
    const d = STICKER.get(id)!;
    const got = !!gm.stickers[id];
    const name = stickerName(id, gt, tx, nf);
    const art = <StickerArt def={d} size={76} locked={!got} />;
    return (
      <Pressable key={id} onPress={() => { tick(); setOpen(id); }} accessibilityRole="button" accessibilityLabel={`${name}${got ? "" : `, ${gt.locked}`}`}
        style={({ pressed }) => ({ width: "31%", alignItems: "center", gap: 6, paddingVertical: 10, borderRadius: 14, backgroundColor: open === id ? t.accentSoft : "transparent", opacity: pressed ? 0.7 : got ? 1 : 0.55 })}>
        {got && fresh.has(id) ? <StickerPop>{art}</StickerPop> : art}
        <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 11.5, lineHeight: 14, color: t.ink, textAlign: "center" }}>{name}</Text>
      </Pressable>
    );
  };
  return (
    <Page padded>
      <Stack.Screen options={{ title: gt.album }} />
      <View style={{ gap: 14 }}>
        <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16, gap: 10 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 18, color: t.ink }}>{fillText(gt.albumProgress, { n: nf(have), m: nf(STICKERS.length) })}</Text>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: t.line }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: STICKERS.length, now: have }}>
            <View style={{ width: `${(have / STICKERS.length) * 100}%`, height: 8, borderRadius: 4, backgroundColor: t.gold }} />
          </View>
        </View>

        {sel ? (
          <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16, alignItems: "center", gap: 8 }} accessibilityLiveRegion="polite">
            <StickerArt def={sel} size={140} locked={!gm.stickers[sel.id]} />
            <Text style={{ fontFamily: FONT.display, fontSize: 18, color: t.ink, textAlign: "center" }}>{stickerName(sel.id, gt, tx, nf)}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>
              {gm.stickers[sel.id] ? fillText(gt.collectedOn, { d: date(gm.stickers[sel.id]) }) : sel.rare ? gt.rareNote : gt.locked}
            </Text>
            {gm.stickers[sel.id] ? (
              <Pressable onPress={() => setShare(sel.id)} accessibilityRole="button"
                style={({ pressed }) => ({ height: 44, paddingHorizontal: 20, borderRadius: R.pill, justifyContent: "center", backgroundColor: t.accent, transform: pressed ? [{ scale: 0.97 }] : undefined })}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.onAccent }}>{gt.shareSticker}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 6 }}>{regular.map((s) => tile(s.id))}</View>
        <View style={{ gap: 4 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 17, color: t.ink }}>{gt.rare}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{gt.rareNote}</Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 6 }}>{rare.map((s) => tile(s.id))}</View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "center" }}>{tx.statsLocal}</Text>
      </View>
      <ShareSheet visible={!!share} onClose={() => setShare(null)} link={SITE} message={share ? `${gt.stickerNew}: ${stickerName(share, gt, tx, nf)}` : ""} renderCard={card} noDecoration />
    </Page>
  );
}
