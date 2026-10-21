"use client";
// mirrors mobile/src/features/feed/StickerAlbum.tsx (app route /feed-stickers)
// The sticker album of the feed on the website (/garden/album): the big collection that feeds the tree, the progress,
// every collectible sticker of the feed (gamify.ts STICKERS) with the collected ones in colour and their date, the
// others greyed, the rare ones apart. A collected sticker can be shared (the system share sheet or the clipboard, the
// web's stand-in for the app's share card). Texts come from the feed texts (FeedTextsProvider in the page).
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowBack } from "@/components/Icons";
import { useHydrated } from "@/lib/learn/store";
import { intlLocale, useLang } from "@/lib/learn/i18n";
import { STICKERS, STICKER, markStickersSeen, useGamify } from "@/lib/learn/feed/gamify";
import type { LibTopic } from "@/lib/learn/feed/library";
import { CATALOG_SIZE, totalOwned, useCatalog } from "@/lib/learn/garden/catalog";
import { fillG, useGardenText } from "@/lib/learn/garden/texts";
import { useGardenWebText } from "@/lib/learn/garden/web";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import { fill, type FeedTexts } from "@/lib/feedWeb/texts";
import { StickerArt } from "@/components/learn/journey/Seal";
import { shareOrCopy } from "@/components/learn/coursekit/share";
import { Bar, LearnMain, Spinner } from "@/components/learn/ui";

type Game = FeedTexts["game"];
type Feed = FeedTexts["feed"];
// the same names as the app (features/feed/Sticker.tsx stickerName)
const TOPIC_TX: Record<LibTopic, keyof Feed> = { tafsir: "topicTafsir", hadith: "hadith", duas: "topicDuas", prayer: "topicPrayer", holy: "topicHoly", seerah: "topicSeerah", quran: "topicQuran", scholars: "topicScholars", history: "topicHistory", art: "topicArt" };
const FAM: Record<string, keyof Game> = {
  verses: "sVerses", posts: "sPosts", words: "sWords", quiz: "sQuiz", share1: "sShare1", shares: "sShares", shareStreak: "sShareStreak", mashaRecv: "sMashaRecv", encourager: "sEncourager", streak: "sStreak", level: "sLevel", quest1: "sQuest1", quests: "sQuests",
  topic1: "sTopic1", topic2: "sTopic2", names33: "sNames33", names99: "sNames99", holy10: "sHoly10", holyAll: "sHolyAll", ramadan7: "sRamadan7", ramadan29: "sRamadan29",
  tahajjud1: "sTahajjud1", tahajjud10: "sTahajjud10", fajr7: "sFajr7", friday4: "sFriday4", hours10: "sHours10",
  "rare-moon": "rMoon", "rare-lantern": "rLantern", "rare-palm": "rPalm", "rare-star": "rStar", "rare-rose": "rRose", "rare-ink": "rInk", "rare-arch": "rArch", "rare-dove": "rDove",
};
function stickerName(id: string, gt: Game, ft: Feed, nf: (n: number) => string): string {
  const d = STICKER.get(id);
  if (!d) return "";
  const s = (gt[FAM[d.fam]] as string | undefined) ?? "";
  return s.replace("{n}", d.n !== undefined ? nf(d.n) : "").replace("{topic}", d.topic ? String(ft[TOPIC_TX[d.topic]] ?? d.topic) : "");
}

