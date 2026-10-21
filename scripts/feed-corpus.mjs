#!/usr/bin/env node
// Fills feed_items (db/schema.sql) with the server feed corpus: 100,000+ posts as REFERENCES only. No Quran, hadith,
// tafsir, dua or article text is stored: the clients load every text from its source, as they already do.
//
//   node scripts/feed-corpus.mjs                  build all kinds, upsert, prune stale rows, print counts
//   node scripts/feed-corpus.mjs --dry-run        build and print counts, no database
//   options: --only=verse,hadith   --word-cap=4   --cache=<dir>   --refresh (re-download)   --offline (cache only)
//            --samples (print two items of every kind)
//
// Idempotent and safe to re-run: rows are upserted by id (unchanged rows are not rewritten), kseq is dense per stream,
// rows of a kind that is no longer in its source are removed; a kind whose source cannot be read is left untouched.
// DATABASE_URL comes from the environment or from /srv/tafsirflow/.env.db (written by scripts/server-setup.sh).
//
// Kinds and their sources (downloads are cached for 7 days in the cache directory):
//   verse        6,236 verse keys (Hafs count)
//   word         content words of every verse, up to --word-cap per verse (Quranic Arabic Corpus morphology, GPL; only
//                word positions are used)
//   tafsir       every verse × every Quran.com tafsir work in an app language (resource list from api.quran.com)
//   hadith       every hadith number of the ten Sunni collections (hadith-api editions.json + info.json)
//   shia-hadith  every id of every Thaqalayn book (thaqalayn-api allbooks; fallback: the app's catalog)
//   name         the 99 names × 3 variants (lesson, verse, quiz)
//   quiz         every question id of the exam centre (mobile/src/features/qbank/data)
//   course       Academy lessons, Abrahamic and Haramain lessons (ids from the app's course files)
//   wiki         every Wikipedia catalog title × its feed kind (mobile/src/content/extra)
//   lemma        every lemma with a root in the Quranic Arabic Corpus (lemma, root, count, first verse)
//   mutashabihat the app's groups of similar verses (verse keys)
//   maqasid      the app's Shams 2.0 maqasid sections
//   dua          Hisnul Muslim (chapter, index) and fitrahive/dua-dhikr (category, index)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, "mobile", "src");
const require = createRequire(import.meta.url);

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => { const a = argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.slice(n.length + 3) : d; };
const DRY = flag("dry-run");
const REFRESH = flag("refresh");
const OFFLINE = flag("offline");
const ONLY = new Set((opt("only", "") || "").split(",").map((s) => s.trim()).filter(Boolean));
const WORD_CAP = Math.max(1, Math.min(20, Number(opt("word-cap", "4")) || 4));
const CACHE = path.resolve(opt("cache", path.join(os.tmpdir(), "qmc-feed-corpus")));
const MIN_TOTAL = 100_000;

const LOCALES = ["de", "en", "ar", "tr", "ur", "fa", "ps", "fr", "es", "id", "ms", "bn", "ru", "zh"];
// verse counts of the 114 surahs (Hafs, Kufan count) – same table as mobile/scripts/qbank-validate.mjs
const VC = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

const log = (...a) => console.log(...a);
const warn = (...a) => console.warn("  ! " + a.join(" "));

// ---------------------------------------------------------------- downloads (cached) ----------------------------------
fs.mkdirSync(CACHE, { recursive: true });
const UA = "QuranMasterclass-feed-corpus/1.0 (https://quranmasterclass.com)";
const stripBom = (s) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);
async function download(url, name, { text = false, ttlDays = 7, timeoutMs = 120_000 } = {}) {
  const file = path.join(CACHE, name);
  const fresh = fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < ttlDays * 86_400_000;
  const read = () => { const s = stripBom(fs.readFileSync(file, "utf8")); return text ? s : JSON.parse(s); };
  if (fresh && !REFRESH) return read();
  if (OFFLINE) { if (fs.existsSync(file)) return read(); throw new Error(`offline and not cached: ${name}`); }
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: text ? "text/plain" : "application/json" }, signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      const body = await res.text();
      if (!text) JSON.parse(stripBom(body)); // only valid JSON is cached
      fs.writeFileSync(file, body);
      return read();
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  if (fs.existsSync(file)) { warn(`${name}: download failed (${last?.message}), using the older cached copy`); return read(); }
  throw last;
}
async function pool(tasks, n) {
  const out = new Array(tasks.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, tasks.length) }, async () => { while (i < tasks.length) { const k = i++; out[k] = await tasks[k](); } }));
  return out;
}

