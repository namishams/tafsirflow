import { useState } from "react";
import { ActionSheetIOS, Alert, Platform } from "react-native";
import { ReportSheet } from "@/features/talents/ui";
import { useTT } from "@/features/talents/text";
import { M } from "@/features/mishary/api";
import type { Member } from "./api";
import { RL } from "./api";
import { useRt } from "./rec/text";

// Safety for recordings sent to a teacher (App Store guideline 1.2), the same pattern as features/mishary/safety.tsx:
// the teacher can report a recording, the student the feedback, and either can report or block the other member
// (the server then hides every recording of the pair). Same queue as Quran Talents (community_reports,
// community_blocks); reporting and blocking are never behind Pro.
type Target = { kind: "recitation"; id: string } | { kind: "review"; id: string } | { kind: "member"; username: string };

export function useRecSafety(onBlocked?: () => void) {
  const tt = useTT();
  const rt = useRt();
  const [target, setTarget] = useState<Target | null>(null);
  const [note, setNote] = useState("");
  const block = (m: Member) => {
    const run = () => void M.block(m.username).then(() => { setNote(rt("blockedNote", { name: `@${m.username}` })); onBlocked?.(); }).catch(() => setNote(rt("err_generic")));
    if (Platform.OS === "web") { run(); return; }
    Alert.alert(tt("block"), tt("confirmBlock"), [{ text: tt("cancel"), style: "cancel" }, { text: tt("block"), style: "destructive", onPress: run }]);
  };
  const memberMenu = (m: Member) => {
    const opts = [
      { label: tt("reportProfile"), onPress: () => setTarget({ kind: "member", username: m.username }) },
      { label: tt("block"), onPress: () => block(m) },
    ];
    if (Platform.OS === "ios") {
      const labels = [...opts.map((o) => o.label), tt("cancel")];
      ActionSheetIOS.showActionSheetWithOptions({ title: `@${m.username}`, options: labels, cancelButtonIndex: labels.length - 1, destructiveButtonIndex: [0, 1] },
        (i) => { if (i < opts.length) opts[i].onPress(); });
    } else {
      Alert.alert(`@${m.username}`, undefined, [...opts.map((o) => ({ text: o.label, style: "destructive" as const, onPress: o.onPress })), { text: tt("cancel"), style: "cancel" }]);
    }
  };
  const title = target?.kind === "recitation" ? rt("reportRec") : target?.kind === "review" ? rt("reportFb") : tt("reportProfile");
  const sheet = (
    <ReportSheet visible={!!target} title={title} onClose={() => setTarget(null)}
      onSubmit={async (c, r) => {
        if (!target) return;
        if (target.kind === "member") await M.reportMember(target.username, c, r);
        else await RL.report(target.id, c, r, target.kind === "review");
      }} />
  );
  return {
    memberMenu, note, sheet,
    reportRecitation: (id: string) => setTarget({ kind: "recitation", id }),
    reportReview: (id: string) => setTarget({ kind: "review", id }),
  };
}
