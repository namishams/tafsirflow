// Counts and gap check of the Nahj al-Balagha content as the website serves it (src/lib/nahjContent.ts):
//   node scripts/check-nahj.mjs                          # the live site, https://quranmasterclass.com/api/nahj
//   node scripts/check-nahj.mjs https://staging.example/api/nahj
//   node scripts/check-nahj.mjs /srv/tafsirflow/content  # the content folder (or the local mobile/assets/content)
// Prints, for ar / de / en: passages ("parts") and works (distinct numbers) per sermon, letter and saying, the numbers
// that are missing, how many passages are machine-translated (machine: true), and whether the Arabic file covers the whole
// book by Subhi as-Salih's numbering (241 sermons, 79 letters, 480 sayings). It prints no text of the book. Exit code 1 when
// the Arabic file has a gap or an edition has a work that the Arabic file does not have.
import { readFile } from "node:fs/promises";
import path from "node:path";

const src = process.argv[2] ?? "https://quranmasterclass.com/api/nahj";
const load = async (f) => {
  if (/^https?:\/\//.test(src)) { const r = await fetch(`${src.replace(/\/$/, "")}/${f}`); if (!r.ok) throw new Error(`${f}: HTTP ${r.status}`); return r.json(); }
  return JSON.parse(await readFile(path.join(src, `nahj-${f}.json`), "utf8"));
};
const KINDS = ["sermon", "letter", "saying"];
const SALIH = { sermon: 241, letter: 79, saying: 480 };
let bad = 0;
const books = {};
for (const f of ["ar", "de", "en"]) books[f] = (await load(f)).items;

const works = (items) => { const m = new Map(); for (const i of items) { const k = `${i.kind}:${i.n}`; m.set(k, [...(m.get(k) ?? []), i]); } return m; };
for (const f of ["ar", "de", "en"]) {
  const items = books[f];
  console.log(`\n${f}: ${items.length} passages, ${works(items).size} works, ${items.filter((i) => i.machine).length} machine-translated passages`);
  for (const k of KINDS) {
    const of = items.filter((i) => i.kind === k), ns = new Set(of.map((i) => i.n)), max = Math.max(...ns);
    const missing = Array.from({ length: max }, (_, i) => i + 1).filter((n) => !ns.has(n));
    console.log(`  ${k.padEnd(7)} passages ${String(of.length).padStart(4)}  works ${String(ns.size).padStart(3)}  highest number ${max}  numbers without passage: ${missing.join(", ") || "none"}${f !== "ar" ? `  machine ${of.filter((i) => i.machine).length}` : ""}`);
  }
}
// the Arabic file against the Salih numbering
console.log("\nArabic against Subhi as-Salih numbering:");
for (const k of KINDS) {
  const have = new Set(books.ar.filter((i) => i.kind === k).map((i) => i.salih));
  const miss = Array.from({ length: SALIH[k] }, (_, i) => i + 1).filter((n) => !have.has(n));
  if (miss.length) bad++;
  console.log(`  ${k.padEnd(7)} ${have.size} of ${SALIH[k]} Salih numbers${miss.length ? `, missing: ${miss.join(", ")}` : ", complete"}`);
}
// every work of an edition must exist in the Arabic file (the reader shows the Arabic text of the whole work beside excerpts)
const ar = works(books.ar);
for (const f of ["de", "en"]) {
  const extra = [...works(books[f]).keys()].filter((k) => !ar.has(k));
  if (extra.length) bad++;
  console.log(`  ${f}: works without Arabic: ${extra.join(", ") || "none"}`);
  const absent = [...ar.keys()].filter((k) => !works(books[f]).has(k));
  console.log(`  ${f}: Arabic works without a ${f} passage: ${absent.join(", ") || "none"}`);
}
console.log(bad ? "\nGAPS FOUND" : "\nOK");
process.exit(bad ? 1 : 0);
