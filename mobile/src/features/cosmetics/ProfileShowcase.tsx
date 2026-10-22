import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { FONT, R, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { albumProgress, titleOf, useShop } from "@/lib/shop";
import { NumberPlate, StickerView } from "./art";
import { fill, useStoreText } from "./texts2";

// On a profile: the "Vitrine" with up to three pinned rare stickers (visible to everyone, with their shimmer) and,
// on the own profile, the collection progress with a way into the sticker store.
export function ProfileShowcase({ showcase, items, mine }: { showcase: string[] | undefined; items?: { slug: string; tier: string; number: number | null }[]; mine: boolean }) {
  const t = useTheme();
  const s = useStoreText();
  const { lang } = useLang();
  const { shop } = useShop();
  const pinned = (showcase ?? []).map((slug) => shop?.rare.find((r) => r.slug === slug)).filter((r) => !!r);
  const prog = mine ? albumProgress(shop) : null;
  if (!pinned.length && !(prog && prog.albums)) {
    return mine ? (
      <Pressable onPress={() => router.push("/sticker-store" as Href)} accessibilityRole="link" style={{ marginTop: 10, alignSelf: "center" }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold }}>{s.collection}</Text>
      </Pressable>
    ) : null;
  }
  return (
    <View style={{ marginTop: 12, alignItems: "center", gap: 8 }}>
      {pinned.length ? (
        <View accessibilityLabel={s.showcase} style={{ flexDirection: "row", gap: 10, padding: 8, borderRadius: R.lg, borderWidth: 1, borderColor: t.line }}>
          {pinned.map((r) => {
            const it = items?.find((y) => y.slug === r.slug);
            return (
              <View key={r.slug} style={{ alignItems: "center", gap: 4 }}>
                <StickerView svg={r.sticker.svg} size={52} shimmer label={titleOf(r.title, lang)} />
                {it?.number && (it.tier === "unique" || it.number <= 10) ? <NumberPlate n={it.number} unique={it.tier === "unique"} frame={shop?.plate} /> : null}
              </View>
            );
          })}
        </View>
      ) : null}
      {prog && prog.albums ? (
        <Pressable onPress={() => router.push("/sticker-store" as Href)} accessibilityRole="link">
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted, textAlign: "center" }}>
            {s.collection}: {fill(s.collectionLine, { done: prog.done, total: prog.total, complete: prog.complete })}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
