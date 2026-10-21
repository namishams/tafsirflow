import { Platform, Vibration } from "react-native";

// Light haptic ticks for like / save like on Instagram. expo-haptics is used when the app has it; otherwise Android
// gets a very short vibration and iOS stays silent (RN's Vibration on iOS is a long buzz).
type H = { impactAsync?: (s: unknown) => Promise<void>; ImpactFeedbackStyle?: { Light: unknown } };
let mod: H | null | undefined;
function load(): H | null {
  if (mod !== undefined) return mod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require("expo-haptics") as H;
  } catch { mod = null; }
  return mod;
}
export function tick() {
  try {
    const h = load();
    if (h?.impactAsync && h.ImpactFeedbackStyle) { void h.impactAsync(h.ImpactFeedbackStyle.Light).catch(() => undefined); return; }
    if (Platform.OS === "android") Vibration.vibrate(10);
  } catch { /* haptics are optional */ }
}
/** a stronger "success" pattern for level-ups and new stickers */
export function success() {
  try {
    const h = load() as (H & { notificationAsync?: (s: unknown) => Promise<void>; NotificationFeedbackType?: { Success: unknown } }) | null;
    if (h?.notificationAsync && h.NotificationFeedbackType) { void h.notificationAsync(h.NotificationFeedbackType.Success).catch(() => undefined); return; }
    if (Platform.OS === "android") Vibration.vibrate([0, 20, 60, 30]);
  } catch { /* haptics are optional */ }
}
