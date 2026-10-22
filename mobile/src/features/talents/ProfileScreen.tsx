import { useCallback, useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ActionSheetIOS, Alert, Modal, Platform, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions, type ScrollViewInstance } from "react-native";
import { router, useGlobalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT, R, goldButton, stage, useTheme, type Theme } from "@/lib/theme";
import { Loading, READ_WIDTH, goBack } from "@/components/page";
import { useTabBarSpace } from "@/components/TabBar";
import { GlassSurface, GoldButton, OutlineButton } from "@/components/brand";
import { LabeledField } from "@/components/form";
import { Icon, type IconName } from "@/components/icons";
import { countryName } from "@/lib/countries";
import { SITE, ApiError } from "@/lib/api";
import { useLang, useT } from "@/i18n";
import type { User } from "@/lib/auth";
import { usePro } from "@/lib/pro";
import { SharerBadge, SharerRing } from "@/features/share/SharerUI";
import { useMySharer } from "@/features/share/sharer";
import { usePostingOn, useSijillFlags } from "@/features/sijill/config";
import { sijillApi, type Moment, type Sijill } from "@/features/sijill/api";
import { syncSijill } from "@/features/sijill/summary";
import { SijillShowcase } from "@/features/sijill/Showcase";
import { useST, type SKey } from "@/features/sijill/text";
import { RankLine } from "@/features/rankings/RankLine";
import { T, type Highlight, type Post, type PostingStatus, type TalentProfile } from "./api";
import { useTT, type TKey } from "./text";
import { BadgeButton, BadgeMark, BadgeSheetHost } from "./badges";
import { ClipVisual } from "./ClipVisual";
import { PostingChecklist } from "./Checklist";
import { LevelBadge, Muted, ReportSheet, SafetyBar, TalentAvatar, useTalentErr } from "./ui";
import { pickAvatar } from "./avatar";
import { MomentFeed, MomentGrid, MomentsEmpty, maOf } from "./MomentPosts";
import { usePT } from "./profileText";
import { Completeness, FollowedBy, Highlights, ShareSheet, Suggested } from "./ProfileExtras";
import { PIcon, type ProfileIconName } from "./ProfileIcons";
import { demoProfileData, localProfileData, readOwnCache, writeOwnCache } from "./localProfile";
import * as Haptics from "expo-haptics";
import { ExtrasChips } from "./ExtrasEditor";
import { useGoalLabels, useTravel } from "./travel";
import { readV2 } from "@/features/plan/v2";
import { CareerStats } from "@/features/stats/CareerStats";
import { ProfileStrip } from "@/features/stats/ProfileStrip";
import { CountryBadge } from "@/features/rankings/Flag";
import { useCT } from "@/features/stats/text";

// The talent profile, one layout for the own profile (Account tab, owner 21.10.2026: "the last tab IS your profile")
// and for everybody else (/talents/u/<username>). TikTok structure in emerald and gold: top bar (own: name with a
// chevron, share/QR "+" and the menu that opens the settings; others: back, name, share and more), the centred round
// avatar, @username with the badge, level, the counters Following | Followers | MashaAllah (numbers bold above grey
// labels, thin separators), the buttons (own: Edit profile, Share profile, people; others: Follow / Follow back /
// Requested / Following, Message, the arrow with suggested accounts), the bio, achievement highlights, then the icon
// tabs Achievements (3-column grid edge to edge, a gold heart with the MashaAllah count on every tile) · Sijill · Badges.
// Without the network (signed out, no community profile, offline) the own profile shows the data of this device.
// Earlier owner decisions stay: posting.enabled off = achievement showcase (clips, highlights of clips and the posting
// path behind the switch), safety bar with guidelines, report and block on every profile, compare, connect.

export type ProfileSource = "server" | "cache" | "local";
export type ProfileData = {
  p: TalentProfile | null; setP: Dispatch<SetStateAction<TalentProfile | null>>;
  state: "load" | "missing" | "ok" | "error"; source: ProfileSource;
  moments: Moment[] | null; setMoments: Dispatch<SetStateAction<Moment[] | null>>;
  momentsMore: string | null; setMomentsMore: Dispatch<SetStateAction<string | null>>;
  sijill: Sijill | null | "restricted";
  posts: Post[] | null; saved: Post[] | null; highlights: Highlight[]; setHighlights: Dispatch<SetStateAction<Highlight[]>>;
  posting: PostingStatus | null; postingOn: boolean;
  load: () => Promise<void>;
};

/** loads a profile with its moments, Sijill and (posting on) clips. `own` (Account tab): offline the last loaded own
 * profile, otherwise (signed out, no profile) the data of this device – the tab is never blank */
