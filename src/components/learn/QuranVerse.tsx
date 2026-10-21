"use client";
// A Quran verse by its key ("2:255"), from the website's own Quran store (/api/q via src/lib/learn/quran.ts): the
// Uthmani text, the translation in the page's language (none in Arabic, like the reader), the reference as a link into
// the reader and an optional recitation of the chosen reciter. No verse text is ever typed by hand.
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLang } from "@/lib/learn/i18n";
import { audioUrl, getVerseByKey, type SingleVerse } from "@/lib/learn/quran";
import { useAllowedReciter } from "@/lib/learn/reciter";
import { verseHref } from "@/lib/learn/coursekit/links";
import { IconPause, IconPlay } from "@/components/Icons";

const cache = new Map<string, Promise<SingleVerse>>();
export function loadVerseByKey(key: string, lang: string) {
  const k = `${key}:${lang}`;
  let p = cache.get(k);
  if (!p) { p = getVerseByKey(key, lang); p.catch(() => cache.delete(k)); cache.set(k, p); }
  return p;
}

export function useVerseByKey(key: string | null) {
  const { lang } = useLang();
  const [v, setV] = useState<SingleVerse | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!key) return;
    let live = true;
    setV(null); setError(false);
    loadVerseByKey(key, lang).then((x) => { if (live) setV(x); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [key, lang]);
  return { verse: v, error };
}

export default function QuranVerse({ verseKey, translation = true, audio = true, size = "text-[28px] sm:text-[32px]", className = "", dark = false }: {
  verseKey: string; translation?: boolean; audio?: boolean; size?: string; className?: string; dark?: boolean;
}) {
  const { verse, error } = useVerseByKey(verseKey);
  const reciter = useAllowedReciter();
  const ref = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  const [s, a] = verseKey.split(":").map(Number);
  useEffect(() => () => { ref.current?.pause(); }, []);
  const toggle = () => {
    if (!ref.current) {
      ref.current = new Audio(audioUrl(reciter, s, a));
      ref.current.onended = () => setOn(false);
      ref.current.onpause = () => setOn(false);
      ref.current.onplay = () => setOn(true);
    }
    if (on) ref.current.pause();
    else { window.dispatchEvent(new Event("tf-audio-start")); void ref.current.play().catch(() => setOn(false)); }
  };
  const muted = dark ? "text-white/65" : "text-muted";
  return (
    <figure className={`rounded-xl border p-4 sm:p-5 ${dark ? "border-white/10 bg-white/[0.04]" : "border-line bg-surface"} ${className}`}>
      {verse ? (
        <p lang="ar" dir="rtl" className={`font-arabic leading-[2.05] ${size} ${dark ? "text-white" : "text-ink"}`}>{verse.text_uthmani}</p>
      ) : error ? (
        <p className={`text-sm ${muted}`}>{verseKey}</p>
      ) : (
        <span aria-hidden className="block h-12 animate-pulse rounded-md bg-line/50" />
      )}
      {translation && verse?.translation && <p className={`mt-3 text-[15px] leading-relaxed ${dark ? "text-white/80" : "text-ink/85"}`}>{verse.translation}</p>}
      <figcaption className={`mt-3 flex flex-wrap items-center gap-3 text-[13px] ${muted}`}>
        <Link href={verseHref(verseKey)} className={`font-semibold tabular-nums hover:underline ${dark ? "text-[rgb(var(--gold))]" : "text-accent"}`}>{verseKey}</Link>
        {audio && Number.isFinite(s) && Number.isFinite(a) && (
          <button type="button" onClick={toggle} aria-label={`${verseKey} ${reciter.name}`} className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold ${dark ? "border-white/20 hover:border-white/50" : "border-line hover:border-[rgb(var(--hm-gold))]"}`}>
            <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{on ? <IconPause /> : <IconPlay />}</span>{reciter.name}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
