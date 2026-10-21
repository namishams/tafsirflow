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
