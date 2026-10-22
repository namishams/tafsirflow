import { Link } from "@/i18n/navigation";
import { bioText, loadBioTexts, COUNTRIES_AR, COUNTRIES_DE, type ReciterBio } from "@/lib/reciters";
import { starText } from "@/lib/starText";
import StarClaimWeb from "./StarClaimWeb";

// Unclaimed star profile on the website (/talents/<reserved name>, owner 22.10.2026), the same content as the app's
// StarProfileScreen: name, Arabic name, country, the short biography from the reciters data, the recitations in the
// player and the biography page. A clear label says that the reciter does not run this page (Apple 5.2: no
// impersonation); no posts, messages or follower counts. "Is this you?" opens the claim form.
export default async function StarProfileWeb({ locale, username, reciter }: { locale: string; username: string; reciter: ReciterBio }) {
  const s = starText(locale);
  const bio = bioText(reciter, locale, await loadBioTexts(locale));
  const country = locale === "de" ? COUNTRIES_DE[reciter.country] ?? reciter.country : locale === "ar" ? COUNTRIES_AR[reciter.country] ?? reciter.country : reciter.country;
  const life = reciter.born || reciter.died ? `${reciter.born ?? "?"}${reciter.died ? ` – ${reciter.died}` : ""}` : "";
  return (
    <div>
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto max-w-2xl px-5 pb-12 pt-10 text-center sm:pt-14">
          <span className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-[rgb(8,58,44)] ring-2 ring-[rgb(var(--gold))]/70">
            <span className="font-arabic text-[34px] leading-none text-[rgb(var(--gold))]" dir="rtl" lang="ar">{reciter.arabic.split(" ")[0]}</span>
          </span>
          <h1 className="font-display mt-5 text-3xl leading-tight sm:text-4xl">{reciter.name}</h1>
          <p className="mt-1 text-[15px] text-white/60" dir="ltr">@{username}</p>
          <p className="mt-2 text-[22px] text-[rgb(var(--gold))]" dir="rtl" lang="ar">{reciter.arabic}</p>
          <p className="mx-auto mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13.5px] font-semibold backdrop-blur-md">
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7.5v5.5M12 16.2v.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            {s.label}
          </p>
          <dl className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[14px]">
            <div><dt className="text-white/55">{s.country}</dt><dd className="font-semibold">{country}</dd></div>
            {life ? <div><dt className="text-white/55">&nbsp;</dt><dd className="font-semibold" dir="ltr">{life}</dd></div> : null}
          </dl>
        </div>
      </section>
      <div className="mx-auto grid max-w-2xl gap-5 px-5 py-8">
        <p className="text-[17px] leading-relaxed">{bio.short}</p>
        <div className="flex flex-wrap gap-3">
          {reciter.playerSlug ? (
            <Link href={`/surah/1?reciter=${reciter.playerSlug}`} className="btn-gold inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-bold">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>{s.listen}
            </Link>
          ) : null}
          <Link href={`/reciters/${reciter.slug}`} className="inline-flex h-12 items-center rounded-full border border-line px-6 text-[15px] font-semibold hover:bg-bg">{s.biography}</Link>
        </div>
        <p className="text-[13.5px] leading-relaxed text-muted">{s.labelNote}</p>
        <StarClaimWeb locale={locale} username={username} died={!!reciter.died} />
      </div>
    </div>
  );
}
