import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { isRTL, useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { api } from "@/lib/api";
import { getChapters, getVerseByKey, translationFor, type Chapter, type SingleVerse } from "@/lib/quran";
import { ARABIC_FONT, AR_RIGHT, FONT, R, stage, useTheme } from "@/lib/theme";
import { ErrorState } from "@/components/page";
import { MyLikes } from "@/features/extra/MyLikes";
import { openVerse } from "@/features/extra/links";
import { Callout, H2, Hero, LightChip, MoreTiles, Niche, PageScroll, useGold } from "@/features/practice/art";

// /community – what learners listen to, love and share (website: app/[locale]/(app)/community/page.tsx).
// The figures come from GET /api/social/community (the same function the website page uses); verse texts and surah
// names from the app's own Quran data.
type Kind = "loved" | "viewed" | "shared" | "discussed";
const KINDS: Kind[] = ["loved", "viewed", "shared", "discussed"];
type Overview = {
  on: boolean; kind: Kind; range: "week" | "all";
  pulse: { listenersToday: number; secondsToday: number; viewersToday: number; likes: number; secondsWeek: number; likesWeek: number } | null;
  top: { key: string; n: number }[];
  heard: { surah: number; seconds: number }[];
  comments: { id: number | string; key: string; body: string; author: string; country?: string | null }[];
};

const hours = (sec: number) => Math.round((sec / 3600) * 10) / 10;

export default function CommunityScreen() {
  const { lang } = useLang();
  const t = useWebT("community");
  const th = useTheme();
  const g = useGold();
  const [kind, setKind] = useState<Kind>("loved");
  const [all, setAll] = useState(false);
  const [ov, setOv] = useState<Overview | null>(null);
  const [failed, setFailed] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [verses, setVerses] = useState<Record<string, SingleVerse>>({});
  const nf = useCallback((n: number) => { try { return new Intl.NumberFormat(lang, { numberingSystem: "latn" } as Intl.NumberFormatOptions).format(n); } catch { return String(n); } }, [lang]);

  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);

  const load = useCallback(() => {
    setFailed(false);
    let live = true;
    api<Overview>(`/api/social/community?tab=${kind}${all ? "&range=all" : ""}`)
      .then((d) => { if (live) setOv(d); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [kind, all]);
  useEffect(() => load(), [load]);

  // verse texts of the top list in the reader's language
  useEffect(() => {
    if (!ov?.top.length) return;
    let live = true;
    translationFor(lang).then((tr) => Promise.all(ov.top.map((x) => getVerseByKey(x.key, lang, tr).then((v) => [x.key, v] as const).catch(() => null))))
      .then((list) => { if (live) setVerses((old) => { const n = { ...old }; for (const e of list) if (e) n[`${lang}:${e[0]}`] = e[1]; return n; }); })
      .catch(() => undefined);
    return () => { live = false; };
  }, [ov, lang]);

  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${s}`;
  const pl = ov?.pulse;
  const stats = pl ? [
    { n: nf(pl.listenersToday), l: t("pListeners") }, { n: nf(hours(pl.secondsToday)), l: t("pHoursToday") },
    { n: nf(pl.viewersToday), l: t("pViewers") }, { n: nf(pl.likes), l: t("pLikes") },
  ] : [];
  const kindNow = ov?.kind ?? kind;
  const hero = (
    <Hero kicker={t("kicker")} title={t("title")} lead={t("lead")} word={"معًا"} arcade={false}>
      {stats.length ? (
        <View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", borderRadius: R.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            {stats.map((s, i) => (
              <View key={s.l} accessible accessibilityLabel={`${s.n} ${s.l}`}
                style={{ width: "50%", paddingHorizontal: 16, paddingVertical: 16, borderColor: "rgba(255,255,255,0.1)", borderTopWidth: i > 1 ? 1 : 0, borderStartWidth: i % 2 ? 1 : 0 }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 28, color: stage.gold, fontVariant: ["tabular-nums"] }}>{s.n}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{s.l}</Text>
              </View>
            ))}
          </View>
          {pl ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.55)", marginTop: 16 }}>{t("pWeek", { h: nf(hours(pl.secondsWeek)), likes: nf(pl.likesWeek) })}</Text> : null}
        </View>
      ) : null}
    </Hero>
  );

  if (failed && !ov) {
    return <><Stack.Screen options={{ headerShown: false }} /><PageScroll>{hero}<View style={{ padding: 16 }}><ErrorState retry={load} /></View></PageScroll></>;
  }
  if (ov && !ov.on) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <PageScroll>
          {hero}
          <View style={{ paddingHorizontal: 16, paddingTop: 40 }}>
            <Callout style={{ padding: 24 }}><Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: th.ink, textAlign: "center" }}>{t("paused")}</Text></Callout>
          </View>
          <MoreTiles keys={["ranking", "stats", "radio", "secrets"]} />
        </PageScroll>
      </>
    );
  }

  const heard = ov?.heard ?? [];
  const max = heard[0]?.seconds || 1;
  const muted = { fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: th.muted } as const;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PageScroll>
        {hero}

        <View style={{ paddingHorizontal: 16, paddingTop: 40, width: "100%", maxWidth: 1100, alignSelf: "center" }}>
          <H2>{t("topTitle")}</H2>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 20 }} accessibilityRole="tablist">
            {KINDS.map((k) => <LightChip key={k} label={t(`k_${k}`)} on={kindNow === k} onPress={() => setKind(k)} />)}
          </View>
          {kindNow === "loved" || kindNow === "viewed" ? (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <LightChip label={t("week")} on={!all} onPress={() => setAll(false)} />
              <LightChip label={t("allTime")} on={all} onPress={() => setAll(true)} />
            </View>
          ) : null}
          {!ov ? <View style={{ height: 160, borderRadius: 14, backgroundColor: th.line, opacity: 0.4, marginTop: 24 }} /> : ov.top.length === 0 ? <Text style={[muted, { marginTop: 24 }]}>{t("empty")}</Text> : (
            <View style={{ gap: 16, marginTop: 24 }}>
              {ov.top.map((x, i) => {
                const v = verses[`${lang}:${x.key}`];
                const s = Number(x.key.split(":")[0]);
                return (
                  <View key={x.key} style={{ borderRadius: 14, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface, padding: 20, overflow: "hidden" }}>
                    <Niche color={`rgba(${g},0.2)`} />
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
                        <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: `rgba(${g},0.5)`, alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ fontFamily: FONT.display, fontSize: 14, color: th.gold }}>{i + 1}</Text>
                        </View>
                        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 12, letterSpacing: isRTL(lang) ? 0 : 1.4, textTransform: "uppercase", color: th.gold }}>{name(s)} · {x.key}</Text>
                      </View>
                      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: th.ink }}>{nf(x.n)} <Text style={{ fontFamily: FONT.regular, color: th.muted }}>{t(`u_${kindNow}`)}</Text></Text>
                    </View>
                    {v ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 54, color: th.arabic, writingDirection: "rtl", textAlign: AR_RIGHT, marginTop: 12 }}>{v.text_uthmani}</Text> : null}
                    {v?.translation ? <Text style={[muted, { marginTop: 8 }]}>{v.translation}</Text> : null}
                    <Text onPress={() => openVerse(x.key)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.accent, marginTop: 16, alignSelf: "flex-start" }}>{t("listen")}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ marginTop: 48, borderTopWidth: 1, borderBottomWidth: 1, borderColor: th.line, backgroundColor: th.surface }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 40, gap: 40, width: "100%", maxWidth: 1100, alignSelf: "center" }}>
            <View>
              <H2>{t("heardTitle")}</H2>
              {ov && heard.length === 0 ? <Text style={[muted, { marginTop: 20 }]}>{t("empty")}</Text> : (
                <View style={{ gap: 12, marginTop: 20 }}>
                  {heard.map((h, i) => (
                    <Pressable key={h.surah} onPress={() => router.push(`/quran/${h.surah}` as Href)} accessibilityRole="link" accessibilityLabel={`${i + 1}. ${name(h.surah)}`}>
                      {({ pressed }) => (
                        <View>
                          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                            <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: pressed ? th.accent : th.ink }}>{i + 1}. {name(h.surah)}</Text>
                            <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted }}>{t("hoursN", { n: nf(hours(h.seconds)) })}</Text>
                          </View>
                          <View style={{ height: 6, borderRadius: 3, backgroundColor: th.line, marginTop: 6, overflow: "hidden" }}>
                            <View style={{ height: 6, borderRadius: 3, backgroundColor: th.gold, width: `${Math.max(4, (h.seconds / max) * 100)}%` }} />
                          </View>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
            <View>
              <H2>{t("commentsTitle")}</H2>
              {ov && ov.comments.length === 0 ? <Text style={[muted, { marginTop: 20 }]}>{t("noComments")}</Text> : (
                <View style={{ gap: 12, marginTop: 20 }}>
                  {(ov?.comments ?? []).map((c) => {
                    const s = Number(c.key.split(":")[0]);
                    return (
                      <View key={c.id} style={{ borderRadius: R.md, borderWidth: 1, borderColor: th.line, backgroundColor: th.bg, padding: 16 }}>
                        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: th.muted }}>
                          <Text style={{ fontFamily: FONT.bold, color: th.ink }}>{c.author}</Text>{c.country ? ` · ${c.country}` : ""} ·{" "}
                          <Text onPress={() => openVerse(c.key)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, color: th.accent }}>{name(s)} {c.key}</Text>
                        </Text>
                        <Text numberOfLines={4} style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: th.ink, marginTop: 6 }}>{c.body}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 40, width: "100%", maxWidth: 1100, alignSelf: "center" }}>
          <H2 style={{ marginBottom: 20 }}>{t("mineTitle")}</H2>
          <MyLikes />
          <Callout style={{ padding: 20, marginTop: 32 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: th.ink }}>
              {t("ranking")} <Text onPress={() => router.push("/ranking")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, color: th.accent }}>{t("rankingCta")}</Text>
            </Text>
          </Callout>
        </View>
        <MoreTiles keys={["ranking", "stats", "radio", "secrets"]} />
      </PageScroll>
    </>
  );
}
