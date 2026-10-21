// Writes src/lib/data/verse-quotes.json: the verses the website quotes as decoration (hero rings, gold verse lines,
// the calligraphy in the side margins), each in the spelling the design is set in, exactly as Quran.com gives it.
// Nothing in that file is typed by hand (BLUEPRINT §4); the pages cut the words they show out of it (lib/uiVerses.ts).
//   uthmani = text_uthmani   (the reader's text)
//   qpc     = text_qpc_hafs  (King Fahd Complex Hafs mushaf; ends with the verse number, which the pages leave out)
//   imlaei  = text_imlaei    (modern spelling, for the calligraphy fonts)
// Usage: node scripts/gen-verse-quotes.mjs [script:key ...]   e.g.  node scripts/gen-verse-quotes.mjs qpc:2:255 imlaei:94:6
// Every key already in the file is fetched again; new script:key pairs are added. Order of the keys: Quran order.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const UPSTREAM = process.env.QURAN_UPSTREAM ?? "https://api.quran.com/api/v4";
const FIELDS = { uthmani: "text_uthmani", qpc: "text_qpc_hafs", imlaei: "text_imlaei" };
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "data", "verse-quotes.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const want = Object.fromEntries(Object.keys(FIELDS).map((s) => [s, new Set()]));
if (existsSync(out)) {
  const old = JSON.parse(readFileSync(out, "utf8"));
  for (const s of Object.keys(FIELDS)) for (const k of Object.keys(old[s] ?? {})) want[s].add(k);
}
for (const arg of process.argv.slice(2)) {
  const m = /^(uthmani|qpc|imlaei):(\d{1,3}:\d{1,3})$/.exec(arg);
  if (!m) { console.error(`not script:key – ${arg}`); process.exit(1); }
  want[m[1]].add(m[2]);
}

const order = (a, b) => { const [x, y] = a.split(":").map(Number), [p, q] = b.split(":").map(Number); return x - p || y - q; };
const keys = [...new Set(Object.values(want).flatMap((s) => [...s]))].sort(order);
const text = {};
for (const key of keys) {
  let verse = null;
  for (let i = 0; i < 4 && !verse; i++) {
    try {
      const r = await fetch(`${UPSTREAM}/verses/by_key/${key}?words=false&fields=${Object.values(FIELDS).join(",")}`);
      if (r.ok) verse = (await r.json()).verse;
    } catch {}
    if (!verse) await sleep(1500 * (i + 1));
  }
  if (verse?.verse_key !== key) { console.error(`FAILED ${key}`); process.exit(1); }
  text[key] = verse;
  await sleep(150);
}

const data = {};
for (const [s, field] of Object.entries(FIELDS)) {
  data[s] = {};
  for (const key of [...want[s]].sort(order)) {
    const t = text[key][field];
    if (typeof t !== "string" || !t.trim()) { console.error(`no ${field} for ${key}`); process.exit(1); }
    data[s][key] = t;
  }
}
writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
console.log(`verse-quotes.json: ${Object.entries(data).map(([s, v]) => `${s} ${Object.keys(v).length}`).join(", ")}`);
