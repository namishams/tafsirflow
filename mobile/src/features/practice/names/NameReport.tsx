import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Share, Text, View } from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { NAME_BY_KEY, THEME_LABEL, namesText, type Gender, type Lang, type Theme } from "@/web/names";
import { rankNames, type FinderInput } from "@/web/names/rules";
import { api, ApiError, SITE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { buyNameReport, useAiCredits, useNamesPrice } from "@/lib/purchases";
import { useStored, writeJSON } from "@/lib/store";
import { useWebT } from "@/i18n/web";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, goldButton, stage, useTheme, AR_RIGHT } from "@/lib/theme";
import { GoldButton, OutlineButton, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { IllumFrame, Rosette, go } from "../art";

// The paid personal name report (consumable com.quranmasterclass.app.names, 0,99 €; not part of Pro). The finder's
// free suggestions stay as they are; this card sends the form and the finder's scored candidates to the website
// (POST /api/names/report), which lets the model choose only among them and adds a personal reason per name.
// Names, meanings and verses come from the curated data. The last report stays on this device.

type Tx = ReturnType<typeof namesText>;
type Verse = { key: string; ar: string; tr: string };
type ReportName = { key: string; id: string; g: Gender; ar: string; tr: string[]; latin: string; meaning: string; verse: { key: string; kind: "appears" | "about" | "root" | "theme"; theme: Theme | null }; month: boolean; reason: string };
export type Report = { intro: string; month: number | null; monthNote: string | null; b?: ReportName[]; g?: ReportName[]; locale: string; at: number };
export type ReportForm = Omit<FinderInput, "hijriMonth"> & { gender: Gender | "both" };
type Favs = { has: (k: string) => boolean; toggle: (k: string) => void };

const REPORT_KEY = "qmc.nameReport";
const CANDIDATES = 30;

function Heart({ on, color }: { on: boolean; color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7.1 4.5c2 0 3.4 1.1 4.9 2.9 1.5-1.8 2.9-2.9 4.9-2.9 3.5 0 5.7 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" fill={on ? color : "none"} stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

export default function NameReport({ form, month, l, locale, rtl, t, favs }: { form: ReportForm; month: number | null; l: Lang; locale: string; rtl: boolean; t: Tx; favs: Favs }) {
  const tr = useWebT("names");
  const th = useTheme();
  const { user } = useAuth();
  const { credits, refresh } = useAiCredits();
  const price = useNamesPrice();
  const saved = useStored<Report | null>(REPORT_KEY, null);
  const [on, setOn] = useState<boolean | null>(null);
  const [state, setState] = useState<"idle" | "buying" | "busy">("idle");
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(true);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  useEffect(() => { api<{ ai?: boolean }>("/api/config").then((c) => setOn(!!c.ai)).catch(() => setOn(null)); }, []);

  // the finder's own ranking: the model may only choose among these names
  const candidates = useMemo(() => {
    const genders: Gender[] = form.gender === "both" ? ["b", "g"] : [form.gender];
    const out: Partial<Record<Gender, string[]>> = {};
    for (const g of genders) out[g] = rankNames(g, { ...form, hijriMonth: month }, l).slice(0, CANDIDATES).map((s) => s.n.key);
    return out;
  }, [form, month, l]);

  const left = credits?.names ?? 0;

  const create = async () => {
    setMsg(""); setState("busy");
    try {
      // the family name stays on the device
      const { gender, father, mother, siblings, themes, origins, maxLen, easy, letter } = form;
      const d = await api<Omit<Report, "locale" | "at">>("/api/names/report", { body: { locale, form: { gender, father, mother, siblings, themes, origins, maxLen, easy, letter, hijriMonth: month }, candidates } });
      if (!alive.current) return;
      // keep only names the app itself knows (the server already checked them against the data)
      const keep = (list?: ReportName[]) => (list ?? []).filter((n) => NAME_BY_KEY.has(n.key));
      writeJSON(REPORT_KEY, { ...d, b: d.b ? keep(d.b) : undefined, g: d.g ? keep(d.g) : undefined, locale, at: Date.now() } satisfies Report, true);
      setOpen(true);
    } catch (e) {
      if (!alive.current) return;
      const status = e instanceof ApiError ? e.status : 0;
      setMsg(status === 401 ? tr("reportSignIn") : status === 429 ? tr("reportLimit") : status === 503 ? tr("reportOff") : tr("reportError"));
    }
    if (alive.current) setState("idle");
    void refresh();
  };
  const buy = async () => {
    setMsg(""); setState("buying");
    let ok = false;
    try { ok = await buyNameReport(); } catch { ok = false; }
    if (!alive.current) return;
    if (!ok) { setState("idle"); setMsg(tr("reportBuyFailed")); return; }
    await refresh();
    await create();
  };

  if (on === false && !saved) return null;
  const report = saved && open ? saved : null;

  return (
    <View style={{ marginTop: 36 }}>
      <Stage rounded={R.card} hairlines={false}>
        <IllumFrame rosettes={18} />
        <View style={{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 28 }}>
          <View style={{ alignItems: "center" }}><Rosette size={30} color={stage.gold} /></View>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: l === "ar" ? 0 : 1.6, textTransform: "uppercase", color: stage.gold, textAlign: "center", marginTop: 12 }}>{tr("reportKicker")} · {price}</Text>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 26, lineHeight: 32, color: stage.text, textAlign: "center", marginTop: 8 }}>{tr("reportTitle")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: stage.textSoft, textAlign: "center", marginTop: 10 }}>{tr("reportLead")}</Text>
          <View style={{ gap: 10, marginTop: 20 }}>
            {(["reportP1", "reportP2", "reportP3"] as const).map((k) => (
              <View key={k} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: stage.gold, marginTop: 8 }} />
                <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textSoft }}>{tr(k)}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 24, gap: 10 }}>
            {on === false ? (
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: stage.textMuted, textAlign: "center" }}>{tr("reportOff")}</Text>
            ) : !user ? (
              <>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textMuted, textAlign: "center" }}>{tr("reportSignIn")}</Text>
                <OutlineButton title={tr("signIn")} onStage onPress={() => router.push("/sign-in")} />
              </>
            ) : state === "busy" ? (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 52 }}>
                <ActivityIndicator color={stage.gold} />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: stage.text }}>{tr("reportBusy")}</Text>
              </View>
            ) : left > 0 ? (
              <>
                <GoldButton title={tr("reportUse")} onPress={() => void create()} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: stage.textMuted, textAlign: "center" }}>{left === 1 ? tr("reportLeftOne") : tr("reportLeft", { n: left })}</Text>
              </>
            ) : (
              <>
                <GoldButton title={tr("reportBuy", { price })} busy={state === "buying"} disabled={state !== "idle"} onPress={() => void buy()} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: stage.textMuted, textAlign: "center" }}>{tr("reportStoreNote")}</Text>
              </>
            )}
            {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.cream, textAlign: "center" }}>{msg}</Text> : null}
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, color: stage.textMuted, textAlign: "center" }}>{tr("reportPrivacy")}</Text>
          </View>
        </View>
      </Stage>

      {report ? <ReportView report={report} t={t} tr={tr} l={l} rtl={rtl} favs={favs} onClose={() => setOpen(false)} /> : null}
      {saved && !open ? (
        <Pressable onPress={() => setOpen(true)} accessibilityRole="button" style={{ alignSelf: "center", paddingVertical: 12 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: th.accent }}>{tr("reportHeading")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ReportView({ report, t, tr, l, rtl, favs, onClose }: { report: Report; t: Tx; tr: (k: string, p?: Record<string, string | number>) => string; l: Lang; rtl: boolean; favs: Favs; onClose: () => void }) {
  const th = useTheme();
  const [verses, setVerses] = useState<Record<string, Verse | null>>({});
  const all = useMemo(() => [...(report.b ?? []), ...(report.g ?? [])], [report]);
  useEffect(() => {
    const keys = [...new Set(all.map((n) => n.verse.key))].filter((k) => /^\d{1,3}:\d{1,3}$/.test(k));
    if (!keys.length) return;
    // the names API answers at most 8 verses per request
    const chunks: string[][] = [];
    for (let i = 0; i < keys.length; i += 8) chunks.push(keys.slice(i, i + 8));
    for (const c of chunks) {
      api<{ verses?: Verse[] }>(`/api/names?verses=${c.join(",")}&locale=${report.locale}`).then((d) => {
        const got: Record<string, Verse | null> = Object.fromEntries(c.map((k) => [k, null]));
        for (const v of d.verses ?? []) got[v.key] = v;
        setVerses((x) => ({ ...x, ...got }));
      }).catch(() => setVerses((x) => ({ ...x, ...Object.fromEntries(c.map((k) => [k, null])) })));
    }
  }, [all, report.locale]);

  const shareAll = () => {
    const lines = [tr("reportHeading"), report.intro, ""];
    for (const g of ["b", "g"] as const) {
      const list = report[g];
      if (!list?.length) continue;
      if (report.b?.length && report.g?.length) lines.push(t(g === "b" ? "forBoy" : "forGirl"));
      for (const n of list) lines.push(l === "ar" ? `${n.ar}: ${n.meaning}` : `${n.ar} – ${n.latin}: ${n.meaning}`, n.reason, "");
    }
    lines.push(`${SITE}/${report.locale}/names`);
    void Share.share({ title: tr("reportHeading"), message: lines.filter((x, i, a) => !(x === "" && a[i - 1] === "")).join("\n") }).catch(() => undefined);
  };

  return (
    <View style={{ marginTop: 28 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.4, color: th.ink }}>{tr("reportHeading")}</Text>
      {report.intro ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: th.ink, marginTop: 8 }}>{report.intro}</Text> : null}
      {report.month && report.monthNote ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: th.muted, marginTop: 8 }}>{report.monthNote}</Text> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        <OutlineButton title={tr("reportShare")} icon="share" compact onPress={shareAll} />
        <OutlineButton title={tr("reportClose")} compact onPress={onClose} />
      </View>

      {(["b", "g"] as const).filter((g) => report[g]?.length).map((g) => (
        <View key={g} style={{ marginTop: 24, gap: 14 }}>
          {report.b?.length && report.g?.length ? <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 20, lineHeight: 26, color: th.ink }}>{t(g === "b" ? "forBoy" : "forGirl")}</Text> : null}
          {report[g]!.map((n, i) => <ReportCard key={n.key} n={n} i={i + 1} t={t} tr={tr} l={l} rtl={rtl} favs={favs} verse={verses[n.verse.key]} />)}
        </View>
      ))}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 19, color: th.muted, marginTop: 20 }}>{tr("reportNote")}</Text>
    </View>
  );
}

