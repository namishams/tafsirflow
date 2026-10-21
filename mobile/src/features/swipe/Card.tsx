import { memo, useMemo, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { GoldCard } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { ARABIC_FONT, CALLIG_FONT, FONT, R } from "@/lib/theme";
import { meaning } from "@/web/vocabI18n";
import { PALETTES, darkPaletteFor, type Palette } from "@/features/share/formats";
import Svg, { Defs, G, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { OrnamentRule, Rosette, ShareFrame, type Lay } from "@/features/share/ShareTemplates";
import { useCardFace } from "@/features/srs/CardFace";
import { useVerseData } from "@/features/srs/verse";
import { knowText } from "@/features/feed/knowTexts";
import type { KnowItem } from "@/features/feed/knowledge";
import type { SourceItem } from "@/content/sources";
import { useMomentText } from "@/features/sijill/Moments";
import { TalentAvatar } from "@/features/talents/ui";
import { BadgeButton } from "@/features/talents/badges";
import type { SCard } from "./deck";
import { useSwipeT, type SwipeKey } from "./texts";

// One learning card of Swipe & Learn, drawn like the share templates (features/share/ShareTemplates.tsx): the girih
// ground in night or emerald, the double gold frame with a pointed arch, the kicker over an ornamental rule, Arabic in
// Amiri, titles in Fraunces, the source in gold. Quran text only from the Quran data (verse keys), hadith only from
// their sources. Cards with a back side turn on a tap (review cards, words, names, grammar); questions reveal their answer.
const SERIF = "Fraunces_400Regular";
const SERIF_ITALIC = "Fraunces_400Regular_Italic";
const SERIF_BOLD = "Fraunces_600SemiBold";
const LAY: Lay = { padX: 0, top: 0, bottom: 0, frame: 9, arch: 40, kicker: 0, foot: 0 };
export const KIND_KEY: Record<SCard["kind"], SwipeKey> = {
  srs: "k_srs", word: "k_word", verse: "k_verse", tajweed: "k_tajweed", name: "k_name", quiz: "k_quiz", course: "k_course", maqasid: "k_maqasid",
  grammar: "k_grammar", hadith: "k_hadith", tafsir: "k_tafsir", dua: "k_dua", insight: "k_insight", moment: "k_moment",
};
/** cards that turn over on a tap */
export const hasBack = (c: SCard) => c.kind === "srs" || c.kind === "word" || c.kind === "name" || c.kind === "grammar";

const clean = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\*\*|__/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
const arLen = (s: string) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭ\s]/g, "").length;
/** Arabic size by length (shorter = bigger), within min…max */
const arSize = (s: string, max: number, min = 20) => Math.max(min, Math.min(max, Math.round(max - Math.max(0, arLen(s) - 12) * 0.32)));

/** the fields of every library item kind (knowledge posts, source items, resolved corpus items) */
type AnyItem = Partial<Omit<KnowItem, "kind">> & Partial<Omit<SourceItem, "kind">> & { id: string; kind: string; title: string; body: string; source: string };
export type MashaView = "open" | "already" | "dayFull" | "sent" | "profile" | "error";
export type CardProps = { card: SCard; w: number; h: number; flipped: boolean; onFlip: () => void; answer: number | null; onAnswer: (i: number) => void; masha?: MashaView };

export const LearnCard = memo(function LearnCard(props: CardProps) {
  const { card, w, h } = props;
  const st = useSwipeT();
  const p = PALETTES[darkPaletteFor(card.id)];
  const lib = card.lib as AnyItem | undefined;
  const kicker = card.kind === "srs" ? st("k_srs") : lib?.eyebrow ? lib.eyebrow : st(KIND_KEY[card.kind]);
  return (
    <View style={{ width: w, height: h, borderRadius: 22, overflow: "hidden", backgroundColor: p.bg[1] }}>
      <Ground p={p} w={w} h={h} id={card.id} />
      <ShareFrame p={p} w={w} h={h} l={LAY} />
      <View style={{ flex: 1, paddingHorizontal: 26, paddingTop: LAY.arch + 22, paddingBottom: 22 }}>
        <View style={{ alignItems: "center", gap: 7, marginBottom: 10 }}>
          <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.8, color: p.accent, textAlign: "center" }}>{kicker}</Text>
          <OrnamentRule p={p} width={116} />
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 6 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <Body {...props} p={p} />
        </ScrollView>
      </View>
    </View>
  );
});

