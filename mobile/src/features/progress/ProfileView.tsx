import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, Alert, Platform, Pressable, Share, Text, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { File, Paths } from "expo-file-system";
import Svg, { Path } from "react-native-svg";
import { Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { CALLIG_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useLang, useT } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { SITE, api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usePro, openPro } from "@/lib/pro";
import { getToken } from "@/lib/storage";
import { readJSON, removeKey, storedKeys, writeJSON } from "@/lib/store";
import { countryList } from "@/lib/countries";
import { GOALS } from "@/web/countries";
import { groupOf, MIN_YEAR } from "@/web/age";
import { readSrs, stats, weakestVerses } from "@/web/learning";
import { PASS, levelOf as academyLevel, readProgress, streakOf as academyStreak } from "@/web/academy";
import { TRACKS, cumulative, dayOfPlan, readPlan } from "@/web/plans";
import { TOTAL_VERSES } from "@/web/quranIndex";
import { VOCAB_DECKS } from "@/web/vocab";
import { TAJWEED_LESSONS } from "@/web/tajweed";
import { levelOf as pointsLevel, readPoints, streakOf as pointsStreak, totalPoints } from "@/web/points";
import { buildCtx, earnedIds, hoursOf, stickerById } from "@/web/stickers";
import { Callout, IllumFrame, LevelSeal, ProSeal, alpha, starPolygon } from "./art";
import { Sticker } from "./Sticker";
import { ProgressPanel } from "./ProgressPanel";
import { RewardsCard } from "./RewardsCard";
import { StatsView } from "./StatsView";
import { Ranking } from "./Ranking";
import { PickerField, SwitchField, TextField } from "./fields";
import { useLive, useNf } from "./hooks";
import { go } from "./links";
import { longDate } from "./format";
import { useText } from "./text";
import { Grid, useCols } from "./ui";
import { ConfirmCode } from "@/features/auth/ConfirmCode";
import { useAuthT } from "@/features/auth/text";

export const PROFILE_TABS = ["overview", "stats", "badges", "ranking", "learning", "account"] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];

type Profile = { email: string; birth_year: number | null; first_name: string | null; last_name: string | null; country: string | null; city: string | null; goal: string | null; locale: string | null; marketing_opt_in: boolean; email_verified: boolean; created_at: string; last_login_at: string | null; plan: string };
/** `hasPassword` false: an account created with an e-mail code or a passkey (it confirms the deletion with a code) */
type Data = { profile: Profile; sessions: number; social: { comments: number; likes: number }; hasPassword?: boolean };
type Form = { birthYear: string; firstName: string; lastName: string; country: string; city: string; goal: string; locale: string; marketing: boolean };

// Learning statistics from the synced account data (website: ProfileView.tsx collect())
function collect() {
  const srs = readSrs();
  const { streak, todayCount } = stats();
  const ac = readProgress();
  const plan = readPlan();
  const tr = plan ? TRACKS.find((x) => x.id === plan.track) : null;
  const k0 = readJSON<{ pos: number; deleted?: boolean } | null>("tf:khatm", null);
  const khatm = k0 && !k0.deleted ? k0 : null;
  const vocab = readJSON<Record<string, { box: number }>>("tf:vocab", {});
  const taj = readJSON<Record<string, number>>("tf:tajweed", {});
  const tajVals = Object.values(taj);
  return {
    streak: Math.max(streak, academyStreak(ac)), todayCount,
    xp: ac.xp, level: academyLevel(ac.xp), lessons: Object.values(ac.done).filter((x) => x >= PASS).length,
    inReview: Object.keys(srs).length, secured: Object.values(srs).filter((x) => x.stage >= 3).length,
    plan: plan && tr ? { day: Math.min(365, dayOfPlan(plan)), track: tr.id, learned: Object.values(plan.done).reduce((a, b) => a + b, 0), goal: cumulative(tr, 365) } : null,
    khatm: khatm ? Math.round((khatm.pos / TOTAL_VERSES) * 100) : null,
    vocab: Object.values(vocab).filter((x) => x.box >= 3).length, vocabTotal: VOCAB_DECKS.reduce((n, d) => n + d.words.length, 0),
    tajweedDone: tajVals.filter((x) => x >= 70).length, tajweedAvg: tajVals.length ? Math.round(tajVals.reduce((a, b) => a + b, 0) / tajVals.length) : null,
    bookmarks: readJSON<string[]>("tf:bookmarks", []).length, notes: Object.keys(readJSON<Record<string, unknown>>("tf:notes", {})).length, mnemos: Object.keys(readJSON<Record<string, string>>("tf:mnemo", {})).length,
    weak: weakestVerses(5, srs).filter((w) => w.strength < 0.8),
  };
}

