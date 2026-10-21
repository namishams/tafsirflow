import { GRADE_TR, type SwKey } from "./sijillWeb";
import { fill } from "./talentsWeb";

// One line describing an achievement moment on the website (shared by the public profile and /talents/me).
type Tx = Record<SwKey, string>;
type M = { kind: string; data: unknown; title: string | null };
export function momentLine(m: M, tx: Tx): string {
  const d = (m.data ?? {}) as Record<string, unknown>;
  const n = Number(d.n ?? 0);
  switch (m.kind) {
    case "certificate": return fill(tx.mo_certificate, { t: m.title ?? String(d.course ?? "") });
    case "exam": return fill(tx.mo_exam, { t: fill(tx[`exam_${String(d.exam)}` as SwKey] ?? String(d.exam), { n: String(d.ref ?? "") }) });
    case "level": return fill(tx.mo_level, { n });
    case "juz": return fill(tx.mo_juz, { n });
    case "tree": return fill(tx.mo_tree, { n });
    case "streak": return fill(tx.mo_streak, { n });
    case "hifz": return fill(tx.mo_hifz, { n, t: GRADE_TR[n - 1] ?? "" });
    case "sticker": return typeof d.series === "string" ? fill(tx.mo_series, { t: d.series }) : tx.mo_sticker;
    case "course": return typeof d.arabic === "string" ? fill(tx.mo_arabic, { t: d.arabic }) : tx.mo_courseAny;
  }
  return "";
}

