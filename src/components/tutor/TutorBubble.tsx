"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { readJSON } from "@/lib/storage";
import { BUBBLE_KEY, screenContext } from "@/lib/tutor/next";
import { TutorFace } from "./TutorChat";
import { useStorageVersion, useTutor } from "./state";

// "Ask the tutor" on every learning screen (app: mobile/src/features/tutor/TutorBubble.tsx): a small glass tab with the
// tutor's face, snapped to the trailing edge at mid height – never over the tab bar, docks or the primary buttons at
// the bottom. It opens /assistant with the screen's context (screen, surah:ayah, course and lesson id). Hidden in the
// tutor's settings. Quotas, consent and the AI note stay in the chat itself.
export default function TutorBubble() {
  const path = usePathname();
  const sp = useSearchParams();
  const v = useStorageVersion();
  const { ui, f, persona } = useTutor();
  const [hidden, setHidden] = useState(true);
  useEffect(() => { setHidden(readJSON<{ hidden?: boolean }>(BUBBLE_KEY, {}).hidden === true); }, [v]);
  const ctx = screenContext(path, { v: sp.get("v") ?? undefined, s: sp.get("s") ?? undefined });
  if (hidden || !ctx) return null;
  const label = f(ui.ask);
  return (
    <Link href={{ pathname: "/assistant", query: { ctx: JSON.stringify(ctx) } }} aria-label={`${label} (${ui.ai})`} title={`${label} (${ui.ai})`}
      className="fixed end-0 top-[58%] z-40 flex items-center gap-1 rounded-s-full border border-e-0 border-[rgb(var(--gold)/0.6)] bg-[rgb(var(--surface)/0.78)] py-1 pe-1.5 ps-1 shadow-[0_8px_24px_rgba(6,40,30,0.18)] backdrop-blur-xl transition hover:pe-3 print:hidden">
      <TutorFace persona={persona} size={40} still />
      <span className="rounded-full border border-[rgb(var(--gold)/0.7)] px-1 text-[9.5px] font-bold tracking-wider text-[rgb(var(--gold))]">{ui.ai}</span>
    </Link>
  );
}
