// Checks German UI texts for the informal "du" address (BLUEPRINT §2: German in the Sie-form). It reads the German
// tables of the app's text modules (the "de" object of a texts.ts / strings.ts file) and German namespaces of the
// website's messages/de.json, and lists every text with a du-pronoun or a du-imperative at the start of a sentence.
//   node scripts/check-sie-form.mjs            the Quran tab (reader, radio, search, recite, comments, reciters) – exit 1 on findings
//   node scripts/check-sie-form.mjs --all      every texts.ts / text.ts / strings.ts under src/features and all of de.json
//   node scripts/check-sie-form.mjs <file …>   only these files (.ts modules or a messages .json)
// It is a helper for review: a hit can be a false positive (a quotation, a dua addressed to Allah); those are listed
// in ALLOW below with the reason.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const app = join(here, "..");
const root = join(app, "..");

const DEFAULT_TS = [
  "src/features/reader/texts.ts",
  "src/features/radio/strings.ts",
  "src/features/extra/strings.ts",
  "src/features/reciters/texts.ts",
].map((f) => join(app, f));
const DEFAULT_JSON = [{ file: join(root, "messages", "de.json"), spaces: ["player", "reader", "radio", "recite", "social", "search", "home"] }];
// texts that are allowed to say "du" (none yet): exact text → reason
const ALLOW = new Map();

const PRONOUN = /(^|[^\p{L}])(du|dich|dir|dein|deine|deinen|deinem|deiner|deines|euch|euer|eure|euren|eurem|eurer)(?=$|[^\p{L}])/iu;
// imperatives of the du-form at the start of a sentence (not followed by "Sie")
const IMPERATIVE = /(^|[.!?:;–—]\s+|\n)(Tippe|Wische|Sprich|Nimm|Melde|Lerne|Hör|Höre|Versuch|Versuche|Prüfe|Gib|Frag|Nutze|Erlaube|Steigere|Sage|Decke|Bewerte|Wähle|Starte|Öffne|Lies|Schau|Teile|Speichere|Probier|Probiere|Komm|Mach|Sieh|Hilf|Bestätige|Erstelle|Lade|Bleib|Bleibe|Halte|Merke|Wiederhole|Achte|Folge|Lass|Setze|Schreib|Schreibe|Füge|Entdecke|Finde|Wechsle|Stelle|Denk|Denke|Erzähl|Erzähle|Sammle|Übe|Rezitiere)(?=[\s,!.])(?!\s+Sie\b)/u;

/** the source of the object literal that starts at the first "{" after `at` */
function objectAt(src, at) {
  let i = src.indexOf("{", at), depth = 0, str = null;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (str) { if (c === "\\") { j++; continue; } if (c === str) str = null; continue; }
    if (c === '"' || c === "'" || c === "`") { str = c; continue; }
    if (c === "/" && src[j + 1] === "/") { j = src.indexOf("\n", j); if (j < 0) break; continue; }
    if (c === "{") depth++;
    if (c === "}") { depth--; if (depth === 0) return { start: i, end: j + 1 }; }
  }
  return null;
}

/** the German texts of a TS module: every string literal inside its `de: {` / `const de = {` objects */
function germanOfTs(file) {
  const src = readFileSync(file, "utf8");
  const out = [];
  const re = /(?:^|[\s,{])(?:const\s+de\b[^=]*=|de\s*:)\s*\{/gm;
  let m;
  while ((m = re.exec(src))) {
    const o = objectAt(src, m.index + m[0].length - 1);
    if (!o) continue;
    const body = src.slice(o.start, o.end);
    const lit = /"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
    let s;
    while ((s = lit.exec(body))) {
      const text = s[1] ?? s[2] ?? "";
      if (text.length < 3) continue;
      const line = src.slice(0, o.start + s.index).split("\n").length;
      out.push({ where: `${relative(root, file)}:${line}`, text });
    }
    re.lastIndex = o.end;
  }
  return out;
}

/** the German texts of a messages file (only the given namespaces, or all) */
function germanOfJson(file, spaces) {
  const d = JSON.parse(readFileSync(file, "utf8"));
  const out = [];
  const walk = (o, path) => {
    if (typeof o === "string") { out.push({ where: `${relative(root, file)} ${path}`, text: o }); return; }
    if (Array.isArray(o)) { o.forEach((x, i) => walk(x, `${path}[${i}]`)); return; }
    if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, path ? `${path}.${k}` : k);
  };
  for (const k of spaces ?? Object.keys(d)) if (d[k] !== undefined) walk(d[k], k);
  return out;
}

function textModules(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...textModules(p));
    else if (/^(texts?|strings)\d*\.ts$/.test(name)) out.push(p);
  }
  return out;
}

const args = process.argv.slice(2);
let texts = [];
if (args.includes("--all")) {
  for (const f of textModules(join(app, "src", "features"))) texts.push(...germanOfTs(f));
  texts.push(...germanOfJson(join(root, "messages", "de.json")));
} else if (args.length) {
  for (const a of args) {
    const f = existsSync(a) ? a : join(process.cwd(), a);
    texts.push(...(f.endsWith(".json") ? germanOfJson(f) : germanOfTs(f)));
  }
} else {
  for (const f of DEFAULT_TS) texts.push(...germanOfTs(f));
  for (const { file, spaces } of DEFAULT_JSON) texts.push(...germanOfJson(file, spaces));
}

const hits = texts.filter(({ text }) => !ALLOW.has(text) && (PRONOUN.test(text) || IMPERATIVE.test(text)));
if (hits.length) {
  for (const h of hits) console.log(`${h.where}\n  ${h.text.length > 160 ? `${h.text.slice(0, 157)}…` : h.text}`);
  console.log(`\n${hits.length} German text(s) in the du-form. German UI texts use the Sie-form (BLUEPRINT §2).`);
  process.exit(1);
}
console.log(`German texts in the Sie-form (${texts.length} checked).`);
