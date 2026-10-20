import { Fragment, type ReactNode } from "react";
import { Linking, Text, View } from "react-native";
import { ARABIC_FONT, FONT, useTheme, AR_RIGHT } from "@/lib/theme";
import { goldA } from "./art";
import { openWebsitePath } from "./links";

// The website's small Markdown renderer (src/components/Markdown.tsx, variant "plain") for our own content:
// ## / ### headings, - and 1. lists, > quotes, **bold**, *italic*, [links](/path). Arabic passages are set in the
// Quran face, right to left.

type Item = { text: string; sub: boolean };
type Block = { kind: "h2"; text: string } | { kind: "h3"; text: string } | { kind: "p"; text: string } | { kind: "quote"; text: string } | { kind: "ul"; items: Item[] } | { kind: "ol"; items: Item[] };

// same parser as the website
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

const AR_CH = "\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDF9\\uFDFB-\\uFDFF\\uFE70-\\uFEFF";
const AR_ANY = new RegExp(`[${AR_CH}]`, "g");
const AR_RUN = new RegExp(`[${AR_CH}][${AR_CH}\\u064B-\\u065F\\u0670\\s]*[${AR_CH}\\u064B-\\u065F\\u0670]|[${AR_CH}]`, "g");
/** mostly Arabic letters (same test as the website's article variant) */
export const isArabic = (s: string) => { const letters = s.replace(/[\s\d.,;:!?()[\]{}"'“”„‚‘’«»–—\-*_/+=…·•]/g, ""); return letters.length > 0 && (s.match(AR_ANY)?.length ?? 0) / letters.length > 0.6; };

function arabicRuns(text: string, k: string, size: number): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0, i = 0;
  for (const m of text.matchAll(AR_RUN)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    out.push(<Text key={`${k}a${i++}`} style={{ fontFamily: ARABIC_FONT, fontSize: size + 2 }}>{m[0]}</Text>);
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Inline({ text, k, size, ink, accent }: { text: string; k: string; size: number; ink: string; accent: string }) {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*\s][^*]*?)\*/g;
  let last = 0, i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(...arabicRuns(text.slice(last, m.index), `${k}t${i}`, size));
    if (m[1]) parts.push(<Text key={`${k}b${i++}`} style={{ fontFamily: FONT.semibold, color: ink }}>{arabicRuns(m[1], `${k}bb${i}`, size)}</Text>);
    else if (m[4]) parts.push(<Text key={`${k}i${i++}`} style={{ fontFamily: FONT.italic }}>{m[4]}</Text>);
    else {
      const href = m[3];
      parts.push(<Text key={`${k}l${i++}`} accessibilityRole="link" style={{ fontFamily: FONT.semibold, color: accent }}
        onPress={() => (href.startsWith("/") ? openWebsitePath(href) : void Linking.openURL(href))}>{m[2]}</Text>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(...arabicRuns(text.slice(last), `${k}e`, size));
  return <>{parts.map((p, j) => <Fragment key={j}>{p}</Fragment>)}</>;
}

export function Markdown({ text, dark = false }: { text: string; dark?: boolean }) {
  const t = useTheme();
  const ink = dark ? "#ffffff" : t.ink;
  const body = dark ? "rgba(255,255,255,0.8)" : t.ink;
  const base = { fontFamily: FONT.regular, fontSize: 16, lineHeight: 28, color: body, opacity: dark ? 1 : 0.9 };
  const inl = (s: string, k: string) => <Inline text={s} k={k} size={16} ink={ink} accent={dark ? t.gold : t.accent} />;
  const arabicBlock = (s: string, k: string) => (
    <Text key={k} style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 46, color: ink, writingDirection: "rtl", textAlign: AR_RIGHT }}>{s.replace(/\*\*/g, "")}</Text>
  );
  return (
    <View>
      {parse(text).map((b, bi) => {
        const first = bi === 0;
        if (b.kind === "h2") return <Text key={bi} accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 29, letterSpacing: -0.5, color: ink, marginTop: first ? 8 : 40 }}>{inl(b.text, `h${bi}`)}</Text>;
        if (b.kind === "h3") return <Text key={bi} accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 18, lineHeight: 26, color: ink, marginTop: first ? 8 : 32 }}>{inl(b.text, `h${bi}`)}</Text>;
        if (b.kind === "p") return isArabic(b.text) ? <View key={bi} style={{ marginTop: 16 }}>{arabicBlock(b.text, `p${bi}`)}</View> : <Text key={bi} style={[base, { marginTop: 16 }]}>{inl(b.text, `p${bi}`)}</Text>;
        if (b.kind === "quote") return (
          <View key={bi} style={{ marginTop: 16, borderStartWidth: 2, borderStartColor: goldA(t, 0.6), paddingStart: 16 }}>
            <Text style={[base, { fontFamily: FONT.italic }]}>{inl(b.text, `q${bi}`)}</Text>
          </View>
        );
        if (b.kind === "ul") return (
          <View key={bi} style={{ marginTop: 16, gap: 8 }}>
            {b.items.map((it, li) => (
              <View key={li} style={{ flexDirection: "row", gap: 12, marginStart: it.sub ? 24 : 0 }}>
                <View style={{ width: 12, height: 1, backgroundColor: t.gold, marginTop: 14 }} />
                <View style={{ flex: 1 }}>{isArabic(it.text) ? arabicBlock(it.text, `u${bi}${li}`) : <Text style={base}>{inl(it.text, `u${bi}${li}`)}</Text>}</View>
              </View>
            ))}
          </View>
        );
        let n = 0;
        return (
          <View key={bi} style={{ marginTop: 16, gap: 8 }}>
            {b.items.map((it, li) => (
              <View key={li} style={{ flexDirection: "row", gap: 8, marginStart: it.sub ? 24 : 0 }}>
                <Text style={[base, { fontFamily: FONT.bold, color: t.gold, minWidth: 18 }]}>{it.sub ? "·" : `${++n}.`}</Text>
                <Text style={[base, { flex: 1 }]}>{inl(it.text, `o${bi}${li}`)}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
