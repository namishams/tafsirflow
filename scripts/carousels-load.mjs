#!/usr/bin/env node
// Carousels and wisdom posts of the feed: checks the editors' files and loads their ids into feed_items (kind
// "carousel" and "wisdom"). The texts stay in the tracked JSON files (src/lib/feed/carousels/{data,wisdom,i18n});
// the database holds only references, like the rest of the corpus (scripts/feed-corpus.mjs). Scripture is never in
// the files: slides carry verse keys, hadith collection + number or Hisnul Muslim ids, the clients load the text.
//
//   node scripts/carousels-load.mjs                 check, then upsert into feed_items and prune removed ids
//   node scripts/carousels-load.mjs --dry-run       check and count, no database
//   node scripts/carousels-load.mjs --check         check only (exit code 1 on errors)
//   options: --only=<part of a file name>   --refs=<dir> (deep checks against the source texts, see below)
//            --samples   --quiet (errors only)
//
// --refs=<dir> needs tab-separated source texts (one line per item, "<ref>\t<text>"): quran-en.tsv / quran-de.tsv /
// quran-ar.tsv (Quran.com: Saheeh International, Bubenheim & Elyas, Uthmani), hadith-<collection>.tsv
// (fawazahmed0/hadith-api English editions), hisn-en.tsv ("hisn:<chapter>:<index>\t<title>\t<text>"). Then every
// reference must contain its "check" word(s), scripture must fit on a slide, and no own text may repeat the
// wording of the Quran or of the cited hadith (a guard against hand-typed scripture).
// DATABASE_URL comes from the environment or /srv/tafsirflow/.env.db (as in scripts/feed-corpus.mjs).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = path.join(ROOT, "src", "lib", "feed", "carousels");
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => { const a = argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.slice(n.length + 3) : d; };
const DRY = flag("dry-run"), CHECK = flag("check"), QUIET = flag("quiet");
const ONLY = opt("only", "");
const REFS = opt("refs", "");

export const LOCALES = ["de", "en", "ar", "tr", "ur", "fa", "ps", "fr", "es", "id", "ms", "bn", "ru", "zh"];
const CORE = ["en", "de", "ar"];
const TOPICS = ["quran", "tafsir", "hadith", "duas", "prayer", "seerah", "holy", "scholars", "history", "art"];
const PALETTES = ["night", "emerald", "dawn", "parchment", "marble"];
const TRADS = ["all", "sunni", "shia"];
const HADITH_MAX = { bukhari: 7563, muslim: 7563, nawawi: 42 };
// Hisnul Muslim (hisnmuslim.com): duas per chapter, read on 2026-10-21 (chapter 126 is not valid JSON at the source
// and cannot be loaded by the app, so it is left out)
const HISN = {"1":4,"2":1,"3":1,"4":2,"5":1,"6":1,"7":1,"8":1,"9":3,"10":2,"11":1,"12":1,"13":1,"14":1,"15":5,"16":6,"17":5,"18":3,"19":7,"20":2,"21":2,"22":1,"23":2,"24":11,"25":8,"26":1,"27":24,"28":13,"29":1,"30":1,"31":2,"32":3,"33":1,"34":2,"35":4,"36":3,"37":2,"38":1,"39":1,"40":3,"41":2,"42":1,"43":1,"44":1,"45":3,"46":1,"47":1,"48":1,"49":2,"50":1,"51":3,"52":1,"53":1,"54":1,"55":4,"56":2,"57":1,"58":1,"59":1,"60":1,"61":2,"62":1,"63":3,"64":1,"65":1,"66":1,"67":1,"68":2,"69":2,"70":2,"71":1,"72":1,"73":1,"74":1,"75":1,"76":1,"77":1,"78":1,"79":1,"80":1,"81":1,"82":1,"83":1,"84":1,"85":1,"86":1,"87":1,"88":1,"89":1,"90":1,"91":1,"92":1,"93":1,"94":1,"95":1,"96":1,"97":1,"98":1,"99":1,"100":1,"101":2,"102":1,"103":1,"104":1,"105":1,"106":1,"107":5,"108":3,"109":1,"110":1,"111":1,"112":1,"113":1,"114":1,"115":1,"116":1,"117":1,"118":1,"119":1,"120":1,"121":1,"122":2,"123":1,"124":1,"125":1,"127":1,"128":1,"129":6,"130":12,"131":1,"132":1};
const VC = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
// limits in characters for the English text; other languages may be up to 1.5 × longer (their words are longer)
const LIM = { kicker: 34, title: 64, sub: 120, slideTitle: 56, body: 250, refBody: 150, listItem: 72, wisdom: 220, by: 60, work: 90, arabic: 48, source: 120 };
const STRETCH = 1.5;

