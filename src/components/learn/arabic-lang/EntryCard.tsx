"use client";
// Entry card of the Arabic language course for the Masterclass hub and the Arabic pages (mirrors LangCourseCard in
// mobile/src/features/arabic-lang/Screens.tsx): links to /arabic/lang and shows the lessons done and the certificates.
import { Link } from "@/i18n/navigation";
import { useHydrated } from "@/lib/learn/store";
import { LESSONS, LEVELS } from "@/lib/learn/arabic-lang/curriculum";
import { isDone, useLangProgress } from "@/lib/learn/arabic-lang/progress";
import { useLT } from "@/lib/learn/arabic-lang/texts";
import { StarGlyph } from "@/components/art/HomeOrnaments";
import { cefr } from "./cefr";
import { useLW } from "./strings";

export function LangCourseEntryCard({ className = "" }: { className?: string }) {
  const lt = useLT();
  const lw = useLW();
  const hydrated = useHydrated();
  const p = useLangProgress();
  const started = hydrated && Object.keys(p.done).length > 0;
  const done = hydrated ? LESSONS.filter((l) => isDone(p, l.id)).length : 0;
  return (
    <Link href="/arabic/lang" aria-label={lt("title")}
      className={`stage group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-[rgba(201,166,94,0.45)] p-5 text-white transition hover:border-[rgb(var(--gold))] ${className}`}>
      <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.17em] text-[rgb(var(--gold))] rtl:tracking-normal"><StarGlyph size={12} />{lt("kicker")} · <span data-latin-digits="">A1–C1</span></span>
      <span className="flex items-center gap-3">
        <span className="font-display flex-1 text-[26px] leading-[1.15]">{lt("title")}</span>
        <span aria-hidden lang="ar" dir="rtl" className="font-arabic text-[30px] leading-[1.8] text-[#f3e2b6]">ع ل م</span>
      </span>
      <span className="text-[14.5px] leading-relaxed text-white/75">{cefr(lt("cardLead"))}</span>
      {started ? (
        <span className="mt-1 flex items-center gap-3 text-[12.5px] text-white/70">
          <span className="hm-bar is-gold flex-1" aria-hidden><i style={{ width: `${Math.round((done / LESSONS.length) * 100)}%` }} /></span>
          <span className="tabular-nums">{done}/{LESSONS.length} {lw("lessonsLbl")}</span>
          <span className="flex gap-1" aria-label={lt("certs")}>
            {LEVELS.map(({ level }) => <span key={level} data-latin-digits="" className={`text-[11px] font-bold ${p.certs[level] ? "text-[rgb(var(--gold))]" : "text-white/30"}`}>{level}</span>)}
          </span>
        </span>
      ) : null}
      <span className="btn-gold mt-2 inline-flex h-10 items-center self-start rounded-full px-4 text-sm font-bold">{started ? lt("continue") : lt("start")}</span>
    </Link>
  );
}

export default LangCourseEntryCard;
