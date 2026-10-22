// Writes src/lib/data/verse-words.json: the number of words of every verse of the Quran (6236 numbers, one row per
// surah), counted from Quran.com's word-by-word data (words of type "word"; the verse-end marker is not a word). Only
// the counts are stored, never the text (BLUEPRINT §4). Read by lib/verseTime.ts (time estimate per verse); the app gets
// the same file through mobile/scripts/sync-web.mjs.
// Usage: node scripts/gen-verse-words.mjs
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const UPSTREAM = process.env.QURAN_UPSTREAM ?? "https://api.quran.com/api/v4";
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "data", "verse-words.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// verses per surah in the Hafs count (as lib/counts.ts VERSE_COUNTS): every surah must come back complete
const VERSES = [7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6];

async function getJSON(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch {}
    await sleep(1500 * (i + 1));
  }
  throw new Error(`FAILED ${url}`);
}

const rows = [];
for (let s = 1; s <= 114; s++) {
  const counts = [];
  for (let page = 1; page; ) {
    const j = await getJSON(`${UPSTREAM}/verses/by_chapter/${s}?words=true&word_fields=char_type_name&per_page=300&page=${page}`);
    for (const v of j.verses ?? []) {
      if (v.verse_key !== `${s}:${v.verse_number}` || v.verse_number !== counts.length + 1) throw new Error(`unexpected verse ${v.verse_key}`);
      const n = (v.words ?? []).filter((w) => w.char_type_name === "word").length;
      if (!n) throw new Error(`no words for ${v.verse_key}`);
      counts.push(n);
    }
    page = j.pagination?.next_page ?? null;
    await sleep(150);
  }
  if (counts.length !== VERSES[s - 1]) throw new Error(`surah ${s}: ${counts.length} verses, expected ${VERSES[s - 1]}`);
  rows.push(counts);
}

const total = rows.reduce((a, r) => a + r.length, 0);
if (total !== 6236) throw new Error(`${total} verses, expected 6236`);
writeFileSync(out, `[\n${rows.map((r) => JSON.stringify(r)).join(",\n")}\n]\n`);
console.log(`verse-words.json: ${total} verses, ${rows.flat().reduce((a, b) => a + b, 0)} words`);
