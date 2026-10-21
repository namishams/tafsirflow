// Design tokens of the feed, ported from mobile/src/lib/theme.ts (stage, TONES, GOLD_RING, goldButton, HEART) and
// mobile/src/features/feed/art.tsx (toneOf): the dark emerald stage with gold, tinted per surah / post.
import type { WebCard, WebTopic } from "@/lib/feedWeb/types";

export const STAGE = {
  bg: "rgb(8,38,29)", deep: "rgb(5,28,21)", glow: "rgba(18,74,56,0.9)",
  gold: "rgb(214,180,108)", goldSoft: "rgba(214,180,108,0.35)", cream: "#f3e2b6",
  textSoft: "rgba(255,255,255,0.75)", textMuted: "rgba(255,255,255,0.6)", hair: "rgba(255,255,255,0.15)",
};
export const GOLD_BUTTON = { from: "#dcc48c", to: "#c6a65e", text: "rgb(8,38,29)" };
export const GOLD_RING = "linear-gradient(135deg,#f3e2b6,#c6a65e 55%,#8a6a2c)";
export const GOLD_RING_FRESH = "linear-gradient(135deg,#f6e7bf,#d6b46c 35%,#8a6a2c 70%,#e9cf99)";
/** a liked heart in deep gold (noble, not rose) */
export const HEART = "#b8913f";
export const TONES: [string, string][] = [
  ["#0c4a37", "#06221a"], ["#3a2f12", "#14110a"], ["#0f3f3a", "#061c19"], ["#13392b", "#071a13"],
  ["#33290f", "#120e06"], ["#24381c", "#0d160a"], ["#0b3a30", "#041814"], ["#1d4434", "#0a1d16"],
];

const hash = (s: string) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
/** one tint per surah ("2:255" and "2:286" share it) or per story group / post */
export function toneOf(key: string): [string, string] {
  const base = key.includes(":") && /^\d/.test(key) ? key.split(":")[0] : key;
  const h = hash(base);
  return h % 4 === 0 ? [STAGE.bg, STAGE.deep] : TONES[h % TONES.length];
}
export const toneGradient = (t: [string, string], angle = 160) => `linear-gradient(${angle}deg, ${t[0]}, ${t[1]})`;

/** the share-design seed of a card (a verse keeps its surah's design, as in the app) */
export const seedOf = (c: WebCard): string => (c.kind === "verse" || c.kind === "word") && c.verse ? c.verse.key : c.kind === "hadith" ? `hadith:${c.source}` : c.kind === "name" ? `name:${c.title}` : c.id;

/** all topics of the chips; "stories" is the story-group stream of the app (not in the server corpus) */
export const CHIP_ORDER: ("all" | WebTopic)[] = ["all", "verses", "tafsir", "hadith", "duas", "prayer", "seerah", "quran", "holy", "names", "scholars", "history", "art"];

/** a number as in the page language, Latin digits (the site shows Latin digits everywhere) */
export const fmtN = (n: number, locale: string) => new Intl.NumberFormat(locale, { numberingSystem: "latn" }).format(n);
export const toArDigits = (n: string) => n.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
export const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(" ", n) > 0 ? s.lastIndexOf(" ", n) : n)} …`);