// the ground of the share templates, calmer for reading on screen: the palette's gradient, the girih lattice and a soft
// light from above (the template's glow is made for a 1080 px image and would wash out the kicker here)
const TILE = 44;
const GIRIH = (() => {
  const c = TILE / 2, r = 12, a = r * Math.SQRT1_2;
  return {
    star: `M${c} ${c - r}L${c + r} ${c}L${c} ${c + r}L${c - r} ${c}ZM${c - a} ${c - a}L${c + a} ${c - a}L${c + a} ${c + a}L${c - a} ${c + a}Z`,
    links: `M${c} 0V${c - r}M${c} ${c + r}V${TILE}M0 ${c}H${c - r}M${c + r} ${c}H${TILE}M0 0L${c - a} ${c - a}M${TILE} 0L${c + a} ${c - a}M0 ${TILE}L${c - a} ${c + a}M${TILE} ${TILE}L${c + a} ${c + a}`,
  };
})();
const Ground = memo(function Ground({ p, w, h, id }: { p: Palette; w: number; h: number; id: string }) {
  const k = id.replace(/[^a-z0-9]/gi, "").slice(-12) || "c";
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={p.bg as [string, string, ...string[]]} start={{ x: 0.35, y: 0 }} end={{ x: 0.65, y: 1 }} style={StyleSheet.absoluteFill} />
      <Svg width={w} height={h}>
        <Defs>
          <Pattern id={`sw-g-${k}`} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
            <G fill="none" stroke={p.line} strokeWidth={0.7}>
              <Path d={GIRIH.star} strokeOpacity={0.09} />
              <Path d={GIRIH.links} strokeOpacity={0.055} />
            </G>
          </Pattern>
          <RadialGradient id={`sw-l-${k}`} cx="50%" cy="0%" rx="70%" ry="32%">
            <Stop offset="0" stopColor="#E9CF99" stopOpacity={0.16} />
            <Stop offset="1" stopColor="#E9CF99" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={w} height={h} fill={`url(#sw-g-${k})`} />
        <Rect width={w} height={h} fill={`url(#sw-l-${k})`} />
      </Svg>
    </View>
  );
});

function Body(props: CardProps & { p: Palette }) {
  const { card } = props;
  switch (card.kind) {
    case "srs": return <SrsBody {...props} />;
    case "word": return <WordBody {...props} />;
    case "verse": return <VerseBody {...props} />;
    case "hadith": return <HadithBody {...props} />;
    case "moment": return <MomentBody {...props} />;
    case "quiz": return <QuizBody {...props} />;
    case "name": return <NameBody {...props} />;
    case "grammar": return <GrammarBody {...props} />;
    default: return <TextBody {...props} />;
  }
}

// ---------- building blocks ----------
const Ar = ({ p, children, size, callig }: { p: Palette; children: string; size: number; callig?: boolean }) => (
  <Text accessibilityLanguage="ar" style={{ fontFamily: callig ? CALLIG_FONT : ARABIC_FONT, fontSize: size, lineHeight: size * (callig ? 1.6 : 1.85), color: p.arabic, textAlign: "center", writingDirection: "rtl" }}>{children}</Text>
);
const Title = ({ p, children, size = 22 }: { p: Palette; children: string; size?: number }) => (
  <Text style={{ fontFamily: SERIF_BOLD, fontSize: size, lineHeight: size * 1.28, letterSpacing: -0.2, color: p.ink, textAlign: "center" }}>{children}</Text>
);
const Para = ({ p, children, quote, size = 16 }: { p: Palette; children: string; quote?: boolean; size?: number }) => (
  <Text style={{ fontFamily: quote ? SERIF_ITALIC : FONT.regular, fontSize: size, lineHeight: size * 1.5, color: p.soft, textAlign: "center" }}>
    {quote ? <Text style={{ fontFamily: SERIF, color: p.accent }}>“</Text> : null}{children}{quote ? <Text style={{ fontFamily: SERIF, color: p.accent }}>”</Text> : null}
  </Text>
);
const Source = ({ p, children }: { p: Palette; children: string }) => (
  <Text numberOfLines={3} style={{ fontFamily: FONT.semibold, fontSize: 11.5, lineHeight: 16, letterSpacing: 0.4, color: p.accent, textAlign: "center", marginTop: 6 }}>{children}</Text>
);
const Note = ({ p, children }: { p: Palette; children: string }) => (
  <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: p.muted, textAlign: "center" }}>{children}</Text>
);
const Hint = ({ p, children }: { p: Palette; children: string }) => (
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
    <Icon name="repeat" size={13} color={p.muted} />
    <Text style={{ fontFamily: FONT.medium, fontSize: 12, color: p.muted }}>{children}</Text>
  </View>
);
const Bullets = ({ p, items }: { p: Palette; items?: string[] }) => (items?.length ? (
  <View style={{ gap: 6, alignSelf: "stretch", marginTop: 2 }}>
    {items.map((b, i) => (
      <View key={i} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
        <View style={{ width: 5, height: 5, marginTop: 8, transform: [{ rotate: "45deg" }], backgroundColor: p.line }} />
        <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: p.soft, textAlign: "left" }}>{clean(b)}</Text>
      </View>
    ))}
  </View>
) : null);
function More({ p, href }: { p: Palette; href?: string }) {
  const st = useSwipeT();
  if (!href) return null;
  return (
    <Pressable onPress={() => router.push(href as Href)} accessibilityRole="link" hitSlop={8} style={({ pressed }) => ({ alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, paddingHorizontal: 14, minHeight: 34, borderRadius: R.pill, borderWidth: 1, borderColor: p.line, opacity: pressed ? 0.7 : 1 })}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: p.ink }}>{st("learnMore")}</Text>
      <Icon name="chevronRight" size={13} color={p.line} />
    </Pressable>
  );
}

