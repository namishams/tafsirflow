#!/usr/bin/env node
// Copies the app's feed text tables (mobile/src/features/**/texts.ts, 14 languages each) into one JSON file per
// language for the website (src/lib/feedWeb/texts/<lang>.json), so the website feed says exactly what the app says.
// Run after the app texts change:  node scripts/extract-app-texts.mjs
// Modules: feed, know, prophet, game, share, tpl (share designer), radio (app-only radio strings).
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, "mobile", "src");
const OUT = path.join(ROOT, "src", "lib", "feedWeb", "texts");
const require = createRequire(import.meta.url);
const ts = require("typescript");

const MODULES = [
  ["feed", "features/feed/texts.ts", "TEXT"],
  ["know", "features/feed/knowTexts.ts", "TEXT"],
  ["prophet", "features/prophet/texts.ts", "TEXT"],
  ["game", "features/feed/gamifyTexts.ts", "TEXT"],
  ["share", "features/share/texts.ts", "TEXT"],
  ["tpl", "features/share/templateTexts.ts", "TEXT"],
  ["radio", "features/radio/strings.ts", "S"],
];
const LOCALES = ["de", "en", "ar", "tr", "ur", "fa", "ps", "fr", "es", "id", "ms", "bn", "ru", "zh"];

function stub() {
  const f = function () { return stub(); };
  return new Proxy(f, { get: (_t, p) => (p === Symbol.toPrimitive ? () => "" : p === "then" ? undefined : stub()), apply: () => stub(), construct: () => stub() });
}
function load(file, name) {
  const src = fs.readFileSync(path.join(APP, file), "utf8");
  const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React }, fileName: file }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(`${out}\nmodule.exports.__T = typeof ${name} !== "undefined" ? ${name} : null;`, { module, exports: module.exports, require: () => stub(), console }, { filename: file, timeout: 20000 });
  return JSON.parse(JSON.stringify(module.exports.__T));
}

const all = Object.fromEntries(LOCALES.map((l) => [l, {}]));
for (const [mod, file, name] of MODULES) {
  const t = load(file, name);
  if (!t || !t.en) throw new Error(`${file}: no table ${name}`);
  // the radio module is merged with the app's module json (mobile/src/i18n/app/<lang>.json, key "radio")
  for (const l of LOCALES) {
    let dict = t[l] ?? null;
    if (mod === "radio") {
      try { const j = JSON.parse(fs.readFileSync(path.join(APP, "i18n", "app", `${l}.json`), "utf8")); if (j.radio) dict = { ...(t.en ?? {}), ...(dict ?? {}), ...j.radio }; } catch { /* no module json */ }
    }
    if (dict) all[l][mod] = dict;
  }
}
fs.mkdirSync(OUT, { recursive: true });
for (const l of LOCALES) {
  fs.writeFileSync(path.join(OUT, `${l}.json`), JSON.stringify(all[l]) + "\n");
  console.log(l, Object.entries(all[l]).map(([m, d]) => `${m}:${Object.keys(d).length}`).join(" "));
}
