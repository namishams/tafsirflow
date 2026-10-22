import { useEffect, useState } from "react";
import { Alert, Pressable, Share, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { GoldButton, GoldProgress, OutlineButton, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { usePro } from "@/lib/pro";
import { syncSijill } from "@/features/sijill/summary";
import { BadgeSheetHost } from "@/features/talents/badges";
import { SafetyBar } from "@/features/talents/ui";
import type { TalentCard } from "@/features/talents/api";
import { TG, type Circle } from "@/features/together/api";
import { demoOn } from "@/features/together/sample";
import { useTg, type TgKey } from "@/features/together/text";
import { Body, InviteSheet, MemberRow, NudgeSheet, ReportCircleSheet, Section, Tile, TogetherGate, nf, useTgErr, useTogetherAccess } from "@/features/together/ui";

// /together/circles/<id> – one study circle: this week's shared goal and the group streak, the progress board (week
// XP, learning days, new verses, today, streak), gentle preset reminders, the invite code, join requests (leader),
// a shared learning session, leave, report. No chat. Blocked members are hidden by the server.
export default function TogetherCircle() {
  const t = useTheme();
  const tg = useTg();
  const err = useTgErr();
  const { lang } = useLang();
  const { pro } = usePro();
  const a = useTogetherAccess();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [c, setC] = useState<Circle | null>(null);
  const [msg, setMsg] = useState("");
  const [nudge, setNudge] = useState<TalentCard | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [invite, setInvite] = useState(false);
  const ready = demoOn() || (a.state === "ok" && !!a.age?.interact && !!a.me?.profile);
  const load = async () => {
    if (!demoOn()) await syncSijill(pro).catch(() => false);
    try { setC((await TG.circle(String(id))).circle); } catch (e) { setMsg(err(e)); }
  };
  useEffect(() => { if (ready && id) void load(); }, [ready, id]); // eslint-disable-line react-hooks/exhaustive-deps
  const act = async (fn: () => Promise<unknown>) => { setMsg(""); try { await fn(); await load(); } catch (e) { setMsg(err(e)); } };
  const confirm = (text: string, ok: string, fn: () => Promise<unknown>, after?: () => void) =>
    Alert.alert(text, undefined, [{ text: tg("cancel"), style: "cancel" }, { text: ok, style: "destructive", onPress: () => void fn().then(after).catch((e) => setMsg(err(e))) }]);
  const goalLine = c ? tg(`goalN_${c.goalKind}` as TgKey, { n: nf(c.goal, lang) }) : "";
  const share = () => c?.code && Share.share({ message: tg("codeShareText", { t: c.name, code: c.code }) }).catch(() => undefined);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
        <Page>
          <PageHero back topInset eyebrow={c ? tg(`kind_${c.kind}` as TgKey) : tg("circles")} title={c?.name ?? tg("circles")} lead={c && c.status === "member" ? tg("membersN", { n: c.members.length }) : undefined} />
          <TogetherGate a={a}>
            <View style={{ padding: 16, gap: 22 }}>
              {msg ? <Body muted>{msg}</Body> : null}
              {!c ? <Loading /> : c.suspended ? <Tile><Body>{tg("suspended")}</Body></Tile> : c.status === "pending" ? (
                <Tile><Body>{tg("pendingSelf")}</Body></Tile>
              ) : (
                <>
                  <Stage rounded={R.card}>
                    <View style={{ padding: 18, gap: 10 }}>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, letterSpacing: 1.2, color: stage.gold }}>{tg("weekGoal")}</Text>
                      <Text style={{ fontFamily: FONT.display, fontSize: 22, color: "#fff" }}>{`${nf(c.progress, lang)} / ${goalLine}`}</Text>
                      <GoldProgress value={c.goal ? c.progress / c.goal : 0} track="rgba(255,255,255,0.18)" />
                      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: "rgba(255,255,255,0.78)" }}>{tg(`goal_${c.goalKind}` as TgKey)}</Text>
                      {c.reached ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: stage.cream }}>{tg("goalReached")}</Text> : null}
                      {c.streak ? (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Icon name="flame" color={stage.gold} size={16} />
                          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.gold }}>{tg("groupStreak", { n: c.streak })}</Text>
                        </View>
                      ) : null}
                    </View>
                  </Stage>

                  <Section title={tg("members")} icon="user">
                    <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
                      {c.members.map((m, i) => (
                        <MemberRow key={m.username} c={m.me ? { ...m, name: `${m.name} (${tg("you")})` } : m} first={i === 0} highlight={m.me}
                          sub={[m.role === "leader" ? tg("leader") : null, m.today ? tg("learnedToday") : tg("notYet"), m.streak >= 2 ? tg("streakDays", { n: m.streak }) : null,
                            tg("weekShort", { x: nf(m.week.xp, lang), d: m.week.days }), m.week.verses ? tg("versesN", { n: m.week.verses }) : null].filter(Boolean).join(" · ")}
                          right={m.canNudge ? (
                            <Pressable onPress={() => setNudge(m)} accessibilityRole="button" accessibilityLabel={`${tg("nudge")}, ${m.name}`}
                              style={{ minHeight: 36, paddingHorizontal: 12, borderRadius: R.pill, borderWidth: 1, borderColor: goldButton.line, justifyContent: "center" }}>
                              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{tg("nudge")}</Text>
                            </Pressable>
                          ) : c.role === "leader" && !m.me ? (
                            <Pressable onPress={() => confirm(tg("remove"), tg("remove"), () => TG.member(c.id, "remove", m.username), () => void load())} accessibilityRole="button" accessibilityLabel={`${tg("remove")}, ${m.name}`} hitSlop={8}>
                              <Icon name="close" color={t.muted} size={16} />
                            </Pressable>
                          ) : null} />
                      ))}
                    </View>
                  </Section>

                  {c.role === "leader" && c.pending.length ? (
                    <Section title={tg("pendingN", { n: c.pending.length })} icon="hands">
                      {c.pending.map((p) => (
                        <Tile key={p.username} pad={0} gap={0}>
                          <MemberRow c={p} first />
                          <View style={{ flexDirection: "row", gap: 8, padding: 12 }}>
                            <GoldButton title={tg("approve")} compact onPress={() => void act(() => TG.member(c.id, "approve", p.username))} style={{ flex: 1 }} />
                            <OutlineButton title={tg("decline")} compact onPress={() => void act(() => TG.member(c.id, "decline", p.username))} style={{ flex: 1 }} />
                          </View>
                        </Tile>
                      ))}
                    </Section>
                  ) : null}

                  <Section title={tg("invites")} icon="calendar">
                    <Body muted>{tg("invitesLead")}</Body>
                    <OutlineButton title={tg("inviteNew")} compact onPress={() => setInvite(true)} />
                  </Section>

                  {c.code ? (
                    <Section title={tg("codeLabel")} icon="share">
                      <Tile>
                        <Text selectable style={{ fontFamily: FONT.bold, fontSize: 26, letterSpacing: 4, color: t.ink, textAlign: "center" }}>{c.code}</Text>
                        <GoldButton title={tg("codeShare")} icon="share" compact onPress={() => void share()} />
                        {c.role === "leader" ? <OutlineButton title={tg("newCode")} compact onPress={() => void act(() => TG.updateCircle(c.id, { newCode: true }))} /> : null}
                      </Tile>
                    </Section>
                  ) : null}

                  {c.history.length > 1 ? (
                    <Section title={tg("history")} icon="list">
                      <View style={{ flexDirection: "row", gap: 6, alignItems: "flex-end", height: 70 }}>
                        {[...c.history].reverse().map((h) => (
                          <View key={h.week} accessible accessibilityLabel={tg("progressOf", { n: h.progress, m: h.goal })} style={{ flex: 1, height: `${Math.max(8, Math.min(100, (h.progress / Math.max(1, h.goal)) * 100))}%`, borderRadius: 4, backgroundColor: h.reached ? goldButton.to : t.line }} />
                        ))}
                      </View>
                    </Section>
                  ) : null}

                  <View style={{ gap: 8 }}>
                    <OutlineButton title={tg("leave")} compact onPress={() => confirm(tg("confirmLeave"), tg("leave"), () => TG.member(c.id, "leave"), () => router.replace("/together/circles" as Href))} />
                    {c.role === "leader" ? <OutlineButton title={tg("deleteCircle")} compact onPress={() => confirm(tg("confirmDelete"), tg("deleteCircle"), () => TG.deleteCircle(c.id), () => router.replace("/together/circles" as Href))} /> : null}
                  </View>
                </>
              )}
              <Body muted size={13}>{tg("safety")}</Body>
              <SafetyBar onReport={c ? () => setReport(c.id) : undefined} />
            </View>
          </TogetherGate>
        </Page>
      </BadgeSheetHost>
      <NudgeSheet target={nudge} circleId={c?.id} onClose={() => setNudge(null)} onSent={() => setC((x) => x && { ...x, members: x.members.map((m) => (m.username === nudge?.username ? { ...m, canNudge: false } : m)) })} />
      <ReportCircleSheet circleId={report} onClose={() => setReport(null)} />
      <InviteSheet visible={invite} onClose={() => setInvite(false)} onDone={() => undefined} circles={c ? [{ id: c.id, name: c.name }] : []} toCircle />
    </>
  );
}
