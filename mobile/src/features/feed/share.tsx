import { useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode } from "react";
import { ActivityIndicator, Animated, Linking, Modal, PanResponder, PixelRatio, Platform, Pressable, ScrollView, Share, StyleSheet, Switch, Text, TextInput, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library/legacy";
import { File, Paths } from "expo-file-system";
import { SITE } from "@/lib/api";
import { getToken } from "@/lib/storage";
import { readJSON, writeJSON } from "@/lib/store";
import { Icon, type IconName } from "@/components/icons";
import { Wordmark } from "@/components/brand";
import { FONT, R, goldButton, stage } from "@/lib/theme";
import { useFeedText } from "./texts";
import { useShareText } from "@/features/share/texts";
import { useTemplateText } from "@/features/share/templateTexts";
import { CARD_SIZE, PALETTES, PALETTE_IDS, paletteFor, type PaletteId, type ShareFormat, type ShareOpts, type Sharer } from "@/features/share/formats";
import { T as TalentApi } from "@/features/talents/api";

/** the app download page (redirects to the App Store / Google Play); every shared card and message carries it */
export const APP_LINK = `${SITE}/app`;
import { statShare } from "./statsStore";
import { STICKER, STICKERS, useGamify } from "./gamify";
import { useGameText } from "./gamifyTexts";
import { StickerArt, stickerName } from "./Sticker";

// The share sheet of every feed post (verses, hadith, stories, names), laid out like Instagram's: a bottom sheet with a
// drag handle, the image as it will be shared (story by default), the format (story 9:16, portrait 4:5 and, for the
// share templates, square 1:1), the design (night, emerald, dawn, parchment, marble) and an optional "shared by
// @username", one gold "Share as story" button, a row of round app targets (only the apps installed on this phone,
// checked with Linking.canOpenURL against ios.infoPlist.LSApplicationQueriesSchemes) and the actions below (copy link,
// save image, save video, more = the system sheet). Images go through the system share sheet (expo-sharing), so no
// Facebook App ID or Instagram SDK is needed; text targets open the app's own URL scheme. The card is only rendered
// while the sheet is open.

export { CARD_SIZE, type ShareFormat, type ShareOpts };
const SHOW_NAME_KEY = "qmc.share.show-name";

/** the signed-in member's username and badge for "shared by" (cached for the app run; null without a profile) */
let sharerCache: Sharer | null | undefined;
async function loadSharer(): Promise<Sharer | null> {
  if (sharerCache !== undefined) return sharerCache;
  try {
    if (!(await getToken())) return null;
    const me = await TalentApi.me();
    sharerCache = me.profile?.username ? { username: me.profile.username, badge: me.profile.badge ?? null } : null;
  } catch { return null; }
  return sharerCache;
}

type TargetId = "igStory" | "igFeed" | "fbStory" | "tiktok" | "whatsapp" | "waStatus" | "telegram" | "signal" | "viber" | "messenger" | "messages" | "mail" | "snapchat" | "line" | "wechat" | "x" | "threads" | "facebook";
type ActionId = "copy" | "saveImage" | "saveVideo" | "story" | "more";
type Busy = TargetId | ActionId | "storyShare" | "primary";
/** app targets: the scheme that tells whether the app is installed, the circle's colours and monogram */
const TARGETS: { id: TargetId; check: string; bg: [string, string]; mono?: string; icon?: IconName }[] = [
  { id: "igStory", check: "instagram-stories://", bg: ["#F58529", "#DD2A7B"], mono: "IG" },
  { id: "igFeed", check: "instagram://", bg: ["#8134AF", "#DD2A7B"], mono: "IG" },
  { id: "fbStory", check: "facebook-stories://", bg: ["#1877F2", "#DD2A7B"], mono: "f" },
  { id: "tiktok", check: "snssdk1233://", bg: ["#111", "#25F4EE"], mono: "TT" },
  { id: "whatsapp", check: "whatsapp://", bg: ["#25D366", "#128C7E"], mono: "WA" },
  { id: "waStatus", check: "whatsapp://", bg: ["#128C7E", "#075E54"], mono: "WA" },
  { id: "telegram", check: "tg://", bg: ["#37AEE2", "#1E96C8"], mono: "TG" },
  { id: "signal", check: "sgnl://", bg: ["#3A76F0", "#2C5DC4"], mono: "S" },
  { id: "viber", check: "viber://", bg: ["#7360F2", "#59267C"], mono: "V" },
  { id: "messenger", check: "fb-messenger://", bg: ["#00B2FF", "#A033FF"], mono: "M" },
  { id: "messages", check: "sms:", bg: ["#5BE36B", "#2DBE45"], icon: "comment" },
  { id: "mail", check: "mailto:", bg: ["#3B9BFF", "#1665D8"], icon: "note" },
  { id: "snapchat", check: "snapchat://", bg: ["#FFFC00", "#F2E600"], mono: "SC" },
  { id: "line", check: "line://", bg: ["#06C755", "#05A548"], mono: "LINE" },
  { id: "wechat", check: "weixin://", bg: ["#07C160", "#06A050"], mono: "WC" },
  { id: "x", check: "twitter://", bg: ["#222", "#000"], mono: "X" },
  { id: "threads", check: "barcelona://", bg: ["#222", "#000"], mono: "@" },
  { id: "facebook", check: "fb://", bg: ["#1877F2", "#0E5BC7"], mono: "f" },
];

/** which targets are installed (cached for the app run; web has none) */
let installed: Set<TargetId> | null = null;
async function installedTargets(): Promise<Set<TargetId>> {
  if (installed) return installed;
  const out = new Set<TargetId>();
  if (Platform.OS !== "web") {
    await Promise.all(TARGETS.map(async (t) => { try { if (await Linking.canOpenURL(t.check)) out.add(t.id); } catch { /* not declared or not installed */ } }));
  }
  installed = out;
  return out;
}

export function ShareSheet({ visible, onClose, renderCard, link, message, onShared, video, noDecoration, templated, quick, seed }: {
  visible: boolean; onClose: () => void;
  /** no sticker picker (the card is a sticker itself) */
  noDecoration?: boolean;
  /** verses only: offer a video (verse card + recitation, made on the server) for Reels / Stories */
  video?: { key: string; lang: string };
  /** the image content at CARD_SIZE[format] (no scaling inside); templated cards also get the design and the sharer */
  renderCard: (format: ShareFormat, opts: ShareOpts) => ReactNode;
  link: string; message: string; onShared?: () => void;
  /** the card is a share template (features/share/ShareTemplates): square format, five designs, "shared by" */
  templated?: boolean;
  /** one tap: the story image goes to the system share sheet as soon as the sheet opens */
  quick?: boolean;
  /** picks the default design (a post keeps its design) */
  seed?: string;
}) {
  const tx = useFeedText();
  const stx = useShareText();
  const tt = useTemplateText();
  // every message carries the brand line and the app download link
  if (!message.includes(APP_LINK)) message = `${message}\n\n${tx.brand} · ${stx.getApp}: ${APP_LINK}`;
  const onSharedRaw = onShared;
  onShared = () => { statShare(); onSharedRaw?.(); };
  const insets = useSafeAreaInsets();
  const { height: winH, width: winW } = useWindowDimensions();
  const [format, setFormat] = useState<ShareFormat>("story");
  const [palette, setPalette] = useState<PaletteId>(() => paletteFor(seed ?? link));
  const [me, setMe] = useState<Sharer | null>(sharerCache ?? null);
  const [showName, setShowName] = useState(() => readJSON<boolean>(SHOW_NAME_KEY, false));
  const [busy, setBusy] = useState<Busy | null>(null);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [apps, setApps] = useState<Set<TargetId>>(installed ?? new Set());
  const shot = useRef<ComponentRef<typeof View>>(null);
  // collected stickers as decoration on the image (gamify.ts)
  const gm = useGamify();
  const gt = useGameText();
  const owned = noDecoration ? [] : STICKERS.filter((x) => gm.stickers[x.id]).sort((a, b) => gm.stickers[b.id] - gm.stickers[a.id]).slice(0, 30);
  const [deco, setDeco] = useState<string | null>(null);
  const quickDone = useRef(false);

  useEffect(() => {
    if (!visible) { quickDone.current = false; return; }
    setErr(""); setNote(""); setQuery(""); setFormat("story"); setDeco(null); drag.setValue(0);
    setPalette(paletteFor(seed ?? link));
    void installedTargets().then(setApps);
    if (templated) void loadSharer().then(setMe);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // drag the handle down to close
  const drag = useRef(new Animated.Value(0)).current;
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderMove: (_, g) => drag.setValue(Math.max(0, g.dy)),
    onPanResponderRelease: (_, g) => {
      if (g.dy > 110 || g.vy > 1.2) onClose();
      else Animated.spring(drag, { toValue: 0, useNativeDriver: true }).start();
    },
  }), [drag, onClose]);

  const size = CARD_SIZE[format];
  const previewH = Math.round(Math.max(200, Math.min(380, winH * 0.36)));
  const scale = Math.min(previewH / size.h, (winW - 48) / size.w);
  const opts: ShareOpts = { palette, sharer: templated && showName && me ? me : null };

  const capture = async (f: ShareFormat): Promise<string> => {
    if (f !== format) {
      setFormat(f);
      await new Promise((r) => setTimeout(r, 140)); // let the other format render before the snapshot
    }
    const [pw, ph] = CARD_SIZE[f].px;
    // iOS renders the given size in points at the screen scale, Android in pixels
    const k = Platform.OS === "ios" ? PixelRatio.get() : 1;
    const uri = await captureRef(shot as unknown as Parameters<typeof captureRef>[0], { format: "png", quality: 1, result: "tmpfile", width: pw / k, height: ph / k });
    return uri.startsWith("/") ? `file://${uri}` : uri;
  };

  // the video: the app draws the card (correct Arabic shaping), the server adds the recitation with ffmpeg
  const makeVideo = async (): Promise<string> => {
    if (!video) throw new Error("no video");
    if (format !== "story") { setFormat("story"); await new Promise((r) => setTimeout(r, 140)); }
    const k = Platform.OS === "ios" ? PixelRatio.get() : 1;
    const png = await captureRef(shot as unknown as Parameters<typeof captureRef>[0], { format: "png", quality: 1, result: "base64", width: 1080 / k, height: 1920 / k });
    const res = await fetch(`${SITE}/api/share/verse-video`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "x-qmc-app": Platform.OS }, body: JSON.stringify({ key: video.key, lang: video.lang, png }) });
    if (!res.ok) throw new Error(`video ${res.status}`);
    const { url } = (await res.json()) as { url?: string };
    if (!url) throw new Error("no url");
    const file = await File.downloadFileAsync(`${SITE}${url}`, new File(Paths.cache, `quran-${video.key.replace(":", "-")}-${video.lang}.mp4`), { idempotent: true });
    return file.uri;
  };

  const shareImage = async (f: ShareFormat) => {
    const uri = await capture(f);
    if (!(await Sharing.isAvailableAsync())) { await Share.share({ message: `${message}\n${link}` }); onShared?.(); return; }
    await Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "public.png", dialogTitle: tx.shareTitle });
    onShared?.();
  };
  const shareText = async () => {
    const r = await Share.share(Platform.OS === "ios" ? { url: link, message } : { message: `${message}\n${link}`, title: message });
    if (r.action === Share.sharedAction) onShared?.();
  };
  const openUrl = async (url: string) => { await Linking.openURL(url); onShared?.(); };
  const enc = encodeURIComponent;
  const full = `${message}\n${link}`;

  const runTarget = async (id: TargetId) => {
    switch (id) {
      // image targets: the system sheet with the image (Facebook Stories would need a Facebook App ID, none is configured)
      case "igStory": case "fbStory": case "tiktok": case "waStatus": case "snapchat": return shareImage("story");
      case "igFeed": case "facebook": case "signal": case "messenger": case "wechat": return shareImage(format === "story" ? "post" : format);
      case "viber": return openUrl(`viber://forward?text=${enc(full)}`);
      case "line": return openUrl(`line://msg/text/${enc(full)}`);
      case "threads": return openUrl(`barcelona://create?text=${enc(full)}`);
      case "whatsapp": {
        // iOS shares the image and the link text together; WhatsApp takes both
        if (Platform.OS === "ios") { const uri = await capture(format); const r = await Share.share({ url: uri, message: full }); if (r.action === Share.sharedAction) onShared?.(); return; }
        return shareImage(format);
      }
      case "telegram": return openUrl(`tg://msg_url?url=${enc(link)}&text=${enc(message)}`);
      case "messages": return openUrl(Platform.OS === "ios" ? `sms:&body=${enc(full)}` : `sms:?body=${enc(full)}`);
      case "mail": return openUrl(`mailto:?subject=${enc(message.split("\n")[0].slice(0, 120))}&body=${enc(full)}`);
      case "x": return openUrl(`twitter://post?message=${enc(`${message.length > 200 ? `${message.slice(0, 200)} …` : message} ${link}`)}`);
    }
  };

  const saveToPhotos = async (uri: string) => {
    const p = await MediaLibrary.requestPermissionsAsync(true);
    if (!p.granted) { setErr(tx.photosDenied); return; }
    await MediaLibrary.saveToLibraryAsync(uri);
    setNote(tx.savedToPhotos);
  };

  const runAction = async (id: ActionId | "storyShare" | "primary") => {
    switch (id) {
      case "copy": await Clipboard.setStringAsync(link); setNote(tx.copied); return;
      case "saveImage": return saveToPhotos(await capture(format));
      case "saveVideo": {
        let mp4 = "";
        try { mp4 = await makeVideo(); } catch { setErr(tx.videoFailed); return; }
        return saveToPhotos(mp4);
      }
      case "story": case "storyShare": {
        // the verse as a video story (card + recitation); otherwise the image
        if (video && Platform.OS !== "web") {
          let mp4 = "";
          try { mp4 = await makeVideo(); } catch { /* fall back to the image story */ }
          if (mp4) { await Sharing.shareAsync(mp4, { mimeType: "video/mp4", UTI: "public.mpeg-4", dialogTitle: tx.shareTitle }); onShared?.(); return; }
        }
        return shareImage("story");
      }
      case "primary": return shareImage(format);
      case "more": return Platform.OS === "web" ? shareText() : shareImage(format);
    }
  };

  const run = async (id: Busy) => {
    if (busy) return;
    setErr(""); setNote(""); setBusy(id);
    try {
      if (Platform.OS === "web" && id !== "copy") { await shareText(); return; }
      if ((TARGETS as { id: string }[]).some((t) => t.id === id)) await runTarget(id as TargetId);
      else await runAction(id as ActionId | "storyShare" | "primary");
    } catch {
      setErr((e) => e || tx.shareFailed);
    } finally {
      setBusy(null);
    }
  };

  // one tap on a post: the story image straight to the system sheet (the sheet stays for other formats and designs)
  useEffect(() => {
    if (!visible || !quick || quickDone.current) return;
    quickDone.current = true;
    const id = setTimeout(() => { void run("primary"); }, 450); // the card and its wordmark image are drawn first
    return () => clearTimeout(id);
  }, [visible, quick]); // eslint-disable-line react-hooks/exhaustive-deps

  const label: Record<TargetId, string> = {
    igStory: "Instagram Story", igFeed: "Instagram Feed", fbStory: "Facebook Stories", tiktok: "TikTok", signal: "Signal", viber: "Viber", messenger: "Messenger", line: "LINE", wechat: "WeChat", threads: "Threads", whatsapp: "WhatsApp", waStatus: "WhatsApp Status", telegram: "Telegram",
    messages: Platform.OS === "ios" ? "iMessage" : tx.messages, mail: tx.mail, snapchat: "Snapchat", x: "X", facebook: "Facebook",
  };
  const q = query.trim().toLowerCase();
  const targets = TARGETS.filter((t) => apps.has(t.id) && (!q || label[t.id].toLowerCase().includes(q)));
  const actions: [ActionId, string, IconName][] = [
    ["copy", tx.copyLink, "copy"],
    ...(Platform.OS !== "web" ? [["saveImage", tx.saveImage, "download"] as [ActionId, string, IconName]] : []),
    ...(video && Platform.OS !== "web" ? [["saveVideo", tx.saveVideo, "play"] as [ActionId, string, IconName], ["story", tx.addToStory, "reels"] as [ActionId, string, IconName]] : []),
    ["more", tx.more, "share"],
  ];
  const shownActions = actions.filter(([, l]) => !q || l.toLowerCase().includes(q));
  const formats: [ShareFormat, string][] = [["story", tt.story], ["post", tt.portrait], ...(templated ? [["square", tt.square] as [ShareFormat, string]] : [])];
  const paletteName: Record<PaletteId, string> = { night: tt.night, emerald: tt.emerald, dawn: tt.dawn, parchment: tt.parchment, marble: tt.marble };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={onClose} accessibilityRole="button" accessibilityLabel={tx.close} />
      <Animated.View style={{ maxHeight: winH * 0.94, transform: [{ translateY: drag }], backgroundColor: stage.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTopWidth: 1, borderColor: stage.goldSoft, paddingBottom: Math.max(insets.bottom, 16) }}>
        <View {...pan.panHandlers} style={{ paddingTop: 10, paddingBottom: 8, alignItems: "center" }} accessible accessibilityRole="adjustable" accessibilityLabel={tx.close} accessibilityActions={[{ name: "decrement" }]} onAccessibilityAction={onClose}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)" }} />
        </View>
        <ScrollView bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* the image as it will be shared, scaled down; the snapshot is taken from the unscaled inner view */}
          <View accessible accessibilityRole="image" accessibilityLabel={format === "story" ? tx.storyPreview : tx.previewLabel}
            style={{ alignSelf: "center", width: size.w * scale, height: size.h * scale, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: stage.goldSoft, shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } }}>
            <View style={{ width: size.w, height: size.h, transform: [{ translateX: (size.w / 2) * (scale - 1) }, { translateY: (size.h / 2) * (scale - 1) }, { scale }] }}>
              <View ref={shot} collapsable={false} style={{ width: size.w, height: size.h }}>
                {visible ? renderCard(format, opts) : null}
                {deco && STICKER.get(deco) ? (
                  <View pointerEvents="none" style={{ position: "absolute", top: format === "story" ? 104 : 24, end: 24, transform: [{ rotate: "8deg" }] }}>
                    <StickerArt def={STICKER.get(deco)!} size={Math.round(size.w * 0.22)} />
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* format */}
          <View accessibilityRole="tablist" style={{ flexDirection: "row", alignSelf: "center", gap: 6, marginTop: 14, padding: 3, borderRadius: R.pill, backgroundColor: "rgba(255,255,255,0.07)" }}>
            {formats.map(([f, l]) => {
              const on = f === format;
              const [fw, fh] = f === "story" ? [9, 16] : f === "post" ? [12, 15] : [14, 14];
              return (
                <Pressable key={f} onPress={() => setFormat(f)} accessibilityRole="tab" accessibilityLabel={l} accessibilityState={{ selected: on }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 7, height: 34, paddingHorizontal: 14, borderRadius: R.pill, backgroundColor: on ? "rgba(214,180,108,0.18)" : "transparent", borderWidth: on ? 1 : 0, borderColor: stage.gold }}>
                  <View style={{ width: fw, height: fh, borderRadius: 2, borderWidth: 1.4, borderColor: on ? stage.gold : stage.textMuted }} />
                  <Text style={{ fontFamily: on ? FONT.semibold : FONT.medium, fontSize: 13, color: on ? stage.cream : stage.textSoft }}>{l}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* design */}
          {templated ? (
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 14, marginTop: 14 }} accessibilityLabel={tt.design}>
              {PALETTE_IDS.map((id) => {
                const on = id === palette;
                return (
                  <Pressable key={id} onPress={() => setPalette(id)} accessibilityRole="button" accessibilityLabel={`${tt.design}: ${paletteName[id]}`} accessibilityState={{ selected: on }} hitSlop={4}
                    style={{ alignItems: "center", gap: 4 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 17, padding: 2, borderWidth: 1.5, borderColor: on ? stage.gold : "transparent" }}>
                      <LinearGradient colors={PALETTES[id].swatch} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: PALETTES[id].line }} />
                    </View>
                    <Text style={{ fontFamily: on ? FONT.semibold : FONT.regular, fontSize: 10.5, color: on ? stage.cream : stage.textMuted }}>{paletteName[id]}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {/* "shared by @username" (only with a Talents profile, off until switched on) */}
          {templated && me ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20, marginTop: 12 }}>
              <Text style={{ flex: 1, fontFamily: FONT.medium, fontSize: 13.5, color: stage.textSoft }}>{tt.showName} <Text style={{ fontFamily: FONT.semibold, color: stage.cream }}>@{me.username}</Text></Text>
              <Switch value={showName} onValueChange={(v) => { setShowName(v); writeJSON(SHOW_NAME_KEY, v, true); }} accessibilityLabel={tt.showName}
                trackColor={{ true: stage.gold, false: "rgba(255,255,255,0.2)" }} thumbColor="#fff" />
            </View>
          ) : null}

          {owned.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 12, alignItems: "center" }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: stage.textMuted }}>{gt.decorate}</Text>
              <Pressable onPress={() => setDeco(null)} accessibilityRole="button" accessibilityLabel={gt.none} accessibilityState={{ selected: !deco }}
                style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: !deco ? stage.gold : "rgba(255,255,255,0.2)" }}>
                <Icon name="close" color={stage.textMuted} size={16} />
              </Pressable>
              {owned.map((x) => (
                <Pressable key={x.id} onPress={() => setDeco(x.id)} accessibilityRole="button" accessibilityLabel={stickerName(x.id, gt, tx, (n) => String(n))} accessibilityState={{ selected: deco === x.id }}
                  style={{ padding: 2, borderRadius: 22, borderWidth: 1.5, borderColor: deco === x.id ? stage.gold : "transparent" }}>
                  <StickerArt def={x} size={36} />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          {/* the one gold action */}
          <Pressable onPress={() => void run("primary")} accessibilityRole="button" accessibilityLabel={format === "story" ? tt.shareStory : tt.shareNow} accessibilityState={{ busy: busy === "primary" }}
            style={({ pressed }) => ({ marginHorizontal: 16, marginTop: 16, opacity: pressed ? 0.85 : 1 })}>
            <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 50, borderRadius: R.pill, flexDirection: "row", gap: 9, alignItems: "center", justifyContent: "center" }}>
              {busy === "primary" ? <ActivityIndicator color={goldButton.text} /> : <Icon name="send" color={goldButton.text} size={18} />}
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: goldButton.text }}>{format === "story" ? tt.shareStory : tt.shareNow}</Text>
            </LinearGradient>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginTop: 14, height: 40, borderRadius: 12, paddingHorizontal: 12, backgroundColor: "rgba(255,255,255,0.08)" }}>
            <Icon name="search" color={stage.textMuted} size={16} />
            <TextInput value={query} onChangeText={setQuery} placeholder={tx.search} placeholderTextColor={stage.textMuted} accessibilityLabel={tx.search} returnKeyType="search" autoCorrect={false}
              style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, color: "#fff", paddingVertical: 0 }} />
          </View>

          {targets.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14, paddingHorizontal: 16, paddingTop: 16 }}>
              {targets.map((t) => (
                <Pressable key={t.id} onPress={() => void run(t.id)} accessibilityRole="button" accessibilityLabel={label[t.id]} accessibilityState={{ busy: busy === t.id }}
                  style={({ pressed }) => ({ width: 68, alignItems: "center", gap: 6, opacity: pressed ? 0.7 : 1 })}>
                  {/* every app as the same emerald seal with a gold monogram (the app's own palette, no brand colours) */}
                  <View style={{ width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: stage.gold }}>
                    <View pointerEvents="none" style={{ position: "absolute", left: 3, right: 3, top: 3, bottom: 3, borderRadius: 26, borderWidth: StyleSheet.hairlineWidth, borderColor: stage.goldSoft }} />
                    {busy === t.id ? <ActivityIndicator color={stage.gold} />
                      : t.icon ? <Icon name={t.icon} color={stage.gold} size={22} />
                        : <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: t.mono === "f" ? 24 : (t.mono?.length ?? 0) > 2 ? 11 : 16, letterSpacing: 0.5, color: stage.cream }}>{t.mono}</Text>}
                  </View>
                  <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 14, color: "#fff", textAlign: "center" }}>{label[t.id]}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginTop: 16 }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14, paddingHorizontal: 16, paddingTop: 14 }}>
            {shownActions.map(([id, l, icon]) => (
              <Pressable key={id} onPress={() => void run(id)} accessibilityRole="button" accessibilityLabel={l} accessibilityState={{ busy: busy === id }}
                style={({ pressed }) => ({ width: 68, alignItems: "center", gap: 6, opacity: pressed ? 0.7 : 1 })}>
                <View style={{ width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: stage.goldSoft }}>
                  {busy === id ? <ActivityIndicator color={stage.gold} /> : <Icon name={icon} color={stage.gold} size={21} />}
                </View>
                <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 14, color: "#fff", textAlign: "center" }}>{l}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={{ paddingHorizontal: 16 }}>
            {busy && busy !== "copy" ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted, marginTop: 10 }}>{busy === "saveVideo" || ((busy === "storyShare" || busy === "story") && video) ? tx.preparingVideo : tx.preparing}</Text> : null}
            {note ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold, marginTop: 10 }}>{note}</Text> : null}
            {err ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgb(232,176,164)", marginTop: 10 }}>{err}</Text> : null}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

/** the brand line at the foot of every shared image */
export function BrandFoot({ color = stage.gold }: { color?: string }) {
  const tx = useFeedText();
  return (
    <View style={{ alignItems: "center", gap: 5 }}>
      {/* the gold wordmark is the whole brand (color stays for older callers) */}
      <View accessible accessibilityLabel={tx.brand}><Wordmark tone="gold" height={20} /></View>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 10, letterSpacing: 0.6, color: "rgba(243,226,182,0.7)" }}>quranmasterclass.com/app</Text>
    </View>
  );
}

/** the small eight-pointed star of the app icon (no longer shown in BrandFoot; kept for reference) */
export function BrandSeal({ color }: { color: string }) {
  const pts = Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8 - Math.PI / 2; const r = i % 2 ? 5.4 : 7; return `${(8 + r * Math.cos(a)).toFixed(2)},${(8 + r * Math.sin(a)).toFixed(2)}`; }).join("L");
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Path d={`M${pts}Z`} fill={color} />
      <Circle cx={8} cy={8} r={2.4} fill="rgb(8,38,29)" />
    </Svg>
  );
}
