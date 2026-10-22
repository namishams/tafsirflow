"use client";
import SupportNudge from "@/components/SupportNudge";
import { useEffect, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { startSync, stopSync } from "@/lib/sync";
import { clearDeviceOnly } from "@/lib/sisters/state";
import { countryName } from "@/lib/countries";
import { careerText, type CwKey } from "@/lib/careerWeb";
import { TIERS, type TierId } from "@/lib/career";
import { dueVerses, readSrs, stats } from "@/lib/learning";
import { dailyGoal, levelOf, readProgress, streakOf } from "@/lib/academy";
import { TRACKS, dayOfPlan, newPerDay, portion, readPlan } from "@/lib/plans";
import { readJSON } from "@/lib/storage";
import TierEmblem from "@/components/stats/TierEmblem";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ConfirmCode from "@/components/auth/ConfirmCode";
import Segmented from "@/components/ui/Segmented";

// labels added with the mobile-first rework (owner 22.10.2026); other languages fall back to English
const EXTRA: Record<string, { progress: string; community: string; proOn: string; proOnText: string; proOff: string; proOffText: string; proCta: string; proManage: string }> = {
  en: { progress: "Learning", community: "Community", proOn: "PRO is active", proOnText: "Thank you for supporting Quran Masterclass. All PRO features are unlocked on this account.", proOff: "Quran Masterclass PRO", proOffText: "The website stays free. PRO adds extras in the app and supports the project.", proCta: "Learn more", proManage: "Details" },
  de: { progress: "Lernen", community: "Gemeinschaft", proOn: "PRO ist aktiv", proOnText: "Danke, dass Sie Quran Masterclass unterstützen. Alle PRO-Funktionen sind für dieses Konto freigeschaltet.", proOff: "Quran Masterclass PRO", proOffText: "Die Website bleibt kostenlos. PRO ergänzt Extras in der App und unterstützt das Projekt.", proCta: "Mehr erfahren", proManage: "Details" },
  ar: { progress: "التعلّم", community: "المجتمع", proOn: "اشتراك PRO مفعّل", proOnText: "شكرًا لدعمكم Quran Masterclass. جميع ميزات PRO مفعّلة لهذا الحساب.", proOff: "Quran Masterclass PRO", proOffText: "يبقى الموقع مجانيًا. يضيف PRO ميزات في التطبيق ويدعم المشروع.", proCta: "اعرف المزيد", proManage: "التفاصيل" },
};

// The signed-in account page (owner 22.10.2026): a member dashboard instead of four buttons. The server renders this
// shell with the account's name at once; every card shows a skeleton until its data arrives and an empty state when
// there is none. Data: the device's learning record (streak, due reviews, plan), /api/community/me (profile),
// /api/community/stats/<username> (career, Sijill, world rank), /api/together/pulse, /api/messenger/unread and
// /api/app/store (PRO, frame). `demo` (dev only, ?demo=1) fills every card with sample data for screenshots.

export type DashUser = { name: string | null; email: string; emailVerified: boolean; role: "user" | "admin"; plan: string };

type Profile = { username: string; name: string; country: string | null; avatar: string | null; founder: boolean; pro: boolean; badge: unknown };
type Stats = {
  memberSince: string | null;
  career: { tier: TierId; division: number; into: number; level: { level: number; xp: number; into: number; need: number } } | null;
  ranks: Record<string, { rank: number | null; pct: number | null; total: number }> | null;
  sijill: { memorised?: { verses: number }; hifz?: { verses: number }; tree?: { stage: number; trees: number; name: string }; stickers?: { total: number; catalog: number } };
};
type Local = { streak: number; due: number; learned: number; xp: number; level: number; todayXp: number; goal: number; plan: { day: number; perDay: number; next: string | null; done: boolean } | null; last: string | null };
type Data = { profile: Profile | null | undefined; stats: Stats | null | undefined; unread: number | null; circles: number | null; frame: boolean; pro: boolean; local: Local | null };

const DEMO: Data = {
  profile: { username: "amina.k", name: "Amina Karimi", country: "DE", avatar: null, founder: true, pro: true, badge: null },
  stats: {
    memberSince: "2025-03-01",
    career: { tier: "gold", division: 2, into: 0.62, level: { level: 14, xp: 18420, into: 640, need: 750 } },
    ranks: { xp: { rank: 1284, pct: 4, total: 31000 } },
    sijill: { memorised: { verses: 412 }, tree: { stage: 5, trees: 2, name: "Sidra" }, stickers: { total: 38, catalog: 120 } },
  },
  unread: 3, circles: 2, frame: true, pro: true,
  local: { streak: 27, due: 12, learned: 412, xp: 18420, level: 14, todayXp: 85, goal: 150, plan: { day: 63, perDay: 4, next: "2:255", done: false }, last: "2:250" },
};

function readLocal(): Local {
  const srs = readSrs();
  const st = stats();
  const ac = readProgress();
  const plan = readPlan();
  const tr = plan ? TRACKS.find((x) => x.id === plan.track) : null;
  let p: Local["plan"] = null;
  if (plan && tr) {
    const day = dayOfPlan(plan);
    const part = portion(tr, day);
    const d = Math.floor(Date.now() / 86400000);
    p = { day, perDay: newPerDay(tr, day), next: part[0] ? `${part[0].s}:${part[0].v}` : null, done: (plan.done[d] ?? 0) > 0 };
  }
  const last = readJSON<{ chapter: number; verse: number } | null>("tf:last", null);
  return {
    streak: Math.max(st.streak, streakOf(ac)), due: dueVerses(srs).length, learned: Object.keys(srs).length,
    xp: ac.xp, level: levelOf(ac.xp), todayXp: ac.days[Math.floor(Date.now() / 86400000)] ?? 0, goal: dailyGoal(ac),
    plan: p, last: last ? `${last.chapter}:${last.verse}` : null,
  };
}

const getJson = <T,>(url: string): Promise<T | null> => fetch(url, { cache: "no-store" }).then((r) => (r.ok ? (r.json() as Promise<T>) : null)).catch(() => null);

export default function AccountDashboard({ user, demo = false, verifiedNow = false }: { user: DashUser; demo?: boolean; verifiedNow?: boolean }) {
  const t = useTranslations("dashboard");
  const ta = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();
  const cw = careerText(locale);
  const nf = new Intl.NumberFormat(locale);
  const [d, setD] = useState<Data>(demo ? DEMO : { profile: undefined, stats: undefined, unread: null, circles: null, frame: false, pro: user.plan === "premium", local: null });
  const [resent, setResent] = useState(false);
  const [byCode, setByCode] = useState(false);
  const [tab, setTab] = useState<"progress" | "community">("progress");
  const x = EXTRA[locale] ?? EXTRA.en;

  useEffect(() => {
    if (demo) return;
    let live = true;
    const set = (p: Partial<Data>) => { if (live) setD((x) => ({ ...x, ...p })); };
    set({ local: readLocal() });
    const onSync = () => set({ local: readLocal() });
    window.addEventListener("tf-synced", onSync);
    void startSync().then((ok) => { if (ok) onSync(); });
    getJson<{ profile: Profile | null }>("/api/community/me").then((r) => {
      const profile = r?.profile ?? null;
      set({ profile });
      if (!profile) { set({ stats: null }); return; }
      getJson<{ stats: Stats | "restricted" | null }>(`/api/community/stats/${encodeURIComponent(profile.username)}?locale=${locale}`)
        .then((s) => set({ stats: s && s.stats && s.stats !== "restricted" ? s.stats : null }));
    });
    getJson<{ inbox: number; requests: number }>("/api/messenger/unread").then((u) => set({ unread: u ? (u.inbox ?? 0) + (u.requests ?? 0) : null }));
    getJson<{ circles: unknown[] }>("/api/together/pulse").then((p) => set({ circles: p ? p.circles?.length ?? 0 : null }));
    getJson<{ me: { pro: boolean; frame: string | null } | null }>("/api/app/store").then((s) => { if (s?.me) set({ pro: s.me.pro, frame: !!s.me.frame }); });
    return () => { live = false; window.removeEventListener("tf-synced", onSync); };
  }, [demo, locale]);

  const logout = async () => {
    if (demo) return;
    await fetch("/api/auth/logout", { method: "POST" });
    stopSync();
    clearDeviceOnly();
    window.dispatchEvent(new Event("tf-auth"));
    router.refresh();
  };
  const resend = async () => {
    await fetch("/api/auth/resend", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ locale }) });
    setResent(true);
  };

  const prof = d.profile;
  const st = d.stats;
  const loc = d.local;
  const name = prof?.name || user.name || user.email.split("@")[0];
  const career = st?.career ?? null;
  const level = career?.level.level ?? loc?.level ?? null;
  const xp = career?.level.xp ?? loc?.xp ?? null;
  const verses = st?.sijill.memorised?.verses ?? st?.sijill.hifz?.verses ?? loc?.learned ?? null;
  const rank = st?.ranks?.xp ?? null;
  const tree = st?.sijill.tree ?? null;
  const stickers = st?.sijill.stickers ?? null;
  const since = st?.memberSince ? new Date(st.memberSince).toLocaleDateString(locale, { month: "long", year: "numeric" }) : null;
  const statsLoading = !demo && (prof === undefined || (prof !== null && st === undefined));
  const initials = name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const tierName = career && (TIERS as readonly string[]).includes(career.tier) ? cw[`tier_${career.tier}` as CwKey] : null;
  const nextHref = loc?.plan?.next ? "/shams/next" : loc?.last ? `/quran/${loc.last.split(":")[0]}` : "/today";

  return (
    <div className="min-h-[100dvh] bg-bg">
      <header className="stage pattern relative overflow-hidden text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="font-display text-[17px] font-semibold tracking-tight text-[#e9cf99]">Quran Masterclass</Link>
          <div className="flex items-center gap-2 text-ink"><LanguageSwitcher /></div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 sm:px-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#e9cf99]">{t("eyebrow")}</p>
          <h1 className="mt-2 font-display text-[30px] font-semibold leading-tight sm:text-[38px]">
            {t("welcome")} <span className="text-[#e9cf99]">{name.split(" ")[0]}</span>
          </h1>
          <p className="mt-2 max-w-xl text-[15px] text-white/75">{t("lead")}</p>
          {demo && <span className="mt-3 inline-block rounded-full border border-white/30 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/80">{t("demo")}</span>}
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-16 grid grid-cols-1 max-w-6xl gap-5 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 content-start gap-5">
          {!demo && <SupportNudge variant="dashboard" />}
          {/* header card */}
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-5">
              <div className={`relative shrink-0 rounded-full p-[3px] ${d.frame ? "bg-[conic-gradient(from_200deg,#f3e2b3,#c6a65e,#8a6a2c,#e9cf99,#f3e2b3)]" : "bg-[linear-gradient(135deg,#e9cf99,#c6a65e)]"}`}>
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-surface bg-accent-soft font-display text-2xl font-semibold text-accent">
                  {prof?.avatar ? <img src={prof.avatar} alt="" className="h-full w-full object-cover" /> : initials}
                </div>
                {level !== null && <span className="absolute -bottom-1 end-0 rounded-full border-2 border-surface bg-accent px-2 py-0.5 text-[11px] font-bold tabular-nums text-white">{level}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-display text-[22px] font-semibold leading-tight text-ink">{name}</h2>
                  {prof?.founder && <Pill tone="gold">{t("founder")}</Pill>}
                  {(d.pro || prof?.pro) && <Pill tone="emerald">PRO</Pill>}
                  {user.role === "admin" && <Pill tone="line">Admin</Pill>}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-muted">
                  {prof ? <span>@{prof.username}</span> : prof === undefined && !demo ? <Bone w="w-24" /> : <span>{user.email}</span>}
                  {prof?.country && <span className="inline-flex items-center gap-1.5"><span className="rounded border border-line px-1 text-[10.5px] font-bold tracking-wide text-ink">{prof.country}</span>{countryName(prof.country, locale)}</span>}
                  {since && <span>{t("memberSince", { date: since })}</span>}
                </p>
                {career && tierName && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 w-28 overflow-hidden sm:w-40 rounded-full bg-line"><div className="h-full rounded-full bg-[linear-gradient(90deg,#c6a65e,#e9cf99)]" style={{ width: `${Math.round(career.into * 100)}%` }} /></div>
                    <span className="whitespace-nowrap text-[12.5px] font-semibold text-ink">{tierName}{career.division ? ` ${["", "I", "II", "III"][career.division]}` : ""}</span>
                  </div>
                )}
              </div>
              {career && <div className="hidden sm:block"><TierEmblem tier={career.tier} division={career.division} size={72} progress={career.into} /></div>}
            </div>
            {prof === null && !demo && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-line bg-bg/60 p-4">
                <p className="text-[13.5px] text-muted">{t("noProfile")}</p>
                <Link href="/profile" className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-[13px] font-semibold text-white hover:brightness-110">{t("profileCreate")}</Link>
              </div>
            )}
          </Card>

          {verifiedNow && user.emailVerified && <p role="status" className="rounded-xl border border-accent/30 bg-accent-soft p-4 text-sm text-ink">{ta("verifiedOk")}</p>}
          {!user.emailVerified && !demo && (
            <Card className="border-accent/30 bg-accent-soft p-5 text-sm">
              <p className="text-ink">{ta("verifyNeeded", { email: user.email })}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                <button onClick={resend} disabled={resent} className="font-semibold text-accent hover:underline disabled:opacity-60">{resent ? ta("resent") : ta("resend")}</button>
                {!byCode && <button onClick={() => setByCode(true)} className="font-semibold text-accent hover:underline">{t("verifyByCode")}</button>}
              </div>
              {byCode && <div className="mt-3 max-w-sm"><ConfirmCode email={user.email} onConfirmed={() => router.refresh()} /></div>}
            </Card>
          )}

          {/* quick actions */}
          <Card>
            <CardHead title={t("quick")} />
            <div className="grid grid-cols-3 gap-1 p-2 sm:grid-cols-5 sm:gap-2 sm:p-3">
              <Quick href="/today" icon={<IcBook />} label={t("qLearn")} />
              <Quick href="/garden" icon={<IcLeaf />} label={t("qGarden")} />
              <Quick href="/messages" icon={<IcSend />} label={t("qMessages")} badge={d.unread} />
              <Quick href="/profile" icon={<IcUser />} label={t("qProfile")} />
              <Quick href="/ranking" icon={<IcTrophy />} label={t("qRanking")} />
              <Quick href="/together" icon={<IcUsers />} label={t("qCircles")} hint={d.circles ? t("circles", { n: d.circles }) : undefined} />
              <Quick href="/assistant" icon={<IcChat />} label={t("qTutor")} />
              <Quick href="/support" icon={<IcHeart />} label={t("qSupport")} />
              <Quick href="/app" icon={<IcPhone />} label={t("qApp")} />
            </div>
          </Card>
          {/* today */}
          <Card>
            <CardHead title={t("today")} action={loc && <span className="text-[12px] font-medium text-muted tabular-nums">{t("todayXp", { xp: nf.format(loc.todayXp), goal: nf.format(loc.goal) })}</span>} />
            <div className="grid grid-cols-2 gap-px overflow-hidden bg-line sm:grid-cols-3">
              <TodayCell label={t("nextVerse")} loading={!loc} value={loc?.plan?.next ?? loc?.last ?? "–"} sub={loc?.plan ? t("planDay", { day: loc.plan.day, n: loc.plan.perDay }) : t("noPlan")} />
              <TodayCell label={t("due")} loading={!loc} value={loc ? nf.format(loc.due) : ""} sub={loc && loc.due > 0 ? t("dueSome") : t("dueNone")} accent={!!loc && loc.due > 0} />
              <TodayCell label={t("plan")} loading={!loc} value={loc?.plan ? (loc.plan.done ? t("planDone") : t("planOpen", { n: loc.plan.perDay })) : t("planNone")} sub={loc?.plan ? "" : t("planHint")} small />
            </div>
            {loc && <div className="h-1 bg-line"><div className="h-full bg-accent transition-all" style={{ width: `${Math.min(100, Math.round((loc.todayXp / Math.max(1, loc.goal)) * 100))}%` }} /></div>}
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <p className="text-[13px] text-muted">{loc && loc.due > 0 ? t("ctaReview", { n: nf.format(loc.due) }) : t("ctaHint")}</p>
              <Link href={nextHref} className="btn-gold inline-flex h-11 items-center gap-2 rounded-lg px-5 text-[14px] font-bold">{t("continue")}<IcArrow /></Link>
            </div>
          </Card>

          {/* progress in two views, with the segmented control of the surah list */}
          <section className="grid gap-3">
            <Segmented full label={`${x.progress} / ${x.community}`} value={tab} onChange={setTab} options={[{ id: "progress", label: x.progress }, { id: "community", label: x.community }]} />
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {tab === "progress" ? <>
                <Stat label={t("statStreak")} icon={<IcFlame />} tone="gold" loading={!loc} value={loc ? nf.format(loc.streak) : ""} sub={t("days")} />
                <Stat label={t("statVerses")} icon={<IcBook />} loading={!loc && statsLoading} value={verses !== null ? nf.format(verses) : "–"} sub={t("verses")} />
                <Stat label={t("statLevel")} icon={<IcStar />} loading={level === null && (statsLoading || !loc)} value={level !== null ? nf.format(level) : "–"} sub={xp !== null ? `${nf.format(xp)} XP` : ""} />
              </> : <>
                <Stat label={t("statRank")} icon={<IcGlobe />} tone="gold" loading={statsLoading} value={rank?.rank ? `#${nf.format(rank.rank)}` : "–"} sub={rank?.pct ? t("rankTop", { pct: nf.format(rank.pct) }) : t("rankNone")} />
                <Stat label={t("statGarden")} icon={<IcLeaf />} loading={statsLoading} value={tree ? t("stage", { n: tree.stage }) : "–"} sub={tree ? (tree.trees > 1 ? t("trees", { n: tree.trees }) : tree.name || t("gardenGrowing")) : t("gardenNone")} />
                <Stat label={t("statStickers")} icon={<IcSticker />} loading={statsLoading} value={stickers ? nf.format(stickers.total) : "–"} sub={stickers ? t("ofTotal", { total: nf.format(stickers.catalog) }) : t("stickersNone")} />
              </>}
            </div>
          </section>

        </div>

        {/* account sidebar */}
        <aside className="grid min-w-0 content-start gap-5">
          {/* PRO status */}
          <Card className={`p-5 ${d.pro || prof?.pro ? "border-[#c6a65e]/50" : ""}`}>
            <div className="flex items-start gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${d.pro || prof?.pro ? "bg-[#f6ecd2] text-[#8a6a2c] dark:bg-[#3a2f17] dark:text-[#e9cf99]" : "bg-accent-soft text-accent"}`}><IcStar /></span>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-ink">{d.pro || prof?.pro ? x.proOn : x.proOff}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{d.pro || prof?.pro ? x.proOnText : x.proOffText}</p>
                <Link href="/premium" className="mt-2 inline-flex text-[13px] font-semibold text-accent hover:underline">{d.pro || prof?.pro ? x.proManage : x.proCta}</Link>
              </div>
            </div>
          </Card>
          <Card>
            <CardHead title={t("accountTitle")} />
            <div className="px-5 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{t("email")}</p>
              <p className="mt-1 break-all text-[14px] font-medium text-ink">{user.email}</p>
              <p className={`mt-1 text-[12px] font-medium ${user.emailVerified ? "text-accent" : "text-[rgb(var(--gold))]"}`}>{user.emailVerified ? t("verified") : t("unverified")}</p>
            </div>
            <nav className="mt-2 border-t border-line py-1">
              <Row href="/account/security" icon={<IcShield />} label={t("security")} />
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="flex items-center gap-3 text-[14px] font-medium text-ink"><span className="text-muted"><IcGlobe /></span>{t("language")}</span>
                <LanguageSwitcher />
              </div>
              <Row href="/legal/privacy" icon={<IcLock />} label={t("privacy")} />
              {user.role === "admin" && <Row href="/admin" icon={<IcStar />} label="Admin" />}
            </nav>
            <div className="border-t border-line p-4">
              <button onClick={logout} className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-line text-[13.5px] font-semibold text-ink transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30">{t("signOut")}</button>
            </div>
          </Card>
          {user.emailVerified && (
            <Card className="p-5">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-ink"><span className="h-2 w-2 rounded-full bg-accent" />{t("syncTitle")}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{ta("syncOn")}</p>
            </Card>
          )}
        </aside>
      </main>
    </div>
  );
}

function Card({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(6_60_44/0.12)] ${className}`}>{children}</section>;
}
function CardHead({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5"><h3 className="text-[14px] font-bold text-ink">{title}</h3>{action}</div>;
}
function Bone({ w, h = "h-3.5" }: { w: string; h?: string }) {
  return <span className={`inline-block animate-pulse rounded bg-line ${w} ${h}`} />;
}
function Pill({ tone, children }: { tone: "gold" | "emerald" | "line"; children: ReactNode }) {
  const c = tone === "gold" ? "border-[#c6a65e]/50 bg-[#f6ecd2] text-[#6b4f17] dark:bg-[#3a2f17] dark:text-[#e9cf99]" : tone === "emerald" ? "border-accent/30 bg-accent-soft text-accent" : "border-line text-muted";
  return <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${c}`}>{children}</span>;
}
function Stat({ label, value, sub, icon, tone = "emerald", loading }: { label: string; value: ReactNode; sub?: string; icon: ReactNode; tone?: "emerald" | "gold"; loading?: boolean }) {
  return (
    <Card className="min-w-0 p-3 sm:p-5">
      <div className="flex flex-col-reverse items-start gap-2 sm:flex-row sm:justify-between">
        <p className="text-[10.5px] font-bold uppercase leading-tight tracking-wider text-muted [overflow-wrap:anywhere] rtl:tracking-normal">{label}</p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone === "gold" ? "bg-[#f6ecd2] text-[#8a6a2c] dark:bg-[#3a2f17] dark:text-[#e9cf99]" : "bg-accent-soft text-accent"}`}>{icon}</span>
      </div>
      {loading ? <div className="mt-3 grid gap-2"><Bone w="w-16" h="h-7" /><Bone w="w-20" h="h-3" /></div> : (
        <>
          <p className="mt-2.5 truncate font-display text-[21px] font-semibold leading-none tabular-nums text-ink sm:text-[26px]">{value}</p>
          {sub && <p className="mt-1.5 truncate text-[11.5px] text-muted sm:text-[12px]">{sub}</p>}
        </>
      )}
    </Card>
  );
}
function TodayCell({ label, value, sub, loading, accent, small }: { label: string; value: string; sub?: string; loading?: boolean; accent?: boolean; small?: boolean }) {
  return (
    <div className="min-w-0 bg-surface p-4 last:col-span-2 sm:p-5 sm:last:col-span-1">
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted">{label}</p>
      {loading ? <div className="mt-3"><Bone w="w-20" h="h-6" /></div> : (
        <>
          <p className={`mt-2 font-display font-semibold tabular-nums ${small ? "text-[17px] leading-snug" : "text-[24px] leading-none"} ${accent ? "text-accent" : "text-ink"}`}>{value}</p>
          {sub && <p className="mt-1.5 text-[12px] text-muted">{sub}</p>}
        </>
      )}
    </div>
  );
}
function Quick({ href, icon, label, badge, hint }: { href: string; icon: ReactNode; label: string; badge?: number | null; hint?: string }) {
  return (
    <Link href={href} className="group relative flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-xl border border-transparent p-2 text-center transition hover:border-line hover:bg-bg">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent transition group-hover:bg-accent group-hover:text-white">{icon}</span>
      <span className="min-w-0 max-w-full">
        <span className="block text-[12.5px] font-semibold leading-tight text-ink [overflow-wrap:anywhere]">{label}</span>
        {hint && <span className="block truncate text-[11px] text-muted">{hint}</span>}
      </span>
      {badge ? <span className="absolute end-2 top-2 min-w-[20px] rounded-full border-[1.5px] border-[#E2C77F] bg-[rgb(196,43,52)] px-1.5 text-center text-[11px] font-bold leading-[17px] text-white">{badge > 99 ? "99+" : badge}</span> : null}
    </Link>
  );
}
function Row({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 px-5 py-3 text-[14px] font-medium text-ink transition hover:bg-bg">
      <span className="flex items-center gap-3"><span className="text-muted">{icon}</span>{label}</span>
      <span className="text-muted rtl:rotate-180"><IcChevron /></span>
    </Link>
  );
}

const S = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
const IcFlame = () => <svg {...S}><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.6 1 2.6 2 3 0-3 .5-5.5.5-8z" /></svg>;
const IcBook = () => <svg {...S}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></svg>;
const IcStar = () => <svg {...S}><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1-4.5-4.2 6.1-.8z" /></svg>;
const IcGlobe = () => <svg {...S}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>;
const IcLeaf = () => <svg {...S}><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" /><path d="M5 19 13 11" /></svg>;
const IcSticker = () => <svg {...S}><path d="M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6z" /><path d="M20 12a8 8 0 0 0-8 8" /></svg>;
const IcArrow = () => <svg {...S} width={16} height={16} className="rtl:rotate-180"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const IcChevron = () => <svg {...S} width={16} height={16}><path d="m9 6 6 6-6 6" /></svg>;
const IcSend = () => <svg {...S}><path d="M21.5 3 3 10.2l7.4 3.1L21.5 3z" /><path d="M21.5 3 15 21l-4.6-7.7" /></svg>;
const IcUser = () => <svg {...S}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
const IcTrophy = () => <svg {...S}><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6" /></svg>;
const IcUsers = () => <svg {...S}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></svg>;
const IcChat = () => <svg {...S}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>;
const IcHeart = () => <svg {...S}><path d="M12 20s-7.5-4.6-9-9.3C2 7.3 4.2 4.5 7.3 4.5c2 0 3.4 1.1 4.7 2.8 1.3-1.7 2.7-2.8 4.7-2.8 3.1 0 5.3 2.8 4.3 6.2C19.5 15.4 12 20 12 20z" /></svg>;
const IcPhone = () => <svg {...S}><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M11 18.5h2" /></svg>;
const IcShield = () => <svg {...S}><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z" /><path d="m9 12 2 2 4-4" /></svg>;
const IcLock = () => <svg {...S}><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></svg>;
