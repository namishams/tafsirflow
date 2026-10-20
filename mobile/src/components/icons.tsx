// Generated from the website's src/components/Icons.tsx: the same outline icons, drawn with react-native-svg
import Svg, { Circle, Path, Rect } from "react-native-svg";

export type IconName = "play" | "pause" | "prev" | "next" | "playSm" | "copy" | "share" | "note" | "bookmark" | "volume" | "grid" | "book" | "search" | "menu" | "lock" | "repeat" | "user" | "kid" | "cap" | "shield" | "logout" | "close" | "clock" | "radio" | "hands" | "heart" | "comment" | "eye" | "flag" | "flame" | "starBig" | "trophy" | "speaker" | "moon" | "checkCircle" | "chevronRight" | "chevronLeft" | "chevronDown" | "check" | "plus" | "sun" | "map" | "compass" | "calendar" | "download" | "settings" | "globe" | "mosque" | "list" | "pen" | "speed" | "stop";
const KIND: Record<IconName, "ln" | "sm" | "fill"> = {play: "fill", pause: "fill", prev: "fill", next: "fill", playSm: "sm", copy: "sm", share: "sm", note: "sm", bookmark: "sm", volume: "sm", grid: "ln", book: "ln", search: "ln", menu: "ln", lock: "ln", repeat: "ln", user: "ln", kid: "ln", cap: "ln", shield: "ln", logout: "ln", close: "ln", clock: "ln", radio: "ln", hands: "ln", heart: "sm", comment: "sm", eye: "sm", flag: "sm", flame: "ln", starBig: "fill", trophy: "ln", speaker: "ln", moon: "ln", checkCircle: "ln", chevronRight: "ln", chevronLeft: "ln", chevronDown: "ln", check: "ln", plus: "ln", sun: "ln", map: "ln", compass: "ln", calendar: "ln", download: "ln", settings: "ln", globe: "ln", mosque: "ln", list: "ln", pen: "sm", speed: "ln", stop: "fill"};

