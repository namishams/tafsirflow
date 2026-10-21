import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, FlatList, Modal, Platform, Pressable, Switch, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { FONT, useTheme } from "@/lib/theme";
import { openPro, usePro } from "@/lib/pro";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { reciterName, type Reciter } from "@/lib/quran";
import { allowedReciter, isFreeReciter, useReciter } from "@/features/quran/reciter";
import type { VerseEngine } from "@/features/quran/useVerseAudio";
import { useFeedText } from "./texts";

// The voice of the feed: the chosen reciter (the app-wide "tf:reciter" through useReciter, so Pro gating is the one of
// every player) or – with "rotate" on – a different allowed voice per post. Every voice goes through allowedReciter.
const ROTATE_KEY = "qmc.feed-rotate";

const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };

export function useFeedVoice() {
  const { pro } = usePro();
  const [reciter, setReciter, all] = useReciter();
  const rotate = useStored<boolean>(ROTATE_KEY, false);
  const setRotate = useCallback((on: boolean) => writeJSON(ROTATE_KEY, on, true), []);
  const pool = all.filter((r) => pro || isFreeReciter(r));
  const voiceFor = useCallback((item: string): Reciter => {
    if (!rotate || pool.length < 2) return reciter;
    return allowedReciter(pool[hash(item) % pool.length], pro, all);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotate, reciter.folder, pool.length, pro, all]);
  return { reciter, setReciter, all, rotate, setRotate, voiceFor, pro, sig: `${reciter.folder}|${rotate ? 1 : 0}|${pro ? 1 : 0}` };
}

/** the feed's audio stops when the screen loses focus (tab switch, a screen on top, back gesture), when the app goes to
 *  the background and on unmount; returns whether sound may play right now */
export function useFeedAudioGuard(engine: VerseEngine) {
  const [focused, setFocused] = useState(true);
  const [appActive, setAppActive] = useState(AppState.currentState === "active");
  useFocusEffect(useCallback(() => { setFocused(true); return () => { setFocused(false); engine.stop(); }; }, [engine]));
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => { const on = s === "active"; setAppActive(on); if (!on) engine.stop(); });
    return () => { sub.remove(); engine.stop(); };
  }, [engine]);
  return focused && appActive;
}

/** the reciter sheet: every voice of the app; a locked one (without Pro) closes the sheet and then opens the paywall
 *  (iOS cannot present the Pro screen over this sheet, so the tap would seem to do nothing) */
export function ReciterSheet({ visible, onClose, dark }: { visible: boolean; onClose: () => void; dark?: boolean }) {
  const tx = useFeedText();
  const th = useTheme();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const v = useFeedVoice();
  const proAfter = useRef(false);
  const pickLocked = () => {
    onClose();
    // iOS: after the sheet is gone (onDismiss, with a fallback should the event not come); Android closes its dialog at once
    if (Platform.OS !== "ios") { openPro("reciters"); return; }
    proAfter.current = true;
    setTimeout(() => { if (proAfter.current) { proAfter.current = false; openPro("reciters"); } }, 900);
  };
  const bg = dark ? "#0b1512" : th.surface;
  const ink = dark ? "#fff" : th.ink;
  const muted = dark ? "rgba(255,255,255,0.6)" : th.muted;
  const line = dark ? "rgba(255,255,255,0.12)" : th.line;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}
      onDismiss={() => { if (proAfter.current) { proAfter.current = false; openPro("reciters"); } }}>
      <View style={{ flex: 1, backgroundColor: bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 58, borderBottomWidth: 1, borderBottomColor: line }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 19, color: ink }}>{tx.reciters}</Text>
          <Text onPress={onClose} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 15, color: th.accent, paddingVertical: 8 }}>{tx.close}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: line }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: ink }}>{tx.rotate}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: muted }}>{tx.rotateLead}</Text>
          </View>
          <Switch value={v.rotate} onValueChange={v.setRotate} accessibilityLabel={tx.rotate} />
        </View>
        <FlatList
          data={v.all}
          keyExtractor={(r) => r.folder}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          renderItem={({ item: r }) => {
            const locked = !v.pro && !isFreeReciter(r);
            const on = !v.rotate && r.folder === v.reciter.folder;
            const name = reciterName(r, lang);
            return (
              <Pressable onPress={() => { if (locked) { pickLocked(); return; } if (v.rotate) v.setRotate(false); v.setReciter(r); onClose(); }} accessibilityRole="button"
                accessibilityState={{ selected: on }} accessibilityLabel={locked ? `${name}, ${tx.proOnly}` : name}
                style={({ pressed }) => ({ height: 54, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, backgroundColor: pressed || on ? th.accentSoft : "transparent" })}>
                <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15.5, color: locked ? muted : ink }}>{name}</Text>
                {locked ? <Icon name="lock" color={muted} size={18} /> : on ? <Icon name="check" color={th.accent} size={20} /> : null}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

export const readRotate = () => readJSON<boolean>(ROTATE_KEY, false);
