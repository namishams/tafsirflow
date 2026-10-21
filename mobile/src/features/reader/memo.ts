// The reader's memorising modes, shared by the active verse card, the whole-surah bar and the focus mode.
// Read · Practise (levels 1–5) · Test · Listen & repeat · Random check. Kids: only Read and Listen & repeat.
// The cover itself is still the website's numeric "hide" (0 none, 1 half, 2 all, 3 first letters, 4 random, 5 soft, 6 test).
export type Tool = "read" | "practice" | "test" | "listen" | "check";
export type Level = 1 | 2 | 3 | 4 | 5;
export type Memo = { tool: Tool; level: Level; all: boolean };
export const MEMO: Memo = { tool: "read", level: 1, all: false };

/** practise levels as a progression: 1 soft (blur), 2 first letters, 3 half, 4 random gaps, 5 hard */
export const LEVEL_HIDE: Record<Level, 1 | 2 | 3 | 4 | 5> = { 1: 5, 2: 3, 3: 1, 4: 4, 5: 2 };
export const LEVELS: Level[] = [1, 2, 3, 4, 5];
export const TOOLS: Tool[] = ["read", "practice", "test", "listen", "check"];
export const KIDS_TOOLS: Tool[] = ["read", "listen"];

export function levelOfHide(h: number): Level {
  const e = (Object.entries(LEVEL_HIDE) as [string, number][]).find(([, v]) => v === h);
  return e ? (Number(e[0]) as Level) : 1;
}

/** the cover the active verse gets in a mode */
export function hideOf(m: Memo, kids: boolean): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const tool = kids && !KIDS_TOOLS.includes(m.tool) ? "read" : m.tool;
  if (tool === "practice") return LEVEL_HIDE[m.level];
  if (tool === "test") return 6;
  if (tool === "check") return 2;
  return 0;
}

/** the cover of the quiet cards: only practise / test with "cover every verse" */
export function drillOf(m: Memo, kids: boolean): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  if (kids || !m.all) return 0;
  return m.tool === "practice" ? LEVEL_HIDE[m.level] : m.tool === "test" ? 6 : 0;
}

/** a saved mode, also from the old whole-surah "drill" value of qmc.reader */
export function readMemo(saved: Partial<Memo> | undefined, oldDrill: number | undefined): Memo {
  if (saved && typeof saved === "object" && saved.tool && TOOLS.includes(saved.tool)) {
    const level = LEVELS.includes(saved.level as Level) ? (saved.level as Level) : 1;
    return { tool: saved.tool, level, all: !!saved.all };
  }
  if (oldDrill && oldDrill > 0) return oldDrill === 6 ? { tool: "test", level: 1, all: true } : { tool: "practice", level: levelOfHide(oldDrill), all: true };
  return MEMO;
}

/** the score of a word-by-word test as a spaced-repetition rating */
export function ratingOfScore(pct: number): "again" | "good" | "easy" {
  return pct >= 100 ? "easy" : pct >= 70 ? "good" : "again";
}
