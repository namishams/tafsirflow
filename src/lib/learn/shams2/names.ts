// mirrors mobile/src/features/shams2/names.ts (copied for the website; keep in step with the app)
import { useEffect, useState } from "react";
import { useLang } from "@/lib/learn/i18n";
import { getChapters, type Chapter } from "@/lib/learn/quran";

/** surah names in the reader's language (from the Quran API) */
export function useSurahNames() {
  const { lang } = useLang();
  const [ch, setCh] = useState<Chapter[]>([]);
  useEffect(() => { let a = true; getChapters(lang).then((c) => { if (a) setCh(c); }).catch(() => undefined); return () => { a = false; }; }, [lang]);
  return { chapters: ch, name: (s: number) => ch.find((x) => x.id === s)?.name_simple ?? String(s), arabic: (s: number) => ch.find((x) => x.id === s)?.name_arabic ?? "" };
}
