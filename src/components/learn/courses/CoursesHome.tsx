"use client";
// /courses – all academy courses with progress and the course badges (web port of CoursesHome in
// mobile/src/features/courses/Screens.tsx; everything is free on the website, the app's stickers are simple badges).
import { CardLink, Bar, LearnHero, LearnMain, SectionTitle, StageStats } from "@/components/learn/ui";
import { HomeStar } from "@/components/art/HomeOrnaments";
import { ArrowNext } from "@/components/Icons";
import { useLang, formatNumber } from "@/lib/learn/i18n";
import { useHydrated } from "@/lib/learn/store";
import { COURSES, tx } from "@/lib/learn/courses";
import { doneCount, useCP } from "@/lib/learn/courses/progress";
import { useCT } from "@/lib/learn/courses/texts";
import { CourseBadge } from "./parts";
import { useWT } from "./strings";

export default function CoursesHome() {
  const c = useCT();
  const w = useWT();
  const { lang } = useLang();
  const p = useCP();
  const ready = useHydrated();
  const rows = COURSES.map((co) => ({ co, d: doneCount(p, co.id, co.lessons.map((l) => l.id)), complete: !!p.complete[co.id] }));
  const lessons = rows.reduce((a, r) => a + r.d, 0);
  const complete = rows.filter((r) => r.complete).length;
  return (
    <div>
      <LearnHero uid="crs" kicker={c("coursesKicker")} title={c("coursesTitle")} lead={c("coursesLead")} word="أكاديمية" wide
        aside={ready ? <StageStats items={[
          { n: formatNumber(lessons, lang), l: w("lessonsDone") },
          { n: `${formatNumber(complete, lang)}/${formatNumber(COURSES.length, lang)}`, l: w("coursesDone") },
          { n: formatNumber(COURSES.length, lang), l: c("coursesTitle") },
        ]} /> : undefined} />
      <LearnMain wide>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ co, d, complete: done }, i) => {
            const n = co.lessons.length;
            return (
              <li key={co.id} className="flex">
                <CardLink href={`/courses/${co.id}`} className="w-full overflow-hidden">
                  <span aria-hidden lang="ar" className="font-callig pointer-events-none absolute -bottom-3 end-3 select-none whitespace-nowrap text-[52px] leading-none text-[rgb(var(--hm-gold))]/15">{co.word}</span>
                  <span className="relative flex items-center gap-3">
                    {done ? <CourseBadge word={co.word} size={48} label={c("sticker")} /> : <HomeStar size={44} tone={d > 0 ? "gold" : "light"}>{formatNumber(i + 1, lang)}</HomeStar>}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[17px] font-bold leading-snug">{tx(co.title, lang)}</span>
                      <span className="mt-0.5 block text-[13px] text-muted">{c("progress", { d: formatNumber(d, lang), n: formatNumber(n, lang) })}</span>
                    </span>
                  </span>
                  <span className="relative mt-3 line-clamp-3 block text-[14.5px] leading-relaxed text-muted">{tx(co.lead, lang)}</span>
                  <span className="relative mt-auto block pt-4"><Bar value={d / Math.max(1, n)} gold={done} label={c("progress", { d, n })} className="max-w-[260px]" /></span>
                  <span className="relative mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent">{d ? c("continue") : c("start")} <ArrowNext /></span>
                </CardLink>
              </li>
            );
          })}
        </ul>

        <section className="mt-14" aria-labelledby="crs-stickers">
          <SectionTitle id="crs-stickers" title={c("stickers")} lead={w("stickersLead")} />
          {ready && complete === 0 && <p className="mt-4 text-[14.5px] text-muted">{w("noStickers")}</p>}
          <ul className="mt-5 flex flex-wrap gap-3">
            {rows.map(({ co, complete: done }) => (
              <li key={co.id} className="flex w-[92px] flex-col items-center gap-1.5 text-center">
                <CourseBadge word={co.word} size={64} muted={!done} />
                <span className={`text-[12px] leading-tight ${done ? "font-semibold" : "text-muted"}`}>{tx(co.title, lang)}</span>
                {done && <span className="sr-only">{w("completed")}</span>}
              </li>
            ))}
          </ul>
        </section>
      </LearnMain>
    </div>
  );
}
