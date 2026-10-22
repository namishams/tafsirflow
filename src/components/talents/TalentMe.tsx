"use client";
import { ProMark } from "./ProMark";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { BadgeIcon, type WebBadge } from "./BadgeIcon";
import { sijillText, type SwKey } from "@/lib/sijillWeb";
import { momentLine } from "@/lib/sijillMoment";
import { profileText } from "@/lib/profileWeb";
import { starText } from "@/lib/starText";
import { DefaultAvatar } from "./DefaultAvatar";

// /talents/me on the website: the signed-in member's talent profile (create or edit), age confirmation, badges with the
// YouTube connection for the official star, and notifications. Same API as the app.
type Tx = Record<string, string>;
type Me = { username: string; name: string; bio: string; country: string | null; role: string; style: string; ijaza: boolean; public: boolean; rewaya: string; maqam: string; ijazahChain: string; private: boolean; messagePolicy: "connections" | "nobody"; badge: WebBadge | null; avatar?: string | null };
type Badges = { badge: WebBadge | null; emerald: { ok: boolean; email: boolean; phone: boolean | null; age: boolean; profile: boolean; guidelines: boolean }; gold: { ok: boolean; level: number; need: number }; official: { ok: boolean; channel: string | null; minSubscribers: number; available: boolean } };
type Note = { id: string; kind: string; at: string; read: boolean; verseKey: string | null; moment?: { kind: string; data: unknown; title: string | null }; reaction?: string; actor: { username: string; name: string; badge?: WebBadge | null } | null };
const f = (s: string, v: Record<string, string | number>) => Object.entries(v).reduce((a, [k, x]) => a.split(`{${k}}`).join(String(x)), s);

async function call<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  const r = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  return { ok: r.ok, status: r.status, data: (await r.json().catch(() => ({}))) as T & { error?: string } };
}

