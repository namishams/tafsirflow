import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Redirect, Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { PageHero } from "@/components/page";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { SUNNI_NAMES, shiaBook, shiaBookTitle, shiaPage, shiaPages, sunniCollection, sunniSection, type HadithItem } from "@/features/hadith/data";
import { ActionButton, HADITH_FREE_PREVIEW, HadithCard, HadithProCard, LoadState } from "@/features/hadith/ui";
import { usePro } from "@/lib/pro";
import { fill, useHadithText } from "@/features/hadith/texts";

// /hadith/[collection] – a Sunni collection (books → hadith of one book, ?book=n) or a Thaqalayn book (pages of ten,
// ?page=n). Texts are loaded from the APIs and kept on the device after the first load. Pro: without it the first
// HADITH_FREE_PREVIEW hadith of every book (Sunni) or of the first page (Thaqalayn) are shown, then the Pro card.
export default function HadithCollection() {
  const { collection, book, page } = useLocalSearchParams<{ collection: string; book?: string; page?: string }>();
  const key = decodeURIComponent(String(collection));
  if (sunniCollection(key)) return <Sunni k={key} book={book !== undefined ? Number(book) : null} />;
  if (shiaBook(key)) return <Shia id={key} page={Math.max(0, Number(page ?? 0) || 0)} />;
  return <Redirect href={"/hadith" as Href} />;
}

function useLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [s, setS] = useState<{ v: T | null; status: "loading" | "ok" | "error" }>({ v: null, status: "loading" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setS({ v: null, status: "loading" });
    load().then((v) => live && setS({ v, status: "ok" })).catch(() => live && setS({ v: null, status: "error" }));
    return () => { live = false; };
  }, [...deps, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...s, retry: useCallback(() => setTick((n) => n + 1), []) };
}

function Sunni({ k, book }: { k: string; book: number | null }) {
  const c = sunniCollection(k)!;
  const x = useHadithText();
  const t = useTheme();
  const names = SUNNI_NAMES[k] ?? { en: c.name, ar: "" };
  const single = c.sections.length === 1 ? c.sections[0].n : null;
  const section = book ?? single;
  if (section === null) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <FlatList
          style={{ flex: 1, backgroundColor: t.bg }}
          contentContainerStyle={{ paddingBottom: 130 }}
          ListHeaderComponent={<View style={{ marginBottom: 20 }}><PageHero topInset back eyebrow={x.title} title={names.en} arabic={names.ar} lead={`${fill(x.hadiths, { n: c.max })} · ${c.sections.length} ${x.books}`} /></View>}
          data={c.sections}
          keyExtractor={(s) => String(s.n)}
          renderItem={({ item: s }) => (
            <Pressable onPress={() => router.push(`/hadith/${k}?book=${s.n}` as Href)} accessibilityRole="button" accessibilityLabel={`${s.n}. ${s.name}`}
              style={({ pressed }) => ({ marginHorizontal: 16, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: pressed ? t.gold : t.line, backgroundColor: t.surface })}>
              <Text style={{ fontFamily: FONT.display, fontSize: 18, color: t.gold, minWidth: 30 }}>{s.n}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{s.name}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, marginTop: 2 }}>{s.first}–{s.last}</Text>
              </View>
              <Icon name="chevronRight" color={t.gold} size={16} />
            </Pressable>
          )}
        />
      </>
    );
  }
  return <SunniBook k={k} section={section} />;
}