export function Album() {
  const texts = useFeedTexts();
  const gt = texts.game, ft = texts.feed;
  const tx = useGardenText();
  const wt = useGardenWebText();
  const { lang } = useLang();
  const hydrated = useHydrated();
  const gm = useGamify();
  useCatalog();
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  // the new ones are marked once, then counted as seen (as in the app)
  useEffect(() => {
    if (!hydrated) return;
    setFresh(new Set(gm.fresh));
    const id = setTimeout(markStickersSeen, 800);
    return () => clearTimeout(id);
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps
  const loc = intlLocale(lang);
  const nf = (n: number) => new Intl.NumberFormat(loc).format(n);
  // collection days are local day numbers: read as UTC dates, so the day is the same everywhere
  const date = (d: number) => new Intl.DateTimeFormat(loc, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(d * 86400000));
  const owned = (id: string) => (hydrated ? gm.stickers[id] : undefined);
  const have = hydrated ? STICKERS.filter((s) => gm.stickers[s.id]).length : 0;
  const bigOwned = hydrated ? totalOwned() : 0;
  const sel = open ? STICKER.get(open) : undefined;
  const regular = STICKERS.filter((s) => !s.rare);
  const rare = STICKERS.filter((s) => s.rare);
  const share = async (id: string) => {
    setNote(null);
    const res = await shareOrCopy({ title: gt.album, text: `${gt.stickerNew}: ${stickerName(id, gt, ft, nf)}`, url: "https://quranmasterclass.com" });
    if (res === "copied") setNote(ft.copied);
  };
  const tile = (id: string) => {
    const d = STICKER.get(id)!;
    const got = !!owned(id);
    const name = stickerName(id, gt, ft, nf);
    return (
      <li key={id}>
        <button type="button" onClick={() => { setOpen(id); setNote(null); }} aria-pressed={open === id} aria-label={`${name}${got ? "" : `, ${gt.locked}`}`}
          className={`flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 transition hover:bg-accent-soft ${open === id ? "bg-accent-soft" : ""} ${got ? "" : "opacity-55"}`}>
          <span className={got && fresh.has(id) ? "rounded-full ring-2 ring-[rgb(var(--hm-gold))] ring-offset-2 ring-offset-[rgb(var(--bg))]" : undefined}><StickerArt def={d} size={76} locked={!got} /></span>
          <span className="line-clamp-2 text-center text-[12px] font-semibold leading-tight">{name}</span>
        </button>
      </li>
    );
  };
  return (
    <>
      <section className="stage girih relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-6">
          <Link href="/garden/collection" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white"><ArrowBack /> {tx.album}</Link>
          <h1 className="font-display mt-3 text-[36px] leading-tight sm:text-[44px]">{gt.album}</h1>
          <p className="mt-2 text-[16px] text-white/70">{hydrated ? fill(gt.albumProgress, { n: nf(have), m: nf(STICKERS.length) }) : fill(gt.albumProgress, { n: "…", m: nf(STICKERS.length) })}</p>
        </div>
      </section>
      <LearnMain wide>
        <div className="grid gap-4">
          {/* the big collection (every verse, surah, juz, the 99 names …) that feeds the tree */}
          <Link href="/garden/collection" aria-label={`${tx.bigT}: ${fillG(tx.albumLead, { n: nf(bigOwned), m: nf(CATALOG_SIZE) })}`}
            className="stage block rounded-2xl p-5 text-white transition hover:brightness-110">
            <span className="font-display block text-[20px]" style={{ color: "#f3e2b6" }}>{tx.bigT} · {nf(CATALOG_SIZE)}</span>
            <span className="mt-1.5 block text-[14px] leading-relaxed text-white/85">{fillG(tx.bigLead, { n: hydrated ? nf(bigOwned) : "…" })}</span>
            <span className="mt-2 block text-[13px] font-semibold" style={{ color: "rgb(214,180,108)" }}>{wt.collectionOpen}</span>
          </Link>
          <div className="grid gap-2.5 rounded-2xl border border-line bg-surface p-4">
            <h2 className="font-display text-[18px]">{fill(gt.albumProgress, { n: nf(have), m: nf(STICKERS.length) })}</h2>
            <Bar gold value={have / STICKERS.length} label={gt.album} />
          </div>

          {sel ? (
            <div aria-live="polite" className="grid justify-items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center">
              <StickerArt def={sel} size={140} locked={!owned(sel.id)} />
              <p className="font-display text-[18px]">{stickerName(sel.id, gt, ft, nf)}</p>
              <p className="text-[13px] text-muted">{owned(sel.id) ? fill(gt.collectedOn, { d: date(owned(sel.id)!) }) : sel.rare ? gt.rareNote : gt.locked}</p>
              {owned(sel.id) ? (
                <button type="button" onClick={() => share(sel.id)} className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-[15px] font-semibold text-white transition active:scale-[0.97]">{gt.shareSticker}</button>
              ) : null}
              {note ? <p role="status" className="text-[13px] font-semibold text-muted">{note}</p> : null}
            </div>
          ) : null}

          {!hydrated ? <div className="py-10"><Spinner /></div> : (
            <>
              <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 lg:grid-cols-7">{regular.map((s) => tile(s.id))}</ul>
              <div className="grid gap-1">
                <h2 className="font-display text-[17px]">{gt.rare}</h2>
                <p className="text-[13px] text-muted">{gt.rareNote}</p>
              </div>
              <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 lg:grid-cols-7">{rare.map((s) => tile(s.id))}</ul>
            </>
          )}
          <p className="text-center text-[12px] text-muted">{ft.statsLocal}</p>
        </div>
      </LearnMain>
    </>
  );
}
