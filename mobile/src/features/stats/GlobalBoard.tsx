import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useGlobalSearchParams, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Page, PageHero, Loading } from "@/components/page";
import { Segmented, StarLattice } from "@/components/brand";
import { useLang } from "@/i18n";
import { countryName } from "@/lib/countries";
import { ApiError } from "@/lib/api";
import { TalentAvatar } from "@/features/talents/ui";
import { BadgeMark } from "@/features/talents/badges";
import { CountryPicker } from "@/features/talents/CountryPicker";
import { CountryBadge } from "@/features/rankings/Flag";
import { BOARD_CATS, BOARD_PERIODS, BOARD_SCOPES, type BoardCat, type BoardPeriod, type BoardScope } from "./career";
import { statsApi, type Board, type BoardRow } from "./api";
import { demoBoard } from "./demo";
import { useCT, type CKey } from "./text";

// /ranking-global (website /ranking/global): the global boards of the progress profile. World, one country or the people
// one follows; week, month or all time; XP, memorised verses, streak or passed exams. The best three on a podium with
// badge and country, then the list to 100 and the own place. Only members listed by name (opted in, 16+); blocked
// members never appear. A note keeps the spirit: encouragement in good, not boasting.
export function GlobalBoardScreen() {
  const t = useTheme();
  const ct = useCT();
  const { lang } = useLang();
  const { demo } = useGlobalSearchParams<{ demo?: string }>();
  const [scope, setScope] = useState<BoardScope>("world");
  const [cat, setCat] = useState<BoardCat>("xp");
  const [period, setPeriod] = useState<BoardPeriod>("week");
  const [country, setCountry] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [b, setB] = useState<Board | null>(null);
  const [state, setState] = useState<"load" | "ok" | "login" | "error">("load");
  const nf = useMemo(() => { try { return new Intl.NumberFormat(lang); } catch { return new Intl.NumberFormat("en"); } }, [lang]);
  const f = (n: number) => nf.format(n);
  useEffect(() => {
    setState("load");
    if (__DEV__ && demo === "stats") {
      const base = { xp: period === "all" ? 48_000 : period === "month" ? 6_000 : 1_600, verses: period === "all" ? 6_100 : 240, streak: 400, exams: period === "all" ? 60 : 8 }[cat];
      setB({ scope, cat, period, country, rows: demoBoard(base), named: 4_210, me: { rank: 128, total: 4_210, pct: 3.1, score: Math.round(base * 0.2), listed: true } });
      setState("ok");
      return;
    }
    let off = false;
    statsApi.board({ scope, cat, period, country })
      .then((d) => { if (off) return; setB(d); setState("ok"); if (scope === "country" && !country && d.country) setCountry(d.country); })
      .catch((e) => { if (!off) setState(e instanceof ApiError && e.status === 401 ? "login" : "error"); });
    return () => { off = true; };
  }, [scope, cat, period, country, demo]);
  const unit = ct(({ xp: "u_xp", verses: "u_verses", streak: "u_days", exams: "u_exams" } as const)[cat]);
  const catLabel = (c: BoardCat) => (c === "streak" && period === "all" ? ct("streakBest") : ct(`cat_${c}` as CKey));
  const rows = b?.rows ?? [];
  const open = (r: BoardRow) => { if (!(__DEV__ && r.username.startsWith("demo."))) router.push(`/talents/u/${r.username}` as Href); };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <Page style={{ paddingBottom: 130 }}>
          <PageHero back topInset arcade={false} title={ct("boardTitle")} lead={ct("boardLead")} />
          <View style={{ padding: 16, gap: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}><Segmented<BoardScope> value={scope} onChange={setScope} options={BOARD_SCOPES.map((x) => [x, ct(`scope_${x}` as CKey)])} /></ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}><Segmented<BoardPeriod> value={period} onChange={setPeriod} options={BOARD_PERIODS.map((x) => [x, ct(`period_${x}` as CKey)])} /></ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}><Segmented<BoardCat> value={cat} onChange={setCat} options={BOARD_CATS.map((x) => [x, catLabel(x)])} /></ScrollView>
            {scope === "country" ? (
              <Pressable onPress={() => setPicking(true)} accessibilityRole="button" accessibilityLabel={ct("pickCountry")}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 46, paddingHorizontal: 12, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, opacity: pressed ? 0.7 : 1 })}>
                {country ? <CountryBadge code={country} size={26} /> : null}
                <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{country ? countryName(country, lang) : ct("needCountry")}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent }}>{ct("pickCountry")}</Text>
              </Pressable>
            ) : null}

            {state === "load" ? <Loading />
              : state === "login" ? <Text style={[st.body, { color: t.muted }]}>{ct("signInFollowing")}</Text>
              : state === "error" ? <Text style={[st.body, { color: t.muted }]}>{ct("error")}</Text>
              : b?.needCountry ? <Text style={[st.body, { color: t.muted }]}>{ct("needCountry")}</Text>
              : !rows.length ? <Text style={[st.body, { color: t.muted }]}>{ct("boardEmpty")}</Text>
              : (
                <>
                  <View style={{ borderRadius: 22, overflow: "hidden" }}>
                    <LinearGradient colors={[stage.glow, stage.bg, stage.deep]} style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 10, paddingTop: 22 }}>
                      <View pointerEvents="none" style={StyleSheet.absoluteFill}><StarLattice opacity={0.07} /></View>
                      {[rows[1], rows[0], rows[2]].map((r, i) => r ? <Podium key={r.username} r={r} place={[2, 1, 3][i]} unit={unit} f={f} onPress={() => open(r)} /> : <View key={i} style={{ flex: 1 }} />)}
                    </LinearGradient>
                  </View>
                  {b?.me ? (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: goldButton.line, backgroundColor: "rgba(214,180,108,0.1)" }}>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{ct("yourPlace")}</Text>
                      <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink, fontVariant: ["tabular-nums"] }}>{b.me.rank ? `#${f(b.me.rank)}` : "–"}{b.me.pct ? `  ·  ${ct("topPct", { n: f(b.me.pct) })}` : ""}</Text>
                    </View>
                  ) : null}
                  <View>
                    {rows.slice(3).map((r) => (
                      <Pressable key={r.username} onPress={() => open(r)} accessibilityRole="link" accessibilityLabel={`${r.rank}. ${r.name}, ${f(r.score)} ${unit}`}
                        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 58, paddingHorizontal: 6, borderRadius: R.lg, backgroundColor: r.me ? "rgba(214,180,108,0.12)" : pressed ? t.surface : "transparent" })}>
                        <Text style={{ width: 32, textAlign: "center", fontFamily: FONT.bold, fontSize: 14, color: t.muted, fontVariant: ["tabular-nums"] }}>{r.rank}</Text>
                        <TalentAvatar name={r.name} size={40} uri={r.avatar} badge={r.badge} />
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{r.name}</Text>
                            {r.badge ? <BadgeMark badge={r.badge} size={14} /> : null}
                          </View>
                          <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{r.country ? countryName(r.country, lang) : `@${r.username}`}</Text>
                        </View>
                        {r.country ? <CountryBadge code={r.country} size={24} /> : null}
                        <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink, fontVariant: ["tabular-nums"] }}>{`${f(r.score)} `}<Text style={{ fontFamily: FONT.medium, color: t.muted }}>{unit}</Text></Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={[st.small, { color: t.muted }]}>{ct("listedN", { n: f(b?.named ?? 0) })}</Text>
                </>
              )}
            <View style={{ borderRadius: R.lg, backgroundColor: "rgba(214,180,108,0.12)", padding: 14 }}><Text style={[st.body, { color: t.ink }]}>{ct("humility")}</Text></View>
            <Text style={[st.small, { color: t.muted }]}>{ct("privacyNote")}</Text>
          </View>
        </Page>
      </View>
      <CountryPicker visible={picking} onClose={() => setPicking(false)} onPick={(c) => { setPicking(false); if (c) setCountry(c); }} />
    </>
  );
}

