"use client";
// The exercise cards of the Arabic language course, web port of mobile/src/features/arabic-lang/Exercises.tsx:
// new word (intro), choose (meaning both ways, listening, conjugation), build the sentence from tiles, write in Arabic
// (with a letter pad and tolerant checking), say it aloud (Web Speech API, scored with align() from the recite check,
// skippable), grammar spotting in a real verse (words from the Quran API) and the dialogue. Each scored card calls
// onCheck(ok, correct) once; the lesson screen shows the feedback bar and moves on. Arabic is always right to left.
import { useEffect, useMemo, useRef, useState } from "react";
import { useArabicVoice, useWordCheck } from "@/components/learn/media";
import { GoldButton, Option, Spinner, TextButton } from "@/components/learn/ui";
import { IconSpeaker } from "@/components/Icons";
import { useLang } from "@/lib/learn/i18n";
import { same } from "@/lib/recite";
import { normalizeArabic } from "@/lib/vocabStudy";
import { loadVerse, type VWord } from "@/lib/learn/srs/verse";
import type { Ex } from "@/lib/learn/arabic-lang/build";
import type { LItem } from "@/lib/learn/arabic-lang/curriculum";
import { useLT } from "@/lib/learn/arabic-lang/texts";
import type { Line } from "@/lib/learn/arabic-lang/types";

export type Check = (ok: boolean, correct: string) => void;
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** Arabic in the Quran face, sized in px (line height 1.75 like the app) */
export function Ar({ children, size = 28, center = true, className = "" }: { children: string; size?: number; center?: boolean; className?: string }) {
  return <span lang="ar" dir="rtl" className={cx("font-arabic block", center ? "text-center" : "text-start", className)} style={{ fontSize: size, lineHeight: 1.75 }}>{children}</span>;
}

