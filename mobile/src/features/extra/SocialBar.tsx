import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Share, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { ApiError, SITE, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { FONT, R, useTheme } from "@/lib/theme";
import { request } from "./http";
import { useReducedMotionX } from "./motion";
import { useSiteConfig } from "./config";
import { fill, useX } from "./strings";

type Stats = { views: number; shares: number; likes: number; comments: number; liked: boolean; signedIn?: boolean; verified?: boolean };
type Comment = { id: number; parentId: number | null; body: string; pending: boolean; mine: boolean; author: string; country: string | null; at: string };
export const HEART = "#c9405a";

/** 1234 -> 1.2K (compact like the website, Latin digits) */
export function compact(n: number, lang: string): string {
  try { return new Intl.NumberFormat(lang, { notation: "compact", maximumFractionDigits: 1 }).format(n); }
  catch { return n < 1000 ? String(n) : n < 1e6 ? `${(n / 1000).toFixed(n < 1e4 ? 1 : 0)}K` : `${(n / 1e6).toFixed(1)}M`; }
}

/**
 * Likes, comments (moderated), shares and views for one verse – the website's SocialBar against /api/social.
 * Props: verseKey "2:255"; shareText (the translation, shared with the link); trackView (count a view, default true);
 * onStage (white text for the dark stage). Likes and comments need a signed-in, confirmed account; the owner can
 * switch both off in the admin dashboard (read from /api/config).
 */
export function SocialBar({ verseKey, shareText, trackView = true, onStage = false }: { verseKey: string; shareText?: string; trackView?: boolean; onStage?: boolean }) {
  const t = useTheme();
  const w = useWebT("social");
  const x = useX();
  const { lang } = useLang();
  const { user } = useAuth();
  const { features } = useSiteConfig();
  const reduced = useReducedMotionX();
  const [s, setS] = useState<Stats>({ views: 0, shares: 0, likes: 0, comments: 0, liked: false });
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const viewed = useRef("");
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (trackView && viewed.current !== verseKey) { viewed.current = verseKey; await api("/api/social/view", { body: { key: verseKey } }).catch(() => undefined); }
        const d = await api<Stats>(`/api/social/stats?key=${verseKey}`);
        if (live) setS(d);
      } catch { /* the numbers are optional */ }
    })();
    return () => { live = false; };
  }, [verseKey, trackView, user?.id]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };
  const needAuth = (e: unknown) => {
    if (!(e instanceof ApiError)) return false;
    if (e.status === 401) { flash(x.social.signIn); router.push("/sign-in"); return true; }
    if (e.status === 403) { flash(e.code === "off" ? w("error") : x.verify); return true; }
    return false;
  };

  // optimistic: the heart reacts at once, the server answer corrects it
  const like = async () => {
    if (!user) { flash(x.social.signIn); router.push("/sign-in"); return; }
    const was = s.liked;
    setS((v) => ({ ...v, liked: !was, likes: Math.max(0, v.likes + (was ? -1 : 1)) }));
    if (!was && !reduced) Animated.sequence([Animated.timing(pop, { toValue: 1.25, duration: 120, useNativeDriver: true }), Animated.timing(pop, { toValue: 1, duration: 160, useNativeDriver: true })]).start();
    try { setS(await api<Stats>("/api/social/like", { body: { key: verseKey } })); }
    catch (e) { setS((v) => ({ ...v, liked: was, likes: Math.max(0, v.likes + (was ? 1 : -1)) })); if (!needAuth(e)) flash(w("error")); }
  };
  const share = async () => {
    const [c, v] = verseKey.split(":");
    const url = `${SITE}/${lang}/surah/${c}?v=${v}`;
    try {
      const r = await Share.share(Platform.OS === "ios" ? { url, message: shareText ? `${shareText}\n\nQuran ${verseKey}` : `Quran ${verseKey}` } : { message: `${shareText ? `${shareText}\n\n` : ""}Quran ${verseKey}\n${url}`, title: `Quran ${verseKey}` });
      if (r.action === Share.sharedAction) setS(await api<Stats>("/api/social/share", { body: { key: verseKey } }));
    } catch { /* cancelled */ }
  };

  const muted = onStage ? "rgba(255,255,255,0.7)" : t.muted;
  const btn = { flexDirection: "row" as const, alignItems: "center" as const, gap: 6, height: 36, paddingHorizontal: 10, borderRadius: R.pill };
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {features.likes ? (
          <Pressable onPress={() => void like()} accessibilityRole="button" accessibilityState={{ selected: s.liked }} accessibilityLabel={`${w("like")}, ${fill(x.social.likes, { n: s.likes })}`} hitSlop={4}
            style={({ pressed }) => [btn, pressed && { backgroundColor: onStage ? "rgba(255,255,255,0.08)" : t.bg }]}>
            <Animated.View style={{ transform: [{ scale: pop }] }}><Icon name="heart" filled={s.liked} color={s.liked ? HEART : muted} size={18} /></Animated.View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: s.liked ? HEART : muted, fontVariant: ["tabular-nums"] }}>{compact(s.likes, lang)}</Text>
          </Pressable>
        ) : null}
        {features.comments ? (
          <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${w("comments")}, ${s.comments}`} hitSlop={4}
            style={({ pressed }) => [btn, pressed && { backgroundColor: onStage ? "rgba(255,255,255,0.08)" : t.bg }]}>
            <Icon name="comment" color={muted} size={18} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: muted, fontVariant: ["tabular-nums"] }}>{compact(s.comments, lang)}</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={() => void share()} accessibilityRole="button" accessibilityLabel={`${w("share")}, ${s.shares}`} hitSlop={4}
          style={({ pressed }) => [btn, pressed && { backgroundColor: onStage ? "rgba(255,255,255,0.08)" : t.bg }]}>
          <Icon name="share" color={muted} size={18} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: muted, fontVariant: ["tabular-nums"] }}>{compact(s.shares, lang)}</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <View accessible accessibilityLabel={`${w("views")}: ${s.views}`} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="eye" color={muted} size={18} />
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: muted, fontVariant: ["tabular-nums"] }}>{compact(s.views, lang)}</Text>
        </View>
      </View>
      {toast ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 12.5, color: muted, marginTop: 6 }}>{toast}</Text> : null}
      <CommentsSheet visible={open} verseKey={verseKey} onClose={() => setOpen(false)} onCount={(n) => setS((v) => ({ ...v, comments: n }))} />
    </View>
  );
}

/** the comment sheet of one verse: rules, comments with one level of replies, report / delete, the composer */
export function CommentsSheet({ visible, verseKey, onClose, onCount }: { visible: boolean; verseKey: string; onClose: () => void; onCount?: (n: number) => void }) {
  const t = useTheme();
  const w = useWebT("social");
  const x = useX();
  const { lang } = useLang();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [list, setList] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [reply, setReply] = useState<Comment | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await api<{ comments: Comment[] }>(`/api/social/comments?key=${verseKey}`);
      setList(d.comments); onCount?.(d.comments.filter((c) => !c.pending).length);
    } catch { setList([]); }
  }, [verseKey, onCount]);
  useEffect(() => { if (visible) { setMsg(null); void load(); } }, [visible, load]);

  const auth = (e: unknown) => {
    if (!(e instanceof ApiError)) return false;
    if (e.status === 401) { onClose(); router.push("/sign-in"); return true; }
    if (e.status === 403 && e.code === "verify") { setMsg({ kind: "err", text: x.verify }); return true; }
    return false;
  };
  const send = async () => {
    if (!user) { onClose(); router.push("/sign-in"); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await request<{ pending?: boolean; error?: string; reason?: string }>("/api/social/comment", { key: verseKey, body: text, parentId: reply?.id });
      const d = r.data;
      if (r.ok) { setText(""); setReply(null); setMsg({ kind: "ok", text: d.pending ? w("pendingNote") : w("posted") }); void load(); return; }
      if (r.status === 401) { onClose(); router.push("/sign-in"); return; }
      if (r.status === 403 && d.error === "verify") { setMsg({ kind: "err", text: x.verify }); return; }
      const reason = r.status === 422 ? w(`rej_${d.reason ?? "ai"}`) : "";
      setMsg({ kind: "err", text: reason && !reason.startsWith("rej_") ? reason : r.status === 422 ? w("rej_ai") : r.status === 429 ? w("rate") : d.error === "banned" ? w("banned") : r.status === 409 ? w("duplicate") : d.error === "captcha" ? x.feedback.captcha : w("error") });
    } catch { setMsg({ kind: "err", text: x.offline }); }
    finally { setBusy(false); }
  };
  const report = async (c: Comment) => { try { await api("/api/social/report", { body: { id: c.id } }); setMsg({ kind: "ok", text: w("reported") }); } catch (e) { if (!auth(e)) setMsg({ kind: "err", text: w("error") }); } };
  const del = async (c: Comment) => { try { await api("/api/social/delete", { body: { id: c.id } }); } catch { /* ignore */ } void load(); };

  const roots = (list ?? []).filter((c) => !c.parentId);
  const Item = ({ c, child }: { c: Comment; child?: boolean }) => (
    <View style={[{ paddingVertical: 12 }, child && { marginLeft: 20, paddingLeft: 14, borderLeftWidth: 1, borderLeftColor: t.line }]}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>
        <Text style={{ fontFamily: FONT.semibold, color: t.ink }}>{c.author}</Text>
        {c.country ? ` · ${c.country}` : ""} · {new Date(c.at).toLocaleDateString(lang, { day: "numeric", month: "short" })}
        {c.pending ? `  ·  ${w("pending")}` : ""}
      </Text>
      <Text selectable style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink, marginTop: 4 }}>{c.body}</Text>
      <View style={{ flexDirection: "row", gap: 18, marginTop: 6 }}>
        {!child && !c.pending ? <Text onPress={() => setReply(c)} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{w("reply")}</Text> : null}
        {c.mine
          ? <Text onPress={() => void del(c)} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{w("delete")}</Text>
          : <Pressable onPress={() => void report(c)} accessibilityRole="button" accessibilityLabel={w("report")} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icon name="flag" size={13} color={t.muted} /><Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{w("report")}</Text></Pressable>}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.surface }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 58, borderBottomWidth: 1, borderBottomColor: t.line }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 19, letterSpacing: -0.3, color: t.ink }}>{fill(x.social.sheetTitle, { key: verseKey })}</Text>
          <Text onPress={onClose} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent, paddingVertical: 8 }}>{w("close")}</Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, paddingVertical: 12 }}>{w("rules")}</Text>
          {list === null ? <ActivityIndicator color={t.accent} style={{ marginTop: 16 }} /> : roots.length === 0 ? (
            <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, color: t.muted, paddingVertical: 16 }}>{w("none")}</Text>
          ) : roots.map((c, i) => (
            <View key={c.id} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: t.line }}>
              <Item c={c} />
              {(list ?? []).filter((r) => r.parentId === c.id).map((r) => <Item key={r.id} c={r} child />)}
            </View>
          ))}
        </ScrollView>
        <View style={{ borderTopWidth: 1, borderTopColor: t.line, padding: 16, paddingBottom: Math.max(insets.bottom, 16), gap: 10 }}>
          {reply ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{w("replyTo", { name: reply.author })}</Text>
              <Pressable onPress={() => setReply(null)} accessibilityRole="button" accessibilityLabel={w("close")} hitSlop={10}><Icon name="close" size={16} color={t.muted} /></Pressable>
            </View>
          ) : null}
          <TextInput value={text} onChangeText={setText} maxLength={500} multiline placeholder={w("placeholder")} placeholderTextColor={t.muted} accessibilityLabel={w("placeholder")}
            style={{ minHeight: 84, maxHeight: 160, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, fontFamily: FONT.regular, fontSize: 16, color: t.ink, textAlignVertical: "top" }} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12, color: t.muted, fontVariant: ["tabular-nums"] }}>{fill(x.social.chars, { n: text.length })}</Text>
            <GoldButton title={w("send")} compact busy={busy} disabled={text.trim().length < 2} onPress={() => void send()} />
          </View>
          {msg ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 13.5, color: msg.kind === "err" ? t.danger : t.accent }}>{msg.text}</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
