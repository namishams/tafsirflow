import { api } from "@/lib/api";
import type { TalentCard } from "@/features/talents/api";
import { useLang } from "@/i18n";
import { fillText, socialTable, type SocialKey } from "./dict";

// Client of "Together, deeper" (website src/app/api/together/social/[...path], logic in src/lib/social.ts): khatm
// groups, the live halaqa (text and presence only), the weekly recap, mutashabihat duels, teacher classes and the
// friends' milestone feed. Texts in ./dict.ts (a 1:1 copy of src/lib/socialDict.ts).
export type SocialSettings = { feed: boolean; duels: boolean; suggest: boolean; views: boolean };
export type Intention = "general" | "ramadan" | "deceased" | "sick" | "family" | "ummah";
export const INTENTIONS: Intention[] = ["general", "ramadan", "deceased", "sick", "family", "ummah"];
export type KhatmSummary = { id: string; name: string; intention: Intention; owner: boolean; completed: boolean; suspended: boolean; done: number; claimed: number; members: number; mine: number[] };
export type KhatmPart = { juz: number; state: "open" | "claimed" | "done"; mine: boolean; by: TalentCard | null };
export type Khatm = { id: string; name: string; intention: Intention; owner: boolean; code: string | null; completed: boolean; completedAt: string | null; suspended: boolean; parts: KhatmPart[]; members: TalentCard[] };
export type Present = TalentCard & { me: boolean; hand: boolean };
export type Halaqa = { live: boolean; canStart: boolean; leading?: boolean; circle: { id: string; name: string }; leader?: TalentCard | null; surah?: number; ayah?: number; present?: Present[]; myHand?: boolean };
export type Recap = { week: number; name: string; verses: number; days: number; xp: number; streak: number; surah: number | null; juz: number; circle: { name: string; rank: number; of: number } | null };
export type Duel = { id: string; fromMe: boolean; status: "open" | "declined" | "done" | "expired"; other: TalentCard; total: number; played: boolean; mine: number | null; theirs: number | null; theyPlayed: boolean; at: string; review: { key: string; answer: string | null }[] | null };
export type TargetKind = "verses" | "days" | "xp";
export type ClassSummary = { id: string; name: string; teaching: boolean; targetKind: TargetKind; target: number; members: number; suspended: boolean };
export type ClassMember = TalentCard & { me: boolean; progress: number; reached: boolean };
export type SClass = { id: string; name: string; teaching: boolean; suspended: boolean; code: string | null; targetKind: TargetKind; target: number; teacher: TalentCard | null; memberCount: number; members: ClassMember[]; posts: { id: string; body: string; at: string; review: boolean }[] };
export type FeedEvent = { id: string; kind: "surah" | "khatm" | "juz" | "class_week"; ref: string; at: string; own: boolean; mashallah: number; mine: boolean; author: TalentCard };
export type Hub = { settings: SocialSettings; khatms: KhatmSummary[]; live: { id: string; name: string }[]; duels: Duel[]; classes: { canTeach: boolean; classes: ClassSummary[] }; feed: FeedEvent[] };

const B = "/api/together/social";
const u = encodeURIComponent;
const post = <T,>(path: string, body: unknown) => api<T>(`${B}/${path}`, { method: "POST", body });
export type Suggestion = TalentCard & { reason: "circle" | "country" | "method" | "level" };
export type Network = { settings: SocialSettings; username: string | null; suggestions: Suggestion[]; incoming: number; views: number | null };
export type Skill = "tajweed" | "hifz" | "makharij" | "surah";
export type NetProfile = { own: boolean; connected: boolean; canEndorse: boolean; endorsements: { skill: Skill; ref: number; count: number; mine: boolean }[]; khatms: number; views: number | null; activity: { kind: FeedEvent["kind"]; ref: string; at: string }[] };
export const SOC = {
  network: () => api<Network>(`${B}/network`),
  profile: (username: string) => api<{ profile: NetProfile }>(`${B}/profile/${u(username)}`),
  view: (username: string) => post<{ ok: true }>(`profile/${u(username)}/view`, {}),
  endorse: (username: string, skill: Skill, on: boolean, ref?: number) => post<{ profile: NetProfile }>(`profile/${u(username)}/endorse`, { skill, ref, on }),
  hub: () => api<Hub>(`${B}/hub`),
  saveSettings: (b: Partial<SocialSettings>) => api<{ settings: SocialSettings }>(`${B}/settings`, { method: "PUT", body: b }),
  feed: () => api<{ settings: SocialSettings; events: FeedEvent[] }>(`${B}/feed`),
  react: (id: string, on: boolean) => post<{ ok: true }>(`feed/${u(id)}/react`, { on }),
  reportSurah: (surah: number) => post<{ stored: boolean }>("events", { kind: "surah", ref: surah }),
  recap: () => api<{ recap: Recap }>(`${B}/recap`),
  khatm: (id: string) => api<{ khatm: Khatm }>(`${B}/khatm/${u(id)}`),
  createKhatm: (b: { name: string; intention: Intention; circleId?: string }) => post<{ id: string }>("khatm", b),
  joinKhatm: (code: string) => post<{ id: string }>("khatm/join", { code, consent: true }),
  khatmAction: (id: string, b: { action: "claim" | "release" | "done" | "leave" | "remove" | "report"; juz?: number; username?: string; category?: string }) => post<Khatm | { ok: true } | { reported: true }>(`khatm/${u(id)}`, b),
  halaqa: (circleId: string) => api<{ halaqa: Halaqa }>(`${B}/halaqa/${u(circleId)}`),
  halaqaAction: (circleId: string, b: { action: "start" | "cursor" | "hand" | "lower" | "end"; surah?: number; ayah?: number; up?: boolean; username?: string }) => post<{ halaqa: Halaqa }>(`halaqa/${u(circleId)}`, b),
  duels: () => api<{ settings: SocialSettings; duels: Duel[] }>(`${B}/duels`),
  duel: (username: string) => post<{ id: string }>("duels", { username }),
  duelQuestions: (id: string) => api<{ questions: { show: string; options: string[] }[] }>(`${B}/duels/${u(id)}/questions`),
  duelAction: (id: string, b: { action: "answer" | "decline" | "cancel"; answers?: string[] }) => post<{ score?: number; total?: number; ok?: true }>(`duels/${u(id)}`, b),
  classes: () => api<{ canTeach: boolean; classes: ClassSummary[] }>(`${B}/classes`),
  sclass: (id: string) => api<{ class: SClass }>(`${B}/classes/${u(id)}`),
  createClass: (b: { name: string; targetKind: TargetKind; target: number }) => post<{ id: string }>("classes", b),
  joinClass: (code: string) => post<{ id: string }>("classes/join", { code, consent: true }),
  classAction: (id: string, b: { action: "post" | "unpost" | "remove" | "target" | "newCode" | "delete" | "leave" | "report"; body?: string; postId?: string; username?: string; targetKind?: TargetKind; target?: number; category?: string }) =>
    post<{ class?: SClass } & Partial<SClass>>(`classes/${u(id)}`, b),
};

export function useSx() {
  const { lang } = useLang();
  const table = socialTable(lang);
  return (k: SocialKey, vars?: Record<string, string | number>) => fillText(table[k] ?? k, vars);
}
export type { SocialKey };
