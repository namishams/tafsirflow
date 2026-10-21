// Checks that the app's copy of the website texts (src/web/messages, read by useWebT: legal pages, Shams, …) is the
// same as the website's messages/*.json, so the terms, the privacy policy and every shared text say the same in the
// app and on the website. Run before a build (npm run typecheck / npm run prebuild call it).
//   node scripts/check-web-messages.mjs         exit 1 and list the differences
//   node scripts/check-web-messages.mjs --fix   copy the website's files over the app's copy (what sync-web does for
//                                               the messages, without regenerating the rest of src/web)
import { copyFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, "..", "..", "messages");
const app = join(here, "..", "src", "web", "messages");
const fix = process.argv.includes("--fix");

const flat = (o, p = "", out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flat(v, key, out); else out[key] = JSON.stringify(v);
  }
  return out;
};

let bad = 0;
for (const name of readdirSync(site).filter((f) => f.endsWith(".json")).sort()) {
  const a = join(site, name), b = join(app, name);
  const same = existsSync(b) && readFileSync(a, "utf8") === readFileSync(b, "utf8");
  if (same) continue;
  if (fix) { copyFileSync(a, b); console.log(`copied ${name}`); continue; }
  bad++;
  if (!existsSync(b)) { console.log(`${name}: missing in the app`); continue; }
  const x = flat(JSON.parse(readFileSync(a, "utf8"))), y = flat(JSON.parse(readFileSync(b, "utf8")));
  const missing = Object.keys(x).filter((k) => !(k in y));
  const changed = Object.keys(x).filter((k) => k in y && x[k] !== y[k]);
  const extra = Object.keys(y).filter((k) => !(k in x));
  console.log(`${name}: ${missing.length} missing, ${changed.length} different, ${extra.length} only in the app${changed.length ? ` (e.g. ${changed.slice(0, 3).join(", ")})` : ""}`);
}
if (bad) {
  console.error(`\nThe app's website texts are out of date. Run: node scripts/check-web-messages.mjs --fix (or npm run sync-web).`);
  process.exit(1);
}
if (!fix) console.log("App and website texts are the same.");
