"use client";
import { useEffect } from "react";

// Arabic-script languages write numbers with their own digits: Arabic ٠١٢٣٤٥٦٧٨٩, Persian, Urdu and Pashto
// ۰۱۲۳۴۵۶۷۸۹ (and Bengali ০১২৩৪৫৬৭৮৯). Instead of formatting every number by hand, the visible text of the page
// gets the digits of its language once React has hydrated, and again whenever React changes it. Form fields, code
// and addresses (e-mail, web) keep their Latin digits. The app does the same in mobile/src/lib/digits.ts.
const TABLES: Record<string, string> = { ar: "٠١٢٣٤٥٦٧٨٩", fa: "۰۱۲۳۴۵۶۷۸۹", ur: "۰۱۲۳۴۵۶۷۸۹", ps: "۰۱۲۳۴۵۶۷۸۹", bn: "০১২৩৪৫৬৭৮৯" };
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "CODE", "PRE", "KBD", "SAMP"]);

function localize(s: string, t: string, arabicSigns: boolean): string {
  if (!/[0-9]/.test(s) || /@|:\/\/|www\./.test(s)) return s;
  const out = s.replace(/[0-9]/g, (d) => t[d.charCodeAt(0) - 48]);
  return arabicSigns ? out.replace(/([٠-٩۰-۹])\.(?=[٠-٩۰-۹])/g, "$1٫").replace(/([٠-٩۰-۹])\s?%|%\s?(?=[٠-٩۰-۹])/g, (_m, d) => (d ? `${d}٪` : "٪")) : out;
}

function skipped(node: Node): boolean {
  for (let el = node.parentElement; el; el = el.parentElement) {
    if (SKIP.has(el.tagName) || el.isContentEditable || el.hasAttribute("data-latin-digits")) return true;
  }
  return false;
}

export default function LocalDigits({ locale }: { locale: string }) {
  useEffect(() => {
    const t = TABLES[locale];
    if (!t) return;
    const arabicSigns = locale !== "bn";
    const fix = (n: Node) => {
      if (n.nodeType !== Node.TEXT_NODE || !n.nodeValue || skipped(n)) return;
      const next = localize(n.nodeValue, t, arabicSigns);
      if (next !== n.nodeValue) n.nodeValue = next;
    };
    const walk = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) return fix(root);
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) fix(n);
    };
    let mo: MutationObserver | null = null;
    // after hydration (an idle moment), so React never sees text it did not render
    const start = () => {
      walk(document.body);
      mo = new MutationObserver((list) => {
        for (const m of list) {
          if (m.type === "characterData") fix(m.target);
          else m.addedNodes.forEach(walk);
        }
      });
      mo.observe(document.body, { subtree: true, childList: true, characterData: true });
    };
    const idle = "requestIdleCallback" in window;
    const id = idle ? window.requestIdleCallback(start, { timeout: 800 }) : window.setTimeout(start, 200);
    return () => {
      mo?.disconnect();
      if (idle) window.cancelIdleCallback(id); else window.clearTimeout(id);
    };
  }, [locale]);
  return null;
}
