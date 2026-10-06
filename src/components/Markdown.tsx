import { Link } from "@/i18n/navigation";

// Small Markdown renderer for our own content: ## / ### headings, - and 1. lists, **bold**, [links](/path)
function inline(text: string, k: string) {
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*\s][^*]*?)\*/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={`${k}b${i++}`} className="font-semibold text-ink">{m[1]}</strong>);
    else if (m[4]) parts.push(<em key={`${k}i${i++}`}>{m[4]}</em>);
    else if (m[3].startsWith("/")) parts.push(<Link key={`${k}l${i++}`} href={m[3]} className="font-semibold text-accent underline-offset-2 hover:underline">{m[2]}</Link>);
    else parts.push(<a key={`${k}a${i++}`} href={m[3]} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">{m[2]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

type Block = { kind: "h2" | "h3" | "p"; text: string } | { kind: "ul" | "ol"; items: { text: string; sub: boolean }[] };

function parse(text: string): Block[] {
  const out: Block[] = [];
  let para: string[] = [];
  const flush = () => { if (para.length) { out.push({ kind: "p", text: para.join(" ") }); para = []; } };
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) { flush(); continue; }
    const ul = line.match(/^(\s*)[-*] (.*)$/), ol = line.match(/^(\s*)\d+[.)] (.*)$/);
    if (line.startsWith("### ")) { flush(); out.push({ kind: "h3", text: line.slice(4) }); continue; }
    if (line.startsWith("## ")) { flush(); out.push({ kind: "h2", text: line.slice(3) }); continue; }
    if (ul || ol) {
      flush();
      const kind = ul ? "ul" : "ol";
      const m = (ul ?? ol)!;
      const last = out[out.length - 1];
      const item = { text: m[2], sub: m[1].length > 0 };
      if (last && (last.kind === kind || (item.sub && (last.kind === "ul" || last.kind === "ol")))) (last as { items: typeof item[] }).items.push(item);
      else out.push({ kind, items: [item] });
      continue;
    }
    para.push(line.trim());
  }
  flush();
  return out;
}

export default function Markdown({ text }: { text: string }) {
  return (
    <div className="text-[16px] leading-[1.75] text-ink/90">
      {parse(text).map((b, bi) => {
        if (b.kind === "h2") return <h2 key={bi} className="font-display mt-10 text-2xl leading-tight">{inline(b.text, `h${bi}`)}</h2>;
        if (b.kind === "h3") return <h3 key={bi} className="mt-8 text-lg font-bold">{inline(b.text, `h${bi}`)}</h3>;
        if (b.kind === "p") return <p key={bi} className="mt-4">{inline(b.text, `p${bi}`)}</p>;
        if (b.kind === "ul") return <ul key={bi} className="mt-4 grid gap-2">{b.items.map((it, li) => <li key={li} className={`flex gap-3 ${it.sub ? "ms-6" : ""}`}><span className="mt-3 h-px w-3 shrink-0 bg-gold" /><span>{inline(it.text, `u${bi}${li}`)}</span></li>)}</ul>;
        if (b.kind !== "ol") return null;
        return <ol key={bi} className="mt-4 grid list-decimal gap-2 ps-6 marker:font-bold marker:text-gold">{b.items.map((it, li) => <li key={li}>{inline(it.text, `o${bi}${li}`)}</li>)}</ol>;
      })}
    </div>
  );
}
