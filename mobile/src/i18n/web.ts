import { useCallback } from "react";
import en from "@/web/messages/en.json";
import { useLang } from "./index";

// The website's own UI texts in every language (messages/*.json, copied by scripts/sync-web.mjs), so screens ported
// from the website say exactly what the website says. useWebT("shams")("s1") -> "Hören". English is always loaded;
// another language is read the first time it is used.
export type Tree = { [k: string]: string | Tree };
/* eslint-disable @typescript-eslint/no-require-imports */
const LOAD: Record<string, () => unknown> = {
  de: () => require("@/web/messages/de.json"), ar: () => require("@/web/messages/ar.json"), tr: () => require("@/web/messages/tr.json"),
  ur: () => require("@/web/messages/ur.json"), fa: () => require("@/web/messages/fa.json"), ps: () => require("@/web/messages/ps.json"),
  fr: () => require("@/web/messages/fr.json"), es: () => require("@/web/messages/es.json"), id: () => require("@/web/messages/id.json"),
  ms: () => require("@/web/messages/ms.json"), bn: () => require("@/web/messages/bn.json"), ru: () => require("@/web/messages/ru.json"),
  zh: () => require("@/web/messages/zh.json"),
};
/* eslint-enable @typescript-eslint/no-require-imports */
const DICTS: Record<string, Tree> = { en: en as Tree };
/** the website's texts of one language as a tree (English when the language is unknown) */
export function webTree(lang: string): Tree {
  if (!DICTS[lang]) DICTS[lang] = (LOAD[lang]?.() as Tree | undefined) ?? DICTS.en;
  return DICTS[lang];
}

function lookup(tree: Tree, path: string[]): string | undefined {
  let v: string | Tree | undefined = tree;
  for (const k of path) v = typeof v === "object" ? v[k] : undefined;
  return typeof v === "string" ? v : undefined;
}

export function formatWeb(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, p: string) => (params[p] !== undefined ? String(params[p]) : `{${p}}`));
}

/** tags like <terms>…</terms> are removed, the inner text stays */
export const stripTags = (s: string) => s.replace(/<\/?[a-z]+>/g, "");

export function useWebT(namespace?: string) {
  const { lang } = useLang();
  return useCallback((key: string, params?: Record<string, string | number>) => {
    const path = [...(namespace ? namespace.split(".") : []), ...key.split(".")];
    const v = lookup(webTree(lang), path) ?? lookup(DICTS.en, path);
    return v === undefined ? key : stripTags(formatWeb(v, params));
  }, [lang, namespace]);
}

/** does the key exist (for optional texts) */
export function hasWebT(lang: string, key: string): boolean {
  return lookup(webTree(lang), key.split(".")) !== undefined;
}
