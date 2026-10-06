import { createReadStream, statSync } from "node:fs";
import { Readable } from "node:stream";

export const dynamic = "force-dynamic";

// Direct download of the Android app built by scripts/build-android.sh (for phones without Google Play)
const FILE = process.env.ANDROID_APK ?? "/srv/tafsirflow/android/out/quranmasterclass.apk";

export function HEAD() {
  try { return new Response(null, { status: statSync(FILE).isFile() ? 200 : 404 }); } catch { return new Response(null, { status: 404 }); }
}

export function GET() {
  try {
    const size = statSync(FILE).size;
    return new Response(Readable.toWeb(createReadStream(FILE)) as ReadableStream, { headers: {
      "content-type": "application/vnd.android.package-archive", "content-length": String(size),
      "content-disposition": 'attachment; filename="QuranMasterclass.apk"', "cache-control": "no-cache" } });
  } catch {
    return new Response("not available yet", { status: 404 });
  }
}
