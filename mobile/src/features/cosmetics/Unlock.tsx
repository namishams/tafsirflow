import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Display, Eyebrow, GlassButton, GlassIconButton, GoldButton, SmallStar, Stage, TextLink } from "@/components/brand";
import { goBack } from "@/components/page";
import { FONT, R, stage } from "@/lib/theme";
import { openPro, usePro, type ProFeature } from "@/lib/pro";
import { FREE_LEVELS } from "@/lib/freeLevels";
import { courseProduct, ownsCourse, useShop, type CourseSlug } from "@/lib/shop";
import { useBuy, useStorePrices } from "./buy";
import { fillN, useCosmeticsText } from "./texts";

// The upsell after the free levels of a course: never a bare paywall. It says what is free, then two ways on:
// Pro (every course) or this one course as a single purchase that stays the person's own. Price only from the store.
export function LevelUpsell({ slug, feature = "general", onDone, style }: { slug: CourseSlug; feature?: ProFeature; onDone?: () => void; style?: object }) {
  const x = useCosmeticsText();
  const { pro } = usePro();
  const { shop } = useShop();
  const sku = courseProduct(slug);
  const price = useStorePrices([sku])[sku];
  const { buy, busy, msg, restore } = useBuy();
  if (pro || ownsCourse(shop, slug)) return null;
  return (
    <Stage rounded={R.card} style={[{ marginTop: 16 }, style]}>
      <View style={{ padding: 20, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={11} color={stage.gold} /><Eyebrow onStage>{x.courseNames[slug]}</Eyebrow></View>
        <Display size="title2" onStage>{x.levelTitle}</Display>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: "rgba(255,255,255,0.78)" }}>{fillN(x.levelText, FREE_LEVELS)}</Text>
        <GoldButton title={x.withPro} onPress={() => openPro(feature)} style={{ marginTop: 6 }} />
        {/* the single purchase only once the store has answered with its price */}
        {price ? <GlassButton onStage title={`${x.buyCourse} · ${price}`} disabled={!!busy} onPress={() => void buy(sku).then((ok) => ok && onDone?.())} /> : null}
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: "rgba(255,255,255,0.6)" }}>{x.unlockNote}</Text>
        {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }}>{msg}</Text> : null}
        <TextLink onStage title={x.restore} onPress={() => void restore()} style={{ fontSize: 13 }} />
      </View>
    </Stage>
  );
}

/** /unlock?c=<course>&f=<pro feature> – the sheet behind every locked level of a single-purchase course */
export function UnlockSheet({ slug, feature }: { slug: CourseSlug; feature: ProFeature }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: stage.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }}>
        <GlassIconButton icon="close" label="Close" onStage onPress={() => goBack()} size={44} />
        <LevelUpsell slug={slug} feature={feature} onDone={() => goBack()} />
      </ScrollView>
    </View>
  );
}