function ReportCard({ n, i, t, tr, l, rtl, favs, verse }: { n: ReportName; i: number; t: Tx; tr: (k: string, p?: Record<string, string | number>) => string; l: Lang; rtl: boolean; favs: Favs; verse: Verse | null | undefined }) {
  const th = useTheme();
  const ar = l === "ar";
  const on = favs.has(n.key);
  const [s, a] = n.verse.key.split(":");
  const kind = n.verse.kind === "theme" ? t("v_theme", { theme: n.verse.theme ? THEME_LABEL[l][n.verse.theme] : "" }) : t(`v_${n.verse.kind}`);
  const share = () => {
    const lines = [ar ? n.ar : `${n.ar} – ${n.latin}`, n.meaning, n.reason, `${kind}: ${t("verseRef", { ref: n.verse.key })}`, `${SITE}/names`];
    void Share.share({ title: t("title"), message: lines.join("\n") }).catch(() => undefined);
  };
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: th.line, backgroundColor: th.surface, padding: 18 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "rgba(201,166,94,0.55)", alignItems: "center", justifyContent: "center", marginTop: 4 }}>
          <Text style={{ fontFamily: FONT.display, fontSize: 13, color: th.gold }}>{i}</Text>
        </View>
        <View style={{ flex: 1 }}>
          {!ar ? <Text style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 28, color: th.ink }}>{n.latin}</Text> : null}
          {!ar && n.tr.length > 1 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: th.muted }}>{n.tr.slice(1).join(" · ")}</Text> : null}
          <Text style={{ fontFamily: ar ? ARABIC_FONT : FONT.regular, fontSize: ar ? 17 : 14.5, lineHeight: ar ? 30 : 21, color: th.muted, marginTop: 2 }}>{n.meaning}</Text>
        </View>
        <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 34, lineHeight: 54, color: th.gold, writingDirection: "rtl", textAlign: AR_RIGHT }}>{n.ar}</Text>
      </View>

      <View style={{ marginTop: 12, borderRadius: R.md, backgroundColor: "rgba(201,166,94,0.08)", paddingHorizontal: 14, paddingVertical: 12 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: ar ? 0 : 1.5, textTransform: "uppercase", color: th.gold }}>{tr("reportWhy")}</Text>
          {n.month ? <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: th.gold }}>· {tr("reportMonthTag")}</Text> : null}
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: th.ink, marginTop: 4 }}>{n.reason}</Text>
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: ar ? 0 : 1.5, textTransform: "uppercase", color: th.muted }}>{kind}</Text>
        {verse === undefined ? <View style={{ height: 44, borderRadius: R.md, backgroundColor: th.line, marginTop: 8 }} /> : verse ? (
          <>
            <Text style={{ fontFamily: ARABIC_FONT, fontSize: 19, lineHeight: 38, color: th.ink, writingDirection: "rtl", textAlign: AR_RIGHT, marginTop: 6 }}>{verse.ar}</Text>
            {!ar && verse.tr ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 21, color: th.muted, marginTop: 4 }}>{verse.tr}</Text> : null}
          </>
        ) : null}
        <Pressable onPress={() => go(`/surah/${s}?v=${a}`)} accessibilityRole="link" style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, alignSelf: "flex-start", paddingVertical: 4 }}>
          <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="playSm" color={th.gold} size={14} filled /></View>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: th.gold }}>{t("listen")} · {t("verseRef", { ref: n.verse.key })}</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        <Pressable onPress={() => favs.toggle(n.key)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={on ? t("saved") : t("save")}
          style={({ pressed }) => ({ height: 40, borderRadius: R.pill, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: on ? goldButton.line : pressed ? th.muted : th.line, backgroundColor: on ? "rgba(201,166,94,0.14)" : "transparent" })}>
          <Heart on={on} color={on ? th.gold : th.ink} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: th.ink }}>{on ? t("saved") : t("save")}</Text>
        </Pressable>
        <Pressable onPress={share} accessibilityRole="button" accessibilityLabel={t("share")}
          style={({ pressed }) => ({ height: 40, borderRadius: R.pill, paddingHorizontal: 16, justifyContent: "center", borderWidth: 1, borderColor: pressed ? th.muted : th.line })}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: th.ink }}>{t("share")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

