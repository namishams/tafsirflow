import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { fmtHijri, hijriMonthName } from "@/web/hijri";
import {
  AR_ALPHABET, COUNTS, NAMES, NAME_BY_KEY, ORIGIN_FILTERS, ORIGIN_LABEL, THEMES, THEME_LABEL,
  hasArabic, langOf, latinOf, lengthOf, letterOf, matchesOrigin, meaningOf, namesText, normArabic, normLatin,
  type BabyName, type Gender, type Lang, type OriginFilter, type Theme,
} from "@/web/names";
import { MONTH_LINKS, bestPool, pickRandom, rankNames, verseFor, type LetterPref, type OriginPick, type Scored } from "@/web/names/rules";
import { api, SITE } from "@/lib/api";
import { useStored, writeJSON } from "@/lib/store";
import { intlLocale, useLang } from "@/i18n";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, goldButton, stage, useTheme, AR_RIGHT } from "@/lib/theme";
import { Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Callout, H2, IllumFrame, Label, LightChip, Rosette, StageButton, go } from "../art";
import { CheckRow, DateField, Field, SelectField } from "../ui";
import { ABD_HADITH_AR, FAV_KEY, classicalName, hijriOfInput } from "../web/nameGenerator";
import NameReport from "./NameReport";

type Tx = ReturnType<typeof namesText>;
type Verse = { key: string; ar: string; tr: string };
type ScrollTo = (y: number) => void;

function Heart({ on, size = 20, color }: { on: boolean; size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7.1 4.5c2 0 3.4 1.1 4.9 2.9 1.5-1.8 2.9-2.9 4.9-2.9 3.5 0 5.7 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" fill={on ? color : "none"} stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

// favourites stay on this device (tf:nameFav, as on the website); a newly saved name is counted for "most loved"
function useFavs() {
  const raw = useStored<string[]>(FAV_KEY, []);
  const list = raw.filter((k) => NAME_BY_KEY.has(k));
  const toggle = (key: string) => {
    const has = list.includes(key);
    writeJSON(FAV_KEY, has ? list.filter((k) => k !== key) : [...list, key], true);
    if (!has) api("/api/names", { body: { id: key } }).catch(() => undefined);
  };
  return { list, has: (k: string) => list.includes(k), toggle };
}
type Favs = ReturnType<typeof useFavs>;
const shareText = (title: string, text: string) => { void Share.share({ title, message: text }).catch(() => undefined); };

function OriginBadges({ n, l, dark = false }: { n: BabyName; l: Lang; dark?: boolean }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
      {n.o.slice(0, 2).map((o) => (
        <View key={o} style={{ borderRadius: R.pill, borderWidth: 1, borderColor: dark ? "rgba(214,180,108,0.4)" : "rgba(201,166,94,0.45)", paddingHorizontal: 10, paddingVertical: 2 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: dark ? stage.gold : th.gold }}>{ORIGIN_LABEL[l][o]}</Text>
        </View>
      ))}
    </View>
  );
}

// Muslim names with meanings (website NameGenerator.tsx + lib/names): a guided finder and the full list
export default function NameGenerator({ scrollTo }: { scrollTo?: ScrollTo }) {
  const { lang, rtl } = useLang();
  const l = langOf(lang);
  const t = namesText(lang);
  const th = useTheme();
  const favs = useFavs();
  const [tab, setTab] = useState<"finder" | "all">("finder");
  const [loved, setLoved] = useState<{ id: string; n: number }[] | null>(null);
  const bodyY = useRef(0);
  useEffect(() => { api<{ top?: { id: string; n: number }[] }>("/api/names").then((d) => setLoved(Array.isArray(d.top) ? d.top : [])).catch(() => setLoved([])); }, []);
  const inner: ScrollTo = (y) => scrollTo?.(bodyY.current + y);

  return (
    <View>
      <View style={{ flexDirection: "row", gap: 4, borderRadius: R.pill, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface, padding: 4 }} accessibilityRole="tablist">
        {(["finder", "all"] as const).map((k) => {
          const on = tab === k;
          const label = t(k === "finder" ? "tabFinder" : "tabAll");
          return (
            <Pressable key={k} onPress={() => setTab(k)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={label} style={{ flex: 1 }}>
              {on ? (
                <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 44, borderRadius: R.pill, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{label}</Text>
                </LinearGradient>
              ) : <View style={{ height: 44, alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: FONT.bold, fontSize: 14, color: th.muted }}>{label}</Text></View>}
            </Pressable>
          );
        })}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted, textAlign: "center", marginTop: 12 }}>{t("boysN", { n: COUNTS.b })} · {t("girlsN", { n: COUNTS.g })}</Text>

      <View style={{ marginTop: 24 }} onLayout={(e) => { bodyY.current = e.nativeEvent.layout.y; }}>
        {tab === "finder" ? <Finder t={t} l={l} locale={lang} rtl={rtl} favs={favs} scrollTo={inner} /> : <Browse t={t} l={l} favs={favs} scrollTo={inner} />}
      </View>

      <FavList t={t} l={l} locale={lang} favs={favs} />
      <Loved t={t} l={l} loved={loved} />
      <Notes t={t} l={l} />
    </View>
  );
}

