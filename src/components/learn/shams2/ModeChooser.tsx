"use client";
// mirrors ShamsModeChooser of mobile/src/features/shams2/ModeChooser.tsx: the choice between "Shams Method – classic"
// (listen, understand, repeat, recite, surah by surah) and "Shams Method 2.0" (the madrasa system), shown on /shams and
// /shams/method. The chosen one is marked "Your method"; choosing it also opens it. The choice is a preference only:
// both methods keep their own progress, so switching never loses anything (src/lib/learn/shams2/mode.ts).
import { useRouter } from "@/i18n/navigation";
import { learner } from "@/lib/coach";
import { IconCheckCircle } from "@/components/Icons";
import { methodHref, setShamsMode, useShamsMode, type ShamsMode } from "@/lib/learn/shams2/mode";
import { useModeT, type ModeT } from "@/lib/learn/shams2/modeText";
import { useShams2 } from "@/lib/learn/shams2/model";
import { useSurahNames } from "@/lib/learn/shams2/names";
import { useS2 } from "@/lib/learn/shams2/text";

const AR: Record<ShamsMode, string> = { classic: "شَمْس", v2: "مَنْهَج شَمْس" };

/** where the classic method continues: the learner's next verse, or al-Fātiḥa for someone who has not begun */
function classicAt() {
  const me = learner();
  return me.learned > 0 && me.next ? { surah: me.next.surah, verse: me.next.verse } : null;
}

const line = "text-[13.5px] font-semibold text-[rgb(var(--gold))]";

function ClassicNext({ m }: { m: ModeT }) {
  const { name } = useSurahNames();
  const at = classicAt();
  return <p className={line}>{at ? m("classicNext", { surah: name(at.surah), v: at.verse }) : m("classicStart")}</p>;
}

function V2Today() {
  const { s, nf } = useS2();
  const { wird, grade } = useShams2();
  return <p className={line}>{`${s("entryToday", { a: nf(wird.sabaq.verses), b: nf(wird.sabqi.verses), c: nf(wird.manzil.verses) })} · ${grade.tr}`}</p>;
}

function MethodCard({ mode, chosen, suggested, onPick }: { mode: ShamsMode; chosen: boolean; suggested: boolean; onPick: (m: ShamsMode) => void }) {
  const m = useModeT();
  const title = m(mode === "v2" ? "v2Title" : "classicTitle");
  return (
    <div className={`stage girih relative grid content-start gap-2.5 overflow-hidden rounded-2xl border p-5 text-white sm:p-6 ${chosen ? "border-[rgb(var(--gold))] shadow-[0_0_0_1px_rgb(var(--gold))]" : "border-[rgb(var(--gold))]/40"}`}>
      <div className="flex min-h-7 items-center justify-between gap-3">
        <span lang="ar" className="font-arabic text-[22px] leading-none text-[rgb(var(--gold))]">{AR[mode]}</span>
        {chosen ? (
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/15 px-3 text-xs font-semibold text-[rgb(var(--gold))]"><IconCheckCircle className="h-3.5 w-3.5" />{m("yourMethod")}</span>
        ) : suggested ? <span className="text-xs text-white/60">{m("suggested")}</span> : null}
      </div>
      <h3 className="font-display text-[26px] leading-tight">{title}</h3>
      <p className="text-[15px] leading-relaxed text-white/80">{m(mode === "v2" ? "v2Lead" : "classicLead")}</p>
      <p className="text-[13.5px] leading-relaxed text-white/60">{m(mode === "v2" ? "v2For" : "classicFor")}</p>
      {chosen && (mode === "v2" ? <V2Today /> : <ClassicNext m={m} />)}
      <button type="button" onClick={() => onPick(mode)} aria-label={`${chosen ? m("open") : m("choose")}: ${title}`}
        className={`mt-2 inline-flex h-11 w-fit items-center justify-center rounded-full border px-6 text-sm font-bold transition hover:bg-white/[0.06] ${chosen ? "border-[rgb(var(--gold))] text-[rgb(var(--gold))]" : "border-white/30 text-white hover:border-white/60"}`}>
        {chosen ? m("open") : m("choose")}
      </button>
    </div>
  );
}

export function ShamsModeChooser({ className = "" }: { className?: string }) {
  const m = useModeT();
  const router = useRouter();
  const { mode, chosen, suggested, ready } = useShamsMode();
  const pick = (to: ShamsMode) => {
    if (!(chosen && mode === to)) setShamsMode(to);
    router.push(methodHref(to, classicAt()));
  };
  return (
    <section aria-labelledby="shams-mode-title" className={`grid gap-4 ${className}`}>
      <div>
        <h2 id="shams-mode-title" className="font-display text-2xl sm:text-[28px]">{m("chooserTitle")}</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{m("chooserLead")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(["classic", "v2"] as const).map((k) => <MethodCard key={k} mode={k} chosen={ready && chosen && mode === k} suggested={ready && !chosen && suggested === k} onPick={pick} />)}
      </div>
    </section>
  );
}
