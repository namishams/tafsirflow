import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FONT, R, goldButton, goldHair, stage, useTheme } from "@/lib/theme";
import { Page, PageHero, Loading } from "@/components/page";
import { Chip, GoldButton, OutlineButton, Segmented } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { countryName } from "@/lib/countries";
import { Medal } from "@/features/progress/art";
import { BadgeMark } from "@/features/talents/badges";
import { CountryPicker } from "@/features/talents/CountryPicker";
import { ListBox, Muted, TalentAvatar } from "@/features/talents/ui";
import { METRICS, rankingsApi, resetMyRanking, type CountryRow, type Hall, type Listing, type Metric, type Row, type Scope, type Settings } from "./api";
import { CountryBadge } from "./Flag";
import { useRT, type RKey } from "./text";

// The worldwide rankings screen (emerald and gold): World / My country / Friends / Countries, metric switcher, the member's
// own rank pinned at the bottom, the weekly reset countdown, the opt-in, and the hall of fame. Opt-in and privacy-safe:
// only members who joined appear by name (server rules in src/lib/rankings.ts).
const MEDAL = ["#e2c77f", "#cfd5db", "#cd8f5e"];
const UNIT: Record<Metric, RKey> = { xp_week: "u_xp", xp_total: "u_xp", streak: "u_days", verses: "u_verses", stickers: "u_stickers", mashaallah: "u_mashaallah" };

