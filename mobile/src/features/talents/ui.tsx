import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SafetyContact } from "@/components/SafetyContact";
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SITE } from "@/lib/api";
import { BadgeButton, type Badge } from "./badges";
import { router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CALLIG_FONT, FONT, R, goldButton, useTheme } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { GoldButton, OutlineButton } from "@/components/brand";
import { CheckRow, FormError, LabeledField } from "@/components/form";
import { Loading, goBack } from "@/components/page";
import { useAuth } from "@/lib/auth";
import { countryName } from "@/lib/countries";
import { useLang, useT } from "@/i18n";
import { SharerBadge, SharerRing } from "@/features/share/SharerUI";
import { DefaultAvatar } from "@/features/community/ui";
import { FrameRing } from "@/features/cosmetics/art";
import { REPORT_CATEGORIES, T, errCode, type AgeStatus, type Level, type MeInfo, type ReportCategory, type TalentCard } from "./api";
import { useTT, type TKey } from "./text";
import { syncPendingProfile } from "./pendingProfile";
import { useUsernameText } from "./usernameText";

// Building blocks of the Quran Talents screens (Masterclass design): calligraphic avatar, gold verified tick, level
// badge, list rows, the safety bar (guidelines, report, block), the report sheet and the age step.

export function useTalentErr() {
  const tt = useTT();
  return (e: unknown) => {
    const code = errCode(e);
    if (code === "age") return tt("ageUnder13");
    if (code === "age16") return tt("age16");
    if (code === "profile_required") return tt("needProfile");
    const k = `e_${code}` as TKey;
    try { const s = tt(k); if (s && s !== k) return s; } catch { /* fall through */ }
    return tt("e_generic");
  };
}

/** avatar: the profile picture or the default silhouette (owner, build 20; also for members under 16); gold rim (thicker for gold and official badges) */
export function TalentAvatar({ name, size = 52, uri, badge, frame }: { name: string; size?: number; uri?: string | null; badge?: Badge | null; /** bought avatar frame (never instead of the verified tick) */ frame?: string | null }) {
  const [failed, setFailed] = useState(false);
  const strong = badge === "gold" || badge === "official" || badge === "founder";
  const rim = Math.max(2, size * (strong ? 0.06 : 0.035));
  if (frame) return <FrameRing frame={frame} size={size}><TalentAvatar name={name} size={size} uri={uri} badge={badge} /></FrameRing>;
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "rgb(8,58,44)", borderWidth: rim, borderColor: strong ? "#E2C77F" : goldButton.line, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {uri && !failed ? (
        // server avatars are paths (/api/community/avatar/…); a photo still waiting on the device is a file URI
        <Image source={{ uri: uri.startsWith("/") ? `${SITE}${uri}` : uri }} onError={() => setFailed(true)} style={{ width: size - rim * 2, height: size - rim * 2, borderRadius: size / 2 }} />
      ) : (
        <DefaultAvatar size={size - rim * 2} />
      )}
    </View>
  );
}

/** the gold verified tick */
export function VerifiedTick({ size = 16, label }: { size?: number; label: string }) {
  return (
    <View accessible accessibilityLabel={label} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: goldButton.to, alignItems: "center", justifyContent: "center" }}>
      <Icon name="check" color={goldButton.text} size={size * 0.68} weight={2.6} />
    </View>
  );
}

export function LevelBadge({ level }: { level: Level }) {
  const t = useTheme();
  const tt = useTT();
  const high = level === "master" || level === "sheikh";
  return (
    <View style={{ alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 3, borderRadius: R.pill, borderWidth: 1, borderColor: high ? goldButton.line : "transparent", backgroundColor: high ? "rgba(201,166,94,0.14)" : t.accentSoft }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: high ? t.gold : t.accent }}>{tt(`level_${level}` as TKey)}</Text>
    </View>
  );
}

