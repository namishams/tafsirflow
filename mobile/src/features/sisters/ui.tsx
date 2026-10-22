import { useEffect, useState, type ReactNode } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { Chip, GoldButton, OutlineButton, Stage } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { useLang } from "@/i18n";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { usePro } from "@/lib/pro";
import { useIdentity } from "@/lib/identity";
import { openLink } from "@/features/extra/links";
import { shamsGrow } from "@/features/garden/garden";
import { success, tick } from "@/features/feed/haptics";
import { useShams2 } from "@/features/shams2/model";
import { markListen, useLog } from "@/features/shams2/store";
import { SISTERS_REVIEW, SISTERS_ROUTES, SOURCES } from "@/web/sisters";
import { MADHHABS, readSisters, saveSisters, setDays, setListenSwitch, shiftReviews, type GateKind, type Madhhab } from "@/web/sisters/state";
import type { Position, School } from "@/web/sisters/types";
import { useGate, useListenDays, useSis, useSisters } from "./state";

// "Für Schwestern" in the app: the opt-in setup, the "Meine Tage" card, the listening and understanding days, the calm
// paused state on recitation screens and the entry card. Texts and rules: src/web/sisters (the website's src/lib/sisters).

const go = (href: string) => router.push(href as Href);

/** the sources of one statement, each opening its page */
export function SrcLine({ ids }: { ids?: string[] }) {
  const t = useTheme();
  const { lang } = useLang();
  if (!ids?.length) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
      {ids.map((id) => {
        const s = SOURCES[id];
        if (!s) return null;
        return (
          <Text key={id} onPress={s.url ? () => openLink(s.url!, lang) : undefined} accessibilityRole={s.url ? "link" : "text"}
            style={{ fontFamily: FONT.medium, fontSize: 11.5, lineHeight: 16, color: s.url ? t.accent : t.muted, textAlign: "left" }}>{s.title}</Text>
        );
      })}
    </View>
  );
}

/** "Inhalt wird von Gelehrten geprüft" (until the owner sets SISTERS_REVIEW.needs_review = false) */
export function ReviewLine({ onStage }: { onStage?: boolean }) {
  const t = useTheme();
  const tx = useSis();
  if (!SISTERS_REVIEW.needs_review) return null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Icon name="shield" size={13} color={onStage ? stage.gold : t.gold} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: onStage ? stage.gold : t.gold }}>{tx.reviewLine}</Text>
    </View>
  );
}

/** one attributed position: the school as a gold label, the text, the sources */
export function PositionRow({ p, first }: { p: Position; first?: boolean }) {
  const t = useTheme();
  const tx = useSis();
  return (
    <View style={{ paddingVertical: 12, borderTopWidth: first ? 0 : 1, borderTopColor: t.line }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: 0.6, color: t.gold, textAlign: "left" }}>{tx.schools[p.school as School]}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink, marginTop: 4, textAlign: "left" }}>{p.text}</Text>
      <SrcLine ids={p.src} />
    </View>
  );
}

function Card({ children, gold }: { children: ReactNode; gold?: boolean }) {
  const t = useTheme();
  return <View style={{ padding: 16, borderRadius: R.card, borderWidth: 1, borderColor: gold ? "rgba(201,166,94,0.55)" : t.line, backgroundColor: t.surface, gap: 10 }}>{children}</View>;
}

