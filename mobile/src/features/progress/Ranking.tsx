import { useCallback, useEffect, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { PageHero } from "@/components/page";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { COUNTRIES } from "@/lib/countries";
import { getVerseByKey } from "@/lib/quran";
import { levelOf } from "@/web/points";
import { Callout, Medal, alpha } from "./art";
import { useNf } from "./hooks";
import { go } from "./links";
import { StepIn } from "./motion";
import { ArrowLink, GoldPill, InkSegmented } from "./ui";

// Ranking of members by points (week, month, all time) and of countries (website: Ranking.tsx, API /api/ranking).
// Works without an account (then with the website's sign-up hint); with the account's Bearer token it shows your place
// and lets you show your name.
type Entry = { place: number; points: number; total: number; country: string | null; me: boolean; name: string | null };
type Data = { participants: number; list: Entry[]; me: { rank: number | null; points: number; public: boolean } | null; disabled?: boolean };
type Country = { country: string; points: number; people: number };
const TABS = ["week", "month", "all", "countries"] as const;
type Tab = (typeof TABS)[number];
const MEDAL = ["#e9cf99", "#d9dee4", "#d49a6a"];

export function regionName(code: string | null, lang: string) {
  if (!code) return "";
  const n = COUNTRIES[code.toUpperCase()];
  return n ? n[lang === "de" ? 1 : 0] : code;
}

/** the verse above the ranking (83:26), from the server like every Quran text in the app */
function CompeteVerse() {
  const tr = useWebT("rewards");
  const { lang } = useLang();
  const [v, setV] = useState<{ text: string; key: string } | null>(null);
  useEffect(() => {
    let off = false;
    getVerseByKey("83:26", lang).then((x) => { if (!off) setV({ text: x.text_uthmani, key: x.verse_key }); }).catch(() => undefined);
    return () => { off = true; };
  }, [lang]);
  if (!v) return null;
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 16 }}>
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 48, color: stage.gold, writingDirection: "rtl", textAlign: "right" }}>{v.text}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{tr("verse83")} <Text style={{ color: "rgba(255,255,255,0.4)" }}>({v.key})</Text></Text>
    </View>
  );
}

export type RankingProps = { /** inside the profile: no hero, no page padding */ embedded?: boolean };

