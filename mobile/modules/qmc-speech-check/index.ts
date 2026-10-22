import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";

// Whether iOS recognises a locale on the device (SFSpeechRecognizer(locale:).supportsOnDeviceRecognition). Builds made
// before this local module was added do not have it: then the answer is null (not confirmed) and the caller falls
// back to the self check without speech recognition.
type Native = { supportsOnDevice(locale: string): boolean };
const native = Platform.OS === "ios" ? requireOptionalNativeModule<Native>("QmcSpeechCheck") : null;

export function iosSupportsOnDevice(locale: string): boolean | null {
  if (!native) return null;
  try { return native.supportsOnDevice(locale); } catch { return null; }
}
