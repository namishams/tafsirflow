// E-mail addresses never stand in the HTML of the site (owner 23.10.2026): address harvesters read plain "name@domain" text
// out of pages, scripts and structured data. Texts that mention the address carry a marker instead, ⟦user|domain⟧, and the
// page shows it as a short "show e-mail address" control (src/components/EmailText.tsx, RevealEmail.tsx) that reveals the
// link only when a visitor clicks. This file only turns text into markers and back; it has no React in it.
export const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
export const MARKER_PATTERN = /⟦([^|⟦⟧]+)\|([^⟦⟧]+)⟧/g;
/** matches a marker or a plain address, for splitting a text into pieces */
export const EMAIL_OR_MARKER = new RegExp(`${MARKER_PATTERN.source}|(${EMAIL_PATTERN.source})`, "g");

const SAMPLE_DOMAINS = /(^|\.)(example\.(com|org|net)|test|localhost)$/i;

/** plain addresses in a text become markers (addresses of the example domains stay: they are placeholders, not real) */
export function hideEmails(text: string): string {
  return text.replace(EMAIL_PATTERN, (addr) => {
    const [user, host] = [addr.slice(0, addr.lastIndexOf("@")), addr.slice(addr.lastIndexOf("@") + 1)];
    return SAMPLE_DOMAINS.test(host) ? addr : `⟦${user}|${host}⟧`;
  });
}

type Tree = { [k: string]: string | Tree };
/** any value (strings, arrays, objects) with the addresses in its strings turned into markers */
export function hideAny<T>(v: T): T {
  if (typeof v === "string") return (v.includes("@") ? hideEmails(v) : v) as T;
  if (Array.isArray(v)) return v.map(hideAny) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, hideAny(x)])) as T;
  return v;
}
/** the same for a whole message tree (done once per language when the messages are loaded, so neither the server-rendered
 *  HTML nor the texts sent to the browser carry an address) */
export function hideDeep<T extends Tree>(tree: T): T {
  const out: Tree = {};
  for (const [k, v] of Object.entries(tree)) out[k] = typeof v === "string" ? (v.includes("@") ? hideEmails(v) : v) : v && typeof v === "object" ? hideDeep(v as Tree) : v;
  return out as T;
}

/** for plain-text outputs (llms.txt, structured data): every address or marker is replaced by `to` (the contact form's URL) */
export function noEmails(text: string, to: string): string {
  return text.replace(MARKER_PATTERN, to).replace(EMAIL_PATTERN, (a) => (SAMPLE_DOMAINS.test(a.slice(a.lastIndexOf("@") + 1)) ? a : to));
}

/** the address in a form that is not an address (base64), handed to the reveal control instead of "user@domain" */
export function encodeAddress(user: string, host: string): string {
  let bin = "";
  new TextEncoder().encode(`${user}\u0000${host}`).forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
}
