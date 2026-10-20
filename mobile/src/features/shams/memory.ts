import type { Verse } from "@/lib/quran";

// Copied verbatim from the website's src/components/Player.tsx (memory cues of the Shams Method), so the app gives
// exactly the same first-letter cues and memory hooks as quranmasterclass.com.
// First letter of an Arabic word (with its vowel marks) as a memory cue; a tatweel keeps the joined initial form
const NON_JOINING = "اأإآٱءدذرزوؤة";
const MARKS = "[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]*";
export function firstLetter(word: string) {
  // the article al- carries no information: show it together with the first letter of the word itself
  const art = word.match(new RegExp(`^[ٱا]${MARKS}ل${MARKS}`, "u"));
  const rest = art ? word.slice(art[0].length) : word;
  const m = rest.match(new RegExp(`^.${MARKS}`, "u"));
  const g = m ? m[0] : rest.slice(0, 1);
  const cue = (art ? art[0] : "") + g;
  return NON_JOINING.includes(g[0]) || cue.length >= word.length ? cue : `${cue}ـ`;
}

// small deterministic hash for the random hide mode
export const hashOf = (x: string) => { let h = 2166136261; for (let i = 0; i < x.length; i++) h = Math.imul(h ^ x.charCodeAt(i), 16777619); return h >>> 0; };

// Memory hooks (Eselsbrücken) for a verse, computed from its words
export const bare = (w: string) => w.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "");
export function hooks(v: Verse, next?: Verse) {
  const ws = v.words.filter((w) => w.char_type_name === "word");
  const anchor = [...ws].sort((a, b) => bare(b.text_uthmani).length - bare(a.text_uthmani).length)[0];
  const end = (x: Verse) => { const w = x.words.filter((y) => y.char_type_name === "word").at(-1); return w ? bare(w.text_uthmani).slice(-2) : ""; };
  return {
    anchor,
    acrostic: ws.map((w) => firstLetter(w.text_uthmani)).join(" "),
    bridge: next ? { from: ws.at(-1), to: next.words.filter((w) => w.char_type_name === "word")[0] } : null,
    rhyme: end(v),
    rhymeWord: ws.at(-1),
  };
}
