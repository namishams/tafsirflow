"use client";
import { useState } from "react";
import { statQuiz } from "@/lib/learn/feed/statsStore";
import type { WebCard } from "@/lib/feedWeb/types";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import { AppIcon } from "./icons";
import { GoldFrame, QuizBlock, VerseBlock } from "./parts";
import { STAGE, toneGradient, toneOf } from "./tokens";
import { isKnowledge } from "./kinds";

// The text of a post on the dark stage: library posts (hadith, tafsir, dua, words, articles; the Arabic on top, a serif
// title, the text) and knowledge posts (name, quiz, course, tadabbur; verse, gold title, bullets, tap-to-answer quiz).
// Port of mobile/src/features/feed/LibraryPost.tsx `Card` and KnowledgePost.tsx `Body`.

export const SERIF = "'Fraunces Variable', Georgia, serif";

/** a library post: Arabic, serif title, text */
export function LibBody({ card, tall }: { card: WebCard; tall?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3 text-center">
      {card.arabic ? <p dir="rtl" lang="ar" className={`font-arabic text-[22px] leading-[1.9] text-white ${tall ? "line-clamp-[10]" : "line-clamp-[7]"}`}>{card.arabic}</p> : null}
      <p dir="auto" className="text-[19px] font-semibold leading-[1.3]" style={{ fontFamily: SERIF, color: STAGE.cream }}>{card.title}</p>
      {card.body ? <p dir="auto" className={`whitespace-pre-line text-[14.5px] leading-[1.55] text-white/90 ${tall ? "line-clamp-[14]" : "line-clamp-[9]"}`}>{card.body}</p> : null}
    </div>
  );
}

/** a knowledge post: Arabic, the verse, the gold title, text, bullets, quiz, notes */
export function KnowBody({ card, full }: { card: WebCard; full?: boolean }) {
  const T = useFeedTexts();
  const hasQuiz = !!card.quiz;
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)] ${full ? "gap-3.5" : "gap-[11px]"}`}>
      {card.arabic && !card.word ? <p dir="rtl" lang="ar" className={`line-clamp-2 text-center font-arabic text-white ${full ? "text-[46px] leading-[1.8]" : "text-[36px] leading-[1.8]"}`}>{card.arabic}</p> : null}
      {card.word ? (
        <div className="grid gap-1 text-center">
          <p dir="rtl" lang="ar" className="font-arabic text-[56px] leading-[1.6]" style={{ color: "rgb(233,207,153)" }}>{card.word.ar}</p>
          {card.word.tl ? <p className="text-[16px] italic" style={{ color: STAGE.textSoft }}>{card.word.tl}</p> : null}
        </div>
      ) : null}
      {card.verse && !hasQuiz && !card.word && !card.group ? <VerseBlock verse={card.verse} mark={card.words} full={full} onFound={(ok) => { if (ok) statQuiz(true); }} /> : null}
      <h3 className={`font-display ${hasQuiz ? "text-start" : "text-center"} ${full ? "text-[23px] leading-[1.3]" : "text-[18.5px] leading-[1.35]"}`} style={{ color: STAGE.gold }}>{card.word ? card.word.tr : card.title}</h3>
      {hasQuiz && card.verse ? <VerseBlock verse={card.verse} mark={card.words} full={full} /> : null}
      {card.word && card.verse ? <VerseBlock verse={card.verse} mark={card.word ? [card.word.pos] : card.words} full={full} /> : null}
      {card.body && !card.word ? <p dir="auto" className={`whitespace-pre-line text-white/90 ${card.bullets?.length ? "text-start" : "text-center"} ${full ? "line-clamp-[12] text-[15.5px] leading-6" : "line-clamp-[8] text-[14.5px] leading-[1.5]"}`}>{card.body}</p> : null}
      {card.group?.length ? <div className="grid gap-3">{card.group.map((v) => <VerseBlock key={v.key} verse={v} full={full} />)}</div> : null}
      {card.bullets?.length && !card.group ? (
        <ul className="grid gap-[7px]">
          {card.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-[9px]">
              <span aria-hidden className="mt-[7px] h-[7px] w-[7px] shrink-0 rotate-45" style={{ background: STAGE.gold }} />
              <span dir="auto" className={`text-white/85 ${full ? "text-[14.5px] leading-[22px]" : "text-[13.5px] leading-5"}`}>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {hasQuiz ? <QuizBlock card={card} full={full} /> : null}
      {card.note || card.madhhab ? (
        <div className="grid gap-1 border-s-2 ps-2.5" style={{ borderColor: STAGE.goldSoft }}>
          {card.note ? <p className="text-[12px] leading-[17px] text-white/70">{card.note}</p> : null}
          {card.madhhab ? <p className="text-[12px] leading-[17px] text-white/70">{T.know.madhhab}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

/** the body that fits the card kind */
export function CardBody({ card, full }: { card: WebCard; full?: boolean }) {
  return isKnowledge(card) || card.kind === "word" ? <KnowBody card={card} full={full} /> : <LibBody card={card} tall={full} />;
}

/** an image over the post's colour; the credit and licence link below it are always shown with it */
export function CardImage({ card }: { card: WebCard }) {
  const T = useFeedTexts();
  const [ok, setOk] = useState(false);
  const img = card.image;
  if (!img) return null;
  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden" style={{ background: toneGradient(toneOf(card.id), 150) }}>
        <div className="fd-lattice absolute inset-0 opacity-70" aria-hidden />
        <GoldFrame inset={7} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.url} alt={card.title} loading="lazy" decoding="async" onLoad={() => setOk(true)} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${ok ? "opacity-100" : "opacity-0"}`} />
      </div>
      {img.credit ? (
        img.licenseUrl
          ? <a href={img.licenseUrl} target="_blank" rel="noopener noreferrer" className="mt-1.5 block px-3.5 text-[10.5px] leading-[14px] text-muted hover:underline">{T.feed.imageBy.replace("{credit}", img.credit)}</a>
          : <p className="mt-1.5 px-3.5 text-[10.5px] leading-[14px] text-muted">{T.feed.imageBy.replace("{credit}", img.credit)}</p>
      ) : null}
    </div>
  );
}

export { AppIcon };
