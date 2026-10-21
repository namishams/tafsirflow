import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeCorners, HomeVerse, StarGlyph } from "./art/HomeOrnaments";
import { Rosette } from "./Ornaments";
import { HADITH_API_NAME, SHAMS_WHY, loadShamsHadith, type ShamsHadith, type ShamsWhyItem } from "@/lib/shamsContent";
import { verseQuote } from "@/lib/verseQuotes";
import { getResources } from "@/lib/quran";
import { resolveVerse, translationIdFor } from "@/lib/feed/resolve";
import { DAY, getJson, memo, withTimeout } from "@/lib/feedWeb/net";

// Why learning the Quran comes first – Quran and authentic hadith, shown on the home page (the Shams page shows the
// same list: components/learn/shams2/Sources.tsx). Nothing is typed (BLUEPRINT §4): the hadith come by collection and
// number from SHAMS_WHY and are loaded on the server from fawazahmed0/hadith-api (the Arabic words and the translation in
// the page's language, English where the API has none, none in Arabic); verse 54:17 in Arabic from the Quran data in
// the spelling the gold line is set in (lib/verseQuotes) and its translation from the Quran data. The messages hold only
// an own-words heading per card (shams.why1h …) and the reference labels (shams.why1s …). A hadith that cannot be
// loaded keeps its card with heading and reference, without any text in its place.
// Each saying sits on a small marble card; the verse is set in gold across the full width.
// App: mobile/src/features/extra/widgets/WhyQuran.tsx

type HadithItem = Extract<ShamsWhyItem, { kind: "hadith" }>;
const HADITH = SHAMS_WHY.filter((w): w is HadithItem => w.kind === "hadith");
const VERSE = SHAMS_WHY.find((w): w is Extract<ShamsWhyItem, { kind: "verse" }> => w.kind === "verse") ?? { kind: "verse", key: "54:17", cite: "why5s" };
/** the heading of a card: "why1s" (reference label) -> "why1h" (own words) */
const headKey = (cite: string) => cite.replace(/s$/, "h");

/** hadith-api answers through the server's cache (a week; a failed source is retried after a few minutes) */
async function getJSON(url: string): Promise<unknown> {
  const v = await memo(`whyquran:${url}`, 7 * DAY, () => getJson<unknown>(url));
  if (v === null) throw new Error("unavailable");
  return v;
}

async function hadithOf(w: HadithItem, locale: string): Promise<ShamsHadith | null> {
  try { return await withTimeout(loadShamsHadith(w.collection, w.number, locale, getJSON), 9000); } catch { return null; }
}

/** 54:17: the gold line in the King Fahd Complex (QPC Hafs) spelling its design is set in (lib/verseQuotes, a snapshot of
 *  the Quran data), the translation of this language from the Quran data and its author (none in Arabic) */
async function verseOf(locale: string): Promise<{ arabic: string; translation: string; translator: string }> {
  let arabic = "";
  try { arabic = verseQuote("qpc", VERSE.key); } catch { /* not in the snapshot: the reader's text from the Quran data below */ }
  const tr = locale === "ar" ? 0 : await translationIdFor(locale);
  if (!tr) return { arabic, translation: "", translator: "" };
  const [v, translator] = await Promise.all([
    resolveVerse(VERSE.key, locale, tr),
    withTimeout(getResources()).then((r) => { const x = r.translations.find((t) => t.id === tr); return x ? x.author_name || x.name : ""; }).catch(() => ""),
  ]);
  return { arabic: arabic || v?.arabic || "", translation: v?.translation ?? "", translator };
}

export default async function WhyQuran({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "shams" });
  const [hadith, verse] = await Promise.all([Promise.all(HADITH.map((w) => hadithOf(w, locale))), verseOf(locale)]);
  return (
    <section className="relative overflow-hidden">
      <span aria-hidden className="hm-wm font-callig -end-6 top-10 text-[150px] sm:text-[240px]">القرآن</span>
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("whyTitle")}</h2>
        <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-muted">{t("whyLead")}</p>
        <div className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-2">
          {HADITH.map((w, i) => {
            const h = hadith[i];
            return (
              <figure key={w.cite} className="hm-card hm-lift flex flex-col p-6 sm:p-7">
                <HomeCorners />
                <svg aria-hidden viewBox="0 0 40 28" className="h-6 w-8 text-[rgb(var(--hm-gold))] rtl:-scale-x-100"><path d="M4 26V15C4 8 8 3 16 2v5c-4 1-6 4-6 8h6v11zM24 26V15c0-7 4-12 12-13v5c-4 1-6 4-6 8h6v11z" fill="currentColor" fillOpacity=".22" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                <h3 className="font-display mt-3 text-[21px] leading-snug">{t(headKey(w.cite))}</h3>
                <div className="mt-3 flex-1">
                  {h?.arabic ? <p className="font-arabic text-[20px] leading-[1.9]" dir="rtl" lang="ar">{h.arabic}</p> : null}
                  {h?.text ? <blockquote className={`text-[16px] leading-relaxed text-ink/85 sm:text-[17px] ${h.arabic ? "mt-3" : ""}`} lang={h.textLang ?? undefined}>{h.text}</blockquote> : null}
                </div>
                <figcaption className="mt-4 flex items-center gap-2 text-sm font-semibold text-[rgb(var(--hm-gold-d))]"><StarGlyph size={10} />{t(w.cite)}{h ? ` · ${HADITH_API_NAME}` : ""}</figcaption>
              </figure>
            );
          })}
          <figure className="stage relative overflow-hidden rounded-2xl px-6 py-8 text-center text-[#eef0f3] sm:px-10 md:col-span-2">
            <span aria-hidden className="illum-frame" />
            {["start-1.5 top-1.5", "end-1.5 top-1.5", "bottom-1.5 start-1.5", "bottom-1.5 end-1.5"].map((c) => <Rosette key={c} size={22} className={`absolute ${c}`} />)}
            {verse.arabic ? <HomeVerse text={verse.arabic} cite={VERSE.key} className="relative text-[24px] sm:text-[32px]" /> : null}
            {verse.translation ? <blockquote className="relative mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-white/85">{verse.translation}</blockquote> : null}
            <figcaption className="relative mt-3 text-sm font-semibold text-[rgb(var(--gold))]">{t(VERSE.cite)}{verse.translation && verse.translator ? ` · ${verse.translator}` : ""}</figcaption>
          </figure>
        </div>
        <p className="mt-4 max-w-3xl text-[13px] leading-relaxed text-muted">{t("whyNote")}</p>
        <p className="mt-10 max-w-3xl text-[17px] leading-relaxed">{t("whyClose")}</p>
        <Link href="/academy" className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-ink px-6 text-[15px] font-bold text-bg shadow-[inset_0_0_0_1px_rgb(233_207_153/.3)] transition hover:opacity-90">{t("whyCta")} <span className="rtl:-scale-x-100">→</span></Link>
      </div>
    </section>
  );
}
