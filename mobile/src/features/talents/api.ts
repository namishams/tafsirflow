import type { Moment } from "@/features/sijill/api";
import { Platform } from "react-native";
import { api, ApiError, SITE } from "@/lib/api";
import { getToken } from "@/lib/storage";
import type { Badge } from "./badges";

// Client for the Quran Talents endpoints (website src/app/api/community/*). Usernames only, never ids of people.
export type Level = "talent" | "rising" | "master" | "sheikh";
export const LEVELS: Level[] = ["talent", "rising", "master", "sheikh"];
export type Connection = "none" | "outgoing" | "incoming" | "connected";
export type TalentCard = { username: string; name: string; country: string | null; role: string; rewaya: string; level: Level; verified: boolean; badge?: Badge | null; pro?: boolean; sharerTier: number; followers: number; avatar?: string | null; followed?: boolean; mine?: boolean; followsMe?: boolean;
  /** bought avatar frame and the first pinned rare sticker (store, 22.10.2026) */ frame?: string | null; rare?: string | null; showcase?: string[]; showcaseItems?: { slug: string; tier: string; number: number | null }[];
  /** lists and suggestions (22.10.2026): a follow request to this private account is pending */ requested?: boolean; private?: boolean };
export type TalentProfile = TalentCard & {
  /** the one founder account (server flag) */
  founder?: boolean;
  bio: string; style: string; ijaza: boolean; public: boolean; following: number; shares: number; maqam: string; ijazahChain: string;
  progress: { treeStage: number; treeType: string; certJuz: number[]; hidden?: boolean } | null;
  mine: boolean; blocked: boolean; connection: Connection; canMessage: boolean; followed: boolean;
  requested: boolean; restricted: boolean; private: boolean; messagePolicy: "connections" | "nobody"; officialChannel: string | null;
  badges?: BadgeState;
  posts: number; likes: number; liveStory: boolean; reciterLevel?: number;
  /** false: posting is switched off on the server (achievement showcase only) */
  postingEnabled?: boolean;
  /** achievement "posts": MashaAllah total (gold hearts + "MashaAllah" reactions), count and first page of moments */
  mashaallahTotal?: number; momentCount?: number; moments?: Moment[]; momentsMore?: string | null;
  /** people the viewer follows who follow this member ("Followed by X and 3 others") */
  followedBy?: { total: number; users: { username: string; name: string; avatar: string | null }[] } | null;
  /** this member follows the viewer ("Follow back") */
  followsMe?: boolean;
  /** public profile link and its QR code (rows of 0/1) */
  shareUrl?: string; shareQr?: string[];
  /** learning goals, city, travel – what this viewer may see (owner, 21.10.2026) */
  extras?: ProfileExtras;
};
export type ProfileExtras = { goals?: string[]; city?: string; travel?: { on: boolean; city: string } };
export type Audience = "everyone" | "followers" | "me";
export type OwnExtras = { goals: string[]; city: string; travel: { on: boolean; city: string }; privacy: { goals: Audience; city: Audience; travel: Audience } };
export type Post = {
  id: string; type: "story" | "post"; verseKey: string | null; durationMs: number | null; hasVideo: boolean; waveform: number[]; caption: string;
  at: string; expiresAt: string | null; likes: number; liked: boolean; comments: number; saved: boolean; media: string | null;
  author: { username: string; name: string; verified: boolean; badge?: Badge | null; pro?: boolean; level: Level; sharerTier: number; followed?: boolean; mine?: boolean };
  status?: "pending" | "approved" | "rejected" | "removed"; rejectReason?: string;
};
export type Comment = { id: string; text: string; at: string; mine: boolean; canDelete: boolean; author?: { username: string; name: string; verified: boolean; badge?: Badge | null; pro?: boolean; level: Level; sharerTier: number; frame?: string | null; rare?: string | null } };
export type Highlight = { id: string; title: string; posts: Post[] };
export type NotificationKind = "moment_reaction" | "follow" | "follow_request" | "like" | "comment" | "post_approved" | "post_rejected" | "connect_request" | "connect_accepted" | "verified" | "verification_rejected";
export type Notification = { id: string; kind: NotificationKind; at: string; read: boolean; postId: string | null; verseKey: string | null;
  /** Sijill: the moment a reaction was given to and the preset reaction */
  moment?: { id: string; kind: import("@/features/sijill/api").MomentKind; ref: string; data: Record<string, unknown>; title: string | null }; reaction?: import("@/features/sijill/api").Reaction; actor: { username: string; name: string; verified: boolean; badge?: Badge | null; pro?: boolean; sharerTier: number } | null };
