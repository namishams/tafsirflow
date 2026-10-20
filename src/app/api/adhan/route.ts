import { promises as fs } from "node:fs";
import path from "node:path";
import { json } from "@/lib/http";
import { isSlug } from "@/lib/adhan";

export const dynamic = "force-dynamic";
const ADHAN_DIR = path.join(process.env.AUDIO_DIR ?? "/srv/tafsirflow/audio", "adhan");

const read = (f: string) => fs.readFile(f, "utf8").then((x) => x.trim()).catch(() => "");

// Public list of installed adhan recordings
export async function GET() {
  const names = await fs.readdir(ADHAN_DIR).catch(() => [] as string[]);
  const ids = names.filter((n) => n.endsWith(".mp3")).map((n) => n.slice(0, -4)).filter(isSlug).sort();
  const has = new Set(names);
  // notify: a 29-second opening as WAV for the phone's prayer notification (scripts/install-adhan.sh makes it)
  const files = await Promise.all(ids.map(async (id) => ({ id, label: (await read(path.join(ADHAN_DIR, `${id}.label.txt`))) || id, credit: await read(path.join(ADHAN_DIR, `${id}.credit.txt`)), notify: has.has(`${id}.notify.wav`) })));
  return json({ files }, 200, { "Cache-Control": "public, max-age=300" });
}
