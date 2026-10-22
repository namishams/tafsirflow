"use client";
import { useEffect, useState } from "react";

// Click-to-reveal e-mail address: the page carries a masked label ("i•••@quranmasterclass.com") and the address in a form
// that is not an address (base64, src/lib/protectEmail.ts); the mailto link exists only after a real click or key press.
const LABEL: Record<string, string> = {
  en: "Show e-mail address", de: "E-Mail-Adresse anzeigen", ar: "إظهار عنوان البريد الإلكتروني", tr: "E-posta adresini göster", ur: "ای میل پتہ دکھائیں", fa: "نمایش نشانی ایمیل",
  ps: "د بریښنالیک پته ښکاره کړئ", fr: "Afficher l'adresse e-mail", es: "Mostrar la dirección de correo", id: "Tampilkan alamat e-mail", ms: "Tunjukkan alamat e-mel", bn: "ইমেইল ঠিকানা দেখান", ru: "Показать адрес эл. почты", zh: "显示电子邮件地址",
};

const decode = (d: string): [string, string] => {
  try { const [u, h] = new TextDecoder().decode(Uint8Array.from(atob(d), (c) => c.charCodeAt(0))).split("\u0000"); return [u, h]; } catch { return ["", ""]; }
};

export default function RevealEmail({ d }: { d: string }) {
  const [shown, setShown] = useState(false);
  const [label, setLabel] = useState<string | undefined>(undefined);
  useEffect(() => { setLabel(LABEL[document.documentElement.lang.slice(0, 2)] ?? LABEL.en); }, []);
  const [user, host] = decode(d);
  if (shown) return <a href={`mailto:${user}@${host}`} dir="ltr" className="font-semibold text-accent underline underline-offset-2">{`${user}@${host}`}</a>;
  // the masked label shows the first letter and the domain (the site's own name anyway), not the address
  return (
    <button type="button" dir="ltr" aria-label={label} title={label} onClick={(e) => { if (e.isTrusted) setShown(true); }}
      className="inline font-semibold text-accent underline decoration-dotted underline-offset-2 hover:decoration-solid">
      {`${user.slice(0, 1)}•••@${host}`}
    </button>
  );
}
