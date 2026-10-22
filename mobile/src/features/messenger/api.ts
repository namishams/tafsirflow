import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import { ApiError, SITE, api } from "@/lib/api";
import { getToken } from "@/lib/storage";
import { upload } from "@/features/talents/api";
import type { Badge } from "@/features/talents/badges";

// Client for the messenger (website src/app/api/messenger/[...path]). Encrypted in transit (TLS) and at rest on the
// server; reported messages can be read by the moderators (Apple guideline 1.2). Never "end-to-end encrypted".
export type Person = { username: string; name: string; level: string; badge: Badge | null; verified: boolean; avatar: string | null };
export type Reaction = "mashallah" | "heart" | "dua";
export const REACTIONS: Reaction[] = ["mashallah", "heart", "dua"];
export type ThreadKind = "direct" | "group" | "circle";
export type Audience = "all" | "brothers" | "sisters";
export type ThreadRow = {
  id: string; kind: ThreadKind; title: string; with: Person | null; photo: string | null; audience: Audience;
  request: { status: "pending" | "declined"; incoming: boolean } | null;
  last: { kind: string; text: string | null; mine: boolean; name: string; gone: boolean; viewOnce?: boolean; system?: { what: string; who: string } | null } | null;
  at: string | null; unread: number; quiet: boolean;
};
export type Unread = { inbox: number; requests: number };
export type ShareType = "verse" | "surah" | "course" | "carousel" | "profile" | "post";
/** a card shared into a chat; url is a path inside the app and the website */
export type ShareCard = { type: ShareType; ref: string; title: string; subtitle: string; url: string };
export type ChatMessage = {
  id: string; kind: "text" | "image" | "voice" | "video" | "share" | "system"; mine: boolean; sender: Person | null; text: string | null; card?: ShareCard | null; system: { what: string; who: string } | null;
  deleted: boolean; removed: boolean; media: string | null; durationMs: number | null;
  viewOnce?: { opened: boolean; canOpen: boolean } | null; edited?: boolean; editable?: boolean; wave?: string | null;
  reply: { id: string; name: string; kind: string; text: string | null; gone: boolean } | null;
  reactions: Partial<Record<Reaction, number>>; myReaction: Reaction | null; at: string;
};
export type Member = Person & { role: "admin" | "member"; muted: boolean; me: boolean };
export type ThreadInfo = {
  id: string; kind: ThreadKind; title: string; audience: Audience; with: Person | null; photo: string | null;
  me: { role: "admin" | "member"; mutedUntil: string | null; quiet: boolean };
  members: Member[]; memberCount: number; request: { status: "pending" | "declined"; incoming: boolean } | null;
  typing: string[]; readUpTo: number | null; readers: number[] | null; invite?: boolean; canManage: boolean;
  card?: { country: string | null; level: string; mutual: number } | null; active?: boolean; canViewOnce?: boolean;
};
export type Prefs = { readReceipts: boolean; activeStatus: boolean };
export type ThreadPage = { thread: ThreadInfo; messages: ChatMessage[]; more: string | null; canSend: boolean; sendProblem: string | null };
export type SearchHit = { threadId: string; messageId: string | null; title: string; snippet: string | null; at: string | null };

