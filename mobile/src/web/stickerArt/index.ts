// All sticker art packs. Pure data (paths and gradients), rendered by the app and the website.
import type { StickerArt, StickerPack } from "./kit";
import { EDELSTEINE } from "./edelsteine";
import { KALLIGRAFIE } from "./kalligrafie";
import { PERLEN } from "./perlen";
import { KUNST } from "./kunst";
import { SCHWESTERN } from "./schwestern";
import { GARTEN } from "./garten";
import { RAR } from "./rar";

export type { StickerArt, StickerPack, StickerLayer, StickerGradient, StickerTier } from "./kit";

export const STICKER_PACKS: StickerPack[] = [PERLEN, EDELSTEINE, KALLIGRAFIE, KUNST, SCHWESTERN, GARTEN, RAR];

export const STICKER_ART: Record<string, StickerArt> = Object.fromEntries(STICKER_PACKS.flatMap((p) => p.stickers.map((s) => [s.id, s])));
export const stickerArt = (id: string): StickerArt | undefined => STICKER_ART[id];
