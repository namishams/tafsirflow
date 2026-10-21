// mirrors the data helpers of mobile/src/features/srs/CardFace.tsx (vocabWord, tajweedQ); the card faces themselves
// are web components (src/components/learn/srs).
import { tajweedFor } from "@/lib/tajweed";
import { vocabFor } from "@/lib/vocabI18n";
import type { Word } from "@/lib/vocab";

const vocabCache = new Map<string, Map<string, Word>>();
function vocabMap(lang: string) {
  let m = vocabCache.get(lang);
  if (!m) { m = new Map(vocabFor(lang).flatMap((d) => d.words).map((w) => [w.id, w])); vocabCache.set(lang, m); }
  return m;
}
export const vocabWord = (id: string, lang: string) => vocabMap(lang).get(id);
export function tajweedQ(ref: string, lang: string) {
  const [lid, i] = ref.split(":");
  const l = tajweedFor(lang).find((x) => x.id === lid);
  const q = l?.quiz[Number(i)];
  if (!l || !q) return null;
  const de = lang === "de";
  return { title: de ? l.title_de : l.title_en, q: de ? q.q_de : q.q_en, options: de ? q.options_de : q.options_en, answer: q.answer, explain: de ? q.explain_de : q.explain_en };
}
