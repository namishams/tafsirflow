"use client";
// mirrors StudyWisdom of mobile/src/features/campus/Campus.tsx for the website (/school): one tip per day about learning
// with the Shams Method and the adab of the student of knowledge, the classical sayings with their Arabic wording and
// the book they are found in, and the other tips to pick. Own words; no Quran or hadith text. The day's tip is chosen in
// the browser (the learner's date), so the server renders nothing here.
import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/learn/i18n";
import { WISDOM, WISDOM_REVIEW, tipOfDay, wisdomText } from "@/lib/learn/campus/wisdom";
import { wisdomT } from "@/lib/learn/campus/texts";
import { SectionTitle } from "@/components/learn/ui";
import { StarGlyph } from "@/components/art/HomeOrnaments";

export function StudyWisdom() {
  const { lang, rtl } = useLang();
  const ct = wisdomT(lang);
  const [today, setToday] = useState<number | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  useEffect(() => { const d = tipOfDay(); setToday(d); setPick(d); }, []);
  const others = useMemo(() => WISDOM.map((x, i) => ({ x, i })).filter(({ i }) => i !== pick), [pick]);
  if (pick === null) return null;
  const w = WISDOM[pick];
  const kicker = pick === today ? `${ct("tipOfDay")} · ${ct(`cat_${w.cat}`)}` : ct(`cat_${w.cat}`);
  return (
    <section aria-labelledby="study-wisdom" className="grid gap-4">
      <SectionTitle id="study-wisdom" title={ct("wisdomTitle")} lead={ct("wisdomLead")} />
      <article aria-live="polite" className="stage girih relative overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/45 p-6 text-[#eef0f3]">
        <p className={`flex items-center gap-2 text-[11.5px] font-semibold text-[rgb(var(--gold))] ${rtl ? "" : "uppercase tracking-[0.16em]"}`}><StarGlyph size={10} />{kicker}</p>
        <h3 className="font-display mt-3 text-[24px] leading-tight">{wisdomText(w.title, lang)}</h3>
        {w.ar ? <p lang="ar" dir="rtl" className="mt-3 font-arabic text-[21px] leading-[1.9] text-[rgb(var(--gold))]">{w.ar}</p> : null}
        <p className="mt-3 text-[15.5px] leading-relaxed text-white/75">{wisdomText(w.body, lang)}</p>
        {w.source ? <p className="mt-3 text-[12.5px] text-white/80">{`${w.who ? `${w.who} · ` : ""}${ct("source")}: ${w.source}`}</p> : null}
        {WISDOM_REVIEW.status === "pending" && w.cat === "saying" ? <p className="mt-1 text-[11.5px] text-white/55">{ct("review")}</p> : null}
      </article>
      <ul aria-label={ct("more")} className="flex gap-3 overflow-x-auto pb-1">
        {others.map(({ x, i }) => (
          <li key={x.id} className="shrink-0">
            <button type="button" onClick={() => setPick(i)} className="grid h-[124px] w-[210px] content-start gap-1.5 rounded-xl border border-line bg-surface p-3.5 text-start transition hover:border-[rgb(var(--hm-gold))]/60">
              <span className={`text-[10.5px] font-semibold text-[rgb(var(--hm-gold-d))] ${rtl ? "" : "uppercase tracking-[0.12em]"}`}>{ct(`cat_${x.cat}`)}</span>
              <span className="line-clamp-2 text-[14.5px] font-bold leading-snug">{wisdomText(x.title, lang)}</span>
              <span className="line-clamp-2 text-[12.5px] leading-snug text-muted">{wisdomText(x.body, lang)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
