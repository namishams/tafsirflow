import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";

// Several files in ONE system share sheet (the slides of a carousel → an Instagram carousel post). The native part
// lives in ios/ and android/ of this local module; builds made before it was added do not have it, then
// shareManyAvailable() is false and the caller falls back (save all to Photos, or one file at a time).
type Native = { shareAsync(urls: string[], title: string | null): Promise<{ completed: boolean; activity: string }> };
const native = Platform.OS === "ios" || Platform.OS === "android" ? requireOptionalNativeModule<Native>("QmcShareMany") : null;

export const shareManyAvailable = () => !!native;

/** file:// URLs of local files; resolves when the sheet closes (iOS) or the chooser opened (Android) */
export async function shareMany(urls: string[], title?: string): Promise<{ completed: boolean; activity: string }> {
  if (!native) throw new Error("QmcShareMany is not in this build");
  return native.shareAsync(urls, title ?? null);
}
