// The app's own texts (not the website's): writes the English source of every module that src/i18n/app/<lang>.json
// translates, so translations can be checked against it (node scripts/app-texts.mjs <out.json>), and checks a
// translated file against it (node scripts/app-texts.mjs --check <lang>).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// module name -> [file, variable, property of the variable holding English (or "" for the variable itself)]
export const MODULES = {
  dict: ["src/i18n/en.ts", "en", ""],
  radio: ["src/features/radio/strings.ts", "S", "en"],
  shams: ["src/features/shams/texts.ts", "T", "en"],
  learn: ["src/features/learn/texts.ts", "T", "en"],
  coursekit: ["src/features/coursekit/strings.ts", "S", "en"],
  extra: ["src/features/extra/strings.ts", "en", ""],
  progress: ["src/features/progress/text.ts", "TEXT", "en"],
  practice: ["src/features/practice/text.ts", "en", ""],
  daily: ["src/features/daily/DailyMoment.tsx", "T", "en"],
  alerts: ["src/features/practice/prayer/alerts.ts", "TX", "en"],
  dailyReminder: ["src/lib/daily.ts", "TEXTS", "en"],
  reader: ["src/features/reader/texts.ts", "T", "en"],
  hadith: ["src/features/hadith/texts.ts", "T", "en"],
  rankings: ["src/features/rankings/text.ts", "S", "en"],
};

function english(file, variable, prop) {
  const text = readFileSync(join(root, file), "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  let found;
  const visit = (n) => {
    if (ts.isVariableDeclaration(n) && n.name.getText(sf) === variable && n.initializer) found = n.initializer;
    if (!found) ts.forEachChild(n, visit);
  };
  visit(sf);
  if (!found) throw new Error(`${file}: ${variable} not found`);
  let node = found;
  while (ts.isAsExpression(node) || ts.isSatisfiesExpression?.(node) || ts.isParenthesizedExpression(node)) node = node.expression;
  if (prop) {
    const p = node.properties.find((x) => x.name?.getText(sf) === prop);
    if (!p) throw new Error(`${file}: ${variable}.${prop} not found`);
    node = p.initializer;
  }
  return new Function(`return (${node.getText(sf)});`)();
}

export function source() {
  const out = {};
  for (const [m, [f, v, p]] of Object.entries(MODULES)) out[m] = english(f, v, p);
  return out;
}

const shape = (v) => (typeof v === "string" ? "s" : Array.isArray(v) ? v.map(shape) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v);
function compare(a, b, path, errs) {
  if (typeof a === "string") {
    if (typeof b !== "string") return errs.push(`${path}: missing`);
    const pa = (a.match(/\{\w+\}/g) ?? []).sort().join(), pb = (b.match(/\{\w+\}/g) ?? []).sort().join();
    if (pa !== pb) errs.push(`${path}: placeholders ${pa} vs ${pb}`);
    return;
  }
  if (Array.isArray(a)) { if (!Array.isArray(b) || a.length !== b.length) return errs.push(`${path}: array length`); a.forEach((x, i) => compare(x, b[i], `${path}[${i}]`, errs)); return; }
  if (a && typeof a === "object") { for (const k of Object.keys(a)) compare(a[k], b?.[k], `${path}.${k}`, errs); for (const k of Object.keys(b ?? {})) if (!(k in a)) errs.push(`${path}.${k}: extra`); }
}

if (process.argv[2] === "--check") {
  const lang = process.argv[3];
  const tr = JSON.parse(readFileSync(join(root, `src/i18n/app/${lang}.json`), "utf8"));
  const errs = [];
  compare(source(), tr, lang, errs);
  console.log(errs.length ? errs.slice(0, 40).join("\n") + (errs.length > 40 ? `\n… ${errs.length} problems` : "") : `${lang}: complete`);
  process.exit(errs.length ? 1 : 0);
} else if (process.argv[2]) {
  writeFileSync(process.argv[2], JSON.stringify(source(), null, 1));
  console.log("wrote", process.argv[2]);
}
