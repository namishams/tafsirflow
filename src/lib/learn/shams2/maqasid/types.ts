// mirrors mobile/src/features/shams2/maqasid/types.ts (copied for the website; keep in step with the app)
import type { Review, SourceRef } from "../sources";

// Maqāṣid al-Sūra and tadabbur: what each surah wants to teach, in our own words (never Qurʾān text – verse keys and
// ranges only). Drawn from the classical works named in `src`; every card is a draft until a scholar has reviewed it.
export type L = { de: string; en: string; ar: string };
export type LL = { de: string[]; en: string[]; ar: string[] };

export type Section = {
  from: number; to: number; // verse range inside the surah
  title: L;
  lessons?: LL; // 2–4 "what this teaches us" bullets (detailed surahs)
  takeaway?: L; // one practical takeaway
  questions?: LL; // tadabbur questions
};

export type Maqasid = {
  s: number; // surah number
  theme: L; // central theme (maqṣad)
  context: L; // Meccan/Medinan setting and period in a sentence or two
  asbab?: L; // asbāb al-nuzūl, only where well known, with the narration's source named in the text
  connects: L; // link to the surah before and after (munāsaba)
  lessons: LL; // 3–5 key lessons of the surah
  questions?: LL; // tadabbur questions for the whole surah
  sections: Section[]; // structure by verse ranges (detailed surahs: with lessons, takeaway, questions)
  src: SourceRef[];
  review: Review;
};
