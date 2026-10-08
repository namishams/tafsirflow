import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import VerseAudio from "@/components/VerseAudio";
import { RECITERS, getResources, getVerseByKey, localAudioUrl, pickTranslation, type SingleVerse } from "@/lib/quran";
import { DUA_GROUPS } from "@/lib/duas";
import SunnahDuas from "@/components/SunnahDuas";
import { pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";
import { ArrowNext } from "@/components/Icons";
import { PracticeHero, PracticeStar } from "@/components/art/PracticeArt";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "duas" });
  return pageMeta(locale, "/duas", `${t("title")} | Quran Masterclass`, t("lead"));
}

export default async function DuasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("duas");
  let tid = 20;
  try { tid = pickTranslation(locale, (await getResources()).translations); } catch { /* default translation */ }
  const load = async (k: string): Promise<SingleVerse | null> => { try { return await getVerseByKey(k, locale, tid); } catch { return null; } };
  const groups = await Promise.all(DUA_GROUPS.map(async (g) => ({ id: g.id, items: await Promise.all(g.verses.map(async (k) => ({ key: k, v: await load(k) }))) })));
  return (
    <>
    <PracticeHero uid="duas-h" word="دعاء" lamp title={t("title")} lead={t("lead")}>
      <nav className="flex flex-wrap gap-2 text-sm font-bold">
        <a href="#sunnah" className="pa-chip pa-chip-dark is-on h-11">{t("sunnahTitle")}</a>
        <a href="#quran" className="pa-chip pa-chip-dark h-11">{t("quranTitle")}</a>
      </nav>
    </PracticeHero>
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-12 sm:px-5">
      <section id="sunnah" className="scroll-mt-20">
        <h2 className="font-display text-3xl sm:text-4xl">{t("sunnahTitle")}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t("sunnahLead")}</p>
        <div className="mt-6"><SunnahDuas /></div>
      </section>

      <h2 id="quran" className="font-display mt-20 scroll-mt-20 text-3xl sm:text-4xl">{t("quranTitle")}</h2>
      <nav aria-label={t("quranTitle")} className="mt-6 flex flex-wrap gap-2">
        {groups.map((g) => <a key={g.id} href={`#${g.id}`} className="pa-chip">{t(g.id)}</a>)}
      </nav>
      {groups.map((g) => (
        <section key={g.id} id={g.id} className="mt-12 scroll-mt-20">
          <h3 className="font-display flex items-center gap-3 text-2xl"><PracticeStar size={14} />{t(g.id)}</h3>
          <ul className="mt-5 grid gap-5">
            {g.items.filter((i) => i.v).map(({ key, v }) => {
              const [s, a] = key.split(":").map(Number);
              return (
                <li key={key} className="pa-card px-5 pb-5 pt-6 sm:px-7">
                  <p className="font-arabic text-[1.8rem] leading-[2.15] sm:text-[2.05rem]" dir="rtl" lang="ar">{v!.text_uthmani}</p>
                  {v!.translation && <p className="mt-3 text-[15.5px] leading-relaxed text-ink/80">{v!.translation.replace(/<[^>]+>/g, "")}</p>}
                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[rgb(var(--gold))]/20 pt-4 [&_button]:h-11 [&_button]:rounded-full">
                    <VerseAudio src={localAudioUrl(RECITERS[0], s, a)} label={t("listen")} />
                    <Link href={`/surah/${s}?v=${a}`} className="pa-chip h-11">{key} <ArrowNext /></Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="mt-12 max-w-2xl text-sm leading-relaxed text-muted">{t("note")}</p>
    </main>
    <MoreTiles keys={["salah", "prayer", "islam", "radio"]} />
    </>
  );
}
