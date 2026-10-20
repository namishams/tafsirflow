import { useLang } from "@/i18n";
import { webTree, type Tree } from "@/i18n/web";

// The website's texts with their rich-text tags kept (<privacy>…</privacy>, <terms>…</terms>), which useWebT() strips:
// the app turns those parts into links itself.
function lookup(tree: Tree, path: string[]): string | undefined {
  let v: string | Tree | undefined = tree;
  for (const k of path) v = typeof v === "object" ? v[k] : undefined;
  return typeof v === "string" ? v : undefined;
}

/** raw text of a website key ("trust.howMore") in the current language */
export function useWebRaw() {
  const { lang } = useLang();
  return (key: string) => lookup(webTree(lang), key.split(".")) ?? lookup(webTree("en"), key.split(".")) ?? key;
}

/** "All details: <privacy>privacy policy</privacy>." -> [["text", "All details: "], ["privacy", "privacy policy"], ["text", "."]] */
export function splitRich(s: string): [string, string][] {
  const out: [string, string][] = [];
  const re = /<([a-z]+)>([\s\S]*?)<\/\1>/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(["text", s.slice(last, m.index)]);
    out.push([m[1], m[2]]);
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(["text", s.slice(last)]);
  return out;
}
