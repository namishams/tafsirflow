import { Link } from "@/i18n/navigation";
import { IslamFloral, IslamNum, IslamStarMark, saw, starPath } from "@/components/art/IslamArt";

// Small Markdown renderer for our own content: ## / ### headings, - and 1. lists, > quotes, **bold**, [links](/path)
// variant "plain" (default) keeps the compact look used in chats and side texts; variant "article" sets long chapters like an
// illuminated book: an illuminated initial, numbered section medallions with ornamental breaks, framed quotations,
// verse references as gold chips linking to the verse, Arabic set in Amiri, and the 99 names as calligraphy tiles.
function inline(text: string, k: string, dark = false) {
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*\s][^*]*?)\*/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={`${k}b${i++}`} className={`font-semibold ${dark ? "text-white" : "text-ink"}`}>{m[1]}</strong>);
    else if (m[4]) parts.push(<em key={`${k}i${i++}`}>{m[4]}</em>);
    else if (m[3].startsWith("/")) parts.push(<Link key={`${k}l${i++}`} href={m[3]} className={`font-semibold underline-offset-2 hover:underline ${dark ? "text-[rgb(var(--gold))]" : "text-accent"}`}>{m[2]}</Link>);
    else parts.push(<a key={`${k}a${i++}`} href={m[3]} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">{m[2]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ---------- article helpers ----------
const AR_CH = "\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDF9\\uFDFB-\\uFDFF\\uFE70-\\uFEFF";
const AR_ANY = new RegExp(`[${AR_CH}]`, "g");
const isArabic = (s: string) => { const letters = s.replace(/[\s\d\p{P}\p{S}]/gu, ""); return letters.length > 0 && (s.match(AR_ANY)?.length ?? 0) / letters.length > 0.6; };
const REF = /(?<![\d:.,])(\d{1,3}):(\d{1,3})(?:\s*[–-]\s*(\d{1,3}))?(?![\d:])/g;
const validRef = (s: number, v: number) => s >= 1 && s <= 114 && v >= 1 && v <= 286;
const hasRef = (s: string) => { for (const m of s.matchAll(REF)) if (validRef(+m[1], +m[2])) return true; return false; };
const refHref = (s: string, v: string) => `/surah/${s}?v=${v}`;

function Chip({ href, children }: { href?: string; children: React.ReactNode }) {
  return href
    ? <Link href={href} className="isl-ref"><IslamStarMark />{children}</Link>
    : <span className="isl-ref"><IslamStarMark />{children}</span>;
}

// "(Koran 2:255)" becomes one chip; longer parentheses keep their text and get a chip for every reference
function refParen(inner: string, k: string): React.ReactNode {
  const refs = [...inner.matchAll(REF)].filter((m) => validRef(+m[1], +m[2]));
  if (refs.length === 1 && inner.length <= 34) return <Chip key={k} href={refHref(refs[0][1], refs[0][2])}>{inner.trim()}</Chip>;
  const out: React.ReactNode[] = ["("];
  let last = 0, i = 0;
  for (const m of refs) {
    out.push(inner.slice(last, m.index));
    out.push(<Chip key={`${k}r${i++}`} href={refHref(m[1], m[2])}>{m[0]}</Chip>);
    last = m.index! + m[0].length;
  }
  out.push(inner.slice(last), ")");
  return <span key={k}>{out}</span>;
}

function inlineArt(text: string, k: string, arabicDoc: boolean, dark: boolean): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = new RegExp(
    String.raw`\*\*(.+?)\*\*` +                                                    // 1 bold
    String.raw`|\[([^\]]+)\]\(([^)\s]+)\)` +                                        // 2,3 link
    String.raw`|\*([^*\s][^*]*?)\*` +                                               // 4 italic
    String.raw`|([„“"«])([^„“”"«»]{6,}?)([“”"»])(\s*)\(([^()]*?\d{1,3}:\d{1,3}[^()]*?)\)` + // 5-9 quotation followed by a verse reference
    String.raw`|\(([^()]*?\d{1,3}:\d{1,3}[^()]*?)\)` +                              // 10 verse reference in parentheses
    (arabicDoc ? "" : `|([${AR_CH}][${AR_CH}\\u064B-\\u065F\\u0670]*(?:\\s+[${AR_CH}][${AR_CH}\\u064B-\\u065F\\u0670]*)*)`), // 11 Arabic run
    "g");
  let last = 0, m: RegExpExecArray | null, i = 0;
  const strong = dark ? "text-white" : "text-ink";
  while ((m = re.exec(text))) {
    const key = `${k}x${i++}`;
    if (m[11] !== undefined && (m[11].replace(/[^ء-ي]/g, "").length < 2)) continue; // a lone ﷺ or letter stays as it is
    if ((m[9] !== undefined && !hasRef(m[9])) || (m[10] !== undefined && !hasRef(m[10]))) continue;
    if (m.index > last) parts.push(saw(text.slice(last, m.index), `${key}t`));
    if (m[1] !== undefined) parts.push(!arabicDoc && isArabic(m[1]) ? <strong key={key} className="isl-ar" dir="rtl" lang="ar">{m[1]}</strong> : <strong key={key} className={`font-semibold ${strong}`}>{saw(m[1], `${key}s`)}</strong>);
    else if (m[4] !== undefined) parts.push(<em key={key}>{m[4]}</em>);
    else if (m[3] !== undefined) parts.push(m[3].startsWith("/")
      ? <Link key={key} href={m[3]} className={`font-semibold underline decoration-[rgb(var(--isl-gold-soft))]/50 decoration-1 underline-offset-[3px] hover:decoration-[rgb(var(--isl-gold-soft))] ${dark ? "text-[rgb(var(--gold))]" : "text-accent"}`}>{m[2]}</Link>
      : <a key={key} href={m[3]} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline decoration-[rgb(var(--isl-gold-soft))]/50 underline-offset-[3px]">{m[2]}</a>);
    else if (m[5] !== undefined) parts.push(<span key={key}><span className="isl-qq">{m[5]}{saw(m[6], `${key}q`)}{m[7]}</span>{m[8]}{refParen(m[9], `${key}p`)}</span>);
    else if (m[10] !== undefined) parts.push(refParen(m[10], key));
    else if (m[11] !== undefined) parts.push(<span key={key} className="isl-ar" dir="rtl" lang="ar">{m[11]}</span>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(saw(text.slice(last), `${k}end`));
  return parts;
}

// ---------- blocks ----------
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

// the "## " headings of a text, in order (for tables of contents; ids are sec-1, sec-2, …)
export function mdHeadings(text: string): string[] {
  return text.replace(/\r/g, "").split("\n").filter((l) => l.startsWith("## ")).map((l) => l.slice(3).replace(/\*\*/g, "").trim());
}

// a paragraph that opens with a quotation: the quotation is set as a framed passage, the rest follows as text
const LEAD_QUOTE = /^([„“"«])(.{40,}?)([“”"»])\s*(?:\(([^()]+)\))?([.,;:!?]?)\s*(.*)$/s;

function Quote({ text, cite, k, arabicDoc, dark }: { text: string; cite?: string; k: string; arabicDoc: boolean; dark: boolean }) {
  return (
    <figure className="isl-quote">
      <span className="isl-quote-star" aria-hidden><svg viewBox="0 0 24 24" className="h-full w-full"><path d={starPath(12, 12, 11, 5)} fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1" /><circle cx="12" cy="12" r="2.2" fill="currentColor" /></svg></span>
      <blockquote>{inlineArt(text, `${k}q`, arabicDoc, dark)}</blockquote>
      {cite && <figcaption>{hasRef(cite) ? refParen(cite, `${k}c`) : <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--isl-gold))]">{cite}</span>}</figcaption>}
    </figure>
  );
}

function Article({ text, dark, numbered }: { text: string; dark: boolean; numbered: boolean }) {
  const blocks = parse(text);
  const arabicDoc = (text.match(AR_ANY)?.length ?? 0) > text.replace(/[\s\d\p{P}\p{S}]/gu, "").length * 0.3;
  const inl = (t: string, k: string) => inlineArt(t, k, arabicDoc, dark);
  let h2n = 0, firstP = true;
  const out: React.ReactNode[] = [];
  blocks.forEach((b, bi) => {
    if (b.kind === "h2") {
      h2n++;
      if (bi > 0) out.push(<div key={`br${bi}`} aria-hidden className="isl-break"><IslamFloral /></div>);
      out.push(
        <h2 key={bi} id={`sec-${h2n}`} className="isl-h2">
          <IslamNum n={numbered ? h2n : ""} />
          <span className="isl-h2-text">{inl(b.text, `h${bi}`)}</span>
        </h2>,
      );
      return;
    }
    if (b.kind === "h3") { out.push(<h3 key={bi} className="isl-h3">{inl(b.text, `h${bi}`)}</h3>); return; }
    if (b.kind === "quote") { out.push(<Quote key={bi} text={b.text} k={`q${bi}`} arabicDoc={arabicDoc} dark={dark} />); return; }
    if (b.kind === "p") {
      if (!arabicDoc && isArabic(b.text)) { out.push(<p key={bi} className="isl-arpanel" dir="rtl" lang="ar">{b.text}</p>); return; }
      const q = b.text.match(LEAD_QUOTE);
      if (q && (!q[4] || hasRef(q[4]) || q[4].length < 40) && (q[6] === "" || q[4] !== undefined)) {
        out.push(<Quote key={`${bi}q`} text={q[2]} cite={q[4]} k={`q${bi}`} arabicDoc={arabicDoc} dark={dark} />);
        if (q[6]) out.push(<p key={bi}>{inl(q[6], `p${bi}`)}</p>);
        firstP = false;
        return;
      }
      const plain = b.text.replace(/^[*[\s]+/, "");
      const drop = firstP && !arabicDoc && /^\p{Lu}/u.test(plain) && b.text.length > 160;
      out.push(<p key={bi} className={firstP ? `isl-lead ${drop ? "isl-drop" : ""}` : undefined}>{inl(b.text, `p${bi}`)}</p>);
      firstP = false;
      return;
    }
    // lists
    const names = b.kind === "ul" && b.items.length >= 6 && b.items.every((it) => { const m = it.text.match(/^\*\*([^*]+)\*\*\s*[–-]\s*(.+)$/); return !!m && isArabic(m[1]); });
    if (names) {
      out.push(
        <ul key={bi} className="isl-names !mt-6">
          {b.items.map((it, li) => {
            const m = it.text.match(/^\*\*([^*]+)\*\*\s*[–-]\s*(.+)$/)!;
            const rest = m[2].split(/\s+[–-]\s+/);
            return (
              <li key={li} className="isl-name">
                <span className="isl-name-n">{li + 1}</span>
                <span className="isl-name-ar" dir="rtl" lang="ar">{m[1]}</span>
                <span className="isl-name-t">{rest.length > 1 ? <><b>{rest[0]}</b>{rest.slice(1).join(" – ")}</> : rest[0]}</span>
              </li>
            );
          })}
        </ul>,
      );
      return;
    }
    if (b.kind === "ul") { out.push(<ul key={bi} className="isl-ul">{b.items.map((it, li) => <li key={li} className={it.sub ? "sub" : undefined}><span className="min-w-0">{inl(it.text, `u${bi}${li}`)}</span></li>)}</ul>); return; }
    let n = 0;
    out.push(<ol key={bi} className="isl-ol">{b.items.map((it, li) => <li key={li} className={it.sub ? "sub" : undefined}>{it.sub ? <span className="mt-[.7em] h-1.5 w-1.5 shrink-0 rotate-45 border border-[rgb(var(--isl-gold-soft))]" /> : <IslamNum n={++n} />}<span className="min-w-0">{inl(it.text, `o${bi}${li}`)}</span></li>)}</ol>);
  });
  return <div className={`isl-article ${dark ? "isl-dark text-white/80" : "text-ink/90"}`}>{out}</div>;
}

export default function Markdown({ text, dark = false, variant = "plain", numbered = true }: { text: string; dark?: boolean; variant?: "plain" | "article"; numbered?: boolean }) {
  if (variant === "article") return <Article text={text} dark={dark} numbered={numbered} />;
  const inl = (t: string, k: string) => inline(t, k, dark);
  return (
    <div className={`text-[16px] leading-[1.75] ${dark ? "text-white/80" : "text-ink/90"}`}>
      {parse(text).map((b, bi) => {
        if (b.kind === "h2") return <h2 key={bi} className="font-display mt-10 text-2xl leading-tight">{inl(b.text, `h${bi}`)}</h2>;
        if (b.kind === "h3") return <h3 key={bi} className="mt-8 text-lg font-bold">{inl(b.text, `h${bi}`)}</h3>;
        if (b.kind === "p") return <p key={bi} className="mt-4">{inl(b.text, `p${bi}`)}</p>;
        if (b.kind === "quote") return <blockquote key={bi} className="mt-4 border-s-2 border-[rgb(var(--gold))]/60 ps-4 italic">{inl(b.text, `q${bi}`)}</blockquote>;
        if (b.kind === "ul") return <ul key={bi} className="mt-4 grid gap-2">{b.items.map((it, li) => <li key={li} className={`flex gap-3 ${it.sub ? "ms-6" : ""}`}><span className="mt-3 h-px w-3 shrink-0 bg-gold" /><span>{inl(it.text, `u${bi}${li}`)}</span></li>)}</ul>;
        return <ol key={bi} className="mt-4 grid list-decimal gap-2 ps-6 marker:font-bold marker:text-gold">{b.items.map((it, li) => <li key={li}>{inl(it.text, `o${bi}${li}`)}</li>)}</ol>;
      })}
    </div>
  );
}
