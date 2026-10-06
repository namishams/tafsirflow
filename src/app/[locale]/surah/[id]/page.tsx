import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Player from "@/components/Player";

export default async function SurahPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound();
  return <Player chapterId={n} />;
}
