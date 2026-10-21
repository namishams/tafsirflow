"use client";
// One review round, mirrors mobile/src/features/srs/Review.tsx: the card turns over on a click, Space or Enter; then
// Again / Hard / Good / Easy by button, by the keys 1–4 or by swiping on a touch screen (left / down / right / up).
// "Again" (and "Hard" on a new card) comes back at the end of the round. prefers-reduced-motion turns the turn off.
import { useEffect, useMemo, useRef, useState } from "react";
import { today } from "@/lib/learning";
import { preview, type Grade } from "@/lib/learn/srs/fsrs";
import { useIntl } from "@/lib/learn/srs/format";
import { rateCard, readSrsState } from "@/lib/learn/srs/store";
import { useSrsT, type SrsKey } from "@/lib/learn/srs/texts";
import { useClip } from "@/components/learn/media";
import { shareOrCopy } from "@/components/learn/coursekit/share";
import { GoldButton, GoldLink, OutlineButton } from "@/components/learn/ui";
import { PracticeCelebrate } from "@/components/art/PracticeArt";
import { PlayButton, useCardFace } from "./CardFace";
import { useSrsWeb } from "./webTexts";

const LABEL: Record<Grade, SrsKey> = { 1: "again", 2: "hard", 3: "good", 4: "easy" };
const GRADES: Grade[] = [1, 2, 3, 4];

export function ReviewSession({ ids, backHref = "/cards" }: { ids: string[]; backHref?: string }) {
  const st = useSrsT();
  const sw = useSrsWeb();
  const nf = useIntl();
  const [queue, setQueue] = useState(ids);
  const [done, setDone] = useState({ n: 0, ok: 0 });
  const [flipped, setFlipped] = useState(false);
  const [round, setRound] = useState(0);
  const [copied, setCopied] = useState(false);
  const cur = queue[0];

  const rate = (g: Grade) => {
    if (!cur) return;
    rateCard(cur, g);
    setDone((d) => ({ n: d.n + 1, ok: d.ok + (g >= 2 ? 1 : 0) }));
    setFlipped(false);
    setRound((r) => r + 1);
    const due = readSrsState().cards[cur]?.m?.due ?? 0;
    setQueue((q) => (due <= today() && g <= 2 ? [...q.slice(1), cur] : q.slice(1)));
  };
  const live = useRef({ flipped, rate, cur }); live.current = { flipped, rate, cur };

  // keyboard: Space / Enter turn the card, 1–4 rate it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (!live.current.cur || e.metaKey || e.ctrlKey || e.altKey) return;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      if (!live.current.flipped && (e.key === " " || e.key === "Enter")) {
        if (el?.tagName === "BUTTON" || el?.tagName === "A") return; // the focused control handles it
        e.preventDefault(); setFlipped(true); return;
      }
      if (live.current.flipped && /^[1-4]$/.test(e.key)) { e.preventDefault(); live.current.rate(Number(e.key) as Grade); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!cur) {
    const body = st("sessionStats", { n: nf(done.n), ok: nf(done.ok) });
    return (
      <div className="grid justify-items-center gap-4 pt-4 text-center">
        <PracticeCelebrate className="h-28 w-auto" />
        <h2 className="font-display text-[28px]">{st("sessionDone")}</h2>
        <p className="text-[16px] text-muted">{body}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <GoldLink href={backHref}>{st("backToCards")}</GoldLink>
          {done.n > 0 && (
            <OutlineButton onClick={() => { void shareOrCopy({ title: st("sessionDone"), text: sw("shareReview", { n: nf(done.n) }), url: typeof location !== "undefined" ? `${location.origin}/cards` : undefined }).then((r) => setCopied(r === "copied")); }}>
              {sw("shareProgress")}
            </OutlineButton>
          )}
        </div>
        {copied && <p role="status" className="text-sm text-accent">{sw("copied")}</p>}
      </div>
    );
  }
  return (
    <div>
      <p className="mb-3 text-center text-[13px] font-semibold tabular-nums text-muted">{`${nf(done.n)} · ${nf(queue.length)}`}</p>
      <FlipCard key={`${cur}|${round}`} id={cur} seed={round} flipped={flipped} onFlip={() => setFlipped(true)} onRate={rate} />
      {flipped ? <Ratings id={cur} onRate={rate} /> : <GoldButton onClick={() => setFlipped(true)} className="mt-4 w-full">{sw("turn")}</GoldButton>}
      <p className="mt-3 text-center text-[12.5px] leading-relaxed text-muted">{flipped ? sw("keysBack") : sw("keysFront")}</p>
    </div>
  );
}

