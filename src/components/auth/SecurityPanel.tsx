"use client";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { captchaToken } from "@/lib/captchaClient";
import ConfirmCode from "./ConfirmCode";
import { passkeyRegister } from "./passkeyClient";
import { inputCls, postJSON, usePasskeySupport } from "./shared";

// Security and sign-in (website /account/security and the profile's account tab; the app has the same screen):
// ways to sign in, passkeys (add, rename, remove) and the signed-in devices (sign out one or all others).
type Passkey = { id: number; name: string; createdAt: string; lastUsedAt: string | null; synced: boolean };
type Session = { id: string; current: boolean; createdAt: string | null; method: string | null; client: string | null; device: string };
type Data = { email: string; hasPassword: boolean; confirmed: boolean; passkeys: Passkey[]; sessions: Session[] };

const card = "rounded-lg border border-line bg-surface p-5 sm:p-6";
const btn = "inline-flex h-10 items-center rounded-md border border-line px-4 text-sm font-semibold hover:border-ink disabled:opacity-50";

export default function SecurityPanel({ heading = true }: { heading?: boolean }) {
  const t = useTranslations("security");
  const locale = useLocale();
  const supported = usePasskeySupport();
  const [d, setD] = useState<Data | null>(null);
  const [msg, setMsg] = useState<{ k: string; text: string; bad?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [name, setName] = useState("");

  const load = useCallback(() => fetch("/api/account/security", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((x: Data | null) => setD(x)).catch(() => undefined), []);
  useEffect(() => { void load(); }, [load]);
  const flash = (k: string, text: string, bad = false) => setMsg({ k, text, bad });
  const date = (x: string | null) => (x ? new Date(x).toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", day: "numeric", month: "long", year: "numeric" }) : "");

  const add = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await passkeyRegister();
      if (r.ok) { flash("pk", t("added")); setConfirm(false); await load(); return; }
      if (r.error === "reauth") { setConfirm(true); return; }
      if (r.error !== "cancelled") flash("pk", r.error === "exists" ? t("exists") : r.error === "unsupported" ? t("notSupported") : r.error === "limit" ? t("limit") : t("error"), true);
    } catch { flash("pk", t("error"), true); } finally { setBusy(false); }
  };
  const act = async (body: Record<string, unknown>, k: string, ok?: string) => {
    setBusy(true); setMsg(null);
    try {
      const r = await postJSON("/api/account/security", body);
      if (!r.ok) flash(k, t("error"), true);
      else if (ok) flash(k, ok);
      await load();
      return r.ok;
    } finally { setBusy(false); }
  };
  const setPassword = async () => {
    if (!d) return;
    setBusy(true); setMsg(null);
    try {
      const r = await postJSON("/api/auth/forgot", { email: d.email, locale, captcha: await captchaToken("forgot") });
      flash("pw", r.ok ? t("passwordSent") : t("error"), !r.ok);
    } finally { setBusy(false); }
  };

  if (!d) return <div className="h-40 animate-pulse rounded-lg bg-line/40" />;
  const note = (k: string) => (msg?.k === k ? <p role={msg.bad ? "alert" : "status"} className={`mt-3 text-sm ${msg.bad ? "text-red-600" : "text-accent"}`}>{msg.text}</p> : null);
  const others = d.sessions.filter((s) => !s.current).length;

  return (
    <div className="grid gap-6">
      {heading && (
        <div>
          <h2 className="text-lg font-bold">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted">{t("lead")}</p>
        </div>
      )}

      <section className={card}>
        <h3 className="font-bold">{t("methods")}</h3>
        <ul className="mt-3 grid gap-2 text-sm">
          <li className="flex items-center justify-between gap-3"><span>{t("methodCode")}</span><span className="text-accent">{t("on")}</span></li>
          <li className="flex items-center justify-between gap-3"><span>{t("passkeys")}</span><span className={d.passkeys.length ? "text-accent" : "text-muted"}>{d.passkeys.length ? t("count", { n: d.passkeys.length }) : t("off")}</span></li>
          <li className="flex items-center justify-between gap-3"><span>{t("methodPassword")}</span><span className={d.hasPassword ? "text-accent" : "text-muted"}>{d.hasPassword ? t("on") : t("optionalOff")}</span></li>
        </ul>
        {!d.hasPassword && <button onClick={setPassword} disabled={busy} className={`${btn} mt-4`}>{t("setPassword")}</button>}
        {note("pw")}
      </section>

      <section className={card}>
        <h3 className="font-bold">{t("passkeys")}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t("passkeysLead")}</p>
        {d.passkeys.length === 0 ? <p className="mt-4 text-sm text-muted">{t("none")}</p> : (
          <ul className="mt-4 divide-y divide-line rounded-md border border-line">
            {d.passkeys.map((k) => (
              <li key={k.id} className="grid gap-2 p-4 sm:flex sm:items-center sm:justify-between">
                {editing === k.id ? (
                  <form className="flex flex-1 flex-wrap items-center gap-2" onSubmit={async (e) => { e.preventDefault(); if (await act({ action: "passkey-rename", id: k.id, name }, "pk")) setEditing(null); }}>
                    <label className="sr-only" htmlFor={`pk-${k.id}`}>{t("name")}</label>
                    <input id={`pk-${k.id}`} className={`${inputCls} h-10 max-w-xs`} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoFocus />
                    <button className={btn} disabled={busy || !name.trim()}>{t("save")}</button>
                    <button type="button" className={btn} onClick={() => setEditing(null)}>{t("cancel")}</button>
                  </form>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{k.name}</p>
                      <p className="text-xs text-muted">{t("addedOn", { date: date(k.createdAt) })} · {k.lastUsedAt ? t("lastUsed", { date: date(k.lastUsedAt) }) : t("neverUsed")}{k.synced ? ` · ${t("synced")}` : ""}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className={btn} onClick={() => { setEditing(k.id); setName(k.name); }}>{t("rename")}</button>
                      <button className={btn} disabled={busy} onClick={() => { if (confirm_(t("removeConfirm"))) void act({ action: "passkey-delete", id: k.id }, "pk", t("removed")); }}>{t("remove")}</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        {supported ? (
          <button onClick={add} disabled={busy} className="btn-gold mt-4 inline-flex h-11 items-center rounded-lg px-5 text-sm font-bold disabled:opacity-50">{t("add")}</button>
        ) : <p className="mt-4 text-sm text-muted">{t("notSupported")}</p>}
        {confirm && <div className="mt-4"><ConfirmCode email={d.email} onConfirmed={() => { setConfirm(false); void add(); }} /></div>}
        {note("pk")}
      </section>

      <section className={card}>
        <h3 className="font-bold">{t("sessions")}</h3>
        <ul className="mt-4 divide-y divide-line rounded-md border border-line">
          {d.sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold">{s.client ? t(`client_${s.client}`) : t("client_web")}{s.device ? <span className="font-normal text-muted"> · {s.device}</span> : null}</p>
                <p className="text-xs text-muted">{s.createdAt ? t("since", { date: date(s.createdAt) }) : t("earlier")}{s.method ? ` · ${t(`via_${s.method}`)}` : ""}</p>
              </div>
              {s.current ? <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{t("thisDevice")}</span>
                : <button className={btn} disabled={busy} onClick={() => void act({ action: "logout-session", id: s.id }, "sess")}>{t("signOut")}</button>}
            </li>
          ))}
        </ul>
        {others > 0 ? (
          <button onClick={() => void act({ action: "logout-others" }, "sess", t("othersDone"))} disabled={busy} className={`${btn} mt-4`}>{t("signOutOthers")}</button>
        ) : <p className="mt-4 text-sm text-muted">{t("onlyThis")}</p>}
        {note("sess")}
      </section>
    </div>
  );
}

const confirm_ = (text: string) => (typeof window !== "undefined" ? window.confirm(text) : false);