// ---------- setup: consent, then the madhhab ----------
/** the opt-in. `onStage`: on the dark onboarding stage; `onDone` after agreeing (and choosing) or declining */
export function SistersSetup({ onStage, onDone }: { onStage?: boolean; onDone?: (agreed: boolean) => void }) {
  const t = useTheme();
  const tx = useSis();
  const st = useSisters();
  const [step, setStep] = useState<"consent" | "madhhab" | "declined">(() => (readSisters().consent === true ? "madhhab" : "consent"));
  const ink = onStage ? "#ffffff" : t.ink, soft = onStage ? stage.textSoft : t.muted;
  if (step === "declined") {
    return (
      <View style={{ gap: 12 }}>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: soft, textAlign: "left" }}>{tx.setup.declined}</Text>
        {onDone ? <GoldButton title={tx.setup.done} onPress={() => onDone(false)} /> : null}
      </View>
    );
  }
  if (step === "consent") {
    return (
      <View style={{ gap: 12 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: ink, textAlign: "left" }}>{tx.setup.title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: soft, textAlign: "left" }}>{tx.setup.lead}</Text>
        {tx.setup.points.map((p) => (
          <View key={p} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
            <Icon name="check" size={15} color={onStage ? stage.gold : t.gold} />
            <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: ink, textAlign: "left" }}>{p}</Text>
          </View>
        ))}
        <GoldButton title={tx.setup.agree} onPress={() => { tick(); saveSisters({ consent: true }); setStep("madhhab"); }} />
        <OutlineButton title={tx.setup.decline} onStage={onStage} onPress={() => { tick(); saveSisters({ consent: false }); setStep("declined"); }} />
      </View>
    );
  }
  return (
    <View style={{ gap: 12 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 28, color: ink, textAlign: "left" }}>{tx.setup.madhhabTitle}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: soft, textAlign: "left" }}>{tx.setup.madhhabLead}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {MADHHABS.map((m) => <Chip key={m} onStage={onStage} label={tx.setup.madhhabs[m]} selected={st.madhhab === m} onPress={() => { tick(); saveSisters({ madhhab: m }); }} />)}
      </View>
      {st.madhhab ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: soft, textAlign: "left" }}>{tx.days.rules[st.madhhab]}</Text> : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: soft, textAlign: "left" }}>{tx.setup.later}</Text>
      {onDone ? <GoldButton title={tx.setup.done} disabled={!st.madhhab} onPress={() => onDone(true)} /> : null}
    </View>
  );
}

// ---------- "Meine Tage" ----------
export function DaysCard() {
  const t = useTheme();
  const tx = useSis();
  const st = useSisters();
  const [pickSchool, setPickSchool] = useState(false);
  useEffect(() => { shiftReviews(); }, []);
  if (st.consent !== true || !st.madhhab || pickSchool) {
    return <Card gold><SistersSetup onDone={st.consent === true ? () => setPickSchool(false) : undefined} /></Card>;
  }
  const madhhab: Madhhab = st.madhhab;
  return (
    <Card gold>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink, textAlign: "left" }}>{tx.days.title}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted, textAlign: "left" }}>{tx.days.lead}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }}>{tx.days.question}</Text>
      <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: 8 }}>
        <Chip label={tx.days.yes} selected={st.days} onPress={() => { tick(); setDays(true); }} />
        <Chip label={tx.days.no} selected={!st.days} onPress={() => { tick(); setDays(false); }} />
      </View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: st.days ? t.gold : t.muted, textAlign: "left" }}>{st.days ? tx.days.statusOn : tx.days.statusOff}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.ink, textAlign: "left" }}>{tx.days.rules[madhhab]}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 6, borderTopWidth: 1, borderTopColor: t.line }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink, textAlign: "left" }}>{tx.days.strictTitle}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" }}>{tx.days.strictLead}</Text>
        </View>
        <Switch value={st.strict} onValueChange={(v) => { saveSisters({ strict: v }); }} accessibilityLabel={tx.days.strictTitle} trackColor={{ true: t.gold }} />
      </View>
      {st.days ? (
        <View style={{ gap: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: t.line }}>
          <GoldButton title={tx.days.offTitle} onPress={() => { success(); setDays(false); }} />
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, textAlign: "left" }}>{tx.days.offNote}</Text>
          <SrcLine ids={["ifta12343"]} />
          <Text onPress={() => go("/wudu")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent, textAlign: "left" }}>{tx.days.ghuslLink}</Text>
        </View>
      ) : null}
      <Text onPress={() => setPickSchool(true)} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent, textAlign: "left" }}>{`${tx.days.changeMadhhab}: ${tx.setup.madhhabs[madhhab]}`}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted, textAlign: "left" }}>{tx.days.privacy}</Text>
    </Card>
  );
}