function Ratings({ id, onRate }: { id: string; onRate: (g: Grade) => void }) {
  const st = useSrsT();
  const nf = useIntl();
  const p = useMemo(() => preview(readSrsState().cards[id]?.m ?? null, today()), [id]);
  const cls: Record<Grade, string> = {
    1: "border-red-600/60 text-red-700 dark:text-red-400",
    2: "border-[rgb(var(--hm-gold))] text-[rgb(var(--hm-gold-d))]",
    3: "border-accent bg-accent-soft text-accent",
    4: "border-accent text-accent",
  };
  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {GRADES.map((g) => {
        const when = p[g] ? st("inDays", { n: nf(p[g]) }) : st("now");
        return (
          <button key={g} type="button" onClick={() => onRate(g)} aria-label={`${st(LABEL[g])}, ${when}`} aria-keyshortcuts={String(g)}
            className={`grid min-h-[60px] place-items-center rounded-md border bg-surface px-1 py-2 transition hover:opacity-80 ${cls[g]}`}>
            <span className="text-[14px] font-bold">{st(LABEL[g])}</span>
            <span className="text-[11.5px] text-muted">{when}</span>
          </button>
        );
      })}
    </div>
  );
}

function FlipCard({ id, seed, flipped, onFlip, onRate }: { id: string; seed: number; flipped: boolean; onFlip: () => void; onRate: (g: Grade) => void }) {
  const st = useSrsT();
  const face = useCardFace(id, seed);
  const clip = useClip();
  const start = useRef<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  // the word or verse is heard when the card turns over
  useEffect(() => { if (flipped && face.audio) clip.play(face.audio); }, [flipped]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDown = (e: React.PointerEvent) => { if (flipped && e.pointerType !== "mouse") start.current = { x: e.clientX, y: e.clientY }; };
  const onMove = (e: React.PointerEvent) => { if (start.current) setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y }); };
  const onUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    setDrag({ x: 0, y: 0 });
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y, ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax > 90 && ax > ay) onRate(dx > 0 ? 3 : 1);
    else if (ay > 90) onRate(dy < 0 ? 4 : 2);
  };
  const side = "[grid-area:1/1] [backface-visibility:hidden] min-h-[340px] rounded-2xl";
  return (
    <div className="relative [perspective:1400px]" style={{ touchAction: flipped ? "none" : undefined }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { start.current = null; setDrag({ x: 0, y: 0 }); }}>
      <div className="grid transition-transform duration-500 ease-[cubic-bezier(.3,.7,.2,1)] [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{ transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 40}deg) rotateY(${flipped ? 180 : 0}deg)`, transitionDuration: drag.x || drag.y ? "0ms" : undefined }}>
        <button type="button" onClick={onFlip} disabled={flipped} aria-hidden={flipped} tabIndex={flipped ? -1 : 0} aria-label={face.ready ? undefined : st("loading")}
          className={`${side} stage girih grid place-items-center border border-[rgb(var(--gold))]/40 p-6 text-start text-[#eef0f3] sm:p-8`}>
          <span className="relative w-full">{face.front}</span>
        </button>
        <div aria-hidden={!flipped} className={`${side} hm-card relative grid place-items-center p-6 [transform:rotateY(180deg)] sm:p-8`}>
          <div className="grid w-full justify-items-center gap-3">
            {face.back ?? <p className="text-center text-[15px] text-muted">{face.error ? st("loadError") : st("loading")}</p>}
            {face.audio && <PlayButton label={st("play")} onClick={() => clip.play(face.audio!)} />}
          </div>
        </div>
      </div>
      {face.audio && !flipped && <span className="absolute end-3 top-3"><PlayButton onStage label={st("play")} onClick={() => clip.play(face.audio!)} /></span>}
    </div>
  );
}
