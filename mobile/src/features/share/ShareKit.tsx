import { useEffect, useState, type ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { SITE } from "@/lib/api";
import { BrandFoot, CARD_SIZE, ShareSheet, type ShareFormat } from "@/features/feed/share";
import { FeedBackdrop, toneOf } from "@/features/feed/art";
import { VerseShareCard } from "@/features/feed/VerseShareCard";
import { loadVerse } from "@/features/srs/verse";
import { getChapters } from "@/lib/quran";
import { useShareText } from "./texts";

// Reusable sharing for every screen: a branded image card drawn from data (kicker, optional Arabic, title, body,
// big number), the paper-plane button that opens the Instagram-style ShareSheet, and a verse share that loads the
// verse text from the Quran API (never typed by hand).

export type CardData = {
  kicker: string;
  title?: string;
  arabic?: string;
  body?: string;
  /** a big figure such as "92 %" or "Level 3" */
  big?: string;
  footer?: string;
  /** tone seed (any string) */
  seed?: string;
};

export function BrandCard({ format, data }: { format: ShareFormat; data: CardData }) {
  const { w, h } = CARD_SIZE[format];
  const story = format === "story";
  const ar = data.arabic ?? "";
  const arSize = Math.round((ar.length < 30 ? 40 : ar.length < 90 ? 28 : ar.length < 200 ? 22 : 17) * (story ? 1 : 0.86));
  const body = data.body ?? "";
  const bSize = body.length < 120 ? 16 : body.length < 300 ? 13.5 : 11.5;
  return (
    <View style={{ width: w, height: h, overflow: "hidden" }}>
      <FeedBackdrop tone={toneOf(data.seed ?? data.kicker)} width={w} height={h} still />
      <View style={{ flex: 1, paddingHorizontal: 26, paddingTop: story ? 64 : 32, paddingBottom: story ? 44 : 22, justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", gap: 6 }}>
          <View style={{ width: 40, height: 1, backgroundColor: stage.goldSoft }} />
          <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2.2, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{data.kicker}</Text>
        </View>
        <View style={{ gap: 14, alignItems: "center" }}>
          {ar ? <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: arSize, lineHeight: arSize * 1.8, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{ar}</Text> : null}
          {data.big ? <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: story ? 56 : 46, color: stage.cream, textAlign: "center" }}>{data.big}</Text> : null}
          {data.title ? <Text allowFontScaling={false} numberOfLines={3} style={{ fontFamily: FONT.bold, fontSize: 22, lineHeight: 29, color: "#fff", textAlign: "center" }}>{data.title}</Text> : null}
          {body ? <Text allowFontScaling={false} numberOfLines={story ? 14 : 8} style={{ fontFamily: FONT.regular, fontSize: bSize, lineHeight: bSize * 1.5, color: "rgba(255,255,255,0.86)", textAlign: "center" }}>{body}</Text> : null}
          {data.footer ? <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: stage.gold, textAlign: "center" }}>{data.footer}</Text> : null}
        </View>
        <BrandFoot />
      </View>
    </View>
  );
}

const messageOf = (d: CardData) => [d.kicker, d.title, d.big, d.arabic, d.body && (d.body.length > 400 ? `${d.body.slice(0, 400)} …` : d.body), d.footer].filter(Boolean).join("\n");

/** the share sheet for a branded data card */
export function CardShareSheet({ data, visible, onClose, link = SITE, onShared }: { data: CardData; visible: boolean; onClose: () => void; link?: string; onShared?: () => void }) {
  return <ShareSheet visible={visible} onClose={onClose} link={link} message={messageOf(data)} onShared={onShared} renderCard={(f) => <BrandCard format={f} data={data} />} />;
}

/** the paper-plane button: icon only (default), or a pill with the label */
export function SendButton({ onPress, label, pill, color, size = 20, style, disabled }: { onPress: () => void; label?: string; pill?: boolean; color?: string; size?: number; style?: StyleProp<ViewStyle>; disabled?: boolean }) {
  const t = useTheme();
  const tx = useShareText();
  const text = label ?? tx.share;
  const c = color ?? (pill ? t.accent : t.muted);
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={text} hitSlop={8}
      style={({ pressed }) => [pill ? { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: R.pill, borderWidth: 1, borderColor: c } : { padding: 4 }, { opacity: disabled ? 0.4 : pressed ? 0.6 : 1 }, style]}>
      <Icon name="send" color={c} size={size} />
      {pill ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: c }}>{text}</Text> : null}
    </Pressable>
  );
}

/** paper-plane button plus its share sheet for a data card (the card data is built lazily when tapped) */
export function ShareCardButton({ data, link, label, pill, color, size, style }: { data: CardData | (() => CardData | null) | null; link?: string; label?: string; pill?: boolean; color?: string; size?: number; style?: StyleProp<ViewStyle> }) {
  const [open, setOpen] = useState<CardData | null>(null);
  const get = () => (typeof data === "function" ? data() : data);
  return (
    <>
      <SendButton onPress={() => { const d = get(); if (d) setOpen(d); }} label={label} pill={pill} color={color} size={size} style={style} disabled={!data} />
      {open ? <CardShareSheet visible data={open} link={link} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

/** share sheet for one Quran verse, its text loaded from the Quran API */
export function VerseShare({ verseKey, onClose, onShared, kicker }: { verseKey: string; onClose: () => void; onShared?: () => void; kicker?: string }) {
  const { lang } = useLang();
  const [v, setV] = useState<{ arabic: string; translation: string; reference: string } | null>(null);
  useEffect(() => {
    let live = true;
    const s = Number(verseKey.split(":")[0]);
    Promise.all([loadVerse(verseKey, lang), getChapters(lang).catch(() => [])]).then(([d, chs]) => {
      if (!live) return;
      const name = (chs as { id: number; name_simple: string }[]).find((c) => c.id === s)?.name_simple ?? String(s);
      setV({ arabic: d.words.map((w) => w.text).join(" "), translation: d.translation, reference: `${kicker ? `${kicker} · ` : ""}${name} · ${verseKey}` });
    }).catch(() => { if (live) onClose(); });
    return () => { live = false; };
  }, [verseKey, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!v) return null;
  return (
    <ShareSheet visible onClose={onClose} onShared={onShared} link={`${SITE}/quran/${verseKey.split(":")[0]}`} message={`${v.arabic}\n${v.translation}\n— ${v.reference}`}
      video={{ key: verseKey, lang }}
      renderCard={(f) => <VerseShareCard format={f} arabic={v.arabic} translation={v.translation} reference={v.reference} tone={toneOf(verseKey)} />} />
  );
}

/** paper-plane button that shares a verse */
export function ShareVerseButton({ verseKey, kicker, label, pill, color, size, style }: { verseKey: string | null | undefined; kicker?: string; label?: string; pill?: boolean; color?: string; size?: number; style?: StyleProp<ViewStyle> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SendButton onPress={() => setOpen(true)} label={label} pill={pill} color={color} size={size} style={style} disabled={!verseKey} />
      {open && verseKey ? <VerseShare verseKey={verseKey} kicker={kicker} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export type { ReactNode };
