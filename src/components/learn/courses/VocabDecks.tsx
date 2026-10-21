"use client";
// /vocab-decks – more vocabulary decks: by theme (core vocabulary regrouped by word type and root family) and by surah
// (every distinct word of a surah, straight from the Quran word data). Web port of VocabDecksScreen in
// mobile/src/features/courses/Vocab.tsx; every deck is open on the website.
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { LearnHero, LearnMain, Row, RowList, SectionTitle } from "@/components/learn/ui";
import { formatNumber, useLang } from "@/lib/learn/i18n";
import { getChapters, type Chapter } from "@/lib/learn/quran";
import { ROOTS, TYPES, rootHref, typeWords } from "@/lib/learn/courses/decks";
import { useCT } from "@/lib/learn/courses/texts";
import { useWT } from "./strings";

export default function VocabDecks() {
  const c = useCT();
  const w = useWT();
  const { lang } = useLang();
  const [ch, setCh] = useState<Chapter[]>([]);
  useEffect(() => { getChapters(lang).then(setCh).catch(() => undefined); }, [lang]);
  const themes: [string, string, number][] = [
    ...TYPES.map((k) => [`/vocab-decks/type-${k}`, c(`theme_${k}` as never), typeWords(k).length] as [string, string, number]),
    ...ROOTS.map(([r, ws]) => [rootHref(r), c("theme_root", { r }), ws.length] as [string, string, number]),
  ];
  const surahs = Array.from({ length: 114 }, (_, i) => i + 1);
  return (
    <div>
      <LearnHero uid="vd" back={{ href: "/vocab", label: w("vocabTrainer") }} kicker={c("vdTitle")} title={c("vdTitle")} lead={c("vdLead")} word="كلمات" />
      <LearnMain>
        <SectionTitle title={c("vdByTheme")} />
        <RowList className="mt-5">
          {themes.map(([href, title, n]) => (
            <Row key={href} href={href} title={<span dir="auto">{title}</span>} sub={c("vdWords", { n: formatNumber(n, lang) })} />
          ))}
        </RowList>
        <SectionTitle className="mt-12" title={c("vdBySurah")} />
        <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {surahs.map((s) => {
            const x = ch.find((y) => y.id === s);
            return (
              <li key={s}>
                <Link href={`/vocab-decks/surah-${s}`} className="flex min-h-11 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[14px] font-semibold transition hover:border-[rgb(var(--hm-gold))]/70 hover:bg-[rgb(var(--hm-gold))]/[0.05]">
                  <span className="min-w-[1.75rem] text-[12.5px] font-bold tabular-nums text-[rgb(var(--hm-gold-d))]">{formatNumber(s, lang)}</span>
                  <span className="min-w-0 truncate">{x?.name_simple ?? ""}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </LearnMain>
    </div>
  );
}
