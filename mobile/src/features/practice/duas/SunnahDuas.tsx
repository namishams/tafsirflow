import { useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Share, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { SUNNAH_CATS, SUNNAH_DUAS, type SunnahCat } from "@/web/sunnahDuas";
import { SUNNAH_DUAS_2 } from "@/web/sunnahDuas2";
import { useStored, writeJSON } from "@/lib/store";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { ARABIC_FONT, FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { GoldCard, SmallStar, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { LightChip, PStar, PracticeWindow, useGold } from "../art";
import { CheckRow } from "../ui";
import { UI } from "../web/sunnahDuas";

const ALL = [...SUNNAH_DUAS, ...SUNNAH_DUAS_2];
type Dua = (typeof ALL)[number];
export const FAV_KEY = "tf:duafav";

// Duas of the Prophet ﷺ (website SunnahDuas.tsx): filter by occasion, search, favourites (tf:duafav, synced with the
// account), a tap counter for repeated adhkar and a calm reading mode
export default function SunnahDuas() {
  const t = useWebT("duas");
  const w = useWebT();
  const th = useTheme();
  const g = useGold();
  const { lang } = useLang();
  const ui = UI[lang === "de" ? "de" : "en"];
  const [cat, setCat] = useState<SunnahCat | "all" | "fav">("all");
  const [q, setQ] = useState("");
  const fav = useStored<string[]>(FAV_KEY, []);
  const [count, setCount] = useState<Record<string, number>>({});
  const [showTr, setShowTr] = useState(true);
  const [read, setRead] = useState<number | null>(null);
  const [focus, setFocus] = useState(false);

  const meaning = (d: Dua) => (lang === "de" ? d.de : d.en);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ALL.filter((d) => (cat === "all" ? true : cat === "fav" ? fav.includes(d.id) : d.cat === cat))
      .filter((d) => !s || [d.ar, d.tr, d.en, d.de, d.src].some((x) => x.toLowerCase().includes(s)));
  }, [cat, q, fav]);

  const toggleFav = (id: string) => writeJSON(FAV_KEY, fav.includes(id) ? fav.filter((x) => x !== id) : [...fav, id]);
  const tap = (id: string, max: number) => setCount((c) => ({ ...c, [id]: (c[id] ?? 0) >= max ? 0 : (c[id] ?? 0) + 1 }));
  const share = (d: Dua) => { void Share.share({ message: [d.ar, d.tr, meaning(d), `— ${d.src}`].filter(Boolean).join("\n\n") }).catch(() => undefined); };

  return (
    <View>
      <View style={{ gap: 12 }}>
        <View style={{ height: 48, borderRadius: R.pill, borderWidth: 1, borderColor: focus ? "rgb(201,166,94)" : `rgba(${g},0.3)`, backgroundColor: th.surface, flexDirection: "row", alignItems: "center", paddingLeft: 16, gap: 10,
          shadowColor: "rgb(201,166,94)", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } }}>
          <Icon name="search" color={th.gold} size={20} />
          <TextInput value={q} onChangeText={setQ} placeholder={t("search")} placeholderTextColor={th.muted} accessibilityLabel={t("search")} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
            returnKeyType="search" autoCorrect={false} style={{ flex: 1, height: 46, fontFamily: FONT.regular, fontSize: 15, color: th.ink, paddingRight: 16 }} />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <CheckRow label={t("translit")} value={showTr} onChange={setShowTr} style={{ alignItems: "center" }} />
          {list.length > 0 ? (
            <Pressable onPress={() => setRead(0)} accessibilityRole="button" style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}>
              <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 48, borderRadius: R.pill, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Icon name="book" color={goldButton.text} size={18} />
                <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{ui.read}</Text>
              </LinearGradient>
            </Pressable>
          ) : null}
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        <LightChip label={`${t("all")} · ${ALL.length}`} on={cat === "all"} onPress={() => setCat("all")} />
        <LightChip label={`${t("favs")}${fav.length ? ` · ${fav.length}` : ""}`} icon={<SmallStar size={11} color={th.gold} />} on={cat === "fav"} onPress={() => setCat("fav")} />
        {SUNNAH_CATS.map((c) => <LightChip key={c} label={t(`c_${c}`)} on={cat === c} onPress={() => setCat(c)} />)}
      </View>

      {list.length === 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: th.muted, marginTop: 24 }}>{cat === "fav" ? t("noFavs") : t("noResults")}</Text> : (
        <View style={{ gap: 20, marginTop: 28 }}>
          {list.map((d, k) => {
            const isFav = fav.includes(d.id);
            return (
              <GoldCard key={d.id} style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 24 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, paddingTop: 4 }}>
                    <PStar size={10} />
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: th.gold, flexShrink: 1 }}>{t(`c_${d.cat}`)}</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginRight: -8, marginTop: -8 }}>
                    <IconBtn icon="book" label={ui.read} onPress={() => setRead(k)} />
                    <IconBtn icon="share" label={w("duagen.share")} onPress={() => share(d)} />
                    <IconBtn icon="bookmark" label={t("fav")} on={isFav} onPress={() => toggleFav(d.id)} />
                  </View>
                </View>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 28, lineHeight: 60, color: th.arabic, writingDirection: "rtl", textAlign: "right", marginTop: 12 }}>{d.ar}</Text>
                {showTr ? <Text style={{ fontFamily: FONT.italic, fontSize: 15, lineHeight: 24, color: th.gold, marginTop: 12 }}>{d.tr}</Text> : null}
                {meaning(d) ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 25, color: th.ink, opacity: 0.8, marginTop: 8 }}>{meaning(d)}</Text> : null}
                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: `rgba(${g},0.2)` }}>
                  <Text style={{ flexShrink: 1, fontFamily: FONT.semibold, fontSize: 12, color: th.muted }}>{t("source")}: {d.src}</Text>
                  {d.n && d.n > 1 ? <Tasbih n={count[d.id] ?? 0} max={d.n} onTap={() => tap(d.id, d.n!)} label={t("counter")} /> : null}
                </View>
              </GoldCard>
            );
          })}
        </View>
      )}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 19, color: th.muted, marginTop: 24 }}>{t("sunnahNote")}</Text>
      {read !== null && list[read] ? (
        <Reader list={list} i={read} setI={setRead} close={() => setRead(null)} showTr={showTr} meaning={meaning} catLabel={(c) => t(`c_${c}`)} sourceLbl={t("source")}
          count={count} tap={tap} counterLbl={t("counter")} ui={ui} />
      ) : null}
    </View>
  );
}

