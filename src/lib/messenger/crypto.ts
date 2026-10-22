import crypto from "node:crypto";

// Messenger encryption AT REST (not end-to-end). Transport is TLS. On the server every message body, image, voice
// note, group photo and report snapshot is sealed with AES-256-GCM. The key of a conversation is derived with
// HKDF-SHA256 from the server master key and the conversation's random salt, so one leaked conversation key does not
// open any other conversation. Because the server holds the master key it CAN decrypt: that is deliberate. A report
// copies the reported messages, and the moderator reads them (Apple guideline 1.2, members aged 16-17). Never call
// this "end-to-end encrypted" in the product.
//
// Master key: MESSENGER_KEY (32 random bytes as base64 or hex, or any long secret). Without it the key falls back to
// one derived from AUTH_CODE_SECRET / CERT_SECRET so existing chats keep working; set MESSENGER_KEY in production and
// never change it afterwards (old messages could no longer be read).

const VERSION = 1;
let master: Buffer | null = null;

function masterKey(): Buffer {
  if (master) return master;
  const raw = process.env.MESSENGER_KEY || "";
  let k: Buffer | null = null;
  if (/^[0-9a-f]{64}$/i.test(raw)) k = Buffer.from(raw, "hex");
  else if (raw && Buffer.from(raw, "base64").length === 32) k = Buffer.from(raw, "base64");
  else if (raw.length >= 32) k = crypto.createHash("sha256").update(raw).digest();
  if (!k) {
    const fallback = process.env.AUTH_CODE_SECRET || process.env.CERT_SECRET || "";
    if (!fallback) throw new Error("messenger_key_missing");
    k = crypto.createHash("sha256").update(`qmc-messenger-master:${fallback}`).digest();
  }
  master = k;
  return k;
}

/** true when a master key (or the fallback) is configured */
export function messengerReady(): boolean {
  try { masterKey(); return true; } catch { return false; }
}

const keys = new Map<string, Buffer>();
function threadKey(threadId: string | number, salt: Buffer): Buffer {
  const id = `${threadId}:${salt.toString("hex")}`;
  let k = keys.get(id);
  if (!k) {
    k = Buffer.from(crypto.hkdfSync("sha256", masterKey(), salt, `qmc-messenger:v1:thread:${threadId}`, 32));
    if (keys.size > 5000) keys.clear();
    keys.set(id, k);
  }
  return k;
}

/** version (1) | iv (12) | tag (16) | ciphertext; the thread id is bound as additional data */
export function seal(threadId: string | number, salt: Buffer, plain: Buffer | string): Buffer {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", threadKey(threadId, salt), iv);
  c.setAAD(Buffer.from(`t:${threadId}`));
  const ct = Buffer.concat([c.update(typeof plain === "string" ? Buffer.from(plain, "utf8") : plain), c.final()]);
  return Buffer.concat([Buffer.from([VERSION]), iv, c.getAuthTag(), ct]);
}

export function open(threadId: string | number, salt: Buffer, box: Buffer | null | undefined): Buffer | null {
  if (!box || box.length < 29 || box[0] !== VERSION) return null;
  try {
    const d = crypto.createDecipheriv("aes-256-gcm", threadKey(threadId, salt), box.subarray(1, 13));
    d.setAAD(Buffer.from(`t:${threadId}`));
    d.setAuthTag(box.subarray(13, 29));
    return Buffer.concat([d.update(box.subarray(29)), d.final()]);
  } catch {
    return null;
  }
}

export const openText = (threadId: string | number, salt: Buffer, box: Buffer | null | undefined) => open(threadId, salt, box)?.toString("utf8") ?? null;
export const newSalt = () => crypto.randomBytes(16);
