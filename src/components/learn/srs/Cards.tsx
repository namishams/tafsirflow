"use client";
// The card trainer on the website, mirrors mobile/src/features/srs/CardsHome.tsx and DeckScreen.tsx:
//   /cards              the daily review: counts, streak, 7-day forecast, decks, links to the Hifz tracker and the tests
//   /cards/deck/<id>    what a deck holds: three sample cards (front and back), then study
//   /cards/review       one review round (?deck=<id> for a single deck)
// The website has no limits (src/lib/learn/free.ts): every deck is open and there is no daily cap on new cards.
// Own cards (saved verses, liked feed verses, started vocabulary) are added whenever these screens open, like the app.
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useHydrated } from "@/lib/learn/store";
import { today } from "@/lib/learning";
import { DECK_IDS, deckItems, deckSize, type DeckId } from "@/lib/learn/srs/decks";
import { useIntl } from "@/lib/learn/srs/format";
import { useSrsLimits } from "@/lib/learn/srs/gate";
import { buildQueue, deckOpen, forecast, readSrsState, setDecks, streakOf, useSrsState } from "@/lib/learn/srs/store";
import { syncOwnCards } from "@/lib/learn/srs/sync";
import { useSrsT, type SrsKey } from "@/lib/learn/srs/texts";
import { Card, GoldButton, GoldLink, Kicker, LearnHero, LearnMain, SectionTitle, StageStats } from "@/components/learn/ui";
import { StarGlyph } from "@/components/art/HomeOrnaments";
import { useCardFace } from "./CardFace";
import { isDeck } from "./meta";
import { ReviewSession } from "./Review";

export const deckTitleKey = (d: DeckId) => `deck_${d}` as SrsKey;

const Placeholder = () => <div aria-hidden className="grid gap-4">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-line/40" />)}</div>;

// ---------- /cards ----------
export function CardsHome() {
  const st = useSrsT();
  const nf = useIntl();
  const s = useSrsState();
  const lim = useSrsLimits();
  const hydrated = useHydrated();
  useEffect(() => { syncOwnCards(); }, []);
  const day = today();
  const q = useMemo(() => buildQueue(s, lim, day), [s, lim, day]);
  const fc = useMemo(() => forecast(s, 7, day), [s, day]);
  const streak = streakOf(s, day);
  const own = Object.values(s.cards).filter((c) => c.own).length;
  const total = q.due.length + q.fresh.length;
  const max = Math.max(1, ...fc);
  const n = (x: number) => (hydrated ? nf(x) : "–");
  return (
    <>
      <LearnHero word="ذِكْر" title={st("title")} lead={st("lead")} uid="cards"
        aside={<StageStats items={[{ n: n(q.due.length), l: st("due") }, { n: n(q.fresh.length), l: st("newCards") }, { n: n(streak), l: st("streak") }]} />}>
        {hydrated && (total ? <GoldLink href="/cards/review">{st("reviewToday", { n: nf(total) })}</GoldLink>
          : <GoldButton disabled>{st("reviewNone")}</GoldButton>)}
      </LearnHero>
      <LearnMain>
        {!hydrated ? <Placeholder /> : (
          <div className="grid gap-10">
            <Card>
              <h2 className="text-[15px] font-bold">{st("forecast")}</h2>
              <div role="img" aria-label={`${st("forecast")}: ${fc.map(nf).join(", ")}`} className="mt-4 flex h-[110px] items-end gap-2 sm:gap-3">
                {fc.map((x, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-[11px] font-semibold tabular-nums text-muted">{nf(x)}</span>
                    <span className={`block w-full rounded ${i === 0 ? "bg-accent" : "bg-[rgb(var(--hm-gold))]/55"}`} style={{ height: Math.max(3, (x / max) * 70) }} />
                  </div>
                ))}
              </div>
              <div aria-hidden className="mt-1.5 flex">
                {fc.map((_, i) => <span key={i} className="flex-1 text-center text-[11px] text-muted">{i === 0 ? st("today") : `+${nf(i)}`}</span>)}
              </div>
            </Card>

            <section>
              <SectionTitle title={st("decks")} />
              <ul className="hm-card relative mt-5 divide-y divide-line overflow-hidden !p-0">
                <DeckRow id="mine" sub={own ? `${st("cardsCount", { n: nf(own) })} · ${st("mineLead")}` : st("mineLead")} />
                {DECK_IDS.map((d) => {
                  const active = s.decks.includes(d);
                  return (
                    <DeckRow key={d} id={d} sub={st("cardsCount", { n: nf(deckSize(d)) })} active={active}
                      onToggle={() => setDecks(active ? s.decks.filter((x) => x !== d) : [...s.decks, d])} />
                  );
                })}
              </ul>
            </section>

            <div className="grid gap-3 sm:grid-cols-2">
              <LinkTile href="/cards/hifz" title={st("hifz")} sub={st("hifzLead")} />
              <LinkTile href="/tests" title={st("tests")} sub={st("testsLead")} />
            </div>
          </div>
        )}
      </LearnMain>
    </>
  );
}

