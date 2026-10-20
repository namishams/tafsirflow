import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { GoldButton, OutlineButton } from "@/components/brand";
import { FONT, R, useTheme } from "@/lib/theme";
import { useT } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { useAuth } from "@/lib/auth";
import { alpha } from "./art";

/**
 * Learning features that live in the account (profile, 365-day plan) – like the website's RequireAccount.tsx:
 * signed-out visitors see the free-account panel, unconfirmed addresses the confirmation hint.
 */
export function RequireAccount({ children, feature }: { children: ReactNode; feature: string }) {
  const t = useTheme();
  const { user, ready } = useAuth();
  if (!ready) return <View style={{ marginTop: 32, height: 160, borderRadius: R.md, backgroundColor: alpha(t.line, 0.4) }} />;
  if (user?.emailVerified) return <>{children}</>;
  return <AccountWall feature={feature} verify={!!user} />;
}

export function AccountWall({ feature, verify = false }: { feature: string; verify?: boolean }) {
  const t = useTheme();
  const tr = useWebT("account");
  const ta = useT();
  const { refresh } = useAuth();
  return (
    <View style={{ marginTop: 32, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 24 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase", color: t.gold }}>{tr("wallEyebrow")}</Text>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 35, letterSpacing: -0.6, color: t.ink, marginTop: 8 }}>{verify ? tr("wallVerifyTitle") : tr("wallTitle", { feature })}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, marginTop: 12 }}>{verify ? tr("wallVerifyBody") : tr("wallBody")}</Text>
      <View style={{ gap: 8, marginTop: 16 }}>
        {["wall1", "wall2", "wall3", "wall4"].map((k) => (
          <View key={k} style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ marginTop: 11, height: 1, width: 16, backgroundColor: t.gold }} />
            <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink }}>{tr(k)}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: 12, marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: t.line }}>
        {verify ? (
          <OutlineButton title={ta("common.retry")} onPress={() => void refresh()} />
        ) : (
          <>
            <GoldButton title={ta("account.createAccount")} onPress={() => router.push("/register")} />
            <OutlineButton title={ta("account.signIn")} onPress={() => router.push("/sign-in")} />
          </>
        )}
      </View>
    </View>
  );
}

export default RequireAccount;