export type BadgeState = {
  badge: Badge | null;
  emerald: { ok: boolean; email: boolean; phone: boolean | null; age: boolean; profile: boolean; guidelines: boolean };
  gold: { ok: boolean; level: number; need: number };
  official: { ok: boolean; source: string | null; channel: string | null; minSubscribers: number; available: boolean };
};
export type PostingStatus = {
  ok: boolean; profile: boolean; enabled?: boolean;
  rules: { requirePro: boolean; minReciterLevel: number; requireVerified: boolean; minAge: number; minSeconds: number; maxSeconds: number; storyHours: number; postsPerDay: number };
  age: { ok: boolean }; pro: { ok: boolean; required: boolean }; level: { ok: boolean; have: number; need: number };
  verified: { ok: boolean; required: boolean; badge: Badge | null; application: "none" | "pending" | "approved" | "rejected"; reason?: string };
};
export type ConnItem = TalentCard & { note: string; since: string };
export type Conversation = { id: string; username: string; name: string; level: Level; verified: boolean; badge?: Badge | null; pro?: boolean; sharerTier: number; last: { text: string; mine: boolean } | null; at: string; unread: number };
export type Message = { id: string; mine: boolean; text: string | null; removed: boolean; at: string };
export type ReportCategory = "spam" | "harassment" | "inappropriate" | "impersonation" | "minor_safety" | "other";
export const REPORT_CATEGORIES: ReportCategory[] = ["spam", "harassment", "inappropriate", "impersonation", "minor_safety", "other"];
export type AgeStatus = { known: boolean; confirmed: boolean; community: boolean; interact: boolean };
export type MeInfo = { profile: (TalentProfile & { username: string }) | null; talent?: { ageKnown: boolean; canInteract: boolean; admin: boolean } };