function IconBtn({ icon, label, onPress, on }: { icon: "book" | "share" | "bookmark"; label: string; onPress: () => void; on?: boolean }) {
  const th = useTheme();
  const g = useGold();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={on === undefined ? undefined : { selected: on }}
      style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? `rgba(${g},0.1)` : "transparent" })}>
      <Icon name={icon} color={on ? th.gold : th.muted} filled={on} size={icon === "book" ? 20 : 18} />
    </Pressable>
  );
}

// tasbih counter: a ring of beads that fills with every tap
export function Tasbih({ n, max, onTap, label, dark = false }: { n: number; max: number; onTap: () => void; label: string; dark?: boolean }) {
  const th = useTheme();
  const done = n >= max, C = 2 * Math.PI * 21;
  const beads = Math.min(max, 33);
  return (
    <Pressable onPress={onTap} accessibilityRole="button" accessibilityLabel={`${label} ${n} / ${max}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: R.pill, paddingVertical: 4, paddingLeft: 4, paddingRight: 16, transform: [{ scale: pressed ? 0.94 : 1 }] })}>
      <View style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}>
        <Svg width={48} height={48} viewBox="0 0 48 48" style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
          <Circle cx={24} cy={24} r={21} fill={done ? "rgba(201,166,94,0.16)" : "none"} stroke={dark ? "rgba(255,255,255,0.14)" : th.line} strokeWidth={3} />
          <Circle cx={24} cy={24} r={21} fill="none" stroke="rgb(201,166,94)" strokeWidth={3} strokeLinecap="round" strokeDasharray={`${((Math.min(n, max) / max) * C).toFixed(1)} ${C.toFixed(1)}`} />
          {Array.from({ length: beads }, (_, k) => { const a = (Math.PI * 2 * k) / beads; return <Circle key={k} cx={(24 + 21 * Math.cos(a)).toFixed(2)} cy={(24 + 21 * Math.sin(a)).toFixed(2)} r={1} fill={dark ? "#fff" : th.surface} fillOpacity={0.6} />; })}
        </Svg>
        {done ? <Icon name="check" color={th.gold} size={18} /> : <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: dark ? "#f3e2b6" : th.ink, fontVariant: ["tabular-nums"] }}>{n}</Text>}
      </View>
      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: dark ? "rgba(255,255,255,0.7)" : th.muted, fontVariant: ["tabular-nums"] }}>{n} / {max}</Text>
    </Pressable>
  );
}

// Reading mode: one dua at a time, large and calm, on the dark stage; arrows and a swipe move on
function Reader({ list, i, setI, close, showTr, meaning, catLabel, sourceLbl, count, tap, counterLbl, ui }: {
  list: Dua[]; i: number; setI: (n: number) => void; close: () => void; showTr: boolean; meaning: (d: Dua) => string; catLabel: (c: string) => string; sourceLbl: string;
  count: Record<string, number>; tap: (id: string, max: number) => void; counterLbl: string; ui: (typeof UI)["de"];
}) {
  const insets = useSafeAreaInsets();
  const d = list[i];
  const touch = useRef<number | null>(null);
  const go = (k: number) => setI(Math.max(0, Math.min(list.length - 1, k)));
  const swipe = (x: number) => {
    if (touch.current === null) return;
    const dx = x - touch.current; touch.current = null;
    if (Math.abs(dx) < 50) return;
    go(dx < 0 ? i + 1 : i - 1);
  };
  return (
    <Modal visible animationType="fade" onRequestClose={close} statusBarTranslucent>
      <Stage hairlines={false} style={{ flex: 1 }}>
        <View style={{ flex: 1 }} onTouchStart={(e) => { touch.current = e.nativeEvent.pageX; }} onTouchEnd={(e) => swipe(e.nativeEvent.pageX)}>
          <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", opacity: 0.16 }}>
            <PracticeWindow uid="dua-read" lamp height="86%" />
          </View>
          <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
              <SmallStar size={10} color={stage.gold} />
              <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.7, textTransform: "uppercase", color: stage.gold }}>{catLabel(d.cat)}</Text>
            </View>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.6)", fontVariant: ["tabular-nums"] }}>{i + 1} / {list.length}</Text>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={ui.close} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: pressed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" })}>
              <Icon name="close" color="#ffffff" size={20} />
            </Pressable>
          </View>
          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.1)" }}><View style={{ height: 1, width: `${((i + 1) / list.length) * 100}%`, backgroundColor: "rgb(214,180,108)" }} /></View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 32, flexGrow: 1, justifyContent: "center" }}>
            <View key={d.id} style={{ alignItems: "center" }}>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 30, lineHeight: 64, color: "#ffffff", writingDirection: "rtl", textAlign: "center" }}>{d.ar}</Text>
              {showTr ? <Text style={{ fontFamily: FONT.italic, fontSize: 16, lineHeight: 26, color: "rgb(233,207,153)", textAlign: "center", marginTop: 24 }}>{d.tr}</Text> : null}
              {meaning(d) ? <Text style={{ fontFamily: FONT.regular, fontSize: 17, lineHeight: 28, color: "rgba(255,255,255,0.8)", textAlign: "center", marginTop: 16 }}>{meaning(d)}</Text> : null}
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 24, textAlign: "center" }}>{sourceLbl}: {d.src}</Text>
              {d.n && d.n > 1 ? <View style={{ marginTop: 24 }}><Tasbih n={count[d.id] ?? 0} max={d.n} onTap={() => tap(d.id, d.n!)} label={counterLbl} dark /></View> : null}
            </View>
          </ScrollView>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, paddingTop: 12, paddingBottom: Math.max(16, insets.bottom) }}>
            <Pressable onPress={() => go(i - 1)} disabled={i === 0} accessibilityRole="button" accessibilityLabel={ui.prev}
              style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", opacity: i === 0 ? 0.25 : 1 }}>
              <Icon name="chevronLeft" color="#ffffff" size={22} />
            </Pressable>
            <SmallStar size={14} color="rgb(214,180,108)" />
            <Pressable onPress={() => go(i + 1)} disabled={i >= list.length - 1} accessibilityRole="button" accessibilityLabel={ui.next} style={{ opacity: i >= list.length - 1 ? 0.4 : 1 }}>
              <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" }}>
                <Icon name="chevronRight" color={goldButton.text} size={22} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Stage>
    </Modal>
  );
}
