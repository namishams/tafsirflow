"use client";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Avatar } from "@/components/talents/TalentProfileWeb";
import { BadgeIcon, type WebBadge } from "@/components/talents/BadgeIcon";
import MomentReactions from "@/components/talents/MomentReactions";
import { countryName } from "@/lib/countries";
import { momentLine } from "@/lib/sijillMoment";
import type { SwKey } from "@/lib/sijillWeb";
import { fill, type TgKey } from "@/lib/togetherWeb";
import { demoAllowed, demoMoments, demoReply } from "@/lib/togetherSample";
import { readIdentity } from "@/lib/identity";

// "Together" on the website (owner 22.10.2026), 1:1 with the app's /together screens (mobile/src/app/together/*):
// friends today, weekly friend league, study circles (no chat), challenges between two friends, learn-together sessions,
// gentle preset reminders, celebrations with MashaAllah and the community goals. Same endpoints (/api/together/*), same
// texts (src/lib/togetherWeb.ts). Everything opt-in, 16+, report and block everywhere. `?demo=1` shows sample data in
// development builds only (never in production).
export type View = "hub" | "league" | "circles" | "circle" | "community" | "settings";
type Card = { username: string; name: string; country: string | null; avatar?: string | null; badge?: WebBadge | null; level?: string };
type Settings = Record<"activity" | "league" | "circles" | "challenges" | "nudges" | "community" | "bestList", boolean> & { gender: "brother" | "sister" | null };
type Friend = Card & { today: boolean; streak: number; weekActive: number };
type FriendsToday = { list: Friend[]; sharing: number; friends: number; learnedToday: number; keptStreak: number };
type CircleSummary = { id: string; name: string; kind: string; role: string; status: string; members: number; pending: number; suspended: boolean; goalKind: string; goal: number; progress: number; reached: boolean; streak: number };
type Pulse = { settings: Settings; friends: FriendsToday; league: { tier: number } | null; circles: CircleSummary[]; inbox: { unread: number } };
type LeagueRow = Card & { xp: number; tier: number; me: boolean; active: number; rank: number };
type League = { enabled: boolean; tier?: number; last?: { result: string } | null; rows?: LeagueRow[]; upZone?: number; daysLeft?: number };
type Member = Card & { role: string; me: boolean; today: boolean; streak: number; week: { xp: number; days: number; verses: number }; canNudge: boolean };
type Circle = { id: string; name: string; kind: string; role: string; status: string; suspended: boolean; goalKind: string; goal: number; code: string | null; members: Member[]; pending: Card[]; progress: number; reached: boolean; streak: number; history: { week: number; progress: number; goal: number; reached: boolean }[] };
type Challenge = { id: string; kind: string; target: number; days: number; status: string; fromMe: boolean; other: Card; goal: number; mine: number; theirs: number; mineDone: boolean; theirsDone: boolean };
type Invite = { id: string; topic: string; surah: number | null; at: string; mine: boolean; from: Card | null; to: Card | null; circle: { id: string; name: string } | null; myAnswer: string | null; yes: number };
type Nudge = { id: string; kind: string; read: boolean; circle: { id: string; name: string } | null; from: Card };
type Inbox = { nudges: Nudge[]; challenges: Challenge[]; invites: Invite[]; joinRequests: number; unread: number };
type BestRow = Card & { rank: number; verses: number };
type Community = { world: { verses: number; learners: number; goal: number }; country: { code: string; verses: number; learners: number; goal: number } | null; countries: { country: string; verses: number; learners: number }[]; best: { world: BestRow[]; country: BestRow[] }; mine: { community: boolean; bestList: boolean } };
type Moment = { id: string; kind: string; ref: string; data: Record<string, unknown>; at: string; title: string | null; total: number; mine: null | "like" | "mashallah" | "barakallah" | "barik"; own: boolean; counts: Record<"like" | "mashallah" | "barakallah" | "barik", number>; author: Card };

const NUDGES = ["miss_you", "together_today", "dua_ease", "well_done", "keep_streak"];
const CATS = ["spam", "harassment", "inappropriate", "impersonation", "minor_safety", "other"];
const gold = "bg-[#c6a65e] text-[rgb(8,38,29)] hover:brightness-105";
const soft = "bg-[rgba(6,108,78,0.08)] dark:bg-white/10 text-ink";
class HttpErr extends Error { constructor(public status: number, public code: string) { super(code); } }

function useApi(demo: boolean) {
  return useCallback(async <T,>(path: string, method = "GET", body?: unknown): Promise<T> => {
    if (demo) return demoReply(path, method, body) as T;
    const r = await fetch(path, { method, cache: "no-store", headers: body !== undefined ? { "Content-Type": "application/json" } : undefined, body: body !== undefined ? JSON.stringify(body) : undefined });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new HttpErr(r.status, (d as { error?: string }).error ?? "generic");
    return d as T;
  }, [demo]);
}

export default function TogetherWeb({ view, t, sx, locale, circleId }: { view: View; t: Record<TgKey, string>; sx: Record<string, string>; locale: string; circleId?: string }) {
  const [demo, setDemo] = useState(false);
  useEffect(() => { if (demoAllowed() && new URLSearchParams(window.location.search).get("demo") === "1") setDemo(true); }, []);
  const api = useApi(demo);
  const [state, setState] = useState<"load" | "ok" | "out" | "age" | "profile">("load");
  const [msg, setMsg] = useState("");
  const tx = useCallback((k: TgKey, v?: Record<string, string | number>) => (v ? fill(t[k] ?? k, v) : t[k] ?? k), [t]);
  const err = useCallback((e: unknown) => {
    if (e instanceof HttpErr) {
      if (e.status === 401 || e.code === "verify" || e.code === "login") { setState("out"); return ""; }
      if (e.code === "age16" || e.code === "age" || e.code === "age_required") { setState("age"); return ""; }
      if (e.code === "profile_required") { setState("profile"); return ""; }
      const k = `e_${e.code}` as TgKey;
      return t[k] ?? t.e_generic;
    }
    return t.e_generic;
  }, [t]);
  const nf = useCallback((n: number) => n.toLocaleString(locale), [locale]);
  const ctx = { api, tx, err, nf, locale, demo, setState, setMsg, sx, circleId };

  const titles: Record<View, [TgKey, TgKey]> = { hub: ["title", "lead"], league: ["league", "leagueLead"], circles: ["circles", "circlesLead"], circle: ["circles", "circlesLead"], community: ["community", "communityLead"], settings: ["settings", "settingsLead"] };
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold rtl:tracking-normal">{view === "hub" ? tx("eyebrow") : <Link href="/together" className="hover:underline">{tx("eyebrow")}</Link>}</p>
      <h1 className="font-display mt-2 text-4xl">{tx(titles[view][0])}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">{tx(titles[view][1])}</p>
      {view === "hub" ? <Link href="/together/settings" className={`mt-4 inline-flex h-10 items-center rounded-full px-4 text-[14px] font-semibold ${soft}`}>{tx("settingsBtn")}</Link> : null}
      {demo ? <p className="mt-4 text-center text-[12px] font-semibold text-muted">{tx("demo")}</p> : null}
      {msg ? <p role="status" className="mt-4 text-muted">{msg}</p> : null}
      {state === "out" ? <p className="mt-8">{tx("signIn")} · <Link href="/account" className="font-semibold text-accent hover:underline">{tx("signInBtn")}</Link></p>
        : state === "age" ? <p className="mt-8">{tx("age16")}</p>
        : state === "profile" ? <p className="mt-8">{tx("needProfile")} · <Link href="/username" className="font-semibold text-accent hover:underline">{tx("createProfile")}</Link></p>
        : view === "hub" ? <Hub {...ctx} onOk={() => setState("ok")} />
        : view === "league" ? <LeagueView {...ctx} />
        : view === "circles" ? <CirclesView {...ctx} />
        : view === "circle" ? <CircleView {...ctx} />
        : view === "community" ? <CommunityView {...ctx} />
        : <SettingsView {...ctx} />}
      <SafetyLine tx={tx} />
    </div>
  );
}

