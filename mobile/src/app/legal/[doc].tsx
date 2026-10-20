import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { OutlineButton } from "@/components/brand";
import { Page, PageHero } from "@/components/page";
import { Markdown } from "@/features/extra/Markdown";
import { NotFoundView } from "@/features/extra/NotFound";
import { openWebsite } from "@/features/extra/links";
import { useX } from "@/features/extra/strings";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { SITE } from "@/lib/api";
import { FONT, R, useTheme } from "@/lib/theme";

const DOCS = ["privacy", "terms", "imprint"] as const;
type Doc = (typeof DOCS)[number];

// The provider details of the imprint live in the server's environment (LEGAL_NAME, LEGAL_ADDRESS, LEGAL_EMAIL), not
// in the repository: they are read from the website's own imprint page so app and website always say the same.
const imprintCache = new Map<string, Promise<[string, string][]>>();
function loadImprint(lang: string): Promise<[string, string][]> {
  let p = imprintCache.get(lang);
  if (!p) {
    p = fetch(`${SITE}/${lang}/legal/imprint`).then((r) => (r.ok ? r.text() : Promise.reject(new Error("http")))).then((html) => {
      const out: [string, string][] = [];
      const re = /<section><h2[^>]*>([\s\S]*?)<\/h2><p[^>]*>([\s\S]*?)<\/p><\/section>/g;
      const clean = (s: string) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
      let m: RegExpExecArray | null;
      while ((m = re.exec(html))) out.push([clean(m[1]), clean(m[2])]);
      if (!out.length) throw new Error("format");
      return out;
    });
    p.catch(() => imprintCache.delete(lang));
    imprintCache.set(lang, p);
  }
  return p;
}

// Website /legal/privacy | /legal/terms | /legal/imprint, rendered natively from the website's texts
export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const t = useTheme();
  const w = useWebT("legal");
  const x = useX();
  const { lang } = useLang();
  const d = DOCS.includes(doc as Doc) ? (doc as Doc) : null;
  const [imprint, setImprint] = useState<[string, string][] | null | "failed">(null);
  useEffect(() => {
    if (d !== "imprint") return;
    let live = true;
    loadImprint(lang).then((v) => live && setImprint(v)).catch(() => live && setImprint("failed"));
    return () => { live = false; };
  }, [d, lang]);

  if (!d) return <><Stack.Screen options={{ title: "" }} /><NotFoundView /></>;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset title={w(`${d}Title`)} lead={d === "imprint" ? x.legal.imprintLead : w("updated")} />
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {d !== "imprint" ? <Markdown text={w(`${d}Body`)} size={15.5} color={t.muted} /> : (
            <View style={{ gap: 22 }}>
              {imprint === null ? <ActivityIndicator color={t.accent} /> : null}
              {Array.isArray(imprint) ? imprint.map(([h, body]) => (
                <View key={h}>
                  <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink }}>{h}</Text>
                  <Text selectable style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: t.muted, marginTop: 6 }}>{body}</Text>
                </View>
              )) : null}
              {imprint === "failed" ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted }}>{x.offline}</Text> : null}
              <View style={{ borderTopWidth: 1, borderTopColor: t.line, paddingTop: 20, borderRadius: R.sm }}>
                <OutlineButton title={x.legal.imprintOpen} icon="globe" onPress={() => void openWebsite("/legal/imprint", lang)} />
              </View>
            </View>
          )}
        </View>
      </Page>
    </>
  );
}