export function useProfileData(username: string | null | undefined, opts: { enabled: boolean; own?: { user: User | null; fallbackName: string }; demo?: string }): ProfileData {
  const { lang } = useLang();
  const { pro } = usePro();
  const sharer = useMySharer();
  const postingFlag = usePostingOn();
  const postingRef = useRef(postingFlag);
  postingRef.current = postingFlag;
  const ownRef = useRef(opts.own);
  ownRef.current = opts.own;
  const tierRef = useRef(sharer.tier);
  tierRef.current = sharer.tier;
  const [p, setP] = useState<TalentProfile | null>(null);
  const [state, setState] = useState<ProfileData["state"]>("load");
  const [source, setSource] = useState<ProfileSource>("server");
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const [momentsMore, setMomentsMore] = useState<string | null>(null);
  const [sijill, setSijill] = useState<Sijill | null | "restricted">(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [saved, setSaved] = useState<Post[] | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [posting, setPosting] = useState<PostingStatus | null>(null);
  // own profile: the last loaded version shows at once while the account and the profile load
  const ownId = opts.own?.user?.id;
  useEffect(() => {
    const c = readOwnCache(ownId);
    if (!c) return;
    setP((x) => x ?? c.p);
    setMoments((x) => x ?? c.moments);
    setSijill((x) => x ?? c.sijill);
    setState((x) => (x === "load" ? "ok" : x));
  }, [ownId]);

  const applyLocal = useCallback(() => {
    const own = ownRef.current;
    const d = localProfileData(own?.user ?? null, pro, tierRef.current, own?.fallbackName ?? "");
    setP(d.p); setMoments(d.moments); setMomentsMore(null); setSijill(d.sijill);
    setPosts([]); setSaved(null); setHighlights([]); setPosting(null);
    setSource("local"); setState("ok");
  }, [pro]);

  const load = useCallback(async () => {
    if (!opts.enabled) return;
    const own = ownRef.current;
    if (__DEV__ && (opts.demo === "own" || opts.demo === "other")) {
      const x = demoProfileData(opts.demo, localProfileData(own?.user ?? null, pro, tierRef.current, own?.fallbackName ?? ""));
      setP(x.p); setMoments(x.moments); setMomentsMore(null); setSijill(x.sijill); setPosts([]); setHighlights([]); setSource("server"); setState("ok");
      return;
    }
    if (!username) { if (own) applyLocal(); return; }
    try {
      const d = (await T.profile(username, lang)).profile;
      setP(d); setState("ok"); setSource("server");
      setMoments(d.moments ?? []); setMomentsMore(d.momentsMore ?? null);
      const uid = own?.user?.id;
      const keep = own && d.mine && uid ? (s: Sijill | null) => writeOwnCache({ userId: uid, p: d, moments: d.moments ?? [], sijill: s }) : null;
      keep?.(readOwnCache(uid)?.sijill ?? null);
      // Sijill: the own record is brought up to date from this device first
      if (!d.blocked) {
        (d.mine ? syncSijill(pro).then(() => sijillApi.mine(lang)) : sijillApi.of(d.username, lang))
          .then((x) => { setSijill(x.sijill ?? "restricted"); if (x.sijill) keep?.(x.sijill); })
          .catch(() => setSijill((s) => (s && s !== "restricted" ? s : "restricted")));
      }
      const clips = postingRef.current && d.postingEnabled !== false;
      if (!clips) { setPosts([]); setHighlights([]); }
      else if (!d.restricted && !d.blocked) {
        T.posts(d.username, "post").then((x) => setPosts(x.posts)).catch(() => setPosts([]));
        T.highlights(d.username).then((x) => setHighlights(x.highlights)).catch(() => setHighlights([]));
      } else { setPosts([]); setHighlights([]); }
      if (d.mine && clips) {
        T.posting().then(setPosting).catch(() => undefined);
        T.saved().then((x) => setSaved(x.posts)).catch(() => setSaved([]));
      }
    } catch (e) {
      if (own) {
        const c = readOwnCache(own.user?.id);
        if (c) {
          setP(c.p); setMoments(c.moments); setMomentsMore(null); setSijill(c.sijill ?? "restricted");
          setPosts([]); setHighlights([]); setSource("cache"); setState("ok");
          return;
        }
        applyLocal();
        return;
      }
      setState(e instanceof ApiError && e.status === 404 ? "missing" : "error");
    }
  }, [username, lang, pro, opts.enabled, opts.demo, applyLocal]);

  return {
    p, setP, state, source, moments, setMoments, momentsMore, setMomentsMore, sijill, posts, saved, highlights, setHighlights, posting,
    postingOn: postingFlag && p?.postingEnabled !== false, load,
  };
}

type Tab = "posts" | "saved" | "awards" | "sijill" | "moments" | "stats";
type Opt = { label: string; onPress: () => void; destructive?: boolean };

/** the whole profile screen: top bar, header, tabs, grid and the sheets */
export function ProfileScreenView({ d, variant, title, canInteract, signedIn, requests = 0, unread = 0, onRefresh }: {
  d: ProfileData;
  /** "tab": own profile in the Account tab (menu opens the settings); "stack": a pushed profile with a back button */
  variant: "tab" | "stack";
  /** top bar text before the profile is loaded */
  title: string;
  /** 16+: connect (requests and connections) */
  canInteract: boolean;
  signedIn: boolean;
  /** own private account: pending follow requests */
  requests?: number;
  /** own profile: unread notifications, messages and requests (a gold dot on the menu button) */
  unread?: number;
  /** pull to refresh: what else the screen reloads (own: account, follow requests) */
  onRefresh?: () => Promise<void>;
}) {
  const t = useTheme();
  const tt = useTT();
  const pt = usePT();
  const st = useST();
  const tr = useT();
  const ct = useCT();
  const err = useTalentErr();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const tabSpace = useTabBarSpace();
  const flags = useSijillFlags();
  const goalLabels = useGoalLabels();
  const trip = useTravel();
  const { p, setP, moments, setMoments, momentsMore, setMomentsMore, sijill, posts, saved, highlights, setHighlights, posting, postingOn } = d;
  const bg = t.dark ? t.bg : t.surface;
  const mode: "own" | "other" | "local" = d.source === "local" ? "local" : p?.mine ? "own" : "other";
  const live = d.source === "server";
  const [tab, setTab] = useState<Tab>("moments");
  const [feedAt, setFeedAt] = useState<number | null>(null);
  const [feedIds, setFeedIds] = useState<string[] | null>(null);
  const [sharing, setSharing] = useState(false);
  const [justFollowed, setJustFollowed] = useState(false);
  const [suggest, setSuggest] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [photoMsg, setPhotoMsg] = useState("");
  const [reporting, setReporting] = useState(false);
  const [newHighlight, setNewHighlight] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sheet, setSheet] = useState<{ title?: string; opts: Opt[] } | null>(null);
  // development only, like Page: `?auditY=900` scrolls the profile for screenshot audits of a headless simulator
  const scrollRef = useRef<ScrollViewInstance>(null);
  const { auditY, tab: tabParam, demo: demoParam } = useGlobalSearchParams<{ auditY?: string; tab?: string; demo?: string }>();
  // development only, for screenshot audits: `?tab=stats` opens the statistics tab, `&demo=stats` with sample data
  useEffect(() => { if (__DEV__ && tabParam === "stats") setTab("stats"); }, [tabParam]);
  useEffect(() => {
    if (!__DEV__ || !auditY || d.state !== "ok") return;
    const id = setTimeout(() => scrollRef.current?.scrollTo({ y: Number(auditY) || 0, animated: false }), 900);
    return () => clearTimeout(id);
  }, [auditY, d.state]);
  useEffect(() => { if (!postingOn && (tab === "posts" || tab === "saved")) setTab("moments"); else if (postingOn && (tab === "sijill" || tab === "moments")) setTab("posts"); }, [postingOn]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = async () => { setRefreshing(true); try { await Promise.all([d.load(), onRefresh?.()]); } finally { setRefreshing(false); } };
  const run = async (fn: () => Promise<void>) => { setBusy(true); setMsg(""); try { await fn(); } catch (e) { setMsg(err(e)); } finally { setBusy(false); } };
  const confirm = (title: string, text: string, ok: string, fn: () => void) => {
    if (Platform.OS === "web") { fn(); return; }
    Alert.alert(title, text, [{ text: tt("cancel"), style: "cancel" }, { text: ok, style: "destructive", onPress: fn }]);
  };
  /** an action sheet: native on iOS, a bottom sheet elsewhere */
  const options = (title: string | undefined, opts: Opt[]) => {
    if (Platform.OS === "ios") {
      const labels = [...opts.map((o) => o.label), tt("cancel")];
      const destructive = opts.map((o, i) => (o.destructive ? i : -1)).filter((i) => i >= 0);
      ActionSheetIOS.showActionSheetWithOptions({ title, options: labels, cancelButtonIndex: labels.length - 1, destructiveButtonIndex: destructive.length ? destructive : undefined },
        (i) => { if (i < opts.length) opts[i].onPress(); });
    } else setSheet({ title, opts });
  };
  const createProfile = () => router.push((signedIn ? "/community/me" : "/register") as Href);
  const openSettings = () => router.push("/account/settings" as Href);

  // optimistic: the button and the counter change at once (with a light haptic tap), a failed call puts both back
  const follow = () => p && run(async () => {
    const prev = p;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    if (p.requested) {
      setP({ ...p, requested: false });
      try { await T.follow(p.username, false); } catch (e) { setP(prev); throw e; }
      return;
    }
    const on = !p.followed;
    setP({ ...p, followed: on && !p.private, requested: on && p.private, followers: Math.max(0, p.followers + (on ? (p.private ? 0 : 1) : -1)) });
    try {
      const r = await T.follow(p.username, on);
      setP((x) => (x ? { ...x, followed: r.followed, followers: r.followers, requested: !!r.requested } : x));
      if (r.followed || r.requested) { setJustFollowed(true); setSuggest(true); }
      if (r.followed && p.restricted) await d.load();
    } catch (e) { setP(prev); throw e; }
  });
  // "Following": a sheet with Unfollow, like Instagram and TikTok (no accidental unfollow)
  const unfollow = () => p && options(`@${p.username}`, [{ label: pt("unfollow"), destructive: true, onPress: () => void follow() }]);
  const connect = () => p && run(async () => {
    if (p.connection === "incoming") { await T.answer(p.username, "accept"); await d.load(); return; }
    if (p.connection === "none") { const r = await T.connect(p.username); setP({ ...p, connection: r.connection }); return; }
    if (p.connection === "outgoing") { await T.disconnect(p.username); setP({ ...p, connection: "none" }); return; }
    removeConnection();
  });
  const removeConnection = () => p && confirm(tt("removeConnection"), tt("confirmRemove"), tt("removeConnection"), () => void run(async () => { await T.disconnect(p.username); setP({ ...p, connection: "none", canMessage: false }); }));
  const message = () => p && run(async () => { const r = await T.openConversation(p.username); router.push(`/talents/messages/${r.id}` as Href); });
  const block = () => p && (p.blocked
    ? run(async () => { await T.block(p.username, false); await d.load(); })
    : confirm(tt("block"), tt("confirmBlock"), tt("block"), () => void run(async () => { await T.block(p.username, true); setP({ ...p, blocked: true, followed: false, connection: "none", canMessage: false }); })));
  const share = () => {
    if (!p) return;
    if (mode === "local") { createProfile(); return; }
    if (p.shareQr?.length) setSharing(true);
    else void Share.share({ message: `${p.name} (@${p.username}) · Quran Masterclass Talents\n${SITE}/${lang}/talents/${p.username}` }).catch(() => undefined);
  };

  // own profile: change the photo (library, camera, remove); the new URL carries avatar_version, so it shows at once
  const pick = (src: "library" | "camera") => p && void pickAvatar(src)
    .then((uri) => { if (uri) setP({ ...p, avatar: uri }); })
    .catch((e) => setPhotoMsg(e instanceof Error && e.message === "permission" ? tt("photoDenied") : err(e)));
  const removePhoto = () => p && void T.deleteAvatar().then(() => setP({ ...p, avatar: null })).catch((e) => setPhotoMsg(err(e)));
  const changePhoto = () => {
    if (!p) return;
    if (mode === "local") { createProfile(); return; }
    setPhotoMsg("");
    if (Platform.OS === "ios") {
      const opts = [tt("photoPick"), tt("photoTake"), ...(p.avatar ? [tt("photoRemove")] : []), tt("cancel")];
      const choose = (i: number) => { if (i === 0) pick("library"); else if (i === 1) pick("camera"); else if (i === 2 && p.avatar) removePhoto(); };
      ActionSheetIOS.showActionSheetWithOptions({ title: pt("photoTitle"), message: pt("photoHint"), options: opts, cancelButtonIndex: opts.length - 1, destructiveButtonIndex: p.avatar ? 2 : undefined }, choose);
    } else if (Platform.OS === "web") pick("library");
    else Alert.alert(pt("photoTitle"), pt("photoHint"), [
      { text: tt("photoPick"), onPress: () => pick("library") }, { text: tt("photoTake"), onPress: () => pick("camera") },
      ...(p.avatar ? [{ text: tt("photoRemove"), style: "destructive" as const, onPress: removePhoto }] : []), { text: tt("cancel"), style: "cancel" as const },
    ]);
  };
  const profileMenu = () => options(p ? (p.username ? `@${p.username}` : p.name) : undefined, mode === "local"
    ? [{ label: pt("createProfile"), onPress: createProfile }, { label: pt("menuLabel"), onPress: openSettings }]
    : [{ label: tt("editProfile"), onPress: () => router.push("/community/me" as Href) }, { label: tt("shareProfile"), onPress: share }, { label: pt("menuLabel"), onPress: openSettings }]);
  const moreMenu = () => p && options(`@${p.username}`, [
    { label: tt("shareProfile"), onPress: share },
    ...(!p.blocked && flags.compare && (p.followed || p.connection === "connected") ? [{ label: st("compare"), onPress: () => router.push(`/talents/compare/${p.username}` as Href) }] : []),
    ...(p.connection === "connected" ? [{ label: tt("removeConnection"), onPress: removeConnection }] : []),
    { label: tt("reportProfile"), destructive: true, onPress: () => setReporting(true) },
    { label: p.blocked ? tt("unblock") : tt("block"), destructive: !p.blocked, onPress: () => void block() },
  ]);

  const nf = (n: number) => { try { return Intl.NumberFormat(lang, { notation: n >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n); } catch { return String(n); } };
  const sj = sijill && sijill !== "restricted" ? sijill : null;
  const maTotal = p?.mashaallahTotal ?? 0;
  const bioLine = p ? [p.rewaya, p.country && countryName(p.country, lang), sj?.level?.stage ? st(`stage_${sj.level.stage}` as SKey) : ""].filter(Boolean).join(" · ") : "";
  const onMoment = (m: Moment) => {
    const old = moments?.find((x) => x.id === m.id);
    if (old) setP((x) => (x ? { ...x, mashaallahTotal: Math.max(0, (x.mashaallahTotal ?? 0) + maOf(m) - maOf(old)) } : x));
    setMoments((l) => l?.map((x) => (x.id === m.id ? m : x)) ?? null);
  };
  const connLabel = p ? { none: tt("connect"), outgoing: tt("requested"), incoming: tt("accept"), connected: tt("connected") }[p.connection] : "";
  const followLabel = p ? (p.followed ? tt("followingBtn") : p.requested ? tt("requested") : p.followsMe ? pt("followBack") : tt("follow")) : "";
  const cw = winW > READ_WIDTH + 40 ? READ_WIDTH : winW;
  const lists = (kind: "followers" | "following") => (p && live && !p.restricted && mode !== "local" ? () => router.push(`/talents/list?u=${p.username}&kind=${kind}` as Href) : undefined);
  const showTabs = !!p && !p.restricted && !p.blocked;

  // ---------- top bar ----------
  const barTitle = p?.name || title;
  const topBar = variant === "tab" ? (
    <View style={{ paddingTop: insets.top, backgroundColor: bg }}>
      <View style={{ height: 50, flexDirection: "row", alignItems: "center", paddingStart: 16, paddingEnd: 8, gap: 4 }}>
        <Pressable onPress={profileMenu} accessibilityRole="button" accessibilityLabel={`${barTitle}, ${pt("profileMenu")}`} hitSlop={6}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1, minHeight: 44, opacity: pressed ? 0.6 : 1 })}>
          {p?.private ? <Icon name="lock" color={t.ink} size={17} weight={2} /> : null}
          <Text accessibilityRole="header" numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.display, fontSize: 22, letterSpacing: -0.3, color: t.ink }}>{barTitle}</Text>
          <Icon name="chevronDown" color={t.ink} size={15} weight={2.6} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <BarBtn icon="plusSquare" label={pt("shareQr")} onPress={share} />
        <BarBtn icon="menu" label={unread > 0 ? `${pt("menuLabel")}, ${tt("unread", { n: unread })}` : pt("menuLabel")} onPress={openSettings} dot={unread > 0} />
      </View>
    </View>
  ) : (
    <View style={{ paddingTop: insets.top, backgroundColor: bg }}>
      <View style={{ height: 50, flexDirection: "row", alignItems: "center", paddingHorizontal: 6 }}>
        <BarBtn icon="chevronLeft" label={tr("common.back")} onPress={goBack} />
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 4 }}>
          <Text accessibilityRole="header" numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{barTitle}</Text>
          {p ? <BadgeButton badge={p.badge} size={15} /> : null}
        </View>
        {p && !p.mine ? <BarBtn icon="share" label={tt("shareProfile")} onPress={share} /> : <View style={{ width: 44 }} />}
        {p && !p.mine ? <BarBtn icon="dots" label={pt("moreOptions")} onPress={moreMenu} /> : p?.mine ? <BarBtn icon="menu" label={pt("menuLabel")} onPress={openSettings} /> : <View style={{ width: 44 }} />}
      </View>
    </View>
  );

  if (d.state !== "ok" || !p) {
    return (
      <View style={{ flex: 1, backgroundColor: bg }}>
        {topBar}
        {d.state === "missing" ? <Muted>{tt("notFound")}</Muted> : d.state === "error" ? (
          <View style={{ padding: 20 }}><OutlineButton title={tt("retry")} onPress={() => void d.load()} /></View>
        ) : <ProfileSkeleton width={winW > READ_WIDTH + 40 ? READ_WIDTH : winW} />}
      </View>
    );
  }

  // ---------- header ----------
  const handle = p.username ? `@${p.username}` : "";
  // goals, city and travel: from the server by their audience; on this device (no profile) the onboarding goals and
  // the device's travel mode
  const ext = mode === "local" ? { goals: readV2()?.goals ?? [], city: "", travel: trip.on ? { on: true, city: trip.city } : undefined } : (p.extras ?? {});
  const ownish = mode === "own" || mode === "local";
  const header = (
    <View style={{ alignItems: "center", paddingTop: 10, paddingHorizontal: 16 }}>
      {d.source === "cache" ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted, marginBottom: 8 }}>{pt("offlineNote")}</Text> : null}
      <Pressable onPress={p.liveStory && postingOn ? () => router.push(`/talents/player?src=user&u=${p.username}&type=story` as Href) : ownish && d.source !== "cache" ? changePhoto : undefined}
        disabled={!(p.liveStory && postingOn) && !(ownish && d.source !== "cache")} accessibilityRole={ownish || p.liveStory ? "button" : "image"}
        accessibilityLabel={p.liveStory && postingOn ? tt("watchStory") : mode === "local" ? pt("createProfile") : ownish ? pt("changePhoto") : p.name}
        style={{ padding: p.liveStory && postingOn ? 3 : 0, borderRadius: 70, borderWidth: p.liveStory && postingOn ? 2.5 : 0, borderColor: goldButton.from }}>
        <SharerRing tier={p.sharerTier} size={96}><TalentAvatar name={p.name} size={96} uri={p.avatar} badge={p.badge} /></SharerRing>
        {ownish ? (
          <View style={{ position: "absolute", right: 0, bottom: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: goldButton.to, borderWidth: 2.5, borderColor: bg, alignItems: "center", justifyContent: "center" }}>
            <Icon name="plus" color={goldButton.text} size={15} weight={2.8} />
          </View>
        ) : null}
      </Pressable>
      {photoMsg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.danger, textAlign: "center", marginTop: 6 }}>{photoMsg}</Text> : null}

      {/* @username with badge, then the level */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 12, flexWrap: "wrap" }}>
        {/* no @username yet (this device only): the name, unless it is just the tab's title */}
        {handle || p.name !== title ? <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 17, color: t.ink, writingDirection: handle ? "ltr" : undefined }}>{handle || p.name}</Text> : null}
        <BadgeButton badge={p.badge} size={17} />
        {p.country ? <CountryBadge code={p.country} size={17} /> : null}
        {p.private && variant === "stack" ? <Icon name="lock" color={t.muted} size={14} /> : null}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 }}>
        <LevelBadge level={p.level} />
        {sj?.level ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{st("levelN", { n: sj.level.level })}</Text> : null}
        {/* mutual follow: this member follows the viewer */}
        {mode === "other" && p.followsMe ? (
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.pill, backgroundColor: softBg(t) }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted }}>{pt("followsYou")}</Text>
          </View>
        ) : null}
      </View>

      {/* counters (TikTok): Following | Followers | MashaAllah */}
      <View accessibilityRole="summary" style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 14 }}>
        <Stat n={nf(p.following)} label={tt("following")} onPress={lists("following")} />
        <View style={{ width: StyleSheet.hairlineWidth * 2, height: 14, backgroundColor: t.line }} />
        <Stat n={nf(p.followers)} label={tt("followers")} onPress={lists("followers")} />
        <View style={{ width: StyleSheet.hairlineWidth * 2, height: 14, backgroundColor: t.line }} />
        {postingOn ? <Stat n={nf(p.likes)} label={tt("statLikes")} heart />
          : <Stat n={nf(maTotal)} label={pt("statMashaAllah")} heart onPress={p.restricted || !moments?.length ? undefined : () => setTab("moments")} />}
      </View>

      {/* buttons */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, alignSelf: "stretch" }}>
        {mode === "local" ? (
          <>
            <Btn title={pt("createProfile")} tone="gold" onPress={createProfile} grow max={250} />
            {!signedIn ? <Btn title={tr("account.signIn")} onPress={() => router.push("/sign-in" as Href)} grow /> : null}
            <Square icon="userPlus" label={pt("discoverPeople")} selected={suggest} onPress={() => router.push("/talents" as Href)} />
          </>
        ) : mode === "own" ? (
          <>
            <Btn title={tt("editProfile")} onPress={() => router.push("/community/me" as Href)} grow />
            <Btn title={tt("shareProfile")} onPress={share} grow />
            <Square icon="userPlus" label={pt("discoverPeople")} selected={suggest} onPress={() => setSuggest((x) => !x)} />
          </>
        ) : p.blocked ? (
          <Btn title={tt("unblock")} onPress={() => void block()} grow />
        ) : (
          <>
            <Btn title={followLabel} tone={p.followed || p.requested ? "soft" : "gold"} onPress={p.followed ? unfollow : () => void follow()} disabled={busy} label={`${followLabel}, ${p.name}`} grow />
            {p.canMessage ? <Btn title={tt("message")} onPress={() => void message()} disabled={busy} grow />
              : canInteract ? <Btn title={connLabel} onPress={() => void connect()} disabled={busy} label={`${connLabel}, ${p.name}`} grow /> : null}
            <Square icon="chevronDown" label={pt("suggestedAccounts")} selected={suggest} onPress={() => setSuggest((x) => !x)} />
          </>
        )}
      </View>
      {mode === "other" && p.connection === "incoming" && !p.blocked ? (
        <Pressable onPress={() => void run(async () => { await T.answer(p.username, "decline"); setP({ ...p, connection: "none" }); })} accessibilityRole="button" style={{ minHeight: 40, justifyContent: "center" }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{tt("decline")}</Text>
        </Pressable>
      ) : null}
      {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: t.muted, marginTop: 8, textAlign: "center" }}>{msg}</Text> : null}
      {p.blocked && mode === "other" ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, marginTop: 8 }}>{tt("blockedInfo")}</Text> : null}

      {/* bio (centred) */}
      <View style={{ alignItems: "center", gap: 5, marginTop: 12, alignSelf: "stretch" }}>
        {bioLine ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: t.ink, textAlign: "center" }}>{bioLine}</Text> : null}
        {p.bio ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink, textAlign: "center" }}>{p.bio}</Text> : null}
        {p.maqam ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{`${tt("maqam")}: ${p.maqam}`}</Text> : null}
        {p.officialChannel ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.gold }}>{tt("officialChannel", { c: p.officialChannel })}</Text> : null}
        {/* founder (one account, set on the server): the line and the place */}
        {p.founder ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.gold, textAlign: "center" }}>{tt("founderLine" as TKey)}</Text> : null}
        {p.founder ? <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}><CountryBadge code="AE" size={16} /><Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{tt("founderPlace" as TKey)}</Text></View> : null}
        {/* chips centred in their own row (owner 22.10.2026: the sharer chip sat left under the centred stage line) */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignSelf: "stretch", gap: 6 }}><SharerBadge tier={p.sharerTier} /></View>
        {!p.private && p.username && live ? <View style={{ flexDirection: "row", justifyContent: "center" }}><RankLine username={p.username} /></View> : null}
        <ExtrasChips goals={ext.goals} city={ext.city} travel={ext.travel} labels={goalLabels} />
        <FollowedBy p={p} />
        {/* the note once: here when the grid has tiles, otherwise as the empty grid's text */}
        {mode === "local" && moments?.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, textAlign: "center", maxWidth: 340 }}>{pt("localNote")}</Text> : null}
      </View>
    </View>
  );

  // ---------- below the header: career card, requests, suggestions, highlights, completeness, posting path ----------
  const extras = (
    <View style={{ gap: 14, marginTop: 14 }}>
      {!p.restricted && !p.blocked ? <ProfileStrip username={mode === "local" ? null : p.username} own={mode !== "other"} local={mode === "local" || d.source === "cache"} name={p.name}
        demo={__DEV__ && (demoParam === "stats" || demoParam === "own" || demoParam === "other")} onOpen={() => setTab("stats")} /> : null}
      {mode === "own" && p.private && requests > 0 ? (
        <Pressable onPress={() => router.push("/talents/requests" as Href)} accessibilityRole="button" accessibilityLabel={`${pt("requestsRow")}, ${requests}`}
          style={({ pressed }) => ({ marginHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingHorizontal: 12, borderRadius: R.lg, backgroundColor: t.accentSoft, opacity: pressed ? 0.75 : 1 })}>
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}><PIcon name="userPlus" color={t.ink} size={21} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 14.5, color: t.ink }}>{pt("requestsRow")}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{pt("requestsHint")}</Text>
          </View>
          <View style={{ minWidth: 24, height: 24, paddingHorizontal: 7, borderRadius: 12, backgroundColor: goldButton.to, alignItems: "center", justifyContent: "center" }}>
            <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 12.5, color: goldButton.text }}>{requests}</Text>
          </View>
          <Icon name="chevronRight" color={t.muted} size={16} />
        </Pressable>
      ) : null}
      {(suggest || (justFollowed && mode === "other")) && !p.blocked && live ? <Suggested exclude={p.username} seeAll inset={16} /> : null}
      {!postingOn && !p.restricted && !p.blocked && moments ? (
        <Highlights moments={moments} inset={16} onOpen={(ids) => { setFeedIds(ids); setFeedAt(0); }}
          onNew={mode === "own" ? () => router.push("/talents/sijill" as Href) : mode === "local" ? createProfile : undefined} />
      ) : null}
      {mode === "own" && live ? <View style={{ paddingHorizontal: 16 }}><Completeness p={p} onPhoto={changePhoto} /></View> : null}

      {/* clips switched on: clip highlights and the path to posting */}
      {postingOn && !p.restricted && !p.blocked && (highlights.length || p.mine) ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingVertical: 4, paddingHorizontal: 16 }}>
          {p.mine ? (
            <Pressable onPress={() => setNewHighlight(true)} accessibilityRole="button" accessibilityLabel={tt("newHighlight")} style={{ alignItems: "center", gap: 5, width: 70 }}>
              <View style={{ width: 62, height: 62, borderRadius: 31, borderWidth: 1.5, borderColor: t.line, borderStyle: "dashed", alignItems: "center", justifyContent: "center" }}><Icon name="plus" color={t.muted} size={22} /></View>
              <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{tt("newHighlight")}</Text>
            </Pressable>
          ) : null}
          {highlights.map((h) => (
            <Pressable key={h.id} onPress={() => router.push(`/talents/player?src=highlight&u=${p.username}&h=${h.id}` as Href)}
              onLongPress={p.mine ? () => confirm(tt("deleteHighlight"), h.title, tt("deleteHighlight"), () => void run(async () => { await T.deleteHighlight(h.id); setHighlights((x) => x.filter((y) => y.id !== h.id)); })) : undefined}
              accessibilityRole="button" accessibilityLabel={h.title} style={{ alignItems: "center", gap: 5, width: 70 }}>
              <View style={{ width: 62, height: 62, borderRadius: 31, padding: 2, borderWidth: 1.5, borderColor: goldButton.line, overflow: "hidden" }}>
                <View style={{ flex: 1, borderRadius: 29, overflow: "hidden" }}><ClipVisual compact verseKey={h.posts[0]?.verseKey ?? null} name="" waveform={[]} /></View>
              </View>
              <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.ink }}>{h.title}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {postingOn && p.mine && posting ? <View style={{ paddingHorizontal: 16 }}>{posting.ok
        ? <GoldButton title={tt("newClip")} onPress={() => router.push("/talents/record" as Href)} />
        : <PostingChecklist s={posting} />}</View> : null}
    </View>
  );

  // ---------- tabs (icons, TikTok) ----------
  const tabs: [Tab, string, ProfileIconName | IconName][] = postingOn
    ? [["posts", tt("tabClips"), "gridTab"], ...(p.mine ? [["saved", tt("tabSaved"), "bookmark"] as [Tab, string, IconName]] : []), ["awards", tt("tabAwards"), "rosette"]]
    : [["moments", pt("tabAchievements"), "gridTab"], ["sijill", st("tabSijill"), "record"], ["awards", pt("tabBadges"), "rosette"], ["stats", ct("tabStats"), "chart"]];
  // (a sticky header child loses its own style to the sticky wrapper, so the row sits one level deeper)
  const tabBar = (
    <View style={{ backgroundColor: bg, paddingTop: 6 }}>
    <View accessibilityRole="tablist" style={{ flexDirection: "row", backgroundColor: bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.line }}>
      {tabs.map(([k, label, icon]) => {
        const on = tab === k;
        const color = on ? t.ink : t.muted;
        return (
          <Pressable key={k} onPress={() => setTab(k)} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: on }}
            style={{ flex: 1, height: 46, alignItems: "center", justifyContent: "center" }}>
            {isPIcon(icon) ? <PIcon name={icon} color={color} size={23} weight={on ? 2 : 1.6} /> : <Icon name={icon} color={color} size={23} weight={on ? 2 : 1.6} />}
            {on ? <View style={{ position: "absolute", bottom: 0, width: 44, height: 2, borderRadius: 1, backgroundColor: goldButton.to }} /> : null}
          </Pressable>
        );
      })}
    </View>
    </View>
  );
  // owner 22.10.2026: the progress profile (career card, places, Shams, courses, exams, milestones, boards)
  const body = tab === "stats" ? (
    <CareerStats username={mode === "local" ? null : p.username} own={mode !== "other"} local={mode === "local" || d.source === "cache"} name={p.name} demo={__DEV__ && (demoParam === "stats" || demoParam === "own" || demoParam === "other")} />
  ) : tab === "sijill" ? (
    <View style={{ padding: 16 }}>
      {sijill === null ? <Loading /> : sijill === "restricted" ? <Muted>{st("restricted")}</Muted>
        : <SijillShowcase s={sijill} mine={mode === "own"} name={p.name} username={p.username} />}
    </View>
  ) : tab === "moments" ? (
    <View style={{ paddingTop: 1 }}>
      <MomentGrid edge moments={moments} width={cw} onOpen={(i) => { setFeedIds(null); setFeedAt(i); }}
        empty={<View style={{ paddingHorizontal: 16, paddingTop: 8 }}>{mode === "local" ? <Muted>{pt("localNote")}</Muted> : <MomentsEmpty mine={mode === "own"} />}</View>} />
    </View>
  ) : tab === "posts" ? <View style={{ padding: 16 }}><Grid posts={posts} src={`user&u=${p.username}&type=post`} empty={p.mine ? tt("noClipsMine") : tt("noClips")} own={p.mine} /></View>
    : tab === "saved" ? <View style={{ padding: 16 }}><Grid posts={saved} src="saved" empty={tt("noSaved")} /></View>
    : <View style={{ padding: 16 }}><Awards p={p} local={mode === "local"} /></View>;

  return (
    <BadgeSheetHost>
      <View style={{ flex: 1, backgroundColor: bg }}>
        {topBar}
        {/* no automatic insets: the top bar already holds the safe area, so the avatar sits right under it (TikTok);
            at the end the content clears the floating tab bar */}
        <ScrollView ref={scrollRef} style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={[{ paddingBottom: Math.max(130, tabSpace + 40) }, winW > READ_WIDTH + 40 && { width: READ_WIDTH, alignSelf: "center" }]}
          contentInsetAdjustmentBehavior="never" automaticallyAdjustContentInsets={false} scrollIndicatorInsets={{ bottom: variant === "tab" ? tabSpace : 0 }}
          stickyHeaderIndices={showTabs ? [1] : undefined} keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={t.accent} colors={[t.accent]} />}>
          <View>{header}{extras}</View>
          {showTabs ? tabBar : (
            <View style={{ alignItems: "center", gap: 8, paddingVertical: 28, paddingHorizontal: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.line, marginTop: 16 }}>
              {p.restricted ? (
                <>
                  <Icon name="lock" color={t.muted} size={26} />
                  <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{tt("privateTitle")}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "center" }}>{p.requested ? tt("privateText") : pt("followToSee")}</Text>
                </>
              ) : null}
            </View>
          )}
          {showTabs ? body : null}
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <SafetyBar onReport={mode === "other" ? () => setReporting(true) : undefined} onBlock={mode === "other" ? () => void block() : undefined} blocked={p.blocked} />
          </View>
        </ScrollView>
      </View>
      {mode === "other" ? <ReportSheet visible={reporting} title={tt("reportProfile")} onClose={() => setReporting(false)} onSubmit={(c, r) => T.reportProfile(p.username, c, r).then(() => undefined)} /> : null}
      {moments && feedAt !== null ? (
        <MomentFeed visible moments={feedIds ? moments.filter((m) => feedIds.includes(m.id)) : moments} start={feedAt} username={p.username} more={feedIds ? null : momentsMore} onClose={() => setFeedAt(null)} onChange={onMoment}
          onMore={(l, more) => { setMoments((old) => [...(old ?? []), ...l.filter((x) => !old?.some((y) => y.id === x.id))]); setMomentsMore(more); }} />
      ) : null}
      {mode !== "local" ? <ShareSheet p={p} visible={sharing} onClose={() => setSharing(false)} /> : null}
      {p.mine && mode !== "local" ? <HighlightSheet visible={newHighlight} username={p.username} onClose={() => setNewHighlight(false)} onCreated={() => { setNewHighlight(false); void d.load(); }} /> : null}
      <OptionsSheet sheet={sheet} onClose={() => setSheet(null)} />
    </BadgeSheetHost>
  );
}

