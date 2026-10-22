import { useEffect } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { router, type Href } from "expo-router";
import { useLang } from "@/i18n";
import { refreshDaily } from "@/lib/daily";
import { collectReceived } from "@/features/sijill/received";
import { collectTogether } from "@/features/together/collect";
import { reschedulePrayerAlerts } from "@/features/practice/prayer/alerts";

// Local notifications of the app: prayer reminders (7 days ahead, kept rolling) and the daily remembrance. Shows them
// while the app is open too, and opens the right screen when one is tapped.
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export function NotificationsBridge() {
  const { lang } = useLang();
  useEffect(() => {
    const roll = () => { void reschedulePrayerAlerts(lang).catch(() => 0); void refreshDaily(lang); void collectReceived(lang); void collectTogether(lang); };
    roll();
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") roll(); });
    return () => sub.remove();
  }, [lang]);
  useEffect(() => {
    const open = (r: Notifications.NotificationResponse | null) => {
      const data = r?.notification.request.content.data as { url?: string; qmc?: string; tag?: string } | undefined;
      if (data?.url) router.push(data.url as Href);
      else if (data?.tag === "qmc-prayer") router.push("/prayer" as Href);
    };
    Notifications.getLastNotificationResponseAsync().then(open).catch(() => undefined);
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, []);
  return null;
}
