import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { goBack } from "@/components/page";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { readTradition, showsShia } from "@/lib/tradition";
import { usePro } from "@/lib/pro";
import { tick } from "@/features/feed/haptics";
import { CATALOG_SIZE, RARITY_GP, RARITY_ODDS, SERIES, SERIES_SIZE, completionGp, countOf, isGiven, itemAt, itemById, rarityOf, seriesOwned, totalOwned, useCatalog, visibleSeasonal, type CatItem, type Rarity, type Series } from "./catalog";
import { CatalogArt, rarityColor } from "./CatalogArt";
import { activeTree, giveSticker, holdCelebrations, useGarden } from "./garden";
import { chime } from "./widgets";
import { useLang } from "@/i18n";
import { fillG, stickerLabel, useGardenText, useStickerLabel } from "./texts";
import { useGiftText } from "./giftText";
import { useGameText } from "@/features/feed/gamifyTexts";

// The sticker collection: every series with its progress and completion reward, search, filters and a virtualised
// grid (only visible cells are rendered; ids come from the index, never a stored list). Every sticker carries its name
// (VoiceOver, the detail, a caption under the ones still missing) and the detail says how a missing one is earned.
type Filter = "all" | "owned" | "missing";

/** the second line of a sticker: the surah of a verse, the number of a surah or name, the Arabic of a prophet or month */
export const subOf = (it: CatItem): string | undefined => it.sub ?? (it.ar && (it.series === "prophets" || it.series === "months") ? it.ar : undefined);
/** the caption under a missing sticker: the number of a name, the key of a verse, otherwise its name */
const captionOf = (it: CatItem, label: string) => (it.series === "names" ? it.sub ?? label : label);

export default function Collection() {
  const tx = useGardenText();
  const gt = useGameText();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { lang } = useLang();
  useCatalog();
  const [series, setSeries] = useState<Series>("names");
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const cols = width > 600 ? 6 : 4;
  const shia = showsShia(readTradition());
  const ids = useMemo(() => {
    const n = SERIES_SIZE[series];
    const out: string[] = [];
    const needle = q.trim().toLowerCase();
    for (let i = 0; i < n; i++) {
      const it = itemAt(series, i);
      if (series === "seasonal" && !visibleSeasonal(shia).includes(it.id.slice(2))) continue;
      if (needle && !`${stickerLabel(it, lang)} ${it.label} ${it.sub ?? ""} ${it.ar ?? ""}`.toLowerCase().includes(needle)) continue;
      const own = countOf(it.id) > 0;
      if ((filter === "owned" && !own) || (filter === "missing" && own)) continue;
      out.push(it.id);
    }
    return out;
  }, [series, filter, q, shia, sel, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const cell = (width - 32) / cols;
  const header = (
    <View style={{ gap: 12, paddingBottom: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Pressable onPress={() => goBack()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10}><Icon name="chevronLeft" color={t.ink} size={22} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{tx.album}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{fillG(tx.albumLead, { n: totalOwned(), m: CATALOG_SIZE })}</Text>
        </View>
        <Pressable onPress={() => router.push("/garden" as Href)} accessibilityRole="button" accessibilityLabel={tx.open} hitSlop={10}><Icon name="heart" color={t.gold} size={20} /></Pressable>
      </View>
      {/* the sticker album of the feed (milestones and rare stickers), as on the website */}
      <Pressable onPress={() => router.push("/feed-stickers" as Href)} accessibilityRole="link" hitSlop={8} style={{ alignSelf: "flex-start" }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{gt.album}</Text>
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {SERIES.map((se) => {
          const own = seriesOwned(se), size = se === "seasonal" ? visibleSeasonal(shia).length : SERIES_SIZE[se];
          return (
            <Pressable key={se} onPress={() => { tick(); setSeries(se); }} accessibilityRole="tab" accessibilityState={{ selected: series === se }}
              style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: R.lg, borderWidth: 1, borderColor: series === se ? t.gold : t.line, backgroundColor: series === se ? t.accentSoft : t.surface }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{tx[`ser_${se}`]}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted }}>{own} / {size}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{fillG(tx.seriesReward, { n: completionGp(series) })}</Text>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <TextInput value={q} onChangeText={setQ} placeholder={tx.search} placeholderTextColor={t.muted} accessibilityLabel={tx.search}
          style={{ flex: 1, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, color: t.ink, fontFamily: FONT.regular, fontSize: 15, paddingHorizontal: 12, paddingVertical: 8 }} />
        {(["all", "owned", "missing"] as Filter[]).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} accessibilityRole="button" accessibilityState={{ selected: filter === f }} style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, backgroundColor: filter === f ? t.accent : "transparent" }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: filter === f ? t.onAccent : t.ink }}>{f === "all" ? tx.all : f === "owned" ? tx.owned : tx.missing}</Text>
          </Pressable>
        ))}
      </View>
      {/* odds, clearly stated: packs are only earned, never bought (readable text, the rim colour as a small swatch) */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 4 }}>
        {RARITY_ODDS.map(([r, pct]) => (
          <View key={r} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <RaritySwatch r={r} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{tx[`r_${r}`]} {pct} % · +{RARITY_GP[r]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
  const ownedEmpty = filter === "owned" && !q.trim();
  const empty = (
    <View style={{ paddingVertical: 32, paddingHorizontal: 8, gap: 6 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.muted, textAlign: "center" }}>{ownedEmpty ? tx.noneOwned : tx.noMatch}</Text>
      {ownedEmpty ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, textAlign: "center" }}>{tx[`earn_${series}`]}</Text> : null}
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + 8 }}>
      <FlatList data={ids} key={cols} numColumns={cols} keyExtractor={(x) => x} ListHeaderComponent={header} ListEmptyComponent={empty} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 30 }}
        initialNumToRender={cols * 6} maxToRenderPerBatch={cols * 4} windowSize={7} removeClippedSubviews
        renderItem={({ item }) => <Cell id={item} size={cell} onPress={() => setSel(item)} />} />
      {sel ? <Detail id={sel} onClose={() => setSel(null)} /> : null}
    </View>
  );
}