/** a verse from the Quran data, with optional highlighted word positions */
function VerseText({ p, verseKey, highlight, size = 30, translation = true }: { p: Palette; verseKey: string; highlight?: number[]; size?: number; translation?: boolean }) {
  const { lang } = useLang();
  const st = useSwipeT();
  const v = useVerseData(verseKey, lang);
  if (!v?.data) return v?.error ? <Note p={p}>{st("offline")}</Note> : <ActivityIndicator color={p.line} style={{ marginVertical: 12 }} />;
  const text = v.data.words.map((x) => x.text).join(" ");
  const s = arSize(text, size, 19);
  const hi = new Set(highlight ?? []);
  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      <Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: s, lineHeight: s * 1.85, color: p.arabic, textAlign: "center", writingDirection: "rtl" }}>
        {v.data.words.map((x, i) => <Text key={x.position} style={hi.has(x.position) ? { color: p.accent, textDecorationLine: "underline" } : undefined}>{`${i ? " " : ""}${x.text}`}</Text>)}
      </Text>
      {translation && v.data.translation ? (<><OrnamentRule p={p} width={60} /><Para p={p} quote size={15.5}>{clean(v.data.translation)}</Para></>) : null}
      <Source p={p}>{st("verseRef", { key: verseKey })}</Source>
    </View>
  );
}

function Flip({ flipped, onFlip, front, back, label }: { flipped: boolean; onFlip: () => void; front: ReactNode; back: ReactNode; label: string }) {
  return (
    <Pressable onPress={onFlip} accessibilityRole="button" accessibilityHint={label} accessibilityState={{ expanded: flipped }} style={{ alignSelf: "stretch" }}>
      {flipped ? back : front}
    </Pressable>
  );
}

// ---------- the kinds ----------
function SrsBody({ card, p, flipped, onFlip }: CardProps & { p: Palette }) {
  const st = useSwipeT();
  const face = useCardFace(card.srs ?? "", 1);
  return (
    <Flip flipped={flipped} onFlip={onFlip} label={st("a11yFlip")}
      front={<View style={{ alignItems: "center", gap: 10 }}>{face.front}<Hint p={p}>{st("tapFlip")}</Hint></View>}
      back={<GoldCard style={{ alignItems: "center", gap: 6 }}>{face.back}</GoldCard>} />
  );
}

function WordBody({ card, p, flipped, onFlip }: CardProps & { p: Palette }) {
  const st = useSwipeT();
  const { lang } = useLang();
  const w = card.word!;
  return (
    <Flip flipped={flipped} onFlip={onFlip} label={st("a11yFlip")}
      front={(
        <View style={{ alignItems: "center", gap: 8 }}>
          <Ar p={p} size={64}>{w.ar}</Ar>
          {lang !== "ar" ? <Text style={{ fontFamily: SERIF_ITALIC, fontSize: 19, color: p.soft }}>{w.tr}</Text> : null}
          <Hint p={p}>{st("tapFlip")}</Hint>
        </View>
      )}
      back={(
        <View style={{ alignItems: "center", gap: 10 }}>
          <Ar p={p} size={40}>{w.ar}</Ar>
          <Title p={p} size={26}>{meaning(w, lang)}</Title>
          {w.root ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: p.muted }}>{`${st("root")} `}<Text accessibilityLanguage="ar" style={{ fontFamily: ARABIC_FONT, fontSize: 17, color: p.soft }}>{w.root}</Text></Text> : null}
          {w.ex ? <View style={{ marginTop: 6, alignSelf: "stretch" }}><VerseText p={p} verseKey={w.ex.key} size={22} translation={false} /></View> : null}
          <Note p={p}>{st("newWord")}</Note>
        </View>
      )} />
  );
}

