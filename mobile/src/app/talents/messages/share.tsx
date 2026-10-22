import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { FONT, R, useTheme } from "@/lib/theme";
import { Page, PageHero } from "@/components/page";
import { Icon } from "@/components/icons";
import { errCode } from "@/features/talents/api";
import { AccessGate, ListBox, Muted, useTalentAccess } from "@/features/talents/ui";
import { M, type ShareCard, type ShareType, type ThreadRow } from "@/features/messenger/api";
import { errorText, fill } from "@/features/messenger/text";
import { ShareCardBubble, ThreadAvatar, useMT } from "@/features/messenger/ui";

// /talents/messages/share?type=&ref=&title=&subtitle=&url= – sends a card (verse, surah, course, carousel, profile,
// feed post) into one or more chats, with an optional note (for a post: the reply). Requests and blocked chats are
// not offered; the server checks every rule again.
const TYPES: ShareType[] = ["verse", "surah", "course", "carousel", "profile", "post"];

export default function ShareToChat() {
  const t = useTheme();
  const mt = useMT();
  const a = useTalentAccess();
  const p = useLocalSearchParams<{ type?: string; ref?: string; title?: string; subtitle?: string; url?: string }>();
  const card: ShareCard | null = TYPES.includes(p.type as ShareType) && p.title && p.url?.startsWith("/")
    ? { type: p.type as ShareType, ref: p.ref ?? "", title: p.title, subtitle: p.subtitle ?? "", url: p.url } : null;
  const [list, setList] = useState<ThreadRow[] | null>(null);
  const [note, setNote] = useState("");
  const [q, setQ] = useState("");
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState("");
  const ok = a.state === "ok" && !!a.age?.interact;
  useEffect(() => { if (ok) void M.threads("inbox").then((d) => setList(d.threads.filter((x) => !x.request))).catch((e) => { setMsg(errorText(mt, errCode(e))); setList([]); }); }, [ok, mt]);
  const shown = (list ?? []).filter((c) => !q.trim() || c.title.toLocaleLowerCase().includes(q.trim().toLocaleLowerCase()) || (c.with?.username ?? "").includes(q.trim().toLowerCase()));

  const send = async (c: ThreadRow) => {
    if (!card || sent[c.id]) return;
    setMsg("");
    try { await M.share(c.id, card, note.trim()); setSent((s) => ({ ...s, [c.id]: true })); setMsg(fill(mt.sentTo, c.title)); }
    catch (e) { setMsg(errorText(mt, errCode(e))); }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset arcade={false} eyebrow={mt.title} title={card?.type === "post" ? mt.replyPost : mt.shareToChat} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 14 }}>
            {!a.age?.interact ? <Muted>{mt.e_age16}</Muted> : !card ? <Muted>{mt.e_not_found}</Muted> : (
              <>
                <ShareCardBubble card={card} mine={false} t={mt} />
                <TextInput value={note} onChangeText={setNote} placeholder={card.type === "post" ? mt.write : mt.shareNote} placeholderTextColor={t.muted} accessibilityLabel={mt.shareNote} multiline maxLength={2000}
                  style={{ minHeight: 48, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 12, fontFamily: FONT.regular, fontSize: 16, color: t.ink }} />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: R.pill, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 14, minHeight: 44 }}>
                  <Icon name="search" size={17} color={t.muted} />
                  <TextInput value={q} onChangeText={setQ} placeholder={mt.chooseChat} placeholderTextColor={t.muted} accessibilityLabel={mt.chooseChat} autoCapitalize="none"
                    style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15.5, color: t.ink, paddingVertical: 10 }} />
                </View>
                {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.accent }}>{msg}</Text> : null}
                {msg === mt.e_pro ? <Pressable onPress={() => router.push("/pro" as Href)} accessibilityRole="link" style={{ minHeight: 44, justifyContent: "center" }}><Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.gold }}>{mt.proCta}</Text></Pressable> : null}
                {list && !shown.length ? <Muted>{mt.noResults}</Muted> : (
                  <ListBox>
                    {shown.map((c, i) => (
                      <Pressable key={c.id} onPress={() => void send(c)} accessibilityRole="button" accessibilityState={{ disabled: !!sent[c.id] }} accessibilityLabel={`${mt.send}: ${c.title}`}
                        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, minHeight: 64, backgroundColor: pressed ? t.bg : t.surface, borderTopWidth: i ? 1 : 0, borderTopColor: t.line })}>
                        <ThreadAvatar kind={c.kind} title={c.title} photo={c.photo} avatar={c.with?.avatar} size={42} />
                        <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{c.title}</Text>
                        <Icon name={sent[c.id] ? "check" : "send"} size={18} color={sent[c.id] ? t.accent : t.gold} />
                      </Pressable>
                    ))}
                  </ListBox>
                )}
              </>
            )}
          </View>
        </AccessGate>
      </Page>
    </>
  );
}
