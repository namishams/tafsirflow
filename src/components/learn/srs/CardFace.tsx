"use client";
// What a card shows on its front (on the dark stage) and back (gilded card), for every card kind; mirrors
// mobile/src/features/srs/CardFace.tsx. Quran text always comes from the Quran API or the word data, never from the card.
import { useMemo } from "react";
import { useLang } from "@/lib/learn/i18n";
import { meaning } from "@/lib/vocabI18n";
import { wordClipUrl } from "@/lib/vocabStudy";
import { tajweedQ, vocabWord } from "@/lib/learn/srs/cardData";
import { kindOf, refOf } from "@/lib/learn/srs/decks";
import { useSrsT } from "@/lib/learn/srs/texts";
import { clozePositions, type VWord } from "@/lib/learn/srs/verse";
import { useVerseData, useWordPosition } from "@/lib/learn/srs/verseHooks";
import { IconSpeaker } from "@/components/Icons";

export type Face = { front: React.ReactNode; back: React.ReactNode; audio: string | null; ready: boolean; error?: boolean };

const Ar = ({ children, size = 44, dark = true }: { children: string; size?: number; dark?: boolean }) => (
  <p lang="ar" dir="rtl" className={`font-arabic text-center ${dark ? "text-white" : ""}`} style={{ fontSize: size, lineHeight: 1.9 }}>{children}</p>
);
const Kicker = ({ children }: { children: string }) => (
  <p className="mb-2 text-center text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal">{children}</p>
);
const strong = "text-center text-[22px] font-bold leading-snug";
const muted = "text-center text-[15px] leading-relaxed text-muted";

export function useCardFace(id: string, seed: number): Face {
  const { lang } = useLang();
  const st = useSrsT();
  const kind = kindOf(id);
  const ref = refOf(id);
  const word = kind === "word" || kind === "name" ? vocabWord(ref, lang) : undefined;
  const pos = useWordPosition(word, lang);
  const verseKey = kind === "verse" || kind === "dua" ? ref : kind === "qword" ? ref.split(":").slice(0, 2).join(":") : null;
  const verse = useVerseData(verseKey, lang);
  const words = useMemo(() => verse?.data?.words ?? [], [verse]);
  const hidden = useMemo(() => clozePositions(words, seed), [words, seed]);

  if (word) {
    return {
      ready: true, audio: word.ex && pos ? wordClipUrl(word.ex.key, pos) : null,
      front: <div className="text-center"><Kicker>{kind === "name" ? st("nameOfAllah") : st("whatMeans")}</Kicker><Ar size={52}>{word.ar}</Ar></div>,
      back: (
        <div className="grid justify-items-center gap-1.5">
          <Ar size={34} dark={false}>{word.ar}</Ar>
          <p className={strong}>{meaning(word, lang)}</p>
          {lang !== "ar" && <p className={muted}>{word.tr}</p>}
          {word.root && <p lang="ar" dir="rtl" className="font-arabic text-center text-[18px] text-muted">{word.root}</p>}
          {word.ex && <p className={`${muted} !text-[13px]`}>{st("verse", { key: word.ex.key })}</p>}
        </div>
      ),
    };
  }
  if (kind === "tajweed") {
    const q = tajweedQ(ref, lang);
    if (!q) return { ready: false, error: true, audio: null, front: <p className="text-center text-white/70">{st("loadError")}</p>, back: null };
    return {
      ready: true, audio: null,
      front: (
        <div className="grid w-full gap-2.5">
          <Kicker>{`${st("tajweedRule")} · ${q.title}`}</Kicker>
          <p className="text-center text-[19px] font-bold leading-snug text-white">{q.q}</p>
          <ul className="grid gap-1">{q.options.map((o, i) => <li key={i} className="text-center text-[15px] leading-relaxed text-white/75">{o}</li>)}</ul>
        </div>
      ),
      back: <div className="grid gap-2.5"><p className={strong}>{q.options[q.answer]}</p><p className={muted}>{q.explain}</p></div>,
    };
  }
  if (!verse || (!verse.data && !verse.error)) return { ready: false, audio: null, front: <p className="text-center text-white/60">{st("loading")}</p>, back: null };
  if (!verse.data) return { ready: false, error: true, audio: null, front: <p className="text-center text-white/75">{st("loadError")}</p>, back: null };
  const data = verse.data;
  if (kind === "qword") {
    const p = Number(ref.split(":")[2]);
    const w = data.words.find((x) => x.position === p);
    if (!w) return { ready: false, error: true, audio: null, front: <p className="text-center text-white/75">{st("loadError")}</p>, back: null };
    return {
      ready: true, audio: wordClipUrl(data.key, p),
      front: <div className="text-center"><Kicker>{st("whatMeans")}</Kicker><Ar size={52}>{w.text}</Ar></div>,
      back: (
        <div className="grid justify-items-center gap-1.5">
          <Ar size={34} dark={false}>{w.text}</Ar>
          {w.meaning && <p className={strong}>{w.meaning}</p>}
          {w.tr && <p className={muted}>{w.tr}</p>}
          <p className={`${muted} !text-[13px]`}>{st("verse", { key: data.key })}</p>
        </div>
      ),
    };
  }
  // verse / dua: cloze
  const line = (ws: VWord[], reveal: boolean, dark: boolean) => (
    <p lang="ar" dir="rtl" className={`font-arabic text-center text-[26px] leading-[2.05] ${dark ? "text-white" : ""}`}>
      {ws.map((w, i) => {
        const txt = `${i ? " " : ""}${w.text}`;
        if (!hidden.has(w.position)) return <span key={w.position}>{txt}</span>;
        return reveal
          ? <span key={w.position} className="rounded bg-[rgb(var(--hm-gold))]/20 text-[rgb(var(--hm-gold-d))]">{txt}</span>
          : <span key={w.position}>{i ? " " : ""}<span role="img" aria-label="…" className="inline-block h-[1.1em] rounded bg-[rgb(214_180_108/0.28)] align-middle" style={{ width: `${Math.max(1.6, w.text.length * 0.42)}em` }} /></span>;
      })}
    </p>
  );
  return {
    ready: true, audio: data.audio,
    front: <div className="w-full"><Kicker>{`${kind === "dua" ? st("dua") : st("verse", { key: data.key })} · ${st("recite")}`}</Kicker>{line(data.words, false, true)}</div>,
    back: (
      <div className="grid w-full gap-2">
        {line(data.words, true, false)}
        {data.translation && <p className={muted}>{data.translation}</p>}
        <p className={`${muted} !text-[13px]`}>{st("verse", { key: data.key })}</p>
      </div>
    ),
  };
}

export function PlayButton({ onClick, label, onStage }: { onClick: () => void; label: string; onStage?: boolean }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onClick(); }} aria-label={label} title={label}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${onStage ? "border-[rgb(var(--gold))]/50 text-[rgb(var(--gold))] hover:bg-white/[0.06]" : "border-line text-accent hover:bg-accent-soft"}`}>
      <IconSpeaker />
    </button>
  );
}
