import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { File, Paths } from "expo-file-system";
import { upload } from "./api";

// Profile picture: picked from the photo library (or taken with the camera), cropped square, re-encoded as a 512 px
// JPEG on the device (this drops EXIF and location data) and uploaded. Returns the new avatar URL or null (cancelled).
export async function pickAvatar(source: "library" | "camera"): Promise<string | null> {
  const uri = await pickAvatarLocal(source);
  return uri ? uploadAvatarFile(uri) : null;
}

/** pick, crop and re-encode only (onboarding before sign-in): the local JPEG, kept in the documents folder */
export async function pickAvatarLocal(source: "library" | "camera", keep = false): Promise<string | null> {
  // the library opens the system photo picker, which needs no access to the whole library (data minimisation, 5.1.1)
  if (source === "camera" && !(await ImagePicker.requestCameraPermissionsAsync()).granted) throw new Error("permission");
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.9, exif: false };
  const r = source === "camera" ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (r.canceled || !r.assets[0]) return null;
  const ctx = ImageManipulator.manipulate(r.assets[0].uri).resize({ width: 512, height: 512 });
  const img = await ctx.renderAsync();
  const out = await img.saveAsync({ format: SaveFormat.JPEG, compress: 0.82 });
  if (!keep || Platform.OS === "web") return out.uri;
  // the cache folder can be cleared by the system; a pending onboarding photo waits in the documents folder
  const dest = new File(Paths.document, "pending-avatar.jpg");
  try { if (dest.exists) dest.delete(); new File(out.uri).copy(dest); return dest.uri; } catch { return out.uri; }
}

/** upload a local JPEG as the profile picture; returns the new avatar URL (carries avatar_version) */
export async function uploadAvatarFile(uri: string): Promise<string> {
  const d = await upload<{ avatar: string }>("/api/community/avatar", {}, { image: { uri, name: "avatar.jpg", type: "image/jpeg" } });
  return d.avatar;
}
