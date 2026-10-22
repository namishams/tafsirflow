import { memo, type ReactNode } from "react";
import { Freeze } from "react-freeze";
import { perfBaseline } from "./perf";

// Screens that cannot be seen stop re-rendering (react-freeze, the mechanism of react-native-screens' freezeOnBlur,
// which expo-router's stack does not pass on). A frozen screen stays mounted with all its state and effects: audio
// keeps playing, timers and native animations keep running, subscriptions stay; only its React renders wait until it
// is visible again, when it catches up in one render.
//
// Stack: a screen is frozen once two or more screens lie on top of it. The screen directly below the top one stays
// live, because the back swipe and a sheet-style modal show it. Nothing below a sheet-style modal is frozen while the
// modal is open (the cards behind a sheet peek out at the top).
// Tabs: a tab that is not selected is frozen (the tab bar only ever shows one).

type Nav = { getState: () => { index: number; routes: { key: string; name: string }[] } };
type LayoutProps = { route: { key: string }; navigation: unknown; children: ReactNode };

/** route names of the root stack that open as a sheet (app/_layout.tsx) */
const SHEETS = new Set(["sign-in", "register", "pro"]);

const Frozen = memo(function Frozen({ freeze, children }: { freeze: boolean; children: ReactNode }) {
  return <Freeze freeze={freeze}>{children}</Freeze>;
}, (a, b) => a.freeze && b.freeze); // while frozen, new children are not even looked at

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
