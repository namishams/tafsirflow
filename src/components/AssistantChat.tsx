"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import Markdown from "./Markdown";

type Msg = { role: "user" | "assistant"; content: string };
const T = {
  de: { ph: "Frag etwas über den Koran oder den Islam …", send: "Senden", hello: "As-salāmu ʿalaykum! Ich beantworte Fragen zum Koran, zum Islam und zur Shams-Methode. Bei persönlichen religiösen Urteilen verweise ich dich an einen Gelehrten.", off: "Der Assistent wird gerade eingerichtet.", err: "Das hat nicht geklappt. Bitte versuch es gleich noch einmal.", limit: "Du hast das Tageslimit erreicht – morgen geht es weiter.", note: "KI-gestützter Assistent: Er kann sich irren und ersetzt keinen Gelehrten. Für Fatwas und persönliche Fragen wende dich an einen qualifizierten Gelehrten.", sugg: ["Was ist die Shams-Methode?", "Wie lerne ich Al-Fatiha am besten?", "Was bedeutet Ayat al-Kursi?", "Wie bereite ich mich auf Ramadan vor?"], thinking: "denkt nach …", clear: "Neues Gespräch" },
  en: { ph: "Ask something about the Quran or Islam …", send: "Send", hello: "As-salāmu ʿalaykum! I answer questions about the Quran, Islam and the Shams Method. For personal religious rulings I will refer you to a scholar.", off: "The assistant is being set up.", err: "That did not work. Please try again in a moment.", limit: "You have reached today's limit – see you tomorrow.", note: "AI-based assistant: it can make mistakes and does not replace a scholar. For fatwas and personal questions, please ask a qualified scholar.", sugg: ["What is the Shams Method?", "How do I best learn Al-Fatiha?", "What does Ayat al-Kursi mean?", "How do I prepare for Ramadan?"], thinking: "thinking …", clear: "New conversation" },
  ar: { ph: "اسأل عن القرآن أو الإسلام …", send: "إرسال", hello: "السلام عليكم! أجيب عن أسئلتك حول القرآن الكريم والإسلام ومنهج شمس، وفي المسائل الشرعية الشخصية أحيلك إلى أهل العلم.", off: "يجري الآن إعداد المساعد.", err: "لم تنجح العملية، حاول بعد قليل.", limit: "بلغت الحد اليومي، نلتقي غدًا بإذن الله.", note: "مساعد يعمل بالذكاء الاصطناعي، قد يخطئ ولا يغني عن العلماء. للفتوى والمسائل الشخصية ارجع إلى عالمٍ مؤهَّل.", sugg: ["ما هو منهج شمس؟", "كيف أحفظ سورة الفاتحة؟", "ما معنى آية الكرسي؟", "كيف أستعد لرمضان؟"], thinking: "يفكّر …", clear: "محادثة جديدة" },
};

export default function AssistantChat() {
  const locale = useLocale();
  const t = T[locale === "de" ? "de" : locale === "ar" ? "ar" : "en"];
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { fetch("/api/assistant").then((r) => r.json()).then((d) => setEnabled(!!d.enabled)).catch(() => setEnabled(false)); }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy]);

  const send = async (q: string) => {
    const content = q.trim();
    if (!content || busy) return;
    const next = [...msgs, { role: "user" as const, content }];
    setMsgs(next); setText(""); setBusy(true); setErr("");
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next, locale }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.answer) setMsgs([...next, { role: "assistant", content: d.answer }]);
      else setErr(r.status === 429 ? t.limit : t.err);
    } catch { setErr(t.err); } finally { setBusy(false); }
  };

  if (enabled === false) return <p className="rounded-lg border border-line bg-surface p-5 text-muted">{t.off}</p>;
  return (
    <div className="flex min-h-[60dvh] flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        <div className="flex gap-3">
          <span className="stage grid h-9 w-9 shrink-0 place-items-center rounded-full font-arabic text-lg text-[rgb(var(--gold))]">ق</span>
          <div className="rounded-2xl rounded-ss-sm bg-bg px-4 py-3 text-[15px] leading-relaxed">{t.hello}</div>
        </div>
        {msgs.length === 0 && (
          <div className="flex flex-wrap gap-2 ps-12">
            {t.sugg.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-[rgb(var(--gold))]">{s}</button>)}
          </div>
        )}
        {msgs.map((m, i) => m.role === "user" ? (
          <div key={i} className="flex justify-end"><div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-se-sm bg-accent px-4 py-3 text-[15px] text-white">{m.content}</div></div>
        ) : (
          <div key={i} className="flex gap-3">
            <span className="stage grid h-9 w-9 shrink-0 place-items-center rounded-full font-arabic text-lg text-[rgb(var(--gold))]">ق</span>
            <div className="min-w-0 max-w-[85%] rounded-2xl rounded-ss-sm bg-bg px-4 py-1 [&>div>p:first-child]:mt-2"><Markdown text={m.content} /></div>
          </div>
        ))}
        {busy && <p className="ps-12 text-sm text-muted">{t.thinking}</p>}
        {err && <p role="alert" className="ps-12 text-sm text-red-600">{err}</p>}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="border-t border-line p-3 sm:p-4">
        <div className="flex gap-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }} maxLength={1200} rows={2} placeholder={t.ph} className="min-w-0 flex-1 resize-none rounded-xl border border-line bg-bg px-3 py-2 text-[15px] outline-none focus:border-[rgb(var(--gold))]" />
          <button disabled={busy || !text.trim()} className="btn-gold h-auto rounded-xl px-5 text-sm font-bold disabled:opacity-40">{t.send}</button>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
          <span>{t.note}</span>
          {msgs.length > 0 && <button type="button" onClick={() => { setMsgs([]); setErr(""); }} className="font-semibold hover:text-ink">{t.clear}</button>}
        </div>
      </form>
    </div>
  );
}