/** the rarity as a small swatch in the rim colour (the colours stay on the art; text is always ink or muted) */
function RaritySwatch({ r }: { r: Rarity }) {
  return <View accessible={false} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: rarityColor(r) }} />;
}

function Cell({ id, size, onPress }: { id: string; size: number; onPress: () => void }) {
  const t = useTheme();
  const tx = useGardenText();
  const name = useStickerLabel();
  const n = countOf(id);
  const it = itemById(id);
  const label = it ? name(it) : id, sub = it ? subOf(it) : undefined;
  const caption = n === 0 ? (it ? captionOf(it, label) : "") : n > 1 ? `×${n}` : isGiven(id) ? "·" : "";
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}${sub ? `, ${sub}` : ""}, ${n ? fillG(tx.copies, { n }) : tx.missing}${isGiven(id) ? `, ${tx.given}` : ""}`}
      style={{ width: size, height: size + 22, alignItems: "center", paddingTop: 4 }}>
      <CatalogArt id={id} size={size - 10} locked={n === 0} />
      <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 10.5, color: n ? t.ink : t.muted, maxWidth: size - 6 }}>{caption}</Text>
    </Pressable>
  );
}

function Detail({ id, onClose }: { id: string; onClose: () => void }) {
  const tx = useGardenText();
  const gx = useGiftText();
  const t = useTheme();
  const { pro } = usePro();
  const name = useStickerLabel();
  const s = useGarden();
  // the stage-up cinematic is a second modal: iOS cannot show it over this one (the app would seem frozen), so it
  // waits until the detail has closed, as in the gift flow
  useEffect(() => holdCelebrations(), []);
  const [msg, setMsg] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  const n = countOf(id), r = rarityOf(id), it = itemById(id);
  const tree = activeTree(s, pro);
  const label = it ? name(it) : id, sub = it ? subOf(it) : undefined;
  const canGive = n > 1 || (n === 1 && !isGiven(id));
  const give = (unique: boolean) => {
    const run = () => {
      const res = giveSticker(id, unique, pro);
      if (!res) return;
      // nothing was spent: the tree has had all the sticker growth it takes today
      if (res.full) { setFull(true); setMsg(gx.capT); return; }
      chime();
      setMsg(`${fillG(tx.gp, { n: res.gp })}${res.trait ? ` · ${fillG(tx.traitNew, { t: tx[`tr_${res.trait}` as "tr_star"] ?? res.trait })}` : ""}`);
    };
    if (unique) Alert.alert(tx.confirmTitle, tx.confirmBody, [{ text: tx.cancel, style: "cancel" }, { text: tx.give, onPress: run }]); else run();
  };
  const plant = () => { onClose(); router.push("/garden?plant=1" as Href); };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: 24 }} onPress={onClose} accessible={false}>
        <Pressable accessibilityViewIsModal style={{ backgroundColor: t.bg, borderRadius: R.card, padding: 20, alignItems: "center", gap: 10, width: "100%", maxWidth: 360 }} onPress={() => undefined}>
          <CatalogArt id={id} size={170} locked={n === 0} />
          <View style={{ alignItems: "center", gap: 2 }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 20, color: t.ink, textAlign: "center" }}>{label}</Text>
            {sub ? <Text style={{ fontFamily: it?.ar && sub === it.ar ? ARABIC_FONT : FONT.regular, fontSize: it?.ar && sub === it.ar ? 18 : 14, color: t.muted, textAlign: "center" }}>{sub}</Text> : null}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <RaritySwatch r={r} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{tx[`r_${r}`]} · +{RARITY_GP[r]}</Text>
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{n ? fillG(tx.copies, { n }) : tx.missing}{isGiven(id) ? ` · ${tx.given}` : ""}</Text>
          {n === 0 && it ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted, textAlign: "center" }}>{tx[`earn_${it.series}`]}</Text> : null}
          {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: full ? t.ink : t.gold, textAlign: "center" }}>{msg}</Text> : null}
          {canGive && !tree ? (
            <>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted, textAlign: "center" }}>{tx.plantFirst}</Text>
              <GoldButton title={tx.plant} onPress={plant} style={{ alignSelf: "stretch" }} />
            </>
          ) : null}
          {tree && !full && n > 1 ? <GoldButton title={`${tx.give} (${tx.dupes})`} onPress={() => give(false)} style={{ alignSelf: "stretch" }} /> : null}
          {tree && !full && n === 1 && !isGiven(id) ? <OutlineButton title={tx.give} onPress={() => give(true)} style={{ alignSelf: "stretch" }} /> : null}
          <OutlineButton title={tx.close} onPress={onClose} style={{ alignSelf: "stretch" }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
