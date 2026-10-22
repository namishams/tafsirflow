// SEO audit of the seo data and (optionally) a running server.
//   node --experimental-strip-types scripts/seo-audit.mjs   checks src/lib/seo data (lengths, duplicates, link targets, FAQ)
//   node scripts/seo-audit.mjs http://localhost:3000   also crawls /sitemap.xml: title, description, canonical, hreflang, robots
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const locales = ["de", "en", "ar", "tr", "ur", "fa", "ps", "fr", "es", "id", "ms", "bn", "ru", "zh"];
let bad = 0;
const fail = (m) => { bad++; console.log("FAIL " + m); };

// the data files are plain TypeScript without runtime imports: node strips the types itself
const load = async (f) => (await import(f)).default;
const { LINK_TARGETS, WHY_SLUGS, FRESH_SLUGS } = await import(join(root, "src/lib/seo/types.ts"));
const targets = new Set(LINK_TARGETS);
const limit = (l) => (l === "zh" ? [36, 90] : [60, 155]);

for (const l of locales) {
  const [tmax, dmax] = limit(l);
  const pages = JSON.parse(readFileSync(join(root, `src/lib/seo/pages/${l}.json`), "utf8"));
  const seen = new Map();
  for (const [r, p] of Object.entries(pages)) {
    if (!p.title || !p.desc) fail(`${l} pages ${r}: missing title/desc`);
    if (p.title?.length > tmax) fail(`${l} pages ${r}: title ${p.title.length} > ${tmax}`);
    if (p.desc?.length > dmax) fail(`${l} pages ${r}: desc ${p.desc.length} > ${dmax}`);
    if (seen.has(p.title)) fail(`${l} duplicate title ${r} = ${seen.get(p.title)}`); seen.set(p.title, r);
  }
  try {
    const hubs = await load(join(root, `src/lib/seo/hubs/${l}.ts`));
    for (const [id, h] of Object.entries(hubs)) {
      if (h.title.length > tmax) fail(`${l} hub ${id}: title ${h.title.length}`);
      if (h.description.length > dmax) fail(`${l} hub ${id}: description ${h.description.length}`);
      if (h.faq.length < 4) fail(`${l} hub ${id}: faq < 4`);
      for (const [p] of [...h.links, ...h.sections.flatMap((s) => s.links ?? []), h.cta]) if (!targets.has(p)) fail(`${l} hub ${id}: link target ${p}`);
    }
    const titles = Object.values(hubs).map((h) => h.title); if (new Set(titles).size !== titles.length) fail(`${l} hubs: duplicate titles`);
  } catch (e) { fail(`${l} hubs: ${String(e.message).split("\n")[0]}`); }
  try {
    const arts = await load(join(root, `src/lib/seo/articles/${l}.ts`));
    for (const k of [...WHY_SLUGS.map((x) => `why/${x}`), ...FRESH_SLUGS.map((x) => `new-beginning/${x}`)]) {
      const a = arts[k];
      if (!a) { fail(`${l} article ${k}: missing`); continue; }
      if (a.title.length > tmax) fail(`${l} article ${k}: title ${a.title.length}`);
      if (a.description.length > dmax) fail(`${l} article ${k}: description ${a.description.length}`);
      for (const [p] of [...a.links, ...a.sections.flatMap((s) => s.links ?? []), a.cta]) if (!targets.has(p)) fail(`${l} article ${k}: link target ${p}`);
    }
  } catch (e) { fail(`${l} articles: ${String(e.message).split("\n")[0]}`); }
  try {
    const kw = await load(join(root, `src/lib/seo/keywords/${l}.ts`));
    for (const [r, k] of Object.entries(kw)) if (!k.focus || k.short.length + k.long.length > 100) fail(`${l} keywords ${r}: focus/size`);
  } catch (e) { fail(`${l} keywords: ${String(e.message).split("\n")[0]}`); }
}

const base = process.argv[2];
if (base) {
  const get = async (u) => (await fetch(u, { redirect: "manual" }));
  const idx = await (await get(`${base}/sitemap.xml`)).text();
  const files = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, base));
  const urls = [];
  for (const f of files) { const x = await (await get(f)).text(); for (const m of x.matchAll(/<url>\s*<loc>([^<]+)<\/loc>([\s\S]*?)<\/url>/g)) urls.push([m[1].replace(/^https?:\/\/[^/]+/, ""), m[2]]); }
  console.log(`${urls.length} sitemap URLs`);
  const titles = new Map();
  for (const [path, block] of urls) {
    const alts = [...block.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1]);
    if (alts.length !== locales.length + 1) fail(`${path}: sitemap hreflang count ${alts.length}`);
    if (!/^\/(surah|shams\/tadabbur|exams)/.test(path) || Math.random() < 0.02) {
      const r = await get(base + path); const h = await r.text();
      if (r.status !== 200) { fail(`${path}: HTTP ${r.status}`); continue; }
      const t = h.match(/<title>([^<]*)<\/title>/)?.[1], d = h.match(/<meta name="description" content="([^"]*)"/)?.[1];
      const canon = h.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
      const robots = h.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? "";
      if (!t) fail(`${path}: no title`); else { if (titles.has(t)) fail(`${path}: duplicate title with ${titles.get(t)}`); titles.set(t, path); }
      if (!d) fail(`${path}: no description`);
      if (!canon || !canon.endsWith(path)) fail(`${path}: canonical ${canon}`);
      if (/noindex/.test(robots)) console.log(`NOTE ${path}: ${robots}`);
      const hl = [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].length;
      if (hl !== locales.length + 1) fail(`${path}: page hreflang ${hl}`);
    }
  }
}
console.log(bad ? `${bad} problems` : "seo audit clean");
process.exit(bad ? 1 : 0);
