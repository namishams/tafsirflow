"use client";
// mirrors mobile/src/features/shams2/Continue.tsx: never an end without a next step – the list of meaningful
// continuations (nextSteps.ts), used on the hub, after the wird, after tests and on /shams/next.
import { Link } from "@/i18n/navigation";
import { nextSteps, type NextStep } from "@/lib/learn/shams2/nextSteps";
import { useShams2 } from "@/lib/learn/shams2/model";
import { useS2 } from "@/lib/learn/shams2/text";
import { LearnHero, LearnMain } from "@/components/learn/ui";
import { Live, S2Kicker, SourceNote, useBack, useNames, webHref } from "./ui";

function useSteps(surah?: number) {
  const { srs, known, q } = useShams2();
  return nextSteps(srs, known, q.surahs, q.juz, { surah });
}

function useLabel() {
  const { s, nf } = useS2();
  const { name } = useNames();
  return (x: NextStep): [string, string] => {
    switch (x.kind) {
      case "sabaq": return [s("nx_sabaq", { surah: name(x.s!), v: nf(x.v!) }), s("nx_sabaqLead")];
      case "tathbit": return [s("nx_tathbit", { surah: name(x.s!) }), s("nx_tathbitLead", { p: nf(x.score ?? 0) })];
      case "juzExam": return [s("nx_juzExam", { n: nf(x.juz!) }), s("nx_juzExamLead")];
      case "nextJuz": return [s("nx_nextJuz", { n: nf(x.juz!) }), s("nx_nextJuzLead", { p: nf(x.score ?? 0) })];
      case "tafsir": return [s("nx_tafsir", { surah: name(x.s!) }), s("nx_tafsirLead")];
      case "mutashabihat": return [s("mutTitle"), s("nx_mutLead")];
      case "talaqqi": return [s("nx_talaqqi", { surah: name(x.s!) }), s("nx_talaqqiLead")];
      case "academy": return [s("nx_academy"), s("nx_academyLead")];
      case "reciterPath": return [s("nx_reciterPath"), s("nx_reciterPathLead")];
      case "courses": return [s("nx_courses"), s("nx_coursesLead")];
    }
  };
}

function Steps({ surah, max }: { surah?: number; max?: number }) {
  const { s } = useS2();
  const all = useSteps(surah);
  const steps = max ? all.slice(0, max) : all;
  const label = useLabel();
  return (
    <ul className="grid gap-2">
      {steps.map((x, i) => {
        const [title, lead] = label(x);
        return (
          <li key={`${x.kind}-${i}`}>
            <Link href={webHref(x.href)} className={`flex items-center gap-3 rounded-lg border bg-surface p-3.5 transition hover:bg-[rgb(var(--hm-gold))]/[0.06] ${i === 0 ? "border-[rgb(var(--hm-gold))]/60" : "border-line"}`}>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{title}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-muted">{lead}</span>
              </span>
              <span aria-hidden className="text-[rgb(var(--hm-gold-d))] rtl:-scale-x-100">→</span>
            </Link>
          </li>
        );
      })}
      {max ? <li><Link href={surah ? `/shams/next?s=${surah}` : "/shams/next"} className="inline-flex min-h-9 items-center text-[13px] font-semibold text-accent hover:underline">{`${s("allNext")} →`}</Link></li> : null}
    </ul>
  );
}

/** the first few next steps, as a block inside a card */
export function ContinueNext({ surah, max = 3 }: { surah?: number; max?: number }) {
  const { s } = useS2();
  return (
    <div className="grid gap-2.5">
      <S2Kicker>{s("continueTitle")}</S2Kicker>
      <Live><Steps surah={surah} max={max} /></Live>
    </div>
  );
}

export function NextScreen({ surah }: { surah?: number }) {
  const { s } = useS2();
  return (
    <>
      <LearnHero back={useBack()} kicker={s("eyebrow")} title={s("nextTitle")} lead={s("nextLead")} word="شمس" uid="s2n" />
      <LearnMain className="grid gap-4">
        <Live><Steps surah={surah} /></Live>
        <SourceNote src={["halaqa", "app"]} />
      </LearnMain>
    </>
  );
}
