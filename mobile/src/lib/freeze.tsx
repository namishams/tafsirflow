import { createContext, useContext, type ReactNode } from "react";
import { perfBaseline } from "./perf";

// Screens that cannot be seen stop following the store. Every write to the store (progress, points, feed cursor …)
// used to re-render every screen that reads it, including the ones buried in the stack and the tabs in the
// background. Now a hidden screen keeps the store version it had when it was covered; when it is shown again it
// renders once with the current data. Nothing else changes: the screen stays mounted with its state and effects,
// audio keeps playing, timers and native animations keep running.
// (react-freeze, the Suspense mechanism of react-native-screens' freezeOnBlur, was measured first: hiding a large
// screen like /shams cost about 1.3 s of blocked JS the moment it was covered – a net loss.)
//
// Stack: a screen is hidden once two or more screens lie on top of it. The screen directly below the top one stays
// live, because the back swipe and a sheet-style modal show it. Nothing below a sheet-style modal is paused while the
// modal is open (the cards behind a sheet peek out at the top).
// Tabs: a tab that is not selected is hidden (the tab bar only ever shows one).

type Nav = { getState: () => { index: number; routes: { key: string; name: string }[] } };
type LayoutProps = { route: { key: string }; navigation: unknown; children: ReactNode };

/** route names of the root stack that open as a sheet (app/_layout.tsx) */
const SHEETS = new Set(["sign-in", "register", "pro"]);

/** false while the screen this is rendered in cannot be seen (lib/store.ts useStoreVersion reads it) */
export const ScreenVisible = createContext(true);

// nested navigators: a selected tab inside a buried tab bar is hidden too
function Frozen({ freeze, children }: { freeze: boolean; children: ReactNode }) {
  const parent = useContext(ScreenVisible);
  return <ScreenVisible.Provider value={parent && !freeze}>{children}</ScreenVisible.Provider>;
}

export function stackFreezeLayout({ route, navigation, children }: LayoutProps) {
  if (perfBaseline) return <>{children}</>;
  let freeze = false;
  try {
    const state = (navigation as Nav).getState();
    const own = state.routes.findIndex((r) => r.key === route.key);
    if (own >= 0 && state.index - own >= 2) freeze = !state.routes.slice(own + 1, state.index + 1).some((r) => SHEETS.has(r.name));
  } catch { freeze = false; }
  return <Frozen freeze={freeze}>{children}</Frozen>;
}

export function tabFreezeLayout({ route, navigation, children }: LayoutProps) {
  if (perfBaseline) return <>{children}</>;
  let freeze = false;
  // the tab navigator's own selection (isFocused() would also be false for the selected tab while a screen is pushed
  // over the whole tab bar, and that tab is what the back swipe reveals)
  try { const state = (navigation as Nav).getState(); freeze = state.routes[state.index]?.key !== route.key; } catch { freeze = false; }
  return <Frozen freeze={freeze}>{children}</Frozen>;
}
