"use client";
// Encyclopedia items of a course unit (Wikipedia text, free Wikimedia Commons image) with source, license and image
// credit, as the app's ItemCard shows them. Loaded in the browser (the Wikimedia APIs answer CORS with origin=*).
// While loading a spinner shows; when the request fails or nothing comes back, the whole block is left out.
import { useEffect, useState } from "react";
import { pick, useLang } from "@/lib/learn/i18n";
import { extraItemsFor, type ExtraItem, type ExtraKind } from "@/lib/learn/content/extra";
import { Kicker, Spinner } from "@/components/learn/ui";
import { WEB } from "./texts";

export function useExtraItems(kind: ExtraKind, titles: string[]) {
  const { lang } = useLang();
  const [items, setItems] = useState<ExtraItem[] | null>(null);
  const key = titles.join("|");
  useEffect(() => {
    let live = true;
    setItems(null);
    extraItemsFor(kind, key ? key.split("|") : [], lang).then((v) => { if (live) setItems(v); }).catch(() => { if (live) setItems([]); });
    return () => { live = false; };
  }, [kind, key, lang]);
  return items;
}

/** the "Encyclopedia" block: kicker + item cards; renders nothing when the items cannot be loaded */
export function ExtraBlock({ kind, titles, label, loading }: { kind: ExtraKind; titles: string[]; label: string; loading: string }) {
  const items = useExtraItems(kind, titles);
  if (items && items.length === 0) return null;
  return (
    <section className="space-y-3">
      <Kicker>{label}</Kicker>
      {items === null ? <Spinner label={loading} /> : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((it) => <li key={it.id} className="min-w-0"><ExtraItemCard item={it} /></li>)}
        </ul>
      )}
    </section>
  );
}

export function ExtraItemCard({ item }: { item: ExtraItem }) {
  const { lang } = useLang();
  const w = (k: string) => pick(WEB[k], lang);
  const other = item.lang !== lang ? item.lang : undefined;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface">
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element -- remote Commons thumbnail with its own credit line
        <img src={item.image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="aspect-video w-full bg-line/40 object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4" lang={other}>
        <h3 className="text-[16px] font-semibold leading-snug">{item.title}</h3>
        <p className="line-clamp-[8] text-[14px] leading-relaxed text-ink/85">{item.body}</p>
        <div className="mt-auto space-y-1 pt-2 text-[12px] leading-snug text-muted" lang={lang}>
          {item.image && item.imageCredit && (
            <p>
              {`${w("image")}: `}
              {item.imageLicenseUrl
                ? <a href={item.imageLicenseUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.imageCredit}</a>
                : item.imageCredit}
            </p>
          )}
          <p>
            {`${w("source")}: `}
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">{item.source}</a>
            {", "}
            {item.licenseUrl
              ? <a href={item.licenseUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.license}</a>
              : item.license}
          </p>
        </div>
      </div>
    </article>
  );
}