function Prompt({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-center text-[21px] leading-snug sm:text-2xl">{children}</h2>;
}

export function SayButton({ text, label }: { text: string; label?: string }) {
  const lt = useLT();
  const { canSpeak, speak } = useArabicVoice();
  if (!canSpeak) return null;
  return (
    <button type="button" onClick={() => speak(text)} aria-label={label ?? lt("listen")}
      className="mx-auto inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition hover:border-[rgb(var(--hm-gold))]/70">
      <IconSpeaker className="h-[18px] w-[18px] text-[rgb(var(--hm-gold))]" />{label ?? lt("listen")}
    </button>
  );
}

function CheckButton({ disabled, onClick, label }: { disabled?: boolean; onClick: () => void; label?: string }) {
  const lt = useLT();
  return <GoldButton disabled={disabled} onClick={onClick} className="mt-2 w-full">{label ?? lt("check")}</GoldButton>;
}

export function IntroCard({ item, onNext }: { item: LItem; onNext: () => void }) {
  const lt = useLT();
  return (
    <div className="flex flex-col gap-4">
      <p className="hm-k text-center text-[rgb(var(--hm-gold-d))]">{lt("isNew")}</p>
      <div className="hm-card relative grid gap-1.5 px-4 py-6 text-center">
        <Ar size={item.ar.length > 18 ? 28 : 38}>{item.ar}</Ar>
        <p className="text-[15px] text-muted">{item.tr}</p>
        <p className="text-lg font-bold">{item.local}</p>
      </div>
      <SayButton text={item.ar} />
      <CheckButton onClick={onNext} label={lt("next")} />
    </div>
  );
}

export function ChooseCard({ ex, onCheck }: { ex: Extract<Ex, { k: "choose" | "listen" | "conj" }>; onCheck: Check }) {
  const lt = useLT();
  const [sel, setSel] = useState<number | null>(null);
  const { canSpeak, speak } = useArabicVoice();
  const spoke = useRef(false);
  useEffect(() => { if (ex.k === "listen" && canSpeak && !spoke.current) { spoke.current = true; speak(ex.say); } }, [ex, canSpeak, speak]);
  const optsAr = ex.k === "choose" ? ex.optsAr : true;
  return (
    <div className="flex flex-col gap-4">
      {ex.k === "choose" ? (
        <>
          <Prompt>{ex.qAr ? lt("chooseMeaning") : lt("chooseArabic")}</Prompt>
          {ex.qAr ? <Ar size={36}>{ex.q}</Ar> : <p className="font-display my-2 text-center text-2xl leading-snug">{ex.q}</p>}
          {ex.say ? <SayButton text={ex.say} /> : null}
        </>
      ) : ex.k === "listen" ? (
        <>
          <Prompt>{lt("listenPick")}</Prompt>
          {canSpeak ? (
            <button type="button" onClick={() => speak(ex.say)} aria-label={lt("listen")} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white transition hover:opacity-90">
              <IconSpeaker className="h-7 w-7" />
            </button>
          ) : null}
        </>
      ) : (
        <>
          <Prompt>{lt("conjQ")}</Prompt>
          <p className="text-center text-sm text-muted">{ex.title}</p>
          <Ar size={32} className="text-[rgb(var(--hm-gold-d))]">{ex.label}</Ar>
        </>
      )}
      <div role="radiogroup" className="grid gap-2.5">
        {ex.opts.map((o, i) => (
          <Option key={o + i} state={sel === i ? "chosen" : "idle"} onClick={() => setSel(i)} dir={optsAr ? "rtl" : undefined} className="text-center">
            {optsAr ? <Ar size={24}>{o}</Ar> : <span className="block text-center">{o}</span>}
          </Option>
        ))}
      </div>
      <CheckButton disabled={sel === null} onClick={() => sel !== null && onCheck(sel === ex.ans, ex.opts[ex.ans])} />
    </div>
  );
}

const chipCls = "rounded-md border px-3 font-arabic text-[22px] leading-[1.9] transition";
export function TilesCard({ ex, onCheck }: { ex: Extract<Ex, { k: "tiles" }>; onCheck: Check }) {
  const lt = useLT();
  const [row, setRow] = useState<number[]>([]);
  return (
    <div className="flex flex-col gap-4">
      <Prompt>{lt("tilesQ")}</Prompt>
      <p className="font-display text-center text-[21px] leading-snug">{ex.q}</p>
      <div dir="rtl" lang="ar" aria-live="polite" className="flex min-h-[64px] flex-wrap gap-2 border-b border-line py-1.5">
        {row.map((i, n) => (
          <button key={`r${n}`} type="button" onClick={() => setRow(row.filter((_, m) => m !== n))} aria-label={ex.pool[i]}
            className={cx(chipCls, "border-[rgb(var(--hm-gold))] bg-surface hover:bg-[rgb(var(--hm-gold))]/10")}>{ex.pool[i]}</button>
        ))}
      </div>
      <p className="text-center text-[13px] text-muted">{lt("tilesHint")}</p>
      <div dir="rtl" lang="ar" className="flex flex-wrap justify-center gap-2">
        {ex.pool.map((w, i) => {
          const used = row.includes(i);
          return (
            <button key={`p${i}`} type="button" disabled={used} onClick={() => setRow([...row, i])} aria-label={w}
              className={cx(chipCls, used ? "border-line bg-[rgb(var(--bg))] opacity-35" : "border-[rgb(var(--hm-gold))]/70 bg-surface hover:bg-[rgb(var(--hm-gold))]/10")}>{w}</button>
          );
        })}
      </div>
      {row.length ? <TextButton onClick={() => setRow([])} className="mx-auto">{lt("reset")}</TextButton> : null}
      <CheckButton disabled={!row.length} onClick={() => {
        const built = row.map((i) => ex.pool[i]);
        onCheck(built.length === ex.answer.length && built.every((w, i) => normalizeArabic(w) === normalizeArabic(ex.answer[i])), ex.answer.join(" "));
      }} />
    </div>
  );
}

const PAD = "ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ة ى ء أ إ".split(" ");
/** typing with tolerance: vowel signs, hamza seats and tāʾ marbūṭa/hāʾ do not matter, small slips are forgiven */
export function TypeCard({ ex, onCheck }: { ex: Extract<Ex, { k: "type" }>; onCheck: Check }) {
  const lt = useLT();
  const [v, setV] = useState("");
  const { canSpeak, speak } = useArabicVoice();
  const dict = !!ex.say && canSpeak;
  const ok = () => {
    const a = ex.target.split(/\s+/), b = v.trim().split(/\s+/);
    return normalizeArabic(v) === normalizeArabic(ex.target) || (a.length === b.length && a.every((w, i) => same(w, b[i])));
  };
  const submit = () => { if (v.trim()) onCheck(ok(), ex.target); };
  const key = "h-[42px] rounded-sm border border-line bg-surface transition hover:border-[rgb(var(--hm-gold))]/70";
  return (
    <div className="flex flex-col gap-4">
      <Prompt>{dict ? lt("typeDict") : lt("typeQ")}</Prompt>
      {dict ? (
        <button type="button" onClick={() => speak(ex.say!)} aria-label={lt("listen")} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
          <IconSpeaker className="h-7 w-7" />
        </button>
      ) : <p className="font-display text-center text-[22px] leading-snug">{ex.q}</p>}
      <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} dir="rtl" lang="ar" autoComplete="off" autoCorrect="off" spellCheck={false}
        aria-label={dict ? lt("typeDict") : lt("typeQ")} placeholder="…"
        className="font-arabic min-h-[60px] w-full rounded-lg border border-line bg-surface px-3.5 text-[26px] outline-none focus:border-[rgb(var(--hm-gold))]" />
      <p className="text-center text-[13px] text-muted">{lt("typeHint")}</p>
      <div dir="rtl" role="group" aria-label={lt("typePad")} className="flex flex-wrap justify-center gap-1.5">
        {PAD.map((c) => (
          <button key={c} type="button" onClick={() => setV(v + c)} aria-label={c} className={cx(key, "font-arabic w-[38px] text-[20px] leading-none")}>{c}</button>
        ))}
        <button type="button" onClick={() => setV(v + " ")} className={cx(key, "px-3 text-[13px] font-semibold text-muted")}>{lt("space")}</button>
        <button type="button" onClick={() => setV(v.slice(0, -1))} className={cx(key, "px-3 text-[13px] font-semibold text-muted")}>{lt("del")}</button>
      </div>
      <CheckButton disabled={!v.trim()} onClick={submit} />
    </div>
  );
}