/** the profile's shape while it loads (no animation, like the rest of the app) */
function ProfileSkeleton({ width }: { width: number }) {
  const t = useTheme();
  const g = t.dark ? "rgba(255,255,255,0.08)" : "rgba(13,31,25,0.07)";
  const bar = (w: number, h = 12) => <View style={{ width: w, height: h, borderRadius: h / 2, backgroundColor: g }} />;
  const tile = Math.floor((width - 2) / 3);
  return (
    <View accessibilityLabel="…" accessibilityState={{ busy: true }} style={{ alignItems: "center", paddingTop: 10 }}>
      <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: g }} />
      <View style={{ marginTop: 14 }}>{bar(130, 16)}</View>
      <View style={{ marginTop: 10 }}>{bar(90)}</View>
      <View style={{ flexDirection: "row", gap: 28, marginTop: 20 }}>{[0, 1, 2].map((i) => <View key={i} style={{ alignItems: "center", gap: 6 }}>{bar(34, 16)}{bar(58, 10)}</View>)}</View>
      <View style={{ flexDirection: "row", gap: 6, marginTop: 20 }}><View style={{ width: 150, height: 42, borderRadius: R.md, backgroundColor: g }} /><View style={{ width: 150, height: 42, borderRadius: R.md, backgroundColor: g }} /><View style={{ width: 44, height: 42, borderRadius: R.md, backgroundColor: g }} /></View>
      <View style={{ marginTop: 16 }}>{bar(220)}</View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 1, marginTop: 26, width }}>
        {[0, 1, 2, 3, 4, 5].map((i) => <View key={i} style={{ width: i % 3 === 2 ? width - 2 - tile * 2 : tile, height: Math.round(tile * 4 / 3), backgroundColor: g }} />)}
      </View>
    </View>
  );
}

