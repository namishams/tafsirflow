import { useCallback, useEffect, useRef, useState, type ComponentRef, type ReactNode } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Stack, router, useFocusEffect, useLocalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Page, PageHero, Loading } from "@/components/page";
import { Chip, GlassButton, GlassCard, GoldButton, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { ApiError } from "@/lib/api";
import { savedChapters } from "@/lib/quran";
import { loadVerse } from "@/features/srs/verse";
import { T as TalentApi } from "@/features/talents/api";
import { TG } from "@/features/together/api";
import { SafetyBar } from "@/features/talents/ui";
import { Body, Label, MemberRow, Progress, Section, Sheet, Tile, TogetherGate, nf, surahLabel, useTogetherAccess } from "@/features/together/ui";
import { INTENTIONS, SOC, useSx, type ClassSummary, type Duel, type FeedEvent, type Halaqa, type Hub, type Intention, type Khatm, type Recap, type NetProfile, type Network, type SClass, type Skill, type SocialKey, type TargetKind } from "@/features/social/api";

// /together/social – "Gemeinsam tiefer" (owner 22.10.2026): khatm groups (a juz each, a dua moment and a card at the
// end), the live halaqa of a study circle (text and presence only: the leader's verse cursor and raised hands, polled
// every 4 s; no voice), the weekly recap card (shared only by the member as an image), mutashabihat duels between two
// friends (same questions, no stakes), teacher classes (weekly target, progress with consent, moderated announcements)
// and the friends' milestones with MashaAllah. 16+ with a profile (TogetherGate), opt-in everywhere, report and block.
// Views by ?v=: hub (default) | khatm&id | halaqa&id (circle id) | recap | duel&id | class&id. Website: /together/social.
type V = "hub" | "khatm" | "halaqa" | "recap" | "duel" | "class" | "profile";

function useErr() {
  const sx = useSx();
  return (e: unknown) => {
    const code = e instanceof ApiError ? e.code : "generic";
    const s = sx(`e_${code}` as SocialKey);
    return s === `e_${code}` ? sx("e_generic") : s;
  };
}
const verseText = async (key: string, lang: string) => (await loadVerse(key, lang)).words.map((w) => w.text).join(" ");
const keyLabel = (key: string, lang: string) => { const [s, a] = key.split(":"); return `${surahLabel(Number(s), lang)}:${a}`; };

export default function SocialScreen() {
  const { v, id } = useLocalSearchParams<{ v?: V; id?: string }>();
  const sx = useSx();
  const a = useTogetherAccess();
  const insets = useSafeAreaInsets();
  const view: V = v && ["khatm", "halaqa", "recap", "duel", "class", "profile"].includes(v) ? v : "hub";
  const title: Record<V, [SocialKey, SocialKey]> = {
    hub: ["hubTitle", "hubLead"], khatm: ["khatm", "khatmLead"], halaqa: ["halaqa", "halaqaLead"], recap: ["recap", "recapLead"], duel: ["duels", "duelsLead"], class: ["classes", "classesLead"], profile: ["network", "networkLead"],
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={sx("hubTitle")} title={sx(title[view][0])} lead={sx(title[view][1])} />
        <TogetherGate a={a}>
          <View style={{ padding: 16, gap: 22, paddingBottom: insets.bottom + 120 }}>
            {view === "hub" ? <HubView /> : view === "khatm" ? <KhatmView id={id ?? ""} /> : view === "halaqa" ? <HalaqaView circleId={id ?? ""} />
              : view === "recap" ? <RecapView /> : view === "duel" ? <DuelView id={id ?? ""} /> : view === "class" ? <ClassView id={id ?? ""} /> : <ProfileView username={id ?? ""} />}
            <SafetyBar />
          </View>
        </TogetherGate>
      </Page>
    </>
  );
}

const go = (v: V, id?: string) => router.push(`/together/social?v=${v}${id ? `&id=${encodeURIComponent(id)}` : ""}` as Href);

function Msg({ text }: { text: string }) {
  return text ? <Body muted>{text}</Body> : null;
}
function Field({ value, onChange, label, placeholder, multiline }: { value: string; onChange: (v: string) => void; label: string; placeholder?: string; multiline?: boolean }) {
  const t = useTheme();
  return (
    <TextInput value={value} onChangeText={onChange} accessibilityLabel={label} placeholder={placeholder ?? label} placeholderTextColor={t.muted} multiline={multiline} maxLength={multiline ? 500 : 40}
      autoCapitalize={multiline ? "sentences" : "none"}
      style={{ minHeight: multiline ? 96 : 48, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14, paddingVertical: 12, fontFamily: FONT.regular, fontSize: 16, color: t.ink, textAlignVertical: multiline ? "top" : "center" }} />
  );
}
function Consent({ text, on, onChange }: { text: string; on: boolean; onChange: (v: boolean) => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => onChange(!on)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start", minHeight: 44 }}>
      <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: on ? goldButton.line : t.line, backgroundColor: on ? goldButton.to : "transparent", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        {on ? <Icon name="check" color={goldButton.text} size={14} /> : null}
      </View>
      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink }}>{text}</Text>
    </Pressable>
  );
}
function List({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>{children}</View>;
}
/** report with a confirmation (category "other"; the moderation queue sees the group) */
function confirmReport(sx: ReturnType<typeof useSx>, run: () => Promise<unknown>) {
  Alert.alert(sx("report"), "", [
    { text: sx("cancel"), style: "cancel" },
    { text: sx("report"), style: "destructive", onPress: () => void run().then(() => Alert.alert(sx("reportDone"))).catch(() => Alert.alert(sx("e_generic"))) },
  ]);
}
/** a member's menu: block (everywhere) and, for the owner, remove from this group */
function memberMenu(sx: ReturnType<typeof useSx>, username: string, onRemove?: () => void) {
  Alert.alert(username, "", [
    ...(onRemove ? [{ text: sx("remove"), onPress: onRemove }] : []),
    { text: sx("block"), style: "destructive" as const, onPress: () => void TalentApi.block(username, true).catch(() => undefined) },
    { text: sx("cancel"), style: "cancel" as const },
  ]);
}

// ---------- hub ----------
function HubView() {
  const sx = useSx();
  const err = useErr();
  const t = useTheme();
  const { lang } = useLang();
  const [d, setD] = useState<Hub | null>(null);
  const [msg, setMsg] = useState("");
  const [sheet, setSheet] = useState<null | "khatmNew" | "khatmJoin" | "classNew" | "classJoin" | "duel">(null);
  const load = useCallback(() => { SOC.hub().then(setD).catch((e) => setMsg(err(e))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(load);
  if (!d) return msg ? <Msg text={msg} /> : <Loading />;
  const done = () => { setSheet(null); load(); };
  return (
    <>
      <Msg text={msg} />
      {d.live.map((l) => (
        <GlassCard key={l.id} onPress={() => go("halaqa", l.id)} accessibilityLabel={sx("halaqaLive", { c: l.name })}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: goldButton.to }} />
            <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{sx("halaqaLive", { c: l.name })}</Text>
            <Text style={{ fontFamily: FONT.semibold, color: t.accent }}>{sx("halaqaOpen")}</Text>
          </View>
        </GlassCard>
      ))}

      <Stage rounded={22}>
        <Pressable onPress={() => go("recap")} accessibilityRole="button" style={{ padding: 20, gap: 6 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.6, color: stage.gold, textTransform: "uppercase" }}>{sx("recap")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: stage.textSoft }}>{sx("recapLead")}</Text>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: stage.cream, marginTop: 6 }}>{sx("open")}</Text>
        </Pressable>
      </Stage>

      <Section title={sx("khatm")} icon="book" action={sx("khatmJoin")} onAction={() => setSheet("khatmJoin")}>
        {d.khatms.map((k) => (
          <GlassCard key={k.id} onPress={() => go("khatm", k.id)} accessibilityLabel={k.name}>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{k.name}</Text>
                {k.completed ? <Icon name="checkCircle" color={t.gold} size={18} /> : null}
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{sx(`int_${k.intention}` as SocialKey)} · {sx("members", { n: nf(k.members, lang) })}</Text>
              <Progress value={k.done} max={30} label={sx("doneOf", { n: nf(k.done, lang) })} />
              {k.mine.length ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent }}>{sx("mine", { s: k.mine.join(", ") })}</Text> : null}
            </View>
          </GlassCard>
        ))}
        <GoldButton title={sx("khatmNew")} icon="plus" onPress={() => setSheet("khatmNew")} />
      </Section>

      <Section title={sx("duels")} icon="trophy" action={d.settings.duels ? sx("duelNew") : undefined} onAction={() => setSheet("duel")}>
        {!d.settings.duels ? (
          <Tile>
            <Body>{sx("duelsOff")}</Body>
            <GlassButton title={sx("duelsOn")} onPress={() => void SOC.saveSettings({ duels: true }).then(load).catch((e) => setMsg(err(e)))} />
          </Tile>
        ) : d.duels.length ? (
          <List>{d.duels.map((x, i) => <DuelRow key={x.id} d={x} first={i === 0} onChange={load} />)}</List>
        ) : <Body muted>{sx("duelsLead")}</Body>}
      </Section>

      <Section title={sx("classes")} icon="cap" action={sx("classJoin")} onAction={() => setSheet("classJoin")}>
        {d.classes.classes.map((c: ClassSummary) => (
          <GlassCard key={c.id} onPress={() => go("class", c.id)} accessibilityLabel={c.name}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{c.name}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, marginTop: 4 }}>{sx("target")}: {nf(c.target, lang)} {sx(`tk_${c.targetKind}` as SocialKey)} · {sx("members", { n: nf(c.members, lang) })}</Text>
          </GlassCard>
        ))}
        {d.classes.canTeach ? <GlassButton title={sx("classNew")} icon="plus" onPress={() => setSheet("classNew")} /> : <Body muted size={13}>{sx("teacherOnly")}</Body>}
      </Section>

      <NetworkSection />

      <Section title={sx("feed")} icon="heart">
        <FeedSwitch on={d.settings.feed} onChange={load} />
        {d.feed.length ? <List>{d.feed.map((e, i) => <FeedRow key={e.id} e={e} first={i === 0} />)}</List> : <Body muted>{sx("feedEmpty")}</Body>}
      </Section>

      <KhatmNewSheet visible={sheet === "khatmNew"} onClose={() => setSheet(null)} onDone={(id) => { done(); go("khatm", id); }} />
      <JoinSheet kind="khatm" visible={sheet === "khatmJoin"} onClose={() => setSheet(null)} onDone={(id) => { done(); go("khatm", id); }} />
      <JoinSheet kind="class" visible={sheet === "classJoin"} onClose={() => setSheet(null)} onDone={(id) => { done(); go("class", id); }} />
      <ClassNewSheet visible={sheet === "classNew"} onClose={() => setSheet(null)} onDone={(id) => { done(); go("class", id); }} />
      <DuelSheet visible={sheet === "duel"} onClose={() => setSheet(null)} onDone={done} />
    </>
  );
}

