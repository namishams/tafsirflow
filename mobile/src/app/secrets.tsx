import { useEffect, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { ARABIC_FONT, CALLIG_FONT, FONT } from "@/lib/theme";
import { useLang } from "@/i18n";
import { api } from "@/lib/api";
import type { SecretsContent, Verdict } from "@/web/secrets/content";
import { ArchWindow, Corners, HeroKicker, HeroLead, HeroTitle, IllumFrame, IslBreak, IslCard, IslH2, IslHero, IslamNum, Marble, Rain, RefChip, StageBackground, useSaw } from "@/features/library/art";
import { FramedQuote } from "@/features/library/markdown";
import { ArchPanel, FaqItem, GoldPill, MoreTiles } from "@/features/library/ui";
import { IslScreen } from "@/features/library/screen";
import { SERIF, STAGE_GOLD, stageGold, useIsl, type Isl } from "@/features/library/palette";
import { useSecrets } from "@/features/library/content";
import { openHref, openRef } from "@/features/library/links";
import { WordCounter } from "@/features/library/WordCounter";

// /secrets – "Secrets of the Quran": verified counts, popular claims checked, facts with sources, what is promised to
// those who read the Quran, and places of peace (website: src/app/[locale]/(app)/secrets/page.tsx)

// Arabic wording of a reference like "71:10-12" from the website's Quran store (the same request the website makes);
// nothing if it is not available
const arabicCache = new Map<string, string>();
async function arabicOf(ref: string): Promise<string> {
  if (arabicCache.has(ref)) return arabicCache.get(ref)!;
  const [s, range] = ref.split(":");
  const [a, b = a] = range.split("-").map(Number);
  try {
    const vs = await Promise.all(Array.from({ length: b - a + 1 }, (_, i) =>
      api<{ verse: { verse_key: string; text_uthmani: string } }>(`/api/q/verses/by_key/${s}:${a + i}?language=en&words=false&translations=20&fields=text_uthmani`).then((d) => d.verse)));
    if (vs.some((v, i) => v.verse_key !== `${s}:${a + i}`)) return "";
    const text = vs.map((v) => v.text_uthmani).join(" ۝ ");
    arabicCache.set(ref, text);
    return text;
  } catch { return ""; }
}

function badge(isl: Isl, v: Verdict) {
  if (v === "true") return { border: isl.a("accent", 0.35), bg: isl.a("accent", 0.1), color: isl.accent };
  if (v === "false") return { border: isl.a("garnet", 0.35), bg: isl.a("garnet", 0.1), color: isl.garnet };
  return { border: isl.a("goldSoft", 0.45), bg: isl.a("goldSoft", 0.1), color: isl.gold };
}

export default function SecretsPage() {
  const { lang } = useLang();
  const c = useSecrets();
  if (!c) return <IslScreen><View /></IslScreen>;
  return <Secrets c={c} lang={lang} />;
}

function Secrets({ c, lang }: { c: SecretsContent; lang: string }) {
  const isl = useIsl();
  const sw = useSaw();
  const { width } = useWindowDimensions();
  const [arabic, setArabic] = useState<string[]>([]);
  useEffect(() => {
    let alive = true;
    Promise.all(c.promises.map((p) => arabicOf(p.ref))).then((a) => { if (alive) setArabic(a); });
    return () => { alive = false; };
  }, [c]);
  const cols = width >= 400 ? 2 : 1;
  const factRows: number[][] = [];
  c.facts.forEach((_, i) => { if (i % cols === 0) factRows.push([]); factRows[factRows.length - 1].push(i); });
  const kicker = { fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.32, textTransform: "uppercase" as const, color: isl.gold };

  return (
    <IslScreen>
      <IslHero callig="أسرار" dome fall={700} paddingBottom={96}>
        <HeroKicker>{c.kicker}</HeroKicker>
        <HeroTitle size={40} style={{ lineHeight: 42 }}>{c.title}</HeroTitle>
        <HeroLead style={{ marginTop: 20 }}>{sw(c.lead)}</HeroLead>
        <View style={{ marginTop: 40, borderRadius: 16, borderWidth: 1, borderColor: stageGold(0.25), backgroundColor: "rgba(255,255,255,0.04)", padding: 20, overflow: "hidden" }}>
          <IllumFrame />
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.5, color: "#eef0f3" }}>{c.counterTitle}</Text>
          <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: "rgba(255,255,255,0.7)" }}>{c.counterLead}</Text>
          <View style={{ marginTop: 24 }}><WordCounter words={c.words} times={c.times} spots={c.spots} note={c.allahNote} lang={lang} /></View>
          <Text style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", fontFamily: FONT.regular, fontSize: 12, lineHeight: 19.5, color: "rgba(255,255,255,0.5)" }}>{c.method}</Text>
        </View>
      </IslHero>

      <Marble>
        <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 56 }}>
          <IslH2 size={30}>{c.claimsTitle}</IslH2>
          <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: isl.a("ink", 0.75) }}>{c.claimsLead}</Text>
          <View style={{ marginTop: 32, gap: 12 }}>
            {c.claims.map((x) => {
              const b = badge(isl, x.v);
              return (
                <FaqItem key={x.q} q={x.q} a={x.a} star={false}
                  badge={<View style={{ alignSelf: "flex-start", marginBottom: 8, borderRadius: 999, borderWidth: 1, borderColor: b.border, backgroundColor: b.bg, paddingHorizontal: 10, paddingVertical: 2 }}><Text style={{ fontFamily: FONT.bold, fontSize: 11, color: b.color }}>{c.verdicts[x.v]}</Text></View>} />
              );
            })}
          </View>
        </View>

        <IslBreak style={{ marginTop: 0, marginBottom: 0, paddingHorizontal: 20 }} />

        <View style={{ paddingHorizontal: 20, paddingVertical: 56 }}>
          <IslH2 size={30}>{c.factsTitle}</IslH2>
          <View style={{ marginTop: 32, gap: 12 }}>
            {factRows.map((r, ri) => (
              <View key={ri} style={{ flexDirection: "row", gap: 12 }}>
                {r.map((i) => {
                  const f = c.facts[i];
                  return (
                    <View key={f.title} style={{ flex: 1, minWidth: 0 }}>
                      <IslCard fill style={{ padding: 10 }}>
                        <ArchWindow i={i} ar={f.ar} />
                        <View style={{ flex: 1, paddingHorizontal: 6, paddingBottom: 8, paddingTop: 12, alignItems: "center" }}>
                          <Text style={{ fontFamily: FONT.display, fontSize: 18, lineHeight: 22, color: isl.ink, textAlign: "center" }}>{sw(f.title)}</Text>
                          <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 22, color: isl.muted, textAlign: "center" }}>{sw(f.body)}</Text>
                          <View style={{ flex: 1 }} />
                          <Text style={{ ...kicker, paddingTop: 12, textAlign: "center" }}>{f.src}</Text>
                        </View>
                      </IslCard>
                    </View>
                  );
                })}
                {r.length < cols ? <View style={{ flex: 1 }} /> : null}
              </View>
            ))}
          </View>
        </View>

        {c.more && c.more.length > 0 ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 56 }}>
            <IslH2 size={30}>{c.moreTitle}</IslH2>
            <View style={{ marginTop: 32, gap: 12 }}>
              {c.more.map((f, i) => (
                <IslCard key={f.title} style={{ padding: 20 }}>
                  <Text numberOfLines={1} allowFontScaling={false} style={{ position: "absolute", right: -4, top: -4, fontFamily: CALLIG_FONT, fontSize: 54, lineHeight: 70, color: isl.gold, opacity: 0.12, writingDirection: "rtl" }}>{f.ar}</Text>
                  <IslamNum n={i + 1} size={36} fontSize={13} />
                  <Text style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 19, lineHeight: 23, color: isl.ink }}>{sw(f.title)}</Text>
                  <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 23.5, color: isl.muted }}>{sw(f.body)}</Text>
                  <Text style={{ ...kicker, letterSpacing: 1.1, marginTop: 12 }}>{f.src}</Text>
                </IslCard>
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ paddingHorizontal: 20, paddingBottom: 56 }}>
          <IslH2 size={30}>{c.readTitle}</IslH2>
          <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: isl.a("ink", 0.75) }}>{c.readLead}</Text>
          <View style={{ marginTop: 40, gap: 40 }}>
            {c.hadith.map((h) => <FramedQuote key={h.src} size={17 / 1.16} cite={h.src} style={{ marginTop: 0, marginBottom: 0 }}>{sw(h.text)}</FramedQuote>)}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 56 }}>
          <IslH2 size={30}>{c.wealthTitle}</IslH2>
          <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: isl.a("ink", 0.75) }}>{c.wealthLead}</Text>
          <View style={{ marginTop: 32, gap: 16 }}>
            {c.promises.map((p, i) => (
              <IslCard key={p.ref} style={{ padding: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, lineHeight: 22, color: isl.ink }}>{p.title}</Text>
                  <RefChip label={p.ref} onPress={() => openRef(p.ref)} />
                </View>
                {arabic[i] ? (
                  <Text style={{ marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: isl.a("goldSoft", 0.35), backgroundColor: isl.a("goldSoft", 0.07), paddingHorizontal: 12, paddingVertical: 8, fontFamily: ARABIC_FONT, fontSize: 21, lineHeight: 44, color: isl.head, textAlign: "center", writingDirection: "rtl", overflow: "hidden" }}>{arabic[i]}</Text>
                ) : null}
                <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: isl.muted }}>{p.text}</Text>
              </IslCard>
            ))}
          </View>
          <Text style={{ marginTop: 32, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: isl.ink }}>{c.wealthNote}</Text>
          <IslCard style={{ marginTop: 40, paddingHorizontal: 24, paddingVertical: 40, alignItems: "center" }}>
            <Corners />
            <Text style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 34, color: isl.head, textAlign: "center" }}>{sw(c.wealthHadith.text)}</Text>
            <Text style={{ ...kicker, fontSize: 12, letterSpacing: 1.44, marginTop: 12, textAlign: "center" }}>{c.wealthHadith.src}</Text>
          </IslCard>
        </View>
      </Marble>

      <StageBackground>
        <Rain fall={600} opacity={0.6} />
        <View style={{ paddingHorizontal: 20, paddingVertical: 56 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: "#eef0f3" }}>{c.placesTitle}</Text>
          <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: "rgba(255,255,255,0.7)" }}>{c.placesLead}</Text>
          <View style={{ marginTop: 32, gap: 12 }}>
            {c.places.map((pl) => (
              <ArchPanel key={pl.title} fill="rgba(255,255,255,0.04)" stroke={pl.href ? stageGold(0.35) : stageGold(0.2)} onPress={pl.href ? () => openHref(pl.href!) : undefined} accessibilityLabel={pl.title}
                style={{ minHeight: 272, padding: 20, paddingTop: 96, justifyContent: "flex-end" }}>
                <Text allowFontScaling={false} numberOfLines={1} style={{ position: "absolute", left: 0, right: 0, top: 40, fontFamily: CALLIG_FONT, fontSize: 42, lineHeight: 60, color: stageGold(0.22), textAlign: "center", writingDirection: "rtl" }}>{pl.ar}</Text>
                <Text style={{ fontFamily: FONT.display, fontSize: 19, lineHeight: 23, color: "#eef0f3" }}>{pl.title}</Text>
                <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 22, color: "rgba(255,255,255,0.7)" }}>{sw(pl.body)}</Text>
                {pl.src ? <Text style={{ marginTop: 12, fontFamily: FONT.semibold, fontSize: 11, color: STAGE_GOLD }}>{pl.src}</Text> : null}
              </ArchPanel>
            ))}
          </View>
        </View>
      </StageBackground>

      <Marble veins={false}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 56, alignItems: "center" }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 21, color: isl.muted, textAlign: "center" }}>{c.note}</Text>
          <IslBreak />
          <IslH2 size={30} style={{ textAlign: "center" }}>{c.ctaTitle}</IslH2>
          <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: isl.a("ink", 0.75), textAlign: "center" }}>{c.ctaBody}</Text>
          <GoldPill title={c.cta} onPress={() => openHref("/surah/1?shams=1")} style={{ marginTop: 24, alignSelf: "center" }} />
        </View>
      </Marble>

      <MoreTiles keys={["shams", "islam", "arabic", "radio"]} />
    </IslScreen>
  );
}
