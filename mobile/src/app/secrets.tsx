import { useEffect, useRef, useState, type ComponentRef, type ReactNode, type RefObject } from "react";
import { LayoutAnimation, Pressable, Text, View, useWindowDimensions } from "react-native";
import { ARABIC_FONT, CALLIG_FONT, FONT, FWD } from "@/lib/theme";
import { useLang } from "@/i18n";
import { getResources, getVerseByKey, translationFor } from "@/lib/quran";
import { MORE_GROUPS, SECTIONS, secretsContent, type SecretsContent, type SectionId, type Verdict } from "@/web/secrets/content";
import { COUNTS } from "@/web/secrets/counts";
import { missingRefs, refSegments } from "@/web/secrets/refs";
import { bundledVerses } from "@/web/secrets/scripture";
import { HADITH_API_NAME, hadithWording } from "@/web/secrets/hadith";
import { cachedJSON } from "@/features/hadith/cache";
import { ArchWindow, Corners, HeroKicker, HeroLead, HeroTitle, IllumFrame, IslBreak, IslCard, IslH2, IslHero, IslamNum, Marble, Rain, RefChip, StageBackground, StarMark, useSaw } from "@/features/library/art";
import { FramedQuote } from "@/features/library/markdown";
import { ArchPanel, GoldPill, MoreTiles } from "@/features/library/ui";
import { IslScreen, useIslScreen } from "@/features/library/screen";
import { SERIF, STAGE_GOLD, stageGold, useIsl, type Isl } from "@/features/library/palette";
import { useSecrets } from "@/features/library/content";
import { openHref, openRef } from "@/features/library/links";
import { WordCounter } from "@/features/library/WordCounter";

// /secrets – "Secrets of the Quran": table of contents, verified counts, popular claims checked (verdict legend), facts
// and more secrets with tappable verse references, what is promised to those who read the Quran (Arabic and the
// translation from Quran.com, its snapshots while it cannot be reached), places of peace, and onward to the Shams Method
// and the reader (website: src/app/[locale]/(app)/secrets/page.tsx; texts from src/lib/secrets and
// src/lib/pagecontent/<lang>/secrets.ts). No Quran or hadith wording is typed (BLUEPRINT §4): verse tokens are resolved
// by secretsContent(), the hadith quotes come from hadith-api where it has the reader's language (web/secrets/hadith.ts,
// kept on the device once fetched), otherwise their own-words summary is shown.

type ViewT = ComponentRef<typeof View>;
type VerseText = { ar: string; tr: string };
const verseCache = new Map<string, VerseText>();
// Arabic wording and translation of a reference like "71:10-12" (the website's Quran store); empty if not available
async function verseOf(ref: string, lang: string): Promise<VerseText> {
  const ck = `${lang}|${ref}`;
  if (verseCache.has(ck)) return verseCache.get(ck)!;
  const [s, range] = ref.split(":");
  const [a, b = a] = range.split("-").map(Number);
  try {
    const vs = await Promise.all(Array.from({ length: b - a + 1 }, (_, i) => getVerseByKey(`${s}:${a + i}`, lang)));
    if (vs.some((v, i) => v.verse_key !== `${s}:${a + i}`)) return { ar: "", tr: "" };
    const out = { ar: vs.map((v) => v.text_uthmani).join(" ۝ "), tr: vs.map((v) => v.translation.replace(/\s+/g, " ").trim()).filter(Boolean).join(" ") };
    verseCache.set(ck, out);
    return out;
  } catch { return { ar: "", tr: "" }; }
}
async function translatorOf(lang: string): Promise<string> {
  try {
    const [id, r] = await Promise.all([translationFor(lang), getResources()]);
    const t = r.translations.find((x) => x.id === id);
    return t ? t.author_name || t.name : "";
  } catch { return ""; }
}

const hadithJSON = (url: string) => cachedJSON<unknown>(`secrets-${url.replace(/^https?:\/\//, "")}`, url);
/** the wording of each hadith quote from hadith-api, null where there is none in this language or it cannot be loaded
 *  (then the summary stays); undefined while loading */
