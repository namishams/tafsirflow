import { useCallback } from "react";
import de from "@/web/messages/de.json";
import en from "@/web/messages/en.json";
import { useLang } from "./index";

// The website's own UI texts (messages/de.json, messages/en.json, copied by scripts/sync-web.mjs), so screens ported
// from the website say exactly what the website says. useWebT("shams")("s1") -> "Hören".
type Tree = { [k: string]: string | Tree };
const DICTS: Record<string, Tree> = { de: de as Tree, en: en as Tree };

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
    const v = lookup(DICTS[lang], path) ?? lookup(DICTS.en, path);
    return v === undefined ? key : stripTags(formatWeb(v, params));
  }, [lang, namespace]);
}

/** does the key exist (for optional texts) */
export function hasWebT(lang: string, key: string): boolean {
  return lookup(DICTS[lang] ?? DICTS.en, key.split(".")) !== undefined;
}
