"use client";
import { useState } from "react";

// "Recommend the app": the system share sheet (navigator.share), otherwise the link goes to the clipboard.
export function ShareAppButton({ label, text, copied, url, className = "" }: { label: string; text: string; copied: string; url: string; className?: string }) {
  const [done, setDone] = useState(false);
  const share = async () => {
    try {
      if (typeof navigator.share === "function") { await navigator.share({ text, url }); return; }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setDone(true); setTimeout(() => setDone(false), 2500);
    } catch { /* cancelled or not allowed */ }
  };
  return (
    <button type="button" onClick={() => void share()} className={className}>
      {done ? copied : label}
      <span className="sr-only" role="status" aria-live="polite">{done ? copied : ""}</span>
    </button>
  );
}
