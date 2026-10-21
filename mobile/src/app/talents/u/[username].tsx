import { useCallback, useEffect, useRef, useState } from "react";
import { ActionSheetIOS, Alert, Modal, Platform, Pressable, ScrollView, Share, Text, View, useWindowDimensions } from "react-native";
import { Stack, router, useFocusEffect, useLocalSearchParams, type Href } from "expo-router";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Page, PageHero, Loading } from "@/components/page";
import { GoldButton, OutlineButton } from "@/components/brand";
import { LabeledField } from "@/components/form";
import { Icon } from "@/components/icons";
import { countryName } from "@/lib/countries";
import { SITE, ApiError } from "@/lib/api";
import { useLang } from "@/i18n";
import { SharerBadge, SharerRing } from "@/features/share/SharerUI";
import { T, type Highlight, type Post, type PostingStatus, type TalentProfile } from "@/features/talents/api";
import { useTT, type TKey } from "@/features/talents/text";
import { BadgeButton, BadgeMark, BadgeSheetHost } from "@/features/talents/badges";
import { ClipVisual } from "@/features/talents/ClipVisual";
import { PostingChecklist } from "@/features/talents/Checklist";
import { AccessGate, LevelBadge, Muted, ReportSheet, SafetyBar, SmallButton, TalentAvatar, useTalentAccess, useTalentErr } from "@/features/talents/ui";
import { usePro } from "@/lib/pro";
import { usePostingOn, useSijillFlags } from "@/features/sijill/config";
import { sijillApi, type Moment, type Sijill } from "@/features/sijill/api";
import { pickAvatar } from "@/features/talents/avatar";
import { MomentFeed, MomentGrid, MomentsEmpty, maOf } from "@/features/talents/MomentPosts";
import { usePT } from "@/features/talents/profileText";
import { Completeness, FollowedBy, Highlights, ShareSheet, Suggested } from "@/features/talents/ProfileExtras";
import type { SKey } from "@/features/sijill/text";
import { syncSijill } from "@/features/sijill/summary";
import { SijillShowcase, TreeBanner } from "@/features/sijill/Showcase";
import { useST } from "@/features/sijill/text";
import { RankLine } from "@/features/rankings/RankLine";

