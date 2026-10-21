import { DEFAULT_OPTS, paletteFor, type ShareFormat, type ShareOpts } from "@/features/share/formats";
import { VerseTemplate } from "@/features/share/ShareTemplates";

// The image of a verse for Instagram / WhatsApp: the verse share template (features/share/ShareTemplates.tsx) with the
// verse in Arabic, the translation, the reference and the brand line. Kept for the older callers; `tone` is unused
// since the designs (night, emerald, dawn, parchment, marble) replaced the surah tints.

export function VerseShareCard({ format, arabic, translation, reference, opts }: { format: ShareFormat; arabic: string; translation: string; reference: string; tone?: [string, string]; opts?: ShareOpts }) {
  const key = reference.match(/\d+:\d+/)?.[0];
  return <VerseTemplate format={format} opts={opts ?? { ...DEFAULT_OPTS, palette: paletteFor(key ?? reference) }} arabic={arabic} translation={translation} reference={reference} verseKey={key} />;
}
