import { useCallback, useState } from "react";
import { Alert, Platform, Text, TextInput, View } from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { FONT, R, useTheme } from "@/lib/theme";
import { GoldButton, OutlineButton, TextLink } from "@/components/brand";
import { LinkRow, Loading, Page, PageHero, RowGroup, ErrorState } from "@/components/page";
import { intlLocale, useLang, useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { addPasskey, passkeysAvailable, securityApi, type Security } from "@/features/auth/api";
import { ConfirmCode } from "@/features/auth/ConfirmCode";
import { useAuthT } from "@/features/auth/text";

// /account/security – Security and sign-in (same screen as the website's /account/security): ways to sign in,
// passkeys (add in the system sign-in sheet, rename, remove), signed-in devices (sign out one or all others).
export default function SecurityScreen() {
  const theme = useTheme();
  const t = useT();
  const tx = useAuthT();
  const { lang } = useLang();
  const { user } = useAuth();
  const [d, setD] = useState<Security | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ k: string; text: string; bad?: boolean } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await securityApi.load();
      if (r.ok) { setD(r.data); setFailed(false); } else setFailed(true);
    } catch { setFailed(true); }
  }, []);
  useFocusEffect(useCallback(() => { if (user) void load(); else router.back(); }, [user, load]));

  const date = (x: string | null) => (x ? new Date(x).toLocaleDateString(intlLocale(lang), { day: "numeric", month: "long", year: "numeric" }) : "");
  const flash = (k: string, text: string, bad = false) => setMsg({ k, text, bad });
  const act = async (body: Record<string, unknown>, k: string, ok?: string) => {
    setBusy(true); setMsg(null);
    try {
      const r = await securityApi.act(body);
      if (!r.ok) flash(k, tx("errGeneric"), true); else if (ok) flash(k, ok);
      await load();
      return r.ok;
    } catch { flash(k, t("common.offline"), true); return false; } finally { setBusy(false); }
  };
  const add = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await addPasskey(lang);
      if (r === "reauth") { setConfirm(true); return; }
      if (r === "added") { setConfirm(false); flash("pk", tx("added")); }
      else if (r === "failed") flash("pk", tx("errGeneric"), true);
      await load(); // Android may report "dismiss" although the passkey was saved
    } catch { flash("pk", t("common.offline"), true); } finally { setBusy(false); }
  };
  const ask = (title: string, onYes: () => void, destructive = true) => {
    if (Platform.OS === "web") { onYes(); return; }
    Alert.alert(title, undefined, [{ text: t("common.cancel"), style: "cancel" }, { text: destructive ? tx("remove") : tx("signOut"), style: "destructive", onPress: onYes }]);
  };
  const setPassword = async () => {
    if (!d) return;
    setBusy(true); setMsg(null);
    try { const r = await securityApi.setPassword(d.email, lang); flash("pw", r.ok ? tx("passwordSent") : tx("errGeneric"), !r.ok); }
    catch { flash("pw", t("common.offline"), true); } finally { setBusy(false); }
  };

  const note = (k: string) => (msg?.k === k ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: msg.bad ? theme.danger : theme.accent }}>{msg.text}</Text> : null);
  if (!d) return <>
    <Stack.Screen options={{ headerShown: false }} />
    {failed ? <ErrorState retry={() => void load()} /> : <Loading />}
  </>;
  const others = d.sessions.filter((s) => !s.current);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow="Quran Masterclass" title={tx("security")} lead={tx("securityLead")} />
        <View style={{ padding: 16, gap: 22 }}>
          <Section title={tx("methods")}>
            <RowGroup>
              <LinkRow first title={tx("methodCode")} icon="send" right={<Badge text={tx("on")} on />} />
              <LinkRow title={tx("passkeys")} icon="lock" right={<Badge text={d.passkeys.length ? tx("count", { n: d.passkeys.length }) : tx("off")} on={d.passkeys.length > 0} />} />
              <LinkRow title={tx("methodPassword")} icon="shield" right={<Badge text={d.hasPassword ? tx("on") : tx("optionalOff")} on={d.hasPassword} />} />
            </RowGroup>
            {!d.hasPassword ? <OutlineButton compact title={tx("setPassword")} disabled={busy} onPress={() => void setPassword()} style={{ alignSelf: "flex-start" }} /> : null}
            {note("pw")}
          </Section>

          <Section title={tx("passkeys")}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: theme.muted }}>{tx("passkeysLead")}</Text>
            {d.passkeys.length ? (
              <RowGroup>
                {d.passkeys.map((k, i) => editing === k.id ? (
                  <View key={k.id} style={{ padding: 14, gap: 10, borderTopWidth: i ? 1 : 0, borderTopColor: theme.line }}>
                    <TextInput value={name} onChangeText={setName} maxLength={60} autoFocus accessibilityLabel={tx("name")} placeholder={tx("name")} placeholderTextColor={theme.muted}
                      style={{ height: 48, borderRadius: R.md, borderWidth: 1, borderColor: theme.line, paddingHorizontal: 12, fontFamily: FONT.regular, fontSize: 16, color: theme.ink, backgroundColor: theme.bg }} />
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <OutlineButton compact title={tx("save")} disabled={busy || !name.trim()} onPress={() => void act({ action: "passkey-rename", id: k.id, name }, "pk").then((ok) => { if (ok) setEditing(null); })} />
                      <OutlineButton compact title={tx("cancel")} onPress={() => setEditing(null)} />
                    </View>
                  </View>
                ) : (
                  <View key={k.id}>
                    <LinkRow first={i === 0} title={k.name} icon="lock"
                      subtitle={`${tx("addedOn", { date: date(k.createdAt) })} · ${k.lastUsedAt ? tx("lastUsed", { date: date(k.lastUsedAt) }) : tx("neverUsed")}${k.synced ? ` · ${tx("synced")}` : ""}`} />
                    <View style={{ flexDirection: "row", gap: 16, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: theme.surface }}>
                      <TextLink title={tx("rename")} onPress={() => { setEditing(k.id); setName(k.name); }} style={{ fontSize: 14, paddingVertical: 4 }} />
                      <TextLink title={tx("remove")} onPress={() => ask(tx("removeConfirm"), () => void act({ action: "passkey-delete", id: k.id }, "pk", tx("removed")))} style={{ fontSize: 14, paddingVertical: 4, color: theme.danger }} />
                    </View>
                  </View>
                ))}
              </RowGroup>
            ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: theme.muted }}>{tx("none")}</Text>}
            {passkeysAvailable ? <GoldButton title={tx("add")} icon="plus" busy={busy && !editing} onPress={() => void add()} /> : null}
            {confirm ? <ConfirmCode email={d.email} onConfirmed={() => { setConfirm(false); void add(); }} /> : null}
            {note("pk")}
          </Section>

          <Section title={tx("sessions")}>
            <RowGroup>
              {d.sessions.map((s, i) => (
                <LinkRow key={s.id} first={i === 0} icon={s.client === "web" ? "globe" : "user"}
                  title={`${tx(`client_${s.client ?? "web"}` as "client_web")}${s.device ? ` · ${s.device}` : ""}`}
                  subtitle={`${s.createdAt ? tx("since", { date: date(s.createdAt) }) : tx("earlier")}${s.method ? ` · ${tx(`via_${s.method}` as "via_code")}` : ""}`}
                  right={s.current ? <Badge text={tx("thisDevice")} on /> : undefined}
                  onPress={s.current ? undefined : () => ask(tx("signOutConfirm"), () => void act({ action: "logout-session", id: s.id }, "sess"), false)} />
              ))}
            </RowGroup>
            {others.length ? <OutlineButton title={tx("signOutOthers")} icon="logout" disabled={busy} onPress={() => ask(tx("signOutOthers"), () => void act({ action: "logout-others" }, "sess", tx("othersDone")), false)} />
              : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: theme.muted }}>{tx("onlyThis")}</Text>}
            {note("sess")}
          </Section>
        </View>
      </Page>
    </>
  );
}

function Badge({ text, on }: { text: string; on?: boolean }) {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: on ? t.accent : t.muted, backgroundColor: on ? t.accentSoft : "transparent", borderRadius: R.pill, paddingHorizontal: on ? 10 : 0, paddingVertical: 3, overflow: "hidden" }}>{text}</Text>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ gap: 10 }}><Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{title}</Text>{children}</View>;
}