function FeedSwitch({ on, onChange }: { on: boolean; onChange: () => void }) {
  const sx = useSx();
  return <Consent text={sx("feedShare")} on={on} onChange={(v) => void SOC.saveSettings({ feed: v }).then(onChange).catch(() => undefined)} />;
}
function FeedRow({ e, first }: { e: FeedEvent; first: boolean }) {
  const sx = useSx();
  const t = useTheme();
  const { lang } = useLang();
  const [mine, setMine] = useState(e.mine);
  const [n, setN] = useState(e.mashallah);
  const line = sx(`ev_${e.kind}` as SocialKey, { u: e.author.name, s: e.kind === "surah" ? surahLabel(Number(e.ref), lang) : "" });
  const toggle = () => { const on = !mine; setMine(on); setN((x) => x + (on ? 1 : -1)); void SOC.react(e.id, on).catch(() => { setMine(!on); setN((x) => x + (on ? -1 : 1)); }); };
  return (
    <MemberRow c={e.author} first={first} sub={line} right={e.own ? (n ? <Text style={{ fontFamily: FONT.semibold, color: t.gold }}>{nf(n, lang)}</Text> : null) : (
      <Chip label={n ? `${sx("mashallah")} ${nf(n, lang)}` : sx("mashallah")} selected={mine} onPress={toggle} small />
    )} />
  );
}

