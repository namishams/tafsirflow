import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, I18nManager, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ARABIC_FONT, FONT, R, useTheme, AR_RIGHT } from "@/lib/theme";
import { useLang, langLabel } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { readJSON, writeJSON } from "@/lib/store";
import { LimitError, OWN_TAFSIR_ID, getOwnTafsir, getResources, getTafsir, hasOwnTafsir, tafsirBlocks, tafsirOptionsFor, type Resource, type Tafsir } from "@/lib/quran";
import { GoldButton } from "@/components/brand";
import { localeMeta } from "@/web/locales";

// Tafsir for one verse, like the website's tafsir sheet: the own Quran Masterclass tafsir first (if written for this
// language), then Quran.com tafsirs of the reader's language, English classics as fallback. Empty entries belong to
// the nearest earlier verse. Source always shown under the text.
const cache = new Map<string, Tafsir | null>();
const TAFSIR_KEY = "qmc.tafsir";
// tafsir languages written right to left (Quran.com language names and the own tafsir's resourceLang)
const RTL_LANGS = ["arabic", "urdu", "persian", "farsi", "pashto", "kurdish", "sindhi", "uyghur", "hebrew", "dhivehi"];
// visual left for left-to-right text (RN mirrors left/right in a right-to-left layout, see AR_RIGHT)
const LTR_LEFT = (I18nManager.isRTL ? "right" : "left") as "left" | "right";

export function useTafsirSources() {
  const { lang } = useLang();
  const [opts, setOpts] = useState<Resource[]>([]);
  const [hasLocal, setHasLocal] = useState(true);
  useEffect(() => {
    let off = false;
    Promise.all([getResources(), hasOwnTafsir(lang)])
      .then(([r, own]) => {
        if (off) return;
        const { options, hasLocal: local } = tafsirOptionsFor(lang, r.tafsirs);
        const all: Resource[] = own ? [{ id: OWN_TAFSIR_ID, name: `Quran Masterclass · ${langLabel(lang)}`, author_name: "", language_name: localeMeta(lang).resourceLang }, ...options] : options;
        setOpts(all);
        setHasLocal(local || own);
      })
      .catch(() => { if (!off) setOpts([{ id: 169, name: "Ibn Kathir (Abridged)", author_name: "Hafiz Ibn Kathir", language_name: "english" }]); });
    return () => { off = true; };
  }, [lang]);
  return { opts, hasLocal };
}