const isPIcon = (n: string): n is ProfileIconName => ["plusSquare", "userPlus", "dots", "gridTab", "record", "rosette", "userCheck", "chart"].includes(n);

/** one counter: the number bold above the grey label (the MashaAllah label with a gold heart) */
function Stat({ n, label, onPress, heart }: { n: string; label: string; onPress?: () => void; heart?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? "button" : "text"} accessibilityLabel={`${n} ${label}`}
      style={({ pressed }) => ({ alignItems: "center", justifyContent: "center", minWidth: 84, minHeight: 46, paddingHorizontal: 12, opacity: pressed ? 0.55 : 1 })}>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, fontVariant: ["tabular-nums"] }}>{n}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 1 }}>
        {heart ? <Icon name="heart" filled color={goldButton.to} size={11} /> : null}
        <Text numberOfLines={1} style={{ fontFamily: FONT.medium, fontSize: 13, color: t.muted }}>{label}</Text>
      </View>
    </Pressable>
  );
}

/** a top bar icon button (44 pt); `dot`: something unread behind it (a small gold dot, like Instagram) */
function BarBtn({ icon, label, onPress, dot }: { icon: ProfileIconName | IconName; label: string; onPress: () => void; dot?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}
      style={({ pressed }) => ({ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.55 : 1 })}>
      {isPIcon(icon) ? <PIcon name={icon} color={t.ink} size={26} weight={1.8} /> : <Icon name={icon} color={t.ink} size={icon === "chevronLeft" ? 26 : 26} weight={icon === "chevronLeft" ? 2.2 : 1.8} />}
      {dot ? <View pointerEvents="none" style={{ position: "absolute", top: 8, end: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: goldButton.to, borderWidth: 1.5, borderColor: t.dark ? t.bg : t.surface }} /> : null}
    </Pressable>
  );
}