export default function TalentMe({ locale, tx, countries, official }: { locale: string; tx: Tx; countries: { code: string; name: string }[]; official?: string }) {
  const [state, setState] = useState<"load" | "out" | "age" | "under13" | "ok" | "error">("load");
  const [me, setMe] = useState<Me | null>(null);
  const [form, setForm] = useState<Me>({ username: "", name: "", bio: "", country: null, role: "reciter", style: "", ijaza: false, public: true, rewaya: "", maqam: "", ijazahChain: "", private: false, messagePolicy: "connections", badge: null });
  const [accepted, setAccepted] = useState(false);
  const [guidelines, setGuidelines] = useState(false);
  const [badges, setBadges] = useState<Badges | null>(null);
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [msg, setMsg] = useState("");
  const [saved, setSaved] = useState(false);
  const [year, setYear] = useState("");
  const [yearOk, setYearOk] = useState(false);
  const err = (code?: string) => (code === "username_star" ? starText(locale).reserved : tx[`e_${code}`] ?? tx.error);

  const load = useCallback(async () => {
    const a = await call<{ known: boolean; community: boolean }>("/api/community/age").catch(() => null);
    if (!a) { setState("error"); return; }
    if (a.status === 401) { setState("out"); return; }
    if (!a.data.known) { setState("age"); return; }
    if (!a.data.community) { setState("under13"); return; }
    const m = await call<{ profile: Me | null; talent?: { guidelines?: boolean } }>("/api/community/me");
    if (!m.ok) { setState(m.status === 403 ? "out" : "error"); setMsg(err(m.data.error)); return; }
    setMe(m.data.profile);
    if (m.data.profile) setForm(m.data.profile);
    setAccepted(!!m.data.talent?.guidelines); setGuidelines(!!m.data.talent?.guidelines);
    setState("ok");
    if (m.data.profile) {
      call<Badges>("/api/community/badges").then((b) => b.ok && setBadges(b.data)).catch(() => undefined);
      call<{ notifications: Note[]; unread: number }>(`/api/community/notifications?locale=${locale}`).then((n) => {
        if (n.ok) { setNotes(n.data.notifications); if (n.data.unread) void call("/api/community/notifications", { method: "POST", body: "{}" }); }
      }).catch(() => undefined);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    setMsg(""); setSaved(false);
    const r = await call<{ profile: Me }>("/api/community/me", { method: "PUT", body: JSON.stringify({ ...form, ijazahChain: form.ijazahChain, ...(guidelines ? { guidelines: true } : {}) }) });
    if (!r.ok) { setMsg(err(r.data.error)); return; }
    setSaved(true); setMe(r.data.profile); setAccepted(guidelines || accepted);
    void load();
  };
  const confirmAge = async () => {
    const r = await call("/api/community/age", { method: "POST", body: JSON.stringify({ birthYear: Number(year), confirm: true }) });
    if (!r.ok) { setMsg(err(r.data.error)); return; }
    setMsg(""); void load();
  };
  // profile photo: cropped square and re-encoded as a 512 px JPEG in the browser (drops EXIF/location), then uploaded;
  // the server re-encodes again and bumps avatar_version, so the new URL shows at once
  const px = profileText(locale);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoMsg, setPhotoMsg] = useState("");
  const [photoFailed, setPhotoFailed] = useState(false);
  const uploadPhoto = async (file: File | undefined) => {
    if (!file || !me) return;
    setPhotoMsg("");
    if (file.size > 15 * 1024 * 1024) { setPhotoMsg(px.photoTooBig); return; }
    setPhotoBusy(true);
    try {
      const bmp = await createImageBitmap(file);
      const side = Math.min(bmp.width, bmp.height);
      const c = document.createElement("canvas");
      c.width = 512; c.height = 512;
      c.getContext("2d")!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, 512, 512);
      const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, "image/jpeg", 0.85));
      if (!blob) throw new Error("encode");
      const fd = new FormData();
      fd.append("image", blob, "avatar.jpg");
      const r = await fetch("/api/community/avatar", { method: "POST", body: fd });
      const d = (await r.json().catch(() => ({}))) as { avatar?: string; error?: string };
      if (!r.ok || !d.avatar) { setPhotoMsg(err(d.error)); return; }
      setPhotoFailed(false); setMe({ ...me, avatar: d.avatar });
    } catch { setPhotoMsg(px.error); } finally { setPhotoBusy(false); }
  };
  const removePhoto = async () => {
    if (!me) return;
    setPhotoBusy(true); setPhotoMsg("");
    const r = await call<{ avatar: null }>("/api/community/avatar", { method: "DELETE" }).catch(() => null);
    setPhotoBusy(false);
    if (!r?.ok) { setPhotoMsg(err(r?.data.error)); return; }
    setMe({ ...me, avatar: null });
  };
  // live check of the @username while typing (format, reserved, word filter, taken)
  const [nameState, setNameState] = useState<"" | "checking" | "ok" | "format" | "reserved" | "star" | "taken" | "inappropriate">("");
  useEffect(() => {
    const u = form.username;
    if (!u || u === me?.username) { setNameState(""); return; }
    if (!/^[a-z0-9_.]{3,20}$/.test(u)) { setNameState("format"); return; }
    setNameState("checking");
    let live = true;
    const h = setTimeout(() => {
      call<{ ok: boolean; reason?: "format" | "reserved" | "star" | "taken" | "inappropriate" }>(`/api/community/username?u=${encodeURIComponent(u)}`)
        .then((r) => { if (live) setNameState(r.ok ? (r.data.ok ? "ok" : r.data.reason ?? "taken") : ""); }).catch(() => live && setNameState(""));
    }, 400);
    return () => { live = false; clearTimeout(h); };
  }, [form.username, me?.username]);
  const nameBad = nameState === "format" || nameState === "reserved" || nameState === "star" || nameState === "taken" || nameState === "inappropriate";
  const youtube = async () => {
    const r = await call<{ url: string }>("/api/community/official", { method: "POST", body: JSON.stringify({ target: "web", locale }) });
    if (!r.ok) { setMsg(err(r.data.error)); return; }
    window.location.href = r.data.url;
  };

  const input = "h-12 w-full rounded-md border border-line bg-surface px-3 text-[16px]";
  if (state === "load") return <div className="mt-8 h-60 animate-pulse rounded-lg bg-line/40" />;
  if (state === "out") return <p className="mt-8 text-[16px]">{tx.signInToFollow} <Link href="/account" className="font-semibold text-accent hover:underline">{tx.signIn}</Link></p>;
  if (state === "under13") return <p className="callout mt-8 rounded-lg p-6">{tx.under13}</p>;
  if (state === "error") return <p className="mt-8 text-muted">{msg || tx.error}</p>;
  if (state === "age") return (
    <section className="mt-8 grid max-w-md gap-4 rounded-lg border border-line bg-surface p-6">
      <h2 className="font-display text-2xl">{tx.ageTitle}</h2>
      <p className="text-muted">{tx.ageLead}</p>
      <label className="grid gap-1.5 font-semibold">{tx.birthYear}<input className={input} inputMode="numeric" maxLength={4} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} /></label>
      <label className="flex gap-3"><input type="checkbox" checked={yearOk} onChange={(e) => setYearOk(e.target.checked)} />{tx.ageConfirm}</label>
      {msg ? <p role="alert" className="text-red-700 dark:text-red-400">{msg}</p> : null}
      <button type="button" onClick={confirmAge} disabled={!yearOk || year.length !== 4} className="btn-gold h-12 rounded-md font-bold disabled:opacity-50">{tx.confirm}</button>
    </section>
  );

  const row = (ok: boolean, label: string) => <li className="flex gap-2.5"><span aria-hidden className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[12px] ${ok ? "bg-[rgb(var(--hm-gold))] text-[rgb(8,38,29)]" : "border border-line"}`}>{ok ? "✓" : ""}</span><span>{label}</span><span className="sr-only">{ok ? tx.badgeHave : tx.badgeNotYet}</span></li>;
  return (
    <div className="mt-8 grid gap-10">
      {official ? <p role="status" className={`rounded-md p-4 font-semibold ${official === "ok" ? "bg-accent/10 text-accent" : "bg-red-600/10 text-red-700 dark:text-red-400"}`}>{tx[`official_${official}`] ?? tx.error}</p> : null}
      {me ? <Link href={`/talents/${me.username}`} className="btn-gold inline-flex h-12 w-fit items-center rounded-md px-6 font-bold">{tx.viewProfile}</Link> : <p className="text-[16px]">{tx.noProfile}</p>}

      {me ? (
        <section aria-labelledby="photo" className="flex flex-wrap items-center gap-5 rounded-lg border border-line bg-surface p-6">
          <span className={`grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full ring-2 ${me.badge === "gold" || me.badge === "official" ? "ring-[#E2C77F]" : "ring-[rgb(var(--hm-gold))]/70"}`}>
            {me.avatar && !photoFailed
              ? <img src={me.avatar} alt="" width={96} height={96} className="h-full w-full object-cover" onError={() => setPhotoFailed(true)} /> // eslint-disable-line @next/next/no-img-element
              : <DefaultAvatar />}
          </span>
          <div className="grid flex-1 gap-2">
            <h2 id="photo" className="font-display text-xl">{px.photoTitle}</h2>
            <p className="text-[13.5px] text-muted">{px.photoHint}</p>
            <div className="flex flex-wrap gap-2">
              <label className={`btn-gold inline-flex h-11 cursor-pointer items-center rounded-md px-5 font-bold focus-within:outline focus-within:outline-2 ${photoBusy ? "pointer-events-none opacity-60" : ""}`}>
                {photoBusy ? px.photoSaving : px.photoChoose}
                <input type="file" accept="image/jpeg,image/png" className="sr-only" disabled={photoBusy} onChange={(e) => { void uploadPhoto(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              {me.avatar ? <button type="button" onClick={() => void removePhoto()} disabled={photoBusy} className="inline-flex h-11 items-center rounded-md border border-line px-5 font-semibold text-red-700 disabled:opacity-60 dark:text-red-400">{px.photoRemove}</button> : null}
            </div>
            {photoMsg ? <p role="alert" className="text-[14px] text-red-700 dark:text-red-400">{photoMsg}</p> : null}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-2xl">{tx.edit}</h2>
        <label className="grid gap-1.5 font-semibold">{tx.username}<input className={input} dir="ltr" maxLength={20} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "") })} /><span className="text-[13px] font-normal text-muted">{tx.usernameHint}</span>
          {nameState ? <span role="status" className={`text-[13px] font-semibold ${nameState === "ok" ? "text-accent" : nameState === "checking" ? "text-muted" : "text-red-700 dark:text-red-400"}`}>{nameState === "star" ? starText(locale).reserved : px[nameState === "ok" ? "usernameFree" : nameState === "checking" ? "usernameChecking" : (`username_${nameState}` as const)]}</span> : null}</label>
        <label className="grid gap-1.5 font-semibold">{tx.name}<input className={input} maxLength={40} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="grid gap-1.5 font-semibold">{tx.bio}<textarea className="min-h-24 w-full rounded-md border border-line bg-surface p-3 text-[16px]" maxLength={160} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
        <label className="grid gap-1.5 font-semibold">{tx.country}
          <select className={input} value={form.country ?? ""} onChange={(e) => setForm({ ...form, country: e.target.value || null })}>
            <option value="">{tx.chooseCountry}</option>
            {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 font-semibold">{tx.rewaya}<input className={input} maxLength={60} value={form.rewaya} onChange={(e) => setForm({ ...form, rewaya: e.target.value })} /></label>
          <label className="grid gap-1.5 font-semibold">{tx.maqam}<input className={input} maxLength={40} value={form.maqam} onChange={(e) => setForm({ ...form, maqam: e.target.value })} /></label>
        </div>
        <label className="grid gap-1.5 font-semibold">{tx.ijazahChain}<textarea className="min-h-20 w-full rounded-md border border-line bg-surface p-3 text-[16px]" maxLength={500} value={form.ijazahChain} onChange={(e) => setForm({ ...form, ijazahChain: e.target.value })} /></label>
        <label className="flex gap-3"><input type="checkbox" checked={form.private} onChange={(e) => setForm({ ...form, private: e.target.checked })} />{tx.privateAccount}</label>
        <fieldset className="grid gap-2"><legend className="font-semibold">{tx.whoMessages}</legend>
          {(["connections", "nobody"] as const).map((v) => <label key={v} className="flex gap-3"><input type="radio" name="mp" checked={form.messagePolicy === v} onChange={() => setForm({ ...form, messagePolicy: v })} />{v === "connections" ? tx.msgConnections : tx.msgNobody}</label>)}
        </fieldset>
        {!accepted ? <label className="flex gap-3"><input type="checkbox" checked={guidelines} onChange={(e) => setGuidelines(e.target.checked)} /><span>{tx.acceptGuidelines} <Link href="/talents" className="text-accent hover:underline">{tx.guidelines}</Link> · <Link href="/legal/terms" className="text-accent hover:underline">Terms</Link></span></label> : null}
        {msg ? <p role="alert" className="text-red-700 dark:text-red-400">{msg}</p> : null}
        {saved ? <p role="status" className="font-semibold text-accent">{tx.saved}</p> : null}
        <button type="button" onClick={save} disabled={nameBad || form.username.length < 3 || !form.name.trim() || (!me && !guidelines)} className="btn-gold h-12 w-fit rounded-md px-8 font-bold disabled:opacity-50">{tx.save}</button>
      </section>

      {badges ? (
        <section className="grid gap-4">
          <h2 className="font-display text-2xl">{tx.badgesTitle}</h2>
          {(["emerald", "gold", "official"] as const).map((b) => {
            const ok = b === "emerald" ? badges.emerald.ok : b === "gold" ? badges.gold.ok : badges.official.ok;
            return (
              <div key={b} className={`grid gap-3 rounded-lg border bg-surface p-5 ${ok ? "border-[rgb(var(--hm-gold))]" : "border-line"}`}>
                <div className="flex items-center gap-3"><BadgeIcon badge={b} size={30} /><div><p className="font-bold">{tx[`badge_${b}`]}</p><p className={`text-[13px] ${ok ? "text-accent" : "text-muted"}`}>{ok ? tx.badgeHave : tx.badgeNotYet}</p></div></div>
                <p className="text-[14px] text-muted">{tx[`badge_${b}_text`]}</p>
                {b === "emerald" ? <ul className="grid gap-1.5 text-[14.5px]">{row(badges.emerald.email, tx.reqEmail)}{badges.emerald.phone !== null ? row(badges.emerald.phone, tx.reqPhone) : null}{row(badges.emerald.age, tx.reqAge)}{row(badges.emerald.profile, tx.reqProfile)}{row(badges.emerald.guidelines, tx.reqGuidelines)}</ul> : null}
                {b === "gold" ? <ul className="grid gap-1.5 text-[14.5px]">{row(badges.emerald.ok, tx.reqEmerald)}{row(badges.gold.level >= badges.gold.need, f(tx.reqLevel, { n: badges.gold.need, m: badges.gold.level }))}</ul> : null}
                {/* YouTube only when the server can connect it (no "soon" placeholder, like the app); the star by
                    invitation is described in the badge text above */}
                {b === "official" && !ok && badges.official.available ? (
                  <div className="grid gap-3">
                    <p className="text-[14.5px]">{f(tx.officialHow, { n: new Intl.NumberFormat(locale).format(badges.official.minSubscribers) })}</p>
                    <button type="button" onClick={youtube} className="btn-gold h-11 w-fit rounded-md px-6 font-bold">{tx.connectYoutube}</button>
                  </div>
                ) : null}
                {b === "official" && ok && badges.official.channel ? <p className="text-[14px] text-gold">{f(tx.officialChannel, { c: badges.official.channel })}</p> : null}
              </div>
            );
          })}
        </section>
      ) : null}

      {notes ? (
        <section className="grid gap-3">
          <h2 className="font-display text-2xl">{tx.notifications}</h2>
          {!notes.length ? <p className="text-muted">{tx.noNotifications}</p> : (
            <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
              {notes.map((n) => (
                <li key={n.id} className={`flex items-center gap-2 p-4 ${n.read ? "" : "bg-[rgb(var(--hm-gold))]/10"}`}>
                  <span className="flex-1">{n.kind === "moment_reaction" && n.moment
                    ? (() => { const sx = sijillText(locale); const m = momentLine(n.moment, sx); return n.reaction && n.reaction !== "like" ? f(sx.n_moment_reaction, { u: n.actor?.name ?? "", r: sx[`react_${n.reaction}` as SwKey] ?? n.reaction, m }) : f(sx.n_moment_like, { u: n.actor?.name ?? "", m }); })()
                    : f(tx[`n_${n.kind}`] ?? n.kind, { u: n.actor?.name ?? "", v: n.verseKey ?? "" })}</span>
                  {n.actor?.badge ? <BadgeIcon badge={n.actor.badge} size={14} /> : null}{(n.actor as { pro?: boolean } | null)?.pro ? <ProMark size={13} /> : null}
                  <time className="text-[12.5px] text-muted" dateTime={n.at}>{new Date(n.at).toLocaleDateString(locale)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
