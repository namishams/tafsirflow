import { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";
import { ADHAN_VOICES } from "@/lib/adhan";

export const dynamic = "force-dynamic";
const DIR = path.join(process.env.AUDIO_DIR ?? "/srv/tafsirflow/audio", "adhan");
const MAX = 15 * 1024 * 1024;

// Upload an adhan recording (MP3) for one voice slot, with an optional credit line
export async function POST(req: NextRequest) {
  if (!(await requireAdmin()) || !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const form = await req.formData().catch(() => null);
  const id = String(form?.get("id") ?? "");
  const file = form?.get("file");
  if (!(ADHAN_VOICES as readonly string[]).includes(id)) return json({ error: "voice" }, 400);
  await fs.mkdir(DIR, { recursive: true });
  const credit = String(form?.get("credit") ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, 300);
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX) return json({ error: "size" }, 400);
    const buf = Buffer.from(await file.arrayBuffer());
    const isMp3 = buf.subarray(0, 3).toString("latin1") === "ID3" || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0);
    if (!isMp3) return json({ error: "format" }, 400);
    await fs.writeFile(path.join(DIR, `${id}.mp3`), buf, { mode: 0o644 });
  }
  if (credit) await fs.writeFile(path.join(DIR, `${id}.credit.txt`), credit, { mode: 0o644 });
  return json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin()) || !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!(ADHAN_VOICES as readonly string[]).includes(id)) return json({ error: "voice" }, 400);
  await fs.rm(path.join(DIR, `${id}.mp3`), { force: true });
  await fs.rm(path.join(DIR, `${id}.credit.txt`), { force: true });
  return json({ ok: true });
}
