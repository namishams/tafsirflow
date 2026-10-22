"use client";
// mirrors mobile/src/features/shams2/MouthDiagram.tsx: side view of mouth and throat for the makhraj coach. The place
// of the letter glows in gold, the place of the letter it is confused with is a dashed emerald ring. The same drawn
// geometry as the app (makhrajData.ts DIAGRAM), coloured with the site's theme variables (light and dark).
import { useId } from "react";
import { DIAGRAM, REGION_SPOTS, VIEWBOX, type Region } from "@/lib/learn/shams2/makhrajData";

export function MouthDiagram({ region, partner, letter, partnerLetter, label, legendThis, legendPartner }: {
  region: Region; partner?: Region; letter: string; partnerLetter?: string; label: string; legendThis: string; legendPartner?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const a = REGION_SPOTS[region];
  const b = partner && partner !== region ? REGION_SPOTS[partner] : null;
  const line = "rgb(var(--accent) / 0.55)", palate = "rgb(var(--gold))", tongue = "rgba(201,138,131,0.34)", tongueLine = "rgb(154 90 82)";
  return (
    <figure className="grid justify-items-center gap-3">
      <div className="overflow-hidden rounded-[28px] border border-[rgb(201_166_94/0.35)] bg-[rgb(var(--accent)/0.04)]">
        <svg viewBox={VIEWBOX} width={260} height={260} role="img" aria-label={label} className="block h-auto w-[min(260px,72vw)]">
          <defs>
            <linearGradient id={`h${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="rgb(var(--accent-soft))" /><stop offset="1" stopColor="rgb(var(--accent-soft))" stopOpacity="0.7" /></linearGradient>
            <radialGradient id={`g${uid}`}><stop offset="0" stopColor="#d6b46c" stopOpacity="0.75" /><stop offset="1" stopColor="#d6b46c" stopOpacity="0" /></radialGradient>
          </defs>
          <path d={DIAGRAM.head} fill={`url(#h${uid})`} stroke={line} strokeWidth={1.4} />
          <path d={DIAGRAM.nasal} fill="none" stroke={line} strokeOpacity={0.6} strokeWidth={1.2} />
          <path d={DIAGRAM.cavity} fill="rgb(var(--surface) / 0.85)" />
          <path d={DIAGRAM.tongueBody} fill={tongue} />
          <path d={DIAGRAM.tongue} fill="none" stroke={tongueLine} strokeWidth={1.6} strokeLinecap="round" />
          <path d={DIAGRAM.palate} fill="none" stroke={palate} strokeWidth={2} strokeLinecap="round" />
          <path d={DIAGRAM.velum} fill={tongue} stroke={palate} strokeWidth={1.6} />
          <path d={DIAGRAM.pharynx} fill="none" stroke={line} strokeWidth={1.6} />
          <path d={DIAGRAM.epiglottis} fill="none" stroke={tongueLine} strokeWidth={1.6} strokeLinecap="round" />
          <path d={DIAGRAM.larynx} fill="none" stroke={line} strokeWidth={1.6} strokeLinecap="round" />
          <path d={DIAGRAM.teethUp} fill="#ffffff" stroke={palate} strokeWidth={1} />
          <path d={DIAGRAM.teethDown} fill="#ffffff" stroke={palate} strokeWidth={1} />
          <path d={DIAGRAM.molars} fill="#ffffff" fillOpacity={0.7} stroke={palate} strokeWidth={1} strokeDasharray="2 2" />
          {b ? <circle cx={b.x} cy={b.y} r={b.r} fill="none" stroke="rgb(var(--accent))" strokeWidth={1.6} strokeDasharray="3 3" /> : null}
          <circle cx={a.x} cy={a.y} r={a.r * 2} fill={`url(#g${uid})`} />
          <circle cx={a.x} cy={a.y} r={a.r} fill="none" stroke="#c6a65e" strokeWidth={2} strokeDasharray={a.side ? "5 3" : undefined} />
          <circle cx={a.x} cy={a.y} r={3.2} fill="#c6a65e" />
        </svg>
      </div>
      <figcaption aria-hidden="true" className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[12.5px] text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#c6a65e]" /><span lang="ar" className="font-arabic text-[18px] text-ink">{letter}</span>{legendThis}</span>
        {b && partnerLetter && legendPartner ? <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-[1.5px] border-dashed border-accent" /><span lang="ar" className="font-arabic text-[18px] text-ink">{partnerLetter}</span>{legendPartner}</span> : null}
      </figcaption>
    </figure>
  );
}
