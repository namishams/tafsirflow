import { useState } from "react";
import { ActionSheetIOS, Alert, Platform, Pressable } from "react-native";
import { Icon } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { ReportSheet, SafetyBar } from "@/features/talents/ui";
import { useTT } from "@/features/talents/text";
import { M, errCode, type Member } from "./api";
import { useMt } from "./texts";

// Safety for the mentoring and season screens (App Store guideline 1.2): every member row, every recording and every
// review that someone else wrote can be reported, every member can be blocked (they disappear from mentoring, the
// server filters them out), and the community guidelines are one tap away. Same queue as Quran Talents
// (community_reports, community_blocks); reporting and blocking are never behind Pro.

type Target = { kind: "member"; username: string } | { kind: "submission"; id: string } | { kind: "review"; id: string; review: string };

export function useMentoringSafety(onBlocked?: () => void) {
  const tt = useTT();
  const mt = useMt();
  const [target, setTarget] = useState<Target | null>(null);
  const [note, setNote] = useState("");
  const block = (m: Member) => {
    const run = () => void M.block(m.username).then(() => { setNote(mt("blockedNote", { name: `@${m.username}` })); onBlocked?.(); })
      .catch((e) => setNote(errCode(e) === "self" ? "" : mt("error")));
    if (Platform.OS === "web") { run(); return; }
    Alert.alert(tt("block"), tt("confirmBlock"), [{ text: tt("cancel"), style: "cancel" }, { text: tt("block"), style: "destructive", onPress: run }]);
  };
  /** report or block a member (native action sheet on iOS, an alert with the two choices elsewhere) */
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
  const title = target?.kind === "submission" ? mt("reportRecording") : target?.kind === "review" ? mt("reportReview") : tt("reportProfile");
  const sheet = (
    <ReportSheet visible={!!target} title={title} onClose={() => setTarget(null)}
      onSubmit={async (c, r) => {
        if (!target) return;
        if (target.kind === "member") await M.reportMember(target.username, c, r);
        else await M.report(target.id, c, r, target.kind === "review" ? target.review : undefined);
      }} />
  );
  return {
    memberMenu, block, note, sheet,
    reportSubmission: (id: string) => setTarget({ kind: "submission", id }),
    reportReview: (id: string, review: string) => setTarget({ kind: "review", id, review }),
  };
}

/** the small flag button at the end of a member row or under a recording: opens the safety choices */
export function SafetyButton({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}
      style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
      <Icon name="flag" size={17} color={t.muted} />
    </Pressable>
  );
}

/** guidelines line (and optional report/block links) at the end of every mentoring and season screen */
export function MentoringSafetyBar({ onReport, onBlock }: { onReport?: () => void; onBlock?: () => void }) {
  return <SafetyBar onReport={onReport} onBlock={onBlock} />;
}