// /talents/u/[username] – the talent profile, built like Instagram/TikTok in the Masterclass design: avatar with a gold
// ring (live story), stats (clips · followers · following · likes), name with badge and level, rewaya/maqam/country,
// bio, follow / message / connect, story highlights, tabs (clips grid, saved, achievements), the path to posting.
// Owner decision 21.10.2026: with posting switched off (config posting.enabled) the profile is an achievement showcase:
// tabs Sijill (academic record), achievement moments and badges; clips, highlights and the posting path stay hidden.
// Owner 21.10.2026 ("like Instagram / early TikTok, only the likes are MashaAllahs"): TikTok header (avatar with a gold
// ring, name + badge + level, @username, big counters Following · Followers · MashaAllah, bio line, Follow / Message /
// share), the tree as a compact banner, tabs Achievements (3-column grid of moment cards, tap opens a full-screen
// vertical feed with double-tap MashaAllah) · Sijill · Badges. Own profile: tap the avatar to change the photo.
type Tab = "posts" | "saved" | "awards" | "sijill" | "moments";
export default function TalentProfileScreen() {
  const t = useTheme();
  const tt = useTT();
  const err = useTalentErr();
  const { lang } = useLang();
  const a = useTalentAccess();
  const { username } = useLocalSearchParams<{ username: string }>();
  const [p, setP] = useState<TalentProfile | null>(null);
  const [state, setState] = useState<"load" | "missing" | "ok" | "error">("load");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [saved, setSaved] = useState<Post[] | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [posting, setPosting] = useState<PostingStatus | null>(null);
  const [tab, setTab] = useState<Tab>("moments");
  const pt = usePT();
  const { width: winW } = useWindowDimensions();
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const [momentsMore, setMomentsMore] = useState<string | null>(null);
  const [feedAt, setFeedAt] = useState<number | null>(null);
  const [feedIds, setFeedIds] = useState<string[] | null>(null);
  const [sharing, setSharing] = useState(false);
  const [justFollowed, setJustFollowed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [reporting, setReporting] = useState(false);
  const [newHighlight, setNewHighlight] = useState(false);
  const st = useST();
  const { pro } = usePro();
  const flags = useSijillFlags();
  const postingFlag = usePostingOn();
  const postingRef = useRef(postingFlag);
  postingRef.current = postingFlag;
  const postingOn = postingFlag && p?.postingEnabled !== false;
  const [sijill, setSijill] = useState<Sijill | null | "restricted">(null);
  useEffect(() => { if (!postingOn && (tab === "posts" || tab === "saved")) setTab("moments"); else if (postingOn && (tab === "sijill" || tab === "moments")) setTab("posts"); }, [postingOn]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async () => {
    if (!username) return;
    try {
      const d = (await T.profile(username, lang)).profile;
      setP(d); setState("ok");
      setMoments(d.moments ?? []); setMomentsMore(d.momentsMore ?? null);
      // Sijill: the own record is brought up to date from this device first
      if (!d.blocked) {
        (d.mine ? syncSijill(pro).then(() => sijillApi.mine(lang)) : sijillApi.of(d.username, lang))
          .then((x) => setSijill(x.sijill ?? "restricted")).catch(() => setSijill("restricted"));
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
    } catch (e) { setState(e instanceof ApiError && e.status === 404 ? "missing" : "error"); }
  }, [username, lang, pro]); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { if (a.state === "ok") void load(); }, [a.state, load]));

  const run = async (fn: () => Promise<void>) => { setBusy(true); setMsg(""); try { await fn(); } catch (e) { setMsg(err(e)); } finally { setBusy(false); } };
  const confirm = (title: string, text: string, ok: string, fn: () => void) => {
    if (Platform.OS === "web") { fn(); return; }
    Alert.alert(title, text, [{ text: tt("cancel"), style: "cancel" }, { text: ok, style: "destructive", onPress: fn }]);
  };
  const follow = () => p && run(async () => {
    if (p.requested) { await T.follow(p.username, false); setP({ ...p, requested: false }); return; }
    const d = await T.follow(p.username, !p.followed);
    setP({ ...p, followed: d.followed, followers: d.followers, requested: !!d.requested });
    if (d.followed || d.requested) setJustFollowed(true);
    if (d.followed && p.restricted) await load();
  });
  const connect = () => p && run(async () => {
    if (p.connection === "incoming") { await T.answer(p.username, "accept"); await load(); return; }
    if (p.connection === "none") { const d = await T.connect(p.username); setP({ ...p, connection: d.connection }); return; }
    if (p.connection === "outgoing") { await T.disconnect(p.username); setP({ ...p, connection: "none" }); return; }
    confirm(tt("removeConnection"), tt("confirmRemove"), tt("removeConnection"), () => void run(async () => { await T.disconnect(p.username); setP({ ...p, connection: "none", canMessage: false }); }));
  });
  const message = () => p && run(async () => { const d = await T.openConversation(p.username); router.push(`/talents/messages/${d.id}` as Href); });
  const block = () => p && (p.blocked
    ? run(async () => { await T.block(p.username, false); await load(); })
    : confirm(tt("block"), tt("confirmBlock"), tt("block"), () => void run(async () => { await T.block(p.username, true); setP({ ...p, blocked: true, followed: false, connection: "none", canMessage: false }); })));
  const share = () => p && (p.shareQr?.length ? setSharing(true) : void Share.share({ message: `${p.name} (@${p.username}) · Quran Masterclass Talents\n${SITE}/${lang}/talents/${p.username}` }).catch(() => undefined));

  const nf = (n: number) => { try { return Intl.NumberFormat(lang, { notation: n >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n); } catch { return String(n); } };
  const stat = (n: number, label: string, onPress?: () => void) => (
    <Pressable key={label} onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? "button" : undefined} accessibilityLabel={`${n} ${label}`}
      style={({ pressed }) => ({ flex: 1, maxWidth: 130, alignItems: "center", minHeight: 52, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
      <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{nf(n)}</Text>
      <Text numberOfLines={1} style={{ fontFamily: FONT.medium, fontSize: 13, color: t.muted }}>{label}</Text>
    </Pressable>
  );
  // own profile: change the photo (library, camera, remove); the new URL carries avatar_version, so it shows at once
  const [photoMsg, setPhotoMsg] = useState("");
  const pick = (src: "library" | "camera") => p && void pickAvatar(src)
    .then((uri) => { if (uri) setP({ ...p, avatar: uri }); })
    .catch((e) => setPhotoMsg(e instanceof Error && e.message === "permission" ? tt("photoDenied") : err(e)));
  const removePhoto = () => p && void T.deleteAvatar().then(() => setP({ ...p, avatar: null })).catch((e) => setPhotoMsg(err(e)));
  const changePhoto = () => {
    if (!p) return;
    setPhotoMsg("");
    const opts = [tt("photoPick"), tt("photoTake"), ...(p.avatar ? [tt("photoRemove")] : []), tt("cancel")];
    const choose = (i: number) => { if (i === 0) pick("library"); else if (i === 1) pick("camera"); else if (i === 2 && p.avatar) removePhoto(); };
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions({ title: pt("photoTitle"), message: pt("photoHint"), options: opts, cancelButtonIndex: opts.length - 1, destructiveButtonIndex: p.avatar ? 2 : undefined }, choose);
    } else if (Platform.OS === "web") pick("library");
    else Alert.alert(pt("photoTitle"), pt("photoHint"), [
      { text: tt("photoPick"), onPress: () => pick("library") }, { text: tt("photoTake"), onPress: () => pick("camera") },
      ...(p.avatar ? [{ text: tt("photoRemove"), style: "destructive" as const, onPress: removePhoto }] : []), { text: tt("cancel"), style: "cancel" as const },
    ]);
  };
  const ring = p?.badge === "gold" || p?.badge === "official" ? "#E2C77F" : goldButton.line;
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
        <Page>
          <PageHero back topInset arcade={false} eyebrow={tt("network")} title={`@${username ?? ""}`} />
          <AccessGate a={a}>
            {state === "load" ? <Loading /> : state === "missing" ? <Muted>{tt("notFound")}</Muted> : state === "error" || !p ? (
              <View style={{ padding: 20 }}><OutlineButton title={tt("retry")} onPress={() => void load()} /></View>
            ) : (
              <View style={{ padding: 16, gap: 16 }}>
                {/* header (TikTok): avatar with gold ring, name + badge + level, @username, counters, bio line */}
                <View style={{ alignItems: "center", gap: 8 }}>
                  <Pressable onPress={p.liveStory && postingOn ? () => router.push(`/talents/player?src=user&u=${p.username}&type=story` as Href) : p.mine ? changePhoto : undefined}
                    disabled={!(p.liveStory && postingOn) && !p.mine} accessibilityRole={p.mine || p.liveStory ? "button" : "image"}
                    accessibilityLabel={p.liveStory && postingOn ? tt("watchStory") : p.mine ? pt("changePhoto") : p.name}
                    style={{ padding: 3, borderRadius: 70, borderWidth: 2.5, borderColor: p.liveStory && postingOn ? goldButton.from : ring }}>
                    <View style={{ borderRadius: 60, borderWidth: p.badge === "emerald" ? 2 : 0, borderColor: "#0F8A63" }}>
                      <SharerRing tier={p.sharerTier} size={100}><TalentAvatar name={p.name} size={100} uri={p.avatar} badge={p.badge} /></SharerRing>
                    </View>
                    {p.mine ? (
                      <View style={{ position: "absolute", right: 2, bottom: 2, width: 30, height: 30, borderRadius: 15, backgroundColor: goldButton.to, borderWidth: 2, borderColor: t.bg, alignItems: "center", justifyContent: "center" }}>
                        <Icon name="plus" color={goldButton.text} size={16} weight={2.6} />
                      </View>
                    ) : null}
                  </Pressable>
                  {photoMsg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.danger, textAlign: "center" }}>{photoMsg}</Text> : null}
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, flexWrap: "wrap" }}>
                    <Text accessibilityRole="header" style={{ flexShrink: 1, fontFamily: FONT.display, fontSize: 21, color: t.ink, textAlign: "center" }}>{p.name}</Text>
                    <BadgeButton badge={p.badge} size={20} />
                    <LevelBadge level={p.level} />
                    {p.private ? <Icon name="lock" color={t.muted} size={15} /> : null}
                  </View>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.muted, writingDirection: "ltr" }}>@{p.username}</Text>
                  <View style={{ flexDirection: "row", alignSelf: "stretch", justifyContent: "center", marginTop: 4 }}>
                    {stat(p.following, tt("following"), p.restricted ? undefined : () => router.push(`/talents/list?u=${p.username}&kind=following` as Href))}
                    {stat(p.followers, tt("followers"), p.restricted ? undefined : () => router.push(`/talents/list?u=${p.username}&kind=followers` as Href))}
                    {postingOn ? stat(p.likes, tt("statLikes")) : stat(maTotal, pt("statMashaAllah"), p.restricted || !moments?.length ? undefined : () => setTab("moments"))}
                  </View>
                  {bioLine ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: t.ink, textAlign: "center" }}>{bioLine}</Text> : null}
                  {!p.private ? <RankLine username={p.username} /> : null}
                  {p.maqam ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{`${tt("maqam")}: ${p.maqam}`}</Text> : null}
                  <SharerBadge tier={p.sharerTier} />
                  {p.officialChannel ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.gold }}>{tt("officialChannel", { c: p.officialChannel })}</Text> : null}
                  {p.bio ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink, textAlign: "center" }}>{p.bio}</Text> : null}
                  <FollowedBy p={p} />
                </View>

                {/* actions */}
                {p.mine ? (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ flex: 1 }}><SmallButton title={tt("editProfile")} onPress={() => router.push("/community/me" as Href)} /></View>
                    <View style={{ flex: 1 }}><SmallButton title={tt("shareProfile")} onPress={share} /></View>
                    <IconBtn icon="settings" label={tt("settings")} onPress={() => router.push("/talents/settings" as Href)} />
                  </View>
                ) : null}
                {p.mine && !postingOn ? (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ flex: 1 }}><SmallButton title={st("privacyBtn")} onPress={() => router.push("/talents/sijill" as Href)} /></View>
                    <View style={{ flex: 1 }}><SmallButton title={st("friends")} onPress={() => router.push("/talents/friends" as Href)} /></View>
                  </View>
                ) : p.mine ? null : p.blocked ? (
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{tt("blockedInfo")}</Text>
                ) : (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ flex: 1 }}><SmallButton title={followLabel} tone={p.followed || p.requested ? "plain" : "gold"} onPress={follow} disabled={busy} label={`${followLabel}, ${p.name}`} /></View>
                    {p.canMessage ? <View style={{ flex: 1 }}><SmallButton title={tt("message")} onPress={message} disabled={busy} /></View> : null}
                    {a.age?.interact ? <View style={{ flex: 1 }}><SmallButton title={connLabel} onPress={connect} disabled={busy} label={`${connLabel}, ${p.name}`} /></View> : null}
                    <IconBtn icon="share" label={tt("shareProfile")} onPress={share} />
                  </View>
                )}
                {/* Sijill: compare (mutual follows or connections; the server checks) */}
                {!p.mine && !p.blocked && flags.compare && (p.followed || p.connection === "connected") ? (
                  <SmallButton title={st("compare")} onPress={() => router.push(`/talents/compare/${p.username}` as Href)} label={`${st("compare")}, ${p.name}`} />
                ) : null}
                {p.connection === "incoming" && !p.blocked ? (
                  <Pressable onPress={() => void run(async () => { await T.answer(p.username, "decline"); setP({ ...p, connection: "none" }); })} accessibilityRole="button" style={{ minHeight: 40, justifyContent: "center" }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{tt("decline")}</Text>
                  </Pressable>
                ) : null}
                {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: t.muted }}>{msg}</Text> : null}
                {p.mine ? <Completeness p={p} onPhoto={changePhoto} /> : null}
                {(p.mine || justFollowed) && !p.blocked ? <Suggested exclude={p.username} /> : null}
                {!postingOn && !p.restricted && !p.blocked && moments?.length ? <Highlights moments={moments} onOpen={(ids) => { setFeedIds(ids); setFeedAt(0); }} /> : null}

                {/* highlights */}
                {postingOn && !p.restricted && !p.blocked && (highlights.length || p.mine) ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingVertical: 4 }}>
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

                {postingOn && p.mine && posting ? (posting.ok
                  ? <GoldButton title={tt("newClip")} onPress={() => router.push("/talents/record" as Href)} />
                  : <PostingChecklist s={posting} />) : null}

                {/* Sijill: the garden tree as a banner (only when the member shows the tree section) */}
                {!postingOn && sijill && sijill !== "restricted" && sijill.tree ? <TreeBanner tree={sijill.tree} height={130} /> : null}

                {/* tabs */}
                {p.restricted ? (
                  <View style={{ alignItems: "center", gap: 8, paddingVertical: 24 }}>
                    <Icon name="lock" color={t.muted} size={26} />
                    <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{tt("privateTitle")}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "center" }}>{tt("privateText")}</Text>
                  </View>
                ) : !p.blocked ? (
                  <>
                    <View accessibilityRole="tablist" style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: t.line }}>
                      {(postingOn
                        ? [["posts", tt("tabClips")], ...(p.mine ? [["saved", tt("tabSaved")]] : []), ["awards", tt("tabAwards")]]
                        : [["moments", pt("tabAchievements")], ["sijill", st("tabSijill")], ["awards", pt("tabBadges")]]
                      ).map(([k, label]) => [k as Tab, label] as const).map(([k, label]) => (
                        <Pressable key={k} onPress={() => setTab(k)} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}
                          style={{ flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderBottomWidth: 2, borderBottomColor: tab === k ? goldButton.to : "transparent" }}>
                          <Text style={{ fontFamily: tab === k ? FONT.bold : FONT.semibold, fontSize: 14, color: tab === k ? t.ink : t.muted }}>{label}</Text>
                        </Pressable>
                      ))}
                    </View>
                    {tab === "sijill" ? (sijill === null ? <Loading /> : sijill === "restricted" ? <Muted>{st("restricted")}</Muted> : <SijillShowcase s={sijill} mine={p.mine} name={p.name} username={p.username} noTree />)
                      : tab === "moments" ? <MomentGrid moments={moments} width={Math.min(winW, 860) - 32} onOpen={(i) => { setFeedIds(null); setFeedAt(i); }} empty={<MomentsEmpty mine={p.mine} />} />
                      : tab === "posts" ? <Grid posts={posts} src={`user&u=${p.username}&type=post`} empty={p.mine ? tt("noClipsMine") : tt("noClips")} own={p.mine} />
                      : tab === "saved" ? <Grid posts={saved} src="saved" empty={tt("noSaved")} />
                      : <Awards p={p} />}
                  </>
                ) : null}

                <SafetyBar onReport={p.mine ? undefined : () => setReporting(true)} onBlock={p.mine ? undefined : block} blocked={p.blocked} />
              </View>
            )}
          </AccessGate>
        </Page>
      </BadgeSheetHost>
      {p ? <ReportSheet visible={reporting} title={tt("reportProfile")} onClose={() => setReporting(false)} onSubmit={(c, r) => T.reportProfile(p.username, c, r).then(() => undefined)} /> : null}
      {p && moments && feedAt !== null ? (
        <MomentFeed visible moments={feedIds ? moments.filter((m) => feedIds.includes(m.id)) : moments} start={feedAt} username={p.username} more={feedIds ? null : momentsMore} onClose={() => setFeedAt(null)} onChange={onMoment}
          onMore={(l, more) => { setMoments((old) => [...(old ?? []), ...l.filter((x) => !old?.some((y) => y.id === x.id))]); setMomentsMore(more); }} />
      ) : null}
      {p ? <ShareSheet p={p} visible={sharing} onClose={() => setSharing(false)} /> : null}
      {p?.mine ? <HighlightSheet visible={newHighlight} username={p.username} onClose={() => setNewHighlight(false)} onCreated={() => { setNewHighlight(false); void load(); }} /> : null}
    </>
  );
}

/** a square outline button with an icon (share, settings) next to the text buttons */
function IconBtn({ icon, label, onPress }: { icon: "share" | "settings"; label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => ({ width: 44, minHeight: 40, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
      <Icon name={icon} color={t.ink} size={18} />
    </Pressable>
  );
}

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

function Awards({ p }: { p: TalentProfile }) {
  const t = useTheme();
  const tt = useTT();
  const card = (title: string, children: React.ReactNode) => (
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
      {p.progress && !p.progress.hidden ? card(tt("garden"), (
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
      )) : p.mine ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{tt("progressHidden")}</Text> : null}
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
