import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { Page, PageHero, Loading } from "@/components/page";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { T, type BadgeState } from "@/features/talents/api";
import { useTT, type TKey } from "@/features/talents/text";
import { BadgeMark, type Badge } from "@/features/talents/badges";
import { AccessGate, Muted, SafetyBar, useTalentAccess, useTalentErr } from "@/features/talents/ui";

// /talents/badges – the three badges and what is still missing for each (all automatic):
// emerald (confirmed, complete profile), gold (Reciter Path certificate), official star (YouTube channel or invitation).
export default function Badges() {
  const t = useTheme();
  const tt = useTT();
  const err = useTalentErr();
  const { lang } = useLang();
  const a = useTalentAccess();
  const q = useLocalSearchParams<{ official?: string }>();
  const [s, setS] = useState<BadgeState | null>(null);
  const [msg, setMsg] = useState("");
  const [result, setResult] = useState<string | null>(q.official ?? null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => { T.badges().then(setS).catch((e) => setMsg(err(e))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (a.state === "ok") load(); }, [a.state, load]);

  const youtube = async () => {
    setBusy(true); setMsg(""); setResult(null);
    try {
      const { url } = await T.officialLink(lang);
      const r = await WebBrowser.openAuthSessionAsync(url, "quranmasterclass://talents/badges");
      if (r.type === "success") { const m = /[?&]official=([a-z]+)/.exec(r.url); setResult(m?.[1] ?? "error"); }
      load();
    } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };

  const row = (ok: boolean | null, label: string, action?: [string, () => void]) => (
    <View key={label} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }} accessible accessibilityLabel={`${label}: ${ok ? tt("pathDone") : tt("pathOpen")}`}>
      <View style={{ width: 22, height: 22, borderRadius: 11, marginTop: 1, alignItems: "center", justifyContent: "center", backgroundColor: ok ? goldButton.to : "transparent", borderWidth: ok ? 0 : 1.5, borderColor: t.line }}>
        {ok ? <Icon name="check" color={goldButton.text} size={13} weight={2.6} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 20, color: t.ink }}>{label}</Text>
        {action && !ok ? <Pressable onPress={action[1]} accessibilityRole="button" style={{ minHeight: 34, justifyContent: "center", alignSelf: "flex-start" }}><Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{action[0]}</Text></Pressable> : null}
      </View>
    </View>
  );
  const card = (b: Badge, ok: boolean, children: React.ReactNode) => (
    <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: ok ? goldButton.line : t.line, backgroundColor: t.surface, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <BadgeMark badge={b} size={30} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{tt(`badge_${b}` as TKey)}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: ok ? t.accent : t.muted }}>{ok ? tt("badgeHave") : tt("badgeNotYet")}</Text>
        </View>
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted }}>{tt(`badge_${b}_text` as TKey)}</Text>
      {children}
    </View>
  );
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset arcade={false} eyebrow={tt("network")} title={tt("badgeMine")} lead={tt("badgesLead")} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 14 }}>
            {result ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14.5, lineHeight: 21, color: result === "ok" ? t.accent : t.danger }}>{tt(`official_${result}` as TKey) || tt("e_generic")}</Text> : null}
            {msg ? <Muted>{msg}</Muted> : !s ? <Loading /> : (
              <>
                {card("emerald", s.emerald.ok, (
                  <View style={{ gap: 8 }}>
                    {row(s.emerald.email, tt("reqEmail"))}
                    {s.emerald.phone !== null ? row(s.emerald.phone, tt("reqPhone")) : null}
                    {row(s.emerald.age, tt("reqAge"))}
                    {row(s.emerald.profile, tt("reqProfile"), [tt("editProfile"), () => router.push("/community/me" as Href)])}
                    {row(s.emerald.guidelines, tt("reqGuidelines"), [tt("guidelines"), () => router.push("/community/me" as Href)])}
                  </View>
                ))}
                {card("gold", s.gold.ok, (
                  <View style={{ gap: 8 }}>
                    {row(s.emerald.ok, tt("reqEmerald"))}
                    {row(s.gold.level >= s.gold.need, tt("reqLevel", { n: s.gold.need, m: s.gold.level }), [tt("pathLevelGo"), () => router.push("/reciter-path" as Href)])}
                  </View>
                ))}
                {card("official", s.official.ok, s.official.ok ? (
                  s.official.channel ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.gold }}>{tt("officialChannel", { c: s.official.channel })}</Text> : null
                ) : (
                  <View style={{ gap: 10 }}>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.ink }}>{tt("officialHow", { n: Intl.NumberFormat(lang).format(s.official.minSubscribers) })}</Text>
                    {s.official.available ? <GoldButton title={tt("connectYoutube")} onPress={() => void youtube()} busy={busy} disabled={busy} />
                      : <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{tt("officialSoon")}</Text>}
                    <OutlineButton title={tt("inviteTitle")} onPress={() => router.push("/talents/invite" as Href)} />
                  </View>
                ))}
              </>
            )}
            <SafetyBar />
          </View>
        </AccessGate>
      </Page>
    </>
  );
}