function SunniBook({ k, section }: { k: string; section: number }) {
  const c = sunniCollection(k)!;
  const x = useHadithText();
  const t = useTheme();
  const { lang } = useLang();
  const names = SUNNI_NAMES[k] ?? { en: c.name, ar: "" };
  const s = c.sections.find((y) => y.n === section);
  const data = useLoad(() => sunniSection(k, section, lang), [k, section, lang]);
  const { pro } = usePro();
  const shown = data.v ? (pro ? data.v : data.v.slice(0, HADITH_FREE_PREVIEW)) : [];
  const idx = c.sections.findIndex((y) => y.n === section);
  const prev = c.sections[idx - 1], next = c.sections[idx + 1];
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        style={{ flex: 1, backgroundColor: t.bg }}
        contentContainerStyle={{ paddingBottom: 130 }}
        ListHeaderComponent={<View style={{ marginBottom: 20 }}><PageHero topInset back eyebrow={names.en} title={s?.name ?? names.en} arabic={names.ar} lead={s ? `${s.first}–${s.last}` : undefined} /></View>}
        data={shown}
        keyExtractor={(h) => h.id}
        initialNumToRender={4}
        windowSize={7}
        renderItem={({ item }) => <View style={{ paddingHorizontal: 16, marginBottom: 14 }}><HadithCard item={item} /></View>}
        ListEmptyComponent={<LoadState state={data.status === "error" ? "error" : "loading"} onRetry={data.retry} />}
        ListFooterComponent={data.v ? <>{!pro && data.v.length > shown.length ? <View style={{ marginBottom: 16 }}><HadithProCard /></View> : null}<Pager prev={prev ? () => router.replace(`/hadith/${k}?book=${prev.n}` as Href) : undefined} next={next ? () => router.replace(`/hadith/${k}?book=${next.n}` as Href) : undefined} label={s ? `${s.n} / ${c.sections[c.sections.length - 1].n}` : ""} /></> : undefined}
      />
    </>
  );
}

function Shia({ id, page }: { id: string; page: number }) {
  const b = shiaBook(id)!;
  const x = useHadithText();
  const t = useTheme();
  const { lang } = useLang();
  const total = shiaPages(id);
  const p = Math.min(page, Math.max(0, total - 1));
  const { pro } = usePro();
  const data = useLoad<HadithItem[]>(() => (pro || p === 0 ? shiaPage(id, p, lang) : Promise.resolve([])), [id, p, lang, pro]);
  const shown = data.v ? (pro ? data.v : data.v.slice(0, HADITH_FREE_PREVIEW)) : [];
  const list = useRef<FlatList<HadithItem>>(null);
  const to = (n: number) => router.replace(`/hadith/${encodeURIComponent(id)}?page=${n}` as Href);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        ref={list}
        style={{ flex: 1, backgroundColor: t.bg }}
        contentContainerStyle={{ paddingBottom: 130 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 20 }}>
            <PageHero topInset back eyebrow={x.title} title={shiaBookTitle(b)} lead={`${b.english} · ${b.author}`} />
            <View style={{ paddingHorizontal: 16, marginTop: 14, gap: 4 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{fill(x.translator, { name: b.translator })} · thaqalayn.net</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold }}>{fill(x.page, { n: p + 1, total })}</Text>
            </View>
          </View>
        }
        data={shown}
        keyExtractor={(h) => h.id}
        initialNumToRender={4}
        renderItem={({ item }) => <View style={{ paddingHorizontal: 16, marginBottom: 14 }}><HadithCard item={item} /></View>}
        ListEmptyComponent={!pro && p > 0 ? undefined : <LoadState state={data.status === "error" ? "error" : "loading"} onRetry={data.retry} />}
        ListFooterComponent={data.v ? (pro ? <Pager prev={p > 0 ? () => to(p - 1) : undefined} next={p < total - 1 ? () => to(p + 1) : undefined} label={fill(x.page, { n: p + 1, total })} /> : <HadithProCard />) : undefined}
      />
    </>
  );
}

function Pager({ prev, next, label }: { prev?: () => void; next?: () => void; label: string }) {
  const x = useHadithText();
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: 16, marginTop: 8 }}>
      {prev ? <ActionButton icon="chevronLeft" label={x.prev} onPress={prev} /> : <View />}
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, flexShrink: 1, textAlign: "center" }}>{label}</Text>
      {next ? <ActionButton icon="chevronRight" label={x.next} onPress={next} /> : <View />}
    </View>
  );
}