/** speaking: the browser's speech recognition (Web Speech API, ar-SA), scored with align() from the recite check; skippable */
export function SpeakCard({ ex, onCheck, onSkip }: { ex: Extract<Ex, { k: "speak" }>; onCheck: Check; onSkip: () => void }) {
  const lt = useLT();
  const words = useMemo(() => ex.target.replace(/[.،,؟?!]/g, "").split(/\s+/).filter(Boolean), [ex.target]);
  const check = useWordCheck(words);
  const n = check.ok?.filter(Boolean).length ?? 0;
  const listening = check.state === "listening";
  const unavailable = check.state === "unsupported" || check.state === "denied" || check.state === "failed";
  return (
    <div className="flex flex-col gap-4">
      <Prompt>{lt("speakQ")}</Prompt>
      <p lang="ar" dir="rtl" className="flex flex-wrap justify-center gap-x-2">
        {words.map((w, i) => <span key={i} className={cx("font-arabic text-[28px] leading-[1.8]", check.ok?.[i] && "text-accent")}>{w}</span>)}
      </p>
      <p className="text-center text-[15px] text-muted">{ex.q}</p>
      <SayButton text={ex.target} />
      {unavailable ? <p className="text-center text-sm leading-relaxed text-muted">{lt("speakNA")}</p> : null}
      {check.ok ? <p aria-live="polite" className="text-center text-sm font-semibold">{lt("speakHeard", { n, total: words.length })}</p> : null}
      {listening ? (
        <button type="button" onClick={check.stop} className="mx-auto inline-flex h-12 items-center gap-2 rounded-full bg-[rgb(var(--hm-gold))] px-5 text-[15px] font-bold text-white">
          <span aria-hidden className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />{lt("speakStop")}
        </button>
      ) : (
        <div className="grid gap-2">
          {check.state === "done" && check.ok ? <CheckButton onClick={() => onCheck(n / words.length >= 0.6, ex.target)} /> : null}
          {!unavailable ? (
            <button type="button" onClick={check.start}
              className={cx("mx-auto inline-flex h-12 items-center gap-2 rounded-full border border-accent px-5 text-[15px] font-bold", check.state === "done" ? "bg-surface text-accent" : "bg-accent text-white")}>
              <IconSpeaker className="h-[18px] w-[18px]" />{lt("speakStart")}
            </button>
          ) : null}
        </div>
      )}
      <TextButton onClick={onSkip} className="mx-auto !text-muted underline">{lt("skip")}</TextButton>
    </div>
  );
}