function DeckRow({ id, sub, active, onToggle }: { id: DeckId; sub: string; active?: boolean; onToggle?: () => void }) {
  const st = useSrsT();
  const title = st(deckTitleKey(id));
  return (
    <li className="flex items-center">
      <Link href={`/cards/deck/${id}`} className="min-w-0 flex-1 px-4 py-3.5 transition hover:bg-[rgb(var(--hm-gold))]/[0.06] sm:px-5">
        <span className="block text-[15.5px] font-semibold leading-snug">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-muted">{sub}</span>
      </Link>
      {onToggle && (
        <button type="button" role="switch" aria-checked={!!active} onClick={onToggle} aria-label={`${title}: ${active ? st("removeDeck") : st("addDeck")}`} title={active ? st("removeDeck") : st("addDeck")}
          className={`me-3 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-lg font-bold transition sm:me-4 ${active ? "border-accent bg-accent-soft text-accent" : "border-line text-accent hover:border-accent"}`}>
          <span aria-hidden>{active ? "✓" : "+"}</span>
        </button>
      )}
    </li>
  );
}

function LinkTile({ href, title, sub }: { href: string; title: string; sub: string }) {
  return (
    <Link href={href} className="hm-card hm-lift relative flex items-center gap-3 p-4 sm:p-5">
      <StarGlyph size={16} className="shrink-0 text-[rgb(var(--hm-gold))]" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] font-bold">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-muted">{sub}</span>
      </span>
      <span aria-hidden className="text-muted rtl:-scale-x-100">›</span>
    </Link>
  );
}

// ---------- /cards/deck/<id> ----------
export function DeckScreen({ id }: { id: DeckId }) {
  const st = useSrsT();
  const nf = useIntl();
  const s = useSrsState();
  const lim = useSrsLimits();
  const hydrated = useHydrated();
  useEffect(() => { syncOwnCards(); }, []);
  const items = useMemo(() => (id === "mine" ? Object.keys(s.cards).filter((k) => s.cards[k].own) : deckItems(id)), [id, s]);
  const q = useMemo(() => buildQueue(s, lim, today(), id), [s, lim, id]);
  const open = deckOpen(id, lim);
  const left = q.due.length + q.fresh.length;
  const samples = hydrated ? items.slice(0, 3) : [];
  return (
    <>
      <LearnHero back={{ href: "/cards", label: st("title") }} title={st(deckTitleKey(id))} uid={`deck-${id}`}
        lead={id === "mine" ? st("mineLead") : st("cardsCount", { n: nf(items.length) })}>
        {hydrated && open && (left ? <GoldLink href={`/cards/review?deck=${id}`}>{st("start")}</GoldLink> : <GoldButton disabled>{st("reviewNone")}</GoldButton>)}
      </LearnHero>
      <LearnMain>
        {!hydrated ? <Placeholder /> : (
          <div className="grid gap-5">
            {samples.length > 0 && <Kicker>{st("preview")}</Kicker>}
            <div className="grid gap-6 md:grid-cols-2">
              {samples.map((c, i) => <Sample key={c} id={c} seed={i} />)}
            </div>
          </div>
        )}
      </LearnMain>
    </>
  );
}

function Sample({ id, seed }: { id: string; seed: number }) {
  const f = useCardFace(id, seed);
  return (
    <div className="grid content-start gap-2.5">
      <div className="stage relative grid min-h-[150px] place-items-center rounded-2xl border border-[rgb(var(--gold))]/40 p-5">{f.front}</div>
      {f.back && <div className="hm-card relative grid place-items-center p-5">{f.back}</div>}
    </div>
  );
}

// ---------- /cards/review ----------
/** the round is fixed when the screen opens (due cards first, a new card after every fourth review) */
export function ReviewScreen({ deck }: { deck?: string }) {
  const st = useSrsT();
  const lim = useSrsLimits();
  const [ids, setIds] = useState<string[] | null>(null);
  const only = isDeck(deck) ? deck : undefined;
  useEffect(() => {
    syncOwnCards();
    const q = buildQueue(readSrsState(), lim, today(), only);
    const out: string[] = [];
    let f = 0;
    q.due.forEach((d, i) => { out.push(d); if (i % 4 === 3 && f < q.fresh.length) out.push(q.fresh[f++]); });
    out.push(...q.fresh.slice(f));
    setIds(out);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const back = only ? { href: `/cards/deck/${only}`, label: st(deckTitleKey(only)) } : { href: "/cards", label: st("backToCards") };
  return (
    <>
      <LearnHero back={back} title={only ? st(deckTitleKey(only)) : st("title")} uid="review" />
      <LearnMain>
        <div className="mx-auto max-w-2xl">{ids ? <ReviewSession ids={ids} backHref={back.href} /> : <Placeholder />}</div>
      </LearnMain>
    </>
  );
}