// ---------- sheets ----------
function KhatmNewSheet({ visible, onClose, onDone }: { visible: boolean; onClose: () => void; onDone: (id: string) => void }) {
  const sx = useSx();
  const err = useErr();
  const [name, setName] = useState("");
  const [intention, setIntention] = useState<Intention>("general");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const submit = () => {
    setBusy(true);
    SOC.createKhatm({ name, intention }).then((r) => { setName(""); setOk(false); onDone(r.id); }).catch((e) => setMsg(err(e))).finally(() => setBusy(false));
  };
  return (
    <Sheet visible={visible} title={sx("khatmNew")} onClose={onClose}>
      <Label>{sx("name")}</Label>
      <Field value={name} onChange={setName} label={sx("name")} />
      <Label>{sx("intention")}</Label>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {INTENTIONS.map((i) => <Chip key={i} label={sx(`int_${i}` as SocialKey)} selected={intention === i} onPress={() => setIntention(i)} role="radio" />)}
      </View>
      <Consent text={sx("khatmConsent")} on={ok} onChange={setOk} />
      <Msg text={msg} />
      <GoldButton title={sx("create")} busy={busy} disabled={!ok || name.trim().length < 2} onPress={submit} />
    </Sheet>
  );
}
function JoinSheet({ kind, visible, onClose, onDone }: { kind: "khatm" | "class"; visible: boolean; onClose: () => void; onDone: (id: string) => void }) {
  const sx = useSx();
  const err = useErr();
  const [code, setCode] = useState("");
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState("");
  const submit = () => (kind === "khatm" ? SOC.joinKhatm(code) : SOC.joinClass(code)).then((r) => { setCode(""); setOk(false); onDone(r.id); }).catch((e) => setMsg(err(e)));
  return (
    <Sheet visible={visible} title={sx(kind === "khatm" ? "khatmJoin" : "classJoin")} onClose={onClose}>
      <Field value={code} onChange={(v) => setCode(v.toUpperCase())} label={sx("code", { code: "" })} placeholder="XXXX-XXXX" />
      <Consent text={sx(kind === "khatm" ? "khatmConsent" : "classConsent")} on={ok} onChange={setOk} />
      <Msg text={msg} />
      <GoldButton title={sx("join")} disabled={!ok || code.replace(/[^A-Z0-9]/g, "").length < 8} onPress={() => void submit()} />
    </Sheet>
  );
}
const TK: TargetKind[] = ["verses", "days", "xp"];
function ClassNewSheet({ visible, onClose, onDone }: { visible: boolean; onClose: () => void; onDone: (id: string) => void }) {
  const sx = useSx();
  const err = useErr();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<TargetKind>("verses");
  const [target, setTarget] = useState("10");
  const [msg, setMsg] = useState("");
  return (
    <Sheet visible={visible} title={sx("classNew")} onClose={onClose}>
      <Label>{sx("name")}</Label>
      <Field value={name} onChange={setName} label={sx("name")} />
      <Label>{sx("target")}</Label>
      <View style={{ flexDirection: "row", gap: 8 }}>{TK.map((k) => <Chip key={k} label={sx(`tk_${k}` as SocialKey)} selected={kind === k} onPress={() => setKind(k)} role="radio" />)}</View>
      <Field value={target} onChange={(v) => setTarget(v.replace(/\D/g, "").slice(0, 5))} label={sx("target")} />
      <Msg text={msg} />
      <GoldButton title={sx("create")} disabled={name.trim().length < 2} onPress={() => void SOC.createClass({ name, targetKind: kind, target: Number(target) }).then((r) => { setName(""); onDone(r.id); }).catch((e) => setMsg(err(e)))} />
    </Sheet>
  );
}
function DuelSheet({ visible, onClose, onDone }: { visible: boolean; onClose: () => void; onDone: () => void }) {
  const sx = useSx();
  const err = useErr();
  const [friends, setFriends] = useState<{ username: string; name: string }[]>([]);
  const [msg, setMsg] = useState("");
  // friends for the picker: the Together friend list (mutual follows or connections)
  useEffect(() => { if (visible) void TG.friends("challenges").then((r) => setFriends(r.friends)).catch(() => setFriends([])); }, [visible]);
  return (
    <Sheet visible={visible} title={sx("duelNew")} onClose={onClose}>
      <Body muted>{sx("duelsLead")}</Body>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {friends.map((f) => <Chip key={f.username} label={f.name} onPress={() => void SOC.duel(f.username).then(onDone).catch((e) => setMsg(err(e)))} />)}
      </View>
      <Msg text={msg} />
    </Sheet>
  );
}

