import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { clientIp, json, rateLimited } from "@/lib/http";
import { RECITERS, getVerses, localAudioUrl } from "@/lib/quran";
import { VERSE_COUNTS } from "@/lib/counts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Verse video for Instagram Reels / Stories and WhatsApp: a 1080×1920 MP4 (H.264 + AAC) made with ffmpeg from the
// verse image and the recitation of the free reciter (Alafasy).
//
// Why the image comes from the app: the server's image renderer (next/og / satori) cannot shape Uthmani Arabic –
// it throws on Amiri and has no mark positioning – and a mis-drawn verse must never be published. The app draws the
// card with the system's text engine (the same card as the image share) and sends it here; the server only checks it
// and adds the audio. Quran text is never typed or changed here; the audio comes from the same helpers as the reader
// (src/lib/quran.ts): the self-hosted file under AUDIO_DIR, else the Quran.com URL.
//
//   GET  ?key=2:255&lang=en            → the cached MP4, or 404 when it has not been made yet
//   POST { key, lang, png (base64) }   → makes the MP4 (cached by key + lang) and answers { url }
const AUDIO_DIR = process.env.AUDIO_DIR ?? "/srv/tafsirflow/audio";
const CACHE_DIR = process.env.SHARE_VIDEO_DIR ?? path.join(os.tmpdir(), "qmc-verse-video");
const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";
const LANG = /^[a-z]{2}$/;
const MAX_PNG = 6 * 1024 * 1024;
const FREE_RECITER = RECITERS[0]; // id 7 Alafasy, free for everyone

function parseKey(key: string | null): { s: number; v: number } | null {
  const m = key?.match(/^(\d{1,3}):(\d{1,3})$/);
  if (!m) return null;
  const s = Number(m[1]), v = Number(m[2]);
  return s >= 1 && s <= 114 && v >= 1 && v <= VERSE_COUNTS[s - 1] ? { s, v } : null;
}
const fileOf = (s: number, v: number, lang: string) => path.join(CACHE_DIR, `${s}_${v}_${lang}.mp4`);
const exists = (f: string) => fs.stat(f).then((x) => x.size > 0).catch(() => false);
const publicUrl = (s: number, v: number, lang: string) => `/api/share/verse-video?key=${s}:${v}&lang=${lang}`;

export async function GET(req: NextRequest) {
  if (rateLimited(`vv-get:${clientIp(req)}`, 60, 60_000)) return json({ error: "rate" }, 429);
  const k = parseKey(req.nextUrl.searchParams.get("key"));
  const lang = req.nextUrl.searchParams.get("lang") ?? "";
  if (!k || !LANG.test(lang)) return json({ error: "bad_request" }, 400);
  const f = fileOf(k.s, k.v, lang);
  if (!(await exists(f))) return json({ error: "not_found" }, 404);
  const data = await fs.readFile(f);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(data.length),
      "Content-Disposition": `inline; filename="quran-${k.s}-${k.v}.mp4"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

/** a PNG of about 1080×1920 (read from the IHDR chunk right after the signature) */
function checkPng(buf: Buffer): boolean {
  const sig = buf.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
  if (!sig || buf.length < 24 || buf.subarray(12, 16).toString("ascii") !== "IHDR") return false;
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  // about 1080×1920 (device rounding may give a pixel more or less); ffmpeg scales it to exactly 1080×1920
  return w >= 1000 && w <= 1200 && Math.abs(h / w - 16 / 9) < 0.02;
}

/** the recitation: the self-hosted file if it is there, else the Quran.com file the reader falls back to */
async function audioFor(s: number, v: number, dir: string): Promise<string | null> {
  const local = path.join(AUDIO_DIR, localAudioUrl(FREE_RECITER, s, v).replace(/^.*?\/audio\//, "").replace(/^\/+/, ""));
  if (await exists(local)) return local;
  try {
    const verses = await getVerses(s, "en", FREE_RECITER, 20);
    const url = verses.find((x) => x.verse_number === v)?.remoteAudioUrl;
    if (!url || !/^https:\/\//.test(url)) return null;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const out = path.join(dir, "audio.mp3");
    await fs.writeFile(out, Buffer.from(await res.arrayBuffer()));
    return out;
  } catch {
    return null;
  }
}

function ffmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(FFMPEG, args, { timeout: 90_000, maxBuffer: 4 * 1024 * 1024 }, (err) => (err ? reject(err) : resolve()));
  });
}

const inflight = new Map<string, Promise<boolean>>();
async function render(s: number, v: number, lang: string, png: Buffer): Promise<boolean> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const work = await fs.mkdtemp(path.join(os.tmpdir(), "qmc-vv-"));
  try {
    const img = path.join(work, "card.png");
    await fs.writeFile(img, png);
    const audio = await audioFor(s, v, work);
    if (!audio) return false;
    const tmp = path.join(work, "out.mp4");
    await ffmpeg([
      "-loglevel", "error", "-y",
      "-loop", "1", "-framerate", "30", "-i", img,
      "-i", audio,
      "-filter_complex", "[0:v]scale=1080:1920,format=yuv420p[v];[1:a]apad=pad_dur=1.5[a]",
      "-map", "[v]", "-map", "[a]",
      "-c:v", "libx264", "-preset", "veryfast", "-tune", "stillimage", "-profile:v", "high", "-r", "30",
      "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-ac", "2",
      "-shortest", "-movflags", "+faststart",
      tmp,
    ]);
    await fs.rename(tmp, fileOf(s, v, lang)).catch(async () => { await fs.copyFile(tmp, fileOf(s, v, lang)); });
    return true;
  } catch {
    return false;
  } finally {
    await fs.rm(work, { recursive: true, force: true }).catch(() => undefined);
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(`vv-post:${ip}`, 6, 10 * 60_000)) return json({ error: "rate" }, 429);
  const body = (await req.json().catch(() => null)) as { key?: string; lang?: string; png?: string } | null;
  const k = parseKey(body?.key ?? null);
  const lang = body?.lang ?? "";
  if (!k || !LANG.test(lang) || typeof body?.png !== "string") return json({ error: "bad_request" }, 400);
  const f = fileOf(k.s, k.v, lang);
  if (await exists(f)) return json({ url: publicUrl(k.s, k.v, lang), cached: true });

  const png = Buffer.from(body.png.replace(/^data:image\/png;base64,/, ""), "base64");
  if (png.length > MAX_PNG || !checkPng(png)) return json({ error: "bad_image" }, 400);

  const id = `${k.s}:${k.v}:${lang}`;
  let job = inflight.get(id);
  if (!job) {
    job = render(k.s, k.v, lang, png).finally(() => inflight.delete(id));
    inflight.set(id, job);
  }
  const ok = await job;
  if (!ok) return json({ error: "render_failed" }, 502);
  return json({ url: publicUrl(k.s, k.v, lang), hash: createHash("sha256").update(png).digest("hex").slice(0, 12) });
}
