import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { Icon, type IconName } from "@/components/icons";
import { GoldButton } from "@/components/brand";
import { useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { readJSON, writeJSON } from "@/lib/store";
import { getChapters, type Chapter } from "@/lib/quran";
import { COURSES, tx as courseTx } from "@/features/courses";
import { SharerRing } from "@/features/share/SharerUI";
import { T, errCode, type SearchCard, type TalentCard } from "./api";
import { BadgeButton, BadgeSheetHost } from "./badges";
import { TalentAvatar, useTalentErr } from "./ui";
import { usePT } from "./profileText";
import { useTT } from "./text";

// Search like Instagram / TikTok (owner, 21.10.2026): opened from the search icon in the feed header and from the
// Explore search bar. A rounded field with live results as you type (debounced), tabs Accounts (default) and Top
// (a few accounts plus learning content: surahs, courses, the Quran full-text search and matching Explore posts).
// Every account row: avatar, @username with badge, name · followers, and Follow / Follow back / Requested / Following
// inline. With an empty field: recent searches (on this device only, removable one by one or all) and suggested
// accounts. Accounts come from /api/community/search (signed in, 13+); the learning part works without an account.

export const RECENT_KEY = "qmc.talents.recentSearches.v1";
type Recent = { kind: "account"; username: string; name: string; avatar: string | null; badge: TalentCard["badge"] } | { kind: "query"; q: string };
const readRecent = () => readJSON<Recent[]>(RECENT_KEY, []);
const recentId = (r: Recent) => (r.kind === "account" ? `@${r.username}` : `q:${r.q.toLowerCase()}`);
function pushRecent(r: Recent) {
  const list = readRecent().filter((x) => recentId(x) !== recentId(r));
  writeJSON(RECENT_KEY, [r, ...list].slice(0, 20), true);
}

type Row = SearchCard & { busy?: boolean };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[ʿʾ'’`\-\s]/g, "").toLowerCase();

export function SearchScreen({ initial, initialTab }: { initial?: string; initialTab?: "accounts" | "top" }) {
  const t = useTheme();
  const pt = usePT();
  const tt = useTT();
  const tr = useT();
  const err = useTalentErr();
  const { lang } = useLang();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const bg = t.dark ? t.bg : t.surface;
  const soft = t.dark ? "rgba(255,255,255,0.10)" : "rgba(6,108,78,0.08)";
  const [q, setQ] = useState(initial ?? "");
  const [tab, setTab] = useState<"accounts" | "top">(initialTab ?? "accounts");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState<"" | "signin" | "error">("");
  const [msg, setMsg] = useState("");
  const [recent, setRecent] = useState<Recent[]>(readRecent);
  const [suggested, setSuggested] = useState<Row[] | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const seq = useRef(0);
  const s = q.trim().replace(/^@/, "");
  // the same screen opened again with other parameters (a link) takes them over
  useEffect(() => { if (initial !== undefined) setQ(initial); }, [initial]);
  useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);

  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  useEffect(() => {
    if (!user) return;
    T.suggested().then((d) => setSuggested(d.talents.map((x) => ({ ...x, followed: !!x.followed, followsMe: !!x.followsMe, requested: false })))).catch(() => setSuggested([]));
  }, [user]);

  // live results: 250 ms after the last key, only the newest answer counts
  useEffect(() => {
    const my = ++seq.current;
    if (!s) { setRows(null); setLoading(false); return; }
    if (!user) { setBlocked("signin"); setRows([]); return; }
    setLoading(true);
    const id = setTimeout(() => {
      T.search(s).then((d) => { if (my === seq.current) { setRows(d.talents); setBlocked(""); } })
        .catch((e) => { if (my === seq.current) { setRows([]); setBlocked(errCode(e) === "login" ? "signin" : "error"); setMsg(err(e)); } })
        .finally(() => { if (my === seq.current) setLoading(false); });
    }, 250);
    return () => clearTimeout(id);
  }, [s, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAccount = (c: Pick<TalentCard, "username" | "name" | "avatar" | "badge">) => {
    pushRecent({ kind: "account", username: c.username, name: c.name, avatar: c.avatar ?? null, badge: c.badge ?? null });
    setRecent(readRecent());
    router.push(`/talents/u/${c.username}` as Href);
  };
  const submit = () => { if (s) { pushRecent({ kind: "query", q: s }); setRecent(readRecent()); } Keyboard.dismiss(); };
  const removeRecent = (r: Recent) => { const next = readRecent().filter((x) => recentId(x) !== recentId(r)); writeJSON(RECENT_KEY, next, true); setRecent(next); };
  const clearRecent = () => { writeJSON(RECENT_KEY, [], true); setRecent([]); };

  const follow = async (c: Row, list: "rows" | "suggested") => {
    const set = list === "rows" ? setRows : setSuggested;
    const patch = (x: Partial<Row>) => set((l) => l?.map((y) => (y.username === c.username ? { ...y, ...x } : y)) ?? null);
    patch({ busy: true }); setMsg("");
    try {
      const d = await T.follow(c.username, !(c.followed || c.requested));
      patch({ busy: false, followed: d.followed, requested: !!d.requested, followers: d.followers });
    } catch (e) { patch({ busy: false }); setMsg(err(e)); }
  };

  // learning content (Top): surahs by name, translation or number, courses by title
  const learn = useMemo(() => {
    if (!s) return { surahs: [] as Chapter[], courses: [] as typeof COURSES };
    const f = fold(s);
    const n = Number(s);
    const surahs = chapters.filter((c) => (Number.isInteger(n) && c.id === n) || fold(c.name_simple).includes(f) || fold(c.translated_name?.name ?? "").includes(f) || c.name_arabic.includes(s)).slice(0, 4);
    const courses = COURSES.filter((c) => fold(courseTx(c.title, lang)).includes(f) || fold(c.title.en).includes(f)).slice(0, 3);
    return { surahs, courses };
  }, [s, chapters, lang]);

  const nf = (n: number) => { try { return Intl.NumberFormat(lang, { notation: n >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n); } catch { return String(n); } };

  const accountRow = (c: Row, list: "rows" | "suggested") => {
    const label = c.followed ? tt("followingBtn") : c.requested ? tt("requested") : c.followsMe ? pt("followBack") : tt("follow");
    const gold = !c.followed && !c.requested;
    return (
      <View key={c.username} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, minHeight: 68 }}>
        <Pressable onPress={() => openAccount(c)} accessibilityRole="button" accessibilityLabel={`@${c.username}, ${c.name}, ${pt("followersN", { n: c.followers })}`}
          style={({ pressed }) => ({ flex: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, opacity: pressed ? 0.6 : 1 })}>
          <SharerRing tier={c.sharerTier} size={50}><TalentAvatar name={c.name} size={50} uri={c.avatar} badge={c.badge} /></SharerRing>
          <View style={{ flex: 1, gap: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 15, color: t.ink, writingDirection: "ltr" }}>{`@${c.username}`}</Text>
              <BadgeButton badge={c.badge ?? null} size={14} />
            </View>
            <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>
              {[c.name, pt("followersN", { n: nf(c.followers) }), c.followsMe && !c.followed ? pt("followsYou") : ""].filter(Boolean).join(" · ")}
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={() => void follow(c, list)} disabled={c.busy} accessibilityRole="button" accessibilityLabel={`${label}, ${c.name}`}
          style={({ pressed }) => ({ minWidth: 96, height: 34, paddingHorizontal: 14, borderRadius: R.md, alignItems: "center", justifyContent: "center", backgroundColor: gold ? goldButton.to : soft, opacity: c.busy ? 0.55 : pressed ? 0.7 : 1 })}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 13.5, color: gold ? goldButton.text : t.ink }}>{label}</Text>
        </Pressable>
      </View>
    );
  };
  const linkRow = (key: string, icon: IconName, title: string, sub: string | null, onPress: () => void) => (
    <Pressable key={key} onPress={onPress} accessibilityRole="button" accessibilityLabel={sub ? `${title}, ${sub}` : title}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, minHeight: 60, opacity: pressed ? 0.6 : 1 })}>
      <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: soft, alignItems: "center", justifyContent: "center" }}><Icon name={icon} color={t.ink} size={21} /></View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{title}</Text>
        {sub ? <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{sub}</Text> : null}
      </View>
      <Icon name="chevronRight" color={t.muted} size={16} />
    </Pressable>
  );
  const header = (title: string, right?: React.ReactNode) => (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
      <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{title}</Text>
      {right}
    </View>
  );
  const signIn = (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.muted, textAlign: "center" }}>{pt("searchSignIn")}</Text>
      {!user ? <GoldButton title={tr("account.signIn")} onPress={() => router.push("/sign-in" as Href)} /> : null}
    </View>
  );
  const accounts = (limit?: number) => {
    if (blocked === "signin") return signIn;
    if (!rows || (loading && !rows.length)) return <View style={{ padding: 24 }}><ActivityIndicator color={t.accent} /></View>;
    if (!rows.length) return <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, color: t.muted, textAlign: "center", padding: 24 }}>{blocked === "error" && msg ? msg : pt("noResults", { q: s })}</Text>;
    return <>{(limit ? rows.slice(0, limit) : rows).map((c) => accountRow(c, "rows"))}</>;
  };

  return (
    <BadgeSheetHost>
      <View style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top }}>
        {/* the field and Cancel */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 40, borderRadius: 12, paddingHorizontal: 12, backgroundColor: soft }}>
            <Icon name="search" color={t.muted} size={17} />
            <TextInput value={q} onChangeText={setQ} autoFocus placeholder={pt("searchPh")} placeholderTextColor={t.muted} accessibilityLabel={pt("searchLabel")}
              returnKeyType="search" onSubmitEditing={submit} autoCorrect={false} autoCapitalize="none" spellCheck={false}
              style={{ flex: 1, fontFamily: FONT.regular, fontSize: 16, color: t.ink, paddingVertical: 0 }} />
            {q ? (
              <Pressable onPress={() => setQ("")} accessibilityRole="button" accessibilityLabel={tt("cancel")} hitSlop={10} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: t.muted, alignItems: "center", justifyContent: "center" }}>
                <Icon name="close" color={bg} size={13} weight={2.6} />
              </Pressable>
            ) : null}
          </View>
          <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={8} style={{ minHeight: 40, justifyContent: "center" }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{tt("cancel")}</Text>
          </Pressable>
        </View>

        {s ? (
          <View accessibilityRole="tablist" style={{ flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.line }}>
            {(["accounts", "top"] as const).map((k) => {
              const on = tab === k;
              return (
                <Pressable key={k} onPress={() => setTab(k)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ flex: 1, height: 44, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: on ? FONT.bold : FONT.semibold, fontSize: 15, color: on ? t.ink : t.muted }}>{k === "accounts" ? pt("tabAccounts") : pt("tabTop")}</Text>
                  {on ? <View style={{ position: "absolute", bottom: 0, width: 56, height: 2, borderRadius: 1, backgroundColor: goldButton.to }} /> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {!s ? (
            <>
              {recent.length ? (
                <>
                  {header(pt("recent"), (
                    <Pressable onPress={clearRecent} accessibilityRole="button" hitSlop={8}><Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.gold }}>{pt("clearRecent")}</Text></Pressable>
                  ))}
                  {recent.map((r) => (
                    <View key={recentId(r)} style={{ flexDirection: "row", alignItems: "center", paddingStart: 16, paddingEnd: 6, minHeight: 64 }}>
                      <Pressable onPress={() => (r.kind === "account" ? openAccount(r) : setQ(r.q))} accessibilityRole="button"
                        style={({ pressed }) => ({ flex: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 7, opacity: pressed ? 0.6 : 1 })}>
                        {r.kind === "account" ? <TalentAvatar name={r.name} size={50} uri={r.avatar} badge={r.badge} />
                          : <View style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: t.line, alignItems: "center", justifyContent: "center" }}><Icon name="search" color={t.ink} size={20} /></View>}
                        <View style={{ flex: 1 }}>
                          <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink, writingDirection: r.kind === "account" ? "ltr" : undefined }}>{r.kind === "account" ? `@${r.username}` : r.q}</Text>
                          {r.kind === "account" ? <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{r.name}</Text> : null}
                        </View>
                      </Pressable>
                      <Pressable onPress={() => removeRecent(r)} accessibilityRole="button" accessibilityLabel={`${pt("removeRecent")}: ${r.kind === "account" ? `@${r.username}` : r.q}`} hitSlop={6}
                        style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
                        <Icon name="close" color={t.muted} size={17} />
                      </Pressable>
                    </View>
                  ))}
                </>
              ) : null}
              {!user ? signIn : suggested?.length ? (
                <>
                  {header(pt("suggested"), (
                    <Pressable onPress={() => router.push("/talents" as Href)} accessibilityRole="link" hitSlop={8}><Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.gold }}>{pt("seeAll")}</Text></Pressable>
                  ))}
                  {suggested.map((c) => accountRow(c, "suggested"))}
                </>
              ) : suggested === null ? <View style={{ padding: 24 }}><ActivityIndicator color={t.accent} /></View> : null}
              {user && !recent.length && suggested && !suggested.length ? (
                <View style={{ alignItems: "center", gap: 10, paddingTop: 48, paddingHorizontal: 32 }}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 1.5, borderColor: t.line, alignItems: "center", justifyContent: "center" }}><Icon name="search" color={t.ink} size={26} /></View>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.muted, textAlign: "center" }}>{tt("search")}</Text>
                </View>
              ) : null}
            </>
          ) : tab === "accounts" ? accounts() : (
            <>
              {/* accounts only when there are some (or while they load) */}
              {rows?.length || (loading && !rows?.length) || blocked === "signin" ? (
                <>
                  {header(pt("tabAccounts"), rows && rows.length > 3 ? (
                    <Pressable onPress={() => setTab("accounts")} accessibilityRole="button" hitSlop={8}><Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.gold }}>{pt("seeAll")}</Text></Pressable>
                  ) : undefined)}
                  {accounts(3)}
                </>
              ) : null}
              {header(pt("learnSection"))}
              {learn.surahs.map((c) => linkRow(`s${c.id}`, "book", `${c.id}. ${c.name_simple}`, c.translated_name?.name ?? null, () => { submit(); router.push({ pathname: "/quran/[surah]", params: { surah: String(c.id) } } as Href); }))}
              {learn.courses.map((c) => linkRow(`c${c.id}`, "cap", courseTx(c.title, lang), courseTx(c.lead, lang), () => { submit(); router.push(`/courses/${c.id}` as Href); }))}
              {linkRow("quran", "search", pt("searchQuran", { q: s }), null, () => { submit(); router.push(`/search?q=${encodeURIComponent(s)}` as Href); })}
              {linkRow("explore", "compass", pt("exploreFor", { q: s }), null, () => { submit(); router.navigate({ pathname: "/explore", params: { q: s } } as Href); })}
            </>
          )}
          {msg && blocked !== "error" ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "center", padding: 12 }}>{msg}</Text> : null}
        </ScrollView>
      </View>
    </BadgeSheetHost>
  );
}
