// Writes src/lib/secrets/verse-translations.json: the verses the "Secrets of the Quran" page (/secrets) shows in
// translation – every {{t:surah:verse}} in lib/secrets/content.ts and lib/pagecontent/*/secrets.ts and every verse of
// its promises (`ref: "71:10-12"`) – for each language of the website except Arabic, in the translation the reader
// shows in that language (lib/quran.ts pickTranslation: PREFERRED_TRANSLATION, else the first Quran.com translation
// whose language is the locale's resourceLang in i18n/locales.ts, else English). The texts are Quran.com's, with the
// footnote markers and tags taken out and the spaces tidied; nothing else is changed and nothing is typed by hand
// (BLUEPRINT §4). lib/secrets/scripture.ts reads the file; the app gets it with the secrets folder
// (mobile/scripts/sync-web.mjs).
// Usage: node scripts/gen-secrets-translations.mjs   (after adding a {{t:…}} token or a promise; where Node's fetch
// stalls on IPv6, add --dns-result-order=ipv4first after `node`)
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const UPSTREAM = process.env.QURAN_UPSTREAM ?? "https://api.quran.com/api/v4";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lib = join(root, "src", "lib");
const out = join(lib, "secrets", "verse-translations.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// the content files and the verses they need
const files = [join(lib, "secrets", "content.ts")];
for (const l of readdirSync(join(lib, "pagecontent"))) {
  const f = join(lib, "pagecontent", l, "secrets.ts");
  if (existsSync(f)) files.push(f);
}
const keys = new Set();
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/\{\{t:(\d{1,3}):(\d{1,3})\}\}/g)) keys.add(`${m[1]}:${m[2]}`);
  for (const m of src.matchAll(/\bref: "(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?"/g)) {
    const a = Number(m[2]), b = Number(m[3] ?? m[2]);
    for (let v = a; v <= b; v++) keys.add(`${m[1]}:${v}`);
  }
}
const order = (a, b) => { const [x, y] = a.split(":").map(Number), [p, q] = b.split(":").map(Number); return x - p || y - q; };
const verseKeys = [...keys].sort(order);
if (!verseKeys.length) { console.error("no verses found"); process.exit(1); }

// the languages and the translation the reader picks for each (same rule as pickTranslation in lib/quran.ts)
const locales = [...readFileSync(join(root, "src", "i18n", "locales.ts"), "utf8").matchAll(/^\s+(\w+): \{[^}]*resourceLang: "([^"]+)"/gm)]
  .map((m) => ({ locale: m[1], lang: m[2] })).filter((l) => l.locale !== "ar");
const pref = /PREFERRED_TRANSLATION: Record<string, number> = (\{[^}]*\})/.exec(readFileSync(join(lib, "quran.ts"), "utf8"));
if (!pref || !locales.length) { console.error("lib/quran.ts or i18n/locales.ts not recognised"); process.exit(1); }
const PREFERRED = Object.fromEntries([...pref[1].matchAll(/(\w+): (\d+)/g)].map((m) => [m[1], Number(m[2])]));

async function get(path) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(`${UPSTREAM}${path}`, { signal: AbortSignal.timeout(20_000) });
      if (r.ok) return await r.json();
    } catch {}
    await sleep(1500 * (i + 1));
  }
  console.error(`FAILED ${path}`);
  process.exit(1);
}

const { translations } = await get("/resources/translations");
const chosen = {};
for (const { locale, lang } of locales) {
  const p = PREFERRED[locale];
  const t = (p && translations.find((x) => x.id === p)) || translations.find((x) => x.language_name?.toLowerCase() === lang) || translations.find((x) => x.id === PREFERRED.en);
  if (!t) { console.error(`no translation for ${locale}`); process.exit(1); }
  // the translator as Quran.com names it; its resource name where the author is not given ("Unknown")
  const author = (t.author_name ?? "").trim();
  chosen[locale] = { id: t.id, name: author && author.toLowerCase() !== "unknown" ? author : (t.name ?? "").trim() };
}

/** Quran.com's translation text: footnote markers (<sup foot_note=…>1</sup>) and tags removed, spaces tidied */
const clean = (html) => String(html ?? "")
  .replace(/<sup\b[^>]*>.*?<\/sup>/gis, "")
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")
  .replace(/\s+/g, " ")
  .trim();

const ids = [...new Set(Object.values(chosen).map((c) => c.id))];
const data = Object.fromEntries(Object.keys(chosen).sort().map((l) => [l, { ...chosen[l], verses: {} }]));
for (const key of verseKeys) {
  const { verse } = await get(`/verses/by_key/${key}?words=false&translations=${ids.join(",")}`);
  if (verse?.verse_key !== key) { console.error(`FAILED ${key}`); process.exit(1); }
  for (const [l, c] of Object.entries(data)) {
    const t = clean(verse.translations?.find((x) => x.resource_id === c.id)?.text);
    if (!t) { console.error(`no text of translation ${c.id} (${l}) for ${key}`); process.exit(1); }
    c.verses[key] = t;
  }
  await sleep(150);
}
writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
console.log(`verse-translations.json: ${Object.keys(data).length} languages, ${verseKeys.length} verses (${verseKeys.join(" ")})`);
