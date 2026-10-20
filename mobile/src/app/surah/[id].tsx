import { Redirect, useLocalSearchParams, type Href } from "expo-router";

// Website /surah/<n>?v=<verse> (shared links, universal links): the app's reader is /quran/<n>
export default function SurahLink() {
  const p = useLocalSearchParams<{ id: string; v?: string; m?: string }>();
  const n = Math.min(114, Math.max(1, Number(p.id) || 1));
  const q = new URLSearchParams({ ...(p.v ? { v: String(p.v) } : {}), ...(p.m ? { m: String(p.m) } : {}) }).toString();
  return <Redirect href={`/quran/${n}${q ? `?${q}` : ""}` as Href} />;
}