// ---------- khatm ----------
function KhatmView({ id }: { id: string }) {
  const sx = useSx();
  const err = useErr();
  const t = useTheme();
  const { lang } = useLang();
  const [k, setK] = useState<Khatm | null>(null);
  const [msg, setMsg] = useState("");
  const card = useRef<ComponentRef<typeof View>>(null);
  const load = useCallback(() => { SOC.khatm(id).then((r) => setK(r.khatm)).catch((e) => setMsg(err(e))); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(load, [load]);
  if (!k) return msg ? <Msg text={msg} /> : <Loading />;
  const act = (action: "claim" | "release" | "done", juz: number) =>
    SOC.khatmAction(id, { action, juz }).then((r) => { setMsg(""); setK(r as Khatm); }).catch((e) => setMsg(err(e)));
  const done = k.parts.filter((p) => p.state === "done").length;
  const share = async () => {
    try {
      const uri = await captureRef(card as unknown as Parameters<typeof captureRef>[0], { format: "png", quality: 1, result: "tmpfile" });
      await Sharing.shareAsync(uri.startsWith("/") ? `file://${uri}` : uri, { mimeType: "image/png", UTI: "public.png" });
    } catch { /* cancelled */ }
  };
  return (
    <>
      <View style={{ gap: 6 }}>
        <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{k.name}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{sx(`int_${k.intention}` as SocialKey)} · {sx("members", { n: nf(k.members.length, lang) })}</Text>
        {k.code ? <Text selectable style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{sx("code", { code: k.code })}</Text> : null}
      </View>
      <Msg text={msg} />
      {k.completed ? (
        <>
          <View ref={card} collapsable={false}>
            <Stage rounded={24}>
              <View style={{ padding: 26, gap: 14, alignItems: "center" }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.8, color: stage.gold, textTransform: "uppercase" }}>{sx("duaTitle")}</Text>
                <Text style={{ fontFamily: FONT.display, fontSize: 24, color: stage.cream, textAlign: "center" }}>{sx("khatmComplete")}</Text>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 44, color: stage.text, textAlign: "center" }}>اللَّهُمَّ ارْحَمْنَا بِالْقُرْآنِ</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: stage.textSoft, textAlign: "center" }}>{sx("duaText")}</Text>
                <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: stage.gold }}>{k.name} · {sx("members", { n: nf(k.members.length, lang) })}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: stage.textMuted, letterSpacing: 1.2 }}>QURAN MASTERCLASS</Text>
              </View>
            </Stage>
          </View>
          <GoldButton title={sx("shareCard")} icon="share" onPress={() => void share()} />
        </>
      ) : <Progress value={done} max={30} label={sx("doneOf", { n: nf(done, lang) })} />}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {k.parts.map((p) => {
          const bg = p.state === "done" ? goldButton.to : p.mine ? t.accentSoft : t.surface;
          const onPress = () => {
            if (k.completed || k.suspended) return;
            if (p.state === "open") void act("claim", p.juz);
            else if (p.mine && p.state === "claimed") Alert.alert(sx("juzN", { n: p.juz }), "", [
              { text: sx("markDone"), onPress: () => void act("done", p.juz) },
              { text: sx("release"), onPress: () => void act("release", p.juz) },
              { text: sx("cancel"), style: "cancel" },
            ]);
          };
          return (
            <Pressable key={p.juz} onPress={onPress} accessibilityRole="button"
              accessibilityLabel={`${sx("juzN", { n: p.juz })}, ${sx(`st_${p.state}` as SocialKey)}${p.by ? `, ${p.by.name}` : ""}`}
              style={{ width: "31%", minHeight: 64, borderRadius: R.md, borderWidth: 1, borderColor: p.mine ? t.accent : t.line, backgroundColor: bg, padding: 8, justifyContent: "center", gap: 2 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: p.state === "done" ? goldButton.text : t.ink }}>{sx("juzN", { n: p.juz })}</Text>
              <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 11.5, color: p.state === "done" ? goldButton.text : t.muted }}>
                {p.by ? p.by.name.split(" ")[0] : sx(`st_${p.state}` as SocialKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Section title={sx("members", { n: nf(k.members.length, lang) })}>
        <List>{k.members.map((m, i) => (
          <MemberRow key={m.username} c={m} first={i === 0}
            right={<Pressable accessibilityRole="button" accessibilityLabel={sx("report")} hitSlop={10} onPress={() => memberMenu(sx, m.username, k.owner ? () => void SOC.khatmAction(id, { action: "remove", username: m.username }).then(load) : undefined)}><Icon name="menu" color={t.muted} size={18} /></Pressable>} />
        ))}</List>
      </Section>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <GlassButton title={sx("leave")} compact onPress={() => void SOC.khatmAction(id, { action: "leave" }).then(() => router.back())} />
        <GlassButton title={sx("report")} compact icon="flag" onPress={() => confirmReport(sx, () => SOC.khatmAction(id, { action: "report", category: "other" }))} />
      </View>
    </>
  );
}

// ---------- live halaqa ----------
function HalaqaView({ circleId }: { circleId: string }) {
  const sx = useSx();
  const err = useErr();
  const t = useTheme();
  const { lang } = useLang();
  const [h, setH] = useState<Halaqa | null>(null);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const poll = useCallback(() => { SOC.halaqa(circleId).then((r) => setH(r.halaqa)).catch((e) => setMsg(err(e))); }, [circleId]); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { poll(); const iv = setInterval(poll, 4000); return () => clearInterval(iv); }, [poll]));
  const key = h?.live ? `${h.surah}:${h.ayah}` : null;
  useEffect(() => { if (key) void verseText(key, lang).then(setText).catch(() => setText("")); }, [key, lang]);
  if (!h) return msg ? <Msg text={msg} /> : <Loading />;
  const act = (b: Parameters<typeof SOC.halaqaAction>[1]) => SOC.halaqaAction(circleId, b).then((r) => setH(r.halaqa)).catch((e) => setMsg(err(e)));
  const count = savedChapters(lang)?.chapters.find((c) => c.id === h.surah)?.verses_count ?? 286;
  const step = (d: number) => {
    let s = h.surah ?? 1, a = (h.ayah ?? 1) + d;
    if (a > count && s < 114) { s += 1; a = 1; }
    if (a < 1 && s > 1) { s -= 1; a = savedChapters(lang)?.chapters.find((c) => c.id === s)?.verses_count ?? 1; }
    void act({ action: "cursor", surah: s, ayah: Math.max(1, a) });
  };
  return (
    <>
      <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{h.circle.name}</Text>
      <Msg text={msg} />
      {!h.live ? (
        <Tile>
          <Body>{sx("halaqaNone")}</Body>
          {h.canStart ? <GoldButton title={sx("halaqaStart")} onPress={() => void act({ action: "start", surah: 1, ayah: 1 })} /> : null}
        </Tile>
      ) : (
        <>
          <Stage rounded={24}>
            <View style={{ padding: 22, gap: 12 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.6, color: stage.gold, textTransform: "uppercase" }}>{h.leader ? sx("leads", { u: h.leader.name }) : sx("halaqa")}</Text>
              <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: stage.cream }}>{sx("surahAyah", { s: surahLabel(h.surah ?? 1, lang), n: nf(h.ayah ?? 1, lang) })}</Text>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 50, color: stage.text, textAlign: "right", writingDirection: "rtl" }}>{text}</Text>
            </View>
          </Stage>
          {h.leading ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <GlassButton title={sx("prev")} compact icon="chevronLeft" onPress={() => step(-1)} style={{ flex: 1 }} />
              <GoldButton title={sx("next")} compact icon="chevronRight" onPress={() => step(1)} style={{ flex: 1 }} />
            </View>
          ) : (
            <GoldButton title={h.myHand ? sx("lowerHand") : sx("raiseHand")} icon="hands" onPress={() => void act({ action: "hand", up: !h.myHand })} />
          )}
          <Section title={sx("present", { n: nf(h.present?.length ?? 0, lang) })}>
            <List>{(h.present ?? []).map((p, i) => (
              <MemberRow key={p.username} c={p} first={i === 0} highlight={p.hand} sub={p.hand ? sx("handUp") : undefined}
                right={h.leading && p.hand ? <Chip label={sx("lowerHand")} onPress={() => void act({ action: "lower", username: p.username })} small /> : null} />
            ))}</List>
          </Section>
          {h.leading || h.canStart ? <GlassButton title={sx("halaqaEnd")} onPress={() => void act({ action: "end" })} /> : null}
        </>
      )}
    </>
  );
}