// ---------------------------------------------------------------- reporting ----------------------------------------
const problems = [];
const err = (file, where, msg) => problems.push({ level: "error", file, where, msg });
const warn = (file, where, msg) => problems.push({ level: "warn", file, where, msg });

// ---------------------------------------------------------------- helpers ------------------------------------------
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const EMOJI = /\p{Extended_Pictographic}/u;
const AR_MARKS = /[ۖ-ۭ﴾﴿]/; // Quranic annotation signs and ornate parentheses
const DU = /(^|[^\p{L}])(du|dich|dir|dein|deine|deinen|deinem|deiner|deines|ihr seid|euch|euer|eure|euren|eurem|eurer)(?![\p{L}])/iu;
const ARABIC = /[؀-ۿ]/;
export function parseVerse(s) {
  const m = /^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/.exec(String(s ?? ""));
  if (!m) return null;
  const su = Number(m[1]), a = Number(m[2]), to = m[3] ? Number(m[3]) : a;
  if (su < 1 || su > 114 || a < 1 || a > VC[su - 1] || to < a || to > VC[su - 1] || to - a > 2) return null;
  return { s: su, a, to, keys: Array.from({ length: to - a + 1 }, (_, i) => `${su}:${a + i}`) };
}
export function parseHadith(s) {
  const m = /^(bukhari|muslim|nawawi):(\d{1,4})$/.exec(String(s ?? ""));
  if (!m) return null;
  const n = Number(m[2]);
  return n >= 1 && n <= HADITH_MAX[m[1]] ? { c: m[1], n } : null;
}
export function parseDua(s) {
  const m = /^hisn:(\d{1,3}):(\d{1,2})$/.exec(String(s ?? ""));
  if (!m) return null;
  const h = Number(m[1]), i = Number(m[2]);
  return HISN[h] !== undefined && i < HISN[h] ? { h, i } : null;
}
function checkText(file, where, v, limit, { required = CORE, single = false } = {}) {
  if (!isObj(v)) { err(file, where, "missing text object {en, de, ar}"); return; }
  for (const l of required) if (typeof v[l] !== "string" || !v[l].trim()) err(file, where, `missing ${l}`);
  for (const [l, s] of Object.entries(v)) {
    if (!LOCALES.includes(l)) { err(file, where, `unknown language "${l}"`); continue; }
    if (typeof s !== "string") { err(file, `${where}.${l}`, "not a string"); continue; }
    checkString(file, `${where}.${l}`, s, l, limit, single);
  }
}
function checkString(file, where, s, lang, limit, single) {
  const max = lang === "en" ? limit : Math.round(limit * STRETCH);
  if (s.length > max) err(file, where, `too long (${s.length} > ${max} characters)`);
  if (EMOJI.test(s)) err(file, where, "emoji");
  if (single && /\n/.test(s)) err(file, where, "line break in a one-line text");
  if (/\s{2,}/.test(s.replace(/\n/g, " ")) || s !== s.trim()) warn(file, where, "extra spaces");
  if (AR_MARKS.test(s)) err(file, where, "Quranic annotation signs or ornate brackets: no Quran text in own words");
  if (lang === "de" && DU.test(s)) err(file, where, `informal address ("${DU.exec(s)[2]}"): use the Sie-form`);
  const caps = s.match(/\b[A-ZÄÖÜ]{6,}\b/g);
  if (caps) err(file, where, `all-caps word ${caps[0]}`);
  if (lang !== "ar" && lang !== "ur" && lang !== "fa" && lang !== "ps" && ARABIC.test(s) && s.replace(/[^؀-ۿ]/g, "").length > 12) warn(file, where, "long Arabic inside a non-Arabic text: put own Arabic in `arabic`");
}
function checkArabic(file, where, s) {
  if (typeof s !== "string" || !s.trim()) { err(file, where, "empty arabic"); return; }
  if (!ARABIC.test(s)) err(file, where, "arabic without Arabic letters");
  if (s.length > LIM.arabic) err(file, where, `arabic too long (${s.length} > ${LIM.arabic})`);
  if (AR_MARKS.test(s)) err(file, where, "Quranic signs in own Arabic");
}
function checkList(file, where, v) {
  if (!isObj(v)) { err(file, where, "list must be {en: [...], de: [...], ar: [...]}"); return; }
  const n = Array.isArray(v.en) ? v.en.length : 0;
  if (n < 2 || n > 6) err(file, where, `list needs 2–6 items (has ${n})`);
  for (const l of CORE) if (!Array.isArray(v[l])) err(file, where, `missing ${l}`);
  for (const [l, arr] of Object.entries(v)) {
    if (!LOCALES.includes(l)) { err(file, where, `unknown language "${l}"`); continue; }
    if (!Array.isArray(arr)) { err(file, `${where}.${l}`, "not a list"); continue; }
    if (arr.length !== n) err(file, `${where}.${l}`, `has ${arr.length} items, en has ${n}`);
    arr.forEach((s, i) => (typeof s === "string" && s.trim() ? checkString(file, `${where}.${l}[${i}]`, s, l, LIM.listItem, true) : err(file, `${where}.${l}[${i}]`, "empty item")));
  }
}
const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const listJson = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort() : []);