// ---------------------------------------------------------------- the app's TypeScript data files ---------------------
// Data files are transpiled with the project's TypeScript and evaluated in a sandbox; imports resolve to an inert stub
// (the data files only import types and small helpers). Without TypeScript, Node's own type stripping is tried.
let ts = null;
try { ts = require("typescript"); } catch { ts = null; }
function stub() {
  const f = function () { return stub(); };
  return new Proxy(f, {
    get: (_t, p) => (p === Symbol.toPrimitive ? () => "" : p === "then" ? undefined : p === "length" ? 0 : stub()),
    apply: () => stub(),
    construct: () => stub(),
  });
}
async function loadTs(file) {
  if (!fs.existsSync(file)) throw new Error(`missing ${path.relative(ROOT, file)}`);
  if (ts) {
    const out = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true },
      fileName: file,
    }).outputText;
    const module = { exports: {} };
    vm.runInNewContext(out, { module, exports: module.exports, require: () => stub(), console }, { filename: file, timeout: 20_000 });
    // structuredClone-like copy into this realm (plain data only)
    return JSON.parse(JSON.stringify(module.exports, (_k, v) => (typeof v === "function" ? undefined : v)));
  }
  return await import(pathToFileURL(file).href);
}
const appFile = (...p) => path.join(APP, ...p);

// ---------------------------------------------------------------- helpers ---------------------------------------------
const item = (id, kind, stream, ref, extra = {}) => ({ id, kind, stream, ref, langs: ["*"], tradition: "all", topic: "", weight: 1, ...extra });
const verseKeys = () => VC.flatMap((n, i) => Array.from({ length: n }, (_, a) => `${i + 1}:${a + 1}`));

/** the app's library topic of an extra (Wikipedia) kind – same rules as mobile/src/features/feed/library.ts */
function wikiTopic(kind) {
  const T = {
    duas: ["phrases", "akhlaq"], prayer: ["salah", "pillars", "pillars-hajj", "islamic-months"], holy: ["mosque", "holy-places", "saudi-heritage"],
    seerah: ["seerah", "prophets", "prophet-family", "battles"], quran: ["quran-facts", "angels-unseen", "arabic-word"],
    scholars: ["scholar-bio", "scholar-work", "scholar-timeline", "reciter-bio", "reciter-fact", "women"],
    history: ["history", "islam-country", "spread", "golden-age", "traditions", "islamic-finance", "halal-culture"], art: ["art", "met-art", "calligraphy-style", "architecture-style"],
  };
  for (const [t, ks] of Object.entries(T)) if (ks.includes(kind)) return t;
  if (/callig|architect|art/.test(kind)) return "art";
  if (/mosque|holy|heritage|makkah|madinah|kaaba|mecca|medina|hejaz/.test(kind)) return "holy";
  if (/salah|prayer|pillar|hajj|fast|zakat/.test(kind)) return "prayer";
  if (/seerah|prophet|battle|sahab|companion/.test(kind)) return "seerah";
  if (/scholar|reciter|women|imam/.test(kind)) return "scholars";
  if (/quran|surah|angel|unseen|arabic/.test(kind)) return "quran";
  if (/dua|dhikr|phrase|akhlaq/.test(kind)) return "duas";
  if (/hadith/.test(kind)) return "hadith";
  return "history";
}