// ---------- weekly recap ----------
function RecapView() {
  const sx = useSx();
  const err = useErr();
  const t = useTheme();
  const { lang } = useLang();
  const [r, setR] = useState<Recap | null>(null);
  const [msg, setMsg] = useState("");
  const card = useRef<ComponentRef<typeof View>>(null);
  useEffect(() => { SOC.recap().then((x) => setR(x.recap)).catch((e) => setMsg(err(e))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!r) return msg ? <Msg text={msg} /> : <Loading />;
  const share = async () => {
    try {
      const uri = await captureRef(card as unknown as Parameters<typeof captureRef>[0], { format: "png", quality: 1, result: "tmpfile" });
      await Sharing.shareAsync(uri.startsWith("/") ? `file://${uri}` : uri, { mimeType: "image/png", UTI: "public.png" });
    } catch { /* cancelled */ }
  };
  const Stat = ({ n, label }: { n: string; label: string }) => (
    <View style={{ width: "50%", paddingVertical: 12, gap: 2 }}>
      <Text style={{ fontFamily: FONT.display, fontSize: 34, color: stage.cream }}>{n}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: stage.textSoft }}>{label}</Text>
    </View>
  );
  return (
    <>
      <View ref={card} collapsable={false}>
        <Stage rounded={26}>
          <View style={{ padding: 26, gap: 8 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.8, color: stage.gold, textTransform: "uppercase" }}>{sx("recap")}</Text>
            <Text style={{ fontFamily: FONT.display, fontSize: 26, color: stage.text }}>{r.name}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
              <Stat n={nf(r.verses, lang)} label={sx("recapVerses")} />
              <Stat n={nf(r.days, lang)} label={sx("recapDays")} />
              <Stat n={nf(r.streak, lang)} label={sx("recapStreak")} />
              {r.juz ? <Stat n={nf(r.juz, lang)} label={sx("recapJuz")} /> : null}
            </View>
            {r.surah ? <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: stage.cream }}>{sx("recapSurah")}: {surahLabel(r.surah, lang)}</Text> : null}
            {r.circle ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: stage.textSoft }}>{sx("recapRank", { n: nf(r.circle.rank, lang), m: nf(r.circle.of, lang), c: r.circle.name })}</Text> : null}
            <View style={{ height: 1, backgroundColor: stage.hair, marginVertical: 10 }} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: stage.gold }}>{sx("recapFooter")} · QURAN MASTERCLASS</Text>
          </View>
        </Stage>
      </View>
      <Body muted size={13}>{sx("recapNote")}</Body>
      <GoldButton title={sx("recapShare")} icon="share" onPress={() => void share()} />
    </>
  );
}

