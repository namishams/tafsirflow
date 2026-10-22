// Writes src/lib/islam/data/quran-translations.json: the translations of the verses that the chapters of the Islam
// section (lib/islam) quote in German and English, exactly as Quran.com gives them. Nothing in that file is typed by hand
// (BLUEPRINT §4); the chapters cut the words they quote out of it (lib/islam/quranQuote.ts). The app gets the same file
// with the folder lib/islam through mobile/scripts/sync-web.mjs.
//   de = Quran.com translation 27 (Frank Bubenheim and Nadeem Elyas), en = translation 20 (Saheeh International): the
//        translations the reader uses for these languages (PREFERRED_TRANSLATION in lib/quran.ts)
// Usage: node scripts/gen-quran-translations.mjs [lang:key ...]   e.g.  node scripts/gen-quran-translations.mjs de:2:255 en:2:255
// Every key already in the file is fetched again; new lang:key pairs are added. Order of the keys: Quran order.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const UPSTREAM = process.env.QURAN_UPSTREAM ?? "https://api.quran.com/api/v4";
const TRANSLATION = { de: 27, en: 20 };
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "islam", "data", "quran-translations.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const read = () => (existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : {});

const want = Object.fromEntries(Object.keys(TRANSLATION).map((l) => [l, new Set()]));
const old = read();
for (const l of Object.keys(TRANSLATION)) for (const k of Object.keys(old[l] ?? {})) want[l].add(k);
for (const arg of process.argv.slice(2)) {
  const m = /^(de|en):(\d{1,3}:\d{1,3})$/.exec(arg);
  if (!m) { console.error(`not lang:key (${Object.keys(TRANSLATION).join("|")}:surah:verse) – ${arg}`); process.exit(1); }
  want[m[1]].add(m[2]);
}

const order = (a, b) => { const [x, y] = a.split(":").map(Number), [p, q] = b.split(":").map(Number); return x - p || y - q; };
const text = Object.fromEntries(Object.keys(TRANSLATION).map((l) => [l, {}]));
for (const [lang, keys] of Object.entries(want)) {
  for (const key of [...keys].sort(order)) {
    let t = null;
    for (let i = 0; i < 4 && !t; i++) {
      try {
        const r = await fetch(`${UPSTREAM}/verses/by_key/${key}?words=false&translations=${TRANSLATION[lang]}`);
        if (r.ok) {
          const v = (await r.json()).verse;
          if (v?.verse_key === key) t = v.translations?.find((x) => x.resource_id === TRANSLATION[lang])?.text ?? null;
        }
      } catch {}
      if (!t) await sleep(1500 * (i + 1));
    }
    if (typeof t !== "string" || !t.trim()) { console.error(`FAILED ${lang}:${key}`); process.exit(1); }
    text[lang][key] = t;
    await sleep(150);
  }
}

// keys that another run wrote while this one was fetching are kept, with the text that run fetched
const now = read();
const data = {};
for (const lang of Object.keys(TRANSLATION)) {
  const all = { ...(now[lang] ?? {}), ...text[lang] };
  data[lang] = Object.fromEntries(Object.keys(all).sort(order).map((k) => [k, all[k]]));
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
console.log(`quran-translations.json: ${Object.entries(data).map(([l, v]) => `${l} ${Object.keys(v).length}`).join(", ")}`);