// ---------------------------------------------------------------- the kinds -------------------------------------------
let morphText = null;
async function morph() {
  morphText ??= await download("https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt", "quran-morphology.txt", { text: true, ttlDays: 60 });
  return morphText;
}

const KINDS = {
  async verse() {
    return verseKeys().map((k) => item(`verse:${k}`, "verse", "verse", { k }, { topic: "quran" }));
  },

  async word() {
    // content words (a segment with a root) per verse; up to WORD_CAP of them, spread over the verse
    const per = new Map();
    for (const line of (await morph()).split("\n")) {
      const p = line.split("\t");
      if (p.length < 4 || !/ROOT:/.test(p[3])) continue;
      const [s, a, w] = p[0].split(":").map(Number);
      const k = `${s}:${a}`;
      const set = per.get(k) ?? new Set();
      set.add(w);
      per.set(k, set);
    }
    const out = [];
    for (const k of verseKeys()) {
      const ws = [...(per.get(k) ?? [])].sort((x, y) => x - y);
      if (!ws.length) continue;
      const pick = ws.length <= WORD_CAP ? ws : [...new Set(Array.from({ length: WORD_CAP }, (_, j) => ws[Math.round((j * (ws.length - 1)) / (WORD_CAP - 1 || 1))]))];
      for (const w of pick) out.push(item(`word:${k}:${w}`, "word", "word", { k, w }, { topic: "tafsir" }));
    }
    if (out.length < 10_000) throw new Error(`only ${out.length} words parsed`);
    return out;
  },

  async lemma() {
    const lem = new Map();
    for (const line of (await morph()).split("\n")) {
      const p = line.split("\t");
      if (p.length < 4) continue;
      const root = /ROOT:([^|]+)/.exec(p[3])?.[1], l = /LEM:([^|]+)/.exec(p[3])?.[1];
      if (!root || !l) continue;
      const [s, a, w] = p[0].split(":");
      const e = lem.get(l) ?? { r: root, n: 0, k: `${s}:${a}`, words: new Set() };
      const wk = `${s}:${a}:${w}`;
      if (!e.words.has(wk)) { e.words.add(wk); e.n++; }
      lem.set(l, e);
    }
    const out = [...lem].map(([l, e]) => item(`lemma:${l}`, "lemma", "lemma", { l, r: e.r, n: e.n, k: e.k }, { topic: "tafsir" }));
    if (out.length < 1000) throw new Error(`only ${out.length} lemmas parsed`);
    return out;
  },

  async tafsir() {
    // the app's language map (mobile/src/content/sources/quran.ts); Kurdish and other languages outside the app are left out
    const LANG = { english: "en", arabic: "ar", bengali: "bn", russian: "ru", urdu: "ur", indonesian: "id", turkish: "tr", french: "fr", german: "de", persian: "fa", malay: "ms" };
    let works;
    try {
      const r = await download("https://api.quran.com/api/v4/resources/tafsirs", "qc-tafsirs.json");
      works = r.tafsirs.map((t) => ({ id: Number(t.id), lang: LANG[String(t.language_name).toLowerCase()] })).filter((t) => t.lang && LOCALES.includes(t.lang));
    } catch (e) {
      warn(`tafsir list: ${e.message}; using the list checked on 2026-10-21`);
      works = [[169, "en"], [168, "en"], [817, "en"], [16, "ar"], [93, "ar"], [14, "ar"], [15, "ar"], [90, "ar"], [91, "ar"], [94, "ar"], [381, "bn"], [165, "bn"], [166, "bn"], [164, "bn"], [170, "ru"], [157, "ur"], [160, "ur"], [818, "ur"], [159, "ur"]].map(([id, lang]) => ({ id, lang }));
    }
    const own = new Set(works.map((w) => w.lang));
    // locales without a tafsir of their own read the English works (as the app does); Arabic works only in Arabic
    const fallback = LOCALES.filter((l) => !own.has(l) && l !== "ar");
    const keys = verseKeys();
    return works.flatMap((w) => keys.map((k) => item(`tafsir:${w.id}:${k}`, "tafsir", `tafsir:${w.lang}`, { k, t: w.id }, { topic: "tafsir", langs: w.lang === "en" ? ["en", ...fallback] : [w.lang] })));
  },

  async hadith() {
    const COLL = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "malik", "nawawi", "qudsi", "dehlawi"];
    // highest numbers per collection (fallback when the index cannot be read; mobile/src/content/sources/hadith.ts)
    const MAX = { bukhari: 7563, muslim: 7563, abudawud: 5274, tirmidhi: 3956, nasai: 5758, ibnmajah: 4341, malik: 1858, nawawi: 42, qudsi: 40, dehlawi: 40 };
    let editions = null, info = null;
    try { editions = await download("https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json", "hadith-editions.json"); } catch (e) { warn(`hadith editions: ${e.message}`); }
    try { info = await download("https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/info.json", "hadith-info.json", { timeoutMs: 300_000 }); } catch (e) { warn(`hadith info: ${e.message}; using number ranges`); }
    const out = [];
    for (const c of COLL) {
      if (editions && !editions[c]) { warn(`hadith: ${c} not in the editions index, skipped`); continue; }
      let nums = info?.[c]?.hadiths?.map((h) => Number(h.hadithnumber)).filter((n) => Number.isInteger(n) && n > 0);
      if (!nums?.length) nums = Array.from({ length: Number(info?.[c]?.metadata?.last_hadithnumber) || MAX[c] }, (_, i) => i + 1);
      for (const n of [...new Set(nums)].sort((a, b) => a - b)) out.push(item(`hadith:${c}:${n}`, "hadith", `hadith:${c}`, { c, n }, { tradition: "sunni", topic: "hadith" }));
    }
    return out;
  },

  async "shia-hadith"() {
    let books;
    try {
      books = (await download("https://www.thaqalayn-api.net/api/v2/allbooks", "thaqalayn-allbooks.json")).map((b) => ({ id: b.bookId, min: Number(b.idRangeMin) || 1, max: Number(b.idRangeMax) || 0 }));
    } catch (e) {
      warn(`thaqalayn books: ${e.message}; using the app's catalog`);
      const src = fs.readFileSync(appFile("features", "hadith", "catalog.ts"), "utf8");
      books = JSON.parse(/export const SHIA_BOOKS: ShiaBook\[\] = (\[.*\]);/.exec(src)[1]).map((b) => ({ id: b.id, min: 1, max: b.max }));
    }
    return books.flatMap((b) => Array.from({ length: Math.max(0, b.max - b.min + 1) }, (_, i) => item(`shia:${b.id}:${b.min + i}`, "shia-hadith", "shia-hadith", { b: b.id, n: b.min + i }, { tradition: "shia", topic: "hadith" })));
  },

  async name() {
    const m = /export const NAMES_COUNT = (\d+)/.exec(fs.readFileSync(appFile("features", "courses", "names.ts"), "utf8"));
    const n = m ? Number(m[1]) : 99;
    return Array.from({ length: n }, (_, i) => ["lesson", "verse", "quiz"].map((v) => item(`name:${i}:${v}`, "name", "name", { i, v }, { topic: "duas" }))).flat();
  },

  async quiz() {
    const SUBJECT_TOPIC = { tajweed: "quran", qiraat: "quran", ulum: "quran", tafsir: "tafsir", seerah: "seerah", prophets: "seerah", hadith: "hadith", aqidah: "quran", fiqh: "prayer", nahw: "quran", vocab: "quran", history: "history" };
    const SUNNI = new Set(["sunni", "athari", "ashari", "maturidi"]);
    const dir = appFile("features", "qbank", "data");
    const out = [];
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts").sort()) {
      const qs = (await loadTs(path.join(dir, f))).QS;
      if (!Array.isArray(qs)) throw new Error(`${f}: no QS`);
      for (const q of qs) {
        if (typeof q?.id !== "string") continue;
        out.push(item(`quiz:${q.id}`, "quiz", "quiz", { q: q.id }, { topic: SUBJECT_TOPIC[q.s] ?? "quran", tradition: (q.tr ?? []).some((t) => SUNNI.has(t)) ? "sunni" : "all" }));
      }
    }
    return out;
  },

  async course() {
    const TOPIC = { seerah: "seerah", prophets: "seerah", "hadith-sci": "hadith", adhkar: "duas", akhlaq: "duas", "fiqh-salah-sawm": "prayer", ramadan: "prayer", hajj: "prayer", aqidah: "quran", ulum: "quran", "tajweed-deep": "quran" };
    const out = [];
    const dir = appFile("features", "courses", "content");
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".ts")).sort()) {
      const mod = await loadTs(path.join(dir, f));
      for (const c of Object.values(mod)) {
        if (!c || typeof c.id !== "string" || !Array.isArray(c.lessons) || c.id === "names") continue;
        for (const l of c.lessons) if (typeof l?.id === "string") out.push(item(`course:${c.id}:${l.id}`, "course", "course", { c: c.id, l: l.id }, { topic: TOPIC[c.id] ?? "quran" }));
      }
    }
    for (const [kit, file, name, topic] of [["abrahamic", "abrahamic/lessons.ts", "ABRAHAMIC_LESSONS", "seerah"], ["haramain", "haramain/lessons.ts", "HARAMAIN_LESSONS", "holy"]]) {
      try {
        const list = (await loadTs(appFile("features", file)))[name];
        for (const l of Array.isArray(list) ? list : []) {
          if (typeof l?.id !== "string") continue;
          const tags = Array.isArray(l.tags) ? l.tags : [];
          const tradition = tags.includes("shia") && !tags.includes("sunni") ? "shia" : tags.includes("sunni") && !tags.includes("shia") ? "sunni" : "all";
          out.push(item(`course:${kit}:${l.id}`, "course", "course", { kit, l: l.id }, { topic, tradition }));
        }
      } catch (e) { warn(`course ${kit}: ${e.message}`); }
    }
    if (!out.length) throw new Error("no lessons found");
    return out;
  },

  async wiki() {
    // the feed kind of each catalog list, as in mobile/src/content/extra/sources.ts (loadKind)
    const MAP = {
      "catalog.ts": { MOSQUES: "mosque", ART: "art", SCHOLARS: "scholar-bio", WORKS: "scholar-work", SEERAH: "seerah", HISTORY: "history", SPREAD: "spread", GOLDEN_AGE: "golden-age", TRADITIONS: "traditions", WOMEN: "women", PROPHETS: "prophets", CALLIGRAPHY: "calligraphy-style", ARCHITECTURE: "architecture-style", MONTHS: "islamic-months", PILLARS: "pillars-hajj", RECITER_ARTICLES: "reciter-bio" },
      "catalog2.ts": { SALAH: "salah", PILLARS_FAITH: "pillars", HOLY_PLACES: "holy-places", SAUDI_HERITAGE: "saudi-heritage", QURAN_FACTS: "quran-facts", UNSEEN: "angels-unseen", ETHICS: "akhlaq", FAMILY: "prophet-family", BATTLES: "battles", FINANCE: "islamic-finance", HALAL: "halal-culture", PHRASES: "phrases" },
      "countries.ts": { ISLAM_IN: "islam-country" },
      "haramain.ts": { KAABA: "kaaba", MECCA_HISTORY: "mecca-history", MEDINA_HISTORY: "medina-history", HEJAZ_GEOGRAPHY: "hejaz-geography" },
      "abrahamic.ts": { ABRAHAMIC_PROPHETS: "abrahamic-prophets", ABRAHAMIC_RELIGIONS: "abrahamic-religions", ABRAHAMIC_PLACES: "abrahamic-places", INTERFAITH_HISTORY: "interfaith-history" },
    };
    const out = [];
    const seen = new Set();
    for (const [file, lists] of Object.entries(MAP)) {
      const mod = await loadTs(appFile("content", "extra", file));
      for (const [name, kind] of Object.entries(lists)) {
        const v = mod[name];
        if (!v) { warn(`wiki: ${file} has no ${name}`); continue; }
        const entries = Array.isArray(v) ? v : Object.values(v).map((title) => ({ title, tradition: "all" }));
        for (const e of entries) {
          const title = typeof e === "string" ? e : e?.title;
          if (typeof title !== "string" || !title) continue;
          const id = `wiki:${kind}:${title}`;
          if (seen.has(id)) continue;
          seen.add(id);
          const tradition = ["sunni", "shia"].includes(e?.tradition) ? e.tradition : "all";
          out.push(item(id, "wiki", "wiki", { x: kind, t: title }, { tradition, topic: wikiTopic(kind) }));
        }
      }
    }
    return out;
  },

  async mutashabihat() {
    const groups = (await loadTs(appFile("features", "shams2", "mutData.ts"))).MUT_GROUPS;
    if (!Array.isArray(groups) || !groups.length) throw new Error("no MUT_GROUPS");
    return groups.filter((g) => typeof g?.id === "string" && Array.isArray(g.keys)).map((g) => item(`mut:${g.id}`, "mutashabihat", "mutashabihat", { g: g.id, keys: g.keys }, { topic: "quran" }));
  },

  async maqasid() {
    const dir = appFile("features", "shams2", "maqasid");
    const out = [];
    for (const f of fs.readdirSync(dir).filter((f) => /^m-.*\.ts$/.test(f)).sort()) {
      for (const list of Object.values(await loadTs(path.join(dir, f)))) {
        if (!Array.isArray(list)) continue;
        for (const m of list) {
          if (!Number.isInteger(m?.s)) continue;
          const secs = (m.sections ?? []).filter((x) => x?.lessons && Number.isInteger(x.from));
          if (secs.length) for (const x of secs) out.push(item(`maqasid:${m.s}:${x.from}`, "maqasid", "maqasid", { s: m.s, f: x.from }, { topic: "tafsir" }));
          else out.push(item(`maqasid:${m.s}`, "maqasid", "maqasid", { s: m.s }, { topic: "tafsir" }));
        }
      }
    }
    if (!out.length) throw new Error("no maqasid found");
    return [...new Map(out.map((x) => [x.id, x])).values()];
  },

  async dua() {
    const out = [];
    // Hisnul Muslim (hisnmuslim.com): every dua of every chapter (as the app reads it: English edition, same ids in Arabic)
    try {
      const list = Object.values(await download("https://www.hisnmuslim.com/api/en/husn_en.json", "hisn-en.json"))[0];
      const ids = list.map((c) => Number(c.ID)).filter(Number.isInteger).sort((a, b) => a - b);
      const counts = await pool(ids.map((id) => async () => {
        try { return (Object.values(await download(`https://www.hisnmuslim.com/api/en/${id}.json`, `hisn-en-${id}.json`, { ttlDays: 60 }))[0] ?? []).length; }
        catch (e) { warn(`hisn chapter ${id}: ${e.message}`); return 0; }
      }), 4);
      ids.forEach((id, k) => { for (let i = 0; i < counts[k]; i++) out.push(item(`dua:hisn:${id}:${i}`, "dua", "dua", { h: id, i }, { tradition: "sunni", topic: "duas" })); });
    } catch (e) { warn(`hisnul muslim: ${e.message}`); }
    // fitrahive/dua-dhikr (the categories the app reads)
    for (const slug of ["morning-dhikr", "evening-dhikr", "dhikr-after-salah", "daily-dua", "selected-dua"]) {
      try {
        const n = (await download(`https://raw.githubusercontent.com/fitrahive/dua-dhikr/main/data/dua-dhikr/${slug}/en.json`, `fitrahive-${slug}.json`, { ttlDays: 30 })).length;
        for (let i = 0; i < n; i++) out.push(item(`dua:fh:${slug}:${i}`, "dua", "dua", { f: slug, i }, { topic: "duas" }));
      } catch (e) { warn(`fitrahive ${slug}: ${e.message}`); }
    }
    if (!out.length) throw new Error("no dua source could be read");
    return out;
  },
};

