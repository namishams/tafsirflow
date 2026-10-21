"use client";
// /arabic/read – "Read the Quran in Arabic": the reading course as a path of twenty stages. Web port of
// QaidaPathScreen (mobile/src/features/qaida/Screens.tsx): next lesson, daily goal and streak, the placement test of
// the website's Arabic course (tf:arabic, read only), review of the weakest items, and the zigzag path with stars and
// the unlock order (stageOpen / lessonOpen). On the website every stage is free, so the Pro card is left out.
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useHydrated } from "@/lib/learn/store";
import { useLang } from "@/lib/learn/i18n";
import { STAGES, txOf, type QLesson, type QStage } from "@/lib/learn/qaida/curriculum";
import { lessonOpen, nextLesson, placedStages, setGoal, stageOpen, stageState, streak, todayCount, useArabicCourse, useQaida, weakKeys } from "@/lib/learn/qaida/progress";
import { useQT } from "@/lib/learn/qaida/texts";
import { Bar, Card, GoldLink, LearnHero, LearnMain, SectionTitle, StageStats } from "@/components/learn/ui";
import { IconFlame, IconLock, IconRepeat } from "@/components/Icons";
import { StarGlyph } from "@/components/art/HomeOrnaments";
import { useQW } from "./strings";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export const lessonHref = (id: string) => `/arabic/read/${id}`;

export function Stars({ n, size = 13 }: { n: number; size?: number }) {
  const qt = useQT();
  return (
    <span role="img" aria-label={qt("stars", { n })} className="inline-flex gap-[3px]">
      {[0, 1, 2].map((i) => <StarGlyph key={i} size={size} className={i < n ? "text-[rgb(var(--hm-gold))]" : "text-line"} />)}
    </span>
  );
}

export function lessonLabel(l: QLesson, k: number, qt: ReturnType<typeof useQT>) {
  if (l.kind === "test") return qt("test");
  if (l.kind === "juz") return qt("juzSurah", { n: l.surah ?? 0 });
  if (l.letters && (l.kind === "letters" || l.kind === "forms")) return `${qt("lesson", { n: k + 1 })} · ${l.letters.join(" ")}`;
  return qt("lesson", { n: k + 1 });
}

