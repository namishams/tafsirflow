#!/usr/bin/env node
// Builds the catalog entries (names, books, real number ranges) of the further Sunni collections of
// fawazahmed0/hadith-api and writes them into mobile/src/features/hadith/catalog.ts and
// src/lib/learn/journey/hadithCatalog.ts. Only metadata: texts are loaded at run time. Never types a hadith.
// The API's section table has gaps and overlaps (empty book 0, wrong first numbers), so the ranges are taken from the
// hadith each section file really contains, and books without hadith are left out.
// Usage: node scripts/sync-hadith.mjs
import { readFileSync, writeFileSync } from "node:fs";

const CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";
const KEYS = ["abudawud", "tirmidhi", "nasai", "ibnmajah", "malik", "qudsi", "dehlawi"];
const get = async (u) => { for (let i = 0; i < 4; i++) { try { const r = await fetch(u); if (r.ok) return await r.json(); } catch {} await new Promise((r) => setTimeout(r, 500 * (i + 1))); } throw new Error(u); };

const eds = await get(`${CDN}/editions.json`);
const out = [];
for (const key of KEYS) {
  const e = eds[key];
  const editions = e.collection.map((x) => x.name).filter((n) => !/\d$/.test(n));
  const meta = await get(`${CDN}/editions/eng-${key}.json`).catch(() => get(`${CDN}/editions/ara-${key}.json`));
  const names = meta.metadata.sections ?? meta.metadata.section ?? {};
  const details = meta.metadata.section_details ?? {};
  const ns = Object.keys(details).map(Number).sort((a, b) => a - b);
  const sections = [];
  let max = 0;
  const seen = new Set();
  for (let i = 0; i < ns.length; i += 8) {
    await Promise.all(ns.slice(i, i + 8).map(async (n) => {
      const d = await get(`${CDN}/editions/ara-${key}/sections/${n}.min.json`);
      const nums = d.hadiths.map((h) => h.hadithnumber).filter((x) => Number.isFinite(x) && x > 0);
      nums.forEach((x) => seen.add(x));
      if (!nums.length) return;
      sections.push({ n, name: String(names[String(n)] || "").trim() || `Book ${n}`, first: Math.min(...nums), last: Math.max(...nums), count: nums.length });
    }));
  }
  sections.sort((a, b) => a.n - b.n);
  max = Math.max(...seen);
  out.push({ key, name: e.name, editions, max, count: seen.size, sections });
  console.error(key, "books", sections.length, "hadith", seen.size, "max", max, "of", ns.length, "sections in table");
}
const write = (file, fn) => {
  let s = readFileSync(file, "utf8");
  const m = /export const SUNNI_COLLECTIONS: SunniCollection\[\] = (\[.*\]);\n/.exec(s);
  const list = JSON.parse(m[1]).filter((c) => !KEYS.includes(c.key));
  s = s.replace(m[0], `export const SUNNI_COLLECTIONS: SunniCollection[] = ${JSON.stringify([...list, ...out.map(fn)])};\n`);
  writeFileSync(file, s);
};
write("mobile/src/features/hadith/catalog.ts", (c) => ({ key: c.key, name: c.name, editions: c.editions, max: c.max, count: c.count, sections: c.sections }));
write("src/lib/learn/journey/hadithCatalog.ts", (c) => ({ key: c.key, name: c.name, editions: c.editions, max: c.max }));