type Ctx = {
  api: ReturnType<typeof useApi>; tx: (k: TgKey, v?: Record<string, string | number>) => string; err: (e: unknown) => string; nf: (n: number) => string;
  locale: string; demo: boolean; setState: (s: "load" | "ok" | "out" | "age" | "profile") => void; setMsg: (m: string) => void; sx: Record<string, string>; circleId?: string;
};

// ---------- small parts ----------
function SafetyLine({ tx }: { tx: Ctx["tx"] }) {
  return (
    <div className="mt-10 border-t border-line pt-4 text-[13px] text-muted">
      <p>{tx("safety")}</p>
      <Link href="/talents" className="mt-1 inline-block font-semibold text-accent hover:underline">{tx("guidelines")}</Link>
    </div>
  );
}
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
function Bar({ value, max, dark }: { value: number; max: number; dark?: boolean }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} className={`h-1.5 overflow-hidden rounded-full ${dark ? "bg-white/20" : "bg-line"}`}><div className="h-full rounded-full bg-gradient-to-r from-[#c6a65e] to-[#ecd7a2]" style={{ width: `${pct}%` }} /></div>;
}
function Progress({ value, max, label, tx, nf }: { value: number; max: number; label?: string; tx: Ctx["tx"]; nf: Ctx["nf"] }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[13px]"><span className="font-semibold text-muted">{label}</span><span className="font-bold">{tx("progressOf", { n: nf(value), m: nf(max) })}</span></div>
      <Bar value={value} max={max} />
    </div>
  );
}
function Row({ c, sub, right, me, demo }: { c: Card; sub?: string; right?: ReactNode; me?: boolean; demo?: boolean }) {
  const inner = (
    <span className="flex min-w-0 flex-1 items-center gap-3">
      <Avatar src={c.avatar} size={42} badge={c.badge ?? null} />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 font-bold"><span className="truncate">{c.name}</span>{c.badge ? <BadgeIcon badge={c.badge} size={14} /> : null}</span>
        {sub ? <span className="block text-[13px] text-muted">{sub}</span> : null}
      </span>
    </span>
  );
  return (
    <li className={`flex items-center gap-3 px-4 py-3 ${me ? "bg-[#c6a65e]/10" : ""}`}>
      {demo ? inner : <Link href={`/talents/${c.username}`} className="flex min-w-0 flex-1 hover:opacity-80">{inner}</Link>}
      {right}
    </li>
  );
}
const List = ({ children }: { children: ReactNode }) => <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">{children}</ul>;
function StageCard({ children }: { children: ReactNode }) {
  return <div className="stage rounded-xl p-5 text-white">{children}</div>;
}
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div role="dialog" aria-modal aria-label={title} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-bg p-6 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center"><h2 className="font-display flex-1 text-2xl">{title}</h2><button type="button" onClick={onClose} aria-label={title} className="h-10 w-10 text-2xl text-muted">×</button></div>
        <div className="mt-4 space-y-4">{children}</div>
      </div>
    </div>
  );
}
const inputCls = "h-11 w-full rounded-lg border border-line bg-surface px-3 text-[16px]";

