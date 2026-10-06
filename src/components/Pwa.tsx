"use client";
import { useEffect } from "react";

// Registers the service worker (offline pages and saved surahs) – only in the production build
export default function Pwa() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return null;
}
