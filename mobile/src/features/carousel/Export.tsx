import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from "react";
import { ActivityIndicator, Linking, Modal, PixelRatio, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library/legacy";
import { Icon, type IconName } from "@/components/icons";
import { useLang } from "@/i18n";
import { FONT, R, goldButton, stage } from "@/lib/theme";
import { ShareSheet, APP_LINK } from "@/features/feed/share";
import { useTemplateText } from "@/features/share/templateTexts";
import { CARD_SIZE, PALETTES, PALETTE_IDS, type ShareFormat } from "@/features/share/formats";
import { statShare } from "@/features/feed/statsStore";
import { shareMany, shareManyAvailable } from "../../../modules/qmc-share-many";
import { CarouselSlideView, WisdomCard, slideCount } from "./Slide";
import { fill, useCarouselText } from "./text";
import type { CarouselPayload, PaletteId, Scripture, WisdomPayload } from "./types";

// Sharing a carousel: every slide is drawn at its fixed size and captured at exactly Instagram's pixels (1080 × 1350
// for 4:5, 1080 × 1080 for 1:1; independent of the screen's pixel ratio), then all images go to ONE system share
// sheet (local module modules/qmc-share-many: Instagram makes a carousel post of them). Builds without that module
// save all slides to Photos instead (Instagram picks them up as a carousel) or share them one by one. One slide as a
// story (1080 × 1920, safe zones kept) goes through the app's usual share sheet with its formats and designs.

/** the child (drawn at w × h points) scaled to `width` */
export function Scaled({ w, h, width, children }: { w: number; h: number; width: number; children: ReactNode }) {
  const k = width / w;
  return (
    <View style={{ width, height: h * k, overflow: "hidden" }}>
      <View style={{ width: w, height: h, transform: [{ translateX: (w / 2) * (k - 1) }, { translateY: (h / 2) * (k - 1) }, { scale: k }] }}>{children}</View>
    </View>
  );
}

/** captures a view at exactly px[0] × px[1] pixels (iOS takes points × screen scale, Android pixels) */
export async function capturePx(ref: unknown, px: [number, number]): Promise<string> {
  const k = Platform.OS === "ios" ? PixelRatio.get() : 1;
  const uri = await captureRef(ref as Parameters<typeof captureRef>[0], { format: "png", quality: 1, result: "tmpfile", width: px[0] / k, height: px[1] / k });
  return uri.startsWith("/") ? `file://${uri}` : uri;
}
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 90)));

