// Copied verbatim from the website (scratch script extract-shams.mjs) – keep in sync, do not edit by hand:
// GOALS and PER_DAY from src/components/ShamsPlanner.tsx.
// (The website shows the Arabic step names STEP_AR only from tablet width on, so the phone app leaves them out.)
// The demo verse (1:2) is no longer typed here: its words come from the Quran API and the first-letter cues are derived
// from them (features/library/shamsSources.tsx, BLUEPRINT §4).
// How long a goal takes at a given daily amount (new verses per day; reviews come on top). `surahs`: first and last surah
// of the goal, for the time per new verse (estimated from the length of its verses, web/verseTime.ts)
export const GOALS = [
  { id: "fatiha", verses: 7, surahs: [1, 1] },
  { id: "juzamma", verses: 564, surahs: [78, 114] },
  { id: "mulk", verses: 30, surahs: [67, 67] },
  { id: "baqarah", verses: 286, surahs: [2, 2] },
  { id: "quran", verses: 6236, surahs: [1, 114] },
] as const;
export const PER_DAY = [1, 3, 5, 10, 20];
