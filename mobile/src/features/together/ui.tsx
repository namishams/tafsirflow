import { useCallback, useEffect, useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { Icon, type IconName } from "@/components/icons";
import { Chip, GoldButton, GoldProgress, OutlineButton, Stage } from "@/components/brand";
import { Loading } from "@/components/page";
import { FormError } from "@/components/form";
import { useLang } from "@/i18n";
import { countryName } from "@/lib/countries";
import { savedChapters } from "@/lib/quran";
import { BadgeButton } from "@/features/talents/badges";
import type { TalentCard } from "@/features/talents/api";
import { AccessGate, TalentAvatar, useTalentAccess, type Access } from "@/features/talents/ui";
import { ApiError } from "@/lib/api";
import { TG, NUDGE_KINDS, type Challenge, type Community, type FriendsToday, type Invite, type NudgeKind, type ReportCategory, type Topic, type BestRow } from "./api";
import { demoOn } from "./sample";
import { useTg, type TgKey } from "./text";

// Building blocks of "Together" in the Masterclass design (white tiles, gold progress, emerald stage cards). Screens
// live in src/app/together/*. Compact cards for other screens (profile, account) are exported at the end:
// TogetherEntryCard, FriendsTodayCard, LeagueBadge, CommunityGoalCard.

export const nf = (n: number, lang: string) => { try { return n.toLocaleString(lang); } catch { return String(n); } };
export const surahLabel = (n: number, lang: string) => {
  const c = savedChapters(lang)?.chapters.find((x) => x.id === n);
  return c ? `${n} ${c.name_simple}` : String(n);
};

export function useTgErr() {
  const tg = useTg();
  return (e: unknown) => {
    const code = e instanceof ApiError ? e.code : "generic";
    const k = `e_${code}` as TgKey;
    const s = tg(k);
    return s && s !== k ? s : tg("e_generic");
  };
}

/** sign-in, age and profile gate of the Together screens (16+ with a community profile); demo mode passes */
export function TogetherGate({ a, children }: { a: Access; children: ReactNode }) {
  const t = useTheme();
  const tg = useTg();
  if (demoOn()) return <>{children}</>;
  return (
    <AccessGate a={a}>
      {!a.age?.interact ? (
        <View style={{ padding: 20 }}><Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{tg("age16")}</Text></View>
      ) : !a.me?.profile ? (
        <View style={{ padding: 20, gap: 14 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{tg("needProfile")}</Text>
          <GoldButton title={tg("createProfile")} onPress={() => router.push("/talents/settings" as Href)} />
        </View>
      ) : children}
    </AccessGate>
  );
}
export const useTogetherAccess = useTalentAccess;

/** a titled white tile with an optional action on the right */
export function Section({ title, action, onAction, children, icon }: { title: string; action?: string; onAction?: () => void; children: ReactNode; icon?: IconName }) {
  const t = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {icon ? <Icon name={icon} color={t.gold} size={17} /> : null}
        <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 19, color: t.ink }}>{title}</Text>
        {action && onAction ? (
          <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8} style={{ minHeight: 40, justifyContent: "center" }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function Tile({ children, pad = 16, gap = 12 }: { children: ReactNode; pad?: number; gap?: number }) {
  const t = useTheme();
  return <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: pad, gap }}>{children}</View>;
}

export function Body({ children, muted, center, size = 15 }: { children: ReactNode; muted?: boolean; center?: boolean; size?: number }) {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.regular, fontSize: size, lineHeight: size * 1.45, color: muted ? t.muted : t.ink, textAlign: center ? "center" : "left" }}>{children}</Text>;
}

/** small avatar with the member's name under it; a gold check when they learned today */
function Face({ c, done, size = 46 }: { c: TalentCard; done?: boolean; size?: number }) {
  const t = useTheme();
  return (
    <View style={{ width: size + 18, alignItems: "center", gap: 4 }}>
      <View>
        <TalentAvatar name={c.name} size={size} uri={c.avatar} badge={c.badge} />
        {done ? (
          <View style={{ position: "absolute", end: -2, bottom: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: goldButton.to, borderWidth: 2, borderColor: t.surface, alignItems: "center", justifyContent: "center" }}>
            <Icon name="check" color={goldButton.text} size={10} weight={3} />
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: done ? t.ink : t.muted }}>{c.name.split(" ")[0]}</Text>
    </View>
  );
}

