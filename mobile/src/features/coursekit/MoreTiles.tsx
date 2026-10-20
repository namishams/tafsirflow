import { View } from "react-native";
import { router, type Href } from "expo-router";
import { Poster, PosterGrid, SectionTitle, gradientColors } from "@/components/brand";
import { useWebT } from "@/i18n/web";
import { TILES } from "@/web/tiles";

/** "Courses and tools" at the end of a course page, like the website's <MoreTiles keys=… /> */
export function MoreTiles({ keys }: { keys: string[] }) {
  const w = useWebT();
  const tiles = keys.map((k) => TILES[k]).filter(Boolean);
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 40 }}>
      <SectionTitle title={w("home2.coursesTitle")} action={w("home2.coursesAll")} onAction={() => router.push("/academy" as Href)} />
      <PosterGrid>
        {tiles.map((t) => (
          <Poster key={t.key} title={w(`nav.${t.key}`)} desc={w(`home2.${t.desc}`)} badge={w(`home2.badge_${t.badge}`)} arabic={t.ar}
            colors={gradientColors(t.bg)} cta={w("home2.open")} onPress={() => router.push(t.href as Href)} />
        ))}
      </PosterGrid>
    </View>
  );
}