const u = encodeURIComponent;
const B = "/api/messenger";
export const M = {
  threads: (box: "inbox" | "requests" = "inbox") => api<{ threads: ThreadRow[]; unread: Unread }>(`${B}/threads?box=${box}`),
  unread: () => api<Unread>(`${B}/unread`),
  open: (username: string) => api<{ id: string; request: boolean }>(`${B}/threads`, { method: "POST", body: { username } }),
  createGroup: (name: string, audience: Audience) => api<{ id: string }>(`${B}/groups`, { method: "POST", body: { name, audience } }),
  join: (code: string) => api<{ id: string }>(`${B}/join`, { method: "POST", body: { code } }),
  page: (id: string, opts: { before?: string; after?: string } = {}) =>
    api<ThreadPage>(`${B}/threads/${u(id)}${opts.before ? `?before=${u(opts.before)}` : opts.after ? `?after=${u(opts.after)}` : ""}`),
  sendText: (id: string, text: string, replyTo?: string | null) => api<{ message: ChatMessage | null }>(`${B}/threads/${u(id)}/messages`, { method: "POST", body: { text, replyTo: replyTo ?? null } }),
  sendImage: (id: string, uri: string, replyTo?: string | null, viewOnce = false) =>
    upload<{ message: ChatMessage | null }>(`${B}/threads/${u(id)}/messages`, { kind: "image", ...(viewOnce ? { viewOnce: "1" } : {}), ...(replyTo ? { replyTo } : {}) }, { file: { uri, name: "photo.jpg", type: "image/jpeg" } }),
  sendVideo: (id: string, uri: string, durationMs: number, replyTo?: string | null, viewOnce = false) =>
    upload<{ message: ChatMessage | null }>(`${B}/threads/${u(id)}/messages`, { kind: "video", durationMs: String(Math.round(durationMs)), ...(viewOnce ? { viewOnce: "1" } : {}), ...(replyTo ? { replyTo } : {}) }, { file: { uri, name: "video.mp4", type: "video/mp4" } }),
  sendVoice: (id: string, uri: string, durationMs: number, replyTo?: string | null, wave?: string) =>
    upload<{ message: ChatMessage | null }>(`${B}/threads/${u(id)}/messages`, { kind: "voice", durationMs: String(Math.round(durationMs)), ...(wave ? { wave } : {}), ...(replyTo ? { replyTo } : {}) }, { file: { uri, name: "voice.m4a", type: "audio/mp4" } }),
  share: (id: string, card: ShareCard, text?: string) => api<{ message: ChatMessage | null }>(`${B}/threads/${u(id)}/messages`, { method: "POST", body: { share: card, text: text ?? "" } }),
  edit: (messageId: string, text: string) => api<{ message: ChatMessage | null }>(`${B}/messages/${u(messageId)}`, { method: "PATCH", body: { text } }),
  hide: (messageId: string) => api<{ ok: boolean }>(`${B}/messages/${u(messageId)}/hide`, { method: "POST", body: {} }),
  notify: (after: string) => api<{ latest: string; items: { id: string; threadId: string; from: string; group: string | null }[] }>(`${B}/notify?after=${u(after)}`),
  typing: (id: string) => api<{ ok: boolean }>(`${B}/threads/${u(id)}/typing`, { method: "POST", body: {} }),
  read: (id: string, upTo: string) => api<{ ok: boolean }>(`${B}/threads/${u(id)}/read`, { method: "POST", body: { upTo } }),
  request: (id: string, action: "accept" | "decline") => api<{ ok: boolean }>(`${B}/threads/${u(id)}/request`, { method: "POST", body: { action } }),
  react: (messageId: string, kind: Reaction | null) => api<{ ok: boolean }>(`${B}/messages/${u(messageId)}/react`, { method: "POST", body: { kind } }),
  remove: (messageId: string) => api<{ ok: boolean }>(`${B}/messages/${u(messageId)}`, { method: "DELETE" }),
  report: (id: string, category: string, reason: string, messageId?: string | null) => api<{ reported: boolean }>(`${B}/threads/${u(id)}/report`, { method: "POST", body: { category, reason, messageId: messageId ?? null } }),
  update: (id: string, body: { name?: string; quiet?: boolean }) => api<{ ok: boolean }>(`${B}/threads/${u(id)}`, { method: "PATCH", body }),
  addMember: (id: string, username: string) => api<{ ok: boolean }>(`${B}/threads/${u(id)}/members`, { method: "POST", body: { username } }),
  member: (id: string, username: string, action: "remove" | "mute" | "unmute" | "admin" | "member") => api<{ ok: boolean }>(`${B}/threads/${u(id)}/members`, { method: "PATCH", body: { username, action } }),
  leave: (id: string) => api<{ ok: boolean }>(`${B}/threads/${u(id)}/leave`, { method: "POST", body: {} }),
  invite: (id: string, action: "reset" | "off") => api<{ code: string | null }>(`${B}/threads/${u(id)}/invite`, { method: "POST", body: { action } }),
  photo: (id: string, uri: string) => upload<{ ok: boolean }>(`${B}/threads/${u(id)}/photo`, {}, { file: { uri, name: "group.jpg", type: "image/jpeg" } }),
  search: (q: string) => api<{ results: SearchHit[] }>(`${B}/search?q=${u(q)}`),
  prefs: () => api<Prefs>(`${B}/prefs`),
  setPrefs: (p: Partial<Prefs>) => api<Prefs>(`${B}/prefs`, { method: "POST", body: p }),
};

/** opens a view-once photo or video exactly once: the bytes go to a cache file that the caller deletes after viewing */
export async function openViewOnce(messageId: string): Promise<{ uri: string; video: boolean; done: () => void }> {
  const token = await getToken();
  const res = await fetch(`${SITE}${B}/messages/${u(messageId)}/open`, { method: "POST", headers: { "x-qmc-app": Platform.OS, ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!res.ok) { const d = (await res.json().catch(() => ({}))) as { error?: string }; throw new ApiError(res.status, d.error ?? `http_${res.status}`); }
  const video = (res.headers.get("content-type") ?? "").startsWith("video/");
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(new Blob([bytes], { type: video ? "video/mp4" : "image/jpeg" }));
    return { uri: url, video, done: () => URL.revokeObjectURL(url) };
  }
  const f = new File(Paths.cache, `once-${messageId}-${Date.now()}.${video ? "mp4" : "jpg"}`);
  f.create({ overwrite: true });
  f.write(bytes);
  return { uri: f.uri, video, done: () => { try { if (f.exists) f.delete(); } catch { /* gone */ } } };
}

/** the shareable invite link of a group */
export const inviteLink = (site: string, code: string) => `${site}/messages?join=${code}`;

/** the screen that sends a card (verse, surah, course, carousel, profile, post) into a chat */
export const shareHref = (c: ShareCard) =>
  `/talents/messages/share?type=${u(c.type)}&ref=${u(c.ref)}&title=${u(c.title)}&subtitle=${u(c.subtitle)}&url=${u(c.url)}`;
