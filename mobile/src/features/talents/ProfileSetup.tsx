import { useEffect, useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { FONT, R, goldButton, stage } from "@/lib/theme";
import { Display, GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { DefaultAvatar } from "@/features/community/ui";
import { pickAvatarLocal } from "./avatar";
import { readPending, savePending, syncPendingProfile } from "./pendingProfile";
import { useUsernameCheck, usernameBlocked } from "./UsernameCheck";
import { usePT, type PKey } from "./profileText";
import { useTT } from "./text";

// Onboarding step "Your profile" (inserted into the first-run funnel after the name question; the funnel's scene
// stays as it is): display name (prefilled), @username with the live check, an optional photo (library or camera),
// the choice between a public and a private account (nothing preselected), and a clear "Later". Without an account
// everything waits on the device (pendingProfile.ts) and is created after sign-in; signed in, the profile is created
// right away. Everything can be changed later in Edit profile.
const ascii = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9_.]/g, "").replace(/\.{2,}/g, ".").replace(/^\.|\.$/g, "").slice(0, 20);

export function ProfileSetupStep({ name: firstName, onDone }: { name: string; onDone: () => void }) {
  const pt = usePT();
  const tt = useTT();
  const { user } = useAuth();
  const pending = readPending();
  const [name, setName] = useState(pending?.name ?? firstName ?? "");
  const [username, setUsername] = useState(pending?.username ?? ascii(firstName ?? ""));
  const [photo, setPhoto] = useState<string | null>(pending?.photo ?? null);
  // who may follow: nothing preselected (BLUEPRINT §2); the profile is only created with a choice
  const [visibility, setVisibility] = useState<"public" | "private" | null>(pending?.visibility ?? null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const check = useUsernameCheck(username, null, !!user);
  useEffect(() => { if (!username && firstName) setUsername(ascii(firstName)); }, [firstName]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (src: "library" | "camera") => {
    setMsg("");
    void pickAvatarLocal(src, true).then((u) => { if (u) setPhoto(u); }).catch((e) => setMsg(e instanceof Error && e.message === "permission" ? tt("photoDenied") : tt("e_generic")));
  };
  const ok = name.trim().length > 0 && /^[a-z0-9_.]{3,20}$/.test(username) && !usernameBlocked(check) && check !== "checking" && !!visibility;
  const save = async () => {
    setBusy(true); setMsg("");
    savePending({ name: name.trim(), username, photo, visibility: visibility ?? "private" });
    await syncPendingProfile(); // signed in: created now; otherwise after sign-in
    setBusy(false);
    onDone();
  };
  const field = { borderRadius: R.lg, borderWidth: 1, borderColor: "rgba(214,180,108,0.4)", color: "#fff", fontFamily: FONT.regular, fontSize: 17, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "rgba(255,255,255,0.05)" } as const;
  const label = (s: string) => <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.textSoft, marginBottom: 6 }}>{s}</Text>;
  const status = check === "ok" ? pt("usernameFree") : check === "checking" ? pt("usernameChecking") : check === "idle" ? (user ? "" : pt("usernameOffline")) : pt(`username_${check}` as PKey);

  return (
    <View>
      <Display size="title1" onStage style={{ marginBottom: 8 }}>{pt("setupTitle")}</Display>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: stage.textMuted, marginBottom: 18 }}>{pt("setupLead")}</Text>

      {/* photo */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, borderWidth: 2.5, borderColor: goldButton.line, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
          {photo ? <Image source={{ uri: photo }} style={{ width: 79, height: 79 }} accessibilityIgnoresInvertColors /> : <DefaultAvatar size={79} />}
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.textSoft }}>{pt("photoOptional")}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(["library", "camera"] as const).map((src) => (
              <Pressable key={src} onPress={() => pick(src)} accessibilityRole="button"
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 38, paddingHorizontal: 12, borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(214,180,108,0.5)", backgroundColor: pressed ? "rgba(255,255,255,0.08)" : "transparent" })}>
                <Icon name={src === "library" ? "grid" : "eye"} color={stage.gold} size={14} />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: "#fff" }}>{src === "library" ? tt("photoPick") : tt("photoTake")}</Text>
              </Pressable>
            ))}
            {photo ? (
              <Pressable onPress={() => setPhoto(null)} accessibilityRole="button" style={{ minHeight: 38, justifyContent: "center", paddingHorizontal: 6 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.textMuted }}>{tt("photoRemove")}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      {label(pt("displayName"))}
      <TextInput value={name} onChangeText={setName} maxLength={40} accessibilityLabel={pt("displayName")} autoCapitalize="words" autoCorrect={false} textContentType="name" style={field} />
      <View style={{ height: 14 }} />
      {label(pt("usernameLabel"))}
      <View style={[field, { flexDirection: "row", alignItems: "center", paddingVertical: 0 }]}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 17, color: stage.gold }}>@</Text>
        <TextInput value={username} onChangeText={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_.]/g, ""))} maxLength={20} accessibilityLabel={pt("usernameLabel")}
          autoCapitalize="none" autoCorrect={false} textContentType="username" style={{ flex: 1, color: "#fff", fontFamily: FONT.regular, fontSize: 17, paddingVertical: 12, paddingLeft: 2, textAlign: "left", writingDirection: "ltr" }} />
        {check === "ok" ? <Icon name="checkCircle" color={goldButton.from} size={18} /> : null}
      </View>
      {status ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13, marginTop: 6, color: check === "ok" ? goldButton.from : usernameBlocked(check) ? "#f2b8a8" : stage.textMuted }}>{status}</Text> : null}
      {msg ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, marginTop: 8, color: "#f2b8a8" }}>{msg}</Text> : null}

      {/* visibility: public account or private account (new followers need approval) */}
      <View style={{ height: 18 }} />
      {label(pt("visTitle"))}
      <View style={{ gap: 8 }} accessibilityRole="radiogroup">
        {([["public", pt("visPublic"), pt("visPublicD")], ["private", tt("privateAccount"), tt("privateAccountHint")]] as const).map(([v, title, desc]) => {
          const on = visibility === v;
          return (
            <Pressable key={v} onPress={() => setVisibility(v)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${title}. ${desc}`}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: R.md, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, minHeight: 56,
                borderColor: on ? stage.gold : "rgba(214,180,108,0.3)", backgroundColor: on ? "rgba(214,180,108,0.12)" : pressed ? "rgba(255,255,255,0.06)" : "rgba(6,30,23,0.62)" })}>
              <Icon name={v === "public" ? "globe" : "lock"} color={stage.gold} size={16} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: "#fff" }}>{title}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: stage.textMuted, marginTop: 2 }}>{desc}</Text>
              </View>
              {on ? <Icon name="checkCircle" color={stage.gold} size={20} /> : null}
            </Pressable>
          );
        })}
      </View>

      <GoldButton title={tt("save")} onPress={() => void save()} busy={busy} disabled={!ok || busy} style={{ marginTop: 22 }} />
      <Text onPress={onDone} accessibilityRole="button" style={{ fontFamily: FONT.medium, fontSize: 15, color: stage.textSoft, textAlign: "center", paddingVertical: 14 }}>{pt("later")}</Text>
    </View>
  );
}
