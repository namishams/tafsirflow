// mirrors mobile/src/features/coursekit/links.ts – on the website the course links are already website paths.
/** a verse key like "113:1" → the Quran reader at that verse */
export const verseHref = (key: string) => { const [s, a] = key.split(":"); return a ? `/surah/${s}?v=${a}` : `/surah/${s}`; };
/** the Shams Method for a surah (at verse v when given) */
export const shamsHref = (surah: number, v?: number) => `/surah/${surah}?shams=1${v ? `&v=${v}` : ""}`;
