import { useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode } from "react";
import { ActivityIndicator, Animated, Linking, Modal, PanResponder, PixelRatio, Platform, Pressable, ScrollView, Share, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library/legacy";
import { File, Paths } from "expo-file-system";
import { SITE } from "@/lib/api";
import { Icon, type IconName } from "@/components/icons";
import { FONT, R, stage } from "@/lib/theme";
import { useFeedText } from "./texts";
import { statShare } from "./statsStore";

// The share sheet of every feed post (verses, hadith, stories, names), laid out like Instagram's: a bottom sheet with a
// drag handle, a search field, a row of round app targets (only the apps installed on this phone, checked with
// Linking.canOpenURL against ios.infoPlist.LSApplicationQueriesSchemes) and the actions below (copy link, save image,
// save video, add to story with a 9:16 preview, more = the system sheet). Images go through the system share sheet
// (expo-sharing), so no Facebook App ID or Instagram SDK is needed; text targets open the app's own URL scheme.

export type ShareFormat = "story" | "post";
/** the card's layout size in points; the captured image is scaled to 1080 px wide */
export const CARD_SIZE: Record<ShareFormat, { w: number; h: number; px: [number, number] }> = {
  story: { w: 360, h: 640, px: [1080, 1920] },
  post: { w: 360, h: 450, px: [1080, 1350] },
};

type TargetId = "igStory" | "igFeed" | "fbStory" | "tiktok" | "whatsapp" | "waStatus" | "telegram" | "signal" | "viber" | "messenger" | "messages" | "mail" | "snapchat" | "line" | "wechat" | "x" | "threads" | "facebook";
type ActionId = "copy" | "saveImage" | "saveVideo" | "story" | "more";
type Busy = TargetId | ActionId | "storyShare";
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

export function ShareSheet({ visible, onClose, renderCard, link, message, onShared, video }: {
  visible: boolean; onClose: () => void;
  /** verses only: offer a video (verse card + recitation, made on the server) for Reels / Stories */
  video?: { key: string; lang: string };
  /** the image content at CARD_SIZE[format] (no scaling inside) */
  renderCard: (format: ShareFormat) => ReactNode;
  link: string; message: string; onShared?: () => void;
}) {
  const tx = useFeedText();
  const onSharedRaw = onShared;
  onShared = () => { statShare(); onSharedRaw?.(); };
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const [format, setFormat] = useState<ShareFormat>("post");
  const [storyMode, setStoryMode] = useState(false);
  const [busy, setBusy] = useState<Busy | null>(null);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [apps, setApps] = useState<Set<TargetId>>(installed ?? new Set());
  const shot = useRef<ComponentRef<typeof View>>(null);

  useEffect(() => {
    if (!visible) return;
    setErr(""); setNote(""); setQuery(""); setStoryMode(false); setFormat("post"); drag.setValue(0);
    void installedTargets().then(setApps);
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
  const previewH = storyMode ? Math.min(420, Math.round(winH * 0.5)) : 96;
  const scale = previewH / size.h;

  const capture = async (f: ShareFormat): Promise<string> => {
    if (f !== format) {
      setFormat(f);
      await new Promise((r) => setTimeout(r, 120)); // let the other format render before the snapshot
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
    if (format !== "story") { setFormat("story"); await new Promise((r) => setTimeout(r, 120)); }
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
      case "igFeed": case "facebook": case "signal": case "messenger": case "wechat": return shareImage("post");
      case "viber": return openUrl(`viber://forward?text=${enc(full)}`);
      case "line": return openUrl(`line://msg/text/${enc(full)}`);
      case "threads": return openUrl(`barcelona://create?text=${enc(full)}`);
      case "whatsapp": {
        // iOS shares the image and the link text together; WhatsApp takes both
        if (Platform.OS === "ios") { const uri = await capture("story"); const r = await Share.share({ url: uri, message: full }); if (r.action === Share.sharedAction) onShared?.(); return; }
        return shareImage("story");
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

  const runAction = async (id: ActionId | "storyShare") => {
    switch (id) {
      case "copy": await Clipboard.setStringAsync(link); setNote(tx.copied); return;
      case "saveImage": return saveToPhotos(await capture(format));
      case "saveVideo": {
        let mp4 = "";
        try { mp4 = await makeVideo(); } catch { setErr(tx.videoFailed); return; }
        return saveToPhotos(mp4);
      }
      case "story": setFormat("story"); setStoryMode(true); return;
      case "storyShare": {
        if (video && Platform.OS !== "web") {
          let mp4 = "";
          try { mp4 = await makeVideo(); } catch { /* fall back to the image story */ }
          if (mp4) { await Sharing.shareAsync(mp4, { mimeType: "video/mp4", UTI: "public.mpeg-4", dialogTitle: tx.shareTitle }); onShared?.(); return; }
        }
        return shareImage("story");
      }
      case "more": return Platform.OS === "web" ? shareText() : shareImage(format);
    }
  };

  const run = async (id: Busy) => {
    if (busy) return;
    setErr(""); setNote(""); setBusy(id);
    try {
      if (Platform.OS === "web" && id !== "copy") { await shareText(); return; }
      if ((TARGETS as { id: string }[]).some((t) => t.id === id)) await runTarget(id as TargetId);
      else await runAction(id as ActionId | "storyShare");
    } catch {
      setErr((e) => e || tx.shareFailed);
    } finally {
      setBusy(null);
    }
  };

  const label: Record<TargetId, string> = {
    igStory: "Instagram Story", igFeed: "Instagram Feed", fbStory: "Facebook Stories", tiktok: "TikTok", signal: "Signal", viber: "Viber", messenger: "Messenger", line: "LINE", wechat: "WeChat", threads: "Threads", whatsapp: "WhatsApp", waStatus: "WhatsApp Status", telegram: "Telegram",
    messages: Platform.OS === "ios" ? "iMessage" : tx.messages, mail: tx.mail, snapchat: "Snapchat", x: "X", facebook: "Facebook",
  };
  const q = query.trim().toLowerCase();
  const targets = TARGETS.filter((t) => apps.has(t.id) && (!q || label[t.id].toLowerCase().includes(q)));
  const actions: [ActionId, string, IconName][] = [
    ["copy", tx.copyLink, "copy"],
    ...(Platform.OS !== "web" ? [["saveImage", tx.saveImage, "download"] as [ActionId, string, IconName]] : []),
    ...(video && Platform.OS !== "web" ? [["saveVideo", tx.saveVideo, "play"] as [ActionId, string, IconName]] : []),
    ["story", tx.addToStory, "plus"],
    ["more", tx.more, "share"],
  ];
  const shownActions = actions.filter(([, l]) => !q || l.toLowerCase().includes(q));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={onClose} accessibilityRole="button" accessibilityLabel={tx.close} />
      <Animated.View style={{ transform: [{ translateY: drag }], backgroundColor: stage.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTopWidth: 1, borderColor: stage.goldSoft, paddingBottom: Math.max(insets.bottom, 16) }}>
        <View {...pan.panHandlers} style={{ paddingTop: 10, paddingBottom: 8, alignItems: "center" }} accessible accessibilityRole="adjustable" accessibilityLabel={tx.close} accessibilityActions={[{ name: "decrement" }]} onAccessibilityAction={onClose}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)" }} />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16 }}>
          {/* the image as it will be shared, scaled down; the snapshot is taken from the unscaled inner view */}
          <View accessible accessibilityLabel={storyMode ? tx.storyPreview : tx.previewLabel} style={{ width: size.w * scale, height: previewH, borderRadius: storyMode ? 14 : 8, overflow: "hidden", borderWidth: 1, borderColor: stage.goldSoft, alignSelf: storyMode ? "center" : "auto", marginHorizontal: storyMode ? "auto" : 0 }}>
            <View style={{ width: size.w, height: size.h, transform: [{ translateX: (size.w / 2) * (scale - 1) }, { translateY: (size.h / 2) * (scale - 1) }, { scale }] }}>
              <View ref={shot} collapsable={false} style={{ width: size.w, height: size.h }}>
                {renderCard(format)}
              </View>
            </View>
          </View>
          {!storyMode ? (
            <View style={{ flex: 1, gap: 4 }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 18, color: "#fff" }}>{tx.shareTitle}</Text>
              <Text numberOfLines={3} style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: stage.textSoft }}>{message}</Text>
            </View>
          ) : null}
        </View>

        {storyMode ? (
          <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 14 }}>
            <Pressable onPress={() => { setStoryMode(false); setFormat("post"); }} accessibilityRole="button" accessibilityLabel={tx.close}
              style={({ pressed }) => ({ height: 48, paddingHorizontal: 18, borderRadius: R.pill, justifyContent: "center", borderWidth: 1, borderColor: stage.goldSoft, opacity: pressed ? 0.7 : 1 })}>
              <Icon name="chevronLeft" color="#fff" size={18} />
            </Pressable>
            <Pressable onPress={() => void run("storyShare")} accessibilityRole="button" accessibilityLabel={tx.addToStory} accessibilityState={{ busy: busy === "storyShare" }}
              style={({ pressed }) => ({ flex: 1, height: 48, borderRadius: R.pill, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: stage.gold, opacity: pressed ? 0.85 : 1 })}>
              {busy === "storyShare" ? <ActivityIndicator color={stage.bg} /> : <Icon name="plus" color={stage.bg} size={18} />}
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: stage.bg }}>{tx.addToStory}</Text>
            </Pressable>
          </View>
        ) : (
          <>
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
                    <View style={{ width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", backgroundColor: t.bg[0], borderWidth: 2, borderColor: t.bg[1] }}>
                      {busy === t.id ? <ActivityIndicator color="#fff" />
                        : t.icon ? <Icon name={t.icon} color="#fff" size={24} />
                          : <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: t.mono === "f" ? 26 : (t.mono?.length ?? 0) > 2 ? 12 : 17, color: t.id === "snapchat" ? "#111" : "#fff" }}>{t.mono}</Text>}
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
          </>
        )}

        <View style={{ paddingHorizontal: 16 }}>
          {busy && busy !== "copy" ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted, marginTop: 10 }}>{busy === "saveVideo" || (busy === "storyShare" && video) ? tx.preparingVideo : tx.preparing}</Text> : null}
          {note ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold, marginTop: 10 }}>{note}</Text> : null}
          {err ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgb(240,160,170)", marginTop: 10 }}>{err}</Text> : null}
        </View>
      </Animated.View>
    </Modal>
  );
}

/** the brand line at the foot of every shared image */
export function BrandFoot({ color = stage.gold }: { color?: string }) {
  const tx = useFeedText();
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color }}>{tx.brand}</Text>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 10.5, color: "rgba(255,255,255,0.7)" }}>quranmasterclass.com</Text>
    </View>
  );
}