export function RankingsScreen() {
  const t = useTheme();
  const rt = useRT();
  const { lang } = useLang();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const nf = useMemo(() => new Intl.NumberFormat(lang), [lang]);
  const [scope, setScope] = useState<Scope>("world");
  const [metric, setMetric] = useState<Metric>("xp_week");
  const [period, setPeriod] = useState<"week" | "all">("week");
  const [mode, setMode] = useState<"total" | "per_capita">("total");
  const [cm, setCm] = useState<"xp" | "stickers" | "verses">("xp");
  const [country, setCountry] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [data, setData] = useState<Listing | null>(null);
  const [err, setErr] = useState(false);
  const [set, setSet] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<"ranks" | "hall">("ranks");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(i); }, []);

  const loadSettings = useCallback(() => {
    if (!user) { setSet(null); return; }
    rankingsApi.settings().then((r) => { setSet(r.settings); }).catch(() => setSet(null));
  }, [user]);
  useEffect(loadSettings, [loadSettings]);

  const load = useCallback(() => {
    if (scope === "friends" && !user) { setData(null); return; }
    setErr(false); setData(null);
    rankingsApi.list({ scope, metric, country, period, cm, mode }).then(setData).catch(() => setErr(true));
  }, [scope, metric, country, period, cm, mode, user]);
  useEffect(() => { if (view === "ranks") load(); }, [load, view]);
  useEffect(() => { if (scope === "country" && !country && set?.country) setCountry(set.country); }, [scope, set, country]);

  const save = async (body: { optIn?: boolean; countCountry?: boolean }) => {
    setBusy(true);
    try { const r = await rankingsApi.save(body); setSet(r.settings); resetMyRanking(); load(); } catch { /* shown by the unchanged switch */ }
    setBusy(false);
  };

  const left = Math.max(0, new Date(data?.resetsAt ?? now + 86_400_000).getTime() - now);
  const d = Math.floor(left / 86_400_000), h = Math.floor((left % 86_400_000) / 3_600_000), m = Math.floor((left % 3_600_000) / 60_000);
  const countdown = d > 0 ? `${d} ${rt("u_days")} ${h}h` : `${h}h ${m}m`;
  const rows = data?.rows ?? [];
  const me = data?.me;
  const myRow = rows.find((r) => r.me);
  const open = (u: string) => router.push(`/talents/u/${u}` as Href);
  const pinned = !!user && view === "ranks" && scope !== "countries" && !!set?.world;

  const scopes: [Scope, string][] = [["world", rt("tab_world")], ["country", rt("tab_country")], ["friends", rt("tab_friends")], ["countries", rt("tab_countries")]];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <Page style={{ paddingBottom: pinned ? 150 : 130 }}>
          <PageHero back topInset arcade={false} eyebrow={rt("eyebrow")} title={rt("title")} lead={rt("lead")}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Icon name="clock" color={stage.gold} size={15} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: stage.cream }}>{rt("resetsIn", { t: countdown })}</Text>
            </View>
          </PageHero>

          <View style={{ padding: 16, gap: 14 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingEnd: 8 }}>
              <Segmented<Scope> value={view === "hall" ? null : scope} onChange={(v) => { setScope(v); setView("ranks"); }} options={scopes} />
            </ScrollView>

            {view === "ranks" ? (
              <>
                {scope !== "countries" ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {METRICS.map((x) => <Chip key={x} label={rt(`m_${x}` as RKey)} selected={metric === x} onPress={() => setMetric(x)} />)}
                  </View>
                ) : (
                  <View style={{ gap: 10 }}>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted }}>{rt("countriesLead", { n: data?.minCountryMembers ?? 5 })}</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {(["xp", "stickers", "verses"] as const).map((x) => <Chip key={x} label={rt(`cm_${x}` as RKey)} selected={cm === x} onPress={() => setCm(x)} />)}
                    </View>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {(["week", "all"] as const).map((x) => <Chip key={x} label={rt(`p_${x}` as RKey)} selected={period === x} onPress={() => setPeriod(x)} />)}
                      {(["total", "per_capita"] as const).map((x) => <Chip key={x} label={rt(x === "total" ? "mode_total" : "mode_per")} selected={mode === x} onPress={() => setMode(x)} />)}
                    </View>
                  </View>
                )}

                {scope === "country" ? (
                  <Pressable onPress={() => setPicker(true)} accessibilityRole="button" accessibilityLabel={rt("pickCountry")}
                    style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
                    <CountryBadge code={country} size={34} />
                    <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{country ? countryName(country, lang) : rt("pickCountry")}</Text>
                    <Icon name="chevronDown" color={t.muted} size={18} />
                  </Pressable>
                ) : null}

                <JoinCard set={set} signedIn={!!user} busy={busy} onJoin={() => void save({ optIn: true })} onLeave={() => void save({ optIn: false })} onCount={(v) => void save({ countCountry: v })} />

                {scope === "friends" && !user ? <Muted>{rt("signInFriends")}</Muted> : err ? <Muted>{rt("error")}</Muted> : !data ? <Loading /> : scope === "countries" ? (
                  !data.countries?.length ? <Muted>{rt("empty")}</Muted> : (
                    <ListBox>
                      {data.countries.map((c, i) => <CountryLine key={c.country} c={c} first={i === 0} mode={mode} cm={cm} nf={nf} />)}
                    </ListBox>
                  )
                ) : scope === "country" && data.needCountry ? <Muted>{rt("needCountry")}</Muted> : !rows.length ? <Muted>{scope === "friends" ? rt("friendsEmpty") : rt("empty")}</Muted> : (
                  <>
                    <Podium rows={rows.slice(0, 3)} metric={metric} nf={nf} onOpen={open} />
                    {rows.length > 3 ? (
                      <ListBox>
                        {rows.slice(3).map((r, i) => <MemberLine key={r.username} r={r} first={i === 0} metric={metric} nf={nf} onOpen={open} />)}
                      </ListBox>
                    ) : null}
                  </>
                )}
              </>
            ) : <HallView />}

            <View style={{ gap: 4 }}>
              <Pressable onPress={() => setView(view === "hall" ? "ranks" : "hall")} accessibilityRole="button" style={{ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Icon name="trophy" color={t.accent} size={17} />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.accent }}>{view === "hall" ? rt("tab_world") : rt("hallTitle")}</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/ranking-points" as Href)} accessibilityRole="link" style={{ minHeight: 44, justifyContent: "center" }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.accent }}>{rt("pointsLink")}</Text>
              </Pressable>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}><Text style={{ fontFamily: FONT.bold }}>{rt("privacy")}. </Text>{rt("privacyNote")}</Text>
            </View>
          </View>
        </Page>

        {pinned ? (
          <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom, 12) + 4 }}>
            <LinearGradient colors={["#0b3d2e", "#08261d"]} style={{ borderRadius: R.card, borderWidth: 1, borderColor: goldHair, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Icon name="trophy" color={stage.gold} size={20} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", color: stage.textMuted }}>{rt("yourRank")}</Text>
                <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.display, fontSize: 22, color: stage.cream }}>
                  {(scope === "friends" ? myRow?.rank : me?.rank) ? `#${nf.format((scope === "friends" ? myRow?.rank : me?.rank) as number)}` : rt("notRanked")}
                  {scope === "world" && me?.countryRank && me.country ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: stage.textSoft }}>{`  ·  ${rt("rankCountry", { n: me.countryRank, c: countryName(me.country, lang) })}`}</Text> : null}
                </Text>
                {me?.pending ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted }}>{rt("pending")}</Text> : null}
              </View>
              {(me?.score ?? myRow?.score) ? <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: stage.gold }}>{nf.format((scope === "friends" ? myRow?.score : me?.score) ?? 0)}</Text> : null}
            </LinearGradient>
          </View>
        ) : null}
      </View>
      <CountryPicker visible={picker} onClose={() => setPicker(false)} onPick={(c) => { setPicker(false); if (c) setCountry(c); }} />
    </>
  );
}

