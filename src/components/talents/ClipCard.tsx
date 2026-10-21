"use client";
import { useRef, useState } from "react";

// One recitation on the public profile: the verse (text from Quran.com, rendered by the server) and a play button.
// The file is private: it streams only for signed-in members (cookie), otherwise a sign-in hint shows.
export default function ClipCard({ id, verseKey, arabic, likes, l }: { id: string; verseKey: string | null; arabic: string; likes: number; l: { listen: string; pause: string; listenSignIn: string; likes: string } }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const play = async () => {
    if (playing) { audio.current?.pause(); return; }
    const r = await fetch(`/api/community/media/${id}`, { method: "GET", headers: { Range: "bytes=0-1" } }).catch(() => null);
    if (!r || !r.ok) { setBlocked(true); return; }
    if (!audio.current) {
      audio.current = new Audio(`/api/community/media/${id}`);
      audio.current.onended = () => setPlaying(false);
      audio.current.onpause = () => setPlaying(false);
      audio.current.onplay = () => setPlaying(true);
    }
    void audio.current.play().catch(() => setBlocked(true));
  };
  return (
    <figure className="stage girih relative flex aspect-[2/3] flex-col justify-between overflow-hidden rounded-md p-3 text-[#eef0f3]">
      <span className="illum-frame" />
      <figcaption className="relative text-center text-[11px] font-semibold tracking-[0.18em] text-[rgb(var(--gold))]">{verseKey}</figcaption>
      <p dir="rtl" lang="ar" className="font-arabic relative line-clamp-5 text-center text-[17px] leading-[2] text-[#f3e2b6]">{arabic}</p>
      <div className="relative flex items-center justify-between gap-2 text-[12px]">
        <button type="button" onClick={play} className="inline-flex h-8 items-center rounded-full bg-[rgb(var(--gold))] px-3 font-bold text-[rgb(8,38,29)]" aria-label={`${playing ? l.pause : l.listen} ${verseKey ?? ""}`}>
          {playing ? l.pause : l.listen}
        </button>
        <span className="text-white/70">{likes} {l.likes}</span>
      </div>
      {blocked ? <p role="status" className="relative mt-1 text-center text-[11.5px] text-[rgb(var(--gold))]">{l.listenSignIn}</p> : null}
    </figure>
  );
}
