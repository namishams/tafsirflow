"use client";
import { IconFlame } from "./Icons";
import ProgressPanel from "./ProgressPanel";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { LOCALE_META } from "@/i18n/locales";
import { GOALS, sortedCountries } from "@/lib/countries";
import { readJSON, writeJSON } from "@/lib/storage";
import { groupOf } from "@/lib/age";
import { readSrs, stats, weakestVerses } from "@/lib/learning";
import { PASS, levelOf, readProgress, streakOf } from "@/lib/academy";
import { TRACKS, cumulative, dayOfPlan, readPlan } from "@/lib/plans";
import { TOTAL_VERSES } from "@/lib/quranIndex";
import { VOCAB_DECKS } from "@/lib/vocab";
import { TAJWEED_LESSONS } from "@/lib/tajweed";
import { stopSync } from "@/lib/sync";
import StatsView from "./StatsView";
import Ranking from "./Ranking";
import RewardsCard from "./RewardsCard";
import Sticker from "./Sticker";
import { LevelSeal } from "./Rewards";
import { levelOf as pointsLevel, readPoints, streakOf as pointsStreak, totalPoints } from "@/lib/points";
import { buildCtx, earnedIds, hoursOf, stickerById } from "@/lib/stickers";
import DonateCTA from "./DonateCTA";

const TABS = ["overview", "stats", "badges", "ranking", "learning", "account"] as const;
type Tab = (typeof TABS)[number];

type Profile = { email: string; birth_year: number | null; first_name: string | null; last_name: string | null; country: string | null; city: string | null; goal: string | null; locale: string | null; marketing_opt_in: boolean; email_verified: boolean; created_at: string; last_login_at: string | null; plan: string };
type Data = { profile: Profile; sessions: number; social: { comments: number; likes: number } };

const field = "h-11 w-full rounded-md border border-line bg-bg px-3 text-[15px] focus:border-ink focus:outline-none";
const card = "rounded-lg border border-line bg-surface p-5 sm:p-6";

