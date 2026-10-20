import { Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { LogoMark } from "@/components/brand";
import { useWebT } from "@/i18n/web";
import { FONT, useTheme } from "@/lib/theme";
import { MadeInDubai, Skyline } from "./Signature";
import { TrustStrip } from "./TrustStrip";

/**
 * The closing block of every website page (SiteFooter.tsx) for the end of a long screen (Discover, Account,
 * /welcome): the gold skyline, logo and tagline, the trust promises, legal links, © and the Dubai signature.
 * The website's "free for everyone / no subscription" line is left out in the app (Pro). No props.
 */
export function SiteFooter() {
  const t = useTheme();
  const w = useWebT();
  const year = new Date().getFullYear();
  const link = (label: string, href: string) => (
    <Text key={href} onPress={() => router.push(href as Href)} accessibilityRole="link" style={{ fontFamily: FONT.medium, fontSize: 13, color: t.muted, paddingVertical: 4 }}>{label}</Text>
  );
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: t.line, backgroundColor: t.surface }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 32 }}><Skyline /></View>
      <View style={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 28, gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <LogoMark size={26} />
          <Text style={{ fontFamily: FONT.display, fontSize: 15.5, letterSpacing: -0.3, color: t.ink }}>Quran Masterclass</Text>
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted }}>{w("app.tagline")}</Text>
        <View style={{ marginTop: 6 }}><TrustStrip variant="compact" /></View>
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: t.line, backgroundColor: t.bg, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 30, alignItems: "center", gap: 10 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", columnGap: 18 }}>
          {link(w("free.privacy"), "/legal/privacy")}
          {link(w("home2.terms"), "/legal/terms")}
          {link(w("free.imprint"), "/legal/imprint")}
          {link(w("nav.feedback"), "/feedback")}
        </View>
        <Text onPress={() => router.push("/islam/mosques" as Href)} accessibilityRole="link" style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "center" }}>{w("free.visit")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, marginTop: 6 }}>© {year} Quran Masterclass</Text>
        <MadeInDubai />
      </View>
    </View>
  );
}
