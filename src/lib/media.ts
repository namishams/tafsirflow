import { spawn } from "node:child_process";
import { imageFlagged } from "./imageSafety";
import crypto from "node:crypto";
import { constants, createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextRequest } from "next/server";

// Private media for Quran Talents (recitation clips, verification samples). Files live in MEDIA_DIR (outside the
// web root, never served by Nginx directly) and are only streamed through /api/community/media/* after the access
// checks. Without MEDIA_DIR, or when it is not writable, uploads answer 503 "media_unavailable".

export type MediaKind = "posts" | "samples" | "avatars";
export const MAX_BYTES = { audio: 8 * 1024 * 1024, video: 40 * 1024 * 1024 };

export async function mediaDir(): Promise<string | null> {
  const dir = process.env.MEDIA_DIR;
  if (!dir || !path.isAbsolute(dir)) return null;
  try {
    await fs.mkdir(path.join(dir, "posts"), { recursive: true });
    await fs.mkdir(path.join(dir, "samples"), { recursive: true });
    await fs.mkdir(path.join(dir, "avatars"), { recursive: true });
    await fs.access(dir, constants.W_OK | constants.R_OK);
    return dir;
  } catch {
    return null;
  }
}

/** container check by magic bytes: ISO media (mp4/m4a/mov: "ftyp" at 4), WAV (RIFF....WAVE), AAC ADTS */
export function sniff(buf: Buffer): { ext: string; mime: string; video: boolean } | null {
  if (buf.length >= 12 && buf.toString("latin1", 4, 8) === "ftyp") {
    const brand = buf.toString("latin1", 8, 12);
    if (/^M4A|^M4B/.test(brand)) return { ext: "m4a", mime: "audio/mp4", video: false };
    if (brand === "qt  ") return { ext: "mov", mime: "video/quicktime", video: true };
    return { ext: "mp4", mime: "video/mp4", video: true }; // mp4 may still be audio-only; ffmpeg normalises
  }
  if (buf.length >= 12 && buf.toString("latin1", 0, 4) === "RIFF" && buf.toString("latin1", 8, 12) === "WAVE") return { ext: "wav", mime: "audio/wav", video: false };
  if (buf.length >= 2 && buf[0] === 0xff && (buf[1] & 0xf6) === 0xf0) return { ext: "aac", mime: "audio/aac", video: false };
  return null;
}

function run(cmd: string, args: string[], ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const p = spawn(cmd, args, { stdio: "ignore" });
    const timer = setTimeout(() => { if (!done) { done = true; p.kill("SIGKILL"); resolve(false); } }, ms);
    p.on("error", () => { if (!done) { done = true; clearTimeout(timer); resolve(false); } });
    p.on("exit", (code) => { if (!done) { done = true; clearTimeout(timer); resolve(code === 0); } });
  });
}

/**
 * Stores an uploaded file as `<kind>/<name>.<ext>`. With ffmpeg (FFMPEG_PATH or "ffmpeg" on the PATH) audio becomes
 * AAC in .m4a and video H.264/AAC .mp4 (faststart, max 1080 px, cut at maxSeconds, metadata stripped); without it
 * the checked original is stored as is. Returns the relative path and the MIME type.
 */
