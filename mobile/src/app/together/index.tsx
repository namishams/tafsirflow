import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { usePro } from "@/lib/pro";
import { syncSijill } from "@/features/sijill/summary";
import { sijillApi, type Moment } from "@/features/sijill/api";
import { MomentCard } from "@/features/sijill/Moments";
import { BadgeSheetHost } from "@/features/talents/badges";
import { SafetyBar } from "@/features/talents/ui";
import { TG, type Challenge, type Community, type Inbox, type Invite, type League, type Pulse } from "@/features/together/api";
import { demoMoments, demoOn, setDemo } from "@/features/together/sample";
import { SocialEntryCard } from "@/features/social/Entry";
import { useTg, type TgKey } from "@/features/together/text";
import {
  Body, ChallengeCard, ChallengeSheet, CommunityGoalCard, FriendsTodayCard, InviteCard, InviteSheet, LeagueBadge, MemberRow, Progress, Section, Tile, TogetherGate, nf, useTgErr, useTogetherAccess,
} from "@/features/together/ui";

// /together – "Gemeinsam lernen" (owner 22.10.2026): friends who learned today, the weekly friend league, study circles,
// challenges between two friends, learn-together sessions, the inbox of gentle reminders, celebrations of friends'
// achievements with MashaAllah and the community goals. Everything is opt-in (/together/settings), 16+ on both sides,
// no free text between members. Website: /[locale]/together (same endpoints, same texts).
export default function TogetherHub() {
  const t = useTheme();
  const tg = useTg();
  const err = useTgErr();
  const { lang } = useLang();
  const { pro } = usePro();
  const a = useTogetherAccess();
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  if (__DEV__ && demo === "1") setDemo(true);
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [chal, setChal] = useState<Challenge[]>([]);
  const [inv, setInv] = useState<Invite[]>([]);
  const [box, setBox] = useState<Inbox | null>(null);
  const [comm, setComm] = useState<Community | null>(null);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [msg, setMsg] = useState("");
  const [full, setFull] = useState(false);
  const [sheet, setSheet] = useState<"challenge" | "invite" | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const ready = demoOn() || (a.state === "ok" && !!a.age?.interact && !!a.me?.profile);

  const load = useCallback(async () => {
    setMsg("");
    if (!demoOn()) await syncSijill(pro).catch(() => false);
    try {
      const p = await TG.pulse();
      setPulse(p);
      const [l, c, i, b, cm] = await Promise.all([
        p.settings.league ? TG.league().catch(() => null) : Promise.resolve(null),
        TG.challenges().then((d) => d.challenges).catch(() => []),
        TG.invites().then((d) => d.invites).catch(() => []),
        TG.inbox().catch(() => null),
        TG.community().catch(() => null),
      ]);
      setLeague(l); setChal(c); setInv(i); setBox(b); setComm(cm);
      if (b?.nudges.some((n) => !n.read)) void TG.readInbox().catch(() => undefined);
      if (demoOn()) setMoments(demoMoments.map((m) => ({ ...m, kind: m.kind as Moment["kind"], at: new Date().toISOString(), title: null, mine: null, own: false, counts: { like: 2, mashallah: m.total - 2, barakallah: 0, barik: 0 }, author: { ...m.author, badge: null, avatar: null } })));
      else setMoments(await sijillApi.moments({ scope: "friends", locale: lang }).then((d) => d.moments.filter((m) => !m.own).slice(0, 3)).catch(() => []));
    } catch (e) { setMsg(err(e)); }
  }, [pro, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) void load(); }, [ready, load]);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const s = pulse?.settings;
  const enable = async (patch: Parameters<typeof TG.saveSettings>[0]) => { try { await TG.saveSettings(patch); await load(); } catch (e) { setMsg(err(e)); } };
  const me = league?.rows?.find((r) => r.me);
  const openChal = chal.filter((c) => !(c.status === "pending" && !c.fromMe));
  const openInv = inv.filter((i) => i.mine || i.myAnswer);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
        <Page refreshControl={ready ? <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={t.accent} /> : undefined}>
          <PageHero back topInset eyebrow={tg("eyebrow")} title={tg("title")} lead={tg("lead")}>
            <OutlineButton title={tg("settingsBtn")} icon="settings" onStage compact onPress={() => router.push("/together/settings" as Href)} style={{ alignSelf: "flex-start" }} />
          </PageHero>
          <TogetherGate a={a}>
            <View style={{ padding: 16, gap: 26 }}>
              {demoOn() ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted, textAlign: "center" }}>{tg("demo")}</Text> : null}
              {msg ? <Body muted>{msg}</Body> : null}

              {/* inbox: reminders, challenges and invitations waiting for an answer, join requests */}
              {box && (box.nudges.length || box.challenges.length || box.invites.length || box.joinRequests) ? (
                <Section title={tg("inbox")} icon="hands">
                  {box.nudges.slice(0, 3).map((n) => (
                    <Tile key={n.id} pad={0} gap={0}>
                      <MemberRow c={n.from} first sub={`${tg(`nudge_${n.kind}` as TgKey)}${n.circle ? ` · ${n.circle.name}` : ""}`}
                        right={!n.read ? <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: goldButton.to }} /> : null} />
                    </Tile>
                  ))}
                  {box.challenges.map((c) => <ChallengeCard key={c.id} c={c} onChange={() => void load()} />)}
                  {box.invites.map((i) => <InviteCard key={i.id} i={i} onChange={() => void load()} />)}
                  {box.joinRequests ? (
                    <Pressable onPress={() => router.push("/together/circles" as Href)} accessibilityRole="button">
                      <Tile><Body>{tg("joinRequestsN", { n: box.joinRequests })}</Body></Tile>
                    </Pressable>
                  ) : null}
                </Section>
              ) : null}

              {!demoOn() ? <SocialEntryCard /> : null}

              {/* friends today */}
              {pulse ? (
                <Section title={tg("friendsToday")} icon="user" action={pulse.friends.sharing ? tg(full ? "done" : "seeAll") : undefined} onAction={() => setFull((f) => !f)}>
                  <FriendsTodayCard data={pulse.friends} full={full} />
                  {!s?.activity ? (
                    <Tile>
                      <Body>{tg("shareActivityAsk")}</Body>
                      <GoldButton title={tg("shareActivity")} compact onPress={() => void enable({ activity: true })} />
                    </Tile>
                  ) : null}
                  {!pulse.friends.sharing ? <OutlineButton title={tg("findFriends")} compact onPress={() => router.push("/talents/buddies" as Href)} /> : null}
                </Section>
              ) : null}

              {/* weekly league */}
              {pulse ? (
                <Section title={tg("league")} icon="trophy" action={s?.league ? tg("open") : undefined} onAction={() => router.push("/together/league" as Href)}>
                  {s?.league && league?.enabled ? (
                    <Pressable onPress={() => router.push("/together/league" as Href)} accessibilityRole="button" accessibilityLabel={tg("league")}>
                      <Tile>
                        <LeagueBadge tier={league.tier ?? 1} />
                        {me ? <Body>{`${tg("youRank", { n: me.rank, m: league.rows?.length ?? 1 })} · ${tg("xpN", { n: nf(me.xp, lang) })}`}</Body> : null}
                        <Body muted size={13}>{league.daysLeft === 1 ? tg("daysLeftOne") : tg("daysLeft", { n: league.daysLeft ?? 7 })}</Body>
                      </Tile>
                    </Pressable>
                  ) : (
                    <Tile>
                      <Body>{tg("leagueOff")}</Body>
                      <GoldButton title={tg("leagueJoin")} compact onPress={() => void enable({ league: true })} />
                    </Tile>
                  )}
                </Section>
              ) : null}

              {/* circles */}
              {pulse ? (
                <Section title={tg("circles")} icon="mosque" action={tg("seeAll")} onAction={() => router.push("/together/circles" as Href)}>
                  {pulse.circles.length ? pulse.circles.map((c) => (
                    <Pressable key={c.id} onPress={() => router.push(`/together/circles/${c.id}` as Href)} accessibilityRole="button" accessibilityLabel={c.name}>
                      <Tile>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{c.name}</Text>
                            <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>
                              {[tg(`kind_${c.kind}` as TgKey), tg("membersN", { n: c.members }), c.status === "pending" ? tg("pending") : null, c.pending ? tg("pendingN", { n: c.pending }) : null].filter(Boolean).join(" · ")}
                            </Text>
                          </View>
                          {c.streak ? <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icon name="flame" color={t.gold} size={15} /><Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.gold }}>{c.streak}</Text></View> : null}
                          <Icon name="chevronRight" color={t.muted} size={16} />
                        </View>
                        {c.status === "member" && !c.suspended ? <Progress value={c.progress} max={c.goal} label={tg(`goal_${c.goalKind}` as TgKey)} /> : null}
                        {c.reached ? <Body size={13}>{tg("goalReached")}</Body> : null}
                      </Tile>
                    </Pressable>
                  )) : (
                    <Tile>
                      <Body muted>{tg("circlesLead")}</Body>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <GoldButton title={tg("circleNew")} compact onPress={() => router.push("/together/circles?new=1" as Href)} style={{ flex: 1 }} />
                        <OutlineButton title={tg("circleJoin")} compact onPress={() => router.push("/together/circles?join=1" as Href)} style={{ flex: 1 }} />
                      </View>
                    </Tile>
                  )}
                </Section>
              ) : null}

              {/* challenges */}
              {pulse ? (
                <Section title={tg("challenges")} icon="flame" action={s?.challenges ? tg("challengeNew") : undefined} onAction={() => setSheet("challenge")}>
                  {!s?.challenges ? (
                    <Tile>
                      <Body muted>{tg("challengesLead")}</Body>
                      <GoldButton title={tg("set_challenges")} compact onPress={() => void enable({ challenges: true })} />
                    </Tile>
                  ) : openChal.length ? openChal.slice(0, 4).map((c) => <ChallengeCard key={c.id} c={c} onChange={() => void load()} />) : <Body muted>{tg("noChallenges")}</Body>}
                </Section>
              ) : null}

              {/* learn together */}
              {pulse ? (
                <Section title={tg("invites")} icon="calendar" action={tg("inviteNew")} onAction={() => setSheet("invite")}>
                  {openInv.length ? openInv.map((i) => <InviteCard key={i.id} i={i} onChange={() => void load()} />) : <Body muted>{tg("invitesLead")}</Body>}
                </Section>
              ) : null}

              {/* celebrations */}
              {pulse ? (
                <Section title={tg("celebrations")} icon="starBig" action={moments.length ? tg("seeAll") : undefined} onAction={() => router.push("/talents/friends" as Href)}>
                  {moments.length ? moments.map((m) => <MomentCard key={m.id} m={m} onChange={(x) => setMoments((l) => l.map((y) => (y.id === x.id ? x : y)))} />) : <Body muted>{tg("noCelebrations")}</Body>}
                </Section>
              ) : null}

              {/* community goals */}
              {comm ? (
                <Section title={tg("community")} icon="globe" action={tg("open")} onAction={() => router.push("/together/community" as Href)}>
                  <CommunityGoalCard data={comm} onOpen={() => router.push("/together/community" as Href)} />
                </Section>
              ) : null}

              {/* intention */}
              <View style={{ gap: 6, padding: 16, borderRadius: R.card, backgroundColor: t.accentSoft }}>
                <Body size={14}>{tg("niyyah")}</Body>
                <Pressable onPress={() => router.push("/surah/2?v=148" as Href)} accessibilityRole="link" style={{ minHeight: 36, justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{tg("goodDeedsRef")}</Text>
                </Pressable>
              </View>
              <Body muted size={12.5}>{tg("updatedNote")}</Body>
              <SafetyBar />
            </View>
          </TogetherGate>
        </Page>
      </BadgeSheetHost>
      <ChallengeSheet visible={sheet === "challenge"} onClose={() => setSheet(null)} onDone={() => void load()} />
      <InviteSheet visible={sheet === "invite"} onClose={() => setSheet(null)} onDone={() => void load()} circles={(pulse?.circles ?? []).filter((c) => c.status === "member" && !c.suspended)} />
    </>
  );
}
