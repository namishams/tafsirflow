// Pre-loads all Quran content into the local database through the running app, so Quran.com is not needed afterwards.
// Usage (on the server, app running on :3000):   node scripts/warm-cache.mjs [--tafsir]
// Polite to the source: sequential requests with a short pause. Verses take ~10 min; --tafsir takes hours (6,236 verses x sources).
const BASE = process.env.APP_URL ?? "http://localhost:3000/api/q";
const LOCALES = ["de", "en", "id", "fa"];
const RECITERS = [7, 2, 6, 9];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const counts = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

async function hit(path) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(BASE + path);
      if (r.ok || r.status === 404) return r.ok ? r.json() : null;
    } catch {}
    await sleep(1500 * (i + 1));
  }
  console.error("FAILED", path);
  return null;
}

const res = await hit("/resources/translations");
const tafs = await hit("/resources/tafsirs");
if (!res || !tafs) { console.error("App not reachable or Quran.com down"); process.exit(1); }

const pref = { de: 27, en: 20, id: 33 };
const lang = { de: "german", en: "english", id: "indonesian", fa: "persian" };
const trId = (l) => (res.translations.some((t) => t.id === pref[l]) ? pref[l] : res.translations.find((t) => t.language_name?.toLowerCase() === lang[l])?.id ?? 20);

for (const l of LOCALES) {
  await hit(`/chapters?language=${l}`);
  for (let c = 1; c <= 114; c++) {
    await hit(`/chapters/${c}?language=${l}`);
    for (const rid of RECITERS) {
      await hit(`/verses/by_chapter/${c}?words=true&word_fields=text_uthmani&language=${l}&fields=text_uthmani&translations=${trId(l)}&audio=${rid}&per_page=300`);
      await sleep(150);
    }
    process.stdout.write(`\r${l} surah ${c}/114   `);
  }
  console.log();
}

if (process.argv.includes("--tafsir")) {
  const ids = new Set([169, 168, 817]);
  for (const l of LOCALES) for (const t of tafs.tafsirs) if (t.language_name?.toLowerCase() === lang[l]) ids.add(t.id);
  for (const id of ids) {
    for (let c = 1; c <= 114; c++) {
      for (let v = 1; v <= counts[c - 1]; v++) await hit(`/tafsirs/${id}/by_ayah/${c}:${v}`);
      process.stdout.write(`\rtafsir ${id} surah ${c}/114   `);
    }
    console.log();
  }
}
console.log("Done.");
