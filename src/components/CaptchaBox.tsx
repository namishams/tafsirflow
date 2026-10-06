"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { captchaKeys, renderCheckbox, warmCaptcha } from "@/lib/captchaClient";

// Shown under protected forms: the legal reCAPTCHA notice, and the "I'm not a robot" checkbox when the server asks for it
export default function CaptchaBox({ challenge, onToken }: { challenge: boolean; onToken: (t: string) => void }) {
  const t = useTranslations("trust");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { warmCaptcha(); }, []);
  useEffect(() => { if (challenge && box.current) renderCheckbox(box.current, onToken); }, [challenge]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid gap-2">
      {challenge && <p role="alert" className="text-sm font-semibold">{t("captchaChallenge")}</p>}
      {challenge && <div ref={box} className="min-h-[78px]" />}
      <CaptchaNotice />
    </div>
  );
}

export function CaptchaNotice() {
  const t = useTranslations("trust");
  const [on, setOn] = useState(false);
  useEffect(() => { captchaKeys().then((k) => setOn(!!k.v3)); }, []);
  if (!on) return null; // bot protection switched off (no keys configured)
  return (
    <p className="text-[11px] leading-snug text-muted">
      {t.rich("captchaNotice", {
        privacy: (c) => <a className="underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">{c}</a>,
        terms: (c) => <a className="underline" href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">{c}</a>,
      })}
    </p>
  );
}
