import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { COUNTRIES_DE, RECITER_BIOS, STYLE, bioText } from "@/lib/reciters";
import { abs, pageMeta } from "@/lib/site";

const C = {
  de: { kicker: "Die Stimmen des Korans", title: "50 große Rezitatoren – ihre Geschichte, ihr Klang, ihr Vermächtnis", lead: "Von den Meistern aus Kairo, deren Aufnahmen seit Generationen um die Welt gehen, bis zu den Imamen der heiligen Moscheen in Mekka und Medina und den Stimmen aus den Emiraten. Lerne sie kennen – und lerne von ihnen: Wer einem großen Rezitator aufmerksam zuhört, lernt Aussprache, Rhythmus und Ehrfurcht.", listen: "Im Player anhören", read: "Biografie lesen", path: "Der Weg zum Rezitator", radio: "Koran-Radio" },
  en: { kicker: "The voices of the Quran", title: "50 great reciters – their story, their sound, their legacy", lead: "From the masters of Cairo whose recordings have travelled the world for generations, to the imams of the holy mosques of Makkah and Madinah and the voices of the Emirates. Get to know them – and learn from them: whoever listens attentively to a great reciter learns pronunciation, rhythm and reverence.", listen: "Listen in the player", read: "Read the biography", path: "The path to becoming a reciter", radio: "Quran radio" },
};
const content = (l: string) => (l === "de" ? C.de : C.en);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/reciters", `${c.kicker} | Quran Masterclass`, c.lead.slice(0, 158));
}

export default async function RecitersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  const ld = { "@context": "https://schema.org", "@type": "ItemList", name: c.title, itemListElement: RECITER_BIOS.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/${locale}/reciters/${r.slug}`), name: r.name })) };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage relative overflow-hidden text-[#eef0f3]">
        <p aria-hidden className="font-arabic pointer-events-none absolute -end-6 -top-4 select-none text-[150px] leading-none text-[rgb(var(--gold))] opacity-[0.07] sm:text-[230px]" dir="rtl">القرّاء</p>
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{c.kicker}</p>
          <h1 className="font-display mt-4 max-w-4xl text-[40px] leading-[1.05] sm:text-6xl">{c.title}</h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/70">{c.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/islam/reciter-path" className="btn-gold inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{c.path}</Link>
            <Link href="/radio" className="inline-flex h-12 items-center rounded-md border border-white/30 px-6 text-[15px] font-bold hover:border-white">{c.radio}</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-14">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECITER_BIOS.map((r, i) => {
            const t = bioText(r, locale);
            const initials = r.name.split(/[\s-]+/).filter((w) => /^[A-Z]/.test(w) && !["Al", "Ash", "As", "Ar", "Ad", "At", "Az", "An", "Abu"].includes(w)).slice(0, 2).map((w) => w[0]).join("");
            return (
              <li key={r.slug}>
                <Link href={`/reciters/${r.slug}`} className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-[rgb(var(--gold))]">
                  <div className="flex items-center gap-4">
                    <span className="stage grid h-14 w-14 shrink-0 place-items-center rounded-full font-display text-lg text-[rgb(var(--gold))]">{initials}</span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-muted">{String(i + 1).padStart(2, "0")} · {locale === "de" ? COUNTRIES_DE[r.country] ?? r.country : r.country}{r.born || r.died ? ` · ${r.born ?? "?"}${r.died ? `–${r.died}` : ""}` : ""}</span>
                      <span className="block truncate text-lg font-bold">{r.name}</span>
                      <span className="font-arabic block text-lg leading-snug text-accent" dir="rtl">{r.arabic}</span>
                    </span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{t.short}</p>
                  <p className="mt-3 flex flex-wrap gap-1.5">{r.styles.map((s) => <span key={s} className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-semibold text-muted">{STYLE[s][locale === "de" ? "de" : "en"]}</span>)}{r.playerSlug && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">▶ {c.listen}</span>}</p>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
