import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ARABIC_FONT, FONT } from "@/lib/theme";
import { useLang } from "@/i18n";
import { getResources, getVerseByKey, translationFor, type SingleVerse } from "@/lib/quran";
import { cachedJSON } from "@/features/hadith/cache";
import { firstLetter } from "@/features/shams/memory";
import { HADITH_API_NAME, SHAMS_DEMO_KEY, loadShamsHadith, type ShamsHadith, type ShamsWhyItem } from "@/web/shamsContent";
import { RefChip } from "./art";
import { FramedQuote } from "./markdown";
import { ShamsDemo } from "./shamsArt";
import { STAGE_GOLD, useIsl } from "./palette";

// The verses and hadith of the Shams Method page (/shams), rendered from their sources (BLUEPRINT §4: nothing is typed):
// verses from the Quran API (Uthmani text and the translation in the reader's language, none in Arabic), the demo
// verse's words with first-letter cues derived from them, and the hadith of "Why learning the Quran matters" from
// fawazahmed0/hadith-api (kept on the device once fetched). A source that cannot be reached leaves its item out.
// Website: src/components/learn/shams2/Sources.tsx

const verses = new Map<string, Promise<SingleVerse>>();
function loadVerse(key: string, lang: string) {
  const k = `${key}|${lang}`;
  let p = verses.get(k);
  if (!p) { p = getVerseByKey(key, lang); p.catch(() => verses.delete(k)); verses.set(k, p); }
  return p;
}
function useVerse(key: string) {
  const { lang } = useLang();
  const [st, setSt] = useState<{ k: string; v?: SingleVerse; error?: boolean } | null>(null);
  const k = `${key}|${lang}`;
  useEffect(() => {
    let live = true;
    loadVerse(key, lang).then((v) => { if (live) setSt({ k, v }); }).catch(() => { if (live) setSt({ k, error: true }); });
    return () => { live = false; };
  }, [key, lang, k]);
  return st && st.k === k ? st : null;
}

/** the author of the translation shown in this language (its source), once */
const names = new Map<string, Promise<string>>();
function useTranslationName(): string {
  const { lang } = useLang();
  const [name, setName] = useState("");
  useEffect(() => {
    if (lang === "ar") { setName(""); return; }
    let live = true;
    let p = names.get(lang);
    if (!p) {
      p = Promise.all([translationFor(lang), getResources()]).then(([id, r]) => { const t = r.translations.find((x) => x.id === id); return t ? t.author_name || t.name : ""; });
      p.catch(() => names.delete(lang));
      names.set(lang, p);
    }
    p.then((n) => { if (live) setName(n); }).catch(() => undefined);
    return () => { live = false; };
  }, [lang]);
  return name;
}

function Placeholder({ height, dark }: { height: number; dark?: boolean }) {
  const isl = useIsl();
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height, borderRadius: 8, backgroundColor: dark ? "rgba(255,255,255,0.08)" : isl.a("goldSoft", 0.12) }} />;
}

/** "Why Shams": the inside of a verse card (Arabic, translation, reference with the translation's author) */
export function ShamsNameVerse({ verseKey, label }: { verseKey: string; label: string }) {
  const isl = useIsl();
  const st = useVerse(verseKey);
  const tr = useTranslationName();
  const v = st?.v;
  return (
    <>
      {v ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 49.4, color: isl.head, textAlign: "center", writingDirection: "rtl" }}>{v.text_uthmani}</Text>
        : st?.error ? null : <View style={{ alignSelf: "stretch" }}><Placeholder height={48} /></View>}
      {v?.translation ? <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: isl.muted, textAlign: "center" }}>{v.translation}</Text> : null}
      <View style={{ marginTop: 12 }}><RefChip label={v?.translation && tr ? `${label} · ${tr}` : label} /></View>
    </>
  );
}