export async function storeUpload(buf: Buffer, kind: MediaKind, name: string, opts: { wantVideo: boolean; maxSeconds: number }): Promise<{ rel: string; mime: string } | { error: string }> {
  const dir = await mediaDir();
  if (!dir) return { error: "media_unavailable" };
  const s = sniff(buf);
  if (!s) return { error: "media_format" };
  const video = opts.wantVideo && s.video;
  if (buf.length > (video ? MAX_BYTES.video : MAX_BYTES.audio)) return { error: "media_too_large" };
  const safe = name.replace(/[^a-z0-9_-]/gi, "");
  const tmp = path.join(dir, kind, `.${safe}-${crypto.randomBytes(6).toString("hex")}.${s.ext}`);
  await fs.writeFile(tmp, buf, { mode: 0o600 });
  const outExt = video ? "mp4" : "m4a";
  const out = path.join(dir, kind, `${safe}.${outExt}`);
  const ff = process.env.FFMPEG_PATH || "ffmpeg";
  const t = String(Math.max(1, opts.maxSeconds + 1));
  const args = video
    ? ["-y", "-i", tmp, "-t", t, "-map_metadata", "-1", "-vf", "scale='min(1080,iw)':-2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "26", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", out]
    : ["-y", "-i", tmp, "-t", t, "-map_metadata", "-1", "-vn", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", out];
  if (await run(ff, args, 120_000)) {
    await fs.rm(tmp, { force: true });
    // a video is checked on one frame (thumbnail); a flagged one is not kept
    if (video) {
      const frame = path.join(dir, kind, `.${safe}-${crypto.randomBytes(6).toString("hex")}.jpg`);
      const got = (await run(ff, ["-y", "-ss", "1", "-i", out, "-frames:v", "1", "-vf", "scale='min(768,iw)':-2", "-q:v", "5", frame], 30_000))
        || (await run(ff, ["-y", "-i", out, "-frames:v", "1", "-vf", "scale='min(768,iw)':-2", "-q:v", "5", frame], 30_000));
      const flagged = got ? await imageFlagged(await fs.readFile(frame).catch(() => Buffer.alloc(0))) : false;
      await fs.rm(frame, { force: true });
      if (flagged) { await fs.rm(out, { force: true }); return { error: "media_unsafe" }; }
    }
    return { rel: `${kind}/${safe}.${outExt}`, mime: video ? "video/mp4" : "audio/mp4" };
  }
  // no ffmpeg (or it failed): keep the checked original
  await fs.rm(out, { force: true });
  const keep = path.join(dir, kind, `${safe}.${s.ext}`);
  await fs.rename(tmp, keep);
  return { rel: `${kind}/${safe}.${s.ext}`, mime: video ? s.mime : s.mime.startsWith("video/") ? "audio/mp4" : s.mime };
}

export async function removeMedia(rel: string | null | undefined) {
  if (!rel) return;
  const dir = await mediaDir();
  if (!dir) return;
  const full = path.resolve(dir, rel);
  if (!full.startsWith(path.resolve(dir) + path.sep)) return;
  await fs.rm(full, { force: true }).catch(() => undefined);
}

/** streams a stored file with HTTP Range support (needed by iOS players); private, no caching by proxies */
export async function streamMedia(req: NextRequest, rel: string, mime: string): Promise<Response> {
  const dir = await mediaDir();
  if (!dir) return Response.json({ error: "media_unavailable" }, { status: 503 });
  const full = path.resolve(dir, rel);
  if (!full.startsWith(path.resolve(dir) + path.sep)) return Response.json({ error: "not_found" }, { status: 404 });
  let size: number;
  try { size = (await fs.stat(full)).size; } catch { return Response.json({ error: "not_found" }, { status: 404 }); }
  const base = { "Content-Type": mime, "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" };
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (m && (m[1] || m[2])) {
    let start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
    let end = m[1] && m[2] ? Number(m[2]) : size - 1;
    end = Math.min(end, size - 1);
    if (start > end || start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    start = Math.max(0, start);
    const body = Readable.toWeb(createReadStream(full, { start, end })) as ReadableStream;
    return new Response(body, { status: 206, headers: { ...base, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) } });
  }
  return new Response(Readable.toWeb(createReadStream(full)) as ReadableStream, { status: 200, headers: { ...base, "Content-Length": String(size) } });
}

/** JPEG without APP1..APP15 segments (EXIF, GPS, XMP) – used when ffmpeg is not there to re-encode */
export function stripJpeg(buf: Buffer): Buffer {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return buf;
  const out: Buffer[] = [buf.subarray(0, 2)];
  let i = 2;
  while (i + 4 <= buf.length && buf[i] === 0xff) {
    const marker = buf[i + 1];
    if (marker === 0xda) { out.push(buf.subarray(i)); return Buffer.concat(out); } // start of scan: rest is image data
    const len = buf.readUInt16BE(i + 2);
    if (!(marker >= 0xe1 && marker <= 0xef) && marker !== 0xfe) out.push(buf.subarray(i, i + 2 + len));
    i += 2 + len;
  }
  return buf;
}

/** profile picture: JPEG or PNG, at most 5 MB; re-encoded to a 512 px square JPEG with ffmpeg, else stored with the
 *  metadata stripped (the app already sends a re-encoded JPEG without location) */
export async function storeAvatar(buf: Buffer, name: string): Promise<{ rel: string; mime: string } | { error: string }> {
  const dir = await mediaDir();
  if (!dir) return { error: "media_unavailable" };
  if (buf.length > 5 * 1024 * 1024) return { error: "media_too_large" };
  const jpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const png = buf.length > 8 && buf.toString("latin1", 1, 4) === "PNG";
  if (!jpeg && !png) return { error: "media_format" };
  const safe = name.replace(/[^a-z0-9_-]/gi, "");
  const tmp = path.join(dir, "avatars", `.${safe}-${crypto.randomBytes(6).toString("hex")}.${jpeg ? "jpg" : "png"}`);
  await fs.writeFile(tmp, buf, { mode: 0o600 });
  const out = path.join(dir, "avatars", `${safe}.jpg`);
  const ff = process.env.FFMPEG_PATH || "ffmpeg";
  if (await run(ff, ["-y", "-i", tmp, "-map_metadata", "-1", "-vf", "scale=512:512:force_original_aspect_ratio=increase,crop=512:512", "-q:v", "4", "-frames:v", "1", out], 30_000)) {
    await fs.rm(tmp, { force: true });
    if (await imageFlagged(await fs.readFile(out).catch(() => Buffer.alloc(0)))) { await fs.rm(out, { force: true }); return { error: "media_unsafe" }; }
    return { rel: `avatars/${safe}.jpg`, mime: "image/jpeg" };
  }
  await fs.rm(tmp, { force: true });
  if (jpeg) { await fs.writeFile(out, stripJpeg(buf), { mode: 0o600 }); return { rel: `avatars/${safe}.jpg`, mime: "image/jpeg" }; }
  const outPng = path.join(dir, "avatars", `${safe}.png`);
  await fs.writeFile(outPng, buf, { mode: 0o600 }); // PNG text chunks are rare; the app always sends JPEG
  return { rel: `avatars/${safe}.png`, mime: "image/png" };
}
