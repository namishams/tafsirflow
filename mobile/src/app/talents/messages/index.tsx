import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Switch, Text, TextInput, View } from "react-native";
import { Stack, router, useFocusEffect, useLocalSearchParams, type Href } from "expo-router";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { Page, PageHero } from "@/components/page";
import { Chip, GlassButton, GlassCard, Segmented } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { errCode } from "@/features/talents/api";
import { AccessGate, ListBox, Muted, SafetyBar, useTalentAccess } from "@/features/talents/ui";
import { M, type SearchHit, type ThreadRow, type Unread } from "@/features/messenger/api";
import { errorText, fill, systemLine } from "@/features/messenger/text";
import { ThreadAvatar, useMT } from "@/features/messenger/ui";
import { notifyEnabled, setNotifyEnabled } from "@/features/messenger/useUnread";

// /talents/messages – the inbox ("Postfach"): chats (one-to-one, groups, study-circle chats) and message requests
// from people the member does not follow mutually, search over chats and messages, new chat, new group, join by
// invite link, and the read-receipts switch. Refreshes every 15 seconds while open. Messaging is 16+.
export default function Inbox() {
  const t = useTheme();
  const mt = useMT();
  const { lang } = useLang();
  const a = useTalentAccess();
  const params = useLocalSearchParams<{ join?: string }>();
  const [box, setBox] = useState<"inbox" | "requests">("inbox");
  const [list, setList] = useState<ThreadRow[] | null>(null);
  const [unread, setUnread] = useState<Unread>({ inbox: 0, requests: 0 });
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [panel, setPanel] = useState<"new" | "join" | null>(params.join ? "join" : null);
  const [field, setField] = useState(params.join ?? "");
  const [busy, setBusy] = useState(false);
  const [receipts, setReceipts] = useState<boolean | null>(null);
  const [active, setActive] = useState(false);
  const [notify, setNotify] = useState(notifyEnabled());
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [unanswered, setUnanswered] = useState(false);
  const ok = a.state === "ok" && !!a.age?.interact;
  // "Unbeantwortet": the last message is from the other side and older than 24 hours
  const waiting = (c: ThreadRow) => !!c.last && !c.last.mine && c.last.kind !== "system" && !c.request?.incoming && !!c.at && Date.now() - new Date(c.at).getTime() > 86_400_000;
  const openCount = list?.filter(waiting).length ?? 0;
  const shown = list && box === "inbox" ? list.filter((c) => (!onlyUnread || c.unread > 0) && (!unanswered || waiting(c))) : list;

  const load = useCallback(async () => {
    try { const d = await M.threads(box); setList(d.threads); setUnread(d.unread); setMsg(""); } catch (e) { setMsg(errorText(mt, errCode(e))); setList((l) => l ?? []); }
  }, [box, mt]);
  useFocusEffect(useCallback(() => {
    if (!ok) return;
    void load();
    const h = setInterval(() => { void load(); }, 15_000);
    return () => clearInterval(h);
  }, [ok, load]));
  useEffect(() => { if (ok) void M.prefs().then((p) => { setReceipts(p.readReceipts); setActive(p.activeStatus); }).catch(() => undefined); }, [ok]);

  // search: chats by name and messages by text (the server decrypts the member's own recent messages)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) { setHits(null); return; }
    timer.current = setTimeout(() => { void M.search(q.trim()).then((d) => setHits(d.results)).catch(() => setHits([])); }, 350);
  }, [q]);

  const submit = async () => {
    const v = field.trim();
    if (!v) return;
    setBusy(true); setMsg("");
    try {
      const d = panel === "join" ? await M.join(v) : await M.open(v.replace(/^@/, ""));
      setPanel(null); setField("");
      router.push(`/talents/messages/${d.id}` as Href);
    } catch (e) { setMsg(errorText(mt, errCode(e))); } finally { setBusy(false); }
  };
  const when = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toDateString() === new Date().toDateString() ? d.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString(lang, { day: "numeric", month: "short" });
  };
  const preview = (c: ThreadRow) => {
    const l = c.last;
    if (!l) return c.kind === "circle" ? mt.circleHint : "";
    if (l.kind === "system") return systemLine(mt, l.system);
    const who = l.mine ? `${mt.you}: ` : c.kind !== "direct" && l.name ? `${l.name}: ` : "";
    if (l.gone) return `${who}${mt.deleted}`;
    if (l.kind === "image") return `${who}${mt.photoMsg}${l.text ? ` · ${l.text}` : ""}`;
    if (l.kind === "voice") return `${who}${mt.voiceMsg}`;
    if (l.viewOnce) return `${who}${l.kind === "video" ? mt.viewOnceVideo : mt.viewOncePhoto}`;
    if (l.kind === "video") return `${who}${mt.videoMsg}${l.text ? ` · ${l.text}` : ""}`;
    if (l.kind === "share") return `${who}${mt.sharedMsg}${l.text ? ` · ${l.text}` : ""}`;
    return `${who}${l.text ?? ""}`;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset arcade={false} eyebrow={mt.inbox} title={mt.title} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 14 }}>
            {!a.age?.interact ? <Muted>{mt.e_age16}</Muted> : (
              <>
                <Segmented stretch value={box} onChange={(v) => { setBox(v); setList(null); }}
                  options={[["inbox", unread.inbox ? `${mt.inbox} (${unread.inbox})` : mt.inbox], ["requests", unread.requests ? `${mt.requests} (${unread.requests})` : mt.requests]]} />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: R.pill, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14, minHeight: 44 }}>
                  <Icon name="search" size={17} color={t.muted} />
                  <TextInput value={q} onChangeText={setQ} placeholder={mt.searchPh} placeholderTextColor={t.muted} accessibilityLabel={mt.searchPh} returnKeyType="search"
                    style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15.5, color: t.ink, paddingVertical: 10 }} />
                  {q ? <Pressable onPress={() => setQ("")} accessibilityRole="button" accessibilityLabel={mt.cancel} hitSlop={10}><Icon name="close" size={16} color={t.muted} /></Pressable> : null}
                </View>
                {box === "inbox" && !hits ? (
                  <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                    <Chip small label={mt.unreadOnly} selected={onlyUnread} onPress={() => setOnlyUnread((v) => !v)} />
                    <Chip small label={mt.unanswered} selected={unanswered} onPress={() => setUnanswered((v) => !v)} />
                    <GlassButton compact icon="pen" title={mt.newChat} onPress={() => { setPanel(panel === "new" ? null : "new"); setField(""); }} />
                    <GlassButton compact icon="users" title={mt.newGroup} onPress={() => router.push("/talents/messages/group" as Href)} />
                    <GlassButton compact icon="plus" title={mt.join} onPress={() => { setPanel(panel === "join" ? null : "join"); setField(""); }} />
                  </View>
                ) : null}
                {panel ? (
                  <GlassCard style={{ gap: 10 }}>
                    <TextInput value={field} onChangeText={setField} autoCapitalize="none" autoCorrect={false} autoFocus placeholder={panel === "join" ? mt.joinPh : mt.newChatHint}
                      placeholderTextColor={t.muted} accessibilityLabel={panel === "join" ? mt.joinPh : mt.newChatHint} onSubmitEditing={() => void submit()}
                      style={{ minHeight: 44, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 12, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
                    <GlassButton title={panel === "join" ? mt.join : mt.open} onPress={() => void submit()} disabled={busy || !field.trim()} />
                  </GlassCard>
                ) : null}
                {box === "inbox" && openCount > 0 && !unanswered && !hits ? (
                  <Pressable onPress={() => setUnanswered(true)} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: R.card, borderWidth: 1, borderColor: t.gold }}>
                    <Icon name="clock" size={16} color={t.gold} />
                    <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13.5, color: t.ink }}>{fill(mt.unansweredHint, openCount)}</Text>
                  </Pressable>
                ) : null}
                {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.danger }}>{msg}</Text> : null}
                {box === "requests" ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted }}>{mt.requestsHint}</Text> : null}

                {hits ? (
                  !hits.length ? <Muted>{mt.noResults}</Muted> : (
                    <ListBox>
                      {hits.map((h, i) => (
                        <Pressable key={`${h.threadId}-${h.messageId ?? "t"}-${i}`} onPress={() => router.push(`/talents/messages/${h.threadId}` as Href)} accessibilityRole="button"
                          style={({ pressed }) => ({ padding: 14, gap: 3, backgroundColor: pressed ? t.bg : t.surface, borderTopWidth: i ? 1 : 0, borderTopColor: t.line })}>
                          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{h.title}</Text>
                          {h.snippet ? <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{h.snippet}</Text> : null}
                        </Pressable>
                      ))}
                    </ListBox>
                  )
                ) : shown && !shown.length ? <Muted>{box === "requests" ? mt.emptyRequests : onlyUnread || unanswered ? mt.noResults : mt.empty}</Muted> : shown ? (
                  <ListBox>
                    {shown.map((c, i) => (
                      <Pressable key={c.id} onPress={() => router.push(`/talents/messages/${c.id}` as Href)} accessibilityRole="button"
                        accessibilityLabel={`${c.title}${c.unread ? `, ${c.unread}` : ""}, ${preview(c)}`}
                        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, minHeight: 72, backgroundColor: pressed ? t.bg : t.surface, borderTopWidth: i ? 1 : 0, borderTopColor: t.line })}>
                        <ThreadAvatar kind={c.kind} title={c.title} photo={c.photo} avatar={c.with?.avatar} size={50} />
                        <View style={{ flex: 1, gap: 3 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: c.unread ? FONT.bold : FONT.semibold, fontSize: 15.5, color: t.ink }}>{c.title}</Text>
                            {c.kind === "circle" ? <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: t.gold }}>{mt.circleChat}</Text> : null}
                            <View style={{ flex: 1 }} />
                            <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{when(c.at)}</Text>
                          </View>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Text numberOfLines={1} style={{ flex: 1, fontFamily: c.unread ? FONT.semibold : FONT.regular, fontSize: 14, color: c.unread ? t.ink : t.muted }}>
                              {c.request?.incoming ? fill(mt.requestIncoming, c.title) : preview(c)}
                            </Text>
                            {c.unread ? <View style={{ minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: goldButton.to, alignItems: "center", justifyContent: "center" }}>
                              <Text style={{ fontFamily: FONT.bold, fontSize: 11.5, color: goldButton.text }}>{c.unread}</Text></View> : null}
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </ListBox>
                ) : null}

                {receipts !== null ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{mt.readReceipts}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{mt.readReceiptsHint}</Text>
                    </View>
                    <Switch value={receipts} accessibilityLabel={mt.readReceipts} onValueChange={(v) => { setReceipts(v); void M.setPrefs({ readReceipts: v }).catch(() => setReceipts(!v)); }} />
                  </View>
                ) : null}
                {receipts !== null ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{mt.activeStatus}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{mt.activeStatusHint}</Text>
                    </View>
                    <Switch value={active} accessibilityLabel={mt.activeStatus} onValueChange={(v) => { setActive(v); void M.setPrefs({ activeStatus: v }).catch(() => setActive(!v)); }} />
                  </View>
                ) : null}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{mt.notifSetting}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{mt.notifHint}</Text>
                  </View>
                  <Switch value={notify} accessibilityLabel={mt.notifSetting} onValueChange={(v) => { setNotify(v); void setNotifyEnabled(v).then(setNotify); }} />
                </View>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{mt.privacy}</Text>
              </>
            )}
            <SafetyBar />
          </View>
        </AccessGate>
      </Page>
    </>
  );
}