const u = encodeURIComponent;
export const T = {
  me: () => api<MeInfo>("/api/community/me"),
  age: () => api<AgeStatus>("/api/community/age"),
  confirmAge: (birthYear: number | undefined) => api<AgeStatus>("/api/community/age", { method: "POST", body: { birthYear, confirm: true } }),
  talents: (q: Record<string, string>) => api<{ talents: TalentCard[]; next: string | null }>(`/api/community/talents?${new URLSearchParams(q).toString()}`),
  profile: (name: string, locale?: string) => api<{ profile: TalentProfile }>(`/api/community/talents/${u(name)}${locale ? `?locale=${u(locale)}` : ""}`),
  follows: (name: string, kind: "followers" | "following", cursor?: string) =>
    api<{ list: TalentCard[]; next: string | null }>(`/api/community/talents/${u(name)}/${kind}${cursor ? `?cursor=${u(cursor)}` : ""}`),
  follow: (name: string, on: boolean) => api<{ followed: boolean; followers: number; requested?: boolean }>(`/api/community/follow/${u(name)}`, { method: on ? "POST" : "DELETE" }),
  block: (name: string, on: boolean) => api(`/api/community/block/${u(name)}`, { method: on ? "POST" : "DELETE" }),
  reportProfile: (name: string, category: ReportCategory, reason: string) => api(`/api/community/report/${u(name)}`, { method: "POST", body: { category, reason } }),
  reportMessage: (id: string, category: ReportCategory, reason: string) => api(`/api/community/messages/${u(id)}/report`, { method: "POST", body: { category, reason } }),
  connections: () => api<{ incoming: ConnItem[]; outgoing: ConnItem[]; connected: ConnItem[] }>("/api/community/connections"),
  connect: (name: string, note = "") => api<{ connection: Connection }>(`/api/community/connections/${u(name)}`, { method: "POST", body: { note } }),
  answer: (name: string, action: "accept" | "decline") => api<{ connection: Connection }>(`/api/community/connections/${u(name)}`, { method: "PATCH", body: { action } }),
  disconnect: (name: string) => api<{ connection: Connection }>(`/api/community/connections/${u(name)}`, { method: "DELETE" }),
  conversations: () => api<{ conversations: Conversation[]; unread: number }>("/api/community/conversations"),
  openConversation: (name: string) => api<{ id: string }>("/api/community/conversations", { method: "POST", body: { username: name } }),
  messages: (id: string, before?: string) =>
    api<{ with: { username: string; name: string; level: Level; verified: boolean; badge?: Badge | null }; canSend: boolean; messages: Message[]; more: string | null }>(`/api/community/conversations/${u(id)}${before ? `?before=${u(before)}` : ""}`),
  send: (id: string, text: string) => api<{ message: Message }>(`/api/community/conversations/${u(id)}`, { method: "POST", body: { text } }),
  progress: (body: { show: boolean; treeStage: number; treeType: string; certJuz: number[] }) => api("/api/community/progress", { method: "POST", body }),
  badges: () => api<BadgeState>("/api/community/badges"),
  officialLink: (locale: string) => api<{ url: string }>("/api/community/official", { method: "POST", body: { target: "app", locale } }),
  posting: () => api<PostingStatus>("/api/community/posting"),
  reportLevel: (reciterLevel: number) => api<PostingStatus>("/api/community/posting", { method: "POST", body: { reciterLevel } }),
  verification: () => api<{ application: { status: string; reason: string } | null }>("/api/community/verification"),
  posts: (name: string, type?: "post" | "story", cursor?: string) =>
    api<{ posts: Post[]; next: string | null; restricted?: boolean }>(`/api/community/posts?u=${u(name)}${type ? `&type=${type}` : ""}${cursor ? `&cursor=${u(cursor)}` : ""}`),
  reels: (cursor?: string) => api<{ posts: Post[]; next: string | null }>(`/api/community/posts/reels${cursor ? `?cursor=${u(cursor)}` : ""}`),
  post: (id: string) => api<{ post: Post }>(`/api/community/posts/${u(id)}`),
  deletePost: (id: string) => api(`/api/community/posts/${u(id)}`, { method: "DELETE" }),
  like: (id: string, on: boolean) => api<{ liked: boolean; likes: number }>(`/api/community/posts/${u(id)}/like`, { method: on ? "POST" : "DELETE" }),
  save: (id: string, on: boolean) => api<{ saved: boolean }>(`/api/community/posts/${u(id)}/save`, { method: on ? "POST" : "DELETE" }),
  reportPost: (id: string, category: ReportCategory, reason: string) => api(`/api/community/posts/${u(id)}/report`, { method: "POST", body: { category, reason } }),
  comments: (id: string, before?: string) => api<{ comments: Comment[]; more: string | null }>(`/api/community/posts/${u(id)}/comments${before ? `?before=${u(before)}` : ""}`),
  comment: (id: string, text: string) => api<{ comment: Comment }>(`/api/community/posts/${u(id)}/comments`, { method: "POST", body: { text } }),
  deleteComment: (id: string) => api(`/api/community/comments/${u(id)}`, { method: "DELETE" }),
  reportComment: (id: string, category: ReportCategory, reason: string) => api(`/api/community/comments/${u(id)}/report`, { method: "POST", body: { category, reason } }),
  saved: () => api<{ posts: Post[] }>("/api/community/saved"),
  highlights: (name: string) => api<{ highlights: Highlight[]; restricted?: boolean }>(`/api/community/talents/${u(name)}/highlights`),
  createHighlight: (title: string, postIds: string[]) => api<{ id: string }>("/api/community/highlights", { method: "POST", body: { title, postIds } }),
  deleteHighlight: (id: string) => api(`/api/community/highlights/${u(id)}`, { method: "DELETE" }),
  notifications: (locale?: string) => api<{ notifications: Notification[]; unread: number }>(`/api/community/notifications${locale ? `?locale=${u(locale)}` : ""}`),
  readNotifications: () => api("/api/community/notifications", { method: "POST", body: {} }),
  suggested: () => api<{ talents: TalentCard[] }>("/api/community/suggested"),
  blocks: () => api<{ blocked: TalentCard[] }>("/api/community/blocks"),
  followRequests: () => api<{ requests: TalentCard[] }>("/api/community/follow-requests"),
  answerFollow: (name: string, action: "accept" | "decline") => api(`/api/community/follow-requests/${u(name)}`, { method: "POST", body: { action } }),
  deleteAvatar: () => api<{ avatar: null }>("/api/community/avatar", { method: "DELETE" }),
  redeem: (code: string) => api<{ level: Level; verified: boolean }>("/api/community/invite", { method: "POST", body: { code } }),
  /** own profile extras (goals, city, travel and who sees them) */
  extras: () => api<{ extras: OwnExtras }>("/api/community/profile-extras"),
  saveExtras: (body: Partial<OwnExtras>) => api<{ extras: OwnExtras }>("/api/community/profile-extras", { method: "PUT", body }),
  /** remove a member from the own followers (Instagram "Remove"; the member is not notified) */
  removeFollower: (name: string) => api<{ ok: boolean; followers: number }>(`/api/community/followers/${u(name)}`, { method: "DELETE" }),
  /** account search as you type: exact @username, badges, mutual follows, then followers first */
  search: (q: string) => api<{ talents: SearchCard[] }>(`/api/community/search?q=${u(q)}`).catch((e: unknown) => {
    // a server without the search endpoint yet: the Discover list filtered by name or @username
    if (!(e instanceof ApiError) || e.status !== 404) throw e;
    return T.talents({ q }).then((d) => ({ talents: d.talents.map((x) => ({ ...x, followed: !!x.followed, followsMe: !!x.followsMe, requested: false })) }));
  }),
};
export type SearchCard = TalentCard & { followed: boolean; followsMe: boolean; requested: boolean };

