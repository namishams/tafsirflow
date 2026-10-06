"use client";
import { useEffect, useState } from "react";

type T = { install: string; installed: string; apk: string; apkSoon: string; play: string };
type Prompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// Install buttons: the browser's own "install app" prompt (Android/Chrome, desktop), the APK and – once published – Google Play
export default function AppInstall({ t, playUrl }: { t: T; playUrl: string }) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [apk, setApk] = useState(false);
  useEffect(() => {
    const on = (e: Event) => { e.preventDefault(); setPrompt(e as Prompt); };
    window.addEventListener("beforeinstallprompt", on);
    setStandalone(window.matchMedia("(display-mode: standalone)").matches);
    fetch("/api/app/android", { method: "HEAD" }).then((r) => setApk(r.ok)).catch(() => undefined);
    return () => window.removeEventListener("beforeinstallprompt", on);
  }, []);
  return (
    <div className="flex flex-wrap gap-3">
      {playUrl && <a href={playUrl} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{t.play}</a>}
      {standalone ? <span className="inline-flex h-12 items-center rounded-full border border-white/20 px-5 text-sm text-white/80">{t.installed}</span>
        : prompt && <button onClick={async () => { await prompt.prompt(); setPrompt(null); }} className={`${playUrl ? "border border-white/30 hover:border-white" : "btn-gold"} inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold`}>{t.install}</button>}
      {apk ? <a href="/api/app/android" className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-[15px] font-semibold hover:border-white">{t.apk}</a>
        : <span className="inline-flex h-12 items-center rounded-full border border-white/15 px-5 text-sm text-white/55">{t.apkSoon}</span>}
    </div>
  );
}