export function TafsirPanel({ surah, verse }: { surah: number; verse: number }) {
  const t = useTheme();
  const w = useWebT("player");
  const wa = useWebT("account");
  const { lang } = useLang();
  const { user } = useAuth();
  const { opts, hasLocal } = useTafsirSources();
  const [id, setId] = useState<number | null>(() => readJSON<number | null>(TAFSIR_KEY, null));
  const [tafsir, setTafsir] = useState<Tafsir | null | undefined>(undefined);
  const [limit, setLimit] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resent, setResent] = useState(false);
  const [picking, setPicking] = useState(false);
  const tick = useRef(0);

  const active = useMemo(() => (opts.some((o) => o.id === id) ? id : opts[0]?.id ?? null), [opts, id]);
  const source = opts.find((o) => o.id === active);

  useEffect(() => {
    if (active === null) return;
    const run = ++tick.current;
    setTafsir(undefined); setLimit(false); setNeedsVerify(false);
    (async () => {
      try {
        if (active === OWN_TAFSIR_ID) { const r = await getOwnTafsir(lang, surah, verse); if (run === tick.current) setTafsir(r); return; }
        for (let n = verse; n >= 1; n--) {
          const key = `${active}:${surah}:${n}`;
          let r = cache.get(key);
          if (r === undefined) { r = await getTafsir(active, `${surah}:${n}`, n === verse); cache.set(key, r); }
          if (run !== tick.current) return;
          if (r) { setTafsir(r); return; }
        }
        if (run === tick.current) setTafsir(null);
      } catch (e) {
        if (run !== tick.current) return;
        if (e instanceof LimitError) { setLimit(true); setNeedsVerify(e.needsVerify); }
        setTafsir(null);
      }
    })();
  }, [active, surah, verse, lang, user?.id]);

  const choose = (v: number) => { setId(v); writeJSON(TAFSIR_KEY, v, true); setPicking(false); };
  const rtl = RTL_LANGS.includes(source?.language_name?.toLowerCase() ?? "");
  const align = rtl ? AR_RIGHT : LTR_LEFT;
  // the e-mail still needs confirming (website AuthGate mode "verify"): send the link again
  const resend = () => { setResent(true); void api("/api/auth/resend", { body: { locale: lang } }).catch(() => setResent(false)); };
  const blocks = useMemo(() => (tafsir ? tafsirBlocks(tafsir.html) : []), [tafsir]);

  return (
    <View>
      {!hasLocal ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.ink, backgroundColor: t.accentSoft, padding: 10, borderRadius: R.sm, marginBottom: 12 }}>{w("noLocalTafsir", { language: langLabel(lang) })}</Text> : null}
      {opts.length > 1 ? (
        <View style={{ marginBottom: 12 }}>
          <Pressable onPress={() => setPicking(!picking)} accessibilityRole="button" accessibilityLabel={`${w("source")}: ${source?.name ?? ""}`}
            style={{ height: 44, borderRadius: R.sm, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, flex: 1 }} numberOfLines={1}>{source?.name ?? "…"}</Text>
            <Text style={{ color: t.muted, fontSize: 12 }}>{picking ? "▲" : "▼"}</Text>
          </Pressable>
          {picking ? (
            <View style={{ marginTop: 6, borderRadius: R.sm, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
              {opts.map((o, i) => (
                <Pressable key={o.id} onPress={() => choose(o.id)} accessibilityRole="button" accessibilityState={{ selected: o.id === active }}
                  style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 11, backgroundColor: o.id === active ? t.accentSoft : pressed ? t.bg : t.surface, borderTopWidth: i ? 1 : 0, borderTopColor: t.line })}>
                  <Text style={{ fontFamily: o.id === active ? FONT.bold : FONT.regular, fontSize: 14, color: t.ink }}>{o.name}</Text>
                  {o.author_name ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{o.author_name}</Text> : null}
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
      {tafsir === undefined ? <ActivityIndicator color={t.accent} style={{ marginVertical: 16 }} /> : null}
      {limit && needsVerify && user ? (
        <View style={{ borderRadius: R.lg, backgroundColor: t.accentSoft, padding: 16, gap: 12 }} accessibilityRole="alert">
          <Text style={{ fontFamily: FONT.bold, fontSize: 16, lineHeight: 22, color: t.ink }}>{wa("verifyGateTitle")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink }}>{wa("verifyNeeded", { email: user.email })}</Text>
          {resent ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: t.accent }}>{wa("resent")}</Text>
            : <GoldButton title={wa("resend")} onPress={resend} compact />}
        </View>
      ) : limit ? (
        <View style={{ borderRadius: R.lg, backgroundColor: t.accentSoft, padding: 16, gap: 12 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink }}>{w("limitReached")}</Text>
          <GoldButton title={wa("register")} onPress={() => router.push("/register")} compact />
        </View>
      ) : null}
      {tafsir === null && !limit ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{w("noTafsir")}</Text> : null}
      {tafsir ? (
        <View>
          {tafsir.verseKeys.length > 1 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginBottom: 8 }}>{w("covers", { from: tafsir.verseKeys[0].split(":")[1], to: tafsir.verseKeys[tafsir.verseKeys.length - 1].split(":")[1] })}</Text> : null}
          {blocks.map((b, i) => b.kind === "h"
            ? <Text key={i} style={{ fontFamily: FONT.display, fontSize: 18, lineHeight: 24, color: t.ink, marginTop: 14, marginBottom: 4, textAlign: align, writingDirection: rtl ? "rtl" : "ltr" }}>{b.text}</Text>
            : b.kind === "ar"
              ? <Text key={i} style={{ fontFamily: ARABIC_FONT, fontSize: 21, lineHeight: 38, color: t.ink, textAlign: AR_RIGHT, writingDirection: "rtl", marginBottom: 10 }}>{b.text}</Text>
              : <Text key={i} selectable style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 26, color: t.ink, marginBottom: 12, textAlign: align, writingDirection: rtl ? "rtl" : "ltr" }}>{b.text}</Text>)}
          {source ? (
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 8, marginTop: 6 }}>
              {w("source")}: {source.name}{source.author_name ? ` — ${source.author_name}` : ""}{source.id === OWN_TAFSIR_ID ? "" : " (Quran.com)"}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
