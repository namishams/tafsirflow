// Which message namespaces each part of the website needs in the browser.
//
// Every page used to send the whole message file (130–270 KB per language) to the browser. Only client components
// read messages there (server components translate on the server), so this script follows the imports from each
// layout and page, finds the "use client" modules below them and collects their useTranslations("namespace") calls.
// Output: src/i18n/client-namespaces.json – { core: [...], routes: { "<folder under (app)>": [...] } }.
// A client module that calls useTranslations() without a literal namespace makes its route take every namespace.
// next.config.mjs runs it at the start of every production build, so the file always matches the code being built;
// `node scripts/intl-namespaces.mjs --check` fails when the file in the tree is out of date. A folder gets its own,
// smaller set through a layout.tsx with <ClientMessages route="<folder>"> (src/i18n/ClientMessages.tsx);
// "@root" (the provider in the root layout) also carries the namespaces of folders that have no such layout yet.
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const SRC = join(ROOT, "src");
const APP = join(SRC, "app", "[locale]");
const OUT = join(SRC, "i18n", "client-namespaces.json");
const ALL = "*";

const EXT = [".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"];
function resolveImport(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null; // a package: never reads our messages
  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const e of EXT) if (existsSync(base + e)) return base + e;
  return null;
}

const cache = new Map();
function info(file) {
  if (cache.has(file)) return cache.get(file);
  const src = readFileSync(file, "utf8");
  const client = /^\s*(?:\/\/[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(src);
  const imports = new Set();
  // static imports and re-exports (skipping type-only ones), dynamic import() and require()
  for (const m of src.matchAll(/(?:^|\n)\s*(import|export)\s+(type\s+)?(?:[^"';]*?\sfrom\s+)?["']([^"']+)["']/g)) if (!m[2]) imports.add(m[3]);
  for (const m of src.matchAll(/\b(?:import|require)\(\s*["']([^"']+)["']\s*\)/g)) imports.add(m[1]);
  const ns = new Set();
  // a module that calls useTranslations() without a namespace can name the namespaces it reads in a comment:
  // "// intl-namespaces: nav home2"
  const declared = src.match(/\/\/\s*intl-namespaces:\s*([\w\s-]+)/)?.[1].trim().split(/\s+/);
  for (const m of src.matchAll(/\buseTranslations\(\s*([^)]*?)\s*\)/g)) {
    const arg = m[1];
    const lit = arg.match(/^["'`]([\w.-]+)["'`]$/);
    if (lit) ns.add(lit[1].split(".")[0]);
    else if (declared) for (const d of declared) ns.add(d);
    else ns.add(ALL); // no namespace or a computed one: anything may be read
  }
  if (/\buseMessages\(/.test(src)) ns.add(ALL);
  const deps = [...imports].map((s) => resolveImport(file, s)).filter(Boolean);
  const r = { client, deps, ns };
  cache.set(file, r);
  return r;
}

/** the namespaces the client modules reachable from `entry` read (entry itself is a server module) */
function collect(entry, out = new Set(), seen = new Set(), inClient = false) {
  const key = `${entry}|${inClient}`;
  if (seen.has(key)) return out;
  seen.add(key);
  const i = info(entry);
  const client = inClient || i.client;
  if (client) for (const n of i.ns) out.add(n);
  for (const d of i.deps) collect(d, out, seen, client);
  return out;
}

function files(dir, name) {
  const res = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) res.push(...files(p, name));
    else if (name.test(e.name)) res.push(p);
  }
  return res;
}
const ENTRY = /^(page|layout|template|loading|error|not-found|default)\.tsx?$/;

/** works out the namespaces; writes src/i18n/client-namespaces.json unless `dryRun` */
export function generateIntlNamespaces(dryRun = false) {
// core: the root layout and the app shell – rendered around every page
const core = new Set();
collect(join(APP, "layout.tsx"), core);
collect(join(APP, "(app)", "layout.tsx"), core);
for (const f of files(join(SRC, "app"), /^(not-found|error|global-error)\.tsx?$/)) collect(f, core);

// one entry per top-level folder of the app (its pages and layouts), plus the start page, account and admin
const routes = {};
const add = (name, dir, only) => {
  const set = new Set();
  const list = only ? only : files(dir, ENTRY);
  for (const f of list) collect(f, set);
  for (const n of core) set.delete(n);
  routes[name] = [...set].sort();
};
for (const e of readdirSync(join(APP, "(app)"), { withFileTypes: true })) if (e.isDirectory()) add(e.name, join(APP, "(app)", e.name));
add("@home", null, [join(APP, "page.tsx")]);
for (const e of readdirSync(APP, { withFileTypes: true })) if (e.isDirectory() && !e.name.startsWith("(")) add(`@${e.name}`, join(APP, e.name));

// the start page renders directly under the root layout, and so does every folder that has no layout with
// <ClientMessages route="…"> yet: the root layout's provider carries their namespaces too, so nothing is ever missing
const root = new Set(routes["@home"]);
for (const r of Object.keys(routes)) {
  if (r === "@home") continue;
  const dir = r.startsWith("@") ? join(APP, r.slice(1)) : join(APP, "(app)", r);
  const layout = join(dir, "layout.tsx");
  if (!existsSync(layout) || !readFileSync(layout, "utf8").includes(`route="${r}"`)) for (const n of routes[r]) root.add(n);
}
routes["@root"] = [...root].sort();

const result = { core: [...core].sort(), routes: Object.fromEntries(Object.entries(routes).sort(([a], [b]) => a.localeCompare(b))) };
const json = JSON.stringify(result, null, 1) + "\n";
if (!dryRun && (!existsSync(OUT) || readFileSync(OUT, "utf8") !== json)) writeFileSync(OUT, json);
return { result, json };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
const { json } = generateIntlNamespaces(true);
if (process.argv.includes("--check")) {
  const now = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (now !== json) { console.error(`${relative(ROOT, OUT)} is out of date: run node scripts/intl-namespaces.mjs`); process.exit(1); }
} else if (!existsSync(OUT) || readFileSync(OUT, "utf8") !== json) writeFileSync(OUT, json);
if (process.argv.includes("--print")) console.log(json);
}