// ---------- hub ----------
function Hub(c: Ctx & { onOk: () => void }) {
  const { api, tx, err, nf, demo, setMsg } = c;
  const router = useRouter();
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [chal, setChal] = useState<Challenge[]>([]);
  const [inv, setInv] = useState<Invite[]>([]);
  const [box, setBox] = useState<Inbox | null>(null);
  const [comm, setComm] = useState<Community | null>(null);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [full, setFull] = useState(false);
  const [sheet, setSheet] = useState<"challenge" | "invite" | null>(null);
  const load = useCallback(async () => {
    try {
      const p = await api<Pulse>("/api/together/pulse");
      setPulse(p); c.onOk();
      const [l, ch, i, b, cm] = await Promise.all([
        p.settings.league ? api<League>("/api/together/league").catch(() => null) : null,
        api<{ challenges: Challenge[] }>("/api/together/challenges").then((d) => d.challenges).catch(() => []),
        api<{ invites: Invite[] }>("/api/together/invites").then((d) => d.invites).catch(() => []),
        api<Inbox>("/api/together/inbox").catch(() => null),
        api<Community>("/api/together/community").catch(() => null),
      ]);
      setLeague(l); setChal(ch); setInv(i); setBox(b); setComm(cm);
      if (!demo && b?.nudges.some((n) => !n.read)) void api("/api/together/inbox", "POST", {}).catch(() => undefined);
      if (demo) setMoments(demoMoments.map((m) => ({ ...m, at: new Date().toISOString(), title: null, mine: null, own: false, counts: { like: 2, mashallah: m.total - 2, barakallah: 0, barik: 0 } })) as Moment[]);
      else {
        const r = await fetch(`/api/community/moments?scope=friends&locale=${c.locale}`, { cache: "no-store" }).catch(() => null);
        const d = r?.ok ? ((await r.json()) as { moments: Moment[] }) : { moments: [] };
        setMoments(d.moments.filter((m) => !m.own).slice(0, 3));
      }
    } catch (e) { setMsg(err(e)); }
  }, [api, demo]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);
  const enable = async (patch: Partial<Settings>) => { try { await api("/api/together/settings", "PUT", patch); await load(); } catch (e) { setMsg(err(e)); } };
  if (!pulse) return <div className="mt-8 h-40 animate-pulse rounded-xl bg-line/40" />;
  const s = pulse.settings, f = pulse.friends;
  const me = league?.rows?.find((r) => r.me);
  const openChal = chal.filter((x) => !(x.status === "pending" && !x.fromMe));
  const openInv = inv.filter((i) => i.mine || i.myAnswer);
  return (
    <>
      {box && (box.nudges.length || box.challenges.length || box.invites.length || box.joinRequests) ? (
        <Section title={tx("inbox")}>
          {box.nudges.length ? <List>{box.nudges.slice(0, 3).map((n) => <Row key={n.id} c={n.from} demo={demo} sub={`${tx(`nudge_${n.kind}` as TgKey)}${n.circle ? ` · ${n.circle.name}` : ""}`} right={!n.read ? <span className="h-2.5 w-2.5 rounded-full bg-[#c6a65e]" /> : null} />)}</List> : null}
          {box.challenges.map((x) => <ChallengeTile key={x.id} x={x} c={c} onChange={load} />)}
          {box.invites.map((i) => <InviteTile key={i.id} i={i} c={c} onChange={load} />)}
          {box.joinRequests ? <Link href="/together/circles" className="block"><Tile>{tx("joinRequestsN", { n: box.joinRequests })}</Tile></Link> : null}
        </Section>
      ) : null}

      <Section title={tx("friendsToday")} action={f.sharing ? <button type="button" onClick={() => setFull((x) => !x)} className="text-[14px] font-semibold text-accent">{tx(full ? "done" : "seeAll")}</button> : null}>
        <FriendsTodayCard f={f} tx={tx} nf={nf} />
        {f.sharing ? (full
          ? <List>{f.list.map((x) => <Row key={x.username} c={x} demo={demo} sub={x.today ? (x.streak >= 2 ? `${tx("learnedToday")} · ${tx("streakDays", { n: nf(x.streak) })}` : tx("learnedToday")) : tx("notYet")} right={x.today ? <span className="text-accent"><svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span> : null} />)}</List>
          : <div className="flex gap-3 overflow-x-auto pb-1">{f.list.slice(0, 12).map((x) => (
            <div key={x.username} className="flex w-16 shrink-0 flex-col items-center gap-1">
              <span className="relative"><Avatar src={x.avatar} size={46} badge={x.badge ?? null} />{x.today ? <span className="absolute -bottom-0.5 -end-0.5 grid h-[18px] w-[18px] place-items-center rounded-full border-2 border-surface bg-[#c6a65e] text-[rgb(8,38,29)]"><svg aria-hidden width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span> : null}</span>
              <span className={`w-full truncate text-center text-[11.5px] font-semibold ${x.today ? "" : "text-muted"}`}>{x.name.split(" ")[0]}</span>
            </div>))}</div>) : <Link href="/talents/discover" className={`inline-flex h-10 items-center rounded-full px-4 text-[14px] font-semibold ${soft}`}>{tx("findFriends")}</Link>}
        {!s.activity ? <Tile className="space-y-3"><p>{tx("shareActivityAsk")}</p><Btn primary small onClick={() => void enable({ activity: true })}>{tx("shareActivity")}</Btn></Tile> : null}
      </Section>

      <Section title={tx("league")} action={s.league ? <Link href="/together/league" className="text-[14px] font-semibold text-accent">{tx("open")}</Link> : null}>
        {s.league && league?.enabled ? (
          <Link href="/together/league" className="block"><Tile className="space-y-1.5">
            <TierBadge tier={league.tier ?? 1} tx={tx} />
            {me ? <p>{tx("youRank", { n: me.rank, m: league.rows?.length ?? 1 })} · {tx("xpN", { n: nf(me.xp) })}</p> : null}
            <p className="text-[13px] text-muted">{league.daysLeft === 1 ? tx("daysLeftOne") : tx("daysLeft", { n: league.daysLeft ?? 7 })}</p>
          </Tile></Link>
        ) : <Tile className="space-y-3"><p>{tx("leagueOff")}</p><Btn primary small onClick={() => void enable({ league: true })}>{tx("leagueJoin")}</Btn></Tile>}
      </Section>

      <Section title={tx("circles")} action={<Link href="/together/circles" className="text-[14px] font-semibold text-accent">{tx("seeAll")}</Link>}>
        {pulse.circles.length ? pulse.circles.map((x) => <CircleTile key={x.id} x={x} c={c} />) : (
          <Tile className="space-y-3">
            <p className="text-muted">{tx("circlesLead")}</p>
            <div className="flex flex-wrap gap-2"><Btn primary small onClick={() => router.push("/together/circles?new=1")}>{tx("circleNew")}</Btn><Btn small onClick={() => router.push("/together/circles?join=1")}>{tx("circleJoin")}</Btn></div>
          </Tile>
        )}
      </Section>

      <Section title={tx("challenges")} action={s.challenges ? <button type="button" onClick={() => setSheet("challenge")} className="text-[14px] font-semibold text-accent">{tx("challengeNew")}</button> : null}>
        {!s.challenges ? <Tile className="space-y-3"><p className="text-muted">{tx("challengesLead")}</p><Btn primary small onClick={() => void enable({ challenges: true })}>{tx("set_challenges")}</Btn></Tile>
          : openChal.length ? openChal.slice(0, 4).map((x) => <ChallengeTile key={x.id} x={x} c={c} onChange={load} />) : <p className="text-muted">{tx("noChallenges")}</p>}
      </Section>

      <Section title={tx("invites")} action={<button type="button" onClick={() => setSheet("invite")} className="text-[14px] font-semibold text-accent">{tx("inviteNew")}</button>}>
        {openInv.length ? openInv.map((i) => <InviteTile key={i.id} i={i} c={c} onChange={load} />) : <p className="text-muted">{tx("invitesLead")}</p>}
      </Section>

      <Section title={tx("celebrations")} action={moments.length ? <Link href="/talents/me" className="text-[14px] font-semibold text-accent">{tx("seeAll")}</Link> : null}>
        {moments.length ? moments.map((m) => (
          <Tile key={m.id} className="space-y-3">
            <div className="flex items-center gap-3"><Avatar src={m.author.avatar} size={38} badge={m.author.badge ?? null} /><div className="min-w-0"><p className="truncate font-bold">{m.author.name}</p><p className="text-[12px] text-muted" dir="ltr">@{m.author.username}</p></div></div>
            <p className="font-semibold">{momentLine(m, c.sx as Record<SwKey, string>)}</p>
            <MomentReactions id={m.id} counts={m.counts} mine={m.mine} own={m.own} l={{ like: c.sx.react_like, mashallah: c.sx.react_mashallah, barakallah: c.sx.react_barakallah, barik: c.sx.react_barik, remove: c.sx.removeReaction, signIn: tx("signIn"), error: tx("e_generic") }} />
          </Tile>
        )) : <p className="text-muted">{tx("noCelebrations")}</p>}
      </Section>

      {comm ? <Section title={tx("community")} action={<Link href="/together/community" className="text-[14px] font-semibold text-accent">{tx("open")}</Link>}><CommunityCard d={comm} c={c} /></Section> : null}

      <div className="mt-10 space-y-2 rounded-xl bg-accent-soft p-4">
        <p className="text-[14.5px]">{tx("niyyah")}</p>
        <Link href="/surah/2?v=148" className="text-[14px] font-semibold text-accent hover:underline">{tx("goodDeedsRef")}</Link>
      </div>
      <p className="mt-4 text-[12.5px] text-muted">{tx("updatedNote")}</p>
      {sheet === "challenge" ? <ChallengeForm c={c} onClose={() => setSheet(null)} onDone={load} /> : null}
      {sheet === "invite" ? <InviteForm c={c} circles={pulse.circles.filter((x) => x.status === "member" && !x.suspended)} onClose={() => setSheet(null)} onDone={load} /> : null}
    </>
  );
}

function FriendsTodayCard({ f, tx, nf }: { f: FriendsToday; tx: Ctx["tx"]; nf: Ctx["nf"] }) {
  return (
    <StageCard>
      <p className="font-display text-[22px] leading-snug">{f.sharing ? tx("friendsTodayLine", { n: nf(f.learnedToday), m: nf(f.sharing) }) : tx("friendsToday")}</p>
      {f.sharing ? (
        <div className="mt-3 space-y-2">
          <Bar value={f.learnedToday} max={f.sharing} dark />
          {f.keptStreak ? <p className="text-[13.5px] font-semibold text-[rgb(214,180,108)]">{tx("keptStreak", { n: nf(f.keptStreak) })}</p> : null}
          {f.learnedToday === 0 ? <p className="text-[14px] text-white/75">{tx("friendsTodayNone")}</p> : null}
        </div>
      ) : <p className="mt-2 text-[14px] text-white/75">{tx("noFriends")}</p>}
    </StageCard>
  );
}