// ---------- duels ----------
function DuelRow({ d, first, onChange }: { d: Duel; first: boolean; onChange: () => void }) {
  const sx = useSx();
  const { lang } = useLang();
  const sub = d.status === "done" && d.mine !== null && d.theirs !== null
    ? sx("duelResult", { n: nf(d.mine, lang), u: d.other.name, m: nf(d.theirs, lang) })
    : d.played ? `${sx("duelDone", { n: nf(d.mine ?? 0, lang), m: nf(d.total, lang) })} · ${sx("duelWaiting", { u: d.other.name })}`
    : d.fromMe ? sx("duelWaiting", { u: d.other.name }) : sx("duelInvited", { u: d.other.name });
  const right = d.status === "open" && !d.played ? (
    <View style={{ flexDirection: "row", gap: 6 }}>
      <Chip label={sx("duelPlay")} selected onPress={() => go("duel", d.id)} small />
      {!d.fromMe ? <Chip label={sx("duelDecline")} onPress={() => void SOC.duelAction(d.id, { action: "decline" }).then(onChange)} small /> : null}
    </View>
  ) : d.status === "done" ? <Icon name="checkCircle" color={goldButton.to} size={18} /> : null;
  return <MemberRow c={d.other} first={first} sub={sub} right={right} />;
}
function DuelView({ id }: { id: string }) {
  const sx = useSx();
  const err = useErr();
  const t = useTheme();
  const { lang } = useLang();
  const [qs, setQs] = useState<{ show: string; options: string[]; text: string }[] | null>(null);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<string[]>([]);
  const [res, setRes] = useState<{ score: number; total: number } | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    SOC.duelQuestions(id).then(async (r) => setQs(await Promise.all(r.questions.map(async (q) => ({ ...q, text: await verseText(q.show, lang).catch(() => "") })))))
      .catch((e) => setMsg(err(e)));
  }, [id, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  if (res) return (
    <Tile>
      <Text style={{ fontFamily: FONT.display, fontSize: 28, color: t.ink, textAlign: "center" }}>{sx("duelDone", { n: nf(res.score, lang), m: nf(res.total, lang) })}</Text>
      <GoldButton title={sx("duels")} onPress={() => router.back()} />
    </Tile>
  );
  if (!qs) return msg ? <Msg text={msg} /> : <Loading />;
  const q = qs[i];
  const pick = (k: string) => {
    const next = [...ans, k];
    setAns(next);
    if (next.length < qs.length) setI(i + 1);
    else void SOC.duelAction(id, { action: "answer", answers: next }).then((r) => setRes({ score: r.score ?? 0, total: r.total ?? qs.length })).catch((e) => setMsg(err(e)));
  };
  return (
    <>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{sx("duelQn", { n: nf(i + 1, lang), m: nf(qs.length, lang) })}</Text>
      <Stage rounded={22}>
        <View style={{ padding: 22, gap: 10 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.4, color: stage.gold, textTransform: "uppercase" }}>{sx("duelQ")}</Text>
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 46, color: stage.text, textAlign: "right", writingDirection: "rtl" }}>{q.text}</Text>
        </View>
      </Stage>
      {q.options.map((o) => <GlassButton key={o} title={keyLabel(o, lang)} onPress={() => pick(o)} />)}
      <Msg text={msg} />
    </>
  );
}

