// The website's learning modules (src/web) announce changes with window events ("tf-points", "tf-listen" …) and
// listen for "pagehide"/"visibilitychange". React Native has a global `window` but no DOM events: this gives them a
// small event bus so the same code runs unchanged. Screens can subscribe with onWebEvent().
type Handler = (e: { type: string; detail?: unknown }) => void;
const bus = new Map<string, Set<Handler>>();

class ShimEvent { type: string; detail?: unknown; constructor(type: string, init?: { detail?: unknown }) { this.type = type; this.detail = init?.detail; } }

const g = globalThis as unknown as Record<string, unknown> & { window?: Record<string, unknown> };
const w = (g.window ??= g) as Record<string, unknown>;
if (typeof w.addEventListener !== "function") {
  w.addEventListener = (type: string, fn: Handler) => { if (!bus.has(type)) bus.set(type, new Set()); bus.get(type)!.add(fn); };
  w.removeEventListener = (type: string, fn: Handler) => { bus.get(type)?.delete(fn); };
  w.dispatchEvent = (e: { type: string; detail?: unknown }) => { bus.get(e.type)?.forEach((fn) => { try { fn(e); } catch { /* a listener must not break the caller */ } }); return true; };
}
if (typeof g.Event !== "function") g.Event = ShimEvent;
if (typeof g.CustomEvent !== "function") g.CustomEvent = ShimEvent;
if (typeof g.document !== "object" || g.document === null) {
  g.document = { visibilityState: "visible", addEventListener: () => undefined, removeEventListener: () => undefined };
}

export function onWebEvent(type: string, fn: Handler): () => void {
  (w.addEventListener as (t: string, f: Handler) => void)(type, fn);
  return () => (w.removeEventListener as (t: string, f: Handler) => void)(type, fn);
}
