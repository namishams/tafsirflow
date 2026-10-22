"use client";
// mirrors mobile/src/features/shams2/rec/text.ts (copied for the website; keep in step with the app). The eleven further
// languages are the app's files, copied to ./i18n/<lang>.json and loaded the first time a language is used.
// Wording rule: speech recognition reports "words heard" and "possibly missed" – never a pronunciation or tajweed
// score; the pronunciation rating is the learner's own or a teacher's, and says so.
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useLang } from "@/lib/learn/i18n";
import { useIntl } from "@/lib/learn/srs/format";

import { ar, de, en, type RecKey, type T } from "./strings";

export type { RecKey };
const LANGS = new Set(["tr", "ur", "fa", "ps", "fr", "es", "id", "ms", "bn", "ru", "zh"]);
const bundles = new Map<string, Partial<T> | null>();
const loading = new Set<string>();
const subs = new Set<() => void>();
let ver = 0;
function loadBundle(lang: string) {
  if (!LANGS.has(lang) || bundles.has(lang) || loading.has(lang)) return;
  loading.add(lang);
  import(`./i18n/${lang}.json`)
    .then((m: { default: Partial<T> }) => { bundles.set(lang, m.default); })
    .catch(() => { bundles.set(lang, null); })
    .finally(() => { loading.delete(lang); cache.delete(lang); ver++; subs.forEach((f) => f()); });
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
const cache = new Map<string, T>();
export function recText(lang: string): T {
  if (lang === "de") return de;
  if (lang === "ar") return ar;
  if (lang === "en" || !LANGS.has(lang)) return en;
  let d = cache.get(lang);
  if (!d) {
    const tr = bundles.get(lang);
    if (!tr) return en;
    d = { ...en, ...tr };
    cache.set(lang, d);
  }
  return d;
}
const fill = (s: string, p?: Record<string, string | number>) => (p ? s.replace(/\{(\w+)\}/g, (_, x: string) => String(p[x] ?? "")) : s);
export type Rt = (k: RecKey, p?: Record<string, string | number>) => string;
/** texts of the recitation trainer, plus the number format */
export function useRec() {
  const { lang } = useLang();
  const nf = useIntl();
  useSyncExternalStore(subscribe, () => ver, () => 0);
  useEffect(() => { loadBundle(lang); }, [lang]);
  const d = recText(lang);
  const r: Rt = useCallback((k, p) => fill(d[k] ?? en[k] ?? k, p), [d]);
  return { r, nf, lang };
}
export const EN_REC = en;
