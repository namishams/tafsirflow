"use client";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import TutorChat from "@/components/tutor/TutorChat";
import { useTutor, type TutorContext } from "@/components/tutor/state";
import { useAuth } from "@/lib/learn/auth";

/** reads ?ctx=<json>&q=<question> of an entry point and opens the tutor with them; signed-in learners only */
export default function AssistantClient() {
  const sp = useSearchParams();
  const { user, ready } = useAuth();
  const { ui, f } = useTutor();
  const ctx = sp.get("ctx"), q = sp.get("q");
  const context = useMemo<TutorContext | null>(() => { try { return ctx ? (JSON.parse(ctx) as TutorContext) : null; } catch { return null; } }, [ctx]);
  if (!ready) return <div className="min-h-[70dvh] rounded-[28px] border border-line" />;
  if (!user) {
    return (
      <div className="rounded-[28px] border border-line p-6 text-center">
        <p className="text-[15px] leading-relaxed text-muted">{f(ui.login)}</p>
        <Link href="/account" className="btn-gold mt-4 inline-flex h-11 items-center rounded-full px-5 text-[14px] font-bold">{ui.signIn}</Link>
      </div>
    );
  }
  return <TutorChat context={context} initial={q ? q.slice(0, 800) : undefined} />;
}