// admin (moderation) – the server checks the role on every call
export type AdminReport = { id: string; reason: string; category: string; type: string; status: string; at: string; reported: string | null; reportedName: string | null; suspended: boolean; reporter: string | null; total: number; message: { text: string | null; removed: boolean } | null; post: { id: string; verseKey: string | null; status: string; media: string | null } | null };
export type AdminMember = TalentCard & { suspended: boolean; public: boolean; ijazahChain: string; official: boolean; officialChannel: string | null; adminVerified: boolean };
export type AdminInvite = { id: string; hint: string; note: string; level: Level; maxUses: number; uses: number; createdAt: string; expiresAt: string | null; revoked: boolean; usedBy: string[] };
export type AdminPost = { id: string; type: "story" | "post"; mediaUrl: string | null; mediaKind: string | null; hasVideo: boolean; durationMs: number | null; caption: string; verseKey: string | null; wordCheck: number | null; at: string; author: string | null; authorVerified: boolean };
export type AdminVerification = { id: string; realName: string; country: string | null; rewaya: string; teacher: string; ijazahInfo: string; at: string; sample: string | null; username: string; name: string; level: Level; reciterLevel: number; ijazahChain: string };
export const A = {
  reports: () => api<{ reports: AdminReport[] }>("/api/community/admin/reports"),
  act: (id: string, action: "dismiss" | "resolve" | "remove_message" | "remove_post" | "suspend") => api("/api/community/admin/reports", { method: "POST", body: { id, action } }),
  members: (q: string) => api<{ members: AdminMember[] }>(`/api/community/admin/members?q=${u(q)}`),
  setMember: (body: { username: string; verified?: boolean; level?: Level; suspended?: boolean; official?: boolean; badgeOverride?: "none" | null }) => api("/api/community/admin/members", { method: "POST", body }),
  invites: () => api<{ invites: AdminInvite[] }>("/api/community/admin/invites"),
  createInvite: (body: { level: Level; maxUses: number; days: number; note: string }) => api<{ id: string; code: string }>("/api/community/admin/invites", { method: "POST", body }),
  revokeInvite: (id: string) => api(`/api/community/admin/invites?id=${u(id)}`, { method: "DELETE" }),
  posts: () => api<{ posts: AdminPost[] }>("/api/community/admin/posts"),
  review: (id: string, action: "approve" | "reject") => api("/api/community/admin/posts", { method: "POST", body: { id, action } }),
  verifications: () => api<{ applications: AdminVerification[] }>("/api/community/admin/verifications"),
  decide: (id: string, action: "approve" | "reject", reason = "") => api("/api/community/admin/verifications", { method: "POST", body: { id, action, reason } }),
};

