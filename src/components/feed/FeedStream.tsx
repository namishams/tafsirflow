"use client";
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconHeart, IconShare } from "@/components/Icons";
import type { WebFeedItem } from "@/lib/feed/resolve";

const LIKES = "qm.feed.likes.v1";
const CTA_EVERY = 6;

function readLikes(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LIKES) ?? "[]") as string[]); } catch { return new Set(); }
}

/** the page a card links to (also the shared link) */
function cardPath(i: WebFeedItem): string {
  if (i.verse) { const [c, v] = i.verse.key.split(":"); return `/surah/${c}?v=${v}`; }
  if (i.kind === "featured-surah" && i.surah) return `/surah/${i.surah}`;
  if (i.kind === "islamic-date") return "/calendar";
  return `/feed#${encodeURIComponent(i.id)}`;
}

function ShareMenu({ item, onClose }: { item: WebFeedItem; onClose: () => void }) {
  const t = useTranslations("feed");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/${locale}${cardPath(item)}`;
  const text = item.verse ? `${item.verse.translation || item.verse.arabic} (${item.verse.key})` : item.title;
  const e = encodeURIComponent;
  const links: [string, string][] = [
    ["WhatsApp", `https://wa.me/?text=${e(`${text}\n${url}`)}`],
    ["X", `https://x.com/intent/post?text=${e(text.slice(0, 200))}&url=${e(url)}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`],
    ["Telegram", `https://t.me/share/url?url=${e(url)}&text=${e(text.slice(0, 300))}`],
  ];
  return (
    <div role="dialog" aria-label={t("share")} className="absolute bottom-12 end-0 z-20 w-56 rounded-xl border border-line bg-surface p-2 shadow-xl">
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button type="button" className="block w-full rounded-lg px-3 py-2 text-start text-sm font-semibold hover:bg-accent-soft"
          onClick={() => { navigator.share({ title: item.title, text, url }).catch(() => {}); onClose(); }}>{t("shareDevice")}</button>
      )}
      <button type="button" className="block w-full rounded-lg px-3 py-2 text-start text-sm font-semibold hover:bg-accent-soft"
        onClick={() => { navigator.clipboard?.writeText(url).then(() => setCopied(true), () => {}); }}>{copied ? t("copied") : t("copy")}</button>
      {links.map(([n, href]) => (
        <a key={n} href={href} target="_blank" rel="noopener noreferrer" onClick={onClose} className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent-soft">{n}</a>
      ))}
    </div>
  );
}