/** "Today 5 of your 8 friends learned" with faces; `full` adds every friend as a row */
export function FriendsTodayCard({ data, full, onOpen }: { data: FriendsToday; full?: boolean; onOpen?: () => void }) {
  const t = useTheme();
  const tg = useTg();
  const { lang } = useLang();
  const any = data.sharing > 0;
  const head = any ? tg("friendsTodayLine", { n: nf(data.learnedToday, lang), m: nf(data.sharing, lang) }) : tg("friendsToday");
  return (
    <Pressable onPress={onOpen} disabled={!onOpen} accessibilityRole={onOpen ? "button" : undefined} accessibilityLabel={head}>
      <Stage rounded={R.card}>
        <View style={{ padding: 18, gap: 12 }}>
          <Text style={{ fontFamily: FONT.display, fontSize: 21, lineHeight: 28, color: "#fff" }}>{head}</Text>
          {any ? (
            <>
              <GoldProgress value={data.sharing ? data.learnedToday / data.sharing : 0} track="rgba(255,255,255,0.18)" />
              {data.keptStreak ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Icon name="flame" color={stage.gold} size={15} />
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: stage.gold }}>{tg("keptStreak", { n: nf(data.keptStreak, lang) })}</Text>
                </View>
              ) : null}
              {data.learnedToday === 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.78)" }}>{tg("friendsTodayNone")}</Text> : null}
            </>
          ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.78)" }}>{tg("noFriends")}</Text>}
        </View>
      </Stage>
      {any && !full ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingTop: 12 }}>
          {data.list.slice(0, 12).map((f) => <Face key={f.username} c={f} done={f.today} />)}
        </ScrollView>
      ) : null}
      {any && full ? (
        <View style={{ marginTop: 12, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
          {data.list.map((f, i) => (
            <MemberRow key={f.username} c={f} first={i === 0}
              sub={f.today ? (f.streak >= 2 ? `${tg("learnedToday")} · ${tg("streakDays", { n: nf(f.streak, lang) })}` : tg("learnedToday")) : tg("notYet")}
              right={f.today ? <Icon name="checkCircle" color={t.accent} size={20} /> : null} />
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

/** a member row: avatar, name with badge, a line under it, something on the right */
export function MemberRow({ c, sub, right, first, highlight }: { c: TalentCard; sub?: string; right?: ReactNode; first?: boolean; highlight?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => !demoOn() && router.push(`/talents/u/${c.username}` as Href)} accessibilityRole="button" accessibilityLabel={`${c.name}${sub ? `, ${sub}` : ""}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10, minHeight: 60,
        backgroundColor: highlight ? "rgba(201,166,94,0.12)" : pressed ? t.bg : t.surface, borderTopWidth: first ? 0 : 1, borderTopColor: t.line })}>
      <TalentAvatar name={c.name} size={40} uri={c.avatar} badge={c.badge} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{c.name}</Text>
          <BadgeButton badge={c.badge ?? null} size={14} />
        </View>
        {sub ? <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: t.muted }}>{sub}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}

/** the tier name with "Level n of 6" */
export function LeagueBadge({ tier, onStage }: { tier: number; onStage?: boolean }) {
  const t = useTheme();
  const tg = useTg();
  return (
    <View accessible accessibilityLabel={`${tg(`tier_${tier}` as TgKey)}, ${tg("tierN", { n: tier })}`} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ flexDirection: "row", gap: 3 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={{ width: 7, height: 7 + i * 2, borderRadius: 2, alignSelf: "flex-end", backgroundColor: i <= tier ? goldButton.to : onStage ? "rgba(255,255,255,0.2)" : t.line }} />
        ))}
      </View>
      <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: onStage ? "#fff" : t.ink }}>{tg(`tier_${tier}` as TgKey)}</Text>
    </View>
  );
}

/** a progress line with "n of m" */
export function Progress({ value, max, label }: { value: number; max: number; label?: string }) {
  const t = useTheme();
  const tg = useTg();
  const { lang } = useLang();
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {label ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{label}</Text> : <View />}
        <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.ink }}>{tg("progressOf", { n: nf(value, lang), m: nf(max, lang) })}</Text>
      </View>
      <GoldProgress value={max ? value / max : 0} />
    </View>
  );
}

// ---------- challenges and invitations ----------
export function useChallengeTitle() {
  const tg = useTg();
  const { lang } = useLang();
  return (c: Pick<Challenge, "kind" | "target">) =>
    c.kind === "surah" ? tg("chTitle_surah", { s: surahLabel(c.target, lang) }) : c.kind === "verses" ? tg("chTitle_verses", { n: c.target }) : tg("chTitle_streak", { n: c.target });
}

export function ChallengeCard({ c, onChange }: { c: Challenge; onChange: () => void }) {
  const t = useTheme();
  const tg = useTg();
  const err = useTgErr();
  const title = useChallengeTitle();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const act = async (a: "accept" | "decline" | "cancel") => {
    setBusy(true); setMsg("");
    try { await TG.answerChallenge(c.id, a); onChange(); } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  const status = c.status === "pending" ? (c.fromMe ? tg("chOut", { u: c.other.name }) : tg("chIn", { u: c.other.name }))
    : c.status === "active" ? tg("inDays", { n: c.days }) : tg(`ch_${c.status}` as TgKey);
  return (
    <Tile>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgb(8,38,29)", borderWidth: 1.5, borderColor: goldButton.line, alignItems: "center", justifyContent: "center" }}>
          <Icon name={c.kind === "streak" ? "flame" : c.kind === "surah" ? "book" : "starBig"} color={goldButton.from} size={16} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink }}>{title(c)}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{status}</Text>
        </View>
      </View>
      {c.status === "active" || c.status === "ended" ? (
        <View style={{ gap: 10 }}>
          <Progress value={c.mine} max={c.goal} label={tg("you")} />
          <Progress value={c.theirs} max={c.goal} label={c.other.name} />
          {c.mineDone && c.theirsDone ? <Body>{tg("bothDone")}</Body> : c.mineDone ? <Body>{tg("youDone")}</Body> : null}
        </View>
      ) : null}
      {c.status === "pending" && !c.fromMe ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <GoldButton title={tg("accept")} onPress={() => void act("accept")} busy={busy} compact style={{ flex: 1 }} />
          <OutlineButton title={tg("decline")} onPress={() => void act("decline")} disabled={busy} compact style={{ flex: 1 }} />
        </View>
      ) : c.status === "pending" || c.status === "active" ? (
        <Pressable onPress={() => void act("cancel")} disabled={busy} accessibilityRole="button" style={{ minHeight: 36, justifyContent: "center", alignSelf: "flex-start" }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.muted }}>{tg("cancel")}</Text>
        </Pressable>
      ) : null}
      {msg ? <Body muted size={13}>{msg}</Body> : null}
    </Tile>
  );
}

export function InviteCard({ i, onChange }: { i: Invite; onChange: () => void }) {
  const t = useTheme();
  const tg = useTg();
  const err = useTgErr();
  const { lang } = useLang();
  const [msg, setMsg] = useState("");
  const what = i.topic === "surah" && i.surah ? tg("topicSurah", { s: surahLabel(i.surah, lang) }) : tg(`topic_${i.topic}` as TgKey);
  const when = new Date(i.at).toLocaleString(lang, { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const answer = async (b: { answer?: "yes" | "no"; cancel?: true }) => {
    setMsg("");
    try {
      await TG.answerInvite(i.id, b);
      if (b.answer === "yes") await scheduleInviteReminder(i, tg("notifInvite"), what);
      onChange();
    } catch (e) { setMsg(err(e)); }
  };
  return (
    <Tile gap={10}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Icon name="calendar" color={t.gold} size={20} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink }}>{what}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{when}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>
            {[i.mine ? null : i.from ? tg("inviteFrom", { u: i.from.name }) : null, i.circle ? tg("inviteCircle", { t: i.circle.name }) : i.mine && i.to ? i.to.name : null, i.yes ? tg("joining", { n: i.yes }) : null].filter(Boolean).join(" · ")}
          </Text>
        </View>
      </View>
      {i.mine ? (
        <Pressable onPress={() => void answer({ cancel: true })} accessibilityRole="button" style={{ minHeight: 36, justifyContent: "center", alignSelf: "flex-start" }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.muted }}>{tg("cancel")}</Text>
        </Pressable>
      ) : (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Chip label={tg("yes")} selected={i.myAnswer === "yes"} onPress={() => void answer({ answer: "yes" })} />
          <Chip label={tg("no")} selected={i.myAnswer === "no"} onPress={() => void answer({ answer: "no" })} />
        </View>
      )}
      {msg ? <Body muted size={13}>{msg}</Body> : null}
    </Tile>
  );
}

/** a local reminder 10 minutes before an accepted session (only with notification permission) */
async function scheduleInviteReminder(i: Invite, title: string, body: string) {
  try {
    const Notifications = await import("expo-notifications");
    const at = new Date(i.at).getTime() - 10 * 60_000;
    if (at < Date.now() + 60_000) return;
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    await Notifications.scheduleNotificationAsync({
      identifier: `qmc-together-${i.id}`,
      content: { title, body, data: { qmc: "together", url: "/together" } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at) },
    });
  } catch { /* not essential */ }
}

// ---------- sheets ----------
export function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const t = useTheme();
  const tg = useTg();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose} transparent={Platform.OS !== "ios"}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 14 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tg("cancel")} hitSlop={10} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
              <Icon name="close" color={t.muted} size={20} />
            </Pressable>
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Label({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, marginTop: 4 }}>{children}</Text>;
}

export function NumberField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const t = useTheme();
  return (
    <TextInput value={value} onChangeText={(v) => onChange(v.replace(/\D/g, "").slice(0, 6))} keyboardType="number-pad" accessibilityLabel={label}
      style={{ height: 48, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14, fontFamily: FONT.semibold, fontSize: 16, color: t.ink }} />
  );
}

/** the preset reminders (no free text) */
export function NudgeSheet({ target, circleId, onClose, onSent }: { target: TalentCard | null; circleId?: string; onClose: () => void; onSent?: () => void }) {
  const t = useTheme();
  const tg = useTg();
  const err = useTgErr();
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => { setMsg(""); setSent(false); }, [target]);
  const send = async (kind: NudgeKind) => {
    if (!target) return;
    setMsg("");
    try { await TG.nudge({ username: target.username, kind, circleId }); setSent(true); onSent?.(); } catch (e) { setMsg(err(e)); }
  };
  return (
    <Sheet visible={!!target} title={tg("nudgeTitle")} onClose={onClose}>
      {target ? <MemberRow c={target} first /> : null}
      {sent ? (
        <>
          <Body>{tg("nudgeSent")}</Body>
          <GoldButton title={tg("done")} onPress={onClose} />
        </>
      ) : (
        <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
          {NUDGE_KINDS.map((k, i) => (
            <Pressable key={k} onPress={() => void send(k)} accessibilityRole="button"
              style={({ pressed }) => ({ minHeight: 54, paddingHorizontal: 16, justifyContent: "center", borderTopWidth: i ? 1 : 0, borderTopColor: t.line, backgroundColor: pressed ? t.bg : t.surface })}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, color: t.ink }}>{tg(`nudge_${k}` as TgKey)}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <FormError text={msg} />
    </Sheet>
  );
}

/** friend picker for a feature (friends who switched it on) */
function FriendPicker({ feature, value, onChange }: { feature: "challenges" | "activity"; value: string; onChange: (u: string) => void }) {
  const tg = useTg();
  const [list, setList] = useState<TalentCard[] | null>(null);
  useEffect(() => { TG.friends(feature).then((d) => setList(d.friends)).catch(() => setList([])); }, [feature]);
  if (!list) return <Loading />;
  if (!list.length) return <Body muted>{tg("noFriendsFor")}</Body>;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {list.map((f) => <Chip key={f.username} label={f.name} selected={value === f.username} onPress={() => onChange(f.username)} />)}
    </View>
  );
}

export function ChallengeSheet({ visible, onClose, onDone, initial }: { visible: boolean; onClose: () => void; onDone: () => void; initial?: string }) {
  const tg = useTg();
  const err = useTgErr();
  const [who, setWho] = useState(initial ?? "");
  const [kind, setKind] = useState<Challenge["kind"]>("surah");
  const [target, setTarget] = useState("67");
  const [days, setDays] = useState("30");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => { if (visible) { setWho(initial ?? ""); setMsg(""); } }, [visible, initial]);
  const send = async () => {
    setBusy(true); setMsg("");
    try { await TG.challenge({ username: who, kind, target: Number(target), days: Number(days) }); onDone(); onClose(); } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  return (
    <Sheet visible={visible} title={tg("challengeNew")} onClose={onClose}>
      <Body muted>{tg("challengesLead")}</Body>
      <Label>{tg("chooseFriend")}</Label>
      <FriendPicker feature="challenges" value={who} onChange={setWho} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(["surah", "verses", "streak"] as const).map((k) => (
          <Chip key={k} label={tg(`ch_${k}` as TgKey)} selected={kind === k} onPress={() => { setKind(k); setTarget(k === "surah" ? "67" : k === "verses" ? "50" : "14"); setDays(k === "streak" ? "14" : "30"); }} />
        ))}
      </View>
      <Label>{kind === "surah" ? tg("surahNo") : tg("amount")}</Label>
      <NumberField value={target} onChange={setTarget} label={kind === "surah" ? tg("surahNo") : tg("amount")} />
      <Label>{tg("daysLabel")}</Label>
      <NumberField value={days} onChange={setDays} label={tg("daysLabel")} />
      <FormError text={msg} />
      <GoldButton title={tg("send")} onPress={send} busy={busy} disabled={!who || !target || !days || busy} />
    </Sheet>
  );
}

const TIMES = ["06:00", "13:00", "17:00", "20:00", "21:30"];
export function InviteSheet({ visible, onClose, onDone, circles, toCircle }: { visible: boolean; onClose: () => void; onDone: () => void; circles: { id: string; name: string }[]; toCircle?: boolean }) {
  const tg = useTg();
  const err = useTgErr();
  const { lang } = useLang();
  const [to, setTo] = useState<"friend" | "circle">("friend");
  const [who, setWho] = useState("");
  const [circle, setCircle] = useState(circles[0]?.id ?? "");
  const [topic, setTopic] = useState<Topic>("review");
  const [surah, setSurah] = useState("18");
  const [day, setDay] = useState(1);
  const [time, setTime] = useState("20:00");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => { if (visible) { setMsg(""); if (circles[0] && !circles.some((c) => c.id === circle)) setCircle(circles[0].id); if (toCircle && circles[0]) setTo("circle"); } }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps
  const dayLabel = (d: number) => d === 0 ? tg("day_today") : d === 1 ? tg("day_tomorrow") : new Date(Date.now() + d * 86_400_000).toLocaleDateString(lang, { weekday: "short", day: "numeric" });
  const send = async () => {
    setBusy(true); setMsg("");
    const [h, m] = time.split(":").map(Number);
    const at = new Date(); at.setDate(at.getDate() + day); at.setHours(h, m, 0, 0);
    try {
      await TG.invite({ ...(to === "friend" ? { username: who } : { circleId: circle }), topic, surah: topic === "surah" ? Number(surah) : undefined, at: at.toISOString() });
      onDone(); onClose();
    } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  return (
    <Sheet visible={visible} title={tg("inviteNew")} onClose={onClose}>
      <Body muted>{tg("invitesLead")}</Body>
      <Label>{tg("inviteTo")}</Label>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Chip label={tg("toFriend")} selected={to === "friend"} onPress={() => setTo("friend")} />
        {circles.length ? <Chip label={tg("toCircle")} selected={to === "circle"} onPress={() => setTo("circle")} /> : null}
      </View>
      {to === "friend" ? <FriendPicker feature="activity" value={who} onChange={setWho} /> : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {circles.map((c) => <Chip key={c.id} label={c.name} selected={circle === c.id} onPress={() => setCircle(c.id)} />)}
        </View>
      )}
      <Label>{tg("topic")}</Label>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(["surah", "review", "tafsir", "arabic", "tajweed"] as const).map((k) => <Chip key={k} label={tg(`topic_${k}` as TgKey)} selected={topic === k} onPress={() => setTopic(k)} />)}
      </View>
      {topic === "surah" ? <NumberField value={surah} onChange={setSurah} label={tg("surahNo")} /> : null}
      <Label>{tg("when")}</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {[0, 1, 2, 3, 4, 5, 6].map((d) => <Chip key={d} label={dayLabel(d)} selected={day === d} onPress={() => setDay(d)} />)}
      </ScrollView>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {TIMES.map((x) => <Chip key={x} label={x} selected={time === x} onPress={() => setTime(x)} />)}
      </View>
      <Body muted size={13}>{tg("reminderNote")}</Body>
      <FormError text={msg} />
      <GoldButton title={tg("send")} onPress={send} busy={busy} disabled={busy || (to === "friend" ? !who : !circle)} />
    </Sheet>
  );
}

/** report a circle: category and optional details */
export function ReportCircleSheet({ circleId, onClose }: { circleId: string | null; onClose: () => void }) {
  const t = useTheme();
  const tg = useTg();
  const err = useTgErr();
  const [cat, setCat] = useState<ReportCategory | null>(null);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => { setCat(null); setReason(""); setDone(false); setMsg(""); }, [circleId]);
  const send = async () => {
    if (!circleId || !cat) return;
    try { await TG.reportCircle(circleId, cat, reason.trim()); setDone(true); } catch (e) { setMsg(err(e)); }
  };
  return (
    <Sheet visible={!!circleId} title={tg("reportCircle")} onClose={onClose}>
      {done ? (<><Body>{tg("reported")}</Body><GoldButton title={tg("done")} onPress={onClose} /></>) : (
        <>
          <Label>{tg("reportTitle")}</Label>
          <View accessibilityRole="radiogroup" style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
            {(["spam", "harassment", "inappropriate", "impersonation", "minor_safety", "other"] as const).map((c, i) => (
              <Pressable key={c} onPress={() => setCat(c)} accessibilityRole="radio" accessibilityState={{ checked: cat === c }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50, paddingHorizontal: 14, borderTopWidth: i ? 1 : 0, borderTopColor: t.line }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: cat === c ? goldButton.line : t.line, alignItems: "center", justifyContent: "center" }}>
                  {cat === c ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: goldButton.to }} /> : null}
                </View>
                <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{tg(`cat_${c}` as TgKey)}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput value={reason} onChangeText={setReason} maxLength={300} multiline placeholder={tg("reportTitle")} placeholderTextColor={t.muted} accessibilityLabel={tg("reportTitle")}
            style={{ minHeight: 80, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 12, fontFamily: FONT.regular, fontSize: 15, color: t.ink, textAlignVertical: "top" }} />
          <FormError text={msg} />
          <GoldButton title={tg("send")} onPress={send} disabled={!cat} />
        </>
      )}
    </Sheet>
  );
}

// ---------- settings ----------
export function ToggleRow({ title, hint, value, onChange, first, disabled }: { title: string; hint?: string; value: boolean; onChange: (v: boolean) => void; first?: boolean; disabled?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, minHeight: 60, borderTopWidth: first ? 0 : 1, borderTopColor: t.line, opacity: disabled ? 0.5 : 1 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{title}</Text>
        {hint ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: t.muted }}>{hint}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} disabled={disabled} trackColor={{ true: t.accent }} accessibilityLabel={title} />
    </View>
  );
}

// ---------- community ----------
export function CommunityGoalCard({ data, onOpen }: { data: Community; onOpen?: () => void }) {
  const tg = useTg();
  const { lang } = useLang();
  const c = data.country;
  const main = c ?? { code: "", ...data.world };
  const head = c ? tg("countryLine", { c: countryName(c.code, lang), n: nf(c.verses, lang) }) : `${tg("worldMonth")}: ${tg("versesN", { n: nf(data.world.verses, lang) })}`;
  return (
    <Pressable onPress={onOpen} disabled={!onOpen} accessibilityRole={onOpen ? "button" : undefined} accessibilityLabel={head}>
      <Stage rounded={R.card}>
        <View style={{ padding: 18, gap: 10 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, letterSpacing: 1.2, color: stage.gold }}>{tg("community")}</Text>
          <Text style={{ fontFamily: FONT.display, fontSize: 21, lineHeight: 28, color: "#fff" }}>{head}</Text>
          <GoldProgress value={main.goal ? main.verses / main.goal : 0} track="rgba(255,255,255,0.18)" />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{tg("learnersN", { n: nf(main.learners, lang) })}</Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }}>{tg("nextGoal", { n: nf(main.goal, lang) })}</Text>
          </View>
          {c ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{`${tg("worldMonth")}: ${tg("versesN", { n: nf(data.world.verses, lang) })}`}</Text> : null}
        </View>
      </Stage>
    </Pressable>
  );
}

export function BestList({ rows }: { rows: BestRow[] }) {
  const t = useTheme();
  const tg = useTg();
  const { lang } = useLang();
  if (!rows.length) return <Body muted>{tg("noBest")}</Body>;
  return (
    <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
      {rows.map((r, i) => (
        <MemberRow key={r.username} c={r} first={i === 0} sub={[r.country ? countryName(r.country, lang) : null, tg("versesN", { n: nf(r.verses, lang) })].filter(Boolean).join(" · ")}
          right={<Text style={{ fontFamily: FONT.display, fontSize: 18, color: i < 3 ? t.gold : t.muted, minWidth: 24, textAlign: "right" }}>{nf(r.rank, lang)}</Text>} />
      ))}
    </View>
  );
}

// ---------- mountable cards for other screens ----------
/** compact entry for the profile or account screen: "Today 5 of your 8 friends learned" and the inbox count; opens
 *  /together. Renders nothing when signed out, under 16 or without a community profile. */
export function TogetherEntryCard() {
  const t = useTheme();
  const tg = useTg();
  const { lang } = useLang();
  const [d, setD] = useState<{ line: string; unread: number } | null>(null);
  const load = useCallback(() => {
    TG.pulse().then((p) => setD({
      line: p.friends.sharing ? tg("friendsTodayLine", { n: nf(p.friends.learnedToday, lang), m: nf(p.friends.sharing, lang) }) : tg("hubCardLine"),
      unread: p.inbox.unread,
    })).catch(() => setD(null));
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);
  if (!d) return null;
  return (
    <Pressable onPress={() => router.push("/together" as Href)} accessibilityRole="button" accessibilityLabel={`${tg("hubCard")}, ${d.line}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: goldButton.line, backgroundColor: pressed ? t.bg : t.surface })}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgb(8,38,29)", alignItems: "center", justifyContent: "center" }}>
        <Icon name="hands" color={goldButton.from} size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{tg("hubCard")}</Text>
        <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{d.line}</Text>
      </View>
      {d.unread ? <View style={{ minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: goldButton.to, alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: FONT.bold, fontSize: 12, color: goldButton.text }}>{d.unread}</Text></View> : null}
      <Icon name="chevronRight" color={t.muted} size={16} />
    </Pressable>
  );
}

/** the community goal card loading itself (for the Discover tab or the profile's statistics) */
export function CommunityGoalAuto() {
  const [d, setD] = useState<Community | null>(null);
  useEffect(() => { TG.community().then(setD).catch(() => setD(null)); }, []);
  return d ? <CommunityGoalCard data={d} onOpen={() => router.push("/together/community" as Href)} /> : null;
}