function VerseBody({ card, p }: CardProps & { p: Palette }) {
  return <VerseText p={p} verseKey={card.verse!} size={34} />;
}

function NameBody({ card, p, flipped, onFlip }: CardProps & { p: Palette }) {
  const st = useSwipeT();
  const it = card.lib as AnyItem;
  return (
    <Flip flipped={flipped} onFlip={onFlip} label={st("a11yFlip")}
      front={(
        <View style={{ alignItems: "center", gap: 10 }}>
          <Rosette p={p} size={56}><Icon name="starBig" color={p.line} size={20} /></Rosette>
          {it.arabic ? <Ar p={p} size={58} callig>{it.arabic}</Ar> : null}
          <Title p={p} size={24}>{clean(it.title)}</Title>
          <Hint p={p}>{st("tapFlip")}</Hint>
        </View>
      )}
      back={(
        <View style={{ alignItems: "center", gap: 10 }}>
          {it.arabic ? <Ar p={p} size={34} callig>{it.arabic}</Ar> : null}
          <Title p={p} size={22}>{clean(it.title)}</Title>
          {it.body ? <Para p={p} size={17}>{clean(it.body)}</Para> : null}
          {it.verse ? <View style={{ alignSelf: "stretch", marginTop: 4 }}><VerseText p={p} verseKey={it.verse} size={22} /></View> : null}
          <Source p={p}>{it.source}</Source>
          <More p={p} href={it.href} />
        </View>
      )} />
  );
}

function GrammarBody({ card, p, flipped, onFlip }: CardProps & { p: Palette }) {
  const st = useSwipeT();
  const it = card.lib as KnowItem;
  return (
    <Flip flipped={flipped} onFlip={onFlip} label={st("a11yFlip")}
      front={(
        <View style={{ alignItems: "center", gap: 10 }}>
          <Title p={p} size={21}>{clean(it.title)}</Title>
          {it.verse ? <VerseText p={p} verseKey={it.verse} highlight={it.words} size={26} translation={false} /> : null}
          {it.bullets?.[0] ? <Para p={p} size={15.5}>{clean(it.bullets[0])}</Para> : null}
          <Hint p={p}>{st("tapFlip")}</Hint>
        </View>
      )}
      back={(
        <View style={{ alignItems: "center", gap: 10 }}>
          <Title p={p} size={21}>{clean(it.title)}</Title>
          <Para p={p} size={15.5}>{clean(it.body)}</Para>
          <Source p={p}>{it.source}</Source>
          <More p={p} href={it.href} />
        </View>
      )} />
  );
}

