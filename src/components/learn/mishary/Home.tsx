"use client";
// mirrors mobile/src/features/mishary/Home.tsx – the Mishary track hub (/mishary): what comes after the Reciter Path,
// forming the next generation of reciters. Six sections: maqam ear, style studies, journal, mentoring, seasons,
// Hall of Fame.
import { useMt, type MtKey } from "@/lib/learn/mishary/texts";
import { useRpT } from "@/lib/learn/reciter-path/texts";
import { Ar, LearnHero, LearnMain, Row, RowList } from "@/components/learn/ui";
import { Muted, NeedsReview } from "./ui";

const ITEMS: { href: string; title: MtKey; lead: MtKey; ar: string }[] = [
  { href: "/mishary/ear", title: "earTitle", lead: "earLead", ar: "مقام" },
  { href: "/mishary/masters", title: "mastersTitle", lead: "mastersLead", ar: "أسلوب" },
  { href: "/mishary/journal", title: "journalTitle", lead: "journalLead", ar: "يومية" },
  { href: "/mishary/mentoring", title: "mentoringTitle", lead: "mentoringLead", ar: "إرشاد" },
  { href: "/mishary/seasons", title: "seasonsTitle", lead: "seasonsLead", ar: "موسم" },
  { href: "/mishary/hall-of-fame", title: "hofTitle", lead: "hofLead", ar: "شرف" },
];

// ——— /mishary ———
export function MisharyHome() {
  const mt = useMt();
  const rt = useRpT();
  return (
    <>
      <LearnHero back={{ href: "/reciter-path", label: rt("title") }} kicker={mt("kicker")} title={mt("title")} lead={mt("lead")} word="جيل القراء" uid="mh" />
      <LearnMain className="grid gap-5">
        <RowList>
          {ITEMS.map((x) => <Row key={x.href} href={x.href} title={mt(x.title)} sub={mt(x.lead)} lead={<Ar size="text-[20px]" className="block w-14 text-center text-[rgb(var(--hm-gold-d))]">{x.ar}</Ar>} />)}
        </RowList>
        <div className="flex flex-wrap items-center gap-2.5"><NeedsReview /><Muted className="text-[13px]">{mt("needsReviewNote")}</Muted></div>
      </LearnMain>
    </>
  );
}