function shape(name: IconName) {
  switch (name) {
    case "play": return <><Path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></>;
    case "pause": return <><Rect x="6" y="5" width="4.2" height="14" rx="1.2" /><Rect x="13.8" y="5" width="4.2" height="14" rx="1.2" /></>;
    case "prev": return <><Rect x="5" y="5" width="2.4" height="14" rx="1" /><Path d="M19 6.2v11.6a.8.8 0 0 1-1.25.66L9.4 12.66a.8.8 0 0 1 0-1.32l8.35-5.8A.8.8 0 0 1 19 6.2Z" /></>;
    case "next": return <><Rect x="16.6" y="5" width="2.4" height="14" rx="1" /><Path d="M5 6.2v11.6a.8.8 0 0 0 1.25.66l8.35-5.8a.8.8 0 0 0 0-1.32l-8.35-5.8A.8.8 0 0 0 5 6.2Z" /></>;
    case "playSm": return <><Path d="M8 5.5v13l11-6.5z" /></>;
    case "copy": return <><Rect x="9" y="9" width="11" height="11" rx="2" /><Path d="M5 15V6a2 2 0 0 1 2-2h9" /></>;
    case "share": return <><Path d="M12 15V4M8 8l4-4 4 4" /><Path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></>;
    case "note": return <><Path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /><Path d="M13.5 6.5l4 4" /></>;
    case "bookmark": return <><Path d="M6 4h12v17l-6-4-6 4z" /></>;
    case "volume": return <><Path d="M4 10v4h4l5 4V6L8 10z" /><Path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></>;
    case "grid": return <><Rect x="4" y="4" width="6.5" height="6.5" rx="1.2" /><Rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" /><Rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" /><Rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" /></>;
    case "book": return <><Path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z" /><Path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" /></>;
    case "search": return <><Circle cx="11" cy="11" r="6.5" /><Path d="M16 16l4 4" /></>;
    case "menu": return <><Path d="M4 7h16M4 12h16M4 17h16" /></>;
    case "lock": return <><Rect x="5" y="10.5" width="14" height="9.5" rx="2" /><Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>;
    case "repeat": return <><Path d="M17 3l3 3-3 3" /><Path d="M4 11V9a3 3 0 0 1 3-3h13" /><Path d="M7 21l-3-3 3-3" /><Path d="M20 13v2a3 3 0 0 1-3 3H4" /></>;
    case "user": return <><Circle cx="12" cy="8.5" r="3.8" /><Path d="M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5" /></>;
    case "kid": return <><Circle cx="12" cy="9" r="4" /><Path d="M5 20c1-3.2 3.6-5 7-5s6 1.8 7 5" /><Path d="M9.5 8.5c.6-1.6 4.4-1.6 5 0" /></>;
    case "cap": return <><Path d="M3 9l9-4 9 4-9 4-9-4z" /><Path d="M7 11.5V16c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5v-4.5" /></>;
    case "shield": return <><Path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><Path d="M9 12l2.2 2.2L15.5 10" /></>;
    case "logout": return <><Path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><Path d="M15 8l4 4-4 4M19 12H9" /></>;
    case "close": return <><Path d="M6 6l12 12M18 6L6 18" /></>;
    case "clock": return <><Circle cx="12" cy="12" r="8.5" /><Path d="M12 7.5V12l3 2" /></>;
    case "radio": return <><Rect x="3.5" y="8" width="17" height="11.5" rx="2" /><Path d="M7 8l9.5-4.5" /><Circle cx="9" cy="13.7" r="2.4" /><Path d="M14.5 12.5h3.5M14.5 15h3.5" /></>;
    case "hands": return <><Path d="M12 20c-4.5 0-7.5-2.5-7.5-6 0-2 1-3.5 2.5-4.5L9 8.5C9.8 7 11 6 12 4c1 2 2.2 3 3 4.5l2 1c1.5 1 2.500 2.500 2.500 4.500 0 3.500-3 6-7.500 6z" /><Path d="M12 11v8" /></>;
    case "heart": return <><Path d="M12 20s-7-4.3-7-10a4.2 4.2 0 0 1 7-3 4.2 4.2 0 0 1 7 3c0 5.7-7 10-7 10z" /></>;
    case "comment": return <><Path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" /></>;
    case "eye": return <><Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><Circle cx="12" cy="12" r="2.8" /></>;
    case "flag": return <><Path d="M6 21V4M6 5h11l-2 4 2 4H6" /></>;
    case "flame": return <><Path d="M12 22c4 0 7-2.8 7-7 0-3.5-2.5-6-4-8-.3 2-1 3-2 3.5C13 8 12 5 9 2c0 4-3 6-3 11 0 5 2.7 9 6 9z" /></>;
    case "starBig": return <><Path d="M12 1.5l2.6 4.2 4.8-1.1-1.1 4.8 4.2 2.6-4.2 2.6 1.1 4.8-4.8-1.1L12 22.5l-2.6-4.2-4.8 1.1 1.1-4.8L1.5 12l4.2-2.6-1.1-4.8 4.8 1.1z" /></>;
    case "trophy": return <><Path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" /></>;
    case "speaker": return <><Path d="M4 9v6h4l5 4V5L8 9zM16 8.5a5 5 0 0 1 0 7M19 6a9 9 0 0 1 0 12" /></>;
    case "moon": return <><Path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" /></>;
    case "checkCircle": return <><Circle cx="12" cy="12" r="9" /><Path d="M8 12.5l2.5 2.5L16 9.5" /></>;
    case "chevronRight": return <><Path d="M9 5l7 7-7 7" /></>;
    case "chevronLeft": return <><Path d="M15 5l-7 7 7 7" /></>;
    case "chevronDown": return <><Path d="M5 9l7 7 7-7" /></>;
    case "check": return <><Path d="M5 12.5l4.5 4.5L19 7.5" /></>;
    case "plus": return <><Path d="M12 5v14M5 12h14" /></>;
    case "sun": return <><Circle cx="12" cy="12" r="4" /><Path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></>;
    case "map": return <><Path d="M9 4.5L3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z" /><Path d="M9 4.5v13M15 6.5v13" /></>;
    case "compass": return <><Circle cx="12" cy="12" r="8.5" /><Path d="M15.5 8.5l-2 5-5 2 2-5z" /></>;
    case "calendar": return <><Rect x="4" y="5.5" width="16" height="14.5" rx="2" /><Path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></>;
    case "download": return <><Path d="M12 4v11M7.5 10.5L12 15l4.5-4.5" /><Path d="M5 19.5h14" /></>;
    case "settings": return <><Circle cx="12" cy="12" r="3" /><Path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4L18 18M6 18l1.6-1.6M16.4 7.6L18 6" /></>;
    case "globe": return <><Circle cx="12" cy="12" r="8.5" /><Path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.5 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.5-3.5-8.5s1-5.9 3.5-8.5z" /></>;
    case "mosque": return <><Path d="M4 20.5h16M6 20.5v-7h12v7M8 13.5c0-3 1.8-4.6 4-6 2.2 1.4 4 3 4 6M12 7.5V4.5M10.5 20.5v-3a1.5 1.5 0 0 1 3 0v3" /></>;
    case "list": return <><Path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" /></>;
    case "pen": return <><Path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /></>;
    case "speed": return <><Path d="M4.5 16a8 8 0 1 1 15 0" /><Path d="M12 16l3.5-5" /></>;
    case "stop": return <><Rect x="6.5" y="6.5" width="11" height="11" rx="1.5" /></>;
  }
}

/** outline icon from the website; colour and size like the text around it */
export function Icon({ name, size, color, filled, weight }: { name: IconName; size?: number; color: string; filled?: boolean; weight?: number }) {
  const kind = KIND[name];
  const s = size ?? (kind === "sm" ? 18 : 22);
  const line = kind !== "fill";
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" color={color} fill={line ? (filled ? color : "none") : color} stroke={line ? color : "none"}
      strokeWidth={weight ?? (kind === "sm" ? 1.8 : 1.7)} strokeLinecap="round" strokeLinejoin="round">
      {shape(name)}
    </Svg>
  );
}
