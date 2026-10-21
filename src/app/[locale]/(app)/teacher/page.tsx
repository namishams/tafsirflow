import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import TeacherDash from "@/components/teacher/TeacherDash";
import { teacherText } from "@/lib/teacherWeb";

// /teacher – dashboard of a teacher's students (live link through the Quran Talents network; not indexed)
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function TeacherPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tx = teacherText(locale);
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold rtl:tracking-normal"><Link href="/talents/me" className="hover:underline">Shams 2.0</Link></p>
      <h1 className="font-display mt-2 text-4xl">{tx.title}</h1>
      <p className="mt-2 text-muted">{tx.lead}</p>
      <TeacherDash locale={locale} />
    </div>
  );
}
