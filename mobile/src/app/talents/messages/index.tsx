import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, useFocusEffect, type Href } from "expo-router";
import { FONT, goldButton, useTheme } from "@/lib/theme";
import { Page, PageHero } from "@/components/page";
import { useLang } from "@/i18n";
import { SharerRing } from "@/features/share/SharerUI";
import { T, type Conversation } from "@/features/talents/api";
import { useTT } from "@/features/talents/text";
import { AccessGate, ListBox, Muted, SafetyBar, TalentAvatar, useTalentAccess, useTalentErr } from "@/features/talents/ui";
import { BadgeButton, BadgeSheetHost } from "@/features/talents/badges";

// /talents/messages – inbox: conversations with connections, newest first, unread counts
export default function Inbox() {
  const t = useTheme();
  const tt = useTT();
  const err = useTalentErr();
  const { lang } = useLang();
  const a = useTalentAccess();
  const [list, setList] = useState<Conversation[] | null>(null);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => { try { setList((await T.conversations()).conversations); setMsg(""); } catch (e) { setMsg(err(e)); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { if (a.state === "ok" && a.age?.interact) void load(); }, [a.state, a.age?.interact, load]));
  useEffect(() => { if (a.state === "ok" && a.age?.interact) void load(); }, [a.state, a.age?.interact, load]);
  const when = (iso: string) => {
    const d = new Date(iso);
    return d.toDateString() === new Date().toDateString()
      ? d.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString(lang, { day: "numeric", month: "short" });
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
      <Page>
        <PageHero back arcade={false} eyebrow={tt("network")} title={tt("messages")} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 16 }}>
            {!a.age?.interact ? <Muted>{tt("age16")}</Muted> : msg ? <Muted>{msg}</Muted> : list && !list.length ? <Muted>{tt("noMessages")}</Muted> : list ? (
              <ListBox>
                {list.map((c, i) => (
                  <Pressable key={c.id} onPress={() => router.push(`/talents/messages/${c.id}` as Href)} accessibilityRole="button"
                    accessibilityLabel={`${c.name}${c.unread ? `, ${tt("unread", { n: c.unread })}` : ""}${c.last ? `, ${c.last.mine ? tt("youPrefix") : ""}${c.last.text}` : ""}`}
                    style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, minHeight: 68, backgroundColor: pressed ? t.bg : t.surface, borderTopWidth: i ? 1 : 0, borderTopColor: t.line })}>
                    <SharerRing tier={c.sharerTier} size={48}><TalentAvatar name={c.name} size={48} /></SharerRing>
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: c.unread ? FONT.bold : FONT.semibold, fontSize: 15.5, color: t.ink }}>{c.name}</Text>
                        <BadgeButton badge={c.badge} size={14} />
                        <View style={{ flex: 1 }} />
                        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{when(c.at)}</Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text numberOfLines={1} style={{ flex: 1, fontFamily: c.unread ? FONT.semibold : FONT.regular, fontSize: 14, color: c.unread ? t.ink : t.muted }}>
                          {c.last ? `${c.last.mine ? tt("youPrefix") : ""}${c.last.text}` : ""}
                        </Text>
                        {c.unread ? <View style={{ minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: goldButton.to, alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ fontFamily: FONT.bold, fontSize: 11.5, color: goldButton.text }}>{c.unread}</Text></View> : null}
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ListBox>
            ) : null}
            <SafetyBar />
          </View>
        </AccessGate>
      </Page>
      </BadgeSheetHost>
    </>
  );
}