/** the avatar: the first letter in a gilded sixteen-point star */
function Avatar({ letter }: { letter: string }) {
  return (
    <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }}>
      <Svg width={80} height={80} viewBox="0 0 100 100" style={{ position: "absolute" }}>
        <Path d={starPolygon(50, 50, 49, 41, 16)} fill="rgb(201,166,94)" fillOpacity={0.18} stroke="rgb(201,166,94)" strokeWidth={1.2} />
      </Svg>
      <Text style={{ fontFamily: FONT.display, fontSize: 30, color: "rgb(233,207,153)" }}>{letter}</Text>
    </View>
  );
}

/**
 * My profile: personal data, the complete learning statistics with stickers and ranking, security and privacy
 * (website: ProfileView.tsx). Needs a signed-in account (wrap it in RequireAccount).
 */
export function ProfileView({ initialTab = "overview" }: { initialTab?: ProfileTab }) {
  const t = useTheme();
  const tr = useWebT("profile");
  const tn = useWebT("nav");
  const ta = useT();
  const tx = useText();
  const { lang } = useLang();
  const nf = useNf();
  const { pro } = usePro();
  const { logout, deleteAccount } = useAuth();
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const [d, setD] = useState<Data | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [pw, setPw] = useState({ current: "", next: "" });
  const [del, setDel] = useState("");
  const [delConfirmed, setDelConfirmed] = useState(false); // accounts without a password confirm with an e-mail code (as on the website)
  const tau = useAuthT();
  const [rank, setRank] = useState<{ rank: number | null; participants: number } | null>(null);
  const tp = useWebT("plan");
  const learnCols = useCols(2, 2, 4);
  const tabCols = useCols(3, 6, 6);
  const headerCols = useCols(2, 4, 4);

  const me = useLive(() => { const p = readPoints(), c = buildCtx(); const total = totalPoints(p); return { points: total, level: pointsLevel(total), streak: pointsStreak(p.d).current, hours: hoursOf(c), stickers: earnedIds(c) }; });
  const s = useLive(collect);

  const load = useCallback(() => {
    setLoadErr(false);
    api<Data>("/api/account").then((x) => {
      setD(x);
      const p = x.profile;
      setForm({ birthYear: p.birth_year ? String(p.birth_year) : "", firstName: p.first_name ?? "", lastName: p.last_name ?? "", country: p.country ?? "", city: p.city ?? "", goal: p.goal ?? "", locale: p.locale ?? lang, marketing: !!p.marketing_opt_in });
    }).catch(() => setLoadErr(true));
  }, [lang]);
  useEffect(() => {
    load();
    api<{ me?: { rank: number | null }; participants?: number }>("/api/ranking?range=week").then((x) => setRank({ rank: x.me?.rank ?? null, participants: x.participants ?? 0 })).catch(() => undefined);
  }, [load]);
  const flash = (k: string, v: string) => { setMsg((m) => ({ ...m, [k]: v })); setTimeout(() => setMsg((m) => ({ ...m, [k]: "" })), 3500); };

  const saveProfile = async () => {
    if (!form) return;
    try {
      await api("/api/account", { method: "PUT", body: { ...form } });
      flash("profile", tr("saved"));
      load();
      if (form.birthYear) writeJSON("tf:age", Number(form.birthYear), true);
    } catch { flash("profile", tr("error")); }
  };
  const changePw = async () => {
    try {
      await api("/api/account", { body: { action: "password", ...pw } });
      flash("pw", tr("pwChanged")); setPw({ current: "", next: "" });
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "";
      flash("pw", code === "current" ? tr("pwWrong") : code === "weak" ? tr("pwWeak") : tr("error"));
    }
  };
  const toAccount = () => router.navigate("/account");
  const logoutAll = async () => { await api("/api/account", { body: { action: "logout-all" } }).catch(() => undefined); await logout(); toAccount(); };
  const signOut = async () => { await logout(); toAccount(); };
  const exportData = async () => {
    try {
      const token = await getToken();
      const file = new File(Paths.cache, "quran-masterclass-data.json");
      const out = await File.downloadFileAsync(`${SITE}/api/account?export=1`, file, { headers: token ? { Authorization: `Bearer ${token}` } : {}, idempotent: true });
      try { await out.preview({ title: tr("export"), mimeType: "application/json" }); }
      catch { await Share.share({ url: out.uri, title: tr("export") }); }
    } catch { flash("export", tx.exportFailed); }
  };
  const noPassword = d?.hasPassword === false;
  const doDelete = async () => {
    try {
      await deleteAccount(noPassword ? undefined : del);
      for (const k of storedKeys()) if (k.startsWith("tf:")) removeKey(k);
      AccessibilityInfo.announceForAccessibility(ta("account.deleted"));
      if (Platform.OS !== "web") Alert.alert(tr("delete"), ta("account.deleted"));
      router.replace("/");
    } catch (e) {
      const current = e instanceof ApiError && e.code === "current";
      if (noPassword) setDelConfirmed(false); // the confirmation ran out (15 minutes): ask for a new code
      flash("del", current ? (noPassword ? tau("errExpired") : tr("pwWrong")) : tr("error"));
    }
  };
  const confirmDelete = () => {
    if (Platform.OS === "web") { void doDelete(); return; }
    Alert.alert(tr("delete"), tr("deleteConfirm"), [{ text: ta("common.cancel"), style: "cancel" }, { text: tr("deleteBtn"), style: "destructive", onPress: () => void doDelete() }]);
  };

  if (!d || !form) {
    return loadErr
      ? <View style={{ marginTop: 32, gap: 12, alignItems: "flex-start" }}><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted }}>{ta("common.offline")}</Text><Text onPress={load} style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent }}>{ta("common.retry")}</Text></View>
      : <View style={{ marginTop: 32, height: 256, borderRadius: R.md, backgroundColor: alpha(t.line, 0.4) }} />;
  }
  const p = d.profile;
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email;
  const card = { borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 20 };
  const h2 = { fontFamily: FONT.bold, fontSize: 18, color: t.ink };
  const tile = (label: string, value: ReactNode, hint?: string, href?: string) => {
    const inner = (
      <>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: t.muted }}>{label}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>{typeof value === "string" || typeof value === "number" ? <Text style={{ fontFamily: FONT.display, fontSize: 30, color: t.ink }}>{value}</Text> : value}</View>
        {hint ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 16, color: t.muted, marginTop: 4 }}>{hint}</Text> : null}
      </>
    );
    return href
      ? <Pressable onPress={() => go(href)} accessibilityRole="link" style={({ pressed }) => ({ flex: 1, backgroundColor: pressed ? t.bg : t.surface, padding: 20 })}>{inner}</Pressable>
      : <View style={{ flex: 1, backgroundColor: t.surface, padding: 20 }}>{inner}</View>;
  };
  const statusText = (k: string) => msg[k] ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 14, color: k === "del" ? "rgb(160,58,52)" : t.accent }}>{msg[k]}</Text> : null;
  const inkButton = (title: string, onPress: () => void, disabled = false) => (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled }} style={({ pressed }) => ({ height: 44, borderRadius: R.sm, backgroundColor: t.ink, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : pressed ? 0.85 : 1, alignSelf: "flex-start" })}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.bg }}>{title}</Text>
    </Pressable>
  );
  const lineButton = (title: string, onPress: () => void, danger = false, disabled = false) => (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled }} style={({ pressed }) => ({ minHeight: 44, borderRadius: R.sm, borderWidth: 1, borderColor: danger ? "rgb(178,72,64)" : pressed ? t.ink : t.line, paddingHorizontal: 20, paddingVertical: 10, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : 1, alignSelf: "flex-start" })}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: danger ? "rgb(160,58,52)" : t.ink }}>{title}</Text>
    </Pressable>
  );
  const years = Array.from({ length: new Date().getFullYear() - 3 - MIN_YEAR + 1 }, (_, i) => String(new Date().getFullYear() - 3 - i));
  const age = groupOf(Number(form.birthYear));
  const locales = [["de", "Deutsch"], ["en", "English"]] as [string, string][];
  if (form.locale && !locales.some(([v]) => v === form.locale)) locales.push([form.locale, form.locale.toUpperCase()]);
  const set = (k: keyof Form) => (v: string | boolean) => setForm({ ...form, [k]: v });

  return (
    <View style={{ marginTop: 24, gap: 24 }}>
      {/* header card */}
      <Stage rounded={16} hairlines={false}>
        <IllumFrame />
        <View style={{ padding: 24, gap: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Avatar letter={name[0]?.toUpperCase() ?? "?"} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, color: "#eef0f3" }}>{name}</Text>
              <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                {p.email} · {p.email_verified ? <Text style={{ fontFamily: FONT.semibold, color: "rgb(233,207,153)" }}>{tr("verified")}</Text> : tr("unverified")}
              </Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{tr("since", { date: longDate(p.created_at, lang) })} · {tr("lastLogin", { date: longDate(p.last_login_at, lang) })}</Text>
              {pro || p.plan === "premium" ? (
                <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(214,180,108,0.4)", paddingHorizontal: 10, paddingVertical: 4 }}>
                  <ProSeal size={16} /><Text style={{ fontFamily: FONT.bold, fontSize: 12, color: "rgb(233,207,153)" }}>{ta("pro.name")}</Text>
                </View>
              ) : (
                <Pressable onPress={() => openPro("general")} accessibilityRole="button" style={({ pressed }) => ({ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4 })}>
                  <ProSeal size={16} /><Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{ta("pro.name")}</Text>
                </Pressable>
              )}
            </View>
          </View>
          <Pressable onPress={() => setTab("badges")} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, borderColor: pressed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)", padding: 12 })}>
            <LevelSeal n={me.level.n} size={64} />
            <View>
              <Text style={{ fontFamily: CALLIG_FONT, fontSize: 24, lineHeight: 34, color: stage.gold, alignSelf: "flex-start" }}>{me.level.ar}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{tr("pointsN", { n: nf(me.points) })}</Text>
            </View>
          </Pressable>
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" }}>
          <Grid cols={headerCols} gap={0}>
            {[[String(me.streak), tr("kStreak")], [nf(me.hours, 1), tr("kHours")], [String(me.stickers.length), tr("kStickers")], [rank?.rank ? `#${rank.rank}` : "–", tr("kRank")]].map(([v, l], i) => (
              <View key={l} style={{ paddingHorizontal: 20, paddingVertical: 16, borderStartWidth: i % 2 ? 1 : 0, borderTopWidth: i >= 2 ? 1 : 0, borderColor: "rgba(255,255,255,0.1)" }} accessible accessibilityLabel={`${v} ${l}`}>
                <Text style={{ fontFamily: FONT.display, fontSize: 24, color: stage.gold }}>{v}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{l}</Text>
              </View>
            ))}
          </Grid>
        </View>
      </Stage>

      {/* tabs */}
      <View accessibilityRole="tablist" style={{ borderRadius: 16, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 6 }}>
        <Grid cols={tabCols} gap={6}>
          {PROFILE_TABS.map((x) => {
            const on = tab === x;
            return (
              <Pressable key={x} onPress={() => setTab(x)} accessibilityRole="tab" accessibilityState={{ selected: on }}
                style={({ pressed }) => ({ height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 8, backgroundColor: on ? "rgb(8,38,29)" : pressed ? t.bg : "transparent" })}>
                <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: FONT.semibold, fontSize: 14, color: on ? "rgb(233,207,153)" : t.muted }}>{tr(`tab_${x}`)}</Text>
              </Pressable>
            );
          })}
        </Grid>
      </View>

      {tab === "overview" ? (
        <View style={{ gap: 24 }}>
          <RewardsCard />
          {me.stickers.length > 0 ? (
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <Text accessibilityRole="header" style={h2}>{tr("latestStickers")}</Text>
                <Text onPress={() => setTab("badges")} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{tr("allStickers")}</Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
                {me.stickers.slice(-8).reverse().map((id) => { const def = stickerById(id); return def ? <Sticker key={id} def={def} size={64} /> : null; })}
              </View>
            </View>
          ) : null}
          <ProgressPanel />
          <View style={{ gap: 12 }}>
            {[["/today", tr("goToday")], ["/map", tr("goMap")], ["/community", tr("goCommunity")]].map(([h, l]) => (
              <Pressable key={h} onPress={() => go(h)} accessibilityRole="link">
                <Callout style={{ borderRadius: 12, padding: 16 }}><Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{l}</Text></Callout>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      {tab === "stats" ? <StatsView embedded only={["listen", "points", "learn"]} /> : null}
      {tab === "badges" ? <StatsView embedded only={["level", "stickers", "badges"]} /> : null}
      {tab === "ranking" ? <Ranking embedded /> : null}

      {tab === "learning" ? (
        <View>
          <Text accessibilityRole="header" style={h2}>{tr("statsTitle")}</Text>
          <View style={{ marginTop: 12, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.line, overflow: "hidden" }}>
            <Grid cols={learnCols} gap={1}>
              {tile(tr("streak"), <><Text style={{ fontFamily: FONT.display, fontSize: 30, color: t.ink }}>{s.streak}</Text><Icon name="flame" size={22} color={t.gold} /></>, tr("streakHint", { n: s.todayCount }))}
              {tile(tr("level"), String(s.level), tr("xp", { n: s.xp }), "/academy")}
              {tile(tr("lessons"), String(s.lessons), tr("lessonsHint"), "/academy")}
              {tile(tr("verses"), String(s.inReview), tr("secured", { n: s.secured }), "/today")}
              {tile(tr("plan"), s.plan ? `${s.plan.day}` : "–", s.plan ? tr("planHint", { track: tp(s.plan.track), learned: s.plan.learned }) : tr("noPlan"), "/plan")}
              {tile(tr("khatm"), s.khatm !== null ? `${s.khatm}%` : "–", s.khatm !== null ? tr("khatmHint") : tr("noKhatm"), "/khatm")}
              {tile(tr("vocab"), `${s.vocab}`, tr("vocabHint", { total: s.vocabTotal }), "/vocab")}
              {tile(tr("tajweed"), `${s.tajweedDone}/${TAJWEED_LESSONS.length}`, s.tajweedAvg !== null ? tr("tajweedHint", { n: s.tajweedAvg }) : tr("noTajweed"), "/tajweed")}
              {tile(tr("bookmarks"), String(s.bookmarks))}
              {tile(tr("notes"), String(s.notes), tr("mnemos", { n: s.mnemos }))}
              {tile(tr("comments"), String(d.social.comments))}
              {tile(tr("likes"), String(d.social.likes))}
            </Grid>
          </View>
          {s.weak.length > 0 ? (
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: t.muted, marginTop: 12 }}>
              {tr("weak")}{" "}
              {s.weak.map((w) => <Text key={w.key} onPress={() => go(`/surah/${w.key.split(":")[0]}?v=${w.key.split(":")[1]}&shams=1`)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, color: t.accent }}>{w.key}{"  "}</Text>)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {tab === "account" ? (
        <View style={{ gap: 24 }}>
          <View style={card}>
            <Text accessibilityRole="header" style={h2}>{tr("personal")}</Text>
            <View style={{ gap: 16, marginTop: 16 }}>
              <TextField label={tr("firstName")} value={form.firstName} onChangeText={set("firstName")} autoComplete="given-name" textContentType="givenName" />
              <TextField label={tr("lastName")} value={form.lastName} onChangeText={set("lastName")} autoComplete="family-name" textContentType="familyName" />
              <PickerField label={tr("country")} value={form.country} onChange={set("country")} options={[{ value: "", label: "–" }, ...countryList(lang).map((c) => ({ value: c.code, label: c.name }))]} />
              <TextField label={tr("city")} value={form.city} onChangeText={set("city")} autoComplete="postal-address-locality" textContentType="addressCity" />
              <PickerField label={tr("birthYear")} value={form.birthYear} onChange={set("birthYear")} options={[{ value: "", label: "–" }, ...years.map((y) => ({ value: y, label: y }))]} hint={age ? tr(`age_${age}`) : undefined} />
              <PickerField label={tr("goal")} value={form.goal} onChange={set("goal")} options={[{ value: "", label: "–" }, ...GOALS.map((g) => ({ value: g, label: tr(`goal_${g}`) }))]} />
              <PickerField label={tr("language")} value={form.locale} onChange={set("locale")} options={locales.map(([v, l]) => ({ value: v, label: l }))} />
              <SwitchField label={tr("marketing")} value={form.marketing} onChange={set("marketing")} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20 }}>
              {inkButton(tr("save"), () => void saveProfile())}
              {statusText("profile")}
            </View>
          </View>

          <View style={card}>
            <Text accessibilityRole="header" style={h2}>{tr("security")}</Text>
            {/* changing the password only for accounts that have one (as on the website) */}
            {!noPassword ? (
              <>
                <View style={{ gap: 16, marginTop: 16 }}>
                  <TextField label={tr("pwCurrent")} value={pw.current} onChangeText={(v) => setPw({ ...pw, current: v })} secureTextEntry autoComplete="current-password" textContentType="password" />
                  <TextField label={tr("pwNew")} value={pw.next} onChangeText={(v) => setPw({ ...pw, next: v })} secureTextEntry autoComplete="new-password" textContentType="newPassword" />
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 16 }}>
                  {inkButton(tr("pwChange"), () => void changePw(), !pw.current || pw.next.length < 10)}
                  {statusText("pw")}
                </View>
              </>
            ) : null}
            <View style={{ marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: t.line, gap: 12 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{tr("sessions", { n: d.sessions })}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {lineButton(tn("signOut"), () => void signOut())}
                {lineButton(tr("logoutAll"), () => void logoutAll())}
              </View>
            </View>
          </View>

          <View style={card}>
            <Text accessibilityRole="header" style={h2}>{tr("privacy")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 8 }}>{tr("privacyText")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
              {lineButton(tr("export"), () => void exportData())}
              {lineButton(tr("privacyPolicy"), () => void WebBrowser.openBrowserAsync(`${SITE}/${lang}/legal/privacy`))}
            </View>
            {statusText("export")}
            <View style={{ marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: t.line }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 15, color: "rgb(160,58,52)" }}>{tr("delete")}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, marginTop: 4 }}>{tr("deleteText")}</Text>
              <View style={{ gap: 12, marginTop: 12 }}>
                {noPassword ? (
                  <>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted }}>{tau("deleteByCode")}</Text>
                    {delConfirmed ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{tau("confirmed")}</Text>
                      : <ConfirmCode email={d.profile.email} onConfirmed={() => setDelConfirmed(true)} />}
                  </>
                ) : <TextField label={tr("pwCurrent")} value={del} onChangeText={setDel} secureTextEntry autoComplete="current-password" textContentType="password" />}
                {lineButton(tr("deleteBtn"), confirmDelete, true, noPassword ? !delConfirmed : !del)}
                {statusText("del")}
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default ProfileView;
