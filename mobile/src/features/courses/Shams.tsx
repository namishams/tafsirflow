import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Chip, GoldButton, GoldProgress } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { FONT, FWD, R, useTheme } from "@/lib/theme";
import { FREE, usePro } from "@/lib/pro";
import { useEntitlement } from "@/lib/entitlements";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { getChapters, type Chapter } from "@/lib/quran";
import { HmCard } from "@/features/extra/art";
import { StepIn } from "@/features/coursekit/motion";
import { StarBadge } from "@/features/today/art";
import { success } from "@/features/feed/haptics";
import { shamsGrow } from "@/features/garden/garden";
import { weakestVerses } from "@/web/learning";
import { award } from "@/web/points";
import { useCT } from "./texts";

// Shams Method extensions (the existing sessions under /shams/[surah] and their keys stay as they are; these screens
// only open them at a verse): a guided 30-day program, memorisation plans for any surah, and "Shams review" of the
// weakest verses. Program progress has its own key.
const KEY = "qmc.shams-program.v1";
type Prog = { days: Record<string, number> };
const VC: [number, number][] = [[1, 7], [114, 6], [113, 5], [112, 4], [111, 5], [110, 3], [109, 6], [108, 3], [107, 7], [106, 4], [105, 5], [104, 9], [103, 3], [102, 8], [101, 11], [100, 11], [99, 8], [98, 8], [97, 5]];
type Kind = "learn" | "review" | "link" | "recite";
export type PDay = { n: number; kind: Kind; s: number; from: number; to: number };

/** 30 days: new portions of at most 5 verses, every 4th day a review of the last days, every 7th a full recitation */
export const PROGRAM: PDay[] = (() => {
  const portions: { s: number; from: number; to: number }[] = [];
  for (const [s, n] of VC) for (let a = 1; a <= n; a += 5) portions.push({ s, from: a, to: Math.min(n, a + 4) });
  const out: PDay[] = [];
  let k = 0;
  for (let n = 1; n <= 30; n++) {
    const last = portions[Math.max(0, k - 1)];
    if (n % 7 === 0) out.push({ n, kind: "recite", s: last.s, from: 1, to: VC.find((x) => x[0] === last.s)![1] });
    else if (n % 4 === 0) out.push({ n, kind: "review", ...portions[Math.max(0, k - 2)] });
    else if (n % 7 === 6 && k > 1) out.push({ n, kind: "link", s: last.s, from: 1, to: last.to });
    else { out.push({ n, kind: "learn", ...portions[Math.min(k, portions.length - 1)] }); k++; }
  }
  return out;
})();
const openAt = (s: number, v: number) => router.push(`/shams/${s}?v=${v}` as Href);

function useNames() {
  const { lang } = useLang();
  const [ch, setCh] = useState<Chapter[]>([]);
  useEffect(() => { getChapters(lang).then(setCh).catch(() => undefined); }, [lang]);
  return { ch, name: (s: number) => ch.find((x) => x.id === s)?.name_simple ?? String(s) };
}

export function ShamsEntries() {
  const t = useTheme();
  const c = useCT();
  const items: [string, string, string][] = [["/shams/program", c("shProgram"), c("shProgramLead")], ["/shams/plans", c("shPlans"), c("shPlansLead")], ["/shams/review", c("shReview"), c("shReviewLead")]];
  return (
    <View style={{ gap: 10, marginTop: 16 }}>
      {items.map(([href, title, lead]) => (
        <HmCard key={href} onPress={() => router.push(href as Href)} accessibilityLabel={`${title}. ${lead}`}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{title}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 4 }}>{lead}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.accent, marginTop: 8 }}>{`${c("start")} ${FWD}`}</Text>
        </HmCard>
      ))}
    </View>
  );
}

