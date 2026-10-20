import { type ReactNode } from "react";
import { Linking, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { FONT, useTheme } from "@/lib/theme";

// The website's small Markdown renderer (src/components/Markdown.tsx, "plain" variant) for our own content:
// ## / ### headings, - and 1. lists, > quotes, **bold**, *italic*, [links](/path).
type Item = { text: string; sub: boolean };
type Block = { kind: "h2"; text: string } | { kind: "h3"; text: string } | { kind: "p"; text: string } | { kind: "quote"; text: string } | { kind: "ul"; items: Item[] } | { kind: "ol"; items: Item[] };

function parse(text: string): Block[] {
  const out: Block[] = [];
  let para: string[] = [], quote: string[] = [];
  const flush = () => {
    if (para.length) { out.push({ kind: "p", text: para.join(" ") }); para = []; }
    if (quote.length) { out.push({ kind: "quote", text: quote.join(" ") }); quote = []; }
  };
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) { flush(); continue; }
    if (line.startsWith("> ")) { if (para.length) { out.push({ kind: "p", text: para.join(" ") }); para = []; } quote.push(line.slice(2).trim()); continue; }
    const ul = line.match(/^(\s*)[-*] (.*)$/), ol = line.match(/^(\s*)\d+[.)] (.*)$/);
    if (line.startsWith("### ")) { flush(); out.push({ kind: "h3", text: line.slice(4) }); continue; }
    if (line.startsWith("## ")) { flush(); out.push({ kind: "h2", text: line.slice(3) }); continue; }
    if (ul || ol) {
      flush();
      const kind = ul ? "ul" : "ol";
      const m = (ul ?? ol)!;
      const last = out[out.length - 1];
      const item = { text: m[2], sub: m[1].length > 0 };
      if (last && (last.kind === kind || (item.sub && (last.kind === "ul" || last.kind === "ol")))) (last as { items: Item[] }).items.push(item);
      else out.push(kind === "ul" ? { kind: "ul", items: [item] } : { kind: "ol", items: [item] });
      continue;
    }
    if (quote.length) { out.push({ kind: "quote", text: quote.join(" ") }); quote = []; }
    para.push(line.trim());
  }
  flush();
  return out;
}

function inline(text: string, k: string, ink: string, accent: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*\s][^*]*?)\*/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<Text key={`${k}b${i++}`} style={{ fontFamily: FONT.semibold, color: ink }}>{m[1]}</Text>);
    else if (m[4]) parts.push(<Text key={`${k}i${i++}`} style={{ fontFamily: FONT.italic }}>{m[4]}</Text>);
    else {
      const href = m[3];
      parts.push(<Text key={`${k}l${i++}`} accessibilityRole="link" style={{ fontFamily: FONT.semibold, color: accent }}
        onPress={() => (href.startsWith("/") ? router.push(href as Href) : void Linking.openURL(href))}>{m[2]}</Text>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Markdown({ text }: { text: string }) {
  const t = useTheme();
  const body = { fontFamily: FONT.regular, fontSize: 16, lineHeight: 28, color: t.ink, opacity: 0.9 };
  const inl = (s: string, k: string) => inline(s, k, t.ink, t.accent);
  return (
    <View>
      {parse(text).map((b, bi) => {
        const first = bi === 0;
        if (b.kind === "h2") return <Text key={bi} accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 29, letterSpacing: -0.5, color: t.ink, marginTop: first ? 0 : 34 }}>{inl(b.text, `h${bi}`)}</Text>;
        if (b.kind === "h3") return <Text key={bi} accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 18, lineHeight: 24, color: t.ink, marginTop: first ? 0 : 26 }}>{inl(b.text, `h${bi}`)}</Text>;
        if (b.kind === "p") return <Text key={bi} style={[body, { marginTop: first ? 0 : 14 }]}>{inl(b.text, `p${bi}`)}</Text>;
        if (b.kind === "quote") {
          return (
            <View key={bi} style={{ marginTop: 14, borderStartWidth: 2, borderStartColor: "rgba(201,166,94,0.6)", paddingStart: 14 }}>
              <Text style={[body, { fontFamily: FONT.italic }]}>{inl(b.text, `q${bi}`)}</Text>
            </View>
          );
        }
        if (b.kind === "ul") {
          return (
            <View key={bi} style={{ marginTop: 14, gap: 8 }}>
              {b.items.map((it, li) => (
                <View key={li} style={{ flexDirection: "row", gap: 12, marginStart: it.sub ? 24 : 0 }}>
                  <View style={{ width: 12, height: 1, backgroundColor: t.gold, marginTop: 14 }} />
                  <Text style={[body, { flex: 1 }]}>{inl(it.text, `u${bi}${li}`)}</Text>
                </View>
              ))}
            </View>
          );
        }
        let n = 0;
        return (
          <View key={bi} style={{ marginTop: 14, gap: 8 }}>
            {b.items.map((it, li) => (
              <View key={li} style={{ flexDirection: "row", gap: 10, marginStart: it.sub ? 24 : 0 }}>
                <Text style={[body, { fontFamily: FONT.bold, color: t.gold, minWidth: 18 }]}>{it.sub ? "·" : `${++n}.`}</Text>
                <Text style={[body, { flex: 1 }]}>{inl(it.text, `o${bi}${li}`)}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