/** profile button in the shared style: glass capsule (Edit, Share, Message, Following) or gold capsule (Follow, Create) */
function Btn({ title, onPress, tone = "soft", disabled, label, grow, max = 162 }: { title: string; onPress: () => void; tone?: "soft" | "gold"; disabled?: boolean; label?: string; grow?: boolean; max?: number }) {
  const t = useTheme();
  const gold = tone === "gold";
  const face = { minHeight: 44, paddingHorizontal: 12, borderRadius: R.pill, alignItems: "center" as const, justifyContent: "center" as const, overflow: "hidden" as const };
  const text = <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ fontFamily: FONT.bold, fontSize: 15, color: gold ? goldButton.text : t.ink }}>{title}</Text>;
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label ?? title} accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => ({ flexGrow: grow ? 1 : 0, flexBasis: grow ? 0 : undefined, maxWidth: max, opacity: disabled ? 0.55 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
      {gold ? <LinearGradient colors={[goldButton.from, goldButton.to]} style={face}>{text}</LinearGradient> : <GlassSurface interactive style={face}>{text}</GlassSurface>}
    </Pressable>
  );
}
const softBg = (t: Theme) => (t.dark ? "rgba(255,255,255,0.10)" : "rgba(6,108,78,0.08)");

/** the square button next to them (people, suggested accounts) */
function Square({ icon, label, onPress, selected }: { icon: ProfileIconName | IconName; label: string; onPress: () => void; selected?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded: selected }}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
      <GlassSurface interactive style={{ width: 44, minHeight: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }}>
        <View style={{ transform: [{ rotate: selected && icon === "chevronDown" ? "180deg" : "0deg" }] }}>
          {isPIcon(icon) ? <PIcon name={icon} color={t.ink} size={20} weight={1.9} /> : <Icon name={icon} color={t.ink} size={18} weight={2.4} />}
        </View>
      </GlassSurface>
    </Pressable>
  );
}