export const errCode = (e: unknown) => (e instanceof ApiError ? e.code : "generic");

/** a media URL of the API (clip, sample, avatar) with the sign-in header, for players and images */
export async function mediaSource(path: string): Promise<{ uri: string; headers?: Record<string, string> }> {
  const token = await getToken();
  return { uri: `${SITE}${path}`, ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}) };
}

/** multipart upload (clips, verification sample, avatar); throws ApiError like api() */
export async function upload<T>(path: string, fields: Record<string, string>, files: Record<string, { uri: string; name: string; type: string }>): Promise<T> {
  const token = await getToken();
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  for (const [k, f] of Object.entries(files)) {
    if (Platform.OS === "web") { const blob = await (await fetch(f.uri)).blob(); form.append(k, blob, f.name); }
    else form.append(k, f as unknown as Blob); // React Native's FormData takes { uri, name, type }
  }
  const res = await fetch(`${SITE}${path}`, { method: "POST", body: form, headers: { Accept: "application/json", "x-qmc-app": Platform.OS, ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!res.ok) {
    const d = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, d.error ?? `http_${res.status}`);
  }
  return (await res.json()) as T;
}

// Star profiles (owner 22.10.2026, website src/app/api/community/stars and admin/stars): the public state of an
// unclaimed star profile, the takeover request and, for admins, one-click decisions and personal invite links.
export type StarState = { username: string; name?: string; reciter: string | null; claimed: boolean; invited: boolean; pending: boolean };
export type AdminStarAssignment = { id: string; star: string | null; badge?: string; via: string; at: string; undoneAt: string | null; previous: string | null; username: string | null };
export type AdminStarClaim = { id: string; star: string; starName: string; role: "self" | "team"; channel: string; message: string; invited: boolean; at: string; username: string | null; name: string | null };
export type AdminStarRow = { username: string; name: string; country: string | null; claimedBy: string | null };
export const STAR_API = {
  state: (username: string, invite?: string) => api<StarState>(`/api/community/stars/${encodeURIComponent(username)}${invite ? `?invite=${encodeURIComponent(invite)}` : ""}`),
  claim: (username: string, body: { role: "self" | "team"; channel: string; message: string; invite?: string }) => api<{ ok: true }>(`/api/community/stars/${encodeURIComponent(username)}`, { method: "POST", body }),
  accept: (username: string, invite: string) => api<{ ok: true; username: string }>(`/api/community/stars/${encodeURIComponent(username)}/accept`, { method: "POST", body: { invite } }),
  adminList: () => api<{ claims: AdminStarClaim[]; stars: AdminStarRow[]; assignments: AdminStarAssignment[] }>("/api/community/admin/stars"),
  adminAssign: (username: string, email: string, badge: "star" | "personality" = "star") => api<{ ok: true }>("/api/community/admin/stars", { method: "POST", body: { assign: username, email, badge } }),
  adminUndo: (id: string) => api<{ ok: true }>("/api/community/admin/stars", { method: "POST", body: { undo: id } }),
  adminDecide: (id: string, action: "approve" | "reject", reason = "") => api<{ ok: true }>("/api/community/admin/stars", { method: "POST", body: { id, action, reason } }),
  adminInvite: (username: string, locale: string) => api<{ link: string; days: number }>("/api/community/admin/stars", { method: "POST", body: { invite: username, locale } }),
};