function TierBadge({ tier, tx, dark }: { tier: number; tx: Ctx["tx"]; dark?: boolean }) {
  return (
    <span className="flex items-center gap-2" aria-label={`${tx(`tier_${tier}` as TgKey)}, ${tx("tierN", { n: tier })}`}>
      <span className="flex items-end gap-[3px]" aria-hidden>{[1, 2, 3, 4, 5, 6].map((i) => <span key={i} className={`w-[7px] rounded-sm ${i <= tier ? "bg-[#c6a65e]" : dark ? "bg-white/20" : "bg-line"}`} style={{ height: 7 + i * 2 }} />)}</span>
      <span className="font-bold">{tx(`tier_${tier}` as TgKey)}</span>
    </span>
  );
}

function CircleTile({ x, c }: { x: CircleSummary; c: Ctx }) {
  const { tx } = c;
  return (
    <Link href={`/together/circles/${x.id}${c.demo ? "?demo=1" : ""}`} className="block">
      <Tile className="space-y-3 hover:border-[#c6a65e]/60">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-bold">{x.name}</p>
            <p className="text-[13px] text-muted">{[tx(`kind_${x.kind}` as TgKey), x.role === "leader" ? tx("leader") : null, tx("membersN", { n: x.members }), x.status === "pending" ? tx("pending") : null, x.pending ? tx("pendingN", { n: x.pending }) : null].filter(Boolean).join(" · ")}</p>
          </div>
          {x.streak ? <span className="text-[13px] font-bold text-gold">{tx("groupStreak", { n: x.streak })}</span> : null}
        </div>
        {x.status === "member" && !x.suspended ? <Progress value={x.progress} max={x.goal} label={tx(`goal_${x.goalKind}` as TgKey)} tx={tx} nf={c.nf} /> : null}
        {x.reached ? <p className="text-[13px]">{tx("goalReached")}</p> : null}
      </Tile>
    </Link>
  );
}

const chTitle = (x: { kind: string; target: number }, tx: Ctx["tx"]) =>
  x.kind === "surah" ? tx("chTitle_surah", { s: x.target }) : x.kind === "verses" ? tx("chTitle_verses", { n: x.target }) : tx("chTitle_streak", { n: x.target });

function ChallengeTile({ x, c, onChange }: { x: Challenge; c: Ctx; onChange: () => void }) {
  const { api, tx, err } = c;
  const [msg, setMsg] = useState("");
  const act = async (action: string) => { setMsg(""); try { await api(`/api/together/challenges/${x.id}`, "PATCH", { action }); onChange(); } catch (e) { setMsg(err(e)); } };
  const status = x.status === "pending" ? (x.fromMe ? tx("chOut", { u: x.other.name }) : tx("chIn", { u: x.other.name })) : x.status === "active" ? tx("inDays", { n: x.days }) : tx(`ch_${x.status}` as TgKey);
  return (
    <Tile className="space-y-3">
      <div><p className="font-bold">{chTitle(x, tx)}</p><p className="text-[13px] text-muted">{status}</p></div>
      {x.status === "active" || x.status === "ended" ? (
        <div className="space-y-2.5">
          <Progress value={x.mine} max={x.goal} label={tx("you")} tx={tx} nf={c.nf} />
          <Progress value={x.theirs} max={x.goal} label={x.other.name} tx={tx} nf={c.nf} />
          {x.mineDone && x.theirsDone ? <p>{tx("bothDone")}</p> : x.mineDone ? <p>{tx("youDone")}</p> : null}
        </div>
      ) : null}
      {x.status === "pending" && !x.fromMe ? <div className="flex gap-2"><Btn primary small onClick={() => void act("accept")}>{tx("accept")}</Btn><Btn small onClick={() => void act("decline")}>{tx("decline")}</Btn></div>
        : x.status === "pending" || x.status === "active" ? <button type="button" onClick={() => void act("cancel")} className="text-[13.5px] font-semibold text-muted">{tx("cancel")}</button> : null}
      {msg ? <p className="text-[13px] text-muted">{msg}</p> : null}
    </Tile>
  );
}

function InviteTile({ i, c, onChange }: { i: Invite; c: Ctx; onChange: () => void }) {
  const { api, tx, err, locale } = c;
  const [msg, setMsg] = useState("");
  const what = i.topic === "surah" && i.surah ? tx("topicSurah", { s: i.surah }) : tx(`topic_${i.topic}` as TgKey);
  const when = new Date(i.at).toLocaleString(locale, { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const send = async (b: object) => { setMsg(""); try { await api(`/api/together/invites/${i.id}`, "PATCH", b); onChange(); } catch (e) { setMsg(err(e)); } };
  return (
    <Tile className="space-y-3">
      <div>
        <p className="font-bold">{what}</p>
        <p className="text-[13px] text-muted">{when}</p>
        <p className="text-[13px] text-muted">{[i.mine ? null : i.from ? tx("inviteFrom", { u: i.from.name }) : null, i.circle ? tx("inviteCircle", { t: i.circle.name }) : i.mine && i.to ? i.to.name : null, i.yes ? tx("joining", { n: i.yes }) : null].filter(Boolean).join(" · ")}</p>
      </div>
      {i.mine ? <button type="button" onClick={() => void send({ cancel: true })} className="text-[13.5px] font-semibold text-muted">{tx("cancel")}</button>
        : <div className="flex gap-2"><Chip label={tx("yes")} on={i.myAnswer === "yes"} onClick={() => void send({ answer: "yes" })} /><Chip label={tx("no")} on={i.myAnswer === "no"} onClick={() => void send({ answer: "no" })} /></div>}
      {msg ? <p className="text-[13px] text-muted">{msg}</p> : null}
    </Tile>
  );
}

function FriendPicker({ c, feature, value, onChange }: { c: Ctx; feature: string; value: string; onChange: (u: string) => void }) {
  const [list, setList] = useState<Card[] | null>(null);
  useEffect(() => { c.api<{ friends: Card[] }>(`/api/together/friends?for=${feature}`).then((d) => setList(d.friends)).catch(() => setList([])); }, [feature]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!list) return <div className="h-9 animate-pulse rounded-full bg-line/40" />;
  if (!list.length) return <p className="text-muted">{c.tx("noFriendsFor")}</p>;
  return <div className="flex flex-wrap gap-2">{list.map((f) => <Chip key={f.username} label={f.name} on={value === f.username} onClick={() => onChange(f.username)} />)}</div>;
}

function ChallengeForm({ c, onClose, onDone }: { c: Ctx; onClose: () => void; onDone: () => void }) {
  const { tx, api, err } = c;
  const [who, setWho] = useState(""), [kind, setKind] = useState("surah"), [target, setTarget] = useState("67"), [days, setDays] = useState("30"), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const send = async () => { setBusy(true); setMsg(""); try { await api("/api/together/challenges", "POST", { username: who, kind, target: Number(target), days: Number(days) }); onDone(); onClose(); } catch (e) { setMsg(err(e)); } finally { setBusy(false); } };
  return (
    <Modal title={tx("challengeNew")} onClose={onClose}>
      <p className="text-muted">{tx("challengesLead")}</p>
      <p className="font-semibold">{tx("chooseFriend")}</p>
      <FriendPicker c={c} feature="challenges" value={who} onChange={setWho} />
      <div className="flex flex-wrap gap-2">{["surah", "verses", "streak"].map((k) => <Chip key={k} label={tx(`ch_${k}` as TgKey)} on={kind === k} onClick={() => { setKind(k); setTarget(k === "surah" ? "67" : k === "verses" ? "50" : "14"); setDays(k === "streak" ? "14" : "30"); }} />)}</div>
      <label className="block"><span className="font-semibold">{kind === "surah" ? tx("surahNo") : tx("amount")}</span><input inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))} className={`${inputCls} mt-1`} /></label>
      <label className="block"><span className="font-semibold">{tx("daysLabel")}</span><input inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ""))} className={`${inputCls} mt-1`} /></label>
      {msg ? <p role="alert" className="text-muted">{msg}</p> : null}
      <Btn primary disabled={busy || !who || !target || !days} onClick={() => void send()}>{tx("send")}</Btn>
    </Modal>
  );
}

