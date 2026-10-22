"use client";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { Avatar } from "@/components/talents/TalentProfileWeb";
import { fillText, socialTable, type SocialKey } from "@/lib/socialDict";

// "Together, deeper" on the website, 1:1 with the app (mobile/src/app/together/social.tsx): khatm groups, the live
// halaqa (text and presence only, polled every 4 s), the weekly recap card (shared only by the member as an image),
// mutashabihat duels between two friends, teacher classes and the friends' milestones with MashaAllah. Same endpoints
// (/api/together/social/*), same texts (src/lib/socialDict.ts). 16+, opt-in, report and block everywhere.
type Card = { username: string; name: string; avatar?: string | null };
type Settings = { feed: boolean; duels: boolean; suggest: boolean; views: boolean };
type KhatmSummary = { id: string; name: string; intention: string; completed: boolean; done: number; members: number; mine: number[] };
type Part = { juz: number; state: "open" | "claimed" | "done"; mine: boolean; by: Card | null };
type Khatm = { id: string; name: string; intention: string; owner: boolean; code: string | null; completed: boolean; suspended: boolean; parts: Part[]; members: Card[] };
type Halaqa = { live: boolean; canStart: boolean; leading?: boolean; circle: { id: string; name: string }; leader?: Card | null; surah?: number; ayah?: number; present?: (Card & { me: boolean; hand: boolean })[]; myHand?: boolean };
type Recap = { name: string; verses: number; days: number; streak: number; surah: number | null; juz: number; circle: { name: string; rank: number; of: number } | null };
type Duel = { id: string; fromMe: boolean; status: string; other: Card; total: number; played: boolean; mine: number | null; theirs: number | null };
type ClassSummary = { id: string; name: string; targetKind: string; target: number; members: number };
type SClass = { id: string; name: string; teaching: boolean; code: string | null; targetKind: string; target: number; teacher: Card | null; memberCount: number; members: (Card & { me: boolean; progress: number; reached: boolean })[]; posts: { id: string; body: string; at: string; review: boolean }[] };
type FeedEvent = { id: string; kind: string; ref: string; own: boolean; mashallah: number; mine: boolean; author: Card };
type Hub = { settings: Settings; khatms: KhatmSummary[]; live: { id: string; name: string }[]; duels: Duel[]; classes: { canTeach: boolean; classes: ClassSummary[] }; feed: FeedEvent[] };
export type Chapters = [number, string, number][];
export type SocialView = "hub" | "khatm" | "halaqa" | "recap" | "duel" | "class" | "profile";

class HttpErr extends Error { constructor(public status: number, public code: string) { super(code); } }
async function call<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const r = await fetch(`/api/together/social/${path}`, { method, cache: "no-store", headers: body !== undefined ? { "Content-Type": "application/json" } : undefined, body: body !== undefined ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new HttpErr(r.status, (d as { error?: string }).error ?? "generic");
  return d as T;
}
const gold = "bg-[#c6a65e] text-[rgb(8,38,29)] hover:brightness-105";
const soft = "bg-[rgba(6,108,78,0.08)] dark:bg-white/10 text-ink";
const INTENTIONS = ["general", "ramadan", "deceased", "sick", "family", "ummah"];
const TK = ["verses", "days", "xp"];

type Ctx = { sx: (k: SocialKey, v?: Record<string, string | number>) => string; err: (e: unknown) => string; nf: (n: number) => string; locale: string; chapters: Chapters; surah: (n: number) => string };

const VIEWS: SocialView[] = ["hub", "khatm", "halaqa", "recap", "duel", "class", "profile"];
export default function SocialWeb({ locale, chapters }: { locale: string; chapters: Chapters }) {
  // the view comes from the query (?v=&id=), read on the client so the page can be prerendered
  const qs = useSearchParams();
  const v = qs.get("v") as SocialView | null;
  const view: SocialView = v && VIEWS.includes(v) ? v : "hub";
  const id = qs.get("id")?.slice(0, 40) ?? undefined;
  const table = socialTable(locale);
  const sx = useCallback((k: SocialKey, v?: Record<string, string | number>) => fillText(table[k] ?? k, v), [table]);
  const [gate, setGate] = useState<"" | "out" | "age" | "profile">("");
  const err = useCallback((e: unknown) => {
    if (e instanceof HttpErr) {
      if (e.status === 401 || e.code === "verify" || e.code === "login") { setGate("out"); return ""; }
      if (e.code === "age16" || e.code === "age" || e.code === "age_required") { setGate("age"); return ""; }
      if (e.code === "profile_required") { setGate("profile"); return ""; }
      return table[`e_${e.code}` as SocialKey] ?? table.e_generic;
    }
    return table.e_generic;
  }, [table]);
  const nf = useCallback((n: number) => n.toLocaleString(locale), [locale]);
  const surah = useCallback((n: number) => { const c = chapters.find((x) => x[0] === n); return c ? `${n} ${c[1]}` : String(n); }, [chapters]);
  const c: Ctx = { sx, err, nf, locale, chapters, surah };
  const titles: Record<SocialView, [SocialKey, SocialKey]> = { hub: ["hubTitle", "hubLead"], khatm: ["khatm", "khatmLead"], halaqa: ["halaqa", "halaqaLead"], recap: ["recap", "recapLead"], duel: ["duels", "duelsLead"], class: ["classes", "classesLead"], profile: ["network", "networkLead"] };
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold rtl:tracking-normal">
        {view === "hub" ? <Link href="/together" className="hover:underline">{sx("hubTitle")}</Link> : <Link href="/together/social" className="hover:underline">{sx("hubTitle")}</Link>}
      </p>
      <h1 className="font-display mt-2 text-4xl">{sx(titles[view][0])}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">{sx(titles[view][1])}</p>
      {gate === "out" ? <p className="mt-8">{sx("signIn")} · <Link href="/account" className="font-semibold text-accent hover:underline">{sx("open")}</Link></p>
        : gate === "age" ? <p className="mt-8">{sx("age16")}</p>
        : gate === "profile" ? <p className="mt-8">{sx("needProfile")} · <Link href="/username" className="font-semibold text-accent hover:underline">{sx("open")}</Link></p>
        : view === "hub" ? <HubView {...c} />
        : view === "khatm" ? <KhatmView {...c} id={id ?? ""} />
        : view === "halaqa" ? <HalaqaView {...c} id={id ?? ""} />
        : view === "recap" ? <RecapView {...c} />
        : view === "duel" ? <DuelView {...c} id={id ?? ""} />
        : view === "class" ? <ClassView {...c} id={id ?? ""} />
        : <ProfileView {...c} id={id ?? ""} />}
    </div>
  );
}