function useHadithWording(refs: (string | undefined)[], lang: string): (string | null | undefined)[] {
  const key = `${lang}|${refs.join(",")}`;
  const [st, setSt] = useState<{ key: string; v: (string | null)[] } | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all(refs.map((r) => (r ? hadithWording(r, lang, hadithJSON).catch(() => null) : Promise.resolve(null))))
      .then((v) => { if (alive) setSt({ key, v }); });
    return () => { alive = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return st && st.key === key ? st.v : refs.map(() => undefined);
}

function badge(isl: Isl, v: Verdict) {
  if (v === "true") return { border: isl.a("accent", 0.35), bg: isl.a("accent", 0.1), color: isl.accent };
  if (v === "false") return { border: isl.a("garnet", 0.35), bg: isl.a("garnet", 0.1), color: isl.garnet };
  return { border: isl.a("goldSoft", 0.45), bg: isl.a("goldSoft", 0.1), color: isl.gold };
}
function Badge({ v, label }: { v: Verdict; label: string }) {
  const isl = useIsl();
  const b = badge(isl, v);
  return (
    <View style={{ alignSelf: "flex-start", borderRadius: 999, borderWidth: 1, borderColor: b.border, backgroundColor: b.bg, paddingHorizontal: 10, paddingVertical: 2 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 11, color: b.color }}>{label}</Text>
    </View>
  );
}

/** text with its verse references as gold, tappable words that open the reader (nested Text, so it wraps like prose) */
function useLinked(color: string) {
  const sw = useSaw();
  return (text: string, k: string): ReactNode[] => refSegments(text).map((s, i) => s.ref
    ? <Text key={`${k}${i}`} onPress={() => openRef(s.ref!)} accessibilityRole="link" style={{ fontFamily: FONT.bold, color, textDecorationLine: "underline", textDecorationStyle: "dotted" }}>{s.text}</Text>
    : <Text key={`${k}${i}`}>{sw(s.text, `${k}${i}-`)}</Text>);
}

export default function SecretsPage() {
  const { lang } = useLang();
  const c = useSecrets();
  const en = useEnglish();
  if (!c) return <IslScreen><View /></IslScreen>;
  return <Secrets c={c} en={en ?? c} lang={lang} />;
}

// the English texts carry the verse numbers that some languages write as surah names (Arabic: "النمل: 30")
function useEnglish(): SecretsContent | null {
  const [en, setEn] = useState<SecretsContent | null>(null);
  useEffect(() => { let alive = true; secretsContent("en").then((x) => { if (alive) setEn(x); }).catch(() => undefined); return () => { alive = false; }; }, []);
  return en;
}

type Anchors = Partial<Record<SectionId, RefObject<ViewT | null>>>;

function Secrets({ c, en, lang }: { c: SecretsContent; en: SecretsContent; lang: string }) {
  const isl = useIsl();
  const sw = useSaw();
  const { rtl } = useLang();
  const { width } = useWindowDimensions();
  const [verses, setVerses] = useState<VerseText[]>([]);
  const [translator, setTranslator] = useState("");
  const [word, setWord] = useState<string | null>(null);
  const said = useHadithWording([...c.hadith.map((h) => h.ref), c.wealthHadith.ref], lang);
  const wealthSaid = said[c.hadith.length];
  const scrollY = useRef(0);
  const anchors: Anchors = Object.fromEntries(SECTIONS.map((id) => [id, useRef<ViewT>(null)])) as Anchors; // eslint-disable-line react-hooks/rules-of-hooks
  useEffect(() => {
    let alive = true;
    Promise.all(c.promises.map((p) => verseOf(p.ref, lang))).then((a) => { if (alive) setVerses(a); });
    if (lang !== "ar") translatorOf(lang).then((t) => { if (alive) setTranslator(t); });
    return () => { alive = false; };
  }, [c, lang]);

  // iPad: a readable column, more cards per row
  const pad = Math.max(20, (width - 1080) / 2);
  const inner = width - pad * 2;
  const factCols = inner >= 860 ? 4 : inner >= 360 ? 2 : 1;
  const cardCols = inner >= 900 ? 3 : inner >= 620 ? 2 : 1;
  const textW = Math.min(inner, 760);
  const small = { fontFamily: FONT.semibold, fontSize: 11, letterSpacing: rtl ? 0 : 1.2, textTransform: rtl ? undefined : ("uppercase" as const), color: isl.gold };
  const linked = useLinked(isl.gold);
  const linkedStage = useLinked(STAGE_GOLD);
  const lead = { marginTop: 12, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: isl.a("ink", 0.75), maxWidth: textW };
  let num = 0;

  const source = (local: string, eng: string, k: string, center = false) => {
    const extra = missingRefs(local, eng);
    if (!local && !extra.length) return null;
    return (
      <View style={{ paddingTop: 12, alignItems: center ? "center" : "flex-start", gap: 6 }}>
        {local ? <Text style={{ ...small, textAlign: center ? "center" : "auto" }}>{linked(local, k)}</Text> : null}
        {extra.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: center ? "center" : "flex-start" }}>{extra.map((r) => <RefChip key={r} label={r} onPress={() => openRef(r)} size={11.5} />)}</View> : null}
      </View>
    );
  };
  const grid = <T,>(items: T[], cols: number, render: (x: T, i: number) => ReactNode, gap = 12) => {
    const rows: T[][] = [];
    items.forEach((x, i) => { if (i % cols === 0) rows.push([]); rows[rows.length - 1].push(x); });
    return (
      <View style={{ gap }}>
        {rows.map((r, ri) => (
          <View key={ri} style={{ flexDirection: "row", gap }}>
            {r.map((x, j) => <View key={j} style={{ flex: 1, minWidth: 0 }}>{render(x, ri * cols + j)}</View>)}
            {Array.from({ length: cols - r.length }, (_, j) => <View key={`e${j}`} style={{ flex: 1 }} />)}
          </View>
        ))}
      </View>
    );
  };
  const more = c.more ?? [];

  return (
    <IslScreen onScrollY={(y) => { scrollY.current = y; }}>
      <IslHero callig="أسرار" dome fall={700} paddingBottom={96}>
        <View style={{ paddingHorizontal: pad - 20 }}>
          <HeroKicker>{c.kicker}</HeroKicker>
          <HeroTitle size={40} style={{ lineHeight: 42 }}>{c.title}</HeroTitle>
          <HeroLead style={{ marginTop: 20, maxWidth: textW }}>{sw(c.lead)}</HeroLead>
          <Toc c={c} anchors={anchors} scrollY={scrollY} rtl={rtl} />
          <View ref={anchors.counter} collapsable={false} style={{ marginTop: 32, borderRadius: 16, borderWidth: 1, borderColor: stageGold(0.25), backgroundColor: "rgba(255,255,255,0.04)", padding: 20, overflow: "hidden" }}>
            <IllumFrame />
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, letterSpacing: rtl ? 0 : -0.5, color: "#eef0f3" }}>{c.counterTitle}</Text>
            <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: "rgba(255,255,255,0.7)" }}>{c.counterLead}</Text>
            <View style={{ marginTop: 24 }}><WordCounter key={word ?? "init"} initial={word ?? undefined} words={c.words} times={c.times} spots={c.spots} note={c.allahNote} lang={lang} /></View>
            <Text style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", fontFamily: FONT.regular, fontSize: 12, lineHeight: 19.5, color: "rgba(255,255,255,0.5)" }}>{c.method}</Text>
          </View>
        </View>
      </IslHero>

      <Marble>
        <View ref={anchors.claims} collapsable={false} style={{ paddingHorizontal: pad, paddingTop: 56, paddingBottom: 56 }}>
          <IslH2 size={30}>{c.claimsTitle}</IslH2>
          <Text style={lead}>{c.claimsLead}</Text>
          <IslCard style={{ marginTop: 24, padding: 16, gap: 14 }}>
            {(["true", "method", "false"] as Verdict[]).map((v) => (
              <View key={v} style={{ gap: 6 }}>
                <Badge v={v} label={c.verdicts[v]} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 21, color: isl.muted }}>{c.verdictHelp[v]}</Text>
              </View>
            ))}
          </IslCard>
          <View style={{ marginTop: 16, gap: 12 }}>
            {c.claims.map((x, i) => (
              <Claim key={x.q} q={x.q} badge={<Badge v={x.v} label={c.verdicts[x.v]} />}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: isl.muted }}>{linked(x.a, `c${i}-`)}</Text>
                {x.key && (x.key === "allah" || COUNTS[x.key]) ? (
                  <Pressable accessibilityRole="button" accessibilityLabel={c.showPlaces} hitSlop={6}
                    onPress={() => { setWord(x.key!); jump(anchors.counter, scrollY); }}
                    style={({ pressed }) => ({ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", opacity: pressed ? 0.6 : 1 })}>
                    <StarMark size={13} color={isl.accent} />
                    <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: isl.accent }}>{c.showPlaces}</Text>
                  </Pressable>
                ) : null}
              </Claim>
            ))}
          </View>
        </View>

        <IslBreak style={{ marginTop: 0, marginBottom: 0, paddingHorizontal: 20 }} />

        <View ref={anchors.facts} collapsable={false} style={{ paddingHorizontal: pad, paddingVertical: 56 }}>
          <IslH2 size={30}>{c.factsTitle}</IslH2>
          <View style={{ marginTop: 32 }}>
            {grid(c.facts, factCols, (f, i) => (
              <IslCard fill style={{ padding: 10 }}>
                <ArchWindow i={i} ar={f.ar} />
                <View style={{ flex: 1, paddingHorizontal: 6, paddingBottom: 8, paddingTop: 12, alignItems: "center" }}>
                  <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 18, lineHeight: 22, color: isl.ink, textAlign: "center" }}>{sw(f.title)}</Text>
                  <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 22, color: isl.muted, textAlign: "center" }}>{linked(f.body, `f${i}-`)}</Text>
                  <View style={{ flex: 1 }} />
                  {source(f.src, en.facts[i]?.src ?? "", `fs${i}-`, true)}
                </View>
              </IslCard>
            ))}
          </View>
        </View>

        {more.length > 0 ? (
          <View ref={anchors.more} collapsable={false} style={{ paddingHorizontal: pad, paddingBottom: 56 }}>
            <IslH2 size={30}>{c.moreTitle}</IslH2>
            {MORE_GROUPS.map((g, gi) => {
              const items = g.filter((i) => more[i]);
              if (!items.length) return null;
              const start = num;
              num += items.length;
              return (
                <View key={gi} style={{ marginTop: gi ? 40 : 32 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <StarMark size={15} color={isl.gold} />
                    <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 13, letterSpacing: rtl ? 0 : 1.6, textTransform: rtl ? undefined : "uppercase", color: isl.gold, flexShrink: 1 }}>{c.moreGroups[gi]}</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: isl.a("goldSoft", 0.4) }} />
                  </View>
                  {grid(items, cardCols, (i, j) => {
                    const f = more[i];
                    return (
                      <IslCard fill style={{ padding: 20 }}>
                        <Text numberOfLines={1} allowFontScaling={false} style={{ position: "absolute", end: -4, top: -4, fontFamily: CALLIG_FONT, fontSize: 54, lineHeight: 70, color: isl.gold, opacity: 0.12, writingDirection: "rtl" }}>{f.ar}</Text>
                        <IslamNum n={start + j + 1} size={36} fontSize={13} />
                        <Text accessibilityRole="header" style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 19, lineHeight: 23, color: isl.ink }}>{sw(f.title)}</Text>
                        <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 23.5, color: isl.muted }}>{linked(f.body, `m${i}-`)}</Text>
                        <View style={{ flex: 1 }} />
                        {source(f.src, en.more?.[i]?.src ?? "", `ms${i}-`)}
                      </IslCard>
                    );
                  })}
                </View>
              );
            })}
          </View>
        ) : null}

        <View ref={anchors.read} collapsable={false} style={{ paddingHorizontal: pad, paddingBottom: 56 }}>
          <IslH2 size={30}>{c.readTitle}</IslH2>
          <Text style={lead}>{c.readLead}</Text>
          <View style={{ marginTop: 40 }}>
            {grid(c.hadith, cardCols >= 2 ? 2 : 1, (h, i) => {
              const w = said[i];
              return <FramedQuote size={17 / 1.16} cite={w ? `${h.src} · ${HADITH_API_NAME}` : h.src} style={{ marginTop: 0, marginBottom: 0, flex: 1 }}>{w === undefined && h.ref ? "" : sw(w ?? h.text)}</FramedQuote>;
            }, 40)}
          </View>
        </View>

        <View ref={anchors.wealth} collapsable={false} style={{ paddingHorizontal: pad, paddingBottom: 56 }}>
          <IslH2 size={30}>{c.wealthTitle}</IslH2>
          <Text style={lead}>{c.wealthLead}</Text>
          <View style={{ marginTop: 32 }}>
            {grid(c.promises, cardCols >= 2 ? 2 : 1, (p, i) => {
              // the verses from Quran.com, else from its snapshots; Arabic shows the wording only
              const live = verses[i] ?? { ar: "", tr: "" };
              const b = bundledVerses(p.ref, lang);
              const v = { ar: live.ar || b.ar, tr: live.tr || b.tr };
              const text = lang === "ar" ? "" : v.tr;
              const trName = live.tr ? translator : b.name;
              return (
                <IslCard fill style={{ padding: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, lineHeight: 22, color: isl.ink }}>{p.title}</Text>
                    <RefChip label={p.ref} onPress={() => openRef(p.ref)} />
                  </View>
                  {v.ar ? (
                    <View style={{ marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: isl.a("goldSoft", 0.35), backgroundColor: isl.a("goldSoft", 0.07), paddingHorizontal: 12, paddingVertical: 8 }}>
                      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 21, lineHeight: 44, color: isl.head, textAlign: "center", writingDirection: "rtl" }}>{v.ar}</Text>
                    </View>
                  ) : null}
                  {text ? <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24.4, color: isl.muted }}>{text}</Text> : null}
                  <View style={{ flex: 1 }} />
                  {v.tr && lang !== "ar" && trName ? <Text style={{ marginTop: 12, fontFamily: FONT.semibold, fontSize: 11, color: isl.a("gold", 0.8) }}>{trName}</Text> : null}
                </IslCard>
              );
            })}
          </View>
          <Text style={{ marginTop: 32, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: isl.ink, maxWidth: textW }}>{c.wealthNote}</Text>
          <IslCard style={{ marginTop: 40, paddingHorizontal: 24, paddingVertical: 40, alignItems: "center" }}>
            <Corners />
            <Text style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 34, color: isl.head, textAlign: "center", maxWidth: textW }}>{wealthSaid === undefined && c.wealthHadith.ref ? "" : sw(wealthSaid ?? c.wealthHadith.text)}</Text>
            <Text style={{ ...small, fontSize: 12, marginTop: 12, textAlign: "center" }}>{wealthSaid ? `${c.wealthHadith.src} · ${HADITH_API_NAME}` : c.wealthHadith.src}</Text>
          </IslCard>
        </View>
      </Marble>

      <StageBackground>
        <Rain fall={600} opacity={0.6} />
        <View ref={anchors.places} collapsable={false} style={{ paddingHorizontal: pad, paddingVertical: 56 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 36, letterSpacing: rtl ? 0 : -0.6, color: "#eef0f3" }}>{c.placesTitle}</Text>
          <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: "rgba(255,255,255,0.7)", maxWidth: textW }}>{c.placesLead}</Text>
          <View style={{ marginTop: 32 }}>
            {grid(c.places, cardCols >= 2 ? 2 : 1, (pl, i) => {
              const extra = pl.href ? [] : missingRefs(pl.src, en.places[i]?.src ?? "");
              return (
                <ArchPanel fill="rgba(255,255,255,0.04)" stroke={pl.href ? stageGold(0.35) : stageGold(0.2)} onPress={pl.href ? () => openHref(pl.href!) : undefined} accessibilityLabel={pl.title}
                  style={{ flex: 1, minHeight: 272, padding: 20, paddingTop: 96, justifyContent: "flex-end" }}>
                  <Text allowFontScaling={false} numberOfLines={1} style={{ position: "absolute", start: 0, end: 0, top: 40, fontFamily: CALLIG_FONT, fontSize: 42, lineHeight: 60, color: stageGold(0.22), textAlign: "center", writingDirection: "rtl" }}>{pl.ar}</Text>
                  <Text style={{ fontFamily: FONT.display, fontSize: 19, lineHeight: 23, color: "#eef0f3" }}>{pl.title}</Text>
                  <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 22, color: "rgba(255,255,255,0.7)" }}>{pl.href ? sw(pl.body) : linkedStage(pl.body, `p${i}-`)}</Text>
                  {pl.src ? <Text style={{ marginTop: 12, fontFamily: FONT.semibold, fontSize: 11, color: STAGE_GOLD }}>{pl.href ? pl.src : linkedStage(pl.src, `ps${i}-`)}</Text> : null}
                  {extra.length ? <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{extra.map((r) => <RefChip key={r} label={r} onStage onPress={() => openRef(r)} size={11.5} />)}</View> : null}
                </ArchPanel>
              );
            })}
          </View>
        </View>
      </StageBackground>

      <Marble veins={false}>
        <View ref={anchors.next} collapsable={false} style={{ paddingHorizontal: pad, paddingVertical: 56 }}>
          <View style={{ alignItems: "center" }}>
            <IslH2 size={30} style={{ textAlign: "center" }}>{c.ctaTitle}</IslH2>
            <Text style={{ marginTop: 12, fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: isl.a("ink", 0.75), textAlign: "center", maxWidth: 560 }}>{c.ctaBody}</Text>
            <GoldPill title={c.cta} onPress={() => openHref("/surah/1?shams=1")} style={{ marginTop: 24, alignSelf: "center" }} />
          </View>
          <View style={{ marginTop: 40 }}>
            {grid([["shams", "/shams", "شمس"], ["reader", "/quran", "القرآن"]] as const, inner >= 560 ? 2 : 1, ([k, href, ar]) => (
              <IslCard fill onPress={() => openHref(href)} accessibilityLabel={c.next[k].title} style={{ padding: 24 }}>
                <Corners />
                <Text numberOfLines={1} allowFontScaling={false} style={{ position: "absolute", end: -6, top: -6, fontFamily: CALLIG_FONT, fontSize: 64, lineHeight: 84, color: isl.gold, opacity: 0.13, writingDirection: "rtl" }}>{ar}</Text>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 29, color: isl.ink }}>{c.next[k].title}</Text>
                <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: isl.muted }}>{c.next[k].body}</Text>
                <View style={{ flex: 1 }} />
                <Text style={{ marginTop: 20, fontFamily: FONT.bold, fontSize: 14, color: isl.accent }}>{c.next[k].cta} {FWD}</Text>
              </IslCard>
            ))}
          </View>
          <IslBreak />
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 21, color: isl.muted, textAlign: "center", alignSelf: "center", maxWidth: textW }}>{c.note}</Text>
        </View>
      </Marble>

      <MoreTiles keys={["shams", "islam", "arabic", "radio"]} />
    </IslScreen>
  );
}

