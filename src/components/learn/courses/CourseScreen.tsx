"use client";
// /courses/[course] – one course: progress, badge, note, "start/continue" and the lesson path (web port of CourseScreen
// in mobile/src/features/courses/Screens.tsx; all lessons are open on the website).
import { Callout, GoldLink, LearnHero, LearnMain, Note, Row, RowList } from "@/components/learn/ui";
import { HomeRing, HomeStar } from "@/components/art/HomeOrnaments";
import { ArrowNext, IconCheckCircle } from "@/components/Icons";
import { formatNumber, useLang } from "@/lib/learn/i18n";
import { useHydrated } from "@/lib/learn/store";
import { courseById, tx } from "@/lib/learn/courses";
import { useAllahNames } from "@/lib/learn/courses/names";
import { doneCount, isPassed, useCP } from "@/lib/learn/courses/progress";
import { useCT } from "@/lib/learn/courses/texts";
import type { CLesson } from "@/lib/learn/courses/types";
import { CourseBadge } from "./parts";
import { useWT } from "./strings";

export default function CourseScreen({ id }: { id: string }) {
  const c = useCT();
  const w = useWT();
  const { lang } = useLang();
  const p = useCP();
  const ready = useHydrated();
  const course = courseById(id);
  const names = useAllahNames(lang);
  if (!course) return <LearnMain><Note tone="red" title={c("notFound")} /></LearnMain>;
  const isNames = course.id === "names";
  const ids = course.lessons.map((l) => l.id);
  const d = doneCount(p, course.id, ids);
  const complete = !!p.complete[course.id];
  const next = course.lessons.findIndex((l) => !isPassed(p, course.id, l.id));
  const title = (l: CLesson, i: number) => (isNames ? (names?.[i]?.latin ?? `${c("lesson")} ${formatNumber(i + 1, lang)}`) : tx(l.title, lang));
  const ring = (
    <div className="flex items-center gap-4">
      <HomeRing id="crs-ring" value={d / Math.max(1, ids.length)} size={84} dark>
        <span className="font-display text-[20px] text-white">{formatNumber(d, lang)}</span>
      </HomeRing>
      <div className="min-w-0">
        <p className="text-[15px] font-bold text-white">{c("progress", { d: formatNumber(d, lang), n: formatNumber(ids.length, lang) })}</p>
        {complete && <p className="mt-1 text-[13px] font-semibold text-[rgb(var(--gold))]">{c("sticker")}</p>}
      </div>
    </div>
  );
  return (
    <div>
      <LearnHero uid="crs1" back={{ href: "/courses", label: w("allCourses") }} kicker={c("coursesKicker")} title={tx(course.title, lang)} lead={tx(course.lead, lang)} word={course.word}
        aside={ready ? ring : undefined}>
        {ready && next >= 0 && (
          <GoldLink href={`/courses/${course.id}/${course.lessons[next].id}`}>{`${d ? c("continue") : c("start")}: ${title(course.lessons[next], next)}`} <ArrowNext /></GoldLink>
        )}
        {!ready && <GoldLink href={`/courses/${course.id}/${course.lessons[0].id}`}>{c("start")} <ArrowNext /></GoldLink>}
      </LearnHero>
      <LearnMain>
        {ready && complete && (
          <div className="mb-6 flex items-center gap-4 rounded-xl border border-[rgb(var(--hm-gold))]/40 bg-[rgb(var(--hm-gold))]/[0.06] p-4" role="status">
            <CourseBadge word={course.word} size={64} />
            <div>
              <p className="font-bold">{c("sticker")}</p>
              <p className="text-[14px] text-muted">{c("stickerLead")}</p>
            </div>
          </div>
        )}
        {course.note && <Callout title={c("note")} className="mb-6">{tx(course.note, lang)}</Callout>}
        {isNames && <p className="mb-4 text-[13.5px] text-muted">{w("namesNote")}</p>}
        <RowList>
          {course.lessons.map((l, i) => {
            const passed = ready && isPassed(p, course.id, l.id);
            const current = ready && i === next;
            const nm = isNames ? names?.[i] : undefined;
            return (
              <Row key={l.id} href={`/courses/${course.id}/${l.id}`} done={passed}
                lead={<HomeStar size={34} tone={passed ? "emerald" : current ? "gold" : "light"}>{formatNumber(i + 1, lang)}</HomeStar>}
                title={<><span className="sr-only">{`${c("lesson")} ${i + 1}: `}</span>{title(l, i)}{passed && <span className="sr-only">{`, ${c("done")}`}</span>}</>}
                sub={nm ? nm.meaning : undefined}
                trail={nm ? <span className="flex items-center gap-2"><span lang="ar" dir="rtl" className="font-arabic text-[22px] leading-none text-[rgb(var(--hm-gold-d))]">{nm.ar}</span>{passed && <span aria-hidden className="text-accent"><IconCheckCircle className="h-5 w-5" /></span>}</span> : undefined} />
            );
          })}
        </RowList>
      </LearnMain>
    </div>
  );
}
