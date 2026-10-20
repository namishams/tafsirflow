import { Pressable, Text, View } from "react-native";
import { Stage } from "@/components/brand";
import { CALLIG_FONT, FONT, stage } from "@/lib/theme";
import { useWebT } from "@/i18n/web";
import { dayNow, levelOf, readPoints, totalPoints } from "@/web/points";
import { readListen } from "@/web/listen";
import { HOUR_STICKERS, buildCtx, hoursOf, nextHourSticker } from "@/web/stickers";
import { HmBar, IllumFrame, LevelSeal, Rosette } from "./art";
import { Sticker } from "./Sticker";
import { useLive, useNf } from "./hooks";
import { go } from "./links";

/**
 * Level, points, listening today and the next sticker on the dark stage (website: RewardsCard.tsx).
 * Embedded on the Today tab and in the profile overview. No props; it reads tf:points and tf:listen and updates itself.
 */
export function RewardsCard({ marginTop = 0 }: { marginTop?: number }) {
  const tr = useWebT("rewards");
  const nf = useNf();
  const v = useLive(() => {
    const p = readPoints(), ctx = buildCtx(), d = readListen()[String(dayNow())];
    const next = nextHourSticker(ctx), hours = hoursOf(ctx);
    const i = next ? HOUR_STICKERS.indexOf(next) : HOUR_STICKERS.length;
    return { total: totalPoints(p), today: p.d[String(dayNow())] ?? 0, listen: d?.s ?? 0, verses: d?.v ?? 0, hours, next, prevH: i > 0 ? HOUR_STICKERS[i - 1].h : 0 };
  });
  const lvl = levelOf(v.total);
  const m = Math.round(v.listen / 60);
  const stat = (n: string, l: string) => (
    <View style={{ flex: 1, alignItems: "center" }} accessible accessibilityLabel={`${n} ${l}`}>
      <Text style={{ fontFamily: FONT.display, fontSize: 24, color: stage.gold }}>{n}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 11, lineHeight: 13, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>{l}</Text>
    </View>
  );
  return (
    <Stage rounded={12} hairlines={false} style={{ marginTop }}>
      <IllumFrame />
      {[{ top: 6, left: 6 }, { top: 6, right: 6 }, { bottom: 6, left: 6 }, { bottom: 6, right: 6 }].map((pos, i) => <View key={i} pointerEvents="none" style={{ position: "absolute", ...pos }}><Rosette size={20} /></View>)}
      <View style={{ padding: 24, gap: 20 }}>
        <Pressable onPress={() => go("/stats")} accessibilityRole="link" accessibilityLabel={tr("toStats")} style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <LevelSeal n={lvl.n} size={76} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: CALLIG_FONT, fontSize: 30, lineHeight: 42, color: stage.gold, alignSelf: "flex-start" }}>{lvl.ar}</Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#eef0f3" }}>{tr("levelN", { n: lvl.n })} · {tr(`l${lvl.n}`)}</Text>
          </View>
        </Pressable>
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{tr("points", { n: nf(v.total) })}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{tr("todayPts", { n: nf(v.today) })}</Text>
          </View>
          <HmBar gold onStage value={lvl.pct} style={{ marginTop: 8 }} />
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            {stat(String(m), tr("minToday"))}
            {stat(nf(v.verses), tr("versesToday"))}
            {stat(nf(v.hours, v.hours < 10 ? 1 : 0), tr("hours"))}
          </View>
        </View>
        {v.next ? (
          <Pressable onPress={() => go("/stats")} accessibilityRole="link"
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: pressed ? "rgba(214,180,108,0.55)" : "rgba(214,180,108,0.25)", backgroundColor: "rgba(255,255,255,0.04)", padding: 12, borderTopLeftRadius: 40, borderTopRightRadius: 40, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, paddingStart: 18 })}>
            <Sticker def={v.next} size={64} locked pct={(v.hours - v.prevH) / (v.next.h - v.prevH)} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.7)" }}>{tr("nextShort")}</Text>
              <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: "#ffffff" }}>{tr(`s_${v.next.id}`)}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.7)" }}>{tr("hoursN", { n: nf(v.next.h) })}</Text>
            </View>
          </Pressable>
        ) : null}
      </View>
      <View style={{ marginHorizontal: 20, marginBottom: 20, flexDirection: "row", flexWrap: "wrap", columnGap: 20, rowGap: 8, borderTopWidth: 1, borderTopColor: "rgba(214,180,108,0.2)", paddingHorizontal: 4, paddingTop: 12 }}>
        <Text onPress={() => go("/stats")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.gold }}>{tr("toStats")}</Text>
        <Text onPress={() => go("/ranking")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{tr("toRanking")}</Text>
      </View>
    </Stage>
  );
}

export default RewardsCard;
