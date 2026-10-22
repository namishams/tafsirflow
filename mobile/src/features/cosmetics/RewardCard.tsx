import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { GlassButton, GlassCard, TextLink } from "@/components/brand";
import { FONT, R, useTheme } from "@/lib/theme";
import { usePro } from "@/lib/pro";
import { readJSON, writeJSON } from "@/lib/store";
import { ownsPack, useShop } from "@/lib/shop";
import { readTradition, showsShia } from "@/lib/tradition";
import { rewardGrowth } from "@/features/garden/garden";
import { StickerView } from "./art";
import { useStorePrices } from "./buy";
import { usePackTitle } from "./StoreScreen";
import { fill, useStoreText } from "./texts2";

// After a completed learning session: first, always, a free reward (growth points for the garden tree); then, at most
// once a day, a gentle look at a sticker pack with its stickers and the store's price, and "Later". No timers, no
// pressure wording; nothing is random.
const OFFER_KEY = "qmc.reward.offerDay";
const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const REWARD_GP = 3;

const GIVEN_KEY = "qmc.reward.given";
/** true once per session id and day (reopening a finished screen gives nothing twice) */
function firstTime(id: string): boolean {
  const g = readJSON<{ d: string; ids: string[] }>(GIVEN_KEY, { d: "", ids: [] });
  const ids = g.d === today() ? g.ids : [];
  if (ids.includes(id)) return false;
  writeJSON(GIVEN_KEY, { d: today(), ids: [...ids, id].slice(-200) }, true);
  return true;
}

export function RewardCard({ session }: { session: string }) {
  const t = useTheme();
  const s = useStoreText();
  const { pro } = usePro();
  const { shop } = useShop();
  const title = usePackTitle();
  const done = useRef(false);
  const [given, setGiven] = useState(REWARD_GP);
  // once per finished session (this card is mounted once per result screen)
  useEffect(() => { if (done.current) return; done.current = true; if (firstTime(session)) { const n = rewardGrowth(REWARD_GP, pro); if (n) setGiven(n); } }, [pro, session]);
  const [offer, setOffer] = useState(() => readJSON<string | null>(OFFER_KEY, null) !== today());
  const shia = showsShia(readTradition());
  const packs = (shop?.packs ?? []).filter((p) => !ownsPack(shop, p) && (p.tradition !== "shia" || shia)).slice(0, 3);
  const prices = useStorePrices(packs.map((p) => p.product));
  const showOffer = offer && packs.length > 0;
  useEffect(() => { if (showOffer) writeJSON(OFFER_KEY, today(), true); }, [showOffer]);
  return (
    <View style={{ gap: 12, marginTop: 16 }}>
      <GlassCard>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold }}>{s.rewardTitle}</Text>
        <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, marginTop: 4 }}>{fill(s.rewardGrowth, { n: given })}</Text>
      </GlassCard>
      {showOffer ? (
        <GlassCard>
          <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{s.discover}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 10 }}>
            {packs.map((p) => (
              <View key={p.slug} style={{ width: 220, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, gap: 8 }}>
                <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{title(p)}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                  {p.stickers.slice(0, 6).map((st) => <StickerView key={st.id} svg={st.svg} size={34} label={st.ar} />)}
                </View>
                {prices[p.product] ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{prices[p.product]}</Text> : null}
                <GlassButton compact title={s.seePack} onPress={() => router.push(`/sticker-store?pack=${p.slug}` as Href)} />
              </View>
            ))}
          </ScrollView>
          <TextLink title={s.later} onPress={() => setOffer(false)} />
        </GlassCard>
      ) : null}
    </View>
  );
}