type Busy = "all" | "photos" | "single" | null;
export function CarouselShareSheet({ c, texts, visible, onClose, onShared }: { c: CarouselPayload; texts: Record<number, Scripture[]>; visible: boolean; onClose: () => void; onShared?: () => void }) {
  const tx = useCarouselText();
  const tt = useTemplateText();
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const [format, setFormat] = useState<Exclude<ShareFormat, "story">>("post");
  const [palette, setPalette] = useState<PaletteId>(c.palette);
  const [busy, setBusy] = useState<Busy>(null);
  const [at, setAt] = useState(0);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const shot = useRef<ComponentRef<typeof View>>(null);
  const total = slideCount(c);
  useEffect(() => { if (visible) { setErr(""); setNote(""); setSaved(false); setAt(0); setPalette(c.palette); } }, [visible, c.palette]);

  const size = CARD_SIZE[format];
  const previewW = Math.min(winW - 48, (winH * 0.34 * size.w) / size.h);

  /** draws slide after slide in the capture view and returns the files */
  const captureAll = async (): Promise<string[]> => {
    const out: string[] = [];
    for (let i = 0; i < total; i++) {
      setAt(i);
      await frame();
      await frame();
      out.push(await capturePx(shot, size.px));
    }
    setAt(0);
    return out;
  };
  const toPhotos = async (files: string[]) => {
    const p = await MediaLibrary.requestPermissionsAsync(true);
    if (!p.granted) { setErr(tx.photosDenied); return false; }
    for (const f of files) await MediaLibrary.saveToLibraryAsync(f);
    return true;
  };
  const run = async (what: Exclude<Busy, null>) => {
    if (busy) return;
    setErr(""); setNote(""); setBusy(what);
    try {
      const files = await captureAll();
      if (what === "all" && shareManyAvailable()) {
        await shareMany(files, c.cover.title);
        statShare(); onShared?.();
      } else if (what === "all" || what === "photos") {
        if (await toPhotos(files)) { setSaved(true); setNote(fill(tx.savedAll, { n: files.length })); statShare(); onShared?.(); }
      } else {
        // one by one through the system sheet (older builds, or the reader's choice)
        for (const f of files) await Sharing.shareAsync(f, { mimeType: "image/png", UTI: "public.png", dialogTitle: c.cover.title });
        statShare(); onShared?.();
      }
    } catch {
      setErr(tx.failed);
    } finally {
      setBusy(null);
      setAt(0);
    }
  };

  const action = (id: Exclude<Busy, null>, label: string, icon: IconName) => (
    <Pressable key={id} onPress={() => void run(id)} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ busy: busy === id }}
      style={({ pressed }) => ({ width: 84, alignItems: "center", gap: 6, opacity: pressed ? 0.7 : 1 })}>
      <View style={{ width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: stage.goldSoft }}>
        {busy === id ? <ActivityIndicator color={stage.gold} /> : <Icon name={icon} color={stage.gold} size={21} />}
      </View>
      <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 14, color: "#fff", textAlign: "center" }}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={busy ? undefined : onClose} accessibilityRole="button" accessibilityLabel={tx.close} />
      <View style={{ maxHeight: winH * 0.94, backgroundColor: stage.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTopWidth: 1, borderColor: stage.goldSoft, paddingBottom: Math.max(insets.bottom, 16) }}>
        <View style={{ paddingTop: 10, paddingBottom: 6, alignItems: "center" }}><View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)" }} /></View>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {/* the slide being drawn (scaled); the capture is taken from the unscaled inner view */}
          <View accessible accessibilityRole="image" accessibilityLabel={fill(tx.slideOf, { n: at + 1, total })} style={{ alignSelf: "center", borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: stage.goldSoft }}>
            <Scaled w={size.w} h={size.h} width={previewW}>
              <View ref={shot} collapsable={false} style={{ width: size.w, height: size.h }}>
                <CarouselSlideView c={c} index={at} format={format} palette={palette} texts={texts} />
              </View>
            </Scaled>
          </View>
          <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.medium, fontSize: 12.5, color: stage.textMuted, textAlign: "center", marginTop: 8 }}>
            {busy ? fill(tx.preparing, { n: at + 1, total }) : `${tx.carousel} · ${total} · ${format === "post" ? "1080 × 1350" : "1080 × 1080"}`}
          </Text>

          {/* format and design */}
          <View accessibilityRole="tablist" style={{ flexDirection: "row", alignSelf: "center", gap: 6, marginTop: 12, padding: 3, borderRadius: R.pill, backgroundColor: "rgba(255,255,255,0.07)" }}>
            {([["post", tx.portrait, [12, 15]], ["square", tx.square, [14, 14]]] as const).map(([f, l, [fw, fh]]) => {
              const on = f === format;
              return (
                <Pressable key={f} disabled={!!busy} onPress={() => setFormat(f)} accessibilityRole="tab" accessibilityLabel={l} accessibilityState={{ selected: on }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 7, height: 34, paddingHorizontal: 14, borderRadius: R.pill, backgroundColor: on ? "rgba(214,180,108,0.18)" : "transparent", borderWidth: on ? 1 : 0, borderColor: stage.gold }}>
                  <View style={{ width: fw, height: fh, borderRadius: 2, borderWidth: 1.4, borderColor: on ? stage.gold : stage.textMuted }} />
                  <Text style={{ fontFamily: on ? FONT.semibold : FONT.medium, fontSize: 13, color: on ? stage.cream : stage.textSoft }}>{l}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 14, marginTop: 12 }} accessibilityLabel={tt.design}>
            {PALETTE_IDS.map((id) => {
              const on = id === palette;
              return (
                <Pressable key={id} disabled={!!busy} onPress={() => setPalette(id)} accessibilityRole="button" accessibilityLabel={`${tt.design}: ${tt[id]}`} accessibilityState={{ selected: on }} hitSlop={4} style={{ alignItems: "center", gap: 4 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, padding: 2, borderWidth: 1.5, borderColor: on ? stage.gold : "transparent" }}>
                    <LinearGradient colors={PALETTES[id].swatch} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: PALETTES[id].line }} />
                  </View>
                  <Text style={{ fontFamily: on ? FONT.semibold : FONT.regular, fontSize: 10.5, color: on ? stage.cream : stage.textMuted }}>{tt[id]}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* the one gold action: all slides together */}
          <Pressable onPress={() => void run("all")} disabled={!!busy || Platform.OS === "web"} accessibilityRole="button" accessibilityLabel={tx.shareAll} accessibilityHint={tx.shareAllHint} accessibilityState={{ busy: busy === "all" }}
            style={({ pressed }) => ({ marginHorizontal: 16, marginTop: 16, opacity: pressed ? 0.85 : 1 })}>
            <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 50, borderRadius: R.pill, flexDirection: "row", gap: 9, alignItems: "center", justifyContent: "center" }}>
              {busy === "all" ? <ActivityIndicator color={goldButton.text} /> : <Icon name="send" color={goldButton.text} size={18} />}
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: goldButton.text }}>{tx.shareAll}</Text>
            </LinearGradient>
          </Pressable>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted, textAlign: "center", marginTop: 6, paddingHorizontal: 24 }}>{tx.shareAllHint}</Text>

          {Platform.OS !== "web" ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingTop: 16 }}>
              {action("photos", tx.saveAll, "download")}
              {action("single", tx.oneByOne, "share")}
            </ScrollView>
          ) : null}
          <View style={{ paddingHorizontal: 16 }}>
            {note ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13, lineHeight: 19, color: stage.gold, marginTop: 12 }}>{note}</Text> : null}
            {saved ? (
              <Pressable onPress={() => void Linking.openURL("instagram://app").catch(() => undefined)} accessibilityRole="button" style={{ alignSelf: "flex-start", marginTop: 8, paddingVertical: 6 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.cream, textDecorationLine: "underline" }}>{tx.openInstagram}</Text>
              </Pressable>
            ) : null}
            {err ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgb(232,176,164)", marginTop: 10 }}>{err}</Text> : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

/** one slide (or a wisdom card) through the app's share sheet: story 9:16 first, also 4:5 and 1:1, five designs */
export function SlideShareSheet({ c, index, texts, quick, onClose }: { c: CarouselPayload; index: number; texts: Record<number, Scripture[]>; quick?: boolean; onClose: () => void }) {
  const { lang } = useLang();
  const message = `${c.cover.title}${c.cover.sub ? `\n${c.cover.sub}` : ""}`;
  return (
    <ShareSheet visible templated quick={quick} seed={`cr:${c.id}`} onClose={onClose} link={`${APP_LINK}`} message={message} noDecoration
      renderCard={(f, o) => <CarouselSlideView c={{ ...c, lang: c.lang || lang }} index={index} format={f} palette={o.palette} texts={texts} />} />
  );
}

export function WisdomShareSheet({ w, scripture, quick, onClose }: { w: WisdomPayload; scripture: Scripture | null; quick?: boolean; onClose: () => void }) {
  const message = [w.text ?? scripture?.text ?? "", scripture?.ref ?? w.source.label].filter(Boolean).join("\n— ");
  return (
    <ShareSheet visible templated quick={quick} seed={`ws:${w.id}`} onClose={onClose} link={APP_LINK} message={message} noDecoration
      renderCard={(f, o) => <WisdomCard w={w} format={f} palette={o.palette} scripture={scripture} />} />
  );
}
