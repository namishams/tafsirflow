// SEO texts (title, description) of the learn pages in the languages beyond German, English and Arabic.
// Each src/components/learn/<module>/meta.ts keeps its own en/de/ar table; the other languages live next to it in
// meta.i18n.json ({ "<lang>": { the same keys as the English table } }), written by the translation merge.
// Server-safe (plain JSON, no hooks). Every key a language does not have yet falls back to English, so a page never
// loses its title. The native app has no SEO metadata, so these files exist only on the website.
type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);

/** the translation entry of one language in a meta.i18n.json file (null when there is none) */
export function seoRaw(file: unknown, locale: string): Obj | null {
  if (!isObj(file)) return null;
  const v = file[locale];
  return isObj(v) ? v : null;
}

function over(base: unknown, tr: unknown): unknown {
  if (typeof base === "string") return typeof tr === "string" && tr.trim() ? tr : base;
  if (isObj(base)) {
    const out: Obj = {};
    for (const k of Object.keys(base)) out[k] = over(base[k], isObj(tr) ? tr[k] : undefined);
    return out;
  }
  return base; // functions and other values stay as they are
}

/** the English table with the translated keys of this language laid over it; null when the language has none */
export function seoOver<T>(en: T, file: unknown, locale: string): T | null {
  const tr = seoRaw(file, locale);
  return tr ? (over(en, tr) as T) : null;
}

/** a translated string at a path ("lesson", "title"), or undefined */
export function seoString(file: unknown, locale: string, ...path: string[]): string | undefined {
  let v: unknown = seoRaw(file, locale);
  for (const k of path) v = isObj(v) ? v[k] : undefined;
  return typeof v === "string" && v.trim() ? v : undefined;
}

/** "{n}" placeholders filled from the values */
export const seoFill = (text: string, v: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (m, k: string) => (v[k] !== undefined ? String(v[k]) : m));

/** one word in every language the file has ({ fr: "…", tr: "…" }), for the L tables of the course kit */
export function seoWords(file: unknown, ...path: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  if (!isObj(file)) return out;
  for (const lang of Object.keys(file)) {
    const s = seoString(file, lang, ...path);
    if (s) out[lang] = s;
  }
  return out;
}