// ---------------------------------------------------------------- the files ----------------------------------------
const THEMES_FILE = path.join(BASE, "wisdom", "themes.json");
const themes = fs.existsSync(THEMES_FILE) ? readJson(THEMES_FILE) : {};

function loadSeries() {
  const out = [];
  for (const f of listJson(path.join(BASE, "data"))) {
    if (ONLY && !f.includes(ONLY)) continue;
    let d;
    try { d = readJson(path.join(BASE, "data", f)); } catch (e) { err(f, "file", `not valid JSON: ${e.message}`); continue; }
    out.push({ file: f, d });
  }
  return out;
}
function loadWisdom() {
  const out = [];
  for (const f of listJson(path.join(BASE, "wisdom"))) {
    if (f === "themes.json" || (ONLY && !f.includes(ONLY))) continue;
    let d;
    try { d = readJson(path.join(BASE, "wisdom", f)); } catch (e) { err(f, "file", `not valid JSON: ${e.message}`); continue; }
    out.push({ file: f, d });
  }
  return out;
}

const carouselIds = new Map(); // id → { file, slides }
const wisdomIds = new Map();

function checkSeries({ file, d }) {
  if (!isObj(d)) { err(file, "file", "not an object"); return []; }
  if (!/^[a-z0-9-]{2,60}$/.test(d.series ?? "")) err(file, "series", "series id: lowercase letters, digits, dashes");
  if (`${d.series}.json` !== file) warn(file, "series", `file name should be ${d.series}.json`);
  checkText(file, "label", d.label, LIM.kicker, { single: true });
  if (!TOPICS.includes(d.topic)) err(file, "topic", `topic must be one of ${TOPICS.join(", ")}`);
  if (d.tradition !== undefined && !TRADS.includes(d.tradition)) err(file, "tradition", "all | sunni | shia");
  if (!Array.isArray(d.items) || !d.items.length) { err(file, "items", "no items"); return []; }
  const rows = [];
  d.items.forEach((c, k) => {
    const at = `items[${k}]${c?.id ? ` ${c.id}` : ""}`;
    if (!isObj(c)) { err(file, at, "not an object"); return; }
    if (!/^[a-z0-9-]{3,80}$/.test(c.id ?? "")) err(file, at, "id: lowercase letters, digits, dashes (3–80)");
    else if (carouselIds.has(c.id)) err(file, at, `duplicate id (also in ${carouselIds.get(c.id).file})`);
    if (c.tradition !== undefined && !TRADS.includes(c.tradition)) err(file, `${at}.tradition`, "all | sunni | shia");
    if (c.topic !== undefined && !TOPICS.includes(c.topic)) err(file, `${at}.topic`, "unknown topic");
    if (c.palette !== undefined && !PALETTES.includes(c.palette)) err(file, `${at}.palette`, `one of ${PALETTES.join(", ")}`);
    if (c.needs_review !== true) err(file, `${at}.needs_review`, "must be true until a scholar has reviewed it");
    if (!isObj(c.cover)) { err(file, `${at}.cover`, "missing cover"); return; }
    if (c.cover.kicker) checkText(file, `${at}.cover.kicker`, c.cover.kicker, LIM.kicker, { single: true });
    checkText(file, `${at}.cover.title`, c.cover.title, LIM.title);
    if (c.cover.sub) checkText(file, `${at}.cover.sub`, c.cover.sub, LIM.sub);
    if (c.cover.arabic !== undefined) checkArabic(file, `${at}.cover.arabic`, c.cover.arabic);
    const slides = Array.isArray(c.slides) ? c.slides : [];
    if (slides.length < 3 || slides.length > 8) err(file, `${at}.slides`, `3–8 content slides (has ${slides.length}); with cover and final slide 5–10`);
    slides.forEach((s, i) => checkSlide(file, `${at}.slides[${i}]`, s));
    for (const [i, src] of (Array.isArray(c.sources) ? c.sources : []).entries()) {
      if (!isObj(src)) { err(file, `${at}.sources[${i}]`, "{label, url?}"); continue; }
      if (typeof src.label === "string") checkString(file, `${at}.sources[${i}].label`, src.label, "en", LIM.source, true);
      else checkText(file, `${at}.sources[${i}].label`, src.label, LIM.source, { required: ["en"], single: true });
      if (src.url !== undefined && !/^https:\/\/[^\s]+$/.test(src.url)) err(file, `${at}.sources[${i}].url`, "https URL");
    }
    if (c.sources !== undefined && !Array.isArray(c.sources)) err(file, `${at}.sources`, "a list");
    const hasRef = slides.some((s) => s && (s.verse || s.pair || s.hadith || s.dua));
    if (!hasRef && !(c.sources ?? []).length) warn(file, at, "no reference and no source: add a verse, hadith or a source");
    const trad = c.tradition ?? d.tradition ?? "all";
    if (slides.some((s) => s?.hadith || s?.dua) && trad === "all") warn(file, `${at}.tradition`, "hadith / Hisnul Muslim slides come from Sunni collections: tradition should be \"sunni\"");
    if (c.id) carouselIds.set(c.id, { file, slides: slides.length });
    rows.push({ id: `carousel:${c.id}`, kind: "carousel", stream: "carousel", ref: { c: c.id }, langs: ["*"], tradition: trad, topic: c.topic ?? d.topic, weight: 1, _c: c });
  });
  return rows;
}

