"use client";
// mirrors mobile/src/features/shams2/Guide.tsx: onboarding to the principles (/shams/welcome), the method handbook
// with the grades and the glossary of terms (/shams/handbook) and the weekly review, Murājaʿat al-Usbūʿ (/shams/week).
import { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { intlLocale } from "@/lib/learn/i18n";
import { useStored, writeJSON } from "@/lib/learn/store";
import { GRADES } from "@/lib/learn/shams2/grades";
import { HANDBOOK, PRINCIPLES } from "@/lib/learn/shams2/handbook";
import { useShams2 } from "@/lib/learn/shams2/model";
import { saveSettings, useLog } from "@/lib/learn/shams2/store";
import { useS2 } from "@/lib/learn/shams2/text";
import { saveWeekSnapshot, weekReview } from "@/lib/learn/shams2/week";
import { weakSpots } from "@/lib/learn/shams2/weakSpots";
import { Card, GoldButton, LearnHero, LearnMain, Stats } from "@/components/learn/ui";
import { IconCheckCircle, IconEye, IconFlag } from "@/components/Icons";
import { Chip, Fold, Glossary, Live, SmallBtn, SourceNote, Term, useBack, useNames } from "./ui";
import { ContinueNext } from "./Continue";
import { AdabPillarCard } from "./Adab";

const ONBOARDED = "qmc.shams2.onboarded.v1";
export const useOnboarded = () => !!useStored<number | null>(ONBOARDED, null);

/** principles one by one, then the daily time; never preselected */
export function WelcomeScreen() {
  const { s, cl, nf } = useS2();
  const router = useRouter();
  const [i, setI] = useState(0);
  const [mins, setMins] = useState<number | null>(null);
  const last = i >= PRINCIPLES.length;
  const p = PRINCIPLES[Math.min(i, PRINCIPLES.length - 1)];
  const total = PRINCIPLES.length + 1;
  const finish = () => { if (mins) saveSettings({ minutes: mins }); writeJSON(ONBOARDED, Date.now()); router.replace("/shams/method"); };
  return (
    <>
      <LearnHero back={useBack()} kicker={s("eyebrow")} title={s("welcomeTitle")} lead={s("welcomeLead")} word="منهج شمس" uid="s2o" />
      <LearnMain className="grid gap-5">
        <div className="flex gap-1" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={Math.min(i + 1, total)} aria-label={s("stepOf", { i: nf(Math.min(i + 1, total)), n: nf(total) })}>
          {Array.from({ length: total }, (_, k) => <span key={k} className={`h-1 flex-1 rounded-full ${k <= i ? "bg-[rgb(var(--hm-gold))]" : "bg-[rgb(var(--line))]"}`} />)}
        </div>
        {!last ? (
          <>
            <Card key={p.id} className="grid gap-3">
              <p lang="ar" dir="rtl" className="font-arabic text-start text-[26px] leading-[1.7] text-[rgb(var(--hm-gold-d))]">{p.ar}</p>
              <h2 className="font-display text-[24px] leading-tight">{p.title[cl]}</h2>
              <p className="text-[16px] leading-relaxed">{p.body[cl]}</p>
              <SourceNote src={p.src} review={{ status: "draft" }} />
            </Card>
            <div className="flex flex-wrap gap-2">
              {i > 0 && <SmallBtn onClick={() => setI(i - 1)}>{s("back")}</SmallBtn>}
              <GoldButton onClick={() => setI(i + 1)}>{s("next")}</GoldButton>
            </div>
          </>
        ) : (
          <>
            <Card className="grid gap-3">
              <h2 className="font-display text-[24px]">{s("welcomeTime")}</h2>
              <p className="text-[15px] leading-relaxed text-muted">{s("welcomeTimeLead")}</p>
              <div className="flex flex-wrap gap-1.5">{[10, 20, 30, 45, 60, 90].map((m) => <Chip key={m} label={s("minN", { n: nf(m) })} on={mins === m} onClick={() => setMins(m)} />)}</div>
              <GoldButton className="w-fit" disabled={!mins} onClick={finish}>{s("welcomeStart")}</GoldButton>
            </Card>
            <SmallBtn onClick={() => setI(i - 1)}>{s("back")}</SmallBtn>
          </>
        )}
      </LearnMain>
    </>
  );
}

export function HandbookScreen() {
  const { s, cl, nf } = useS2();
  return (
    <>
      <LearnHero back={useBack()} kicker={s("eyebrow")} title={s("handbookTitle")} lead={s("handbookLead")} word="دليل المنهج" uid="s2h" />
      <LearnMain className="grid gap-6">
        <nav aria-label={s("handbookTitle")} className="flex flex-wrap gap-2 text-[13.5px] font-semibold">
          {[["principles", s("principles")], ["practice", s("practice")], ["darajat", s("darajatTitle")], ["glossary", s("glossary")]].map(([id, l]) => (
            <a key={id} href={`#${id}`} className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-3 hover:border-[rgb(var(--hm-gold))]/70">{l}</a>
          ))}
        </nav>
        <section id="principles" className="grid scroll-mt-20 gap-2.5">
          <h2 className="font-display text-[24px]">{s("principles")}</h2>
          {PRINCIPLES.map((p) => (
            <Fold key={p.id} ar={p.ar} title={p.title[cl]}>
              <p className="text-[15px] leading-relaxed">{p.body[cl]}</p>
              <SourceNote src={p.src} review={{ status: "draft" }} />
            </Fold>
          ))}
        </section>
        <section id="practice" className="grid scroll-mt-20 gap-2.5">
          <h2 className="font-display text-[24px]">{s("practice")}</h2>
          {HANDBOOK.map((c) => (
            <Fold key={c.id} title={c.title[cl]}>
              <p className="whitespace-pre-line text-[15px] leading-relaxed">{c.body[cl]}</p>
              <SourceNote src={c.src} review={{ status: "draft" }} />
            </Fold>
          ))}
        </section>
        <AdabPillarCard />
        <section id="darajat" className="grid scroll-mt-20 gap-2.5">
          <h2 className="font-display text-[24px]">{s("darajatTitle")}</h2>
          <Card className="grid gap-2">
            <ol className="grid gap-1.5">
              {GRADES.map((g) => (
                <li key={g.n} className="flex flex-wrap items-baseline gap-2">
                  <span className="min-w-4 text-[12.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{nf(g.n)}</span>
                  <span lang="ar" dir="rtl" className="font-arabic text-[17px] leading-[1.7]">{g.ar}</span>
                  <span className="min-w-0 flex-1 text-[13px] text-muted">{`${g.tr} · ${s(`prompt_${g.prompt}` as never)} · ${nf(Math.round(g.wordPass * 100))} %`}</span>
                </li>
              ))}
            </ol>
            <SmallBtn href="/shams/darajat">{s("darajatOpen")}</SmallBtn>
          </Card>
        </section>
        <Glossary open id="glossary" />
        <div className="flex flex-wrap gap-2">
          <SmallBtn href="/shams/welcome">{s("welcomeAgain")}</SmallBtn>
          <SmallBtn href="/shams/week">{s("weekTitle")}</SmallBtn>
          <SmallBtn href="/shams/method">{s("hubTitle")}</SmallBtn>
        </div>
      </LearnMain>
    </>
  );
}

function WeekBody() {
  const { s, nf, lang } = useS2();
  const { name } = useNames();
  const m = useShams2();
  const log = useLog();
  const practice = useStored<Record<string, number>>("tf:days", {});
  useEffect(() => { saveWeekSnapshot(m.day, { overall: m.q.overall, count: m.q.count }); }, [m.day, m.q.overall, m.q.count]);
  const r = useMemo(() => weekReview({ day: m.day, log, practice, known: m.known, surahs: m.q.surahs, overall: m.q.overall, count: m.q.count, gs: m.gs, weak: weakSpots(m.known, m.words, m.mut), due: m.due, manzilVerses: m.wird.manzil.verses }), [m, log, practice]);
  const fmt = (p?: Record<string, string | number>) => (p ? Object.fromEntries(Object.entries(p).map(([k, v]) => [k, k === "s" ? name(Number(v)) : typeof v === "number" ? nf(v) : v])) : undefined);
  const wd = (d: number) => { try { return new Date(d * 86400000).toLocaleDateString(intlLocale(lang), { weekday: "short" }); } catch { return ""; } };
  return (
    <div className="grid gap-5">
      <ol className="flex justify-between gap-1.5">
        {r.days.map((d) => (
          <li key={d.day} className="grid flex-1 justify-items-center gap-1" aria-label={`${wd(d.day)}: ${s("blocksDone", { n: nf(d.blocks) })}`}>
            <span className="h-8 w-8 rounded-full" style={{ background: d.blocks === 3 ? "rgb(var(--hm-gold))" : d.blocks ? "rgb(var(--accent))" : d.verses ? "rgb(var(--accent-soft))" : "rgb(var(--line))", opacity: d.blocks && d.blocks < 3 ? 0.55 + d.blocks * 0.15 : 1 }} />
            <span aria-hidden className="text-[11.5px] text-muted">{wd(d.day)}</span>
          </li>
        ))}
      </ol>
      <Stats className="!grid-cols-2 sm:!grid-cols-3" items={[
        { n: `${nf(r.active)}/${nf(7)}`, l: s("wk_active") },
        { n: nf(r.newVerses), l: s("wk_new") },
        { n: nf(r.reviewed), l: s("wk_reviewed") },
        { n: `${nf(r.manzilDays)}/${nf(7)}`, l: s("wk_manzil") },
        { n: m.q.overall === null ? "–" : `${nf(m.q.overall)}${r.delta !== null ? ` (${r.delta >= 0 ? "+" : "−"}${nf(Math.abs(r.delta))})` : ""}`, l: s("overall") },
        { n: `${nf(r.tests.pass)}/${nf(r.tests.total)}`, l: s("wk_tests") },
      ]} />
      <h2 className="font-display text-[24px]">{s("insights")}</h2>
      <ul className="grid gap-2">
        {r.insights.map((x, i) => {
          const icon = <span aria-hidden className={`mt-0.5 shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px] ${x.tone === "good" ? "text-[rgb(var(--hm-gold))]" : x.tone === "focus" ? "text-accent" : "text-muted"}`}>{x.tone === "good" ? <IconCheckCircle /> : x.tone === "focus" ? <IconFlag /> : <IconEye />}</span>;
          const text = <span className="min-w-0 flex-1 text-[15px] leading-relaxed">{s(x.key as never, fmt(x.p))}</span>;
          const cls = `flex gap-3 rounded-xl border bg-surface p-4 ${x.tone === "good" ? "border-[rgb(var(--hm-gold))]/55" : "border-line"}`;
          return (
            <li key={i}>
              {x.href ? <Link href={x.href} className={`${cls} transition hover:bg-[rgb(var(--hm-gold))]/[0.06]`}>{icon}{text}<span aria-hidden className="text-muted rtl:-scale-x-100">›</span></Link> : <div className={cls}>{icon}{text}</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function WeekScreen() {
  const { s } = useS2();
  return (
    <>
      <LearnHero back={useBack()} kicker={s("eyebrow")} title={s("weekTitle")} lead={s("weekLead")} word="مراجعة" uid="s2u" />
      <LearnMain className="grid gap-5">
        <Live><WeekBody /></Live>
        <Card><ContinueNext /></Card>
        <Term id="muraja" />
        <SourceNote src={["app", "halaqa"]} />
      </LearnMain>
    </>
  );
}
