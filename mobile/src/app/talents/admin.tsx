import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Stack } from "expo-router";
import { FONT, R, goldButton, useTheme } from "@/lib/theme";
import { Page, PageHero } from "@/components/page";
import { Chip, GoldButton, Segmented } from "@/components/brand";
import { LabeledField } from "@/components/form";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/i18n";
import { A, LEVELS, mediaSource, type AdminInvite, type AdminMember, type AdminPost, type AdminReport, type AdminVerification, type Level } from "@/features/talents/api";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { VideoView, useVideoPlayer } from "expo-video";
import { ClipVisual } from "@/features/talents/ClipVisual";
import { BadgeSheetHost } from "@/features/talents/badges";
import { usePostingOn } from "@/features/sijill/config";
import { useTT, type TKey } from "@/features/talents/text";
import { LevelBadge, ListBox, Muted, SmallButton, TalentRow, useTalentErr } from "@/features/talents/ui";

// /talents/admin – moderation for admins only (the server checks the role on every call): reports queue, members
// (verify, level, suspend), master invite codes, post/story approval queue.
type Tab = "reports" | "posts" | "members" | "invites" | "verify";
export default function Moderation() {
  const tt = useTT();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("reports");
  const postingOn = usePostingOn(); // clip moderation only while posting is switched on (config.json)
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
      <Page>
        <PageHero back arcade={false} eyebrow={tt("network")} title={tt("adminTitle")} />
        {user?.role !== "admin" ? <Muted>{tt("e_forbidden")}</Muted> : (
          <View style={{ padding: 16, gap: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Segmented<Tab> value={tab} onChange={setTab} options={[["reports", tt("tabReports")], ...(postingOn ? [["posts", tt("tabPosts")] as [Tab, string]] : []), ["members", tt("tabMembers")], ["invites", tt("tabInvites")], ["verify", tt("tabVerify")]]} />
            </ScrollView>
            {tab === "reports" ? <Reports /> : tab === "members" ? <Members /> : tab === "invites" ? <Invites /> : tab === "verify" ? <Verifications /> : <Posts />}
          </View>
        )}
      </Page>
      </BadgeSheetHost>
    </>
  );
}

function useRun() {
  const err = useTalentErr();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const run = async (fn: () => Promise<unknown>) => { setBusy(true); setMsg(""); try { await fn(); } catch (e) { setMsg(err(e)); } finally { setBusy(false); } };
  return { busy, msg, run, setMsg };
}

function Box({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 14, gap: 8 }}>{children}</View>;
}

function Reports() {
  const t = useTheme();
  const tt = useTT();
  const { lang } = useLang();
  const { busy, msg, run } = useRun();
  const [list, setList] = useState<AdminReport[] | null>(null);
  const load = useCallback(() => run(async () => setList((await A.reports()).reports)), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);
  const act = (id: string, a: "dismiss" | "resolve" | "remove_message" | "remove_post" | "suspend") => run(async () => { await A.act(id, a); setList((l) => l?.filter((r) => r.id !== id) ?? null); });
  return (
    <View style={{ gap: 10 }}>
      {msg ? <Muted>{msg}</Muted> : null}
      {list && !list.length ? <Muted>{tt("noReports")}</Muted> : null}
      {list?.map((r) => (
        <Box key={r.id}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{tt("reportOf", { u: r.reported ?? "?" })}{r.suspended ? ` · ${tt("suspended")}` : ""}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>
            {[r.category ? tt(`cat_${r.category}` as TKey) : "", r.reporter ? tt("reportedBy", { u: r.reporter }) : "", tt("reportsTotal", { n: r.total }), new Date(r.at).toLocaleString(lang)].filter(Boolean).join(" · ")}
          </Text>
          {r.reason ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink }}>{r.reason}</Text> : null}
          {r.message ? (
            <View style={{ borderRadius: R.md, backgroundColor: t.bg, padding: 10 }}>
              <Text style={{ fontFamily: r.message.removed ? FONT.italic : FONT.regular, fontSize: 14.5, lineHeight: 21, color: r.message.removed ? t.muted : t.ink }}>{r.message.removed ? tt("removedMsg") : r.message.text}</Text>
            </View>
          ) : null}
          {r.post ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{tt("reportedClip")}: {r.post.verseKey ?? ""} · {r.post.status}</Text> : null}
          {r.post?.media ? <MediaPreview path={r.post.media} hasVideo={false} verseKey={r.post.verseKey} /> : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {r.post && r.post.status !== "removed" ? <SmallButton title={tt("removeClip")} tone="danger" disabled={busy} onPress={() => void act(r.id, "remove_post")} /> : null}
            <SmallButton title={tt("dismiss")} disabled={busy} onPress={() => void act(r.id, "dismiss")} />
            <SmallButton title={tt("resolve")} disabled={busy} onPress={() => void act(r.id, "resolve")} />
            {r.message && !r.message.removed ? <SmallButton title={tt("removeMessage")} tone="danger" disabled={busy} onPress={() => void act(r.id, "remove_message")} /> : null}
            {!r.suspended ? <SmallButton title={tt("suspend")} tone="danger" disabled={busy} onPress={() => void act(r.id, "suspend")} /> : null}
          </View>
        </Box>
      ))}
    </View>
  );
}

