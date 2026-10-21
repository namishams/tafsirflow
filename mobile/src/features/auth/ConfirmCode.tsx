import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { FONT, R, useTheme } from "@/lib/theme";
import { OutlineButton, TextLink } from "@/components/brand";
import { useLang, useT } from "@/i18n";
import { codeApi } from "./api";
import { CodeInput } from "./CodeInput";
import { useAuthT } from "./text";

// "Confirm that it is you" (app): a code to the account's own address before a sensitive step (add a passkey, delete
// an account without a password) or to confirm the address. onConfirmed runs once the server accepted the code.
export function ConfirmCode({ email, onConfirmed }: { email: string; onConfirmed: () => void }) {
  const theme = useTheme();
  const t = useT();
  const tx = useAuthT();
  const { lang } = useLang();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const send = async () => {
    setBusy(true); setError("");
    try {
      const r = await codeApi.confirmRequest(lang);
      if (r.ok) { setSent(true); setCode(""); setLeft(r.data.resendIn ?? 30); }
      else if (r.data.error === "wait") { setSent(true); setLeft(r.data.retryAfter ?? 30); }
      else setError(r.data.error === "rate" ? tx("errRate") : tx("errGeneric"));
    } catch { setError(t("common.offline")); } finally { setBusy(false); }
  };
  const verify = async (v: string) => {
    setBusy(true); setError("");
    try {
      const r = await codeApi.confirm(v);
      if (r.ok) { onConfirmed(); return; }
      setCode("");
      setError(r.data.error === "code" ? tx("errCode", { n: r.data.left ?? 0 }) : r.data.error === "expired" ? tx("errExpired") : r.data.error === "rate" ? tx("errRate") : tx("errGeneric"));
    } catch { setError(t("common.offline")); } finally { setBusy(false); }
  };

  return (
    <View style={{ gap: 12, borderRadius: R.lg, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.bg, padding: 14 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: theme.ink }}>{tx("confirmTitle")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: theme.muted }}>{tx("confirmLead", { email })}</Text>
      {!sent ? <OutlineButton compact title={tx("confirmSend")} icon="send" disabled={busy} onPress={() => void send()} style={{ alignSelf: "flex-start" }} /> : (
        <>
          <CodeInput value={code} onChange={(v) => { setCode(v); if (error) setError(""); }} onComplete={(v) => void verify(v)} disabled={busy} invalid={!!error} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            {left > 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: theme.muted, paddingVertical: 2 }}>{tx("resendIn", { s: left })}</Text>
              : <TextLink title={tx("resend")} onPress={() => void send()} style={{ fontSize: 14, paddingVertical: 2 }} />}
          </View>
        </>
      )}
      {error ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 13.5, color: theme.danger }}>{error}</Text> : null}
    </View>
  );
}