export function Ranking({ embedded = false }: RankingProps) {
  const t = useTheme();
  const tr = useWebT("rewards");
  const { lang } = useLang();
  const nf = useNf();
  const { user, ready } = useAuth();
  const [tab, setTab] = useState<Tab>("week");
  const [data, setData] = useState<Data | null>(null);
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [err, setErr] = useState(false);
  const [pub, setPub] = useState(false);
  const signedIn = ready ? !!user : null;

  const load = useCallback((x: Tab) => {
    setErr(false);
    if (x === "countries") {
      api<{ countries: Country[] }>("/api/ranking?range=month&by=country").then((d) => setCountries(d.countries ?? [])).catch(() => setErr(true));
    } else {
      setData(null);
      api<Data>(`/api/ranking?range=${x}`).then((d) => { setData(d); setPub(!!d.me?.public); }).catch(() => setErr(true));
    }
  }, []);
  useEffect(() => { load(tab); }, [tab, user?.id, load]);

  const toggle = async () => {
    const next = !pub; setPub(next);
    try {
      await api("/api/ranking", { body: { public: next } });
      api<Data>(`/api/ranking?range=${tab === "countries" ? "week" : tab}`).then(setData).catch(() => undefined);
    } catch { setPub(!next); }
  };
  const who = (e: Entry) => e.name ?? (e.country ? tr("learnerFrom", { c: regionName(e.country, lang) }) : tr("learner"));
  const top = data?.list.slice(0, 3) ?? [];
  const skeleton = <View style={{ marginTop: 32, height: 288, borderRadius: R.md, backgroundColor: alpha(t.line, 0.4) }} />;

  const body = (
    <View style={embedded ? undefined : { paddingHorizontal: 20, paddingVertical: 40 }}>
      <InkSegmented stretch value={tab} options={TABS.map((x) => [x, tr(`tab_${x}`)] as [Tab, string])} onChange={setTab} />

      {/* my place */}
      {tab !== "countries" && signedIn !== null ? (
        <Callout style={{ marginTop: 24, padding: 20 }}>
          {signedIn ? (
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: 1.9, textTransform: "uppercase", color: t.muted }}>{tr("yourPlace")}</Text>
                <Text style={{ fontFamily: FONT.display, fontSize: 30, color: t.ink, marginTop: 4 }}>
                  {data?.me?.rank ? `#${nf(data.me.rank)}` : "–"} <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: t.muted }}>· {tr("points", { n: nf(data?.me?.points ?? 0) })}</Text>
                </Text>
                {data ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 4 }}>{tr("participants", { n: nf(data.participants) })}</Text> : null}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Switch value={pub} onValueChange={() => void toggle()} trackColor={{ true: t.accent, false: t.line }} accessibilityLabel={tr("showName")} />
                <Pressable onPress={() => void toggle()} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{tr("showName")}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 16, color: t.muted }}>{tr("showNameHint")}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink }}>{tr("joinBody")}</Text>
              <GoldPill pill={false} arrow={false} title={tr("joinCta")} onPress={() => router.push("/register")} />
            </View>
          )}
        </Callout>
      ) : null}

      {err ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, marginTop: 32 }}>{tr("rankError")}</Text> : null}
      {data?.disabled ? <Callout style={{ marginTop: 32, padding: 20 }}><Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink }}>{tr("rankPaused")}</Text></Callout> : null}

      {tab === "countries" ? (
        countries ? (countries.length === 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, marginTop: 32 }}>{tr("rankEmpty")}</Text> : (
          <View style={{ marginTop: 32, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
            {countries.map((c, i) => (
              <View key={c.country} style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: t.line }}>
                <Text style={{ width: 32, textAlign: "center", fontFamily: FONT.display, fontSize: 20, color: t.muted }}>{i + 1}</Text>
                <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: t.line, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 11, color: t.ink }}>{c.country.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{regionName(c.country, lang)}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{tr("peopleN", { n: nf(c.people) })}</Text>
                </View>
                <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{nf(c.points)}</Text>
              </View>
            ))}
          </View>
        )) : !err ? skeleton : null
      ) : !data ? (!err ? skeleton : null) : data.disabled ? null : data.list.length === 0 ? (
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, marginTop: 32 }}>{tr("rankEmpty")}</Text>
      ) : (
        <>
          {/* podium */}
          <View style={{ marginTop: 40, flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
            {[1, 0, 2].map((i, k) => (
              <View key={i} style={{ flex: 1, minWidth: 0 }}>
                {top[i] ? (
                  <StepIn delay={k * 120} style={{ alignItems: "center", paddingTop: i === 0 ? 0 : 24 }}>
                    <Medal place={top[i].place} color={MEDAL[Math.min(2, top[i].place - 1)]} size={i === 0 ? 92 : 72} />
                    <Text numberOfLines={2} style={{ fontFamily: FONT.bold, fontSize: 14, lineHeight: 18, color: top[i].me ? t.accent : t.ink, marginTop: 8, textAlign: "center" }}>{who(top[i])}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "center" }}>{tr("points", { n: nf(top[i].points) })}</Text>
                    <Text style={{ fontFamily: CALLIG_FONT, fontSize: 18, lineHeight: 28, color: t.gold }}>{levelOf(top[i].total).ar}</Text>
                  </StepIn>
                ) : null}
              </View>
            ))}
          </View>
          {data.list.length > 3 ? (
            <View style={{ marginTop: 32, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
              {data.list.slice(3).map((e, i) => (
                <View key={`${e.place}-${e.points}-${e.name}-${e.country}`} style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: t.line, backgroundColor: e.me ? t.accentSoft : "transparent" }}>
                  <Text style={{ width: 32, textAlign: "center", fontFamily: FONT.display, fontSize: 20, color: t.muted }}>{e.place}</Text>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{who(e)}</Text>
                    <Text style={{ fontFamily: CALLIG_FONT, fontSize: 14, lineHeight: 22, color: t.gold, alignSelf: "flex-start" }}>{levelOf(e.total).ar}</Text>
                  </View>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{nf(e.points)}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: t.muted, marginTop: 24 }}>{tr("rankNote")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: t.muted, marginTop: 8 }}>{tr("intention")}</Text>
      <ArrowLink title={tr("toStats")} onPress={() => go("/stats")} style={{ marginTop: 24 }} />
    </View>
  );

  if (embedded) return body;
  return (
    <View>
      <PageHero back topInset eyebrow={tr("rankKicker")} title={tr("rankTitle")} lead={tr("rankLead")}>
        <CompeteVerse />
      </PageHero>
      {body}
    </View>
  );
}

export default Ranking;