export default function QaidaPathScreen() {
  const qt = useQT();
  const qw = useQW();
  const { lang } = useLang();
  const hydrated = useHydrated();
  const p = useQaida();
  const course = useArabicCourse();
  const placed = useMemo(() => placedStages(course), [course]);
  const next = nextLesson(p, placed);
  const [openStage, setOpenStage] = useState<number | null | undefined>(undefined);
  const shownStage = openStage === undefined ? (next?.stage.n ?? 1) : openStage;
  const today = todayCount(p);
  const days = streak(p);
  const weak = weakKeys(p);
  const complete = STAGES.filter((s) => stageState(p, s, placed).complete).length;
  const starTotal = STAGES.reduce((a, s) => a + stageState(p, s, placed).stars, 0);
  const started = Object.keys(p.done).length > 0;

  return (
    <>
      <LearnHero uid="qaida" kicker={qt("kicker")} title={qt("title")} lead={qt("lead")} word="ا ب ت" back={{ href: "/arabic", label: qw("back") }}
        aside={hydrated ? <StageStats items={[{ n: `${complete}/${STAGES.length}`, l: qw("stagesDone") }, { n: starTotal, l: qw("starsLbl") }, { n: days, l: qw("daysLbl") }]} /> : undefined}>
        {next ? <GoldLink href={lessonHref(next.lesson.id)}>{hydrated && started ? qt("continue") : qt("start")} · {txOf(next.stage.title, lang)}</GoldLink> : null}
      </LearnHero>
      <LearnMain>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* daily goal */}
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-bold">{qt("goal")}</h2>
              {days ? <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted"><IconFlame className="h-4 w-4 text-[rgb(var(--hm-gold))]" />{qt("streak", { n: days })}</span> : null}
            </div>
            <Bar value={today / p.goal} className="mt-3" label={qt("goal")} />
            <p className="mt-2 text-sm text-muted" aria-live="polite">{today >= p.goal ? qt("goalMet") : qt("today", { d: today, n: p.goal })}</p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={qt("goal")}>
              {[1, 2, 3].map((n) => (
                <button key={n} type="button" onClick={() => setGoal(n)} aria-pressed={p.goal === n}
                  className={cx("h-9 rounded-full border px-3.5 text-[13px] font-semibold transition", p.goal === n ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70")}>
                  {qt("goalN", { n })}
                </button>
              ))}
            </div>
          </Card>

          {/* placement (the Arabic course's test) and review */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
            <Link href="/arabic/placement" className="hm-card hm-lift relative flex flex-col gap-1.5 p-4">
              <StarGlyph size={18} className="text-[rgb(var(--hm-gold))]" />
              <span className="text-[15px] font-bold">{qt("placement")}</span>
              <span className="text-[12.5px] leading-snug text-muted">{qt("placementLead")}</span>
            </Link>
            <Link href={lessonHref("review")} className="hm-card hm-lift relative flex flex-col gap-1.5 p-4">
              <span className="text-[rgb(var(--hm-gold))]" aria-hidden><IconRepeat /></span>
              <span className="text-[15px] font-bold">{qt("review")}{weak.length ? ` · ${weak.length}` : ""}</span>
              <span className="text-[12.5px] leading-snug text-muted">{weak.length ? qt("reviewLead") : qt("reviewEmpty")}</span>
            </Link>
          </div>
        </div>

        <SectionTitle title={qw("path")} lead={qw("pathLead")} className="mt-12" />

        {/* the game path */}
        <ol className="mx-auto mt-8 max-w-md overflow-x-clip">
          {STAGES.map((s, i) => {
            const st = stageState(p, s, placed);
            const isOpen = stageOpen(p, s.n, placed);
            const current = next?.stage.n === s.n;
            const side = [0, 1, 0, -1][i % 4];
            const expanded = shownStage === s.n;
            return (
              <li key={s.id}>
                {i > 0 ? <div aria-hidden className={cx("mx-auto h-[26px] w-[3px] rounded-sm", st.complete || current ? "bg-[rgb(var(--hm-gold))]" : "bg-line")} style={{ transform: `translateX(${side * 50}px)` }} /> : null}
                <StageNode s={s} side={side} stars={st.stars} complete={st.complete} current={current} reachable={isOpen} expanded={expanded} onPress={() => setOpenStage(expanded ? null : s.n)} />
                {expanded ? (
                  <div id={`stage-${s.n}`} className="rise mt-3">
                    <Card>
                      <p className="text-[14.5px] leading-relaxed text-muted">{txOf(s.explain, lang)}</p>
                      <p className="mt-2 text-[13px] font-semibold text-muted">{qw("ofLessons", { d: st.passed, n: st.total })}</p>
                      {st.placed ? <p className="mt-1 text-[13px] font-semibold text-[rgb(var(--hm-gold-d))]">{qt("placed")}</p> : null}
                      {!isOpen ? <p className="mt-1 text-[13px] font-semibold text-muted">{qt("locked")}</p> : null}
                      <ul className="mt-3 flex flex-col gap-2">
                        {s.lessons.map((l, k) => {
                          const can = isOpen && lessonOpen(p, s, k, placed);
                          const d = p.done[l.id];
                          const cls = "flex min-h-12 items-center gap-3 rounded-md border border-line bg-[rgb(var(--bg))] px-3";
                          const label = <span className="min-w-0 flex-1 text-[14.5px] font-semibold">{lessonLabel(l, k, qt)}</span>;
                          return (
                            <li key={l.id}>
                              {can ? (
                                <Link href={lessonHref(l.id)} className={cx(cls, "transition hover:border-[rgb(var(--hm-gold))]/70")}>
                                  {label}{d ? <Stars n={d.stars} /> : <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>}
                                </Link>
                              ) : (
                                <div className={cx(cls, "opacity-50")} aria-disabled>
                                  {label}<span className="text-muted" aria-hidden><IconLock /></span>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </Card>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </LearnMain>
    </>
  );
}

function StageNode({ s, side, stars, complete, current, reachable, expanded, onPress }: {
  s: QStage; side: number; stars: number; complete: boolean; current: boolean; reachable: boolean; expanded: boolean; onPress: () => void;
}) {
  const qt = useQT();
  const { lang } = useLang();
  const size = current ? 92 : 80;
  const long = s.glyph.length > 4;
  return (
    <button type="button" onClick={onPress} aria-expanded={expanded} aria-controls={expanded ? `stage-${s.n}` : undefined}
      className="mx-auto flex w-fit max-w-[17rem] flex-col items-center text-center" style={{ transform: `translateX(${side * 50}px)` }}>
      <span className={cx("relative flex items-center justify-center rounded-full transition",
        complete ? "stage border-2 border-[#c9a65e] text-[#f3e2b6]" : current ? "border-4 border-[rgba(201,166,94,0.7)] bg-accent text-white" : "border-2 border-line bg-surface",
        !reachable && "opacity-55")} style={{ width: size, height: size }}>
        <span lang="ar" dir="rtl" className="font-arabic overflow-hidden whitespace-nowrap px-2" style={{ fontSize: long ? 18 : 30, lineHeight: 1.7 }}>{s.glyph}</span>
        {!reachable ? <span aria-hidden className="absolute -bottom-1 -end-1 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-line bg-surface text-muted [&_svg]:h-3.5 [&_svg]:w-3.5"><IconLock /></span> : null}
      </span>
      <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[rgb(var(--hm-gold-d))] rtl:tracking-normal">{qt("stage", { n: s.n })}</span>
      <span className="mt-0.5 max-w-[16rem] text-[15px] font-bold">{txOf(s.title, lang)}</span>
      <span className="mt-1"><Stars n={stars} /></span>
    </button>
  );
}
