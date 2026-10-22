// Automatic image-safety check for uploads (messenger pictures and video frames, Talents clips, profile pictures):
// OpenAI's moderation endpoint (omni-moderation-latest accepts images) with the server's OPENAI_API_KEY. Only the
// cleaned, metadata-free JPEG is sent, never a name or account. Without a key or when OpenAI does not answer the
// upload goes through; reports and the moderators remain the safety net.

/** true when OpenAI's moderation flags the image (sexual, violence, self-harm …); false when clean or unchecked */
export async function imageFlagged(jpeg: Buffer): Promise<boolean> {
  const key = process.env.OPENAI_API_KEY;
  if (!key || !jpeg.length) return false;
  try {
    const r = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "omni-moderation-latest", input: [{ type: "image_url", image_url: { url: `data:image/jpeg;base64,${jpeg.toString("base64")}` } }] }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) return false;
    const d = (await r.json()) as { results?: { flagged?: boolean }[] };
    return !!d.results?.[0]?.flagged;
  } catch {
    return false;
  }
}

