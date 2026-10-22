"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Segmented from "@/components/ui/Segmented";
import { Link, useRouter } from "@/i18n/navigation";
import { BadgeIcon, type WebBadge } from "./BadgeIcon";
import { Avatar, Ico, followLabel, type WebIconName } from "./TalentProfileWeb";
import { tpText } from "@/lib/talentsProfileWeb";
import { fill } from "@/lib/talentsWeb";
import { maybeSignedIn } from "@/lib/sync";

// Search like Instagram / TikTok on the website, 1:1 with the app (mobile/src/features/talents/Search.tsx): a rounded
// field with live results as you type (250 ms), tabs Accounts (default) and Top (a few accounts plus learning content:
// surahs, courses and the Quran full-text search). Every account row: avatar, @username with badge, name · followers
// and Follow / Follow back / Requested / Following inline. With an empty field: recent searches (this browser only,
// removable) and suggested accounts. Accounts from /api/community/search (signed in, 13+), like the app.
type Row = { username: string; name: string; avatar?: string | null; badge?: WebBadge | null; followers: number; followed?: boolean; followsMe?: boolean; requested?: boolean; busy?: boolean };
type Recent = { kind: "account"; username: string; name: string; avatar: string | null; badge: WebBadge | null } | { kind: "query"; q: string };
export type SearchSurah = { id: number; name: string; sub: string; ar: string };
export type SearchCourse = { id: string; title: string; lead: string };
const KEY = "qmc.talents.recentSearches.v1";
const readRecent = (): Recent[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Recent[]; } catch { return []; } };
const writeRecent = (l: Recent[]) => { try { localStorage.setItem(KEY, JSON.stringify(l.slice(0, 20))); } catch { /* private mode */ } };
const rid = (r: Recent) => (r.kind === "account" ? `@${r.username}` : `q:${r.q.toLowerCase()}`);
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[ʿʾ'’`\-\s]/g, "").toLowerCase();
const soft = "bg-[rgba(6,108,78,0.08)] dark:bg-white/10";

export default function PeopleSearch({ locale, surahs, courses, initialQ = "", initialTab = "accounts" }: { locale: string; surahs: SearchSurah[]; courses: SearchCourse[]; initialQ?: string; initialTab?: "accounts" | "top" }) {
  const t = tpText(locale);
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [tab, setTab] = useState<"accounts" | "top">(initialTab);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState<"" | "signin" | "error">("");
  const [recent, setRecent] = useState<Recent[]>([]);
  const [suggested, setSuggested] = useState<Row[] | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const seq = useRef(0);
  const s = q.trim().replace(/^@/, "");
  const nf = useMemo(() => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }), [locale]);

  useEffect(() => { setRecent(readRecent()); }, []);
  useEffect(() => {
    // signed-out visitors: straight to the sign-in hint, without a 401 from /suggested in the console
    maybeSignedIn().then((maybe) => (maybe ? fetch("/api/community/suggested", { cache: "no-store" }) : null)).then(async (r) => {
      if (!r || r.status === 401) { setSignedIn(false); setSuggested([]); return; }
      setSignedIn(true);
      const d = (await r.json().catch(() => ({}))) as { talents?: Row[] };
      setSuggested(d.talents ?? []);
    }).catch(() => setSuggested([]));
  }, []);
  // live results: 250 ms after the last key, only the newest answer counts
  useEffect(() => {
    const my = ++seq.current;
    if (!s) { setRows(null); setLoading(false); return; }
    if (signedIn === false) { setBlocked("signin"); setRows([]); setLoading(false); return; } // accounts need a sign-in
    setLoading(true);
    const id = setTimeout(() => {
      fetch(`/api/community/search?q=${encodeURIComponent(s)}`, { cache: "no-store" }).then(async (r) => {
        if (my !== seq.current) return;
        if (r.status === 401) { setBlocked("signin"); setRows([]); return; }
        const d = (await r.json().catch(() => ({}))) as { talents?: Row[] };
        if (!r.ok) { setBlocked("error"); setRows([]); return; }
        setBlocked(""); setRows(d.talents ?? []);
      }).catch(() => { if (my === seq.current) { setBlocked("error"); setRows([]); } }).finally(() => { if (my === seq.current) setLoading(false); });
    }, 250);
    return () => clearTimeout(id);
  }, [s, signedIn]);

  const push = (r: Recent) => { const l = [r, ...readRecent().filter((x) => rid(x) !== rid(r))]; writeRecent(l); setRecent(l.slice(0, 20)); };
  const openAccount = (c: { username: string; name: string; avatar?: string | null; badge?: WebBadge | null }) => {
    push({ kind: "account", username: c.username, name: c.name, avatar: c.avatar ?? null, badge: c.badge ?? null });
    router.push(`/talents/${c.username}`);
  };
  const submit = () => { if (s) push({ kind: "query", q: s }); };
  const follow = async (c: Row, which: "rows" | "suggested") => {
    const set = which === "rows" ? setRows : setSuggested;
    const patch = (x: Partial<Row>) => set((l) => l?.map((y) => (y.username === c.username ? { ...y, ...x } : y)) ?? null);
    // optimistic like the app; a failed call puts the row back
    const on = !(c.followed || c.requested);
    patch({ busy: true, followed: on, requested: false });
    const r = await fetch(`/api/community/follow/${c.username}`, { method: on ? "POST" : "DELETE" }).catch(() => null);
    const d = (await r?.json().catch(() => ({}))) as { followed?: boolean; requested?: boolean; followers?: number } | undefined;
    patch(r?.ok && d ? { busy: false, followed: !!d.followed, requested: !!d.requested, followers: d.followers ?? c.followers } : { busy: false, followed: c.followed, requested: c.requested });
  };
  const learn = useMemo(() => {
    if (!s) return { surahs: [] as SearchSurah[], courses: [] as SearchCourse[] };
    const f = fold(s), n = Number(s);
    return {
      surahs: surahs.filter((c) => (Number.isInteger(n) && c.id === n) || fold(c.name).includes(f) || fold(c.sub).includes(f) || c.ar.includes(s)).slice(0, 4),
      courses: courses.filter((c) => fold(c.title).includes(f)).slice(0, 3),
    };
  }, [s, surahs, courses]);

  const accountRow = (c: Row, which: "rows" | "suggested") => {
    const gold = !c.followed && !c.requested;
    const label = followLabel(t, c);
    return (
      <li key={c.username} className="flex min-h-[68px] items-center gap-3 px-4">
        <button type="button" onClick={() => openAccount(c)} className="flex min-w-0 flex-1 items-center gap-3 py-2 text-start hover:opacity-75">
          <Avatar src={c.avatar} size={50} badge={c.badge} />
          <span className="min-w-0">
            <span className="flex items-center gap-1"><span className="truncate text-[15px] font-bold text-ink" dir="ltr">@{c.username}</span>{c.badge ? <BadgeIcon badge={c.badge} size={14} /> : null}</span>
            <span className="block truncate text-[13.5px] text-muted">{[c.name, fill(t.followersN, { n: nf.format(c.followers ?? 0) }), c.followsMe && !c.followed ? t.followsYou : ""].filter(Boolean).join(" · ")}</span>
          </span>
        </button>
        {signedIn ? (
          <button type="button" disabled={c.busy} onClick={() => void follow(c, which)} aria-label={`${label}, ${c.name}`}
            className={`h-[34px] min-w-[96px] shrink-0 rounded-lg px-3.5 text-[13.5px] font-bold disabled:opacity-55 ${gold ? "bg-[#c6a65e] text-[rgb(8,38,29)]" : `${soft} text-ink`}`}>{label}</button>
        ) : null}
      </li>
    );
  };
  const linkRow = (key: string, icon: WebIconName, title: string, sub: string | null, href: string) => (
    <li key={key}>
      <Link href={href} onClick={submit} className="flex min-h-[60px] items-center gap-3 px-4 hover:opacity-75">
        <span className={`grid h-[50px] w-[50px] shrink-0 place-items-center rounded-full ${soft} text-ink`}><Ico n={icon} size={21} /></span>
        <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold text-ink">{title}</span>{sub ? <span className="block truncate text-[13px] text-muted">{sub}</span> : null}</span>
        <Ico n="chevronRight" size={16} className="text-muted" />
      </Link>
    </li>
  );
  const header = (title: string, right?: React.ReactNode) => (
    <div className="flex items-center px-4 pb-1.5 pt-3.5"><h2 className="flex-1 text-[16px] font-bold text-ink">{title}</h2>{right}</div>
  );
  const signIn = (
    <div className="grid justify-items-center gap-3 p-4 text-center">
      <p className="text-[14.5px] text-muted">{t.searchSignIn}</p>
      <Link href="/account" className="inline-flex h-11 items-center rounded-lg bg-[#c6a65e] px-6 font-bold text-[rgb(8,38,29)]">{t.signInBtn}</Link>
    </div>
  );
  const accounts = (limit?: number) => {
    if (blocked === "signin" || (signedIn === false && s)) return signIn;
    if (!rows || (loading && !rows.length)) return <div className="p-6"><div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>;
    if (!rows.length) return <p className="p-6 text-center text-[14.5px] text-muted">{blocked === "error" ? t.e_generic : fill(t.noResults, { q: s })}</p>;
    return <ul>{(limit ? rows.slice(0, limit) : rows).map((c) => accountRow(c, "rows"))}</ul>;
  };

  return (
    <div className="mx-auto min-h-[70vh] max-w-2xl bg-surface pb-16 sm:my-6 sm:rounded-xl sm:border sm:border-line">
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex items-center gap-2.5 px-4 pb-2 pt-3">
        <label className={`flex h-10 flex-1 items-center gap-2 rounded-xl px-3 ${soft}`}>
          <Ico n="search" size={17} className="text-muted" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder={t.searchPh} aria-label={t.searchLabel} autoComplete="off" autoCapitalize="none" spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted" />
          {q ? <button type="button" onClick={() => setQ("")} aria-label={t.cancel} className="grid h-[22px] w-[22px] place-items-center rounded-full bg-muted text-surface"><Ico n="close" size={13} sw={2.6} /></button> : null}
        </label>
        <button type="button" onClick={() => (history.length > 1 ? history.back() : router.push("/talents"))} className="min-h-10 text-[15.5px] font-semibold text-ink">{t.cancel}</button>
      </form>

      {s ? (
        <Segmented tabs full label={`${t.tabAccounts} / ${t.tabTop}`} value={tab} onChange={setTab}
          options={[{ id: "accounts", label: t.tabAccounts }, { id: "top", label: t.tabTop }]} />
      ) : null}

      {!s ? (
        <>
          {recent.length ? (
            <>
              {header(t.recent, <button type="button" onClick={() => { writeRecent([]); setRecent([]); }} className="text-[14px] font-bold text-gold hover:underline">{t.clearRecent}</button>)}
              <ul>
                {recent.map((r) => (
                  <li key={rid(r)} className="flex min-h-16 items-center ps-4 pe-1.5">
                    <button type="button" onClick={() => (r.kind === "account" ? openAccount(r) : setQ(r.q))} className="flex min-w-0 flex-1 items-center gap-3 py-2 text-start hover:opacity-75">
                      {r.kind === "account" ? <Avatar src={r.avatar} size={50} badge={r.badge} /> : <span className="grid h-[50px] w-[50px] place-items-center rounded-full border border-line text-ink"><Ico n="search" size={20} /></span>}
                      <span className="min-w-0"><span className="block truncate text-[15px] font-bold text-ink" dir={r.kind === "account" ? "ltr" : undefined}>{r.kind === "account" ? `@${r.username}` : r.q}</span>{r.kind === "account" ? <span className="block truncate text-[13.5px] text-muted">{r.name}</span> : null}</span>
                    </button>
                    <button type="button" onClick={() => { const l = readRecent().filter((x) => rid(x) !== rid(r)); writeRecent(l); setRecent(l); }} aria-label={`${t.removeRecent}: ${r.kind === "account" ? `@${r.username}` : r.q}`} className="grid h-11 w-11 place-items-center text-muted"><Ico n="close" size={17} /></button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {signedIn === false ? signIn : suggested?.length ? (
            <>
              {/* "See all" opens Discover talents (the full list with filters), like the app; not the landing page */}
              {header(t.suggested, <Link href="/talents/discover" className="text-[14px] font-bold text-gold hover:underline">{t.seeAll}</Link>)}
              <ul>{suggested.map((c) => accountRow(c, "suggested"))}</ul>
            </>
          ) : suggested && !recent.length ? (
            <div className="grid justify-items-center gap-2.5 px-8 pt-12 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full border-[1.5px] border-line text-ink"><Ico n="search" size={26} /></span>
              <p className="text-[15px] font-semibold text-muted">{t.search}</p>
            </div>
          ) : null}
        </>
      ) : tab === "accounts" ? accounts() : (
        <>
          {rows?.length || loading || blocked === "signin" ? (
            <>
              {header(t.tabAccounts, rows && rows.length > 3 ? <button type="button" onClick={() => setTab("accounts")} className="text-[14px] font-bold text-gold hover:underline">{t.seeAll}</button> : undefined)}
              {accounts(3)}
            </>
          ) : null}
          {header(t.learnSection)}
          <ul>
            {learn.surahs.map((c) => linkRow(`s${c.id}`, "book", `${c.id}. ${c.name}`, c.sub || null, `/surah/${c.id}`))}
            {learn.courses.map((c) => linkRow(`c${c.id}`, "cap", c.title, c.lead || null, `/courses/${c.id}`))}
            {linkRow("quran", "search", fill(t.searchQuran, { q: s }), null, `/search?q=${encodeURIComponent(s)}`)}
          </ul>
        </>
      )}
    </div>
  );
}
