import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { FONT, stage, useTheme } from "@/lib/theme";
import { alpha } from "./art";

// The website's plain Markdown renderer (Markdown.tsx, variant "plain") for our own texts: ## / ### headings,
// "- " and "1. " lists, "> " quotes and **bold**. Used for the long texts of the map and plan pages.
type Block = { kind: "h2"; text: string } | { kind: "h3"; text: string } | { kind: "p"; text: string } | { kind: "quote"; text: string } | { kind: "ul"; items: string[] } | { kind: "ol"; items: string[] };

function parse(md: string): Block[] {
  const out: Block[] = [];
  for (const chunk of md.split(/\n{2,}/)) {
    const lines = chunk.split("\n").filter((l) => l.trim());
    if (!lines.length) continue;
    let para: string[] = [];
    const flush = () => { if (para.length) { out.push({ kind: "p", text: para.join(" ") }); para = []; } };
    for (const l of lines) {
      const h = /^(#{2,3})\s+(.*)$/.exec(l);
      const ul = /^\s*-\s+(.*)$/.exec(l);
      const ol = /^\s*\d+\.\s+(.*)$/.exec(l);
      const q = /^>\s?(.*)$/.exec(l);
      const tail = () => out[out.length - 1];
      if (h) { flush(); out.push(h[1].length === 2 ? { kind: "h2", text: h[2] } : { kind: "h3", text: h[2] }); }
      else if (ul) { flush(); const L = tail(); if (L?.kind === "ul") L.items.push(ul[1]); else out.push({ kind: "ul", items: [ul[1]] }); }
      else if (ol) { flush(); const L = tail(); if (L?.kind === "ol") L.items.push(ol[1]); else out.push({ kind: "ol", items: [ol[1]] }); }
      else if (q) { flush(); out.push({ kind: "quote", text: q[1] }); }
      else para.push(l.trim());
    }
    flush();
  }
  return out;
}

function inline(text: string, strong: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<Text key={i++} style={{ fontFamily: FONT.semibold, color: strong }}>{m[1]}</Text>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Markdown({ text, dark = false }: { text: string; dark?: boolean }) {
  const t = useTheme();
  const color = dark ? "rgba(255,255,255,0.8)" : alpha(t.ink, 0.9);
  const strong = dark ? "#ffffff" : t.ink;
  const gold = dark ? stage.gold : t.gold;
  const body = { fontFamily: FONT.regular, fontSize: 16, lineHeight: 28, color };
  return (
    <View>
      {parse(text).map((b, bi) => {
        if (b.kind === "h2") return <Text key={bi} accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 29, color: dark ? "#eef0f3" : t.ink, marginTop: bi ? 40 : 0 }}>{inline(b.text, strong)}</Text>;
        if (b.kind === "h3") return <Text key={bi} accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 18, color: dark ? "#eef0f3" : t.ink, marginTop: bi ? 32 : 0 }}>{inline(b.text, strong)}</Text>;
        if (b.kind === "p") return <Text key={bi} style={[body, { marginTop: bi ? 16 : 0 }]}>{inline(b.text, strong)}</Text>;
        if (b.kind === "quote") return <Text key={bi} style={[body, { marginTop: 16, borderLeftWidth: 2, borderLeftColor: alpha(gold, 0.6), paddingLeft: 16, fontFamily: FONT.italic }]}>{inline(b.text, strong)}</Text>;
        return (
          <View key={bi} style={{ marginTop: bi ? 16 : 0, gap: 8 }}>
            {b.items.map((it, li) => (
              <View key={li} style={{ flexDirection: "row", gap: 12 }}>
                {b.kind === "ul"
                  ? <View style={{ marginTop: 14, height: 1, width: 12, backgroundColor: gold }} />
                  : <Text style={[body, { fontFamily: FONT.bold, color: gold, minWidth: 16 }]}>{li + 1}.</Text>}
                <Text style={[body, { flex: 1 }]}>{inline(it, strong)}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

export default Markdown;
