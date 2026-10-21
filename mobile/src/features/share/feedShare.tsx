import { useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { SITE } from "@/lib/api";
import { FONT, R, stage, useTheme } from "@/lib/theme";
import { APP_LINK, ShareSheet } from "@/features/feed/share";
import type { FeedVerse } from "@/features/feed/source";
import type { Story, AllahName } from "@/features/prophet/stories";
import type { HadithFeedItem } from "@/features/hadith/data";
import type { KnowItem } from "@/features/feed/knowledge";
import type { LibItem } from "@/features/feed/library";
import type { StickerDef } from "@/features/feed/gamify";
import { useShareText, type ShareText } from "./texts";
import { useTemplateText, type TemplateText } from "./templateTexts";
import type { ShareFormat, ShareOpts } from "./formats";
import { AchievementTemplate, NameTemplate, QuizTemplate, StickerTemplate, TextTemplate, VerseTemplate } from "./ShareTemplates";

// What a feed post shares: the link, the message, the seed of its design and the template that draws the image, one
// builder per post kind; and the share buttons of a post (a gold "Story" pill for one-tap sharing, the paper plane
// for the full sheet). The sheet and the card are only mounted while sharing.

export type ShareSpec = {
  link: string; message: string; seed: string;
  video?: { key: string; lang: string };
  onShared?: () => void;
  card: (f: ShareFormat, o: ShareOpts) => ReactNode;
};
export type ShareCtx = { lang: string; tt: TemplateText; stx: ShareText };
export function useShareCtx(): ShareCtx {
  const { lang } = useLang();
  return { lang, tt: useTemplateText(), stx: useShareText() };
}

const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(" ", n) > 0 ? s.lastIndexOf(" ", n) : n)} …`);
const plain = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

/** a verse (text only from the Quran data) */
export function verseSpec(c: ShareCtx, v: Pick<FeedVerse, "key" | "s" | "v" | "arabic" | "translation">, surahName: string, opt?: { kicker?: string; onShared?: () => void }): ShareSpec {
  const ref = `${opt?.kicker ? `${opt.kicker} · ` : ""}${surahName} · ${v.key}`;
  return {
    link: `${SITE}/${c.lang}/surah/${v.s}?v=${v.v}`, message: `${v.translation ? `${plain(v.translation)}\n\n` : ""}Quran ${v.key}`, seed: v.key,
    video: { key: v.key, lang: c.lang }, onShared: opt?.onShared,
    card: (f, o) => <VerseTemplate format={f} opts={o} arabic={v.arabic} translation={v.translation} reference={ref} verseKey={v.key} />,
  };
}

/** a story of the prophets / Islam chapter card */
export function storySpec(c: ShareCtx, s: Story): ShareSpec {
  const body = plain(s.paragraphs.join(" ") || (s.points?.items.join(" · ") ?? ""));
  return {
    link: `${SITE}/${c.lang}${s.webPath}`, message: `${s.title}\n${s.groupTitle}`, seed: s.group,
    card: (f, o) => <TextTemplate format={f} opts={o} kicker={s.groupTitle} seed={s.group} arabic={s.arabic || undefined} title={s.title} body={clip(body, f === "story" ? 520 : f === "post" ? 340 : 220)} source={s.sources[0]} />,
  };
}

/** a name of Allah */
export function nameSpec(c: ShareCtx, n: AllahName): ShareSpec {
  return {
    link: `${SITE}/${c.lang}/islam/names`, message: `${n.ar} – ${n.latin}: ${n.meaning}`, seed: `name:${n.latin}`,
    card: (f, o) => <NameTemplate format={f} opts={o} kicker={c.stx.nameOfAllah} arabic={n.ar} latin={n.latin} meaning={n.meaning} />,
  };
}

/** a hadith (vetted text and its reference from features/hadith) */
export function hadithSpec(c: ShareCtx, h: HadithFeedItem): ShareSpec {
  const it = h.item;
  const link = it.source === "nahj" && it.url ? it.url : SITE;
  const message = `${h.text ? `${clip(h.text, 400)}\n` : ""}— ${it.reference}${it.source === "nahj" ? `\n${it.credit}` : ""}`;
  return {
    link, message, seed: `hadith:${it.collection}`,
    card: (f, o) => <TextTemplate format={f} opts={o} kicker={it.collectionName || c.stx.hadith} seed={`hadith:${it.collection}`} arabic={h.arabic ? clip(h.arabic, f === "square" ? 260 : 520) : undefined}
      body={clip(h.text, f === "story" ? 620 : f === "post" ? 420 : 260)} source={[it.reference, it.source === "nahj" ? it.credit : ""].filter(Boolean).join(" · ")} quote />,
  };
}

/** a knowledge post (course insight, exam question with its answer, tadabbur, names, moments); verse text loaded by the caller */
export function knowSpec(c: ShareCtx, it: KnowItem, kicker: string, verse?: { arabic: string; translation: string } | null): ShareSpec | null {
  const message = [it.title, it.body && clip(plain(it.body), 300), it.source && `— ${it.source}`].filter(Boolean).join("\n");
  const base = { link: APP_LINK, message, seed: `kn:${it.id}` };
  if (it.quiz) {
    const q = it.quiz;
    return { ...base, card: (f, o) => <QuizTemplate format={f} opts={o} kicker={`${c.tt.quiz} · ${kicker}`} question={it.title} arabic={it.arabic} options={q.options} answer={q.answer} explain={q.explain} /> };
  }
  if (it.kind === "kn-moment") {
    if (it.moment && !it.moment.own) return null; // only one's own achievement leaves the app
    return { ...base, card: (f, o) => <AchievementTemplate format={f} opts={o} kicker={c.tt.achievement} title={it.title} sub={it.body ? clip(plain(it.body), 160) : undefined} icon="trophy" seed={`kn:${it.id}`} /> };
  }
  if (it.kind === "kn-names" && it.arabic) {
    return { ...base, card: (f, o) => <NameTemplate format={f} opts={o} kicker={kicker} arabic={it.arabic!} latin={it.title} meaning={clip(plain(it.body), 160)} /> };
  }
  const arabic = verse?.arabic ?? it.arabic;
  const body = [plain(it.body), ...(it.bullets ?? []).map((b) => `· ${b}`)].filter(Boolean).join(" ");
  return {
    ...base,
    card: (f, o) => <TextTemplate format={f} opts={o} kicker={kicker} seed={`kn:${it.kind}`} arabic={arabic} title={it.title}
      body={clip(body, f === "story" ? 480 : f === "post" ? 300 : 190)} source={it.verse ? `Quran ${it.verse}` : it.eyebrow ?? it.source} />,
  };
}

/** a post of the content libraries (tafsir, hadith of the day, duas, names, scholars, history) */
export function libSpec(c: ShareCtx, item: LibItem, kicker: string): ShareSpec {
  const ar = (item as { arabic?: string }).arabic;
  const kind = item.kind as string;
  const quote = /hadith|dua/.test(kind);
  const k = /hadith/.test(kind) ? c.stx.hadith : /dua/.test(kind) ? c.stx.dua : /tafsir|surah-info/.test(kind) ? c.tt.tafsir : kind === "asma" ? c.stx.nameOfAllah : kicker;
  const message = [item.title, item.body && clip(plain(item.body), 300), item.source && `— ${item.source}`].filter(Boolean).join("\n");
  const base = { link: APP_LINK, message, seed: `lib:${kind}` };
  if (kind === "asma" && ar) return { ...base, card: (f, o) => <NameTemplate format={f} opts={o} kicker={k} arabic={ar} latin={item.title} meaning={clip(plain(item.body), 160)} /> };
  return {
    ...base,
    card: (f, o) => <TextTemplate format={f} opts={o} kicker={k} seed={`lib:${kind}`} arabic={ar ? clip(ar, f === "square" ? 240 : 480) : undefined} title={quote ? undefined : item.title}
      body={clip(plain(item.body), f === "story" ? 560 : f === "post" ? 360 : 220)} source={quote ? item.title : item.source} quote={quote} />,
  };
}

/** a word quiz of the feed (the verse's word and its meaning from the Quran data) */
export function quizSpec(c: ShareCtx, q: { question: string; arabic?: string; options: string[]; answer: number; explain?: string; seed: string; link?: string }): ShareSpec {
  return {
    link: q.link ?? APP_LINK, message: `${q.question}\n${q.options.map((o) => `· ${o}`).join("\n")}\n\n${c.tt.answer}: ${q.options[q.answer] ?? ""}`, seed: q.seed,
    card: (f, o) => <QuizTemplate format={f} opts={o} kicker={c.tt.quiz} question={q.question} arabic={q.arabic} options={q.options} answer={q.answer} explain={q.explain} />,
  };
}

/** a collected sticker */
export function stickerSpec(c: ShareCtx, def: StickerDef, name: string, sub?: string): ShareSpec {
  return {
    link: APP_LINK, message: `${c.tt.sticker}: ${name}`, seed: `sticker:${def.id}`,
    card: (f, o) => <StickerTemplate format={f} opts={o} kicker={c.tt.sticker} def={def} name={name} sub={sub} />,
  };
}

type Getter = () => ShareSpec | null | Promise<ShareSpec | null>;

/** the share sheet of a spec (mounted only while open) */
export function SpecShareSheet({ spec, quick, onClose }: { spec: ShareSpec; quick?: boolean; onClose: () => void }) {
  return <ShareSheet visible templated quick={quick} seed={spec.seed} onClose={onClose} link={spec.link} message={spec.message} onShared={spec.onShared} video={spec.video} renderCard={spec.card} />;
}

/** the share buttons of a post: a gold "Story" pill (one tap: the story image to the system sheet) and the paper plane (all formats and designs) */
export function PostShareButtons({ get, onDark, label }: { get: Getter; onDark?: boolean; label?: string }) {
  const t = useTheme();
  const tt = useTemplateText();
  const stx = useShareText();
  const [open, setOpen] = useState<{ spec: ShareSpec; quick: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const go = async (quick: boolean) => {
    if (busy) return;
    setBusy(true);
    try { const s = await get(); if (s) setOpen({ spec: s, quick }); } catch { /* nothing to share */ } finally { setBusy(false); }
  };
  const ink = onDark ? "#fff" : t.ink;
  const gold = onDark ? stage.gold : t.gold;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Pressable onPress={() => void go(true)} accessibilityRole="button" accessibilityLabel={tt.shareStory} accessibilityState={{ busy }} hitSlop={4}
        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, height: 32, paddingHorizontal: 12, borderRadius: R.pill, borderWidth: 1, borderColor: gold, backgroundColor: onDark ? "rgba(214,180,108,0.14)" : t.dark ? "rgba(214,178,106,0.12)" : "rgba(150,116,52,0.08)", opacity: pressed ? 0.7 : 1 })}>
        {busy ? <ActivityIndicator size="small" color={gold} /> : <StoryGlyph color={gold} />}
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: onDark ? stage.cream : t.ink }}>{tt.story}</Text>
      </Pressable>
      <Pressable onPress={() => void go(false)} accessibilityRole="button" accessibilityLabel={label ?? stx.share} hitSlop={6}
        style={({ pressed }) => ({ width: 40, height: 40, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
        <Icon name="send" color={ink} size={22} />
      </Pressable>
      {open ? <SpecShareSheet spec={open.spec} quick={open.quick} onClose={() => setOpen(null)} /> : null}
    </View>
  );
}

/** a 9:16 frame with a plus: the story mark of the share pill */
export function StoryGlyph({ color, size = 15 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size * 0.66, height: size, borderRadius: 2.5, borderWidth: 1.5, borderColor: color, alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", width: size * 0.34, height: 1.5, backgroundColor: color }} />
      <View style={{ position: "absolute", width: 1.5, height: size * 0.34, backgroundColor: color }} />
    </View>
  );
}