const TIMES = ["06:00", "13:00", "17:00", "20:00", "21:30"];
function InviteForm({ c, circles, onClose, onDone, toCircle }: { c: Ctx; circles: { id: string; name: string }[]; onClose: () => void; onDone: () => void; toCircle?: boolean }) {
  const { tx, api, err, locale } = c;
  const [to, setTo] = useState<"friend" | "circle">(toCircle && circles.length ? "circle" : "friend");
  const [who, setWho] = useState(""), [circle, setCircle] = useState(circles[0]?.id ?? ""), [topic, setTopic] = useState("review"), [surah, setSurah] = useState("18");
  const [day, setDay] = useState(1), [time, setTime] = useState("20:00"), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const dayLabel = (d: number) => d === 0 ? tx("day_today") : d === 1 ? tx("day_tomorrow") : new Date(Date.now() + d * 86_400_000).toLocaleDateString(locale, { weekday: "short", day: "numeric" });
  const send = async () => {
    setBusy(true); setMsg("");
    const [h, m] = time.split(":").map(Number);
    const at = new Date(); at.setDate(at.getDate() + day); at.setHours(h, m, 0, 0);
    try { await api("/api/together/invites", "POST", { ...(to === "friend" ? { username: who } : { circleId: circle }), topic, surah: topic === "surah" ? Number(surah) : undefined, at: at.toISOString() }); onDone(); onClose(); }
    catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  return (
    <Modal title={tx("inviteNew")} onClose={onClose}>
      <p className="text-muted">{tx("invitesLead")}</p>
      <p className="font-semibold">{tx("inviteTo")}</p>
      <div className="flex gap-2"><Chip label={tx("toFriend")} on={to === "friend"} onClick={() => setTo("friend")} />{circles.length ? <Chip label={tx("toCircle")} on={to === "circle"} onClick={() => setTo("circle")} /> : null}</div>
      {to === "friend" ? <FriendPicker c={c} feature="activity" value={who} onChange={setWho} /> : <div className="flex flex-wrap gap-2">{circles.map((x) => <Chip key={x.id} label={x.name} on={circle === x.id} onClick={() => setCircle(x.id)} />)}</div>}
      <p className="font-semibold">{tx("topic")}</p>
      <div className="flex flex-wrap gap-2">{["surah", "review", "tafsir", "arabic", "tajweed"].map((k) => <Chip key={k} label={tx(`topic_${k}` as TgKey)} on={topic === k} onClick={() => setTopic(k)} />)}</div>
      {topic === "surah" ? <input aria-label={tx("surahNo")} inputMode="numeric" value={surah} onChange={(e) => setSurah(e.target.value.replace(/\D/g, ""))} className={inputCls} /> : null}
      <p className="font-semibold">{tx("when")}</p>
      <div className="flex flex-wrap gap-2">{[0, 1, 2, 3, 4, 5, 6].map((d) => <Chip key={d} label={dayLabel(d)} on={day === d} onClick={() => setDay(d)} />)}</div>
      <div className="flex flex-wrap gap-2">{TIMES.map((x) => <Chip key={x} label={x} on={time === x} onClick={() => setTime(x)} />)}</div>
      {msg ? <p role="alert" className="text-muted">{msg}</p> : null}
      <Btn primary disabled={busy || (to === "friend" ? !who : !circle)} onClick={() => void send()}>{tx("send")}</Btn>
    </Modal>
  );
}

function CommunityCard({ d, c }: { d: Community; c: Ctx }) {
  const { tx, nf, locale } = c;
  const main = d.country ?? { code: "", ...d.world };
  return (
    <StageCard>
      <p className="text-[12.5px] font-semibold tracking-[0.1em] text-[rgb(214,180,108)]">{tx("community")}</p>
      <p className="font-display mt-1 text-[22px] leading-snug">{d.country ? tx("countryLine", { c: countryName(d.country.code, locale), n: nf(d.country.verses) }) : `${tx("worldMonth")}: ${tx("versesN", { n: nf(d.world.verses) })}`}</p>
      <div className="mt-3"><Bar value={main.verses} max={main.goal} dark /></div>
      <div className="mt-2 flex justify-between text-[13px]"><span className="text-white/75">{tx("learnersN", { n: nf(main.learners) })}</span><span className="font-semibold text-[rgb(214,180,108)]">{tx("nextGoal", { n: nf(main.goal) })}</span></div>
      {d.country ? <p className="mt-1 text-[13px] text-white/75">{tx("worldMonth")}: {tx("versesN", { n: nf(d.world.verses) })}</p> : null}
    </StageCard>
  );
}

// ---------- league ----------
function LeagueView(c: Ctx) {
  const { api, tx, err, nf, setMsg, demo } = c;
  const [d, setD] = useState<League | null>(null);
  const load = useCallback(() => api<League>("/api/together/league").then(setD).catch((e) => setMsg(err(e))), [api]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);
  if (!d) return <div className="mt-8 h-40 animate-pulse rounded-xl bg-line/40" />;
  if (!d.enabled) return <Tile className="mt-8 space-y-3"><p>{tx("leagueOff")}</p><Btn primary onClick={() => void api("/api/together/settings", "PUT", { league: true }).then(load).catch((e) => setMsg(err(e)))}>{tx("leagueJoin")}</Btn></Tile>;
  const rows = d.rows ?? [];
  return (
    <div className="mt-8 space-y-4">
      <StageCard><TierBadge tier={d.tier ?? 1} tx={tx} dark /><p className="mt-1 text-[13.5px] text-white/75">{tx("tierN", { n: d.tier ?? 1 })} · {d.daysLeft === 1 ? tx("daysLeftOne") : tx("daysLeft", { n: d.daysLeft ?? 7 })}</p></StageCard>
      {d.last ? <Tile>{tx(d.last.result === "up" ? "lastUp" : d.last.result === "down" ? "lastDown" : "lastStay")}</Tile> : null}
      {rows.length <= 1 ? <p className="text-muted">{tx("leagueEmpty")}</p> : null}
      <List>
        {rows.map((r, i) => (
          <div key={r.username}>
            {d.upZone && i === 0 ? <p className="bg-accent-soft px-4 py-1.5 text-[12px] font-semibold text-accent">{tx("promoZone")}</p> : null}
            {d.upZone && i === d.upZone ? <div className="h-0.5 bg-accent-soft" /> : null}
            <Row c={r.me ? { ...r, name: `${r.name} (${tx("you")})` } : r} me={r.me} demo={demo} sub={`${tx(`tier_${r.tier}` as TgKey)} · ${tx("weekShort", { x: nf(r.xp), d: r.active })}`}
              right={<span className={`font-display min-w-6 text-end text-xl ${d.upZone && i < d.upZone ? "text-gold" : "text-muted"}`}>{nf(r.rank)}</span>} />
          </div>
        ))}
      </List>
      <p className="text-[13px] text-muted">{tx("niyyah")}</p>
    </div>
  );
}

// ---------- circles ----------
function CirclesView(c: Ctx) {
  const { api, tx, err, setMsg } = c;
  const router = useRouter();
  const [list, setList] = useState<CircleSummary[] | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mode, setMode] = useState<"new" | "join" | null>(null);
  const [name, setName] = useState(""), [kind, setKind] = useState(""), [goalKind, setGoalKind] = useState("days"), [goal, setGoal] = useState("20");
  const [approval, setApproval] = useState(true), [gender, setGender] = useState<string>(() => readIdentity().gender ?? ""), [code, setCode] = useState(""), [consent, setConsent] = useState(false), [busy, setBusy] = useState(false), [fmsg, setFmsg] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("new")) setMode("new"); if (q.get("join") || q.get("code")) { setMode("join"); setCode((q.get("code") ?? "").toUpperCase()); }
    api<{ circles: CircleSummary[] }>("/api/together/circles").then((d) => setList(d.circles)).catch((e) => { setMsg(err(e)); setList([]); });
    api<{ settings: Settings }>("/api/together/settings").then((d) => setSettings(d.settings)).catch(() => undefined);
  }, [api]); // eslint-disable-line react-hooks/exhaustive-deps
  const needGender = !settings?.gender && (mode === "join" || kind === "brothers" || kind === "sisters");
  const submit = async () => {
    setBusy(true); setFmsg("");
    try {
      const r = mode === "new"
        ? await api<{ id: string }>("/api/together/circles", "POST", { name: name.trim(), kind, goalKind, goal: Number(goal), approval, consent: true, gender: gender || undefined })
        : await api<{ id: string }>("/api/together/circles/join", "POST", { code, consent: true, gender: gender || undefined });
      router.push(`/together/circles/${r.id}`);
    } catch (e) { setFmsg(err(e)); } finally { setBusy(false); }
  };
  return (
    <>
      <Section title={tx("circles")}>
        {!list ? <div className="h-24 animate-pulse rounded-xl bg-line/40" /> : list.length ? list.map((x) => <CircleTile key={x.id} x={x} c={c} />) : <p className="text-muted">{tx("noCircles")}</p>}
      </Section>
      <div className="mt-6 flex flex-wrap gap-2"><Btn primary onClick={() => { setMode("new"); setConsent(false); }}>{tx("circleNew")}</Btn><Btn onClick={() => { setMode("join"); setConsent(false); }}>{tx("circleJoin")}</Btn></div>
      {mode ? (
        <Tile className="mt-6 space-y-4">
          <h2 className="font-display text-2xl">{tx(mode === "new" ? "circleNew" : "circleJoin")}</h2>
          {mode === "new" ? (
            <>
              <label className="block"><span className="font-semibold">{tx("circleName")}</span><input value={name} maxLength={40} placeholder={tx("circleNameHint")} onChange={(e) => setName(e.target.value)} className={`${inputCls} mt-1`} /></label>
              <p className="font-semibold">{tx("kind")}</p>
              <div className="flex flex-wrap gap-2">{["brothers", "sisters", "family", "teacher"].map((k) => <Chip key={k} label={tx(`kind_${k}` as TgKey)} on={kind === k} onClick={() => setKind(k)} />)}</div>
              {kind ? <p className="text-[13px] text-muted">{tx(`kindHint_${kind}` as TgKey)}</p> : null}
            </>
          ) : (
            <label className="block"><span className="font-semibold">{tx("codeLabel")}</span><input value={code} placeholder={tx("codeHint")} autoCapitalize="characters" onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 9))} className={`${inputCls} mt-1 text-center text-xl font-bold tracking-[0.25em]`} /></label>
          )}
          {needGender ? (
            <div className="space-y-2">
              <p className="font-semibold">{tx("gender")}</p>
              <div className="flex gap-2">{["brother", "sister"].map((g) => <Chip key={g} label={tx(`gender_${g}` as TgKey)} on={gender === g} onClick={() => setGender(g)} />)}</div>
              <p className="text-[12.5px] text-muted">{tx("genderNote")}</p>
            </div>
          ) : null}
          {mode === "new" ? (
            <>
              <p className="font-semibold">{tx("goalKind")}</p>
              <div className="flex flex-wrap gap-2">{["days", "xp", "verses"].map((g) => <Chip key={g} label={tx(`goal_${g}` as TgKey)} on={goalKind === g} onClick={() => { setGoalKind(g); setGoal(g === "days" ? "20" : g === "xp" ? "2000" : "30"); }} />)}</div>
              <label className="block"><span className="font-semibold">{tx("goalAmount")}</span><input inputMode="numeric" value={goal} onChange={(e) => setGoal(e.target.value.replace(/\D/g, ""))} className={`${inputCls} mt-1`} /></label>
              {kind === "brothers" || kind === "sisters" ? <label className="flex items-center gap-3"><input type="checkbox" checked={approval} onChange={(e) => setApproval(e.target.checked)} className="h-5 w-5 accent-[#066c4e]" />{tx("approval")}</label> : null}
            </>
          ) : null}
          <label className="flex items-start gap-3"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#066c4e]" /><span className="text-[14px]">{tx("consentCircle")}</span></label>
          {fmsg ? <p role="alert" className="text-muted">{fmsg}</p> : null}
          <Btn primary disabled={busy || !consent || (mode === "new" ? !kind || name.trim().length < 3 || !goal || (needGender && !gender) : code.replace(/[^A-Z0-9]/g, "").length !== 8)} onClick={() => void submit()}>{tx(mode === "new" ? "create" : "join")}</Btn>
        </Tile>
      ) : null}
    </>
  );
}