// ---------------------------------------------------------------- database --------------------------------------------
function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const f of ["/srv/tafsirflow/.env.db", path.join(ROOT, "..", ".env.db"), path.join(ROOT, ".env.db")]) {
    try {
      const m = /^\s*DATABASE_URL\s*=\s*(.+?)\s*$/m.exec(fs.readFileSync(f, "utf8"));
      if (m) return m[1].replace(/^["']|["']$/g, "");
    } catch { /* next */ }
  }
  return null;
}

const DDL = `
CREATE TABLE IF NOT EXISTS feed_items (
  id text PRIMARY KEY, kind text NOT NULL, ref jsonb NOT NULL, lang_tags text[] NOT NULL DEFAULT '{*}',
  tradition text NOT NULL DEFAULT 'all' CHECK (tradition IN ('all','sunni','shia')), topic text NOT NULL DEFAULT '',
  weight real NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE feed_items ADD COLUMN IF NOT EXISTS stream text;
ALTER TABLE feed_items ADD COLUMN IF NOT EXISTS kseq integer;
ALTER TABLE feed_items ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS feed_items_stream_seq ON feed_items(stream, kseq);
CREATE INDEX IF NOT EXISTS feed_items_kind ON feed_items(kind);`;

const UPSERT = `
INSERT INTO feed_items (id, kind, stream, kseq, ref, lang_tags, tradition, topic, weight)
SELECT t.id, t.kind, t.stream, t.kseq, t.ref::jsonb, string_to_array(t.langs, ','), t.tradition, t.topic, t.weight
  FROM unnest($1::text[], $2::text[], $3::text[], $4::int[], $5::text[], $6::text[], $7::text[], $8::text[], $9::real[])
       AS t(id, kind, stream, kseq, ref, langs, tradition, topic, weight)
ON CONFLICT (id) DO UPDATE SET kind = EXCLUDED.kind, stream = EXCLUDED.stream, kseq = EXCLUDED.kseq, ref = EXCLUDED.ref,
  lang_tags = EXCLUDED.lang_tags, tradition = EXCLUDED.tradition, topic = EXCLUDED.topic, weight = EXCLUDED.weight, updated_at = now()
WHERE (feed_items.kind, feed_items.stream, feed_items.kseq, feed_items.ref, feed_items.lang_tags, feed_items.tradition, feed_items.topic, feed_items.weight)
      IS DISTINCT FROM (EXCLUDED.kind, EXCLUDED.stream, EXCLUDED.kseq, EXCLUDED.ref, EXCLUDED.lang_tags, EXCLUDED.tradition, EXCLUDED.topic, EXCLUDED.weight)`;

/** dense kseq per stream (sorted by id, so a re-run with the same source gives the same numbers) */
function number(items) {
  const by = new Map();
  for (const it of items) { const l = by.get(it.stream) ?? []; l.push(it); by.set(it.stream, l); }
  for (const l of by.values()) { l.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)); l.forEach((it, i) => { it.kseq = i; }); }
  return [...by.values()].flat();
}

