import { type ReactNode } from "react";
import { Text, View, type StyleProp, type TextStyle } from "react-native";
import { useLang } from "@/i18n";
import { ARABIC_FONT, FONT, useTheme, AR_RIGHT } from "@/lib/theme";
import { GOLD, StarGlyph, useHm } from "./art";
import { openLink } from "./links";

// The website's small Markdown renderer (components/Markdown.tsx, variant "plain"): ## / ### headings, - and 1. lists,
// > quotes, **bold**, *italic*, [links](/path). Used for assistant answers and the legal texts.
const AR = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;
const isArabic = (s: string) => { const letters = s.replace(/[\s\d\p{P}\p{S}]/gu, ""); return letters.length > 0 && (s.match(AR)?.length ?? 0) / letters.length > 0.6; };

function inline(text: string, key: string, strong: string, link: string, lang: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*\s][^*]*?)\*/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<Text key={`${key}b${i++}`} style={{ fontFamily: FONT.semibold, color: strong }}>{m[1]}</Text>);
    else if (m[4]) parts.push(<Text key={`${key}i${i++}`} style={{ fontFamily: FONT.italic }}>{m[4]}</Text>);
    else { const href = m[3]; parts.push(<Text key={`${key}l${i++}`} accessibilityRole="link" onPress={() => openLink(href, lang)} style={{ fontFamily: FONT.semibold, color: link }}>{m[2]}</Text>); }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

type Block = { kind: "h2" | "h3" | "p" | "quote" | "ul" | "ol"; lines: string[] };
function parse(src: string): Block[] {
  const out: Block[] = [];
  for (const raw of src.replace(/\r/g, "").split(/\n\s*\n/)) {
    const lines = raw.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim());
    if (!lines.length) continue;
    let cur: Block | null = null;
    for (const l of lines) {
      const s = l.trim();
      const kind: Block["kind"] = s.startsWith("### ") ? "h3" : s.startsWith("## ") || s.startsWith("# ") ? "h2" : s.startsWith("> ") ? "quote" : /^[-*•]\s+/.test(s) ? "ul" : /^\d+[.)]\s+/.test(s) ? "ol" : "p";
      const body = s.replace(/^#{1,3}\s+/, "").replace(/^>\s?/, "").replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, "");
      if (kind === "h2" || kind === "h3") { if (cur) out.push(cur); out.push({ kind, lines: [body] }); cur = null; continue; }
      if (cur && cur.kind === kind) cur.lines.push(body);
      else { if (cur) out.push(cur); cur = { kind, lines: [body] }; }
    }
    if (cur) out.push(cur);
  }
  return out;
}

export function Markdown({ text, size = 15, color, style }: { text: string; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  const hm = useHm(t);
  const { lang } = useLang();
  const body = color ?? t.ink;
  const base: TextStyle = { fontFamily: FONT.regular, fontSize: size, lineHeight: Math.round(size * 1.6), color: body };
  const para = (s: string, k: string) => isArabic(s)
    ? <Text key={k} style={{ fontFamily: ARABIC_FONT, fontSize: size + 6, lineHeight: (size + 6) * 1.9, color: t.ink, writingDirection: "rtl", textAlign: AR_RIGHT }}>{s.replace(/\*\*/g, "")}</Text>
    : <Text key={k} style={[base, style]}>{inline(s, k, t.ink, t.accent, lang)}</Text>;
  return (
    <View style={{ gap: 10 }}>
      {parse(text).map((b, i) => {
        const k = `m${i}`;
        if (b.kind === "h2") return <Text key={k} accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: size + 3, lineHeight: Math.round((size + 3) * 1.35), color: t.ink, marginTop: i ? 10 : 0 }}>{b.lines[0]}</Text>;
        if (b.kind === "h3") return <Text key={k} accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: size + 1, color: t.ink, marginTop: i ? 6 : 0 }}>{b.lines[0]}</Text>;
        if (b.kind === "quote") return (
          <View key={k} style={{ borderStartWidth: 2, borderStartColor: GOLD, paddingStart: 12, gap: 6 }}>
            {b.lines.map((l, j) => para(l, `${k}q${j}`))}
          </View>
        );
        if (b.kind === "ul" || b.kind === "ol") return (
          <View key={k} style={{ gap: 6 }}>
            {b.lines.map((l, j) => (
              <View key={`${k}l${j}`} style={{ flexDirection: "row", gap: 10 }}>
                {b.kind === "ul"
                  ? <View style={{ paddingTop: Math.round(size * 0.45) }}><StarGlyph size={9} color={hm.goldD} /></View>
                  : <Text style={[base, { fontFamily: FONT.bold, color: hm.goldD, minWidth: 18 }]}>{j + 1}.</Text>}
                <Text style={[base, { flex: 1 }, style]}>{inline(l, `${k}${j}`, t.ink, t.accent, lang)}</Text>
              </View>
            ))}
          </View>
        );
        return <View key={k} style={{ gap: 4 }}>{b.lines.map((l, j) => para(l, `${k}p${j}`))}</View>;
      })}
    </View>
  );
}
