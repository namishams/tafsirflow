import { readTradition } from "@/lib/tradition";
import { NAHJ_TITLE, nahjAllPassages, nahjEdition, type NahjPassage } from "@/features/hadith/nahj";
import { wasSeen } from "@/features/feed/seen";
import { registerWisdom } from "./registry";
import type { WisdomPayload } from "./types";

// Wisdom posts from the sayings of Nahj al-Balagha, for Shia mode only. They come from the owner's editions bundled
// with the app (features/hadith/nahj.ts, never committed, never sent to or stored on the server), so they are made
// here on the device and join the feed next to the server's wisdom posts.
let pool: { ed: string; list: NahjPassage[] } | null = null;
function sayings(lang: string): NahjPassage[] {
  const ed = nahjEdition(lang);
  if (pool?.ed !== ed) {
    let list: NahjPassage[] = [];
    try { list = nahjAllPassages(ed).filter((p) => p.kind === "saying" && !p.part && p.text.split(/\s+/).length <= 60); } catch { list = []; }
    pool = { ed, list };
  }
  return pool.list;
}

function payload(p: NahjPassage): WisdomPayload {
  return {
    id: `nahj-${p.edition}-${p.id}`, kind: "nahj", theme: "wisdom", themeLabel: p.title, tradition: "shia", lang: p.edition,
    palette: (["night", "emerald", "parchment", "dawn", "marble"] as const)[p.n % 5], text: p.text,
    by: p.edition === "de" ? "Imam ʿAlī" : "Imam ʿAli", work: p.ref,
    source: { label: `${p.ref} · ${p.credit}`, url: p.link || undefined }, review: false,
  };
}

/** up to `n` Nahj wisdom posts not seen in the last days (Shia mode only; [] otherwise) */
export function nahjWisdomIds(lang: string, n: number): string[] {
  if (n <= 0) return [];
  try { if (readTradition() !== "shia") return []; } catch { return []; }
  const list = sayings(lang);
  if (!list.length) return [];
  const out: string[] = [];
  for (let tries = 0; out.length < n && tries < n * 8; tries++) {
    const p = list[Math.floor(Math.random() * list.length)];
    const id = `ws:nahj-${p.edition}-${p.id}`;
    if (out.includes(id) || wasSeen(id)) continue;
    out.push(registerWisdom(payload(p)));
  }
  return out;
}
export { NAHJ_TITLE };