function checkSlide(file, at, s) {
  if (!isObj(s)) { err(file, at, "not an object"); return; }
  const refs = ["verse", "pair", "hadith", "dua"].filter((k) => s[k] !== undefined);
  if (refs.length > 1) err(file, at, `one reference per slide (has ${refs.join(", ")})`);
  const known = new Set(["title", "body", "arabic", "list", "verse", "pair", "hadith", "dua", "check"]);
  for (const k of Object.keys(s)) if (!known.has(k)) err(file, at, `unknown field "${k}"`);
  if (s.title) checkText(file, `${at}.title`, s.title, LIM.slideTitle, { single: true });
  if (s.body) checkText(file, `${at}.body`, s.body, refs.length ? LIM.refBody : s.list ? LIM.refBody : LIM.body);
  if (s.list) checkList(file, `${at}.list`, s.list);
  if (s.arabic !== undefined) checkArabic(file, `${at}.arabic`, s.arabic);
  if (!refs.length && !s.title && !s.body && !s.list) err(file, at, "empty slide");
  if (!refs.length && !s.title) warn(file, at, "a text slide reads better with a title");
  if (s.verse !== undefined && !parseVerse(s.verse)) err(file, `${at}.verse`, `invalid verse "${s.verse}" (s:a or s:a-b, at most 3 verses)`);
  if (s.pair !== undefined && !(Array.isArray(s.pair) && s.pair.length === 2 && s.pair.every((k) => { const v = parseVerse(k); return v && v.keys.length === 1; }))) err(file, `${at}.pair`, "two single verse keys");
  if (s.hadith !== undefined && !parseHadith(s.hadith)) err(file, `${at}.hadith`, `invalid hadith "${s.hadith}" (bukhari|muslim|nawawi:<number>)`);
  if (s.dua !== undefined && !parseDua(s.dua)) err(file, `${at}.dua`, `invalid dua "${s.dua}" (hisn:<chapter>:<index>)`);
  if (refs.length && s.check === undefined) err(file, at, "a reference needs `check` (word(s) of the English source text)");
  if (refs.length && s.list) err(file, at, "no list on a reference slide");
}