async function write(client, kind, items) {
  await client.query("BEGIN");
  try {
    let changed = 0;
    for (let i = 0; i < items.length; i += 2000) {
      const b = items.slice(i, i + 2000);
      const r = await client.query(UPSERT, [
        b.map((x) => x.id), b.map((x) => x.kind), b.map((x) => x.stream), b.map((x) => x.kseq), b.map((x) => JSON.stringify(x.ref)),
        b.map((x) => x.langs.join(",")), b.map((x) => x.tradition), b.map((x) => x.topic), b.map((x) => x.weight),
      ]);
      changed += r.rowCount ?? 0;
    }
    await client.query("CREATE TEMP TABLE feed_keep (id text PRIMARY KEY) ON COMMIT DROP");
    for (let i = 0; i < items.length; i += 5000) await client.query("INSERT INTO feed_keep SELECT unnest($1::text[]) ON CONFLICT DO NOTHING", [items.slice(i, i + 5000).map((x) => x.id)]);
    const del = await client.query("DELETE FROM feed_items f WHERE f.kind = $1 AND NOT EXISTS (SELECT 1 FROM feed_keep k WHERE k.id = f.id)", [kind]);
    await client.query("COMMIT");
    return { changed, removed: del.rowCount ?? 0 };
  } catch (e) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw e;
  }
}