// ---------- listening and understanding days (the pause mode) ----------
const STEP_ICON: Record<string, IconName> = { listen: "speaker", eyes: "eye", understand: "book", words: "list", tajweed: "volume", dua: "hands" };

/** for the Shams hub and the wird: the switch, and on a listening day the day's steps and "complete" */
export function ListenDaysCard({ compact }: { compact?: boolean }) {
  const t = useTheme();
  const tx = useSis();
  const { pro } = usePro();
  const on = useListenDays();
  const st = useSisters();
  const m = useShams2();
  const log = useLog();
  const [msg, setMsg] = useState("");
  useEffect(() => { if (on) shiftReviews(); }, [on]);
  const first = m.wird.sabaq.ranges[0] ?? m.wird.sabqi.ranges?.[0];
  const listenHref = first ? `/surah/${first.s}?v=${first.from}` : "/quran";
  const hrefOf: Record<string, string> = { listen: listenHref, eyes: listenHref, understand: `${SISTERS_ROUTES.understand}?s=${first?.s ?? 1}`, words: SISTERS_ROUTES.words, tajweed: SISTERS_ROUTES.tajweed, dua: SISTERS_ROUTES.duas };
  const doneToday = !!log[m.day]?.listen;
  const complete = () => { if (markListen(m.day)) { shamsGrow("session", pro); success(); } setMsg(tx.ld.doneMsg); };
  if (!on) {
    return (
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink, textAlign: "left" }}>{tx.ld.on}</Text>
            {!compact ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, textAlign: "left", marginTop: 2 }}>{tx.ld.lead}</Text> : null}
          </View>
          <Switch value={false} onValueChange={(v) => setListenSwitch(v)} accessibilityLabel={tx.ld.on} trackColor={{ true: t.gold }} />
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted, textAlign: "left" }}>{tx.ld.onHint}</Text>
        <Text onPress={() => go(SISTERS_ROUTES.page)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent, textAlign: "left" }}>{tx.ld.sistersLink}</Text>
      </Card>
    );
  }
  return (
    <Stage rounded={R.card} hairlines={false} style={{ borderWidth: 1, borderColor: "rgba(214,180,108,0.45)" }}>
      <View style={{ padding: 18, gap: 10 }}>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 18, lineHeight: 30, color: stage.gold, textAlign: "left" }}>{"اِسْتِمَاع وَتَدَبُّر"}</Text>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, lineHeight: 27, color: "#ffffff", textAlign: "left" }}>{tx.ld.activeTitle}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textSoft, textAlign: "left" }}>{tx.ld.activeLead}</Text>
        {tx.partShams.steps.map((s) => (
          <Pressable key={s.id} onPress={() => go(hrefOf[s.id])} accessibilityRole="button" accessibilityLabel={`${s.title}. ${s.text}`}
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: "rgba(214,180,108,0.22)", backgroundColor: pressed ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)" })}>
            <Icon name={STEP_ICON[s.id] ?? "book"} size={17} color={stage.gold} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: "#ffffff", textAlign: "left" }}>{s.title}</Text>
              {!compact ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: stage.textMuted, textAlign: "left" }}>{s.text}</Text> : null}
            </View>
            <Icon name="chevronRight" size={14} color={stage.textMuted} />
          </Pressable>
        ))}
        {doneToday || msg ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: stage.gold, textAlign: "left" }}>{tx.ld.doneMsg}</Text> : <GoldButton title={tx.ld.done} onPress={complete} />}
        {/* her own switch can be turned off here; "Meine Tage" only by herself on the sisters' page */}
        {!st.days ? <OutlineButton title={tx.ld.off} onStage onPress={() => setListenSwitch(false)} /> : (
          <Text onPress={() => go(SISTERS_ROUTES.page)} accessibilityRole="link" style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold, textAlign: "left" }}>{tx.ld.sistersLink}</Text>
        )}
      </View>
    </Stage>
  );
}