export function ShamsProgramScreen() {
  const t = useTheme();
  const c = useCT();
  const { pro } = usePro();
  const { name } = useNames();
  const p = useStored<Prog>(KEY, { days: {} });
  const days = p.days ?? {};
  const doneN = Object.keys(days).length;
  const today = PROGRAM.find((d) => !days[d.n]) ?? null;
  const mark = (d: PDay) => {
    const cur = readJSON<Prog>(KEY, { days: {} });
    if (cur.days?.[d.n]) return;
    writeJSON(KEY, { days: { ...(cur.days ?? {}), [d.n]: Date.now() } });
    award("session"); shamsGrow("session", pro); success();
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow="Shams" title={c("shProgram")} lead={c("shProgramLead")} />
        <View style={{ padding: 16, gap: 10 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{`${doneN}/30`}</Text>
          <GoldProgress value={doneN / 30} />
          {PROGRAM.map((d, i) => {
            const done = !!days[d.n], cur = today?.n === d.n;
            const locked = !FREE.shamsSurah(d.s) && !pro;
            return (
              <StepIn key={d.n} delay={Math.min(i, 10) * 25}>
                <View style={{ padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: cur ? "rgba(150,116,52,0.6)" : "rgba(150,116,52,0.2)", backgroundColor: t.surface, gap: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <StarBadge size={34} tone={done ? "emerald" : cur ? "gold" : "light"}>{d.n}</StarBadge>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: t.gold }}>{`${c("shDay", { n: d.n })} · ${c(`shKind_${d.kind}` as never)}`}</Text>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{`${name(d.s)} · ${c("shVersesRange", { a: d.from, b: d.to })}`}</Text>
                    </View>
                    {done ? <Icon name="check" size={16} color={t.accent} /> : locked ? <Icon name="lock" size={14} color={t.gold} /> : null}
                  </View>
                  {cur ? (
                    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                      <Chip label={c("shOpen")} onPress={() => openAt(d.s, d.from)} />
                      <Chip label={c("shMarkDone")} selected onPress={() => mark(d)} />
                    </View>
                  ) : null}
                </View>
              </StepIn>
            );
          })}
        </View>
      </Page>
    </>
  );
}

export function ShamsPlansScreen() {
  const t = useTheme();
  const c = useCT();
  const { ch, name } = useNames();
  const ent = useEntitlement("shams");
  const [s, setS] = useState(1);
  const [pace, setPace] = useState(3);
  const vc = ch.find((x) => x.id === s)?.verses_count ?? 7;
  const plan = useMemo(() => Array.from({ length: Math.ceil(vc / pace) }, (_, i) => ({ a: i * pace + 1, b: Math.min(vc, (i + 1) * pace) })), [vc, pace]);
  const choose = (id: number) => { if (!ent.allowed && !FREE.shamsSurah(id)) { ent.upsell(); return; } setS(id); };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow="Shams" title={c("shPlans")} lead={c("shPlansLead")} />
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {[1, 2, 3, 5, 10].map((n) => <Chip key={n} label={c("shPace", { n })} selected={pace === n} onPress={() => setPace(n)} />)}
          </View>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink }}>{`${name(s)} · ${c("shDays", { n: plan.length })}`}</Text>
          <View style={{ gap: 6 }}>
            {plan.map((d, i) => (
              <Pressable key={i} onPress={() => openAt(s, d.a)} accessibilityRole="button" accessibilityLabel={`${c("shDay", { n: i + 1 })}: ${c("shVersesRange", { a: d.a, b: d.b })}`}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold, minWidth: 64 }}>{c("shDay", { n: i + 1 })}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink, flex: 1 }}>{c("shVersesRange", { a: d.a, b: d.b })}</Text>
                <Icon name="chevronRight" size={14} color={t.muted} />
              </Pressable>
            ))}
          </View>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, marginTop: 12 }}>{c("tjPick")}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {ch.map((x) => <Chip key={x.id} label={`${x.id} ${x.name_simple}`} selected={x.id === s} onPress={() => choose(x.id)} />)}
          </View>
        </View>
      </Page>
    </>
  );
}

export function ShamsReviewScreen() {
  const t = useTheme();
  const c = useCT();
  const { name } = useNames();
  const weak = weakestVerses(20);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow="Shams" title={c("shReview")} lead={c("shReviewLead")} />
        <View style={{ padding: 16, gap: 8 }}>
          {!weak.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted }}>{c("shNoWeak")}</Text> : null}
          {weak.length ? <GoldButton title={c("start")} onPress={() => { const [s, v] = weak[0].key.split(":"); openAt(Number(s), Number(v)); }} /> : null}
          {weak.map((x) => {
            const [s, v] = x.key.split(":");
            return (
              <Pressable key={x.key} onPress={() => openAt(Number(s), Number(v))} accessibilityRole="button" accessibilityLabel={`${name(Number(s))} ${v}, ${c("shStrength", { p: Math.round(x.strength * 100) })}`}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
                <StarBadge size={32}>{v}</StarBadge>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, flex: 1 }} numberOfLines={1}>{name(Number(s))}</Text>
                <View style={{ width: 64 }}><GoldProgress value={x.strength} /></View>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{c("shStrength", { p: Math.round(x.strength * 100) })}</Text>
              </Pressable>
            );
          })}
        </View>
      </Page>
    </>
  );
}
