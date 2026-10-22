import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { sniff, stripJpeg } from "../media";

// Images and voice notes of the messenger. Both are re-encoded with ffmpeg (FFMPEG_PATH or "ffmpeg") without any
// metadata (EXIF, GPS, device) before they are sealed and stored in the database; nothing is kept on disk.
// Without ffmpeg a JPEG is stored with its metadata segments removed, and a recognised audio file as it is.

export const IMAGE_IN_MAX = 8 * 1024 * 1024;
export const IMAGE_OUT_MAX = 3 * 1024 * 1024;
export const VOICE_MAX = 5 * 1024 * 1024;
export const VOICE_SECONDS = 120;

function run(args: string[], ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const p = spawn(process.env.FFMPEG_PATH || "ffmpeg", args, { stdio: "ignore" });
    const timer = setTimeout(() => { if (!done) { done = true; p.kill("SIGKILL"); resolve(false); } }, ms);
    p.on("error", () => { if (!done) { done = true; clearTimeout(timer); resolve(false); } });
    p.on("exit", (code) => { if (!done) { done = true; clearTimeout(timer); resolve(code === 0); } });
  });
}

async function viaFfmpeg(buf: Buffer, inExt: string, outExt: string, args: string[], ms: number): Promise<Buffer | null> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qmc-msg-"));
  const tag = crypto.randomBytes(6).toString("hex");
  const src = path.join(dir, `${tag}.${inExt}`);
  const out = path.join(dir, `${tag}-out.${outExt}`);
  try {
    await fs.writeFile(src, buf, { mode: 0o600 });
    if (!(await run(["-y", "-i", src, ...args, out], ms))) return null;
    return await fs.readFile(out);
  } catch {
    return null;
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

const isJpeg = (b: Buffer) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
const isPng = (b: Buffer) => b.length > 8 && b.toString("latin1", 1, 4) === "PNG";
const isWebp = (b: Buffer) => b.length > 12 && b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP";
const isHeic = (b: Buffer) => b.length > 12 && b.toString("latin1", 4, 8) === "ftyp" && /^(heic|heix|mif1|msf1|hevc)/.test(b.toString("latin1", 8, 12));

/** a JPEG of at most 1600 px without metadata, or an error code */
export async function cleanImage(buf: Buffer): Promise<{ data: Buffer; mime: string } | { error: string }> {
  if (buf.length > IMAGE_IN_MAX) return { error: "media_too_large" };
  const ext = isJpeg(buf) ? "jpg" : isPng(buf) ? "png" : isWebp(buf) ? "webp" : isHeic(buf) ? "heic" : null;
  if (!ext) return { error: "media_format" };
  const out = await viaFfmpeg(buf, ext, "jpg", ["-map_metadata", "-1", "-vf", "scale='min(1600,iw)':'min(1600,ih)':force_original_aspect_ratio=decrease", "-q:v", "4", "-frames:v", "1"], 30_000);
  const data = out ?? (ext === "jpg" ? stripJpeg(buf) : null);
  if (!data) return { error: "media_format" };
  if (data.length > IMAGE_OUT_MAX) return { error: "media_too_large" };
  return { data, mime: "image/jpeg" };
}

const isWebm = (b: Buffer) => b.length > 4 && b.readUInt32BE(0) === 0x1a45dfa3;
const isOgg = (b: Buffer) => b.length > 4 && b.toString("latin1", 0, 4) === "OggS";

/** AAC in .m4a, cut at two minutes, without metadata; or an error code */
export async function cleanVoice(buf: Buffer): Promise<{ data: Buffer; mime: string } | { error: string }> {
  if (buf.length > VOICE_MAX) return { error: "media_too_large" };
  const s = sniff(buf);
  const ext = s ? s.ext : isWebm(buf) ? "webm" : isOgg(buf) ? "ogg" : null;
  if (!ext) return { error: "media_format" };
  const out = await viaFfmpeg(buf, ext, "m4a", ["-t", String(VOICE_SECONDS), "-map_metadata", "-1", "-vn", "-ac", "1", "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart"], 60_000);
  if (out) return { data: out, mime: "audio/mp4" };
  const mime = s ? (s.mime.startsWith("video/") ? "audio/mp4" : s.mime) : ext === "webm" ? "audio/webm" : "audio/ogg";
  return { data: buf, mime };
}
