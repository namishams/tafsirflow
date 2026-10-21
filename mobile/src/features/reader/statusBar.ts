import { useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";

// The status bar of the Quran screens. The app's default is light text (root layout); a screen on a light background
// (the surah list, the reader, focus mode, search) asks for dark text while it is in front and hands back light text
// when it leaves. The style is applied one tick later, so the screen that comes to the front wins over the one that just
// left (React Navigation runs the old screen's blur after the new screen mounted).
export type BarStyle = "light" | "dark";

/** a screen: its style while focused, the app default (light) when it leaves */
export function useScreenBarStyle(style: BarStyle) {
  useFocusEffect(useCallback(() => {
    const id = setTimeout(() => setStatusBarStyle(style, true), 0);
    return () => { clearTimeout(id); setStatusBarStyle("light", true); };
  }, [style]));
}

/** a full-screen sheet over a screen: its own style while open, the style of the screen below again when it closes */
export function useSheetBarStyle(open: boolean, style: BarStyle, under: BarStyle) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setStatusBarStyle(style, true), 0);
    return () => { clearTimeout(id); setStatusBarStyle(under, true); };
  }, [open, style, under]);
}