// ---------- teacher classes ----------
function ClassView({ id }: { id: string }) {
  const sx = useSx();
  const err = useErr();
  const t = useTheme();
  const { lang } = useLang();
  const [c, setC] = useState<SClass | null>(null);
  const [post, setPost] = useState("");
  const [msg, setMsg] = useState("");
  const load = useCallback(() => { SOC.sclass(id).then((r) => setC(r.class)).catch((e) => setMsg(err(e))); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(load, [load]);
  if (!c) return msg ? <Msg text={msg} /> : <Loading />;
  const act = (b: Parameters<typeof SOC.classAction>[1]) => SOC.classAction(id, b).then((r) => { setMsg(""); if ((r as SClass).id) setC(r as SClass); else router.back(); }).catch((e) => setMsg(err(e)));
  return (
    <>
      <View style={{ gap: 6 }}>
        <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{c.name}</Text>
        {c.teacher ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{sx("teacher", { u: c.teacher.name })}</Text> : null}
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{sx("target")}: {nf(c.target, lang)} {sx(`tk_${c.targetKind}` as SocialKey)}</Text>
        {c.code ? <Text selectable style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{sx("code", { code: c.code })}</Text> : null}
      </View>
      <Msg text={msg} />
      <Section title={sx("announce")} icon="note">
        {c.teaching ? (
          <Tile>
            <Field value={post} onChange={setPost} label={sx("announcePh")} multiline />
            <GoldButton title={sx("post")} disabled={post.trim().length < 2} onPress={() => void act({ action: "post", body: post }).then(() => setPost(""))} />
          </Tile>
        ) : null}
        {c.posts.map((p) => (
          <Tile key={p.id} gap={8}>
            <Body>{p.body}</Body>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{new Date(p.at).toLocaleDateString(lang)}{p.review ? ` · ${sx("inReview")}` : ""}</Text>
              {c.teaching ? <Chip label={sx("remove")} onPress={() => void act({ action: "unpost", postId: p.id })} small />
                : <Chip label={sx("report")} icon="flag" onPress={() => confirmReport(sx, () => SOC.classAction(id, { action: "report", postId: p.id, category: "other" }))} small />}
            </View>
          </Tile>
        ))}
      </Section>
      <Section title={sx("members", { n: nf(c.memberCount, lang) })}>
        <List>{c.members.map((m, i) => (
          <MemberRow key={m.username} c={m} first={i === 0} highlight={m.me}
            sub={`${sx("progressOf", { n: nf(m.progress, lang), m: nf(c.target, lang) })}${m.reached ? ` · ${sx("reached")}` : ""}`}
            right={c.teaching ? <Pressable accessibilityRole="button" accessibilityLabel={sx("remove")} hitSlop={10} onPress={() => memberMenu(sx, m.username, () => void act({ action: "remove", username: m.username }))}><Icon name="menu" color={t.muted} size={18} /></Pressable> : null} />
        ))}</List>
      </Section>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {c.teaching ? (
          <>
            <GlassButton title={sx("newCode")} compact onPress={() => void act({ action: "newCode" })} />
            <GlassButton title={sx("deleteClass")} compact onPress={() => Alert.alert(sx("deleteClass"), "", [{ text: sx("cancel"), style: "cancel" }, { text: sx("deleteClass"), style: "destructive", onPress: () => void act({ action: "delete" }) }])} />
          </>
        ) : (
          <>
            <GlassButton title={sx("leave")} compact onPress={() => void act({ action: "leave" })} />
            <GlassButton title={sx("report")} compact icon="flag" onPress={() => confirmReport(sx, () => SOC.classAction(id, { action: "report", category: "other" }))} />
            {c.teacher ? <GlassButton title={sx("block")} compact onPress={() => memberMenu(sx, c.teacher!.username)} /> : null}
          </>
        )}
      </View>
    </>
  );
}

// ---------- network ----------
function NetworkSection() {
  const sx = useSx();
  const t = useTheme();
  const { lang } = useLang();
  const [n, setN] = useState<Network | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const load = useCallback(() => { SOC.network().then(setN).catch(() => undefined); }, []);
  useFocusEffect(load);
  if (!n) return null;
  const save = (b: { suggest?: boolean; views?: boolean }) => void SOC.saveSettings(b).then(load).catch(() => undefined);
  return (
    <Section title={sx("network")} icon="user" action={n.username ? sx("myProfile") : undefined} onAction={() => n.username && go("profile", n.username)}>
      <Body muted size={14}>{sx("networkLead")}</Body>
      {n.incoming ? (
        <GlassCard onPress={() => router.push("/talents/requests" as Href)} accessibilityLabel={sx("requestsN", { n: n.incoming })}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{sx("requestsN", { n: nf(n.incoming, lang) })}</Text>
        </GlassCard>
      ) : null}
      {n.views !== null ? <Tile><Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{sx("viewsN", { n: nf(n.views, lang) })}</Text></Tile> : null}
      <Consent text={sx("suggestShare")} on={n.settings.suggest} onChange={(v) => save({ suggest: v })} />
      <Consent text={sx("viewsShare")} on={n.settings.views} onChange={(v) => save({ views: v })} />
      {n.suggestions.length ? (
        <>
          <Label>{sx("pymk")}</Label>
          <List>{n.suggestions.map((p, i) => (
            <MemberRow key={p.username} c={p} first={i === 0} sub={sx(`rs_${p.reason}` as SocialKey)}
              right={sent.has(p.username) ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{sx("sent")}</Text>
                : <Chip label={sx("connect")} onPress={() => void TalentApi.connect(p.username).then(() => setSent((x) => new Set(x).add(p.username))).catch(() => undefined)} small />} />
          ))}</List>
        </>
      ) : null}
    </Section>
  );
}
const SKILLS: Skill[] = ["tajweed", "hifz", "makharij"];
function ProfileView({ username }: { username: string }) {
  const sx = useSx();
  const err = useErr();
  const t = useTheme();
  const { lang } = useLang();
  const [p, setP] = useState<NetProfile | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    SOC.profile(username).then((r) => { setP(r.profile); if (!r.profile.own) void SOC.view(username).catch(() => undefined); }).catch((e) => setMsg(err(e)));
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!p) return msg ? <Msg text={msg} /> : <Loading />;
  const label = (s: Skill, ref: number) => (s === "surah" ? sx("sk_surah", { s: surahLabel(ref, lang) }) : sx(`sk_${s}` as SocialKey));
  const toggle = (s: Skill, on: boolean, ref?: number) => void SOC.endorse(username, s, on, ref).then((r) => setP(r.profile)).catch((e) => setMsg(err(e)));
  const shown = new Set(p.endorsements.map((e) => `${e.skill}:${e.ref}`));
  return (
    <>
      <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }}>@{username}</Text>
      <Msg text={msg} />
      {p.views !== null ? <Tile><Text style={{ fontFamily: FONT.semibold, color: t.ink }}>{sx("viewsN", { n: nf(p.views, lang) })}</Text></Tile> : null}
      <Section title={sx("endorsements")} icon="checkCircle">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {p.endorsements.map((e) => (
            <Chip key={`${e.skill}:${e.ref}`} label={`${label(e.skill, e.ref)} ${nf(e.count, lang)}`} selected={e.mine}
              onPress={() => (p.canEndorse ? toggle(e.skill, !e.mine, e.ref || undefined) : undefined)} disabled={!p.canEndorse} small />
          ))}
          {p.canEndorse ? SKILLS.filter((s) => !shown.has(`${s}:0`)).map((s) => <Chip key={s} label={`${sx("endorse")}: ${label(s, 0)}`} onPress={() => toggle(s, true)} small />) : null}
        </View>
      </Section>
      <Section title={sx("activity")} icon="starBig">
        {p.khatms ? <Body>{sx("khatmsN", { n: nf(p.khatms, lang) })}</Body> : null}
        {p.activity.length ? p.activity.map((a, i) => (
          <Body key={i} muted>{sx(`ev_${a.kind}` as SocialKey, { u: `@${username}`, s: a.kind === "surah" ? surahLabel(Number(a.ref), lang) : "" })}</Body>
        )) : <Body muted>{sx("feedEmpty")}</Body>}
      </Section>
      {!p.own ? <GlassButton title={sx("block")} compact onPress={() => memberMenu(sx, username)} /> : null}
    </>
  );
}
