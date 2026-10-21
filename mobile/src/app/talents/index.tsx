import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { FONT, R, useTheme } from "@/lib/theme";
import { Page, PageHero, LinkRow, RowGroup } from "@/components/page";
import { Chip, OutlineButton } from "@/components/brand";
import { LabeledField } from "@/components/form";
import { Icon } from "@/components/icons";
import { countryList, countryName } from "@/lib/countries";
import { useLang } from "@/i18n";
import { LEVELS, T, type Level, type TalentCard } from "@/features/talents/api";
import { useTT, type TKey } from "@/features/talents/text";
import { BadgeButton, BadgeSheetHost } from "@/features/talents/badges";
import { ScrollView } from "react-native";
import { CountryPicker } from "@/features/talents/CountryPicker";
import { AccessGate, ListBox, Muted, SafetyBar, SmallButton, TalentAvatar, TalentRow, useTalentAccess, useTalentErr } from "@/features/talents/ui";
import { FOCUSES, STUDY_STAGES, type Focus, type StudyStage } from "@/features/sijill/api";
import { usePostingOn, useSijillFlags } from "@/features/sijill/config";
import { useST, type SKey } from "@/features/sijill/text";

// /talents – Discover talents: search, filters (country, rewaya, level, verified), paged list; entry to messages,
// requests and the own profile. Masterclass design. Sijill: friends' achievements, leaderboards, study buddies and
// discovery by madrasa stage, focus and the surah being memorised (only members who show those sections).
export default function DiscoverTalents() {
  const t = useTheme();
  const tt = useTT();
  const err = useTalentErr();
  const { lang } = useLang();
  const a = useTalentAccess();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [rewaya, setRewaya] = useState("");
  const [level, setLevel] = useState<Level | null>(null);
  const [verified, setVerified] = useState(false);
  const [list, setList] = useState<TalentCard[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [picker, setPicker] = useState(false);
  const [unread, setUnread] = useState(0);
  const [incoming, setIncoming] = useState(0);
  const [notes, setNotes] = useState(0);
  const [suggested, setSuggested] = useState<TalentCard[]>([]);
  const st = useST();
  const postingOn = usePostingOn();
  const flags = useSijillFlags();
  const [stage, setStage] = useState<StudyStage | null>(null);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [surah, setSurah] = useState("");
  const seq = useRef(0);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (q.trim()) p.q = q.trim();
    if (country) p.country = country;
    if (rewaya.trim()) p.rewaya = rewaya.trim();
    if (level) p.level = level;
    if (verified) p.verified = "1";
    if (stage) p.stage = stage;
    if (focus) p.focus = focus;
    const sn = Number(surah);
    if (Number.isInteger(sn) && sn >= 1 && sn <= 114) p.surah = String(sn);
    return p;
  }, [q, country, rewaya, level, verified, stage, focus, surah]);

  const load = useCallback(async (cursor?: string) => {
    const my = ++seq.current;
    setBusy(true); setMsg("");
    try {
      const d = await T.talents(cursor ? { ...params, cursor } : params);
      if (my !== seq.current) return;
      setList((old) => (cursor ? [...old, ...d.talents] : d.talents));
      setNext(d.next);
    } catch (e) { if (my === seq.current) setMsg(err(e)); } finally { if (my === seq.current) setBusy(false); }
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (a.state !== "ok") return;
    const h = setTimeout(() => { void load(); }, 250);
    return () => clearTimeout(h);
  }, [a.state, load]);
  useEffect(() => {
    if (a.state !== "ok") return;
    T.notifications().then((d) => setNotes(d.unread)).catch(() => undefined);
    T.suggested().then((d) => setSuggested(d.talents)).catch(() => undefined);
  }, [a.state]);
  useEffect(() => {
    if (a.state !== "ok" || !a.age?.interact) return;
    T.conversations().then((d) => setUnread(d.unread)).catch(() => undefined);
    T.connections().then((d) => setIncoming(d.incoming.length)).catch(() => undefined);
  }, [a.state, a.age?.interact]);

  const mine = a.me?.profile?.username;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
      <Page>
        <PageHero back topInset eyebrow={tt("network")} title={tt("discoverTitle")} lead={tt("discoverLead")} arcade={false} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 16 }}>
            <RowGroup>
              <LinkRow first icon="user" title={mine ? tt("myTalentProfile") : tt("createProfile")} subtitle={mine ? `@${mine}` : tt("needProfile")}
                onPress={() => router.push((mine ? `/talents/u/${mine}` : "/community/me") as Href)} />
              {postingOn ? <LinkRow icon="reels" title={tt("watchClips")} onPress={() => router.push("/talents/player?src=reels" as Href)} /> : null}
              {mine ? <LinkRow icon="trophy" title={st("title")} subtitle={st("privacyBtn")} onPress={() => router.push("/talents/sijill" as Href)} /> : null}
              <LinkRow icon="starBig" title={st("friends")} onPress={() => router.push("/talents/friends" as Href)} />
              {flags.leaderboards && mine ? <LinkRow icon="list" title={st("leaderboards")} onPress={() => router.push("/talents/leaderboard" as Href)} /> : null}
              {a.age?.interact && mine ? <LinkRow icon="user" title={st("buddies")} subtitle={st("buddiesLead")} onPress={() => router.push("/talents/buddies" as Href)} /> : null}
              <LinkRow icon="heart" title={tt("notifications")} subtitle={notes ? tt("unread", { n: notes }) : undefined} onPress={() => router.push("/talents/notifications" as Href)} />
              {a.age?.interact ? <LinkRow icon="comment" title={tt("messages")} subtitle={unread ? tt("unread", { n: unread }) : undefined} onPress={() => router.push("/talents/messages" as Href)} /> : null}
              {a.age?.interact ? <LinkRow icon="list" title={tt("requestsTitle")} subtitle={incoming ? `${tt("incoming")}: ${incoming}` : undefined} onPress={() => router.push("/talents/requests" as Href)} /> : null}
            </RowGroup>
            {suggested.length ? (
              <View style={{ gap: 10 }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{tt("suggested")}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {suggested.map((s) => <SuggestCard key={s.username} c={s} onFollowed={() => setSuggested((l) => l.filter((x) => x.username !== s.username))} />)}
                </ScrollView>
              </View>
            ) : null}
            {!a.age?.interact ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted }}>{tt("age16")}</Text> : null}

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14 }}>
              <Icon name="search" color={t.muted} size={18} />
              <TextInput value={q} onChangeText={setQ} placeholder={tt("search")} placeholderTextColor={t.muted} accessibilityLabel={tt("search")} autoCapitalize="none" autoCorrect={false} returnKeyType="search"
                style={{ flex: 1, fontFamily: FONT.regular, fontSize: 16, color: t.ink, paddingVertical: 0 }} />
            </View>
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{tt("filterLevel")}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <Chip label={tt("all")} selected={!level} onPress={() => setLevel(null)} />
                {LEVELS.map((l) => <Chip key={l} label={tt(`level_${l}` as TKey)} selected={level === l} onPress={() => setLevel(level === l ? null : l)} />)}
                <Chip label={tt("verifiedOnly")} selected={verified} onPress={() => setVerified(!verified)} />
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{st("filterStage")}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {STUDY_STAGES.map((x) => <Chip key={x} label={st(`stage_${x}` as SKey).split(" (")[0]} selected={stage === x} onPress={() => setStage(stage === x ? null : x)} />)}
              </View>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{st("filterFocus")}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {FOCUSES.map((x) => <Chip key={x} label={st(`focus_${x}` as SKey)} selected={focus === x} onPress={() => setFocus(focus === x ? null : x)} />)}
              </View>
              <LabeledField label={st("filterSurah")} value={surah} onChangeText={(v) => setSurah(v.replace(/[^0-9]/g, "").slice(0, 3))} placeholder={st("surahHint")} keyboardType="number-pad" maxLength={3} />
            </View>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-end" }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{tt("filterCountry")}</Text>
                <Pressable onPress={() => setPicker(true)} accessibilityRole="button" accessibilityLabel={`${tt("filterCountry")}: ${country ? countryName(country, lang) : tt("anyCountry")}`}
                  style={{ height: 52, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" }}>
                  <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, color: country ? t.ink : t.muted }}>{country ? countryName(country, lang) : tt("anyCountry")}</Text>
                  <Icon name="chevronDown" color={t.muted} size={16} />
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>
                <LabeledField label={tt("filterRewaya")} value={rewaya} onChangeText={setRewaya} placeholder={tt("rewayaFilterHint")} maxLength={40} autoCorrect={false} />
              </View>
            </View>

            {msg ? <Muted>{msg}</Muted> : !list.length && !busy ? <Muted>{tt("empty")}</Muted> : (
              <ListBox>{list.map((c, i) => <TalentRow key={c.username} c={c} first={i === 0} />)}</ListBox>
            )}
            {next ? <OutlineButton title={tt("loadMore")} onPress={() => void load(next)} disabled={busy} /> : null}
            <SafetyBar />
          </View>
        </AccessGate>
      </Page>
      </BadgeSheetHost>
      <CountryPicker visible={picker} onClose={() => setPicker(false)} onPick={(c) => { setCountry(c); setPicker(false); }} />
    </>
  );
}

function SuggestCard({ c, onFollowed }: { c: TalentCard; onFollowed: () => void }) {
  const t = useTheme();
  const tt = useTT();
  const [busy, setBusy] = useState(false);
  return (
    <View style={{ width: 150, padding: 12, gap: 6, alignItems: "center", borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
      <Pressable onPress={() => router.push(`/talents/u/${c.username}` as Href)} accessibilityRole="link" accessibilityLabel={c.name} style={{ alignItems: "center", gap: 6 }}>
        <TalentAvatar name={c.name} size={64} uri={c.avatar} badge={c.badge} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{c.name}</Text>
          <BadgeButton badge={c.badge} size={13} />
        </View>
        <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{tt(`level_${c.level}` as TKey)}</Text>
      </Pressable>
      <SmallButton title={tt("follow")} tone="gold" disabled={busy} label={`${tt("follow")}, ${c.name}`} onPress={() => { setBusy(true); void T.follow(c.username, true).then(onFollowed).catch(() => setBusy(false)); }} />
    </View>
  );
}
