import { useEffect } from "react";
import { useStored } from "@/lib/store";
import { refreshShop, type Shop } from "@/lib/shop";
import { RareMark } from "./art";

let asked = false;
/** the small mark of a member's pinned rare sticker (by slug), drawn from the store catalogue on the device */
export function RareBadge({ slug, size = 16 }: { slug: string | null | undefined; size?: number }) {
  const shop = useStored<Shop | null>("qmc.shop.v1", null);
  useEffect(() => { if (slug && !shop && !asked) { asked = true; void refreshShop(); } }, [slug, shop]);
  const r = slug ? shop?.rare.find((x) => x.slug === slug) : null;
  return r ? <RareMark svg={r.sticker.svg} size={size} label={r.title.en} /> : null;
}
