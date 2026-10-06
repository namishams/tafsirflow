import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Player from "@/components/Player";

export default async function SurahPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ v?: string }> }) {
  const { locale, id } = await params;
  const { v } = await searchParams;
  setRequestLocale(locale);
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound();
  return <Player chapterId={n} startVerse={Math.max(1, Number(v) || 1)} />;
}
