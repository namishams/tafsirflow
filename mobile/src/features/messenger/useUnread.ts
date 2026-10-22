import { useEffect, useState } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { useAuth } from "@/lib/auth";
import { readJSON, writeJSON } from "@/lib/store";
import { useLang } from "@/i18n";
import { M } from "./api";
import { fill, messengerText } from "./text";

// Unread messages for the badge on the profile tab: asked every 60 seconds and when the app comes to the front,
// only while signed in. Any failure (signed out, under 16, offline) counts as 0 and never shows an error.
//
// Local notifications for new messages (there is no push server): when the app comes back to the front, and while it
// is open, new unread messages since the last check become "Neue Nachricht von …" with the content always hidden.
// Only with the switch "Benachrichtigungen für Nachrichten" on and the notification permission already granted.
const NOTIFY_KEY = "qmc.msg.notify";
const SEEN_KEY = "qmc.msg.notifiedId";

export const notifyEnabled = () => readJSON<boolean>(NOTIFY_KEY, true);
/** turns message notifications on (asks for the permission) or off; returns the resulting state */
export async function setNotifyEnabled(on: boolean): Promise<boolean> {
  if (on) {
    const p = await Notifications.requestPermissionsAsync().catch(() => null);
    if (!p?.granted) { writeJSON(NOTIFY_KEY, false); return false; }
  }
  writeJSON(NOTIFY_KEY, on);
  return on;
}

async function notifyNew(lang: string) {
  const seen = readJSON<string | null>(SEEN_KEY, null);
  const d = await M.notify(seen ?? "0");
  writeJSON(SEEN_KEY, d.latest);
  if (seen === null || !d.items.length || !notifyEnabled()) return; // first run: only remember where we are
  const perm = await Notifications.getPermissionsAsync().catch(() => null);
  if (!perm?.granted) return;
  const t = messengerText(lang);
  const byThread = new Map<string, (typeof d.items)[number]>();
  for (const it of d.items) if (!byThread.has(it.threadId)) byThread.set(it.threadId, it);
  for (const it of [...byThread.values()].slice(0, 3)) {
    await Notifications.scheduleNotificationAsync({
      content: { title: fill(t.notifTitle, it.group ? `${it.from} (${it.group})` : it.from), body: t.notifBody, data: { url: `/talents/messages/${it.threadId}` } },
      trigger: null,
    }).catch(() => undefined);
  }
}

export function useMessengerUnread(): number {
  const { user } = useAuth();
  const { lang } = useLang();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!user) { setN(0); return; }
    let live = true;
    const load = () => M.unread().then((d) => { if (live) setN((d.inbox ?? 0) + (d.requests ?? 0)); }).catch(() => { if (live) setN(0); });
    const check = () => { void notifyNew(lang).catch(() => undefined); };
    void load(); check();
    const h = setInterval(() => { void load(); check(); }, 60_000);
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") { void load(); check(); } });
    return () => { live = false; clearInterval(h); sub.remove(); };
  }, [user, lang]);
  return n;
}