function Members() {
  const t = useTheme();
  const tt = useTT();
  const { busy, msg, run } = useRun();
  const [q, setQ] = useState("");
  const [list, setList] = useState<AdminMember[]>([]);
  const load = useCallback(() => run(async () => setList((await A.members(q.trim())).members)), [q]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const h = setTimeout(() => void load(), 300); return () => clearTimeout(h); }, [load]);
  const set = (m: AdminMember, patch: { verified?: boolean; level?: Level; suspended?: boolean; official?: boolean; badgeOverride?: "none" | null }) =>
    run(async () => { await A.setMember({ username: m.username, ...patch }); setList((l) => l.map((x) => (x.username === m.username ? { ...x, ...patch } : x))); });
  return (
    <View style={{ gap: 10 }}>
      <View style={{ height: 48, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14, justifyContent: "center" }}>
        <TextInput value={q} onChangeText={setQ} placeholder={tt("searchMembers")} placeholderTextColor={t.muted} accessibilityLabel={tt("searchMembers")} autoCapitalize="none" autoCorrect={false}
          style={{ fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
      </View>
      {msg ? <Muted>{msg}</Muted> : null}
      {list.map((m) => (
        <View key={m.username} style={{ gap: 0 }}>
          <ListBox>
            <TalentRow c={m} first sub={m.suspended ? tt("suspended") : undefined} />
            <View style={{ padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: t.line }}>
              {m.officialChannel ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.gold }}>{tt("officialChannel", { c: m.officialChannel })}</Text> : null}
              {m.ijazahChain ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.ink }}>{tt("ijazahChain")}: {m.ijazahChain}</Text> : null}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {LEVELS.map((l) => <Chip key={l} label={tt(`level_${l}` as TKey)} selected={m.level === l} onPress={() => void set(m, { level: l })} />)}
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <SmallButton title={m.adminVerified ? tt("unverify") : tt("verify")} tone={m.adminVerified ? "plain" : "gold"} disabled={busy} onPress={() => void run(async () => { await A.setMember({ username: m.username, verified: !m.adminVerified }); setList((l) => l.map((x) => (x.username === m.username ? { ...x, adminVerified: !m.adminVerified } : x))); })} />
                <SmallButton title={m.official ? tt("officialRevoke") : tt("officialGrant")} disabled={busy} onPress={() => void set(m, { official: !m.official })} />
                <SmallButton title={tt("badgeBlock")} disabled={busy} onPress={() => void set(m, { badgeOverride: "none" })} />
                <SmallButton title={m.suspended ? tt("unsuspend") : tt("suspend")} tone="danger" disabled={busy} onPress={() => void set(m, { suspended: !m.suspended })} />
              </View>
            </View>
          </ListBox>
        </View>
      ))}
    </View>
  );
}

