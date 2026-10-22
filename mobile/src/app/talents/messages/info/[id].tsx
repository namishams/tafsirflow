import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, Share, Switch, Text, TextInput, View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { FONT, R, useTheme } from "@/lib/theme";
import { Loading, Page, PageHero } from "@/components/page";
import { GlassButton, GlassCard } from "@/components/brand";
import { SITE } from "@/lib/api";
import { errCode } from "@/features/talents/api";
import { AccessGate, ListBox, ReportSheet, useTalentAccess } from "@/features/talents/ui";
import { M, inviteLink, type Member, type ThreadInfo } from "@/features/messenger/api";
import { errorText, fill } from "@/features/messenger/text";
import { ThreadAvatar, useMT } from "@/features/messenger/ui";

// /talents/messages/info/[id] – group or study-circle chat info: picture and name (admins), members with admin
// actions (remove, 7-day write ban, admin rights), add a member (friends of the admin only), invite link (18+),
// no alerts for oneself, report the group, leave. Circle chats follow the circle's membership and cannot be left here.
export default function GroupInfo() {
  const t = useTheme();
  const mt = useMT();
  const a = useTalentAccess();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [info, setInfo] = useState<ThreadInfo | null>(null);
  const [name, setName] = useState("");
  const [add, setAdd] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try { const d = await M.page(id); setInfo(d.thread); setName((n) => n || d.thread.title); } catch (e) { setMsg(errorText(mt, errCode(e))); }
  }, [id, mt]);
  useEffect(() => { if (a.state === "ok") void load(); }, [a.state, load]);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setMsg("");
    try { await fn(); await load(); } catch (e) { setMsg(errorText(mt, errCode(e))); } finally { setBusy(false); }
  };
  if (!info) return <><Stack.Screen options={{ headerShown: false }} /><AccessGate a={a}><Loading /></AccessGate></>;
  const admin = info.canManage;
  const memberActions = (m: Member) => {
    if (!admin || m.me) return;
    Alert.alert(m.name, `@${m.username}`, [
      { text: mt.remove, style: "destructive", onPress: () => void run(() => M.member(info.id, m.username, "remove")) },
      { text: m.muted ? mt.unmuteMember : mt.muteMember, onPress: () => void run(() => M.member(info.id, m.username, m.muted ? "unmute" : "mute")) },
      { text: m.role === "admin" ? mt.removeAdmin : mt.makeAdmin, onPress: () => void run(() => M.member(info.id, m.username, m.role === "admin" ? "member" : "admin")) },
      { text: mt.cancel, style: "cancel" },
    ]);
  };
  const changePhoto = () => run(async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.9, exif: false });
    if (r.canceled || !r.assets[0]) return;
    const img = await (await ImageManipulator.manipulate(r.assets[0].uri).resize({ width: 512, height: 512 }).renderAsync()).saveAsync({ format: SaveFormat.JPEG, compress: 0.82 });
    await M.photo(info.id, img.uri);
  });
  const leave = () => Alert.alert(mt.leave, mt.leaveConfirm, [{ text: mt.cancel, style: "cancel" }, {
    text: mt.leave, style: "destructive", onPress: () => void M.leave(info.id).then(() => router.replace("/talents/messages" as Href)).catch((e) => setMsg(errorText(mt, errCode(e)))),
  }]);
  const input = { minHeight: 44, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 12, fontFamily: FONT.regular, fontSize: 16, color: t.ink } as const;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page keyboardShouldPersistTaps="handled">
        <PageHero back topInset arcade={false} eyebrow={info.kind === "circle" ? mt.circleChat : mt.groupInfo} title={info.title} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 16 }}>
            <View style={{ alignItems: "center", gap: 10 }}>
              <ThreadAvatar kind={info.kind} title={info.title} photo={info.photo} size={96} />
              {admin ? <GlassButton compact icon="image" title={mt.changePhoto} onPress={() => void changePhoto()} disabled={busy} /> : null}
              <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>
                {fill(mt.members, info.memberCount)} · {info.audience === "sisters" ? mt.aud_sisters : info.audience === "brothers" ? mt.aud_brothers : mt.aud_all}
              </Text>
              {info.kind === "circle" ? <Text style={{ textAlign: "center", fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{mt.circleHint}</Text> : null}
            </View>
            {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.danger }}>{msg}</Text> : null}

            {admin ? (
              <GlassCard style={{ gap: 10 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{mt.groupName}</Text>
                <TextInput value={name} onChangeText={setName} maxLength={60} accessibilityLabel={mt.groupName} style={input} />
                <GlassButton title={mt.save} onPress={() => void run(() => M.update(info.id, { name: name.trim() }))} disabled={busy || name.trim().length < 2 || name.trim() === info.title} />
              </GlassCard>
            ) : null}

            {admin ? (
              <GlassCard style={{ gap: 10 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{mt.addMember}</Text>
                <TextInput value={add} onChangeText={setAdd} autoCapitalize="none" autoCorrect={false} placeholder={mt.addHint} placeholderTextColor={t.muted} accessibilityLabel={mt.addMember} style={input} />
                <GlassButton icon="plus" title={mt.add} onPress={() => void run(async () => { await M.addMember(info.id, add.trim().replace(/^@/, "")); setAdd(""); })} disabled={busy || !add.trim()} />
              </GlassCard>
            ) : null}

            {admin ? (
              <GlassCard style={{ gap: 10 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{mt.invite}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{mt.inviteHint}</Text>
                {code ? (
                  <Pressable onPress={() => void Share.share({ message: inviteLink(SITE, code) })} accessibilityRole="button" accessibilityLabel={mt.copy}>
                    <Text selectable style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{inviteLink(SITE, code)}</Text>
                  </Pressable>
                ) : null}
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  <GlassButton compact title={mt.inviteCreate} onPress={() => void run(async () => setCode((await M.invite(info.id, "reset")).code))} disabled={busy} />
                  {info.invite || code ? <GlassButton compact title={mt.inviteOff} onPress={() => void run(async () => { await M.invite(info.id, "off"); setCode(null); })} disabled={busy} /> : null}
                </View>
              </GlassCard>
            ) : null}

            <ListBox>
              {info.members.map((m, i) => (
                <Pressable key={m.username} onPress={() => (admin && !m.me ? memberActions(m) : router.push(`/talents/u/${m.username}` as Href))} accessibilityRole="button"
                  accessibilityLabel={`${m.name}, @${m.username}${m.role === "admin" ? `, ${mt.admin}` : ""}${m.muted ? `, ${mt.mutedTag}` : ""}`}
                  style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, minHeight: 60, backgroundColor: pressed ? t.bg : t.surface, borderTopWidth: i ? 1 : 0, borderTopColor: t.line })}>
                  <ThreadAvatar kind="direct" title={m.name} photo={null} avatar={m.avatar} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{m.me ? `${m.name} (${mt.you})` : m.name}</Text>
                    <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>@{m.username}</Text>
                  </View>
                  {m.role === "admin" ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.gold }}>{mt.admin}</Text> : null}
                  {m.muted ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.danger }}>{mt.mutedTag}</Text> : null}
                </Pressable>
              ))}
            </ListBox>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{mt.quiet}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{mt.quietHint}</Text>
              </View>
              <Switch value={info.me.quiet} accessibilityLabel={mt.quiet} onValueChange={(v) => void run(() => M.update(info.id, { quiet: v }))} />
            </View>

            <GlassButton icon="flag" title={mt.reportGroup} onPress={() => setReport(true)} />
            {info.kind === "group" ? <GlassButton icon="logout" title={mt.leave} onPress={leave} /> : null}
          </View>
        </AccessGate>
      </Page>
      <ReportSheet visible={report} title={mt.reportGroup} onClose={() => setReport(false)} onSubmit={(c, r) => M.report(info.id, c, r).then(() => undefined)} />
    </>
  );
}
