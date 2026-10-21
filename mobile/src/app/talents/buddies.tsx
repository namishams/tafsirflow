import { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { OutlineButton } from "@/components/brand";
import { usePro } from "@/lib/pro";
import { sijillApi, type Buddy } from "@/features/sijill/api";
import { syncSijill } from "@/features/sijill/summary";
import { useST, type SKey } from "@/features/sijill/text";
import { BadgeSheetHost } from "@/features/talents/badges";
import { T } from "@/features/talents/api";
import { useTT } from "@/features/talents/text";
import { AccessGate, ListBox, Muted, SafetyBar, SmallButton, TalentRow, useTalentAccess, useTalentErr } from "@/features/talents/ui";

// /talents/buddies – study buddy suggestions (16+): similar stage, level, focus and daily time; only members who show
// their level section. Following is the only action here; connecting and messages stay on the profile.
export default function StudyBuddies() {
  const st = useST();
  const tt = useTT();
  const err = useTalentErr();
  const { pro } = usePro();
  const a = useTalentAccess();
  const [list, setList] = useState<Buddy[] | null>(null);
  const [need, setNeed] = useState(false);
  const [msg, setMsg] = useState("");
  const [followed, setFollowed] = useState<string[]>([]);
  useEffect(() => {
    if (a.state !== "ok") return;
    void (async () => {
      await syncSijill(pro);
      try { const d = await sijillApi.buddies(); setList(d.buddies); setNeed(!!d.needSync); } catch (e) { setMsg(err(e)); setList([]); }
    })();
  }, [a.state]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
        <Page>
          <PageHero back arcade={false} eyebrow={st("sijill")} title={st("buddies")} lead={st("buddiesLead")} />
          <AccessGate a={a}>
            <View style={{ padding: 16, gap: 14 }}>
              {!a.age?.interact ? <Muted>{tt("age16")}</Muted> : !list ? <Loading /> : need ? (
                <View style={{ gap: 10 }}><Muted>{st("needSync")}</Muted><OutlineButton title={st("privacyBtn")} onPress={() => router.push("/talents/sijill" as Href)} /></View>
              ) : !list.length ? <Muted>{msg || st("buddiesEmpty")}</Muted> : (
                <ListBox>
                  {list.map((b, i) => (
                    <TalentRow key={b.username} c={b} first={i === 0}
                      sub={[b.match.stage ? st("matchStage") : null, b.match.focus ? `${st("matchFocus")}: ${st(`focus_${b.match.focusId}` as SKey)}` : null].filter(Boolean).join(" · ") || undefined}
                      right={followed.includes(b.username) ? null : <SmallButton title={tt("follow")} tone="gold" label={`${tt("follow")}, ${b.name}`} onPress={() => void T.follow(b.username, true).then(() => setFollowed((f) => [...f, b.username])).catch((e) => setMsg(err(e)))} />} />
                  ))}
                </ListBox>
              )}
              <SafetyBar />
            </View>
          </AccessGate>
        </Page>
      </BadgeSheetHost>
    </>
  );
}