// ---------- parts ----------
const href = (v: SocialView, id?: string) => `/together/social?v=${v}${id ? `&id=${encodeURIComponent(id)}` : ""}`;
function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-3"><h2 className="font-display flex-1 text-2xl">{title}</h2>{action}</div>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
const Tile = ({ children, className = "" }: { children: ReactNode; className?: string }) => <div className={`rounded-xl border border-line bg-surface p-4 ${className}`}>{children}</div>;
const Btn = ({ children, onClick, primary, disabled, small }: { children: ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean; small?: boolean }) => (
  <button type="button" onClick={onClick} disabled={disabled} className={`${small ? "h-9 px-3 text-[13.5px]" : "h-11 px-5 text-[15px]"} rounded-full font-bold transition disabled:opacity-50 ${primary ? gold : soft}`}>{children}</button>
);
const Chip = ({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) => (
  <button type="button" aria-pressed={on} onClick={onClick} className={`h-9 rounded-full border px-4 text-[14px] font-semibold ${on ? "border-[#c6a65e] bg-[#c6a65e]/15" : "border-line"}`}>{label}</button>
);
function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} className="h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gradient-to-r from-[#c6a65e] to-[#ecd7a2]" style={{ width: `${pct}%` }} /></div>;
}
function Row({ c, sub, right, hl }: { c: Card; sub?: string; right?: ReactNode; hl?: boolean }) {
  return (
    <li className={`flex items-center gap-3 px-4 py-3 ${hl ? "bg-[#c6a65e]/10" : ""}`}>
      <Link href={`/talents/${c.username}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
        <Avatar src={c.avatar} size={40} badge={null} />
        <span className="min-w-0"><span className="block truncate font-bold">{c.name}</span>{sub ? <span className="block text-[13px] text-muted">{sub}</span> : null}</span>
      </Link>
      {right}
    </li>
  );
}
const List = ({ children }: { children: ReactNode }) => <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">{children}</ul>;
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div role="dialog" aria-modal aria-label={title} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-bg p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center"><h2 className="font-display flex-1 text-2xl">{title}</h2><button type="button" onClick={onClose} aria-label={title} className="h-10 w-10 text-2xl text-muted">×</button></div>
        <div className="mt-4 space-y-4">{children}</div>
      </div>
    </div>
  );
}
const inputCls = "h-11 w-full rounded-lg border border-line bg-surface px-3 text-[16px]";
function Consent({ text, on, onChange }: { text: string; on: boolean; onChange: (v: boolean) => void }) {
  return <label className="flex items-start gap-3 text-[14.5px]"><input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 accent-[#c6a65e]" /><span>{text}</span></label>;
}
const Stage = ({ children }: { children: ReactNode }) => <div className="stage rounded-2xl p-6 text-white">{children}</div>;
async function verseText(key: string) {
  const r = await fetch(`/api/q/verses/by_key/${key}?fields=text_uthmani`);
  const d = (await r.json().catch(() => ({}))) as { verse?: { text_uthmani?: string } };
  return d.verse?.text_uthmani ?? "";
}
async function block(username: string) {
  await fetch(`/api/community/block/${encodeURIComponent(username)}`, { method: "POST" }).catch(() => undefined);
}

/** draws a modest card as PNG and shares it (Web Share with files) or downloads it */
async function shareCard(lines: { text: string; size: number; color: string; font?: string }[], file: string) {
  const w = 1080, h = 1350;
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const g = cv.getContext("2d");
  if (!g) return;
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, "rgb(8,38,29)"); grd.addColorStop(1, "rgb(5,28,21)");
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(214,180,108,0.45)"; g.lineWidth = 3; g.strokeRect(48, 48, w - 96, h - 96);
  let y = 220;
  g.textAlign = "center";
  for (const l of lines) {
    g.fillStyle = l.color;
    g.font = `${l.font ?? "600"} ${l.size}px ${l.font === "ar" ? "serif" : "Georgia, serif"}`.replace("ar ", "400 ");
    const words = l.text.split(" ");
    let line = "";
    for (const wd of words) {
      const test = line ? `${line} ${wd}` : wd;
      if (g.measureText(test).width > w - 220 && line) { g.fillText(line, w / 2, y); y += l.size * 1.35; line = wd; } else line = test;
    }
    if (line) { g.fillText(line, w / 2, y); y += l.size * 1.35; }
    y += l.size * 0.5;
  }
  g.fillStyle = "rgba(214,180,108,0.9)"; g.font = "600 28px Georgia, serif"; g.fillText("QURAN MASTERCLASS", w / 2, h - 110);
  const blob = await new Promise<Blob | null>((res) => cv.toBlob(res, "image/png"));
  if (!blob) return;
  const f = new File([blob], file, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [f] })) { await nav.share({ files: [f] }).catch(() => undefined); return; }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = file; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ---------- hub ----------
function HubView(c: Ctx) {
  const { sx, err, nf, surah } = c;
  const router = useRouter();
  const [d, setD] = useState<Hub | null>(null);
  const [msg, setMsg] = useState("");
  const [modal, setModal] = useState<null | "khatmNew" | "khatmJoin" | "classNew" | "classJoin" | "duel">(null);
  const load = useCallback(() => { call<Hub>("hub").then(setD).catch((e) => setMsg(err(e))); }, [err]);
  useEffect(load, [load]);
  if (!d) return <p className="mt-8 text-muted">{msg || "…"}</p>;
  const after = (v: SocialView) => (r: { id: string }) => { setModal(null); router.push(href(v, r.id)); };
  return (
    <>
      {msg ? <p role="status" className="mt-4 text-muted">{msg}</p> : null}
      {d.live.map((l) => (
        <Link key={l.id} href={href("halaqa", l.id)} className="mt-6 flex items-center gap-3 rounded-xl border border-[#c6a65e] bg-[#c6a65e]/10 p-4 font-bold">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c6a65e]" /><span className="flex-1">{sx("halaqaLive", { c: l.name })}</span><span className="text-accent">{sx("halaqaOpen")}</span>
        </Link>
      ))}
      <Link href={href("recap")} className="stage mt-6 block rounded-2xl p-6 text-white hover:brightness-110">
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#d6b46c]">{sx("recap")}</p>
        <p className="mt-2 text-white/80">{sx("recapLead")}</p>
      </Link>

      <Section title={sx("khatm")} action={<button type="button" onClick={() => setModal("khatmJoin")} className="text-[14px] font-semibold text-accent">{sx("khatmJoin")}</button>}>
        {d.khatms.map((k) => (
          <Link key={k.id} href={href("khatm", k.id)} className="block rounded-xl border border-line bg-surface p-4 hover:border-[#c6a65e]">
            <p className="font-bold">{k.name}</p>
            <p className="mb-2 text-[13px] text-muted">{sx(`int_${k.intention}` as SocialKey)} · {sx("members", { n: nf(k.members) })} · {sx("doneOf", { n: nf(k.done) })}</p>
            <Bar value={k.done} max={30} />
            {k.mine.length ? <p className="mt-2 text-[13px] font-semibold text-accent">{sx("mine", { s: k.mine.join(", ") })}</p> : null}
          </Link>
        ))}
        <Btn primary onClick={() => setModal("khatmNew")}>{sx("khatmNew")}</Btn>
      </Section>

      <Section title={sx("duels")} action={d.settings.duels ? <button type="button" onClick={() => setModal("duel")} className="text-[14px] font-semibold text-accent">{sx("duelNew")}</button> : null}>
        {!d.settings.duels ? (
          <Tile><p>{sx("duelsOff")}</p><div className="mt-3"><Btn onClick={() => void call("settings", "PUT", { duels: true }).then(load)}>{sx("duelsOn")}</Btn></div></Tile>
        ) : d.duels.length ? <List>{d.duels.map((x) => <DuelRow key={x.id} d={x} c={c} onChange={load} />)}</List> : <p className="text-muted">{sx("duelsLead")}</p>}
      </Section>

      <Section title={sx("classes")} action={<button type="button" onClick={() => setModal("classJoin")} className="text-[14px] font-semibold text-accent">{sx("classJoin")}</button>}>
        {d.classes.classes.map((x) => (
          <Link key={x.id} href={href("class", x.id)} className="block rounded-xl border border-line bg-surface p-4 hover:border-[#c6a65e]">
            <p className="font-bold">{x.name}</p>
            <p className="text-[13px] text-muted">{sx("target")}: {nf(x.target)} {sx(`tk_${x.targetKind}` as SocialKey)} · {sx("members", { n: nf(x.members) })}</p>
          </Link>
        ))}
        {d.classes.canTeach ? <Btn onClick={() => setModal("classNew")}>{sx("classNew")}</Btn> : <p className="text-[13px] text-muted">{sx("teacherOnly")}</p>}
      </Section>

      <NetworkSection {...c} />

      <Section title={sx("feed")}>
        <Consent text={sx("feedShare")} on={d.settings.feed} onChange={(v) => void call("settings", "PUT", { feed: v }).then(load)} />
        {d.feed.length ? <List>{d.feed.map((e) => <FeedRow key={e.id} e={e} sx={sx} nf={nf} surah={surah} />)}</List> : <p className="text-muted">{sx("feedEmpty")}</p>}
      </Section>

      {modal === "khatmNew" ? <KhatmNew c={c} onClose={() => setModal(null)} onDone={after("khatm")} /> : null}
      {modal === "khatmJoin" || modal === "classJoin" ? <Join c={c} kind={modal === "khatmJoin" ? "khatm" : "classes"} onClose={() => setModal(null)} onDone={after(modal === "khatmJoin" ? "khatm" : "class")} /> : null}
      {modal === "classNew" ? <ClassNew c={c} onClose={() => setModal(null)} onDone={after("class")} /> : null}
      {modal === "duel" ? <DuelNew c={c} onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} /> : null}
    </>
  );
}
function FeedRow({ e, sx, nf, surah }: { e: FeedEvent; sx: Ctx["sx"]; nf: Ctx["nf"]; surah: Ctx["surah"] }) {
  const [mine, setMine] = useState(e.mine);
  const [n, setN] = useState(e.mashallah);
  const toggle = () => { const on = !mine; setMine(on); setN((x) => x + (on ? 1 : -1)); void call(`feed/${e.id}/react`, "POST", { on }).catch(() => { setMine(!on); setN((x) => x + (on ? -1 : 1)); }); };
  const line = sx(`ev_${e.kind}` as SocialKey, { u: e.author.name, s: e.kind === "surah" ? surah(Number(e.ref)) : "" });
  return <Row c={e.author} sub={line} right={e.own ? (n ? <span className="font-semibold text-gold">{nf(n)}</span> : null) : <Chip label={n ? `${sx("mashallah")} ${nf(n)}` : sx("mashallah")} on={mine} onClick={toggle} />} />;
}
function KhatmNew({ c, onClose, onDone }: { c: Ctx; onClose: () => void; onDone: (r: { id: string }) => void }) {
  const [name, setName] = useState("");
  const [intention, setIntention] = useState("general");
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState("");
  return (
    <Modal title={c.sx("khatmNew")} onClose={onClose}>
      <input className={inputCls} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder={c.sx("name")} aria-label={c.sx("name")} />
      <p className="font-semibold">{c.sx("intention")}</p>
      <div className="flex flex-wrap gap-2">{INTENTIONS.map((i) => <Chip key={i} label={c.sx(`int_${i}` as SocialKey)} on={intention === i} onClick={() => setIntention(i)} />)}</div>
      <Consent text={c.sx("khatmConsent")} on={ok} onChange={setOk} />
      {msg ? <p className="text-muted">{msg}</p> : null}
      <Btn primary disabled={!ok || name.trim().length < 2} onClick={() => void call<{ id: string }>("khatm", "POST", { name, intention }).then(onDone).catch((e) => setMsg(c.err(e)))}>{c.sx("create")}</Btn>
    </Modal>
  );
}
function Join({ c, kind, onClose, onDone }: { c: Ctx; kind: "khatm" | "classes"; onClose: () => void; onDone: (r: { id: string }) => void }) {
  const [code, setCode] = useState("");
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState("");
  return (
    <Modal title={c.sx(kind === "khatm" ? "khatmJoin" : "classJoin")} onClose={onClose}>
      <input className={inputCls} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="XXXX-XXXX" aria-label="Code" />
      <Consent text={c.sx(kind === "khatm" ? "khatmConsent" : "classConsent")} on={ok} onChange={setOk} />
      {msg ? <p className="text-muted">{msg}</p> : null}
      <Btn primary disabled={!ok || code.replace(/[^A-Z0-9]/g, "").length < 8} onClick={() => void call<{ id: string }>(`${kind}/join`, "POST", { code, consent: true }).then(onDone).catch((e) => setMsg(c.err(e)))}>{c.sx("join")}</Btn>
    </Modal>
  );
}
function ClassNew({ c, onClose, onDone }: { c: Ctx; onClose: () => void; onDone: (r: { id: string }) => void }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState("verses");
  const [target, setTarget] = useState("10");
  const [msg, setMsg] = useState("");
  return (
    <Modal title={c.sx("classNew")} onClose={onClose}>
      <input className={inputCls} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder={c.sx("name")} aria-label={c.sx("name")} />
      <p className="font-semibold">{c.sx("target")}</p>
      <div className="flex gap-2">{TK.map((k) => <Chip key={k} label={c.sx(`tk_${k}` as SocialKey)} on={kind === k} onClick={() => setKind(k)} />)}</div>
      <input className={inputCls} inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value.replace(/\D/g, "").slice(0, 5))} aria-label={c.sx("target")} />
      {msg ? <p className="text-muted">{msg}</p> : null}
      <Btn primary disabled={name.trim().length < 2} onClick={() => void call<{ id: string }>("classes", "POST", { name, targetKind: kind, target: Number(target) }).then(onDone).catch((e) => setMsg(c.err(e)))}>{c.sx("create")}</Btn>
    </Modal>
  );
}
function DuelNew({ c, onClose, onDone }: { c: Ctx; onClose: () => void; onDone: () => void }) {
  const [friends, setFriends] = useState<Card[]>([]);
  const [msg, setMsg] = useState("");
  useEffect(() => { void fetch("/api/together/friends?for=challenges", { cache: "no-store" }).then((r) => r.json()).then((d: { friends?: Card[] }) => setFriends(d.friends ?? [])).catch(() => undefined); }, []);
  return (
    <Modal title={c.sx("duelNew")} onClose={onClose}>
      <p className="text-muted">{c.sx("duelsLead")}</p>
      <div className="flex flex-wrap gap-2">{friends.map((f) => <Chip key={f.username} label={f.name} on={false} onClick={() => void call("duels", "POST", { username: f.username }).then(onDone).catch((e) => setMsg(c.err(e)))} />)}</div>
      {msg ? <p className="text-muted">{msg}</p> : null}
    </Modal>
  );
}

// ---------- khatm ----------
function KhatmView(c: Ctx & { id: string }) {
  const { sx, err, nf, id } = c;
  const router = useRouter();
  const [k, setK] = useState<Khatm | null>(null);
  const [msg, setMsg] = useState("");
  const load = useCallback(() => { call<{ khatm: Khatm }>(`khatm/${id}`).then((r) => setK(r.khatm)).catch((e) => setMsg(err(e))); }, [id, err]);
  useEffect(load, [load]);
  if (!k) return <p className="mt-8 text-muted">{msg || "…"}</p>;
  const act = (b: Record<string, unknown>) => call<Khatm>(`khatm/${id}`, "POST", b).then((r) => { setMsg(""); if ((r as Khatm).parts) setK(r); }).catch((e) => setMsg(err(e)));
  const done = k.parts.filter((p) => p.state === "done").length;
  return (
    <>
      <h2 className="font-display mt-8 text-3xl">{k.name}</h2>
      <p className="text-muted">{sx(`int_${k.intention}` as SocialKey)} · {sx("members", { n: nf(k.members.length) })}</p>
      {k.code ? <p className="mt-1 font-semibold text-accent">{sx("code", { code: k.code })}</p> : null}
      {msg ? <p role="status" className="mt-3 text-muted">{msg}</p> : null}
      {k.completed ? (
        <div className="mt-6 space-y-4">
          <Stage>
            <p className="text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-[#d6b46c]">{sx("duaTitle")}</p>
            <p className="font-display mt-3 text-center text-2xl text-[#f3e2b6]">{sx("khatmComplete")}</p>
            <p lang="ar" dir="rtl" className="mt-4 text-center font-arabic text-3xl leading-loose">اللَّهُمَّ ارْحَمْنَا بِالْقُرْآنِ</p>
            <p className="mt-3 text-center text-white/80">{sx("duaText")}</p>
          </Stage>
          <Btn primary onClick={() => void shareCard([
            { text: sx("duaTitle").toUpperCase(), size: 30, color: "rgb(214,180,108)" },
            { text: sx("khatmComplete"), size: 64, color: "#f3e2b6" },
            { text: "اللَّهُمَّ ارْحَمْنَا بِالْقُرْآنِ", size: 72, color: "#eef0f3", font: "ar" },
            { text: sx("duaText"), size: 36, color: "rgba(255,255,255,0.8)" },
            { text: `${k.name} · ${sx("members", { n: nf(k.members.length) })}`, size: 34, color: "rgb(214,180,108)" },
          ], "khatm.png")}>{sx("shareCard")}</Btn>
        </div>
      ) : (
        <div className="mt-6"><p className="mb-1.5 text-[13px] font-semibold text-muted">{sx("doneOf", { n: nf(done) })}</p><Bar value={done} max={30} /></div>
      )}
      <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {k.parts.map((p) => (
          <div key={p.juz} className={`rounded-lg border p-2 ${p.state === "done" ? "border-[#c6a65e] bg-[#c6a65e] text-[rgb(8,38,29)]" : p.mine ? "border-accent bg-[rgba(6,108,78,0.08)]" : "border-line bg-surface"}`}>
            <p className="font-bold">{sx("juzN", { n: p.juz })}</p>
            <p className="truncate text-[12px] opacity-80">{p.by ? p.by.name.split(" ")[0] : sx(`st_${p.state}` as SocialKey)}</p>
            {!k.completed && !k.suspended ? (
              p.state === "open" ? <button type="button" onClick={() => void act({ action: "claim", juz: p.juz })} className="mt-1 text-[12px] font-semibold text-accent hover:underline">{sx("claim")}</button>
              : p.mine && p.state === "claimed" ? (
                <span className="mt-1 flex flex-col items-start gap-0.5">
                  <button type="button" onClick={() => void act({ action: "done", juz: p.juz })} className="text-[12px] font-semibold text-accent hover:underline">{sx("markDone")}</button>
                  <button type="button" onClick={() => void act({ action: "release", juz: p.juz })} className="text-[12px] text-muted hover:underline">{sx("release")}</button>
                </span>
              ) : null
            ) : null}
          </div>
        ))}
      </div>
      <Section title={sx("members", { n: nf(k.members.length) })}>
        <List>{k.members.map((m) => (
          <Row key={m.username} c={m} right={<span className="flex gap-2">
            {k.owner ? <Btn small onClick={() => void act({ action: "remove", username: m.username }).then(load)}>{sx("remove")}</Btn> : null}
            <Btn small onClick={() => void block(m.username).then(load)}>{sx("block")}</Btn>
          </span>} />
        ))}</List>
      </Section>
      <div className="mt-6 flex gap-3">
        <Btn onClick={() => void call(`khatm/${id}`, "POST", { action: "leave" }).then(() => router.push("/together/social"))}>{sx("leave")}</Btn>
        <Btn onClick={() => { if (window.confirm(sx("report"))) void call(`khatm/${id}`, "POST", { action: "report", category: "other" }).then(() => setMsg(sx("reportDone"))); }}>{sx("report")}</Btn>
      </div>
    </>
  );
}

// ---------- live halaqa ----------
function HalaqaView(c: Ctx & { id: string }) {
  const { sx, err, nf, id, surah, chapters } = c;
  const [h, setH] = useState<Halaqa | null>(null);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const poll = useCallback(() => { call<{ halaqa: Halaqa }>(`halaqa/${id}`).then((r) => setH(r.halaqa)).catch((e) => setMsg(err(e))); }, [id, err]);
  useEffect(() => {
    poll();
    const iv = setInterval(() => { if (document.visibilityState === "visible") poll(); }, 4000);
    return () => clearInterval(iv);
  }, [poll]);
  const key = h?.live ? `${h.surah}:${h.ayah}` : null;
  useEffect(() => { if (key) void verseText(key).then(setText); }, [key]);
  if (!h) return <p className="mt-8 text-muted">{msg || "…"}</p>;
  const act = (b: Record<string, unknown>) => call<{ halaqa: Halaqa }>(`halaqa/${id}`, "POST", b).then((r) => setH(r.halaqa)).catch((e) => setMsg(err(e)));
  const count = (s: number) => chapters.find((x) => x[0] === s)?.[2] ?? 286;
  const step = (d: number) => {
    let s = h.surah ?? 1, a = (h.ayah ?? 1) + d;
    if (a > count(s) && s < 114) { s += 1; a = 1; }
    if (a < 1 && s > 1) { s -= 1; a = count(s); }
    void act({ action: "cursor", surah: s, ayah: Math.max(1, a) });
  };
  return (
    <>
      <h2 className="font-display mt-8 text-3xl">{h.circle.name}</h2>
      {msg ? <p role="status" className="mt-3 text-muted">{msg}</p> : null}
      {!h.live ? (
        <Tile className="mt-6"><p>{sx("halaqaNone")}</p>{h.canStart ? <div className="mt-3"><Btn primary onClick={() => void act({ action: "start", surah: 1, ayah: 1 })}>{sx("halaqaStart")}</Btn></div> : null}</Tile>
      ) : (
        <>
          <div className="mt-6"><Stage>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#d6b46c]">{h.leader ? sx("leads", { u: h.leader.name }) : sx("halaqa")}</p>
            <p className="mt-2 font-bold text-[#f3e2b6]">{sx("surahAyah", { s: surah(h.surah ?? 1), n: nf(h.ayah ?? 1) })}</p>
            <p lang="ar" dir="rtl" className="mt-4 font-arabic text-3xl leading-[2.1]">{text}</p>
          </Stage></div>
          <div className="mt-4 flex gap-3">
            {h.leading ? (<><Btn onClick={() => step(-1)}>{sx("prev")}</Btn><Btn primary onClick={() => step(1)}>{sx("next")}</Btn></>)
              : <Btn primary onClick={() => void act({ action: "hand", up: !h.myHand })}>{h.myHand ? sx("lowerHand") : sx("raiseHand")}</Btn>}
          </div>
          <Section title={sx("present", { n: nf(h.present?.length ?? 0) })}>
            <List>{(h.present ?? []).map((p) => (
              <Row key={p.username} c={p} hl={p.hand} sub={p.hand ? sx("handUp") : undefined}
                right={h.leading && p.hand ? <Btn small onClick={() => void act({ action: "lower", username: p.username })}>{sx("lowerHand")}</Btn> : null} />
            ))}</List>
          </Section>
          {h.leading || h.canStart ? <div className="mt-6"><Btn onClick={() => void act({ action: "end" })}>{sx("halaqaEnd")}</Btn></div> : null}
        </>
      )}
    </>
  );
}

// ---------- recap ----------
function RecapView(c: Ctx) {
  const { sx, err, nf, surah } = c;
  const [r, setR] = useState<Recap | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { call<{ recap: Recap }>("recap").then((x) => setR(x.recap)).catch((e) => setMsg(err(e))); }, [err]);
  if (!r) return <p className="mt-8 text-muted">{msg || "…"}</p>;
  const stats: [string, string][] = [[nf(r.verses), sx("recapVerses")], [nf(r.days), sx("recapDays")], [nf(r.streak), sx("recapStreak")], ...(r.juz ? [[nf(r.juz), sx("recapJuz")] as [string, string]] : [])];
  return (
    <div className="mt-8 space-y-4">
      <Stage>
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#d6b46c]">{sx("recap")}</p>
        <p className="font-display mt-2 text-3xl">{r.name}</p>
        <div className="mt-4 grid grid-cols-2 gap-4">{stats.map(([n, l]) => <div key={l}><p className="font-display text-4xl text-[#f3e2b6]">{n}</p><p className="text-[13px] text-white/75">{l}</p></div>)}</div>
        {r.surah ? <p className="mt-4 font-bold text-[#f3e2b6]">{sx("recapSurah")}: {surah(r.surah)}</p> : null}
        {r.circle ? <p className="mt-1 text-white/75">{sx("recapRank", { n: nf(r.circle.rank), m: nf(r.circle.of), c: r.circle.name })}</p> : null}
        <p className="mt-5 border-t border-white/15 pt-3 text-[12px] font-semibold text-[#d6b46c]">{sx("recapFooter")}</p>
      </Stage>
      <p className="text-[13px] text-muted">{sx("recapNote")}</p>
      <Btn primary onClick={() => void shareCard([
        { text: sx("recap").toUpperCase(), size: 30, color: "rgb(214,180,108)" },
        { text: r.name, size: 64, color: "#eef0f3" },
        ...stats.map(([n, l]) => ({ text: `${n}  ${l}`, size: 44, color: "#f3e2b6" })),
        ...(r.surah ? [{ text: `${sx("recapSurah")}: ${surah(r.surah)}`, size: 36, color: "rgba(255,255,255,0.85)" }] : []),
        ...(r.circle ? [{ text: sx("recapRank", { n: nf(r.circle.rank), m: nf(r.circle.of), c: r.circle.name }), size: 32, color: "rgba(255,255,255,0.75)" }] : []),
        { text: sx("recapFooter"), size: 30, color: "rgb(214,180,108)" },
      ], "week.png")}>{sx("recapShare")}</Btn>
    </div>
  );
}

// ---------- duels ----------
function DuelRow({ d, c, onChange }: { d: Duel; c: Ctx; onChange: () => void }) {
  const { sx, nf } = c;
  const sub = d.status === "done" && d.mine !== null && d.theirs !== null ? sx("duelResult", { n: nf(d.mine), u: d.other.name, m: nf(d.theirs) })
    : d.played ? `${sx("duelDone", { n: nf(d.mine ?? 0), m: nf(d.total) })} · ${sx("duelWaiting", { u: d.other.name })}`
    : d.fromMe ? sx("duelWaiting", { u: d.other.name }) : sx("duelInvited", { u: d.other.name });
  return <Row c={d.other} sub={sub} right={d.status === "open" && !d.played ? (
    <span className="flex gap-2">
      <Link href={href("duel", d.id)} className={`inline-flex h-9 items-center rounded-full px-3 text-[13.5px] font-bold ${gold}`}>{sx("duelPlay")}</Link>
      {!d.fromMe ? <Btn small onClick={() => void call(`duels/${d.id}`, "POST", { action: "decline" }).then(onChange)}>{sx("duelDecline")}</Btn> : null}
    </span>
  ) : null} />;
}
function DuelView(c: Ctx & { id: string }) {
  const { sx, err, nf, id, surah } = c;
  const [qs, setQs] = useState<{ show: string; options: string[]; text: string }[] | null>(null);
  const [ans, setAns] = useState<string[]>([]);
  const [res, setRes] = useState<{ score: number; total: number } | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    call<{ questions: { show: string; options: string[] }[] }>(`duels/${id}/questions`)
      .then(async (r) => setQs(await Promise.all(r.questions.map(async (q) => ({ ...q, text: await verseText(q.show) })))))
      .catch((e) => setMsg(err(e)));
  }, [id, err]);
  if (res) return <Tile className="mt-8 text-center"><p className="font-display text-3xl">{sx("duelDone", { n: nf(res.score), m: nf(res.total) })}</p><div className="mt-4"><Link href="/together/social" className="font-semibold text-accent">{sx("duels")}</Link></div></Tile>;
  if (!qs) return <p className="mt-8 text-muted">{msg || "…"}</p>;
  const i = ans.length;
  const q = qs[Math.min(i, qs.length - 1)];
  const label = (k: string) => { const [s, a] = k.split(":"); return `${surah(Number(s))}:${a}`; };
  const pick = (k: string) => {
    const next = [...ans, k];
    setAns(next);
    if (next.length === qs.length) void call<{ score: number; total: number }>(`duels/${id}`, "POST", { action: "answer", answers: next }).then(setRes).catch((e) => setMsg(err(e)));
  };
  return (
    <div className="mt-8 space-y-4">
      <p className="text-[13px] font-semibold text-muted">{sx("duelQn", { n: nf(Math.min(i + 1, qs.length)), m: nf(qs.length) })}</p>
      <Stage>
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#d6b46c]">{sx("duelQ")}</p>
        <p lang="ar" dir="rtl" className="mt-4 font-arabic text-3xl leading-[2.1]">{q.text}</p>
      </Stage>
      <div className="grid gap-2">{q.options.map((o) => <Btn key={o} disabled={ans.length >= qs.length} onClick={() => pick(o)}>{label(o)}</Btn>)}</div>
      {msg ? <p className="text-muted">{msg}</p> : null}
    </div>
  );
}

// ---------- classes ----------
function ClassView(c: Ctx & { id: string }) {
  const { sx, err, nf, id, locale } = c;
  const router = useRouter();
  const [k, setK] = useState<SClass | null>(null);
  const [post, setPost] = useState("");
  const [msg, setMsg] = useState("");
  const load = useCallback(() => { call<{ class: SClass }>(`classes/${id}`).then((r) => setK(r.class)).catch((e) => setMsg(err(e))); }, [id, err]);
  useEffect(load, [load]);
  if (!k) return <p className="mt-8 text-muted">{msg || "…"}</p>;
  const act = (b: Record<string, unknown>) => call<SClass>(`classes/${id}`, "POST", b).then((r) => { setMsg(""); if ((r as SClass).id) setK(r); else router.push("/together/social"); }).catch((e) => setMsg(err(e)));
  return (
    <>
      <h2 className="font-display mt-8 text-3xl">{k.name}</h2>
      {k.teacher ? <p className="text-muted">{sx("teacher", { u: k.teacher.name })}</p> : null}
      <p className="font-semibold">{sx("target")}: {nf(k.target)} {sx(`tk_${k.targetKind}` as SocialKey)}</p>
      {k.code ? <p className="mt-1 font-semibold text-accent">{sx("code", { code: k.code })}</p> : null}
      {msg ? <p role="status" className="mt-3 text-muted">{msg}</p> : null}
      <Section title={sx("announce")}>
        {k.teaching ? (
          <Tile>
            <textarea value={post} maxLength={500} onChange={(e) => setPost(e.target.value)} placeholder={sx("announcePh")} aria-label={sx("announcePh")} className="min-h-24 w-full rounded-lg border border-line bg-surface p-3 text-[16px]" />
            <div className="mt-2"><Btn primary disabled={post.trim().length < 2} onClick={() => void act({ action: "post", body: post }).then(() => setPost(""))}>{sx("post")}</Btn></div>
          </Tile>
        ) : null}
        {k.posts.map((p) => (
          <Tile key={p.id}>
            <p className="whitespace-pre-line">{p.body}</p>
            <div className="mt-2 flex items-center gap-3 text-[12px] text-muted">
              <span className="flex-1">{new Date(p.at).toLocaleDateString(locale)}{p.review ? ` · ${sx("inReview")}` : ""}</span>
              {k.teaching ? <Btn small onClick={() => void act({ action: "unpost", postId: p.id })}>{sx("remove")}</Btn>
                : <Btn small onClick={() => { if (window.confirm(sx("report"))) void call(`classes/${id}`, "POST", { action: "report", postId: p.id, category: "other" }).then(() => setMsg(sx("reportDone"))); }}>{sx("report")}</Btn>}
            </div>
          </Tile>
        ))}
      </Section>
      <Section title={sx("members", { n: nf(k.memberCount) })}>
        <List>{k.members.map((m) => (
          <Row key={m.username} c={m} hl={m.me} sub={`${sx("progressOf", { n: nf(m.progress), m: nf(k.target) })}${m.reached ? ` · ${sx("reached")}` : ""}`}
            right={k.teaching ? <span className="flex gap-2"><Btn small onClick={() => void act({ action: "remove", username: m.username })}>{sx("remove")}</Btn><Btn small onClick={() => void block(m.username).then(load)}>{sx("block")}</Btn></span> : null} />
        ))}</List>
      </Section>
      <div className="mt-6 flex flex-wrap gap-3">
        {k.teaching ? (
          <>
            <Btn onClick={() => void act({ action: "newCode" })}>{sx("newCode")}</Btn>
            <Btn onClick={() => { if (window.confirm(sx("deleteClass"))) void act({ action: "delete" }); }}>{sx("deleteClass")}</Btn>
          </>
        ) : (
          <>
            <Btn onClick={() => void act({ action: "leave" })}>{sx("leave")}</Btn>
            <Btn onClick={() => { if (window.confirm(sx("report"))) void call(`classes/${id}`, "POST", { action: "report", category: "other" }).then(() => setMsg(sx("reportDone"))); }}>{sx("report")}</Btn>
            {k.teacher ? <Btn onClick={() => void block(k.teacher!.username).then(() => router.push("/together/social"))}>{sx("block")}</Btn> : null}
          </>
        )}
      </div>
    </>
  );
}

// ---------- network ----------
type Network = { settings: Settings; username: string | null; suggestions: (Card & { reason: string })[]; incoming: number; views: number | null };
type NetProfile = { own: boolean; canEndorse: boolean; endorsements: { skill: string; ref: number; count: number; mine: boolean }[]; khatms: number; views: number | null; activity: { kind: string; ref: string }[] };
function NetworkSection(c: Ctx) {
  const { sx, nf } = c;
  const [n, setN] = useState<Network | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const load = useCallback(() => { call<Network>("network").then(setN).catch(() => undefined); }, []);
  useEffect(load, [load]);
  if (!n) return null;
  const save = (b: Partial<Settings>) => void call("settings", "PUT", b).then(load);
  const connect = (u: string) => void fetch(`/api/community/connections/${encodeURIComponent(u)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: "" }) })
    .then((r) => { if (r.ok) setSent((x) => new Set(x).add(u)); });
  return (
    <Section title={sx("network")} action={n.username ? <Link href={href("profile", n.username)} className="text-[14px] font-semibold text-accent">{sx("myProfile")}</Link> : null}>
      <p className="text-[14px] text-muted">{sx("networkLead")}</p>
      {n.incoming ? <Link href="/talents/requests" className="block rounded-xl border border-[#c6a65e] p-4 font-bold">{sx("requestsN", { n: nf(n.incoming) })}</Link> : null}
      {n.views !== null ? <Tile><p className="font-semibold">{sx("viewsN", { n: nf(n.views) })}</p></Tile> : null}
      <Consent text={sx("suggestShare")} on={n.settings.suggest} onChange={(v) => save({ suggest: v })} />
      <Consent text={sx("viewsShare")} on={n.settings.views} onChange={(v) => save({ views: v })} />
      {n.suggestions.length ? (
        <>
          <p className="font-semibold">{sx("pymk")}</p>
          <List>{n.suggestions.map((p) => (
            <Row key={p.username} c={p} sub={sx(`rs_${p.reason}` as SocialKey)} right={sent.has(p.username) ? <span className="text-[13px] text-muted">{sx("sent")}</span> : <Btn small onClick={() => connect(p.username)}>{sx("connect")}</Btn>} />
          ))}</List>
        </>
      ) : null}
    </Section>
  );
}
const SKILLS = ["tajweed", "hifz", "makharij"];
function ProfileView(c: Ctx & { id: string }) {
  const { sx, err, nf, surah, id } = c;
  const [p, setP] = useState<NetProfile | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    call<{ profile: NetProfile }>(`profile/${encodeURIComponent(id)}`).then((r) => { setP(r.profile); if (!r.profile.own) void call(`profile/${encodeURIComponent(id)}/view`, "POST", {}).catch(() => undefined); }).catch((e) => setMsg(err(e)));
  }, [id, err]);
  if (!p) return <p className="mt-8 text-muted">{msg || "…"}</p>;
  const label = (s: string, ref: number) => (s === "surah" ? sx("sk_surah", { s: surah(ref) }) : sx(`sk_${s}` as SocialKey));
  const toggle = (skill: string, on: boolean, ref?: number) => void call<{ profile: NetProfile }>(`profile/${encodeURIComponent(id)}/endorse`, "POST", { skill, on, ref }).then((r) => setP(r.profile)).catch((e) => setMsg(err(e)));
  const shown = new Set(p.endorsements.map((e) => `${e.skill}:${e.ref}`));
  return (
    <>
      <h2 className="font-display mt-8 text-3xl"><Link href={`/talents/${id}`} className="hover:underline">@{id}</Link></h2>
      {msg ? <p role="status" className="mt-3 text-muted">{msg}</p> : null}
      {p.views !== null ? <Tile className="mt-4"><p className="font-semibold">{sx("viewsN", { n: nf(p.views) })}</p></Tile> : null}
      <Section title={sx("endorsements")}>
        <div className="flex flex-wrap gap-2">
          {p.endorsements.map((e) => <Chip key={`${e.skill}:${e.ref}`} label={`${label(e.skill, e.ref)} ${nf(e.count)}`} on={e.mine} onClick={() => { if (p.canEndorse) toggle(e.skill, !e.mine, e.ref || undefined); }} />)}
          {p.canEndorse ? SKILLS.filter((s) => !shown.has(`${s}:0`)).map((s) => <Chip key={s} label={`${sx("endorse")}: ${label(s, 0)}`} on={false} onClick={() => toggle(s, true)} />) : null}
        </div>
      </Section>
      <Section title={sx("activity")}>
        {p.khatms ? <p>{sx("khatmsN", { n: nf(p.khatms) })}</p> : null}
        {p.activity.length ? p.activity.map((a, i) => <p key={i} className="text-muted">{sx(`ev_${a.kind}` as SocialKey, { u: `@${id}`, s: a.kind === "surah" ? surah(Number(a.ref)) : "" })}</p>) : <p className="text-muted">{sx("feedEmpty")}</p>}
      </Section>
      {!p.own ? <div className="mt-6"><Btn onClick={() => void block(id).then(() => setMsg(sx("reportDone")))}>{sx("block")}</Btn></div> : null}
    </>
  );
}