// ---------------------------------------------------------------- guided finder
type Form = { father: string; mother: string; family: string; gender: Gender | "both"; date: string; siblings: string; letter: LetterPref; themes: Theme[]; origins: OriginPick[]; maxLen: number; easy: boolean };
const EMPTY: Form = { father: "", mother: "", family: "", gender: "both", date: "", siblings: "", letter: "any", themes: [], origins: [], maxLen: 0, easy: false };
type Result = { pools: Partial<Record<Gender, Scored[]>>; shown: Partial<Record<Gender, Scored[]>>; month: number | null; n: number };

function Finder({ t, l, locale, rtl, favs, scrollTo }: { t: Tx; l: Lang; locale: string; rtl: boolean; favs: Favs; scrollTo: ScrollTo }) {
  const th = useTheme();
  const [f, setF] = useState<Form>(EMPTY);
  const [step, setStep] = useState(1);
  const [res, setRes] = useState<Result | null>(null);
  const [verses, setVerses] = useState<Record<string, Verse | null>>({});
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const h = useMemo(() => hijriOfInput(f.date), [f.date]);
  const steps = [t("s1"), t("s2"), t("s3"), t("s4")];
  const go4 = (s: number) => { setStep(s); requestAnimationFrame(() => scrollTo(0)); };

  const run = (prev?: Result) => {
    const genders: Gender[] = f.gender === "both" ? ["b", "g"] : [f.gender];
    const month = h ? h.m : null;
    const pools: Result["pools"] = {};
    const shown: Result["shown"] = {};
    for (const g of genders) {
      const pool = prev?.pools[g] ?? bestPool(rankNames(g, { ...f, hijriMonth: month }, l));
      pools[g] = pool;
      shown[g] = pickRandom(pool, 3, new Set((prev?.shown[g] ?? []).map((s) => s.n.key)));
    }
    setRes({ pools, shown, month, n: (prev?.n ?? 0) + 1 });
    go4(4);
  };

  // verses of the shown names (exact Arabic from the website + translation)
  useEffect(() => {
    if (!res) return;
    const keys = [...new Set(Object.values(res.shown).flat().map((s) => verseFor(s.n).key))].filter((k) => !(k in verses));
    if (!keys.length) return;
    api<{ verses?: Verse[] }>(`/api/names?verses=${keys.join(",")}&locale=${locale}`).then((d) => {
      const got: Record<string, Verse | null> = Object.fromEntries(keys.map((k) => [k, null]));
      for (const v of d.verses ?? []) got[v.key] = v;
      setVerses((x) => ({ ...x, ...got }));
    }).catch(() => setVerses((x) => ({ ...x, ...Object.fromEntries(keys.map((k) => [k, null])) })));
  }, [res, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const monthLink = res?.month ? MONTH_LINKS[res.month] : undefined;
  const pct = Math.min(step, 4) / 4;
  const monthName = (m: number) => new Intl.DateTimeFormat(intlLocale(locale), { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2001, m - 1, 1)));
  const year = new Date().getFullYear();

  return (
    <View>
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: th.muted }}>{t("step", { n: Math.min(step, 4), total: 4 })}</Text>
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.semibold, fontSize: 12, color: th.ink }}>{steps[Math.min(step, 4) - 1]}</Text>
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: th.line, overflow: "hidden", marginTop: 8 }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}>
          <LinearGradient colors={["#c6a65e", "#e9cf99"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 6, width: `${pct * 100}%`, borderRadius: 3 }} />
        </View>
      </View>

      {step < 4 ? (
        <Callout key={step} radius={16} style={{ padding: 20 }}>
          <View style={{ position: "absolute", right: 12, top: 12, opacity: 0.7 }}><Rosette size={22} /></View>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: th.ink, paddingEnd: 32 }}>{steps[step - 1]}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: th.muted, marginTop: 4 }}>{t(`s${step}d`)}</Text>

          {step === 1 ? (
            <View style={{ gap: 16, marginTop: 24 }}>
              <View style={{ gap: 8 }}><Label>{t("father")}</Label><Field value={f.father} onChangeText={(v) => set("father", v.slice(0, 40))} placeholder={t("fatherPh")} autoComplete="off" autoCorrect={false} accessibilityLabel={t("father")} /></View>
              <View style={{ gap: 8 }}><Label>{t("mother")}</Label><Field value={f.mother} onChangeText={(v) => set("mother", v.slice(0, 40))} placeholder={t("motherPh")} autoComplete="off" autoCorrect={false} accessibilityLabel={t("mother")} /></View>
              <View style={{ gap: 8 }}><Label>{t("family")}</Label><Field value={f.family} onChangeText={(v) => set("family", v.slice(0, 40))} placeholder={t("familyPh")} autoComplete="off" autoCorrect={false} accessibilityLabel={t("family")} /></View>
            </View>
          ) : null}

          {step === 2 ? (
            <View style={{ gap: 24, marginTop: 24 }}>
              <View>
                <Label>{t("gender")}</Label>
                <View style={{ gap: 8, marginTop: 12 }}>
                  {(["b", "g", "both"] as const).map((g) => <LightChip key={g} label={t(g === "b" ? "boy" : g === "g" ? "girl" : "both")} on={f.gender === g} onPress={() => set("gender", g)} style={{ minHeight: 48, borderRadius: R.lg }} />)}
                </View>
              </View>
              <View style={{ gap: 8 }}>
                <Label>{t("date")}</Label>
                <DateField label={t("date")} value={f.date} onChange={(v) => set("date", v)} minYear={year - 30} maxYear={year + 1} monthName={monthName} allowEmpty />
                {h ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: th.gold }}>{t("hijriIs", { date: fmtHijri(h, locale) })}</Text> : null}
              </View>
              <View style={{ gap: 8 }}>
                <Label>{t("siblings")}</Label>
                <Field value={f.siblings} onChangeText={(v) => set("siblings", v.slice(0, 160))} placeholder={t("siblingsPh")} autoComplete="off" autoCorrect={false} accessibilityLabel={t("siblings")} />
              </View>
              {f.siblings.trim() ? (
                <View>
                  <Label>{t("letter")}</Label>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                    {(["any", "same", "diff"] as const).map((k) => <LightChip key={k} label={t(k === "any" ? "letterAny" : k === "same" ? "letterSame" : "letterDiff")} on={f.letter === k} onPress={() => set("letter", k)} />)}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          {step === 3 ? (
            <View style={{ gap: 24, marginTop: 24 }}>
              <View>
                <Label>{t("themesQ")}</Label>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {THEMES.map((x) => <LightChip key={x} label={THEME_LABEL[l][x]} on={f.themes.includes(x)} onPress={() => set("themes", toggle(f.themes, x))} />)}
                </View>
              </View>
              <View>
                <Label>{t("originsQ")}</Label>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {(["quran", "prophet", "companion", "arabic"] as const).map((o) => <LightChip key={o} label={t(`o_${o}`)} on={f.origins.includes(o)} onPress={() => set("origins", toggle(f.origins, o))} />)}
                </View>
              </View>
              <View style={{ gap: 8 }}>
                <Label>{t("maxLen")}</Label>
                <SelectField title={t("maxLen")} value={f.maxLen} onChange={(v) => set("maxLen", v)} options={[{ value: 0, label: t("any") }, ...[4, 5, 6, 7, 8, 10].map((n) => ({ value: n, label: String(n) }))]} />
              </View>
              <View style={{ minHeight: 48, borderRadius: R.lg, borderWidth: 1, borderColor: th.line, backgroundColor: th.bg, paddingHorizontal: 16, paddingVertical: 12, justifyContent: "center" }}>
                <CheckRow label={t("easy")} value={f.easy} onChange={(v) => set("easy", v)} />
              </View>
            </View>
          ) : null}

          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 32 }}>
            {step > 1 ? (
              <Pressable onPress={() => go4(step - 1)} accessibilityRole="button" style={({ pressed }) => ({ height: 48, borderRadius: R.lg, borderWidth: 1, borderColor: pressed ? th.muted : th.line, paddingHorizontal: 20, justifyContent: "center" })}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: th.ink }}>{t("back")}</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => (step < 3 ? go4(step + 1) : run())} accessibilityRole="button" style={({ pressed }) => ({ flex: 1, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
              <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 48, borderRadius: R.lg, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {step === 3 ? <Rosette size={20} color={goldButton.text} /> : null}
                <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: goldButton.text }}>{step < 3 ? t("next") : t("find")}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Callout>
      ) : null}

      {step === 4 && res ? (
        <View>
          <H2>{t("s4")}</H2>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: th.muted, marginTop: 4 }}>{t("resultLead")}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            <Pressable onPress={() => run(res)} accessibilityRole="button" style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}>
              <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 44, borderRadius: R.pill, paddingHorizontal: 20, justifyContent: "center" }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{t("shuffle")}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => go4(1)} accessibilityRole="button" style={({ pressed }) => ({ height: 44, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? th.muted : th.line, paddingHorizontal: 20, justifyContent: "center" })}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.ink }}>{t("edit")}</Text>
            </Pressable>
          </View>
          {monthLink && res.month ? (
            <Callout style={{ padding: 16, marginTop: 20 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.ink }}><Text style={{ fontFamily: FONT.bold }}>{t("monthNote", { month: hijriMonthName(res.month, locale) })}</Text> {monthLink.note[l]}</Text>
            </Callout>
          ) : null}
          {(["b", "g"] as const).filter((g) => res.shown[g]).map((g) => (
            <View key={`${g}-${res.n}`} style={{ marginTop: 28 }}>
              {f.gender === "both" ? <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 20, lineHeight: 26, color: th.ink, marginBottom: 12 }}>{t(g === "b" ? "forBoy" : "forGirl")}</Text> : null}
              {res.shown[g]!.length ? (
                <View style={{ gap: 16 }}>
                  {res.shown[g]!.map((s) => <ResultCard key={s.n.key} n={s.n} f={f} t={t} l={l} locale={locale} rtl={rtl} favs={favs} verse={verses[verseFor(s.n).key]} />)}
                </View>
              ) : <Callout style={{ padding: 16 }}><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: th.ink }}>{t("noPool")}</Text></Callout>}
            </View>
          ))}
          {/* paid extra of the app: the personal name report (the free suggestions above stay as on the website) */}
          <NameReport form={f} month={res.month} l={l} locale={locale} rtl={rtl} t={t} favs={favs} />
        </View>
      ) : null}
    </View>
  );
}

