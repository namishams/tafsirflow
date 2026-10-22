import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ARABIC_FONT, FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { GoldButton, OutlineButton, Segmented, Stage } from "@/components/brand";
import { LabeledField } from "@/components/form";
import { Icon } from "@/components/icons";
import { goBack } from "@/components/page";
import { useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { RECITERS } from "@/lib/quran";
import { bioText, reciterBio } from "@/web/reciters";
import { useBioTexts } from "@/features/library/content";
import { countryName } from "@/features/reciters/common";
import { STAR_API, type StarState } from "./api";
import { starText, type StarKey } from "./starText";

// Unclaimed star profile in the app (owner 22.10.2026), 1:1 with the website's StarProfileWeb: name, Arabic name,
// country, the short biography from the reciters data, the recitations in the reader's player and the biography. A
// clear label says that the reciter does not run this profile (App Store 5.2: no impersonation); no posts, messages or
// follower counts. "Is this you?" opens the takeover form (signed in, Quran Talents profile, link to an official channel).
export function StarProfileScreen({ username, reciterSlug, invite, state }: { username: string; reciterSlug: string; invite?: string; state: StarState | null }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { lang } = useLang();
  const s = starText(lang);
  const more = useBioTexts();
  const tr = useT();
  const r = reciterBio(reciterSlug);
  const [open, setOpen] = useState(!!state?.invited);
  useEffect(() => { if (state?.invited) setOpen(true); }, [state?.invited]);
  if (!r) return null;
  const tx = bioText(r, lang, more);
  const player = r.playerSlug ? RECITERS.find((x) => x.slug === r.playerSlug) : undefined;
  const life = r.born || r.died ? `${r.born ?? "?"}${r.died ? ` – ${r.died}` : ""}` : "";
  // the reciter screen starts the voice in the reader (and handles Pro voices), like the website's /surah/1?reciter=
  const listen = () => router.push(`/reciters/${r.slug}` as Href);
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="light" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <Stage hairlines={false}>
          <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 20, paddingBottom: 36, alignItems: "center" }}>
            <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel={tr("common.back")} hitSlop={8} style={{ alignSelf: "flex-start", width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Icon name="chevronLeft" color="rgba(255,255,255,0.75)" size={26} weight={2.2} />
            </Pressable>
            <View style={{ width: 108, height: 108, borderRadius: 54, backgroundColor: "rgb(8,58,44)", borderWidth: 2, borderColor: stage.gold, alignItems: "center", justifyContent: "center", marginTop: 4 }}>
              <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 30, lineHeight: 52, color: stage.gold }}>{r.arabic.split(" ")[0]}</Text>
            </View>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 34, color: "#eef0f3", marginTop: 16, textAlign: "center" }}>{r.name}</Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4, writingDirection: "ltr" }}>@{username}</Text>
            <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 42, color: stage.gold, writingDirection: "rtl", marginTop: 2 }}>{r.arabic}</Text>
            <View accessible accessibilityRole="text" style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", backgroundColor: "rgba(255,255,255,0.10)", maxWidth: "100%" }}>
              <Icon name="shield" color="#eef0f3" size={16} />
              <Text style={{ flexShrink: 1, fontFamily: FONT.semibold, fontSize: 13.5, lineHeight: 18, color: "#eef0f3" }}>{s.label}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 28, marginTop: 18 }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{s.country}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: "#eef0f3" }}>{countryName(r, lang)}</Text>
              </View>
              {life ? <View style={{ alignItems: "center", justifyContent: "flex-end" }}><Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: "#eef0f3" }}>{life}</Text></View> : null}
            </View>
          </View>
        </Stage>
        <View style={{ padding: 20, gap: 16 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 17, lineHeight: 26, color: t.ink }}>{tx.short}</Text>
          <View style={{ gap: 10 }}>
            {player ? <GoldButton title={s.listen} icon="play" onPress={listen} /> : null}
            <OutlineButton title={s.biography} onPress={() => router.push(`/reciters/${r.slug}` as Href)} />
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted }}>{s.labelNote}</Text>
          {state?.pending ? <Note text={s.sent} /> : open ? <ClaimForm username={username} died={!!r.died} invite={state?.invited ? invite : undefined} s={s} /> : (
            <OutlineButton title={s.claim} onPress={() => setOpen(true)} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Note({ text }: { text: string }) {
  const t = useTheme();
  return <View accessibilityLiveRegion="polite" style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16 }}><Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{text}</Text></View>;
}

function ClaimForm({ username, died, invite, s }: { username: string; died: boolean; invite?: string; s: Record<StarKey, string> }) {
  const t = useTheme();
  const { user } = useAuth();
  const [role, setRole] = useState<"self" | "team">(died ? "team" : "self");
  const [channel, setChannel] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<"" | "signin" | "needProfile" | "badChannel" | "error">("");
  if (sent) return <Note text={s.sent} />;
  const send = async () => {
    setBusy(true); setErr("");
    try {
      await STAR_API.claim(username, { role, channel: channel.trim(), message, invite });
      setSent(true);
    } catch (e) {
      const c = e instanceof ApiError ? e.code : "";
      setErr(c === "login" || c === "verify" ? "signin" : c === "profile_needed" ? "needProfile" : c === "channel" ? "badChannel" : "error");
    } finally { setBusy(false); }
  };
  return (
    <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: goldButton.line, backgroundColor: t.surface, padding: 16, gap: 14 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{s.formTitle}</Text>
      {invite ? <Text style={{ alignSelf: "flex-start", fontFamily: FONT.semibold, fontSize: 13, color: t.ink, backgroundColor: "rgba(201,166,94,0.15)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, overflow: "hidden" }}>{s.invited}</Text> : null}
      {!user ? (
        <>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{s.signin}</Text>
          <GoldButton title={s.claim} onPress={() => router.push("/account" as Href)} />
        </>
      ) : (
        <>
          <Segmented<"self" | "team"> value={role} onChange={setRole} options={died ? [["team", s.roleTeam]] : [["self", s.roleSelf], ["team", s.roleTeam]]} />
          <LabeledField label={s.channel} value={channel} onChangeText={setChannel} placeholder="https://" autoCapitalize="none" autoCorrect={false} keyboardType="url" maxLength={300} />
          <LabeledField label={s.message} value={message} onChangeText={setMessage} multiline maxLength={1000} style={{ minHeight: 96, textAlignVertical: "top" }} />
          {err ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.danger }}>{s[err]}</Text> : null}
          {err === "needProfile" ? <OutlineButton title="@" onPress={() => router.push("/username" as Href)} /> : null}
          <GoldButton title={s.send} busy={busy} disabled={busy || !channel.trim()} onPress={() => void send()} />
        </>
      )}
    </View>
  );
}
