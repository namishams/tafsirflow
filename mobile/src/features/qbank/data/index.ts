import type { RawQ } from "../types";

// The bank files of the examination centre, loaded on first use (require inside the loader). One file per author
// scope; every file exports QS. Written by `node scripts/qbank-validate.mjs --index` (also checks structure,
// verse references with --verse, and prints the counts).
/* eslint-disable @typescript-eslint/no-require-imports */
export const BANK_FILES: (() => { QS: RawQ[] })[] = [
  () => require("./aqidah"),
  () => require("./fiqh-sawm-zakat-hajj"),
  () => require("./fiqh-taharah-salah"),
  () => require("./hadith-books"),
  () => require("./hadith-terms"),
  () => require("./nahw-theory"),
  () => require("./prophets"),
  () => require("./qiraat"),
  () => require("./seerah-mecca"),
  () => require("./seerah-medina"),
  () => require("./tafsir-long"),
  () => require("./tafsir-short"),
  () => require("./tajweed-makharij"),
  () => require("./tajweed-rules"),
  () => require("./ulum-compilation"),
  () => require("./ulum-revelation"),
];
/* eslint-enable @typescript-eslint/no-require-imports */
