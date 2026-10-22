import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page } from "@/components/page";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { getChapters, searchVerses, type Chapter, type SearchHit } from "@/lib/quran";
import { ARABIC_FONT, FONT, useTheme, AR_RIGHT } from "@/lib/theme";
import { GOLD, GoldHairline, HomeStar, MarbleHero, QKey, alpha, useHm } from "./art";
import { openVerse } from "./links";
import { fill, useX } from "./strings";
import { useT } from "@/i18n";
import { usePT } from "@/features/talents/profileText";
import { useScreenBarStyle } from "@/features/reader/statusBar";

/** keeps the <em> highlight of the search API, drops every other tag (SearchView.tsx Highlighted) */
function Highlighted({ html, mark }: { html: string; mark: string }) {
  const parts = html.replace(/<sup[^>]*>[\s\S]*?<\/sup>/g, "").replace(/<(?!\/?em>)[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").split(/(<em>[\s\S]*?<\/em>)/);
  return <>{parts.map((p, i) => (p.startsWith("<em>") ? <Text key={i} style={{ backgroundColor: mark }}>{p.slice(4, -5)}</Text> : p))}</>;
}

/**
 * Quran search like the website (/search): the marble opening with a gilded search field, then surahs that match
 * the name or number, a direct jump for references like 2:255, and the full-text verse search of the server
 * (Arabic and the reader's language) as framed verse cards. `initial` runs a search right away (/search?q=rahma).
 */
export function SearchView({ initial }: { initial?: string }) {
  const t = useTheme();
  // light marble: dark status bar text in light mode while the search is in front
  useScreenBarStyle(t.dark ? "light" : "dark");
  const hm = useHm(t);
  const { lang } = useLang();
  const ws = useWebT("search");
  const wh = useWebT("home");
  const wa = useWebT("app");
  const x = useX();
  const tr = useT();
  const tpp = usePT();
  const [q, setQ] = useState(initial ?? "");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hint, setHint] = useState("");
  const runId = useRef(0);

  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);

  const run = useCallback(async (text: string) => {
    const s = text.trim();
    if (s.length < 2) { setHint(x.search.min); return; }
    setHint(""); setBusy(true); setFailed(false);
    const id = ++runId.current;
    try { const r = await searchVerses(s, lang); if (id === runId.current) setHits(r); }
    catch { if (id === runId.current) { setHits(null); setFailed(true); } }
    finally { if (id === runId.current) setBusy(false); }
  }, [lang, x.search.min]);

  useEffect(() => { if (initial && initial.trim().length >= 2) void run(initial); }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps

  const s = q.trim();
  // "2:255" or "2 255" jumps straight to the verse (only when it exists)
  const ref = useMemo(() => {
    const m = /^(\d{1,3})\s*[:.\s]\s*(\d{1,3})$/.exec(s);
    if (!m) return null;
    const c = chapters.find((ch) => ch.id === Number(m[1]));
    return c && Number(m[2]) >= 1 && Number(m[2]) <= c.verses_count ? `${c.id}:${Number(m[2])}` : null;
  }, [s, chapters]);
  const surahs = useMemo(() => {
    if (!s || ref) return [];
    const low = s.toLowerCase().replace(/[-'ʿ’\s]/g, "");
    return chapters.filter((c) => String(c.id) === s || c.name_simple.toLowerCase().replace(/[-'ʿ’\s]/g, "").includes(low) || c.translated_name.name.toLowerCase().includes(s.toLowerCase()) || c.name_arabic.includes(s)).slice(0, 6);
  }, [s, ref, chapters]);

  const mark = t.dark ? "rgba(214,180,108,0.3)" : "rgba(214,180,108,0.38)";
  // the verse results (up to 20 with Arabic, translation and highlights) are built once per answer, not again on every
  // keystroke in the search field
  const hitTiles = useMemo(() => hits?.map((h) => (
    <ResultTile key={h.verse_key} onPress={() => openVerse(h.verse_key)} label={`${h.verse_key}. ${h.translation.replace(/<[^>]+>/g, "")}`}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <QKey>{h.verse_key}</QKey>
        <LinearGradient colors={[alpha(GOLD, 0.45), "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, height: 1 }} />
      </View>
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 48, color: t.ink, writingDirection: "rtl", textAlign: AR_RIGHT, marginTop: 10 }}>
        <Highlighted html={h.text} mark={mark} />
      </Text>
      {h.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, marginTop: 6 }}><Highlighted html={h.translation} mark={mark} /></Text> : null}
    </ResultTile>
  )), [hits, mark, t]);
  return (
    <Page>
      <MarbleHero kicker={wa("name")} title={ws("title")}>
        {/* owner 21.10.2026 (app and website 1:1): the Quran search next to the account search (Accounts · Top) */}
        <View accessibilityRole="tablist" style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
          {([["quran", tr("tabs.quran")], ["accounts", tpp("tabAccounts")], ["top", tpp("tabTop")]] as const).map(([k, label]) => (
            <Pressable key={k} onPress={k === "quran" ? undefined : () => router.push(`/talents/search${k === "top" ? "?tab=top" : ""}` as Href)} accessibilityRole="tab" accessibilityState={{ selected: k === "quran" }}
              style={({ pressed }) => ({ height: 34, paddingHorizontal: 14, borderRadius: 999, justifyContent: "center", borderWidth: 1, borderColor: k === "quran" ? t.ink : t.line, backgroundColor: k === "quran" ? t.ink : "transparent", opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: k === "quran" ? t.bg : t.ink }}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1, height: 52, borderRadius: 12, borderWidth: 1, borderColor: alpha(GOLD, 0.45), backgroundColor: t.surface, flexDirection: "row", alignItems: "center", paddingStart: 16, gap: 10 }}>
            <Icon name="search" color={hm.goldD} size={18} />
            <TextInput value={q} onChangeText={(v) => { setQ(v); setHint(""); }} onSubmitEditing={() => void run(q)} placeholder={wh("searchVerses")} placeholderTextColor={t.muted}
              returnKeyType="search" autoCorrect={false} autoCapitalize="none" clearButtonMode="while-editing" accessibilityLabel={wh("searchVerses")}
              style={{ flex: 1, height: 50, fontFamily: FONT.regular, fontSize: 16, color: t.ink, paddingEnd: 12 }} />
          </View>
          <GoldButton title={ws("go")} onPress={() => void run(q)} busy={busy} style={{ width: 104 }} />
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, marginTop: 12 }}>{hint || x.search.hint}</Text>
      </MarbleHero>

      <View style={{ paddingHorizontal: 16, paddingTop: 24, gap: 12 }}>
        {ref ? (
          <ResultTile onPress={() => openVerse(ref)} label={fill(x.search.goTo, { key: ref })}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <QKey>{ref}</QKey>
              <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{fill(x.search.goTo, { key: ref })}</Text>
              <Icon name="chevronRight" color={t.muted} size={16} />
            </View>
          </ResultTile>
        ) : null}

        {surahs.length ? <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase", color: t.muted, marginTop: 4 }}>{x.search.surahs}</Text> : null}
        {surahs.map((c) => (
          <ResultTile key={c.id} onPress={() => router.push({ pathname: "/quran/[surah]", params: { surah: String(c.id) } } as Href)} label={`${c.id}. ${c.name_simple}`}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <HomeStar size={40}>{c.id}</HomeStar>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{c.name_simple}</Text>
                <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, marginTop: 2 }}>{c.translated_name.name} · {c.verses_count} {wh("verses")}</Text>
              </View>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 36, color: hm.goldD }}>{c.name_arabic}</Text>
            </View>
          </ResultTile>
        ))}

        {busy && !hits ? <ActivityIndicator color={t.accent} style={{ marginTop: 24 }} /> : null}
        {failed ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: "center", paddingVertical: 24 }}>{x.offline}</Text> : null}
        {hits && hits.length === 0 && !busy ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: "center", paddingVertical: 24 }}>{ws("noResults")}</Text> : null}
        {hits && hits.length > 0 ? <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase", color: t.muted, marginTop: 8 }}>{x.search.verses}</Text> : null}
        {hitTiles}
      </View>
    </Page>
  );
}

/** .q-tile: framed card with a short gold hairline on top */
function ResultTile({ children, onPress, label }: { children: React.ReactNode; onPress: () => void; label: string }) {
  const t = useTheme();
  const hm = useHm(t);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [{ borderRadius: 12, borderWidth: 1, borderColor: pressed ? alpha(GOLD, 0.7) : alpha(GOLD, 0.24), backgroundColor: hm.tile, padding: 16, overflow: "hidden" }, pressed && { transform: [{ scale: 0.985 }] }]}>
      <GoldHairline strength={0.55} style={{ position: "absolute", top: 0, left: "30%", right: "30%" }} />
      {children}
    </Pressable>
  );
}
