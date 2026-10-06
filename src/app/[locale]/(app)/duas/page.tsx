import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import VerseAudio from "@/components/VerseAudio";
import { RECITERS, getResources, getVerseByKey, localAudioUrl, pickTranslation, type SingleVerse } from "@/lib/quran";
import { DUA_GROUPS } from "@/lib/duas";
import { pageMeta } from "@/lib/site";

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
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-6">
      <h1 className="font-display text-[34px] leading-none">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{t("lead")}</p>
      <nav aria-label={t("title")} className="mt-6 flex flex-wrap gap-2">
        {groups.map((g) => <a key={g.id} href={`#${g.id}`} className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-semibold hover:border-ink">{t(g.id)}</a>)}
      </nav>
      {groups.map((g) => (
        <section key={g.id} id={g.id} className="mt-10 scroll-mt-20">
          <h2 className="font-display text-3xl">{t(g.id)}</h2>
          <ul className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line">
            {g.items.filter((i) => i.v).map(({ key, v }) => {
              const [s, a] = key.split(":").map(Number);
              return (
                <li key={key} className="bg-surface p-5">
                  <p className="font-arabic text-3xl leading-[2.1]" dir="rtl" lang="ar">{v!.text_uthmani}</p>
                  {v!.translation && <p className="mt-2 text-[15px] leading-relaxed text-muted">{v!.translation.replace(/<[^>]+>/g, "")}</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <VerseAudio src={localAudioUrl(RECITERS[0], s, a)} label={t("listen")} />
                    <Link href={`/surah/${s}?v=${a}`} className="text-sm font-bold text-accent hover:underline">{key} →</Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted">{t("note")}</p>
    </main>
  );
}
