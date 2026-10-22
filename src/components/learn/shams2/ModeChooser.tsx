"use client";
// mirrors ShamsModeChooser of mobile/src/features/shams2/ModeChooser.tsx: the choice between "Shams-Methode klassisch"
// (listen, understand, repeat, recite, surah by surah), "Shams 2.0" (the madrasa system) and "Shams 3.0" (2.0 plus adab,
// blind recitation, makhraj and the coach in the daily wird; recommended, gold badge), shown on /shams and /shams/method,
// with the four difficulty levels below (src/lib/learn/shams2/level.ts). The chosen one is marked "Your method"; choosing it also opens it. The choice is a preference only:
// both methods keep their own progress, so switching never loses anything (src/lib/learn/shams2/mode.ts).
import { useRouter } from "@/i18n/navigation";
import { learner } from "@/lib/coach";
import { IconCheckCircle } from "@/components/Icons";
import { closeShams3Offer, methodHref, setShamsMode, shams3OfferOpen, useShamsMode, usesWird, type ShamsMode } from "@/lib/learn/shams2/mode";
import { LEVELS, useShamsLevel } from "@/lib/learn/shams2/level";
import { useModeT, type ModeT } from "@/lib/learn/shams2/modeText";
import { useShams2 } from "@/lib/learn/shams2/model";
import { useSurahNames } from "@/lib/learn/shams2/names";
import { useS2 } from "@/lib/learn/shams2/text";

const AR: Record<ShamsMode, string> = { classic: "شَمْس", v2: "مَنْهَج شَمْس", v3: "مَنْهَج شَمْس الكامِل" };
const KEYS = { classic: ["classicTitle", "classicLead", "classicFor"], v2: ["v2Title", "v2Lead", "v2For"], v3: ["v3Title", "v3Lead", "v3For"] } as const;
const badge = "inline-flex h-7 items-center rounded-full bg-[rgb(var(--gold))] px-3 text-xs font-bold text-[#1a1408]";

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
  const title = m(KEYS[mode][0]);
  const best = mode === "v3";
  return (
    <div className={`stage girih relative grid content-start gap-2.5 overflow-hidden rounded-2xl border p-5 text-white sm:p-6 ${chosen || best ? "border-[rgb(var(--gold))] shadow-[0_0_0_1px_rgb(var(--gold))]" : "border-[rgb(var(--gold))]/40"}`}>
      <div className="flex min-h-7 items-center justify-between gap-3">
        <span lang="ar" className="font-arabic text-[22px] leading-none text-[rgb(var(--gold))]">{AR[mode]}</span>
        <span className="flex items-center gap-2">
        {best ? <span className={badge}>{m("recommended")}</span> : null}
        {chosen ? (
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/15 px-3 text-xs font-semibold text-[rgb(var(--gold))]"><IconCheckCircle className="h-3.5 w-3.5" />{m("yourMethod")}</span>
        ) : suggested && !best ? <span className="text-xs text-white/60">{m("suggested")}</span> : null}
        </span>
      </div>
      <h3 className="font-display text-[26px] leading-tight">{title}</h3>
      <p className="text-[15px] leading-relaxed text-white/80">{m(KEYS[mode][1])}</p>
      <p className="text-[13.5px] leading-relaxed text-white/60">{m(KEYS[mode][2])}</p>
      {chosen && (usesWird(mode) ? <V2Today /> : <ClassicNext m={m} />)}
      <button type="button" onClick={() => onPick(mode)} aria-label={`${chosen ? m("open") : m("choose")}: ${title}`}
        className={`mt-2 inline-flex h-11 w-fit items-center justify-center rounded-full border px-6 text-sm font-bold transition hover:bg-white/[0.06] ${chosen ? "border-[rgb(var(--gold))] text-[rgb(var(--gold))]" : "border-white/30 text-white hover:border-white/60"}`}>
        {chosen ? m("open") : m("choose")}
      </button>
    </div>
  );
}

export function ShamsModeChooser({ className = "", stay }: { className?: string; /** only choose, never navigate */ stay?: boolean }) {
  const m = useModeT();
  const router = useRouter();
  const { mode, chosen, suggested, ready } = useShamsMode();
  const pick = (to: ShamsMode) => {
    if (!(chosen && mode === to)) setShamsMode(to);
    if (!stay) router.push(methodHref(to, classicAt()));
  };
  return (
    <section aria-labelledby="shams-mode-title" className={`grid gap-4 ${className}`}>
      <div>
        <h2 id="shams-mode-title" className="font-display text-2xl sm:text-[28px]">{m("chooserTitle")}</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{m("chooserLead")}</p>
      </div>
      <Shams3Offer />
      <div className="grid gap-4 lg:grid-cols-3">
        {(["v3", "v2", "classic"] as const).map((k) => <MethodCard key={k} mode={k} chosen={ready && chosen && mode === k} suggested={ready && !chosen && suggested === k} onPick={pick} />)}
      </div>
      <LevelChooser />
    </section>
  );
}