// My profile: personal data, complete learning statistics, security and privacy controls
export default function ProfileView() {
  const t = useTranslations("profile");
  const n = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [d, setD] = useState<Data | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [pw, setPw] = useState({ current: "", next: "" });
  const [del, setDel] = useState("");
  const [s, setS] = useState<ReturnType<typeof collect> | null>(null);
  const [tab, setTabState] = useState<Tab>("overview");
  const [me, setMe] = useState<{ points: number; level: ReturnType<typeof pointsLevel>; streak: number; hours: number; stickers: string[] } | null>(null);
  const [rank, setRank] = useState<{ rank: number | null; participants: number } | null>(null);
  // the tab lives in the address (#stats, #ranking …) so it can be linked and survives a reload
  const setTab = (x: Tab) => { setTabState(x); try { history.replaceState(null, "", `#${x}`); } catch { /* ignore */ } };
  useEffect(() => {
    const fromHash = () => { const h = location.hash.slice(1) as Tab; if (TABS.includes(h)) setTabState(h); };
    fromHash(); window.addEventListener("hashchange", fromHash);
    const mine = () => { const p = readPoints(), c = buildCtx(); const total = totalPoints(p); setMe({ points: total, level: pointsLevel(total), streak: pointsStreak(p.d).current, hours: hoursOf(c), stickers: earnedIds(c) }); };
    mine(); window.addEventListener("tf-points", mine); window.addEventListener("tf-synced", mine);
    fetch("/api/ranking?range=week").then((r) => r.json()).then((x) => setRank({ rank: x.me?.rank ?? null, participants: x.participants ?? 0 })).catch(() => undefined);
    return () => { window.removeEventListener("hashchange", fromHash); window.removeEventListener("tf-points", mine); window.removeEventListener("tf-synced", mine); };
  }, []);

  const load = () => fetch("/api/account", { cache: "no-store" }).then((r) => r.json()).then((x: Data) => {
    setD(x);
    const p = x.profile;
    setForm({ birthYear: p.birth_year ? String(p.birth_year) : "", firstName: p.first_name ?? "", lastName: p.last_name ?? "", country: p.country ?? "", city: p.city ?? "", goal: p.goal ?? "", locale: p.locale ?? locale, marketing: !!p.marketing_opt_in });
  });
  useEffect(() => { load(); setS(collect()); window.addEventListener("tf-synced", () => setS(collect())); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const flash = (k: string, v: string) => { setMsg((m) => ({ ...m, [k]: v })); setTimeout(() => setMsg((m) => ({ ...m, [k]: "" })), 3500); };

  const saveProfile = async () => {
    const r = await fetch("/api/account", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    flash("profile", r.ok ? t("saved") : t("error"));
    if (r.ok) { load(); if (form.birthYear) writeJSON("tf:age", Number(form.birthYear), true); }
  };
  const post = (body: unknown) => fetch("/api/account", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const changePw = async () => {
    const r = await post({ action: "password", ...pw });
    const e = r.ok ? "" : ((await r.json().catch(() => ({}))) as { error?: string }).error;
    flash("pw", r.ok ? t("pwChanged") : e === "current" ? t("pwWrong") : e === "weak" ? t("pwWeak") : t("error"));
    if (r.ok) setPw({ current: "", next: "" });
  };
  const logoutAll = async () => { await post({ action: "logout-all" }); stopSync(); router.push("/account"); };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); stopSync(); router.push("/account"); };
  const deleteAccount = async () => {
    if (!confirm(t("deleteConfirm"))) return;
    const r = await post({ action: "delete", current: del });
    if (r.ok) { stopSync(); try { Object.keys(localStorage).filter((k) => k.startsWith("tf:")).forEach((k) => localStorage.removeItem(k)); } catch { /* storage blocked */ } router.push("/"); }
    else flash("del", t("pwWrong"));
  };

  if (!d || !s) return <div className="mt-8 h-64 animate-pulse rounded-lg bg-line/40" />;
  const p = d.profile;
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email;
  const date = (x: string | null) => (x ? new Date(x).toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", day: "numeric", month: "long", year: "numeric" }) : "–");
  const tile = (label: string, value: React.ReactNode, hint?: string, href?: string) => {
    const inner = <><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p><p className="font-display mt-2 text-3xl tabular-nums">{value}</p>{hint && <p className="mt-1 text-xs text-muted">{hint}</p>}</>;
    return href ? <Link href={href} className="bg-surface p-5 hover:bg-bg">{inner}</Link> : <div className="bg-surface p-5">{inner}</div>;
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-6">
      <section className="stage girih relative overflow-hidden rounded-2xl text-[#eef0f3]">
        <span aria-hidden className="illum-frame" />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <span className="relative grid h-20 w-20 shrink-0 place-items-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-[rgb(201_166_94)]" aria-hidden><path d={Array.from({ length: 32 }, (_, i) => { const a = (Math.PI / 16) * i - Math.PI / 2, r = i % 2 ? 41 : 49; return `${i ? "L" : "M"}${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`; }).join("") + "Z"} fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="1.2" /></svg>
              <span className="font-kufi relative text-3xl text-[rgb(233_207_153)]">{name[0]?.toUpperCase()}</span>
            </span>
            <div className="min-w-0">
              <h2 className="font-display truncate text-3xl">{name}</h2>
              <p className="truncate text-sm text-white/65">{p.email} · {p.email_verified ? <span className="font-semibold text-[rgb(233_207_153)]">{t("verified")}</span> : t("unverified")}</p>
              <p className="mt-1 text-xs text-white/50">{t("since", { date: date(p.created_at) })} · {t("lastLogin", { date: date(p.last_login_at) })}</p>
            </div>
          </div>
          {me && (
            <button onClick={() => setTab("badges")} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-start transition hover:border-white/30">
              <LevelSeal n={me.level.n} size={64} />
              <span><span className="font-callig block text-2xl leading-tight text-[rgb(var(--gold))]" dir="rtl" lang="ar">{me.level.ar}</span><span className="text-xs text-white/60">{t("pointsN", { n: me.points })}</span></span>
            </button>
          )}
        </div>
        {me && (
          <dl className="relative grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
            {[[String(me.streak), t("kStreak")], [new Intl.NumberFormat(locale, { numberingSystem: "latn", maximumFractionDigits: 1 }).format(me.hours), t("kHours")], [String(me.stickers.length), t("kStickers")], [rank?.rank ? `#${rank.rank}` : "–", t("kRank")]].map(([v, l], i) => (
              <div key={l} className={`px-5 py-4 ${i % 2 ? "border-s border-white/10" : ""} ${i >= 2 ? "border-t border-white/10 sm:border-t-0" : ""} ${i === 2 ? "sm:border-s" : ""}`}><dt className="font-display text-2xl text-[rgb(var(--gold))]">{v}</dt><dd className="text-xs text-white/55">{l}</dd></div>
            ))}
          </dl>
        )}
      </section>

      <nav aria-label={t("title")} className="flex flex-wrap gap-1.5 rounded-2xl border border-line bg-surface p-1.5">
        {TABS.map((x) => <button key={x} onClick={() => setTab(x)} aria-current={tab === x ? "page" : undefined} className={`h-10 flex-1 rounded-xl px-3 text-sm font-semibold transition sm:flex-none sm:px-4 ${tab === x ? "bg-[rgb(var(--stage))] text-[rgb(233_207_153)] shadow-sm" : "text-muted hover:bg-bg hover:text-ink"}`}>{t(`tab_${x}`)}</button>)}
      </nav>

      {tab === "overview" && (
        <div className="grid gap-6">
          <RewardsCard />
          {me && me.stickers.length > 0 && (
            <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold">{t("latestStickers")}</h3><button onClick={() => setTab("badges")} className="text-sm font-semibold text-accent hover:underline">{t("allStickers")}</button></div>
              <ul className="mt-4 flex flex-wrap gap-4">{me.stickers.slice(-8).reverse().map((id) => { const def = stickerById(id); return def ? <li key={id}><Sticker def={def} size={64} /></li> : null; })}</ul>
            </section>
          )}
          <ProgressPanel />
          <section className="grid gap-3 sm:grid-cols-3">
            {[["/today", t("goToday")], ["/map", t("goMap")], ["/community", t("goCommunity")]].map(([h, l]) => <Link key={h} href={h} className="callout rounded-xl p-4 text-[15px] font-semibold transition hover:-translate-y-0.5">{l}</Link>)}
          </section>
          <DonateCTA />
        </div>
      )}
      {tab === "stats" && <StatsView embedded only={["listen", "points", "learn"]} />}
      {tab === "badges" && <StatsView embedded only={["level", "stickers", "badges"]} />}
      {tab === "ranking" && <Ranking embedded />}

      {tab === "learning" && <section>
        <h2 className="text-lg font-bold">{t("statsTitle")}</h2>
        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-4">
          {tile(t("streak"), <>{s.streak} <IconFlame /></>, t("streakHint", { n: s.todayCount }))}
          {tile(t("level"), s.level, t("xp", { n: s.xp }), "/academy")}
          {tile(t("lessons"), s.lessons, t("lessonsHint"), "/academy")}
          {tile(t("verses"), s.inReview, t("secured", { n: s.secured }), "/today")}
          {tile(t("plan"), s.plan ? `${s.plan.day}` : "–", s.plan ? t("planHint", { track: s.plan.track, learned: s.plan.learned }) : t("noPlan"), "/plan")}
          {tile(t("khatm"), s.khatm !== null ? `${s.khatm}%` : "–", s.khatm !== null ? t("khatmHint") : t("noKhatm"), "/khatm")}
          {tile(t("vocab"), `${s.vocab}`, t("vocabHint", { total: s.vocabTotal }), "/vocab")}
          {tile(t("tajweed"), `${s.tajweedDone}/${TAJWEED_LESSONS.length}`, s.tajweedAvg !== null ? t("tajweedHint", { n: s.tajweedAvg }) : t("noTajweed"), "/tajweed")}
          {tile(t("bookmarks"), s.bookmarks)}
          {tile(t("notes"), s.notes, t("mnemos", { n: s.mnemos }))}
          {tile(t("comments"), d.social.comments)}
          {tile(t("likes"), d.social.likes)}
        </div>
        {s.weak.length > 0 && (
          <p className="mt-3 text-sm text-muted">{t("weak")}{" "}{s.weak.map((w) => <Link key={w.key} href={`/surah/${w.key.split(":")[0]}?v=${w.key.split(":")[1]}&shams=1`} className="me-2 font-semibold text-accent hover:underline">{w.key}</Link>)}</p>
        )}
      </section>}

      {tab === "account" && <>
      <section className={card}>
        <h2 className="text-lg font-bold">{t("personal")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm"><span className="text-muted">{t("firstName")}</span><input className={field} value={String(form.firstName ?? "")} onChange={(e) => setForm({ ...form, firstName: e.target.value })} autoComplete="given-name" /></label>
          <label className="grid gap-1 text-sm"><span className="text-muted">{t("lastName")}</span><input className={field} value={String(form.lastName ?? "")} onChange={(e) => setForm({ ...form, lastName: e.target.value })} autoComplete="family-name" /></label>
          <label className="grid gap-1 text-sm"><span className="text-muted">{t("country")}</span>
            <select className={field} value={String(form.country ?? "")} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              <option value="">–</option>
              {sortedCountries(locale).map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm"><span className="text-muted">{t("city")}</span><input className={field} value={String(form.city ?? "")} onChange={(e) => setForm({ ...form, city: e.target.value })} autoComplete="address-level2" /></label>
          <label className="grid gap-1 text-sm"><span className="text-muted">{t("birthYear")}</span>
            <select className={field} value={String(form.birthYear ?? "")} onChange={(e) => setForm({ ...form, birthYear: e.target.value })}>
              <option value="">–</option>
              {Array.from({ length: new Date().getFullYear() - 3 - 1920 + 1 }, (_, i) => new Date().getFullYear() - 3 - i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            {groupOf(Number(form.birthYear)) && <span className="text-xs text-gold">{t(`age_${groupOf(Number(form.birthYear))}`)}</span>}
          </label>
          <label className="grid gap-1 text-sm"><span className="text-muted">{t("goal")}</span>
            <select className={field} value={String(form.goal ?? "")} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
              <option value="">–</option>
              {GOALS.map((g) => <option key={g} value={g}>{t(`goal_${g}`)}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm"><span className="text-muted">{t("language")}</span>
            <select className={field} value={String(form.locale ?? locale)} onChange={(e) => setForm({ ...form, locale: e.target.value })}>
              {Object.entries(LOCALE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <label className="flex items-start gap-3 text-sm sm:col-span-2"><input type="checkbox" className="mt-1" checked={!!form.marketing} onChange={(e) => setForm({ ...form, marketing: e.target.checked })} /><span>{t("marketing")}</span></label>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={saveProfile} className="h-11 rounded-md bg-ink px-5 text-sm font-bold text-bg">{t("save")}</button>
          {msg.profile && <span role="status" className="text-sm text-accent">{msg.profile}</span>}
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold">{t("security")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm"><span className="text-muted">{t("pwCurrent")}</span><input type="password" className={field} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></label>
          <label className="grid gap-1 text-sm"><span className="text-muted">{t("pwNew")}</span><input type="password" className={field} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" minLength={10} /></label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={changePw} disabled={!pw.current || pw.next.length < 10} className="h-11 rounded-md bg-ink px-5 text-sm font-bold text-bg disabled:opacity-40">{t("pwChange")}</button>
          {msg.pw && <span role="status" className="text-sm text-accent">{msg.pw}</span>}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <p className="text-sm text-muted">{t("sessions", { n: d.sessions })}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={logout} className="h-11 rounded-md border border-line px-5 text-sm font-bold hover:border-ink">{n("signOut")}</button>
            <button onClick={logoutAll} className="h-11 rounded-md border border-line px-5 text-sm font-bold hover:border-ink">{t("logoutAll")}</button>
          </div>
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold">{t("privacy")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("privacyText")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/api/account?export=1" className="inline-flex h-11 items-center rounded-md border border-line px-5 text-sm font-bold hover:border-ink">{t("export")}</a>
          <Link href="/legal/privacy" className="inline-flex h-11 items-center rounded-md border border-line px-5 text-sm font-bold hover:border-ink">{t("privacyPolicy")}</Link>
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="font-bold text-red-600">{t("delete")}</h3>
          <p className="mt-1 text-sm text-muted">{t("deleteText")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input type="password" placeholder={t("pwCurrent")} className={`${field} max-w-xs`} value={del} onChange={(e) => setDel(e.target.value)} autoComplete="current-password" />
            <button onClick={deleteAccount} disabled={!del} className="h-11 rounded-md border border-red-500 px-5 text-sm font-bold text-red-600 disabled:opacity-40">{t("deleteBtn")}</button>
            {msg.del && <span role="alert" className="text-sm text-red-600">{msg.del}</span>}
          </div>
        </div>
      </section>
      </>}
    </div>
  );
}

// Learning statistics from the synced account data
function collect() {
  const srs = readSrs();
  const { streak, todayCount } = stats();
  const ac = readProgress();
  const plan = readPlan();
  const tr = plan ? TRACKS.find((x) => x.id === plan.track) : null;
  const k0 = readJSON<{ pos: number; deleted?: boolean } | null>("tf:khatm", null);
  const khatm = k0 && !k0.deleted ? k0 : null;
  const vocab = readJSON<Record<string, { box: number }>>("tf:vocab", {});
  const taj = readJSON<Record<string, number>>("tf:tajweed", {});
  const tajVals = Object.values(taj);
  return {
    streak: Math.max(streak, streakOf(ac)), todayCount,
    xp: ac.xp, level: levelOf(ac.xp), lessons: Object.values(ac.done).filter((x) => x >= PASS).length,
    inReview: Object.keys(srs).length, secured: Object.values(srs).filter((x) => x.stage >= 3).length,
    plan: plan && tr ? { day: Math.min(365, dayOfPlan(plan)), track: tr.id, learned: Object.values(plan.done).reduce((a, b) => a + b, 0), goal: cumulative(tr, 365) } : null,
    khatm: khatm ? Math.round((khatm.pos / TOTAL_VERSES) * 100) : null,
    vocab: Object.values(vocab).filter((x) => x.box >= 3).length, vocabTotal: VOCAB_DECKS.reduce((n, d) => n + d.words.length, 0),
    tajweedDone: tajVals.filter((x) => x >= 70).length, tajweedAvg: tajVals.length ? Math.round(tajVals.reduce((a, b) => a + b, 0) / tajVals.length) : null,
    bookmarks: readJSON<string[]>("tf:bookmarks", []).length, notes: Object.keys(readJSON<Record<string, unknown>>("tf:notes", {})).length, mnemos: Object.keys(readJSON<Record<string, string>>("tf:mnemo", {})).length,
    weak: weakestVerses(5, srs).filter((w) => w.strength < 0.8),
  };
}
