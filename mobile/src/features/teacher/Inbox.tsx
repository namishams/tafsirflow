import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { FONT, R, useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useShams2 } from "@/features/shams2/model";
import { useSurahNames } from "@/features/shams2/names";
import { Btn, Card } from "@/features/shams2/ui";
import { useIntl } from "@/features/srs/format";
import { TL, type Inbox } from "./api";
import { acceptSuggestion, dropAssigned, finishAssigned, readLive, setActive, syncTeacher, useAssigned } from "./sync";
import { useTT } from "./text";

// The suggestions a teacher sent: preset encouragements and suggested portions. Accepting a portion adds it to the
// wird screen ("From your teacher"); nothing is added without the student's tap.
export function SuggestionsList({ items, onChange }: { items: Inbox[]; onChange: () => void }) {
  const t = useTheme();
  const tt = useTT();
  const nf = useIntl();
  const { name } = useSurahNames();
  const act = async (f: () => Promise<unknown>) => { try { await f(); } catch { /* shown again on the next refresh */ } onChange(); };
  return (
    <View style={{ gap: 8 }}>
      {items.map((x) => (
        <View key={x.id} style={{ gap: 8, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.ink, textAlign: "left" }}>
            {x.kind === "nudge" && x.preset
              ? `${x.teacher?.name ?? ""}: ${tt(`nudge_${x.preset}` as never)}`
              : tt("assignLine", { t: x.teacher?.name ?? "", s: name(x.surah ?? 1), a: nf(x.from ?? 1), b: nf(x.to ?? 1) })}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {x.kind === "assign" && x.status === "open" ? <Btn primary title={tt("accept")} onPress={() => void act(() => acceptSuggestion(x))} /> : null}
            {x.status === "open" ? <Btn title={tt(x.kind === "assign" ? "later" : "done")} onPress={() => void act(() => TL.respond(x.id, "dismiss"))} /> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

/** on the wird screen: syncs the summary while a teacher link is active, shows open suggestions and accepted portions */
export function TeacherAssigned() {
  const t = useTheme();
  const tt = useTT();
  const nf = useIntl();
  const { user } = useAuth();
  const m = useShams2();
  const { name } = useSurahNames();
  const assigned = useAssigned();
  const [items, setItems] = useState<Inbox[]>([]);
  const refresh = useCallback(async () => {
    if (!user || !readLive().active) return;
    const inbox = await syncTeacher(m, true).catch(() => null);
    if (inbox) setItems(inbox.filter((x) => x.status === "open"));
  }, [user, m]);
  useEffect(() => {
    if (!user || !readLive().active) return;
    let on = true;
    void syncTeacher(m).then((inbox) => { if (on && inbox) setItems(inbox.filter((x) => x.status === "open")); });
    return () => { on = false; };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  const now = Date.now();
  const list = assigned.filter((a) => !a.doneAt || now - a.doneAt < 2 * 86400_000);
  if (!items.length && !list.length) return null;
  return (
    <Card gold>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{tt("assignedT")}</Text>
      {items.length ? <SuggestionsList items={items} onChange={() => void refresh()} /> : null}
      {list.map((a) => (
        <View key={a.id} style={{ gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: t.line }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }}>{`${name(a.s)} · ${a.from}–${a.to}`}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{tt("assignedFrom", { t: a.teacher || "–" })}</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {!a.doneAt ? <Btn icon="play" primary title={tt("recite")} onPress={() => router.push(`/surah/${a.s}?v=${a.from}` as Href)} label={`${tt("recite")}: ${name(a.s)} ${nf(a.from)}–${nf(a.to)}`} /> : null}
            {!a.doneAt ? <Btn title={tt("done")} onPress={() => void finishAssigned(a.id)} /> : <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold }}>{tt("st_done")}</Text>}
            <Btn title={tt("remove")} onPress={() => dropAssigned(a.id)} />
          </View>
        </View>
      ))}
    </Card>
  );
}

export { setActive };
