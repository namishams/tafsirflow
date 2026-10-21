import { statSave } from "./statsStore";
import { memo, useEffect, useRef, useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { AR_RIGHT, ARABIC_FONT, FONT, stage } from "@/lib/theme";
import type { HadithFeedItem } from "./hadith";
import { SAVED_KEY as HADITH_SAVED_KEY, toggleSaved as toggleSavedHadith, type HadithItem } from "@/features/hadith/data";
import { SAVED_NAMES_KEY, toggleSavedName } from "./savedNames";
import { openPro } from "@/lib/pro";
import { useStored } from "@/lib/store";
import { reciterName } from "@/lib/quran";
import type { VerseEngine } from "@/features/quran/useVerseAudio";
import { ProCard, StoryContent } from "@/features/prophet/StoryContent";
import { SAVED_KEY, toggleSavedStory, markSeen } from "@/features/prophet/useStories";
import { usePlayableReciter, sampleUrls } from "@/features/prophet/sample";
import { useProphetText } from "@/features/prophet/texts";
import type { AllahName, Story } from "@/features/prophet/stories";
import { FeedBackdrop, SpeakerIcon, toneOf } from "./art";
import { useFeedText } from "./texts";
import { Action } from "./ui";

// The non-verse pages of the feed: story cards (prophet, prophets, Companions, Islam then and now, reciters, Shams
// tips, Secrets of the Quran), a name of Allah from the library's list, and the Pro card after the free stories.

type Common = { width: number; height: number; active: boolean; topInset: number; bottomInset: number; reduce: boolean; engine: VerseEngine; lang: string };

export const StoryPage = memo(function StoryPage(p: Common & { story: Story; allowed: boolean; onSeen: (id: string) => void; onShare: (s: Story) => void; onLater: () => void }) {
  const tx = useProphetText();
  const saved = useStored<string[]>(SAVED_KEY, []).includes(p.story.id);
  const voice = usePlayableReciter(p.story.reciter);
  const [sampling, setSampling] = useState(false);
  const step = useRef(0);

  useEffect(() => {
    if (!p.active) { if (sampling) { p.engine.onEnd.current = null; setSampling(false); } return; }
    if (p.allowed) { p.onSeen(p.story.id); markSeen(p.story.id); }
    if (!sampling) p.engine.pause(); // a story has no recitation of its own
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.active, p.allowed]);

  const sample = () => {
    if (!voice) return;
    if (!voice.free) { openPro("reciters"); return; }
    if (sampling) { p.engine.pause(); p.engine.onEnd.current = null; setSampling(false); return; }
    const urls = sampleUrls(voice.reciter);
    step.current = 0;
    p.engine.onEnd.current = () => { step.current++; if (step.current < urls.length) p.engine.play(urls[step.current], { title: voice.reciter.name, artist: "Quran Masterclass" }); else { p.engine.onEnd.current = null; setSampling(false); } };
    p.engine.play(urls[0], { title: voice.reciter.name, artist: "Quran Masterclass" });
    setSampling(true);
  };

  const wide = p.width >= 700;
  return (
    <View style={{ width: p.width, height: p.height, overflow: "hidden" }}>
      <FeedBackdrop tone={toneOf(p.story.group)} width={p.width} height={p.height} animate={p.active && !p.reduce} still={p.reduce} />
      <View style={{ flex: 1, paddingTop: p.topInset + 70, paddingBottom: p.bottomInset + 24, flexDirection: "row" }}>
        <ScrollView style={{ flex: 1 }} nestedScrollEnabled contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingStart: 22, paddingEnd: 10, paddingVertical: 8, maxWidth: 700, alignSelf: "center", width: "100%" }}>
          {p.allowed ? (
            <StoryContent story={p.story} wide={wide} compactSources onReadMore={() => router.push(p.story.href as Href)} />
          ) : (
            <ProCard onPro={() => openPro("general")} onLater={p.onLater} />
          )}
        </ScrollView>
        {p.allowed ? (
          <View style={{ width: 72, justifyContent: "flex-end", alignItems: "center", gap: 16, paddingEnd: 6 }}>
            {voice ? (
              <Action color="#fff" custom={voice.free ? <SpeakerIcon muted={false} color={sampling ? stage.gold : "#fff"} /> : <Text style={{ fontFamily: FONT.bold, fontSize: 11, color: stage.gold }}>PRO</Text>}
                label={voice.free ? (sampling ? tx.stopSample : tx.listen) : tx.proVoice} a11y={`${voice.free ? (sampling ? tx.stopSample : tx.listen) : tx.proVoice}, ${reciterName(voice.reciter, p.lang)}`} selected={sampling} onPress={sample} />
            ) : null}
            <Action icon="bookmark" filled={saved} color={saved ? stage.gold : "#fff"} label={saved ? tx.saved : tx.save} a11y={saved ? tx.unsave : tx.save} selected={saved} onPress={() => { if (!saved) statSave(); toggleSavedStory(p.story.id); }} />
            <Action icon="send" color="#fff" label={tx.share} a11y={tx.share} onPress={() => p.onShare(p.story)} />
            <Action icon="book" color="#fff" label={tx.readMore} a11y={tx.readMore} onPress={() => router.push(p.story.href as Href)} />
          </View>
        ) : null}
      </View>
    </View>
  );
});

