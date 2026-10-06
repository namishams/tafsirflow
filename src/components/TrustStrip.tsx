import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// "Your data is protected · no spam · protected learning space · path to a confident reciter" – every claim is backed
// by something the platform really does (see the measures list and /legal/privacy)
const ICONS = [
  "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z", // shield
  "M4 6h16v12H4zM4 7l8 6 8-6", // mail
  "M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z", // lock
  "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z", // star
];

export default function TrustStrip({ dark = false, details = false }: { dark?: boolean; details?: boolean }) {
  const t = useTranslations("trust");
  const items = [t("data"), t("spam"), t("space"), t("master")];
  const sub = [t("dataD"), t("spamD"), t("spaceD"), t("masterD")];
  return (
    <div>
      <ul className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${dark ? "text-white" : ""}`}>
        {items.map((it, i) => (
          <li key={it} className={`flex gap-3 rounded-md border p-3 ${dark ? "border-white/10 bg-white/[0.03]" : "border-line bg-surface"}`}>
            <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-[rgb(var(--gold))]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden><path d={ICONS[i]} /></svg>
            <span><b className="block text-sm">{it}</b><span className={`text-xs leading-snug ${dark ? "text-white/60" : "text-muted"}`}>{sub[i]}</span></span>
          </li>
        ))}
      </ul>
      {details && (
        <details className={`mt-3 text-sm ${dark ? "text-white/70" : "text-muted"}`}>
          <summary className="cursor-pointer font-semibold">{t("howTitle")}</summary>
          <ul className="mt-2 grid gap-1 ps-5 [list-style:disc]">
            {t("how").split("\n").map((l) => <li key={l}>{l}</li>)}
          </ul>
          <p className="mt-2">{t.rich("howMore", { privacy: (c) => <Link href="/legal/privacy" className="underline">{c}</Link> })}</p>
        </details>
      )}
    </div>
  );
}

// one-line version for forms and badges
export function TrustLine({ className = "" }: { className?: string }) {
  const t = useTranslations("trust");
  return (
    <p className={`inline-flex items-center gap-2 text-xs font-semibold ${className}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden><path d={ICONS[0]} /></svg>
      {t("short")}
    </p>
  );
}
