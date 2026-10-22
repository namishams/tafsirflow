import { useCallback, useEffect, useState } from "react";
import { AppState, Linking, Platform, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { getRecordingPermissionsAsync } from "expo-audio";
import { FONT, R, useTheme } from "@/lib/theme";
import { Icon, type IconName } from "@/components/icons";
import { useMT } from "./ui";

// "Berechtigungen" in the app settings: the current status of every permission the app uses, and a row that opens
// Settings -> Quran Masterclass (Linking.openSettings), where iOS lists each permission once the app has asked for it.
// Nothing is requested here; reading a status never shows a system prompt.
type St = "on" | "off" | "ask" | "limited";
type SR = typeof import("expo-speech-recognition");
const of = (p: { granted?: boolean; status?: string; canAskAgain?: boolean; accessPrivileges?: string } | null | undefined): St =>
  !p ? "ask" : p.accessPrivileges === "limited" ? "limited" : p.granted || p.status === "granted" ? "on" : p.status === "undetermined" ? "ask" : "off";

async function statuses(): Promise<Record<string, St>> {
  const safe = async <T,>(f: () => Promise<T>) => { try { return await f(); } catch { return null; } };
  let speech: SR | null = null;
  try { speech = require("expo-speech-recognition") as SR; } catch { speech = null; } // eslint-disable-line @typescript-eslint/no-require-imports
  const [photos, camera, mic, sp, notif, loc] = await Promise.all([
    safe(() => ImagePicker.getMediaLibraryPermissionsAsync()), safe(() => Camera.getCameraPermissionsAsync()), safe(() => getRecordingPermissionsAsync()),
    safe(async () => (speech ? speech.ExpoSpeechRecognitionModule.getPermissionsAsync() : null)), safe(() => Notifications.getPermissionsAsync()), safe(() => Location.getForegroundPermissionsAsync()),
  ]);
  return { photos: of(photos), camera: of(camera), mic: of(mic), speech: of(sp), notif: of(notif), location: of(loc) };
}

export function PermissionsSection() {
  const t = useTheme();
  const mt = useMT();
  const [s, setS] = useState<Record<string, St> | null>(null);
  const load = useCallback(() => { void statuses().then(setS); }, []);
  useEffect(() => {
    load();
    const sub = AppState.addEventListener("change", (x) => { if (x === "active") load(); }); // back from the Settings app
    return () => sub.remove();
  }, [load]);
  if (Platform.OS === "web") return null;
  const rows: [string, string, IconName][] = [
    ["photos", mt.perm_photos, "image"], ["camera", mt.perm_camera, "eye"], ["mic", mt.perm_mic, "mic"],
    ["speech", mt.perm_speech, "speaker"], ["notif", mt.perm_notif, "clock"], ["location", mt.perm_location, "map"],
  ];
  const label = (v: St | undefined) => (v === "on" ? mt.perm_on : v === "off" ? mt.perm_off : v === "limited" ? mt.perm_limited : mt.perm_ask);
  return (
    <View style={{ gap: 10 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: t.muted }}>{mt.perm_title}</Text>
      <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
        {rows.map(([k, title, icon], i) => (
          <View key={k} accessible accessibilityLabel={`${title}: ${label(s?.[k])}`}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, minHeight: 50, borderTopWidth: i ? 1 : 0, borderTopColor: t.line }}>
            <Icon name={icon} size={18} color={t.accent} />
            <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15.5, color: t.ink }}>{title}</Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: s?.[k] === "on" ? t.accent : t.muted }}>{label(s?.[k])}</Text>
          </View>
        ))}
        <Pressable onPress={() => void Linking.openSettings()} accessibilityRole="button" accessibilityHint={mt.permHint}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, minHeight: 52, borderTopWidth: 1, borderTopColor: t.line, backgroundColor: pressed ? t.bg : t.surface })}>
          <Icon name="settings" size={18} color={t.gold} />
          <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15.5, color: t.accent }}>{mt.openSettings}</Text>
          <Icon name="chevronRight" size={16} color={t.muted} />
        </Pressable>
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{mt.permHint}</Text>
    </View>
  );
}