/** the one-time card for learners who chose 2.0: "New: Shams 3.0 – switch now"; never switches by itself, both buttons
 *  close it for good (mode.ts SHAMS3_OFFER_KEY) */
export function Shams3Offer() {
  const m = useModeT();
  const { ready } = useShamsMode();
  if (!ready || !shams3OfferOpen()) return null;
  return (
    <div className="stage girih grid gap-2.5 rounded-2xl border border-[rgb(var(--gold))] p-5 text-white sm:p-6">
      <span className={`${badge} w-fit`}>{m("recommended")}</span>
      <h3 className="font-display text-[22px] leading-tight">{m("offerTitle")}</h3>
      <p className="max-w-2xl text-[15px] leading-relaxed text-white/80">{m("offerLead")}</p>
      <div className="mt-1 flex flex-wrap gap-3">
        <button type="button" onClick={() => { closeShams3Offer(); setShamsMode("v3"); }} className="inline-flex h-11 items-center rounded-full bg-[rgb(var(--gold))] px-6 text-sm font-bold text-[#1a1408]">{m("offerSwitch")}</button>
        <button type="button" onClick={() => closeShams3Offer()} className="inline-flex h-11 items-center rounded-full border border-white/30 px-6 text-sm font-bold text-white hover:border-white/60">{m("offerLater")}</button>
      </div>
    </div>
  );
}

/** the four difficulty levels with one line each (level.ts) */
export function LevelChooser() {
  const m = useModeT();
  const { level, set } = useShamsLevel();
  const { ready } = useShamsMode();
  return (
    <div role="radiogroup" aria-labelledby="shams-level-title" className="grid gap-2">
      <h3 id="shams-level-title" className="font-display text-xl">{m("levelTitle")}</h3>
      <p className="max-w-2xl text-[14px] leading-relaxed text-muted">{m("levelLead")}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {LEVELS.map((l) => {
          const on = ready && level === l;
          return (
            <button key={l} type="button" role="radio" aria-checked={on} onClick={() => set(l)}
              className={`grid gap-0.5 rounded-xl border p-3 text-start transition ${on ? "border-[rgb(var(--gold))] shadow-[0_0_0_1px_rgb(var(--gold))]" : "border-line hover:border-[rgb(var(--gold))]/60"}`}>
              <span className="text-[15px] font-semibold">{m(`lvl_${l}`)}</span>
              <span className="text-[13px] leading-snug text-muted">{m(`lvlLine_${l}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** /shams: the three versions, what 3.0 adds and why, around the single aim of becoming a reciter of the Quran */
export function ShamsVersions({ className = "" }: { className?: string }) {
  const m = useModeT();
  const adds = ["addAdab", "addBlind", "addMakhraj", "addMastery", "addTeacher"] as const;
  return (
    <section aria-labelledby="shams-versions-title" className={`grid gap-4 ${className}`}>
      <p className="text-sm font-semibold text-[rgb(var(--gold))]">{m("focusLine")}</p>
      <h2 id="shams-versions-title" className="font-display text-2xl sm:text-[28px]">{m("pageTitle")}</h2>
      <p className="max-w-2xl text-[15px] leading-relaxed text-muted">{m("pageLead")}</p>
      <div className="stage girih grid gap-3 rounded-2xl border border-[rgb(var(--gold))] p-5 text-white sm:p-6">
        <div className="flex items-center justify-between gap-3"><h3 className="font-display text-[22px]">{m("addsTitle")}</h3><span className={badge}>{m("recommended")}</span></div>
        <ul className="grid gap-2">{adds.map((k) => <li key={k} className="flex gap-2.5 text-[15px] leading-relaxed text-white/80"><IconCheckCircle className="mt-1 h-4 w-4 shrink-0 text-[rgb(var(--gold))]" />{m(k)}</li>)}</ul>
        <h3 className="mt-1 text-[15px] font-bold text-[rgb(var(--gold))]">{m("whyTitle")}</h3>
        <p className="max-w-3xl text-[15px] leading-relaxed text-white/80">{m("whyText")}</p>
      </div>
    </section>
  );
}
