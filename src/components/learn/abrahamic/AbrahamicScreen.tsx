"use client";
// /abrahamic – web version of mobile/src/features/abrahamic/AbrahamicScreen.tsx: "Abraham and the Abrahamic religions
// in the Quran". The course (lesson list) first, then the units as an accordion (first one open): explanation, Quran
// passages by verse key and encyclopedia items with source and license. All units are open on the website.
import { useState } from "react";
import { pick, useLang } from "@/lib/learn/i18n";
import { UI, UNITS, type AbrahamicUnit } from "@/lib/learn/abrahamic/content";
import { ABRAHAMIC_COURSE } from "@/lib/learn/abrahamic/lessons";
import { unitText } from "@/lib/learn/abrahamic/courseText";
import QuranVerse from "@/components/learn/QuranVerse";
import { Kicker, LearnHero, LearnMain, StageStats } from "@/components/learn/ui";
import { HomeCorners } from "@/components/art/HomeOrnaments";
import { CourseList, useCourseCount } from "@/components/learn/coursekit/CourseKit";
import { ExtraBlock } from "@/components/learn/coursekit/Extra";
import { WEB } from "@/components/learn/coursekit/texts";
import { useCK } from "@/lib/learn/abrahamic/kit";

export default function AbrahamicScreen() {
  const { lang } = useLang();
  const s = (k: string) => pick(UI[k], lang);
  const [open, setOpen] = useState(0);
  const { n, m } = useCourseCount(ABRAHAMIC_COURSE);
  const { c } = useCK();
  return (
    <div>
      <LearnHero uid="abr" kicker={s("eyebrow")} title={s("title")} lead={s("lead")} word="إبراهيم"
        back={{ href: "/masterclass", label: pick(WEB.hub, lang) }}
        aside={<StageStats items={[{ n: m, l: c("lessons") }, { n: UNITS.length, l: s("unit") }, { n: `${n}/${m}`, l: c("done") }]} />} />
      <LearnMain className="space-y-4">
        <CourseList def={ABRAHAMIC_COURSE} />
        {UNITS.map((u, i) => (
          <UnitCard key={u.id} unit={u} n={i + 1} expanded={open === i} onToggle={() => setOpen(open === i ? -1 : i)} s={s} lang={lang} />
        ))}
      </LearnMain>
    </div>
  );
}

function UnitCard({ unit, n, expanded, onToggle, s, lang }: {
  unit: AbrahamicUnit; n: number; expanded: boolean; onToggle: () => void; s: (k: string) => string; lang: string;
}) {
  const bodyId = `abr-unit-${unit.id}`;
  return (
    <section className={unit.highlight ? "hm-card relative p-5 sm:p-6" : "relative rounded-xl border border-line bg-surface p-5 sm:p-6"}>
      {unit.highlight && <HomeCorners />}
      <h2>
        <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={bodyId}
          className="flex w-full items-center gap-3 text-start">
          <span className="min-w-0 flex-1">
            <Kicker>{`${s("unit")} ${n}`}</Kicker>
            <span className="font-display mt-1.5 block text-[21px] leading-snug">{pick(unit.title, lang)}</span>
          </span>
          <span lang="ar" dir="rtl" className="font-arabic shrink-0 text-[22px] text-[rgb(var(--hm-gold-d))]">{unit.arabic}</span>
          <span aria-hidden className={`shrink-0 text-muted transition ${expanded ? "rotate-90" : "rtl:-scale-x-100"}`}>›</span>
        </button>
      </h2>
      {expanded && (
        <div id={bodyId} className="mt-5 space-y-5">
          <p className="text-[16px] leading-[1.75]">{unitText("abrahamic", unit.id, "text", unit.text, lang)}</p>
          {unit.verses.length > 0 && (
            <section className="space-y-3">
              <Kicker>{s("verses")}</Kicker>
              <div className="grid gap-3">
                {unit.verses.map((k) => <QuranVerse key={k} verseKey={k} size="text-[24px] sm:text-[28px]" />)}
              </div>
            </section>
          )}
          <ExtraBlock kind={unit.kind} titles={unit.items} label={s("read")} loading={s("loading")} />
        </div>
      )}
    </section>
  );
}