// scroll so that a section starts just below the status bar (its window position plus the current offset)
function jump(ref: RefObject<ViewT | null> | undefined, scrollY: RefObject<number>, ctx?: ReturnType<typeof useIslScreen>) {
  const go = ctx?.scrollTo ?? jumpTarget.scrollTo;
  ref?.current?.measureInWindow((_x, y) => go?.(scrollY.current + y - (ctx?.topInset ?? jumpTarget.topInset) - 12));
}
// the screen context, kept by <Toc> (it lives inside IslScreen) for jumps from anywhere on the page
const jumpTarget: { scrollTo?: (y: number) => void; topInset: number } = { topInset: 0 };

/** "On this page": the sections as numbered chips on the stage; a tap scrolls there */
function Toc({ c, anchors, scrollY, rtl }: { c: SecretsContent; anchors: Anchors; scrollY: RefObject<number>; rtl: boolean }) {
  const ctx = useIslScreen();
  useEffect(() => { jumpTarget.scrollTo = ctx?.scrollTo; jumpTarget.topInset = ctx?.topInset ?? 0; }, [ctx]);
  return (
    <View accessibilityRole="menu" accessibilityLabel={c.nav.title} style={{ marginTop: 28 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: rtl ? 0 : 1.8, textTransform: rtl ? undefined : "uppercase", color: "rgba(255,255,255,0.55)" }}>{c.nav.title}</Text>
      <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {SECTIONS.map((id, i) => (
          <Pressable key={id} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); jump(anchors[id], scrollY, ctx); }} accessibilityRole="link" accessibilityLabel={c.nav[id]}
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, borderWidth: 1, borderColor: pressed ? stageGold(0.6) : "rgba(255,255,255,0.15)", paddingVertical: 6, paddingStart: 6, paddingEnd: 14 })}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: stageGold(0.15), alignItems: "center", justifyContent: "center" }}>
              <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 11, color: STAGE_GOLD }}>{i + 1}</Text>
            </View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{c.nav[id]}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** a checked claim: verdict badge and question, tap to open the answer (like FaqItem, with links in the answer) */
function Claim({ q, badge: b, children }: { q: string; badge: ReactNode; children: ReactNode }) {
  const isl = useIsl();
  const sw = useSaw();
  const [open, setOpen] = useState(false);
  return (
    <IslCard highlight={open}>
      <Pressable onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)); setOpen((o) => !o); }}
        accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={q}
        style={({ pressed }) => ({ flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, opacity: pressed ? 0.85 : 1 })}>
        <View style={{ flex: 1, gap: 8 }}>
          {b}
          <Text style={{ fontFamily: FONT.semibold, fontSize: 16, lineHeight: 22.5, color: isl.ink }}>{sw(q)}</Text>
        </View>
        <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: isl.a("goldSoft", 0.5), alignItems: "center", justifyContent: "center", transform: [{ rotate: open ? "135deg" : "0deg" }] }}>
          <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 17, lineHeight: 21, color: isl.gold }}>+</Text>
        </View>
      </Pressable>
      {open ? <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>{children}</View> : null}
    </IslCard>
  );
}