function JoinCard({ set, signedIn, busy, onJoin, onLeave, onCount }: { set: Settings | null; signedIn: boolean; busy: boolean; onJoin: () => void; onLeave: () => void; onCount: (v: boolean) => void }) {
  const t = useTheme();
  const rt = useRT();
  const tr = useT();
  if (!signedIn) {
    return (
      <View style={{ gap: 10, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink }}>{rt("signIn")}</Text>
        <OutlineButton title={tr("account.signIn")} onPress={() => router.push("/sign-in" as Href)} />
      </View>
    );
  }
  if (!set) return null;
  return (
    <View style={{ gap: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: set.world ? t.line : goldButton.line, backgroundColor: set.world ? t.surface : "rgba(201,166,94,0.1)" }}>
      {!set.world ? (
        <>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink }}>{rt("optInTitle")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted }}>{set.age16 ? rt("optInBody") : rt("age16")}</Text>
          {!set.hasProfile ? (
            <>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{rt("needProfile")}</Text>
              <OutlineButton title={rt("optInBtn")} onPress={() => router.push("/community/me" as Href)} />
            </>
          ) : <GoldButton title={rt("optInBtn")} onPress={onJoin} busy={busy} />}
        </>
      ) : null}
      {set.hasProfile ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{rt("count")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{set.country ? rt("countHint") : rt("needCountry")}</Text>
          </View>
          <Switch value={set.countCountry} disabled={busy} onValueChange={onCount} trackColor={{ true: t.accent, false: t.line }} accessibilityLabel={rt("count")} />
        </View>
      ) : null}
      {set.world ? <OutlineButton title={rt("optOutBtn")} onPress={onLeave} disabled={busy} /> : null}
    </View>
  );
}

