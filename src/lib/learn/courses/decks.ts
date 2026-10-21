// Website addition: the deck model of mobile/src/features/courses/Vocab.tsx (pure part) so server routes can check
// deck ids and client screens build the theme decks the same way. Keep in step with the app screen.
import { VOCAB_DECKS, type Word } from "@/lib/vocab";

export const ALL_WORDS: Word[] = VOCAB_DECKS.flatMap((d) => d.words);
export const TYPES = ["verbs", "names", "nouns", "adjectives", "particles", "pronouns"] as const;
export type ThemeType = (typeof TYPES)[number];
export const TYPE_OF: Record<ThemeType, Word["type"][]> = { verbs: ["verb"], names: ["name"], nouns: ["noun"], adjectives: ["adjective"], particles: ["particle"], pronouns: ["pronoun"] };
export const ROOTS: [string, Word[]][] = (() => {
  const m = new Map<string, Word[]>();
  for (const w of ALL_WORDS) if (w.root) m.set(w.root, [...(m.get(w.root) ?? []), w]);
  return [...m.entries()].filter(([, ws]) => ws.length >= 3).sort((a, b) => b[1].length - a[1].length).slice(0, 24);
})();
export const typeWords = (k: ThemeType) => ALL_WORDS.filter((w) => TYPE_OF[k].includes(w.type));
export const rootHref = (r: string) => `/vocab-decks/root-${encodeURIComponent(r)}`;

export type DeckRef = { kind: "surah"; surah: number } | { kind: "type"; type: ThemeType } | { kind: "root"; root: string };

function decodeFully(s: string): string {
  let cur = s;
  for (let i = 0; i < 3; i++) { try { const d = decodeURIComponent(cur); if (d === cur) break; cur = d; } catch { break; } }
  return cur;
}
/** "surah-36" | "type-verbs" | "root-<root, URL-encoded or not>" -> deck, or null for unknown ids */
export function parseDeck(raw: string): DeckRef | null {
  const id = decodeFully(raw);
  if (id.startsWith("surah-")) { const n = Number(id.slice(6)); return Number.isInteger(n) && n >= 1 && n <= 114 ? { kind: "surah", surah: n } : null; }
  if (id.startsWith("type-")) { const k = id.slice(5) as ThemeType; return (TYPES as readonly string[]).includes(k) ? { kind: "type", type: k } : null; }
  if (id.startsWith("root-")) { const r = id.slice(5); return ALL_WORDS.some((w) => w.root === r) ? { kind: "root", root: r } : null; }
  return null;
}