function CircleView(c: Ctx) {
  const { api, tx, err, nf, setMsg, demo } = c;
  const router = useRouter();
  const [d, setD] = useState<Circle | null>(null);
  const [nudge, setNudge] = useState<Member | null>(null);
  const [report, setReport] = useState(false);
  const [invite, setInvite] = useState(false);
  const load = useCallback(() => api<{ circle: Circle }>(`/api/together/circles/${c.circleId}`).then((x) => setD(x.circle)).catch((e) => setMsg(err(e))), [api]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);
  const act = async (fn: () => Promise<unknown>) => { setMsg(""); try { await fn(); await load(); } catch (e) { setMsg(err(e)); } };
  if (!d) return <div className="mt-8 h-40 animate-pulse rounded-xl bg-line/40" />;
  if (d.suspended) return <Tile className="mt-8">{tx("suspended")}</Tile>;
  if (d.status === "pending") return <Tile className="mt-8">{tx("pendingSelf")}</Tile>;
  const share = async () => {
    const text = tx("codeShareText", { t: d.name, code: d.code ?? "" });
    try { if (navigator.share) await navigator.share({ text }); else await navigator.clipboard.writeText(text); } catch { /* cancelled */ }
  };
  return (
    <>
      <h2 className="font-display mt-8 text-3xl">{d.name}</h2>
      <p className="text-muted">{tx(`kind_${d.kind}` as TgKey)} · {tx("membersN", { n: d.members.length })}</p>
      <div className="mt-5"><StageCard>
        <p className="text-[12.5px] font-semibold tracking-[0.1em] text-[rgb(214,180,108)]">{tx("weekGoal")}</p>
        <p className="font-display mt-1 text-2xl">{nf(d.progress)} / {tx(`goalN_${d.goalKind}` as TgKey, { n: nf(d.goal) })}</p>
        <div className="mt-3"><Bar value={d.progress} max={d.goal} dark /></div>
        <p className="mt-2 text-[13.5px] text-white/75">{tx(`goal_${d.goalKind}` as TgKey)}</p>
        {d.reached ? <p className="mt-1 font-semibold text-[#f3e2b6]">{tx("goalReached")}</p> : null}
        {d.streak ? <p className="mt-1 font-semibold text-[rgb(214,180,108)]">{tx("groupStreak", { n: d.streak })}</p> : null}
      </StageCard></div>
      <Section title={tx("members")}>
        <List>
          {d.members.map((m) => (
            <Row key={m.username} c={m.me ? { ...m, name: `${m.name} (${tx("you")})` } : m} me={m.me} demo={demo}
              sub={[m.role === "leader" ? tx("leader") : null, m.today ? tx("learnedToday") : tx("notYet"), m.streak >= 2 ? tx("streakDays", { n: m.streak }) : null, tx("weekShort", { x: nf(m.week.xp), d: m.week.days }), m.week.verses ? tx("versesN", { n: m.week.verses }) : null].filter(Boolean).join(" · ")}
              right={m.canNudge ? <button type="button" onClick={() => setNudge(m)} className="h-9 rounded-full border border-[#c6a65e] px-3 text-[13px] font-semibold">{tx("nudge")}</button>
                : d.role === "leader" && !m.me ? <button type="button" onClick={() => window.confirm(tx("remove")) && void act(() => api(`/api/together/circles/${d.id}/members`, "POST", { action: "remove", username: m.username }))} className="text-[13px] font-semibold text-muted">{tx("remove")}</button> : null} />
          ))}
        </List>
      </Section>
      {d.role === "leader" && d.pending.length ? (
        <Section title={tx("pendingN", { n: d.pending.length })}>
          <List>{d.pending.map((p) => <Row key={p.username} c={p} demo={demo} right={<span className="flex gap-1.5"><Btn primary small onClick={() => void act(() => api(`/api/together/circles/${d.id}/members`, "POST", { action: "approve", username: p.username }))}>{tx("approve")}</Btn><Btn small onClick={() => void act(() => api(`/api/together/circles/${d.id}/members`, "POST", { action: "decline", username: p.username }))}>{tx("decline")}</Btn></span>} />)}</List>
        </Section>
      ) : null}
      <Section title={tx("invites")}><p className="text-muted">{tx("invitesLead")}</p><Btn small onClick={() => setInvite(true)}>{tx("inviteNew")}</Btn></Section>
      {d.code ? (
        <Section title={tx("codeLabel")}>
          <Tile className="space-y-3 text-center">
            <p className="select-all text-3xl font-bold tracking-[0.2em]" dir="ltr">{d.code}</p>
            <div className="flex flex-wrap justify-center gap-2"><Btn primary small onClick={() => void share()}>{tx("codeShare")}</Btn>{d.role === "leader" ? <Btn small onClick={() => void act(() => api(`/api/together/circles/${d.id}`, "PATCH", { newCode: true }))}>{tx("newCode")}</Btn> : null}</div>
          </Tile>
        </Section>
      ) : null}
      {d.history.length > 1 ? (
        <Section title={tx("history")}>
          <div className="flex h-20 items-end gap-1.5">{[...d.history].reverse().map((h) => <div key={h.week} title={tx("progressOf", { n: h.progress, m: h.goal })} className={`flex-1 rounded ${h.reached ? "bg-[#c6a65e]" : "bg-line"}`} style={{ height: `${Math.max(8, Math.min(100, (h.progress / Math.max(1, h.goal)) * 100))}%` }} />)}</div>
        </Section>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-2">
        <Btn small onClick={() => window.confirm(tx("confirmLeave")) && void api(`/api/together/circles/${d.id}/members`, "POST", { action: "leave" }).then(() => router.push("/together/circles")).catch((e) => setMsg(err(e)))}>{tx("leave")}</Btn>
        {d.role === "leader" ? <Btn small onClick={() => window.confirm(tx("confirmDelete")) && void api(`/api/together/circles/${d.id}`, "DELETE").then(() => router.push("/together/circles")).catch((e) => setMsg(err(e)))}>{tx("deleteCircle")}</Btn> : null}
        <button type="button" onClick={() => setReport(true)} className="h-9 px-3 text-[13.5px] font-semibold text-[rgb(150,52,52)]">{tx("reportCircle")}</button>
      </div>
      {nudge ? <NudgeForm c={c} target={nudge} circleId={d.id} onClose={() => setNudge(null)} onSent={() => setD({ ...d, members: d.members.map((m) => (m.username === nudge.username ? { ...m, canNudge: false } : m)) })} /> : null}
      {report ? <ReportForm c={c} circleId={d.id} onClose={() => setReport(false)} /> : null}
      {invite ? <InviteForm c={c} circles={[{ id: d.id, name: d.name }]} toCircle onClose={() => setInvite(false)} onDone={() => undefined} /> : null}
    </>
  );
}

function NudgeForm({ c, target, circleId, onClose, onSent }: { c: Ctx; target: Card; circleId?: string; onClose: () => void; onSent: () => void }) {
  const { tx, api, err } = c;
  const [sent, setSent] = useState(false), [msg, setMsg] = useState("");
  const send = async (kind: string) => { setMsg(""); try { await api("/api/together/nudges", "POST", { username: target.username, kind, circleId }); setSent(true); onSent(); } catch (e) { setMsg(err(e)); } };
  return (
    <Modal title={tx("nudgeTitle")} onClose={onClose}>
      <List><Row c={target} demo /></List>
      {sent ? <><p>{tx("nudgeSent")}</p><Btn primary onClick={onClose}>{tx("done")}</Btn></> : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {NUDGES.map((k) => <li key={k}><button type="button" onClick={() => void send(k)} className="w-full px-4 py-3.5 text-start hover:bg-bg">{tx(`nudge_${k}` as TgKey)}</button></li>)}
        </ul>
      )}
      {msg ? <p role="alert" className="text-muted">{msg}</p> : null}
    </Modal>
  );
}

function ReportForm({ c, circleId, onClose }: { c: Ctx; circleId: string; onClose: () => void }) {
  const { tx, api, err } = c;
  const [cat, setCat] = useState(""), [reason, setReason] = useState(""), [done, setDone] = useState(false), [msg, setMsg] = useState("");
  const send = async () => { try { await api(`/api/together/circles/${circleId}/report`, "POST", { category: cat, reason }); setDone(true); } catch (e) { setMsg(err(e)); } };
  return (
    <Modal title={tx("reportCircle")} onClose={onClose}>
      {done ? <><p>{tx("reported")}</p><Btn primary onClick={onClose}>{tx("done")}</Btn></> : (
        <>
          <p className="font-semibold">{tx("reportTitle")}</p>
          <div role="radiogroup" className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {CATS.map((k) => <label key={k} className="flex items-center gap-3 px-4 py-3"><input type="radio" name="cat" checked={cat === k} onChange={() => setCat(k)} className="accent-[#c6a65e]" />{tx(`cat_${k}` as TgKey)}</label>)}
          </div>
          <textarea value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} aria-label={tx("reportTitle")} className="min-h-20 w-full rounded-lg border border-line bg-surface p-3" />
          {msg ? <p role="alert" className="text-muted">{msg}</p> : null}
          <Btn primary disabled={!cat} onClick={() => void send()}>{tx("send")}</Btn>
        </>
      )}
    </Modal>
  );
}

