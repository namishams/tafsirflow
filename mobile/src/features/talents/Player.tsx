import { RareBadge } from "@/features/cosmetics/RareBadge";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProMark } from "./ProMark";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, Share, Text, TextInput, View, type ListViewToken } from "react-native";
import { router, useFocusEffect, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { VideoView, useVideoPlayer } from "expo-video";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { SITE } from "@/lib/api";
import { useLang } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { T, mediaSource, type Comment, type Post } from "./api";
import { useTT, type TKey } from "./text";
import { shareHref } from "@/features/messenger/api";
import { useMT } from "@/features/messenger/ui";
import { BadgeButton, BadgeSheetHost } from "./badges";
import { ClipVisual } from "./ClipVisual";
import { ReportSheet, TalentAvatar, useTalentErr } from "./ui";

// Full-screen vertical player for recitation clips (TikTok-style): one clip per page, sound of the visible clip only,
// actions on the side (profile and follow, like, comments, save, share, report or block).
export type Loader = (cursor?: string) => Promise<{ posts: Post[]; next: string | null }>;

export function ClipPlayer({ load, initial, startId, bottomSpace = 0, emptyText }: { load?: Loader; initial?: Post[]; startId?: string; bottomSpace?: number; emptyText?: string }) {
  const tt = useTT();
  const err = useTalentErr();
  const [posts, setPosts] = useState<Post[] | null>(initial ?? null);
  const [next, setNext] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [h, setH] = useState(0);
  const [msg, setMsg] = useState("");
  const loading = useRef(false);
  const audio = useAudioPlayer(null);
  const [focused, setFocused] = useState(true);

  useEffect(() => {
    if (initial || !load) return;
    load().then((d) => { setPosts(d.posts); setNext(d.next); }).catch((e) => { setMsg(err(e)); setPosts([]); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const more = () => {
    if (!load || !next || loading.current) return;
    loading.current = true;
    load(next).then((d) => { setPosts((p) => [...(p ?? []), ...d.posts]); setNext(d.next); }).catch(() => undefined).finally(() => { loading.current = false; });
  };
  const startIndex = Math.max(0, posts?.findIndex((p) => p.id === startId) ?? 0);
  useEffect(() => { setActive(startIndex); }, [startIndex]);

  // sound of the visible audio clip
  const current = posts?.[active];
  useEffect(() => {
    let alive = true;
    audio.pause();
    if (!current?.media || current.hasVideo || !focused) return;
    void (async () => {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => undefined);
      const src = await mediaSource(current.media!);
      if (!alive) return;
      audio.replace(src);
      audio.loop = true;
      audio.play();
    })();
    return () => { alive = false; audio.pause(); };
  }, [current?.id, focused]); // eslint-disable-line react-hooks/exhaustive-deps
  // pause while another screen is on top (profile, comments stay on this screen)
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));

  const onViewable = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const v = viewableItems.find((x) => x.isViewable);
    if (v?.index != null) setActive(v.index);
  }).current;
  const patch = useCallback((id: string, p: Partial<Post>) => setPosts((all) => all?.map((x) => (x.id === id ? { ...x, ...p } : x)) ?? null), []);
  const removeAuthor = useCallback((username: string) => setPosts((all) => all?.filter((x) => x.author.username !== username) ?? null), []);
  const removeId = useCallback((id: string) => setPosts((all) => all?.filter((x) => x.id !== id) ?? null), []);

  return (
    <BadgeSheetHost>
      <View style={{ flex: 1, backgroundColor: stage.deep }} onLayout={(e) => setH(Math.round(e.nativeEvent.layout.height))}>
        {!posts ? <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={stage.gold} /></View>
          : !posts.length ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: stage.textSoft, textAlign: "center" }}>{msg || emptyText || tt("noClips")}</Text>
            </View>
          ) : h > 0 ? (
            <FlatList data={posts} keyExtractor={(p) => p.id} pagingEnabled snapToInterval={h} decelerationRate="fast" disableIntervalMomentum showsVerticalScrollIndicator={false}
              getItemLayout={(_, i) => ({ length: h, offset: h * i, index: i })} initialScrollIndex={Math.min(startIndex, posts.length - 1)}
              onViewableItemsChanged={onViewable} viewabilityConfig={{ itemVisiblePercentThreshold: 60 }} onEndReached={more} onEndReachedThreshold={2}
              windowSize={3} initialNumToRender={1} maxToRenderPerBatch={2}
              renderItem={({ item, index }) => (
                <ClipPage post={item} height={h} active={index === active && focused} bottomSpace={bottomSpace} audio={audio} onPatch={patch} onBlocked={removeAuthor} onRemoved={removeId} />
              )} />
          ) : null}
      </View>
    </BadgeSheetHost>
  );
}