export const NamePage = memo(function NamePage(p: Common & { name: AllahName; onShare: (n: AllahName) => void }) {
  const ft = useFeedText();
  const tx = useProphetText();
  // saved like on Home (the same device key, by the Arabic name)
  const saved = useStored<string[]>(SAVED_NAMES_KEY, []).includes(p.name.ar);
  useEffect(() => { if (p.active) p.engine.pause(); }, [p.active, p.engine]);
  const wide = p.width >= 700;
  return (
    <View style={{ width: p.width, height: p.height, overflow: "hidden" }}>
      <FeedBackdrop tone={toneOf(`name:${p.name.latin}`)} width={p.width} height={p.height} animate={p.active && !p.reduce} still={p.reduce} />
      <View style={{ flex: 1, paddingTop: p.topInset + 70, paddingBottom: p.bottomInset + 24, flexDirection: "row" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 22 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{ft.nameTitle}</Text>
          <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: wide ? 96 : 76, lineHeight: (wide ? 96 : 76) * 1.7, color: "rgb(233,207,153)", textAlign: "center", marginTop: 12 }}>{p.name.ar}</Text>
          <Text style={{ fontFamily: FONT.italic, fontSize: 19, color: stage.textSoft, textAlign: "center" }}>{p.name.latin}</Text>
          <Text style={{ fontFamily: FONT.display, fontSize: wide ? 30 : 25, lineHeight: wide ? 37 : 31, color: "#fff", textAlign: "center", marginTop: 14 }}>{p.name.meaning}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.textMuted, textAlign: "center", marginTop: 22 }}>{ft.nameSource}</Text>
        </View>
        <View style={{ width: 72, justifyContent: "flex-end", alignItems: "center", gap: 16, paddingEnd: 6 }}>
          <Action icon="bookmark" filled={saved} color={saved ? stage.gold : "#fff"} label={saved ? tx.saved : tx.save} a11y={saved ? tx.unsave : tx.save} selected={saved} onPress={() => { if (!saved) statSave(); toggleSavedName(p.name.ar); }} />
          <Action icon="send" color="#fff" label={tx.share} a11y={tx.share} onPress={() => p.onShare(p.name)} />
          <Action icon="book" color="#fff" label={tx.readMore} a11y={tx.readMore} onPress={() => router.push("/islam/names" as Href)} />
        </View>
      </View>
    </View>
  );
});

export const ProPage = memo(function ProPage(p: Common & { onLater: () => void }) {
  useEffect(() => { if (p.active) p.engine.pause(); }, [p.active, p.engine]);
  return (
    <View style={{ width: p.width, height: p.height, overflow: "hidden" }}>
      <FeedBackdrop tone={[stage.bg, stage.deep]} width={p.width} height={p.height} animate={p.active && !p.reduce} still={p.reduce} />
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 22, paddingTop: p.topInset + 60, paddingBottom: p.bottomInset + 24, maxWidth: 560, alignSelf: "center", width: "100%" }}>
        <ProCard onPro={() => openPro("general")} onLater={p.onLater} />
      </View>
    </View>
  );
});

export const HadithPage = memo(function HadithPage(p: Common & { item: HadithFeedItem; onShare?: (h: HadithFeedItem) => void }) {
  const tx = useProphetText();
  const ft = useFeedText();
  useEffect(() => { if (p.active) p.engine.pause(); }, [p.active, p.engine]);
  // the same actions as the hadith post on Home: save (the hadith collection's saved list), share, the source
  const saved = useStored<HadithItem[]>(HADITH_SAVED_KEY, []).some((x) => x.id === p.item.item.id);
  const url = p.item.item.url;
  const wide = p.width >= 700;
  return (
    <View style={{ width: p.width, height: p.height, overflow: "hidden" }}>
      <FeedBackdrop tone={toneOf(`hadith:${p.item.source}`)} width={p.width} height={p.height} animate={p.active && !p.reduce} still={p.reduce} />
      <View style={{ flex: 1, paddingTop: p.topInset + 70, paddingBottom: p.bottomInset + 24, flexDirection: "row" }}>
        <ScrollView style={{ flex: 1 }} nestedScrollEnabled contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingStart: 22, paddingEnd: 10, paddingVertical: 8, gap: 16, maxWidth: 700, alignSelf: "center", width: "100%" }}>
          {p.item.arabic ? <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: wide ? 30 : 25, lineHeight: (wide ? 30 : 25) * 1.9, color: "#fff", textAlign: AR_RIGHT, writingDirection: "rtl" }}>{p.item.arabic}</Text> : null}
          <Text selectable style={{ fontFamily: FONT.regular, fontSize: wide ? 20 : 17, lineHeight: wide ? 31 : 27, color: "rgba(255,255,255,0.92)" }}>{p.item.text}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }}>{[p.item.narrator, p.item.source, p.item.grade].filter(Boolean).join(" · ")}</Text>
        </ScrollView>
        <View style={{ width: 72, justifyContent: "flex-end", alignItems: "center", gap: 16, paddingEnd: 6 }}>
          <Action icon="bookmark" filled={saved} color={saved ? stage.gold : "#fff"} label={saved ? tx.saved : tx.save} a11y={saved ? tx.unsave : tx.save} selected={saved} onPress={() => { if (!saved) statSave(); toggleSavedHadith(p.item.item); }} />
          {p.onShare ? <Action icon="send" color="#fff" label={tx.share} a11y={tx.share} onPress={() => p.onShare?.(p.item)} /> : null}
          {url ? <Action icon="globe" color="#fff" label={ft.sourceLabel} a11y={`${ft.sourceLabel}: ${p.item.source}`} onPress={() => void Linking.openURL(url).catch(() => undefined)} /> : null}
        </View>
      </View>
    </View>
  );
});
