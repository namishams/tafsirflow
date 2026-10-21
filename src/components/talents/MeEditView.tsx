import { Link } from "@/i18n/navigation";
import TalentMe from "./TalentMe";
import SijillMe from "./SijillMe";
import ExtrasEditorWeb from "./ExtrasEditorWeb";
import { sortedCountries } from "@/lib/countries";
import { talentsText } from "@/lib/talentsWeb";

// The own talent profile's edit view (create or edit, photo, age, badges with the YouTube connection, notifications,
// what others see of the Sijill). Until 21.10.2026 this was /talents/me; since /talents/me shows the own profile in
// the TikTok layout (like the app's Account tab) it lives at /talents/me/edit, and /talents/me shows it when the
// member has no profile yet or comes back from the YouTube check (?official=).
export default function MeEditView({ locale, official }: { locale: string; official?: string }) {
  const tx = talentsText(locale);
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold rtl:tracking-normal"><Link href="/talents/me" className="hover:underline">{tx.network}</Link></p>
      <h1 className="font-display mt-2 text-4xl">{tx.meTitle}</h1>
      <p className="mt-2 text-muted">{tx.meLead}</p>
      <TalentMe locale={locale} tx={tx} countries={sortedCountries(locale)} official={official} />
      {/* learning goals, city, travel mode and who sees them (owner, 21.10.2026; like the app) */}
      <ExtrasEditorWeb locale={locale} />
      <div id="sijill" className="scroll-mt-24"><SijillMe locale={locale} /></div>
    </div>
  );
}