function Podium({ r, place, unit, f, onPress }: { r: BoardRow; place: number; unit: string; f: (n: number) => string; onPress: () => void }) {
  const first = place === 1;
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={`${place}. ${r.name}, ${f(r.score)} ${unit}`} style={{ flex: 1, alignItems: "center", gap: 5 }}>
      <View style={{ padding: 2, borderRadius: 60, borderWidth: first ? 2.5 : 1.5, borderColor: first ? "#E2C77F" : "rgba(214,180,108,0.6)" }}>
        <TalentAvatar name={r.name} size={first ? 68 : 52} uri={r.avatar} badge={r.badge} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, maxWidth: "100%" }}>
        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 13.5, color: "#fff" }}>{r.name}</Text>
        {r.badge ? <BadgeMark badge={r.badge} size={12} /> : null}
      </View>
      {r.country ? <CountryBadge code={r.country} size={20} /> : null}
      <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 12.5, color: stage.cream, fontVariant: ["tabular-nums"] }}>{`${f(r.score)} ${unit}`}</Text>
      <View style={{ alignSelf: "stretch", height: first ? 74 : place === 2 ? 52 : 38, borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: first ? goldButton.to : place === 2 ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginTop: 4 }}>
        <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: 24, color: first ? goldButton.text : "#fff" }}>{place}</Text>
      </View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  body: { fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21 },
  small: { fontFamily: FONT.regular, fontSize: 13, lineHeight: 18 },
});
