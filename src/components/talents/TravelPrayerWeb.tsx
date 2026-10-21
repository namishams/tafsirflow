"use client";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CITIES } from "@/lib/prayer";
import { tpText } from "@/lib/talentsProfileWeb";
import { fill } from "@/lib/talentsWeb";
import { TravelBadgeWeb } from "./TalentProfileWeb";

// Travel mode on the website's prayer page, like the app's TravelPrayerCard (owner, 21.10.2026; 1:1). Signed in with
// travel mode on (Edit profile): the note on praying while travelling by school, travel duas, Umrah and Hajj for
// Makkah or Madinah, and the prayer times for the destination when it is a city of the prayer list.
// SCHOLAR REVIEW: the texts qasrGeneral, qasrHanafi and qasrNote are new religious content (see the app's
// features/talents/TravelCard.tsx); descriptive only, no distances or durations, questions go to scholars.
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[ʿʾ'’`\-\s.]/g, "").toLowerCase();

export default function TravelPrayerWeb({ locale, hanafi, cityId, onCity }: { locale: string; hanafi: boolean; cityId: string; onCity: (id: string) => void }) {
  const t = tpText(locale);
  const [trip, setTrip] = useState<{ on: boolean; city: string } | null>(null);
  useEffect(() => {
    fetch("/api/community/profile-extras", { cache: "no-store" }).then(async (r) => { if (r.ok) setTrip(((await r.json()) as { extras: { travel: { on: boolean; city: string } } }).extras.travel); }).catch(() => undefined);
  }, []);
  if (!trip?.on) return null;
  const f = fold(trip.city);
  const city = f ? CITIES.find((c) => c.id === f || Object.values(c.names ?? {}).some((n) => n && fold(n) === f)) : undefined;
  const haram = city ? city.id === "makkah" || city.id === "madinah" : /^(makkah|makka|mecca|mekka|medina|madinah|medine)/.test(f);
  const pill = "inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgb(201,166,94)] bg-[rgba(201,166,94,0.1)] px-3.5 text-[13.5px] font-semibold hover:opacity-85";
  return (
    <section className="mb-6 grid gap-2.5 rounded-xl border border-[rgb(201,166,94)] bg-surface p-5">
      <div className="flex flex-wrap items-center gap-2"><h2 className="flex-1 text-lg font-bold">{t.qasrTitle}</h2><TravelBadgeWeb city={trip.city} t={t} /></div>
      <p className="text-[15px] leading-relaxed">{hanafi ? t.qasrHanafi : t.qasrGeneral}</p>
      <p className="text-[13px] leading-relaxed text-muted">{t.qasrNote}</p>
      <div className="flex flex-wrap gap-2">
        <Link href="/duas" className={pill}>{t.travelDuas}</Link>
        {haram ? <Link href="/haramain" className={pill}>{t.umrahGuide}</Link> : null}
        {city && city.id !== cityId ? <button type="button" onClick={() => onCity(city.id)} className={pill}>{fill(t.useDestination, { c: trip.city })}</button> : null}
      </div>
    </section>
  );
}
