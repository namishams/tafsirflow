import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Chip, SectionTitle } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { useStored } from "@/lib/store";
import { showsShia, showsSunni, useNahjVisible, useTradition } from "@/lib/tradition";
import { useNahjText } from "@/features/nahj-course/text";
import { SUNNI_COLLECTIONS, SHIA_BOOKS } from "@/features/hadith/catalog";
import { SAVED_KEY, collectionInfo, shiaBookTitle, type HadithItem } from "@/features/hadith/data";
import { HadithCard, LoadState } from "@/features/hadith/ui";
import { useDailyHadith } from "@/features/hadith/cards";
import { fill, useHadithText } from "@/features/hadith/texts";
import { useLang } from "@/i18n";

// /hadith – hadith of the day, the collections of the user's tradition (Sunni, Shia or both), the Nahj al-Balagha
// feed in Shia mode, saved hadith and the sources. Free for everyone (no Pro).
export default function HadithHome() {
  const x = useHadithText();
  const t = useTheme();
  const { lang } = useLang();
  const { tradition } = useTradition();
  const nahjOn = useNahjVisible();
  const nc = useNahjText();
  const daily = useDailyHadith();
  const saved = useStored<HadithItem[]>(SAVED_KEY, []);
  const go = (href: string) => router.push(href as Href);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow="Quran Masterclass" title={x.title} lead={x.lead} arabic="الحديث" />
        <View style={{ paddingHorizontal: 16, gap: 32, marginTop: 24 }}>
          {nahjOn ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Chip label={nc.short} onPress={() => go("/nahj-studies")} />
              <Chip label={x.nahj} onPress={() => go("/nahj")} />
            </View>
          ) : null}

          <View>
            <SectionTitle title={x.daily} />
            {daily.item ? <HadithCard item={daily.item} /> : <LoadState state={daily.status === "error" ? "error" : "loading"} onRetry={daily.retry} />}
          </View>

          {showsSunni(tradition) ? (
            <View>
              <SectionTitle title={x.sunniGroup} />
              <View style={{ gap: 10 }}>
                {SUNNI_COLLECTIONS.map((c) => { const info = collectionInfo(x, c.key, c.name); return (
                  <Row key={c.key} title={info.name} arabic={info.arabic} sub={`${fill(x.hadiths, { n: (c.count ?? c.max).toLocaleString(lang) })}${c.sections.length > 1 ? ` · ${c.sections.length} ${x.books}` : ""}${info.desc ? `\n${info.desc}` : ""}`} onPress={() => go(`/hadith/${c.key}`)} />
                ); })}
              </View>
            </View>
          ) : null}

          {showsShia(tradition) ? (
            <View>
              <SectionTitle title={x.shiaGroup} />
              <View style={{ gap: 10 }}>
                {SHIA_BOOKS.map((b) => (
                  <Row key={b.id} title={shiaBookTitle(b)} sub={`${b.english} · ${b.author}`} onPress={() => go(`/hadith/${encodeURIComponent(b.id)}`)} />
                ))}
              </View>
            </View>
          ) : null}

          <View>
            <SectionTitle title={x.savedTitle} />
            {saved.length ? (
              <View style={{ gap: 14 }}>{saved.slice(0, 50).map((h) => <HadithCard key={h.id} item={h} />)}</View>
            ) : (
              <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.muted }}>{x.savedEmpty}</Text>
            )}
          </View>

          <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, padding: 16, gap: 8 }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{x.sources}</Text>
            {showsSunni(tradition) ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{x.sourcesSunni}</Text> : null}
            {showsShia(tradition) ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{x.sourcesShia}</Text> : null}
          </View>
        </View>
      </Page>
    </>
  );
}

function Row({ title, sub, arabic, onPress }: { title: string; sub: string; arabic?: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${sub}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: pressed ? t.gold : t.line, backgroundColor: t.surface })}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, marginTop: 2 }} numberOfLines={4}>{sub}</Text>
      </View>
      {arabic ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 18, color: t.gold }}>{arabic}</Text> : null}
      <Icon name="chevronRight" color={t.gold} size={16} />
    </Pressable>
  );
}
