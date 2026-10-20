import { Redirect, useLocalSearchParams, type Href } from "expo-router";

// Website /surah/<n>?v=<verse> (shared links, universal links): the app's reader is /quran/<n>. Everything the website
// understands is passed on: v (verse), m (2 = practise / review), shams (the Shams Method, opened directly),
// reciter (slug), r (review), session (today's session) and tafsir (open the tafsir of the verse).
const KEEP = ["v", "m", "shams", "reciter", "r", "session", "tafsir"] as const;

export default function SurahLink() {
  const p = useLocalSearchParams<{ id: string } & Partial<Record<(typeof KEEP)[number], string>>>();
  const n = Math.min(114, Math.max(1, Number(p.id) || 1));
  if (p.shams === "1" || p.m === "2") return <Redirect href={`/shams/${n}${p.v ? `?v=${encodeURIComponent(String(p.v))}` : ""}` as Href} />;
  const q = new URLSearchParams();
  for (const k of KEEP) { const x = p[k]; if (x) q.set(k, String(x)); }
  const qs = q.toString();
  return <Redirect href={`/quran/${n}${qs ? `?${qs}` : ""}` as Href} />;
}