// ---------------------------------------------------------------- main ------------------------------------------------
async function main() {
  const started = Date.now();
  log(`feed corpus: ${DRY ? "dry run" : "writing to the database"}, cache ${CACHE}${ts ? "" : " (TypeScript not installed: using Node's type stripping)"}`);
  const built = new Map();
  for (const kind of Object.keys(KINDS)) {
    if (ONLY.size && !ONLY.has(kind)) continue;
    const t0 = Date.now();
    try {
      const items = number(await KINDS[kind]());
      const ids = new Set();
      for (const it of items) { if (ids.has(it.id)) throw new Error(`duplicate id ${it.id}`); ids.add(it.id); }
      built.set(kind, items);
      log(`  ${kind.padEnd(13)} ${String(items.length).padStart(7)}  (${new Set(items.map((i) => i.stream)).size} streams, ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
      if (flag("samples")) for (const it of [items[0], items[Math.floor(items.length / 2)]].filter(Boolean)) log(`      ${JSON.stringify(it)}`);
    } catch (e) {
      warn(`${kind}: skipped (${e.message}); its rows in the database stay as they are`);
    }
  }
  const total = [...built.values()].reduce((a, l) => a + l.length, 0);
  log(`  ${"built".padEnd(13)} ${String(total).padStart(7)}`);
  if (DRY) {
    if (!ONLY.size && total < MIN_TOTAL) { warn(`fewer than ${MIN_TOTAL} items`); process.exitCode = 2; }
    return;
  }

  const url = databaseUrl();
  if (!url) throw new Error("DATABASE_URL is not set and /srv/tafsirflow/.env.db was not found");
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    // the table comes from db/schema.sql (applied by scripts/deploy.sh as postgres); create it here only when it is
    // missing (e.g. a fresh local database), since ALTER/CREATE INDEX need the table's owner
    const cols = new Set((await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'feed_items'")).rows.map((r) => r.column_name));
    if (!["id", "kind", "ref", "lang_tags", "tradition", "topic", "weight", "stream", "kseq", "updated_at"].every((c) => cols.has(c))) {
      try { await client.query(DDL); }
      catch (e) { throw new Error(`feed_items is missing or incomplete and this database user cannot create it (${e.message}); apply db/schema.sql first (scripts/deploy.sh does)`); }
    }
    for (const [kind, items] of built) {
      const r = await write(client, kind, items);
      log(`  wrote ${kind.padEnd(13)} ${String(r.changed).padStart(7)} new or changed, ${r.removed} removed`);
    }
    await client.query("ANALYZE feed_items").catch((e) => warn(`analyze: ${e.message}`));
    const rows = (await client.query("SELECT kind, count(*)::int AS n, count(DISTINCT stream)::int AS s FROM feed_items GROUP BY kind ORDER BY kind")).rows;
    log("\nfeed_items per kind:");
    let sum = 0;
    for (const r of rows) { log(`  ${r.kind.padEnd(13)} ${String(r.n).padStart(7)}  (${r.s} streams)`); sum += r.n; }
    log(`  ${"total".padEnd(13)} ${String(sum).padStart(7)}`);
    if (sum < MIN_TOTAL) { warn(`only ${sum} items in feed_items (target ${MIN_TOTAL}+)`); process.exitCode = 2; }
  } finally {
    await client.end();
  }
  log(`done in ${((Date.now() - started) / 1000).toFixed(0)} s`);
}

main().catch((e) => { console.error(`feed corpus failed: ${e.stack || e.message}`); process.exit(1); });
