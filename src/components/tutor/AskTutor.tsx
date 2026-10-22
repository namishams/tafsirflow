"use client";
import { Link } from "@/i18n/navigation";
import { TutorFace } from "./TutorChat";
import { useTutor, type TutorContext } from "./state";
import { useAuth } from "@/lib/learn/auth";

// The entry to the tutor from a learning context (lesson, quiz, Shams verse, reader verse, carousel): a glass capsule
// with the tutor's face that opens /assistant with the context and, when given, a first question (app: AskTutor.tsx).
type Kind = "ask" | "why" | "verse" | "lesson";
export default function AskTutor({ context, kind = "ask", className = "" }: { context: TutorContext; kind?: Kind; className?: string }) {
  const { ui, f, persona } = useTutor();
  const { user } = useAuth();
  if (!user) return null; // the tutor is offered to signed-in learners only
  const label = kind === "why" ? ui.why : kind === "verse" ? ui.explainVerse : kind === "lesson" ? ui.lessonAsk : f(ui.ask);
  const q = kind === "why" ? ui.why : kind === "verse" ? ui.explainVerse : undefined;
  return (
    <Link href={{ pathname: "/assistant", query: { ctx: JSON.stringify(context), ...(q ? { q } : {}) } }}
      className={`inline-flex items-center gap-2 rounded-full border border-[rgb(var(--gold)/0.6)] bg-[rgb(var(--gold)/0.08)] py-1.5 pe-4 ps-1.5 text-sm font-semibold backdrop-blur-md transition hover:border-[rgb(var(--gold))] active:scale-[0.98] ${className}`}>
      <TutorFace persona={persona} size={28} still />{label}
    </Link>
  );
}
