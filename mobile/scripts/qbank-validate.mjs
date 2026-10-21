// Checks the question banks of the examination centre (src/features/qbank/data/*.ts).
//   node scripts/qbank-validate.mjs                 all banks: structure, duplicates, counts per subject/stage
//   node scripts/qbank-validate.mjs data/x.ts       one bank file (path relative to src/features/qbank/)
//   add --index                                     also (re)writes data/index.ts with every bank file
//   add --verse                                     also prints every verse/word reference with the word from
//                                                   Quran.com (to check the highlighted word by eye)
// Needs Node 23.6+ (imports the .ts data files with type stripping).
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(here, "..", "src", "features", "qbank");
const args = process.argv.slice(2);
const verse = args.includes("--verse");
const files = args.filter((a) => !a.startsWith("--"));
const list = files.length ? files.map((f) => path.resolve(base, f)) : readdirSync(path.join(base, "data")).filter((f) => f.endsWith(".ts") && f !== "index.ts").map((f) => path.join(base, "data", f));

const SUBJECTS = ["tajweed", "qiraat", "ulum", "tafsir", "seerah", "prophets", "hadith", "aqidah", "fiqh", "nahw", "vocab", "history"];
const TRAD = ["ijma", "jumhur", "comparative", "hanafi", "maliki", "shafii", "hanbali", "sunni", "athari", "ashari", "maturidi"];
// verse counts of the 114 surahs (Hafs, Kufan count)
const VC = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const AR = /[؀-ۿ]/;
const INFORMAL_DE = /(^|[^\p{L}])(du|dich|dir|dein|deine|deinen|deinem|deiner|deines)(?=[^\p{L}]|$)/iu;

const errors = [], warns = [];
const all = [];
for (const f of list) {
  let mod;
  try { mod = await import(pathToFileURL(f).href); } catch (e) { errors.push(`${path.basename(f)}: cannot load (${e.message})`); continue; }
  const qs = mod.QS;
  if (!Array.isArray(qs)) { errors.push(`${path.basename(f)}: no exported array QS`); continue; }
  for (const q of qs) all.push({ q, file: path.basename(f) });
}

const ids = new Map();
const stems = new Map();
for (const { q, file } of all) {
  const at = `${file} ${q?.id ?? "?"}`;
  const e = (m) => errors.push(`${at}: ${m}`);
  if (!q || typeof q !== "object") { e("not an object"); continue; }
  if (typeof q.id !== "string" || !q.id) e("id missing");
  if (ids.has(q.id)) e(`duplicate id (also in ${ids.get(q.id)})`); else ids.set(q.id, file);
  if (!SUBJECTS.includes(q.s)) e(`subject "${q.s}"`);
  if (![1, 2, 3, 4].includes(q.g)) e(`stage ${q.g}`);
  if (![1, 2, 3, 4, 5, 6, 7].includes(q.d)) e(`difficulty ${q.d}`);
  if (!Array.isArray(q.t) || !q.t.length || q.t.some((x) => typeof x !== "string" || !/^[a-z0-9-]+$/.test(x))) e("tags (kebab-case, at least one)");
  if (typeof q.src !== "string" || q.src.length < 4) e("source missing");
  if (q.tr !== undefined && (!Array.isArray(q.tr) || q.tr.some((x) => !TRAD.includes(x)))) e(`tradition ${JSON.stringify(q.tr)}`);
  if (q.v !== undefined) {
    const m = /^(\d{1,3}):(\d{1,3})$/.exec(q.v);
    if (!m || +m[1] < 1 || +m[1] > 114 || +m[2] < 1 || +m[2] > VC[+m[1] - 1]) e(`verse key "${q.v}"`);
  }
  if (q.w !== undefined && (!Number.isInteger(q.w) || q.w < 1 || q.v === undefined)) e("word position needs a verse key and must be >= 1");
  for (const l of ["en", "de", "ar"]) {
    const x = q[l];
    if (!Array.isArray(x) || x.length !== 3) { e(`${l}: must be [stem, options, explanation]`); continue; }
    const [stem, opts, expl] = x;
    if (typeof stem !== "string" || stem.length < 8) e(`${l}: stem`);
    if (!Array.isArray(opts) || opts.length !== 4 || opts.some((o) => typeof o !== "string" || !o.trim())) e(`${l}: four options`);
    else if (new Set(opts.map((o) => o.trim().toLowerCase())).size !== 4) e(`${l}: options not distinct`);
    else if (opts.some((o) => /^(all|none|both) of the (above|these)|alle (oben )?genannten|keine der|جميع ما سبق|لا شيء مما/i.test(o))) e(`${l}: "all/none of the above" does not work with shuffled options`);
    if (typeof expl !== "string" || expl.length < 15) e(`${l}: explanation`);
    if (l === "ar" && typeof stem === "string" && !AR.test(stem)) e("ar: stem is not Arabic");
    if (l === "de" && [stem, ...(Array.isArray(opts) ? opts : []), expl].some((s) => typeof s === "string" && INFORMAL_DE.test(s))) warns.push(`${at}: de may use the informal "du" form`);
  }
  const k = q.en?.[0]?.trim().toLowerCase();
  if (k) { if (stems.has(k) && !q.v) warns.push(`${at}: same English stem as ${stems.get(k)}`); else stems.set(k, q.id); }
}