function Podium({ rows, metric, nf, onOpen }: { rows: Row[]; metric: Metric; nf: Intl.NumberFormat; onOpen: (u: string) => void }) {
  const t = useTheme();
  const rt = useRT();
  const order = [1, 0, 2].filter((i) => rows[i]);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, paddingVertical: 8 }}>
      {order.map((i) => {
        const r = rows[i];
        const first = i === 0;
        return (
          <Pressable key={r.username} onPress={() => onOpen(r.username)} accessibilityRole="button" accessibilityLabel={`${rt("tab_world")} ${r.rank}, ${r.name}, ${nf.format(r.score)} ${rt(UNIT[metric])}`}
            style={{ flex: 1, alignItems: "center", gap: 4, paddingTop: first ? 0 : 24 }}>
            <View>
              <TalentAvatar name={r.name} size={first ? 84 : 64} uri={r.avatar} badge={r.badge} />
              <View style={{ position: "absolute", bottom: -10, alignSelf: "center" }}><Medal place={Math.min(r.rank, 99)} color={MEDAL[Math.min(2, r.rank - 1)] ?? MEDAL[2]} size={first ? 34 : 30} /></View>
            </View>
            <Text numberOfLines={2} style={{ marginTop: 14, textAlign: "center", fontFamily: FONT.bold, fontSize: 13.5, color: r.me ? t.accent : t.ink }}>{r.name}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              {r.country ? <CountryBadge code={r.country} size={18} /> : null}
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{nf.format(r.score)}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function MemberLine({ r, first, metric, nf, onOpen }: { r: Row; first: boolean; metric: Metric; nf: Intl.NumberFormat; onOpen: (u: string) => void }) {
  const t = useTheme();
  const rt = useRT();
  return (
    <Pressable onPress={() => onOpen(r.username)} accessibilityRole="button" accessibilityLabel={`${r.rank}, ${r.name}, @${r.username}, ${nf.format(r.score)} ${rt(UNIT[metric])}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 11, minHeight: 62, backgroundColor: r.me ? t.accentSoft : pressed ? t.bg : t.surface, borderTopWidth: first ? 0 : 1, borderTopColor: t.line })}>
      <Text style={{ width: 30, textAlign: "center", fontFamily: FONT.display, fontSize: 18, color: t.muted }}>{r.rank}</Text>
      <TalentAvatar name={r.name} size={40} uri={r.avatar} badge={r.badge} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{r.name}</Text>
          {r.badge ? <BadgeMark badge={r.badge} size={14} /> : null}
        </View>
        <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left", writingDirection: "ltr" }}>@{r.username}</Text>
      </View>
      {r.country ? <CountryBadge code={r.country} size={28} /> : null}
      <View style={{ alignItems: "flex-end", minWidth: 56 }}>
        <Text style={{ fontFamily: FONT.display, fontSize: 17, color: r.me ? goldButton.to : t.ink }}>{nf.format(r.score)}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{rt(UNIT[metric])}</Text>
      </View>
    </Pressable>
  );
}

function CountryLine({ c, first, mode, cm, nf }: { c: CountryRow; first: boolean; mode: "total" | "per_capita"; cm: "xp" | "stickers" | "verses"; nf: Intl.NumberFormat }) {
  const t = useTheme();
  const rt = useRT();
  const { lang } = useLang();
  return (
    <View accessible accessibilityLabel={`${c.rank}, ${countryName(c.country, lang)}, ${nf.format(mode === "total" ? c.total : c.perCapita)}`}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 11, minHeight: 62, backgroundColor: c.me ? t.accentSoft : t.surface, borderTopWidth: first ? 0 : 1, borderTopColor: t.line }}>
      {c.rank <= 3 ? <Medal place={c.rank} color={MEDAL[c.rank - 1]} size={32} /> : <Text style={{ width: 32, textAlign: "center", fontFamily: FONT.display, fontSize: 18, color: t.muted }}>{c.rank}</Text>}
      <CountryBadge code={c.country} size={36} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{countryName(c.country, lang)}</Text>
        <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{rt("membersN", { n: nf.format(c.members) })} · {rt("activeN", { n: nf.format(c.active) })}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontFamily: FONT.display, fontSize: 17, color: t.ink }}>{nf.format(mode === "total" ? c.total : c.perCapita)}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{mode === "total" ? rt(`cm_${cm}` as RKey) : rt("mode_per")}</Text>
      </View>
    </View>
  );
}

/** the hall of fame: per closed year the top three members per metric and the best countries */
function HallView() {
  const t = useTheme();
  const rt = useRT();
  const { lang } = useLang();
  const nf = useMemo(() => new Intl.NumberFormat(lang), [lang]);
  const [hall, setHall] = useState<Hall[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { rankingsApi.hall().then((d) => setHall(d.hall)).catch(() => setErr(true)); }, []);
  if (err) return <Muted>{rt("error")}</Muted>;
  if (!hall) return <Loading />;
  const cats: { key: string; label: RKey; unit: RKey }[] = [
    { key: "xp_season", label: "hallXp", unit: "u_xp" }, { key: "streak", label: "hallStreak", unit: "u_days" }, { key: "verses", label: "hallVerses", unit: "u_verses" },
    { key: "stickers", label: "hallStickers", unit: "u_stickers" }, { key: "mashaallah", label: "hallMashaallah", unit: "u_mashaallah" },
  ];
  return (
    <View style={{ gap: 14 }}>
      <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{rt("hallTitle")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{rt("hallLead")}</Text>
      {!hall.length ? <Muted>{rt("hallEmpty")}</Muted> : hall.map((h) => (
        <View key={h.season.key} style={{ gap: 10 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.gold }}>{rt("yearN", { n: h.season.key })}</Text>
          {cats.map((c) => (h.members[c.key]?.length ?? 0) > 0 ? (
            <View key={c.key} style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 12, gap: 8 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", color: t.muted }}>{rt(c.label)}</Text>
              {h.members[c.key].map((r) => (
                <Pressable key={r.username} onPress={() => router.push(`/talents/u/${r.username}` as Href)} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40 }}>
                  <Medal place={r.rank} color={MEDAL[Math.min(2, r.rank - 1)]} size={26} />
                  <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{r.name}</Text>
                  {r.country ? <CountryBadge code={r.country} size={22} /> : null}
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{nf.format(r.score)} {rt(c.unit)}</Text>
                </Pressable>
              ))}
            </View>
          ) : null)}
          {([[rt("hallCountry"), h.countries.total], [rt("hallPerCapita"), h.countries.perCapita]] as const).map(([label, list]) => list.length ? (
            <View key={label} style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 12, gap: 8 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", color: t.muted }}>{label}</Text>
              {list.map((c) => (
                <View key={c.country} style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40 }}>
                  <Medal place={c.rank} color={MEDAL[Math.min(2, c.rank - 1)]} size={26} />
                  <CountryBadge code={c.country} size={26} />
                  <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{countryName(c.country, lang)}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{nf.format(c.score)}</Text>
                </View>
              ))}
            </View>
          ) : null)}
        </View>
      ))}
    </View>
  );
}
