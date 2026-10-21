import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { upload } from "./api";

// Profile picture: picked from the photo library (or taken with the camera), cropped square, re-encoded as a 512 px
// JPEG on the device (this drops EXIF and location data) and uploaded. Returns the new avatar URL or null (cancelled).
export async function pickAvatar(source: "library" | "camera"): Promise<string | null> {
  const perm = source === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("permission");
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.9, exif: false };
  const r = source === "camera" ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (r.canceled || !r.assets[0]) return null;
  const ctx = ImageManipulator.manipulate(r.assets[0].uri).resize({ width: 512, height: 512 });
  const img = await ctx.renderAsync();
  const out = await img.saveAsync({ format: SaveFormat.JPEG, compress: 0.82 });
  const d = await upload<{ avatar: string }>("/api/community/avatar", {}, { image: { uri: out.uri, name: "avatar.jpg", type: "image/jpeg" } });
  return d.avatar;
}