if (verse) {
  const cache = new Map();
  for (const { q } of all.filter((x) => x.q?.v)) {
    let words = cache.get(q.v);
    if (!words) {
      try {
        const r = await fetch(`https://api.quran.com/api/v4/verses/by_key/${q.v}?words=true&word_fields=text_uthmani`);
        const j = await r.json();
        words = (j.verse?.words ?? []).filter((w) => w.char_type_name === "word");
        cache.set(q.v, words);
      } catch { words = []; }
    }
    const w = q.w ? words[q.w - 1] : null;
    if (q.w && !w) errors.push(`${q.id}: word ${q.w} does not exist in ${q.v} (${words.length} words)`);
    console.log(`${q.id}\t${q.v}${q.w ? `#${q.w}` : ""}\t${w ? `${w.text_uthmani} (${w.transliteration?.text ?? ""})` : `${words.length} words`}\t${q.en[0]}`);
  }
}

const by = {};
for (const { q } of all) { by[q.s] ??= { 1: 0, 2: 0, 3: 0, 4: 0, n: 0 }; by[q.s][q.g]++; by[q.s].n++; }
console.log("\nsubject      total  s1  s2  s3  s4");
for (const s of SUBJECTS) if (by[s]) console.log(`${s.padEnd(12)} ${String(by[s].n).padStart(5)} ${[1, 2, 3, 4].map((g) => String(by[s][g]).padStart(3)).join(" ")}`);
console.log(`${"all".padEnd(12)} ${String(all.length).padStart(5)}`);
const bd = {};
for (const { q } of all) bd[q.d] = (bd[q.d] ?? 0) + 1;
console.log(`difficulty   ${[1, 2, 3, 4, 5, 6, 7].map((d) => `d${d}:${bd[d] ?? 0}`).join("  ")}`);
for (const w of warns) console.log(`warning  ${w}`);
for (const e of errors) console.log(`ERROR    ${e}`);
console.log(errors.length ? `\n${errors.length} errors` : "\nno errors");
if (args.includes("--index")) {
  const names = readdirSync(path.join(base, "data")).filter((f) => f.endsWith(".ts") && f !== "index.ts").sort().map((f) => f.slice(0, -3));
  writeFileSync(path.join(base, "data", "index.ts"), `import type { RawQ } from "../types";

// The bank files of the examination centre, loaded on first use (require inside the loader). One file per author
// scope; every file exports QS. Written by \`node scripts/qbank-validate.mjs --index\` (also checks structure,
// verse references with --verse, and prints the counts).
/* eslint-disable @typescript-eslint/no-require-imports */
export const BANK_FILES: (() => { QS: RawQ[] })[] = [
${names.map((n) => `  () => require("./${n}"),`).join("\n")}
];
/* eslint-enable @typescript-eslint/no-require-imports */
`);
  console.log(`data/index.ts: ${names.length} bank files`);
}
process.exit(errors.length ? 1 : 0);
