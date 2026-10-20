import { useCallback, useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n";
import { useStoreVersion } from "@/lib/store";
import { getChapters, type Chapter } from "@/lib/quran";
import { formatNumber } from "./format";

/**
 * A value computed from the learning store (tf:srs, tf:points, tf:listen …). It is computed again whenever anything in
 * the store changes – after practising, after a sync with the account – like the website's "tf-synced"/"tf-points"
 * listeners.
 */
export function useLive<T>(compute: () => T, deps: readonly unknown[] = []): T {
  const version = useStoreVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(compute, [version, ...deps]);
}

/** surah names (name_simple) from the server, like the website's getChapters(locale) */
export function useChapterNames(fallback?: (id: number) => string) {
  const { lang } = useLang();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  useEffect(() => {
    let off = false;
    getChapters(lang).then((c) => { if (!off) setChapters(c); }).catch(() => undefined);
    return () => { off = true; };
  }, [lang]);
  return useCallback((id: number) => chapters.find((c) => c.id === id)?.name_simple ?? (fallback ? fallback(id) : String(id)), [chapters, fallback]);
}

/** the website's nf(): numbers in the reader's language */
export function useNf() {
  const { lang } = useLang();
  return useCallback((n: number, maxFrac = 0, minFrac = 0) => formatNumber(n, lang, maxFrac, minFrac), [lang]);
}
