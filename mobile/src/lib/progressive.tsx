import { Children, useEffect, useState, type ReactNode } from "react";
import { perfBaseline } from "./perf";

// Long scrolling pages (the Shams page has some twenty sections, many with drawings) used to build every section
// before the first frame. Progressive: the first sections render at once (everything on the first screen and a bit
// more), the rest follows a few sections per frame, in order, while the page is already visible and scrollable. When
// all are in, the page is exactly what it was; nothing changes order or look.
const FIRST = 3; // sections in the first frame (the hero and what follows it on a phone)
const STEP = 2; // sections added per frame after that


export function useProgressiveChildren(children: ReactNode, enabled = true, first = FIRST): ReactNode[] {
  const list = Children.toArray(children);
  const total = list.length;
  const on = enabled && !perfBaseline && total > first;
  const [shown, setShown] = useState(on ? first : total);
  useEffect(() => {
    if (!on || shown >= total) return;
    const id = requestAnimationFrame(() => setShown((n) => Math.min(total, n + STEP)));
    return () => cancelAnimationFrame(id);
  }, [on, shown, total]);
  return on && shown < total ? list.slice(0, shown) : list;
}

/** the same for any list of sections inside a screen's own ScrollView: <Progressive>{sections}</Progressive> */
export function Progressive({ children, first }: { children: ReactNode; first?: number }) {
  return <>{useProgressiveChildren(children, true, first)}</>;
}
