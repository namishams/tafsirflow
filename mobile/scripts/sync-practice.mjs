// Copies the content that the website keeps inside its daily-practice pages and components (page texts, hadith with
// their references, the trainers' UI texts, the drawings' paths, the Arabic lines of the page heroes) into
// mobile/src/features/practice/web/, byte for byte, so nothing religious is typed by hand in the app.
// Run after changing those website files:  node scripts/sync-practice.mjs   (from mobile/)
//   node scripts/sync-practice.mjs --out <dir>   writes the files into <dir> instead (to compare before applying)
// sync-web.mjs mirrors src/lib; this script covers what still lives in src/app and src/components.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, "..", "..");
const appWeb = join(here, "..", "src", "web");
const outAt = process.argv.indexOf("--out");
if (outAt > 0 && !process.argv[outAt + 1]) throw new Error("--out needs a folder");
const out = outAt > 0 ? resolve(process.argv[outAt + 1]) : join(here, "..", "src", "features", "practice", "web");
const page = (route) => join(site, "src", "app", "[locale]", "(app)", route, "page.tsx");
const comp = (name) => join(site, "src", "components", `${name}.tsx`);

const parse = (file) => {
  const src = readFileSync(file, "utf8");
  return { src, sf: ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX) };
};

// The website cuts the verses it quotes as decoration out of the Quran data: verseQuote(…) and quoteRing(…) from
// src/lib/verseQuotes.ts, reading src/lib/data/verse-quotes.json (written by scripts/gen-verse-quotes.mjs from Quran.com).
// Those calls are resolved here with the same module and the same data, so the app gets exactly the words the website
// shows, as a string, and nothing is typed by hand.
const quotes = await (async () => {
  const lib = join(site, "src", "lib");
  const data = readFileSync(join(lib, "data", "verse-quotes.json"), "utf8");
  const js = ts.transpileModule(readFileSync(join(lib, "verseQuotes.ts"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const inlined = js.replace(/^import QUOTES from "\.\/data\/verse-quotes\.json";?$/m, `const QUOTES = ${data};`);
  if (inlined === js) throw new Error("src/lib/verseQuotes.ts: the import of data/verse-quotes.json was not found");
  return import(`data:text/javascript;base64,${Buffer.from(inlined).toString("base64")}`);
})();
const QUOTE_CALLS = new Set(["verseQuote", "quoteRing"]);
const isQuoteCall = (n) => ts.isCallExpression(n) && ts.isIdentifier(n.expression) && QUOTE_CALLS.has(n.expression.text);
/** the text a verseQuote(…) / quoteRing(…) call of the website renders (the website passes only literals) */
function quoteOf(call, sf) {
  const code = call.getText(sf);
  const text = new Function("verseQuote", "quoteRing", `return (${code});`)(quotes.verseQuote, quotes.quoteRing);
  if (typeof text !== "string" || !text) throw new Error(`${code}: no text`);
  return text;
}
/** the source of a node with every verseQuote(…) / quoteRing(…) call in it replaced by the text it renders */
function withQuotes(src, sf, node) {
  const calls = [];
  // (no return value: forEachChild stops at the first child whose callback returns something truthy)
  const visit = (n) => { if (isQuoteCall(n)) calls.push(n); else ts.forEachChild(n, visit); };
  visit(node);
  const start = node.getStart(sf);
  let text = src.slice(start, node.end);
  for (const c of calls.reverse()) text = text.slice(0, c.getStart(sf) - start) + JSON.stringify(quoteOf(c, sf)) + text.slice(c.end - start);
  return text;
}

const topName = (st, sf) => {
  if (ts.isVariableStatement(st)) return st.declarationList.declarations[0].name.getText(sf);
  if (ts.isTypeAliasDeclaration(st) || ts.isFunctionDeclaration(st) || ts.isInterfaceDeclaration(st)) return st.name?.getText(sf) ?? null;
  return null;
};
// the names a declaration refers to (not the property names it declares or reads: { a: 1 }, x.a, { a: string }, and
// not the verseQuote(…) / quoteRing(…) calls, which are copied as the text they render)
function referenced(node) {
  const names = new Set();
  const visit = (n) => {
    if (isQuoteCall(n)) return;
    if (ts.isIdentifier(n)) {
      const p = n.parent;
      const isPropName = p && ((ts.isPropertyAssignment(p) || ts.isPropertySignature(p) || ts.isPropertyDeclaration(p) || ts.isMethodDeclaration(p) || ts.isEnumMember(p)) && p.name === n
        || ts.isPropertyAccessExpression(p) && p.name === n || ts.isQualifiedName(p) && p.right === n);
      if (!isPropName) names.add(n.text);
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return names;
}
// the website file's imports by local name: { from, imported, isType, isDefault }
function importsOf(sf) {
  const map = new Map();
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause) continue;
    const from = st.moduleSpecifier.text, typeOnly = st.importClause.isTypeOnly;
    if (st.importClause.name) map.set(st.importClause.name.text, { from, imported: "default", isType: typeOnly, isDefault: true });
    const nb = st.importClause.namedBindings;
    if (nb && ts.isNamedImports(nb)) for (const el of nb.elements) map.set(el.name.text, { from, imported: (el.propertyName ?? el.name).text, isType: typeOnly || el.isTypeOnly, isDefault: false });
  }
  return map;
}
// "@/lib/<module>" of the website is "@/web/<module>" in the app, its language list "@/i18n/locales" is "@/web/locales"
// (both mirrored by sync-web.mjs)
function appModule(from, file, name) {
  const m = from === "@/i18n/locales" ? [from, "locales"] : /^@\/lib\/(.+)$/.exec(from);
  const mirrored = m && [".ts", ".tsx", "/index.ts"].some((ext) => existsSync(join(appWeb, `${m[1]}${ext}`)));
  if (!mirrored) throw new Error(`${file}: the copied declarations use ${name} from "${from}", which the app does not mirror (sync-web.mjs mirrors src/lib)`);
  return `@/web/${m[1]}`;
}
// import lines for the given names of a website file, pointing at the app's mirror of src/lib
function importLines(sf, file, names) {
  const imports = importsOf(sf);
  const byModule = new Map();
  for (const name of names) {
    const im = imports.get(name);
    if (!im) continue;
    const mod = appModule(im.from, file, name);
    const list = byModule.get(mod) ?? [];
    list.push({ name, ...im });
    byModule.set(mod, list);
  }
  const lines = [];
  for (const [mod, list] of [...byModule].sort(([a], [b]) => a.localeCompare(b))) {
    const def = list.find((x) => x.isDefault);
    const named = list.filter((x) => !x.isDefault).map((x) => ({ ...x, text: x.imported === x.name ? x.name : `${x.imported} as ${x.name}` }));
    const byName = (a, b) => a.text.localeCompare(b.text, "en", { sensitivity: "base" });
    if (def) lines.push(`import ${def.isType ? "type " : ""}${def.name} from "${mod}";`);
    if (!named.length) continue;
    if (named.every((x) => x.isType)) lines.push(`import type { ${named.sort(byName).map((x) => x.text).join(", ")} } from "${mod}";`);
    else lines.push(`import { ${[...named.filter((x) => !x.isType).sort(byName).map((x) => x.text), ...named.filter((x) => x.isType).sort(byName).map((x) => `type ${x.text}`)].join(", ")} } from "${mod}";`);
  }
  return lines;
}

// top-level declarations by name, verbatim (verse quotes resolved), exported, preceded by the imports they need: what
// they use from src/lib comes from the app's mirror in src/web (so a type the website moves into src/lib, like the
// trainers' Lang, follows automatically); `also` names further imports of the file to bring along (for re-exports)
function decls(file, names, also = []) {
  const { src, sf } = parse(file);
  const found = new Map();
  const declared = new Set();
  const uses = new Set(also);
  for (const st of sf.statements) {
    const name = topName(st, sf);
    if (name) declared.add(name);
    if (name && names.includes(name)) {
      const text = withQuotes(src, sf, st);
      found.set(name, /^export\s/.test(text) ? text : `export ${text}`);
      for (const r of referenced(st)) uses.add(r);
    }
  }
  const missing = names.filter((n) => !found.has(n));
  if (missing.length) throw new Error(`${file}: missing ${missing.join(", ")}`);
  // a declaration of the file that the copied ones use but that is not copied would leave the app's copy broken
  const left = [...uses].filter((n) => declared.has(n) && !names.includes(n));
  if (left.length) throw new Error(`${file}: the copied declarations use ${left.join(", ")} – add them to the list`);
  const imports = importLines(sf, file, [...uses].filter((n) => !names.includes(n)));
  return [...imports, ...names.map((n) => found.get(n))].join("\n");
}

const ARABIC = /[؀-ۿ]/;
// literal Arabic JSX texts of a file, in source order
function arabicJsx(file) {
  const { sf } = parse(file);
  const texts = [];
  const visit = (n) => {
    if (ts.isJsxText(n) && ARABIC.test(n.text)) texts.push(n.text.trim());
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return texts;
}
// the Arabic line of a page hero (<p className="… font-arabic …">ARABIC <span>(ref)</span></p>, ARABIC being literal
// text or a verse cut from the Quran data with {verseQuote(…)}) and its literal ref
function heroLine(file) {
  const { sf } = parse(file);
  let hit = null;
  const visit = (n) => {
    if (!hit && ts.isJsxElement(n)) {
      const cls = n.openingElement.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === "className");
      const v = cls && cls.initializer && ts.isStringLiteral(cls.initializer) ? cls.initializer.text : "";
      if (/\bfont-arabic\b/.test(v)) {
        const text = n.children.find((c) => ts.isJsxText(c) && ARABIC.test(c.text));
        const quote = text ? null : n.children.find((c) => ts.isJsxExpression(c) && c.expression && isQuoteCall(c.expression));
        if (text || quote) {
          const span = n.children.find((c) => ts.isJsxElement(c));
          // a literal ref like "(40:60)"; "" when the page fills it from its texts (heroRef)
          const literal = span && !span.children.some((c) => ts.isJsxExpression(c));
          const ref = literal ? span.children.filter((c) => ts.isJsxText(c)).map((c) => c.text).join("").trim() : "";
          hit = { ar: text ? text.text.trim() : quoteOf(quote.expression, sf), ref };
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  if (!hit) throw new Error(`${file}: no Arabic hero line`);
  return hit;
}
// decorative Arabic words: <CalligraphyDraw text={"…"} /> and <PracticeHero word="…" />
function word(file) {
  const src = readFileSync(file, "utf8");
  const m = /CalligraphyDraw text=\{"([^"]+)"\}/.exec(src) ?? /PracticeHero[^>]*\bword="([^"]+)"/.exec(src);
  if (!m) throw new Error(`${file}: no calligraphy word`);
  return m[1];
}

const HEAD = "// Generated by scripts/sync-practice.mjs from the website. Do not edit by hand.\n/* eslint-disable */\n";
mkdirSync(out, { recursive: true });
const write = (name, body) => writeFileSync(join(out, `${name}.ts`), `${HEAD}${body}\n`);

// geometry of the practice art (arch window, stars)
write("practiceArt", decls(join(site, "src", "components", "art", "PracticeArt.tsx"), ["archPath", "starPath"]));
// /wudu page: texts, the hadith on the virtue of wudu with their sources, further links
// (VIRTUE_VERSE: the end of 2:222 from the Quran data, used in every language's list of virtues)
// (C is typed Record<Lang, Content>: Content comes along, Lang from the app's src/web)
write("wuduPage", decls(page("wudu"), ["Virtue", "VIRTUE_VERSE", "Content", "C"]));
// /salah page
write("salahPage", decls(page("salah"), ["Content", "C"]));
// The trainers' language type (Lang) and the prayer trainer's text type (Tx, now L2) moved from the components into
// src/lib/salah; the app's trainers import both from these files, so they are re-exported under their old names.
// prayer trainer: UI texts and the figure's joints for every posture
write("prayerTrainer", `${decls(comp("PrayerTrainer"), ["UiKey", "UI", "P", "Pose", "STAND", "SIT", "POSES", "KEYS", "ease", "lerpPose"], ["Lang", "L2"])}
export type { Lang };
/** the texts of a step (title, meaning, note): the website's L2 */
export type Tx = L2;`);
// wudu trainer: UI texts, Arabic counts, the drawing's paths and colours
write("wuduTrainer", `${decls(comp("WuduTrainer"), ["UiKey", "Ui", "UI", "AR_TIMES", "GOLD", "WATER", "DROP", "HEAD", "HAIR", "FACE", "EAR", "LIPS", "NOSE", "HAND", "ARM", "FOOT", "INSTEP", "arc", "slips", "shuffle"], ["Lang"])}
export type { Lang };`
  + `\nexport const DONE_AR = ${JSON.stringify(arabicJsx(comp("WuduTrainer"))[0])};`);
// prayer board: the Arabic names of the prayer times
write("prayerBoard", decls(comp("PrayerBoard"), ["AR_NAME"]));
// sunnah duas: reading-mode texts, the Arabic names of the hadith collections for Arabic readers
write("sunnahDuas", decls(comp("SunnahDuas"), ["UiText", "UI", "SRC_AR", "srcAr"]));
// name finder: the "father" line of a classical name, the Hijri month of a birth date, the hadith on the most beloved names
{
  const ar = arabicJsx(comp("NameGenerator"));
  if (ar.length !== 1) throw new Error(`NameGenerator: expected one Arabic text, found ${ar.length}`);
  write("nameGenerator", `${decls(comp("NameGenerator"), ["FAV_KEY", "hijriOfInput", "classicalName"])}\nexport const ABD_HADITH_AR = ${JSON.stringify(ar[0])};`);
}
// dua generator: the hadith whose etiquette the personal dua follows (named in the head comment of lib/duaGenerator.ts)
{
  const src = readFileSync(join(site, "src", "lib", "duaGenerator.ts"), "utf8");
  const m = /taught in the hadith of ([^(\n]+?)\s*\n?\/\/\s*\(([^)]+)\)/.exec(src) ?? /hadith of ([^(]+?)\s*\(([^)]+)\)/.exec(src.replace(/\n\/\/ /g, " "));
  if (!m) throw new Error("duaGenerator.ts: hadith reference not found");
  write("duaEtiquette", `export const ETIQUETTE_HADITH = ${JSON.stringify({ narrator: m[1].trim(), refs: m[2].trim() })} as const;`);
}
// Arabic lines and words of the page heroes
{
  const heroes = {
    calendar: { ...heroLine(page("calendar")), word: word(page("calendar")) },
    duaGenerator: { ...heroLine(page("dua-generator")), word: word(page("dua-generator")) },
    names: { ...heroLine(page("names")), word: word(page("names")) },
    wudu: { ar: "", ref: "", word: word(page("wudu")) },
    salah: { ar: "", ref: "", word: word(page("salah")) },
    duas: { ar: "", ref: "", word: word(page("duas")) },
  };
  write("heroes", `export const HEROES = ${JSON.stringify(heroes, null, 2)} as const;`);
}
console.log(`practice content written to ${out}`);
