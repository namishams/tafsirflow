"use client";
// mirrors mobile/src/features/shams2/review/Mastery.tsx – the mastery card of /shams/quality (Shams 3.0): six separate
// dimensions of the selected cell (or of all verses), each with its source; a dimension without data says "noch keine
// Daten" and how to measure it. Never mixed into one number, never a pronunciation score from speech recognition.
import { DIMS, type Dim, type MasteryCell, type MasterySource } from "@/lib/learn/shams2/mastery";
import { useS2 } from "@/lib/learn/shams2/text";
import { useRv, type RvKey } from "@/lib/learn/shams2/review/text";
import { Card } from "@/components/learn/ui";
import { SmallBtn } from "../ui";

/** where each dimension is measured on the website (`s`/`v` = a verse of the selected cell) */
export function measureHref(d: Dim, s: number, v: number): string {
  switch (d) {
    case "hifz": case "links": return "/shams/wird";
    case "words": return "/shams/weak";
    case "understand": return `/surah/${s}?v=${v}&shams=1`;
    case "tajweed": return `/shams/talaqqi?s=${s}&v=${v}`;
    case "similar": return "/shams/mutashabihat";
  }
}
const SRC_ORDER: MasterySource[] = ["teacher", "self", "memory", "wordCheck", "links", "quiz", "mut"];

export function MasteryCard({ cell, scope, at }: { cell: MasteryCell; scope: string; at: { s: number; v: number } }) {
  const rv = useRv();
  const { nf } = useS2();
  return (
    <Card className="grid gap-3">
      <h2 className="text-[18px] font-bold">{rv("mTitle")}</h2>
      <p className="text-[13.5px] leading-relaxed text-muted">{rv("mLead")}</p>
      <p className="text-[12.5px] font-semibold tracking-wide text-[rgb(var(--hm-gold-d))]">{rv("mFor", { x: scope })}</p>
      <dl className="grid divide-y divide-line border-t border-line">
        {DIMS.map((d) => {
          const a = cell.dims[d];
          const label = rv(`d_${d}` as RvKey);
          const src = SRC_ORDER.filter((k) => a.src[k]).map((k) => rv("srcN", { src: rv(`src_${k}` as RvKey), n: nf(a.src[k] ?? 0) })).join(" · ");
          return (
            <div key={d} className="grid gap-1.5 py-3">
              <dt className="flex items-center gap-3">
                <span className="flex-1 text-[14.5px] font-semibold">{label}</span>
                <span className={`font-display text-[18px] tabular-nums ${a.pct === null ? "text-muted" : a.pct >= 90 ? "text-[rgb(var(--hm-gold-d))]" : ""}`}>{a.pct === null ? "–" : `${nf(a.pct)} %`}</span>
              </dt>
              <dd className="grid gap-1.5">
                <span className="block h-[7px] overflow-hidden rounded-full bg-[rgb(var(--line))]" role="presentation">
                  {a.pct !== null && <span className={`block h-full rounded-full ${a.pct >= 90 ? "bg-[rgb(var(--hm-gold))]" : "bg-accent"}`} style={{ width: `${Math.max(2, a.pct)}%` }} />}
                </span>
                {a.pct !== null ? <span className="text-[12.5px] text-muted">{src}</span> : (
                  <span className="grid justify-items-start gap-1.5">
                    <span className="text-[13px] font-semibold text-muted">{rv("noData")}</span>
                    <span className="text-[13px] leading-relaxed text-muted">{rv(`how_${d}` as RvKey)}</span>
                    <SmallBtn href={measureHref(d, at.s, at.v)} label={`${rv("go")}: ${label}`}>{rv("go")}</SmallBtn>
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}
