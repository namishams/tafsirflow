import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, PanResponder, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { Stack, router, useFocusEffect, useLocalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { FONT, useTheme } from "@/lib/theme";
import { Page } from "@/components/page";
import { GLASS_R, GlassButton, GlassIconButton, GlassSurface, GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { T, errCode, type SearchCard } from "@/features/talents/api";
import { BadgeButton } from "@/features/talents/badges";
import { AccessGate, ListBox, Muted, SafetyBar, TalentAvatar, useTalentAccess } from "@/features/talents/ui";
import { M, type Person, type SearchHit, type ThreadRow, type Unread } from "@/features/messenger/api";
import { errorText, fill, systemLine } from "@/features/messenger/text";
import { ThreadAvatar, useMT } from "@/features/messenger/ui";
import { notifyEnabled, setNotifyEnabled } from "@/features/messenger/useUnread";

// /talents/messages – the inbox in the Instagram layout (owner 22.10.2026; the website's MessengerWeb is the same):
// header with the own @username and badge, settings (gear) and compose (pen: new chat with people search, new group,
// join by link); a filled search field; soft filter pills Chats / Requests (red count) / Unread / Unanswered; a row of
// contacts who are active now (opt-in on both sides); chat rows with a 56 px avatar (gold ring for Pro), bold name when
// unread, a grey subline ("Gesehen · 2 Std.", "Foto · 4 T.") and a gold dot; swipe a row left for "No alerts". Read
// receipts, activity status, notifications and the privacy note live in the settings sheet. Refreshes every 15 s.
type Box = "inbox" | "requests" | "unread" | "unanswered";
type Me = Person & { pro: boolean };

/** "4 T.", "3 Std." in the reader's language */
function ago(iso: string | null, lang: string) {
  if (!iso) return "";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const [n, unit] = s < 3600 ? [Math.max(1, Math.round(s / 60)), "minute"] : s < 86400 ? [Math.round(s / 3600), "hour"] : s < 604800 ? [Math.round(s / 86400), "day"] : [Math.round(s / 604800), "week"];
  try { return new Intl.NumberFormat(lang, { style: "unit", unit, unitDisplay: "narrow" } as Intl.NumberFormatOptions).format(n as number); } catch { return `${n}`; }
}

/** a small garden arch with a crescent and a plant (empty state) */
function GardenArt({ size = 150 }: { size?: number }) {
  const t = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 150 150" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx="75" cy="78" r="62" fill={t.accentSoft} />
      <Path d="M45 128V70a30 30 0 0 1 60 0v58" fill="none" stroke={t.gold} strokeWidth="3" />
      <Path d="M55 128V74a20 20 0 0 1 40 0v54" fill="none" stroke={t.gold} strokeWidth="1.5" opacity={0.6} />
      <Path d="M82 46a10 10 0 1 1-9-14 8 8 0 1 0 9 14z" fill={t.gold} />
      <Path d="M75 128c0-18-2-30-12-40 10 3 14 12 14 22 1-12 6-20 16-24-8 9-10 20-10 42" fill={t.accent} opacity={0.85} />
      <Path d="M30 128h90" stroke={t.gold} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/** a chat row; swipe left to show "No alerts" */
function ChatRow({ c, sub, onPress, onQuiet, quietLabel }: { c: ThreadRow; sub: string; onPress: () => void; onQuiet: () => void; quietLabel: string }) {
  const t = useTheme();
  const x = useRef(new Animated.Value(0)).current;
  const open = useRef(false);
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
    onPanResponderMove: (_, g) => x.setValue(Math.max(-96, Math.min(0, g.dx + (open.current ? -96 : 0)))),
    onPanResponderRelease: (_, g) => { open.current = g.dx + (open.current ? -96 : 0) < -48; Animated.spring(x, { toValue: open.current ? -96 : 0, useNativeDriver: true }).start(); },
  }), [x]);
  const close = () => { open.current = false; Animated.spring(x, { toValue: 0, useNativeDriver: true }).start(); };
  return (
    <View>
      <Pressable onPress={() => { close(); onQuiet(); }} accessibilityRole="button" accessibilityLabel={quietLabel}
        style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 96, alignItems: "center", justifyContent: "center", backgroundColor: t.accent }}>
        <Icon name={c.quiet ? "volume" : "speaker"} size={18} color={t.onAccent} />
        <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 11, color: t.onAccent, textAlign: "center", marginTop: 3 }}>{quietLabel}</Text>
      </Pressable>
      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: x }], backgroundColor: t.bg }}>
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityActions={[{ name: "quiet", label: quietLabel }]} onAccessibilityAction={onQuiet}
          accessibilityLabel={`${c.title}${c.unread ? `, ${c.unread}` : ""}, ${sub}`}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 8, minHeight: 76, backgroundColor: pressed ? t.surface : t.bg })}>
          <View>
            <View style={{ padding: 2, borderRadius: 32, borderWidth: 2, borderColor: c.pro ? t.gold : "transparent" }}>
              <ThreadAvatar kind={c.kind} title={c.title} photo={c.photo} avatar={c.with?.avatar} size={56} />
            </View>
            {c.active ? <View style={{ position: "absolute", right: 3, bottom: 3, width: 15, height: 15, borderRadius: 8, backgroundColor: "rgb(46,170,110)", borderWidth: 2.5, borderColor: t.bg }} /> : null}
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: c.unread ? FONT.bold : FONT.semibold, fontSize: 15.5, color: t.ink }}>{c.title}</Text>
              {c.with ? <BadgeButton badge={c.with.badge} size={14} /> : null}
            </View>
            <Text numberOfLines={1} style={{ fontFamily: c.unread ? FONT.semibold : FONT.regular, fontSize: 13.5, color: c.unread ? t.ink : t.muted }}>{sub}</Text>
          </View>
          {c.quiet ? <Icon name="speaker" size={15} color={t.muted} /> : null}
          {c.unread ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: t.gold }} /> : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function Inbox() {
  const t = useTheme();
  const mt = useMT();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const a = useTalentAccess();
  const params = useLocalSearchParams<{ join?: string }>();
  const [box, setBox] = useState<Box>("inbox");
  const [list, setList] = useState<ThreadRow[] | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [unread, setUnread] = useState<Unread>({ inbox: 0, requests: 0 });
  const [msg, setMsg] = useState("");
  const [needPro, setNeedPro] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [compose, setCompose] = useState(!!params.join);
  const [panel, setPanel] = useState<"new" | "join">(params.join ? "join" : "new");
  const [field, setField] = useState(params.join ?? "");
  const [people, setPeople] = useState<SearchCard[]>([]);
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState(false);
  const [receipts, setReceipts] = useState(true);
  const [active, setActive] = useState(false);
  const [notify, setNotify] = useState(notifyEnabled());
  const ok = a.state === "ok" && !!a.age?.interact;
  // "Unbeantwortet": the last message is from the other side and older than 24 hours
  const waiting = (c: ThreadRow) => !!c.last && !c.last.mine && c.last.kind !== "system" && !c.request?.incoming && !!c.at && Date.now() - new Date(c.at).getTime() > 86_400_000;
  const shown = list ? (box === "unread" ? list.filter((c) => c.unread > 0) : box === "unanswered" ? list.filter(waiting) : list) : null;
  const activeNow = (list ?? []).filter((c) => c.kind === "direct" && c.active && c.with).slice(0, 12);

  const load = useCallback(async () => {
    try {
      const d = await M.threads(box === "requests" ? "requests" : "inbox");
      setList(d.threads); setUnread(d.unread); setMe(d.me ?? null);
    } catch (e) { setMsg(errorText(mt, errCode(e))); setList((l) => l ?? []); }
  }, [box, mt]);
  useFocusEffect(useCallback(() => {
    if (!ok) return;
    void load();
    const h = setInterval(() => { void load(); }, 15_000);
    return () => clearInterval(h);
  }, [ok, load]));
  useEffect(() => { if (ok && settings) void M.prefs().then((p) => { setReceipts(p.readReceipts); setActive(p.activeStatus); }).catch(() => undefined); }, [ok, settings]);

  // search: chats by name and messages by text (the server decrypts the member's own recent messages)
  useEffect(() => {
    if (q.trim().length < 2) { setHits(null); return; }
    const h = setTimeout(() => { void M.search(q.trim()).then((d) => setHits(d.results)).catch(() => setHits([])); }, 350);
    return () => clearTimeout(h);
  }, [q]);
  // new chat: people by @username and name as you type (blocked and suspended members are left out by the server)
  useEffect(() => {
    if (!compose || panel !== "new" || field.trim().replace(/^@/, "").length < 2) { setPeople([]); return; }
    const h = setTimeout(() => { void T.search(field.trim().replace(/^@/, "")).then((d) => setPeople(d.talents.filter((p) => !p.mine).slice(0, 8))).catch(() => setPeople([])); }, 250);
    return () => clearTimeout(h);
  }, [compose, panel, field]);

  const go = async (fn: () => Promise<{ id: string }>) => {
    setBusy(true); setMsg(""); setNeedPro(false);
    try { const d = await fn(); setCompose(false); setField(""); router.push(`/talents/messages/${d.id}` as Href); }
    catch (e) { setMsg(errorText(mt, errCode(e))); setNeedPro(errCode(e) === "pro_required"); }
    finally { setBusy(false); }
  };
  const submit = () => { const v = field.trim(); if (v) void go(() => (panel === "join" ? M.join(v) : M.open(v.replace(/^@/, "")))); };
  const quiet = (c: ThreadRow) => {
    setList((l) => (l ?? []).map((x) => (x.id === c.id ? { ...x, quiet: !c.quiet, unread: c.quiet ? x.unread : 0 } : x)));
    void M.update(c.id, { quiet: !c.quiet }).catch(() => void load());
  };
  const sub = (c: ThreadRow) => {
    const l = c.last;
    const when = ago(c.at, lang);
    if (c.request?.incoming) return fill(mt.requestIncoming, c.title);
    if (!l) return c.kind === "circle" ? mt.circleHint : "";
    if (l.kind === "system") return `${systemLine(mt, l.system)} · ${when}`;
    if (l.mine && c.kind === "direct" && !l.gone) return `${c.seen ? mt.seenShort : mt.sentShort} · ${when}`;
    const who = l.mine ? `${mt.you}: ` : c.kind !== "direct" && l.name ? `${l.name}: ` : "";
    const what = l.gone ? mt.deleted : l.viewOnce ? (l.kind === "video" ? mt.viewOnceVideo : mt.viewOncePhoto) : l.kind === "image" ? mt.photoMsg : l.kind === "voice" ? mt.voiceMsg
      : l.kind === "video" ? mt.videoMsg : l.kind === "share" ? mt.sharedMsg : l.text ?? "";
    return `${who}${what} · ${when}`;
  };
  const pill = (v: Box, label: string, count = 0) => (
    <Pressable key={v} onPress={() => { if ((v === "requests") !== (box === "requests")) setList(null); setBox(v); }} accessibilityRole="tab" accessibilityState={{ selected: box === v }}
      accessibilityLabel={count ? `${label}, ${count}` : label}
      style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 34, paddingHorizontal: 14, borderRadius: 17, backgroundColor: box === v ? t.accentSoft : t.surface, borderWidth: 1, borderColor: box === v ? t.accent : t.line }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: box === v ? t.accent : t.ink }}>{label}</Text>
      {count ? <View style={{ minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, backgroundColor: "rgb(214,48,60)", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 11, color: "#fff" }}>{count}</Text></View> : null}
    </Pressable>
  );
  const sheet = (visible: boolean, close: () => void, title: string, body: React.ReactNode) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }} onPress={close} accessibilityLabel={mt.cancel}>
        <Pressable onPress={() => undefined}>
          <GlassSurface strong style={{ borderTopLeftRadius: GLASS_R.card, borderTopRightRadius: GLASS_R.card, padding: 16, paddingBottom: insets.bottom + 16, gap: 12, backgroundColor: t.bg }}>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink, textAlign: "center" }}>{title}</Text>
            {body}
          </GlassSurface>
        </Pressable>
      </Pressable>
    </Modal>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <GlassIconButton size={40} icon="chevronLeft" label={mt.cancel} onPress={() => router.back()} />
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 4 }}>
            <Text accessibilityRole="header" numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 20, color: t.ink }}>{me ? me.username : mt.title}</Text>
            {me ? <BadgeButton badge={me.badge} size={16} /> : null}
          </View>
          {ok ? <GlassIconButton size={40} icon="settings" label={mt.settings} onPress={() => setSettings(true)} /> : null}
          {ok ? <GlassIconButton size={40} icon="pen" label={mt.compose} onPress={() => { setCompose(true); setPanel("new"); setField(""); setMsg(""); }} /> : null}
        </View>
        <AccessGate a={a}>
          <View style={{ paddingTop: 10, paddingBottom: insets.bottom + 110, gap: 12 }}>
            {!a.age?.interact ? <View style={{ paddingHorizontal: 16 }}><Muted>{mt.e_age16}</Muted></View> : (
              <>
                <View style={{ marginHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, backgroundColor: t.surface, paddingHorizontal: 12, height: 40 }}>
                  <Icon name="search" size={16} color={t.muted} />
                  <TextInput value={q} onChangeText={setQ} placeholder={mt.searchPh} placeholderTextColor={t.muted} accessibilityLabel={mt.searchPh} returnKeyType="search"
                    style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15.5, color: t.ink, paddingVertical: 0 }} />
                  {q ? <Pressable onPress={() => setQ("")} accessibilityRole="button" accessibilityLabel={mt.cancel} hitSlop={10}><Icon name="close" size={15} color={t.muted} /></Pressable> : null}
                </View>
                {!hits ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} accessibilityRole="tablist">
                    {pill("inbox", mt.primary)}{pill("requests", mt.requests, unread.requests)}{pill("unread", mt.unreadOnly, unread.inbox)}{pill("unanswered", mt.unanswered)}
                  </ScrollView>
                ) : null}
                {!hits && box === "inbox" && activeNow.length ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 16 }} accessibilityLabel={mt.activeRow}>
                    {activeNow.map((c) => (
                      <Pressable key={c.id} onPress={() => router.push(`/talents/messages/${c.id}` as Href)} accessibilityRole="button" accessibilityLabel={`${c.title}, ${mt.activeNow}`} style={{ width: 66, alignItems: "center", gap: 4 }}>
                        <View>
                          <TalentAvatar name={c.title} uri={c.with?.avatar ?? null} size={60} />
                          <View style={{ position: "absolute", right: 2, bottom: 2, width: 15, height: 15, borderRadius: 8, backgroundColor: "rgb(46,170,110)", borderWidth: 2.5, borderColor: t.bg }} />
                        </View>
                        <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: t.ink }}>{c.title}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : null}
                {msg && !compose ? <Text accessibilityLiveRegion="polite" style={{ marginHorizontal: 16, fontFamily: FONT.semibold, fontSize: 13.5, color: t.danger }}>{msg}</Text> : null}
                {box === "requests" && !hits ? <Text style={{ marginHorizontal: 16, fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{mt.requestsHint}</Text> : null}

                {hits ? (
                  !hits.length ? <View style={{ paddingHorizontal: 16 }}><Muted>{mt.noResults}</Muted></View> : (
                    <View>
                      {hits.map((h, i) => (
                        <Pressable key={`${h.threadId}-${h.messageId ?? "t"}-${i}`} onPress={() => router.push(`/talents/messages/${h.threadId}` as Href)} accessibilityRole="button"
                          style={({ pressed }) => ({ paddingHorizontal: 16, paddingVertical: 10, gap: 2, backgroundColor: pressed ? t.surface : t.bg })}>
                          <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{h.title}</Text>
                          {h.snippet ? <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{h.snippet}</Text> : null}
                        </Pressable>
                      ))}
                    </View>
                  )
                ) : shown && !shown.length ? (
                  box === "inbox" ? (
                    <View style={{ alignItems: "center", gap: 14, paddingHorizontal: 32, paddingTop: 24 }}>
                      <GardenArt />
                      <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, color: t.muted, textAlign: "center" }}>{mt.emptyLine}</Text>
                      <GoldButton title={mt.startChat} icon="pen" onPress={() => { setCompose(true); setPanel("new"); }} />
                    </View>
                  ) : <View style={{ paddingHorizontal: 16 }}><Muted>{box === "requests" ? mt.emptyRequests : mt.noResults}</Muted></View>
                ) : shown ? (
                  <View>
                    {shown.map((c) => <ChatRow key={c.id} c={c} sub={sub(c)} quietLabel={mt.quiet} onQuiet={() => quiet(c)} onPress={() => router.push(`/talents/messages/${c.id}` as Href)} />)}
                  </View>
                ) : null}
              </>
            )}
          </View>
        </AccessGate>
      </Page>

      {sheet(compose, () => setCompose(false), mt.compose, (
        <>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["new", "join"] as const).map((v) => (
              <Pressable key={v} onPress={() => { setPanel(v); setField(""); setMsg(""); }} accessibilityRole="tab" accessibilityState={{ selected: panel === v }}
                style={{ flex: 1, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: panel === v ? t.accentSoft : t.surface, borderWidth: 1, borderColor: panel === v ? t.accent : t.line }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: panel === v ? t.accent : t.ink }}>{v === "new" ? mt.newChat : mt.join}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput value={field} onChangeText={setField} autoCapitalize="none" autoCorrect={false} autoFocus placeholder={panel === "join" ? mt.joinPh : mt.newChatHint}
            placeholderTextColor={t.muted} accessibilityLabel={panel === "join" ? mt.joinPh : mt.newChatHint} onSubmitEditing={submit}
            style={{ height: 44, borderRadius: 12, backgroundColor: t.surface, paddingHorizontal: 12, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
          {panel === "new" && people.length ? (
            <ListBox>
              {people.map((p, i) => (
                <Pressable key={p.username} onPress={() => void go(() => M.open(p.username))} accessibilityRole="button" accessibilityLabel={`${mt.open}: ${p.name}, @${p.username}`}
                  style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, padding: 10, minHeight: 56, backgroundColor: pressed ? t.bg : t.surface, borderTopWidth: i ? 1 : 0, borderTopColor: t.line })}>
                  <TalentAvatar name={p.name} uri={p.avatar ?? null} size={38} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{p.name}</Text>
                      <BadgeButton badge={p.badge ?? (p.verified ? "gold" : null)} size={14} />
                      {p.country ? <Text style={{ fontFamily: FONT.semibold, fontSize: 10, color: t.muted, borderWidth: 1, borderColor: t.line, borderRadius: 3, paddingHorizontal: 4 }}>{p.country}</Text> : null}
                    </View>
                    <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>@{p.username}</Text>
                  </View>
                </Pressable>
              ))}
            </ListBox>
          ) : null}
          {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: needPro ? t.ink : t.danger }}>{msg}</Text> : null}
          {needPro ? <GoldButton title={mt.proCta} onPress={() => { setCompose(false); router.push("/pro" as Href); }} /> : null}
          <GlassButton title={panel === "join" ? mt.join : mt.open} onPress={submit} disabled={busy || !field.trim()} />
          <GlassButton icon="users" title={mt.newGroup} onPress={() => { setCompose(false); router.push("/talents/messages/group" as Href); }} />
        </>
      ))}

      {sheet(settings, () => setSettings(false), mt.settings, (
        <>
          {([
            [mt.readReceipts, mt.readReceiptsHint, receipts, (v: boolean) => { setReceipts(v); void M.setPrefs({ readReceipts: v }).catch(() => setReceipts(!v)); }],
            [mt.activeStatus, mt.activeStatusHint, active, (v: boolean) => { setActive(v); void M.setPrefs({ activeStatus: v }).catch(() => setActive(!v)); }],
            [mt.notifSetting, mt.notifHint, notify, (v: boolean) => { setNotify(v); void setNotifyEnabled(v).then(setNotify); }],
          ] as const).map(([title, hint, value, set]) => (
            <View key={title} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{title}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: t.muted }}>{hint}</Text>
              </View>
              <Switch value={value} accessibilityLabel={title} onValueChange={set} />
            </View>
          ))}
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{mt.privacy}</Text>
          <SafetyBar />
        </>
      ))}
    </>
  );
}
