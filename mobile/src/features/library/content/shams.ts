// Copied verbatim from the website (scratch script extract-shams.mjs) – keep in sync, do not edit by hand:
// W and CUES from src/app/[locale]/(app)/shams/page.tsx, GOALS and PER_DAY from src/components/ShamsPlanner.tsx.
// (The website shows the Arabic step names STEP_AR only from tablet width on, so the phone app leaves them out.)
// Al-Fatihah 1:2 – used to show the four stages of one verse
export const W = ["ٱلْحَمْدُ", "لِلَّهِ", "رَبِّ", "ٱلْعَٰلَمِينَ"];
export const CUES = ["ٱلْحَـ", "لِـ", "رَ", "ٱلْعَـ"];
// How long a goal takes at a given daily amount (new verses per day; reviews come on top)
export const GOALS = [
  { id: "fatiha", verses: 7 },
  { id: "juzamma", verses: 564 },
  { id: "mulk", verses: 30 },
  { id: "baqarah", verses: 286 },
  { id: "quran", verses: 6236 },
] as const;
export const PER_DAY = [1, 3, 5, 10, 20];
