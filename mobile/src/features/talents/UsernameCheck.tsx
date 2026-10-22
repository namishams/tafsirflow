import { useEffect, useState } from "react";
import { Text } from "react-native";
import { FONT, useTheme } from "@/lib/theme";
import { api } from "@/lib/api";
import { usePT, type PKey } from "./profileText";
import { usernameProblem } from "./usernameFilter";
import { starText } from "./starText";
import { useLang } from "@/i18n";

// Live check of the unique @username while typing in Edit profile (GET /api/community/username, debounced):
// format (3–20 of a-z 0-9 . _), reserved route and team names, the word filter, taken by someone else.
type State = "idle" | "checking" | "ok" | "format" | "reserved" | "star" | "taken" | "inappropriate";
/** `online` false (not signed in yet): only the format is checked here, the rest after sign-in */
export function useUsernameCheck(username: string, current: string | null, online = true) {
  const [s, setS] = useState<State>("idle");
  useEffect(() => {
    const u = username.trim().toLowerCase();
    if (!u || u === current) { setS("idle"); return; }
    if (!/^[a-z0-9_.]{3,20}$/.test(u)) { setS("format"); return; }
    // instant answer from the same word filter as the server (src/lib/usernameFilter.ts)
    const bad = usernameProblem(u);
    if (bad && bad !== "reserved") { setS(bad); return; } // reserved names: the server decides (the founder may use his own)
    if (!online) { setS("idle"); return; }
    setS("checking");
    let live = true;
    const h = setTimeout(() => {
      api<{ ok: boolean; reason?: State }>(`/api/community/username?u=${encodeURIComponent(u)}`)
        .then((d) => { if (live) setS(d.ok ? "ok" : d.reason ?? "taken"); })
        .catch(() => { if (live) setS("idle"); });
    }, 400);
    return () => { live = false; clearTimeout(h); };
  }, [username, current, online]);
  return s;
}

export function UsernameStatus({ state }: { state: State }) {
  const t = useTheme();
  const pt = usePT();
  const { lang } = useLang();
  if (state === "idle") return null;
  const key: PKey = state === "ok" ? "usernameFree" : state === "checking" ? "usernameChecking" : (`username_${state === "star" ? "reserved" : state}` as PKey);
  return (
    <Text accessibilityLiveRegion="polite" style={{ marginTop: -8, fontFamily: FONT.semibold, fontSize: 13, color: state === "ok" ? t.accent : state === "checking" ? t.muted : t.danger }}>
      {state === "star" ? starText(lang).reserved : pt(key)}
    </Text>
  );
}
export const usernameBlocked = (s: State) => s === "format" || s === "reserved" || s === "star" || s === "taken" || s === "inappropriate";
