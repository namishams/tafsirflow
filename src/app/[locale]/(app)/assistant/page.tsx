import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { fillUi, tutorUi } from "@/lib/tutor/ui";
import AssistantClient from "./Client";

// The tutor (Dalil, or Hidaya for sisters who choose her) – the former assistant page. Texts: lib/tutor/ui.ts.
const texts = (locale: string) => {
  const ui = tutorUi(locale);
  return { title: fillUi(ui.title, { name: "Dalil" }), lead: fillUi(ui.lead, { name: "Dalil" }) };
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = texts(locale);
  return pageMeta(locale, "/assistant", `${c.title} | Quran Masterclass`, c.lead);
}

export default async function AssistantPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = texts(locale);
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-8">
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">{c.title}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">{c.lead}</p>
      <div className="mt-6"><Suspense fallback={<div className="min-h-[70dvh] rounded-[28px] border border-line" />}><AssistantClient /></Suspense></div>
    </main>
  );
}
