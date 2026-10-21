import { useRef, useState, type ComponentRef, type ReactNode } from "react";
import { ActivityIndicator, Modal, PixelRatio, Platform, Pressable, Share, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { SITE } from "@/lib/api";
import { Icon, type IconName } from "@/components/icons";
import { FONT, R, stage } from "@/lib/theme";
import { useFeedText } from "./texts";

// The share sheet of the feed and the stories: a preview of the image, then Instagram Story (1080×1920),
// Instagram Post (1080×1350), WhatsApp (image + link text), More and Share link. Everything goes through the system
// share sheet (expo-sharing / Share), so no Facebook App ID or Instagram SDK is needed: the person picks the app.

export type ShareFormat = "story" | "post";
/** the card's layout size in points; the captured image is scaled to 1080 px wide */
export const CARD_SIZE: Record<ShareFormat, { w: number; h: number; px: [number, number] }> = {
  story: { w: 360, h: 640, px: [1080, 1920] },
  post: { w: 360, h: 450, px: [1080, 1350] },
};

type Target = "video" | "story" | "post" | "whatsapp" | "more" | "link";

export function ShareSheet({ visible, onClose, renderCard, link, message, onShared, video }: {
  visible: boolean; onClose: () => void;
  /** verses only: offer a video (verse card + recitation, made on the server) for Reels / Stories */
  video?: { key: string; lang: string };
  /** the image content at CARD_SIZE[format] (no scaling inside) */
  renderCard: (format: ShareFormat) => ReactNode;
  link: string; message: string; onShared?: () => void;
}) {
  const tx = useFeedText();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const [format, setFormat] = useState<ShareFormat>("story");
  const [busy, setBusy] = useState<Target | null>(null);
  const [err, setErr] = useState("");
  const shot = useRef<ComponentRef<typeof View>>(null);

  const size = CARD_SIZE[format];
  const previewH = Math.min(320, Math.round(winH * 0.36));
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

  const run = async (target: Target) => {
    if (busy) return;
    setErr(""); setBusy(target);
    try {
      if (target === "link" || Platform.OS === "web") {
        const r = await Share.share(Platform.OS === "ios" ? { url: link, message } : { message: `${message}\n${link}`, title: message });
        if (r.action === Share.sharedAction) onShared?.();
        return;
      }
      if (target === "video") {
        let mp4 = "";
        try { mp4 = await makeVideo(); } catch { setErr(tx.videoFailed); }
        if (mp4) {
          await Sharing.shareAsync(mp4, { mimeType: "video/mp4", UTI: "public.mpeg-4", dialogTitle: tx.shareTitle });
          onShared?.();
          return;
        }
        // fall back to the image story
      }
      const uri = await capture(target === "post" ? "post" : "story");
      if (target === "whatsapp" && Platform.OS === "ios") {
        // iOS shares the image and the link text together; WhatsApp takes both
        const r = await Share.share({ url: uri, message: `${message}\n${link}` });
        if (r.action === Share.sharedAction) onShared?.();
        return;
      }
      if (!(await Sharing.isAvailableAsync())) {
        await Share.share({ message: `${message}\n${link}` });
        onShared?.();
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "public.png", dialogTitle: tx.shareTitle });
      onShared?.();
    } catch {
      setErr((e) => e || tx.shareFailed);
    } finally {
      setBusy(null);
    }
  };

  const options: [Target, string, IconName][] = [
    ...(video && Platform.OS !== "web" ? [["video", tx.video, "play"] as [Target, string, IconName]] : []),
    ["story", tx.story, "grid"], ["post", tx.post, "grid"], ["whatsapp", tx.whatsapp, "comment"], ["more", tx.more, "share"], ["link", tx.link, "globe"],
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={onClose} accessibilityRole="button" accessibilityLabel={tx.close} />
      <View style={{ backgroundColor: stage.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTopWidth: 1, borderColor: stage.goldSoft, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 16), paddingHorizontal: 18 }}>
        <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.25)", marginBottom: 12 }} />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 19, color: "#fff" }}>{tx.shareTitle}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tx.close} hitSlop={10} style={{ padding: 6 }}><Icon name="close" color={stage.textSoft} size={20} /></Pressable>
        </View>

        {/* the image as it will be shared, scaled down; the snapshot is taken from the unscaled inner view */}
        <View accessible accessibilityLabel={tx.previewLabel} style={{ alignSelf: "center", width: size.w * scale, height: previewH, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: stage.goldSoft }}>
          <View style={{ width: size.w, height: size.h, transform: [{ translateX: (size.w / 2) * (scale - 1) }, { translateY: (size.h / 2) * (scale - 1) }, { scale }] }}>
            <View ref={shot} collapsable={false} style={{ width: size.w, height: size.h }}>
              {renderCard(format)}
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
          {options.map(([id, label, icon]) => (
            <Pressable key={id} onPress={() => void run(id)} onPressIn={() => { if (id === "story" || id === "post") setFormat(id); if (id === "video") setFormat("story"); }} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ busy: busy === id }}
              style={({ pressed }) => ({ flexBasis: "47%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingHorizontal: 14, borderRadius: R.lg, borderWidth: 1, borderColor: stage.goldSoft, backgroundColor: pressed ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)" })}>
              {busy === id ? <ActivityIndicator color={stage.gold} /> : <Icon name={icon} color={stage.gold} size={18} />}
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: "#fff", flexShrink: 1 }}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {busy && busy !== "link" ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted, marginTop: 10 }}>{busy === "video" ? tx.preparingVideo : tx.preparing}</Text> : null}
        {err ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgb(240,160,170)", marginTop: 10 }}>{err}</Text> : null}
      </View>
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
