#!/usr/bin/env node
// Writes the examination centre's question bank (mobile/src/features/qbank/data/*.ts) for the website's own exam
// centre (/exams, src/components/learn/qbank): one compact JSON per question language in public/learn/qbank, fetched
// by the browser on first use (src/lib/learn/qbank/bank.ts), so the pages stay light; the content hash goes into
// src/lib/learn/qbank/bankVersion.ts so a changed bank is never served from an old cache. Run after the bank changes:
//   node scripts/sync-qbank-learn.mjs
//
// Same order and de-duplication as the app's allQuestions() (the first copy of an id wins). One row per question:
//   [id, subject, stage, tier, tags, source, traditions, verseKey, wordPos, review, stem, [4 options, option 0 correct],
//    explanation]
// German and Arabic fall back to the English text of a question that has none (the app's locOf).
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "mobile", "src", "features", "qbank", "data");
const OUT = path.join(ROOT, "public", "learn", "qbank");
const VERSION = path.join(ROOT, "src", "lib", "learn", "qbank", "bankVersion.ts");
const require = createRequire(import.meta.url);
const ts = require("typescript");

function stub() {
  const f = function () { return stub(); };
  return new Proxy(f, { get: (_t, p) => (p === Symbol.toPrimitive ? () => "" : p === "then" ? undefined : p === "length" ? 0 : stub()), apply: () => stub(), construct: () => stub() });
}
function loadTs(file) {
  const out = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: file,
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(out, { module, exports: module.exports, require: () => stub(), console }, { filename: file, timeout: 20_000 });
  return JSON.parse(JSON.stringify(module.exports, (_k, v) => (typeof v === "function" ? undefined : v)));
}

const index = fs.readFileSync(path.join(DATA, "index.ts"), "utf8");
const files = [...index.matchAll(/require\("\.\/([^"]+)"\)/g)].map((m) => m[1]);
if (!files.length) throw new Error("no bank files found in data/index.ts");

const seen = new Set();
const all = [];
for (const f of files) {
  const qs = loadTs(path.join(DATA, `${f}.ts`)).QS;
  if (!Array.isArray(qs)) throw new Error(`${f}: no QS array`);
  for (const q of qs) {
    if (typeof q?.id !== "string" || seen.has(q.id)) continue;
    if (!Array.isArray(q.en) || q.en.length < 3 || !Array.isArray(q.en[1]) || q.en[1].length !== 4) continue;
    seen.add(q.id);
    all.push(q);
  }
}

fs.mkdirSync(OUT, { recursive: true });
const hash = crypto.createHash("sha256");
const ok = (loc) => Array.isArray(loc) && loc.length >= 3 && Array.isArray(loc[1]) && loc[1].length === 4;
for (const lang of ["en", "de", "ar"]) {
  const rows = all.map((q) => {
    const loc = ok(q[lang]) ? q[lang] : q.en;
    return [q.id, q.s, q.g, q.d, q.t ?? [], q.src ?? "", q.tr ?? [], q.v ?? "", q.w ?? 0, q.rv ?? "", loc[0], loc[1], loc[2] ?? ""];
  });
  const file = path.join(OUT, `bank-${lang}.json`);
  const json = JSON.stringify(rows);
  hash.update(json);
  fs.writeFileSync(file, json);
  console.log(`bank-${lang}.json  ${rows.length} questions  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}
fs.writeFileSync(VERSION, `// written by scripts/sync-qbank-learn.mjs: content hash of public/learn/qbank/bank-*.json (cache busting)\nexport const BANK_VERSION = "${hash.digest("hex").slice(0, 12)}";\n/** questions in the bank (entry cards show it before the bank is loaded) */\nexport const BANK_COUNT = ${all.length};\n`);
console.log(`bankVersion.ts  ${VERSION}`);