function ClipPage({ post, height, active, bottomSpace, audio, onPatch, onBlocked, onRemoved }: {
  post: Post; height: number; active: boolean; bottomSpace: number; audio: ReturnType<typeof useAudioPlayer>;
  onPatch: (id: string, p: Partial<Post>) => void; onBlocked: (username: string) => void; onRemoved: (id: string) => void;
}) {
  const tt = useTT();
  const err = useTalentErr();
  const { lang } = useLang();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const st = useAudioPlayerStatus(audio);
  const video = useVideoPlayer(null, (p) => { p.loop = true; });
  const [comments, setComments] = useState(false);
  const [report, setReport] = useState(false);
  const [note, setNote] = useState("");
  const mine = !!post.author.mine;

  useEffect(() => {
    if (!post.hasVideo || !post.media) return;
    let alive = true;
    if (active) void mediaSource(post.media).then((src) => { if (alive) { video.replace(src); video.play(); } });
    else video.pause();
    return () => { alive = false; };
  }, [active, post.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (fn: () => Promise<void>) => { setNote(""); try { await fn(); } catch (e) { setNote(err(e)); } };
  const like = () => act(async () => { const d = await T.like(post.id, !post.liked); onPatch(post.id, { liked: d.liked, likes: d.likes }); });
  const save = () => act(async () => { const d = await T.save(post.id, !post.saved); onPatch(post.id, { saved: d.saved }); });
  const follow = () => act(async () => { const d = await T.follow(post.author.username, true); onPatch(post.id, { author: { ...post.author, followed: d.followed } }); });
  const share = () => void Share.share({ message: `${post.author.name} · ${post.verseKey ?? ""}\n${SITE}/${lang}/talents/${post.author.username}` }).catch(() => undefined);
  const more = () => {
    const opts: { text: string; style?: "destructive" | "cancel"; onPress?: () => void }[] = mine
      ? [{ text: tt("deleteClip"), style: "destructive", onPress: () => void act(async () => { await T.deletePost(post.id); onRemoved(post.id); }) }]
      : [
        { text: tt("report"), onPress: () => setReport(true) },
        { text: tt("block"), style: "destructive", onPress: () => Alert.alert(tt("block"), tt("confirmBlock"), [{ text: tt("cancel"), style: "cancel" }, { text: tt("block"), style: "destructive", onPress: () => void act(async () => { await T.block(post.author.username, true); onBlocked(post.author.username); }) }]) },
        { text: tt("guidelines"), onPress: () => router.push("/talents/guidelines" as Href) },
      ];
    Alert.alert(tt("more"), undefined, [...opts, { text: tt("cancel"), style: "cancel" }]);
  };
  const progress = !post.hasVideo && active && st.duration ? st.currentTime / st.duration : 0;
  const mt = useMT();
  const side = (icon: Parameters<typeof Icon>[0]["name"], label: string, count: string | null, onPress: () => void, on = false) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}${count ? `, ${count}` : ""}`} accessibilityState={{ selected: on }} hitSlop={6} style={{ alignItems: "center", gap: 3, minWidth: 48 }}>
      <View style={{ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.28)", borderWidth: 1, borderColor: on ? stage.gold : "rgba(255,255,255,0.14)" }}>
        <Icon name={icon} color={on ? stage.gold : "#fff"} size={22} filled={on} />
      </View>
      {count !== null ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: "#fff" }}>{count}</Text> : null}
    </Pressable>
  );
  const nf = (n: number) => Intl.NumberFormat(lang, { notation: "compact" }).format(n);
  if (!post.media) return <View style={{ height }} />;
  return (
    <View style={{ height, backgroundColor: stage.deep }}>
      {post.hasVideo ? <VideoView player={video} style={{ flex: 1 }} contentFit="cover" nativeControls={false} /> : (
        <View style={{ flex: 1, paddingTop: insets.top + 44, paddingBottom: bottomSpace + 120 }}>
          <ClipVisual verseKey={post.verseKey} name={post.author.name} badge={post.author.badge} waveform={post.waveform} progress={progress} />
        </View>
      )}
      {/* author, caption */}
      <View style={{ position: "absolute", left: 16, right: 84, bottom: bottomSpace + 22, gap: 6 }}>
        <Pressable onPress={() => router.push(`/talents/u/${post.author.username}` as Href)} accessibilityRole="link" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 16, color: "#fff" }}>{post.author.name}</Text>
          <BadgeButton badge={post.author.badge} size={16} />
          <ProMark pro={post.author.pro} size={14} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: stage.gold }}>{tt(`level_${post.author.level}` as TKey)}</Text>
        </Pressable>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.textSoft }}>{post.verseKey}{post.type === "story" ? ` · ${tt("typeStory")}` : ""}</Text>
        {post.caption ? <Text numberOfLines={3} style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "#fff" }}>{post.caption}</Text> : null}
        {note ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: goldButton.from }}>{note}</Text> : null}
      </View>
      {/* side actions */}
      <View style={{ position: "absolute", right: 12, bottom: bottomSpace + 22, gap: 14, alignItems: "center" }}>
        <Pressable onPress={() => router.push(`/talents/u/${post.author.username}` as Href)} accessibilityRole="link" accessibilityLabel={post.author.name} style={{ alignItems: "center" }}>
          <TalentAvatar name={post.author.name} size={48} badge={post.author.badge} />
          {!mine && !post.author.followed && user ? (
            <Pressable onPress={() => void follow()} accessibilityRole="button" accessibilityLabel={`${tt("follow")}, ${post.author.name}`} hitSlop={8}
              style={{ marginTop: -10, width: 22, height: 22, borderRadius: 11, backgroundColor: goldButton.to, alignItems: "center", justifyContent: "center" }}>
              <Icon name="plus" color={goldButton.text} size={14} weight={2.6} />
            </Pressable>
          ) : null}
        </Pressable>
        {side("heart", tt("like"), nf(post.likes), () => void like(), post.liked)}
        {side("comment", tt("comments"), nf(post.comments), () => setComments(true))}
        {side("bookmark", tt("saveClip"), null, () => void save(), post.saved)}
        {side("send", mt.replyPost, null, () => router.push(shareHref({ type: "post", ref: post.id, title: `${post.author.name} (@${post.author.username})`, subtitle: [post.verseKey, post.caption].filter(Boolean).join(" · ").slice(0, 200), url: `/talents/u/${post.author.username}` }) as Href))}
        {side("share", tt("share"), null, share)}
        {side("menu", tt("more"), null, more)}
      </View>
      <CommentsSheet visible={comments} post={post} onClose={() => setComments(false)} onCount={(n) => onPatch(post.id, { comments: n })} />
      <ReportSheet visible={report} title={tt("reportClip")} onClose={() => setReport(false)} onSubmit={(c, r) => T.reportPost(post.id, c, r).then(() => undefined)} />
    </View>
  );
}

export function CommentsSheet({ visible, post, onClose, onCount }: { visible: boolean; post: Post; onClose: () => void; onCount: (n: number) => void }) {
  const t = useTheme();
  const tt = useTT();
  const err = useTalentErr();
  const insets = useSafeAreaInsets();
  const [list, setList] = useState<Comment[] | null>(null);
  const [more, setMore] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [report, setReport] = useState<string | null>(null);
  useEffect(() => {
    if (!visible) return;
    setList(null); setMsg("");
    T.comments(post.id).then((d) => { setList(d.comments); setMore(d.more); }).catch((e) => { setMsg(err(e)); setList([]); });
  }, [visible, post.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setBusy(true); setMsg("");
    try { const d = await T.comment(post.id, body); setList((l) => [...(l ?? []), d.comment]); setText(""); onCount(post.comments + 1); }
    catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  const options = (c: Comment) => Alert.alert(tt("more"), undefined, [
    ...(c.canDelete ? [{ text: tt("deleteComment"), style: "destructive" as const, onPress: () => void T.deleteComment(c.id).then(() => { setList((l) => l?.filter((x) => x.id !== c.id) ?? null); onCount(Math.max(0, post.comments - 1)); }).catch((e) => setMsg(err(e))) }] : []),
    ...(!c.mine ? [{ text: tt("report"), onPress: () => setReport(c.id) }] : []),
    { text: tt("cancel"), style: "cancel" as const },
  ]);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: t.line }}>
          <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 19, color: t.ink }}>{tt("comments")}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tt("done")} hitSlop={10} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}><Icon name="close" color={t.muted} size={20} /></Pressable>
        </View>
        {!list ? <ActivityIndicator style={{ marginTop: 24 }} /> : (
          <FlatList data={list} keyExtractor={(c) => c.id} contentContainerStyle={{ padding: 16, gap: 14 }}
            ListHeaderComponent={more ? <Pressable onPress={() => void T.comments(post.id, more).then((d) => { setList((l) => [...d.comments, ...(l ?? [])]); setMore(d.more); })} accessibilityRole="button" style={{ minHeight: 40, justifyContent: "center", alignItems: "center" }}><Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{tt("loadOlder")}</Text></Pressable> : undefined}
            ListEmptyComponent={<Text style={{ fontFamily: FONT.regular, fontSize: 14.5, color: t.muted, textAlign: "center", paddingVertical: 24 }}>{msg || tt("noComments")}</Text>}
            renderItem={({ item: c }) => (
              <Pressable onLongPress={() => options(c)} delayLongPress={350} accessibilityActions={[{ name: "more", label: tt("more") }]} onAccessibilityAction={() => options(c)}
                style={{ flexDirection: "row", gap: 10 }}>
                <TalentAvatar name={c.author?.name ?? "?"} size={36} badge={c.author?.badge} frame={c.author?.frame} />
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 13.5, color: t.ink }}>{c.author?.name ?? tt("you")}</Text>
                    <BadgeButton badge={c.author?.badge} size={13} />
                    <ProMark pro={c.author?.pro} size={12} />
                    <RareBadge slug={c.author?.rare} size={14} />
                  </View>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink }}>{c.text}</Text>
                </View>
              </Pressable>
            )} />
        )}
        {msg && list?.length ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.danger, paddingHorizontal: 16 }}>{msg}</Text> : null}
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 12, paddingTop: 8, paddingBottom: insets.bottom + 8, borderTopWidth: 1, borderTopColor: t.line, backgroundColor: t.surface }}>
          <TextInput value={text} onChangeText={setText} placeholder={tt("writeComment")} placeholderTextColor={t.muted} accessibilityLabel={tt("writeComment")} multiline maxLength={500}
            style={{ flex: 1, minHeight: 44, maxHeight: 110, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 12, paddingTop: 11, paddingBottom: 11, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
          <Pressable onPress={() => void send()} disabled={busy || !text.trim()} accessibilityRole="button" accessibilityLabel={tt("send")}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: goldButton.to, alignItems: "center", justifyContent: "center", opacity: busy || !text.trim() ? 0.5 : 1 }}>
            <Icon name="send" color={goldButton.text} size={19} />
          </Pressable>
        </View>
        <ReportSheet visible={!!report} title={tt("reportComment")} onClose={() => setReport(null)} onSubmit={(c, r) => (report ? T.reportComment(report, c, r) : Promise.resolve()).then(() => undefined)} />
      </KeyboardAvoidingView>
    </Modal>
  );
}