export function FeedCard({ item, liked, onLike }: { item: WebFeedItem; liked: boolean; onLike: () => void }) {
  const t = useTranslations("feed");
  const locale = useLocale();
  const [share, setShare] = useState(false);
  const date = new Date(item.publishedAt).toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", day: "numeric", month: "long" });
  const label = item.kind === "verse-of-day" ? t("kVerse") : item.kind === "hadith-of-day" ? t("kHadith") : item.kind === "islamic-date" ? t("kDate")
    : item.kind === "featured-surah" ? t("kSurah") : item.kind === "announcement" ? t("kNews") : t("kPost");
  const generated = item.kind !== "editorial" && item.kind !== "announcement";
  return (
    <article id={item.id} className="relative scroll-mt-24 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <header className="flex items-center gap-3 px-4 pt-4">
        <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft font-arabic text-accent">ق</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{generated ? label : item.title}</p>
          <p className="text-xs text-muted">{generated ? date : `${label} · ${date}`}</p>
        </div>
      </header>
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt="" loading="lazy" className="mt-3 aspect-square w-full object-cover" />
      )}
      <div className="px-5 py-5">
        {item.verse ? (
          <blockquote>
            <p dir="rtl" lang="ar" className="font-arabic text-[1.7rem] leading-[2.1] text-ink">{item.verse.arabic}</p>
            {item.verse.translation && <p className="mt-4 text-[16px] leading-relaxed text-ink/90">{item.verse.translation}</p>}
            <footer className="mt-3 text-sm font-semibold text-muted">{locale === "ar" ? `سورة ${item.verse.chapterArabic}` : item.verse.chapter} · <span className="tabular-nums" dir="ltr">{item.verse.key}</span></footer>
          </blockquote>
        ) : item.hadith ? (
          <blockquote>
            {item.hadith.arabic && <p dir="rtl" lang="ar" className="line-clamp-[10] font-arabic text-[1.35rem] leading-[2] text-ink">{item.hadith.arabic}</p>}
            {item.hadith.text && <p lang={item.hadith.textLang} dir="auto" className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink/90">{item.hadith.text}</p>}
            <footer className="mt-3 text-sm font-semibold text-muted" dir="ltr">{item.hadith.reference}</footer>
          </blockquote>
        ) : item.kind === "islamic-date" && item.hijri ? (
          <div className="text-center">
            <p className="font-display text-5xl tabular-nums">{item.hijri.d}</p>
            <p className="mt-1 text-xl font-semibold">{item.hijri.monthName} <span className="tabular-nums">{item.hijri.y}</span></p>
            {item.hijri.daysToEvent !== undefined && <p className="mt-3 text-sm text-muted">{t("daysTo", { n: item.hijri.daysToEvent })}</p>}
          </div>
        ) : item.kind === "featured-surah" && item.surah ? (
          <p className="text-[16px]">{t("surahToday", { n: item.surah })}</p>
        ) : (
          <>
            {!generated && item.arabic && <p dir="rtl" lang="ar" className="font-arabic text-2xl leading-loose">{item.arabic}</p>}
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/90">{item.body}</p>
          </>
        )}
      </div>
      <footer className="relative flex items-center gap-1 border-t border-line px-2 py-1.5">
        <button type="button" onClick={onLike} aria-pressed={liked} aria-label={liked ? t("unlike") : t("like")}
          className={`grid h-10 w-10 place-items-center rounded-full transition hover:bg-accent-soft ${liked ? "text-rose-600" : ""}`}><IconHeart filled={liked} /></button>
        <button type="button" onClick={() => setShare((s) => !s)} aria-expanded={share} aria-label={t("share")}
          className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-accent-soft"><IconShare /></button>
        {share && <ShareMenu item={item} onClose={() => setShare(false)} />}
        <span className="flex-1" />
        <Link href={cardPath(item)} className="px-3 text-sm font-semibold text-accent hover:underline">{t("open")}</Link>
        {item.sourceUrl && <a href={item.hadith?.url ?? item.sourceUrl} target="_blank" rel="noopener noreferrer" className="px-3 text-xs text-muted hover:underline">{item.source}</a>}
      </footer>
    </article>
  );
}

/** the cards with local likes; endless = loads the next pages with the API cursor */
export default function FeedStream({ initial, cursor, endless, storeButton }: { initial: WebFeedItem[]; cursor: string | null; endless: boolean; storeButton: ReactNode }) {
  const t = useTranslations("feed");
  const locale = useLocale();
  const [items, setItems] = useState(initial);
  const [next, setNext] = useState(cursor);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const [likes, setLikes] = useState<Set<string>>(() => new Set());
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => { setLikes(readLikes()); }, []);
  const toggle = (id: string) => setLikes((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    try { localStorage.setItem(LIKES, JSON.stringify([...n].slice(-500))); } catch { /* storage blocked */ }
    return n;
  });

  const load = useCallback(async () => {
    if (!next || busy) return;
    setBusy(true); setErr(false);
    try {
      const r = await fetch(`/api/feed/web?locale=${locale}&cursor=${encodeURIComponent(next)}`);
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { items: WebFeedItem[]; nextCursor: string | null };
      setItems((prev) => { const seen = new Set(prev.map((i) => i.id)); return [...prev, ...d.items.filter((i) => !seen.has(i.id))]; });
      setNext(d.nextCursor);
    } catch { setErr(true); } finally { setBusy(false); }
  }, [next, busy, locale]);

  useEffect(() => {
    if (!endless || !sentinel.current || err) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) load(); }, { rootMargin: "800px 0px" });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [endless, load, err]);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      {items.map((i, n) => (
        <Fragment key={i.id}>
          <FeedCard item={i} liked={likes.has(i.id)} onLike={() => toggle(i.id)} />
          {endless && (n + 1) % CTA_EVERY === 0 && (
            <aside className="stage girih relative overflow-hidden rounded-2xl px-6 py-8 text-center text-[#eef0f3]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">{t("ctaKicker")}</p>
              <p className="font-display mt-3 text-2xl">{t("ctaTitle")}</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-white/70">{t("ctaLead")}</p>
              <div className="mt-5 flex justify-center">{storeButton}</div>
            </aside>
          )}
        </Fragment>
      ))}
      {endless && (
        <div ref={sentinel} className="py-6 text-center text-sm text-muted" aria-live="polite">
          {busy ? t("loading") : err ? <button type="button" onClick={load} className="font-semibold text-accent underline">{t("retry")}</button> : !next ? t("end") : null}
        </div>
      )}
    </div>
  );
}
