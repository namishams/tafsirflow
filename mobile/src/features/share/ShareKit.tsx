import { useEffect, useState, type ReactNode } from "react";
import { Pressable, Text, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { SITE } from "@/lib/api";
import { ShareSheet } from "@/features/feed/share";
import { DEFAULT_OPTS, paletteFor, type ShareFormat, type ShareOpts } from "./formats";
import { AchievementTemplate, TextTemplate, VerseTemplate } from "./ShareTemplates";
import { loadVerse } from "@/features/srs/verse";
import { getChapters } from "@/lib/quran";
import { useShareText } from "./texts";

// Reusable sharing for every screen: a branded image card drawn from data (kicker, optional Arabic, title, body,
// big number) in the share templates (ShareTemplates.tsx: five designs, story / portrait / square), the paper-plane button that opens the Instagram-style ShareSheet, and a verse share that loads the
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

export function BrandCard({ format, data, opts }: { format: ShareFormat; data: CardData; opts?: ShareOpts }) {
  const o = opts ?? { ...DEFAULT_OPTS, palette: paletteFor(data.seed ?? data.kicker) };
  const seed = data.seed ?? data.kicker;
  // a figure (score, level, days) is an achievement; everything else a text card
  if (data.big) return <AchievementTemplate format={format} opts={o} kicker={data.kicker} big={data.big} title={data.title} sub={[data.body, data.footer].filter(Boolean).join(" · ") || undefined} seed={seed} />;
  const body = data.body ?? "";
  const max = format === "story" ? 560 : format === "post" ? 360 : 220;
  return <TextTemplate format={format} opts={o} kicker={data.kicker} seed={seed} arabic={data.arabic} title={data.title} body={body.length > max ? `${body.slice(0, body.lastIndexOf(" ", max))} …` : body} source={data.footer} quote={!!data.arabic && !data.title} />;
}

const messageOf = (d: CardData) => [d.kicker, d.title, d.big, d.arabic, d.body && (d.body.length > 400 ? `${d.body.slice(0, 400)} …` : d.body), d.footer].filter(Boolean).join("\n");

/** the share sheet for a branded data card */
export function CardShareSheet({ data, visible, onClose, link = SITE, onShared }: { data: CardData; visible: boolean; onClose: () => void; link?: string; onShared?: () => void }) {
  return <ShareSheet visible={visible} onClose={onClose} link={link} message={messageOf(data)} onShared={onShared} templated seed={data.seed ?? data.kicker} renderCard={(f, o) => <BrandCard format={f} data={data} opts={o} />} />;
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
      video={{ key: verseKey, lang }} templated seed={verseKey}
      chat={{ type: "verse", ref: verseKey, title: v.reference, subtitle: v.translation.slice(0, 200), url: `/surah/${verseKey.split(":")[0]}?v=${verseKey.split(":")[1]}` }}
      renderCard={(f, o) => <VerseTemplate format={f} opts={o} arabic={v.arabic} translation={v.translation} reference={v.reference} verseKey={verseKey} />} />
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