function ResultCard({ n, f, t, l, locale, rtl, favs, verse }: { n: BabyName; f: Form; t: Tx; l: Lang; locale: string; rtl: boolean; favs: Favs; verse: Verse | null | undefined }) {
  const ar = l === "ar";
  const v = verseFor(n);
  const [s, a] = v.key.split(":");
  const cl = classicalName(n, f.father);
  const fam = f.family.trim();
  const famLine = fam ? (ar ? (hasArabic(fam) ? `${n.ar} ${fam}` : null) : `${latinOf(n)} ${fam}`) : null;
  const kind = v.kind === "theme" ? t("v_theme", { theme: THEME_LABEL[l][v.theme!] }) : t(`v_${v.kind}`);
  const on = favs.has(n.key);
  const share = () => {
    const lines = [ar ? n.ar : `${n.ar} – ${latinOf(n)}`, meaningOf(n, l), ar ? cl?.arabic : cl?.latin, `${kind}: ${t("verseRef", { ref: v.key })}`, `${SITE}/${locale}/names`].filter(Boolean);
    shareText(t("title"), lines.join("\n"));
  };
  return (
    <Stage rounded={16} hairlines={false}>
      <IllumFrame rosettes={22} />
      <View style={{ paddingHorizontal: 22, paddingBottom: 24, paddingTop: 36, alignItems: "center" }}>
        <OriginBadges n={n} l={l} dark />
        <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 46, lineHeight: 70, color: stage.gold, writingDirection: "rtl", marginTop: 12 }}>{n.ar}</Text>
        {!ar ? <Text style={{ fontFamily: FONT.display, fontSize: 26, lineHeight: 30, color: "#eef0f3", textAlign: "center" }}>{latinOf(n)}</Text> : null}
        {!ar && n.tr.length > 1 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2, textAlign: "center" }}>{n.tr.slice(1).join(" · ")}</Text> : null}
        <Text style={{ fontFamily: ar ? ARABIC_FONT : FONT.regular, fontSize: ar ? 19 : 15, lineHeight: ar ? 34 : 24, color: "rgba(255,255,255,0.8)", marginTop: 12, textAlign: "center" }}>{meaningOf(n, l)}</Text>

        {cl?.latin || cl?.arabic || famLine ? (
          <View style={{ alignSelf: "stretch", marginTop: 20, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.7, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{t("classical")}</Text>
            {!ar && cl?.latin ? <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: "#eef0f3", marginTop: 4, textAlign: "center" }}>{cl.latin}</Text> : null}
            {cl?.arabic ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 40, color: stage.gold, writingDirection: "rtl", marginTop: 4 }}>{cl.arabic}</Text> : null}
            {famLine ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{famLine}</Text> : null}
          </View>
        ) : null}

        <View style={{ alignSelf: "stretch", marginTop: 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 16 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.7, textTransform: "uppercase", color: stage.gold }}>{kind}</Text>
          {verse === undefined ? <View style={{ height: 64, borderRadius: R.md, backgroundColor: "rgba(255,255,255,0.1)", marginTop: 12 }} /> : verse ? (
            <>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 42, color: "#ffffff", writingDirection: "rtl", textAlign: AR_RIGHT, marginTop: 8 }}>{verse.ar}</Text>
              {!ar && verse.tr ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 21, color: "rgba(255,255,255,0.65)", marginTop: 8 }}>{verse.tr}</Text> : null}
            </>
          ) : null}
          <Pressable onPress={() => go(`/surah/${s}?v=${a}`)} accessibilityRole="link" style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, alignSelf: "flex-start", paddingVertical: 4 }}>
            <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="playSm" color={stage.gold} size={16} filled /></View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }}>{t("listen")} · {t("verseRef", { ref: v.key })}</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 24 }}>
          <StageButton gold={on} title={on ? t("saved") : t("save")} icon={<Heart on={on} color={on ? goldButton.text : "#ffffff"} />} onPress={() => favs.toggle(n.key)} />
          <StageButton title={t("share")} onPress={share} />
        </View>
      </View>
    </Stage>
  );
}

