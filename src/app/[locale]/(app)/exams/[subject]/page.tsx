// /exams/<subject> – one subject of the examination centre (mirrors mobile/src/app/exams/[subject].tsx)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { SUBJECTS, subjectMeta } from "@/lib/learn/qbank/bank";
import { qbankMeta } from "@/components/learn/qbank/meta";
import { QbankSubject } from "@/components/learn/qbank/Screens";

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; subject: string }> }): Promise<Metadata> {
  const { locale, subject } = await params;
  const m = qbankMeta(locale, "subject", subject);
  return pageMeta(locale, `/exams/${subject}`, m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string; subject: string }> }) {
  const { locale, subject } = await params;
  if (!subjectMeta(subject)) notFound();
  setRequestLocale(locale);
  return <QbankSubject id={subject} />;
}