function Invites() {
  const t = useTheme();
  const tt = useTT();
  const { lang } = useLang();
  const { busy, msg, run } = useRun();
  const [list, setList] = useState<AdminInvite[] | null>(null);
  const [level, setLevel] = useState<Level>("master");
  const [uses, setUses] = useState("1");
  const [days, setDays] = useState("30");
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const load = useCallback(() => run(async () => setList((await A.invites()).invites)), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);
  const create = () => run(async () => {
    const d = await A.createInvite({ level, maxUses: Math.max(1, Number(uses) || 1), days: Math.max(1, Number(days) || 30), note });
    setCode(d.code); setCopied(false); setNote("");
    setList((await A.invites()).invites);
  });
  return (
    <View style={{ gap: 12 }}>
      <Box>
        <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{tt("createInvite")}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(["rising", "master", "sheikh"] as Level[]).map((l) => <Chip key={l} label={tt(`level_${l}` as TKey)} selected={level === l} onPress={() => setLevel(l)} />)}
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}><LabeledField label={tt("maxUses")} value={uses} onChangeText={(v) => setUses(v.replace(/\D/g, "").slice(0, 3))} keyboardType="number-pad" /></View>
          <View style={{ flex: 1 }}><LabeledField label={tt("validDays")} value={days} onChangeText={(v) => setDays(v.replace(/\D/g, "").slice(0, 3))} keyboardType="number-pad" /></View>
        </View>
        <LabeledField label={tt("note")} value={note} onChangeText={setNote} maxLength={120} />
        <GoldButton title={tt("createInvite")} onPress={() => void create()} busy={busy} disabled={busy} />
        {code ? (
          <View style={{ gap: 8, borderRadius: R.md, borderWidth: 1, borderColor: goldButton.line, padding: 12 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{tt("inviteCreated")}</Text>
            <Text selectable style={{ fontFamily: FONT.bold, fontSize: 20, letterSpacing: 1.5, color: t.ink, textAlign: "center", writingDirection: "ltr" }}>{code}</Text>
            <SmallButton title={copied ? tt("copied") : tt("copy")} onPress={() => void Clipboard.setStringAsync(code).then(() => setCopied(true))} />
          </View>
        ) : null}
      </Box>
      {msg ? <Muted>{msg}</Muted> : null}
      {list?.map((i) => (
        <Box key={i.id}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink, writingDirection: "ltr" }}>…{i.hint}</Text>
            <LevelBadge level={i.level} />
            {i.revoked ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.danger }}>{tt("revoked")}</Text> : null}
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>
            {[tt("uses", { n: i.uses, m: i.maxUses }), i.expiresAt ? tt("expires", { d: new Date(i.expiresAt).toLocaleDateString(lang) }) : "", i.note].filter(Boolean).join(" · ")}
          </Text>
          {i.usedBy.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.ink }}>{i.usedBy.map((u) => `@${u}`).join(", ")}</Text> : null}
          {!i.revoked ? <View style={{ flexDirection: "row" }}><SmallButton title={tt("revoke")} tone="danger" disabled={busy} onPress={() => void run(async () => { await A.revokeInvite(i.id); setList((await A.invites()).invites); })} /></View> : null}
        </Box>
      ))}
    </View>
  );
}

