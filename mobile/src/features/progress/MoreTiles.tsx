import { View } from "react-native";
import { Poster, PosterGrid, SectionTitle, gradientColors } from "@/components/brand";
import { useWebT } from "@/i18n/web";
import { TILES } from "@/web/tiles";
import { go } from "./links";

/** "Courses and tools" posters at the end of a page (website: PosterTiles.tsx MoreTiles) */
export function MoreTiles({ keys }: { keys: string[] }) {
  const t = useWebT();
  const items = keys.map((k) => TILES[k]).filter(Boolean);
  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 64 }}>
      <SectionTitle title={t("home2.coursesTitle")} action={t("home2.coursesAll")} onAction={() => go("/academy")} />
      <PosterGrid>
        {items.map((c) => (
          <Poster key={c.key} title={t(`nav.${c.key}`)} desc={t(`home2.${c.desc}`)} badge={t(`home2.badge_${c.badge}`)} arabic={c.ar} colors={gradientColors(c.bg)} cta={t("home2.open")} onPress={() => go(c.href)} />
        ))}
      </PosterGrid>
    </View>
  );
}

export default MoreTiles;
