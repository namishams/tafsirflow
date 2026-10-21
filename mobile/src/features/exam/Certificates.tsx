import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, PageHero } from "@/components/page";
import { useLang } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { FONT, R, useTheme } from "@/lib/theme";
import { ShareSheet, CARD_SIZE } from "@/features/feed/share";
import { fetchMyCertificates, type MyCertificate } from "./integrity";
import { VerifiedCertCard } from "./ExamUI";
import { useExamT } from "./texts";

// "My certificates": the verifiable certificates kept on the server (code, QR, status). Certificates earned only on
// this device stay where they were (reciter path, tests, language course) and are marked as not verified there.

let cache: { lang: string; list: MyCertificate[] } | null = null;
export function useMyCertificates() {
  const { user } = useAuth();
  const { lang } = useLang();
  const [list, setList] = useState<MyCertificate[] | null>(cache?.lang === lang ? cache.list : null);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    if (!user) { setList([]); return; }
    try { const l = await fetchMyCertificates(lang); cache = { lang, list: l }; setList(l); setError(false); } catch { setError(true); setList((x) => x ?? []); }
  }, [user, lang]);
  useEffect(() => { void load(); }, [load]);
  return { list, error, reload: load, signedIn: !!user };
}

export function MyCertificatesScreen() {
  const t = useTheme();
  const et = useExamT();
  const { list, error, reload, signedIn } = useMyCertificates();
  const [share, setShare] = useState<MyCertificate | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page refreshControl={<RefreshControl refreshing={busy} onRefresh={() => { setBusy(true); void reload().finally(() => setBusy(false)); }} />}>
        <PageHero topInset back arcade={false} eyebrow="شهادات" title={et("myCerts")} lead={et("myCertsLead")} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 18 }}>
          {!signedIn ? (
            <View style={{ gap: 10 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{et("signInForCert")}</Text>
              <OutlineButton title={et("signIn")} icon="user" onPress={() => router.push("/sign-in" as Href)} />
            </View>
          ) : list === null ? <ActivityIndicator color={t.accent} /> : list.length === 0 ? (
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted }}>{error ? et("sendError") : et("noCerts")}</Text>
          ) : list.map((c) => (
            <View key={c.code} style={{ gap: 10 }}>
              <VerifiedCertCard cert={c} />
              {c.note && c.status === "rejected" ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{et("reviewNote", { note: c.note })}</Text> : null}
              {c.status === "valid" ? <OutlineButton title={et("share")} icon="send" onPress={() => setShare(c)} /> : null}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </View>
        <ShareSheet visible={!!share} onClose={() => setShare(null)} noDecoration link={share?.url ?? ""} message={share ? `${share.title} · ${share.code} · ${share.url}` : ""}
          renderCard={(f) => (share ? <View style={{ width: CARD_SIZE[f].w, height: CARD_SIZE[f].h, justifyContent: "center", backgroundColor: "rgb(5,28,21)", padding: 10 }}><VerifiedCertCard cert={share} /></View> : null)} />
      </Page>
    </>
  );
}

/** under an existing (device) certificate: whether a verifiable one exists for the course, else how to get it */
export function VerifiedCertLink({ course }: { course: string }) {
  const t = useTheme();
  const et = useExamT();
  const { list, signedIn } = useMyCertificates();
  const c = list?.find((x) => x.course === course);
  return (
    <Pressable onPress={() => router.push((signedIn ? "/school/certificates" : "/sign-in") as Href)} accessibilityRole="button"
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: R.lg, borderWidth: 1, borderColor: c?.status === "valid" ? t.accent : t.line, backgroundColor: pressed ? t.bg : t.surface })}>
      <Icon name={c ? "shield" : "lock"} size={17} color={c?.status === "valid" ? t.accent : t.gold} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{c ? `${et(`status_${c.status}`)} · ${c.code}` : et("deviceOnly")}</Text>
        {!c ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: t.muted }}>{signedIn ? et("getVerified") : et("signInForCert")}</Text> : null}
      </View>
      <Icon name="chevronRight" size={15} color={t.muted} />
    </Pressable>
  );
}
