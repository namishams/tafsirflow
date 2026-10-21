import { useCallback, useEffect, useState } from "react";
import { Stack, useFocusEffect, useGlobalSearchParams } from "expo-router";
import { useT } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { T } from "@/features/talents/api";
import { syncPendingProfile } from "@/features/talents/pendingProfile";
import { ProfileScreenView, useProfileData } from "@/features/talents/ProfileScreen";
import { clearOwnCache, readOwnCache } from "@/features/talents/localProfile";
import { loadUnread, unreadTotal } from "@/features/talents/unread";

// The Account tab is the own profile (owner, 21.10.2026: "on Instagram the last tab IS your profile"): the same
// TikTok-style layout as every talent profile (features/talents/ProfileScreen.tsx) with the Instagram top bar – name
// with a chevron, "+" to share the profile with its QR code, and the menu that opens /account/settings, where
// everything this tab showed before lives unchanged. Signed out or without a community profile it shows the data of
// this device with "Create your profile"; offline the last loaded profile. Pull to refresh.
type Me = { username: string | null; checked: boolean; interact: boolean };
// header options once (module constant, also set in account/_layout.tsx): an inline object re-ran setOptions on every
// render, which on the talent profile routes ended in "Maximum update depth exceeded"
const SCREEN = { headerShown: false } as const;

export default function AccountTab() {
  const t = useT();
  const { user, ready } = useAuth();
  const [me, setMe] = useState<Me>({ username: null, checked: false, interact: false });
  const [requests, setRequests] = useState(0);
  // unread notifications, messages and requests: a dot on the menu button (the rows sit at the top of the settings)
  const [unread, setUnread] = useState(0);

  const loadMe = useCallback(async () => {
    if (!ready) return;
    if (!user) { setMe({ username: null, checked: true, interact: false }); setRequests(0); setUnread(0); return; }
    try {
      await syncPendingProfile(); // a profile set up in the onboarding before sign-in
      const d = await T.me();
      setMe({ username: d.profile?.username ?? null, checked: true, interact: !!d.talent?.canInteract });
      if (!d.profile) { setRequests(0); setUnread(0); }
      else {
        void loadUnread({ interact: !!d.talent?.canInteract, privateAccount: !!d.profile.private }).then((u) => {
          setRequests(u.follows);
          setUnread(unreadTotal(u));
        });
      }
    } catch {
      // offline: the username of the last loaded own profile, so the cached profile shows
      setMe({ username: readOwnCache(user.id)?.p.username ?? null, checked: true, interact: false });
    }
  }, [user, ready]);

  // signed out or the account deleted: the cached profile of that account leaves the device
  useEffect(() => { if (ready && !user) clearOwnCache(); }, [ready, user]);

  // development only: `?demo=own|other` shows the signed-in layouts with sample counters (screenshot audits)
  const { demo } = useGlobalSearchParams<{ demo?: string }>();
  const d = useProfileData(me.username, { enabled: me.checked, own: { user, fallbackName: t("account.title") }, demo: __DEV__ ? demo : undefined });
  useFocusEffect(useCallback(() => { void loadMe(); }, [loadMe]));
  // every check of the account (focus, pull to refresh) reloads the profile with the current username
  useEffect(() => { if (me.checked) void d.load(); }, [me, demo]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Stack.Screen options={SCREEN} />
      <ProfileScreenView d={d} variant="tab" title={user?.name ?? t("account.title")} canInteract={me.interact} signedIn={!!user} requests={__DEV__ && demo === "own" ? 3 : requests} unread={unread} onRefresh={loadMe} />
    </>
  );
}
