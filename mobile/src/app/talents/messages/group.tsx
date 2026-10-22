import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { FONT, R, useTheme } from "@/lib/theme";
import { Page, PageHero } from "@/components/page";
import { GlassCard, GoldButton, Segmented } from "@/components/brand";
import { errCode } from "@/features/talents/api";
import { AccessGate, Muted, useTalentAccess } from "@/features/talents/ui";
import { M, type Audience } from "@/features/messenger/api";
import { errorText } from "@/features/messenger/text";
import { useMT } from "@/features/messenger/ui";

// /talents/messages/group – a new group (16+, up to 256 members). Sisters-only and brothers-only use the identity
// gender stated in Together, the same rule as study circles. Members are added afterwards in the group info.
export default function NewGroup() {
  const t = useTheme();
  const mt = useMT();
  const a = useTalentAccess();
  const [name, setName] = useState("");
  const [aud, setAud] = useState<Audience>("all");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const create = async () => {
    setBusy(true); setMsg("");
    try { const d = await M.createGroup(name.trim(), aud); router.replace(`/talents/messages/info/${d.id}` as Href); }
    catch (e) { setMsg(errorText(mt, errCode(e))); } finally { setBusy(false); }
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page keyboardShouldPersistTaps="handled">
        <PageHero back topInset arcade={false} eyebrow={mt.title} title={mt.newGroup} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 16 }}>
            {!a.age?.interact ? <Muted>{mt.e_age16}</Muted> : (
              <GlassCard style={{ gap: 14 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{mt.groupName}</Text>
                <TextInput value={name} onChangeText={setName} maxLength={60} accessibilityLabel={mt.groupName} autoFocus
                  style={{ minHeight: 46, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 12, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{mt.audience}</Text>
                <Segmented stretch value={aud} onChange={setAud} options={[["all", mt.aud_all], ["sisters", mt.aud_sisters], ["brothers", mt.aud_brothers]]} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{mt.audienceHint}</Text>
                {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.danger }}>{msg}</Text> : null}
                <GoldButton title={mt.create} icon="users" onPress={() => void create()} busy={busy} disabled={name.trim().length < 2} />
              </GlassCard>
            )}
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{mt.privacy}</Text>
          </View>
        </AccessGate>
      </Page>
    </>
  );
}
