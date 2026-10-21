"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { BadgeIcon, type WebBadge } from "./BadgeIcon";
import { Avatar, Ico } from "./TalentProfileWeb";

// "Discover talents" on the website (/talents/discover, 22.10.2026), 1:1 with the app's /talents
// (mobile/src/app/talents/index.tsx): search by name or @username (250 ms after the last key), filters level, verified
// only, madrasa stage, focus, the surah being memorised, country and rewaya, the paged list (30 per page, "Load more").
// Same endpoint as the app (/api/community/talents: signed in, birth year confirmed, 13+). Every row opens the profile.
type Card = { username: string; name: string; country: string | null; rewaya: string; level: string; verified: boolean; badge?: WebBadge | null; avatar?: string | null };
type State = "load" | "ok" | "out" | "age" | "under13" | "error";
export type DiscoverTexts = Record<string, string>;
const LEVELS = ["talent", "rising", "master", "sheikh"] as const;
const STAGES = ["ibtidai", "idadi", "thanawi", "ali"] as const;
const FOCUSES = ["hifz", "reading", "arabic", "knowledge"] as const;
const soft = "bg-[rgba(6,108,78,0.08)] dark:bg-white/10";

export default function TalentDiscoverWeb({ t, countries }: { t: DiscoverTexts; countries: { code: string; name: string }[] }) {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [rewaya, setRewaya] = useState("");
  const [level, setLevel] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [surah, setSurah] = useState("");
  const [list, setList] = useState<Card[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [state, setState] = useState<State>("load");
  const [busy, setBusy] = useState(true); // the first page loads at once (no "empty" flash before it)
  const [msg, setMsg] = useState("");
  const [year, setYear] = useState("");
  const [yearOk, setYearOk] = useState(false);
  const [reload, setReload] = useState(0);
  const seq = useRef(0);
  const names = useMemo(() => new Map(countries.map((c) => [c.code, c.name])), [countries]);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (country) p.set("country", country);
    if (rewaya.trim()) p.set("rewaya", rewaya.trim());
    if (level) p.set("level", level);
    if (verified) p.set("verified", "1");
    if (stage) p.set("stage", stage);
    if (focus) p.set("focus", focus);
    const sn = Number(surah);
    if (Number.isInteger(sn) && sn >= 1 && sn <= 114) p.set("surah", String(sn));
    return p.toString();
  }, [q, country, rewaya, level, verified, stage, focus, surah]);

  const load = useCallback(async (cursor?: string) => {
    const my = ++seq.current;
    setBusy(true); setMsg("");
    const url = `/api/community/talents?${params}${cursor ? `${params ? "&" : ""}cursor=${encodeURIComponent(cursor)}` : ""}`;
    const r = await fetch(url, { cache: "no-store" }).catch(() => null);
    if (my !== seq.current) return;
    const d = (await r?.json().catch(() => ({}))) as { talents?: Card[]; next?: string | null; error?: string } | undefined;
    if (!r) { setState((s) => (s === "load" ? "error" : s)); setMsg(t.e_generic); }
    else if (r.status === 401) setState("out");
    else if (r.status === 403 && d?.error === "age_required") setState("age");
    else if (r.status === 403 && d?.error === "age") setState("under13");
    else if (!r.ok) { setState((s) => (s === "load" ? "error" : s)); setMsg(t[`e_${d?.error ?? ""}`] ?? t.e_generic); }
    else {
      setState("ok");
      setList((old) => (cursor ? [...old, ...(d?.talents ?? [])] : d?.talents ?? []));
      setNext(d?.next ?? null);
    }
    setBusy(false);
  }, [params, t]);

  useEffect(() => {
    const h = setTimeout(() => { void load(); }, 250);
    return () => clearTimeout(h);
  }, [load, reload]);

  const confirmAge = async () => {
    setMsg("");
    const r = await fetch("/api/community/age", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ birthYear: Number(year), confirm: true }) }).catch(() => null);
    const d = (await r?.json().catch(() => ({}))) as { error?: string } | undefined;
    if (!r?.ok) { setMsg(t[`e_${d?.error ?? ""}`] ?? t.e_generic); return; }
    setState("load"); setReload((n) => n + 1);
  };

  const chip = (key: string, label: string, on: boolean, onClick: () => void) => (
    <button key={key} type="button" aria-pressed={on} onClick={onClick}
      className={`min-h-9 rounded-full border px-3.5 text-[14px] font-semibold ${on ? "border-[#c6a65e] bg-[#c6a65e] text-[rgb(8,38,29)]" : "border-line bg-surface text-ink hover:opacity-80"}`}>{label}</button>
  );
  const label = "text-[13px] font-semibold text-muted";
  const input = "h-12 w-full rounded-md border border-line bg-surface px-3 text-[16px] text-ink placeholder:text-muted";

  if (state === "out") return (
    <div className="mt-8 grid justify-items-start gap-3">
      <p className="text-[16px]">{t.signIn}</p>
      <Link href="/account" className="btn-gold inline-flex h-12 items-center rounded-md px-6 font-bold">{t.signInBtn}</Link>
    </div>
  );
  if (state === "under13") return <p className="callout mt-8 rounded-lg p-6">{t.under13}</p>;
  if (state === "age") return (
    <section className="mt-8 grid max-w-md gap-4 rounded-lg border border-line bg-surface p-6">
      <h2 className="font-display text-2xl">{t.ageTitle}</h2>
      <p className="text-muted">{t.ageLead}</p>
      <label className="grid gap-1.5 font-semibold">{t.birthYear}<input className={input} inputMode="numeric" maxLength={4} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} /></label>
      <label className="flex gap-3"><input type="checkbox" checked={yearOk} onChange={(e) => setYearOk(e.target.checked)} />{t.ageConfirm}</label>
      {msg ? <p role="alert" className="text-red-700 dark:text-red-400">{msg}</p> : null}
      <button type="button" onClick={() => void confirmAge()} disabled={!yearOk || year.length !== 4} className="btn-gold h-12 rounded-md font-bold disabled:opacity-50">{t.confirm}</button>
    </section>
  );
  if (state === "error") return (
    <div className="mt-8 grid justify-items-start gap-3">
      <p className="text-muted">{msg || t.e_generic}</p>
      <button type="button" onClick={() => { setState("load"); setReload((n) => n + 1); }} className={`h-11 rounded-lg px-5 font-bold ${soft} text-ink`}>{t.retry}</button>
    </div>
  );

  return (
    <div className="mt-8 grid gap-6">
      <label className="flex h-12 items-center gap-2.5 rounded-md border border-line bg-surface px-3.5">
        <Ico n="search" size={18} className="text-muted" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value.slice(0, 40))} placeholder={t.search} aria-label={t.search} autoComplete="off" autoCapitalize="none" spellCheck={false}
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted" />
      </label>

      <div className="grid gap-2">
        <p className={label}>{t.filterLevel}</p>
        <div className="flex flex-wrap gap-2">
          {chip("all", t.all, !level, () => setLevel(null))}
          {LEVELS.map((l) => chip(l, t[`level_${l}`] ?? l, level === l, () => setLevel(level === l ? null : l)))}
          {chip("verified", t.verifiedOnly, verified, () => setVerified(!verified))}
        </div>
      </div>
      <div className="grid gap-2">
        <p className={label}>{t.filterStage}</p>
        <div className="flex flex-wrap gap-2">{STAGES.map((x) => chip(x, (t[`stage_${x}`] ?? x).split(" (")[0], stage === x, () => setStage(stage === x ? null : x)))}</div>
        <p className={`${label} mt-2`}>{t.filterFocus}</p>
        <div className="flex flex-wrap gap-2">{FOCUSES.map((x) => chip(x, t[`focus_${x}`] ?? x, focus === x, () => setFocus(focus === x ? null : x)))}</div>
        <label className="mt-2 grid max-w-xs gap-1.5 text-[14px] font-semibold text-ink">{t.filterSurah}
          <input className={input} inputMode="numeric" maxLength={3} value={surah} placeholder={t.surahHint} onChange={(e) => setSurah(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-[14px] font-semibold text-ink">{t.filterCountry}
          <select className={input} value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">{t.anyCountry}</option>
            {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-[14px] font-semibold text-ink">{t.filterRewaya}
          <input className={input} value={rewaya} maxLength={40} placeholder={t.rewayaFilterHint} autoCorrect="off" onChange={(e) => setRewaya(e.target.value)} />
        </label>
      </div>

      {/* a message (one page failed) sits above the list; while the first page loads: a placeholder, never an empty area */}
      {msg ? <p role="status" className="text-muted">{msg}</p> : null}
      {!list.length && (busy || state === "load") ? <div aria-busy="true" className="h-40 animate-pulse rounded-lg bg-line/40" />
        : !list.length ? <p className="text-muted">{t.empty}</p> : (
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {list.map((c) => {
              const meta = [t[`level_${c.level}`] ?? "", c.rewaya, c.country ? names.get(c.country) ?? c.country : ""].filter(Boolean).join(" · ");
              const badge = c.badge ?? (c.verified ? "gold" : null);
              return (
                <li key={c.username}>
                  <Link href={`/talents/${c.username}`} className="flex min-h-16 items-center gap-3 px-4 py-3 hover:opacity-80">
                    <Avatar src={c.avatar} size={46} badge={c.badge} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5"><span className="truncate text-[15.5px] font-bold text-ink">{c.name}</span>{badge ? <BadgeIcon badge={badge} size={15} /> : null}</span>
                      <span className="block truncate text-[13px] text-muted" dir="ltr">@{c.username}</span>
                      {meta ? <span className="block truncate text-[12.5px] text-muted">{meta}</span> : null}
                    </span>
                    <Ico n="chevronRight" size={16} className="shrink-0 text-muted rtl:-scale-x-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      {next ? <button type="button" disabled={busy} onClick={() => void load(next)} className={`h-12 rounded-lg font-bold disabled:opacity-55 ${soft} text-ink`}>{t.loadMore}</button> : null}

      <div className="border-t border-line pt-3 text-[12.5px] text-muted">
        <p className="flex items-center gap-2"><Ico n="shield" size={15} />{t.safetyLine}</p>
      </div>
    </div>
  );
}