// ---------- community ----------
function CommunityView(c: Ctx) {
  const { api, tx, err, nf, setMsg, locale, demo } = c;
  const [d, setD] = useState<Community | null>(null);
  const load = useCallback(() => api<Community>("/api/together/community").then(setD).catch((e) => setMsg(err(e))), [api]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);
  const max = useMemo(() => Math.max(1, ...(d?.countries ?? []).map((x) => x.verses)), [d]);
  if (!d) return <div className="mt-8 h-40 animate-pulse rounded-xl bg-line/40" />;
  const set = (patch: object) => api("/api/together/settings", "PUT", patch).then(load).catch((e) => setMsg(err(e)));
  const best = (rows: BestRow[]) => rows.length ? <List>{rows.map((r, i) => <Row key={r.username} c={r} demo={demo} sub={[r.country ? countryName(r.country, locale) : null, tx("versesN", { n: nf(r.verses) })].filter(Boolean).join(" · ")} right={<span className={`font-display text-xl ${i < 3 ? "text-gold" : "text-muted"}`}>{nf(r.rank)}</span>} />)}</List> : <p className="text-muted">{tx("noBest")}</p>;
  return (
    <>
      <div className="mt-8"><CommunityCard d={d} c={c} /></div>
      {!d.country ? <p className="mt-3 text-muted">{tx("noCountry")}</p> : null}
      <Section title={tx("bestWorld")}>{best(d.best.world)}</Section>
      {d.country ? <Section title={tx("bestCountry", { c: countryName(d.country.code, locale) })}>{best(d.best.country)}</Section> : null}
      <p className="mt-3 text-[13px] text-muted">{tx("bestNote")}</p>
      {d.countries.length ? (
        <Section title={tx("topCountries")}>
          <Tile className="space-y-3">{d.countries.map((x) => (
            <div key={x.country}>
              <div className="flex justify-between text-[14.5px]"><span className="font-semibold">{countryName(x.country, locale)}</span><span className="font-bold">{tx("versesN", { n: nf(x.verses) })}</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-accent" style={{ width: `${(x.verses / max) * 100}%` }} /></div>
            </div>))}
          </Tile>
        </Section>
      ) : null}
      <div className="mt-8 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        <Toggle title={tx("set_community")} hint={tx("setHint_community")} on={d.mine.community} onChange={(v) => void set(v ? { community: true } : { community: false, bestList: false })} />
        <Toggle title={tx("set_bestList")} hint={tx("setHint_bestList")} on={d.mine.bestList} disabled={!d.mine.community} onChange={(v) => void set({ bestList: v })} />
      </div>
      <p className="mt-4 text-[13px] text-muted">{tx("niyyah")}</p>
    </>
  );
}