/** the action sheet on Android and the web (iOS uses the native one) */
function OptionsSheet({ sheet, onClose }: { sheet: { title?: string; opts: Opt[] } | null; onClose: () => void }) {
  const t = useTheme();
  const tt = useTT();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!sheet} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tt("cancel")} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
        <Pressable onPress={() => undefined} style={{ backgroundColor: t.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingTop: 8, paddingBottom: insets.bottom + 8 }}>
          {sheet?.title ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted, textAlign: "center", paddingVertical: 10 }}>{sheet.title}</Text> : null}
          {sheet?.opts.map((o) => (
            <Pressable key={o.label} onPress={() => { onClose(); o.onPress(); }} accessibilityRole="button"
              style={({ pressed }) => ({ minHeight: 52, justifyContent: "center", paddingHorizontal: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.line, backgroundColor: pressed ? t.bg : t.surface })}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: o.destructive ? t.danger : t.ink, textAlign: "center" }}>{o.label}</Text>
            </Pressable>
          ))}
          <Pressable onPress={onClose} accessibilityRole="button" style={{ minHeight: 52, justifyContent: "center", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.line }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "center" }}>{tt("cancel")}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** clips grid (posting switched on) */
function Grid({ posts, src, empty, own }: { posts: Post[] | null; src: string; empty: string; own?: boolean }) {
  const t = useTheme();
  const tt = useTT();
  const { width } = useWindowDimensions();
  const w = Math.floor((Math.min(width, 860) - 32 - 4) / 3);
  if (!posts) return <Loading />;
  if (!posts.length) return <Muted>{empty}</Muted>;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 2 }}>
      {posts.map((x) => {
        const playable = !!x.media && (x.status ?? "approved") !== "rejected";
        return (
          <Pressable key={x.id} disabled={!playable} onPress={() => router.push(`/talents/player?src=${src}&start=${x.id}` as Href)} accessibilityRole="button"
            accessibilityLabel={`${x.verseKey ?? ""}, ${x.likes} ${tt("like")}${x.status && x.status !== "approved" ? `, ${tt(`status_${x.status}` as TKey)}` : ""}`}
            style={{ width: w, height: Math.round(w * 1.5), borderRadius: 4, overflow: "hidden", backgroundColor: stage.bg }}>
            <ClipVisual compact verseKey={x.verseKey} name="" waveform={x.waveform} />
            <View style={{ position: "absolute", left: 6, bottom: 5, flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Icon name={x.hasVideo ? "play" : "speaker"} color="#fff" size={11} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: "#fff" }}>{x.likes}</Text>
            </View>
            {own && x.status && x.status !== "approved" ? (
              <View style={{ position: "absolute", top: 5, left: 5, right: 5, paddingVertical: 2, paddingHorizontal: 5, borderRadius: 4, backgroundColor: x.status === "rejected" ? "rgba(160,40,40,0.85)" : "rgba(0,0,0,0.55)" }}>
                <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 10.5, color: "#fff" }}>{tt(`status_${x.status}` as TKey)}{x.rejectReason ? `: ${x.rejectReason}` : ""}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
      <Text style={{ width: "100%", fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 6 }}>{tt("gridNote")}</Text>
    </View>
  );
}

/** the Badges tab: badge, ijazah chain, garden and juz certificates */
function Awards({ p, local }: { p: TalentProfile; local?: boolean }) {
  const t = useTheme();
  const tt = useTT();
  const card = (title: string, children: ReactNode) => (
    <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16, gap: 8 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{title}</Text>
      {children}
    </View>
  );
  return (
    <View style={{ gap: 12 }}>
      {card(tt("badgeTitle"), p.badge ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <BadgeMark badge={p.badge} size={26} />
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink }}>{tt(`badge_${p.badge}` as TKey)}</Text>
        </View>
      ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{p.mine ? tt("noBadgeMine") : tt("noBadge")}</Text>)}
      {p.ijazahChain ? card(tt("ijazahChain"), (
        <>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink }}>{p.ijazahChain}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{tt("unverifiedChain")}</Text>
        </>
      )) : null}
      {p.progress && !p.progress.hidden && (p.progress.treeStage > 0 || p.progress.certJuz.length) ? card(tt("garden"), (
        <>
          {p.progress.treeStage > 0 ? <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{tt("treeStage", { n: p.progress.treeStage })}</Text> : null}
          {p.progress.certJuz.length ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {p.progress.certJuz.map((j) => (
                <View key={j} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.pill, borderWidth: 1, borderColor: goldButton.line, backgroundColor: "rgba(201,166,94,0.12)" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.gold }}>{tt("juzN", { n: j })}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )) : p.mine && !local ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{tt("progressHidden")}</Text> : null}
      {p.mine ? <OutlineButton title={tt("badgeMine")} onPress={() => router.push("/talents/badges" as Href)} /> : null}
    </View>
  );
}