function Posts() {
  const t = useTheme();
  const tt = useTT();
  const { busy, msg, run } = useRun();
  const [list, setList] = useState<AdminPost[] | null>(null);
  const load = useCallback(() => run(async () => setList((await A.posts()).posts)), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);
  const act = (id: string, a: "approve" | "reject") => run(async () => { await A.review(id, a); setList((l) => l?.filter((p) => p.id !== id) ?? null); });
  return (
    <View style={{ gap: 10 }}>
      {msg ? <Muted>{msg}</Muted> : null}
      {list && !list.length ? <Muted>{tt("noPosts")}</Muted> : null}
      {list?.map((p) => (
        <Box key={p.id}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>@{p.author ?? "?"} · {p.type === "story" ? tt("typeStory") : tt("typePost")} · {p.verseKey ?? ""}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{[p.durationMs ? `${Math.round(p.durationMs / 1000)} s` : "", p.wordCheck !== null ? tt("checkScore", { n: p.wordCheck }) : "", p.hasVideo ? tt("withVideo") : ""].filter(Boolean).join(" · ")}</Text>
          {p.caption ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, color: t.ink }}>{p.caption}</Text> : null}
          {p.mediaUrl ? <MediaPreview path={p.mediaUrl} hasVideo={p.hasVideo} verseKey={p.verseKey} /> : <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.danger }}>{tt("mediaMissing")}</Text>}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <SmallButton title={tt("approve")} tone="gold" disabled={busy} onPress={() => void act(p.id, "approve")} />
            <SmallButton title={tt("reject")} tone="danger" disabled={busy} onPress={() => void act(p.id, "reject")} />
          </View>
        </Box>
      ))}
    </View>
  );
}

/** plays a clip or sample inside the moderation screen (the server lets admins stream every file) */
function MediaPreview({ path, hasVideo, verseKey }: { path: string; hasVideo: boolean; verseKey: string | null }) {
  const tt = useTT();
  const audio = useAudioPlayer(null);
  const st = useAudioPlayerStatus(audio);
  const video = useVideoPlayer(null);
  const [ready, setReady] = useState(false);
  const start = async () => {
    const src = await mediaSource(path);
    if (hasVideo) { video.replace(src); video.play(); } else { audio.replace(src); audio.play(); }
    setReady(true);
  };
  return (
    <View style={{ gap: 8 }}>
      {hasVideo ? (ready ? <View style={{ height: 320, borderRadius: R.md, overflow: "hidden" }}><VideoView player={video} style={{ flex: 1 }} contentFit="cover" nativeControls /></View> : null)
        : verseKey ? <View style={{ height: 220, borderRadius: R.md, overflow: "hidden" }}><ClipVisual verseKey={verseKey} name="" waveform={[]} progress={st.duration ? st.currentTime / st.duration : 1} /></View> : null}
      <SmallButton title={!hasVideo && st.playing ? tt("pause") : tt("listen")} onPress={() => (!hasVideo && st.playing ? audio.pause() : void start())} />
    </View>
  );
}

function Verifications() {
  const t = useTheme();
  const tt = useTT();
  const { lang } = useLang();
  const { busy, msg, run } = useRun();
  const [list, setList] = useState<AdminVerification[] | null>(null);
  const [reason, setReason] = useState("");
  const load = useCallback(() => run(async () => setList((await A.verifications()).applications)), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);
  const decide = (id: string, a: "approve" | "reject") => run(async () => { await A.decide(id, a, reason); setReason(""); setList((l) => l?.filter((x) => x.id !== id) ?? null); });
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{tt("verifyTabNote")}</Text>
      {msg ? <Muted>{msg}</Muted> : null}
      {list && !list.length ? <Muted>{tt("noApplications")}</Muted> : null}
      {list?.map((v) => (
        <Box key={v.id}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>@{v.username} · {v.realName}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{[v.country, v.rewaya, `RP ${v.reciterLevel}`, new Date(v.at).toLocaleDateString(lang)].filter(Boolean).join(" · ")}</Text>
          {v.teacher ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.ink }}>{v.teacher}</Text> : null}
          {v.ijazahInfo ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.ink }}>{v.ijazahInfo}</Text> : null}
          {v.sample ? <MediaPreview path={v.sample} hasVideo={false} verseKey={null} /> : null}
          <LabeledField label={tt("rejectReason")} value={reason} onChangeText={setReason} maxLength={200} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <SmallButton title={tt("approve")} tone="gold" disabled={busy} onPress={() => void decide(v.id, "approve")} />
            <SmallButton title={tt("reject")} tone="danger" disabled={busy} onPress={() => void decide(v.id, "reject")} />
          </View>
        </Box>
      ))}
    </View>
  );
}