// ---------- settings ----------
function Toggle({ title, hint, on, onChange, disabled }: { title: string; hint: string; on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex items-center gap-4 px-4 py-3.5 ${disabled ? "opacity-50" : ""}`}>
      <span className="flex-1"><span className="block font-semibold">{title}</span><span className="block text-[13px] text-muted">{hint}</span></span>
      <input type="checkbox" role="switch" checked={on} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="h-6 w-6 shrink-0 accent-[#066c4e]" />
    </label>
  );
}
// "circles" is no switch: consent is given per circle when joining and ends by leaving (circlesNote)
const ORDER = ["activity", "league", "challenges", "nudges", "community", "bestList"] as const;
function SettingsView(c: Ctx) {
  const { api, tx, err, setMsg } = c;
  const [s, setS] = useState<Settings | null>(null);
  useEffect(() => { api<{ settings: Settings }>("/api/together/settings").then((d) => setS(d.settings)).catch((e) => setMsg(err(e))); }, [api]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!s) return <div className="mt-8 h-40 animate-pulse rounded-xl bg-line/40" />;
  const set = async (f: (typeof ORDER)[number], v: boolean) => {
    const patch: Partial<Settings> = { [f]: v, ...(f === "community" && !v ? { bestList: false } : {}) };
    setS({ ...s, ...patch });
    try { setS((await api<{ settings: Settings }>("/api/together/settings", "PUT", patch)).settings); } catch (e) { setMsg(err(e)); }
  };
  return (
    <>
      <div className="mt-8 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {ORDER.map((f) => <Toggle key={f} title={tx(`set_${f}` as TgKey)} hint={tx(`setHint_${f}` as TgKey)} on={s[f]} disabled={f === "bestList" && !s.community} onChange={(v) => void set(f, v)} />)}
      </div>
      <p className="mt-4 text-[13px] text-muted">{tx("circlesNote")}</p>
      {s.gender ? <p className="mt-4 text-[13px] text-muted">{tx("gender")}: {tx(`gender_${s.gender}` as TgKey)}. {tx("genderNote")}</p> : null}
    </>
  );
}

// ---------- mountable card ----------
/** compact entry for other pages (e.g. the own profile /talents/me): "Today 5 of your 8 friends learned" with a link to
 *  /together. Renders nothing when signed out, under 16 or without a profile. */
export function TogetherEntryWeb({ t, locale }: { t: Record<TgKey, string>; locale: string }) {
  const [line, setLine] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/together/pulse", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((p: Pulse | null) => {
      if (p) setLine(p.friends.sharing ? fill(t.friendsTodayLine, { n: p.friends.learnedToday.toLocaleString(locale), m: p.friends.sharing.toLocaleString(locale) }) : t.hubCardLine);
    }).catch(() => undefined);
  }, [t, locale]);
  if (!line) return null;
  return (
    <Link href="/together" className="flex items-center gap-3 rounded-xl border border-[#c6a65e] bg-surface p-4 hover:bg-bg">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[rgb(8,38,29)] text-[#dcc48c]" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8" cy="9" r="3" /><circle cx="16" cy="9" r="3" /><path d="M3 19c.8-3 2.8-4.5 5-4.5s4.2 1.5 5 4.5M11 19c.8-3 2.8-4.5 5-4.5s4.2 1.5 5 4.5" /></svg>
      </span>
      <span className="min-w-0 flex-1"><span className="block font-bold">{t.hubCard}</span><span className="block text-[13px] text-muted">{line}</span></span>
      <span aria-hidden className="text-muted rtl:rotate-180">›</span>
    </Link>
  );
}

/** "Learning together" figures for the profile statistics (own or a friend's), like the app's TogetherStatsCard. */
export function TogetherStatsWeb({ username, t, locale }: { username: string; t: Record<TgKey, string>; locale: string }) {
  const [d, setD] = useState<{ league: { tier: number; bestTier: number } | null; circles: number | null; circleWeeksReached: number | null; challengesDone: number | null } | null>(null);
  useEffect(() => {
    fetch(`/api/together/stats/${encodeURIComponent(username)}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((x) => setD(x?.stats ?? null)).catch(() => undefined);
  }, [username]);
  if (!d || (!d.league && !d.circles && !d.challengesDone)) return null;
  const tx = (k: TgKey) => t[k] ?? k;
  const cell = (label: string, value: string) => <div key={label} className="rounded-lg bg-bg p-3"><p className="font-display text-xl">{value}</p><p className="text-[12.5px] text-muted">{label}</p></div>;
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="font-display text-lg">{tx("statsTitle")}</h3>
      {d.league ? <div className="mt-2"><TierBadge tier={d.league.tier} tx={(k) => tx(k)} /></div> : null}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {d.league ? cell(tx("stat_league"), tx(`tier_${d.league.bestTier}` as TgKey)) : null}
        {d.circles !== null ? cell(tx("stat_circles"), d.circles.toLocaleString(locale)) : null}
        {d.circleWeeksReached !== null ? cell(tx("stat_weeks"), d.circleWeeksReached.toLocaleString(locale)) : null}
        {d.challengesDone !== null ? cell(tx("stat_challenges"), d.challengesDone.toLocaleString(locale)) : null}
      </div>
    </div>
  );
}
