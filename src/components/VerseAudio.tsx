"use client";
import { useRef, useState } from "react";
import { IconPause, IconPlay } from "./Icons";

// One-tap player for a single verse (self-hosted file)
export default function VerseAudio({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);
  return (
    <>
      <button
        onClick={() => (on ? ref.current?.pause() : ref.current?.play().catch(() => setOn(false)))}
        aria-label={label}
        className="inline-flex h-12 items-center gap-2 rounded-md bg-accent px-5 text-[15px] font-bold text-white hover:brightness-110"
      >
        {on ? <IconPause /> : <IconPlay />}<span>{label}</span>
      </button>
      <audio ref={ref} src={src} preload="none" onPlay={() => setOn(true)} onPause={() => setOn(false)} onEnded={() => setOn(false)} />
    </>
  );
}
