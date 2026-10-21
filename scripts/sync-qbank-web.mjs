#!/usr/bin/env node
// Writes the exam centre's question bank (mobile/src/features/qbank/data/*.ts) as compact JSON per language for the
// website's server-side feed (src/lib/feedWeb/data/qbank-<lang>.json), so the web feed can show the same quiz
// questions as the app without importing from mobile/. Run after the bank changes:  node scripts/sync-qbank-web.mjs
//
// One entry per question id, in the bank's file order (the app's allQuestions(): the first copy of an id wins).
//   s subject · d difficulty (1-7) · tr tradition tags · v verse key · w word position · src source
//   rv review status ("needs_review" unless the question says otherwise, as the app) · q stem · o 4 options (o[0] is the
//   correct one) · e explanation
// German and Arabic fall back to the English text of a question that has none; every other language reads English
// (the app's qLangOf), so there is no file for them.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "mobile", "src", "features", "qbank", "data");
const OUT = path.join(ROOT, "src", "lib", "feedWeb", "data");
const require = createRequire(import.meta.url);
const ts = require("typescript");
const BANK_REVIEW = "needs_review"; // mobile/src/features/qbank/bank.ts BANK_REVIEW.status

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

// the bank files in the app's own order (BANK_FILES in data/index.ts)
const index = fs.readFileSync(path.join(DATA, "index.ts"), "utf8");
const files = [...index.matchAll(/require\("\.\/([^"]+)"\)/g)].map((m) => m[1]);
if (!files.length) throw new Error("no bank files found in data/index.ts");
const onDisk = fs.readdirSync(DATA).filter((f) => f.endsWith(".ts") && f !== "index.ts").map((f) => f.replace(/\.ts$/, ""));
const missing = onDisk.filter((f) => !files.includes(f));
if (missing.length) console.warn(`  ! not listed in BANK_FILES (the app does not load them either): ${missing.join(", ")}`);

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
for (const lang of ["en", "de", "ar"]) {
  const out = {};
  for (const q of all) {
    const loc = Array.isArray(q[lang]) && Array.isArray(q[lang][1]) && q[lang][1].length === 4 ? q[lang] : q.en;
    out[q.id] = {
      s: q.s, d: q.d, ...(q.tr?.length ? { tr: q.tr } : {}), ...(q.v ? { v: q.v } : {}), ...(q.w ? { w: q.w } : {}),
      src: q.src ?? "", rv: q.rv ?? BANK_REVIEW, q: loc[0], o: loc[1], e: loc[2] ?? "",
    };
  }
  const file = path.join(OUT, `qbank-${lang}.json`);
  fs.writeFileSync(file, JSON.stringify(out));
  console.log(`qbank-${lang}.json  ${Object.keys(out).length} questions  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}
