import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import type { AdhanFile } from "@/web/adhan";
import { api, SITE } from "@/lib/api";
import { readJSON } from "@/lib/store";

// The adhan as the sound of the prayer notification. iOS plays a notification sound of at most 30 seconds from the
// app's Library/Sounds folder; the server keeps the opening of every recording as <id>.notify.wav
// (scripts/install-adhan.sh). The chosen voice is downloaded once; without it the gentle system tone stays.
const soundsDir = () => new Directory(Paths.document.parentDirectory, "Library", "Sounds");

export async function adhanNotificationSound(): Promise<string | null> {
  if (Platform.OS !== "ios") return null;
  try {
    const files = (await api<{ files?: AdhanFile[] }>("/api/adhan")).files?.filter((f) => f.notify) ?? [];
    if (!files.length) return null;
    const want = readJSON<string>("tf:adhanVoice", "random");
    const pick = files.find((f) => f.id === want) ?? files[0];
    const name = `qmc-adhan-${pick.id}.wav`;
    const dir = soundsDir();
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const file = new File(dir, name);
    if (!file.exists || file.size < 20_000) {
      if (file.exists) file.delete();
      await File.downloadFileAsync(`${SITE}/audio/adhan/${pick.id}.notify.wav`, file);
    }
    return file.exists ? name : null;
  } catch {
    return null;
  }
}