function checkWisdom({ file, d }) {
  if (!isObj(d)) { err(file, "file", "not an object"); return []; }
  if (!/^[a-z0-9-]{2,60}$/.test(d.set ?? "")) err(file, "set", "set id: lowercase letters, digits, dashes");
  if (`${d.set}.json` !== file) warn(file, "set", `file name should be ${d.set}.json`);
  if (!["verse", "hadith", "saying", "reflection"].includes(d.kind)) err(file, "kind", "verse | hadith | saying | reflection");
  if (d.theme !== undefined && !themes[d.theme]) err(file, "theme", `unknown theme "${d.theme}" (wisdom/themes.json)`);
  if (!Array.isArray(d.items) || !d.items.length) { err(file, "items", "no items"); return []; }
  const rows = [];
  d.items.forEach((w, k) => {
    const at = `items[${k}]${w?.id ? ` ${w.id}` : ""}`;
    if (!isObj(w)) { err(file, at, "not an object"); return; }
    if (!/^[a-z0-9-]{3,80}$/.test(w.id ?? "")) err(file, at, "id: lowercase letters, digits, dashes");
    else if (wisdomIds.has(w.id)) err(file, at, `duplicate id (also in ${wisdomIds.get(w.id)})`);
    const theme = w.theme ?? d.theme;
    if (!theme || !themes[theme]) err(file, `${at}.theme`, `unknown theme "${theme}"`);
    const trad = w.tradition ?? d.tradition ?? (d.kind === "hadith" ? "sunni" : "all");
    if (!TRADS.includes(trad)) err(file, `${at}.tradition`, "all | sunni | shia");
    if (w.needs_review !== undefined && typeof w.needs_review !== "boolean") err(file, `${at}.needs_review`, "boolean");
    if (d.kind === "verse") { if (!parseVerse(w.verse)) err(file, `${at}.verse`, `invalid verse "${w.verse}"`); if (w.check === undefined) err(file, at, "missing check"); }
    else if (d.kind === "hadith") { if (!parseHadith(w.hadith)) err(file, `${at}.hadith`, `invalid hadith "${w.hadith}"`); if (w.check === undefined) err(file, at, "missing check"); if (trad === "all") warn(file, at, "hadith of the Sunni collections: tradition sunni"); }
    else {
      checkText(file, `${at}.text`, w.text, LIM.wisdom);
      if (w.arabic !== undefined) { if (typeof w.arabic !== "string" || !ARABIC.test(w.arabic)) err(file, `${at}.arabic`, "Arabic text"); else if (w.arabic.length > 260) err(file, `${at}.arabic`, "too long"); if (AR_MARKS.test(w.arabic ?? "")) err(file, `${at}.arabic`, "Quranic signs"); }
      if (d.kind === "saying") {
        checkText(file, `${at}.by`, w.by, LIM.by, { required: ["en"], single: true });
        checkText(file, `${at}.work`, w.work, LIM.work, { required: ["en"], single: true });
        if (w.needs_review !== true) err(file, `${at}.needs_review`, "a saying must be marked for review");
      }
    }
    if (w.id) wisdomIds.set(w.id, file);
    rows.push({ id: `wisdom:${w.id}`, kind: "wisdom", stream: `wisdom:${d.kind}`, ref: { w: w.id }, langs: ["*"], tradition: trad, topic: { verse: "tafsir", hadith: "hadith", saying: "scholars", reflection: "duas" }[d.kind] ?? "duas", weight: 1, _w: { ...w, kind: d.kind } });
  });
  return rows;
}

// i18n/<lang>/<file>.json: { "<id>": { "c.k": …, "c.t": …, "c.s": …, "<n>.t": …, "<n>.b": …, "<n>.l": [...] } } for a
// carousel, { "<id>": { "t": …, "b": …, "w": … } } for a wisdom post (text, by, work)
function checkI18n(seriesRows, wisdomRows) {
  const dir = path.join(BASE, "i18n");
  const cover = new Map(seriesRows.map((r) => [r.ref.c, r._c]));
  const wis = new Map(wisdomRows.map((r) => [r.ref.w, r._w]));
  const stats = {};
  if (!fs.existsSync(dir)) return stats;
  for (const lang of fs.readdirSync(dir).sort()) {
    if (!LOCALES.includes(lang) || CORE.includes(lang)) { if (!lang.startsWith(".")) err(`i18n/${lang}`, "dir", "not a translation language (en, de, ar are inline)"); continue; }
    const seen = new Set();
    for (const f of listJson(path.join(dir, lang))) {
      if (ONLY && !f.includes(ONLY)) continue;
      const file = `i18n/${lang}/${f}`;
      let d;
      try { d = readJson(path.join(dir, lang, f)); } catch (e) { err(file, "file", `not valid JSON: ${e.message}`); continue; }
      if (f === "labels.json") {
        for (const [k, v] of Object.entries(d)) if (typeof v !== "string" || !v.trim()) err(file, k, "empty label"); else checkString(file, k, v, lang, LIM.kicker, true);
        continue;
      }
      for (const [id, m] of Object.entries(d)) {
        if (!isObj(m)) { err(file, id, "not an object"); continue; }
        const c = cover.get(id), w = wis.get(id);
        if (!c && !w) { if (!ONLY) warn(file, id, "unknown id"); continue; }
        seen.add(id);
        for (const [k, v] of Object.entries(m)) {
          const where = `${id}.${k}`;
          if (c) {
            const mm = /^(c|\d)\.(k|t|s|b|l)$/.exec(k);
            if (!mm) { err(file, where, "key must be c.k|c.t|c.s or <slide>.t|.b|.l"); continue; }
            if (mm[1] === "c") {
              const lim = mm[2] === "k" ? LIM.kicker : mm[2] === "t" ? LIM.title : LIM.sub;
              if (mm[2] === "b" || mm[2] === "l") { err(file, where, "cover has k, t, s"); continue; }
              if (typeof v !== "string" || !v.trim()) err(file, where, "empty"); else checkString(file, where, v, lang, lim, mm[2] === "k");
            } else {
              const s = c.slides[Number(mm[1])];
              if (!s) { err(file, where, "no such slide"); continue; }
              if (mm[2] === "l") {
                if (!Array.isArray(v) || v.length !== (s.list?.en?.length ?? -1)) err(file, where, `list with ${s.list?.en?.length ?? 0} items`);
                else v.forEach((x, i) => (typeof x === "string" && x.trim() ? checkString(file, `${where}[${i}]`, x, lang, LIM.listItem, true) : err(file, `${where}[${i}]`, "empty")));
              } else if (mm[2] === "t" || mm[2] === "b") {
                const ref = s.verse || s.pair || s.hadith || s.dua || s.list;
                if (typeof v !== "string" || !v.trim()) err(file, where, "empty"); else checkString(file, where, v, lang, mm[2] === "t" ? LIM.slideTitle : ref ? LIM.refBody : LIM.body, mm[2] === "t");
              } else err(file, where, "slides have t, b, l");
            }
          } else {
            if (!["t", "b", "w"].includes(k)) { err(file, where, "wisdom keys: t (text), b (by), w (work)"); continue; }
            if (typeof v !== "string" || !v.trim()) err(file, where, "empty"); else checkString(file, where, v, lang, k === "t" ? LIM.wisdom : k === "b" ? LIM.by : LIM.work, k !== "t");
          }
        }
      }
    }
    const needC = seriesRows.length, needW = wisdomRows.filter((r) => r._w.text).length;
    const haveC = seriesRows.filter((r) => seen.has(r.ref.c)).length, haveW = wisdomRows.filter((r) => r._w.text && seen.has(r.ref.w)).length;
    stats[lang] = `${haveC}/${needC} carousels, ${haveW}/${needW} wisdom texts`;
  }
  return stats;
}