// ---------- the gate on recitation screens ----------
/** wraps a route: paused (calm state with ways to listen instead) or a short note above the screen, by her school */
export function DaysGate({ kind, children }: { kind: GateKind; children: ReactNode }) {
  const t = useTheme();
  const tx = useSis();
  const gate = useGate(kind);
  const [anyway, setAnyway] = useState(false);
  useEffect(() => { if (gate.state !== "open") shiftReviews(); }, [gate.state]);
  if (gate.state === "open" || anyway) return <>{children}</>;
  if (gate.state === "note") {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ position: "absolute", zIndex: 10, left: 12, right: 12, bottom: 24, padding: 12, borderRadius: R.md, backgroundColor: t.surface, borderWidth: 1, borderColor: "rgba(201,166,94,0.55)", flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Icon name="moon" size={15} color={t.gold} />
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.ink, textAlign: "left" }}>{gate.reason === "jafari" ? tx.gate.noteJafari : tx.gate.noteMaliki}</Text>
        </View>
        {children}
      </View>
    );
  }
  return <PausedView strict={gate.reason === "strict"} onAnyway={() => setAnyway(true)} />;
}

function PausedView({ strict, onAnyway }: { strict: boolean; onAnyway: () => void }) {
  const tx = useSis();
  return (
    <Stage style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 14 }}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : go("/"))} accessibilityRole="button" accessibilityLabel={tx.gate.toSection} hitSlop={12} style={{ position: "absolute", top: 56, left: 18, width: 40, height: 40, justifyContent: "center" }}>
          <Icon name="chevronLeft" color="#ffffff" size={24} />
        </Pressable>
        <Icon name="moon" size={28} color={stage.gold} />
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 26, lineHeight: 32, color: "#ffffff", textAlign: "left" }}>{tx.gate.pausedTitle}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: stage.textSoft, textAlign: "left" }}>{strict ? tx.gate.pausedStrict : tx.gate.pausedMajority}</Text>
        <GoldButton title={tx.gate.listenInstead} icon="speaker" onPress={() => go("/shams/wird")} />
        <OutlineButton title={tx.gate.toSection} onStage onPress={() => go(SISTERS_ROUTES.page)} />
        <Text onPress={onAnyway} accessibilityRole="button" style={{ fontFamily: FONT.medium, fontSize: 13.5, color: stage.textMuted, textAlign: "center", paddingVertical: 10 }}>{tx.gate.openAnyway}</Text>
        <ReviewLine onStage />
      </View>
    </Stage>
  );
}

// ---------- entry card (Discover for sisters, the Shams hub for everyone as a link) ----------
export function SistersEntryCard({ always }: { always?: boolean }) {
  const tx = useSis();
  const id = useIdentity();
  const st = useSisters();
  if (!always && (id.gender !== "sister" || st.consent === false)) return null;
  return (
    <Pressable onPress={() => go(SISTERS_ROUTES.page)} accessibilityRole="button" accessibilityLabel={`${tx.entryTitle}. ${tx.entryLead}`}
      style={({ pressed }) => ({ borderRadius: R.card, overflow: "hidden", opacity: pressed ? 0.92 : 1 })}>
      <Stage rounded={R.card} hairlines={false} style={{ borderWidth: 1, borderColor: "rgba(214,180,108,0.45)" }}>
        <View style={{ padding: 18, gap: 8 }}>
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 34, color: stage.gold, textAlign: "left" }}>{"لِلْأَخَوَات"}</Text>
          <Text style={{ fontFamily: FONT.display, fontSize: 21, color: "#ffffff", textAlign: "left" }}>{tx.entryTitle}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textSoft, textAlign: "left" }}>{tx.entryLead}</Text>
          {st.days ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: stage.gold }}>{tx.days.statusOn}</Text> : null}
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold, marginTop: 4 }}>{tx.entryCta}</Text>
        </View>
      </Stage>
    </Pressable>
  );
}