/** grammar spotting: the verse words come from the Quran API (never typed by hand); tap the asked word(s) */
export function SpotCard({ ex, onCheck }: { ex: Extract<Ex, { k: "spot" }>; onCheck: Check }) {
  const lt = useLT();
  const { lang } = useLang();
  const [words, setWords] = useState<VWord[] | null>(null);
  const [err, setErr] = useState(false);
  const [sel, setSel] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  useEffect(() => {
    let live = true;
    setWords(null); setErr(false); setSel([]);
    loadVerse(ex.key, lang).then((d) => { if (live) setWords(d.words); }).catch(() => { if (live) setErr(true); });
    return () => { live = false; };
  }, [ex.key, lang, tries]);
  const toggle = (p: number) => setSel(sel.includes(p) ? sel.filter((x) => x !== p) : [...sel, p]);
  const correct = words ? words.filter((w) => ex.pos.includes(w.position)).map((w) => w.text).join(" ") : "";
  return (
    <div className="flex flex-col gap-4">
      <Prompt>{ex.ask}</Prompt>
      <p className="text-center text-[13px] text-muted">{`${lt("spotHint")} · ${ex.key}`}</p>
      {err ? (
        <div className="grid justify-items-center gap-2">
          <p className="text-sm text-muted" role="status">{lt("spotOffline")}</p>
          <TextButton onClick={() => setTries(tries + 1)}>{lt("retry")}</TextButton>
        </div>
      ) : !words ? (
        <div className="flex justify-center py-5"><Spinner label={lt("spotLoading")} /></div>
      ) : (
        <div dir="rtl" className="flex flex-wrap justify-center gap-2">
          {words.map((w) => {
            const on = sel.includes(w.position);
            return (
              <button key={w.position} type="button" onClick={() => toggle(w.position)} aria-pressed={on} aria-label={`${w.text} – ${w.tr} – ${w.meaning}`}
                className={cx("rounded-md px-2.5 pb-1.5 transition", on ? "border-2 border-[rgb(var(--hm-gold))] bg-accent-soft" : "border border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70")}>
                <span lang="ar" className="font-arabic block text-[28px] leading-[1.85]">{w.text}</span>
                <span dir="auto" className="-mt-1 block max-w-[9rem] truncate text-[11px] text-muted">{w.meaning}</span>
              </button>
            );
          })}
        </div>
      )}
      <CheckButton disabled={!sel.length || !words} onClick={() => onCheck(sel.length === ex.pos.length && ex.pos.every((p) => sel.includes(p)), correct)} />
    </div>
  );
}

export function DialogueView({ lines, onNext }: { lines: Line[]; onNext: () => void }) {
  const lt = useLT();
  const { lang } = useLang();
  const { canSpeak, speak } = useArabicVoice();
  return (
    <div className="flex flex-col gap-3">
      <Prompt>{lt("dialogue")}</Prompt>
      {lines.map((l, i) => {
        const b = l.who === "b";
        const local = lang === "de" ? l.de : l.en;
        const body = (
          <>
            <Ar size={22} center={false}>{l.ar}</Ar>
            <span className="block text-[13.5px] leading-snug text-muted">{local}</span>
          </>
        );
        const cls = cx("relative block max-w-[88%] rounded-xl border border-line p-3 text-start", b ? "self-start bg-surface" : "self-end bg-accent-soft");
        // as in the app: speaker b at the start, speaker a at the end
        return canSpeak ? (
          <button key={i} type="button" onClick={() => speak(l.ar)} aria-label={`${lt("listen")}: ${local}`} className={cx(cls, "transition hover:border-[rgb(var(--hm-gold))]/70")}>
            {body}<IconSpeaker className="absolute end-2 top-2 h-3.5 w-3.5 text-[rgb(var(--hm-gold))]" />
          </button>
        ) : <div key={i} className={cls}>{body}</div>;
      })}
      <CheckButton onClick={onNext} label={lt("next")} />
    </div>
  );
}
