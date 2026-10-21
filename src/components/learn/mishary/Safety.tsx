"use client";
// mirrors mobile/src/features/mishary/safety.tsx – safety on the mentoring and season pages (App Store guideline 1.2,
// the same on the website): every member row, every recording and every review someone else wrote can be reported,
// every member can be blocked (the server then leaves them out), and the community guidelines are one click away.
// Same queue as Quran Talents (community_reports, community_blocks). Labels from the Talents profile texts (tpText).
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { tpText, type TpKey } from "@/lib/talentsProfileWeb";
import { IconFlag } from "@/components/Icons";
import { M, REPORT_CATEGORIES, type Member, type ReportCategory } from "@/lib/learn/mishary/api";
import { useMt } from "@/lib/learn/mishary/texts";

type Target = { kind: "member"; username: string } | { kind: "submission"; id: string } | { kind: "review"; id: string; review: string };

function Dialog({ title, onClose, closeLabel, children }: { title: string; onClose: () => void; closeLabel: string; children: ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 grid place-items-end bg-black/45 sm:place-items-center" onClick={onClose}>
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-5 text-ink sm:max-w-md sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center">
          <h2 className="flex-1 truncate text-xl font-extrabold">{title}</h2>
          <button ref={ref} type="button" onClick={onClose} aria-label={closeLabel} className="grid h-11 w-11 place-items-center text-[22px] leading-none text-muted">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ReportDialog({ title, t, onClose, onSend }: { title: string; t: Record<TpKey, string>; onClose: () => void; onSend: (c: ReportCategory, reason: string) => Promise<unknown> }) {
  const [cat, setCat] = useState<ReportCategory | null>(null);
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"" | "busy" | "done" | "error">("");
  const send = async () => {
    if (!cat) return;
    setState("busy");
    try { await onSend(cat, reason.trim()); setState("done"); } catch { setState("error"); }
  };
  return (
    <Dialog title={title} onClose={onClose} closeLabel={t.close}>
      {state === "done" ? (
        <><p role="status" className="text-[15.5px] leading-relaxed">{t.reported}</p><button type="button" onClick={onClose} className="mt-4 h-12 w-full rounded-lg bg-[#c6a65e] font-bold text-[rgb(8,38,29)]">{t.close}</button></>
      ) : (
        <div className="grid gap-3">
          <p className="font-semibold">{t.reportTitle}</p>
          <div role="radiogroup" className="divide-y divide-line overflow-hidden rounded-[10px] border border-line">
            {REPORT_CATEGORIES.map((c) => (
              <label key={c} className="flex min-h-[50px] cursor-pointer items-center gap-3 px-3.5">
                <input type="radio" name="mishary-report" checked={cat === c} onChange={() => setCat(c)} className="h-5 w-5 accent-[#c6a65e]" />
                <span className="text-[15px]">{t[`cat_${c}` as TpKey]}</span>
              </label>
            ))}
          </div>
          <label className="grid gap-1.5 text-[14px] font-semibold">{t.reportDetails}<textarea value={reason} onChange={(e) => setReason(e.target.value.slice(0, 300))} rows={3} className="rounded-lg border border-line bg-bg p-3 font-normal" /></label>
          {state === "error" ? <p role="status" className="text-[14px] text-[rgb(160,58,52)]">{t.e_generic}</p> : null}
          <button type="button" onClick={() => void send()} disabled={!cat || state === "busy"} className="h-12 rounded-lg bg-[#c6a65e] font-bold text-[rgb(8,38,29)] disabled:opacity-55">{t.sendReport}</button>
        </div>
      )}
    </Dialog>
  );
}

export function useMentoringSafety(onBlocked?: () => void) {
  const t = tpText(useLocale());
  const mt = useMt();
  const [menu, setMenu] = useState<Member | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [note, setNote] = useState("");
  const block = async (m: Member) => {
    setMenu(null);
    if (!window.confirm(t.confirmBlock)) return;
    try { await M.block(m.username); setNote(mt("blockedNote", { name: `@${m.username}` })); onBlocked?.(); } catch { setNote(t.e_generic); }
  };
  const title = target?.kind === "submission" ? mt("reportRecording") : target?.kind === "review" ? mt("reportReview") : t.reportProfile;
  const element = (
    <>
      {menu ? (
        <Dialog title={`@${menu.username}`} onClose={() => setMenu(null)} closeLabel={t.close}>
          <div className="grid gap-2">
            <button type="button" onClick={() => { setTarget({ kind: "member", username: menu.username }); setMenu(null); }} className="h-12 rounded-lg border border-line text-left px-4 font-semibold text-[rgb(160,58,52)] hover:bg-bg">{t.reportProfile}</button>
            <button type="button" onClick={() => void block(menu)} className="h-12 rounded-lg border border-line text-left px-4 font-semibold text-[rgb(160,58,52)] hover:bg-bg">{t.block}</button>
            <Link href="/talents" className="flex h-12 items-center px-4 font-semibold text-accent hover:underline">{t.guidelines}</Link>
          </div>
        </Dialog>
      ) : null}
      {target ? (
        <ReportDialog title={title} t={t} onClose={() => setTarget(null)}
          onSend={(c, r) => (target.kind === "member" ? M.reportMember(target.username, c, r) : M.report(target.id, c, r, target.kind === "review" ? target.review : undefined))} />
      ) : null}
    </>
  );
  return {
    memberMenu: (m: Member) => setMenu(m),
    reportSubmission: (id: string) => setTarget({ kind: "submission", id }),
    reportReview: (id: string, review: string) => setTarget({ kind: "review", id, review }),
    note, element,
  };
}

/** the small flag button at the end of a member row: opens report and block */
export function SafetyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-[rgb(var(--hm-gold))]/[0.1] [&>svg]:h-[17px] [&>svg]:w-[17px]">
      <IconFlag />
    </button>
  );
}

/** a quiet text button in the danger colour: report a recording or a review */
export function ReportLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-10 w-fit items-center gap-1.5 text-[13.5px] font-semibold text-[rgb(160,58,52)] hover:underline [&>svg]:h-3.5 [&>svg]:w-3.5">
      <IconFlag />{label}
    </button>
  );
}

/** guidelines line at the end of every mentoring and season page */
export function SafetyFooter() {
  const t = tpText(useLocale());
  return (
    <p className="flex flex-wrap items-center gap-x-3 border-t border-line pt-3 text-[13px] text-muted">
      <span>{t.safetyLine}</span>
      <Link href="/talents" className="min-h-10 py-2.5 font-semibold text-accent hover:underline">{t.guidelines}</Link>
    </p>
  );
}
