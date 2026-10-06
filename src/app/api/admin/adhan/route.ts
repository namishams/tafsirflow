import { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";
import { isSlug } from "@/lib/adhan";

export const dynamic = "force-dynamic";
const DIR = path.join(process.env.AUDIO_DIR ?? "/srv/tafsirflow/audio", "adhan");
const MAX = 15 * 1024 * 1024;
const line = (v: FormDataEntryValue | null, max: number) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

// Add or update an adhan recording (MP3) with a label and a credit line
export async function POST(req: NextRequest) {
  if (!(await requireAdmin()) || !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const form = await req.formData().catch(() => null);
  const id = line(form?.get("id") ?? null, 41).toLowerCase();
  if (!isSlug(id)) return json({ error: "id" }, 400);
  await fs.mkdir(DIR, { recursive: true });
  const file = form?.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX) return json({ error: "size" }, 400);
    const buf = Buffer.from(await file.arrayBuffer());
    const isMp3 = buf.subarray(0, 3).toString("latin1") === "ID3" || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0);
    if (!isMp3) return json({ error: "format" }, 400);
    await fs.writeFile(path.join(DIR, `${id}.mp3`), buf, { mode: 0o644 });
  }
  const label = line(form?.get("label") ?? null, 80), credit = line(form?.get("credit") ?? null, 300);
  if (label) await fs.writeFile(path.join(DIR, `${id}.label.txt`), label, { mode: 0o644 });
  if (credit) await fs.writeFile(path.join(DIR, `${id}.credit.txt`), credit, { mode: 0o644 });
  return json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin()) || !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!isSlug(id)) return json({ error: "id" }, 400);
  for (const ext of [".mp3", ".label.txt", ".credit.txt"]) await fs.rm(path.join(DIR, `${id}${ext}`), { force: true });
  return json({ ok: true });
}
