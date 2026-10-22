import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { sniff, stripJpeg } from "../media";
import { imageFlagged } from "../imageSafety";

// Images and voice notes of the messenger. Both are re-encoded with ffmpeg (FFMPEG_PATH or "ffmpeg") without any
// metadata (EXIF, GPS, device) before they are sealed and stored in the database; nothing is kept on disk.
// Without ffmpeg a JPEG is stored with its metadata segments removed, and a recognised audio file as it is.
// Images and videos (one frame) are checked by OpenAI's moderation endpoint (omni-moderation, accepts images) with the
// server's OPENAI_API_KEY before they are stored; flagged ones are refused with "media_unsafe". Only the cleaned,
// metadata-free JPEG leaves the server, never a name or account. Without a key or when OpenAI does not answer, the
// upload goes through (the report flow and the moderators remain the safety net).

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

/** one frame of a video (after one second, or the first one for very short clips) as a small JPEG */
async function videoFrame(mp4: Buffer): Promise<Buffer | null> {
  return (await viaFfmpeg(mp4, "mp4", "jpg", ["-ss", "1", "-frames:v", "1", "-vf", "scale='min(768,iw)':-2", "-q:v", "5"], 30_000))
    ?? viaFfmpeg(mp4, "mp4", "jpg", ["-frames:v", "1", "-vf", "scale='min(768,iw)':-2", "-q:v", "5"], 30_000);
}

/** a JPEG of at most 1600 px without metadata, or an error code */
export async function cleanImage(buf: Buffer): Promise<{ data: Buffer; mime: string } | { error: string }> {
  if (buf.length > IMAGE_IN_MAX) return { error: "media_too_large" };
  const ext = isJpeg(buf) ? "jpg" : isPng(buf) ? "png" : isWebp(buf) ? "webp" : isHeic(buf) ? "heic" : null;
  if (!ext) return { error: "media_format" };
  const out = await viaFfmpeg(buf, ext, "jpg", ["-map_metadata", "-1", "-vf", "scale='min(1600,iw)':'min(1600,ih)':force_original_aspect_ratio=decrease", "-q:v", "4", "-frames:v", "1"], 30_000);
  const data = out ?? (ext === "jpg" ? stripJpeg(buf) : null);
  if (!data) return { error: "media_format" };
  if (data.length > IMAGE_OUT_MAX) return { error: "media_too_large" };
  if (await imageFlagged(data)) return { error: "media_unsafe" };
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

export const VIDEO_IN_MAX = 60 * 1024 * 1024;
export const VIDEO_OUT_MAX = 25 * 1024 * 1024;
export const VIDEO_SECONDS = 60;

/** H.264/AAC .mp4 of at most 720 px and one minute, without metadata (GPS, device); never stored without ffmpeg */
export async function cleanVideo(buf: Buffer): Promise<{ data: Buffer; mime: string } | { error: string }> {
  if (buf.length > VIDEO_IN_MAX) return { error: "media_too_large" };
  const s = sniff(buf);
  if (!s || !s.video) return { error: "media_format" };
  const out = await viaFfmpeg(buf, s.ext, "mp4", ["-t", String(VIDEO_SECONDS), "-map_metadata", "-1", "-map_chapters", "-1",
    "-vf", "scale='min(720,iw)':'min(720,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "28", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart"], 180_000);
  if (!out) return { error: "media_format" };
  if (out.length > VIDEO_OUT_MAX) return { error: "media_too_large" };
  const frame = await videoFrame(out);
  if (frame && (await imageFlagged(frame))) return { error: "media_unsafe" };
  return { data: out, mime: "video/mp4" };
}