// ---------------------------------------------------------------- deep checks against the sources ------------------
function deepChecks(seriesRows, wisdomRows) {
  const tsv = (f) => {
    const p = path.join(REFS, f);
    if (!fs.existsSync(p)) return null;
    const m = new Map();
    for (const line of fs.readFileSync(p, "utf8").split("\n")) { const i = line.indexOf("\t"); if (i > 0) m.set(line.slice(0, i), line.slice(i + 1)); }
    return m;
  };
  const qen = tsv("quran-en.tsv"), qde = tsv("quran-de.tsv"), qar = tsv("quran-ar.tsv"), hisn = tsv("hisn-en.tsv");
  const had = { bukhari: tsv("hadith-bukhari.tsv"), muslim: tsv("hadith-muslim.tsv"), nawawi: tsv("hadith-nawawi.tsv") };
  if (!qen) { err("refs", REFS, "quran-en.tsv not found"); return; }
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  const normAr = (s) => s.normalize("NFKD").replace(/[ً-ٰٟۖ-ۭـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[^ء-ي\s]/g, " ").replace(/\s+/g, " ").trim();
  const grams = (s, n) => { const w = s.split(" ").filter(Boolean); const out = []; for (let i = 0; i + n <= w.length; i++) out.push(w.slice(i, i + n).join(" ")); return out; };
  const index = (map, n, f) => { const set = new Set(); if (map) for (const v of map.values()) for (const g of grams(f(v), n)) set.add(g); return set; };
  const EN_N = 8, DE_N = 8, AR_N = 6;
  const gEn = index(qen, EN_N, norm), gDe = index(qde, DE_N, norm), gAr = index(qar, AR_N, normAr);
  const textOf = (ref) => {
    if (ref.verse) { const v = parseVerse(ref.verse); return v ? v.keys.map((k) => qen.get(k) ?? "").join(" ") : ""; }
    if (ref.pair) return ref.pair.map((k) => qen.get(k) ?? "").join(" ");
    if (ref.hadith) { const h = parseHadith(ref.hadith); return h ? had[h.c]?.get(`${h.c}:${h.n}`) ?? null : ""; }
    if (ref.dua) { const t = hisn?.get(ref.dua); return t === undefined ? null : t.split("\t")[1] ?? ""; }
    return "";
  };
  const lenLimit = (ref) => (ref.verse ? 460 : ref.pair ? 520 : ref.hadith ? 720 : 560);
  const checkRef = (file, at, ref) => {
    const text = textOf(ref);
    if (text === null) { err(file, at, "the source has no text for this reference"); return; }
    if (!text) { err(file, at, "reference not found in the source texts"); return; }
    if (text.length > lenLimit(ref)) err(file, at, `the source text is too long for a slide (${text.length} > ${lenLimit(ref)} characters): choose a shorter verse/hadith`);
    if (ref.pair) {
      const words = Array.isArray(ref.check) ? ref.check : [ref.check];
      ref.pair.forEach((k, i) => { const w = words[i] ?? words[0]; if (w && !norm(qen.get(k) ?? "").includes(norm(String(w)))) err(file, at, `check "${w}" not in ${k}: "${(qen.get(k) ?? "").slice(0, 140)}"`); });
      return;
    }
    for (const w of Array.isArray(ref.check) ? ref.check : [ref.check]) {
      if (typeof w !== "string" || !w.trim()) { err(file, at, "empty check"); continue; }
      if (!norm(text).includes(norm(w))) err(file, at, `check "${w}" not in ${ref.verse ?? ref.hadith ?? ref.dua}: "${text.slice(0, 160)}"`);
    }
  };
  const copied = (file, at, s, lang, refText) => {
    if (typeof s !== "string") return;
    const hit = lang === "ar" ? grams(normAr(s), AR_N).find((g) => gAr.has(g)) : lang === "de" ? grams(norm(s), DE_N).find((g) => gDe.has(g)) : lang === "en" ? grams(norm(s), EN_N).find((g) => gEn.has(g)) : null;
    if (hit) err(file, at, `own text repeats Quran wording ("${hit}"): reference the verse instead of quoting it`);
    if (refText && lang === "en") { const rg = new Set(grams(norm(refText), EN_N)); const h2 = grams(norm(s), EN_N).find((g) => rg.has(g)); if (h2) err(file, at, `own text repeats the cited source ("${h2}")`); }
  };
  const allTexts = (v) => (isObj(v) ? Object.entries(v) : []);
  for (const r of seriesRows) {
    const c = r._c, file = `${c.id}`;
    for (const [k, v] of [["cover.title", c.cover?.title], ["cover.sub", c.cover?.sub], ["cover.kicker", c.cover?.kicker]]) for (const [l, s] of allTexts(v)) copied(file, `${k}.${l}`, s, l);
    (c.slides ?? []).forEach((s, i) => {
      const at = `slides[${i}]`;
      const ref = s.verse || s.pair || s.hadith || s.dua ? s : null;
      if (ref) checkRef(file, at, s);
      const rt = ref ? textOf(s) : "";
      for (const [l, x] of allTexts(s.title)) copied(file, `${at}.title.${l}`, x, l, rt);
      for (const [l, x] of allTexts(s.body)) copied(file, `${at}.body.${l}`, x, l, rt);
      for (const [l, arr] of allTexts(s.list)) (Array.isArray(arr) ? arr : []).forEach((x, j) => copied(file, `${at}.list.${l}[${j}]`, x, l, rt));
      if (s.arabic) copied(file, `${at}.arabic`, s.arabic, "ar");
    });
  }
  for (const r of wisdomRows) {
    const w = r._w;
    if (w.verse || w.hadith) checkRef(`wisdom ${w.id}`, w.id, w);
    for (const [l, s] of allTexts(w.text)) copied(`wisdom ${w.id}`, `text.${l}`, s, l);
  }
}

// ---------------------------------------------------------------- database -----------------------------------------
function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const f of ["/srv/tafsirflow/.env.db", path.join(ROOT, "..", ".env.db"), path.join(ROOT, ".env.db")]) {
    try { const m = /^\s*DATABASE_URL\s*=\s*(.+?)\s*$/m.exec(fs.readFileSync(f, "utf8")); if (m) return m[1].replace(/^["']|["']$/g, ""); } catch { /* next */ }
  }
  return null;
}
const UPSERT = `
INSERT INTO feed_items (id, kind, stream, kseq, ref, lang_tags, tradition, topic, weight)
SELECT t.id, t.kind, t.stream, t.kseq, t.ref::jsonb, string_to_array(t.langs, ','), t.tradition, t.topic, t.weight
  FROM unnest($1::text[], $2::text[], $3::text[], $4::int[], $5::text[], $6::text[], $7::text[], $8::text[], $9::real[])
       AS t(id, kind, stream, kseq, ref, langs, tradition, topic, weight)
ON CONFLICT (id) DO UPDATE SET kind = EXCLUDED.kind, stream = EXCLUDED.stream, kseq = EXCLUDED.kseq, ref = EXCLUDED.ref,
  lang_tags = EXCLUDED.lang_tags, tradition = EXCLUDED.tradition, topic = EXCLUDED.topic, weight = EXCLUDED.weight, updated_at = now()
WHERE (feed_items.kind, feed_items.stream, feed_items.kseq, feed_items.ref, feed_items.lang_tags, feed_items.tradition, feed_items.topic, feed_items.weight)
      IS DISTINCT FROM (EXCLUDED.kind, EXCLUDED.stream, EXCLUDED.kseq, EXCLUDED.ref, EXCLUDED.lang_tags, EXCLUDED.tradition, EXCLUDED.topic, EXCLUDED.weight)`;
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
      const r = await client.query(UPSERT, [b.map((x) => x.id), b.map((x) => x.kind), b.map((x) => x.stream), b.map((x) => x.kseq), b.map((x) => JSON.stringify(x.ref)),
        b.map((x) => x.langs.join(",")), b.map((x) => x.tradition), b.map((x) => x.topic), b.map((x) => x.weight)]);
      changed += r.rowCount ?? 0;
    }
    await client.query("CREATE TEMP TABLE carousel_keep (id text PRIMARY KEY) ON COMMIT DROP");
    await client.query("INSERT INTO carousel_keep SELECT unnest($1::text[]) ON CONFLICT DO NOTHING", [items.map((x) => x.id)]);
    const del = await client.query("DELETE FROM feed_items f WHERE f.kind = $1 AND NOT EXISTS (SELECT 1 FROM carousel_keep k WHERE k.id = f.id)", [kind]);
    await client.query("COMMIT");
    return { changed, removed: del.rowCount ?? 0 };
  } catch (e) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw e;
  }
}