/** pick own clips (stories and posts) for a highlight */
function HighlightSheet({ visible, username, onClose, onCreated }: { visible: boolean; username: string; onClose: () => void; onCreated: () => void }) {
  const t = useTheme();
  const tt = useTT();
  const err = useTalentErr();
  const [all, setAll] = useState<Post[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!visible) return;
    setPicked([]); setTitle(""); setMsg(""); setAll(null);
    Promise.all([T.posts(username, "story"), T.posts(username, "post")])
      .then(([s, q]) => setAll([...s.posts, ...q.posts].filter((x) => x.media && (x.status ?? "approved") === "approved")))
      .catch((e) => { setMsg(err(e)); setAll([]); });
  }, [visible, username]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = async () => {
    setBusy(true); setMsg("");
    try { await T.createHighlight(title.trim(), picked); onCreated(); } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 20, gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{tt("newHighlight")}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tt("cancel")} hitSlop={10} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}><Icon name="close" color={t.muted} size={20} /></Pressable>
        </View>
        <LabeledField label={tt("highlightTitle")} value={title} onChangeText={setTitle} maxLength={30} />
        {!all ? <Loading /> : !all.length ? <Muted>{tt("noClipsMine")}</Muted> : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {all.map((x) => {
              const on = picked.includes(x.id);
              return (
                <Pressable key={x.id} onPress={() => setPicked(on ? picked.filter((y) => y !== x.id) : [...picked, x.id])} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={x.verseKey ?? ""}
                  style={{ width: 100, height: 150, borderRadius: 6, overflow: "hidden", borderWidth: 2, borderColor: on ? goldButton.to : "transparent" }}>
                  <ClipVisual compact verseKey={x.verseKey} name="" waveform={x.waveform} />
                  {on ? <View style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: goldButton.to, alignItems: "center", justifyContent: "center" }}><Icon name="check" color={goldButton.text} size={14} weight={2.6} /></View> : null}
                </Pressable>
              );
            })}
          </View>
        )}
        {msg ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.danger }}>{msg}</Text> : null}
        <GoldButton title={tt("save")} onPress={() => void save()} busy={busy} disabled={busy || !title.trim() || !picked.length} />
      </ScrollView>
    </Modal>
  );
}
