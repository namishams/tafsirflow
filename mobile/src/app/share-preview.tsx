import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from "react";
import { PixelRatio, ScrollView, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { captureRef } from "react-native-view-shot";
import { Directory, File, Paths } from "expo-file-system";
import { useLang } from "@/i18n";
import { loadVerse } from "@/features/srs/verse";
import { getChapters } from "@/lib/quran";
import { sourceFeedItems } from "@/content/sources";
import { knowledgeFeedItems, type KnowItem } from "@/features/feed/knowledge";
import { useKnowText } from "@/features/feed/knowTexts";
import { hadithFeedItems, type HadithFeedItem } from "@/features/hadith/data";
import { STICKERS } from "@/features/feed/gamify";
import { useGameText } from "@/features/feed/gamifyTexts";
import { stickerName } from "@/features/feed/Sticker";
import { fillText, useFeedText } from "@/features/feed/texts";
import { useGardenText } from "@/features/garden/texts";
import type { SourceItem } from "@/content/sources/types";
import { CARD_SIZE, type PaletteId, type ShareFormat, type ShareOpts } from "@/features/share/formats";
import { AchievementTemplate, NameTemplate, QuizTemplate, StickerTemplate, TextTemplate, TreeTemplate, VerseTemplate } from "@/features/share/ShareTemplates";
import { hadithSpec, knowSpec, libSpec, useShareCtx } from "@/features/share/feedShare";
import { FONT, stage } from "@/lib/theme";

// Development only: draws example share images of every template from the app's own data and writes them as
// 1080 px PNGs to Documents/share-previews (copied into mobile/store/screenshots-preview). Not reachable in
// release builds.
type Shot = { name: string; format: ShareFormat; node: (o: ShareOpts) => ReactNode; palette: PaletteId };

export default function SharePreview() {
  if (!__DEV__) return <Redirect href="/" />;
  return <Previews />;
}

function Previews() {
  const { lang } = useLang();
  const ctx = useShareCtx();
  const kt = useKnowText();
  const gt = useGameText();
  const tx = useFeedText();
  const gx = useGardenText();
  const [shots, setShots] = useState<Shot[] | null>(null);
  const [i, setI] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const ref = useRef<ComponentRef<typeof View>>(null);

  useEffect(() => {
    void (async () => {
      const within = <T,>(p: Promise<T>, fb: T) => Promise.race([p.catch(() => fb), new Promise<T>((r) => setTimeout(() => r(fb), 8000))]);
      const chs = await within(getChapters(lang), []);
      const name = (s: number) => (chs as { id: number; name_simple: string }[]).find((c) => c.id === s)?.name_simple ?? String(s);
      const verse = async (key: string) => { const d = await within(loadVerse(key, lang), { key, words: [], translation: "", audio: "" }); return { arabic: d.words.map((w) => w.text).join(" "), translation: d.translation }; };
      const [v1, v2, v3] = await Promise.all([verse("94:5"), verse("2:255"), verse("20:114")]);
      const first = async <T,>(p: Promise<T[]>) => (await within(p, [] as T[]))[0];
      const tafsir = await first<SourceItem>(sourceFeedItems("tafsir", lang, 0));
      const dua = await first<SourceItem>(sourceFeedItems("dua", lang, 0));
      const asma = await first<SourceItem>(sourceFeedItems("asma", lang, 0));
      const hadith = await first<HadithFeedItem>(hadithFeedItems(lang, "sunni", null).then((p) => p.items));
      const course = await first<KnowItem>(knowledgeFeedItems("kn-course", lang, 0, kt));
      const exam = await first<KnowItem>(knowledgeFeedItems("kn-exam", lang, 0, kt));
      const w12 = await within(loadVerse("1:2", lang).then((d) => d.words.filter((w) => w.meaning)), []);
      const sticker = STICKERS.find((x) => x.rare) ?? STICKERS[0];
      const out: Shot[] = [
        { name: "verse-story-night", format: "story", palette: "night", node: (o) => <VerseTemplate format="story" opts={o} {...v1} reference={`${name(94)} · 94:5`} verseKey="94:5" /> },
        { name: "verse-story-dawn", format: "story", palette: "dawn", node: (o) => <VerseTemplate format="story" opts={o} {...v3} reference={`${name(20)} · 20:114`} verseKey="20:114" /> },
        { name: "verse-portrait-parchment", format: "post", palette: "parchment", node: (o) => <VerseTemplate format="post" opts={o} {...v2} reference={`${name(2)} · 2:255`} verseKey="2:255" /> },
        { name: "verse-square-marble", format: "square", palette: "marble", node: (o) => <VerseTemplate format="square" opts={o} {...v1} reference={`${name(94)} · 94:5`} verseKey="94:5" /> },
        ...(hadith ? [{ name: "hadith-story-emerald", format: "story" as const, palette: "emerald" as const, node: (o: ShareOpts) => hadithSpec(ctx, hadith).card("story", o) }] : []),
        ...(tafsir ? [{ name: "tafsir-portrait-night", format: "post" as const, palette: "night" as const, node: (o: ShareOpts) => libSpec(ctx, { ...tafsir, kind: "tafsir" }, ctx.tt.tafsir).card("post", o) }] : []),
        ...(dua ? [{ name: "dua-story-parchment", format: "story" as const, palette: "parchment" as const, node: (o: ShareOpts) => libSpec(ctx, { ...dua, kind: "dua" }, ctx.stx.dua).card("story", o) }] : []),
        ...(asma ? [{ name: "name-square-emerald", format: "square" as const, palette: "emerald" as const, node: (o: ShareOpts) => libSpec(ctx, { ...asma, kind: "asma" }, ctx.stx.nameOfAllah).card("square", o) }] : [
          { name: "name-square-emerald", format: "square" as const, palette: "emerald" as const, node: (o: ShareOpts) => <NameTemplate format="square" opts={o} kicker={ctx.stx.nameOfAllah} arabic={w12[1]?.text ?? ""} latin={w12[1]?.tr ?? ""} meaning={w12[1]?.meaning ?? ""} /> }]),
        ...(course ? [{ name: "insight-portrait-marble", format: "post" as const, palette: "marble" as const, node: (o: ShareOpts) => knowSpec(ctx, course, ctx.tt.insight)?.card("post", o) }] : []),
        ...(exam?.quiz ? [{ name: "quiz-story-night", format: "story" as const, palette: "night" as const, node: (o: ShareOpts) => knowSpec(ctx, exam, kt.exam)?.card("story", o) }] : [
          { name: "quiz-story-night", format: "story" as const, palette: "night" as const, node: (o: ShareOpts) => <QuizTemplate format="story" opts={o} kicker={ctx.tt.quiz} question={tx.quizTitle} arabic={w12[0]?.text} options={w12.slice(0, 3).map((w) => w.meaning)} answer={0} explain={`${name(1)} · 1:2`} /> }]),
        { name: "achievement-square-dawn", format: "square", palette: "dawn", node: (o) => <AchievementTemplate format="square" opts={o} kicker={gt.levelUp} big="5" title={fillText(gt.levelN, { n: 5 })} /> },
        { name: "tree-story-emerald", format: "story", palette: "emerald", node: (o) => <TreeTemplate format="story" opts={o} kicker={ctx.tt.garden} tree={{ id: "preview", type: "olive", stage: 7 }} title={gx.t_olive} sub={gx.s7} /> },
        { name: "sticker-portrait-night", format: "post", palette: "night", node: (o) => <StickerTemplate format="post" opts={o} kicker={gt.album} def={sticker} name={stickerName(sticker.id, gt, tx, String)} sub={sticker.rare ? gt.rare : undefined} /> },
        { name: "verse-story-sharedby", format: "story", palette: "emerald", node: (o) => <VerseTemplate format="story" opts={{ ...o, sharer: { username: "amina.reads", badge: "emerald" } }} {...v1} reference={`${name(94)} · 94:5`} verseKey="94:5" /> },
        { name: "text-square-parchment", format: "square", palette: "parchment", node: (o) => <TextTemplate format="square" opts={o} kicker={ctx.tt.tafsir} title={tafsir?.title ?? name(2)} body={tafsir?.body ?? ""} source={tafsir?.source} /> },
      ];
      setShots(out);
    })();
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // one card at a time: draw, wait for fonts and images, capture at 1080 px, next
  useEffect(() => {
    if (!shots || i >= shots.length) return;
    const s = shots[i];
    const id = setTimeout(async () => {
      try {
        const [pw, ph] = CARD_SIZE[s.format].px;
        const k = PixelRatio.get();
        const tmp = await captureRef(ref as unknown as Parameters<typeof captureRef>[0], { format: "png", quality: 1, result: "tmpfile", width: pw / k, height: ph / k });
        const dir = new Directory(Paths.document, "share-previews");
        if (!dir.exists) dir.create();
        const dest = new File(dir, `share-${s.name}.png`);
        if (dest.exists) dest.delete();
        new File(tmp.startsWith("/") ? `file://${tmp}` : tmp).copy(dest);
        setLog((l) => [...l, `ok ${s.name}`]);
      } catch (e) { setLog((l) => [...l, `fail ${s.name}: ${String(e)}`]); }
      setI((n) => n + 1);
    }, 900);
    return () => clearTimeout(id);
  }, [shots, i]);

  const s = shots?.[i];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: stage.deep }} contentContainerStyle={{ padding: 16, paddingTop: 70, alignItems: "center", gap: 12 }}>
      <Text style={{ fontFamily: FONT.semibold, color: "#fff" }}>{shots ? (i < shots.length ? `${i + 1} / ${shots.length}` : "done") : "loading"}</Text>
      {s ? <View ref={ref} collapsable={false} style={{ width: CARD_SIZE[s.format].w, height: CARD_SIZE[s.format].h }}>{s.node({ palette: s.palette, sharer: null })}</View> : null}
      {log.map((l) => <Text key={l} style={{ fontFamily: FONT.regular, fontSize: 11, color: stage.textMuted }}>{l}</Text>)}
    </ScrollView>
  );
}