function QuizBody({ card, p, answer, onAnswer }: CardProps & { p: Palette }) {
  const st = useSwipeT();
  const it = card.lib as KnowItem;
  const q = it.quiz!;
  const shown = answer !== null;
  return (
    <View style={{ alignItems: "stretch", gap: 10 }}>
      <Title p={p} size={clean(it.title).length > 120 ? 17 : 20}>{clean(it.title)}</Title>
      {it.verse ? <VerseText p={p} verseKey={it.verse} highlight={it.words} size={24} translation={false} /> : null}
      <View style={{ gap: 8, marginTop: 4 }}>
        {q.options.map((o, i) => {
          const right = i === q.answer, chosen = answer === i;
          const border = shown && right ? p.accent : shown && chosen ? "rgba(214,120,110,0.9)" : "rgba(214,180,108,0.35)";
          return (
            <Pressable key={i} onPress={() => !shown && onAnswer(i)} disabled={shown} accessibilityRole="button"
              accessibilityState={{ selected: chosen, disabled: shown }} accessibilityLabel={shown && right ? `${o}, ${st("correct")}` : o}
              style={({ pressed }) => ({ minHeight: 46, borderRadius: R.lg, borderWidth: 1, borderColor: border, paddingHorizontal: 14, paddingVertical: 10, justifyContent: "center",
                backgroundColor: shown && right ? "rgba(214,180,108,0.16)" : pressed ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)" })}>
              <Text style={{ fontFamily: shown && right ? FONT.bold : FONT.medium, fontSize: 15, lineHeight: 21, color: p.ink, textAlign: "left" }}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
      {shown ? (
        <View accessibilityLiveRegion="polite" style={{ gap: 6, marginTop: 4 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: answer === q.answer ? p.accent : p.soft, textAlign: "center" }}>{answer === q.answer ? st("correct") : st("notQuite")}</Text>
          {q.explain ? <Para p={p} size={14.5}>{clean(q.explain)}</Para> : null}
        </View>
      ) : (
        <Pressable onPress={() => onAnswer(-1)} accessibilityRole="button" hitSlop={6} style={{ alignSelf: "center", paddingVertical: 6 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: p.muted, textDecorationLine: "underline" }}>{st("showAnswer")}</Text>
        </Pressable>
      )}
      {it.review ? <Note p={p}>{st("reviewNote")}</Note> : null}
      <Source p={p}>{it.source}</Source>
    </View>
  );
}

function HadithBody({ card, p }: CardProps & { p: Palette }) {
  const h = card.hadith!;
  const ar = h.arabic ? clean(h.arabic) : "";
  const text = clean(h.text);
  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      {ar ? <Text accessibilityLanguage="ar" numberOfLines={8} style={{ fontFamily: ARABIC_FONT, fontSize: arSize(ar, 24, 17), lineHeight: arSize(ar, 24, 17) * 1.85, color: p.arabic, textAlign: "center", writingDirection: "rtl" }}>{ar}</Text> : null}
      {ar && text ? <OrnamentRule p={p} width={60} /> : null}
      {text ? <Para p={p} quote size={text.length > 500 ? 14.5 : 16}>{text}</Para> : null}
      <Source p={p}>{[h.source, h.grade].filter(Boolean).join(" · ")}</Source>
    </View>
  );
}

function TextBody({ card, p }: CardProps & { p: Palette }) {
  const { lang } = useLang();
  const st = useSwipeT();
  const it = card.lib as AnyItem;
  const kt = useMemo(() => knowText(lang), [lang]);
  if (!it) return null;
  const body = clean(it.body ?? "");
  const quote = card.kind === "dua";
  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      {card.kind === "tajweed" || card.kind === "maqasid" || card.kind === "course" ? <Rosette p={p} size={44}><Icon name={card.kind === "tajweed" ? "speaker" : card.kind === "maqasid" ? "sun" : "cap"} color={p.line} size={17} /></Rosette> : null}
      {it.arabic ? <Ar p={p} size={arSize(it.arabic, card.kind === "tajweed" ? 40 : 30, 18)}>{clean(it.arabic)}</Ar> : null}
      {it.title ? <Title p={p} size={it.title.length > 70 ? 18 : 22}>{clean(it.title)}</Title> : null}
      {body ? <Para p={p} quote={quote} size={body.length > 600 ? 14 : body.length > 300 ? 15 : 16}>{body}</Para> : null}
      <Bullets p={p} items={it.bullets} />
      {it.madhhab ? <Note p={p}>{kt.madhhab}</Note> : null}
      {it.note ? <Note p={p}>{clean(it.note)}</Note> : null}
      {it.review ? <Note p={p}>{st("reviewNote")}</Note> : null}
      {card.kind === "tajweed" && it.verse ? <Source p={p}>{st("verseRef", { key: it.verse })}</Source> : null}
      {it.source ? <Source p={p}>{it.source}</Source> : null}
      <More p={p} href={it.href} />
    </View>
  );
}

function MomentBody({ card, p, masha }: CardProps & { p: Palette }) {
  const st = useSwipeT();
  const text = useMomentText();
  const m = card.moment!;
  const state = masha ?? "open";
  const msg = state === "sent" ? st("mashaSent") : state === "already" || state === "dayFull" ? st("mashaAlready") : state === "profile" ? st("mashaProfile") : state === "error" ? st("mashaError") : st("mashaHint");
  return (
    <View style={{ alignItems: "center", gap: 12 }}>
      <Pressable onPress={() => router.push(`/talents/u/${m.author.username}` as Href)} accessibilityRole="link" accessibilityLabel={m.author.name} style={{ alignItems: "center", gap: 8 }}>
        <TalentAvatar name={m.author.name} size={72} uri={m.author.avatar} badge={m.author.badge} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text numberOfLines={1} style={{ fontFamily: SERIF_BOLD, fontSize: 21, color: p.ink }}>{m.author.name}</Text>
          <BadgeButton badge={m.author.badge} size={15} />
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: p.muted }}>{`@${m.author.username} · ${m.follow ? st("following") : st("community")}`}</Text>
      </Pressable>
      <Rosette p={p} size={60}><Icon name="trophy" color={p.line} size={22} /></Rosette>
      <Title p={p} size={21}>{text(m)}</Title>
      <View accessibilityLiveRegion="polite" style={{ marginTop: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: R.pill, borderWidth: 1, borderColor: p.line, backgroundColor: state === "sent" || state === "already" ? "rgba(214,180,108,0.16)" : "transparent" }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: p.ink, textAlign: "center" }}>{msg}</Text>
      </View>
    </View>
  );
}