// ---------------------------------------------------------------- main ---------------------------------------------
async function main() {
  const series = loadSeries(), sets = loadWisdom();
  const cRows = series.flatMap(checkSeries), wRows = sets.flatMap(checkWisdom);
  const i18n = checkI18n(cRows, wRows);
  if (REFS) deepChecks(cRows, wRows);
  const errors = problems.filter((p) => p.level === "error"), warnings = problems.filter((p) => p.level === "warn");
  for (const p of problems) if (p.level === "error" || !QUIET) console.log(`${p.level === "error" ? "ERROR" : "warn "} ${p.file} ${p.where}: ${p.msg}`);
  const slides = cRows.reduce((a, r) => a + (r._c.slides?.length ?? 0) + 2, 0);
  const byStream = {};
  for (const r of [...cRows, ...wRows]) byStream[r.stream] = (byStream[r.stream] ?? 0) + 1;
  const trad = {};
  for (const r of [...cRows, ...wRows]) trad[`${r.kind}:${r.tradition}`] = (trad[`${r.kind}:${r.tradition}`] ?? 0) + 1;
  console.log(`\ncarousels: ${cRows.length} in ${series.length} series (${slides} slides with cover and final slide)`);
  console.log(`wisdom:    ${wRows.length} in ${sets.length} sets`);
  console.log(`streams:   ${Object.entries(byStream).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  console.log(`tradition: ${Object.entries(trad).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  for (const [l, s] of Object.entries(i18n)) console.log(`i18n ${l}:   ${s}`);
  console.log(`${errors.length} errors, ${warnings.length} warnings${REFS ? " (with source checks)" : ""}`);
  if (flag("samples")) for (const r of [cRows[0], wRows[0]].filter(Boolean)) console.log(JSON.stringify({ ...r, _c: undefined, _w: undefined }));
  if (errors.length) { process.exitCode = 1; if (!DRY && !CHECK) console.log("nothing written: fix the errors first"); return; }
  if (CHECK || DRY) return;
  if (ONLY) { console.log("--only: nothing written (a partial load would prune the other ids)"); return; }

  const url = databaseUrl();
  if (!url) throw new Error("DATABASE_URL is not set and /srv/tafsirflow/.env.db was not found");
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const cols = new Set((await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'feed_items'")).rows.map((r) => r.column_name));
    if (!["id", "kind", "ref", "lang_tags", "tradition", "topic", "weight", "stream", "kseq"].every((c) => cols.has(c))) throw new Error("feed_items is missing or incomplete: apply db/schema.sql first (scripts/deploy.sh does)");
    for (const [kind, rows] of [["carousel", cRows], ["wisdom", wRows]]) {
      if (!rows.length) { console.log(`  ${kind}: no items, left as it is`); continue; }
      const r = await write(client, kind, number(rows.map(({ _c, _w, ...x }) => x)));
      console.log(`  wrote ${kind.padEnd(9)} ${String(r.changed).padStart(6)} new or changed, ${r.removed} removed`);
    }
    await client.query("ANALYZE feed_items").catch(() => undefined);
    const rows = (await client.query("SELECT kind, count(*)::int AS n FROM feed_items WHERE kind IN ('carousel','wisdom') GROUP BY kind ORDER BY kind")).rows;
    for (const r of rows) console.log(`  feed_items ${r.kind}: ${r.n}`);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(`carousels: ${e.stack || e.message}`); process.exit(1); });
