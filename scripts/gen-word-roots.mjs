// Writes src/lib/data/word-roots.json: the root (jidhr) of every Quran word and how many words of the Quran come from
// that root, for step 2 of the Shams coach ("word by word", lib/learn/wordRoots.ts). Counted from the Quranic Arabic
// Corpus morphology (GPL, via quran-morphology). Built here once instead of downloading and parsing the ~6 MB file on
// every device: the roots in order of frequency (r, space-separated), their counts (c), and per surah (s)
// "verse;verse" with "word,word" = the index of the word's root in base 36 (empty = a particle without a root).
// No Quran text is stored, only the root letters. The app gets the same file through mobile/scripts/sync-web.mjs.
// Usage: node scripts/gen-word-roots.mjs
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MORPH = process.env.QURAN_MORPHOLOGY ?? "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt";
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "data", "word-roots.json");

const r = await fetch(MORPH);
if (!r.ok) throw new Error(`FAILED ${MORPH}: ${r.status}`);
const txt = await r.text();

const count = new Map();
const per = [];
const seen = new Set();
for (const line of txt.split("\n")) {
  const p = line.split("\t");
  if (p.length < 4) continue;
  const root = /ROOT:([^|]+)/.exec(p[3])?.[1];
  if (!root) continue;
  const [s, a, w] = p[0].split(":").map(Number);
  const k = `${s}:${a}:${w}`;
  if (seen.has(k) || !(s >= 1 && s <= 114 && a >= 1 && w >= 1)) continue; // words, not segments
  seen.add(k);
  count.set(root, (count.get(root) ?? 0) + 1);
  per.push([s, a, w, root]);
}
// ties in a fixed order, so the file only changes when the data does
const roots = [...count.keys()].sort((x, y) => count.get(y) - count.get(x) || (x < y ? -1 : x > y ? 1 : 0));
const ix = new Map(roots.map((x, i) => [x, i.toString(36)]));
const sur = Array.from({ length: 114 }, () => []);
for (const [s, a, w, root] of per) ((sur[s - 1][a - 1] ??= [])[w - 1] = ix.get(root));
const table = {
  r: roots.join(" "),
  c: roots.map((x) => count.get(x)),
  s: sur.map((vs) => Array.from(vs, (ws) => Array.from(ws ?? [], (x) => x ?? "").join(",")).join(";")),
};
if (roots.length < 1000 || per.length < 40000) throw new Error(`unexpected data: ${roots.length} roots, ${per.length} words`);
writeFileSync(out, `${JSON.stringify(table)}\n`);
console.log(`word-roots.json: ${roots.length} roots, ${per.length} words, ${Math.round(JSON.stringify(table).length / 1024)} KB`);