/** a member in a list: avatar, name with tick, @username, level and country; tap opens the profile */
export function TalentRow({ c, right, first, sub }: { c: TalentCard; right?: ReactNode; first?: boolean; sub?: string }) {
  const t = useTheme();
  const tt = useTT();
  const { lang } = useLang();
  const meta = [tt(`level_${c.level}` as TKey), c.rewaya, c.country ? countryName(c.country, lang) : ""].filter(Boolean).join(" · ");
  return (
    <Pressable onPress={() => router.push(`/talents/u/${c.username}` as Href)} accessibilityRole="button" accessibilityLabel={`${c.name}, @${c.username}${c.verified ? `, ${tt("verified")}` : ""}, ${meta}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 64, backgroundColor: pressed ? t.bg : t.surface, borderTopWidth: first ? 0 : 1, borderTopColor: t.line })}>
      <SharerRing tier={c.sharerTier} size={46}><TalentAvatar name={c.name} size={46} uri={c.avatar} badge={c.badge} /></SharerRing>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.bold, fontSize: 15.5, color: t.ink }}>{c.name}</Text>
          <BadgeButton badge={c.badge ?? (c.verified ? "gold" : null)} size={15} />
        </View>
        <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "left", writingDirection: "ltr" }}>@{c.username}</Text>
        <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{sub ?? meta}</Text>
      </View>
      {right}
    </Pressable>
  );
}

export function ListBox({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>{children}</View>;
}

export function Muted({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.muted, textAlign: "center", paddingVertical: 18 }}>{children}</Text>;
}

export function SmallButton({ title, onPress, tone = "plain", disabled, label }: { title: string; onPress: () => void; tone?: "plain" | "gold" | "danger"; disabled?: boolean; label?: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label ?? title} accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => ({ minHeight: 40, paddingHorizontal: 14, borderRadius: R.md, alignItems: "center", justifyContent: "center", opacity: disabled || pressed ? 0.6 : 1,
        borderWidth: 1, borderColor: tone === "gold" ? goldButton.line : t.line, backgroundColor: tone === "gold" ? goldButton.to : t.surface })}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: tone === "gold" ? goldButton.text : tone === "danger" ? t.danger : t.ink }}>{title}</Text>
    </Pressable>
  );
}

/** guidelines + report/block, reachable on every network screen (App Store guideline 1.2) */
export function SafetyBar({ onReport, onBlock, blocked }: { onReport?: () => void; onBlock?: () => void; blocked?: boolean }) {
  const t = useTheme();
  const tt = useTT();
  const link = (title: string, fn: () => void, danger = false) => (
    <Pressable key={title} onPress={fn} accessibilityRole="button" hitSlop={6} style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 6 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: danger ? t.danger : t.accent }}>{title}</Text>
    </Pressable>
  );
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: t.line, paddingTop: 10, gap: 2 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="shield" color={t.muted} size={15} />
        <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{tt("safetyLine")}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 10 }}>
        {link(tt("guidelines"), () => router.push("/talents/guidelines" as Href))}
        {onReport ? link(tt("report"), onReport, true) : null}
        {onBlock ? link(blocked ? tt("unblock") : tt("block"), onBlock, !blocked) : null}
      </View>
    </View>
  );
}

/** sheet to report a profile or a message: category, optional details */
export function ReportSheet({ visible, title, onClose, onSubmit }: { visible: boolean; title: string; onClose: () => void; onSubmit: (c: ReportCategory, reason: string) => Promise<void> }) {
  const t = useTheme();
  const tt = useTT();
  const err = useTalentErr();
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState<ReportCategory | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => { if (visible) { setCat(null); setReason(""); setMsg(""); setDone(false); } }, [visible]);
  const send = async () => {
    if (!cat) return;
    setBusy(true); setMsg("");
    try { await onSubmit(cat, reason.trim()); setDone(true); } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose} transparent={Platform.OS !== "ios"}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 14 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tt("cancel")} hitSlop={10} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
              <Icon name="close" color={t.muted} size={20} />
            </Pressable>
          </View>
          {done ? (
            <>
              <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 23, color: t.ink }}>{tt("reported")}</Text>
              <GoldButton title={tt("done")} onPress={onClose} />
            </>
          ) : (
            <>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{tt("reportTitle")}</Text>
              <View accessibilityRole="radiogroup" style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
                {REPORT_CATEGORIES.map((c, i) => {
                  const on = cat === c;
                  return (
                    <Pressable key={c} onPress={() => setCat(c)} accessibilityRole="radio" accessibilityState={{ checked: on }}
                      style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50, paddingHorizontal: 14, borderTopWidth: i ? 1 : 0, borderTopColor: t.line }}>
                      <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: on ? goldButton.line : t.line, alignItems: "center", justifyContent: "center" }}>
                        {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: goldButton.to }} /> : null}
                      </View>
                      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{tt(`cat_${c}` as TKey)}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <LabeledField label={tt("reportDetails")} value={reason} onChangeText={setReason} maxLength={300} multiline />
              <FormError text={msg} />
              <GoldButton title={tt("sendReport")} onPress={send} busy={busy} disabled={!cat || busy} />
            </>
          )}
          <SafetyContact compact />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** birth year + confirmation; under 13 the community stays closed */
export function AgeStep({ onDone }: { onDone: (s: AgeStatus) => void }) {
  const t = useTheme();
  const tt = useTT();
  const err = useTalentErr();
  const [year, setYear] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const save = async () => {
    setBusy(true); setMsg("");
    try { onDone(await T.confirmAge(Number(year))); } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  return (
    <View style={{ gap: 14 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 20, color: t.ink }}>{tt("ageTitle")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted }}>{tt("ageLead")}</Text>
      <LabeledField label={tt("birthYear")} value={year} onChangeText={(v) => setYear(v.replace(/\D/g, "").slice(0, 4))} keyboardType="number-pad" maxLength={4} />
      <CheckRow checked={ok} onChange={setOk} label={tt("ageConfirm")}><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{tt("ageConfirm")}</Text></CheckRow>
      <FormError text={msg} />
      <GoldButton title={tt("ageSave")} onPress={save} busy={busy} disabled={!ok || year.length !== 4 || busy} />
    </View>
  );
}

export type Access = { state: "load" | "signin" | "age" | "under13" | "ok" | "error"; age: AgeStatus | null; me: MeInfo | null; reload: () => void; setAge: (s: AgeStatus) => void };

/** who may use the network screens: signed in, birth year known, 13+ (16+ is checked per action by the server) */
export function useTalentAccess(): Access {
  const { user } = useAuth();
  const [state, setState] = useState<Access["state"]>("load");
  const [age, setAgeS] = useState<AgeStatus | null>(null);
  const [me, setMe] = useState<MeInfo | null>(null);
  const load = useCallback(async () => {
    if (!user) { setState("signin"); return; }
    try {
      const a = await T.age();
      setAgeS(a);
      if (!a.known) { setState("age"); return; }
      if (!a.community) { setState("under13"); return; }
      await syncPendingProfile(); // a profile set up in the onboarding before sign-in
      setMe(await T.me());
      setState("ok");
    } catch { setState("error"); }
  }, [user]);
  useEffect(() => { void load(); }, [load]);
  const setAge = (s: AgeStatus) => { setAgeS(s); if (s.community) void load(); else setState("under13"); };
  return { state, age, me, reload: load, setAge };
}

/** what a network screen shows before its content: sign-in, age step, under-13 notice */
export function AccessGate({ a, children }: { a: Access; children: ReactNode }) {
  const t = useTheme();
  const ut = useUsernameText();
  const tt = useTT();
  const tr = useT();
  // no @username yet: the social features wait for the username step (owner 22.10.2026)
  if (a.state === "ok" && a.me && !a.me.profile) return (
    <View style={{ padding: 20, gap: 14 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{ut.needed}</Text>
      <GoldButton title={ut.title} onPress={() => router.push("/username" as Href)} />
      <SafetyBar />
    </View>
  );
  if (a.state === "ok") return <>{children}</>;
  // while the account and the age load: a spinner, never an empty area under the hero
  if (a.state === "load") return <View style={{ minHeight: 160 }}><Loading /></View>;
  return (
    <View style={{ padding: 20, gap: 14 }}>
      {a.state === "signin" ? (
        <>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{tt("signIn")}</Text>
          <GoldButton title={tt("signInBtn")} onPress={() => router.push("/sign-in" as Href)} />
        </>
      ) : a.state === "age" ? (
        <AgeStep onDone={a.setAge} />
      ) : a.state === "under13" ? (
        <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{tt("ageUnder13")}</Text>
      ) : (
        <>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted }}>{tt("e_generic")}</Text>
          <OutlineButton title={tr("common.retry")} onPress={a.reload} />
        </>
      )}
      <SafetyBar />
    </View>
  );
}

export { SharerBadge };

/** expo-router ErrorBoundary of the network routes (profile, follower lists, search): a failure shows Back and Retry
 * instead of a white screen. Used as `export { TalentsRouteError as ErrorBoundary }` in the route file. */
export function TalentsRouteError({ retry }: { error: Error; retry: () => Promise<void> }) {
  const t = useTheme();
  const tt = useTT();
  const tr = useT();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: t.dark ? t.bg : t.surface, paddingTop: insets.top + 3 }}>
      <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel={tr("common.back")} hitSlop={6}
        style={{ width: 44, height: 44, marginStart: 6, alignItems: "center", justifyContent: "center" }}>
        <Icon name="chevronLeft" color={t.ink} size={26} weight={2.2} />
      </Pressable>
      <View style={{ padding: 20, gap: 14 }}>
        <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{tt("e_generic")}</Text>
        <GoldButton title={tr("common.retry")} onPress={() => void retry()} />
        <SafetyBar />
      </View>
    </View>
  );
}

/** entry card on the Discover tab */
export function TalentsCard() {
  const t = useTheme();
  const tt = useTT();
  return (
    <Pressable onPress={() => router.push("/talents" as Href)} accessibilityRole="button" accessibilityLabel={`${tt("card")}. ${tt("cardText")}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: R.lg, borderWidth: 1, borderColor: goldButton.line, backgroundColor: pressed ? t.bg : t.surface })}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgb(8,58,44)", borderWidth: 1.5, borderColor: goldButton.line, alignItems: "center", justifyContent: "center" }}>
        <Icon name="starBig" color="#e8d3a0" size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{tt("card")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, marginTop: 2 }}>{tt("cardText")}</Text>
      </View>
      <Icon name="chevronRight" color={t.muted} size={16} />
    </Pressable>
  );
}
