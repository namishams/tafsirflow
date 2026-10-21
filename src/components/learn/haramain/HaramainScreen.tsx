"use client";
// /haramain – web version of mobile/src/features/haramain/HaramainScreen.tsx: the Kaaba, Mecca and Medina. Share
// button, the course (lesson list), the Hajj/Umrah guide, the timeline and the sections as an accordion (first one
// open): explanation, encyclopedia items with source and license, Quran passages by range. All sections are open on the
// website; the app's image share card is replaced by the browser's share sheet (or the clipboard).
import { useState } from "react";
import { pick, useLang } from "@/lib/learn/i18n";
import { SECTIONS, TIMELINE, UI, expandRange, type Section } from "@/lib/learn/haramain/content";
import { HARAMAIN_COURSE } from "@/lib/learn/haramain/lessons";
import { GUIDE_LABEL } from "@/lib/learn/haramain/guide";
import { verseHref } from "@/lib/learn/coursekit/links";
import { Link } from "@/i18n/navigation";
import QuranVerse from "@/components/learn/QuranVerse";
import { GoldLink, Kicker, LearnHero, LearnMain, OutlineButton } from "@/components/learn/ui";
import { HomeCorners } from "@/components/art/HomeOrnaments";
import { IconShare } from "@/components/Icons";
import { CourseList } from "@/components/learn/coursekit/CourseKit";
import { ExtraBlock } from "@/components/learn/coursekit/Extra";
import { WEB } from "@/components/learn/coursekit/texts";
import { shareOrCopy } from "@/components/learn/coursekit/share";

export default function HaramainScreen() {
  const { lang } = useLang();
  const s = (k: string) => pick(UI[k], lang);
  const [open, setOpen] = useState(0);
  const [msg, setMsg] = useState("");
  const share = async () => {
    const r = await shareOrCopy({ title: s("title"), text: s("shareMsg"), url: window.location.href.split("#")[0] });
    setMsg(r === "copied" ? pick(WEB.copied, lang) : "");
  };
  return (
    <div>
      <LearnHero uid="har" kicker={s("eyebrow")} title={s("title")} lead={s("lead")} word="الحرمان"
        back={{ href: "/masterclass", label: pick(WEB.hub, lang) }}>
        <OutlineButton dark onClick={() => void share()}><IconShare />{s("share")}</OutlineButton>
        <p aria-live="polite" className="basis-full text-[13px] text-white/70 empty:hidden">{msg}</p>
      </LearnHero>
      <LearnMain className="space-y-4">
        <CourseList def={HARAMAIN_COURSE} />
        <GoldLink href="/haramain/guide" className="w-full">{pick(GUIDE_LABEL, lang)}</GoldLink>
        <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <Kicker>{s("timeline")}</Kicker>
          <ol className="mt-4">
            {TIMELINE.map((e, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden className="flex w-3.5 shrink-0 flex-col items-center">
                  <span className="mt-1.5 h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[rgb(var(--hm-gold))]" />
                  {i < TIMELINE.length - 1 && <span className="mt-1 w-0.5 flex-1 bg-line" />}
                </span>
                <span className="min-w-0 flex-1 pb-4">
                  {e.year && <span className="block text-[12px] font-semibold tracking-wide text-[rgb(var(--hm-gold-d))]">{e.year}</span>}
                  <span className="block text-[15px] leading-snug">{pick(e.title, lang)}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
        {SECTIONS.map((sec, i) => (
          <SectionCard key={sec.id} sec={sec} highlight={i === 0} expanded={open === i} onToggle={() => setOpen(open === i ? -1 : i)} s={s} lang={lang} />
        ))}
      </LearnMain>
    </div>
  );
}

function SectionCard({ sec, highlight, expanded, onToggle, s, lang }: {
  sec: Section; highlight: boolean; expanded: boolean; onToggle: () => void; s: (k: string) => string; lang: string;
}) {
  const bodyId = `har-sec-${sec.id}`;
  return (
    <section className={highlight ? "hm-card relative p-5 sm:p-6" : "relative rounded-xl border border-line bg-surface p-5 sm:p-6"}>
      {highlight && <HomeCorners />}
      <h2>
        <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={bodyId} className="flex w-full items-center gap-3 text-start">
          <span className="font-display min-w-0 flex-1 text-[21px] leading-snug">{pick(sec.title, lang)}</span>
          <span lang="ar" dir="rtl" className="font-arabic shrink-0 text-[22px] text-[rgb(var(--hm-gold-d))]">{sec.arabic}</span>
          <span aria-hidden className={`shrink-0 text-muted transition ${expanded ? "rotate-90" : "rtl:-scale-x-100"}`}>›</span>
        </button>
      </h2>
      {expanded && (
        <div id={bodyId} className="mt-5 space-y-5">
          <p className="text-[16px] leading-[1.75]">{pick(sec.text, lang)}</p>
          <ExtraBlock kind={sec.kind} titles={sec.items} label={s("read")} loading={s("loading")} />
          {sec.ranges.length > 0 && (
            <section className="space-y-4">
              <Kicker>{s("verses")}</Kicker>
              {sec.ranges.map((r) => {
                const keys = expandRange(r);
                return (
                  <div key={r} className="space-y-3 border-t border-line pt-4">
                    {keys.map((k) => <QuranVerse key={k} verseKey={k} size="text-[24px] sm:text-[28px]" />)}
                    {keys[0] && <Link href={verseHref(keys[0])} className="inline-flex min-h-10 items-center text-sm font-semibold text-accent hover:underline">{`${r} · ${s("openReader")}`}</Link>}
                  </div>
                );
              })}
            </section>
          )}
        </div>
      )}
    </section>
  );
}
