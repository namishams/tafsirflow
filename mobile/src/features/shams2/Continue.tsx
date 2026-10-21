import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Icon } from "@/components/icons";
import { FONT, FWD, R, stage, useTheme } from "@/lib/theme";
import { useIntl } from "@/features/srs/format";
import { nextSteps, type NextStep } from "./nextSteps";
import { useShams2 } from "./model";
import { useSurahNames } from "./names";
import { useS2 } from "./text";
import { SourceNote } from "./ui";

// Never an end without a next step: the list of meaningful continuations (continue.ts), used on the hub, after the
// wird, at the end of a Shams session and on /shams/next.
function useSteps(surah?: number) {
  const { srs, known, q } = useShams2();
  return nextSteps(srs, known, q.surahs, q.juz, { surah });
}

function useLabel() {
  const { s } = useS2();
  const nf = useIntl();
  const { name } = useSurahNames();
  return (x: NextStep) => {
    switch (x.kind) {
      case "sabaq": return [s("nx_sabaq", { surah: name(x.s!), v: nf(x.v!) }), s("nx_sabaqLead")];
      case "tathbit": return [s("nx_tathbit", { surah: name(x.s!) }), s("nx_tathbitLead", { p: nf(x.score ?? 0) })];
      case "juzExam": return [s("nx_juzExam", { n: nf(x.juz!) }), s("nx_juzExamLead")];
      case "nextJuz": return [s("nx_nextJuz", { n: nf(x.juz!) }), s("nx_nextJuzLead", { p: nf(x.score ?? 0) })];
      case "tafsir": return [s("nx_tafsir", { surah: name(x.s!) }), s("nx_tafsirLead")];
      case "mutashabihat": return [s("mutTitle"), s("nx_mutLead")];
      case "talaqqi": return [s("nx_talaqqi", { surah: name(x.s!) }), s("nx_talaqqiLead")];
      case "academy": return [s("nx_academy"), s("nx_academyLead")];
      case "reciterPath": return [s("nx_reciterPath"), s("nx_reciterPathLead")];
      case "courses": return [s("nx_courses"), s("nx_coursesLead")];
    }
  };
}

export function ContinueNext({ surah, onStage, max = 3 }: { surah?: number; onStage?: boolean; max?: number }) {
  const t = useTheme();
  const { s } = useS2();
  const steps = useSteps(surah).slice(0, max);
  const label = useLabel();
  const ink = onStage ? stage.text : t.ink, muted = onStage ? stage.textSoft : t.muted, line = onStage ? stage.hair : t.line;
  return (
    <View style={{ gap: 8 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.4, color: onStage ? stage.gold : t.gold }}>{s("continueTitle")}</Text>
      {steps.map((x, i) => {
        const [title, lead] = label(x);
        return (
          <Pressable key={`${x.kind}-${i}`} onPress={() => router.push(x.href as Href)} accessibilityRole="button" accessibilityLabel={`${title}. ${lead}`}
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: i === 0 ? (onStage ? stage.gold : "rgba(201,166,94,0.6)") : line, opacity: pressed ? 0.8 : 1 })}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: ink, textAlign: "left" }}>{title}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: muted, textAlign: "left" }}>{lead}</Text>
            </View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: onStage ? stage.gold : t.gold }}>{FWD}</Text>
          </Pressable>
        );
      })}
      <Pressable onPress={() => router.push((surah ? `/shams/next?s=${surah}` : "/shams/next") as Href)} accessibilityRole="button" style={{ paddingVertical: 6 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: onStage ? stage.gold : t.accent }}>{`${s("allNext")} ${FWD}`}</Text>
      </Pressable>
    </View>
  );
}

export function NextScreen({ surah }: { surah?: number }) {
  const t = useTheme();
  const { s } = useS2();
  const steps = useSteps(surah);
  const label = useLabel();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} title={s("nextTitle")} lead={s("nextLead")} />
        <View style={{ padding: 16, gap: 10 }}>
          {steps.map((x, i) => {
            const [title, lead] = label(x);
            return (
              <Pressable key={`${x.kind}-${i}`} onPress={() => router.push(x.href as Href)} accessibilityRole="button" accessibilityLabel={`${title}. ${lead}`}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: i === 0 ? "rgba(201,166,94,0.6)" : t.line, backgroundColor: t.surface, opacity: pressed ? 0.85 : 1 })}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{title}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted, textAlign: "left" }}>{lead}</Text>
                </View>
                <Icon name="chevronRight" size={14} color={t.muted} />
              </Pressable>
            );
          })}
          <SourceNote src={["halaqa", "app"]} />
        </View>
      </Page>
    </>
  );
}