/** step 7: the verse the "why" text refers to, on the dark journey card */
export function ShamsStepVerse({ verseKey }: { verseKey: string }) {
  const st = useVerse(verseKey);
  const tr = useTranslationName();
  if (st?.error) return null;
  const v = st?.v;
  return (
    <View style={{ marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)", padding: 14, gap: 8 }}>
      {v ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 21, lineHeight: 40, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{v.text_uthmani}</Text> : <Placeholder height={40} dark />}
      {v?.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 23, color: "rgba(255,255,255,0.8)" }}>{v.translation}</Text> : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: STAGE_GOLD }}>{v?.translation && tr ? `${verseKey} · ${tr}` : verseKey}</Text>
    </View>
  );
}

/** "One verse, four stages": the words of 1:2 from the Quran API, the cues derived with firstLetter() */
export function ShamsDemoLive({ stages, title }: { stages: string[]; title: string }) {
  const st = useVerse(SHAMS_DEMO_KEY);
  if (!st) return <Placeholder height={300} />;
  const words = (st.v?.text_uthmani ?? "").split(/\s+/).filter((w) => /[ء-يٱ-ۓ]/.test(w));
  if (!words.length) return null;
  return <ShamsDemo words={words} cues={words.map(firstLetter)} stages={stages} title={title} />;
}

const getJSON = (url: string) => cachedJSON<unknown>(`shams-${url.replace(/^https?:\/\//, "")}`, url);

function HadithQuote({ item, cite }: { item: Extract<ShamsWhyItem, { kind: "hadith" }>; cite: string }) {
  const { lang } = useLang();
  const isl = useIsl();
  const [h, setH] = useState<{ k: string; v: ShamsHadith | null } | null>(null);
  const k = `${item.collection}:${item.number}:${lang}`;
  useEffect(() => {
    let live = true;
    loadShamsHadith(item.collection, item.number, lang, getJSON).then((v) => { if (live) setH({ k, v }); }).catch(() => { if (live) setH({ k, v: null }); });
    return () => { live = false; };
  }, [item.collection, item.number, lang, k]);
  const cur = h && h.k === k ? h : null;
  if (!cur) return <Placeholder height={110} />;
  if (!cur.v) return null;
  const { arabic, text } = cur.v;
  return (
    <FramedQuote size={17 / 1.16} cite={`${cite} · ${HADITH_API_NAME}`} style={{ marginTop: 0, marginBottom: 0 }}>
      {arabic ? <Text style={{ fontFamily: ARABIC_FONT, fontStyle: "normal", fontSize: 19, lineHeight: 36, color: isl.head, writingDirection: "rtl" }}>{arabic}</Text> : null}
      {arabic && text ? "\n\n" : ""}
      {text}
    </FramedQuote>
  );
}

function VerseQuote({ verseKey, cite }: { verseKey: string; cite: string }) {
  const isl = useIsl();
  const st = useVerse(verseKey);
  const tr = useTranslationName();
  if (!st) return <Placeholder height={110} />;
  if (!st.v) return null;
  const v = st.v;
  return (
    <FramedQuote size={17 / 1.16} cite={v.translation && tr ? `${cite} · ${tr}` : cite} style={{ marginTop: 0, marginBottom: 0 }}>
      <Text style={{ fontFamily: ARABIC_FONT, fontStyle: "normal", fontSize: 21, lineHeight: 40, color: isl.head, writingDirection: "rtl" }}>{v.text_uthmani}</Text>
      {v.translation ? `\n\n${v.translation}` : ""}
    </FramedQuote>
  );
}

/** "Why learning the Quran matters": the hadith and the verse by reference; cites = the labels (shams.why1s …) */
export function ShamsWhyList({ items, cites, note }: { items: ShamsWhyItem[]; cites: string[]; note?: string }) {
  const isl = useIsl();
  return (
    <>
      <View style={{ marginTop: 48, gap: 40 }}>
        {items.map((it, i) => it.kind === "hadith" ? <HadithQuote key={i} item={it} cite={cites[i]} /> : <VerseQuote key={i} verseKey={it.key} cite={cites[i]} />)}
      </View>
      {note ? <Text style={{ marginTop: 24, fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 19, color: isl.muted, textAlign: "center" }}>{note}</Text> : null}
    </>
  );
}