// ---------------------------------------------------------------- browse all names
function Browse({ t, l, favs, scrollTo }: { t: Tx; l: Lang; favs: Favs; scrollTo: ScrollTo }) {
  const th = useTheme();
  const ar = l === "ar";
  const [g, setG] = useState<Gender | "all">("all");
  const [theme, setTheme] = useState<Theme | "">("");
  const [origin, setOrigin] = useState<OriginFilter | "">("");
  const [letter, setLetter] = useState("");
  const [maxLen, setMaxLen] = useState(0);
  const [q, setQ] = useState("");
  const [surprise, setSurprise] = useState<BabyName | null>(null);
  const listY = useRef(0);
  const groupY = useRef<Record<string, number>>({});

  const byGender = useMemo(() => NAMES.filter((n) => g === "all" || n.g === g), [g]);
  const letters = useMemo(() => {
    const set = new Set(byGender.map((n) => letterOf(n, l)));
    return ar ? AR_ALPHABET.filter((c) => set.has(c)) : [...set].sort();
  }, [byGender, l, ar]);
  const list = useMemo(() => {
    const qq = q.trim();
    const qa = hasArabic(qq) ? normArabic(qq) : "";
    const ql = qa ? "" : qq.toLowerCase();
    const qn = normLatin(ql);
    return byGender.filter((n) => {
      if (theme && !n.t.includes(theme)) return false;
      if (origin && !matchesOrigin(n, origin)) return false;
      if (letter && letterOf(n, l) !== letter) return false;
      if (maxLen && lengthOf(n, l) > maxLen) return false;
      if (qa) return normArabic(n.ar).includes(qa) || normArabic(n.arM).includes(qa);
      if (ql) return (qn && n.tr.some((x) => normLatin(x).includes(qn))) || meaningOf(n, l).toLowerCase().includes(ql);
      return true;
    }).sort((a, b) => (ar ? normArabic(a.ar).localeCompare(normArabic(b.ar), "ar") : normLatin(latinOf(a)).localeCompare(normLatin(latinOf(b)))));
  }, [byGender, theme, origin, letter, maxLen, q, l, ar]);
  const groups = useMemo(() => {
    const m = new Map<string, BabyName[]>();
    for (const n of list) { const k = letterOf(n, l); m.set(k, [...(m.get(k) ?? []), n]); }
    return ar ? AR_ALPHABET.filter((c) => m.has(c)).map((c) => [c, m.get(c)!] as const) : [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [list, l, ar]);

  return (
    <View>
      <View style={{ borderRadius: 16, borderWidth: 1, borderColor: "rgba(201,166,94,0.3)", backgroundColor: th.surface, padding: 20 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(["all", "b", "g"] as const).map((k) => <LightChip key={k} label={k === "all" ? t("all") : t(k === "b" ? "boy" : "girl")} on={g === k} onPress={() => { setG(k); setLetter(""); }} />)}
        </View>
        <Label style={{ marginTop: 20 }}>{t("theme")}</Label>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          <LightChip label={t("all")} on={!theme} onPress={() => setTheme("")} />
          {THEMES.map((x) => <LightChip key={x} label={THEME_LABEL[l][x]} on={theme === x} onPress={() => setTheme(theme === x ? "" : x)} />)}
        </View>
        <Label style={{ marginTop: 20 }}>{t("origin")}</Label>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          <LightChip label={t("all")} on={!origin} onPress={() => setOrigin("")} />
          {ORIGIN_FILTERS.map((o) => <LightChip key={o} label={ORIGIN_LABEL[l][o]} on={origin === o} onPress={() => setOrigin(origin === o ? "" : o)} />)}
        </View>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
          <View style={{ flex: 1, gap: 6 }}><Label>{t("letterF")}</Label>
            <SelectField title={t("letterF")} value={letter} onChange={setLetter} options={[{ value: "", label: t("all") }, ...letters.map((c) => ({ value: c, label: c }))]} />
          </View>
          <View style={{ flex: 1, gap: 6 }}><Label>{t("lenF")}</Label>
            <SelectField title={t("lenF")} value={maxLen} onChange={setMaxLen} options={[{ value: 0, label: t("any") }, ...[4, 5, 6, 7, 8, 10].map((n) => ({ value: n, label: `≤ ${n}` }))]} />
          </View>
        </View>
        <View style={{ gap: 6, marginTop: 12 }}>
          <Label>{t("search").replace(" …", "")}</Label>
          <Field value={q} onChangeText={(v) => setQ(v.slice(0, 40))} placeholder={t("search")} autoCorrect={false} returnKeyType="search" accessibilityLabel={t("search").replace(" …", "")} />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 20 }}>
          <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.muted }}>{t("count", { n: list.length })}</Text>
          <Pressable disabled={!list.length} onPress={() => setSurprise(list[Math.floor(Math.random() * list.length)] ?? null)} accessibilityRole="button" style={({ pressed }) => ({ opacity: list.length ? 1 : 0.5, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
            <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 44, borderRadius: R.pill, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Rosette size={18} color={goldButton.text} />
              <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{t("surprise")}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      {surprise ? (
        <Stage key={surprise.key} rounded={16} hairlines={false} style={{ marginTop: 24 }}>
          <IllumFrame rosettes={false} />
          <View style={{ paddingHorizontal: 20, paddingVertical: 36, alignItems: "center" }}>
            <OriginBadges n={surprise} l={l} dark />
            <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 56, lineHeight: 84, color: stage.gold, writingDirection: "rtl", marginTop: 12 }}>{surprise.ar}</Text>
            {!ar ? <Text style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 35, color: "#eef0f3", textAlign: "center" }}>{latinOf(surprise)}</Text> : null}
            <Text style={{ fontFamily: ar ? ARABIC_FONT : FONT.regular, fontSize: ar ? 20 : 16, lineHeight: ar ? 36 : 25, color: "rgba(255,255,255,0.8)", marginTop: 12, textAlign: "center", maxWidth: 420 }}>{meaningOf(surprise, l)}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 24 }}>
              <StageButton gold={favs.has(surprise.key)} title={favs.has(surprise.key) ? t("saved") : t("save")} icon={<Heart on={favs.has(surprise.key)} color={favs.has(surprise.key) ? goldButton.text : "#ffffff"} />} onPress={() => favs.toggle(surprise.key)} />
              {surprise.q ? <StageButton title={t("verseRef", { ref: surprise.q })} onPress={() => { const [s, v] = surprise.q!.split(":"); go(`/surah/${s}?v=${v}`); }} /> : null}
            </View>
          </View>
        </Stage>
      ) : null}

      {list.length === 0 ? <Callout style={{ padding: 16, marginTop: 24 }}><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: th.ink }}>{t("noMatch")}</Text></Callout> : (
        <View style={{ marginTop: 24 }} onLayout={(e) => { listY.current = e.nativeEvent.layout.y; }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }} accessibilityLabel={t("letterF")}>
            {groups.map(([c]) => (
              <Pressable key={c} onPress={() => scrollTo(listY.current + (groupY.current[c] ?? 0))} accessibilityRole="button" accessibilityLabel={c}
                style={({ pressed }) => ({ minWidth: 32, height: 32, paddingHorizontal: 6, borderRadius: R.sm, borderWidth: 1, borderColor: pressed ? "rgb(201,166,94)" : th.line, backgroundColor: th.surface, alignItems: "center", justifyContent: "center" })}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: th.muted }}>{c}</Text>
              </Pressable>
            ))}
          </View>
          {groups.map(([c, ns]) => (
            <View key={c} style={{ marginTop: 24 }} onLayout={(e) => { groupY.current[c] = e.nativeEvent.layout.y; }}>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: th.gold, borderBottomWidth: 1, borderBottomColor: "rgba(201,166,94,0.4)", paddingBottom: 4 }}>{c}</Text>
              {ns.map((n) => <Row key={n.key} n={n} t={t} l={l} on={favs.has(n.key)} toggle={favs.toggle} />)}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const Row = memo(function Row({ n, t, l, on, toggle }: { n: BabyName; t: Tx; l: Lang; on: boolean; toggle: (k: string) => void }) {
  const th = useTheme();
  const ar = l === "ar";
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, borderBottomWidth: 1, borderBottomColor: th.line, paddingVertical: 12 }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: 8, rowGap: 4 }}>
          {ar ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 40, color: th.gold }}>{n.ar}</Text> : <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: th.ink }}>{latinOf(n)}</Text>}
          {!ar && n.tr.length > 1 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted }}>{n.tr.slice(1).join(" · ")}</Text> : null}
          <View style={{ borderRadius: R.pill, backgroundColor: th.fill, paddingHorizontal: 8, paddingVertical: 1 }}><Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, color: th.muted }}>{t(`g_${n.g}`)}</Text></View>
        </View>
        <Text style={{ fontFamily: ar ? ARABIC_FONT : FONT.regular, fontSize: ar ? 17 : 14, lineHeight: ar ? 30 : 22, color: th.muted, marginTop: 2 }}>{meaningOf(n, l)}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.gold }}>{n.o.slice(0, 2).map((o) => ORIGIN_LABEL[l][o]).join(" · ")}</Text>
          {n.q ? <Text onPress={() => go(`/surah/${n.q!.split(":")[0]}?v=${n.q!.split(":")[1]}`)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 12, color: th.accent }}>{t("verseRef", { ref: n.q })}</Text> : null}
        </View>
      </View>
      {!ar ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 40, color: th.gold, writingDirection: "rtl" }}>{n.ar}</Text> : null}
      <Pressable onPress={() => toggle(n.key)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${on ? t("favRemove") : t("favAdd")}: ${ar ? n.ar : latinOf(n)}`}
        style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: on ? "rgb(201,166,94)" : th.line, alignItems: "center", justifyContent: "center" }}>
        <Heart on={on} color={on ? th.gold : th.muted} />
      </Pressable>
    </View>
  );
});

// ---------------------------------------------------------------- favourites, most loved, notes
function FavList({ t, l, locale, favs }: { t: Tx; l: Lang; locale: string; favs: Favs }) {
  const th = useTheme();
  const ar = l === "ar";
  const names = favs.list.map((k) => NAME_BY_KEY.get(k)).filter(Boolean) as BabyName[];
  const text = () => [...names.map((n) => (ar ? `${n.ar} – ${n.arM}` : `${latinOf(n)} (${n.ar}) – ${meaningOf(n, l)}`)), "", `${SITE}/${locale}/names`].join("\n");
  return (
    <View style={{ marginTop: 48 }}>
      <H2>{t("favTitle")}</H2>
      {names.length === 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: th.muted, marginTop: 12 }}>{t("favEmpty")}</Text> : (
        <>
          <View style={{ gap: 8, marginTop: 16 }}>
            {names.map((n) => (
              <View key={n.key} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: R.card, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface, paddingHorizontal: 16, paddingVertical: 12 }}>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 40, color: th.gold, writingDirection: "rtl" }}>{n.ar}</Text>
                <View style={{ flex: 1, minWidth: 0 }}>
                  {!ar ? <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: th.ink }}>{latinOf(n)}</Text> : null}
                  <Text numberOfLines={1} style={{ fontFamily: ar ? ARABIC_FONT : FONT.regular, fontSize: ar ? 16 : 13, lineHeight: ar ? 28 : undefined, color: th.muted }}>{meaningOf(n, l)}</Text>
                </View>
                <Pressable onPress={() => favs.toggle(n.key)} accessibilityRole="button" accessibilityLabel={`${t("favRemove")}: ${ar ? n.ar : latinOf(n)}`} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
                  <Heart on color={th.gold} />
                </Pressable>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            <Pressable onPress={() => shareText(t("favTitle"), text())} accessibilityRole="button" style={({ pressed }) => ({ height: 44, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? th.muted : th.line, paddingHorizontal: 20, justifyContent: "center" })}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.ink }}>{t("shareList")}</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function Loved({ t, l, loved }: { t: Tx; l: Lang; loved: { id: string; n: number }[] | null }) {
  const th = useTheme();
  const ar = l === "ar";
  const items = (loved ?? []).map((x) => ({ n: NAME_BY_KEY.get(x.id), c: x.n })).filter((x): x is { n: BabyName; c: number } => !!x.n);
  return (
    <View style={{ marginTop: 48 }}>
      <H2>{t("loved")}</H2>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: th.muted, marginTop: 4 }}>{t("lovedD")}</Text>
      {loved === null ? <View style={{ height: 96, borderRadius: R.card, backgroundColor: th.line, opacity: 0.4, marginTop: 16 }} /> : items.length === 0 ? (
        <Callout style={{ padding: 16, marginTop: 16 }}><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: th.ink }}>{t("lovedEmpty")}</Text></Callout>
      ) : (
        <View style={{ gap: 8, marginTop: 16 }}>
          {items.map(({ n, c }, i) => (
            <View key={n.key} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: R.card, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface, paddingHorizontal: 16, paddingVertical: 12 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "rgba(201,166,94,0.5)", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 12, color: th.gold }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 36, color: th.gold, writingDirection: "rtl", textAlign: "left" }}>{n.ar}</Text>
                {!ar ? <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13, color: th.ink }}>{latinOf(n)} <Text style={{ fontFamily: FONT.regular, color: th.muted }}>· {t(`g_${n.g}`)}</Text></Text> : null}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Heart on size={14} color={th.gold} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted }}>{c}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function Notes({ t, l }: { t: Tx; l: Lang }) {
  const th = useTheme();
  const ar = l === "ar";
  const head = { fontFamily: FONT.display, fontSize: 20, lineHeight: 26, color: th.ink };
  const card = { borderRadius: R.md, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface, padding: 20 };
  return (
    <View style={{ gap: 16, marginTop: 48 }}>
      <Callout style={{ padding: 20 }}>
        <Text accessibilityRole="header" style={head}>{t("abdTitle")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.ink, marginTop: 8 }}>{t("abdText")}</Text>
        {!ar ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 42, color: th.gold, writingDirection: "rtl", textAlign: AR_RIGHT, marginTop: 12 }}>{ABD_HADITH_AR}</Text> : null}
        <Text style={ar ? { fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 42, color: th.gold, marginTop: 8 } : { fontFamily: FONT.italic, fontSize: 15, lineHeight: 24, color: th.ink, marginTop: 8 }}>{t("abdHadith")}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: th.muted, marginTop: 4 }}>{t("abdSrc")}</Text>
      </Callout>
      <Callout style={{ padding: 20 }}>
        <Text accessibilityRole="header" style={head}>{t("changeTitle")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.ink, marginTop: 8 }}>{t("changeText")}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: th.muted, marginTop: 8 }}>{t("changeSrc")}</Text>
      </Callout>
      <View style={card}>
        <Text accessibilityRole="header" style={head}>{t("rulesTitle")}</Text>
        <View style={{ gap: 8, marginTop: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ width: 6, height: 6, marginTop: 9, transform: [{ rotate: "45deg" }], backgroundColor: "rgb(201,166,94)" }} />
              <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 23, color: th.muted }}>{t(`rule${i}`)}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={card}>
        <Text accessibilityRole="header" style={head}>{t("rightTitle")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.muted, marginTop: 8 }}>{t("rightText")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted, marginTop: 12 }}>{t("meaningNote")}</Text>
      </View>
    </View>
  );
}

