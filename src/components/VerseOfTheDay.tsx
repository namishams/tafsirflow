import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import VerseAudio from "./VerseAudio";
import { RECITERS, getChapter, getResources, getVerseByKey, localAudioUrl, pickTranslation } from "@/lib/quran";
import { verseOfDayKey } from "@/lib/votd";

// Verse of the day, rendered on the server (visible to search engines), changes every day
export default async function VerseOfTheDay({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home2" });
  let data: { key: string; chapter: string; verse: Awaited<ReturnType<typeof getVerseByKey>> } | null = null;
  const key = verseOfDayKey();
  const [c, v] = key.split(":").map(Number);
  try {
    const res = await getResources();
    const [chap, verse] = await Promise.all([getChapter(c, locale), getVerseByKey(key, locale, pickTranslation(locale, res.translations))]);
    data = { key, chapter: chap.name_simple, verse };
  } catch {
    return null; // never break the home page because of a content hiccup
  }
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <p className="eyebrow">{t("votdTitle")} · {new Date().toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", day: "numeric", month: "long", year: "numeric" })}</p>
        <blockquote className="mt-6 max-w-4xl">
          <p className="font-arabic text-[2rem] leading-[2.2] sm:text-5xl sm:leading-[2.1]" dir="rtl" lang="ar">{data.verse.text_uthmani}</p>
          {data.verse.translation && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink sm:text-xl">{data.verse.translation.replace(/<[^>]+>/g, "")}</p>}
          <footer className="mt-4 text-sm font-semibold text-muted">{data.chapter} · {data.key}</footer>
        </blockquote>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <VerseAudio src={localAudioUrl(RECITERS[0], c, v)} label={t("votdPlay")} />
          <Link href={`/surah/${c}?v=${v}`} className="inline-flex h-12 items-center rounded-md border border-ink px-5 text-[15px] font-bold hover:bg-ink hover:text-bg">{t("votdHear")}</Link>
          <Link href={`/surah/${c}?v=${v}&m=2`} className="inline-flex h-12 items-center rounded-md border border-line px-5 text-[15px] font-bold hover:border-ink">{t("votdMemorize")}</Link>
        </div>
      </div>
    </section>
  );
}
