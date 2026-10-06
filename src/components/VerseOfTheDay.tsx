import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import VerseAudio from "./VerseAudio";
import SocialBar from "./SocialBar";
import { RECITERS, getChapter, getResources, getVerseByKey, localAudioUrl, pickTranslation } from "@/lib/quran";
import { verseOfDayKey } from "@/lib/votd";
import { HomeArch, StarGlyph } from "./art/HomeOrnaments";
import { Rosette } from "./Ornaments";

// Verse of the day, rendered on the server (visible to search engines), changes every day.
// Shown inside a marble mihrab arch on a warm ivory ground.
export default async function VerseOfTheDay({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home2" });
  let data: { key: string; chapter: string; arabic: string; verse: Awaited<ReturnType<typeof getVerseByKey>> } | null = null;
  const key = verseOfDayKey();
  const [c, v] = key.split(":").map(Number);
  try {
    const res = await getResources();
    const [chap, verse] = await Promise.all([getChapter(c, locale), getVerseByKey(key, locale, pickTranslation(locale, res.translations))]);
    data = { key, chapter: chap.name_simple, arabic: chap.name_arabic, verse };
  } catch {
    return null; // never break the home page because of a content hiccup
  }
  const date = new Date().toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", day: "numeric", month: "long", year: "numeric" });
  return (
    <section className="hm-warm overflow-hidden">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-5 sm:py-20">
        <HomeArch ratio={0.3} lift={0.19} className="hm-arch-shadow">
          <div className="relative px-5 pb-9 text-center sm:px-14 sm:pb-12">
            <p className="hm-k relative text-[rgb(var(--hm-gold-d))]">{t("votdTitle")}</p>
            <p className="mt-1.5 text-[13px] text-muted">{date}</p>
            <blockquote className="mt-6">
              <p className="font-arabic text-[1.9rem] leading-[2.2] text-ink sm:text-[2.75rem] sm:leading-[2.1]" dir="rtl" lang="ar">{data.verse.text_uthmani}</p>
              {data.verse.translation && <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-ink/90 sm:text-xl">{data.verse.translation.replace(/<[^>]+>/g, "")}</p>}
              <footer className="mt-5 flex items-center justify-center gap-3 text-sm font-semibold text-muted">
                <span aria-hidden className="h-px w-10 bg-gradient-to-l from-[rgb(var(--hm-gold))] to-transparent" />
                <StarGlyph size={10} className="text-[rgb(var(--hm-gold))]" />
                <span>{locale === "ar" ? <span className="font-arabic text-base">{`سورة ${data.arabic}`}</span> : data.chapter} · <span className="tabular-nums">{data.key}</span></span>
                <StarGlyph size={10} className="text-[rgb(var(--hm-gold))]" />
                <span aria-hidden className="h-px w-10 bg-gradient-to-r from-[rgb(var(--hm-gold))] to-transparent" />
              </footer>
            </blockquote>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <VerseAudio src={localAudioUrl(RECITERS[0], c, v)} label={t("votdPlay")} />
              <Link href={`/surah/${c}?v=${v}`} className="inline-flex h-12 items-center rounded-md border border-[rgb(var(--hm-gold))]/60 bg-surface/60 px-5 text-[15px] font-bold transition hover:border-[rgb(var(--hm-gold))] hover:bg-[rgb(var(--hm-gold))]/10">{t("votdHear")}</Link>
              <Link href={`/surah/${c}?v=${v}&m=2`} className="inline-flex h-12 items-center rounded-md border border-line bg-surface/60 px-5 text-[15px] font-bold transition hover:border-[rgb(var(--hm-gold))]">{t("votdMemorize")}</Link>
            </div>
            <div className="mx-auto mt-4 w-fit max-w-full"><SocialBar verseKey={data.key} shareText={data.verse.translation?.replace(/<[^>]+>/g, "")} /></div>
            <Rosette size={22} className="absolute bottom-3 start-3 opacity-80" />
            <Rosette size={22} className="absolute bottom-3 end-3 opacity-80" />
          </div>
        </HomeArch>
      </div>
    </section>
  );
}
